const express = require('express');
const healthRoute = require('./routes/health');
const evalRoute = require('./routes/evaluate');
const policyRoute = require('./routes/policy');
const reportRoute = require('./routes/report');
const stabilityRoute = require('./routes/stability');
const simulateRoute = require('./routes/simulate');
const simulateBatchRoute = require('./routes/simulate-batch');
const presetRoute = require('./routes/preset');
const webhookRoute = require('./routes/webhook');
const webhookVerifyRoute = require('./routes/webhook-verify');
const exportRoute = require('./routes/export');
const acpRoute = require('./routes/acp');
const { adminAuth } = require('./middleware/adminAuth');
const { createStore } = require('./services/store');
const { hydrateState } = require('./core/state');
const { evaluateRequest } = require('./services/evaluator');

async function boot() {
  const app = express();
  const store = createStore();
  app.locals.store = store;
  app.locals.evaluate = (payload) => evaluateRequest(payload, store);

  const saved = await store.load().catch(() => null);
  if (saved) hydrateState(saved);

  app.use(express.json({ limit: '1mb' }));
  app.use('/api', healthRoute);
  app.use('/api', evalRoute);
  app.use('/api', webhookRoute);
  app.use('/api', webhookVerifyRoute);
  app.use('/api', acpRoute);

  // admin-protected endpoints (token optional in dev)
  app.use('/api', adminAuth, policyRoute);
  app.use('/api', adminAuth, simulateRoute);
  app.use('/api', adminAuth, simulateBatchRoute);
  app.use('/api', adminAuth, presetRoute);
  app.use('/api', adminAuth, reportRoute);
  app.use('/api', adminAuth, stabilityRoute);
  app.use('/api', adminAuth, exportRoute);

  const PORT = process.env.PORT || 8787;
  app.listen(PORT, () => {
    console.log(`GateX ACP listening on http://localhost:${PORT}`);
  });
}

boot();
