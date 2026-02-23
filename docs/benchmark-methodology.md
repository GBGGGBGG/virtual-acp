# GateX Benchmark Methodology (Public)

## Purpose
This document defines how GateX benchmark numbers are measured and how to interpret them.

## Workload Profile
- Endpoint: `POST /api/gate/evaluate`
- Requests per run: `1000`
- Concurrency: `20`
- Payload mix: mostly benign requests + periodic high-risk samples
- Warmup: `50` requests before measurement

## Metrics Reported
1. **Success/Failure** count
2. **Round-trip latency** (p50/p95/p99/max, ms)
3. **Throughput** (RPS)
4. **Engine runtime** (`runtime.processing_ms`) from GateX response

## Environments
Run at least these two:
1. **Local loopback** (regression baseline)
2. **Deployment-like path** (container + reverse proxy + network path)

Optional:
- Cross-region client
- TLS-enabled ingress
- Redis-on/Redis-off comparison

## Commands
### Local spawned mode
```bash
npm run benchmark
```

### External server mode
```bash
BENCH_SPAWN=false BENCH_BASE_URL=http://127.0.0.1:8787 npm run benchmark
```

## Reproducibility Rules
- Same commit hash
- Same Node version
- Same benchmark parameters (requests/concurrency/warmup)
- Record machine specs (CPU, memory), OS, and runtime versions
- Run at least 3 times and report median + min/max

## Limitations
- Local benchmarks can overestimate production performance.
- Engine runtime excludes network transport and client overhead.
- Synthetic payloads may not reflect all real-world distributions.

## Publication Guidance
When publishing numbers, include:
- Commit SHA
- Environment description
- Command used
- Raw artifact file paths (`docs/benchmarks/*.json`)
- Caveats from the Limitations section
