# GateX ACP Manifest Draft (Virtual)

## Identity
- Name: GateX
- Type: ACP (Adaptive Deterministic Risk OS)
- Version: 0.1.0

## Capabilities
- Deterministic gate evaluation (`/api/gate/evaluate`)
- ACP execution adapter (`/api/acp/execute`)
- Policy simulation (`/api/policy/simulate`, `/api/policy/simulate/preset`)
- Policy versions / diff / rollback
- Attribution + stability reporting
- Signed verification metadata (HMAC-SHA256)

## Runtime Requirements
- Node.js 20+
- Optional Redis for persisted state
- P95 target under 1000ms

## Security / Safety
- No random decisions
- No black-box ML allow/deny
- Bounded adaptive thresholds
- Versioned policy with rollback

## Next for production
- Register endpoint + auth in Virtual ACP control plane
- Enforce callback signatures
- Add mTLS or signed JWT between ACP caller and GateX
