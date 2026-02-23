#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { evaluateRequest } = require('../src/services/evaluator');

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--input') out.input = argv[i + 1];
    if (a === '--out') out.out = argv[i + 1];
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input) {
    console.error('Usage: node scripts/simulate-historical.js --input <jsonl> [--out <dir>]');
    process.exit(1);
  }

  const inputPath = path.resolve(args.input);
  const outDir = path.resolve(args.out || './logs/simulations');
  fs.mkdirSync(outDir, { recursive: true });

  const lines = fs.readFileSync(inputPath, 'utf8').split('\n').filter(Boolean);
  let allow = 0;
  let deny = 0;
  const rows = [];

  for (let i = 0; i < lines.length; i += 1) {
    try {
      const s = JSON.parse(lines[i]);
      const payload = {
        request_id: s.request_id || `hist_${Date.now()}_${i}`,
        policy: s.policy || 'default',
        mode: s.mode || 'strict',
        insurance_mode: Boolean(s.insurance_mode),
        context: s.context || {},
        signals: s.signals,
        requested_gates: s.requested_gates || [],
        overrides: s.overrides || {},
      };
      const out = await evaluateRequest(payload, null);
      if (out.decision === 'ALLOW') allow += 1;
      else deny += 1;
      rows.push({ line: i + 1, request_id: out.request_id, decision: out.decision, fails: out.fails.join('|') });
    } catch (e) {
      deny += 1;
      rows.push({ line: i + 1, request_id: '', decision: 'DENY', fails: e.message || 'DENY_SCHEMA' });
    }
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const summary = {
    input: inputPath,
    total: lines.length,
    allow,
    deny,
    allow_rate: Number((allow / Math.max(1, lines.length)).toFixed(4)),
    deny_rate: Number((deny / Math.max(1, lines.length)).toFixed(4)),
    generated_at: new Date().toISOString(),
  };

  const jsonPath = path.join(outDir, `historical-summary-${stamp}.json`);
  const csvPath = path.join(outDir, `historical-results-${stamp}.csv`);
  fs.writeFileSync(jsonPath, JSON.stringify({ summary, results: rows }, null, 2));

  const csv = ['line,request_id,decision,fails']
    .concat(rows.map((r) => `${r.line},${r.request_id},${r.decision},"${String(r.fails).replaceAll('"', '""')}"`))
    .join('\n');
  fs.writeFileSync(csvPath, csv);

  console.log(JSON.stringify({ ok: true, summary, jsonPath, csvPath }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
