const path = require('path');
const fs = require('fs');

// Load environment variables from server .env and root .env if present
const serverEnvPath = path.resolve(__dirname, '../../.env');
const rootEnvPath = path.resolve(__dirname, '../../../.env');

if (fs.existsSync(serverEnvPath)) {
  require('dotenv').config({ path: serverEnvPath });
}
if (fs.existsSync(rootEnvPath)) {
  require('dotenv').config({ path: rootEnvPath });
}

const rawMockMode = process.env.MOCK_MODE;
const hasApiKey = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());

// Auto-default to mock mode if no OpenAI API key is supplied
let mockMode = rawMockMode === 'true';
if (!hasApiKey && rawMockMode !== 'false') {
  mockMode = true;
}

const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mockMode,
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-realtime-preview-2024-12-17',
  openaiVoice: process.env.OPENAI_VOICE || 'alloy',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/medical-interpreter',
  mongoDbName: process.env.MONGODB_DB_NAME || 'medical-interpreter',
  mongoTimeoutMs: parseInt(process.env.MONGODB_TIMEOUT_MS || '2000', 10),
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

module.exports = config;
