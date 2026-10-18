"""Original instrumental + locally synthesized English narration.

Uses the visual timeline embedded in index.html; no external music recording,
voice cloning, hosted inference or account credentials. Kokoro models are local.
Run with Python 3.12, kokoro-onnx==0.6.1 and soundfile (see README).
"""
import json
import math
import os
from pathlib import Path
import re
import subprocess

os.environ.setdefault('OMP_NUM_THREADS', '4')
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro
import onnxruntime as ort

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent
OUT = REPO / 'output/video/dopamine-2026-10-19/audio'
OUT.mkdir(parents=True, exist_ok=True)
data = json.loads(re.search(r'const timeline = (\{.*?\n\});', (ROOT / 'index.html').read_text(), re.S).group(1))
RATE = 48000
DURATION = data['duration']
N = round(RATE * DURATION)
music = np.zeros((N, 2), dtype=np.float64)
voice = np.zeros(N, dtype=np.float64)
rng = np.random.default_rng(20261019)


def add(samples, when, gain=1.0, pan=0):
    start = round(when * RATE)
    values = np.asarray(samples)
    if values.ndim == 1:
        values = np.column_stack((values * math.sqrt((1-pan)/2), values * math.sqrt((1+pan)/2)))
    if start < 0:
        values = values[-start:]
        start = 0
    count = min(len(values), N-start)
    if count > 0:
        music[start:start+count] += values[:count] * gain


def freq(midi):
    return 440 * 2 ** ((midi-69)/12)


def note(midi, duration, kind='keys'):
    t = np.arange(round(duration*RATE)) / RATE
    f = freq(midi)
    if kind == 'bass':
        wave = np.sin(2*np.pi*f*t) + .22*np.sin(4*np.pi*f*t) + .07*np.sin(6*np.pi*f*t)
        envelope = (1-np.exp(-t*230)) * np.exp(-t*9)
    else:
        wave = np.sin(2*np.pi*f*t) + .34*np.sin(4*np.pi*f*t)*np.exp(-t*4) + .10*np.sin(8*np.pi*f*t)*np.exp(-t*8)
        wave += .10*np.sin(2*np.pi*f*1.003*t)
        envelope = (1-np.exp(-t*180)) * np.exp(-t*3)
    envelope *= np.minimum(1, np.maximum(0, (duration-t)/.035))
    return wave * envelope


def noise(duration, low=0, high=24000):
    raw = rng.normal(0, 1, round(duration*RATE))
    spectrum = np.fft.rfft(raw)
    hz = np.fft.rfftfreq(len(raw), 1/RATE)
    spectrum *= (hz >= low) & (hz <= high)
    return np.fft.irfft(spectrum, n=len(raw))


# Fmaj7 → Dm7 → Bbmaj7 → Cadd9; original syncopated electric-key texture.
beat = 60/data['music']['bpm']
chords = [[53, 57, 60, 64], [50, 53, 57, 60], [46, 53, 57, 62], [48, 55, 60, 62]]
for bar in range(math.ceil(DURATION/(beat*4))):
    start = bar*beat*4
    chord = chords[bar % len(chords)]
    for offset in [0, 1.5, 3.0]:
        for k, pitch in enumerate(chord):
            tone = note(pitch+12, .85)
            add(tone, start+offset*beat+k*.009, .065, -.35+k*.23)
            add(tone, start+offset*beat+.17+k*.009, .012, .5-k*.3)
    for offset, pitch in [(0, chord[0]-12), (1.75, chord[0]-12), (2.5, chord[0]), (3.5, chord[0]-12)]:
        add(note(pitch, .36, 'bass'), start+offset*beat, .24)
    for half in range(8):
        t = np.arange(round(.055*RATE))/RATE
        add(noise(.055, 6500, 14500)*np.exp(-t*95), start+half*beat/2, .035 if half % 2 else .025, -.35 if half % 2 else .35)
    for offset in [0, 1, 2, 3]:
        t = np.arange(round(.32*RATE))/RATE
        phase = 2*np.pi*(47*t + 63*(1-np.exp(-t*35))/35)
        kick = np.sin(phase)*np.exp(-t*17)*(1-np.exp(-t*700))
        add(kick, start+offset*beat, .29)
    for offset in [1, 3]:
        t = np.arange(round(.14*RATE))/RATE
        clap = noise(.14, 800, 9000)*np.exp(-t*34)*(1-np.exp(-t*600))
        add(clap, start+offset*beat, .072)

# Signature scene-cover swishes, not simulated product interaction sounds.
for scene in data['scenes'][1:]:
    t = np.arange(round(.45*RATE))/RATE
    swish = noise(.45, 500, 8000) * np.sin(np.pi*np.minimum(1,t/.45))**2
    add(swish, scene['start']-.25, .052, 0)
    add(note(84, .5), scene['start'], .04, .2)

# Local narration: stock synthetic voice, not an impersonation or Ava session.
cache = Path.home()/'.cache/chog-tts'
engine = Kokoro(str(cache/'kokoro-v1.0.onnx'), str(cache/'voices-v1.0.bin'))
options = ort.SessionOptions()
options.intra_op_num_threads = 4
options.inter_op_num_threads = 1
engine.sess = ort.InferenceSession(str(cache/'kokoro-v1.0.onnx'), sess_options=options, providers=['CPUExecutionProvider'])
cues = []
duck = np.ones(N)
for index, scene in enumerate(data['scenes']):
    samples, source_rate = engine.create(scene['narration'], voice=data['voice']['name'], speed=data['voice']['speed'], lang='en-us')
    nonquiet = np.flatnonzero(np.abs(samples) > .003)
    if len(nonquiet):
        samples = samples[max(0, nonquiet[0]-round(.025*source_rate)):min(len(samples), nonquiet[-1]+round(.08*source_rate))]
    source = OUT/f'voice-{index+1:02}.wav'
    sf.write(source, samples, source_rate)
    start = scene['start']+data['voice']['leadSeconds']
    available = scene['end']-data['voice']['tailSeconds']-start
    duration = len(samples)/source_rate
    tempo = max(1, duration/available)
    if tempo > 1.01:
        fitted = OUT/f'voice-{index+1:02}-fit.wav'
        subprocess.run(['ffmpeg','-v','error','-y','-i',str(source),'-af',f'atempo={tempo:.5f}','-ar',str(RATE),str(fitted)],check=True)
        samples, source_rate = sf.read(fitted)
    count = round(len(samples)*RATE/source_rate)
    samples = np.interp(np.arange(count)*source_rate/RATE, np.arange(len(samples)), samples)
    samples *= np.minimum(1, np.arange(count)/max(1,.008*RATE))*np.minimum(1, np.arange(count,0,-1)/max(1,.025*RATE))
    at = round(start*RATE)
    count = min(count, N-at)
    voice[at:at+count] += samples[:count]
    left,right=max(0,at-round(.09*RATE)),min(N,at+count+round(.15*RATE))
    duck[left:right] = np.minimum(duck[left:right], .42)
    cues.append({'scene':scene['id'],'start':start,'duration':count/RATE,'text':scene['narration'],'tempoAdjustment':tempo})
    print('Narration ready:',scene['id'],round(count/RATE,2),flush=True)

# Smooth the sidechain; normalize stems with headroom before the loudness pass.
kernel = np.ones(round(.04*RATE))/round(.04*RATE)
duck = np.convolve(duck, kernel, mode='same')
music /= max(np.max(np.abs(music)), 1e-9)
music *= .26
music *= duck[:,None]
music *= np.minimum(1,np.arange(N)/(.25*RATE))[:,None]
music *= np.minimum(1,np.arange(N,0,-1)/(.55*RATE))[:,None]
active = voice[np.abs(voice)>.008]
voice *= min(.8/max(np.max(np.abs(voice)),1e-9), .14/max(np.sqrt(np.mean(active**2)),1e-9))
sf.write(OUT/'music.wav', music, RATE, subtype='PCM_24')
sf.write(OUT/'narration.wav', voice, RATE, subtype='PCM_24')
mix = music + np.column_stack((voice,voice))*.82
mix *= min(1,.88/max(np.max(np.abs(mix)),1e-9))
sf.write(OUT/'mix-unmastered.wav',mix,RATE,subtype='PCM_24')
(OUT/'cues.json').write_text(json.dumps({'duration':DURATION,'sampleRate':RATE,'music':'Original procedural instrumental; no third-party recording','voice':'Kokoro-82M stock synthetic English voice; af_heart','cues':cues},indent=2)+'\n')
print('Audio stems and cue sheet ready.',flush=True)
