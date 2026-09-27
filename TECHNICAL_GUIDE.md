# Medical Interpreter — Technical Reference Guide

> [!NOTE]
> For the comprehensive architecture specification, sequence diagrams, and ADRs, refer to [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/adr/`](docs/adr/).

---

## 1. System Overview

The Real-Time Medical Interpreter facilitates low-latency, full-duplex speech translation between English-speaking medical providers and Spanish-speaking patients. It combines OpenAI's Realtime API over WebRTC with local speech synthesis fallbacks, deterministic clarification protocols, and automated clinical entity extraction.

---

## 2. Directory Structure

```
realtime-openai-medical-interpreter-app/
├── client/                     # React 18 Frontend SPA
│   ├── public/                 # HTML templates and static assets
│   └── src/
│       ├── components/         # Clinical UI, AudioVisualizer, ScenarioPicker
│       ├── redux/              # Redux Toolkit state slices
│       ├── services/           # WebRTC signaling, speech synthesis & scenarios
│       └── utils/              # Multi-lingual clinical regex analyzer
├── server/                     # Node.js 20 Express Backend
│   ├── index.js                # Server entry point & graceful shutdown
│   └── src/
│       ├── config/             # Validated configuration & defaults
│       ├── controllers/        # HTTP handlers (health, session, translation, conversations)
│       ├── services/           # OpenAI Realtime broker & conversation services
│       ├── repositories/       # MongoDB driver & resilient In-Memory store
│       ├── middleware/         # Structured logger, RFC-7807 error handler
│       └── routes/             # RESTful API v1 & legacy backward-compatible routes
├── docs/                       # Architecture diagrams, PRD, and ADRs
└── .github/                    # CI workflows, PR templates, and issue templates
```

---

## 3. Core Architectural Subsystems

### 3.1 WebRTC Audio Pipeline
- **Signaling:** Client calls `POST /generate-ephemeral-key` (or `/api/session/ephemeral-key`) to fetch a 60-second scoped ephemeral session token.
- **Peer Connection:** Browser establishes direct WebRTC audio media track (`PCM16 24kHz`) with `https://api.openai.com/v1/realtime`.
- **Data Channel:** Receives real-time transcript events (`conversation.item.input_audio_transcription.completed`, `response.audio_transcript.done`).

### 3.2 Deterministic Repetition Protocol
Clarification phrases (e.g. `"repeat that"`, `"say that again"`, `"¿puede repetir?"`) are intercepted client-side to replay the previous physician directive from state, preventing LLM semantic drift or hallucination.

### 3.3 Post-Encounter Clinical Extraction
Evaluates transcripts for:
- Follow-up appointments and scheduling intents
- Laboratory orders (blood draws, urine panels)
- Diagnostic imaging (X-rays, CT scans, MRIs)
- Pharmacotherapy and prescription instructions

---

## 4. Operational Modes

- **Interactive Simulation Mode (Default without API Key):** Zero-credential, offline-capable simulation using the Web Speech API and pre-configured clinical dialogue scenarios.
- **OpenAI Realtime Mode:** Full neural duplex streaming with `gpt-4o-realtime-preview-2024-12-17`.
- **Resilient Persistence:** Automatically defaults to an in-memory repository if MongoDB is offline, guaranteeing non-crashing boot.
