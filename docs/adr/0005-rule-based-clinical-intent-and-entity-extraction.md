# ADR 0005: Rule-Based Post-Encounter Clinical Action Extraction

**Status:** Accepted  
**Date:** 2025-01  

## Context

When a medical consultation ends, the attending physician must rapidly review follow-up obligations, diagnostic orders, and key patient concerns.

We evaluated two approaches for clinical summary and entity extraction:
1. **Asynchronous LLM Completion:** Sending the completed transcript to a secondary LLM endpoint (e.g. `gpt-4o`) to extract actions via structured prompt.
2. **Deterministic Multi-Lingual Regex & Lexicon Classifier:** Evaluating the transcript client-side against curated medical terminology dictionaries in both English and Spanish.

## Decision

We adopt a **Dual Architecture**:
- For production environments with active connections, a structured extraction pipeline can run server-side or client-side.
- The default core extractor (`conversationAnalyzer.js`) implements a deterministic, multi-lingual regex rule engine detecting:
  - **Follow-up / Scheduling Directives:** Explicit visits, intervals (e.g. "next week", "en dos semanas", "siguiente cita").
  - **Laboratory & Imaging Orders:** Diagnostic tests, specimen draws, imaging modalities (e.g. "blood test", "análisis de sangre", "X-ray", "radiografía", "CT scan").
  - **Medication Directives:** Prescriptions, dosage changes, symptom management.

## Consequences

### Positive
- **Instantaneous Generation:** Summaries and action item cards render in <5ms without awaiting external API completions.
- **Predictable & Verifiable:** The extraction behavior is deterministic, fully testable via unit tests, and cannot hallucinate clinical orders that were not stated.
- **Offline Capable:** Works seamlessly in offline simulation mode and low-connectivity clinic environments.

### Negative
- **Context Nuance:** Highly conversational or implicit scheduling hints that do not match known keywords may be missed compared to a nuanced LLM reasoning pass. Future iterations can combine rule-based filters with an optional LLM-assisted verification pass.
