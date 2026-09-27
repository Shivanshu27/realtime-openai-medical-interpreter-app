function requestLogger(req, res, next) {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[HTTP] ${method} ${originalUrl} -> ${status} (${duration}ms)`);
    }
  });

  next();
}

module.exports = requestLogger;
