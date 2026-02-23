# GateX Production Runbook

## 1) Environment
1. Copy `.env.example` to `.env`
2. Set secrets:
   - `GATEX_SIGNING_SECRET`
   - `GATEX_ADMIN_TOKEN`
3. Set Redis:
   - `REDIS_URL`
   - `REDIS_KEY_PREFIX`
   - `REDIS_STATE_TTL_SEC`

## 2) Start service
### Node mode
```bash
npm install
npm run dev
```

### Docker mode
```bash
npm run docker:up
```

## 3) Smoke tests
```bash
npm run preflight
curl -s http://localhost:8787/api/health | jq
```

## 4) Security checks
- `x-gatex-admin-token` required for `/api/policy/*`, `/api/report/*`
- webhook signature verify endpoint working
- only HTTPS exposed publicly

## 5) Operational checks
- Evaluate endpoint latency p95 < 1000ms
- JSONL logs emitted
- Policy versions and rollback work

## 6) Ready-to-register artifacts
- `docs/openapi.yaml`
- `docs/virtual-acp-manifest-draft.md`
- `docs/deploy-checklist.md`
- endpoint base URL
- signature verification details
