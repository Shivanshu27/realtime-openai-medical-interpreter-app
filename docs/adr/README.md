# Architecture Decision Records (ADRs)

This directory records the key architectural decisions made in the **Real-Time Medical Interpreter** application.

Each record explains the context of a decision, the alternatives evaluated, the chosen approach, and the positive and negative consequences.

---

## Index

| ADR | Title | Status | Date |
|---|---|---|---|
| [0001](0001-webrtc-over-websockets-for-realtime-audio.md) | WebRTC over WebSockets for Real-Time Duplex Audio | Accepted | 2024-12 |
| [0002](0002-ephemeral-session-credentials-security.md) | Ephemeral Session Credentials for Client-Side WebRTC | Accepted | 2024-12 |
| [0003](0003-dual-mode-resilient-backend-with-memory-fallback.md) | Dual-Mode Resilient Backend with In-Memory Fallback | Accepted | 2025-01 |
| [0004](0004-offline-first-simulation-engine-for-portfolio-review.md) | Offline-First Clinical Simulation Engine | Accepted | 2025-01 |
| [0005](0005-rule-based-clinical-intent-and-entity-extraction.md) | Rule-Based Post-Encounter Clinical Action Extraction | Accepted | 2025-01 |
| [0006](0006-repetition-and-clarification-protocol.md) | Deterministic Repetition and Clarification Protocol | Accepted | 2025-01 |

---

## Format

ADRs follow the standard Michael Nygard template:

- **Title:** Number and short noun phrase
- **Status:** Proposed, Accepted, Deprecated, Superseded
- **Context:** The technical, operational, or business context prompting the decision
- **Decision:** The specific architectural choice made
- **Consequences:** Trade-offs, benefits, and liabilities incurred
