import React from 'react';
import type { Call } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Phone, Clock, Mic, ChevronRight, ArrowUpRight } from 'lucide-react';

interface RecentCallsTableProps {
  calls: Call[];
  onSelectCall: (callId: string) => void;
  onViewAllClick: () => void;
}

export const RecentCallsTable: React.FC<RecentCallsTableProps> = ({ calls, onSelectCall, onViewAllClick }) => {
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}m ${s}s`;
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E8E2F0] shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E8E2F0] flex items-center justify-between">
        <div>
          <h3 className="font-bold text-[#211A33] text-base">Recent Sales Calls</h3>
          <p className="text-xs text-[#77718A]">Latest conversations processed by VoxSell AI</p>
        </div>
        <button
          onClick={onViewAllClick}
          className="text-xs font-bold text-[#6C3BDB] hover:text-[#4C1D95] flex items-center gap-1 transition"
        >
          <span>View All in Call History</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        {calls.length === 0 ? (
          <div className="p-8 text-center text-[#77718A]">
            <div className="w-12 h-12 rounded-full bg-[#F3EEFF] text-[#6C3BDB] flex items-center justify-center mx-auto mb-2 border border-[#E9DFFF]">
              <Phone className="w-5 h-5 text-[#6C3BDB]" />
            </div>
            <p className="text-sm font-bold text-[#211A33]">No Sales Calls Yet</p>
            <p className="text-xs text-[#77718A] mt-1">Start a live conversation to view real-time call transcripts and summaries.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF9FF] text-[#77718A] text-xs font-bold uppercase tracking-wider border-b border-[#E8E2F0]">
              <tr>
                <th className="px-6 py-3.5">Call ID / Time</th>
                <th className="px-6 py-3.5">Duration</th>
                <th className="px-6 py-3.5">Sales Status</th>
                <th className="px-6 py-3.5">AI Executive Summary</th>
                <th className="px-6 py-3.5">Audio</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2F0]">
              {calls.map((call) => (
                <tr
                  key={call.id}
                  onClick={() => onSelectCall(call.id)}
                  className="hover:bg-[#FAF9FF] cursor-pointer transition"
                >
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs font-bold text-[#211A33]">
                      #{call.id.slice(0, 8)}
                    </div>
                    <div className="text-[11px] text-[#77718A] mt-0.5">
                      {formatDate(call.started_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-[#211A33]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#77718A]" />
                      <span>{formatDuration(call.duration_seconds)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={call.status} size="sm" />
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-xs text-[#77718A] truncate font-medium">
                      {call.summary || 'Summary generating...'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {call.recording_path ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F3EEFF] text-[#6C3BDB] text-[11px] font-bold border border-[#E9DFFF]">
                        <Mic className="w-3 h-3 text-[#6C3BDB]" />
                        <span>Ready</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#77718A]">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCall(call.id);
                      }}
                      className="p-1.5 text-[#77718A] hover:text-[#6C3BDB] rounded-lg hover:bg-[#F3EEFF] transition"
                      title="Inspect Call"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
