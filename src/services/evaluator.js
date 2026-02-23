const { RequestSchema } = require('../core/schema');
const { evaluateGates } = require('../gates/evaluate');
const { state, pushMetric, windowMetrics, snapshotState } = require('../core/state');
const { tuneIfNeeded } = require('./tuner');
const { signPayload } = require('./signing');
const { logEvent } = require('./logger');

async function evaluateRequest(input, store) {
  const startedAt = process.hrtime.bigint();
  const parsed = RequestSchema.safeParse(input || {});
  if (!parsed.success) {
    const err = new Error('DENY_SCHEMA');
    err.status = 400;
    err.issues = parsed.error.issues;
    throw err;
  }

  const req = parsed.data;
  const result = evaluateGates(req, state.params);

  state.totals.total_requests += 1;
  if (result.decision === 'ALLOW') state.totals.allow_count += 1;
  else {
    state.totals.deny_count += 1;
    state.totals.prevented_trades_count += 1;
    state.totals.estimated_loss_prevented += req.signals.risk.score * req.signals.account.position_size_usd;
    state.totals.estimated_fee_saved += req.signals.cost.fee_usd;
  }
  if (result.fails.includes('DENY_COOLDOWN')) state.totals.cooldown_trigger_count += 1;

  pushMetric({
    deny: result.decision === 'DENY' ? 1 : 0,
    failure: req.signals.activity.failure_rate_20,
    risk_score: req.signals.risk.score,
    slippage_bps: req.signals.market.slippage_bps,
    fee_ratio: result.computed.fee_ratio,
    volatility: req.signals.market.volatility,
  });

  const tuning = tuneIfNeeded();
  const wm = windowMetrics();
  const excessiveDenyPenalty = Math.max(0, wm.rolling_deny_rate - 0.8);
  const riskComplianceScore = 1 - Math.min(1, wm.avg_risk_score);
  const verification_score =
    0.4 * (1 - wm.rolling_failure_rate) +
    0.3 * (1 - excessiveDenyPenalty) +
    0.3 * riskComplianceScore;

  const processing_ms = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

  const response = {
    request_id: req.request_id,
    policy: req.policy,
    decision: result.decision,
    fails: result.fails,
    warns: result.warns,
    computed: result.computed,
    metrics: wm,
    verification: {
      verification_score: Number(verification_score.toFixed(4)),
      gate_verified: verification_score >= 0.7,
      stability_score: Number((1 - wm.rolling_failure_rate).toFixed(4)),
      capital_protection_score: Number((1 - wm.avg_risk_score).toFixed(4)),
      adaptive_strength_score: tuning.tuned ? 1 : 0.5,
    },
    params_version: state.versions[0]?.ts,
    tuning,
    runtime: {
      processing_ms: Number(processing_ms.toFixed(3)),
      model: 'deterministic-rules+adaptive-tuning',
    },
  };

  response.signature = signPayload({
    request_id: response.request_id,
    decision: response.decision,
    verification: response.verification,
    params_version: response.params_version,
  });

  await store?.save(snapshotState()).catch(() => {});
  await store?.pushVersion?.(state.versions[0]).catch(() => {});
  logEvent({
    kind: 'gate.evaluate',
    request_id: response.request_id,
    decision: response.decision,
    fails: response.fails,
    warns: response.warns,
    verification_score: response.verification.verification_score,
    params_version: response.params_version,
    processing_ms: response.runtime.processing_ms,
  });
  return response;
}

module.exports = { evaluateRequest };
