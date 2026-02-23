const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const presetRoute = require('../src/routes/preset');

function app() {
  const a = express();
  a.use(express.json());
  a.use('/api', presetRoute);
  return a;
}

test('preset simulation returns 3 scenarios', async () => {
  const a = app();
  const server = a.listen(0);
  const port = server.address().port;

  const payload = {
    sample: {
      request_id: 'p1',
      signals: {
        risk: { score: 0.5, confidence: 0.9 },
        market: { volatility: 0.2, slippage_bps: 8 },
        cost: { fee_usd: 1, expected_value_usd: 12, this_cost_usd: 1 },
        account: { balance_usd: 1000, position_size_usd: 60 },
        activity: { recent_failures: 0, recent_actions_5m: 2, failure_rate_20: 0.03 },
        budget: { today_spend_usd: 10, daily_budget_usd: 200, hard_cap_usd: 500 },
        counterparty: { agent_reputation: 0.9, recent_success_rate: 0.9, recent_failure_rate: 0.1, reviews_count: 10, last_seen_days: 1, price_usd: 5 },
      },
    },
  };

  const res = await fetch(`http://localhost:${port}/api/policy/simulate/preset`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const out = await res.json();
  server.close();

  assert.equal(res.status, 200);
  assert.equal(out.results.length, 3);
});
