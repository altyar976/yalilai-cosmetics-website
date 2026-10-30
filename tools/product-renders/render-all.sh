#!/usr/bin/env bash
# Full production render queue. Usage: PY=/path/to/python-with-bpy tools/product-renders/render-all.sh
set -euo pipefail
PY="${PY:-python3}"
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="${OUT:-$HERE/out}"
W="${W:-1000}"; H="${H:-1250}"; S="${S:-44}"
"$PY" "$HERE/scenes.py" --out "$OUT" --only editorial,cutouts
"$PY" "$HERE/render.py" --out "$OUT" --views hero --w "$W" --h "$H" --samples "$S"
"$PY" "$HERE/scenes.py" --out "$OUT" --only hero-turntable --frames "${FRAMES:-36}"
"$PY" "$HERE/render.py" --out "$OUT" --views alt --w "$W" --h "$H" --samples "$S"
"$PY" "$HERE/render.py" --out "$OUT" --views hero --colorways all --w "$W" --h "$H" --samples "$S"
echo "ALL RENDERS COMPLETE"
