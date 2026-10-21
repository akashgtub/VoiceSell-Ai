import React, { useState, useEffect } from 'react';
import type { SystemSettings } from '../types';
import { api } from '../api/client';
import { Save, CheckCircle2, AlertCircle, RefreshCw, Volume2, ShieldCheck, Sparkles } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Secret keys (only sent if modified)
  const [openaiKey, setOpenaiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');

  useEffect(() => {
    api.getSettings()
      .then(setSettings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      setSaving(true);
      setError(null);
      setSaveSuccess(false);

      const payload: any = {
        ...settings,
      };
      if (openaiKey.trim()) payload.openai_api_key = openaiKey.trim();
      if (groqKey.trim()) payload.groq_api_key = groqKey.trim();
      if (geminiKey.trim()) payload.gemini_api_key = geminiKey.trim();

      const updated = await api.updateSettings(payload);
      setSettings(updated);
      setOpenaiKey('');
      setGroqKey('');
      setGeminiKey('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-[#77718A] text-sm font-semibold">
          <RefreshCw className="w-5 h-5 animate-spin text-[#6C3BDB]" />
          <span>Loading Voice & AI Settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#211A33] tracking-tight">Voice & AI Engine Settings</h2>
          <p className="text-xs text-[#77718A]">
            Tune neural voice synthesis, language model providers, and audio compliance rules.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6C3BDB] hover:bg-[#5B2EC4] disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-md shadow-[#6C3BDB]/20 active:scale-95"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-[#16A34A] text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
          <span>Settings successfully saved and applied to live voice sessions!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-[#DC2626] text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Voice Synthesis Settings */}
        <div className="bg-white rounded-2xl border border-[#E8E2F0] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#6C3BDB] border-b border-[#E8E2F0] pb-3">
            <Volume2 className="w-5 h-5 text-[#6C3BDB]" />
            <h3 className="font-bold text-[#211A33] text-base">Text-to-Speech (TTS) Voice Configuration</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#211A33] mb-1">TTS Voice Provider</label>
              <select
                value={settings.tts_provider}
                onChange={(e) => setSettings({ ...settings, tts_provider: e.target.value as any })}
                className="w-full bg-[#FAF9FF] border border-[#E8E2F0] rounded-xl px-4 py-2 text-sm text-[#211A33] font-semibold focus:outline-none focus:border-[#6C3BDB] focus:ring-2 focus:ring-[#6C3BDB]/15 transition cursor-pointer"
              >
                <option value="edge-tts">Edge-TTS (Free Neural Voices - Recommended)</option>
                <option value="browser">Browser Native SpeechSynthesis (Zero Latency)</option>
                <option value="openai">OpenAI TTS (Requires API Key)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#211A33] mb-1">Voice Character / Persona</label>
              <select
                value={settings.tts_voice}
                onChange={(e) => setSettings({ ...settings, tts_voice: e.target.value })}
                className="w-full bg-[#FAF9FF] border border-[#E8E2F0] rounded-xl px-4 py-2 text-sm text-[#211A33] font-semibold focus:outline-none focus:border-[#6C3BDB] focus:ring-2 focus:ring-[#6C3BDB]/15 transition cursor-pointer"
              >
                <option value="en-US-AriaNeural">Aria Neural (US Professional Female)</option>
                <option value="en-US-GuyNeural">Guy Neural (US Engaging Male)</option>
                <option value="en-US-JennyNeural">Jenny Neural (US Warm Female)</option>
                <option value="en-US-ChristopherNeural">Christopher Neural (US Confident Male)</option>
                <option value="alloy">Alloy (OpenAI Balanced)</option>
                <option value="nova">Nova (OpenAI Energetic)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold text-[#211A33] mb-1">
                <span>Speaking Rate</span>
                <span className="text-[#6C3BDB]">{settings.tts_rate}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.5"
                step="0.05"
                value={settings.tts_rate}
                onChange={(e) => setSettings({ ...settings, tts_rate: parseFloat(e.target.value) })}
                className="w-full accent-[#6C3BDB]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-[#211A33] mb-1">
                <span>Speech Pitch</span>
                <span className="text-[#6C3BDB]">{settings.tts_pitch}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.2"
                step="0.05"
                value={settings.tts_pitch}
                onChange={(e) => setSettings({ ...settings, tts_pitch: parseFloat(e.target.value) })}
                className="w-full accent-[#6C3BDB]"
              />
            </div>
          </div>
        </div>

        {/* AI Sales Reasoning Engine */}
        <div className="bg-white rounded-2xl border border-[#E8E2F0] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#6C3BDB] border-b border-[#E8E2F0] pb-3">
            <Sparkles className="w-5 h-5 text-[#6C3BDB]" />
            <h3 className="font-bold text-[#211A33] text-base">AI Sales Reasoning & LLM Provider</h3>
          </div>

          <div className="p-3.5 bg-[#FAF9FF] border border-[#E8E2F0] rounded-xl text-xs text-[#77718A] leading-relaxed font-medium">
            VoxSell AI comes with an autonomous <strong className="text-[#211A33]">Built-in Sales Dialogue Engine</strong> that works out of the box with zero external API keys. You can also configure an OpenAI, Groq, or Gemini key below for advanced generative models.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#211A33] mb-1">Active AI Provider</label>
              <select
                value={settings.ai_provider}
                onChange={(e) => setSettings({ ...settings, ai_provider: e.target.value as any })}
                className="w-full bg-[#FAF9FF] border border-[#E8E2F0] rounded-xl px-4 py-2 text-sm text-[#211A33] font-semibold focus:outline-none focus:border-[#6C3BDB] focus:ring-2 focus:ring-[#6C3BDB]/15 transition cursor-pointer"
              >
                <option value="local">Built-in Sales Dialogue Engine (Zero Setup & Free)</option>
                <option value="openai">OpenAI (GPT-4o Mini)</option>
                <option value="groq">Groq (Llama-3.3-70b Ultra Fast)</option>
                <option value="gemini">Google Gemini (Gemini 1.5 Flash)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#211A33] mb-1">Model Selection</label>
              <input
                type="text"
                value={settings.ai_model}
                onChange={(e) => setSettings({ ...settings, ai_model: e.target.value })}
                placeholder="auto"
                className="w-full bg-[#FAF9FF] border border-[#E8E2F0] rounded-xl px-4 py-2 text-sm text-[#211A33] focus:outline-none focus:border-[#6C3BDB] focus:ring-2 focus:ring-[#6C3BDB]/15 transition font-medium"
              />
            </div>
          </div>

          {/* API Key Inputs */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#211A33]">OpenAI API Key</label>
                {settings.has_openai_key && (
                  <span className="text-[11px] font-bold text-[#16A34A] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span> Key Configured
                  </span>
                )}
              </div>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder={settings.has_openai_key ? '••••••••••••••••••••••••' : 'sk-...'}
                className="w-full bg-[#FAF9FF] border border-[#E8E2F0] rounded-xl px-4 py-2 text-xs font-mono text-[#211A33] focus:outline-none focus:border-[#6C3BDB] focus:ring-2 focus:ring-[#6C3BDB]/15 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#211A33]">Groq API Key</label>
                {settings.has_groq_key && (
                  <span className="text-[11px] font-bold text-[#16A34A] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span> Key Configured
                  </span>
                )}
              </div>
              <input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder={settings.has_groq_key ? '••••••••••••••••••••••••' : 'gsk_...'}
                className="w-full bg-[#FAF9FF] border border-[#E8E2F0] rounded-xl px-4 py-2 text-xs font-mono text-[#211A33] focus:outline-none focus:border-[#6C3BDB] focus:ring-2 focus:ring-[#6C3BDB]/15 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#211A33]">Google Gemini API Key</label>
                {settings.has_gemini_key && (
                  <span className="text-[11px] font-bold text-[#16A34A] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span> Key Configured
                  </span>
                )}
              </div>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder={settings.has_gemini_key ? '••••••••••••••••••••••••' : 'AIzaSy...'}
                className="w-full bg-[#FAF9FF] border border-[#E8E2F0] rounded-xl px-4 py-2 text-xs font-mono text-[#211A33] focus:outline-none focus:border-[#6C3BDB] focus:ring-2 focus:ring-[#6C3BDB]/15 transition"
              />
            </div>
          </div>
        </div>

        {/* Compliance & Audio Recording Settings */}
        <div className="bg-white rounded-2xl border border-[#E8E2F0] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#16A34A] border-b border-[#E8E2F0] pb-3">
            <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
            <h3 className="font-bold text-[#211A33] text-base">Audio Recording & Compliance</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF9FF] border border-[#E8E2F0] cursor-pointer hover:bg-[#F3EEFF] transition">
              <div>
                <div className="text-xs font-bold text-[#211A33]">Require Explicit Recording Consent</div>
                <div className="text-[11px] text-[#77718A]">Prompts user before every call to confirm recording consent</div>
              </div>
              <input
                type="checkbox"
                checked={settings.require_consent}
                onChange={(e) => setSettings({ ...settings, require_consent: e.target.checked })}
                className="w-4 h-4 rounded text-[#6C3BDB] focus:ring-[#6C3BDB]"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF9FF] border border-[#E8E2F0] cursor-pointer hover:bg-[#F3EEFF] transition">
              <div>
                <div className="text-xs font-bold text-[#211A33]">Automatic Call Archiving</div>
                <div className="text-[11px] text-[#77718A]">Saves complete audio files to server storage when call concludes</div>
              </div>
              <input
                type="checkbox"
                checked={settings.auto_record}
                onChange={(e) => setSettings({ ...settings, auto_record: e.target.checked })}
                className="w-4 h-4 rounded text-[#6C3BDB] focus:ring-[#6C3BDB]"
              />
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};
