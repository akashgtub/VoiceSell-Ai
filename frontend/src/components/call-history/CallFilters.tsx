import React from 'react';
import { Search, Filter } from 'lucide-react';

interface CallFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  minDuration: number;
  onMinDurationChange: (value: number) => void;
}

export const CallFilters: React.FC<CallFiltersProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  minDuration,
  onMinDurationChange,
}) => {
  const statuses = [
    'All',
    'Converted',
    'Demo Requested',
    'Interested',
    'Follow-up Required',
    'Not Interested',
    'No Response',
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E8E2F0] p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Search Bar */}
      <div className="relative w-full md:w-96">
        <Search className="w-4 h-4 text-[#77718A] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by Call ID, summary, or requirements..."
          className="w-full pl-10 pr-4 py-2 bg-[#FAF9FF] border border-[#E8E2F0] rounded-xl text-xs sm:text-sm text-[#211A33] placeholder-[#77718A] focus:outline-none focus:border-[#6C3BDB] focus:ring-2 focus:ring-[#6C3BDB]/15 transition"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2 text-xs text-[#77718A]">
          <Filter className="w-3.5 h-3.5 text-[#6C3BDB]" />
          <span className="font-bold text-[#211A33]">Status:</span>
        </div>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-[#FAF9FF] border border-[#E8E2F0] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#211A33] font-semibold focus:outline-none focus:border-[#6C3BDB] focus:ring-2 focus:ring-[#6C3BDB]/15 transition cursor-pointer"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={minDuration}
          onChange={(e) => onMinDurationChange(Number(e.target.value))}
          className="bg-[#FAF9FF] border border-[#E8E2F0] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#211A33] font-semibold focus:outline-none focus:border-[#6C3BDB] focus:ring-2 focus:ring-[#6C3BDB]/15 transition cursor-pointer"
        >
          <option value={0}>Any Duration</option>
          <option value={30}>&gt; 30 seconds</option>
          <option value={60}>&gt; 1 minute</option>
          <option value={120}>&gt; 2 minutes</option>
        </select>
      </div>
    </div>
  );
};
