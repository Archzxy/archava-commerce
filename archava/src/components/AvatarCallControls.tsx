import { MessageSquare, Mic, MicOff, PhoneOff } from 'lucide-react';

interface AvatarCallControlsProps {
  microphoneEnabled?: boolean;
  onMicrophone?: () => void;
  chatOpen: boolean;
  onChat: () => void;
  onDisconnect: () => void;
}

export function AvatarCallControls({ microphoneEnabled = false, onMicrophone, chatOpen, onChat, onDisconnect }: AvatarCallControlsProps) {
  return <div className="av-call-actions" aria-label="Kontrol Ava">
    <button type="button" className={microphoneEnabled ? '' : 'is-muted'} disabled={!onMicrophone} aria-pressed={microphoneEnabled} aria-label={microphoneEnabled ? 'Matikan mikrofon' : 'Aktifkan mikrofon'} onClick={onMicrophone}>
      {microphoneEnabled ? <Mic size={20} /> : <MicOff size={20} />}<span>{onMicrophone ? microphoneEnabled ? 'Mik aktif' : 'Mik mati' : 'Mikrofon'}</span>
    </button>
    <button type="button" className={chatOpen ? 'is-active' : ''} aria-label={chatOpen ? 'Tutup chat' : 'Buka chat'} aria-expanded={chatOpen} aria-controls="ava-details" onClick={onChat}><MessageSquare size={20} /><span>Chat</span></button>
    <button type="button" className="av-end" aria-label="Disconnect Ava" onClick={onDisconnect}><PhoneOff size={20} /><span>Disconnect</span></button>
  </div>;
}
