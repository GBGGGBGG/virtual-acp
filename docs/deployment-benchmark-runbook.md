# Deployment-like Benchmark Runbook

## Goal
Produce publishable benchmark evidence beyond local loopback.

## Required environment
- Container runtime (Docker/Podman)
- Reverse proxy/TLS path (optional but recommended)
- Redis enabled

## Step 1: Start stack
```bash
npm run docker:up
```

Verify:
```bash
curl -s http://127.0.0.1:8787/api/health
```
Expect `store.type=redis`.

## Step 2: Run benchmark in external mode
```bash
BENCH_SPAWN=false BENCH_BASE_URL=http://127.0.0.1:8787 npm run benchmark
```

## Step 3: Repeat 3 times
Run step 2 three times and keep all artifact JSON files under `docs/benchmarks/`.

## Step 4: Publish median stats
Report median p50/p95/p99 and include min/max spread.

## Step 5: Attach context
Include in report:
- commit SHA
- machine specs (CPU, RAM)
- OS and Node versions
- Redis on/off and network topology

## Known blocker in current host
If `docker` command is unavailable, deployment-like benchmark cannot run on this host.
Use another machine with container runtime and keep method identical.
