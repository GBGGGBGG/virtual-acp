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

## Docker run
```bash
npm run docker:up
# stop
npm run docker:down
```

Preflight check:
```bash
npm run preflight
```

### Optional env
- `REDIS_URL=redis://localhost:6379`
- `REDIS_KEY_PREFIX=gatex`
- `REDIS_STATE_TTL_SEC=86400`
- `GATEX_SIGNING_SECRET=change-me`
- `GATEX_LOG_DIR=./logs`
- `GATEX_ADMIN_TOKEN=change-admin-token` (protects policy/report endpoints)

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

### Policy diff
`GET /api/policy/diff?from=<ts>&to=<ts>`

### Policy rollback (path)
`POST /api/policy/rollback/:ts`

### Attribution report
`GET /api/report/attribution`

### Stability trend
`GET /api/report/stability?minutes=120`

### Policy simulate (dry-run)
`POST /api/policy/simulate` with `{ samples: [...] }`

### Policy simulate batch file (JSONL)
`POST /api/policy/simulate/batch-file` with `{ filePath: "./samples.jsonl" }`

### Policy simulate preset compare
`POST /api/policy/simulate/preset` with `{ sample: {...} }` (strict/lenient/insurance)

### Webhook signature helper
`POST /api/webhook/sign` (returns HMAC signature)

### Webhook signature verify
`POST /api/webhook/verify` with `{ payload, signature }`

### Report export
`GET /api/report/export?format=json|csv`

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

## Deployment prep assets
- OpenAPI spec: `docs/openapi.yaml`
- Deployment checklist: `docs/deploy-checklist.md`
- Virtual ACP manifest draft: `docs/virtual-acp-manifest-draft.md`

## Next implementation steps
1. Admin auth on policy/webhook sensitive endpoints
2. Redis-backed version history stream
3. Virtual ACP registration + production deployment wiring
4. Policy simulation against real historical sample sets
