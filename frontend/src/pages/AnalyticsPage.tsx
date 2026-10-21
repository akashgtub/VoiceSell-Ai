import React, { useEffect, useState } from 'react';
import { DashboardStats } from '../types';
import { api } from '../api/client';
import { StatusBadge } from '../components/common/StatusBadge';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { BarChart3, TrendingUp, Filter, Users, Calendar, CheckCircle2, RefreshCw } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-brand-600" />
          <span>Calculating Sales Analytics...</span>
        </div>
      </div>
    );
  }

  // Funnel steps
  const funnelSteps = [
    { label: 'Total Calls Initiated', count: stats.total_calls, color: 'bg-slate-800' },
    { label: 'Engaged & Interested', count: stats.interested_leads, color: 'bg-blue-600' },
    { label: 'Demos Requested', count: stats.demos_requested, color: 'bg-purple-600' },
    { label: 'Converted Deals', count: stats.converted_leads, color: 'bg-emerald-600' },
  ];

  const filteredDist = stats.status_distribution.filter(d => d.count > 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Revenue Pipeline Analytics</h2>
          <p className="text-xs text-slate-500">Autonomous voice discovery, qualification rates, and deal velocity</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
            Conversion Rate: <span className="text-brand-600 font-bold">{stats.conversion_rate}%</span>
          </span>
        </div>
      </div>

      {/* Funnel Visualization Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Voice Qualification Sales Funnel</h3>
          <p className="text-xs text-slate-500">Step-by-step conversion progression from initial dial to closed-won</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {funnelSteps.map((step, idx) => {
            const pct = stats.total_calls > 0 ? Math.round((step.count / stats.total_calls) * 100) : 0;
            return (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block mb-1">Step {idx + 1}</span>
                  <span className="text-sm font-bold text-slate-800 block truncate">{step.label}</span>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-slate-900">{step.count}</span>
                  <span className="text-xs font-bold text-slate-500">{pct}% of total</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full ${step.color} transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Activity Over Time vs Status Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Call Volume Velocity</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.activity_over_time} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="calls" name="Calls" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="demos" name="Demos" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="converted" name="Converted" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Qualification Outcome Breakdown</h3>
          <div className="h-64 w-full flex items-center justify-center">
            {filteredDist.length === 0 ? (
              <div className="text-slate-400 text-xs">No calls completed yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredDist}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {filteredDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
