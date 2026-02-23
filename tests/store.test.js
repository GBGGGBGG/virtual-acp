const test = require('node:test');
const assert = require('node:assert/strict');
const { createStore } = require('../src/services/store');

test('memory store keeps unique version history with newest first', async () => {
  const store = createStore();
  assert.equal(store.type, 'memory');

  await store.pushVersion({ ts: '2026-02-23T12:00:00.000Z', params: { risk_deny: 0.8 }, reason: 'init' });
  await store.pushVersion({ ts: '2026-02-23T12:01:00.000Z', params: { risk_deny: 0.79 }, reason: 'adaptive-tune' });
  await store.pushVersion({ ts: '2026-02-23T12:01:00.000Z', params: { risk_deny: 0.79 }, reason: 'adaptive-tune' });

  const rows = await store.getVersionHistory(10);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].ts, '2026-02-23T12:01:00.000Z');
  assert.equal(rows[1].ts, '2026-02-23T12:00:00.000Z');
});
