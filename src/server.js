const express = require('express');
const healthRoute = require('./routes/health');
const evalRoute = require('./routes/evaluate');
const policyRoute = require('./routes/policy');
const reportRoute = require('./routes/report');
const acpRoute = require('./routes/acp');
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
  app.use('/api', policyRoute);
  app.use('/api', reportRoute);
  app.use('/api', acpRoute);

  const PORT = process.env.PORT || 8787;
  app.listen(PORT, () => {
    console.log(`GateX ACP listening on http://localhost:${PORT}`);
  });
}

boot();
