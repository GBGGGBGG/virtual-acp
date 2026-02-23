#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { evaluateRequest } = require('../src/services/evaluator');

function getArg(name, def = '') {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : def;
}

async function main() {
  const input = path.resolve(getArg('--input', './samples/historical-sample.jsonl'));
  const outDir = path.resolve(getArg('--out', './docs/case-studies'));
  fs.mkdirSync(outDir, { recursive: true });

  const lines = fs.readFileSync(input, 'utf8').split('\n').filter(Boolean);

  let total = 0;
  let gateAllow = 0;
  let gateDeny = 0;
  let baselineAllow = 0;
  let deniedRiskExposure = 0;
  let deniedFee = 0;

  const rows = [];

  for (const line of lines) {
    total += 1;
    const sample = JSON.parse(line);
    const payload = {
      request_id: sample.request_id || `cs-${total}`,
      policy: sample.policy || 'default',
      mode: sample.mode || 'strict',
      insurance_mode: Boolean(sample.insurance_mode),
      context: sample.context || {},
      signals: sample.signals,
      requested_gates: sample.requested_gates || [],
      overrides: sample.overrides || {},
    };

    baselineAllow += 1; // baseline = always allow

    try {
      const out = await evaluateRequest(payload, null);
      const decision = out.decision;
      if (decision === 'ALLOW') gateAllow += 1;
      else {
        gateDeny += 1;
        deniedRiskExposure += Number(payload.signals.risk.score) * Number(payload.signals.account.position_size_usd);
        deniedFee += Number(payload.signals.cost.fee_usd || 0);
      }
      rows.push({ request_id: payload.request_id, decision, fails: out.fails.join('|') });
    } catch (e) {
      gateDeny += 1;
      deniedRiskExposure += Number(payload.signals?.risk?.score || 0) * Number(payload.signals?.account?.position_size_usd || 0);
      deniedFee += Number(payload.signals?.cost?.fee_usd || 0);
      rows.push({ request_id: payload.request_id, decision: 'DENY', fails: e.message || 'DENY_SCHEMA' });
    }
  }

  const summary = {
    dataset: input,
    total,
    baseline: { allow: baselineAllow, deny: 0 },
    gatex: { allow: gateAllow, deny: gateDeny, allow_rate: Number((gateAllow / Math.max(1, total)).toFixed(4)) },
    proxy_impact: {
      denied_risk_exposure: Number(deniedRiskExposure.toFixed(4)),
      denied_fee_usd: Number(deniedFee.toFixed(4)),
      interpretation: 'proxy only; not realized PnL',
    },
    generated_at: new Date().toISOString(),
  };

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonPath = path.join(outDir, `synthetic-case-${stamp}.json`);
  const mdPath = path.join(outDir, `synthetic-case-${stamp}.md`);

  fs.writeFileSync(jsonPath, JSON.stringify({ summary, rows }, null, 2));

  const md = `# GateX Synthetic Case Study (${summary.generated_at})\n\n` +
    `Dataset: \`${summary.dataset}\`\n\n` +
    `## Setup\n` +
    `- Baseline policy: always allow\n` +
    `- GateX policy: evaluated via /api/gate/evaluate logic\n` +
    `- Total samples: ${summary.total}\n\n` +
    `## Outcome\n` +
    `- Baseline allow: ${summary.baseline.allow}/${summary.total}\n` +
    `- GateX allow: ${summary.gatex.allow}/${summary.total}\n` +
    `- GateX deny: ${summary.gatex.deny}/${summary.total}\n` +
    `- GateX allow rate: ${summary.gatex.allow_rate}\n\n` +
    `## Proxy impact (denied samples only)\n` +
    `- Denied risk exposure proxy: ${summary.proxy_impact.denied_risk_exposure}\n` +
    `- Denied fee proxy (USD): ${summary.proxy_impact.denied_fee_usd}\n` +
    `- Note: ${summary.proxy_impact.interpretation}\n\n` +
    `## Caveat\n` +
    `This is a synthetic dataset case study. Publish as methodology/example, not as production financial claim.\n`;

  fs.writeFileSync(mdPath, md);
  console.log(JSON.stringify({ ok: true, jsonPath, mdPath, summary }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
