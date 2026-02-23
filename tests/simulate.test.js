const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const simulateRoute = require('../src/routes/simulate');

function app() {
  const a = express();
  a.use(express.json());
  a.use('/api', simulateRoute);
  return a;
}

test('simulate endpoint returns summary', async () => {
  const a = app();
  const server = a.listen(0);
  const port = server.address().port;

  const payload = {
    samples: [
      {
        request_id: 's1',
        signals: {
          risk: { score: 0.4, confidence: 0.8 },
          market: { volatility: 0.2, slippage_bps: 10 },
          cost: { fee_usd: 1, expected_value_usd: 10, this_cost_usd: 1 },
          account: { balance_usd: 1000, position_size_usd: 50 },
          activity: { recent_failures: 0, recent_actions_5m: 1, failure_rate_20: 0.02 },
          budget: { today_spend_usd: 1, daily_budget_usd: 100, hard_cap_usd: 200 },
          counterparty: { agent_reputation: 0.9, recent_success_rate: 0.9, recent_failure_rate: 0.1, reviews_count: 2, last_seen_days: 1, price_usd: 1 },
        },
      },
    ],
  };

  const res = await fetch(`http://localhost:${port}/api/policy/simulate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const out = await res.json();
  server.close();

  assert.equal(res.status, 200);
  assert.equal(out.total, 1);
  assert.ok(typeof out.allow_rate === 'number');
});
