# VoxSell AI – Intelligent Voice Sales Agent & CRM Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%20%7C%20TypeScript-61DAFB.svg?logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

VoxSell AI is an autonomous, AI-powered voice sales agent and modern CRM dashboard. It engages prospects in real-time, two-way conversational voice calls, explains verified SaaS product capabilities, asks structured discovery questions, addresses customer objections, schedules live product demonstrations, and automatically generates deal summaries with sales status classifications.

---

## Key Features

1. **Autonomous Live Voice Sales Calls:**
   - Real-time Speech-to-Text (STT) and neural Text-to-Speech (TTS).
   - High-fidelity Microsoft neural voices via **Edge-TTS** (free and zero-subscription) or **OpenAI TTS**.
   - Zero-latency browser Web Speech fallback.
   - Built-in interruption handling, mute/unmute toggling, live call duration tracking, and dynamic visual sound wave animations.

2. **Sales Reasoning Engine & Verified Knowledge Base:**
   - Uses strict system prompts and verified product parameters as the sole source of truth.
   - Zero hallucination of pricing or features.
   - Built-in multi-stage Sales Dialogue Engine (Greeting → Discovery → Feature Presentation → Objection Handling → Pricing → Demo Booking).
   - Optional external LLM support for **OpenAI** (`gpt-4o-mini`), **Groq** (`llama-3.3-70b-versatile`), and **Google Gemini** (`gemini-1.5-flash`).

3. **Consent-Based Persistent Audio Recording:**
   - Enforces explicit recording consent prior to call launch.
   - Saves real dual-channel audio directly to server storage.
   - Custom in-browser audio player with scrubbing, duration formatting, and download options.

4. **Automated AI Conversation Summaries & Deal Intelligence:**
   - Generates structured executive summaries directly upon call conclusion.
   - Identifies customer requirements, objections, buying signals, and agreed next steps.

5. **Automatic Sales Status Classification:**
   - Strict hierarchical classification: `Converted`, `Demo Requested`, `Interested`, `Follow-up Required`, `Not Interested`, `No Response`.
   - Supports manual overrides while preserving the original AI-generated status for audit logging.

6. **Executive CRM Dashboard & Pipeline Analytics:**
   - Real-time KPIs calculated from actual database records: Total Calls, Converted Leads, Interested Leads, Demos Requested, Follow-ups Required, and Conversion Rate.
   - Interactive Recharts funnel and pipeline velocity charts.
   - Searchable, filterable call history with pagination.

7. **Purple & White Design System:**
   - **Primary Purple:** `#6C3BDB`
   - **Dark Purple:** `#4C1D95`
   - **Light Purple:** `#F3EEFF`
   - **Soft Lavender:** `#E9DFFF`
   - **Main Background:** `#FAF9FF`
   - **Primary Text:** `#211A33`
   - **Secondary Text:** `#77718A`
   - **Borders:** `#E8E2F0`
   - Clean white cards, subtle shadows, and light lavender AI highlights.
   - Fully responsive layout with collapsible mobile drawer.

---

## Architecture Overview

```
VoiceSell AI/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, middleware, lifecycle & routing
│   │   ├── config.py            # Pydantic configuration and storage paths
│   │   ├── database.py          # SQLAlchemy SQLite connection and session
│   │   ├── models.py            # Call, Message, ProductConfig, SystemSettings models
│   │   ├── schemas.py           # Pydantic validation schemas
│   │   ├── services/
│   │   │   ├── sales_agent.py   # Multi-provider sales dialogue & prompt builder
│   │   │   ├── summary_agent.py # Transcript analysis & sales status classifier
│   │   │   ├── tts_service.py   # Edge-TTS & OpenAI speech synthesis
│   │   │   └── product_service.py # Singleton database initializers
│   │   ├── routers/
│   │   │   ├── health.py        # Health check endpoint
│   │   │   ├── dashboard.py     # Live CRM metrics and distribution
│   │   │   ├── calls.py         # Call lifecycle, audio upload, transcripts
│   │   │   ├── product.py       # Product knowledge base GET/PUT
│   │   │   ├── settings.py      # Voice parameters & AI provider settings
│   │   │   └── websocket.py     # Bidirectional real-time audio/text socket
│   │   └── recordings/          # Persistent audio storage (.webm/.wav)
│   ├── tests/
│   │   └── test_backend.py      # Automated pytest suite
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/client.ts        # Typed API client
│   │   ├── hooks/useVoiceCall.ts # Voice call coordinator (STT, TTS, Recorder)
│   │   ├── components/          # Reusable UI cards, tables, charts, and players
│   │   ├── pages/               # Overview, LiveCall, History, Detail, Product, Settings
│   │   ├── App.tsx              # Main application shell
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```

---

## Quickstart & Installation

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** & **npm**

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# (Optional) Copy environment variables
cp .env.example .env

# Run automated backend tests
pytest tests -v

# Start FastAPI server on port 8000
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend API documentation will be accessible at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server on port 5173
npm run dev
```

Open `http://127.0.0.1:5173` in your browser.

---

## Configuration & Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PROJECT_NAME` | Name of the application | `"VoxSell AI"` |
| `DATABASE_URL` | SQLAlchemy database connection string | `sqlite:///./voxsell.db` |
| `RECORDINGS_PATH` | Path where audio files are stored | `./recordings` |
| `OPENAI_API_KEY` | Optional OpenAI API key for GPT-4o-mini & TTS | `""` |
| `GROQ_API_KEY` | Optional Groq key for Llama-3.3-70b inference | `""` |
| `GEMINI_API_KEY` | Optional Google Gemini key | `""` |
| `TTS_PROVIDER` | Default TTS synthesis engine | `"edge-tts"` |
| `TTS_VOICE` | Default Microsoft neural voice | `"en-US-AriaNeural"` |

> **Note:** VoxSell AI operates completely out of the box with zero external API keys required by utilizing its built-in Sales Dialogue Engine and Edge-TTS neural speech synthesis!

---

## Automated Testing

Execute the comprehensive test suite to verify:
- Health check endpoints
- Empty state and dynamic CRM analytics calculation
- Product configuration updates
- Call session creation with consent validation
- Live customer dialogue and AI response generation
- Call conclusion, AI executive summary generation, and automatic status classification
- Dual-channel recording upload and streaming
- Manual status auditing

```bash
cd backend
python -m pytest tests -v
```

---

## Deployment Guidelines

### Backend Deployment (e.g., Render, Railway, AWS ECS, Fly.io)
1. Set up a persistent volume mounted at `/app/backend/recordings` to retain uploaded audio calls across deployments.
2. If using PostgreSQL in production, supply `DATABASE_URL=postgresql://user:pass@host:5432/voxsell` in environment variables.
3. Start the application with:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

### Frontend Deployment (e.g., Vercel, Netlify, Cloudflare Pages)
1. Build the production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. The output in `frontend/dist` can be served with any static web host or Nginx.
3. Configure `VITE_API_URL` or reverse proxy `/api` to the backend service.

---

## License

This project is licensed under the MIT License.
