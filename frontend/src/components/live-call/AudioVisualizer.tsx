import React from 'react';
import { Bot, User, Mic, MicOff, Radio } from 'lucide-react';

interface AudioVisualizerProps {
  isAiSpeaking: boolean;
  isCustomerSpeaking: boolean;
  isMuted: boolean;
  status: string;
  durationSeconds: number;
  isRecording: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isAiSpeaking,
  isCustomerSpeaking,
  isMuted,
  status,
  durationSeconds,
  isRecording
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isConnected = status === 'connected';

  return (
    <div className="bg-navy-950 rounded-2xl p-6 text-white border border-navy-800 shadow-xl relative overflow-hidden flex flex-col items-center justify-between min-h-[220px]">
      {/* Background ambient radial glow */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
          isAiSpeaking 
            ? 'opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent-500 via-transparent to-transparent' 
            : isCustomerSpeaking 
            ? 'opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500 via-transparent to-transparent'
            : 'opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-600 via-transparent to-transparent'
        }`}
      />

      {/* Top Bar: Recording & Live Duration */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {isRecording ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>REC</span>
            </div>
          ) : (
            <div className="text-xs text-slate-500">Unrecorded Session</div>
          )}
          {isMuted && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <MicOff className="w-3 h-3" />
              <span>MUTED</span>
            </div>
          )}
        </div>

        {isConnected && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-navy-900 border border-navy-800 font-mono text-sm text-cyan-300 font-bold tracking-wider">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{formatTime(durationSeconds)}</span>
          </div>
        )}
      </div>

      {/* Center Voice Wave Animation */}
      <div className="flex flex-col items-center justify-center my-4 z-10">
        {isConnected ? (
          <div className="flex items-center gap-1.5 h-16">
            <div className={`w-1.5 rounded-full transition-all duration-150 ${isAiSpeaking ? 'bg-accent-400 animate-voice-bar-1' : isCustomerSpeaking ? 'bg-emerald-400 animate-voice-bar-3' : 'bg-slate-700 h-2'}`}></div>
            <div className={`w-1.5 rounded-full transition-all duration-150 ${isAiSpeaking ? 'bg-accent-400 animate-voice-bar-2' : isCustomerSpeaking ? 'bg-emerald-400 animate-voice-bar-1' : 'bg-slate-700 h-3'}`}></div>
            <div className={`w-1.5 rounded-full transition-all duration-150 ${isAiSpeaking ? 'bg-brand-400 animate-voice-bar-3' : isCustomerSpeaking ? 'bg-emerald-400 animate-voice-bar-4' : 'bg-slate-700 h-4'}`}></div>
            <div className={`w-1.5 rounded-full transition-all duration-150 ${isAiSpeaking ? 'bg-brand-400 animate-voice-bar-4' : isCustomerSpeaking ? 'bg-emerald-400 animate-voice-bar-2' : 'bg-slate-700 h-2'}`}></div>
            <div className={`w-1.5 rounded-full transition-all duration-150 ${isAiSpeaking ? 'bg-accent-400 animate-voice-bar-5' : isCustomerSpeaking ? 'bg-emerald-400 animate-voice-bar-5' : 'bg-slate-700 h-3'}`}></div>
            <div className={`w-1.5 rounded-full transition-all duration-150 ${isAiSpeaking ? 'bg-accent-400 animate-voice-bar-2' : isCustomerSpeaking ? 'bg-emerald-400 animate-voice-bar-1' : 'bg-slate-700 h-2'}`}></div>
            <div className={`w-1.5 rounded-full transition-all duration-150 ${isAiSpeaking ? 'bg-brand-400 animate-voice-bar-1' : isCustomerSpeaking ? 'bg-emerald-400 animate-voice-bar-3' : 'bg-slate-700 h-4'}`}></div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-navy-800 text-slate-400 flex items-center justify-center mx-auto mb-2">
              <Mic className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-400 font-medium">Click "Start Live Call" to begin speaking with VoxSell AI</p>
          </div>
        )}
      </div>

      {/* Bottom Status Tags */}
      <div className="w-full flex items-center justify-between z-10 pt-2 border-t border-navy-800/80 text-xs">
        <div className={`flex items-center gap-2 font-medium transition-colors ${isAiSpeaking ? 'text-accent-400' : 'text-slate-500'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isAiSpeaking ? 'bg-accent-500/20 text-accent-400' : 'bg-navy-900 text-slate-500'}`}>
            <Bot className="w-3.5 h-3.5" />
          </div>
          <span>{isAiSpeaking ? 'AI Speaking...' : 'VoxSell AI'}</span>
        </div>

        <div className={`flex items-center gap-2 font-medium transition-colors ${isCustomerSpeaking ? 'text-emerald-400' : 'text-slate-500'}`}>
          <span>{isCustomerSpeaking ? 'Customer Speaking...' : 'Customer Voice'}</span>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isCustomerSpeaking ? 'bg-emerald-500/20 text-emerald-400' : 'bg-navy-900 text-slate-500'}`}>
            <User className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
