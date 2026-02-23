const test = require('node:test');
const assert = require('node:assert/strict');
const { state, snapshotState, hydrateState } = require('../src/core/state');

test('snapshotState returns required top-level keys', () => {
  const s = snapshotState();
  assert.ok(s.params);
  assert.ok(s.totals);
  assert.ok(Array.isArray(s.metricsWindow));
  assert.ok(Array.isArray(s.versions));
});

test('hydrateState applies persisted params/totals', () => {
  const before = snapshotState();
  hydrateState({
    params: { ...before.params, risk_deny: 0.77 },
    totals: { ...before.totals, total_requests: 999 },
    metricsWindow: before.metricsWindow,
    versions: before.versions,
  });
  assert.equal(state.params.risk_deny, 0.77);
  assert.equal(state.totals.total_requests, 999);

  // restore
  hydrateState(before);
});
