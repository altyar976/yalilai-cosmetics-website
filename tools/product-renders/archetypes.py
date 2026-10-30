"""
Procedural packaging archetypes. Each builder returns a list of top-level groups
(Empties) for the requested view: "hero" (open / applicator revealed) or
"alt" (closed, different angle).
"""
import math
import bpy
from mathutils import Vector

import yrender as Y
from yrender import M, lathe, fillet, cyl_profile, tube_shell, box, parent_all, place, label_band, \
    label_disc, text_texture, bristle_brush, descendants, plane_decal

PI = math.pi


def mat(spec):
    if spec is None:
        return None
    if isinstance(spec, str):
        return M("gloss", spec)
    kind, color, *rest = spec
    kw = rest[0] if rest else {}
    return M(kind, color, **kw)


def rest_on_floor(group):
    bpy.context.view_layer.update()
    mn, mx = Y.product_bounds(descendants(group))
    group.location.z -= mn.z
    bpy.context.view_layer.update()


def lay_down(group, yaw=25.0, x=0.0, y=0.0, spin=-127.0):
    """Lay a Z-up group on the floor. `spin` turns it about its own axis first so printed
    decoration (centred on local -Y) faces up towards the camera."""
    from mathutils import Matrix
    m = (Matrix.Translation((x, y, 0)) @ Matrix.Rotation(math.radians(yaw), 4, "Z") @
         Matrix.Rotation(math.radians(90), 4, "X") @ Matrix.Rotation(math.radians(spin), 4, "Z"))
    group.matrix_world = m
    rest_on_floor(group)


def float_pose(group, tilt=-24.0, x=2.5, y=-0.5, lift=0.9, spin=0.0, yaw=0.0):
    """Levitating component, applicator pointing up — classic beauty still-life."""
    from mathutils import Matrix
    m = (Matrix.Translation((x, y, 0)) @ Matrix.Rotation(math.radians(yaw), 4, "Z") @
         Matrix.Rotation(math.radians(tilt), 4, "Y") @ Matrix.Rotation(math.radians(180), 4, "X") @
         Matrix.Rotation(math.radians(spin), 4, "Z"))
    group.matrix_world = m
    rest_on_floor(group)
    group.location.z += lift
    bpy.context.view_layer.update()


def print_spec(p, key="print"):
    pr = p.get(key)
    if not pr:
        return None
    d = {"lines": ["YOUR BRAND"], "ink": "#FFFFFF", "foil": False, "font": "Jost-Medium.ttf", "size": 0.32,
         "tracking": 0.34}
    d.update(pr)
    return d


def band_print(name, r, z0, z1, pr, n=2.0, ax=1.0, ay=1.0, vertical=True, u=0.75, v=0.5):
    """Wrap printed text around a body section. Vertical text runs along the tube length."""
    circ = Y.perimeter(r, n, ax, ay)
    h = z1 - z0
    if vertical:
        # draw text horizontally in a (h x circ) canvas, then rotate into place
        # text image (h x circ) whose row position maps to u after a CCW rotation
        tex = text_texture(pr["lines"], h, circ, u_center=0.5, v_center=1 - u, size_cm=pr["size"],
                           font=pr["font"], tracking=pr["tracking"], sizes=pr.get("sizes"), max_w_cm=h * 0.86)
        from PIL import Image
        im = Image.open(tex).rotate(90, expand=True)
        rp = tex.replace(".png", "_v.png")
        im.save(rp)
        tex = rp
    else:
        face = r * (1.25 if n != 2.0 else 1.45) * max(ax, ay)
        tex = text_texture(pr["lines"], circ, h, u_center=u, v_center=v, size_cm=pr["size"], font=pr["font"],
                           tracking=pr["tracking"], sizes=pr.get("sizes"), max_w_cm=face)
    return label_band(name, r + 0.004, z0, z1, tex, ink=pr["ink"], foil=pr["foil"], n=n, ax=ax, ay=ay)


# ---------------------------------------------------------------------------
# Applicators
# ---------------------------------------------------------------------------

def applicator(kind, length, color="#141210", fill=None):
    """Build an applicator at the origin pointing down -Z (tip at z = -length)."""
    objs = []
    stem_r = 0.11
    stem = lathe("stem", cyl_profile(stem_r, -length + 0.2, 0.0, bevel=0.02), mat=M("satin", "#DADAD6"), seg=24)
    objs.append(stem)
    kind, _, variant = kind.partition(":")
    if kind == "brush":
        L = {"micro": 1.5, "mini": 1.9}.get(variant, 2.6)
        prof = {
            "hourglass": lambda t: 0.36 + 0.13 * (abs(t - 0.5) * 2) ** 1.4,
            "straight": lambda t: 0.40 - 0.04 * t,
            "taper": lambda t: 0.44 - 0.26 * t,
            "curved": lambda t: 0.38 - 0.08 * abs(t - 0.5),
            "comb": lambda t: 0.30 - 0.04 * t,
            "micro": lambda t: 0.20,
            "fiber": lambda t: 0.42 - 0.12 * t ** 2,
            "mini": lambda t: 0.33 - 0.06 * t,
            "ball": lambda t: 0.30,
            "spoolie": lambda t: 0.30 - 0.08 * t,
        }.get(variant, lambda t: 0.4)
        count = {"comb": 300, "micro": 340, "mini": 420, "spoolie": 380}.get(variant, 560)
        rows = 8 if variant == "comb" else None
        bmat = M("bristle", color) if variant != "comb" else M("satin", color, rough=0.4)
        brush = bristle_brush("brush", L, 0.07, prof, count=count, mat=bmat,
                              curve=9.0 if variant == "curved" else 0.0, rows=rows,
                              bristle_r=0.016 if variant != "fiber" else 0.02, turns=30)
        brush.location.z = -length - 0.05
        objs.append(brush)
        core = lathe("core", cyl_profile(0.06, -length - 0.2, -length + 0.25, bevel=0.02), mat=M("metal", "#9A9A98"),
                     seg=16)
        objs.append(core)
    elif kind == "doe":
        # flocked doe-foot paddle
        prof = fillet([(0, -length - 2.0, 0), (0.24, -length - 1.95, 0.15), (0.34, -length - 0.9, 0.5),
                       (0.17, -length + 0.1, 0.2), (0.11, -length + 0.4, 0), (0, -length + 0.4, 0)], seg=8)
        doe = lathe("doe", prof, mat=M("flock", fill or "#EDE6DE"), seg=48)
        doe.scale = (1.0, 0.42, 1.0)
        doe.rotation_euler = (0, math.radians(-6), 0)
        objs.append(doe)
    elif kind in ("paint", "liner"):
        tip_len = 1.6 if kind == "paint" else 1.2
        r0 = 0.24 if kind == "paint" else 0.11
        ferrule = lathe("ferrule", cyl_profile(0.2 if kind == "paint" else 0.14, -length - 0.1, -length + 0.6, bevel=0.03),
                        mat=M("metal", "#C9B79C", rough=0.25), seg=32)
        objs.append(ferrule)
        prof = fillet([(0, -length - tip_len, 0), (0.02, -length - tip_len + 0.02, 0.0),
                       (r0, -length - 0.35, 0.3), (r0, -length + 0.0, 0), (0, -length, 0)], seg=10)
        tip = lathe("tip", prof, mat=M("bristle", color if not fill else fill), seg=32)
        if kind == "paint":
            tip.scale = (1.0, 0.55, 1.0)
        objs.append(tip)
    elif kind == "felt":
        prof = fillet([(0, -length - 1.2, 0), (0.03, -length - 1.18, 0), (0.17, -length - 0.2, 0.1),
                       (0.17, -length + 0.1, 0), (0, -length + 0.1, 0)], seg=8)
        objs.append(lathe("felt", prof, mat=M("felt", color), seg=32))
    return objs


# ---------------------------------------------------------------------------
# Wand tube (mascara, gloss, liquid lipstick, concealer, liner, brow gel)
# ---------------------------------------------------------------------------

def wand_tube(p, view):
    R = p.get("r", 0.85)
    H = p.get("h", 8.0)
    Rc = p.get("cap_r", R)
    Hc = p.get("cap_h", 5.0)
    n = p.get("n", 2.0)
    shape_ax = p.get("ax", 1.0)
    shape_ay = p.get("ay", 1.0)
    clear = p.get("clear", False)
    body_m = mat(p.get("body", ("gloss", "#151311")))
    cap_m = mat(p.get("cap", p.get("body", ("gloss", "#151311"))))
    collar_m = mat(p.get("collar")) if p.get("collar") else None
    neck_r = min(R, Rc) * 0.55
    gap = 0.04
    seg = 128 if n == 2.0 else 160

    body_objs = []
    bev = p.get("bevel", 0.12)
    if clear:
        wall = p.get("wall", 0.12)
        floor = p.get("floor", 0.35)
        shell = lathe("body", tube_shell(R, R - wall, 0, H, bevel=bev, floor=floor), mat=body_m, seg=seg, n=n,
                      ax=shape_ax, ay=shape_ay)
        body_objs.append(shell)
        fill_m = mat(p.get("fill", ("liquid", "#C46A6A")))
        lvl = p.get("fill_level", 0.86)
        fr = R - wall - 0.012
        liq = lathe("fill", cyl_profile(fr, floor + 0.01, floor + (H - floor) * lvl, bevel=0.05), mat=fill_m,
                    seg=seg, n=n, ax=shape_ax, ay=shape_ay)
        body_objs.append(liq)
        # wiper + stem visible inside the tube when closed
        if view == "alt" or p.get("show_stem", True):
            if view == "alt":
                st = lathe("stem_in", cyl_profile(0.11, H * 0.15, H + 0.5, bevel=0.02), mat=M("satin", "#DADAD6"), seg=24)
                body_objs.append(st)
        neck = lathe("neck", cyl_profile(neck_r, H - 0.02, H + 0.9, bevel=0.05), mat=M("satin", "#EDEBE7"), seg=64)
        body_objs.append(neck)
    elif p.get("dual"):
        prof = fillet([(0, -0.9, 0), (neck_r, -0.9, 0.05), (neck_r, 0, 0.05), (R, 0, bev * 0.8), (R, H, bev * 0.8),
                       (neck_r, H, 0.05), (neck_r, H + 0.9, 0.05), (0, H + 0.9, 0)])
        body_objs.append(lathe("body", prof, mat=body_m, seg=seg, n=n, ax=shape_ax, ay=shape_ay))
    else:
        prof = fillet([(0, 0, 0), (R, 0, bev), (R, H, bev * 0.8), (neck_r, H, 0.05), (neck_r, H + 0.9, 0.05),
                       (0, H + 0.9, 0)])
        body_objs.append(lathe("body", prof, mat=body_m, seg=seg, n=n, ax=shape_ax, ay=shape_ay))
    pr = print_spec(p)
    if pr:
        rr = R if n == 2.0 else R
        body_objs.append(band_print("print", rr, 0.4, H - 0.4, pr, n=n, ax=shape_ax, ay=shape_ay, vertical=pr.get("vertical", True)))
    if p.get("dual"):
        Hc2 = p.get("cap2_h", Hc)
        c2 = lathe("cap2", fillet([(0, 0, 0), (Rc, 0, 0.18), (Rc, Hc2, 0.04), (0, Hc2, 0)]),
                   mat=mat(p.get("cap2", p.get("cap"))), seg=seg, n=p.get("cap_n", n), ax=shape_ax, ay=shape_ay)
        c2.location.z = -Hc2 - gap
        body_objs.append(c2)
        if collar_m:
            ch = p.get("collar_h", 0.32)
            col2 = lathe("collar2", fillet([(0, -0.001, 0), (Rc + 0.012, -0.001, 0.03), (Rc + 0.012, ch, 0.03), (0, ch, 0)]),
                         mat=collar_m, seg=seg, n=p.get("cap_n", n), ax=shape_ax, ay=shape_ay)
            col2.location.z = -gap - ch
            body_objs.append(col2)
    body = parent_all(body_objs, "Body")
    if p.get("dual"):
        body.location.z = p.get("cap2_h", Hc) + gap

    def make_cap():
        objs = []
        cprof = fillet([(0, 0, 0), (Rc, 0, 0.04), (Rc, Hc, p.get("cap_bevel", 0.18)), (0, Hc, 0)])
        if p.get("cap_dome"):
            cprof = fillet([(0, 0, 0), (Rc, 0, 0.04), (Rc, Hc - Rc * 0.6, 0.0)] +
                           [(Rc * math.cos(a), Hc - Rc * 0.6 + Rc * 0.6 * math.sin(a), 0) for a in
                            [i * (PI / 2) / 10 for i in range(1, 10)]] + [(0, Hc, 0)])
        objs.append(lathe("cap", cprof, mat=cap_m, seg=seg, n=p.get("cap_n", n), ax=shape_ax, ay=shape_ay))
        if collar_m:
            ch = p.get("collar_h", 0.32)
            objs.append(lathe("collar", fillet([(0, -0.001, 0), (Rc + 0.012, -0.001, 0.03), (Rc + 0.012, ch, 0.03),
                                                (0, ch, 0)]), mat=collar_m, seg=seg, n=p.get("cap_n", n),
                              ax=shape_ax, ay=shape_ay))
        cpr = print_spec(p, "cap_print")
        if cpr:
            objs.append(band_print("capprint", Rc, Hc * 0.2, Hc * 0.9, cpr, n=p.get("cap_n", n), ax=shape_ax,
                                   ay=shape_ay, vertical=False, v=0.5))
        return objs

    groups = []
    if view == "alt":
        cap = parent_all(make_cap(), "Cap")
        cap.location.z = H + gap + (p.get("cap2_h", Hc) + gap if p.get("dual") else 0)
        root = parent_all([body, cap], "Product")
        groups.append(root)
    else:
        # body standing, wand (cap + stem + applicator) lying in front
        groups.append(parent_all([body], "Product"))
        cap_objs = make_cap()
        stem_len = H * p.get("stem_frac", 0.78)
        app = applicator(p.get("applicator", "brush:hourglass"), stem_len, color=p.get("bristle", "#141210"),
                         fill=p.get("applicator_color"))
        # applicator built pointing down from z=0 => cap above
        cap = parent_all(cap_objs, "CapG")
        wand = parent_all(app + [cap], "Wand")
        if p.get("wand_pose", "float") == "lay":
            lay_down(wand, yaw=p.get("wand_yaw", 62), x=p.get("wand_x", 2.4), y=p.get("wand_y", -3.6))
        else:
            float_pose(wand, tilt=p.get("wand_tilt", -24), x=p.get("wand_x", max(R, Rc) + 2.3),
                       y=p.get("wand_y", -0.6), lift=p.get("wand_lift", 0.9), spin=p.get("wand_spin", 0))
        groups.append(wand)
    return groups


# ---------------------------------------------------------------------------
# Lipstick
# ---------------------------------------------------------------------------

def bullet(R, h, angle, lip_m, tip="slant"):
    prof = fillet([(0, 0, 0), (R, 0, 0), (R, h + 2.0, 0), (0, h + 2.0, 0)])
    b = lathe("bullet", prof, mat=lip_m, seg=96)
    if tip == "round":
        prof = fillet([(0, 0, 0), (R, 0, 0), (R, h - R * 0.6, 0)] +
                      [(R * math.cos(a), h - R * 0.6 + R * 0.75 * math.sin(a), 0) for a in
                       [i * (PI / 2) / 12 for i in range(1, 12)]] + [(0, h + R * 0.15, 0)])
        bpy.data.objects.remove(b)
        return lathe("bullet", prof, mat=lip_m, seg=96)
    cutter = box("cutter", 12, 12, 12, bevel=0)
    a = math.radians(angle)
    cutter.rotation_euler = (0, a, 0)
    # lower face of the cutter passes through (x=-R, z=h) going up towards +x
    nrm = Vector((math.sin(a), 0, math.cos(a)))
    pt = Vector((-R * 0.95, 0, h - 2 * R * math.tan(a) * 0.0))
    cutter.location = pt + nrm * 6.0
    bpy.context.view_layer.update()
    mod = b.modifiers.new("cut", "BOOLEAN")
    mod.operation = "DIFFERENCE"
    mod.object = cutter
    mod.solver = "EXACT"
    bv = b.modifiers.new("bev", "BEVEL")
    bv.limit_method = "ANGLE"
    bv.angle_limit = math.radians(25)
    bv.width = 0.09
    bv.segments = 5
    try:
        bv.harden_normals = True
    except Exception:
        pass
    cutter.hide_render = True
    cutter.hide_viewport = True
    cutter.parent = b
    cutter.matrix_parent_inverse = b.matrix_world.inverted()
    return b


def lipstick(p, view):
    R = p.get("r", 1.05)
    n = p.get("n", 2.0)
    Hb = p.get("base_h", 4.0)
    Hcap = p.get("cap_h", 4.6)
    body_m = mat(p.get("body", ("metal", "#C8A97E")))
    cap_m = mat(p.get("cap", p.get("body", ("metal", "#C8A97E"))))
    sleeve_m = mat(p.get("sleeve", ("metal", "#CDB48F")))
    lip_m = M("lipstick", p.get("shade", "#9E3B3F"), finish=p.get("finish", "satin"))
    seg = 128 if n == 2.0 else 160
    accent = p.get("accent")

    def base():
        objs = [lathe("base", fillet([(0, 0, 0), (R, 0, 0.12), (R, Hb, 0.06), (0, Hb, 0)]), mat=body_m, seg=seg, n=n)]
        if accent:
            objs.append(lathe("ring", fillet([(R + 0.01, Hb - 0.35, 0), (R + 0.01, Hb - 0.05, 0)]), mat=mat(accent),
                              seg=seg, n=n))
        pr = print_spec(p)
        if pr:
            objs.append(band_print("print", R, 0.5, Hb - 0.5, pr, n=n, vertical=pr.get("vertical", False)))
        return objs

    def cap(closed):
        objs = [lathe("cap", fillet([(0, 0, 0), (R + 0.005, 0, 0.03), (R + 0.005, Hcap, p.get("cap_bevel", 0.2)),
                                     (0, Hcap, 0)]), mat=cap_m, seg=seg, n=n)]
        cpr = print_spec(p, "cap_print")
        if cpr:
            objs.append(band_print("capprint", R + 0.005, 0.6, Hcap - 0.4, cpr, n=n, vertical=cpr.get("vertical", False)))
        tpr = print_spec(p, "top_print")
        if tpr:
            tex = text_texture(tpr["lines"], 2 * R, 2 * R, u_center=0.5, v_center=0.5, size_cm=tpr["size"],
                               font=tpr["font"], tracking=tpr["tracking"])
            objs.append(label_disc("topprint", R * 0.98, Hcap + 0.003, tex, ink=tpr["ink"], foil=tpr["foil"], n=n))
        return objs

    groups = []
    if view == "alt":
        b = parent_all(base(), "Base")
        c = parent_all(cap(True), "Cap")
        c.location.z = Hb - 0.15
        groups.append(parent_all([b, c], "Product"))
        return groups
    # open: sleeve + bullet raised, cap standing behind-left
    ext = p.get("extend", 1.4)
    sr = R * 0.86
    sleeve = lathe("sleeve", fillet([(0, Hb - 0.2, 0), (sr, Hb - 0.2, 0), (sr, Hb + ext, 0.04), (sr - 0.06, Hb + ext, 0),
                                     (0, Hb + ext, 0)]), mat=sleeve_m, seg=96)
    br = sr - 0.1
    blt = bullet(br, p.get("bullet_h", 2.2), p.get("angle", 48), lip_m, tip=p.get("tip", "slant"))
    blt.location.z = Hb + ext - 0.3
    blt.rotation_euler = (0, 0, math.radians(p.get("bullet_yaw", -120)))
    b = parent_all(base() + [sleeve, blt], "Open")
    groups.append(b)
    c = parent_all(cap(False), "CapStand")
    if p.get("cap_lying", True):
        lay_down(c, yaw=p.get("cap_yaw", 70), x=p.get("cap_x", 2.8), y=p.get("cap_y", -2.2))
    else:
        place(c, (-2.6, 2.0, 0))
    groups.append(c)
    return groups


# ---------------------------------------------------------------------------
# Pencils (wood, retractable, jumbo, dual)
# ---------------------------------------------------------------------------

def pencil(p, view):
    R = p.get("r", 0.42)
    L = p.get("length", 14.5)
    kind = p.get("kind", "wood")
    body_m = mat(p.get("body", ("gloss", "#5A2E2C")))
    lead_m = M("lead", p.get("shade", "#8A3B3A"))
    cap_m = mat(p.get("cap", p.get("body")))
    end_m = mat(p.get("end", p.get("body")))
    seg = p.get("seg", 96)
    sharp = 30 if seg <= 8 else False
    objs = []
    open_tip = view == "hero"

    if kind in ("wood", "jumbo"):
        cone = p.get("cone", 1.5 if kind == "wood" else 1.6)
        lead_r = p.get("lead_r", 0.14 if kind == "wood" else 0.28)
        objs.append(lathe("body", fillet([(0, 0, 0), (R, 0, 0.05), (R, L, 0.0), (0, L, 0)]), mat=body_m, seg=seg,
                          sharp=sharp, rot0=PI / seg if seg <= 8 else 0))
        objs.append(lathe("end", fillet([(0, -0.9, 0), (R + 0.006, -0.9, 0.12), (R + 0.006, 0.02, 0), (0, 0.02, 0)]),
                          mat=end_m, seg=seg, sharp=sharp, rot0=PI / seg if seg <= 8 else 0))
        objs.append(lathe("wood", fillet([(0, L - 0.01, 0), (R * 0.97, L - 0.01, 0), (lead_r, L + cone, 0), (0, L + cone, 0)]),
                          mat=M("wood", "#D9B48A"), seg=64))
        tip = 0.55 if kind == "wood" else 0.65
        objs.append(lathe("lead", fillet([(0, L + cone - 0.05, 0), (lead_r, L + cone - 0.05, 0),
                                          (0.03 if kind == "wood" else 0.08, L + cone + tip, 0.03),
                                          (0, L + cone + tip + 0.01, 0)]), mat=lead_m, seg=48))
        top = L + cone + tip
    else:
        # retractable / mechanical
        cone = 1.2
        lead_r = p.get("lead_r", 0.12)
        objs.append(lathe("body", fillet([(0, 0, 0), (R, 0, 0.1), (R, L, 0.02), (R * 0.86, L + 0.02, 0.0),
                                          (lead_r + 0.07, L + cone, 0.05), (0, L + cone, 0)]), mat=body_m, seg=seg))
        accent = p.get("accent")
        if accent:
            objs.append(lathe("ring", fillet([(R + 0.008, L * 0.42, 0), (R + 0.008, L * 0.42 + 0.3, 0)]), mat=mat(accent), seg=seg))
        objs.append(lathe("lead", fillet([(0, L + cone - 0.1, 0), (lead_r, L + cone - 0.1, 0), (lead_r, L + cone + 0.35, 0.02),
                                          (0.02, L + cone + 0.65, 0.02), (0, L + cone + 0.66, 0)]), mat=lead_m, seg=48))
        top = L + cone + 0.65
        if p.get("smudger"):
            sm = lathe("smudger", fillet([(0, -1.5, 0), (0.05, -1.48, 0.02), (R * 0.82, -0.25, 0.2), (R * 0.82, 0.05, 0),
                                          (0, 0.05, 0)], seg=8), mat=M("flock", p.get("smudger_color", "#2B2624")), seg=64)
            objs.append(sm)
        if p.get("spoolie"):
            # spoolie at the other end: built pointing down
            sp = applicator("brush:spoolie", 0.6, color="#2A2522")
            for o in sp:
                o.location.z += 0.0
            spg = parent_all(sp, "Spoolie")
            spg.location.z = 0.0
            objs.append(spg)
    pr = print_spec(p)
    if pr:
        objs.append(band_print("print", R if seg > 8 else R * 0.88, L * 0.15, L * 0.85, pr, vertical=True))
    if kind == "dual":
        pass
    pen = parent_all(objs, "Pencil")
    groups = []
    if view == "hero":
        lay_down(pen, yaw=p.get("yaw", 28), x=0, y=0)
        groups.append(pen)
        if p.get("second_shade"):
            # a second pencil in an alternate shade for the composition
            p2 = dict(p)
            p2["shade"] = p["second_shade"]
            p2["second_shade"] = None
            p2.pop("print", None)
            g2 = pencil(p2, "alt")[0]
            lay_down(g2, yaw=p.get("yaw", 28) - 14, x=-1.1, y=1.6)
            groups.append(g2)
    else:
        # capped pencil standing at a slight angle — keep it lying for stability, different angle
        capg = None
        if p.get("cap"):
            cl = p.get("cap_len", 3.4)
            capo = lathe("cap", fillet([(0, 0, 0), (R + 0.03, 0, 0.03), (R + 0.03, cl, 0.12), (0, cl, 0)]), mat=cap_m,
                         seg=seg if seg > 8 else 64)
            capg = parent_all([capo], "Cap")
            capg.location.z = top - cl + 0.6
            pen = parent_all([pen, capg], "Capped")
        lay_down(pen, yaw=p.get("alt_yaw", -24), x=0, y=0)
        groups.append(pen)
    return groups


# ---------------------------------------------------------------------------
# Compact (round / square) — pressed powder, blush, bronzer, highlighter
# ---------------------------------------------------------------------------

def compact(p, view):
    R = p.get("r", 3.6)
    n = p.get("n", 2.0)
    ax, ay = p.get("ax", 1.0), p.get("ay", 1.0)
    hb = p.get("base_h", 0.95)
    hl = p.get("lid_h", 0.62)
    case_m = mat(p.get("body", ("gloss", "#EDE6DC")))
    lid_m = mat(p.get("lid", p.get("body", ("gloss", "#EDE6DC"))))
    inner_m = mat(p.get("inner", p.get("body", ("satin", "#E2DAD0"))))
    powder_m = M("powder", p.get("shade", "#D8A08E"), shimmer=p.get("shimmer", 0.0), pattern=p.get("pattern"))
    seg = 160
    objs = []
    base = lathe("base", fillet([(0, 0, 0), (R, 0, 0.25), (R, hb, 0.08), (R - 0.35, hb, 0.04), (R - 0.35, hb - 0.32, 0.05),
                                 (0, hb - 0.32, 0)]), mat=case_m, seg=seg, n=n, ax=ax, ay=ay)
    objs.append(base)
    pan_r = R - 0.55
    pans = p.get("pans")
    if pans:
        # multi-well (e.g. duo) — split pan horizontally
        for i, shade in enumerate(pans):
            pm = M("powder", shade, shimmer=p.get("shimmer", 0.0))
            w = (2 * pan_r * ax) / len(pans)
            b = box(f"pan{i}", w - 0.12, 2 * pan_r * ay * 0.82, 0.3, loc=(-pan_r * ax + w * (i + 0.5), 0, hb - 0.2),
                    bevel=0.1, mat=pm)
            objs.append(b)
    else:
        dome = p.get("dome", 0.06)
        pan = lathe("pan", fillet([(0, hb - 0.33, 0), (pan_r, hb - 0.33, 0), (pan_r, hb - 0.06, 0.04),
                                   (pan_r * 0.6, hb - 0.06 + dome * 0.7, 0), (0, hb - 0.06 + dome, 0)]),
                    mat=powder_m, seg=seg, n=n, ax=ax, ay=ay)
        objs.append(pan)
    # hinge block at the back (+y)
    hinge_y = R * ay
    objs.append(box("hinge", 1.2, 0.35, 0.3, loc=(0, hinge_y + 0.02, hb), bevel=0.08, mat=mat(p.get("accent", ("metal", "#C9B08A")))))
    baseg = parent_all(objs, "Base")

    lid_objs = []
    lid = lathe("lid", fillet([(0, 0, 0), (R, 0, 0.06), (R, hl, 0.22), (0, hl, 0)]), mat=lid_m, seg=seg, n=n, ax=ax, ay=ay)
    lid_objs.append(lid)
    if p.get("lid_inlay"):
        lid_objs.append(lathe("inlay", fillet([(0, hl - 0.02, 0), (R * 0.74, hl - 0.02, 0), (R * 0.74, hl + 0.015, 0.01),
                                               (0, hl + 0.015, 0)]), mat=mat(p["lid_inlay"]), seg=seg, n=n, ax=ax, ay=ay))
    mirror = lathe("mirror", fillet([(0, -0.012, 0), (R - 0.45, -0.012, 0), (R - 0.45, 0.0, 0), (0, 0.0, 0)]),
                   mat=M("mirror"), seg=seg, n=n, ax=ax, ay=ay)
    lid_objs.append(mirror)
    tpr = print_spec(p, "top_print")
    if tpr:
        tex = text_texture(tpr["lines"], 2 * R * ax, 2 * R * ay, u_center=0.5, v_center=0.5, size_cm=tpr["size"],
                           font=tpr["font"], tracking=tpr["tracking"], sizes=tpr.get("sizes"))
        lid_objs.append(label_disc("topprint", R * 0.97, hl + 0.02 + (0.001 if p.get("lid_inlay") else 0), tex,
                                   ink=tpr["ink"], foil=tpr["foil"], n=n, ax=ax, ay=ay))
    lidg = parent_all(lid_objs, "Lid")
    # pivot the lid around the hinge axis (x-axis at y = hinge_y, z = hb)
    pivot = bpy.data.objects.new("Pivot", None)
    bpy.context.scene.collection.objects.link(pivot)
    pivot.location = (0, hinge_y, hb + 0.02)
    lidg.parent = pivot
    lidg.location = (0, -hinge_y, 0)
    if view == "hero":
        pivot.rotation_euler = (math.radians(-p.get("open_angle", 102)), 0, 0)
    root = parent_all([baseg, pivot], "Compact")
    root.rotation_euler = (0, 0, math.radians(p.get("yaw", 0)))
    return [root]


# ---------------------------------------------------------------------------
# Palette (rectangular, multi-pan)
# ---------------------------------------------------------------------------

def palette(p, view):
    cols = p.get("cols", 3)
    rows = p.get("rows", 3)
    pan = p.get("pan", 1.55)
    gapw = p.get("gap", 0.28)
    margin = 0.55
    W = cols * pan + (cols - 1) * gapw + 2 * margin
    D = rows * pan + (rows - 1) * gapw + 2 * margin
    hb = p.get("base_h", 0.9)
    hl = p.get("lid_h", 0.5)
    case_m = mat(p.get("body", ("matte", "#E9E2D8")))
    lid_m = mat(p.get("lid", p.get("body", ("matte", "#E9E2D8"))))
    shades = p["shades"]
    shim = p.get("shimmer_idx", [])
    objs = [box("base", W, D, hb, loc=(0, 0, hb / 2), bevel=0.32, mat=case_m)]
    objs.append(box("well", W - 0.5, D - 0.5, 0.05, loc=(0, 0, hb + 0.001), bevel=0.2, mat=mat(p.get("inner", ("satin", "#D9D0C4")))))
    k = 0
    for r in range(rows):
        for c in range(cols):
            x = -W / 2 + margin + pan / 2 + c * (pan + gapw)
            y = D / 2 - margin - pan / 2 - r * (pan + gapw)
            shade = shades[k % len(shades)]
            pm = M("powder", shade, shimmer=0.9 if k in shim else 0.0)
            if p.get("round_pans"):
                o = lathe(f"pan{k}", fillet([(0, 0, 0), (pan / 2, 0, 0), (pan / 2, 0.22, 0.04), (0, 0.24, 0)]), mat=pm, seg=64)
                o.location = (x, y, hb - 0.02)
            else:
                o = box(f"pan{k}", pan, pan, 0.22, loc=(x, y, hb + 0.09), bevel=0.12, mat=pm)
            objs.append(o)
            k += 1
    base = parent_all(objs, "Base")
    lid_objs = [box("lid", W, D, hl, loc=(0, 0, hl / 2), bevel=0.3, mat=lid_m),
                box("mirror", W - 0.9, D - 0.9, 0.02, loc=(0, 0, -0.002), bevel=0.05, mat=M("mirror"))]
    tpr = print_spec(p, "top_print")
    if tpr:
        tex = text_texture(tpr["lines"], W, D, u_center=0.5, v_center=0.5, size_cm=tpr["size"], font=tpr["font"],
                           tracking=tpr["tracking"], sizes=tpr.get("sizes"))
        d = plane_decal("topprint", W * 0.98, D * 0.98, tex, ink=tpr["ink"], foil=tpr["foil"])
        d.location = (0, 0, hl + 0.004)
        lid_objs.append(d)
    lid = parent_all(lid_objs, "Lid")
    pivot = bpy.data.objects.new("Pivot", None)
    bpy.context.scene.collection.objects.link(pivot)
    pivot.location = (0, D / 2, hb)
    lid.parent = pivot
    lid.location = (0, -D / 2, 0.01)
    if view == "hero":
        pivot.rotation_euler = (math.radians(-p.get("open_angle", 100)), 0, 0)
    root = parent_all([base, pivot], "Palette")
    root.rotation_euler = (0, 0, math.radians(p.get("yaw", 0)))
    return [root]


# ---------------------------------------------------------------------------
# Jar / pot (cream blush, gel liner, balm, loose powder)
# ---------------------------------------------------------------------------

def jar(p, view):
    R = p.get("r", 2.2)
    H = p.get("h", 2.0)
    Hl = p.get("lid_h", 1.1)
    thick = p.get("thick", False)
    body_m = mat(p.get("body", ("gloss", "#F1ECE5")))
    lid_m = mat(p.get("lid", ("metal", "#C9AC84")))
    fill_m = mat(p.get("fill", ("cream", "#D58A86")))
    seg = 160
    objs = []
    if thick:
        objs.append(lathe("jar", tube_shell(R, R * 0.68, 0, H, bevel=0.2, floor=H * 0.45), mat=body_m, seg=seg))
        inner_r = R * 0.68 - 0.01
        fill_top = H - 0.18
        objs.append(lathe("fill", fillet([(0, H * 0.45 + 0.01, 0), (inner_r, H * 0.45 + 0.01, 0.05), (inner_r, fill_top, 0.08),
                                          (0, fill_top + 0.02, 0)]), mat=fill_m, seg=seg))
    else:
        inner_r = R - 0.22
        objs.append(lathe("jar", fillet([(0, 0, 0), (R, 0, 0.2), (R, H, 0.08), (inner_r, H, 0.04), (inner_r, H * 0.35, 0.1),
                                         (0, H * 0.35, 0)]), mat=body_m, seg=seg))
        fill_top = H - 0.16
        objs.append(lathe("fill", fillet([(0, H * 0.35 + 0.01, 0), (inner_r - 0.005, H * 0.35 + 0.01, 0.05),
                                          (inner_r - 0.005, fill_top, 0.12), (0, fill_top + 0.03, 0)]), mat=fill_m, seg=seg))
    if p.get("sifter"):
        objs.append(lathe("sifter", fillet([(0, fill_top + 0.05, 0), (inner_r, fill_top + 0.05, 0), (inner_r, fill_top + 0.1, 0),
                                            (0, fill_top + 0.1, 0)]), mat=mat(p["sifter"]), seg=seg))
    if p.get("swirl"):
        # sculpted swirl on the surface (cream/balm)
        sw = lathe("swirl", fillet([(0, fill_top - 0.02, 0), (inner_r * 0.55, fill_top - 0.02, 0),
                                    (inner_r * 0.3, fill_top + 0.16, 0.08), (0, fill_top + 0.22, 0)]), mat=fill_m, seg=64)
        sw.location.x = inner_r * 0.12
        objs.append(sw)
    pr = print_spec(p)
    if pr and not thick:
        objs.append(band_print("print", R, 0.3, H - 0.3, pr, vertical=False))
    base = parent_all(objs, "Jar")
    lid_objs = [lathe("lid", fillet([(0, 0, 0), (R + 0.03, 0, 0.05), (R + 0.03, Hl, 0.2), (0, Hl, 0)]), mat=lid_m, seg=seg)]
    tpr = print_spec(p, "top_print")
    if tpr:
        tex = text_texture(tpr["lines"], 2 * R, 2 * R, u_center=0.5, v_center=0.5, size_cm=tpr["size"], font=tpr["font"],
                           tracking=tpr["tracking"], sizes=tpr.get("sizes"))
        lid_objs.append(label_disc("topprint", R * 0.94, Hl + 0.004, tex, ink=tpr["ink"], foil=tpr["foil"]))
    lid = parent_all(lid_objs, "Lid")
    groups = []
    if view == "hero":
        groups.append(parent_all([base], "Product"))
        # lid resting on its side, leaning behind-right
        lid.rotation_euler = (math.radians(78), 0, math.radians(p.get("lid_yaw", 35)))
        lid.location = (R * 1.75, R * 0.9, 0)
        rest_on_floor(lid)
        groups.append(lid)
    else:
        lid.location.z = H - 0.25
        groups.append(parent_all([base, lid], "Product"))
    return groups


# ---------------------------------------------------------------------------
# Bottles: pump, dropper, mist
# ---------------------------------------------------------------------------

def bottle(p, view):
    kind = p.get("kind", "pump")
    R = p.get("r", 1.9)
    H = p.get("h", 8.5)
    n = p.get("n", 2.0)
    ax, ay = p.get("ax", 1.0), p.get("ay", 1.0)
    glass_m = mat(p.get("body", ("glass", "#F7F7F5")))
    fill_m = mat(p.get("fill", ("cream", "#D9B39A")))
    collar_m = mat(p.get("collar", ("metal", "#C9AC84")))
    cap_m = mat(p.get("cap", ("gloss", "#EEE9E2")))
    wall = p.get("wall", 0.28)
    floor = p.get("floor", 0.8)
    seg = 128 if n == 2.0 else 192
    neck_r = p.get("neck_r", 0.62)
    shoulder = p.get("shoulder", 0.9)
    objs = []
    outer = [(0, 0, 0), (R, 0, 0.35), (R, H - shoulder, shoulder * 0.9), (neck_r, H, 0.12), (neck_r, H + 0.7, 0.05)]
    inner = [(neck_r - 0.16, H + 0.7, 0.05), (neck_r - 0.16, H - 0.1, 0.1), (R - wall, H - shoulder - 0.05, shoulder * 0.7),
             (R - wall, floor, 0.3), (0, floor, 0)]
    objs.append(lathe("bottle", fillet(outer + inner, seg=8), mat=glass_m, seg=seg, n=n, ax=ax, ay=ay))
    lvl = p.get("fill_level", 0.78)
    fr = R - wall - 0.015
    if p.get("fill") is not None and lvl > 0:
        ftop = floor + (H - shoulder - floor) * lvl
        objs.append(lathe("fill", fillet([(0, floor + 0.01, 0), (fr, floor + 0.01, 0.28), (fr, ftop, 0.04), (0, ftop, 0)]),
                          mat=fill_m, seg=seg, n=n, ax=ax, ay=ay))
        if p.get("fill2"):
            l2 = p.get("fill2_level", 0.95)
            f2top = floor + (H - shoulder - floor) * l2
            objs.append(lathe("fill2", fillet([(0, ftop + 0.004, 0), (fr, ftop + 0.004, 0.0), (fr, f2top, 0.04), (0, f2top, 0)]),
                              mat=mat(p["fill2"]), seg=seg, n=n, ax=ax, ay=ay))
    pr = print_spec(p)
    if pr:
        objs.append(band_print("print", R, H * 0.22, H * 0.78, pr, n=n, ax=ax, ay=ay, vertical=pr.get("vertical", False)))
    top = H + 0.7
    if kind == "pump":
        objs.append(lathe("collar", fillet([(0, H + 0.1, 0), (neck_r + 0.12, H + 0.1, 0.06), (neck_r + 0.12, top + 0.35, 0.08),
                                            (0, top + 0.35, 0)]), mat=collar_m, seg=96))
        objs.append(lathe("stem", cyl_profile(0.16, top + 0.3, top + 0.95, bevel=0.02), mat=M("satin", "#EDEAE5"), seg=32))
        act = box("actuator", 1.25, 0.72, 0.62, loc=(0, -0.18, top + 1.2), bevel=0.2, mat=collar_m)
        objs.append(act)
        noz = lathe("nozzle", cyl_profile(0.1, 0, 0.7, bevel=0.02), mat=collar_m, seg=24)
        noz.rotation_euler = (math.radians(90), 0, 0)
        noz.location = (0, -0.45, top + 1.2)
        objs.append(noz)
        cap_bottom = H + 0.05
        cap_h = (top + 1.65) - cap_bottom
        cap_r = neck_r + 0.55
    elif kind == "dropper":
        objs.append(lathe("collar", fillet([(0, H + 0.1, 0), (neck_r + 0.14, H + 0.1, 0.06), (neck_r + 0.14, top + 0.5, 0.08),
                                            (0, top + 0.5, 0)]), mat=collar_m, seg=96))
        bulb_m = mat(p.get("bulb", ("rubber", "#2B2522")))
        objs.append(lathe("bulb", fillet([(0, top + 0.45, 0), (neck_r * 0.82, top + 0.45, 0.05), (neck_r * 0.8, top + 1.4, 0.3),
                                          (neck_r * 0.62, top + 2.3, 0.5), (0, top + 2.5, 0)], seg=10), mat=bulb_m, seg=64))
        if view == "alt" or p.get("pipette_inside", True):
            objs.append(lathe("pipette", tube_shell(0.24, 0.17, floor + 0.25, H + 0.3, bevel=0.03, floor=floor + 0.5),
                              mat=M("glass", "#FAFAFA"), seg=32))
        cap_h = 0
        cap_r = 0
    elif kind == "screw":
        cap_bottom = H + 0.08
        cap_h = p.get("cap_h", 2.0)
        cap_r = neck_r + 0.28
    else:  # mist
        objs.append(lathe("collar", fillet([(0, H + 0.1, 0), (neck_r + 0.1, H + 0.1, 0.06), (neck_r + 0.1, top + 0.3, 0.06),
                                            (0, top + 0.3, 0)]), mat=collar_m, seg=96))
        objs.append(lathe("actuator", fillet([(0, top + 0.25, 0), (neck_r * 0.75, top + 0.25, 0.04), (neck_r * 0.75, top + 1.2, 0.2),
                                              (0, top + 1.2, 0)]), mat=mat(p.get("actuator", ("satin", "#F1EEE9"))), seg=64))
        hole = lathe("hole", cyl_profile(0.07, 0, 0.05, bevel=0.0), mat=M("matte", "#2A2826"), seg=16)
        hole.rotation_euler = (math.radians(90), 0, 0)
        hole.location = (0, -neck_r * 0.75 - 0.005, top + 0.85)
        objs.append(hole)
        cap_bottom = H - shoulder * 0.35
        cap_h = top + 1.5 - cap_bottom
        cap_r = R + 0.02
    body = parent_all(objs, "Bottle")
    groups = []
    want_cap = cap_h > 0 and p.get("overcap", True)
    if want_cap:
        if kind == "mist":
            cprof = fillet([(0, 0, 0), (cap_r, 0, 0.05), (cap_r, cap_h, 0.35), (0, cap_h, 0)])
            capo = lathe("cap", cprof, mat=cap_m, seg=seg, n=n, ax=ax, ay=ay)
        else:
            cprof = fillet([(0, 0, 0), (cap_r, 0, 0.05), (cap_r, cap_h, 0.3), (0, cap_h, 0)])
            capo = lathe("cap", cprof, mat=cap_m, seg=96, n=p.get("cap_n", 2.0))
        capg = parent_all([capo], "Cap")
        if view == "alt" or kind == "screw":
            capg.location.z = cap_bottom
            groups.append(parent_all([body, capg], "Product"))
        else:
            groups.append(parent_all([body], "Product"))
            place(capg, (R * 1.9 + cap_r, R * 0.6, 0))
            groups.append(capg)
    else:
        groups.append(parent_all([body], "Product"))
        if view == "hero" and kind == "dropper" and p.get("pipette_out"):
            pass
    return groups


# ---------------------------------------------------------------------------
# Squeeze tube (primer, gloss tube)
# ---------------------------------------------------------------------------

def squeeze(p, view):
    import bmesh
    R = p.get("r", 1.25)
    L = p.get("length", 11.0)
    cap_h = p.get("cap_h", 1.9)
    cap_r = p.get("cap_r", R * 0.95)
    tube_m = mat(p.get("body", ("satin", "#EDE6DE")))
    cap_m = mat(p.get("cap", ("gloss", "#D5BFA8")))
    bm = bmesh.new()
    uvl = bm.loops.layers.uv.new()
    seg = 96
    sections = 40
    rings = []
    zs = []
    for k in range(sections + 1):
        t = k / sections
        z = cap_h + 0.35 + t * L
        e = t ** 1.15
        rx = R * (1 + 0.42 * e)
        ry = max(0.03, R * (1 - 0.985 * e))
        ring = []
        for j in range(seg):
            a = 2 * PI * j / seg
            ring.append(bm.verts.new((rx * math.cos(a), ry * math.sin(a), z)))
        rings.append(ring)
        zs.append(z)
    for k in range(sections):
        for j in range(seg):
            j2 = (j + 1) % seg
            f = bm.faces.new((rings[k][j], rings[k][j2], rings[k + 1][j2], rings[k + 1][j]))
            f.smooth = True
            for loop, co in zip(f.loops, ((j / seg, k / sections), ((j + 1) / seg, k / sections),
                                          ((j + 1) / seg, (k + 1) / sections), (j / seg, (k + 1) / sections))):
                loop[uvl].uv = co
    me = bpy.data.meshes.new("tube")
    bm.to_mesh(me)
    bm.free()
    tube = bpy.data.objects.new("tube", me)
    bpy.context.scene.collection.objects.link(tube)
    tube.data.materials.append(tube_m)
    objs = [tube]
    # shoulder
    objs.append(lathe("shoulder", fillet([(0, cap_h - 0.05, 0), (R * 0.55, cap_h - 0.05, 0), (R * 0.55, cap_h + 0.1, 0),
                                          (R, cap_h + 0.38, 0.1), (R * 0.5, cap_h + 0.42, 0), (0, cap_h + 0.42, 0)]),
                      mat=tube_m, seg=seg))
    # crimp seal
    objs.append(box("crimp", 2 * R * 1.42 + 0.05, 0.1, 0.9, loc=(0, 0, cap_h + 0.35 + L + 0.35), bevel=0.04, mat=tube_m))
    pr = print_spec(p)
    if pr:
        tex = text_texture(pr["lines"], 2.4 * R, L * 0.6, u_center=0.5, v_center=0.55, size_cm=pr["size"], font=pr["font"],
                           tracking=pr["tracking"], sizes=pr.get("sizes"))
        from PIL import Image
        im = Image.open(tex).transpose(Image.Transpose.ROTATE_180)
        rp = tex.replace(".png", "_r.png")
        im.save(rp)
        d = plane_decal("print", 2.4 * R, L * 0.6, rp, ink=pr["ink"], foil=pr["foil"])
        d.rotation_euler = (math.radians(90), 0, 0)
        t_mid = 0.42
        d.location = (0, -R * (1 - 0.985 * t_mid ** 1.15) - 0.03, cap_h + 0.35 + L * t_mid)
        d.scale = (0.75, 1, 1)
        objs.append(d)
    # cap at the bottom (tube stands on its cap)
    objs.append(lathe("cap", fillet([(0, 0, 0), (cap_r, 0, 0.2), (cap_r, cap_h, 0.05), (0, cap_h, 0)]), mat=cap_m, seg=96))
    g = parent_all(objs, "Squeeze")
    if view == "alt":
        lay_down(g, yaw=-30, spin=180)
    return [g]


# ---------------------------------------------------------------------------
# Chubby twist-up stick (blush stick, balm stick, jumbo crayon)
# ---------------------------------------------------------------------------

def stick(p, view):
    R = p.get("r", 0.95)
    H = p.get("h", 7.2)
    n = p.get("n", 2.0)
    body_m = mat(p.get("body", ("satin", "#E8DCD2")))
    cap_m = mat(p.get("cap", p.get("body")))
    prod_m = mat(p.get("fill", ("cream", "#C97A70")))
    seg = 128 if n == 2.0 else 160
    base = [lathe("body", fillet([(0, 0, 0), (R, 0, 0.18), (R, H, 0.06), (R - 0.12, H, 0), (0, H, 0)]), mat=body_m, seg=seg, n=n)]
    pr = print_spec(p)
    if pr:
        base.append(band_print("print", R, 0.6, H - 0.6, pr, n=n, vertical=True))
    ext = 1.6 if view == "hero" else 0.6
    pr_r = R - 0.16
    prof = fillet([(0, H - 0.5, 0), (pr_r, H - 0.5, 0), (pr_r, H + ext - 0.4, 0.0)] +
                  [(pr_r * math.cos(a), H + ext - 0.4 + 0.75 * math.sin(a), 0) for a in
                   [i * (PI / 2) / 10 for i in range(1, 10)]] + [(0, H + ext + 0.35, 0)])
    product = lathe("product", prof, mat=prod_m, seg=96, n=n if n != 2.0 else 2.0, ax=0.98, ay=0.98)
    base.append(product)
    bg = parent_all(base, "Stick")
    groups = [bg]
    cap_h = p.get("cap_h", 3.4)
    capg = parent_all([lathe("cap", fillet([(0, 0, 0), (R + 0.01, 0, 0.04), (R + 0.01, cap_h, 0.3), (0, cap_h, 0)]),
                             mat=cap_m, seg=seg, n=n)], "Cap")
    if view == "hero":
        lay_down(capg, yaw=58, x=2.6, y=-2.0)
        groups.append(capg)
    else:
        capg.location.z = H - 0.1
        groups = [parent_all([bg, capg], "Product")]
    return groups


# ---------------------------------------------------------------------------
# Felt-tip liner pen
# ---------------------------------------------------------------------------

def pen(p, view):
    R = p.get("r", 0.52)
    L = p.get("length", 11.0)
    body_m = mat(p.get("body", ("gloss", "#141210")))
    cap_m = mat(p.get("cap", p.get("body")))
    accent = p.get("accent")
    objs = [lathe("body", fillet([(0, 0, 0), (R, 0, 0.18), (R, L, 0.03), (R * 0.72, L + 0.6, 0.15), (0.2, L + 0.75, 0.04),
                                  (0, L + 0.75, 0)]), mat=body_m, seg=128)]
    if accent:
        objs.append(lathe("ring", fillet([(R + 0.008, L - 0.4, 0), (R + 0.008, L - 0.1, 0)]), mat=mat(accent), seg=128))
    tip = applicator(p.get("tip", "felt"), 0.0, color=p.get("ink", "#121110"))
    for o in tip:
        if o.name.startswith("stem"):
            bpy.data.objects.remove(o)
            continue
        o.rotation_euler = (math.radians(180), 0, 0)
        o.location.z = L + 0.72
        objs.append(o)
    pr = print_spec(p)
    if pr:
        objs.append(band_print("print", R, L * 0.12, L * 0.82, pr, vertical=True))
    g = parent_all(objs, "Pen")
    cap_len = p.get("cap_len", 4.2)
    capg = parent_all([lathe("cap", fillet([(0, 0, 0), (R + 0.04, 0, 0.04), (R + 0.04, cap_len, 0.25), (0, cap_len, 0)]),
                             mat=cap_m, seg=128)], "Cap")
    if view == "hero":
        lay_down(g, yaw=24)
        lay_down(capg, yaw=40, x=1.8, y=-2.6)
        return [g, capg]
    capg.location.z = L - 1.6
    whole = parent_all([g, capg], "Product")
    lay_down(whole, yaw=-22)
    return [whole]


BUILDERS = {
    "wand": wand_tube,
    "lipstick": lipstick,
    "pencil": pencil,
    "compact": compact,
    "palette": palette,
    "jar": jar,
    "bottle": bottle,
    "squeeze": squeeze,
    "stick": stick,
    "pen": pen,
}
