const express = require('express');
const { signPayload } = require('../services/signing');
const { adminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.post('/webhook/sign', adminAuth, (req, res) => {
  const body = req.body || {};
  const signature = signPayload(body);
  return res.json({ ok: true, signature, algorithm: 'HMAC-SHA256' });
});

module.exports = router;
