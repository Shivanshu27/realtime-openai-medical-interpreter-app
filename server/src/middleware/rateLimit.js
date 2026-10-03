/**
 * Fixed-window rate limiter keyed by client IP and limiter name.
 *
 * In-memory and per-process: correct for a single instance. Behind several
 * instances the limit would need a shared store (Redis), otherwise each
 * instance grants its own budget.
 */
function rateLimit({ name, windowMs, max }) {
  const hits = new Map(); // key -> { count, resetAt }

  return function rateLimitMiddleware(req, res, next) {
    const now = Date.now();
    const key = `${name}:${req.ip}`;
    let entry = hits.get(key);
    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;

    const remaining = Math.max(0, max - entry.count);
    const resetSeconds = Math.ceil((entry.resetAt - now) / 1000);
    res.set('RateLimit-Limit', String(max));
    res.set('RateLimit-Remaining', String(remaining));
    res.set('RateLimit-Reset', String(resetSeconds));

    if (entry.count > max) {
      res.set('Retry-After', String(resetSeconds));
      return res.status(429).json({
        error: { message: 'Too many requests, slow down', statusCode: 429 },
      });
    }

    // Opportunistic cleanup so the map cannot grow without bound.
    if (hits.size > 10000) {
      for (const [k, v] of hits) {
        if (now >= v.resetAt) hits.delete(k);
      }
    }
    return next();
  };
}

module.exports = rateLimit;
