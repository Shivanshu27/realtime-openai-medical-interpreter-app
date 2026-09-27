const createApp = require('./src/app');
const config = require('./src/config');
const { getRepository } = require('./src/repositories');

async function startServer() {
  const app = createApp();

  // Initialize storage repository (gracefully falls back if MongoDB is offline)
  const repo = await getRepository();
  const storageType = repo.getStorageType();

  const server = app.listen(config.port, () => {
    console.log('====================================================');
    console.log('🏥 Real-Time Medical Interpreter Server');
    console.log(`📡 Listening on: http://localhost:${config.port}`);
    console.log(`⚙️  Environment: ${config.nodeEnv}`);
    console.log(`🤖 Mode: ${config.mockMode ? 'SIMULATION (Offline / Zero-Credit)' : 'OPENAI REALTIME (Live API)'}`);
    console.log(`💾 Storage: ${storageType}`);
    console.log('====================================================');
  });

  // Graceful shutdown handling
  const shutdown = async (signal) => {
    console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
    server.close(async () => {
      try {
        await repo.close();
        console.log('[Server] Connections closed. Clean exit.');
        process.exit(0);
      } catch (err) {
        console.error('[Server] Error during shutdown:', err);
        process.exit(1);
      }
    });

    // Force shutdown after timeout
    setTimeout(() => {
      console.error('[Server] Forced shutdown after timeout');
      process.exit(1);
    }, 5000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  return { app, server, repo };
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
  });
}

module.exports = startServer;
