import React from 'react';
import { NavTab } from '../../types';
import { 
  LayoutDashboard, 
  PhoneCall, 
  History, 
  BarChart3, 
  Layers, 
  Settings, 
  Sparkles,
  Bot
} from 'lucide-react';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isCallActive?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, isCallActive = false }) => {
  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'live-call', label: 'Live Sales Call', icon: PhoneCall },
    { id: 'history', label: 'Call History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'product', label: 'Product Config', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-navy-950 text-slate-300 flex flex-col justify-between border-r border-navy-800 flex-shrink-0 select-none">
      <div>
        {/* App Logo */}
        <div className="p-6 border-b border-navy-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-lg tracking-tight">VoxSell</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-brand-500/20 text-brand-400 border border-brand-500/30 uppercase">
                  AI
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Autonomous Sales Voice</p>
            </div>
          </div>
        </div>

        {/* Live Call Alert Indicator */}
        {isCallActive && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="font-semibold">Call in Progress</span>
            </div>
            <button 
              onClick={() => onSelectTab('live-call')}
              className="text-cyan-400 font-bold hover:underline"
            >
              View
            </button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Sales Management
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-navy-850'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === 'live-call' && isCallActive && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-navy-800/80">
        <div className="p-3 rounded-xl bg-navy-900 border border-navy-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-white truncate">AI Engine Active</div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>FastAPI & WebSocket</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
