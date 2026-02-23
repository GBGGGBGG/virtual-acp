const express = require('express');
const { state, windowMetrics } = require('../core/state');

const router = express.Router();

function toCsv(report) {
  const rows = [
    ['key', 'value'],
    ...Object.entries(report).map(([k, v]) => [k, String(v)]),
  ];
  return rows.map((r) => `${r[0]},${r[1]}`).join('\n');
}

router.get('/report/export', (_req, res) => {
  const format = String(_req.query.format || 'json').toLowerCase();
  const m = windowMetrics();
  const report = {
    total_requests: state.totals.total_requests,
    allow_count: state.totals.allow_count,
    deny_count: state.totals.deny_count,
    estimated_fee_saved: Number(state.totals.estimated_fee_saved.toFixed(2)),
    estimated_loss_prevented: Number(state.totals.estimated_loss_prevented.toFixed(2)),
    rolling_failure_rate: Number(m.rolling_failure_rate.toFixed(4)),
    rolling_deny_rate: Number(m.rolling_deny_rate.toFixed(4)),
    avg_risk_score: Number(m.avg_risk_score.toFixed(4)),
    avg_slippage_bps: Number(m.avg_slippage_bps.toFixed(2)),
    avg_fee_ratio: Number(m.avg_fee_ratio.toFixed(4)),
    params_version: state.versions[0]?.ts || null,
  };

  if (format === 'csv') {
    const csv = toCsv(report);
    res.setHeader('content-type', 'text/csv; charset=utf-8');
    return res.send(csv);
  }

  return res.json({ report });
});

module.exports = router;
