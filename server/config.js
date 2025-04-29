const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Check if .env file exists in parent directory
const parentEnvPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(parentEnvPath)) {
  console.log('Loading environment variables from parent directory .env file');
  require('dotenv').config({ path: parentEnvPath });
}

// Check for critical environment variables
function validateEnvironment() {
  console.log('Environment validation:');
  console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('- MOCK_MODE:', process.env.MOCK_MODE || 'not set');
  console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'set' : 'not set');
  
  if (process.env.MOCK_MODE !== 'true' && !process.env.OPENAI_API_KEY) {
    console.warn('⚠️ WARNING: OPENAI_API_KEY is not set but MOCK_MODE is disabled.');
    console.warn('The application will use mock data instead of calling the OpenAI API.');
    
    // Force mock mode to true when API key is missing
    process.env.MOCK_MODE = 'true';
    console.log('- MOCK_MODE has been forced to true due to missing API key');
  } else if (process.env.MOCK_MODE === 'true') {
    console.log('- Running in MOCK mode (no API calls will be made)');
  } else {
    console.log('- OpenAI API key found, length:', process.env.OPENAI_API_KEY.length);
  }
}

validateEnvironment();

module.exports = {
  MOCK_MODE: process.env.MOCK_MODE === 'true',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/medical-interpreter',
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'medical-interpreter'
};
