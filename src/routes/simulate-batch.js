const express = require('express');
const fs = require('fs');
const path = require('path');
const { evaluateRequest } = require('../services/evaluator');

const router = express.Router();

router.post('/policy/simulate/batch-file', async (req, res) => {
  const filePath = req.body?.filePath;
  if (!filePath) return res.status(400).json({ error: 'filePath is required' });

  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) return res.status(404).json({ error: 'file not found' });

  const lines = fs.readFileSync(abs, 'utf-8').split('\n').filter(Boolean);
  const results = [];
  let allow = 0;
  let deny = 0;

  for (let i = 0; i < lines.length; i += 1) {
    let sample;
    try {
      sample = JSON.parse(lines[i]);
    } catch {
      deny += 1;
      results.push({ line: i + 1, decision: 'DENY', code: 'INVALID_JSONL' });
      continue;
    }

    const payload = {
      request_id: sample.request_id || `batch_${Date.now()}_${i}`,
      policy: sample.policy || 'default',
      mode: sample.mode || 'strict',
      insurance_mode: Boolean(sample.insurance_mode),
      context: sample.context || {},
      signals: sample.signals,
      requested_gates: sample.requested_gates || [],
      overrides: sample.overrides || {},
    };

    try {
      const out = await evaluateRequest(payload, null);
      if (out.decision === 'ALLOW') allow += 1;
      else deny += 1;
      results.push({ line: i + 1, request_id: out.request_id, decision: out.decision, fails: out.fails });
    } catch (e) {
      deny += 1;
      results.push({ line: i + 1, request_id: payload.request_id, decision: 'DENY', code: e.message || 'DENY_SCHEMA' });
    }
  }

  return res.json({
    file: abs,
    total: lines.length,
    allow,
    deny,
    allow_rate: Number((allow / Math.max(lines.length, 1)).toFixed(4)),
    deny_rate: Number((deny / Math.max(lines.length, 1)).toFixed(4)),
    results,
  });
});

module.exports = router;
