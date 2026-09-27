const config = require('../config');
const { getRepository } = require('../repositories');

const startTime = Date.now();

async function getHealth(req, res, next) {
  try {
    const repo = await getRepository();
    const storageType = repo.getStorageType();

    res.json({
      status: 'healthy',
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      mode: config.mockMode ? 'simulation' : 'production-realtime',
      storage: storageType,
      environment: config.nodeEnv,
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getHealth
};
