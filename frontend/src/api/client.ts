import { Call, DashboardStats, ProductConfig, SystemSettings } from '../types';

const BASE_URL = '/api';

export const api = {
  // Health
  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${BASE_URL}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  // Calls
  async startCall(recordingConsent: boolean): Promise<Call> {
    const res = await fetch(`${BASE_URL}/calls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recording_consent: recordingConsent }),
    });
    if (!res.ok) throw new Error('Failed to initiate live call');
    return res.json();
  },

  async listCalls(params?: {
    status?: string;
    search?: string;
    min_duration?: number;
    page?: number;
    page_size?: number;
  }): Promise<{ items: Call[]; total: number; page: number; page_size: number; total_pages: number }> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'All') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.min_duration) query.set('min_duration', params.min_duration.toString());
    if (params?.page) query.set('page', params.page.toString());
    if (params?.page_size) query.set('page_size', params.page_size.toString());

    const res = await fetch(`${BASE_URL}/calls?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to list calls');
    return res.json();
  },

  async getCall(callId: string): Promise<Call> {
    const res = await fetch(`${BASE_URL}/calls/${callId}`);
    if (!res.ok) throw new Error('Failed to fetch call details');
    return res.json();
  },

  async sendCustomerMessage(callId: string, content: string): Promise<{ reply_text: string; audio_base64: string | null }> {
    const res = await fetch(`${BASE_URL}/calls/${callId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speaker: 'customer', content }),
    });
    if (!res.ok) throw new Error('Failed to send customer speech');
    return res.json();
  },

  async endCall(callId: string, durationSeconds: number): Promise<Call> {
    const res = await fetch(`${BASE_URL}/calls/${callId}/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration_seconds: durationSeconds }),
    });
    if (!res.ok) throw new Error('Failed to end call');
    return res.json();
  },

  async uploadRecording(callId: string, audioBlob: Blob, filename = 'recording.webm') {
    const formData = new FormData();
    formData.append('file', audioBlob, filename);
    const res = await fetch(`${BASE_URL}/calls/${callId}/recording`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to persist audio recording');
    return res.json();
  },

  getRecordingUrl(callId: string): string {
    return `${BASE_URL}/calls/${callId}/recording`;
  },

  async updateCallStatus(callId: string, status: string, notes?: string): Promise<{ success: boolean; status: string; original_ai_status: string; notes: string }> {
    const res = await fetch(`${BASE_URL}/calls/${callId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    if (!res.ok) throw new Error('Failed to update call status');
    return res.json();
  },

  // Product
  async getProductConfig(): Promise<ProductConfig> {
    const res = await fetch(`${BASE_URL}/product`);
    if (!res.ok) throw new Error('Failed to fetch product configuration');
    return res.json();
  },

  async updateProductConfig(config: Partial<ProductConfig>): Promise<ProductConfig> {
    const res = await fetch(`${BASE_URL}/product`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Failed to update product configuration');
    return res.json();
  },

  // Settings
  async getSettings(): Promise<SystemSettings> {
    const res = await fetch(`${BASE_URL}/settings`);
    if (!res.ok) throw new Error('Failed to fetch system settings');
    return res.json();
  },

  async updateSettings(settings: Partial<SystemSettings> & {
    openai_api_key?: string;
    groq_api_key?: string;
    gemini_api_key?: string;
  }): Promise<SystemSettings> {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update system settings');
    return res.json();
  },
};
