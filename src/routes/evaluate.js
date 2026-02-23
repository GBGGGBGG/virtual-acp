const express = require('express');
const { RequestSchema } = require('../core/schema');
const { evaluateGates } = require('../gates/evaluate');
const { state, pushMetric, windowMetrics, snapshotState } = require('../core/state');
const { tuneIfNeeded } = require('../services/tuner');

const router = express.Router();

router.post('/gate/evaluate', async (req, res) => {
  const parsed = RequestSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ decision: 'DENY', code: 'DENY_SCHEMA', errors: parsed.error.issues });
  }

  const input = parsed.data;
  const result = evaluateGates(input, state.params);

  state.totals.total_requests += 1;
  if (result.decision === 'ALLOW') state.totals.allow_count += 1;
  else {
    state.totals.deny_count += 1;
    state.totals.prevented_trades_count += 1;
    state.totals.estimated_loss_prevented += input.signals.risk.score * input.signals.account.position_size_usd;
    state.totals.estimated_fee_saved += input.signals.cost.fee_usd;
  }
  if (result.fails.includes('DENY_COOLDOWN')) state.totals.cooldown_trigger_count += 1;

  pushMetric({
    deny: result.decision === 'DENY' ? 1 : 0,
    failure: input.signals.activity.failure_rate_20,
    risk_score: input.signals.risk.score,
    slippage_bps: input.signals.market.slippage_bps,
    fee_ratio: result.computed.fee_ratio,
    volatility: input.signals.market.volatility,
  });

  const tuning = tuneIfNeeded();
  const wm = windowMetrics();
  const excessiveDenyPenalty = Math.max(0, wm.rolling_deny_rate - 0.8);
  const riskComplianceScore = 1 - Math.min(1, wm.avg_risk_score);
  const verification_score =
    0.4 * (1 - wm.rolling_failure_rate) +
    0.3 * (1 - excessiveDenyPenalty) +
    0.3 * riskComplianceScore;

  await req.app.locals.store?.save(snapshotState()).catch(() => {});

  return res.json({
    request_id: input.request_id,
    policy: input.policy,
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
  });
});

module.exports = router;
