const cors = require('cors');

/**
 * CORS allow-list. A browser on an origin that is not listed gets no
 * Access-Control-Allow-Origin header, so it cannot read responses. Requests
 * without an Origin header (curl, server-to-server) are not a CORS concern;
 * the access token protects those.
 */
function corsAllowList(cfg) {
  return cors((req, callback) => {
    const origin = req.get('origin');
    const sameOrigin = origin && origin === `${req.protocol}://${req.get('host')}`;
    const allowed = !origin || sameOrigin || cfg.corsOrigins.includes(origin);
    callback(null, {
      origin: allowed ? origin || false : false,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 600,
    });
  });
}

module.exports = corsAllowList;
