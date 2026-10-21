import React from 'react';
import { SalesStatus } from '../../types';
import { CheckCircle2, Calendar, ThumbsUp, Clock, XCircle, PhoneOff, Radio } from 'lucide-react';

interface StatusBadgeProps {
  status: SalesStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showIcon = true }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'Converted':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          icon: CheckCircle2,
        };
      case 'Demo Requested':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          dot: 'bg-purple-500',
          icon: Calendar,
        };
      case 'Interested':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          icon: ThumbsUp,
        };
      case 'Follow-up Required':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          icon: Clock,
        };
      case 'Not Interested':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          icon: XCircle,
        };
      case 'No Response':
        return {
          bg: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-slate-400',
          icon: PhoneOff,
        };
      case 'In Progress':
        return {
          bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
          dot: 'bg-cyan-500 animate-ping',
          icon: Radio,
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          icon: Radio,
        };
    }
  };

  const { bg, dot, icon: Icon } = getBadgeStyle();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${bg} ${sizeClasses}`}>
      {showIcon ? (
        <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      )}
      <span>{status}</span>
    </span>
  );
};
