# Contributing to Real-Time Medical Interpreter

Thank you for your interest in contributing. This document provides engineering guidelines, architectural invariants, and code conventions to maintain high clinical and engineering standards.

---

## 1. Architectural Invariants

Before making code changes, ensure your design honors these core principles:

1. **Client Never Holds Master API Keys:** Long-lived `OPENAI_API_KEY` credentials must never be passed to or bundled within the client build. All WebRTC sessions must authenticate via ephemeral keys issued by the server ([ADR-0002](docs/adr/0002-ephemeral-session-credentials-security.md)).
2. **Never Crash on Missing Infrastructure:** The backend must always degrade gracefully. If MongoDB is absent, it must fallback to the in-memory repository with an informative log ([ADR-0003](docs/adr/0003-dual-mode-resilient-backend-with-memory-fallback.md)).
3. **Pure Translator Constraint:** The system prompt for real-time interpretation sessions must strictly forbid the model from diagnosing, advising, or conversing. It must act solely as an interpreter.
4. **Deterministic Repetition:** Clarification requests must never trigger unconstrained LLM responses. They must deterministically replay the prior clinical directive ([ADR-0006](docs/adr/0006-repetition-and-clarification-protocol.md)).

---

## 2. Development Workflow

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker & Docker Compose (optional, for containerized local dev)

### Setup
```bash
git clone https://github.com/Shivanshu27/realtime-openai-medical-interpreter-app.git
cd realtime-openai-medical-interpreter-app
npm run install-all
```

### Running Tests
All pull requests must pass automated tests:

```bash
# Run server test suite
npm --prefix server test

# Run client test suite
npm --prefix client test -- --watchAll=false
```

---

## 3. Pull Request Guidelines

1. **Branch Naming:** `feat/feature-name`, `fix/bug-name`, `docs/documentation-update`.
2. **Architecture Decisions:** Non-trivial structural changes must include an Architecture Decision Record (ADR) in `docs/adr/` using the provided template.
3. **Clinical Safety Review:** Any modification to prompt engineering, system instructions, or entity extraction logic must include test cases demonstrating preservation of medical terminology.
4. **Clean Commits:** Write conventional commit messages (e.g. `feat(webrtc): add jitter buffer monitoring`, `fix(server): handle mongo connection timeout gracefully`).
