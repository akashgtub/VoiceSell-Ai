import React, { useEffect, useState } from 'react';
import { DashboardStats } from '../types';
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
        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-brand-600" />
          <span>Loading CRM Sales Metrics...</span>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <span>{error || 'Unable to load dashboard.'}</span>
          </div>
          <button
            onClick={loadStats}
            className="px-3 py-1 bg-white border border-rose-300 rounded-lg text-xs font-semibold hover:bg-rose-100 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome & Quick Action Card */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-850 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-navy-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Sales Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            AI Sales Agent Ready to Close Deals
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Conduct hands-free discovery calls, present product pricing, answer complex objections, and capture qualified demos directly into your CRM.
          </p>
        </div>

        <button
          onClick={onStartCall}
          className="relative z-10 inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-brand-500/25 transition-all transform active:scale-95 whitespace-nowrap"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Launch Live Voice Call</span>
        </button>

        {/* Ambient background decoration */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
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
