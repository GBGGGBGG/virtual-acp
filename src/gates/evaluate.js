function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

function evaluateGates(req, params) {
  const s = req.signals;
  const fails = [];
  const warns = [];

  if (s.activity.recent_failures >= 5) fails.push('DENY_COOLDOWN');

  if (s.budget.today_spend_usd + s.cost.this_cost_usd > s.budget.daily_budget_usd) {
    if (!(req.mode === 'lenient' && s.risk.score < 0.5)) fails.push('DENY_BUDGET');
  }

  if (s.risk.score >= params.risk_deny) fails.push('DENY_RISK');
  else if (s.risk.score >= params.risk_warn) warns.push('WARN_RISK');

  if (s.market.slippage_bps >= params.slippage_deny_bps) fails.push('DENY_SLIPPAGE');

  const feeRatio = s.cost.fee_usd / Math.max(s.cost.expected_value_usd, 0.0001);
  if (feeRatio >= params.fee_ratio_deny) fails.push('DENY_FEE_RATIO');

  if (s.activity.failure_rate_20 >= params.failure_density_deny) fails.push('DENY_FAILURE_DENSITY');
  if (s.activity.recent_actions_5m > params.overtrade_threshold) warns.push('WARN_OVERTRADE');

  let maxSizeRatio = params.max_size_base;
  maxSizeRatio *= (1 - s.risk.score * 0.5);
  maxSizeRatio *= (1 - s.market.volatility * 0.4);
  maxSizeRatio *= (1 - s.activity.failure_rate_20 * 0.5);
  if (req.insurance_mode) maxSizeRatio *= 0.8;

  const maxPosition = maxSizeRatio * s.account.balance_usd;
  const clampedPosition = Math.min(s.account.position_size_usd, maxPosition);
  const decision = fails.length ? 'DENY' : 'ALLOW';

  return {
    decision,
    fails,
    warns,
    computed: {
      fee_ratio: feeRatio,
      max_size_ratio: clamp(maxSizeRatio, 0.01, 1),
      max_position_usd: maxPosition,
      clamped_position_usd: clampedPosition,
    },
  };
}

module.exports = { evaluateGates };
