# DOPAMINE product launch

An editable 30-second product introduction. The user requested product-launch
motion only and will record the actual workflow separately. This is not a
workflow recording or the complete hackathon submission video.

**Brief:** shoppers should remember DOPAMINE as a store with Ava, a voice/avatar
assistant that helps them make clearer choices. The visual relationship is
scattered product options resolving into one personal shopping companion.
The central reveal introduces Ava using an actual prototype still.

**Format:** 1920×1080, 16:9, 30 fps, 30 seconds, opaque H.264 MP4 with stereo AAC audio. The user explicitly requested English
narration and music: a stock synthetic Kokoro voice reads the launch copy over
an original instrumental and scene-transition sound cues. This is launch
narration, not a recorded Ava response. User workflow follows the final
“See it in action” card.

**Visual system:** existing DOPAMINE purple `#7B3DFF`, lime `#D5FF4F`, pink
`#FF6BC7`, cream `#FFF9F5` and charcoal `#1F1F24`; Fredoka display type, DM Sans
supporting type, the original outlined wordmark, rounded photo cards and a smile
underline. Broad moving panels connect scenes; no fabricated clicks or status
changes are shown. English copy follows the submission-material language.

## Timeline

The authoritative boundaries are `scenes` in `index.html`; all transforms are
derived from the explicit timestamp passed to `window.seek(t)`.

| Seconds | Content / movement |
| --- | --- |
| 0–4.4 | Product cards arrive around “Good finds. Less guesswork.”; smile underline |
| 4.4–8.4 | Lime panel reveals the existing white DOPAMINE wordmark on purple |
| 8.4–14.4 | “Meet Ava” beside the actual compact-avatar prototype still |
| 14.4–20.4 | Three product cards, needs/budget/catalog-grounded choice message |
| 20.4–26.4 | Actual storefront still; compare/confirm/continue message |
| 26.4–30 | Brand resolution, Gemini/Cloud Run attribution and demo handoff |

Product photos and logos are existing project assets. Ava/store images are
copied from reviewed prototype captures used for the pitch deck, not generated
evidence. Stills are labelled as product previews; no latency, conversion,
completed voice purchase, Inbox success or real payment claim is made.
The bundled font license files accompany the fonts.

## Preview and render

Serve this folder and open its index page:

```bash
python3 -m http.server 8099 --directory video/dopamine-launch
```

The page provides Play with sound/Pause and a scrubber. Local soundtrack time
drives preview playback; rendering remains explicitly seekable. The render mode `?render=1` hides
controls. Fonts and images are local; there are no external requests or provider
sessions. Stop your preview server after use.

This workspace's explicitly selected motion skill provides the exporter:

```bash
python3 /home/haikaru/.codex/skills/motion/scripts/render_html.py \
  video/dopamine-launch/index.html --out output/video/dopamine-launch-new
```

It requires Python Playwright/Pillow, installed Chromium and FFmpeg/ffprobe.
Use a new output folder. No website or Cloud Run changes are needed to edit or
render this film. Render metadata and representative frames accompany the MP4.

## Soundtrack

Scene boundaries, narration text and music tempo share the embedded `timeline`
JSON in `index.html`. `build_audio.py` generates stock synthetic English narration
with the locally cached Kokoro-82M model (`af_heart`) and an original F-major
instrumental at 150 BPM. No existing song, user voice clone or hosted voice API
is used. Noise is seeded, music ducks under narration, and transition accents
refer to the same scene-cover times as the picture.

Rebuild the stems (Python 3.12 and local model cache required):

```bash
uv run --offline --python 3.12 --with kokoro-onnx==0.6.1 --with soundfile \
  python video/dopamine-launch/build_audio.py
```

A measured two-pass FFmpeg loudness master targets −14 LUFS and −1.2 dBTP.
The current measured output is −14.37 LUFS / −1.20 dBTP, with a 30-second
48 kHz stereo soundtrack. The MP4 contains AAC 192 kb/s audio. Independent music
and narration WAV stems are included in the editable source archive.

Artifacts: `output/video/dopamine-2026-10-19/`. The canonical delivery is
`DOPAMINE_Product_Launch_1080p.mp4`; the earlier render in `master-01/` is the
picture-only intermediate. Regenerate the soundtrack from the scene JSON, master
it using the recorded loudness measurements, and mux with explicit video/audio
stream mapping and duration when editing the film.
