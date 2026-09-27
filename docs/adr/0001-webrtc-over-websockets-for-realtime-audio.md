# ADR 0001: WebRTC over WebSockets for Real-Time Duplex Audio

**Status:** Accepted  
**Date:** 2024-12  

## Context

In an emergency medical consultation between an English-speaking physician and a Spanish-speaking patient, conversational turn-taking latency must mimic human speech cadence (<500ms).

We evaluated two transport architectures supported by OpenAI's Realtime API:
1. **Server-Proxied WebSockets:** The browser records audio chunks, sends them over a WebSocket to our backend server, which forwards them over another WebSocket to OpenAI, receiving audio responses and relaying them back down.
2. **Direct Browser-to-OpenAI WebRTC:** The browser acquires the microphone stream and opens a direct `RTCPeerConnection` with OpenAI's Realtime media gateway using an ephemeral token. Data events (transcripts, instructions) flow over an RTC DataChannel (`"oai-events"`).

## Decision

We chose **Direct Browser-to-OpenAI WebRTC**.

The backend server is responsible solely for authentication and ephemeral session token generation (`POST /generate-ephemeral-key` or `/api/session/ephemeral-key`). Once the client receives the ephemeral token, it establishes a direct peer connection via SDP offer/answer with OpenAI.

## Consequences

### Positive
- **Minimized Latency:** Eliminates the backend proxy hop. Audio travels over UDP/RTP directly to OpenAI's edge endpoints, keeping P95 voice latency below 450ms.
- **Hardware Echo Cancellation & Jitter Buffering:** Browsers provide native WebRTC jitter buffering, acoustic echo cancellation (AEC), and automatic gain control (AGC).
- **Reduced Server Load:** The backend server never handles binary audio payloads; server resource utilization remains constant regardless of active call duration.

### Negative
- **Browser WebRTC Quirks:** Differences between browser WebRTC implementations (e.g. Safari vs Chrome audio track renegotiation) require careful lifecycle handling and fallback audio context resume triggers.
- **Firewall/NAT Constraints:** In heavily restricted corporate or hospital networks without TURN relay support, UDP may be blocked (addressed in production via standard STUN/TURN traversal).
