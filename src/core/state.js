const { DEFAULT_PARAMS, TUNING } = require('../config/defaults');

const state = {
  params: { ...DEFAULT_PARAMS },
  metricsWindow: [],
  totals: {
    total_requests: 0,
    allow_count: 0,
    deny_count: 0,
    cooldown_trigger_count: 0,
    prevented_trades_count: 0,
    estimated_fee_saved: 0,
    estimated_loss_prevented: 0,
  },
  versions: [{ ts: new Date().toISOString(), params: { ...DEFAULT_PARAMS }, reason: 'init' }],
};

function windowMetrics() {
  const w = state.metricsWindow;
  const n = w.length || 1;
  const sum = (k) => w.reduce((a, x) => a + (x[k] || 0), 0);
  return {
    rolling_failure_rate: sum('failure') / n,
    rolling_deny_rate: sum('deny') / n,
    avg_risk_score: sum('risk_score') / n,
    avg_slippage_bps: sum('slippage_bps') / n,
    avg_fee_ratio: sum('fee_ratio') / n,
    avg_volatility: sum('volatility') / n,
  };
}

function pushMetric(m) {
  state.metricsWindow.push(m);
  if (state.metricsWindow.length > TUNING.windowSize) state.metricsWindow.shift();
}

function saveVersion(reason) {
  state.versions.unshift({ ts: new Date().toISOString(), params: { ...state.params }, reason });
  state.versions = state.versions.slice(0, TUNING.maxVersions);
}

function snapshotState() {
  return {
    params: state.params,
    metricsWindow: state.metricsWindow,
    totals: state.totals,
    versions: state.versions,
  };
}

function hydrateState(saved) {
  if (!saved || typeof saved !== 'object') return;
  if (saved.params) state.params = saved.params;
  if (Array.isArray(saved.metricsWindow)) state.metricsWindow = saved.metricsWindow;
  if (saved.totals) state.totals = saved.totals;
  if (Array.isArray(saved.versions)) state.versions = saved.versions;
}

module.exports = { state, windowMetrics, pushMetric, saveVersion, snapshotState, hydrateState };
