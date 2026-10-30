#!/usr/bin/env bash
# Second stage of the production queue (used after the hero pass): turntable, label-fix re-renders,
# alternate views and colourways. Usage: PY=... WAIT_PID=<pid> tools/product-renders/render-rest.sh
set -euo pipefail
PY="${PY:-python3}"
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="${OUT:-$HERE/out}"
if [ -n "${WAIT_PID:-}" ]; then while kill -0 "$WAIT_PID" 2>/dev/null; do sleep 15; done; fi
"$PY" "$HERE/scenes.py" --out "$OUT" --only hero-turntable --frames 36
FIX="waterproof-hold-mascara,crystal-clear-lip-gloss,champagne-shimmer-lip-gloss,liquid-matte-lipstick,brush-tip-lip-gloss,liquid-blush,velvet-matte-lipstick,second-skin-liquid-foundation,satin-signature-lipstick,cream-silk-lipstick,tinted-balm-stick,slim-bullet-lipstick,glass-shine-lipstick,serum-skin-tint,fine-mist-setting-spray,bi-phase-makeup-remover-concept"
"$PY" "$HERE/render.py" --out "$OUT" --views hero --slugs "$FIX" --overwrite --w 1000 --h 1250 --samples 44
"$PY" "$HERE/render.py" --out "$OUT" --views hero --colorways all --w 1000 --h 1250 --samples 44
"$PY" "$HERE/render.py" --out "$OUT" --views alt --w 1000 --h 1250 --samples 32
echo "REST COMPLETE"
