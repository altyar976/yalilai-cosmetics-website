"""
Art-directed compositions: hero turntable sequence, floating cut-outs and editorial still lifes.

    python tools/product-renders/scenes.py --out <dir> --only hero-turntable --frames 72
    python tools/product-renders/scenes.py --out <dir> --only editorial-lips,editorial-eyes
"""
import argparse
import math
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy  # noqa: E402
import yrender as Y  # noqa: E402
from yrender import M, lathe, fillet, box  # noqa: E402
from archetypes import BUILDERS, descendants, parent_all  # noqa: E402
from specs import SPECS  # noqa: E402

STONE = "#E9E2D8"
STONE_WARM = "#E2D3C6"
BLUSH_STONE = "#E4C9BE"


def stone(color=STONE):
    return M("matte", color, rough=0.78)


def plinth(r, h, x=0.0, y=0.0, color=STONE, n=2.0):
    o = lathe("plinth", fillet([(0, 0, 0), (r, 0, 0.15), (r, h, 0.12), (0, h, 0)]), mat=stone(color), seg=160, n=n)
    o.location = (x, y, 0)
    return o


def block(w, d, h, x=0.0, y=0.0, color=STONE, rot=0.0):
    o = box("block", w, d, h, loc=(x, y, h / 2), bevel=0.18, mat=stone(color))
    o.rotation_euler.z = math.radians(rot)
    return o


def put(slug, view="alt", loc=(0, 0, 0), rot=0.0, **override):
    spec = SPECS[slug]
    params = dict(spec["params"])
    params.update(override)
    groups = BUILDERS[spec["arch"]](params, view)
    holder = bpy.data.objects.new(f"Put-{slug}", None)
    bpy.context.scene.collection.objects.link(holder)
    for g in groups:
        g.parent = holder
    holder.location = loc
    holder.rotation_euler.z = math.radians(rot)
    bpy.context.view_layer.update()
    return holder


def setup(w, h, samples, transparent=False, backdrop=True, exposure=-0.4):
    Y.reset()
    Y._MAT_CACHE.clear()
    Y.setup_render(w, h, samples=samples, transparent=transparent, exposure=exposure)
    Y.studio(backdrop_color="#E9E7E3")
    if not backdrop:
        # keep the cyclorama for bounce light and reflections, but hide it from the camera
        bd = bpy.data.objects.get("Backdrop")
        if bd:
            bd.visible_camera = False
            bd.visible_shadow = False
    return Y.camera(lens=85)


def all_objects(roots):
    out = []
    for r in roots:
        out.append(r)
        out.extend(descendants(r))
    return out


# ---------------------------------------------------------------------------------------------
# Hero: rotating arrangement on an ivory stage
# ---------------------------------------------------------------------------------------------

def hero_arrangement():
    items = []
    items.append(plinth(7.4, 1.8, color=STONE))
    items.append(plinth(3.3, 2.8, x=-2.4, y=1.6, color=BLUSH_STONE))  # raised riser (stacked)
    items[-1].location.z = 1.8
    items.append(put("satin-signature-lipstick", "hero", loc=(-2.6, 1.7, 4.6), rot=-10, cap_lying=False))
    items.append(put("volume-sculpt-mascara", "alt", loc=(2.2, 2.4, 1.8), rot=20))
    items.append(put("mirror-shine-lip-gloss", "alt", loc=(3.6, -1.2, 1.8), rot=-15))
    items.append(put("pressed-powder-blush", "alt", loc=(-1.9, -3.6, 1.8), rot=18, r=2.1))
    items.append(put("velvet-matte-lipstick", "alt", loc=(0.9, -0.2, 1.8), rot=35))
    root = parent_all(items, "Turntable")
    return root


def render_turntable(out, frames=36, w=1280, h=960, samples=32, start=0, step=1):
    os.makedirs(os.path.join(out, "hero", "frames"), exist_ok=True)
    cam = setup(w, h, samples)
    root = hero_arrangement()
    objs = all_objects([root])
    # frame on the union of bounds across a full turn so nothing clips while rotating
    corners = []
    for a in range(0, 360, 30):
        root.rotation_euler.z = math.radians(a)
        bpy.context.view_layer.update()
        mn, mx = Y.product_bounds(objs)
        corners += [mn, mx]
    root.rotation_euler.z = 0
    bpy.context.view_layer.update()
    helper = []
    from mathutils import Vector
    mn = Vector(map(min, *[c for c in corners]))
    mx = Vector(map(max, *[c for c in corners]))
    for co in (mn, mx):
        e = bpy.data.objects.new("bound", None)
        bpy.context.scene.collection.objects.link(e)
        e.location = co
        helper.append(e)
    dummy = box("boundbox", mx.x - mn.x, mx.y - mn.y, mx.z - mn.z, loc=((mn.x + mx.x) / 2, (mn.y + mx.y) / 2, (mn.z + mx.z) / 2), bevel=0)
    dummy.hide_render = False
    Y.frame(cam, [dummy], azimuth=-12, elevation=15, fill_h=0.94, fill_w=0.74, center_bias=0.0)
    bpy.data.objects.remove(dummy)
    for i in range(start, frames, step):
        path = os.path.join(out, "hero", "frames", f"f{i:03d}.png")
        if os.path.exists(path):
            continue
        root.rotation_euler.z = math.radians(-360.0 * i / frames)
        bpy.context.view_layer.update()
        t0 = time.time()
        Y.render(path)
        print(f"RENDERED turntable {i} {time.time() - t0:.1f}s", flush=True)


# ---------------------------------------------------------------------------------------------
# Floating cut-outs (transparent PNG) for the hero foreground
# ---------------------------------------------------------------------------------------------

def render_cutouts(out, samples=96):
    os.makedirs(os.path.join(out, "hero"), exist_ok=True)
    jobs = [
        ("cutout-lipstick", "satin-signature-lipstick", "hero", {"cap_lying": True}, (-20, 8), (0, 0)),
        ("cutout-mascara-wand", "volume-sculpt-mascara", "hero", {}, (-30, 6), (0, 0)),
        ("cutout-gloss", "silk-lip-oil", "alt", {}, (-24, 10), (0, 0)),
    ]
    for name, slug, view, ov, (az, el), _ in jobs:
        path = os.path.join(out, "hero", f"{name}.png")
        if os.path.exists(path):
            continue
        cam = setup(900, 1200, samples, transparent=True, backdrop=False, exposure=-0.4)
        spec = SPECS[slug]
        params = dict(spec["params"])
        params.update(ov)
        groups = BUILDERS[spec["arch"]](params, view)
        if name == "cutout-mascara-wand":
            # keep only the floating wand
            groups = [g for g in groups if g.name.startswith("Wand")] or groups
            for o in bpy.data.objects:
                if o.type == "MESH" and o not in descendants(groups[0]) and not o.name.startswith("Backdrop"):
                    o.hide_render = True
        if name == "cutout-lipstick":
            groups = groups[:1]
            for o in bpy.data.objects:
                if o.type == "MESH" and o not in descendants(groups[0]) and not o.name.startswith("Backdrop"):
                    o.hide_render = True
        objs = []
        for g in groups:
            objs += descendants(g)
        Y.frame(cam, [o for o in objs if not o.hide_render], azimuth=az, elevation=el, fill_h=0.86, fill_w=0.86)
        Y.render(path)
        print(f"RENDERED {name}", flush=True)


# ---------------------------------------------------------------------------------------------
# Editorial still lifes (category gallery)
# ---------------------------------------------------------------------------------------------

def editorial(name):
    items = []
    if name == "editorial-mascara":
        items += [block(4.6, 4.6, 3.6, x=-2.6, y=0.8, color=STONE, rot=8), block(5.4, 4.6, 1.4, x=2.4, y=-0.4, color=BLUSH_STONE, rot=-6)]
        items.append(put("volume-sculpt-mascara", "hero", loc=(-3.0, 0.9, 3.6), rot=0, wand_x=2.2, wand_tilt=-18, wand_lift=1.4))
        items.append(put("long-line-lengthening-mascara", "alt", loc=(1.5, 0.2, 1.4), rot=10))
        items.append(put("lift-curl-mascara", "alt", loc=(3.4, -1.5, 1.4), rot=-12))
    elif name == "editorial-lips":
        items += [plinth(3.4, 5.2, x=-2.4, y=1.4, color=BLUSH_STONE), plinth(3.6, 2.0, x=2.6, y=0.0, color=STONE)]
        items.append(put("satin-signature-lipstick", "alt", loc=(-3.4, 1.8, 5.2), rot=10))
        items.append(put("velvet-matte-lipstick", "hero", loc=(-1.4, 1.0, 5.2), rot=-20, cap_lying=False))
        items.append(put("silk-lip-oil", "alt", loc=(1.8, 0.8, 2.0), rot=15))
        items.append(put("mirror-shine-lip-gloss", "alt", loc=(3.7, -0.9, 2.0), rot=-20))
        items.append(put("classic-wood-lip-pencil", "alt", loc=(0.4, -4.6, 0.0), rot=-18))
    elif name == "editorial-complexion":
        items += [block(7.0, 5.6, 2.6, x=-2.8, y=1.5, color=STONE, rot=-4), plinth(3.8, 1.1, x=3.4, y=-1.6, color=BLUSH_STONE)]
        items.append(put("second-skin-liquid-foundation", "alt", loc=(-4.0, 2.0, 2.6), rot=8))
        items.append(put("cream-blush-pot", "alt", loc=(-0.6, 0.6, 2.6), rot=0, r=1.6, h=1.5))
        items.append(put("pressed-powder-blush", "hero", loc=(3.4, -1.1, 1.1), rot=-10, r=2.7))
        items.append(put("luminous-highlighter", "alt", loc=(-1.2, -4.4, 0.0), rot=20, r=2.3))
    elif name == "editorial-eyes":
        items += [block(8.6, 6.2, 1.2, x=0.2, y=0.8, color=STONE, rot=-4), block(3.2, 3.2, 3.0, x=4.6, y=2.6, color=BLUSH_STONE, rot=8)]
        items.append(put("nine-shade-eyeshadow-palette", "hero", loc=(-0.6, 1.2, 1.2), rot=6))
        items.append(put("fine-brush-liquid-liner", "alt", loc=(4.6, 2.6, 3.0), rot=0))
        items.append(put("precision-liquid-eyeliner-pen", "alt", loc=(1.4, -1.5, 1.2), rot=-20))
        items.append(put("kohl-eye-pencil", "alt", loc=(-0.8, -4.0, 0.0), rot=12))
    return items


def render_editorial(out, names, w=1400, h=1750, samples=96):
    os.makedirs(os.path.join(out, "editorial"), exist_ok=True)
    cams = {
        "editorial-mascara": dict(azimuth=-18, elevation=12, fill_h=0.8, fill_w=0.98),
        "editorial-lips": dict(azimuth=-14, elevation=16, fill_h=0.8, fill_w=1.0),
        "editorial-complexion": dict(azimuth=-20, elevation=22, fill_h=0.8, fill_w=1.0),
        "editorial-eyes": dict(azimuth=-14, elevation=40, fill_h=0.86, fill_w=1.0),
    }
    for name in names:
        path = os.path.join(out, "editorial", f"{name}.png")
        if os.path.exists(path):
            continue
        cam = setup(w, h, samples)
        items = editorial(name)
        Y.frame(cam, all_objects(items), **cams[name])
        t0 = time.time()
        Y.render(path)
        print(f"RENDERED {name} {time.time() - t0:.1f}s", flush=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--only", default="editorial,cutouts,hero-turntable")
    ap.add_argument("--frames", type=int, default=72)
    ap.add_argument("--step", type=int, default=1)
    ap.add_argument("--start", type=int, default=0)
    ap.add_argument("--preview", action="store_true")
    a = ap.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:])
    only = a.only.split(",")
    ed = [n for n in only if n.startswith("editorial-")] or (
        ["editorial-mascara", "editorial-lips", "editorial-complexion", "editorial-eyes"] if "editorial" in only else [])
    if ed:
        render_editorial(a.out, ed, *( (560, 700, 32) if a.preview else (1200, 1500, 64) ))
    if "cutouts" in only:
        render_cutouts(a.out, samples=32 if a.preview else 64)
    if "hero-turntable" in only:
        if a.preview:
            render_turntable(a.out, frames=a.frames, w=640, h=480, samples=24, start=a.start, step=a.step)
        else:
            render_turntable(a.out, frames=a.frames, start=a.start, step=a.step)


if __name__ == "__main__":
    main()
