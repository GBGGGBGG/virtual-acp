# GateX 30-Minute Integration Guide

## Goal
Integrate GateX as a deterministic risk gate in under 30 minutes.

## 1) Start GateX (5 min)
```bash
cd /Users/jhyou/work/projects/virtual-acp
npm install
npm run dev
```

Optional env:
- `GATEX_SIGNING_SECRET`
- `GATEX_ADMIN_TOKEN`
- `REDIS_URL`

## 2) Health check (2 min)
```bash
curl -s http://127.0.0.1:8787/api/health | jq
```

## 3) Minimal evaluate call (5 min)
```bash
curl -s -X POST http://127.0.0.1:8787/api/gate/evaluate \
  -H 'content-type: application/json' \
  -d '{
    "request_id":"quickstart-1",
    "policy":"default",
    "mode":"strict",
    "insurance_mode":false,
    "signals":{
      "risk":{"score":0.4,"confidence":0.8},
      "market":{"volatility":0.2,"slippage_bps":10},
      "cost":{"fee_usd":1,"expected_value_usd":10,"this_cost_usd":1},
      "account":{"balance_usd":1000,"position_size_usd":100},
      "activity":{"recent_failures":0,"recent_actions_5m":2,"failure_rate_20":0.02},
      "budget":{"today_spend_usd":1,"daily_budget_usd":100,"hard_cap_usd":1000},
      "counterparty":{"agent_reputation":0.8,"recent_success_rate":0.8,"recent_failure_rate":0.2,"reviews_count":3,"last_seen_days":1,"price_usd":2}
    }
  }' | jq
```

## 4) Plug into your agent loop (8 min)
Pseudo-flow:
1. Agent proposes action
2. Send GateX evaluate request
3. If `decision=DENY` -> stop/ask fallback
4. If `ALLOW` -> execute action with `computed.clamped_position_usd`
5. Persist `request_id`, `decision`, `verification_score`, `runtime.processing_ms`

## 5) Secure admin endpoints (5 min)
Set `GATEX_ADMIN_TOKEN` and call admin APIs with header:
- `x-gatex-admin-token: <token>`

Admin-protected examples:
- `/api/policy/versions`
- `/api/policy/rollback*`
- `/api/policy/simulate*`
- `/api/report/*`
- `/api/webhook/sign`

## 6) Validate before deploy (5 min)
```bash
npm test
npm run preflight
npm run smoke
npm run benchmark
```

## Ship Checklist
- [ ] Non-default signing secret
- [ ] Admin token configured
- [ ] Smoke test green
- [ ] Benchmark artifacts generated
- [ ] Rollback endpoint verified
