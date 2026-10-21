import React, { useState, useEffect } from 'react';
import type { ProductConfig } from '../types';
import { api } from '../api/client';
import { Save, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const ProductConfigPage: React.FC = () => {
  const [config, setConfig] = useState<ProductConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getProductConfig()
      .then(setConfig)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    try {
      setSaving(true);
      setError(null);
      setSaveSuccess(false);
      const updated = await api.updateProductConfig(config);
      setConfig(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-[#77718A] text-sm font-semibold">
          <RefreshCw className="w-5 h-5 animate-spin text-[#6C3BDB]" />
          <span>Loading Product Knowledge Base...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#211A33] tracking-tight">Product Knowledge Base</h2>
          <p className="text-xs text-[#77718A]">
            The AI sales agent strictly references these verified facts when speaking with prospects.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6C3BDB] hover:bg-[#5B2EC4] disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-md shadow-[#6C3BDB]/20 active:scale-95"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-[#16A34A] text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
          <span>Product configuration successfully saved! Live voice calls will now reference these updated details.</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-[#DC2626] text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Product Info */}
        <div className="bg-white rounded-2xl border border-[#E8E2F0] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-[#211A33] text-base border-b border-[#E8E2F0] pb-3">
            Core Product Identity
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#211A33] mb-1">Product Name</label>
              <input
                type="text"
                value={config.product_name}
                onChange={(e) => setConfig({ ...config, product_name: e.target.value })}
                className="w-full bg-[#FAF9FF] border border-[#E8E2F0] rounded-xl px-4 py-2 text-sm text-[#211A33] focus:outline-none focus:border-[#6C3BDB] focus:ring-2 focus:ring-[#6C3BDB]/15 transition font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#211A33] mb-1">Tagline</label>
              <input
                type="text"
                value={config.tagline}
                onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                className="w-full bg-[#FAF9FF] border border-[#E8E2F0] rounded-xl px-4 py-2 text-sm text-[#211A33] focus:outline-none focus:border-[#6C3BDB] focus:ring-2 focus:ring-[#6C3BDB]/15 transition font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#211A33] mb-1">Product Description</label>
            <textarea
              rows={3}
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              className="w-full bg-[#FAF9FF] border border-[#E8E2F0] rounded-xl px-4 py-2 text-sm text-[#211A33] focus:outline-none focus:border-[#6C3BDB] focus:ring-2 focus:ring-[#6C3BDB]/15 transition font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#211A33] mb-1">Target Audience & Buyer Persona</label>
            <textarea
              rows={2}
              value={config.target_audience}
              onChange={(e) => setConfig({ ...config, target_audience: e.target.value })}
              className="w-full bg-[#FAF9FF] border border-[#E8E2F0] rounded-xl px-4 py-2 text-sm text-[#211A33] focus:outline-none focus:border-[#6C3BDB] focus:ring-2 focus:ring-[#6C3BDB]/15 transition font-medium"
              required
            />
          </div>
        </div>

        {/* Pricing Plans & Features */}
        <div className="bg-white rounded-2xl border border-[#E8E2F0] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-[#211A33] text-base border-b border-[#E8E2F0] pb-3">
            Pricing Plans & Verified Features (JSON Format)
          </h3>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#211A33]">Pricing Information</label>
              <span className="text-[11px] text-[#77718A]">JSON Array of Tiers</span>
            </div>
            <textarea
              rows={5}
              value={config.pricing_information}
              onChange={(e) => setConfig({ ...config, pricing_information: e.target.value })}
              className="w-full bg-[#FAF9FF] border border-[#E8E2F0] rounded-xl px-4 py-2 font-mono text-xs text-[#211A33] focus:outline-none focus:border-[#6C3BDB] focus:ring-2 focus:ring-[#6C3BDB]/15 transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#211A33]">Key Features</label>
              <span className="text-[11px] text-[#77718A]">JSON Array of Feature Objects</span>
            </div>
            <textarea
              rows={5}
              value={config.features}
              onChange={(e) => setConfig({ ...config, features: e.target.value })}
              className="w-full bg-[#FAF9FF] border border-[#E8E2F0] rounded-xl px-4 py-2 font-mono text-xs text-[#211A33] focus:outline-none focus:border-[#6C3BDB] focus:ring-2 focus:ring-[#6C3BDB]/15 transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#211A33]">Benefits & Outcomes</label>
              <span className="text-[11px] text-[#77718A]">JSON Array of bullet strings</span>
            </div>
            <textarea
              rows={4}
              value={config.benefits}
              onChange={(e) => setConfig({ ...config, benefits: e.target.value })}
              className="w-full bg-[#FAF9FF] border border-[#E8E2F0] rounded-xl px-4 py-2 font-mono text-xs text-[#211A33] focus:outline-none focus:border-[#6C3BDB] focus:ring-2 focus:ring-[#6C3BDB]/15 transition"
            />
          </div>
        </div>

        {/* FAQs, Demo Instructions & Contact */}
        <div className="bg-white rounded-2xl border border-[#E8E2F0] p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-[#211A33] text-base border-b border-[#E8E2F0] pb-3">
            Objection Handling FAQs & Demo Next Steps
          </h3>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#211A33]">Frequently Asked Questions (FAQs)</label>
              <span className="text-[11px] text-[#77718A]">JSON Array of Q&A objects</span>
            </div>
            <textarea
              rows={5}
              value={config.faqs}
              onChange={(e) => setConfig({ ...config, faqs: e.target.value })}
              className="w-full bg-[#FAF9FF] border border-[#E8E2F0] rounded-xl px-4 py-2 font-mono text-xs text-[#211A33] focus:outline-none focus:border-[#6C3BDB] focus:ring-2 focus:ring-[#6C3BDB]/15 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#211A33] mb-1">Demo Booking Instructions</label>
              <textarea
                rows={3}
                value={config.demo_instructions}
                onChange={(e) => setConfig({ ...config, demo_instructions: e.target.value })}
                className="w-full bg-[#FAF9FF] border border-[#E8E2F0] rounded-xl px-4 py-2 text-xs text-[#211A33] focus:outline-none focus:border-[#6C3BDB] focus:ring-2 focus:ring-[#6C3BDB]/15 transition font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#211A33] mb-1">Contact Information</label>
              <textarea
                rows={3}
                value={config.contact_information}
                onChange={(e) => setConfig({ ...config, contact_information: e.target.value })}
                className="w-full bg-[#FAF9FF] border border-[#E8E2F0] rounded-xl px-4 py-2 text-xs text-[#211A33] focus:outline-none focus:border-[#6C3BDB] focus:ring-2 focus:ring-[#6C3BDB]/15 transition font-medium"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#6C3BDB] hover:bg-[#5B2EC4] disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-md shadow-[#6C3BDB]/20 active:scale-95"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save All Product Details</span>
          </button>
        </div>
      </form>
    </div>
  );
};
