import React, { useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Send, AlertTriangle, ShieldCheck } from 'lucide-react';

interface CallControlsProps {
  status: string;
  isMuted: boolean;
  micPermission: string;
  errorMessage: string | null;
  onStartCall: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onSendTextMessage: (text: string) => Promise<void>;
}

export const CallControls: React.FC<CallControlsProps> = ({
  status,
  isMuted,
  micPermission,
  errorMessage,
  onStartCall,
  onEndCall,
  onToggleMute,
  onSendTextMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting' || status === 'requesting_permission';

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    const text = inputText.trim();
    setInputText('');
    setIsSending(true);
    try {
      await onSendTextMessage(text);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      {/* Error Message Alert */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {!isConnected ? (
            <button
              onClick={onStartCall}
              disabled={isConnecting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <Phone className="w-4 h-4" />
              <span>{isConnecting ? 'Connecting AI...' : 'Start Voice Call'}</span>
            </button>
          ) : (
            <button
              onClick={onEndCall}
              className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-rose-600/20 active:scale-95"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          )}

          {isConnected && (
            <button
              onClick={onToggleMute}
              className={`p-3 rounded-xl border transition flex items-center gap-2 text-sm font-medium ${
                isMuted
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff className="w-4 h-4 text-amber-600" /> : <Mic className="w-4 h-4 text-slate-700" />}
              <span className="hidden sm:inline">{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>
          )}
        </div>

        {/* Permission status badge */}
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span className="font-medium">Microphone:</span>
          {micPermission === 'granted' ? (
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
            </span>
          ) : micPermission === 'denied' ? (
            <span className="text-rose-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Blocked
            </span>
          ) : (
            <span className="text-slate-400">Ready</span>
          )}
        </div>
      </div>

      {/* Text Message Fallback Input */}
      {isConnected && (
        <form onSubmit={handleSend} className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type customer message or inquiry (e.g. How much does it cost? Can we get a demo?)..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      )}
    </div>
  );
};
