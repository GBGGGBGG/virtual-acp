const DEFAULT_PARAMS = {
  risk_deny: 0.82,
  risk_warn: 0.65,
  slippage_deny_bps: 120,
  fee_ratio_deny: 0.2,
  failure_density_deny: 0.2,
  overtrade_threshold: 20,
  cooldown_base_sec: 120,
  max_size_base: 0.2,
  min_risk_deny: 0.65,
  max_risk_deny: 0.92,
};

const TUNING = {
  everyK: 25,
  windowSize: 200,
  maxVersions: 10,
};

module.exports = { DEFAULT_PARAMS, TUNING };
