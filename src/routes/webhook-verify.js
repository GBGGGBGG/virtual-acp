const express = require('express');
const { signPayload } = require('../services/signing');
const { timingSafeEqualString } = require('../middleware/adminAuth');

const router = express.Router();

router.post('/webhook/verify', (req, res) => {
  const { payload, signature } = req.body || {};
  if (!payload || !signature) return res.status(400).json({ ok: false, error: 'payload and signature required' });

  const expected = signPayload(payload);
  const ok = timingSafeEqualString(expected, String(signature));
  return res.json({ ok, expected });
});

module.exports = router;
