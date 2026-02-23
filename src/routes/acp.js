const express = require('express');

const router = express.Router();

/**
 * Thin ACP adapter endpoint.
 * Accepts ACP-style payload and internally forwards to gate evaluator format.
 */
router.post('/acp/execute', async (req, res) => {
  const payload = req.body || {};

  const mapped = {
    request_id: payload.request_id || `acp_${Date.now()}`,
    policy: payload.policy || 'default',
    mode: payload.mode || 'strict',
    insurance_mode: Boolean(payload.insurance_mode),
    context: payload.context || {},
    signals: payload.signals,
    requested_gates: payload.requested_gates || [],
    overrides: payload.overrides || {},
  };

  try {
    const response = await req.app.locals.evaluate(mapped);
    return res.json({ ok: true, acp: 'GateX', result: response });
  } catch (error) {
    return res.status(400).json({ ok: false, acp: 'GateX', error: String(error.message || error) });
  }
});

module.exports = router;
