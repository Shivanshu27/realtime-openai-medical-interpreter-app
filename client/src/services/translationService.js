// Service for clinical translation and text-to-speech
// Supports both zero-credit simulation mode and live OpenAI Realtime API integration

const MOCK_MODE = process.env.REACT_APP_MOCK_MODE !== 'false';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const REPEAT_PHRASES = {
  english: ['repeat that', 'say that again', 'could you repeat', 'what did you say', 'one more time'],
  spanish: ['repite eso', 'repita eso', 'puedes repetir', 'qué dijiste', 'que dijo', 'otra vez', 'repítelo']
};

export const detectRepeatPhrase = (text) => {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return (
    REPEAT_PHRASES.english.some(phrase => lowerText.includes(phrase)) ||
    REPEAT_PHRASES.spanish.some(phrase => lowerText.includes(phrase))
  );
};

const CLINICAL_TRANSLATIONS = {
  english: {
    spanish: {
      "I need to check your symptoms": "Necesito revisar sus síntomas",
      "How long have you had this pain?": "¿Por cuánto tiempo ha tenido este dolor?",
      "I'm going to prescribe some medication": "Voy a recetarle algunos medicamentos",
      "We should schedule a follow-up appointment": "Deberíamos programar una cita de seguimiento",
      "Please take a deep breath": "Por favor respire hondo",
      "Where does it hurt the most?": "¿Dónde le duele más?",
      "I need you to get a blood test": "Necesito que se haga un análisis de sangre",
      "We need to run an X-ray to check for fractures": "Necesitamos hacer una radiografía para verificar fracturas",
      "Take this medication twice daily with food": "Tome este medicamento dos veces al día con alimentos",
      "I am prescribing Lisinopril 10mg. Take this medication once daily every morning with water.": "Le voy a recetar Lisinopril 10mg. Tome este medicamento una vez al día cada mañana con agua.",
      "With or without food is fine. We need to schedule a follow-up appointment in three weeks to check your kidney function.": "Con o sin comida está bien. Necesitamos programar una cita de seguimiento en tres semanas para revisar su función renal.",
      "We will admit you for observation and schedule a surgical consultation this afternoon.": "Lo ingresaremos para observación y programaremos una consulta quirúrgica esta tarde.",
      "Could you repeat that please?": "¿Podría repetir eso por favor?",
      "Say that again": "Diga eso nuevamente",
      "What did you say?": "¿Qué dijo?",
      "I didn't understand": "No entendí"
    }
  },
  spanish: {
    english: {
      "Me duele la cabeza desde hace dos días": "I've had a headache for two days",
      "Tengo fiebre y dolor de garganta": "I have a fever and sore throat",
      "No puedo dormir por el dolor": "I can't sleep because of the pain",
      "Me duele mucho el estómago después de comer": "My stomach hurts a lot after eating",
      "Necesito que te hagas un análisis de sangre": "I need you to get a blood test",
      "Vamos a hacer una radiografía": "We are going to do an X-ray",
      "Me empezó anoche en la parte baja del estómago, y ahora tengo náuseas.": "It started last night in the lower part of my stomach, and now I have nausea.",
      "He tenido muchos dolores de cabeza y a veces olvido tomar mi pastilla por la mañana.": "I have had many headaches and sometimes I forget to take my pill in the morning.",
      "¿Debo tomarlo con comida o en ayunas?": "Should I take it with food or on an empty stomach?",
      "Puedo moverlos un poco, pero me duele muchísimo cuando giro la muñeca.": "I can move them a little, but it hurts very much when I rotate my wrist.",
      "¿Puede repetir eso por favor?": "Could you repeat that please?",
      "No entendí": "I didn't understand",
      "¿Qué dijo?": "What did you say?",
      "Otra vez por favor": "Again please",
      "Repítelo": "Repeat that"
    }
  }
};

const simulateTranslation = (text, sourceLanguage = 'english', targetLanguage = 'spanish') => {
  const sLang = sourceLanguage.toLowerCase();
  const tLang = targetLanguage.toLowerCase();

  const exactMatch = CLINICAL_TRANSLATIONS[sLang]?.[tLang]?.[text.trim()];
  if (exactMatch) return exactMatch;

  const dict = CLINICAL_TRANSLATIONS[sLang]?.[tLang] || {};
  for (const [k, v] of Object.entries(dict)) {
    if (k.toLowerCase() === text.trim().toLowerCase()) {
      return v;
    }
  }

  return `[${tLang.toUpperCase()}]: ${text}`;
};

const simulateTextToSpeech = async (text, language = 'spanish') => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve(new Blob([], { type: 'audio/wav' }));
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'english' ? 'en-US' : 'es-ES';
      utterance.rate = 0.95;

      utterance.onend = () => {
        resolve(new Blob([], { type: 'audio/wav' }));
      };

      utterance.onerror = () => {
        resolve(new Blob([], { type: 'audio/wav' }));
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);

      // Safety timeout in case speech synth hangs
      setTimeout(() => {
        resolve(new Blob([], { type: 'audio/wav' }));
      }, 4000);
    } catch (e) {
      resolve(new Blob([], { type: 'audio/wav' }));
    }
  });
};

const openAITranslate = async (text, sourceLanguage, targetLanguage) => {
  try {
    const response = await fetch(`${API_URL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        source_language: sourceLanguage,
        target_language: targetLanguage
      })
    });

    if (!response.ok) {
      throw new Error(`Translation endpoint error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.translatedText || `[${targetLanguage}]: ${text}`;
  } catch (error) {
    console.error('Error with API translation:', error);
    return `[Translation fallback: ${text}]`;
  }
};

export const translateAndSpeak = async (text, sourceLanguage = 'english', targetLanguage = 'spanish') => {
  try {
    let translatedText;
    if (MOCK_MODE) {
      translatedText = simulateTranslation(text, sourceLanguage, targetLanguage);
    } else {
      translatedText = await openAITranslate(text, sourceLanguage, targetLanguage);
    }

    // Generate speech
    let speechAudio = new Blob([], { type: 'audio/wav' });
    if (MOCK_MODE) {
      speechAudio = await simulateTextToSpeech(translatedText, targetLanguage);
    }

    return { translatedText, speechAudio };
  } catch (error) {
    console.error('Error in translateAndSpeak:', error);
    return {
      translatedText: `[Error: ${text}]`,
      speechAudio: new Blob([], { type: 'audio/wav' })
    };
  }
};
