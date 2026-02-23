# GateX ACP

Adaptive Deterministic Risk Operating System for Virtual ACP.

## Start here
- 5-minute quickstart: `docs/quickstart.md`
- 30-minute integration guide: `docs/integration-30min-guide.md`
- Troubleshooting: `docs/troubleshooting.md`
- Public one-pager: `docs/public-onepager.md`

## What it does
- Deterministic allow/deny gates (schema/cooldown/budget/risk/slippage/fee/failure density)
- Rolling metrics window
- Adaptive threshold tuning (bounded)
- Performance attribution + verification score
- Policy version snapshots (last 10)
- Redis persistence (optional via `REDIS_URL`, memory fallback)

## Run
```bash
git clone https://github.com/GBGGGBGG/virtual-acp.git
cd virtual-acp
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

Full smoke check (spins up server, checks auth boundaries + core routes):
```bash
npm run smoke
```

Historical simulation (JSONL input → summary JSON + CSV report):
```bash
npm run simulate:historical -- --input ./samples/historical-sample.jsonl --out ./logs/simulations
```

Benchmark (throughput + p50/p95/p99 + engine runtime):
```bash
npm run benchmark
```
- Output: `docs/benchmarks/*.json`, `docs/benchmarks/*.md`
- Latest summary: `docs/benchmarks/LATEST.md`
- Comparison summary: `docs/benchmarks/COMPARISON.md`

Benchmark an already-running server (external mode):
```bash
BENCH_SPAWN=false BENCH_BASE_URL=http://127.0.0.1:8787 npm run benchmark
```

Generate synthetic case study artifact:
```bash
npm run case-study:synthetic -- --input ./samples/historical-sample.jsonl --out ./docs/case-studies
```

### Optional env
- `REDIS_URL=redis://localhost:6379`
- `REDIS_KEY_PREFIX=gatex`
- `REDIS_STATE_TTL_SEC=86400`
- `GATEX_SIGNING_SECRET=change-me`
- `GATEX_LOG_DIR=./logs`
- `GATEX_ADMIN_TOKEN=change-admin-token` (protects policy/report/simulate/export endpoints via `x-gatex-admin-token` or `Authorization: Bearer <token>`)

## API
### Health
`GET /api/health`

### Evaluate
`POST /api/gate/evaluate`
- Response includes `runtime.processing_ms` (GateX engine execution time)

### Policy versions
`GET /api/policy/versions`

### Policy version history (store-backed)
`GET /api/policy/versions/history?limit=20`

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

### Webhook signature helper (internal/admin)
`POST /api/webhook/sign` (returns HMAC signature, admin token required)

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
- Benchmark methodology: `docs/benchmark-methodology.md`
- Deployment benchmark runbook: `docs/deployment-benchmark-runbook.md`
- Deployment benchmark copy-paste: `docs/deployment-benchmark-copy-paste.md`
- Production env guide: `docs/env-production.md`
- Public one-pager: `docs/public-onepager.md`
- Public post templates (X/Notion/Discord): `docs/public-posts.md`
- Quickstart (5-min): `docs/quickstart.md`
- 30-minute integration guide: `docs/integration-30min-guide.md`
- Troubleshooting: `docs/troubleshooting.md`
- SDK-style examples: `examples/client-js-axios.js`(Node fetch 기반), `examples/client-python-requests.py`
- Case studies: `docs/case-studies/`

## Operational checklist
- [ ] Keep ACP and X profile links updated to permanent production URLs
- [ ] Monitor first 7-day usage metrics (requests, deny rate, failures, repeat wallets)
- [ ] Run deployment-like benchmark regularly and publish updated summary artifacts
- [ ] Publish case-study updates with objective before/after indicators
