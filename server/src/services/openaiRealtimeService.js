const axios = require('axios');
const config = require('../config');

class OpenaiRealtimeService {
  constructor(apiKey = config.openaiApiKey, mockMode = config.mockMode) {
    this.apiKey = apiKey;
    this.mockMode = mockMode;
  }

  async generateEphemeralKey() {
    if (this.mockMode) {
      const mockKey = `eph_mock_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      return {
        client_secret: {
          value: mockKey,
          expires_at: new Date(Date.now() + 60000).toISOString()
        },
        mode: 'simulation'
      };
    }

    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not configured');
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/realtime/sessions',
        {
          model: config.openaiModel,
          voice: config.openaiVoice
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`
          },
          timeout: 8000
        }
      );

      return response.data;
    } catch (error) {
      const detail = error.response?.data?.error?.message || error.message;
      throw new Error(`OpenAI Realtime Session negotiation failed: ${detail}`);
    }
  }
}

module.exports = OpenaiRealtimeService;
