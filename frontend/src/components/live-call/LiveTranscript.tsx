import React, { useEffect, useRef } from 'react';
import type { Message } from '../../types';
import { Bot, User, Sparkles } from 'lucide-react';

interface LiveTranscriptProps {
  messages: Message[];
  isAiSpeaking: boolean;
  status?: string;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({ messages, isAiSpeaking }) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiSpeaking]);

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E8E2F0] shadow-sm flex flex-col h-[480px]">
      {/* Transcript Header */}
      <div className="px-6 py-4 border-b border-[#E8E2F0] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#6C3BDB]"></div>
          <h3 className="font-bold text-[#211A33] text-sm">Live Call Transcript</h3>
        </div>
        <div className="text-xs text-[#77718A] font-semibold">
          {messages.length} {messages.length === 1 ? 'turn' : 'turns'} recorded
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#77718A]">
            <div className="w-12 h-12 rounded-full bg-[#F3EEFF] text-[#6C3BDB] flex items-center justify-center mb-3 border border-[#E9DFFF]">
              <Sparkles className="w-6 h-6 text-[#6C3BDB]" />
            </div>
            <p className="text-sm font-bold text-[#211A33] mb-1">Conversation Transcript will appear here</p>
            <p className="text-xs max-w-sm text-[#77718A]">
              Speak into your microphone or use the message input below to ask discovery questions, explore features, or discuss pricing.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isAi = m.speaker === 'ai';
            return (
              <div
                key={m.id}
                className={`flex gap-3.5 ${isAi ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                    isAi
                      ? 'bg-[#6C3BDB] text-white'
                      : 'bg-[#211A33] text-white'
                  }`}
                >
                  {isAi ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[78%] ${isAi ? 'text-left' : 'text-right'}`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs font-bold text-[#211A33]">
                      {isAi ? 'VoxSell AI Sales Agent' : 'Customer'}
                    </span>
                    <span className="text-[10px] text-[#77718A] font-mono">
                      {formatTime(m.timestamp)}
                    </span>
                  </div>

                  {/* Light lavender for AI bubbles, white with subtle purple border for customer */}
                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      isAi
                        ? 'bg-[#F3EEFF] border border-[#E9DFFF] text-[#211A33] rounded-tl-sm'
                        : 'bg-white border border-[#6C3BDB]/40 text-[#211A33] rounded-tr-sm'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* AI Typing / Generating Indicator */}
        {isAiSpeaking && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#6C3BDB] text-white flex items-center justify-center shadow-sm">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-[#F3EEFF] border border-[#E9DFFF] px-4 py-2.5 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#6C3BDB] animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-[#6C3BDB] animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-[#6C3BDB] animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
