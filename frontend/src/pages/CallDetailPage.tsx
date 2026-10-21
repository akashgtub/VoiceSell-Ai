import React, { useEffect, useState } from 'react';
import { Call, SalesStatus } from '../types';
import { api } from '../api/client';
import { StatusBadge } from '../components/common/StatusBadge';
import { AudioPlayer } from '../components/common/AudioPlayer';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  TrendingUp, 
  ListChecks, 
  RefreshCw, 
  ShieldCheck, 
  Edit3, 
  Save,
  Bot,
  User
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
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-brand-600" />
          <span>Loading Conversation Details & Audio...</span>
        </div>
      </div>
    );
  }

  if (error || !call) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Call History
        </button>
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-500" />
          <span>{error || 'Call not found'}</span>
        </div>
      </div>
    );
  }

  const customerRequirements = parseJsonArray(call.customer_requirements);
  const objections = parseJsonArray(call.objections);
  const nextSteps = parseJsonArray(call.next_steps);
  const buyingSignals = parseJsonArray(call.buying_signals);
  const keyFeatures = parseJsonArray(call.key_features_discussed);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Back button & Call ID Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Call History</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 font-mono">
            ID: <span className="text-slate-900 font-bold">{call.id}</span>
          </div>
          <StatusBadge status={call.status} size="md" />
        </div>
      </div>

      {/* Top Banner: Call Metadata Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
          <div>
            <span className="font-semibold text-slate-400 block mb-0.5 uppercase tracking-wider text-[10px]">Started At</span>
            <span className="font-bold text-slate-800">{new Date(call.started_at).toLocaleString()}</span>
          </div>

          <div>
            <span className="font-semibold text-slate-400 block mb-0.5 uppercase tracking-wider text-[10px]">Duration</span>
            <div className="flex items-center gap-1 font-bold text-slate-800">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDuration(call.duration_seconds)}</span>
            </div>
          </div>

          <div>
            <span className="font-semibold text-slate-400 block mb-0.5 uppercase tracking-wider text-[10px]">Consent Obtained</span>
            <span className={`font-bold ${call.recording_consent ? 'text-emerald-600' : 'text-slate-400'}`}>
              {call.recording_consent ? 'Explicitly Granted' : 'Unrecorded / No'}
            </span>
          </div>

          <div>
            <span className="font-semibold text-slate-400 block mb-0.5 uppercase tracking-wider text-[10px]">Audited Status</span>
            {call.original_ai_status && call.original_ai_status !== call.status ? (
              <span className="text-amber-600 font-semibold text-[11px]">
                Overridden (AI was {call.original_ai_status})
              </span>
            ) : (
              <span className="text-slate-500 text-[11px]">Original AI Classification</span>
            )}
          </div>
        </div>

        {/* Status Manual Correction Option */}
        <div>
          {!isEditingStatus ? (
            <button
              onClick={() => setIsEditingStatus(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Change Status</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as SalesStatus)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-800 cursor-pointer"
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
                className="inline-flex items-center gap-1 px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>

              <button
                onClick={() => setIsEditingStatus(false)}
                className="px-2 py-1 text-slate-400 hover:text-slate-600 text-xs"
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
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Audio Playback</h4>
          <AudioPlayer src={call.recording_url} callId={call.id} />
        </div>
      )}

      {/* Main Grid: AI Summary & Deal Intelligence vs Full Transcript */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: AI Executive Summary & Deal Signals */}
        <div className="lg:col-span-5 space-y-6">
          {/* Executive Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>AI Executive Summary</span>
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
              {call.summary || 'Summary not yet generated.'}
            </p>
          </div>

          {/* Customer Requirements & Objections */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h5 className="font-bold text-slate-900 text-xs flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Customer Requirements</span>
              </h5>
              {customerRequirements.length === 0 ? (
                <div className="text-xs text-slate-400 italic">No specific requirements stated</div>
              ) : (
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {customerRequirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h5 className="font-bold text-slate-900 text-xs flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Customer Objections</span>
              </h5>
              {objections.length === 0 ? (
                <div className="text-xs text-slate-400 italic">No objections raised during call</div>
              ) : (
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {objections.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 bg-rose-50/50 p-2 rounded-lg border border-rose-100/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"></span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Agreed Next Steps & Buying Signals */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h5 className="font-bold text-slate-900 text-xs flex items-center gap-2 mb-2">
                <ListChecks className="w-4 h-4 text-brand-600" />
                <span>Agreed Next Steps</span>
              </h5>
              {nextSteps.length === 0 ? (
                <div className="text-xs text-slate-400 italic">No next steps logged</div>
              ) : (
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {nextSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 bg-brand-50/50 p-2 rounded-lg border border-brand-100/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0"></span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {buyingSignals.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <h5 className="font-bold text-slate-900 text-xs flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span>Buying Signals</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {buyingSignals.map((sig, i) => (
                    <li key={i} className="flex items-start gap-2 bg-purple-50/50 p-2 rounded-lg border border-purple-100/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></span>
                      <span>{sig}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right 7 Cols: Complete Conversation Transcript */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm">Complete Conversation Transcript</h4>
            <span className="text-xs text-slate-500">{call.messages?.length || 0} turns</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {(!call.messages || call.messages.length === 0) ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
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
                          ? 'bg-gradient-to-tr from-brand-600 to-accent-600 text-white'
                          : 'bg-slate-800 text-white'
                      }`}
                    >
                      {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    <div className={`max-w-[80%] ${isAi ? 'text-left' : 'text-right'}`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-xs font-semibold text-slate-700">
                          {isAi ? 'VoxSell AI Sales Agent' : 'Customer'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatTime(m.timestamp)}
                        </span>
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                          isAi
                            ? 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-sm'
                            : 'bg-brand-600 text-white rounded-tr-sm'
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
