const crypto = require('crypto');

function getProvidedToken(req) {
  const headerToken = req.headers['x-gatex-admin-token'];
  if (typeof headerToken === 'string' && headerToken.trim()) return headerToken.trim();

  const auth = req.headers.authorization;
  if (typeof auth === 'string') {
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (m && m[1] && m[1].trim()) return m[1].trim();
  }

  return '';
}

function timingSafeEqualString(a, b) {
  const ba = Buffer.from(a || '', 'utf8');
  const bb = Buffer.from(b || '', 'utf8');
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function adminAuth(req, res, next) {
  const required = process.env.GATEX_ADMIN_TOKEN;
  if (!required) return next(); // dev fallback

  const provided = getProvidedToken(req);
  if (!timingSafeEqualString(provided, required)) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  return next();
}

module.exports = { adminAuth, getProvidedToken, timingSafeEqualString };
