import React, { useState, useEffect } from 'react';
import { Call } from '../types';
import { api } from '../api/client';
import { CallFilters } from '../components/call-history/CallFilters';
import { StatusBadge } from '../components/common/StatusBadge';
import { Phone, Clock, Mic, ChevronRight, ChevronLeft, RefreshCw, FileText } from 'lucide-react';

interface CallHistoryPageProps {
  onSelectCall: (callId: string) => void;
}

export const CallHistoryPage: React.FC<CallHistoryPageProps> = ({ onSelectCall }) => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [minDuration, setMinDuration] = useState(0);

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const res = await api.listCalls({
        search: search || undefined,
        status: status || undefined,
        min_duration: minDuration > 0 ? minDuration : undefined,
        page,
        page_size: pageSize,
      });
      setCalls(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.error('Failed to load call history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, [page, status, minDuration]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchCalls();
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}m ${s}s`;
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Search & Filter Header */}
      <CallFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        minDuration={minDuration}
        onMinDurationChange={setMinDuration}
      />

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">Recorded Sales Call Sessions</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {total} total
            </span>
          </div>

          <button
            onClick={fetchCalls}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading && calls.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
              <p className="text-sm font-semibold text-slate-600">Loading call history...</p>
            </div>
          ) : calls.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No Sales Calls Found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or start a new call.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Call ID</th>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5">Duration</th>
                  <th className="px-6 py-3.5">Sales Status</th>
                  <th className="px-6 py-3.5">AI Summary</th>
                  <th className="px-6 py-3.5">Recording</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {calls.map((call) => (
                  <tr
                    key={call.id}
                    onClick={() => onSelectCall(call.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition group"
                  >
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-800">
                      #{call.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 whitespace-nowrap">
                      {formatDate(call.started_at)}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDuration(call.duration_seconds)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={call.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <p className="text-xs text-slate-600 line-clamp-1">
                        {call.summary || 'Summary not available.'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {call.recording_path ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                          <Mic className="w-3 h-3" />
                          <span>Audio</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCall(call.id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 group-hover:bg-brand-50 text-slate-600 group-hover:text-brand-600 font-semibold text-xs transition inline-flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div>
              Showing page <span className="font-bold">{page}</span> of <span className="font-bold">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
