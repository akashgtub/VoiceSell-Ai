export type SalesStatus = 
  | 'Converted'
  | 'Interested'
  | 'Follow-up Required'
  | 'Not Interested'
  | 'Demo Requested'
  | 'No Response'
  | 'In Progress';

export interface Message {
  id: string;
  call_id: string;
  speaker: 'customer' | 'ai' | 'system';
  content: string;
  timestamp: string;
}

export interface Call {
  id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  status: SalesStatus;
  original_ai_status: SalesStatus | null;
  recording_path: string | null;
  recording_url: string | null;
  recording_consent: boolean;
  summary: string | null;
  customer_requirements: string | null;
  objections: string | null;
  next_steps: string | null;
  key_features_discussed: string | null;
  buying_signals: string | null;
  notes: string | null;
  created_at: string;
  message_count?: number;
  messages?: Message[];
  initial_audio_base64?: string | null;
}

export interface ProductConfig {
  id: number;
  product_name: string;
  tagline: string;
  description: string;
  target_audience: string;
  features: string;
  benefits: string;
  pricing_information: string;
  faqs: string;
  demo_instructions: string;
  contact_information: string;
  updated_at: string;
}

export interface SystemSettings {
  id: number;
  ai_provider: 'local' | 'openai' | 'groq' | 'gemini';
  ai_model: string;
  tts_provider: 'edge-tts' | 'browser' | 'openai';
  tts_voice: string;
  tts_rate: number;
  tts_pitch: number;
  stt_provider: 'browser' | 'whisper';
  auto_record: boolean;
  require_consent: boolean;
  has_openai_key: boolean;
  has_groq_key: boolean;
  has_gemini_key: boolean;
  updated_at: string;
}

export interface StatusDistribution {
  status: string;
  count: number;
  color: string;
}

export interface ActivityDataPoint {
  date: string;
  calls: number;
  demos: number;
  converted: number;
}

export interface DashboardStats {
  total_calls: number;
  converted_leads: number;
  interested_leads: number;
  demos_requested: number;
  follow_ups_required: number;
  conversion_rate: number;
  status_distribution: StatusDistribution[];
  activity_over_time: ActivityDataPoint[];
  recent_calls: Call[];
}

export type NavTab = 
  | 'overview' 
  | 'live-call' 
  | 'history' 
  | 'analytics' 
  | 'product' 
  | 'settings';
