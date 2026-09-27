const axios = require('axios');
const config = require('../config');

// Expanded clinical dictionary for realistic offline evaluation
const CLINICAL_LEXICON = {
  english: {
    spanish: {
      "I need to check your symptoms": "Necesito revisar sus síntomas",
      "How long have you had this pain?": "¿Por cuánto tiempo ha tenido este dolor?",
      "I'm going to prescribe some medication": "Voy a recetarle algunos medicamentos",
      "We should schedule a follow-up appointment": "Deberíamos programar una cita de seguimiento",
      "Please take a deep breath": "Por favor respire hondo",
      "Where does it hurt the most?": "¿Dónde le duele más?",
      "I need you to get a blood test": "Necesito que se haga un análisis de sangre",
      "We need to run an X-ray to check for fractures": "Necesitamos hacer una radiografía para verificar si hay fracturas",
      "Take this medication twice daily with food": "Tome este medicamento dos veces al día con alimentos",
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
      "¿Puede repetir eso por favor?": "Could you repeat that please?",
      "No entendí": "I didn't understand",
      "¿Qué dijo?": "What did you say?",
      "Otra vez por favor": "Again please",
      "Repítelo": "Repeat that"
    }
  }
};

class TranslationService {
  constructor(apiKey = config.openaiApiKey, mockMode = config.mockMode) {
    this.apiKey = apiKey;
    this.mockMode = mockMode;
  }

  async translateText(text, sourceLang = 'english', targetLang = 'spanish') {
    if (!text || typeof text !== 'string') {
      throw new Error('Text to translate must be a non-empty string');
    }

    const sLang = sourceLang.toLowerCase();
    const tLang = targetLang.toLowerCase();

    if (this.mockMode) {
      const match = CLINICAL_LEXICON[sLang]?.[tLang]?.[text.trim()];
      if (match) {
        return { translatedText: match, source: 'lexicon-simulation' };
      }

      // Case-insensitive match check
      const dict = CLINICAL_LEXICON[sLang]?.[tLang] || {};
      for (const [k, v] of Object.entries(dict)) {
        if (k.toLowerCase() === text.trim().toLowerCase()) {
          return { translatedText: v, source: 'lexicon-simulation' };
        }
      }

      return {
        translatedText: `[${tLang.toUpperCase()}]: ${text}`,
        source: 'fallback-simulation'
      };
    }

    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not configured');
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are an expert clinical medical interpreter. Translate from ${sLang} to ${tLang}. Preserve clinical accuracy, medical terminology, dosage instructions, and professional empathetic tone. Output ONLY the raw translation.`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.2
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`
          },
          timeout: 8000
        }
      );

      const translatedText = response.data?.choices?.[0]?.message?.content?.trim() || '';
      return { translatedText, source: 'gpt-4o' };
    } catch (error) {
      const detail = error.response?.data?.error?.message || error.message;
      throw new Error(`Translation API failed: ${detail}`);
    }
  }
}

module.exports = {
  TranslationService,
  CLINICAL_LEXICON
};
