#!/usr/bin/env bash
set -euo pipefail

# GateX deployment-like benchmark runner
# Usage:
#   bash scripts/run-deployment-benchmark.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[1/6] Checking docker availability..."
if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker command not found"
  exit 1
fi

echo "[2/6] Starting stack (GateX + Redis)..."
docker compose up -d --build

echo "[3/6] Waiting for health endpoint..."
for i in {1..30}; do
  if curl -fsS http://127.0.0.1:8787/api/health >/tmp/gatex-health.json 2>/dev/null; then
    break
  fi
  sleep 2
done

if ! curl -fsS http://127.0.0.1:8787/api/health >/tmp/gatex-health.json; then
  echo "ERROR: health check failed"
  docker compose logs --tail=100
  exit 1
fi

echo "Health:"
cat /tmp/gatex-health.json

echo "[4/6] Running external benchmark 3 times..."
BENCH_SPAWN=false BENCH_BASE_URL=http://127.0.0.1:8787 npm run benchmark
BENCH_SPAWN=false BENCH_BASE_URL=http://127.0.0.1:8787 npm run benchmark
BENCH_SPAWN=false BENCH_BASE_URL=http://127.0.0.1:8787 npm run benchmark

echo "[5/6] Aggregating summary..."
npm run benchmark:summary

echo "[6/6] Done. Key artifacts:"
ls -1t docs/benchmarks/benchmark-summary-external-*.md | head -n 1
ls -1t docs/benchmarks/benchmark-summary-external-*.json | head -n 1

echo "Optional cleanup: docker compose down"
