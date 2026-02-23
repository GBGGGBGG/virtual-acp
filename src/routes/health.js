const express = require('express');
const { state } = require('../core/state');

const router = express.Router();

router.get('/health', async (req, res) => {
  const store = await req.app.locals.store?.health?.().catch(() => ({ ok: false, type: 'unknown' }));
  res.json({ ok: true, service: 'GateX ACP', now: new Date().toISOString(), totals: state.totals, store });
});

module.exports = router;
