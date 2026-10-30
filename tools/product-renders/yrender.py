"""
Yalilai product render kit — core studio, materials and procedural geometry.

All geometry is procedural (no third-party models), modelled in centimetres
(1 Blender unit = 1 cm). Every render is an original, illustrative packaging
concept with no third-party branding.
"""
import bpy
import bmesh
import math
import os
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(HERE, "fonts")
TEX_DIR = os.path.join(HERE, ".tex-cache")
os.makedirs(TEX_DIR, exist_ok=True)

PI = math.pi


# ---------------------------------------------------------------------------
# Colour helpers
# ---------------------------------------------------------------------------

def _s2l(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def lin(hexstr, a=1.0):
    h = hexstr.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4))
    return (_s2l(r), _s2l(g), _s2l(b), a)


# ---------------------------------------------------------------------------
# Scene / studio
# ---------------------------------------------------------------------------

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.images, bpy.data.lights,
                 bpy.data.cameras, bpy.data.objects):
        for item in list(coll):
            try:
                coll.remove(item)
            except Exception:
                pass


def setup_render(width=1200, height=1500, samples=160, threshold=0.012, transparent=False,
                 exposure=0.0, look="AgX - Medium High Contrast"):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = samples
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.adaptive_threshold = threshold
    sc.cycles.use_denoising = True
    try:
        sc.cycles.denoiser = "OPENIMAGEDENOISE"
    except Exception:
        pass
    sc.cycles.max_bounces = 12
    sc.cycles.glossy_bounces = 6
    sc.cycles.transmission_bounces = 10
    sc.cycles.transparent_max_bounces = 12
    sc.cycles.diffuse_bounces = 3
    sc.cycles.caustics_reflective = False
    sc.cycles.caustics_refractive = False
    sc.cycles.blur_glossy = 0.6
    sc.render.resolution_x = width
    sc.render.resolution_y = height
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = transparent
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA" if transparent else "RGB"
    sc.render.image_settings.color_depth = "8"
    vt = os.environ.get("YR_VIEW", "Khronos PBR Neutral")
    sc.view_settings.view_transform = vt
    try:
        sc.view_settings.look = os.environ.get("YR_LOOK", look) if vt == "AgX" else "None"
    except Exception:
        pass
    sc.view_settings.exposure = exposure
    try:
        sc.render.threads_mode = "AUTO"
    except Exception:
        pass


def _point_at(obj, target):
    d = Vector(target) - obj.location
    obj.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


def area_light(name, loc, target, size=(40, 60), energy=1e5, color=(1, 1, 1)):
    data = bpy.data.lights.new(name, type="AREA")
    data.shape = "RECTANGLE"
    data.size, data.size_y = size
    data.energy = energy
    data.color = color
    try:
        data.cycles.is_portal = False
    except Exception:
        pass
    obj = bpy.data.objects.new(name, data)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = loc
    _point_at(obj, target)
    return obj


def backdrop(color="#EFEAE3", floor_coat=0.45, radius=90.0, depth=260.0, width=900.0, height=420.0):
    """Seamless cyclorama sweep: floor -> curve -> wall."""
    bm = bmesh.new()
    prof = []
    # floor from front (-y) to the start of the curve
    prof.append((-depth, 0.0))
    steps = 24
    y0 = 60.0
    prof.append((y0, 0.0))
    for i in range(1, steps + 1):
        a = (PI / 2) * i / steps
        prof.append((y0 + radius * math.sin(a), radius - radius * math.cos(a)))
    prof.append((y0 + radius, height))
    cols = []
    for (y, z) in prof:
        cols.append((bm.verts.new((-width / 2, y, z)), bm.verts.new((width / 2, y, z))))
    for i in range(len(cols) - 1):
        a, b = cols[i], cols[i + 1]
        f = bm.faces.new((a[0], a[1], b[1], b[0]))
        f.smooth = True
    me = bpy.data.meshes.new("Backdrop")
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new("Backdrop", me)
    bpy.context.scene.collection.objects.link(obj)
    m = new_mat("backdrop")
    p = _bsdf(m)
    p.inputs["Base Color"].default_value = lin(color)
    p.inputs["Roughness"].default_value = 0.55
    p.inputs["Coat Weight"].default_value = floor_coat
    p.inputs["Coat Roughness"].default_value = 0.09
    p.inputs["Specular IOR Level"].default_value = 0.3
    obj.data.materials.append(m)
    return obj


def world(color="#F4F1EC", strength=0.35):
    w = bpy.data.worlds.new("World")
    bpy.context.scene.world = w
    try:
        w.use_nodes = True
    except Exception:
        pass
    bg = w.node_tree.nodes.get("Background")
    if bg is None:
        bg = w.node_tree.nodes.new("ShaderNodeBackground")
        out = w.node_tree.nodes.new("ShaderNodeOutputWorld")
        w.node_tree.links.new(bg.outputs[0], out.inputs[0])
    bg.inputs[0].default_value = lin(color)
    bg.inputs[1].default_value = strength
    return w


def studio(preset="soft", backdrop_color="#EFEAE3", floor_coat=0.45, key=1.0, warm=True):
    """Softbox studio. Lights are tuned for products roughly 4–20 cm tall."""
    world(strength=0.25)
    if backdrop_color:
        backdrop(backdrop_color, floor_coat=floor_coat)
    tgt = (0, 0, 6)
    wk = (1.0, 0.994, 0.986) if warm else (1, 1, 1)
    cool = (0.97, 0.985, 1.0)
    area_light("Key", (-75, -70, 85), tgt, size=(55, 85), energy=2.6e5 * key, color=wk)
    area_light("Fill", (95, -55, 35), tgt, size=(90, 90), energy=1.2e5 * key, color=cool)
    area_light("RimL", (-48, 55, 40), tgt, size=(10, 110), energy=7.0e4 * key, color=wk)
    area_light("RimR", (52, 50, 40), tgt, size=(10, 110), energy=6.0e4 * key, color=wk)
    area_light("Top", (0, -10, 140), tgt, size=(90, 70), energy=1.6e5 * key, color=wk)
    # low bounce card for the bottom of products
    area_light("Bounce", (0, -90, 6), (0, 0, 4), size=(120, 12), energy=2.0e4 * key, color=wk)
    # wash for the cyclorama wall so the backdrop reads as an even, warm ivory
    w = area_light("Wash", (0, -40, 120), (0, 160, 60), size=(260, 60), energy=3.2e5 * key, color=wk)
    w.visible_glossy = False
    w.visible_diffuse = True


def camera(lens=100.0):
    cam = bpy.data.cameras.new("Cam")
    cam.lens = lens
    cam.sensor_width = 36
    cam.clip_start = 1
    cam.clip_end = 5000
    obj = bpy.data.objects.new("Cam", cam)
    bpy.context.scene.collection.objects.link(obj)
    bpy.context.scene.camera = obj
    return obj


def product_bounds(objs):
    mn = Vector((1e9, 1e9, 1e9))
    mx = Vector((-1e9, -1e9, -1e9))
    dg = bpy.context.evaluated_depsgraph_get()
    for o in objs:
        if o.type != "MESH" or o.hide_render:
            continue
        oe = o.evaluated_get(dg)
        me = oe.to_mesh()
        for v in me.vertices:
            w = o.matrix_world @ v.co
            mn = Vector(map(min, mn, w))
            mx = Vector(map(max, mx, w))
        oe.to_mesh_clear()
    return mn, mx


def frame(cam, objs, azimuth=-28.0, elevation=12.0, fill_h=0.66, fill_w=0.74, center_bias=0.02):
    """Aim the camera at the objects and find the distance that frames them."""
    from bpy_extras.object_utils import world_to_camera_view
    sc = bpy.context.scene
    mn, mx = product_bounds(objs)
    center = (mn + mx) / 2
    corners = [Vector((x, y, z)) for x in (mn.x, mx.x) for y in (mn.y, mx.y) for z in (mn.z, mx.z)]
    az, el = math.radians(azimuth), math.radians(elevation)
    direction = Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el)))
    dist = (mx - mn).length * 4
    target = center.copy()
    for _ in range(8):
        cam.location = target + direction * dist
        _point_at(cam, target)
        bpy.context.view_layer.update()
        pts = [world_to_camera_view(sc, cam, c) for c in corners]
        xs = [p.x for p in pts]
        ys = [p.y for p in pts]
        w = max(xs) - min(xs)
        h = max(ys) - min(ys)
        scale = max(w / fill_w, h / fill_h)
        # recentre (screen offsets -> world shift along camera axes)
        cx = (max(xs) + min(xs)) / 2 - 0.5
        cy = (max(ys) + min(ys)) / 2 - 0.5 - center_bias
        right = cam.matrix_world.to_3x3() @ Vector((1, 0, 0))
        up = cam.matrix_world.to_3x3() @ Vector((0, 1, 0))
        sensor = cam.data.sensor_width
        fov_w = 2 * dist * (sensor / 2) / cam.data.lens
        aspect = sc.render.resolution_y / sc.render.resolution_x
        fov_w_eff = fov_w if sc.render.resolution_x >= sc.render.resolution_y else fov_w / aspect
        fov_h_eff = fov_w_eff * aspect
        target = target + right * (cx * fov_w_eff) + up * (cy * fov_h_eff)
        dist *= scale ** 0.9
    cam.location = target + direction * dist
    _point_at(cam, target)
    bpy.context.view_layer.update()


def render(path):
    sc = bpy.context.scene
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)


# ---------------------------------------------------------------------------
# Materials
# ---------------------------------------------------------------------------

_MAT_CACHE = {}


def new_mat(name):
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    return m


def _bsdf(m):
    return m.node_tree.nodes.get("Principled BSDF")


def principled(key, color="#FFFFFF", rough=0.3, metal=0.0, coat=0.0, coat_rough=0.03, trans=0.0,
               ior=1.45, sheen=0.0, sheen_rough=0.4, ss=0.0, aniso=0.0, spec=0.5, alpha=1.0,
               emission=None, thin_film=0.0, bump=None, bump_scale=60.0, bump_strength=0.08):
    if key in _MAT_CACHE:
        return _MAT_CACHE[key]
    m = new_mat(key)
    p = _bsdf(m)
    p.inputs["Base Color"].default_value = lin(color) if isinstance(color, str) else color
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    p.inputs["Coat Weight"].default_value = coat
    p.inputs["Coat Roughness"].default_value = coat_rough
    p.inputs["Transmission Weight"].default_value = trans
    p.inputs["IOR"].default_value = ior
    p.inputs["Sheen Weight"].default_value = sheen
    p.inputs["Sheen Roughness"].default_value = sheen_rough
    p.inputs["Subsurface Weight"].default_value = ss
    p.inputs["Anisotropic"].default_value = aniso
    p.inputs["Specular IOR Level"].default_value = spec
    p.inputs["Alpha"].default_value = alpha
    if thin_film:
        p.inputs["Thin Film Thickness"].default_value = thin_film
    if ss:
        p.inputs["Subsurface Radius"].default_value = (0.6, 0.25, 0.15)
        p.inputs["Subsurface Scale"].default_value = 0.08
    if emission:
        p.inputs["Emission Color"].default_value = lin(emission)
        p.inputs["Emission Strength"].default_value = 1.0
    if bump:
        nt = m.node_tree
        tex = nt.nodes.new("ShaderNodeTexNoise")
        tex.inputs["Scale"].default_value = bump_scale
        tex.inputs["Detail"].default_value = 6
        bmp = nt.nodes.new("ShaderNodeBump")
        bmp.inputs["Strength"].default_value = bump_strength
        nt.links.new(tex.outputs["Fac"], bmp.inputs["Height"])
        nt.links.new(bmp.outputs["Normal"], p.inputs["Normal"])
    if trans >= 0.3:
        _shadow_pass(m)
    _MAT_CACHE[key] = m
    return m


def _shadow_pass(m):
    """Let shadow rays pass through refractive materials so liquids and parts inside clear
    packaging are lit (refractive caustics are disabled for speed)."""
    nt = m.node_tree
    out = nt.nodes.get("Material Output")
    src = out.inputs["Surface"].links[0].from_socket
    lp = nt.nodes.new("ShaderNodeLightPath")
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    tr.inputs["Color"].default_value = (0.96, 0.96, 0.96, 1)
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(lp.outputs["Is Shadow Ray"], mix.inputs["Fac"])
    nt.links.new(src, mix.inputs[1])
    nt.links.new(tr.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])


def M(kind, color="#FFFFFF", **kw):
    """Material presets used throughout the catalogue."""
    key = f"{kind}:{color}:{sorted(kw.items())}"
    if key in _MAT_CACHE:
        return _MAT_CACHE[key]
    if kind == "gloss":
        m = principled(key, color, rough=kw.get("rough", 0.14), coat=0.8, coat_rough=0.02, spec=0.5)
    elif kind == "satin":
        m = principled(key, color, rough=kw.get("rough", 0.32), coat=0.25, coat_rough=0.2)
    elif kind == "matte":
        m = principled(key, color, rough=kw.get("rough", 0.62), sheen=0.25, sheen_rough=0.5, spec=0.35)
    elif kind == "metal":
        m = principled(key, color, rough=kw.get("rough", 0.2), metal=1.0, aniso=kw.get("aniso", 0.0))
    elif kind == "brushed":
        m = principled(key, color, rough=kw.get("rough", 0.28), metal=1.0, aniso=0.75)
    elif kind == "chrome":
        m = principled(key, color, rough=0.04, metal=1.0)
    elif kind == "clear":
        m = principled(key, color, rough=kw.get("rough", 0.0), trans=1.0, ior=1.49, spec=0.5)
    elif kind == "frost":
        m = principled(key, color, rough=kw.get("rough", 0.32), trans=1.0, ior=1.49)
    elif kind == "glass":
        m = principled(key, color, rough=0.0, trans=1.0, ior=1.52)
    elif kind == "liquid":
        # coloured, slightly translucent gloss / oil
        m = principled(key, color, rough=0.04, trans=kw.get("trans", 0.75), ior=1.45, ss=0.0, coat=0.4,
                       coat_rough=0.01)
    elif kind == "cream":
        m = principled(key, color, rough=kw.get("rough", 0.38), ss=0.35, coat=0.15, coat_rough=0.2)
    elif kind == "lipstick":
        fin = kw.get("finish", "satin")
        rough = {"matte": 0.62, "satin": 0.34, "cream": 0.26, "gloss": 0.1, "sheer": 0.18}[fin]
        m = principled(key, color, rough=rough, ss=0.06, coat=0.6 if fin == "gloss" else 0.0,
                       coat_rough=0.03, sheen=0.12 if fin == "matte" else 0.0, spec=0.32)
    elif kind == "powder":
        m = _powder(key, color, kw.get("shimmer", 0.0), kw.get("pattern", None))
    elif kind == "bristle":
        m = principled(key, color, rough=0.35, aniso=0.6, spec=0.45, coat=0.2)
    elif kind == "flock":
        m = principled(key, color, rough=0.95, sheen=1.0, sheen_rough=0.3, spec=0.2)
    elif kind == "rubber":
        m = principled(key, color, rough=0.5, ss=0.1, spec=0.4)
    elif kind == "mirror":
        m = principled(key, "#F4F4F4", rough=0.01, metal=1.0)
    elif kind == "wood":
        m = _wood(key, color)
    elif kind == "lead":
        m = principled(key, color, rough=kw.get("rough", 0.42), ss=0.15, spec=0.4)
    elif kind == "felt":
        m = principled(key, color, rough=0.75, sheen=0.4, spec=0.2)
    elif kind == "shimmer_liquid":
        m = _shimmer_liquid(key, color)
    else:
        raise ValueError(kind)
    _MAT_CACHE[key] = m
    return m


def _powder(key, color, shimmer, pattern):
    m = new_mat(key)
    nt = m.node_tree
    p = _bsdf(m)
    p.inputs["Base Color"].default_value = lin(color)
    p.inputs["Roughness"].default_value = 0.82
    p.inputs["Specular IOR Level"].default_value = 0.35
    p.inputs["Sheen Weight"].default_value = 0.35
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 220
    noise.inputs["Detail"].default_value = 8
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.12
    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], p.inputs["Normal"])
    if shimmer > 0:
        vor = nt.nodes.new("ShaderNodeTexVoronoi")
        vor.inputs["Scale"].default_value = 900
        ramp = nt.nodes.new("ShaderNodeValToRGB")
        ramp.color_ramp.elements[0].position = 0.0
        ramp.color_ramp.elements[0].color = (1, 1, 1, 1)
        ramp.color_ramp.elements[1].position = 0.08 + 0.12 * shimmer
        ramp.color_ramp.elements[1].color = (0, 0, 0, 1)
        nt.links.new(vor.outputs["Distance"], ramp.inputs["Fac"])
        nt.links.new(ramp.outputs["Color"], p.inputs["Metallic"])
        inv = nt.nodes.new("ShaderNodeMath")
        inv.operation = "MULTIPLY_ADD"
        inv.inputs[1].default_value = -0.6
        inv.inputs[2].default_value = 0.82
        nt.links.new(ramp.outputs["Color"], inv.inputs[0])
        nt.links.new(inv.outputs[0], p.inputs["Roughness"])
        p.inputs["Coat Weight"].default_value = 0.15 * shimmer
    if pattern == "waves":
        # embossed concentric wave pattern for pressed pans
        tc = nt.nodes.new("ShaderNodeTexCoord")
        wave = nt.nodes.new("ShaderNodeTexWave")
        wave.wave_type = "RINGS"
        wave.inputs["Scale"].default_value = 1.6
        wave.inputs["Distortion"].default_value = 0.0
        wave.inputs["Detail"].default_value = 0.0
        nt.links.new(tc.outputs["Object"], wave.inputs["Vector"])
        b2 = nt.nodes.new("ShaderNodeBump")
        b2.inputs["Strength"].default_value = 0.35
        b2.inputs["Distance"].default_value = 0.06
        nt.links.new(wave.outputs["Fac"], b2.inputs["Height"])
        nt.links.new(bump.outputs["Normal"], b2.inputs["Normal"])
        nt.links.new(b2.outputs["Normal"], p.inputs["Normal"])
    return m


def _shimmer_liquid(key, color):
    m = new_mat(key)
    nt = m.node_tree
    p = _bsdf(m)
    p.inputs["Base Color"].default_value = lin(color)
    p.inputs["Roughness"].default_value = 0.05
    p.inputs["Transmission Weight"].default_value = 0.55
    p.inputs["Coat Weight"].default_value = 0.4
    _shadow_pass(m)
    vor = nt.nodes.new("ShaderNodeTexVoronoi")
    vor.inputs["Scale"].default_value = 140
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (1, 1, 1, 1)
    ramp.color_ramp.elements[1].position = 0.12
    ramp.color_ramp.elements[1].color = (0, 0, 0, 1)
    nt.links.new(vor.outputs["Distance"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], p.inputs["Metallic"])
    return m


def _wood(key, color):
    m = new_mat(key)
    nt = m.node_tree
    p = _bsdf(m)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    wave = nt.nodes.new("ShaderNodeTexWave")
    wave.wave_type = "BANDS"
    wave.bands_direction = "Z"
    wave.inputs["Scale"].default_value = 2.5
    wave.inputs["Distortion"].default_value = 6.0
    wave.inputs["Detail"].default_value = 3.0
    nt.links.new(tc.outputs["Object"], wave.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = lin(color)
    base = lin(color)
    ramp.color_ramp.elements[1].color = (base[0] * 0.78, base[1] * 0.7, base[2] * 0.62, 1)
    nt.links.new(wave.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = 0.62
    return m


def print_material(key, tex_path, ink="#FFFFFF", foil=False, rough=0.3):
    """Transparent decal material driven by a texture's alpha (screen print / foil)."""
    if key in _MAT_CACHE:
        return _MAT_CACHE[key]
    m = new_mat(key)
    nt = m.node_tree
    p = _bsdf(m)
    out = nt.nodes.get("Material Output")
    img = bpy.data.images.load(tex_path, check_existing=True)
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = img
    tex.interpolation = "Cubic"
    p.inputs["Base Color"].default_value = lin(ink)
    if foil:
        p.inputs["Metallic"].default_value = 1.0
        p.inputs["Roughness"].default_value = 0.18
    else:
        p.inputs["Roughness"].default_value = rough
    transp = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(tex.outputs["Alpha"], mix.inputs["Fac"])
    nt.links.new(transp.outputs[0], mix.inputs[1])
    nt.links.new(p.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    _MAT_CACHE[key] = m
    return m


# ---------------------------------------------------------------------------
# Text textures ("YOUR BRAND" placeholder printing)
# ---------------------------------------------------------------------------

def text_texture(lines, w_cm, h_cm, u_center=0.75, v_center=0.5, size_cm=0.55, font="Jost-Medium.ttf",
                 tracking=0.32, px_per_cm=220, vertical=False, line_gap=1.6, sizes=None, max_w_cm=None):
    """Render letter-spaced placeholder text into a transparent PNG matching a surface's
    real proportions (w_cm x h_cm), so it maps without distortion."""
    from PIL import Image, ImageDraw, ImageFont
    W = max(64, int(w_cm * px_per_cm))
    H = max(64, int(h_cm * px_per_cm))
    if W > 8192:
        s = 8192 / W
        W, H, px_per_cm = 8192, int(H * s), px_per_cm * s
    key = f"{'_'.join(lines)}_{W}x{H}_{u_center}_{v_center}_{size_cm}_{font}_{tracking}_{vertical}_{sizes}_{max_w_cm}"
    fn = os.path.join(TEX_DIR, "t_%08x.png" % (abs(hash(key)) & 0xFFFFFFFF))
    if os.path.exists(fn):
        return fn
    img = Image.new("RGBA", (W, H), (255, 255, 255, 0))
    sizes = sizes or [size_cm] * len(lines)
    if max_w_cm:
        # shrink uniformly so the widest line fits the available face width
        probe = ImageFont.truetype(os.path.join(FONT_DIR, font), 100)
        widest = max(sum(probe.getlength(ch) for ch in ln) / 100 * sz + tracking * sz * (len(ln) - 1) for ln, sz in zip(lines, sizes))
        if widest > max_w_cm:
            sizes = [sz * max_w_cm / widest for sz in sizes]
    rendered = []
    for line, sz in zip(lines, sizes):
        fpx = max(8, int(sz * px_per_cm))
        f = ImageFont.truetype(os.path.join(FONT_DIR, font), fpx)
        # per-character tracking
        glyphs = []
        total = 0
        for ch in line:
            bb = f.getbbox(ch)
            adv = f.getlength(ch)
            glyphs.append((ch, adv))
            total += adv + tracking * fpx
        total -= tracking * fpx
        rendered.append((line, f, fpx, glyphs, total))
    tile = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(tile)
    total_h = sum(r[2] for r in rendered) + (len(rendered) - 1) * rendered[0][2] * (line_gap - 1)
    y = H * (1 - v_center) - total_h / 2
    for (line, f, fpx, glyphs, total) in rendered:
        x = W * u_center - total / 2
        for ch, adv in glyphs:
            d.text((x, y), ch, font=f, fill=(255, 255, 255, 255))
            x += adv + tracking * fpx
        y += fpx * line_gap
    if vertical:
        tile = tile.rotate(90, expand=False)
    img.alpha_composite(tile)
    img.save(fn)
    return fn


# ---------------------------------------------------------------------------
# Geometry
# ---------------------------------------------------------------------------

def fillet(corners, seg=6):
    """corners: list of (r, z, radius). Returns a profile with rounded corners."""
    out = []
    n = len(corners)
    for i, (r, z, rad) in enumerate(corners):
        if rad <= 0 or i == 0 or i == n - 1:
            out.append((r, z))
            continue
        p0 = Vector((corners[i - 1][0], corners[i - 1][1]))
        p1 = Vector((r, z))
        p2 = Vector((corners[i + 1][0], corners[i + 1][1]))
        d1 = (p0 - p1)
        d2 = (p2 - p1)
        l1, l2 = d1.length, d2.length
        if l1 < 1e-9 or l2 < 1e-9:
            out.append((r, z))
            continue
        d1.normalize()
        d2.normalize()
        ang = math.acos(max(-1, min(1, d1.dot(d2))))
        t = rad / math.tan(ang / 2) if ang > 1e-4 else 0
        t = min(t, l1 * 0.49, l2 * 0.49)
        a = p1 + d1 * t
        b = p1 + d2 * t
        # quadratic bezier approximation of the arc
        for k in range(seg + 1):
            s = k / seg
            q = (1 - s) ** 2 * a + 2 * (1 - s) * s * p1 + s ** 2 * b
            out.append((q.x, q.y))
    return out


def _link(obj, coll=None):
    (coll or bpy.context.scene.collection).objects.link(obj)
    return obj


def _se(t, n):
    c, s = math.cos(t), math.sin(t)
    if n != 2.0:
        e = 2.0 / n
        c, s = math.copysign(abs(c) ** e, c), math.copysign(abs(s) ** e, s)
    return c, s


def perimeter(r, n=2.0, ax=1.0, ay=1.0):
    N = 2048
    pts = [_se(2 * PI * k / N, n) for k in range(N + 1)]
    return r * sum(math.hypot((pts[k][0] - pts[k - 1][0]) * ax, (pts[k][1] - pts[k - 1][1]) * ay) for k in range(1, N + 1))


def _uniform_angles(seg, n, ax=1.0, ay=1.0, rot0=0.0):
    """Unit superellipse points spaced evenly by perimeter, so UVs (and printed text) don't stretch
    on the flat faces of soft-square packs."""
    if n == 2.0:
        return [(math.cos(rot0 + 2 * PI * j / seg), math.sin(rot0 + 2 * PI * j / seg)) for j in range(seg)]
    N = 4096
    pts = [_se(rot0 + 2 * PI * k / N, n) for k in range(N + 1)]
    cum = [0.0]
    for k in range(1, N + 1):
        cum.append(cum[-1] + math.hypot((pts[k][0] - pts[k - 1][0]) * ax, (pts[k][1] - pts[k - 1][1]) * ay))
    total = cum[-1]
    out, k = [], 0
    for j in range(seg):
        target = total * j / seg
        while cum[k + 1] < target:
            k += 1
        f = (target - cum[k]) / max(1e-12, cum[k + 1] - cum[k])
        out.append((pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f))
    return out


def lathe(name, prof, mat=None, seg=96, n=2.0, ax=1.0, ay=1.0, closed=False, smooth=True, rot0=0.0,
          sharp=False, coll=None):
    """Revolve a (r, z) profile around Z. Material is on the left of travel direction.
    n > 2 gives a superellipse (squircle) cross-section."""
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new()
    rings = []
    L = [0.0]
    for i in range(1, len(prof)):
        L.append(L[-1] + math.dist(prof[i - 1], prof[i]))
    tot = L[-1] or 1.0
    if closed:
        tot += math.dist(prof[-1], prof[0])
    angles = _uniform_angles(seg, n, ax, ay, rot0)
    for (r, z) in prof:
        if r < 1e-6:
            rings.append([bm.verts.new((0, 0, z))])
            continue
        ring = []
        for j in range(seg):
            c, s = angles[j]
            ring.append(bm.verts.new((r * c * ax, r * s * ay, z)))
        rings.append(ring)
    pairs = list(range(len(rings) - 1))
    if closed:
        pairs.append(len(rings) - 1)
    for i in pairs:
        A = rings[i]
        B = rings[(i + 1) % len(rings)]
        vA = L[i] / tot
        vB = (L[i + 1] if i + 1 < len(L) else tot) / tot
        for j in range(seg):
            j2 = (j + 1) % seg
            uA, uB = j / seg, (j + 1) / seg
            if len(A) == 1 and len(B) == 1:
                continue
            if len(A) == 1:
                vs = (A[0], B[j2], B[j])
                uvs = ((uA + uB) / 2, vA), (uB, vB), (uA, vB)
            elif len(B) == 1:
                vs = (A[j], A[j2], B[0])
                uvs = (uA, vA), (uB, vA), ((uA + uB) / 2, vB)
            else:
                vs = (A[j], A[j2], B[j2], B[j])
                uvs = (uA, vA), (uB, vA), (uB, vB), (uA, vB)
            try:
                f = bm.faces.new(vs)
            except ValueError:
                continue
            f.smooth = smooth
            for loop, co in zip(f.loops, uvs):
                loop[uv].uv = co
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    _link(obj, coll)
    if mat:
        obj.data.materials.append(mat)
    if sharp:
        es = obj.modifiers.new("split", "EDGE_SPLIT")
        es.split_angle = math.radians(sharp if isinstance(sharp, (int, float)) and sharp is not True else 30)
    return obj


def cyl_profile(r, z0, z1, bevel=0.08, top_bevel=None, bottom=True, top=True):
    """Closed solid cylinder profile with filleted edges."""
    tb = bevel if top_bevel is None else top_bevel
    pts = []
    if bottom:
        pts.append((0, z0, 0))
    pts.append((r, z0, bevel))
    pts.append((r, z1, tb))
    if top:
        pts.append((0, z1, 0))
    return fillet(pts)


def tube_shell(r_out, r_in, z0, z1, bevel=0.06, floor=None):
    """Hollow shell (open at top) — e.g. clear gloss tube wall."""
    fz = floor if floor is not None else z0 + (r_out - r_in) * 1.6
    pts = [(0, z0, 0), (r_out, z0, bevel), (r_out, z1, bevel * 0.6), (r_in, z1, bevel * 0.6),
           (r_in, fz, bevel), (0, fz, 0)]
    return fillet(pts)


def box(name, sx, sy, sz, loc=(0, 0, 0), bevel=0.1, mat=None, segments=5, coll=None):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= sx
        v.co.y *= sy
        v.co.z *= sz
    for f in bm.faces:
        f.smooth = True
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    _link(obj, coll)
    obj.location = loc
    if bevel:
        b = obj.modifiers.new("bevel", "BEVEL")
        b.width = bevel
        b.segments = segments
        b.limit_method = "NONE"
        b.profile = 0.5
    if mat:
        obj.data.materials.append(mat)
    return obj


def bristle_brush(name, length, core_r, profile_fn, count=520, bristle_r=0.018, mat=None, turns=26,
                  curve=0.0, coll=None, rows=None, cone=False):
    """Spiral mascara brush. profile_fn(t) -> radius of bristle tip envelope at t in [0,1].
    curve: bend radius factor (0 = straight)."""
    bm = bmesh.new()
    sides = 4
    for i in range(count):
        t = i / (count - 1)
        z = t * length
        ang = 2 * PI * turns * t + (i % 7) * 0.9
        if rows:
            # comb/silicone style: discrete rows of teeth
            k = i % rows
            ang = 2 * PI * k / rows + (int(i / rows) % 2) * (PI / rows)
        R = profile_fn(t)
        if R <= core_r:
            continue
        d = Vector((math.cos(ang), math.sin(ang), 0))
        base = Vector((0, 0, z)) + d * core_r * 0.8
        tip = Vector((0, 0, z)) + d * R
        perp1 = Vector((0, 0, 1))
        perp2 = d.cross(perp1)
        br = bristle_r * (1.6 if rows else 1.0)
        ring_b, ring_t = [], []
        for s in range(sides):
            a = 2 * PI * s / sides
            off = perp1 * math.cos(a) * br + perp2 * math.sin(a) * br
            ring_b.append(bm.verts.new(base + off))
            ring_t.append(bm.verts.new(tip + off * (0.25 if cone or rows else 0.8)))
        for s in range(sides):
            s2 = (s + 1) % sides
            f = bm.faces.new((ring_b[s], ring_b[s2], ring_t[s2], ring_t[s]))
            f.smooth = True
        bm.faces.new(ring_t[::-1])
    if curve:
        for v in bm.verts:
            z = v.co.z
            th = z / curve
            x = v.co.x
            # bend along X
            rr = curve - x
            v.co.x = curve - rr * math.cos(th)
            v.co.z = rr * math.sin(th)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    _link(obj, coll)
    if mat:
        obj.data.materials.append(mat)
    return obj


def parent_all(objs, name="Group"):
    e = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(e)
    for o in objs:
        if o.parent is None:
            o.parent = e
    return e


def place(group, loc=(0, 0, 0), rot=(0, 0, 0)):
    group.location = loc
    group.rotation_euler = tuple(math.radians(a) for a in rot)
    bpy.context.view_layer.update()


def descendants(e):
    out = []
    for c in e.children:
        out.append(c)
        out.extend(descendants(c))
    return out


def label_band(name, r, z0, z1, tex, ink="#FFFFFF", foil=False, seg=128, n=2.0, ax=1.0, ay=1.0, coll=None):
    """Thin printed decal band wrapped around a cylinder/squircle body."""
    mat = print_material(f"print:{tex}:{ink}:{foil}", tex, ink, foil)
    prof = [(r, z0), (r, z1)]
    return lathe(name, prof, mat=mat, seg=seg, n=n, ax=ax, ay=ay, coll=coll)


def label_disc(name, r, z, tex, ink="#FFFFFF", foil=False, coll=None, ax=1.0, ay=1.0, n=2.0):
    """Planar printed decal on a top surface with planar UVs."""
    mat = print_material(f"print:{tex}:{ink}:{foil}", tex, ink, foil)
    bm = bmesh.new()
    uvl = bm.loops.layers.uv.new()
    seg = 96
    ring = []
    center = bm.verts.new((0, 0, z))
    for j in range(seg):
        t = 2 * PI * j / seg
        c, s = math.cos(t), math.sin(t)
        if n != 2.0:
            e = 2.0 / n
            c, s = math.copysign(abs(c) ** e, c), math.copysign(abs(s) ** e, s)
        ring.append(bm.verts.new((r * c * ax, r * s * ay, z)))
    for j in range(seg):
        f = bm.faces.new((center, ring[j], ring[(j + 1) % seg]))
        f.smooth = True
        for loop in f.loops:
            co = loop.vert.co
            loop[uvl].uv = (0.5 + co.x / (2 * r * ax), 0.5 + co.y / (2 * r * ay))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    _link(obj, coll)
    obj.data.materials.append(mat)
    return obj


def plane_decal(name, w, h, tex, ink="#FFFFFF", foil=False, coll=None):
    mat = print_material(f"print:{tex}:{ink}:{foil}", tex, ink, foil)
    bm = bmesh.new()
    uvl = bm.loops.layers.uv.new()
    vs = [bm.verts.new((-w / 2, -h / 2, 0)), bm.verts.new((w / 2, -h / 2, 0)),
          bm.verts.new((w / 2, h / 2, 0)), bm.verts.new((-w / 2, h / 2, 0))]
    f = bm.faces.new(vs)
    for loop, uvco in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
        loop[uvl].uv = uvco
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    _link(obj, coll)
    obj.data.materials.append(mat)
    return obj
