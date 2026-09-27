# Developer Reference & Operational Guide

Quick reference for commands, project layout, environment flags, and operational debugging.

---

## 1. Project Directory Layout

```
realtime-openai-medical-interpreter-app/
├── client/                     # React 18 frontend SPA
│   ├── public/                 # Static assets & HTML template
│   └── src/
│       ├── components/         # Clinical UI components & AudioRecorder
│       ├── redux/              # Redux Toolkit slices (user, messages, summary)
│       ├── services/           # WebRTC signaling, speech synthesis & scenarios
│       └── utils/              # Clinical regex analyzer (labs, follow-ups, meds)
├── server/                     # Node.js 20 Express backend
│   └── src/
│       ├── config/             # Environment validation & fallback defaults
│       ├── controllers/        # HTTP handlers (health, session, translation, conversations)
│       ├── services/           # OpenAI Realtime broker & conversation services
│       ├── repositories/       # MongoDB driver & resilient In-Memory store
│       ├── middleware/         # Structured logger, RFC-7807 error handler
│       └── routes/             # RESTful API v1 & legacy backward-compatible routes
├── docs/                       # Architecture diagrams, PRD, and ADRs
└── .github/                    # CI workflows, PR templates, and issue templates
```

---

## 2. Common Commands

| Command | Action |
|---|---|
| `npm start` | Boots both frontend (`:3000`) and backend (`:5000`) concurrently |
| `npm run server` | Starts only the Node backend |
| `npm run client` | Starts only the React frontend |
| `npm test` | Runs all unit and integration test suites |
| `npm --prefix server test` | Runs Jest & Supertest API tests for backend |
| `npm --prefix client test` | Runs React test runner |
| `docker compose up --build` | Builds multi-stage Docker images and starts app + MongoDB |

---

## 3. Environment Variables Reference

| Variable | Scope | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | Server | `undefined` | Master OpenAI key. If omitted, server defaults to Mock Mode |
| `MOCK_MODE` | Server | `true` (if no key) | Toggles simulation mode vs live OpenAI Realtime API calls |
| `PORT` | Server | `5000` | HTTP port for Express backend |
| `MONGODB_URI` | Server | `mongodb://localhost:27017/medical-interpreter` | Connection string. If unreachable, auto-falls back to in-memory store |
| `REACT_APP_API_URL` | Client | `http://localhost:5000` | Backend API base URL |
| `REACT_APP_MOCK_MODE` | Client | `true` (if unset) | Client-side simulation mode flag |

---

## 4. Debugging & Observability

- **Backend Health Check:** Verify server state by curling `http://localhost:5000/health`:
  ```json
  {
    "status": "healthy",
    "uptime": 12.45,
    "mode": "simulation",
    "storage": "in-memory-fallback",
    "timestamp": "2026-09-27T06:25:00.000Z"
  }
  ```
- **WebRTC Data Channel Tracing:** In browser DevTools, filter console logs for `oai-events` to inspect SDP negotiation packets and session update configurations.
