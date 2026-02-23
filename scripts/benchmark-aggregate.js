#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function median(nums) {
  if (!nums.length) return 0;
  const a = [...nums].sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

function min(nums) { return nums.length ? Math.min(...nums) : 0; }
function max(nums) { return nums.length ? Math.max(...nums) : 0; }

function pluck(rows, pathExpr) {
  return rows.map((r) => pathExpr.split('.').reduce((acc, k) => acc?.[k], r)).filter((v) => typeof v === 'number');
}

(function main() {
  const dir = path.resolve('./docs/benchmarks');
  const mode = process.argv.includes('--mode') ? process.argv[process.argv.indexOf('--mode') + 1] : 'external';
  const limit = Number(process.argv.includes('--limit') ? process.argv[process.argv.indexOf('--limit') + 1] : 3);

  const files = fs.readdirSync(dir)
    .filter((f) => f.startsWith(`benchmark-${mode}-`) && f.endsWith('.json'))
    .sort()
    .slice(-limit);

  if (!files.length) {
    console.error('No benchmark files found');
    process.exit(1);
  }

  const rows = files.map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));

  const out = {
    generated_at: new Date().toISOString(),
    mode,
    files,
    runs: rows.length,
    success_rate: {
      median: median(pluck(rows, 'benchmark.ok').map((ok, i) => ok / rows[i].benchmark.total)),
    },
    latency_ms: {
      p50: { median: median(pluck(rows, 'benchmark.latency.p50')), min: min(pluck(rows, 'benchmark.latency.p50')), max: max(pluck(rows, 'benchmark.latency.p50')) },
      p95: { median: median(pluck(rows, 'benchmark.latency.p95')), min: min(pluck(rows, 'benchmark.latency.p95')), max: max(pluck(rows, 'benchmark.latency.p95')) },
      p99: { median: median(pluck(rows, 'benchmark.latency.p99')), min: min(pluck(rows, 'benchmark.latency.p99')), max: max(pluck(rows, 'benchmark.latency.p99')) },
      max: { median: median(pluck(rows, 'benchmark.latency.max')), min: min(pluck(rows, 'benchmark.latency.max')), max: max(pluck(rows, 'benchmark.latency.max')) },
    },
    engine_runtime_ms: {
      p50: { median: median(pluck(rows, 'benchmark.engine_runtime_ms.p50')), min: min(pluck(rows, 'benchmark.engine_runtime_ms.p50')), max: max(pluck(rows, 'benchmark.engine_runtime_ms.p50')) },
      p95: { median: median(pluck(rows, 'benchmark.engine_runtime_ms.p95')), min: min(pluck(rows, 'benchmark.engine_runtime_ms.p95')), max: max(pluck(rows, 'benchmark.engine_runtime_ms.p95')) },
      p99: { median: median(pluck(rows, 'benchmark.engine_runtime_ms.p99')), min: min(pluck(rows, 'benchmark.engine_runtime_ms.p99')), max: max(pluck(rows, 'benchmark.engine_runtime_ms.p99')) },
      max: { median: median(pluck(rows, 'benchmark.engine_runtime_ms.max')), min: min(pluck(rows, 'benchmark.engine_runtime_ms.max')), max: max(pluck(rows, 'benchmark.engine_runtime_ms.max')) },
    },
  };

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonPath = path.join(dir, `benchmark-summary-${mode}-${stamp}.json`);
  const mdPath = path.join(dir, `benchmark-summary-${mode}-${stamp}.md`);
  fs.writeFileSync(jsonPath, JSON.stringify(out, null, 2));

  const md = `# Benchmark Summary (${mode})\n\n` +
    `Runs: ${out.runs}\n\n` +
    `Files:\n${files.map((f) => `- ${f}`).join('\n')}\n\n` +
    `## Latency (ms)\n` +
    `- p50 median/min/max: ${out.latency_ms.p50.median} / ${out.latency_ms.p50.min} / ${out.latency_ms.p50.max}\n` +
    `- p95 median/min/max: ${out.latency_ms.p95.median} / ${out.latency_ms.p95.min} / ${out.latency_ms.p95.max}\n` +
    `- p99 median/min/max: ${out.latency_ms.p99.median} / ${out.latency_ms.p99.min} / ${out.latency_ms.p99.max}\n` +
    `- max median/min/max: ${out.latency_ms.max.median} / ${out.latency_ms.max.min} / ${out.latency_ms.max.max}\n\n` +
    `## Engine runtime (ms)\n` +
    `- p50 median/min/max: ${out.engine_runtime_ms.p50.median} / ${out.engine_runtime_ms.p50.min} / ${out.engine_runtime_ms.p50.max}\n` +
    `- p95 median/min/max: ${out.engine_runtime_ms.p95.median} / ${out.engine_runtime_ms.p95.min} / ${out.engine_runtime_ms.p95.max}\n` +
    `- p99 median/min/max: ${out.engine_runtime_ms.p99.median} / ${out.engine_runtime_ms.p99.min} / ${out.engine_runtime_ms.p99.max}\n` +
    `- max median/min/max: ${out.engine_runtime_ms.max.median} / ${out.engine_runtime_ms.max.min} / ${out.engine_runtime_ms.max.max}\n`;

  fs.writeFileSync(mdPath, md);
  console.log(JSON.stringify({ ok: true, jsonPath, mdPath, summary: out }, null, 2));
})();
