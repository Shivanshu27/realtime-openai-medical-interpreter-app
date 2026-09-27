const OpenaiRealtimeService = require('../services/openaiRealtimeService');

const realtimeService = new OpenaiRealtimeService();

async function generateEphemeralKey(req, res, next) {
  try {
    const sessionData = await realtimeService.generateEphemeralKey();
    res.json(sessionData);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  generateEphemeralKey
};
