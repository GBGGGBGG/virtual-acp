const { z } = require('zod');

const number = z.number();

const RequestSchema = z.object({
  request_id: z.string().min(1),
  policy: z.string().min(1),
  mode: z.enum(['strict', 'lenient']).default('strict'),
  insurance_mode: z.boolean().default(false),
  context: z.record(z.any()).optional().default({}),
  signals: z.object({
    risk: z.object({ score: number.min(0).max(1), confidence: number.min(0).max(1) }),
    market: z.object({ volatility: number.min(0).max(1), slippage_bps: number.int().nonnegative() }),
    cost: z.object({ fee_usd: number.nonnegative(), expected_value_usd: number.positive(), this_cost_usd: number.nonnegative() }),
    account: z.object({ balance_usd: number.positive(), position_size_usd: number.nonnegative() }),
    activity: z.object({ recent_failures: number.int().nonnegative(), recent_actions_5m: number.int().nonnegative(), failure_rate_20: number.min(0).max(1) }),
    budget: z.object({ today_spend_usd: number.nonnegative(), daily_budget_usd: number.positive(), hard_cap_usd: number.positive() }),
    counterparty: z.object({
      agent_reputation: number.min(0).max(1),
      recent_success_rate: number.min(0).max(1),
      recent_failure_rate: number.min(0).max(1),
      reviews_count: number.int().nonnegative(),
      last_seen_days: number.nonnegative(),
      price_usd: number.nonnegative(),
    }),
  }),
  requested_gates: z.array(z.string()).optional().default([]),
  overrides: z.record(z.any()).optional().default({}),
});

module.exports = { RequestSchema };
