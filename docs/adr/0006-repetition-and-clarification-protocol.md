# ADR 0006: Deterministic Repetition and Clarification Protocol

**Status:** Accepted  
**Date:** 2025-01  

## Context

During medical consultations involving interpreters, patients frequently need directives repeated due to clinical anxiety, background noise, or processing delays.

If a patient says *"¿Puede repetir eso, por favor?"* (Can you repeat that, please?) and the system simply translates this back to the physician (*"Could you repeat that, please?"*), conversational latency doubles. Worse, if the model attempts to converse or synthesize an answer, it may misstate medical advice.

## Decision

We implement a **Deterministic Repetition Protocol**:
1. Client-side audio processing inspects incoming transcription events for recognized repetition trigger phrases in English and Spanish (`"repeat that"`, `"say that again"`, `"repite eso"`, `"repita eso"`, etc.).
2. When a trigger phrase is detected:
   - The application intercepts normal turn-forwarding.
   - It queries the Redux message store for the most recent statement delivered by the physician.
   - It generates a designated repetition message flagged with `isRepetition: true`.
   - It immediately plays the audio translation of that prior statement back to the patient.
   - The transcript annotates the exchange with a prominent `[REPEATED]` badge.

## Consequences

### Positive
- **Reduced Physician Burden:** Attending doctors do not have to repeat themselves word-for-word into the microphone; the system handles repetition faithfully.
- **Zero Hallucination:** Because the system plays back the cached translation of the exact prior statement, there is zero risk of semantic drift or hallucination.
- **Accurate Clinical Audit Trail:** EMR export records show both the initial instruction and the patient's clarification request, proving informed consent and comprehension.

### Negative
- **Context Boundary:** If the patient intended to ask for clarification on an earlier instruction (two turns ago), the system by default replays the immediate prior directive. More complex multi-turn clarification resolution requires explicit physician steering.
