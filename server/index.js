const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();

// Add multer for file uploads
// const multer = require('multer');
// const upload = multer({ storage: multer.memoryStorage() });
// const fs = require('fs');
// const path = require('path');
// const os = require('os');

// Configuration
const MOCK_MODE = process.env.MOCK_MODE === 'true'; // Default to real API if not specified
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Check for required environment variables early
if (!MOCK_MODE && !OPENAI_API_KEY) {
  console.error('ERROR: OPENAI_API_KEY environment variable is not set, but MOCK_MODE is disabled.');
  console.error('Please set OPENAI_API_KEY in your .env file or enable MOCK_MODE=true');
  console.error('Current environment variables:', Object.keys(process.env));
}

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection string (for local development)
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/interpreter';
let db;

// Connect to MongoDB
async function connectToMongo() {
  try {
    const client = new MongoClient(mongoURI);
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db();
    return db;
  } catch (error) {
    console.error('Could not connect to MongoDB', error);
    process.exit(1);
  }
}

// Generate ephemeral API token for OpenAI Realtime API
app.post('/generate-ephemeral-key', async (req, res) => {
  try {
    if (MOCK_MODE) {
      // Mock mode - return a simulated key
      const mockEphemeralKey = {
        client_secret: {
          value: `eph_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
          expires_at: new Date(Date.now() + 60000).toISOString() // Expires in 1 minute
        }
      };
      console.log('Generated mock ephemeral key:', mockEphemeralKey);
      return res.json(mockEphemeralKey);
    }
    
    // Check API key before making the request
    if (!OPENAI_API_KEY) {
      console.error('Cannot generate ephemeral key: OPENAI_API_KEY is not set');
      return res.status(500).json({ 
        error: 'OpenAI API key is missing', 
        details: 'Please set OPENAI_API_KEY in your .env file' 
      });
    }
    
    console.log('Making API request with key:', OPENAI_API_KEY.substring(0, 5) + '...');
    
    // Real API call to OpenAI to generate ephemeral token - updated to use the correct endpoint
    const response = await axios.post(
      'https://api.openai.com/v1/realtime/sessions',
      {
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "verse"
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );
    
    console.log('Generated real ephemeral token');
    res.json(response.data);
  } catch (error) {
    console.error('Error generating ephemeral token:', error);
    res.status(500).json({ error: 'Failed to generate ephemeral token', details: error.message });
  }
});

// Store conversation in database
app.post('/conversations', async (req, res) => {
  try {
    const { messages } = req.body;
    const result = await db.collection('conversations').insertOne({
      messages,
      timestamp: new Date()
    });
    res.status(201).json({ id: result.insertedId });
  } catch (error) {
    console.error('Error saving conversation:', error);
    res.status(500).json({ error: 'Failed to save conversation' });
  }
});


// Translation endpoint
app.post('/translate', async (req, res) => {
  try {
    if (MOCK_MODE) {
      // Mock translation
      const { text, source_language, target_language } = req.body;
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
      
      const translation = translations[source_language]?.[target_language]?.[text] || 
        `[Translation of: ${text}]`;
      
      return res.json({ translatedText: translation });
    }
    
    // Real API call to OpenAI for translation
    const { text, source_language, target_language } = req.body;
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4o",  // Updated to use a current model
        messages: [
          {
            role: "system",
            content: `You are a professional medical translator. Translate from ${source_language} to ${target_language}. Maintain medical accuracy while making the translation natural and fluent.`
          },
          {
            role: "user",
            content: text
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );
    
    const translatedText = response.data.choices[0].message.content;
    res.json({ translatedText });
  } catch (error) {
    console.error('Error translating text:', error);
    res.status(500).json({ error: 'Failed to translate text', details: error.message });
  }
});


// 

// Transcription endpoint - updated to use the current API
// app.post('/transcribe', upload.single('audio'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No audio file provided' });
//     }
    
//     if (MOCK_MODE) {
//       // Mock transcription
//       const language = req.body.language || 'english';
//       const mockTranscriptions = {
//         english: "I need to check your symptoms",
//         spanish: "Me duele la cabeza desde hace dos días"
//       };
      
//       return res.json({ text: mockTranscriptions[language] });
//     }
    
//     // Save the file temporarily
//     const tempFilePath = path.join(os.tmpdir(), `transcribe_${Date.now()}.webm`);
//     fs.writeFileSync(tempFilePath, req.file.buffer);
    
//     // Language parameter
//     const language = req.body.language || 'english';
    
//     try {
//       // Call OpenAI's transcription API - updated to use current model and parameters
//       const formData = new FormData();
//       formData.append('file', fs.createReadStream(tempFilePath));
//       formData.append('model', 'gpt-4o-transcribe'); // Updated to new model
//       formData.append('response_format', 'text');
      
//       // Add language-specific prompt
//       if (language === 'english') {
//         formData.append('prompt', 'This is a medical conversation in English.');
//       } else if (language === 'spanish') {
//         formData.append('prompt', 'Esta es una conversación médica en español.');
//       }
      
//       const response = await axios.post(
//         'https://api.openai.com/v1/audio/transcriptions',
//         formData,
//         {
//           headers: {
//             'Authorization': `Bearer ${OPENAI_API_KEY}`,
//             'Content-Type': 'multipart/form-data',
//           }
//         }
//       );
      
//       // Clean up temp file
//       fs.unlinkSync(tempFilePath);
      
//       res.json({ text: response.data });  // Updated to match new response format
//     } catch (error) {
//       // Clean up temp file in case of error
//       if (fs.existsSync(tempFilePath)) {
//         fs.unlinkSync(tempFilePath);
//       }
//       throw error;
//     }
//   } catch (error) {
//     console.error('Error transcribing audio:', error);
//     res.status(500).json({ error: 'Failed to transcribe audio', details: error.message });
//   }
// });

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Running in ${MOCK_MODE ? 'MOCK' : 'REAL API'} mode`);
  await connectToMongo().catch(console.error);
});
