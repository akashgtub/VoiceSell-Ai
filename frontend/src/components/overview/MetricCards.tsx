import React from 'react';
import type { DashboardStats } from '../../types';
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
      description: 'Recorded sales interactions',
    },
    {
      label: 'Converted Leads',
      value: stats.converted_leads,
      icon: CheckCircle2,
      description: 'Confirmed purchases & signups',
    },
    {
      label: 'Demos Requested',
      value: stats.demos_requested,
      icon: Calendar,
      description: 'Walkthroughs scheduled',
    },
    {
      label: 'Interested Leads',
      value: stats.interested_leads,
      icon: ThumbsUp,
      description: 'High buying intent detected',
    },
    {
      label: 'Follow-ups Required',
      value: stats.follow_ups_required,
      icon: Clock,
      description: 'Pending callback or info packet',
    },
    {
      label: 'Conversion Rate',
      value: `${stats.conversion_rate}%`,
      icon: TrendingUp,
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
            className="bg-white rounded-2xl border border-[#E8E2F0] p-5 shadow-sm hover:shadow-md hover:border-[#6C3BDB]/40 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-[#77718A] uppercase tracking-wider">
                {c.label}
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#F3EEFF] text-[#6C3BDB] flex items-center justify-center border border-[#E9DFFF]">
                <Icon className="w-4 h-4 text-[#6C3BDB]" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#211A33] tracking-tight mb-1">
              {c.value}
            </div>
            <div className="text-[11px] text-[#77718A] font-medium truncate">
              {c.description}
            </div>
          </div>
        );
      })}
    </div>
  );
};
