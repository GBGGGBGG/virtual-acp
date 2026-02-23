#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const PORT = Number(process.env.BENCH_PORT || 8790);
const BASE = `http://127.0.0.1:${PORT}`;

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function reqEvaluate(payload) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const data = JSON.stringify(payload);
    const r = http.request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/gate/evaluate',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(data),
      },
    }, (res) => {
      let buf = '';
      res.on('data', (d) => (buf += d));
      res.on('end', () => {
        const latencyMs = Date.now() - t0;
        let body = null;
        try { body = JSON.parse(buf); } catch { body = null; }
        resolve({ status: res.statusCode, latencyMs, body });
      });
    });
    r.on('error', reject);
    r.write(data);
    r.end();
  });
}

async function waitUntilUp(timeoutMs = 10000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try {
      const ok = await new Promise((resolve) => {
        const r = http.request({ hostname: '127.0.0.1', port: PORT, path: '/api/health', method: 'GET' }, (res) => {
          resolve(res.statusCode === 200);
        });
        r.on('error', () => resolve(false));
        r.end();
      });
      if (ok) return true;
    } catch {}
    await sleep(200);
  }
  return false;
}

function percentile(arr, p) {
  if (!arr.length) return 0;
  const idx = Math.min(arr.length - 1, Math.max(0, Math.ceil((p / 100) * arr.length) - 1));
  return arr[idx];
}

function basePayload(i) {
  return {
    request_id: `bench-${i}`,
    policy: 'default',
    mode: 'strict',
    insurance_mode: false,
    signals: {
      risk: { score: (i % 10 === 0) ? 0.88 : 0.42, confidence: 0.85 },
      market: { volatility: 0.25 + ((i % 5) * 0.05), slippage_bps: 10 + (i % 8) },
      cost: { fee_usd: 1, expected_value_usd: 12, this_cost_usd: 1 },
      account: { balance_usd: 2000, position_size_usd: 120 },
      activity: { recent_failures: i % 3, recent_actions_5m: 2 + (i % 3), failure_rate_20: 0.03 + ((i % 4) * 0.01) },
      budget: { today_spend_usd: 15, daily_budget_usd: 200, hard_cap_usd: 500 },
      counterparty: { agent_reputation: 0.85, recent_success_rate: 0.82, recent_failure_rate: 0.12, reviews_count: 20, last_seen_days: 2, price_usd: 2 },
    },
  };
}

async function runPhase({ total, concurrency, warmup }) {
  const latencies = [];
  const runtimeMs = [];
  let ok = 0;
  let fail = 0;
  let cursor = 0;

  async function worker() {
    while (true) {
      const i = cursor;
      cursor += 1;
      if (i >= total) break;
      try {
        const r = await reqEvaluate(basePayload(i + warmup));
        if (r.status === 200) {
          ok += 1;
          latencies.push(r.latencyMs);
          if (r.body?.runtime?.processing_ms != null) runtimeMs.push(Number(r.body.runtime.processing_ms));
        } else {
          fail += 1;
        }
      } catch {
        fail += 1;
      }
    }
  }

  const t0 = Date.now();
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  const elapsedMs = Date.now() - t0;

  latencies.sort((a, b) => a - b);
  runtimeMs.sort((a, b) => a - b);

  return {
    total,
    ok,
    fail,
    elapsedMs,
    rps: Number((ok / Math.max(1, elapsedMs / 1000)).toFixed(2)),
    latency: {
      p50: percentile(latencies, 50),
      p95: percentile(latencies, 95),
      p99: percentile(latencies, 99),
      max: latencies[latencies.length - 1] || 0,
    },
    engine_runtime_ms: {
      p50: percentile(runtimeMs, 50),
      p95: percentile(runtimeMs, 95),
      p99: percentile(runtimeMs, 99),
      max: runtimeMs[runtimeMs.length - 1] || 0,
    },
  };
}

(async () => {
  const child = spawn('node', ['src/server.js'], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      PORT: String(PORT),
      GATEX_ADMIN_TOKEN: process.env.GATEX_ADMIN_TOKEN || 'benchmark-admin-token',
    },
  });

  try {
    const up = await waitUntilUp(10000);
    if (!up) throw new Error('benchmark server start timeout');

    // Warmup
    for (let i = 0; i < 50; i += 1) {
      await reqEvaluate(basePayload(i));
    }

    const phase = await runPhase({ total: 1000, concurrency: 20, warmup: 50 });
    const now = new Date();
    const stamp = now.toISOString().replace(/[:.]/g, '-');
    const outDir = path.resolve('./docs/benchmarks');
    fs.mkdirSync(outDir, { recursive: true });

    const jsonPath = path.join(outDir, `benchmark-${stamp}.json`);
    const mdPath = path.join(outDir, `benchmark-${stamp}.md`);

    const report = {
      generated_at: now.toISOString(),
      env: {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      benchmark: phase,
      target: {
        endpoint: `${BASE}/api/gate/evaluate`,
        total_requests: 1000,
        concurrency: 20,
      },
    };

    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    const md = `# GateX Benchmark (${report.generated_at})\n\n` +
      `- Endpoint: ${report.target.endpoint}\n` +
      `- Requests: ${report.target.total_requests}\n` +
      `- Concurrency: ${report.target.concurrency}\n\n` +
      `## Throughput\n` +
      `- Success: ${phase.ok}/${phase.total}\n` +
      `- Fail: ${phase.fail}\n` +
      `- Total time: ${phase.elapsedMs} ms\n` +
      `- RPS: ${phase.rps}\n\n` +
      `## API Round-trip Latency (ms)\n` +
      `- p50: ${phase.latency.p50}\n` +
      `- p95: ${phase.latency.p95}\n` +
      `- p99: ${phase.latency.p99}\n` +
      `- max: ${phase.latency.max}\n\n` +
      `## Engine Runtime (response.runtime.processing_ms)\n` +
      `- p50: ${phase.engine_runtime_ms.p50}\n` +
      `- p95: ${phase.engine_runtime_ms.p95}\n` +
      `- p99: ${phase.engine_runtime_ms.p99}\n` +
      `- max: ${phase.engine_runtime_ms.max}\n`;

    fs.writeFileSync(mdPath, md);

    console.log(JSON.stringify({ ok: true, jsonPath, mdPath, summary: phase }, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    try { child.kill('SIGTERM'); } catch {}
  }
})();
