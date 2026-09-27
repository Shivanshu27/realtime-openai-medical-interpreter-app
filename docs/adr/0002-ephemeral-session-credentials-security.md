# ADR 0002: Ephemeral Session Credentials for Client-Side WebRTC

**Status:** Accepted  
**Date:** 2024-12  

## Context

Because our WebRTC media session terminates directly at OpenAI's Realtime gateway, the client browser must authenticate with OpenAI's API. 

Embedding the master `OPENAI_API_KEY` into frontend environment variables (`REACT_APP_...`) would expose production credentials to anyone inspecting network traffic or decompiling browser bundles—a critical security violation.

## Decision

We mandate **Server-Brokered Ephemeral Session Keys**.

The backend server maintains the master `OPENAI_API_KEY` securely in its private environment. When the user initiates a recording session:
1. The client issues an authenticated request to `POST /generate-ephemeral-key` (or `/api/session/ephemeral-key`).
2. The server requests a short-lived session token from OpenAI's `https://api.openai.com/v1/realtime/sessions` endpoint.
3. The server receives a token (`client_secret.value`) with a 60-second validity window.
4. The server returns this ephemeral token to the browser, which is used strictly for the single SDP handshake.

## Consequences

### Positive
- **Zero Master Key Exposure:** The master API key remains strictly on the server and is never transmitted to the browser.
- **Strict Scope and Window:** The ephemeral token is invalid for standard REST endpoints (e.g. general GPT completions, file uploads, fine-tuning) and expires within one minute of generation.
- **Auditability:** The backend can log session creations, enforce rate limits, and apply access control policies before issuing an ephemeral token.

### Negative
- **Initial Connection Hop:** Establishing a call requires one additional HTTP round-trip to the backend server before initiating the WebRTC handshake. Under ordinary network conditions, this takes <150ms.
