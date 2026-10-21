import React, { useEffect, useState } from 'react';
import type { DashboardStats } from '../types';
import { api } from '../api/client';
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
import { RefreshCw } from 'lucide-react';

const PURPLE_CHART_COLORS: Record<string, string> = {
  'Converted': '#16A34A',
  'Demo Requested': '#4C1D95',
  'Interested': '#6C3BDB',
  'Follow-up Required': '#F59E0B',
  'Not Interested': '#DC2626',
  'No Response': '#77718A',
  'In Progress': '#8054EC',
};

export const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-[#77718A] text-sm font-semibold">
          <RefreshCw className="w-5 h-5 animate-spin text-[#6C3BDB]" />
          <span>Calculating Sales Analytics...</span>
        </div>
      </div>
    );
  }

  // Funnel steps with purple theme
  const funnelSteps = [
    { label: 'Total Calls Initiated', count: stats.total_calls, color: 'bg-[#4C1D95]' },
    { label: 'Engaged & Interested', count: stats.interested_leads, color: 'bg-[#6C3BDB]' },
    { label: 'Demos Requested', count: stats.demos_requested, color: 'bg-[#8054EC]' },
    { label: 'Converted Deals', count: stats.converted_leads, color: 'bg-[#16A34A]' },
  ];

  const filteredDist = stats.status_distribution
    .filter(d => d.count > 0)
    .map(d => ({
      ...d,
      color: PURPLE_CHART_COLORS[d.status] || '#6C3BDB'
    }));

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#211A33] tracking-tight">Revenue Pipeline Analytics</h2>
          <p className="text-xs text-[#77718A]">Autonomous voice discovery, qualification rates, and deal velocity</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#F3EEFF] border border-[#E9DFFF] text-xs font-bold text-[#4C1D95] shadow-sm">
            Conversion Rate: <span className="text-[#6C3BDB] font-extrabold">{stats.conversion_rate}%</span>
          </span>
        </div>
      </div>

      {/* Funnel Visualization Card */}
      <div className="bg-white rounded-2xl border border-[#E8E2F0] p-6 shadow-sm space-y-6">
        <div>
          <h3 className="font-bold text-[#211A33] text-base">Voice Qualification Sales Funnel</h3>
          <p className="text-xs text-[#77718A]">Step-by-step conversion progression from initial dial to closed-won</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {funnelSteps.map((step, idx) => {
            const pct = stats.total_calls > 0 ? Math.round((step.count / stats.total_calls) * 100) : 0;
            return (
              <div key={idx} className="p-4 rounded-xl bg-[#FAF9FF] border border-[#E8E2F0] flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-[#77718A] block mb-1">Step {idx + 1}</span>
                  <span className="text-sm font-bold text-[#211A33] block truncate">{step.label}</span>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-[#211A33]">{step.count}</span>
                  <span className="text-xs font-bold text-[#77718A]">{pct}% of total</span>
                </div>
                <div className="w-full bg-[#E8E2F0] h-1.5 rounded-full mt-2 overflow-hidden">
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
        <div className="bg-white rounded-2xl border border-[#E8E2F0] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-[#211A33] text-base">Call Volume Velocity</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.activity_over_time} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#77718A" fontSize={12} tickLine={false} />
                <YAxis stroke="#77718A" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: '12px', 
                    border: '1px solid #E8E2F0', 
                    boxShadow: '0 4px 12px rgba(108, 59, 219, 0.08)',
                    color: '#211A33', 
                    fontSize: '12px' 
                  }} 
                />
                <Bar dataKey="calls" name="Calls" fill="#6C3BDB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="demos" name="Demos" fill="#4C1D95" radius={[4, 4, 0, 0]} />
                <Bar dataKey="converted" name="Converted" fill="#16A34A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E2F0] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-[#211A33] text-base">Qualification Outcome Breakdown</h3>
          <div className="h-64 w-full flex items-center justify-center">
            {filteredDist.length === 0 ? (
              <div className="text-[#77718A] text-xs font-semibold">No calls completed yet</div>
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
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      borderRadius: '12px', 
                      border: '1px solid #E8E2F0', 
                      boxShadow: '0 4px 12px rgba(108, 59, 219, 0.08)',
                      color: '#211A33', 
                      fontSize: '12px' 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
