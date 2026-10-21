import React from 'react';
import type { SalesStatus } from '../../types';
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
          bg: 'bg-emerald-50 text-[#16A34A] border-emerald-200',
          dot: 'bg-[#16A34A]',
          icon: CheckCircle2,
        };
      case 'Demo Requested':
        return {
          bg: 'bg-[#F3EEFF] text-[#4C1D95] border-[#E9DFFF]',
          dot: 'bg-[#6C3BDB]',
          icon: Calendar,
        };
      case 'Interested':
        return {
          bg: 'bg-[#F3EEFF] text-[#6C3BDB] border-[#E9DFFF]',
          dot: 'bg-[#6C3BDB]',
          icon: ThumbsUp,
        };
      case 'Follow-up Required':
        return {
          bg: 'bg-amber-50 text-[#F59E0B] border-amber-200',
          dot: 'bg-[#F59E0B]',
          icon: Clock,
        };
      case 'Not Interested':
        return {
          bg: 'bg-rose-50 text-[#DC2626] border-rose-200',
          dot: 'bg-[#DC2626]',
          icon: XCircle,
        };
      case 'No Response':
        return {
          bg: 'bg-slate-100 text-[#77718A] border-slate-200',
          dot: 'bg-[#77718A]',
          icon: PhoneOff,
        };
      case 'In Progress':
        return {
          bg: 'bg-[#F3EEFF] text-[#6C3BDB] border-[#E9DFFF]',
          dot: 'bg-[#6C3BDB] animate-ping',
          icon: Radio,
        };
      default:
        return {
          bg: 'bg-[#F3EEFF] text-[#6C3BDB] border-[#E9DFFF]',
          dot: 'bg-[#6C3BDB]',
          icon: Radio,
        };
    }
  };

  const { bg, dot, icon: Icon } = getBadgeStyle();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
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
