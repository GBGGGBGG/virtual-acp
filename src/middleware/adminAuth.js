function adminAuth(req, res, next) {
  const required = process.env.GATEX_ADMIN_TOKEN;
  if (!required) return next(); // dev fallback

  const provided = req.headers['x-gatex-admin-token'] || '';
  if (provided !== required) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  return next();
}

module.exports = { adminAuth };
