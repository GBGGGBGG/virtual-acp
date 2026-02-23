# GateX Latest Benchmark

Generated: 2026-02-23T12:47:22.183Z

## Setup
- Endpoint: `http://127.0.0.1:8790/api/gate/evaluate`
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
- max: **25 ms**

### GateX Engine Runtime (`runtime.processing_ms`)
- p50: **0.018 ms**
- p95: **0.031 ms**
- p99: **0.037 ms**
- max: **0.346 ms**

## Artifact Files
- `docs/benchmarks/benchmark-2026-02-23T12-47-22-183Z.json`
- `docs/benchmarks/benchmark-2026-02-23T12-47-22-183Z.md`

## Notes
- This benchmark is local-loopback synthetic load for regression tracking.
- For external publication, run the same script in target infra (container + network path) and include machine specs.
