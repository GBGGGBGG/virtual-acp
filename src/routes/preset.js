const express = require('express');
const { evaluateRequest } = require('../services/evaluator');

const router = express.Router();

router.post('/policy/simulate/preset', async (req, res) => {
  const { sample } = req.body || {};
  if (!sample || !sample.signals) return res.status(400).json({ error: 'sample.signals required' });

  const base = {
    request_id: sample.request_id || `preset_${Date.now()}`,
    policy: sample.policy || 'default',
    context: sample.context || {},
    signals: sample.signals,
    requested_gates: sample.requested_gates || [],
    overrides: sample.overrides || {},
  };

  const runs = [
    { label: 'strict', mode: 'strict', insurance_mode: false },
    { label: 'lenient', mode: 'lenient', insurance_mode: false },
    { label: 'insurance', mode: 'strict', insurance_mode: true },
  ];

  const out = [];
  for (const r of runs) {
    try {
      const resObj = await evaluateRequest({ ...base, request_id: `${base.request_id}_${r.label}`, mode: r.mode, insurance_mode: r.insurance_mode }, null);
      out.push({ label: r.label, decision: resObj.decision, fails: resObj.fails, warns: resObj.warns, verification_score: resObj.verification.verification_score });
    } catch (e) {
      out.push({ label: r.label, decision: 'DENY', code: e.message || 'DENY_SCHEMA' });
    }
  }

  return res.json({ ok: true, base_request_id: base.request_id, results: out });
});

module.exports = router;
