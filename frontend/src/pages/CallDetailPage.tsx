import React, { useEffect, useState } from 'react';
import type { Call, SalesStatus } from '../types';
import { api } from '../api/client';
import { StatusBadge } from '../components/common/StatusBadge';
import { AudioPlayer } from '../components/common/AudioPlayer';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ListChecks, 
  RefreshCw, 
  ShieldCheck, 
  Edit3, 
  Save,
  Bot,
  User,
  Sparkles
} from 'lucide-react';

interface CallDetailPageProps {
  callId: string;
  onBack: () => void;
}

export const CallDetailPage: React.FC<CallDetailPageProps> = ({ callId, onBack }) => {
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status edit state
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<SalesStatus>('Interested');
  const [statusNotes, setStatusNotes] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const loadCall = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCall(callId);
      setCall(data);
      setSelectedStatus(data.status);
      setStatusNotes(data.notes || '');
    } catch (err: any) {
      console.error('Failed to load call details:', err);
      setError(err.message || 'Call not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCall();
  }, [callId]);

  const handleSaveStatus = async () => {
    try {
      setSavingStatus(true);
      const res = await api.updateCallStatus(callId, selectedStatus, statusNotes);
      setCall(prev => prev ? {
        ...prev,
        status: res.status as SalesStatus,
        original_ai_status: res.original_ai_status as SalesStatus,
        notes: res.notes
      } : null);
      setIsEditingStatus(false);
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setSavingStatus(false);
    }
  };

  const parseJsonArray = (val: string | null): string[] => {
    if (!val) return [];
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [val];
    } catch {
      return [val];
    }
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}m ${s}s`;
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-[#77718A] text-sm font-semibold">
          <RefreshCw className="w-5 h-5 animate-spin text-[#6C3BDB]" />
          <span>Loading Conversation Details & Audio...</span>
        </div>
      </div>
    );
  }

  if (error || !call) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <button 
          onClick={onBack} 
          className="inline-flex items-center gap-2 text-sm text-[#6C3BDB] font-bold hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Call History
        </button>
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-[#DC2626] flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-[#DC2626]" />
          <span className="text-sm font-semibold">{error || 'Call not found'}</span>
        </div>
      </div>
    );
  }

  const customerRequirements = parseJsonArray(call.customer_requirements);
  const objections = parseJsonArray(call.objections);
  const nextSteps = parseJsonArray(call.next_steps);
  const buyingSignals = parseJsonArray(call.buying_signals);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Back button & Call ID Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E8E2F0] bg-white hover:bg-[#F3EEFF] text-[#6C3BDB] text-xs font-bold shadow-sm transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#6C3BDB]" />
          <span>Back to Call History</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="text-xs text-[#77718A] font-mono">
            ID: <span className="text-[#211A33] font-bold">{call.id}</span>
          </div>
          <StatusBadge status={call.status} size="md" />
        </div>
      </div>

      {/* Top Banner: Call Metadata Summary */}
      <div className="bg-white rounded-2xl border border-[#E8E2F0] p-6 shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-6 text-xs text-[#77718A]">
          <div>
            <span className="font-bold text-[#77718A] block mb-0.5 uppercase tracking-wider text-[10px]">Started At</span>
            <span className="font-bold text-[#211A33]">{new Date(call.started_at).toLocaleString()}</span>
          </div>

          <div>
            <span className="font-bold text-[#77718A] block mb-0.5 uppercase tracking-wider text-[10px]">Duration</span>
            <div className="flex items-center gap-1 font-bold text-[#211A33]">
              <Clock className="w-3.5 h-3.5 text-[#6C3BDB]" />
              <span>{formatDuration(call.duration_seconds)}</span>
            </div>
          </div>

          <div>
            <span className="font-bold text-[#77718A] block mb-0.5 uppercase tracking-wider text-[10px]">Recording Consent</span>
            <span className={`font-bold ${call.recording_consent ? 'text-[#16A34A]' : 'text-[#77718A]'}`}>
              {call.recording_consent ? 'Explicitly Granted' : 'Unrecorded / No'}
            </span>
          </div>

          <div>
            <span className="font-bold text-[#77718A] block mb-0.5 uppercase tracking-wider text-[10px]">Status Classification</span>
            {call.original_ai_status && call.original_ai_status !== call.status ? (
              <span className="text-[#F59E0B] font-bold text-[11px]">
                Overridden (Original AI was {call.original_ai_status})
              </span>
            ) : (
              <span className="text-[#6C3BDB] font-semibold text-[11px]">Original AI Classification</span>
            )}
          </div>
        </div>

        {/* Status Manual Correction Option */}
        <div>
          {!isEditingStatus ? (
            <button
              onClick={() => setIsEditingStatus(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E2F0] bg-white hover:bg-[#F3EEFF] text-[#6C3BDB] text-xs font-bold transition shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#6C3BDB]" />
              <span>Change Status</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as SalesStatus)}
                className="bg-[#FAF9FF] border border-[#E8E2F0] rounded-xl px-2.5 py-1 text-xs font-bold text-[#211A33] cursor-pointer focus:outline-none focus:border-[#6C3BDB]"
              >
                <option value="Converted">Converted</option>
                <option value="Demo Requested">Demo Requested</option>
                <option value="Interested">Interested</option>
                <option value="Follow-up Required">Follow-up Required</option>
                <option value="Not Interested">Not Interested</option>
                <option value="No Response">No Response</option>
              </select>

              <button
                onClick={handleSaveStatus}
                disabled={savingStatus}
                className="inline-flex items-center gap-1 px-3 py-1 bg-[#6C3BDB] hover:bg-[#5B2EC4] text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>

              <button
                onClick={() => setIsEditingStatus(false)}
                className="px-2 py-1 text-[#77718A] hover:text-[#211A33] text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Persistent Audio Player if audio recorded */}
      {call.recording_url && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#77718A] uppercase tracking-wider">Audio Playback</h4>
          <AudioPlayer src={call.recording_url} callId={call.id} />
        </div>
      )}

      {/* Main Grid: AI Summary & Deal Intelligence vs Full Transcript */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: AI Executive Summary with Light Lavender Background Sections */}
        <div className="lg:col-span-5 space-y-6">
          {/* Executive Summary in White Card */}
          <div className="bg-white rounded-2xl border border-[#E8E2F0] p-6 shadow-sm space-y-3">
            <h4 className="font-bold text-[#6C3BDB] text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#6C3BDB]" />
              <span>AI Executive Summary</span>
            </h4>
            <p className="text-xs text-[#211A33] leading-relaxed bg-[#FAF9FF] border border-[#E8E2F0] p-3.5 rounded-xl font-medium">
              {call.summary || 'Summary not yet generated.'}
            </p>
          </div>

          {/* Customer Requirements & Main Objections (Light Lavender Backgrounds) */}
          <div className="bg-white rounded-2xl border border-[#E8E2F0] p-6 shadow-sm space-y-4">
            <div>
              <h5 className="font-bold text-[#6C3BDB] text-xs flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-[#6C3BDB]" />
                <span>Customer Requirements</span>
              </h5>
              {customerRequirements.length === 0 ? (
                <div className="text-xs text-[#77718A] italic">No specific requirements stated</div>
              ) : (
                <ul className="space-y-1.5 text-xs text-[#211A33]">
                  {customerRequirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 bg-[#F3EEFF] p-2.5 rounded-xl border border-[#E9DFFF] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6C3BDB] mt-1.5 flex-shrink-0"></span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="pt-3 border-t border-[#E8E2F0]">
              <h5 className="font-bold text-[#6C3BDB] text-xs flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-[#6C3BDB]" />
                <span>Main Objections</span>
              </h5>
              {objections.length === 0 ? (
                <div className="text-xs text-[#77718A] italic">No objections raised during call</div>
              ) : (
                <ul className="space-y-1.5 text-xs text-[#211A33]">
                  {objections.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 bg-[#F3EEFF] p-2.5 rounded-xl border border-[#E9DFFF] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] mt-1.5 flex-shrink-0"></span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Recommended Next Steps & Buying Signals (Light Lavender Backgrounds) */}
          <div className="bg-white rounded-2xl border border-[#E8E2F0] p-6 shadow-sm space-y-4">
            <div>
              <h5 className="font-bold text-[#6C3BDB] text-xs flex items-center gap-2 mb-2">
                <ListChecks className="w-4 h-4 text-[#6C3BDB]" />
                <span>Recommended Next Steps</span>
              </h5>
              {nextSteps.length === 0 ? (
                <div className="text-xs text-[#77718A] italic">No next steps logged</div>
              ) : (
                <ul className="space-y-1.5 text-xs text-[#211A33]">
                  {nextSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 bg-[#F3EEFF] p-2.5 rounded-xl border border-[#E9DFFF] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6C3BDB] mt-1.5 flex-shrink-0"></span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {buyingSignals.length > 0 && (
              <div className="pt-3 border-t border-[#E8E2F0]">
                <h5 className="font-bold text-[#6C3BDB] text-xs flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-[#6C3BDB]" />
                  <span>Buying Signals</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-[#211A33]">
                  {buyingSignals.map((sig, i) => (
                    <li key={i} className="flex items-start gap-2 bg-[#F3EEFF] p-2.5 rounded-xl border border-[#E9DFFF] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4C1D95] mt-1.5 flex-shrink-0"></span>
                      <span>{sig}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right 7 Cols: Complete Conversation Transcript in White Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E8E2F0] shadow-sm flex flex-col h-[650px] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E8E2F0] flex items-center justify-between">
            <h4 className="font-bold text-[#211A33] text-sm">Complete Conversation Transcript</h4>
            <span className="text-xs text-[#77718A] font-semibold">{call.messages?.length || 0} turns</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {(!call.messages || call.messages.length === 0) ? (
              <div className="h-full flex items-center justify-center text-[#77718A] text-xs">
                No transcript messages logged for this call.
              </div>
            ) : (
              call.messages.map((m) => {
                const isAi = m.speaker === 'ai';
                return (
                  <div
                    key={m.id}
                    className={`flex gap-3.5 ${isAi ? 'items-start' : 'items-start flex-row-reverse'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                        isAi
                          ? 'bg-[#6C3BDB] text-white'
                          : 'bg-[#211A33] text-white'
                      }`}
                    >
                      {isAi ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                    </div>

                    <div className={`max-w-[80%] ${isAi ? 'text-left' : 'text-right'}`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-xs font-bold text-[#211A33]">
                          {isAi ? 'VoxSell AI Sales Agent' : 'Customer'}
                        </span>
                        <span className="text-[10px] text-[#77718A] font-mono">
                          {formatTime(m.timestamp)}
                        </span>
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                          isAi
                            ? 'bg-[#F3EEFF] border border-[#E9DFFF] text-[#211A33] rounded-tl-sm'
                            : 'bg-white border border-[#6C3BDB]/40 text-[#211A33] rounded-tr-sm'
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
