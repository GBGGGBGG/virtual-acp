const { TUNING } = require('../config/defaults');
const { state, windowMetrics, saveVersion } = require('../core/state');

function tuneIfNeeded() {
  if (state.totals.total_requests % TUNING.everyK !== 0) return { tuned: false };

  const m = windowMetrics();
  let changed = false;

  if (m.rolling_failure_rate > 0.12) {
    state.params.risk_deny = Math.max(state.params.min_risk_deny, state.params.risk_deny - 0.02);
    state.params.slippage_deny_bps = Math.max(20, Math.round(state.params.slippage_deny_bps * 0.9));
    state.params.max_size_base *= 0.9;
    state.params.cooldown_base_sec = Math.round(state.params.cooldown_base_sec * 1.2);
    changed = true;
  }

  if (m.rolling_deny_rate > 0.85 && m.rolling_failure_rate < 0.06) {
    state.params.risk_deny = Math.min(state.params.max_risk_deny, state.params.risk_deny + 0.01);
    state.params.max_size_base *= 1.1;
    state.params.cooldown_base_sec = Math.max(30, Math.round(state.params.cooldown_base_sec * 0.9));
    changed = true;
  }

  if (m.avg_volatility > 0.7) {
    state.params.slippage_deny_bps = Math.max(20, Math.round(state.params.slippage_deny_bps * 0.85));
    state.params.max_size_base *= 0.8;
    changed = true;
  }

  if (changed) saveVersion('adaptive-tune');
  return { tuned: changed, metrics: m, params: state.params };
}

module.exports = { tuneIfNeeded };
