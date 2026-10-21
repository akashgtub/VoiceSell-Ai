import React from 'react';
import { Bot, User, Mic, MicOff, Radio, Volume2 } from 'lucide-react';

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
    <div className="bg-white rounded-2xl p-6 text-[#211A33] border border-[#E8E2F0] shadow-sm relative overflow-hidden flex flex-col items-center justify-between min-h-[220px]">
      {/* Background ambient soft lavender glow */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
          isAiSpeaking 
            ? 'opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#E9DFFF] via-transparent to-transparent' 
            : isCustomerSpeaking 
            ? 'opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-100 via-transparent to-transparent'
            : 'opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#F3EEFF] via-transparent to-transparent'
        }`}
      />

      {/* Top Bar: Recording & Live Duration */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {isRecording ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#DC2626] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse"></span>
              <span>REC</span>
            </div>
          ) : (
            <div className="text-xs text-[#77718A] font-medium">Unrecorded Session</div>
          )}
          {isMuted && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[#F59E0B] text-xs font-bold">
              <MicOff className="w-3.5 h-3.5" />
              <span>MUTED</span>
            </div>
          )}
        </div>

        {isConnected && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3EEFF] border border-[#E9DFFF] font-mono text-sm text-[#6C3BDB] font-bold tracking-wider">
            <Radio className="w-3.5 h-3.5 text-[#6C3BDB] animate-pulse" />
            <span>{formatTime(durationSeconds)}</span>
          </div>
        )}
      </div>

      {/* Center Purple Voice Wave Animation */}
      <div className="flex flex-col items-center justify-center my-4 z-10">
        {isConnected ? (
          <div className="flex items-center gap-1.5 h-16">
            <div className={`w-1.5 rounded-full transition-all duration-150 ${isAiSpeaking ? 'bg-[#6C3BDB] animate-voice-bar-1' : isCustomerSpeaking ? 'bg-[#16A34A] animate-voice-bar-3' : 'bg-[#E9DFFF] h-2'}`}></div>
            <div className={`w-1.5 rounded-full transition-all duration-150 ${isAiSpeaking ? 'bg-[#4C1D95] animate-voice-bar-2' : isCustomerSpeaking ? 'bg-[#16A34A] animate-voice-bar-1' : 'bg-[#E9DFFF] h-3'}`}></div>
            <div className={`w-1.5 rounded-full transition-all duration-150 ${isAiSpeaking ? 'bg-[#6C3BDB] animate-voice-bar-3' : isCustomerSpeaking ? 'bg-[#16A34A] animate-voice-bar-4' : 'bg-[#E9DFFF] h-4'}`}></div>
            <div className={`w-1.5 rounded-full transition-all duration-150 ${isAiSpeaking ? 'bg-[#8054EC] animate-voice-bar-4' : isCustomerSpeaking ? 'bg-[#16A34A] animate-voice-bar-2' : 'bg-[#E9DFFF] h-2'}`}></div>
            <div className={`w-1.5 rounded-full transition-all duration-150 ${isAiSpeaking ? 'bg-[#6C3BDB] animate-voice-bar-5' : isCustomerSpeaking ? 'bg-[#16A34A] animate-voice-bar-5' : 'bg-[#E9DFFF] h-3'}`}></div>
            <div className={`w-1.5 rounded-full transition-all duration-150 ${isAiSpeaking ? 'bg-[#4C1D95] animate-voice-bar-2' : isCustomerSpeaking ? 'bg-[#16A34A] animate-voice-bar-1' : 'bg-[#E9DFFF] h-2'}`}></div>
            <div className={`w-1.5 rounded-full transition-all duration-150 ${isAiSpeaking ? 'bg-[#6C3BDB] animate-voice-bar-1' : isCustomerSpeaking ? 'bg-[#16A34A] animate-voice-bar-3' : 'bg-[#E9DFFF] h-4'}`}></div>
          </div>
        ) : (
          <div className="text-center py-3">
            <div className="w-12 h-12 rounded-full bg-[#F3EEFF] text-[#6C3BDB] flex items-center justify-center mx-auto mb-2 border border-[#E9DFFF]">
              <Volume2 className="w-6 h-6 text-[#6C3BDB]" />
            </div>
            <p className="text-xs text-[#77718A] font-medium">Click "Start Voice Call" to begin speaking with VoxSell AI</p>
          </div>
        )}
      </div>

      {/* Bottom Status Tags */}
      <div className="w-full flex items-center justify-between z-10 pt-3 border-t border-[#E8E2F0] text-xs">
        <div className={`flex items-center gap-2 font-bold transition-colors ${isAiSpeaking ? 'text-[#6C3BDB]' : 'text-[#77718A]'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isAiSpeaking ? 'bg-[#F3EEFF] text-[#6C3BDB] border border-[#E9DFFF]' : 'bg-[#FAF9FF] text-[#77718A]'}`}>
            <Bot className="w-3.5 h-3.5" />
          </div>
          <span>{isAiSpeaking ? 'AI Speaking...' : 'VoxSell AI'}</span>
        </div>

        <div className={`flex items-center gap-2 font-bold transition-colors ${isCustomerSpeaking ? 'text-[#16A34A]' : 'text-[#77718A]'}`}>
          <span>{isCustomerSpeaking ? 'Customer Speaking...' : 'Customer Voice'}</span>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isCustomerSpeaking ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200' : 'bg-[#FAF9FF] text-[#77718A]'}`}>
            <User className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
