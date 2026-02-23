#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/deployment-bundle"
TS="$(date +%Y%m%d-%H%M%S)"
PKG="$OUT/GateX-deployment-$TS"

mkdir -p "$PKG"

cp "$ROOT/README.md" "$PKG/"
cp "$ROOT/.env.example" "$PKG/"
cp "$ROOT/docs/openapi.yaml" "$PKG/"
cp "$ROOT/docs/deploy-checklist.md" "$PKG/"
cp "$ROOT/docs/virtual-acp-manifest-draft.md" "$PKG/"
cp "$ROOT/docker-compose.yml" "$PKG/"
cp "$ROOT/Dockerfile" "$PKG/"

cat > "$PKG/CONTENTS.md" <<EOF
# GateX Deployment Bundle

Generated at: $TS

Included files:
- README.md
- .env.example
- openapi.yaml
- deploy-checklist.md
- virtual-acp-manifest-draft.md
- docker-compose.yml
- Dockerfile
EOF

tar -czf "$OUT/GateX-deployment-$TS.tar.gz" -C "$OUT" "GateX-deployment-$TS"

echo "Bundle created: $OUT/GateX-deployment-$TS.tar.gz"
