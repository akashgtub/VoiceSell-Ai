import React from 'react';
import { Call } from '../../types';
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Recent Sales Calls</h3>
          <p className="text-xs text-slate-500">Latest conversations processed by VoxSell AI</p>
        </div>
        <button
          onClick={onViewAllClick}
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition"
        >
          <span>View All in Call History</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        {calls.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-2">
              <Phone className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No Sales Calls Yet</p>
            <p className="text-xs text-slate-400 mt-1">Start a live conversation to view real-time call transcripts and summaries.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Call ID / Time</th>
                <th className="px-6 py-3">Duration</th>
                <th className="px-6 py-3">Sales Status</th>
                <th className="px-6 py-3">AI Executive Summary</th>
                <th className="px-6 py-3">Audio</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {calls.map((call) => (
                <tr
                  key={call.id}
                  onClick={() => onSelectCall(call.id)}
                  className="hover:bg-slate-50/80 cursor-pointer transition"
                >
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs font-bold text-slate-800">
                      #{call.id.slice(0, 8)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {formatDate(call.started_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDuration(call.duration_seconds)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={call.status} size="sm" />
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-xs text-slate-600 truncate">
                      {call.summary || 'Summary generating...'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {call.recording_path ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-200">
                        <Mic className="w-3 h-3" />
                        <span>Ready</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCall(call.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition"
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
