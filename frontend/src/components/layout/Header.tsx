import React from 'react';
import type { NavTab } from '../../types';
import { PhoneCall, Search, Bell, Menu, ChevronRight } from 'lucide-react';

interface HeaderProps {
  currentTab: NavTab;
  onStartCallClick: () => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onStartCallClick, onToggleMobileMenu }) => {
  const titles: Record<NavTab, { title: string; breadcrumb: string }> = {
    overview: {
      title: 'Sales Dashboard',
      breadcrumb: 'Overview',
    },
    'live-call': {
      title: 'Live Voice Sales Call',
      breadcrumb: 'Live Call',
    },
    history: {
      title: 'Call History & Records',
      breadcrumb: 'Call History',
    },
    analytics: {
      title: 'Pipeline Analytics',
      breadcrumb: 'Analytics',
    },
    product: {
      title: 'Product Configuration',
      breadcrumb: 'Product Knowledge Base',
    },
    settings: {
      title: 'Voice & AI Settings',
      breadcrumb: 'Settings',
    },
  };

  const { title, breadcrumb } = titles[currentTab] || { title: 'VoxSell AI', breadcrumb: 'Dashboard' };

  return (
    <header className="h-20 bg-white border-b border-[#E8E2F0] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 select-none">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-[#77718A] hover:text-[#6C3BDB] rounded-xl hover:bg-[#F3EEFF] transition"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-[#77718A] font-medium mb-0.5">
            <span>VoxSell AI</span>
            <ChevronRight className="w-3 h-3 text-[#E8E2F0]" />
            <span className="text-[#6C3BDB] font-semibold">{breadcrumb}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-[#211A33] tracking-tight">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Header Search Bar */}
        <div className="hidden lg:flex items-center relative">
          <Search className="w-4 h-4 text-[#77718A] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search deals, transcripts..."
            className="w-56 bg-[#FAF9FF] border border-[#E8E2F0] rounded-xl pl-9 pr-4 py-1.5 text-xs text-[#211A33] placeholder-[#77718A] focus:outline-none focus:border-[#6C3BDB] focus:ring-2 focus:ring-[#6C3BDB]/15 transition"
          />
        </div>

        {/* Notification Bell */}
        <button 
          className="p-2 text-[#77718A] hover:text-[#6C3BDB] rounded-xl hover:bg-[#F3EEFF] border border-transparent hover:border-[#E9DFFF] transition relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#6C3BDB] absolute top-1.5 right-1.5"></span>
        </button>

        {/* Start Call CTA if not already on live-call */}
        {currentTab !== 'live-call' && (
          <button
            onClick={onStartCallClick}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-[#6C3BDB] hover:bg-[#5B2EC4] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Start Live Call</span>
          </button>
        )}

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#E8E2F0]">
          <div className="w-9 h-9 rounded-full bg-[#F3EEFF] text-[#6C3BDB] border border-[#E9DFFF] flex items-center justify-center font-bold text-xs shadow-sm">
            SR
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-[#211A33]">Sarah Reynolds</div>
            <div className="text-[11px] text-[#77718A]">VP of Revenue</div>
          </div>
        </div>
      </div>
    </header>
  );
};
