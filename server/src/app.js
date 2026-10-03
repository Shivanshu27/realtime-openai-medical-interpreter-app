const express = require('express');
const path = require('path');
const fs = require('fs');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes/apiRoutes');
const legacyRoutes = require('./routes/legacyRoutes');
const defaultConfig = require('./config');
const corsAllowList = require('./middleware/cors');
const requireAccessToken = require('./middleware/accessToken');
const rateLimit = require('./middleware/rateLimit');

// Routes that mint billable Realtime sessions, spend model tokens, or touch
// transcripts (PHI). /health stays public for load balancers.
const SESSION_PATHS = ['/api/session', '/generate-ephemeral-key'];
const DATA_PATHS = ['/api/translate', '/translate', '/api/conversations', '/conversations'];

function createApp({ config: cfg = defaultConfig } = {}) {
  const app = express();

  // Core Middleware
  app.use(corsAllowList(cfg));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  // Guards run before the routers. Rate limiting comes first so that guessing
  // the access token is throttled too.
  const guard = requireAccessToken(cfg);
  const windowMs = cfg.rateLimitWindowMs;
  app.use(SESSION_PATHS, rateLimit({ name: 'session', windowMs, max: cfg.sessionRateLimitMax }), guard);
  app.use(DATA_PATHS, rateLimit({ name: 'api', windowMs, max: cfg.apiRateLimitMax }), guard);

  // Mount API & Legacy routes
  app.use('/api', apiRoutes);
  app.use('/', legacyRoutes);

  // In production or containerized environments, serve built static client if present
  const clientBuildPath = path.resolve(__dirname, '../../../client/build');
  const alternateBuildPath = path.resolve(__dirname, '../../client/build');
  const resolvedBuildPath = fs.existsSync(clientBuildPath)
    ? clientBuildPath
    : fs.existsSync(alternateBuildPath)
    ? alternateBuildPath
    : null;

  if (resolvedBuildPath) {
    app.use(express.static(resolvedBuildPath));
    app.get('*', (req, res, next) => {
      if (
        req.path.startsWith('/api') ||
        req.path === '/health' ||
        req.path === '/translate' ||
        req.path === '/generate-ephemeral-key' ||
        req.path === '/conversations'
      ) {
        return next();
      }
      res.sendFile(path.join(resolvedBuildPath, 'index.html'));
    });
  }

  // 404 Handler
  app.use((req, res, next) => {
    res.status(404).json({
      error: {
        message: `Cannot ${req.method} ${req.originalUrl}`,
        statusCode: 404
      }
    });
  });

  // Central Error Handler
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
