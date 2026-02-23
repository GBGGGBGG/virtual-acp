# Production `.env` Setup Guide

## 1) Create `.env`
```bash
cp .env.production.template .env
```

## 2) Replace required secrets
- `GATEX_SIGNING_SECRET`
- `GATEX_ADMIN_TOKEN`

Recommended secret generation:
```bash
openssl rand -hex 32
```
Use separate values for signing/admin token.

## 3) Set Redis endpoint
```env
REDIS_URL=redis://<redis-host>:6379
```

## 4) Validate before deploy
```bash
npm test
npm run preflight
npm run smoke
```

## 5) Deployment-like benchmark (Docker-capable host)
```bash
bash scripts/run-deployment-benchmark.sh
```

## Security checklist
- Never commit real `.env`
- Rotate secrets on incident/role change
- Restrict admin endpoints at network layer (IP allowlist/reverse proxy)
- Keep `/api/webhook/sign` internal only
