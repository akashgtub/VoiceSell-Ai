import React from 'react';
import { Mic, ShieldCheck, X } from 'lucide-react';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (consentGranted: boolean) => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#211A33]/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#E8E2F0] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#F3EEFF] text-[#6C3BDB] border border-[#E9DFFF] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#6C3BDB]" />
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#77718A] hover:text-[#211A33] rounded-lg hover:bg-[#F3EEFF] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-[#211A33] mb-2 tracking-tight">
            Call Recording Consent
          </h3>
          <p className="text-xs sm:text-sm text-[#77718A] mb-4 leading-relaxed font-medium">
            VoxSell AI records sales calls to transcribe customer conversations, generate automated meeting summaries, and produce CRM deal insights.
          </p>

          <div className="bg-[#FAF9FF] border border-[#E8E2F0] rounded-xl p-3.5 mb-6 text-xs text-[#77718A] space-y-1.5">
            <div className="flex items-center gap-2 text-[#211A33] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
              Audio encrypted with AES-256 standard
            </div>
            <div className="text-[#77718A] font-medium leading-relaxed">
              By enabling recording, both caller voice and AI responses will be archived for review in your Call History.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => onConfirm(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6C3BDB] hover:bg-[#5B2EC4] text-white rounded-xl font-bold text-sm transition shadow-md shadow-[#6C3BDB]/20 active:scale-95"
            >
              <Mic className="w-4 h-4" />
              <span>Consent & Record</span>
            </button>
            <button
              onClick={() => onConfirm(false)}
              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-white hover:bg-[#F3EEFF] border border-[#E8E2F0] hover:border-[#E9DFFF] text-[#6C3BDB] rounded-xl font-bold text-sm transition active:scale-95"
            >
              Continue Unrecorded
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
