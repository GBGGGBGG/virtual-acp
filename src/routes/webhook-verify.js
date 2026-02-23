const express = require('express');
const { signPayload } = require('../services/signing');

const router = express.Router();

router.post('/webhook/verify', (req, res) => {
  const { payload, signature } = req.body || {};
  if (!payload || !signature) return res.status(400).json({ ok: false, error: 'payload and signature required' });

  const expected = signPayload(payload);
  const ok = expected === signature;
  return res.json({ ok, expected });
});

module.exports = router;
