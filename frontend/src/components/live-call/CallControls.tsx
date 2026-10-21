import React, { useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Send, AlertTriangle, Square } from 'lucide-react';

interface CallControlsProps {
  status: string;
  isMuted: boolean;
  isAiSpeaking?: boolean;
  micPermission: string;
  errorMessage: string | null;
  onStartCall: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onInterruptAi?: () => void;
  onSendTextMessage: (text: string) => Promise<void>;
}

export const CallControls: React.FC<CallControlsProps> = ({
  status,
  isMuted,
  isAiSpeaking = false,
  micPermission,
  errorMessage,
  onStartCall,
  onEndCall,
  onToggleMute,
  onInterruptAi,
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
    <div className="bg-white rounded-2xl border border-[#E8E2F0] p-6 shadow-sm space-y-4">
      {/* Error Message Alert */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-[#DC2626] text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-[#DC2626]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {!isConnected ? (
            <button
              onClick={onStartCall}
              disabled={isConnecting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#6C3BDB] hover:bg-[#5B2EC4] disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-md shadow-[#6C3BDB]/20 active:scale-95"
            >
              <Phone className="w-4 h-4" />
              <span>{isConnecting ? 'Connecting...' : 'Start Voice Call'}</span>
            </button>
          ) : (
            <button
              onClick={onEndCall}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold rounded-xl text-sm transition shadow-md shadow-rose-600/20 active:scale-95"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          )}

          {/* Purple Circular Microphone Control */}
          {isConnected && (
            <button
              onClick={onToggleMute}
              className={`w-11 h-11 rounded-full transition flex items-center justify-center border shadow-sm ${
                isMuted
                  ? 'bg-amber-50 border-amber-300 text-[#F59E0B]'
                  : 'bg-[#F3EEFF] hover:bg-[#E9DFFF] border-[#E9DFFF] text-[#6C3BDB]'
              }`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff className="w-5 h-5 text-[#F59E0B]" /> : <Mic className="w-5 h-5 text-[#6C3BDB]" />}
            </button>
          )}

          {/* Interrupt AI Speech Button */}
          {isConnected && isAiSpeaking && onInterruptAi && (
            <button
              onClick={onInterruptAi}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-[#F3EEFF] hover:bg-[#E9DFFF] text-[#6C3BDB] border border-[#E9DFFF] rounded-xl text-xs font-bold transition shadow-sm active:scale-95 animate-in fade-in"
              title="Stop AI audio and speak"
            >
              <Square className="w-3 h-3 fill-[#6C3BDB] text-[#6C3BDB]" />
              <span>Interrupt AI</span>
            </button>
          )}
        </div>

        {/* Microphone Permission Indicator */}
        <div className="text-xs text-[#77718A] flex items-center gap-2">
          <span className="font-semibold">Microphone:</span>
          {micPermission === 'granted' ? (
            <span className="text-[#16A34A] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span> Active
            </span>
          ) : micPermission === 'denied' ? (
            <span className="text-[#DC2626] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span> Blocked
            </span>
          ) : (
            <span className="text-[#77718A] font-medium">Ready</span>
          )}
        </div>
      </div>

      {/* Text Message Fallback Input */}
      {isConnected && (
        <form onSubmit={handleSend} className="pt-3 border-t border-[#E8E2F0] flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type customer message or question (e.g. Can we schedule a demo?)..."
            className="flex-1 bg-[#FAF9FF] border border-[#E8E2F0] rounded-xl px-4 py-2.5 text-sm text-[#211A33] placeholder-[#77718A] focus:outline-none focus:border-[#6C3BDB] focus:ring-2 focus:ring-[#6C3BDB]/15 transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="px-4 py-2.5 bg-[#6C3BDB] hover:bg-[#5B2EC4] disabled:opacity-50 text-white rounded-xl text-sm font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      )}
    </div>
  );
};
