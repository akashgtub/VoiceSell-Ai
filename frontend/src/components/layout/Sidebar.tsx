import React from 'react';
import type { NavTab } from '../../types';
import { 
  LayoutDashboard, 
  PhoneCall, 
  History, 
  BarChart3, 
  Layers, 
  Settings, 
  Activity,
  Radio,
  X
} from 'lucide-react';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isCallActive?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  onSelectTab, 
  isCallActive = false,
  mobileOpen = false,
  onCloseMobile
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'live-call', label: 'Live Sales Call', icon: PhoneCall },
    { id: 'history', label: 'Call History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'product', label: 'Product Configuration', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-white border-r border-[#E8E2F0]">
      <div>
        {/* App Logo */}
        <div className="p-6 border-b border-[#E8E2F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6C3BDB] flex items-center justify-center text-white shadow-md shadow-[#6C3BDB]/25">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[#211A33] text-lg tracking-tight">VoxSell</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-[#F3EEFF] text-[#6C3BDB] border border-[#E9DFFF] uppercase">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-[#77718A] font-medium">Voice Sales Agent</p>
            </div>
          </div>

          {/* Close mobile drawer button */}
          {onCloseMobile && (
            <button 
              onClick={onCloseMobile}
              className="md:hidden p-1.5 text-[#77718A] hover:text-[#211A33] rounded-lg hover:bg-[#F3EEFF] transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Live Call Active Alert */}
        {isCallActive && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-[#F3EEFF] border border-[#E9DFFF] text-[#4C1D95] text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6C3BDB] animate-ping"></span>
              <span className="font-semibold text-[#4C1D95]">Call Active</span>
            </div>
            <button 
              onClick={() => {
                onSelectTab('live-call');
                if (onCloseMobile) onCloseMobile();
              }}
              className="text-[#6C3BDB] font-bold hover:underline"
            >
              View
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-2">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#77718A]">
            Sales Management
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                  isActive
                    ? 'bg-[#F3EEFF] text-[#6C3BDB] font-semibold border-l-4 border-[#6C3BDB]'
                    : 'text-[#211A33] hover:bg-[#FAF9FF] hover:text-[#6C3BDB]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#6C3BDB]' : 'text-[#77718A]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === 'live-call' && isCallActive && (
                  <Radio className="w-3.5 h-3.5 text-[#6C3BDB] animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-[#E8E2F0]">
        <div className="p-3.5 rounded-xl bg-[#FAF9FF] border border-[#E8E2F0] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F3EEFF] text-[#6C3BDB] flex items-center justify-center font-bold">
            <Radio className="w-4 h-4 text-[#6C3BDB]" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-[#211A33] truncate">AI Voice Engine Online</div>
            <div className="text-[11px] text-[#77718A] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
              <span>FastAPI & Edge-TTS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-full flex-shrink-0 select-none">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-[#211A33]/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
