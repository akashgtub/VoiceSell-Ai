import React, { useState, useEffect } from 'react';
import type { UseVoiceCallReturn } from '../hooks/useVoiceCall';
import { AudioVisualizer } from '../components/live-call/AudioVisualizer';
import { LiveTranscript } from '../components/live-call/LiveTranscript';
import { CallControls } from '../components/live-call/CallControls';
import { ConsentModal } from '../components/common/ConsentModal';
import type { ProductConfig } from '../types';
import { api } from '../api/client';
import { Sparkles, Layers, Calendar, ChevronRight, CheckCircle2 } from 'lucide-react';

interface LiveCallPageProps {
  voiceCall: UseVoiceCallReturn;
  onViewCallDetails: (callId: string) => void;
}

export const LiveCallPage: React.FC<LiveCallPageProps> = ({ voiceCall, onViewCallDetails }) => {
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [productConfig, setProductConfig] = useState<ProductConfig | null>(null);
  const [lastEndedCallId, setLastEndedCallId] = useState<string | null>(null);

  useEffect(() => {
    api.getProductConfig().then(setProductConfig).catch(console.error);
  }, []);

  const handleStartCallClick = () => {
    setIsConsentModalOpen(true);
  };

  const handleConsentConfirm = async (consent: boolean) => {
    setIsConsentModalOpen(false);
    await voiceCall.startCall(consent);
  };

  const handleEndCallClick = async () => {
    const endedCall = await voiceCall.endCall();
    if (endedCall) {
      setLastEndedCallId(endedCall.id);
    }
  };

  let pricingTiers: any[] = [];
  try {
    if (productConfig?.pricing_information) {
      pricingTiers = JSON.parse(productConfig.pricing_information);
    }
  } catch (e) {}

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Call Completed Success Banner */}
      {voiceCall.status === 'ended' && lastEndedCallId && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#16A34A] text-white flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-[#211A33] text-sm">Call Completed & Transcribed</h4>
              <p className="text-xs text-[#16A34A] mt-0.5 font-medium">
                AI executive summary generated, sales status classified, and audio recording persisted.
              </p>
            </div>
          </div>
          <button
            onClick={() => onViewCallDetails(lastEndedCallId)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#16A34A] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <span>Review Call Insights</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Visualizer & Transcript vs Product Quick Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Audio Wave Visualizer, Controls & Transcript */}
        <div className="lg:col-span-2 space-y-6">
          <AudioVisualizer
            isAiSpeaking={voiceCall.isAiSpeaking}
            isCustomerSpeaking={voiceCall.isCustomerSpeaking}
            isMuted={voiceCall.isMuted}
            status={voiceCall.status}
            durationSeconds={voiceCall.durationSeconds}
            isRecording={voiceCall.isRecording}
          />

          <CallControls
            status={voiceCall.status}
            isMuted={voiceCall.isMuted}
            isAiSpeaking={voiceCall.isAiSpeaking}
            micPermission={voiceCall.micPermission}
            errorMessage={voiceCall.errorMessage}
            onStartCall={handleStartCallClick}
            onEndCall={handleEndCallClick}
            onToggleMute={voiceCall.toggleMute}
            onInterruptAi={voiceCall.stopAiSpeech}
            onSendTextMessage={voiceCall.sendTextMessage}
          />

          <LiveTranscript
            messages={voiceCall.messages}
            isAiSpeaking={voiceCall.isAiSpeaking}
            status={voiceCall.status}
          />
        </div>

        {/* Right Col: Active Product Knowledge & Sales Strategy Assistant */}
        <div className="space-y-6">
          {/* Active Product Card */}
          <div className="bg-white rounded-2xl border border-[#E8E2F0] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-[#6C3BDB]">
              <Layers className="w-5 h-5 text-[#6C3BDB]" />
              <h3 className="font-bold text-[#211A33] text-base">Verified Knowledge Base</h3>
            </div>
            <p className="text-xs text-[#77718A]">
              VoxSell AI strictly references these verified product parameters when speaking with prospects.
            </p>

            {productConfig ? (
              <div className="space-y-3 pt-2 border-t border-[#E8E2F0] text-xs">
                <div>
                  <span className="font-bold text-[#77718A] uppercase tracking-wider text-[10px]">Product</span>
                  <div className="font-bold text-[#211A33] text-sm mt-0.5">{productConfig.product_name}</div>
                  <div className="text-[#77718A] text-xs mt-0.5">{productConfig.tagline}</div>
                </div>

                <div>
                  <span className="font-bold text-[#77718A] uppercase tracking-wider text-[10px]">Target Audience</span>
                  <p className="text-[#77718A] mt-0.5 leading-relaxed font-medium">{productConfig.target_audience}</p>
                </div>

                <div>
                  <span className="font-bold text-[#77718A] uppercase tracking-wider text-[10px]">Pricing Tiers</span>
                  <div className="space-y-1.5 mt-1">
                    {pricingTiers.map((tier, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-[#FAF9FF] border border-[#E8E2F0] flex items-center justify-between">
                        <span className="font-bold text-[#211A33]">{tier.tier}</span>
                        <span className="text-[#6C3BDB] font-bold">{tier.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-[#F3EEFF] border border-[#E9DFFF] rounded-xl text-[#4C1D95]">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <Calendar className="w-3.5 h-3.5 text-[#6C3BDB]" />
                    <span>Demo Offer Rule</span>
                  </div>
                  <p className="text-[11px] text-[#4C1D95] leading-relaxed font-medium">
                    AI will automatically propose a 20-min tailored demo when buying signals or interest are identified.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#77718A]">Loading knowledge base...</div>
            )}
          </div>

          {/* Objection Handling Cheat Sheet */}
          <div className="bg-white rounded-2xl border border-[#E8E2F0] p-6 shadow-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 text-[#6C3BDB] font-bold text-sm">
              <Sparkles className="w-4 h-4 text-[#6C3BDB]" />
              <span>AI Sales Playbook</span>
            </div>
            <div className="space-y-2 text-[#77718A]">
              <div className="p-3 rounded-xl bg-[#FAF9FF] border border-[#E8E2F0]">
                <span className="font-bold text-[#211A33] block mb-0.5">Price / Budget Concern</span>
                <span className="font-medium">Highlights 38% shorter sales cycles and 14-day free trial with zero credit card required.</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF9FF] border border-[#E8E2F0]">
                <span className="font-bold text-[#211A33] block mb-0.5">Existing CRM In Place</span>
                <span className="font-medium">Explains seamless 2-way sync with Salesforce, HubSpot, and Google Workspace.</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF9FF] border border-[#E8E2F0]">
                <span className="font-bold text-[#211A33] block mb-0.5">Team Consensus Needed</span>
                <span className="font-medium">Offers custom 1-page executive summary & calendar invite for stakeholders.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recording Consent Modal */}
      <ConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        onConfirm={handleConsentConfirm}
      />
    </div>
  );
};
