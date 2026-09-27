const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes/apiRoutes');
const legacyRoutes = require('./routes/legacyRoutes');

function createApp() {
  const app = express();

  // Core Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

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
