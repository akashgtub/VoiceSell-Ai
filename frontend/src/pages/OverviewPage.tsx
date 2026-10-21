import React, { useEffect, useState } from 'react';
import type { DashboardStats } from '../types';
import { api } from '../api/client';
import { MetricCards } from '../components/overview/MetricCards';
import { StatusChart } from '../components/overview/StatusChart';
import { RecentCallsTable } from '../components/overview/RecentCallsTable';
import { PhoneCall, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

interface OverviewPageProps {
  onStartCall: () => void;
  onSelectCall: (callId: string) => void;
  onNavigateHistory: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  onStartCall,
  onSelectCall,
  onNavigateHistory,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load dashboard stats:', err);
      setError(err.message || 'Could not load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-[#77718A] text-sm font-semibold">
          <RefreshCw className="w-5 h-5 animate-spin text-[#6C3BDB]" />
          <span>Loading CRM Sales Metrics...</span>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-[#DC2626] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#DC2626]" />
            <span className="text-sm font-semibold">{error || 'Unable to load dashboard.'}</span>
          </div>
          <button
            onClick={loadStats}
            className="px-3 py-1 bg-white border border-rose-300 rounded-xl text-xs font-bold hover:bg-rose-50 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome Banner in Purple & White */}
      <div className="bg-gradient-to-r from-[#4C1D95] to-[#6C3BDB] rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-[#6C3BDB]/15 border border-[#4C1D95] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[#FAF9FF] text-xs font-bold mb-3 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Autonomous Sales Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-white">
            AI Sales Agent Ready to Close Deals
          </h2>
          <p className="text-xs sm:text-sm text-purple-100 leading-relaxed font-medium">
            Conduct hands-free discovery calls, present verified product pricing, address customer objections, and capture qualified demos directly into your CRM.
          </p>
        </div>

        <button
          onClick={onStartCall}
          className="relative z-10 inline-flex items-center gap-2 px-6 py-3.5 bg-white text-[#6C3BDB] hover:bg-[#F3EEFF] font-bold rounded-xl text-sm shadow-md transition-all active:scale-95 whitespace-nowrap"
        >
          <PhoneCall className="w-4 h-4 text-[#6C3BDB]" />
          <span>Launch Live Voice Call</span>
        </button>

        {/* Ambient background decoration */}
        <div className="absolute -right-10 -bottom-10 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* 6 Core KPIs */}
      <MetricCards stats={stats} />

      {/* Activity and Distribution Charts */}
      <StatusChart
        distribution={stats.status_distribution}
        activity={stats.activity_over_time}
        totalCalls={stats.total_calls}
      />

      {/* Recent Calls Table */}
      <RecentCallsTable
        calls={stats.recent_calls}
        onSelectCall={onSelectCall}
        onViewAllClick={onNavigateHistory}
      />
    </div>
  );
};
