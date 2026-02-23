const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateRequest } = require('../src/services/evaluator');

function payload() {
  return {
    request_id: 't-1',
    policy: 'default',
    mode: 'strict',
    insurance_mode: false,
    signals: {
      risk: { score: 0.4, confidence: 0.8 },
      market: { volatility: 0.2, slippage_bps: 10 },
      cost: { fee_usd: 1, expected_value_usd: 20, this_cost_usd: 1 },
      account: { balance_usd: 1000, position_size_usd: 50 },
      activity: { recent_failures: 0, recent_actions_5m: 1, failure_rate_20: 0.02 },
      budget: { today_spend_usd: 2, daily_budget_usd: 100, hard_cap_usd: 200 },
      counterparty: { agent_reputation: 0.9, recent_success_rate: 0.9, recent_failure_rate: 0.1, reviews_count: 1, last_seen_days: 1, price_usd: 1 },
    },
  };
}

test('evaluateRequest returns signed response', async () => {
  const out = await evaluateRequest(payload(), null);
  assert.equal(typeof out.signature, 'string');
  assert.ok(out.signature.length >= 32);
  assert.equal(typeof out.runtime.processing_ms, 'number');
  assert.ok(out.runtime.processing_ms >= 0);
});
