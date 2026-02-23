const express = require('express');
const { evaluateRequest } = require('../services/evaluator');

const router = express.Router();

router.post('/gate/evaluate', async (req, res) => {
  try {
    const response = await evaluateRequest(req.body || {}, req.app.locals.store);
    return res.json(response);
  } catch (error) {
    if (error.message === 'DENY_SCHEMA') {
      return res.status(400).json({ decision: 'DENY', code: 'DENY_SCHEMA', errors: error.issues || [] });
    }
    return res.status(error.status || 500).json({ decision: 'DENY', code: 'DENY_INTERNAL', error: String(error.message || error) });
  }
});

module.exports = router;
