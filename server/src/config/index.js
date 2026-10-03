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

  // Access control. Every route that mints a Realtime session, spends model
  // tokens, or reads/writes transcripts requires this Bearer token when set.
  accessToken: (process.env.APP_ACCESS_TOKEN || '').trim(),

  // Browser origins allowed to call the API (comma-separated). Same-origin
  // requests (the server serving the built client) are always allowed.
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  // Per-client fixed-window rate limits (in-memory, single process).
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  sessionRateLimitMax: parseInt(process.env.SESSION_RATE_LIMIT_MAX || '10', 10),
  apiRateLimitMax: parseInt(process.env.API_RATE_LIMIT_MAX || '60', 10),
};

/**
 * Fail closed: live mode mints real, billable OpenAI sessions, so it must not
 * run with open endpoints. Simulation mode stays zero-config for reviewers.
 */
function validateConfig(cfg = config) {
  if (!cfg.mockMode && !cfg.accessToken) {
    throw new Error(
      'APP_ACCESS_TOKEN is required when MOCK_MODE=false (live OpenAI sessions are billable). ' +
        'Set it, or run in simulation mode.'
    );
  }
  return cfg;
}

module.exports = config;
module.exports.validateConfig = validateConfig;
