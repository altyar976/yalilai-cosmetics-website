"""
Render catalogue images.

Usage (with a Python that has `bpy` installed, e.g. `pip install bpy` on Python 3.13):
    python tools/product-renders/render.py --out public/images/products --slugs all
    python tools/product-renders/render.py --slugs volume-sculpt-mascara --views hero --preview

Outputs PNG files named  <slug>/<view>[-<colorway>].png  that are later converted to WebP by
`scripts/optimize-renders.mjs`.
"""
import argparse
import json
import math
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy  # noqa: E402
import yrender as Y  # noqa: E402
from archetypes import BUILDERS, descendants  # noqa: E402
from specs import SPECS, COLORWAYS  # noqa: E402


def build_and_render(slug, view, colorway, out, w, h, samples, overwrite=False):
    spec = SPECS[slug]
    suffix = "" if colorway == "default" else f"-{colorway}"
    path = os.path.join(out, slug, f"{view}{suffix}.png")
    if os.path.exists(path) and not overwrite:
        return path, 0.0
    os.makedirs(os.path.dirname(path), exist_ok=True)
    t0 = time.time()
    Y.reset()
    Y._MAT_CACHE.clear()
    Y.setup_render(w, h, samples=samples, exposure=spec.get("exposure", -0.4))
    Y.studio(backdrop_color=spec.get("backdrop", "#E9E7E3"), key=spec.get("key", 1.0))
    cam = Y.camera(lens=spec.get("lens", 100))
    params = dict(spec["params"])
    if colorway != "default":
        cw = spec.get("colorways", {}).get(colorway)
        if cw is None:
            cw = COLORWAYS[colorway](spec)
        params.update(cw)
    if spec.get("multi"):
        groups = []
        for (dx, dy, ov) in spec["multi"]:
            pp = dict(params)
            pp.update(ov)
            gs = BUILDERS[spec["arch"]](pp, spec.get("pose", {}).get(view, view))
            for g in gs:
                g.location.x += dx
                g.location.y += dy
            groups.extend(gs)
        bpy.context.view_layer.update()
    else:
        groups = BUILDERS[spec["arch"]](params, spec.get("pose", {}).get(view, view))
    objs = []
    for g in groups:
        objs.extend(descendants(g))
    cams = spec.get("camera", {}).get(view, {})
    Y.frame(cam, objs, azimuth=cams.get("az", -26), elevation=cams.get("el", 11), fill_h=cams.get("fill_h", spec.get("fill_h", 0.72)),
            fill_w=cams.get("fill_w", spec.get("fill_w", 0.8)), center_bias=cams.get("bias", 0.0))
    Y.render(path)
    return path, time.time() - t0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=os.path.join(os.path.dirname(__file__), "out"))
    ap.add_argument("--slugs", default="all")
    ap.add_argument("--views", default="hero,alt")
    ap.add_argument("--colorways", default="default")
    ap.add_argument("--w", type=int, default=1200)
    ap.add_argument("--h", type=int, default=1500)
    ap.add_argument("--samples", type=int, default=160)
    ap.add_argument("--preview", action="store_true", help="fast low-res preview")
    ap.add_argument("--overwrite", action="store_true")
    a = ap.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:])
    if a.preview:
        a.w, a.h, a.samples = 480, 600, 40
    slugs = list(SPECS.keys()) if a.slugs == "all" else a.slugs.split(",")
    views = a.views.split(",")
    log = []
    for slug in slugs:
        cws = ["default"]
        if a.colorways == "all":
            cws += list(SPECS[slug].get("colorway_list", []))
        elif a.colorways != "default":
            cws = a.colorways.split(",")
        for view in views:
            for cw in cws:
                if view != "hero" and cw != "default":
                    continue
                path, dt = build_and_render(slug, view, cw, a.out, a.w, a.h, a.samples, a.overwrite)
                print(f"RENDERED {slug} {view} {cw} {dt:.1f}s -> {path}", flush=True)
                log.append({"slug": slug, "view": view, "colorway": cw, "seconds": round(dt, 1)})
    with open(os.path.join(a.out, f"render-log-{int(time.time())}.json"), "w") as f:
        json.dump(log, f, indent=1)


if __name__ == "__main__":
    main()
