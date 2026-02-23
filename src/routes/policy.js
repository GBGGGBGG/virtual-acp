const express = require('express');
const { state, snapshotState } = require('../core/state');
const { diffParams } = require('../utils/diff');

const router = express.Router();

router.get('/policy/versions', (_req, res) => {
  res.json({ versions: state.versions });
});

router.get('/policy/diff', (req, res) => {
  const { from, to } = req.query;
  const fromV = state.versions.find((v) => v.ts === from) || state.versions[state.versions.length - 1];
  const toV = state.versions.find((v) => v.ts === to) || state.versions[0];
  if (!fromV || !toV) return res.status(404).json({ error: 'versions unavailable' });
  return res.json({ from: fromV.ts, to: toV.ts, changes: diffParams(fromV.params, toV.params) });
});

async function doRollback(ts, app) {
  if (!ts) return { status: 400, body: { error: 'ts is required' } };

  const target = state.versions.find((v) => v.ts === ts);
  if (!target) return { status: 404, body: { error: 'version not found' } };

  state.params = { ...target.params };
  state.versions.unshift({ ts: new Date().toISOString(), params: { ...state.params }, reason: `rollback:${ts}` });
  state.versions = state.versions.slice(0, 10);

  await app.locals.store?.save(snapshotState()).catch(() => {});
  return { status: 200, body: { ok: true, params: state.params, rolledBackTo: ts } };
}

router.post('/policy/rollback', async (req, res) => {
  const out = await doRollback((req.body || {}).ts, req.app);
  return res.status(out.status).json(out.body);
});

router.post('/policy/rollback/:ts', async (req, res) => {
  const out = await doRollback(req.params.ts, req.app);
  return res.status(out.status).json(out.body);
});

module.exports = router;
