/**
 * Clinical Conversation Analyzer
 * Performs rule-based clinical entity extraction on consultation transcripts.
 * Detects follow-up appointments, laboratory tests, diagnostic imaging, and medications.
 */

const FOLLOW_UP_KEYWORDS = [
  'follow-up', 'follow up', 'appointment', 'schedule', 'come back', 
  'see you', 'next visit', 'next week', 'next month', 'two weeks', 'three weeks',
  'return visit', 'check again', 'come again', 'consultation',
  'cita', 'programar', 'próxima visita', 'siguiente cita',
  'volver', 'regresar', 'revisión', 'consulta'
];

const LAB_KEYWORDS = [
  'lab', 'test', 'blood', 'specimen', 'sample', 'panel',
  'analysis', 'urine', 'kidney function', 'liver', 'cbc',
  'laboratorio', 'examen', 'sangre', 'muestra', 'análisis',
  'orina', 'función renal'
];

const IMAGING_KEYWORDS = [
  'x-ray', 'radiografía', 'rayos x', 'scan', 'ct scan', 'tomografía',
  'mri', 'resonancia', 'ultrasound', 'ecografía', 'imaging'
];

const MEDICATION_KEYWORDS = [
  'prescribe', 'prescription', 'medication', 'medicine', 'pills', 'tablets',
  'dosage', 'daily', 'mg', 'twice daily', 'with food', 'antibiotic', 'lisinopril',
  'recetar', 'receta', 'medicamento', 'medicina', 'pastilla', 'pastillas',
  'dosis', 'diario', 'dos veces al día', 'con comida', 'en ayunas'
];

export const detectFollowUpAppointment = (text = '') => {
  const lower = text.toLowerCase();
  return FOLLOW_UP_KEYWORDS.some(kw => lower.includes(kw));
};

export const detectLabOrder = (text = '') => {
  const lower = text.toLowerCase();
  return LAB_KEYWORDS.some(kw => lower.includes(kw));
};

export const detectImagingOrder = (text = '') => {
  const lower = text.toLowerCase();
  return IMAGING_KEYWORDS.some(kw => lower.includes(kw));
};

export const detectMedicationDiscussion = (text = '') => {
  const lower = text.toLowerCase();
  return MEDICATION_KEYWORDS.some(kw => lower.includes(kw));
};

/**
 * Analyzes conversation messages to detect clinical actions and generate a structured brief.
 */
export const analyzeConversation = (messages = []) => {
  if (!messages || messages.length === 0) {
    return {
      content: "# Clinical Summary\n\nNo conversation recorded in this encounter.",
      actions: {
        followUpAppointment: false,
        labOrder: false,
        imagingOrder: false,
        medicationDiscussion: false
      },
      stats: {
        totalExchanges: 0,
        doctorMessages: 0,
        patientMessages: 0,
        repetitionRequests: 0
      }
    };
  }

  // Combine full text for analysis
  const fullText = messages
    .map(msg => `${msg.sender === 'doctor' ? 'Doctor' : 'Patient'}: ${msg.text || ''}`)
    .join('\n');

  const doctorMessages = messages.filter(m => m.sender === 'doctor').length;
  const patientMessages = messages.filter(m => m.sender === 'patient').length;
  const repetitionRequests = messages.filter(m => m.isRepetition).length;

  const followUpAppointment = detectFollowUpAppointment(fullText);
  const labOrder = detectLabOrder(fullText);
  const imagingOrder = detectImagingOrder(fullText);
  const medicationDiscussion = detectMedicationDiscussion(fullText);

  const stats = {
    totalExchanges: messages.length,
    doctorMessages,
    patientMessages,
    repetitionRequests
  };

  const actions = {
    followUpAppointment,
    labOrder,
    imagingOrder,
    medicationDiscussion
  };

  const summary = generateClinicalSummary(messages, stats, actions);

  return {
    content: summary,
    actions,
    stats
  };
};

function generateClinicalSummary(messages, stats, actions) {
  let doc = '# Clinical Encounter Summary\n\n';
  doc += `**Encounter Date:** ${new Date().toLocaleDateString()} | **Encounter Time:** ${new Date().toLocaleTimeString()}\n\n`;

  doc += '### Encounter Telemetry\n';
  doc += `- **Total Dialogue Turns:** ${stats.totalExchanges}\n`;
  doc += `- **Physician Directives (English):** ${stats.doctorMessages}\n`;
  doc += `- **Patient Utterances (Spanish):** ${stats.patientMessages}\n`;
  if (stats.repetitionRequests > 0) {
    doc += `- **Clarification / Repetition Events:** ${stats.repetitionRequests} (handled deterministically)\n`;
  }
  doc += '\n';

  doc += '### Clinical Action Items & Detected Orders\n';
  doc += actions.followUpAppointment
    ? '- [x] **Follow-Up Appointment:** Scheduled / Recommended during encounter.\n'
    : '- [ ] **Follow-Up Appointment:** No explicit follow-up interval discussed.\n';

  doc += actions.labOrder
    ? '- [x] **Laboratory Diagnostic Orders:** Blood/urine specimen analysis requested.\n'
    : '- [ ] **Laboratory Diagnostic Orders:** None ordered in this encounter.\n';

  doc += actions.imagingOrder
    ? '- [x] **Diagnostic Imaging:** Radiography / Sonography / CT scan ordered.\n'
    : '- [ ] **Diagnostic Imaging:** No imaging indicated.\n';

  doc += actions.medicationDiscussion
    ? '- [x] **Pharmacotherapy:** Prescription regimen or dosage adjustments reviewed.\n'
    : '- [ ] **Pharmacotherapy:** No active prescription adjustments noted.\n';

  doc += '\n### Encounter Highlights\n';
  if (messages.length > 0) {
    const first = messages[0];
    doc += `- **Chief Complaint / Opening:** ${first.sender === 'doctor' ? 'Physician' : 'Patient'}: "${first.text}"\n`;

    if (messages.length > 3) {
      const mid = messages[Math.floor(messages.length / 2)];
      doc += `- **Key Clinical Exchange:** ${mid.sender === 'doctor' ? 'Physician' : 'Patient'}: "${mid.text}"\n`;
    }

    const last = messages[messages.length - 1];
    doc += `- **Closing Disposition:** ${last.sender === 'doctor' ? 'Physician' : 'Patient'}: "${last.text}"\n`;
  }

  doc += '\n### Full Bilingual Audit Trail\n\n';
  messages.forEach((msg, idx) => {
    const roleLabel = msg.sender === 'doctor' ? 'Physician (EN)' : 'Patient (ES)';
    const repBadge = msg.isRepetition ? ' **[CLARIFICATION REPLAY]**' : '';
    const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '';
    doc += `**${idx + 1}. ${roleLabel}** ${timeStr ? `\`${timeStr}\`` : ''}${repBadge}\n`;
    doc += `> **Spoken:** ${msg.originalText || msg.text}\n`;
    if (msg.originalText && msg.originalText !== msg.text) {
      doc += `> **Interpreted:** ${msg.text}\n`;
    }
    doc += '\n';
  });

  return doc;
}
