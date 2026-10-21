import React, { useState, useEffect } from 'react';
import { UseVoiceCallReturn } from '../hooks/useVoiceCall';
import { AudioVisualizer } from '../components/live-call/AudioVisualizer';
import { LiveTranscript } from '../components/live-call/LiveTranscript';
import { CallControls } from '../components/live-call/CallControls';
import { ConsentModal } from '../components/common/ConsentModal';
import { ProductConfig } from '../types';
import { api } from '../api/client';
import { Sparkles, Layers, DollarSign, Calendar, ChevronRight, CheckCircle2 } from 'lucide-react';

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
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Call Completed Success Banner */}
      {voiceCall.status === 'ended' && lastEndedCallId && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-950 text-sm">Call Completed & Transcribed</h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                AI executive summary generated, sales status classified, and audio recording persisted.
              </p>
            </div>
          </div>
          <button
            onClick={() => onViewCallDetails(lastEndedCallId)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
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
            micPermission={voiceCall.micPermission}
            errorMessage={voiceCall.errorMessage}
            onStartCall={handleStartCallClick}
            onEndCall={handleEndCallClick}
            onToggleMute={voiceCall.toggleMute}
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
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-brand-600">
              <Layers className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-base">Verified Knowledge Base</h3>
            </div>
            <p className="text-xs text-slate-500">
              VoxSell AI uses this verified product data to answer discovery questions accurately without hallucinating.
            </p>

            {productConfig ? (
              <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Product</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{productConfig.product_name}</div>
                  <div className="text-slate-600 text-xs mt-0.5">{productConfig.tagline}</div>
                </div>

                <div>
                  <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Target Audience</span>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">{productConfig.target_audience}</p>
                </div>

                <div>
                  <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Pricing Tiers</span>
                  <div className="space-y-1.5 mt-1">
                    {pricingTiers.map((tier, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <span className="font-bold text-slate-800">{tier.tier}</span>
                        <span className="text-brand-600 font-bold">{tier.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Demo Offer Rule</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    AI will automatically propose a 20-min tailored demo when buying signals or interest are identified.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">Loading knowledge base...</div>
            )}
          </div>

          {/* Objection Handling Cheat Sheet */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 text-accent-600 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>AI Sales Playbook</span>
            </div>
            <div className="space-y-2 text-slate-600">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">Price / Budget Hesitation</span>
                <span>Highlights 38% shorter sales cycles and 14-day free trial with zero credit card required.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">Existing CRM In Place</span>
                <span>Explains seamless 2-way sync with Salesforce, HubSpot, and Google Workspace.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">Team Consensus Needed</span>
                <span>Offers custom 1-page executive summary & calendar invite for stakeholders.</span>
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
