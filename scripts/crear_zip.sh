#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT_DIR/dist"
OUT_FILE="$OUT_DIR/entrega-juego-digitalizacion-ia-2026.zip"
mkdir -p "$OUT_DIR"
cd "$ROOT_DIR"
zip -r "$OUT_FILE" game README.md start.sh start.bat > /dev/null

echo "ZIP generado en: $OUT_FILE"
