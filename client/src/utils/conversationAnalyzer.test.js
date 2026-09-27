import {
  analyzeConversation,
  detectFollowUpAppointment,
  detectLabOrder,
  detectImagingOrder,
  detectMedicationDiscussion
} from './conversationAnalyzer';

describe('Clinical Conversation Analyzer', () => {
  describe('Keyword Detectors', () => {
    it('should detect follow-up appointments in English and Spanish', () => {
      expect(detectFollowUpAppointment('We should schedule a follow-up appointment next week')).toBe(true);
      expect(detectFollowUpAppointment('Necesitamos programar una cita para la próxima semana')).toBe(true);
      expect(detectFollowUpAppointment('Please take a seat')).toBe(false);
    });

    it('should detect laboratory orders in English and Spanish', () => {
      expect(detectLabOrder('I need you to get a blood test done')).toBe(true);
      expect(detectLabOrder('Vamos a pedir un análisis de orina')).toBe(true);
      expect(detectLabOrder('How are your symptoms?')).toBe(false);
    });

    it('should detect diagnostic imaging orders', () => {
      expect(detectImagingOrder('We need an X-ray to check for fractures')).toBe(true);
      expect(detectImagingOrder('Le haremos una tomografía computarizada')).toBe(true);
      expect(detectImagingOrder('Rest for two days')).toBe(false);
    });

    it('should detect medication discussions', () => {
      expect(detectMedicationDiscussion('Take this medication twice daily with meals')).toBe(true);
      expect(detectMedicationDiscussion('Voy a recetarle una pastilla de lisinopril')).toBe(true);
      expect(detectMedicationDiscussion('Call if you feel dizzy')).toBe(false);
    });
  });

  describe('analyzeConversation', () => {
    it('should return empty summary when messages array is empty', () => {
      const result = analyzeConversation([]);
      expect(result.stats.totalExchanges).toBe(0);
      expect(result.actions.followUpAppointment).toBe(false);
      expect(result.content).toContain('No conversation recorded');
    });

    it('should correctly analyze a multi-turn clinical encounter', () => {
      const messages = [
        {
          sender: 'doctor',
          text: 'Where does it hurt?',
          originalText: 'Where does it hurt?',
          timestamp: '2026-09-27T06:00:00Z'
        },
        {
          sender: 'patient',
          text: 'Me duele el pecho y tengo náuseas',
          originalText: 'Me duele el pecho y tengo náuseas',
          timestamp: '2026-09-27T06:00:15Z'
        },
        {
          sender: 'doctor',
          text: 'We are ordering a blood test and an X-ray of your chest right now.',
          originalText: 'We are ordering a blood test and an X-ray of your chest right now.',
          timestamp: '2026-09-27T06:00:30Z'
        },
        {
          sender: 'patient',
          text: '¿Puede repetir eso?',
          originalText: '¿Puede repetir eso?',
          isRepetition: true,
          timestamp: '2026-09-27T06:00:45Z'
        },
        {
          sender: 'doctor',
          text: 'Take this medication and schedule a follow-up appointment in one week.',
          originalText: 'Take this medication and schedule a follow-up appointment in one week.',
          timestamp: '2026-09-27T06:01:00Z'
        }
      ];

      const analysis = analyzeConversation(messages);

      expect(analysis.stats.totalExchanges).toBe(5);
      expect(analysis.stats.doctorMessages).toBe(3);
      expect(analysis.stats.patientMessages).toBe(2);
      expect(analysis.stats.repetitionRequests).toBe(1);

      expect(analysis.actions.followUpAppointment).toBe(true);
      expect(analysis.actions.labOrder).toBe(true);
      expect(analysis.actions.imagingOrder).toBe(true);
      expect(analysis.actions.medicationDiscussion).toBe(true);

      expect(analysis.content).toContain('Clinical Encounter Summary');
      expect(analysis.content).toContain('[CLARIFICATION REPLAY]');
    });
  });
});
