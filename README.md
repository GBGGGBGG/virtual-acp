# GateX ACP

Adaptive Deterministic Risk Operating System for Virtual ACP.

## What it does
- Deterministic allow/deny gates (schema/cooldown/budget/risk/slippage/fee/failure density)
- Rolling metrics window
- Adaptive threshold tuning (bounded)
- Performance attribution + verification score
- Policy version snapshots (last 10)
- Redis persistence (optional via `REDIS_URL`, memory fallback)

## Run
```bash
cd /Users/jhyou/work/projects/virtual-acp
npm install
npm run dev
```

Server: `http://localhost:8787`

### Optional env
- `REDIS_URL=redis://localhost:6379`
- `REDIS_KEY_PREFIX=gatex`
- `REDIS_STATE_TTL_SEC=86400`
- `GATEX_SIGNING_SECRET=change-me`

## API
### Health
`GET /api/health`

### Evaluate
`POST /api/gate/evaluate`

### Policy versions
`GET /api/policy/versions`

### Policy rollback
`POST /api/policy/rollback` with `{ "ts": "<version-ts>" }`

### ACP adapter
`POST /api/acp/execute` (maps ACP payload to GateX evaluator)

Minimal payload:
```json
{
  "request_id": "r1",
  "policy": "default",
  "mode": "strict",
  "insurance_mode": false,
  "signals": {"risk":{"score":0.4,"confidence":0.9},"market":{"volatility":0.2,"slippage_bps":10},"cost":{"fee_usd":1,"expected_value_usd":10,"this_cost_usd":1},"account":{"balance_usd":1000,"position_size_usd":100},"activity":{"recent_failures":0,"recent_actions_5m":2,"failure_rate_20":0.02},"budget":{"today_spend_usd":5,"daily_budget_usd":100,"hard_cap_usd":200},"counterparty":{"agent_reputation":0.8,"recent_success_rate":0.8,"recent_failure_rate":0.1,"reviews_count":20,"last_seen_days":1,"price_usd":2}}
}
```

## Next implementation steps
1. Redis state persistence
2. Policy storage + rollback endpoint
3. ACP adapter layer for Virtual protocol registration
4. Signed verification metadata
