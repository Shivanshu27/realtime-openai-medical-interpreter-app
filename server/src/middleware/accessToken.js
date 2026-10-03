const crypto = require('crypto');

function digest(value) {
  return crypto.createHash('sha256').update(String(value)).digest();
}

/**
 * Requires `Authorization: Bearer <APP_ACCESS_TOKEN>` when a token is
 * configured. Hashing both sides gives equal-length buffers, so the
 * comparison is constant-time regardless of what the caller sends.
 *
 * This is a shared access code, not per-user identity. A deployment with real
 * patients needs real authentication (hospital SSO) in front of this.
 */
function requireAccessToken(cfg) {
  return function accessTokenMiddleware(req, res, next) {
    if (!cfg.accessToken) {
      return next();
    }
    const header = req.get('authorization') || '';
    const match = /^Bearer\s+(.+)$/i.exec(header);
    const supplied = match ? match[1].trim() : '';
    if (supplied && crypto.timingSafeEqual(digest(supplied), digest(cfg.accessToken))) {
      return next();
    }
    res.set('WWW-Authenticate', 'Bearer realm="medical-interpreter"');
    return res.status(401).json({
      error: { message: 'A valid access token is required', statusCode: 401 },
    });
  };
}

module.exports = requireAccessToken;
