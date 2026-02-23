# GateX ACP Deployment Checklist (Pre-Production to Production)

## 0) Local readiness
- [ ] `npm test` passes
- [ ] `npm run preflight` passes (health + eval + latency)
- [ ] `npm run smoke` passes (auth boundary + webhook sign/verify)
- [ ] `.env` set with non-default `GATEX_SIGNING_SECRET`
- [ ] Redis connectivity verified

## 1) Container readiness
- [ ] `docker compose up --build` starts GateX + Redis
- [ ] `GET /api/health` returns store.type=redis
- [ ] logs written to `./logs/gatex-events.jsonl`

## 2) Security hardening
- [ ] Rotate signing secret for prod
- [ ] Restrict `/api/policy/rollback*` behind admin auth
- [ ] Restrict `/api/webhook/sign` to internal callers
- [ ] Enable HTTPS/TLS termination (reverse proxy)
- [ ] Enable IP allowlist for ACP caller

## 3) Observability
- [ ] Add uptime monitor for `/api/health`
- [ ] Add latency monitor for `/api/gate/evaluate` (p95 < 1000ms)
- [ ] Add log shipping pipeline for JSONL
- [ ] Add alert for deny rate spike and failure rate spike

## 4) Virtual ACP handoff artifacts
- [ ] Name: GateX
- [ ] Description + capability summary
- [ ] Public endpoint base URL
- [ ] OpenAPI spec (`docs/openapi.yaml`)
- [ ] Signing verification method docs
- [ ] Policy rollback protocol docs

## 5) Go-live runbook
- [ ] Dry-run with `/api/policy/simulate` on historical samples
- [ ] Preset compare with `/api/policy/simulate/preset`
- [ ] Verify signature generation matches consumer
- [ ] Freeze params version at deployment
- [ ] Tag release in git

## 6) Post-deploy validation
- [ ] First 1h: monitor deny/allow ratios
- [ ] First 24h: check attribution trends
- [ ] Confirm no uncontrolled parameter drift
- [ ] Confirm rollback endpoint functional
