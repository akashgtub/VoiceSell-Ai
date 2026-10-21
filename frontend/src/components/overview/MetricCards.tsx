import React from 'react';
import { DashboardStats } from '../../types';
import { Phone, CheckCircle2, ThumbsUp, Calendar, Clock, TrendingUp } from 'lucide-react';

interface MetricCardsProps {
  stats: DashboardStats;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ stats }) => {
  const cards = [
    {
      label: 'Total Calls',
      value: stats.total_calls,
      icon: Phone,
      color: 'text-slate-700 bg-slate-100',
      description: 'Recorded sales interactions',
    },
    {
      label: 'Converted Leads',
      value: stats.converted_leads,
      icon: CheckCircle2,
      color: 'text-emerald-700 bg-emerald-50',
      description: 'Confirmed purchases & signups',
    },
    {
      label: 'Demos Requested',
      value: stats.demos_requested,
      icon: Calendar,
      color: 'text-purple-700 bg-purple-50',
      description: 'Walkthroughs scheduled',
    },
    {
      label: 'Interested Leads',
      value: stats.interested_leads,
      icon: ThumbsUp,
      color: 'text-blue-700 bg-blue-50',
      description: 'High buying intent detected',
    },
    {
      label: 'Follow-ups Required',
      value: stats.follow_ups_required,
      icon: Clock,
      color: 'text-amber-700 bg-amber-50',
      description: 'Pending callback or info packet',
    },
    {
      label: 'Conversion Rate',
      value: `${stats.conversion_rate}%`,
      icon: TrendingUp,
      color: 'text-indigo-700 bg-indigo-50',
      description: 'Calls to closed-won ratio',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {c.label}
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${c.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
              {c.value}
            </div>
            <div className="text-[11px] text-slate-400 font-medium truncate">
              {c.description}
            </div>
          </div>
        );
      })}
    </div>
  );
};
