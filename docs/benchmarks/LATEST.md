# GateX Latest Benchmark

Generated: 2026-02-23T12:51:27.656Z

## Setup
- Mode: `external` (already-running server)
- Endpoint: `http://127.0.0.1:8787/api/gate/evaluate`
- Requests: 1000
- Concurrency: 20
- Runtime: Node v22.22.0 (darwin/arm64)

## Result Summary
- Success: **1000 / 1000** (0 failures)
- Throughput: **~1000 RPS**
- Total elapsed: **132 ms**

### API Round-trip Latency
- p50: **2 ms**
- p95: **4 ms**
- p99: **6 ms**
- max: **27 ms**

### GateX Engine Runtime (`runtime.processing_ms`)
- p50: **0.016208 ms**
- p95: **0.028417 ms**
- p99: **0.043792 ms**
- max: **0.291042 ms**

## Artifact Files
- `docs/benchmarks/benchmark-external-2026-02-23T12-51-27-656Z.json`
- `docs/benchmarks/benchmark-external-2026-02-23T12-51-27-656Z.md`
- Comparison: `docs/benchmarks/COMPARISON.md`

## Notes
- This benchmark is local-loopback synthetic load for regression tracking.
- Docker benchmark was not executed on this host (`docker` command unavailable).
- For external publication, run the same script in target infra (container + reverse proxy + network path) and include machine specs.
