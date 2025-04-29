// Service for translation and text-to-speech
// Supports both mock mode and real OpenAI API integration

const MOCK_MODE = process.env.REACT_APP_MOCK_MODE === 'true';
console.log('Translation Service MOCK_MODE:', MOCK_MODE);
console.log('API URL:', process.env.REACT_APP_API_URL);

// Mock translation function
const simulateTranslation = (text, sourceLanguage, targetLanguage) => {
  // Simulated translations for demo purposes
  const translations = {
    english: {
      spanish: {
        "I need to check your symptoms": "Necesito revisar tus síntomas",
        "How long have you had this pain?": "¿Por cuánto tiempo ha tenido este dolor?",
        "I'm going to prescribe some medication": "Voy a recetarle algunos medicamentos",
      }
    },
    spanish: {
      english: {
        "Me duele la cabeza desde hace dos días": "I've had a headache for two days",
        "Tengo fiebre y dolor de garganta": "I have a fever and sore throat",
        "No puedo dormir por el dolor": "I can't sleep because of the pain",
      }
    }
  };

  // Try to get the translation or return a default response
  return translations[sourceLanguage]?.[targetLanguage]?.[text] || 
    `[Translation of: ${text}]`;
};

// Mock text-to-speech function
const simulateTextToSpeech = async (text, language) => {
  // In a real app, this would call a TTS API
  // For now, we create a simple audio file using the Web Speech API
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'english' ? 'en-US' : 'es-ES';
    
    // Create a MediaRecorder to capture the audio
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();
    const mediaRecorder = new MediaRecorder(destination.stream);
    const audioChunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };
    
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      resolve(audioBlob);
    };
    
    // Start recording
    mediaRecorder.start();
    
    // Use speech synthesis to generate audio
    window.speechSynthesis.speak(utterance);
    
    // Stop recording after the speech is done
    utterance.onend = () => {
      mediaRecorder.stop();
    };
    
    // Fallback in case speech synthesis fails
    setTimeout(() => {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    }, 5000);
  });
};

// Real translation using OpenAI API
const openAITranslate = async (text, sourceLanguage, targetLanguage) => {
  try {
    // Use GPT to translate the text
    const response = await fetch(`${process.env.REACT_APP_API_URL}/translate`, {
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
      throw new Error('Translation failed');
    }
    
    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error('Error with OpenAI translation:', error);
    return `[Error translating: ${text}]`;
  }
};

export const translateAndSpeak = async (text, sourceLanguage, targetLanguage) => {
  try {
    // Translate the text - either with mock or real API
    let translatedText;
    if (MOCK_MODE) {
      translatedText = simulateTranslation(text, sourceLanguage, targetLanguage);
    } else {
      translatedText = await openAITranslate(text, sourceLanguage, targetLanguage);
    }
    
    // Generate speech for the translated text - mock or will be handled by WebSocket
    let speechAudio;
    if (MOCK_MODE) {
      speechAudio = await simulateTextToSpeech(translatedText, targetLanguage);
    } else {
      // In real API mode, speech is handled by the WebSocket connection in AudioRecorder
      // This is just a placeholder for interface compatibility
      speechAudio = new Blob([], { type: 'audio/wav' });
    }
    
    return { translatedText, speechAudio };
  } catch (error) {
    console.error('Error in translation service:', error);
    return { 
      translatedText: `[Error translating: ${text}]`, 
      speechAudio: new Blob([], { type: 'audio/wav' }) 
    };
  }
};
