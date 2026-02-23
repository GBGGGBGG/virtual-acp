# GateX ACP — Public One-Pager

## 1) What GateX is
GateX is a deterministic risk operating layer for autonomous agents.

It does **not** replace strategy or analysis. It acts as a final execution gate to reduce preventable failures and keep risk controls explainable.

## 2) Core value proposition
- Deterministic allow/deny gates (explainable and reproducible)
- Adaptive threshold tuning with bounded rules (no random decisions)
- Policy versioning + rollback for operational safety
- Verification metadata + signed response support
- Simulation/report/export endpoints for pre-deploy and post-deploy analysis

## 3) Why teams adopt it
- Makes risk decisions auditable
- Adds a safety layer without black-box model behavior
- Reduces operational uncertainty with rollback and history
- Integrates quickly into existing agent loops

## 4) Objective benchmark snapshot (local host)
Source artifacts:
- `docs/benchmarks/LATEST.md`
- `docs/benchmarks/COMPARISON.md`

Latest external-mode run (1000 req, concurrency 20):
- Success: **1000/1000**
- API latency: p50 **2ms**, p95 **4ms**, p99 **6ms**
- Engine runtime (`runtime.processing_ms`):
  - p50 **0.016208ms**
  - p95 **0.028417ms**
  - p99 **0.043792ms**

## 5) Public benchmark caveats (important)
- Current published numbers are local-loopback benchmarks.
- They are valid for regression tracking, but not final internet-facing SLO claims.
- For external publication confidence, rerun in deployment-like infra (container + reverse proxy + network path) with machine specs attached.

## 6) 30-minute integration path
1. Start GateX (`npm run dev`)
2. Verify health (`GET /api/health`)
3. Send evaluate requests (`POST /api/gate/evaluate`)
4. Enforce action execution only on `decision=ALLOW`
5. Store `decision`, `verification_score`, `runtime.processing_ms`
6. Run pre-deploy checks (`npm test && npm run preflight && npm run smoke && npm run benchmark`)

Full guide:
- `docs/integration-30min-guide.md`

## 7) Security posture summary
- Admin token-protected sensitive endpoints
- Internal-only webhook signing endpoint protection
- Timing-safe token/signature comparison
- Policy rollback control with version history

## 8) Current maturity (objective)
- Engineering maturity: **High for pre-production**
- Production evidence maturity: **Moderate** (needs deployment-like benchmark + external case study)

## 9) Recommended next milestone (to drive broad adoption)
- Publish one deployment-like benchmark report
- Add one real-world case study (before/after failure & deny behavior)
- Add framework adapters/templates for mainstream agent stacks

## 10) Quick links
- OpenAPI: `docs/openapi.yaml`
- Deploy checklist: `docs/deploy-checklist.md`
- Benchmark methodology: `docs/benchmark-methodology.md`
- Benchmark reports: `docs/benchmarks/`
- JS/Python examples: `examples/`
