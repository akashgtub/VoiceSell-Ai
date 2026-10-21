import React, { useEffect, useRef } from 'react';
import { Message } from '../../types';
import { Bot, User, Sparkles } from 'lucide-react';

interface LiveTranscriptProps {
  messages: Message[];
  isAiSpeaking: boolean;
  status: string;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({ messages, isAiSpeaking, status }) => {
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[480px]">
      {/* Transcript Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-500"></div>
          <h3 className="font-bold text-slate-800 text-sm">Live Call Transcript</h3>
        </div>
        <div className="text-xs text-slate-500">
          {messages.length} {messages.length === 1 ? 'turn' : 'turns'} recorded
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">Conversation Transcript will appear here</p>
            <p className="text-xs max-w-sm text-slate-400">
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
                      ? 'bg-gradient-to-tr from-brand-600 to-accent-600 text-white'
                      : 'bg-slate-800 text-white'
                  }`}
                >
                  {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[75%] ${isAi ? 'text-left' : 'text-right'}`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs font-semibold text-slate-700">
                      {isAi ? 'VoxSell AI Sales Agent' : 'Customer'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatTime(m.timestamp)}
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      isAi
                        ? 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-tl-sm'
                        : 'bg-brand-600 text-white rounded-tr-sm'
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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-accent-500 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-accent-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-accent-500 animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
