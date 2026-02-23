async function run() {
  const url = process.env.GATEX_BASE_URL || 'http://127.0.0.1:8787';
  const payload = {
    request_id: `js-${Date.now()}`,
    policy: 'default',
    mode: 'strict',
    insurance_mode: false,
    signals: {
      risk: { score: 0.42, confidence: 0.86 },
      market: { volatility: 0.24, slippage_bps: 12 },
      cost: { fee_usd: 1, expected_value_usd: 12, this_cost_usd: 1 },
      account: { balance_usd: 2000, position_size_usd: 120 },
      activity: { recent_failures: 0, recent_actions_5m: 2, failure_rate_20: 0.03 },
      budget: { today_spend_usd: 10, daily_budget_usd: 200, hard_cap_usd: 500 },
      counterparty: { agent_reputation: 0.85, recent_success_rate: 0.82, recent_failure_rate: 0.12, reviews_count: 20, last_seen_days: 2, price_usd: 2 },
    },
  };

  const res = await fetch(`${url}/api/gate/evaluate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`HTTP ${res.status}: ${errBody}`);
  }
  const out = await res.json();

  console.log({
    decision: out.decision,
    fails: out.fails,
    verification_score: out.verification?.verification_score,
    processing_ms: out.runtime?.processing_ms,
    clamped_position_usd: out.computed?.clamped_position_usd,
  });
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
