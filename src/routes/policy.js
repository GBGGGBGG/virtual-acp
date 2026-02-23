const express = require('express');
const { state, snapshotState } = require('../core/state');

const router = express.Router();

router.get('/policy/versions', (_req, res) => {
  res.json({ versions: state.versions });
});

router.post('/policy/rollback', async (req, res) => {
  const { ts } = req.body || {};
  if (!ts) return res.status(400).json({ error: 'ts is required' });

  const target = state.versions.find((v) => v.ts === ts);
  if (!target) return res.status(404).json({ error: 'version not found' });

  state.params = { ...target.params };
  state.versions.unshift({ ts: new Date().toISOString(), params: { ...state.params }, reason: `rollback:${ts}` });
  state.versions = state.versions.slice(0, 10);

  await req.app.locals.store?.save(snapshotState()).catch(() => {});
  return res.json({ ok: true, params: state.params, rolledBackTo: ts });
});

module.exports = router;
