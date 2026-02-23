#!/usr/bin/env node
const http = require('http');

const base = process.env.GATEX_BASE_URL || 'http://localhost:8787';

function req(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(path, base);
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method,
      headers: data ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(data) } : {},
    };

    const t0 = Date.now();
    const r = http.request(options, (res) => {
      let buf = '';
      res.on('data', (d) => (buf += d));
      res.on('end', () => {
        resolve({ status: res.statusCode, ms: Date.now() - t0, body: buf });
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

(async () => {
  try {
    const health = await req('/api/health');
    const evalRes = await req('/api/gate/evaluate', 'POST', {
      request_id: 'preflight-1', policy: 'default', mode: 'strict', insurance_mode: false,
      signals: {
        risk: { score: 0.4, confidence: 0.8 }, market: { volatility: 0.2, slippage_bps: 10 },
        cost: { fee_usd: 1, expected_value_usd: 10, this_cost_usd: 1 },
        account: { balance_usd: 1000, position_size_usd: 100 },
        activity: { recent_failures: 0, recent_actions_5m: 2, failure_rate_20: 0.02 },
        budget: { today_spend_usd: 1, daily_budget_usd: 100, hard_cap_usd: 1000 },
        counterparty: { agent_reputation: 0.8, recent_success_rate: 0.8, recent_failure_rate: 0.2, reviews_count: 3, last_seen_days: 1, price_usd: 2 },
      },
    });

    const out = {
      ok: health.status === 200 && evalRes.status === 200,
      health_status: health.status,
      health_latency_ms: health.ms,
      eval_status: evalRes.status,
      eval_latency_ms: evalRes.ms,
      p95_target_ms: 1000,
      latency_ok: evalRes.ms < 1000,
    };

    console.log(JSON.stringify(out, null, 2));
    process.exit(out.ok ? 0 : 1);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
