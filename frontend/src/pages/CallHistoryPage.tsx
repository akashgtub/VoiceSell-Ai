import React, { useState, useEffect } from 'react';
import type { Call } from '../types';
import { api } from '../api/client';
import { CallFilters } from '../components/call-history/CallFilters';
import { StatusBadge } from '../components/common/StatusBadge';
import { Clock, Mic, ChevronRight, ChevronLeft, RefreshCw, FileText } from 'lucide-react';

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
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
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
      <div className="bg-white rounded-2xl border border-[#E8E2F0] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E2F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[#211A33] text-base">Recorded Sales Call Sessions</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F3EEFF] text-[#6C3BDB] font-bold border border-[#E9DFFF]">
              {total} total
            </span>
          </div>

          <button
            onClick={fetchCalls}
            className="p-1.5 text-[#77718A] hover:text-[#6C3BDB] rounded-lg hover:bg-[#F3EEFF] transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading && calls.length === 0 ? (
            <div className="p-12 text-center text-[#77718A]">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#6C3BDB]" />
              <p className="text-sm font-bold text-[#211A33]">Loading call history...</p>
            </div>
          ) : calls.length === 0 ? (
            <div className="p-12 text-center text-[#77718A]">
              <FileText className="w-10 h-10 text-[#E8E2F0] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#211A33]">No Sales Calls Found</p>
              <p className="text-xs text-[#77718A] mt-1">Try adjusting your search criteria or start a new call.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF9FF] text-[#77718A] text-xs font-bold uppercase tracking-wider border-b border-[#E8E2F0]">
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
              <tbody className="divide-y divide-[#E8E2F0]">
                {calls.map((call) => (
                  <tr
                    key={call.id}
                    onClick={() => onSelectCall(call.id)}
                    className="hover:bg-[#FAF9FF] cursor-pointer transition group"
                  >
                    <td className="px-6 py-4 font-mono text-xs font-bold text-[#211A33]">
                      #{call.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#77718A] whitespace-nowrap font-medium">
                      {formatDate(call.started_at)}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-[#211A33] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#77718A]" />
                        <span>{formatDuration(call.duration_seconds)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={call.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <p className="text-xs text-[#77718A] line-clamp-1 font-medium">
                        {call.summary || 'Summary not available.'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {call.recording_path ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F3EEFF] text-[#6C3BDB] text-xs font-bold border border-[#E9DFFF]">
                          <Mic className="w-3 h-3 text-[#6C3BDB]" />
                          <span>Audio</span>
                        </span>
                      ) : (
                        <span className="text-xs text-[#77718A]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCall(call.id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#E8E2F0] group-hover:bg-[#F3EEFF] group-hover:border-[#E9DFFF] text-[#6C3BDB] font-bold text-xs transition inline-flex items-center gap-1 shadow-sm"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#6C3BDB]" />
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
          <div className="px-6 py-3.5 bg-[#FAF9FF] border-t border-[#E8E2F0] flex items-center justify-between text-xs text-[#77718A]">
            <div>
              Showing page <span className="font-bold text-[#211A33]">{page}</span> of <span className="font-bold text-[#211A33]">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-[#E8E2F0] bg-white hover:bg-[#F3EEFF] disabled:opacity-50 text-[#6C3BDB] transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-[#E8E2F0] bg-white hover:bg-[#F3EEFF] disabled:opacity-50 text-[#6C3BDB] transition"
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
