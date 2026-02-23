# Deployment Benchmark (Copy-Paste Commands)

Run these commands on a machine with Docker installed.

```bash
git clone https://github.com/GBGGGBGG/virtual-acp.git
cd virtual-acp
bash scripts/run-deployment-benchmark.sh
```

If you prefer manual commands:

```bash
cd virtual-acp

docker compose up -d --build
curl -s http://127.0.0.1:8787/api/health

BENCH_SPAWN=false BENCH_BASE_URL=http://127.0.0.1:8787 npm run benchmark
BENCH_SPAWN=false BENCH_BASE_URL=http://127.0.0.1:8787 npm run benchmark
BENCH_SPAWN=false BENCH_BASE_URL=http://127.0.0.1:8787 npm run benchmark

npm run benchmark:summary

# optional
# docker compose down
```

## What to share back
- latest `docs/benchmarks/benchmark-summary-external-*.md`
- corresponding `.json`
- output of `curl -s http://127.0.0.1:8787/api/health`
- machine spec (CPU/RAM/OS)
