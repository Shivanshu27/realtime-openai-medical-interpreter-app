# ADR 0004: Offline-First Simulation Engine for Portfolio Review

**Status:** Accepted  
**Date:** 2025-01  

## Context

OpenAI's Realtime API is a paid service with high per-minute audio streaming costs and strict tier requirements. For portfolio reviewers examining code quality and system architecture on GitHub, incurring billing costs just to see the user interface and conversational capabilities in action is unreasonable.

Existing portfolio apps often either fail completely when API keys are absent, or provide static placeholder mock text without demonstrating the actual interactive user experience.

## Decision

We incorporate a **Comprehensive Clinical Simulation Engine** directly in the client application:
1. **Interactive Clinical Scenarios:** Pre-scripted, authentic clinical dialogues (e.g. Acute Abdominal Pain Intake, Cardiology Follow-up with Lab Orders) that simulate full physician-patient interactions.
2. **Deterministic Browser Speech Synthesis:** Leverages the native browser `window.speechSynthesis` API (`SpeechSynthesisUtterance`) with appropriate language tags (`en-US` and `es-ES`) to produce real spoken audio without external cloud TTS API costs.
3. **Repetition Injection:** Allows reviewers to test how the system detects clarification requests and deterministically replays prior directives.
4. **Summary & Export Pipeline:** Automatically runs post-encounter clinical entity extraction on the simulated transcript, demonstrating the complete end-to-end user journey.

## Consequences

### Positive
- **Instant Demonstration:** Reviewers can experience full audio playback, transcript streaming, and clinical summary generation in seconds with zero configuration and zero API keys.
- **Hermetic Testing:** Enables end-to-end integration and visual regression testing in CI environments where external network calls and paid credentials are prohibited.

### Negative
- **Voice Naturalness:** Browser speech synthesis quality depends on the host operating system's installed voices and may sound less human than OpenAI's neural Realtime voices. A clear badge indicates when the system is in Simulation Mode vs OpenAI Realtime Mode.
