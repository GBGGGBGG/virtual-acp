const express = require('express');
const healthRoute = require('./routes/health');
const evalRoute = require('./routes/evaluate');
const policyRoute = require('./routes/policy');
const { createStore } = require('./services/store');
const { hydrateState } = require('./core/state');

async function boot() {
  const app = express();
  const store = createStore();
  app.locals.store = store;

  const saved = await store.load().catch(() => null);
  if (saved) hydrateState(saved);

  app.use(express.json({ limit: '1mb' }));
  app.use('/api', healthRoute);
  app.use('/api', evalRoute);
  app.use('/api', policyRoute);

  const PORT = process.env.PORT || 8787;
  app.listen(PORT, () => {
    console.log(`GateX ACP listening on http://localhost:${PORT}`);
  });
}

boot();
