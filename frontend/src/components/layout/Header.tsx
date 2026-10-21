import React from 'react';
import { NavTab } from '../../types';
import { PhoneCall, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';

interface HeaderProps {
  currentTab: NavTab;
  onStartCallClick: () => void;
  isCallActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onStartCallClick, isCallActive }) => {
  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Sales Dashboard',
      subtitle: 'Real-time performance metrics, lead conversion, and call activity',
    },
    'live-call': {
      title: 'Live Voice Sales Call',
      subtitle: 'Real-time speech interaction, instant discovery, and transcript analysis',
    },
    history: {
      title: 'Call History & Records',
      subtitle: 'Review past conversations, listen to audio recordings, and inspect deal summaries',
    },
    analytics: {
      title: 'Conversion Analytics',
      subtitle: 'Funnel stages, customer objection distribution, and qualification metrics',
    },
    product: {
      title: 'Product Knowledge Base',
      subtitle: 'Configure product capabilities, pricing plans, and verified sales facts',
    },
    settings: {
      title: 'Voice & AI Settings',
      subtitle: 'Manage speech-to-text, neural TTS voice parameters, and AI model keys',
    },
  };

  const { title, subtitle } = titles[currentTab] || { title: 'VoxSell AI', subtitle: 'Intelligent Voice Sales' };

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* System Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-medium">System Online</span>
        </div>

        {/* Start Call CTA if not already on live-call and not in call */}
        {currentTab !== 'live-call' && (
          <button
            onClick={onStartCallClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 text-white rounded-xl text-sm font-semibold shadow-sm transition active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Start Live Call</span>
          </button>
        )}

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-navy-800 to-navy-950 text-white flex items-center justify-center font-bold text-xs shadow-sm border border-slate-200">
            SR
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-900">Sarah Reynolds</div>
            <div className="text-[11px] text-slate-500">VP of Revenue</div>
          </div>
        </div>
      </div>
    </header>
  );
};
