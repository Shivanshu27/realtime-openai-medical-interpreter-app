# Medical Interpreter — Product Requirements Document (PRD)

**Status:** Approved v1.0  
**Domain:** Healthcare AI / Low-Latency Clinical Translation  
**Target Standard:** HIPAA-aligned, Clinical Grade, Sub-500ms Duplex Streaming  
**Reference Benchmark:** Outpost Architecture Standard  

---

## 1. Problem Statement

Language barriers in healthcare lead to diagnostic delays, medication errors, and adverse clinical outcomes. In the United States alone, over **25 million individuals** possess Limited English Proficiency (LEP). In acute care and emergency department (ED) settings:

1. **Human Interpreters are Bottlenecked:** On-demand medical interpreters experience dispatch latencies ranging from 10 to 45 minutes, rendering real-time triage-blind.
2. **Sequential Voice Bots Cause Turn Collision:** Standard consumer translation apps require distinct conversational pauses, turn-based button presses, and produce awkward latency (>2.5 seconds), disrupting natural doctor-patient empathy and clinical tempo.
3. **Loss of Critical Clinical Directives:** Critical clinical orders—such as dosage titration, fasting instructions, and lab orders—get lost in unstructured transcripts if post-encounter synthesis is absent.
4. **Privacy and Compliance Vulnerabilities:** Transmitting Protected Health Information (PHI) over unencrypted, persistent cloud APIs without ephemeral scoping creates serious HIPAA liability.

**The Solution:** A full-duplex, low-latency medical interpreter application powered by OpenAI's Realtime API (WebRTC + PCM16 audio) and backed by clinical action extraction, deterministic repetition handling, and an offline-first simulation engine.

---

## 2. Product Personas & User Journeys

### Persona A: Dr. Sarah Lin (Attending Emergency Physician)
- **Language:** English
- **Context:** Fast-paced emergency department intake. Needs hands-free, natural conversational flow with Spanish-speaking patients.
- **Needs:**
  - Instantaneous audio interpretation (<500ms latency) directly into the patient's language.
  - Ability to repeat and clarify instructions immediately if the patient looks confused.
  - Automated extraction of follow-up visits and laboratory orders so nothing is missed during charting.

### Persona B: Mateo Gomez (LEP Patient)
- **Language:** Spanish
- **Context:** Presenting with acute abdominal pain and anxiety.
- **Needs:**
  - Clear, natural native Spanish audio spoken at a calm pace.
  - Freedom to ask "¿Puede repetir eso?" (Can you repeat that?) and have the system deterministically replay the physician's directive without hallucination.
  - Visual confirmation that their symptoms and words are being faithfully transcribed.

### Persona C: Technical Evaluator / Reviewing Senior Engineer
- **Context:** Assessing the repository on GitHub for engineering rigor, architectural maturity, and system resilience.
- **Needs:**
  - Ability to run the complete end-to-end interactive experience locally without paid OpenAI API credits or active MongoDB daemons.
  - Clear documentation of architectural trade-offs, threat models, and WebRTC lifecycle management.

---

## 3. Product Principles

1. **Sub-Second Duplex Tempo:** Translation must be delivered as continuous streaming audio over WebRTC data/media tracks rather than batch request/response polling.
2. **Clinical Conservatism (Zero Hallucination):** The translation model must be constrained as a pure translator. In translation mode, it must never diagnose, prescribe, or provide unsolicited medical advice.
3. **Deterministic Repetition Protocol:** Clarification requests ("Repeat that", "¿Puede repetir?") must be intercepted deterministically and linked to the exact prior medical directive rather than re-prompted to an LLM.
4. **Zero PHI Footprint by Default:** Ephemeral API tokens expire in 60 seconds; MongoDB persistence is strictly scoped to conversation transcripts without biometric audio retention.
5. **Zero Friction Evaluation:** A comprehensive simulation engine with pre-scripted clinical cases allows immediate validation of audio synthesis, transcript streaming, and action extraction with zero dependencies.

---

## 4. Feature Specifications

### 4.1 Real-Time Duplex Interpretation
- **Media Transport:** WebRTC Peer Connection (`RTCPeerConnection`) with bidirectional audio tracks.
- **Encoding:** PCM16 raw audio sampled at 24kHz.
- **Voice Allocation:**
  - Doctor (English $\rightarrow$ Spanish): Voice model `alloy` with clinical Spanish inflection.
  - Patient (Spanish $\rightarrow$ English): Voice model `coral` / `nova` with clear English pronunciation.
- **Server VAD:** Dynamic turn detection using server-side Voice Activity Detection with 300ms prefix padding and 500ms silence threshold.

### 4.2 Deterministic Clarification & Repetition
- Intercepts trigger phrases in both languages:
  - English: `"repeat that"`, `"say that again"`, `"could you repeat"`, `"what did you say"`
  - Spanish: `"repite eso"`, `"repita eso"`, `"puedes repetir"`, `"qué dijiste"`, `"otra vez"`
- Locates the last authoritative physician message in state and repeats the validated translation audio.

### 4.3 Automated Clinical Action & Summary Extraction
Upon session completion, the analysis engine parses the full conversational transcript for key clinical entities:
- **Follow-up Appointments:** Identifies scheduling intents, return intervals, and consultation targets.
- **Laboratory & Diagnostic Orders:** Flags blood draws, urine analyses, radiology (X-ray, CT, MRI), and specimen collection.
- **Clinical Highlights:** Assembles a structured clinical brief exportable to Markdown and raw JSON for EHR integration.

### 4.4 Resilient Dual-Mode Architecture
- **Production Mode:** Negotiates ephemeral tokens via backend server, opens WebRTC data channels to OpenAI Realtime endpoints.
- **Clinical Simulation Mode:** Offline-capable browser engine using Web Speech API synthesis, pre-configured clinical dialogue scenarios, and mock translation mappings.
- **Graceful Persistence Fallback:** Automatically switches to an in-memory repository if MongoDB is offline, guaranteeing non-crashing boot.

---

## 5. Non-Functional Requirements (NFRs)

| Metric | Target | Failure Behavior |
|---|---|---|
| **Audio Latency (P95)** | $< 450\text{ ms}$ (WebRTC) | Degrades to buffered chunks with UI warning |
| **Token Expiry** | 60 seconds | Automatically requested just-in-time per session |
| **Server Startup** | $< 500\text{ ms}$ | Fails open with in-memory store if DB unreachable |
| **Browser Compatibility** | Chrome 90+, Safari 14+, Edge 90+, Firefox 90+ | Web Speech API fallback for audio synthesis |
| **Test Coverage** | $> 80\%$ on clinical extraction & services | CI gate halts pull requests below threshold |

---

## 6. Success Metrics & Verification

1. **End-to-End Latency:** Time from physician speech cessation to patient audio playback onset $\le 500\text{ ms}$.
2. **Repetition Accuracy:** 100% deterministic replay of prior directive upon trigger phrase detection.
3. **Entity Extraction Recall:** $\ge 95\%$ recall on standard clinical follow-up and laboratory order phrases.
4. **Developer Bootstrap Time:** $< 60$ seconds from `git clone` to full interactive simulation in Docker or local dev.
