# ADR 0003: Dual-Mode Resilient Backend with In-Memory Fallback

**Status:** Accepted  
**Date:** 2025-01  

## Context

In early iterations of the server, failing to connect to MongoDB caused immediate process termination (`process.exit(1)`). Similarly, running without an `OPENAI_API_KEY` led to runtime crashes.

When a hiring manager, technical evaluator, or developer clones this repository, requiring a pre-provisioned local MongoDB cluster or a paid OpenAI account creates high friction. If the app crashes on `npm start`, the candidate/project is penalized before code evaluation begins.

## Decision

We implement a **Resilient Repository Pattern with Automatic In-Memory Fallback**:
1. At server startup, the storage factory attempts connection to the configured `MONGODB_URI`.
2. If MongoDB is absent or connection times out, the server logs a prominent warning and transparently instantiates an `InMemoryConversationRepository`.
3. If `OPENAI_API_KEY` is not detected in environment variables, `MOCK_MODE` defaults to `true` with a clear explanation in server logs.
4. Server health endpoints (`/health`) report the active storage mode (`mongodb` vs `in-memory`) and operational mode (`real` vs `mock`).

## Consequences

### Positive
- **Zero-Friction Evaluation:** Anyone can clone the repository and run `npm start` or `docker compose up` without installing or configuring external databases.
- **High Availability in Staging/Dev:** Developers can work offline or on air-gapped workstations without local daemon dependencies.
- **Production Safety:** In production (`NODE_ENV === 'production'`), strict validation can be toggled to fail loudly if MongoDB is required by compliance.

### Negative
- **Ephemeral State in Fallback Mode:** In-memory storage clears on process restart. This is appropriate for evaluation and local testing, but users must be aware that sessions do not persist across restarts when running without MongoDB.
