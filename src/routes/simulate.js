const express = require('express');
const { evaluateRequest } = require('../services/evaluator');

const router = express.Router();

router.post('/policy/simulate', async (req, res) => {
  const { samples = [], policy = 'default', mode = 'strict', insurance_mode = false } = req.body || {};
  if (!Array.isArray(samples) || samples.length === 0) {
    return res.status(400).json({ error: 'samples array is required' });
  }

  const results = [];
  let allow = 0;
  let deny = 0;

  for (let i = 0; i < samples.length; i += 1) {
    const sample = samples[i];
    const payload = {
      request_id: sample.request_id || `sim_${Date.now()}_${i}`,
      policy,
      mode,
      insurance_mode,
      context: sample.context || {},
      signals: sample.signals,
      requested_gates: sample.requested_gates || [],
      overrides: sample.overrides || {},
    };

    try {
      const out = await evaluateRequest(payload, null); // do not persist simulation
      if (out.decision === 'ALLOW') allow += 1;
      else deny += 1;
      results.push({ request_id: out.request_id, decision: out.decision, fails: out.fails, warns: out.warns, verification_score: out.verification.verification_score });
    } catch (error) {
      deny += 1;
      results.push({ request_id: payload.request_id, decision: 'DENY', code: error.message || 'DENY_SCHEMA' });
    }
  }

  return res.json({
    total: samples.length,
    allow,
    deny,
    allow_rate: Number((allow / Math.max(samples.length, 1)).toFixed(4)),
    deny_rate: Number((deny / Math.max(samples.length, 1)).toFixed(4)),
    results,
  });
});

module.exports = router;
