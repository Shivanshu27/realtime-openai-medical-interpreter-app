<div align="center">

# Real-Time Medical Interpreter

**Sub-second, full-duplex speech-to-speech medical interpretation between English-speaking healthcare providers and Spanish-speaking patients.**

Built on OpenAI's Realtime API (WebRTC + PCM16 24kHz), featuring deterministic repetition handling, automated clinical entity extraction, and a zero-credential interactive simulation engine.

[![CI](https://github.com/Shivanshu27/realtime-openai-medical-interpreter-app/actions/workflows/ci.yml/badge.svg)](https://github.com/Shivanshu27/realtime-openai-medical-interpreter-app/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node: 20+](https://img.shields.io/badge/node-20%2B-green.svg)](https://nodejs.org/)
[![WebRTC Duplex](https://img.shields.io/badge/WebRTC-Sub--500ms-orange.svg)](docs/ARCHITECTURE.md)
[![Security: ephemeral tokens + access token](https://img.shields.io/badge/Security-Ephemeral%20Tokens%20%2B%20Access%20Token-blueviolet.svg)](docs/adr/0002-ephemeral-session-credentials-security.md)

</div>

---

## The Problem

Over **25 million individuals** in the United States have Limited English Proficiency (LEP). In emergency departments and acute care:

- **Human interpreter dispatch takes 15–45 minutes.** Triage, critical symptom elicitation, and stat medication orders cannot wait.
- **Consumer translation apps fail at clinical cadence.** Sequential turn-taking with 3-second network delays breaks clinical rapport, causes speech collisions, and frustrates patients in distress.
- **Critical directives are lost.** Instructions such as "take twice daily after food" or "report to radiology for a CT scan" vanish into unstructured conversation without structured clinical synthesis.
- **Data privacy risks.** Sending audio through unvetted cloud APIs without ephemeral scoping creates serious HIPAA and PHI compliance liabilities.

**This application bridges the gap:** A low-latency, full-duplex WebRTC interpretation system that translates speech bidirectionally in real-time, deterministically handles patient requests for repetition, extracts clinical action items (follow-ups, lab orders), and provides an instant offline simulation engine for evaluation.

---

## What It Does

```
  Physician Speech (English)              Patient Speech (Spanish)
            │                                        │
            ▼                                        ▼
    Microphone Stream (PCM16 24kHz)        Microphone Stream (PCM16 24kHz)
            │                                        │
            └───────────────┬────────────────────────┘
                            │ WebRTC PeerConnection
                            ▼
           OpenAI Realtime API (gpt-4o-realtime)
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
     Spanish Audio Output        English Audio Output
    (Patient hears in <500ms)   (Doctor hears in <500ms)
              │                           │
              └─────────────┬─────────────┘
                            │ Real-time Event Stream
                            ▼
             Deterministic Clarification Protocol
             (Catches "repeat that" → replays directive)
                            │
                            ▼
             Clinical Entity & Summary Extraction
             (Detects follow-up appointments, lab orders, meds)
```

---

## Key Architecture & Engineering Decisions

1. **Direct WebRTC over Proxied WebSockets:** Audio streams directly between the browser and OpenAI's edge gateway over encrypted RTP/UDP. The backend server is strictly a credential broker, so there is no proxy hop in the audio path. (The latency target is sub-500 ms end of speech to first translated audio; it is not yet instrumented or measured.) ([ADR-0001](docs/adr/0001-webrtc-over-websockets-for-realtime-audio.md))
2. **Ephemeral Session Tokens:** Master API keys never leave the backend environment. The client requests single-use, 60-second scoped ephemeral tokens just-in-time for SDP negotiation. ([ADR-0002](docs/adr/0002-ephemeral-session-credentials-security.md))
3. **Resilient Backend with In-Memory Fallback:** The backend dynamically probes for MongoDB. If unavailable, it transparently switches to an in-memory repository—ensuring the application never crashes on startup for reviewers or developers. ([ADR-0003](docs/adr/0003-dual-mode-resilient-backend-with-memory-fallback.md))
4. **Zero-Credit Clinical Simulation Engine:** Evaluators on GitHub can test the entire workflow—bidirectional translation, synthetic audio playback, repetition triggers, and clinical summary generation—with **zero API keys and zero paid credits**. ([ADR-0004](docs/adr/0004-offline-first-simulation-engine-for-portfolio-review.md))
5. **Deterministic Repetition & Anti-Hallucination:** Clarification requests ("Repeat that please" / "¿Puede repetir?") are intercepted client-side to replay the exact prior physician directive without round-tripping through an LLM. ([ADR-0006](docs/adr/0006-repetition-and-clarification-protocol.md))
6. **Automated Clinical Action Extraction:** Rule-based multi-lingual parser identifies follow-up visits, laboratory tests, and imaging orders from transcripts for instant EMR-ready markdown export. ([ADR-0005](docs/adr/0005-rule-based-clinical-intent-and-entity-extraction.md))

---

## Quickstart

### Option A: Interactive Simulation (Zero Credentials / Free)

Experience the full interactive clinical workflow without needing an OpenAI key or local MongoDB:

```bash
# 1. Clone the repository
git clone https://github.com/Shivanshu27/realtime-openai-medical-interpreter-app.git
cd realtime-openai-medical-interpreter-app

# 2. Install dependencies
npm run install-all

# 3. Start in Simulation Mode
npm start
```

Open `http://localhost:3000` in your browser. The app runs in **Simulation Mode**:
- Click **"Simulate Consultation"** or select a clinical case (e.g. *Acute Abdominal Pain Intake* or *Cardiology Follow-Up*).
- Click **Start Recording** to test voice input or simulate turns.
- Click **End Conversation & Generate Summary** to view extracted clinical action items, repetition statistics, and exportable Markdown notes.

---

### Option B: Docker Compose (One Command)

```bash
# Build and run client, server, and MongoDB
docker compose up --build
```

Access the application at `http://localhost:3000`. Backend health and readiness can be verified at `http://localhost:5000/health`.

---

### Option C: Production Mode (With OpenAI Realtime API)

To enable live neural WebRTC streaming with OpenAI:

1. Configure `.env` in the project root:
   ```bash
   cp .env.example .env
   ```
2. Set your OpenAI API key, disable mock mode, and set an access token:
   ```env
   OPENAI_API_KEY=sk-proj-...
   MOCK_MODE=false
   APP_ACCESS_TOKEN=<a long random string>   # required in live mode; the server refuses to start without it
   CORS_ORIGINS=http://localhost:3000        # browser origins allowed to call the API
   ```
   The browser asks for the access code the first time a protected call returns `401`, and keeps it for the tab's lifetime (sessionStorage).
3. Start the application:
   ```bash
   npm start
   ```

---

## System Design & Documentation

Detailed architecture specifications and engineering artifacts are available in [`docs/`](docs/):

- [Product Requirements Document (PRD)](docs/PRD.md)
- [System Architecture & Data Flow](docs/ARCHITECTURE.md)
- [Architecture Decision Records (ADRs)](docs/adr/README.md)
- [System Topology Diagram](docs/diagrams/system-architecture.md)
- [WebRTC Handshake Sequence](docs/diagrams/webrtc-handshake.md)
- [Audio Pipeline Diagram](docs/diagrams/audio-pipeline.md)

---

## API Reference

| Endpoint | Method | Auth | Rate limit | Description |
|---|---|---|---|---|
| `/health` | `GET` | public | — | System health, uptime, database mode, and active operational tier |
| `/api/session/ephemeral-key` | `POST` | access token | 10/min per client | Negotiates 60-second ephemeral session token for WebRTC client |
| `/api/translate` | `POST` | access token | 60/min per client | Fallback text translation endpoint (GPT-4o or Mock engine) |
| `/api/conversations` | `POST` | access token | 60/min per client | Persists consultation transcript and metadata |
| `/api/conversations` | `GET` | access token | 60/min per client | Lists recent consultation sessions |

"Access token" means `Authorization: Bearer <APP_ACCESS_TOKEN>` whenever that variable is set. It is required in live mode; simulation mode can run without it so reviewers need no setup.

*Legacy routes (`/generate-ephemeral-key`, `/translate`, `/conversations`) remain supported for backward compatibility and carry the same auth and rate limits.*

---

## Security Posture

- **No Server-Side Audio Retention:** Binary audio media is transmitted directly via WebRTC peer connection to OpenAI's gateway. No voice recordings touch backend disks or application logs.
- **Ephemeral Credentials:** The OpenAI API key never leaves the server. Browsers receive session-scoped tokens that expire after about 60 seconds.
- **Access Token on Every Sensitive Route:** Minting sessions, translating, and reading or writing transcripts require `APP_ACCESS_TOKEN` (constant-time comparison). Live mode refuses to start without one. `/health` stays public.
- **CORS Allow-List:** Only origins in `CORS_ORIGINS` (plus same-origin) get a CORS grant; any other browser origin cannot read responses.
- **Rate Limiting:** Per-client fixed windows (10/min for session minting, 60/min for other routes) with `429` and `Retry-After`. Limits apply before authentication, so guessing the access token is throttled too. In-memory and per-process: a multi-instance deployment would need a shared store.
- **In-Memory & Ephemeral Persistence:** Consultation storage can run entirely in-memory without persistent database storage.

**Not HIPAA-compliant as-is.** The access token is a shared code, not per-user identity. Handling real patient data would additionally require per-user authentication (e.g. hospital SSO), a Business Associate Agreement with the model provider, audit logging, and encryption at rest for stored transcripts.

---

## Development & Testing

```bash
# Run backend unit and integration test suite
npm --prefix server test

# Run frontend test suite
npm --prefix client test -- --watchAll=false

# Run all test suites across the monorepo
npm test
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
