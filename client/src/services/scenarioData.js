/**
 * Pre-configured clinical scenarios for zero-credential interactive evaluation.
 * Allows hiring managers and evaluators to test complete doctor-patient consultations
 * with speech synthesis, repetition handling, and clinical entity extraction in seconds.
 */
export const CLINICAL_SCENARIOS = [
  {
    id: 'abdominal_pain',
    title: 'Acute Abdominal Pain Intake',
    department: 'Emergency Medicine',
    description: '45-year-old presenting with sharp right-lower quadrant pain, nausea, and low-grade fever.',
    turns: [
      {
        role: 'doctor',
        language: 'english',
        text: 'Hello, I am Dr. Lin. Where is the pain located and how long have you felt it?',
        translation: 'Hola, soy la Dra. Lin. ¿Dónde está localizado el dolor y por cuánto tiempo lo ha sentido?'
      },
      {
        role: 'patient',
        language: 'spanish',
        text: 'Me empezó anoche en la parte baja del estómago, y ahora tengo náuseas.',
        translation: 'It started last night in the lower part of my stomach, and now I have nausea.'
      },
      {
        role: 'doctor',
        language: 'english',
        text: 'I understand. Please do not eat or drink anything. We need to run a blood test and a CT scan immediately.',
        translation: 'Entiendo. Por favor no coma ni beba nada. Necesitamos hacer un análisis de sangre y una tomografía de inmediato.'
      },
      {
        role: 'patient',
        language: 'spanish',
        text: '¿Puede repetir eso por favor? No escuché bien.',
        translation: 'Could you repeat that please? I did not hear well.',
        isRepetition: true
      },
      {
        role: 'doctor',
        language: 'english',
        text: 'We will admit you for observation and schedule a surgical consultation this afternoon.',
        translation: 'Lo ingresaremos para observación y programaremos una consulta quirúrgica esta tarde.'
      }
    ]
  },
  {
    id: 'cardiology_followup',
    title: 'Hypertension & Medication Review',
    department: 'Cardiology Clinic',
    description: 'Routine follow-up for essential hypertension with prescription adjustment.',
    turns: [
      {
        role: 'doctor',
        language: 'english',
        text: 'Good morning. Your blood pressure is slightly elevated today at 145 over 92.',
        translation: 'Buenos días. Su presión arterial está ligeramente elevada hoy en 145 sobre 92.'
      },
      {
        role: 'patient',
        language: 'spanish',
        text: 'He tenido muchos dolores de cabeza y a veces olvido tomar mi pastilla por la mañana.',
        translation: 'I have had many headaches and sometimes I forget to take my pill in the morning.'
      },
      {
        role: 'doctor',
        language: 'english',
        text: 'I am prescribing Lisinopril 10mg. Take this medication once daily every morning with water.',
        translation: 'Le voy a recetar Lisinopril 10mg. Tome este medicamento una vez al día cada mañana con agua.'
      },
      {
        role: 'patient',
        language: 'spanish',
        text: '¿Debo tomarlo con comida o en ayunas?',
        translation: 'Should I take it with food or on an empty stomach?'
      },
      {
        role: 'doctor',
        language: 'english',
        text: 'With or without food is fine. We need to schedule a follow-up appointment in three weeks to check your kidney function.',
        translation: 'Con o sin comida está bien. Necesitamos programar una cita de seguimiento en tres semanas para revisar su función renal.'
      }
    ]
  },
  {
    id: 'ortho_fracture',
    title: 'Orthopedic Injury & Diagnostic Orders',
    department: 'Urgent Care',
    description: 'Patient sustained wrist injury following a mechanical fall at home.',
    turns: [
      {
        role: 'doctor',
        language: 'english',
        text: 'Can you wiggle your fingers, and did you hear a snap when you fell on your wrist?',
        translation: '¿Puede mover los dedos, y escuchó un chasquido cuando se cayó sobre la muñeca?'
      },
      {
        role: 'patient',
        language: 'spanish',
        text: 'Puedo moverlos un poco, pero me duele muchísimo cuando giro la muñeca.',
        translation: 'I can move them a little, but it hurts very much when I rotate my wrist.'
      },
      {
        role: 'doctor',
        language: 'english',
        text: 'We are going to do an X-ray of your wrist and forearm right away to check for fractures.',
        translation: 'Vamos a hacer una radiografía de su muñeca y antebrazo de inmediato para verificar fracturas.'
      },
      {
        role: 'patient',
        language: 'spanish',
        text: 'Está bien doctora, muchas gracias.',
        translation: 'That is fine doctor, thank you very much.'
      }
    ]
  }
];
