const express = require('express');
const { state, windowMetrics } = require('../core/state');

const router = express.Router();

router.get('/report/attribution', (_req, res) => {
  const m = windowMetrics();
  const total = Math.max(state.totals.total_requests, 1);
  const denyRate = state.totals.deny_count / total;
  const failRate = m.rolling_failure_rate;

  const report = {
    loss_reduction_percent: Number((Math.min(1, state.totals.estimated_loss_prevented / Math.max(state.totals.total_requests, 1)) * 100).toFixed(2)),
    overtrade_reduction_percent: Number((Math.min(1, denyRate) * 100).toFixed(2)),
    fee_saved_total: Number(state.totals.estimated_fee_saved.toFixed(2)),
    risk_exposure_reduction_percent: Number(((1 - m.avg_risk_score) * 100).toFixed(2)),
    rolling_failure_rate_percent: Number((failRate * 100).toFixed(2)),
    rolling_deny_rate_percent: Number((m.rolling_deny_rate * 100).toFixed(2)),
  };

  res.json({ report, totals: state.totals, params_version: state.versions[0]?.ts });
});

module.exports = router;
