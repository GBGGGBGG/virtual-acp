#!/usr/bin/env node
const { spawn } = require('child_process');
const http = require('http');

const BASE = 'http://127.0.0.1:8787';

function req(path, { method = 'GET', body, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(path, BASE);
    const data = body ? JSON.stringify(body) : null;
    const r = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        method,
        headers: {
          ...(data ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(data) } : {}),
          ...headers,
        },
      },
      (res) => {
        let buf = '';
        res.on('data', (d) => (buf += d));
        res.on('end', () => {
          let parsed = null;
          try { parsed = JSON.parse(buf); } catch { parsed = buf; }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

async function waitUntilUp(ms = 8000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      const h = await req('/api/health');
      if (h.status === 200) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

(async () => {
  const child = spawn('node', ['src/server.js'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      PORT: '8787',
      GATEX_ADMIN_TOKEN: process.env.GATEX_ADMIN_TOKEN || 'smoke-admin-token',
    },
  });

  child.stdout.on('data', () => {});
  child.stderr.on('data', () => {});

  try {
    const up = await waitUntilUp();
    if (!up) throw new Error('server did not start in time');

    const health = await req('/api/health');
    const evalRes = await req('/api/gate/evaluate', {
      method: 'POST',
      body: {
        request_id: 'smoke-1', policy: 'default', mode: 'strict', insurance_mode: false,
        signals: {
          risk: { score: 0.4, confidence: 0.8 }, market: { volatility: 0.2, slippage_bps: 10 },
          cost: { fee_usd: 1, expected_value_usd: 10, this_cost_usd: 1 },
          account: { balance_usd: 1000, position_size_usd: 100 },
          activity: { recent_failures: 0, recent_actions_5m: 2, failure_rate_20: 0.02 },
          budget: { today_spend_usd: 1, daily_budget_usd: 100, hard_cap_usd: 1000 },
          counterparty: { agent_reputation: 0.8, recent_success_rate: 0.8, recent_failure_rate: 0.2, reviews_count: 3, last_seen_days: 1, price_usd: 2 },
        },
      },
    });

    const policy401 = await req('/api/policy/versions');
    const policy200 = await req('/api/policy/versions', {
      headers: { 'x-gatex-admin-token': process.env.GATEX_ADMIN_TOKEN || 'smoke-admin-token' },
    });

    const payload = { t: Date.now(), kind: 'smoke' };
    const sign401 = await req('/api/webhook/sign', { method: 'POST', body: payload });
    const sign200 = await req('/api/webhook/sign', {
      method: 'POST',
      body: payload,
      headers: { 'x-gatex-admin-token': process.env.GATEX_ADMIN_TOKEN || 'smoke-admin-token' },
    });
    const verify = await req('/api/webhook/verify', {
      method: 'POST',
      body: { payload, signature: sign200.body.signature },
    });

    const ok =
      health.status === 200 &&
      evalRes.status === 200 &&
      policy401.status === 401 &&
      policy200.status === 200 &&
      sign401.status === 401 &&
      sign200.status === 200 &&
      verify.status === 200 && verify.body.ok === true;

    console.log(JSON.stringify({
      ok,
      checks: {
        health: health.status,
        evaluate: evalRes.status,
        policy_unauthorized: policy401.status,
        policy_authorized: policy200.status,
        webhook_sign_unauthorized: sign401.status,
        webhook_sign_authorized: sign200.status,
        webhook_verify: verify.status,
      },
    }, null, 2));

    process.exit(ok ? 0 : 1);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    try { child.kill('SIGTERM'); } catch {}
  }
})();
