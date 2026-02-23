# GateX Quickstart (5-Minute Path)

## 0) Start
```bash
git clone https://github.com/GBGGGBGG/virtual-acp.git
cd virtual-acp
npm install
npm run dev
```

## 1) Health check
```bash
curl -s http://127.0.0.1:8787/api/health
```

Expected: `{"ok":true,...}`

## 2) Send one evaluate request
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
  }'
```

Look for:
- `decision` (ALLOW / DENY)
- `verification.verification_score`
- `runtime.processing_ms`

## 3) Protect admin endpoints (recommended)
```bash
export GATEX_ADMIN_TOKEN='change-this-token'
npm run dev
```
Then call admin endpoints with:
```bash
-H 'x-gatex-admin-token: change-this-token'
```

## 4) Pre-deploy sanity checks
```bash
npm test
npm run preflight
npm run smoke
npm run benchmark
```

## 5) Next docs
- 30-minute integration: `docs/integration-30min-guide.md`
- Troubleshooting: `docs/troubleshooting.md`
- Benchmarks: `docs/benchmarks/LATEST.md`
