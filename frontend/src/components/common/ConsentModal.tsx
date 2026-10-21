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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Call Recording Consent
          </h3>
          <p className="text-sm text-slate-600 mb-4 leading-relaxed">
            VoxSell AI records sales calls to transcribe customer conversations, generate automated meeting summaries, and produce CRM deal insights.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-6 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-800 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Audio encrypted with AES-256 standard
            </div>
            <div className="text-slate-500">
              By enabling recording, both caller voice and AI responses will be archived for review in your Call History.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => onConfirm(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium text-sm transition shadow-sm active:scale-95"
            >
              <Mic className="w-4 h-4" />
              Consent & Record
            </button>
            <button
              onClick={() => onConfirm(false)}
              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition active:scale-95"
            >
              Continue Unrecorded
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
