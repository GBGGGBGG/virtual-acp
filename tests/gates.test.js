const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateGates } = require('../src/gates/evaluate');
const { DEFAULT_PARAMS } = require('../src/config/defaults');

function baseReq() {
  return {
    mode: 'strict',
    insurance_mode: false,
    signals: {
      risk: { score: 0.4, confidence: 0.8 },
      market: { volatility: 0.3, slippage_bps: 10 },
      cost: { fee_usd: 1, expected_value_usd: 20, this_cost_usd: 1 },
      account: { balance_usd: 1000, position_size_usd: 100 },
      activity: { recent_failures: 0, recent_actions_5m: 2, failure_rate_20: 0.03 },
      budget: { today_spend_usd: 10, daily_budget_usd: 100, hard_cap_usd: 200 },
      counterparty: { agent_reputation: 0.8, recent_success_rate: 0.8, recent_failure_rate: 0.1, reviews_count: 10, last_seen_days: 1, price_usd: 5 },
    },
  };
}

test('allows healthy request', () => {
  const out = evaluateGates(baseReq(), { ...DEFAULT_PARAMS });
  assert.equal(out.decision, 'ALLOW');
});

test('denies high risk', () => {
  const req = baseReq();
  req.signals.risk.score = 0.95;
  const out = evaluateGates(req, { ...DEFAULT_PARAMS });
  assert.equal(out.decision, 'DENY');
  assert.ok(out.fails.includes('DENY_RISK'));
});

test('denies budget overflow', () => {
  const req = baseReq();
  req.signals.budget.today_spend_usd = 99;
  req.signals.cost.this_cost_usd = 5;
  const out = evaluateGates(req, { ...DEFAULT_PARAMS });
  assert.ok(out.fails.includes('DENY_BUDGET'));
});
