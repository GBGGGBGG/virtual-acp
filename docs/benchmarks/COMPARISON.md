# GateX Benchmark Comparison (Objective Snapshot)

Date: 2026-02-23

## Method
- Fixed workload: 1000 requests, concurrency 20
- Endpoint: `/api/gate/evaluate`
- Payload: mixed benign + periodic high-risk samples
- Metrics: success/fail, round-trip latency (p50/p95/p99/max), engine runtime (`runtime.processing_ms`)

## Results

### 1) Spawned local process (script-managed)
- File: `benchmark-spawned-local-2026-02-23T12-51-01-870Z.json`
- Success: 1000/1000
- Latency: p50 2ms, p95 4ms, p99 5ms, max 19ms
- Engine runtime: p50 0.012ms, p95 0.021ms, p99 0.108ms, max 0.472ms

### 2) External process (already-running server)
- File: `benchmark-external-2026-02-23T12-51-27-656Z.json`
- Success: 1000/1000
- Latency: p50 2ms, p95 4ms, p99 6ms, max 27ms
- Engine runtime: p50 0.016208ms, p95 0.028417ms, p99 0.043792ms, max 0.291042ms

## Objective Interpretation
- Reliability under this load is strong (0 failures in both runs).
- Latency profile is consistently low on local host.
- Engine runtime is sub-millisecond and stable.
- These results are **single-host local benchmarks**, not internet-facing production measurements.

## 3-Run External Summary (new)
- Summary file: `benchmark-summary-external-2026-02-23T13-01-20-007Z.md`
- Runs: 3 (external mode)
- Latency median/min/max:
  - p50: 2 / 2 / 2 ms
  - p95: 4 / 3 / 4 ms
  - p99: 5 / 4 / 6 ms
- Engine runtime median/min/max:
  - p50: 0.014459 / 0.014 / 0.016625 ms
  - p95: 0.019167 / 0.017875 / 0.029917 ms

## Important Limitation (for public claims)
- Docker-based measurement could not be run on this host because `docker` is not installed in current environment.
- Before public release, add one benchmark from deployment-like infra (container + reverse proxy + network path).
