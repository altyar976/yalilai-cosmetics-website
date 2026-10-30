# Product render pipeline

Original, photoreal concept renderings for the catalogue — generated procedurally in Blender (Cycles) from
code, so every packaging shape, colourway and composition is reproducible and free of third-party IP.

```
yrender.py     studio (cyclorama, softboxes), materials, lathe/superellipse geometry, decals, framing
archetypes.py  packaging builders: wand tube, lipstick, pencil, compact, palette, jar, bottle, squeeze tube, stick, pen
specs.py       one spec per catalogue concept (shape, materials, print, colourways, camera)
render.py      renders <slug>/hero.png, alt.png and hero-<colourway>.png
scenes.py      hero turntable sequence, floating cut-outs, editorial still lifes
fonts/         Bodoni Moda + Jost (SIL Open Font License) for the "YOUR BRAND" placeholder print
```

## Setup

Blender's Python module (`bpy`) needs the matching Python version (bpy 5.2 → Python 3.13):

```bash
python3.13 -m venv .venv-bpy
.venv-bpy/bin/pip install bpy pillow
```

## Rendering

```bash
# quick low-res previews of a few concepts
.venv-bpy/bin/python tools/product-renders/render.py --slugs volume-sculpt-mascara,silk-lip-oil --preview --out /tmp/preview

# full production queue (≈2–4 h on a 4-core CPU)
PY=.venv-bpy/bin/python tools/product-renders/render-all.sh

# convert to WebP for the website and refresh the image manifest
node scripts/prepare-renders.mjs tools/product-renders/out
```

Add a concept: append a spec to `specs.py` (re-using an archetype), add the matching entry in
`src/data/products.ts`, render, then run `prepare-renders`. Colourways listed in `colorway_list` become
`hero-<id>.webp` and appear automatically as swatches on the product page.

All outputs are illustrative concepts and are labelled as such on the site.
