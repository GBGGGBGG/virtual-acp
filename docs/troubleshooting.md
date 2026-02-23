# GateX Troubleshooting

## 1) `401 unauthorized` on policy/report/simulate endpoints
Cause: `GATEX_ADMIN_TOKEN` is set but token header missing/wrong.

Fix:
- Send `x-gatex-admin-token: <token>`
- Or `Authorization: Bearer <token>`

## 2) `DENY_SCHEMA` response
Cause: request payload missing required fields or types.

Fix:
- Ensure `request_id`, `policy`, `signals` exist
- Verify nested signal fields are numeric where expected
- Use payload examples in README/quickstart

## 3) `/api/webhook/sign` returns 401
Cause: endpoint is admin-protected by design.

Fix:
- Include admin token header

## 4) Redis not used (`store.type=memory`)
Cause: `REDIS_URL` not configured or Redis unreachable.

Fix:
- Set `REDIS_URL=redis://host:6379`
- Verify Redis network access
- Recheck via `GET /api/health`

## 5) Benchmark fails with port conflict (`EADDRINUSE`)
Cause: another process already listening on benchmark port.

Fix:
- Stop running GateX processes OR
- Run benchmark in external mode:
```bash
BENCH_SPAWN=false BENCH_BASE_URL=http://127.0.0.1:8787 npm run benchmark
```
- Or choose another port:
```bash
BENCH_PORT=8791 npm run benchmark
```

## 6) Smoke fails on auth boundary checks
Cause: missing admin token env in target process.

Fix:
- Set `GATEX_ADMIN_TOKEN` before running smoke
- Re-run `npm run smoke`

## 7) Very low/zero runtime.processing_ms in some runs
Cause: extremely fast path + time precision/serialization.

Fix:
- Use recent version with microsecond precision
- Compare distribution across multiple runs, not a single sample

## 8) Docker commands unavailable
Cause: Docker is not installed in host environment.

Fix:
- Install Docker Desktop/Engine
- Re-run container benchmarks for production-like evidence
