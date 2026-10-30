"""
Render specifications for every catalogue concept.

Each entry: arch (archetype builder), params (geometry + materials), optional camera tweaks
and `colorways` — alternate packaging finishes rendered for the hero view so the website can
swap photographs when a visitor picks a packaging colour.

Packaging is deliberately generic: all printing reads "YOUR BRAND" (an illustrative placeholder).
"""

# --- packaging palette -------------------------------------------------------
NOIR = ("gloss", "#121110")
NOIR_MATTE = ("matte", "#1A1817")
IVORY = ("gloss", "#E7DDCF")
IVORY_SOFT = ("matte", "#E4DACB")
PEARL = ("satin", "#ECE6DE")
CHAMPAGNE = ("metal", "#D6BE98", {"rough": 0.2})
GOLD = ("metal", "#CDAA6E", {"rough": 0.18})
BRUSHED_GOLD = ("brushed", "#CFAE78")
ROSE_GOLD = ("metal", "#D7A894", {"rough": 0.2})
SILVER = ("metal", "#D6D8DA", {"rough": 0.12})
BLUSH = ("satin", "#DDB7AC")
BLUSH_GLOSS = ("gloss", "#E6C4BB")
NUDE_MATTE = ("matte", "#C9A796")
SAND = ("matte", "#C7B29B")
MOCHA = ("satin", "#6A5045")
ESPRESSO = ("gloss", "#3B2A23")
TAUPE = ("satin", "#A08C80")
CLEAR = ("clear", "#FFFFFF")
FROST = ("frost", "#F7F5F2", {"rough": 0.3})
FROST_BLUSH = ("frost", "#F6E3DE", {"rough": 0.32})
GLASS = ("glass", "#FFFFFF")

FOIL_GOLD = {"ink": "#D9C29C", "foil": True}
FOIL_ROSE = {"ink": "#DDAF9C", "foil": True}
INK_WHITE = {"ink": "#FFFFFF"}
INK_BLACK = {"ink": "#1A1817"}
INK_TAUPE = {"ink": "#7B675D"}


def P(base, **kw):
    d = dict(base)
    d.update(kw)
    return d


TOP = {"hero": {"el": 50, "fill_w": 0.9}, "alt": {"el": 50, "fill_w": 0.9}}
COMPACT_CAM = {"hero": {"el": 26, "az": -22, "fill_w": 0.84}, "alt": {"el": 34, "az": -22, "fill_w": 0.82}}
PALETTE_CAM = {"hero": {"el": 38, "az": -18, "fill_w": 0.86}, "alt": {"el": 40, "az": -24, "fill_w": 0.8}}
JAR_CAM = {"hero": {"el": 24, "fill_w": 0.84}, "alt": {"el": 18, "fill_w": 0.7}}

SPECS = {
    # ===================================================================== MASCARA
    "volume-sculpt-mascara": dict(arch="wand", params=dict(
        r=0.9, h=8.4, cap_h=5.8, body=NOIR, cap=CHAMPAGNE, applicator="brush:hourglass",
        print=P(FOIL_GOLD, size=0.34)),
        colorway_list=["ivory", "blush"],
        colorways={"ivory": dict(body=IVORY, cap=CHAMPAGNE, print=P(FOIL_GOLD, size=0.34)),
                   "blush": dict(body=BLUSH, cap=ROSE_GOLD, print=P(INK_WHITE, size=0.34))}),
    "long-line-lengthening-mascara": dict(arch="wand", params=dict(
        r=0.72, h=9.4, cap_h=6.0, body=IVORY_SOFT, cap=NOIR, collar=GOLD, collar_h=0.22,
        applicator="brush:straight", print=P(INK_BLACK, size=0.3)),
        colorway_list=["noir", "sand"],
        colorways={"noir": dict(body=NOIR_MATTE, cap=NOIR, print=P(FOIL_GOLD, size=0.3)),
                   "sand": dict(body=SAND, cap=MOCHA, print=P(INK_WHITE, size=0.3))}),
    "lift-curl-mascara": dict(arch="wand", params=dict(
        r=0.88, h=8.2, cap_h=5.6, body=BLUSH, cap=BLUSH, collar=ROSE_GOLD, applicator="brush:curved",
        print=P(INK_WHITE, size=0.34), wand_tilt=-28)),
    "waterproof-hold-mascara": dict(arch="wand", params=dict(
        r=0.86, h=8.3, cap_h=5.6, n=4.6, body=ESPRESSO, cap=GOLD, applicator="brush:taper",
        print=P(FOIL_GOLD, size=0.32))),
    "tubing-style-mascara": dict(arch="wand", params=dict(
        r=0.84, h=8.4, cap_h=5.6, body=PEARL, cap=NOIR, applicator="brush:straight", collar=SILVER, collar_h=0.2,
        print=P(INK_BLACK, size=0.32))),
    "clear-lash-brow-gel": dict(arch="wand", params=dict(
        r=0.8, h=8.0, cap_h=5.2, clear=True, body=CLEAR, fill=("liquid", "#F2EEE6", {"trans": 0.92}), fill_level=0.8,
        cap=IVORY, applicator="brush:comb", bristle="#E9E4DC", print=P(INK_WHITE, size=0.3))),
    "fiber-effect-mascara": dict(arch="wand", params=dict(
        r=0.92, h=8.2, cap_h=5.7, body=NOIR_MATTE, cap=NOIR, collar=CHAMPAGNE, applicator="brush:fiber",
        print=P(FOIL_GOLD, size=0.34))),
    "dual-ended-primer-mascara": dict(arch="wand", params=dict(
        r=0.85, h=6.6, cap_h=5.0, cap2_h=5.0, dual=True, body=IVORY, cap=NOIR, cap2=PEARL, collar=CHAMPAGNE,
        collar_h=0.2, applicator="brush:hourglass", print=P(FOIL_GOLD, size=0.3), wand_lift=4.0)),
    "mini-travel-mascara": dict(arch="wand", params=dict(
        r=0.72, h=5.0, cap_h=3.8, body=NOIR, cap=ROSE_GOLD, applicator="brush:mini", stem_frac=0.82,
        print=P(FOIL_ROSE, size=0.26), wand_tilt=-30)),
    "precision-lower-lash-mascara": dict(arch="wand", params=dict(
        r=0.62, h=8.6, cap_h=5.4, body=MOCHA, cap=CHAMPAGNE, applicator="brush:micro",
        print=P(FOIL_GOLD, size=0.26))),

    # ===================================================================== LIP GLOSS
    "crystal-clear-lip-gloss": dict(arch="wand", params=dict(
        r=0.74, h=7.2, cap_h=4.4, n=4.5, clear=True, body=CLEAR, fill=("liquid", "#F4EFEA", {"trans": 0.95}),
        cap=IVORY, applicator="doe", applicator_color="#F1ECE6", print=P(INK_WHITE, size=0.28))),
    "mirror-shine-lip-gloss": dict(arch="wand", params=dict(
        r=0.72, h=7.4, cap_h=4.6, clear=True, body=CLEAR, fill=("liquid", "#D98E88", {"trans": 0.7}),
        cap=NOIR, applicator="doe", applicator_color="#D69690", print=P(INK_WHITE, size=0.28)),
        colorway_list=["ivory", "gold"],
        colorways={"ivory": dict(cap=IVORY), "gold": dict(cap=GOLD)}),
    "tinted-glow-lip-gloss": dict(arch="wand", params=dict(
        r=0.74, h=7.2, cap_h=4.4, clear=True, body=CLEAR, fill=("liquid", "#B5525D", {"trans": 0.62}),
        cap=ROSE_GOLD, applicator="doe", applicator_color="#B55862", print=P(INK_WHITE, size=0.28))),
    "champagne-shimmer-lip-gloss": dict(arch="wand", params=dict(
        r=0.74, h=7.2, cap_h=4.4, n=4.5, clear=True, body=CLEAR, fill=("shimmer_liquid", "#E2C4A8"),
        cap=GOLD, applicator="doe", applicator_color="#E2C7AE", print=P(INK_WHITE, size=0.28))),
    "plump-look-lip-gloss": dict(arch="wand", params=dict(
        r=0.8, h=7.0, cap_h=4.6, clear=True, body=CLEAR, fill=("liquid", "#7E2440", {"trans": 0.5}),
        cap=NOIR_MATTE, collar=SILVER, collar_h=0.18, applicator="doe", applicator_color="#86304A",
        print=P(INK_WHITE, size=0.28))),
    "silk-lip-oil": dict(arch="wand", params=dict(
        r=1.15, h=5.6, cap_h=3.9, clear=True, wall=0.42, floor=1.0, body=GLASS, fill=("liquid", "#E59A7A", {"trans": 0.8}),
        cap=GOLD, cap_r=0.82, applicator="doe", applicator_color="#E2A486", stem_frac=0.7, fill_level=0.8,
        print=P(INK_WHITE, size=0.3), wand_tilt=-26)),
    "mini-gloss-trio": dict(arch="wand", params=dict(
        r=0.56, h=5.2, cap_h=3.3, clear=True, body=CLEAR, cap=IVORY, applicator="doe", fill_level=0.84,
        print=P(INK_WHITE, size=0.22)),
        multi=[(-1.9, 0.6, dict(fill=("liquid", "#E2A69E", {"trans": 0.65}))),
               (0.0, -0.4, dict(fill=("liquid", "#B55262", {"trans": 0.55}))),
               (1.9, 0.6, dict(fill=("shimmer_liquid", "#E0C2A4")))],
        pose={"hero": "alt"}, camera={"hero": {"el": 14, "az": -20, "fill_w": 0.86}, "alt": {"el": 30, "az": 24, "fill_w": 0.86}}),
    "squeeze-tube-lip-gloss": dict(arch="squeeze", params=dict(
        r=0.95, length=8.6, cap_h=1.6, cap_r=0.62, body=BLUSH_GLOSS, cap=ROSE_GOLD, print=P(INK_WHITE, size=0.3)),
        camera={"alt": {"el": 62, "az": -20, "fill_w": 0.8}}),
    "brush-tip-lip-gloss": dict(arch="wand", params=dict(
        r=0.76, h=7.2, cap_h=4.6, n=4.5, body=FROST_BLUSH, clear=True, fill=("liquid", "#C87A74", {"trans": 0.5}),
        cap=CHAMPAGNE, applicator="paint", bristle="#C9837C", print=P(INK_WHITE, size=0.28))),

    # ===================================================================== LIP LINER
    "classic-wood-lip-pencil": dict(arch="pencil", params=dict(
        r=0.42, length=14.5, body=("gloss", "#8E5A4E"), end=GOLD, shade="#94584B", second_shade="#7A3A3F",
        print=P(FOIL_GOLD, size=0.24)), camera=TOP),
    "twist-up-lip-liner": dict(arch="pencil", params=dict(
        kind="retractable", r=0.42, length=12.0, body=NOIR, accent=GOLD, shade="#9A4A4C", cap=NOIR,
        second_shade="#B66B64", print=P(FOIL_GOLD, size=0.22)), camera=TOP),
    "dual-ended-liner-blender": dict(arch="pencil", params=dict(
        kind="retractable", r=0.42, length=12.5, body=BLUSH, accent=ROSE_GOLD, shade="#A15A5A", smudger=True,
        smudger_color="#C9A091", print=P(INK_WHITE, size=0.22)), camera=TOP),
    "slim-precision-lip-liner": dict(arch="pencil", params=dict(
        r=0.32, length=15.0, body=("gloss", "#B97B74"), end=("gloss", "#B97B74"), shade="#B4675F",
        second_shade="#8C4048", lead_r=0.1, print=P(INK_WHITE, size=0.2)), camera=TOP),
    "jumbo-contour-lip-crayon": dict(arch="pencil", params=dict(
        kind="jumbo", r=0.62, length=11.0, body=("matte", "#A9634F"), end=("matte", "#A9634F"), shade="#A65844",
        second_shade="#7E3B33", print=P(INK_WHITE, size=0.28)), camera=TOP),

    # ===================================================================== LIPSTICK
    "satin-signature-lipstick": dict(arch="lipstick", params=dict(
        body=GOLD, cap=GOLD, sleeve=CHAMPAGNE, shade="#7E1726", finish="satin",
        cap_print=P(INK_WHITE, size=0.24, ink="#FFFFFF")),
        colorway_list=["noir", "ivory"],
        colorways={"noir": dict(body=NOIR, cap=NOIR, accent=GOLD, cap_print=P(FOIL_GOLD, size=0.24)),
                   "ivory": dict(body=IVORY, cap=IVORY, accent=GOLD, cap_print=P(FOIL_GOLD, size=0.24))}),
    "velvet-matte-lipstick": dict(arch="lipstick", params=dict(
        n=5.0, r=1.0, body=NOIR_MATTE, cap=NOIR_MATTE, sleeve=GOLD, accent=GOLD, shade="#6E2A31", finish="matte",
        cap_print=P(FOIL_GOLD, size=0.24)),
        colorway_list=["blush", "ivory"],
        colorways={"blush": dict(body=BLUSH, cap=BLUSH, accent=ROSE_GOLD, sleeve=ROSE_GOLD, cap_print=P(INK_WHITE, size=0.24)),
                   "ivory": dict(body=IVORY_SOFT, cap=IVORY_SOFT, cap_print=P(FOIL_GOLD, size=0.24))}),
    "cream-silk-lipstick": dict(arch="lipstick", params=dict(
        body=IVORY, cap=IVORY, sleeve=CHAMPAGNE, accent=CHAMPAGNE, shade="#B5615E", finish="cream",
        cap_print=P(FOIL_GOLD, size=0.24))),
    "glass-shine-lipstick": dict(arch="lipstick", params=dict(
        body=SILVER, cap=("clear", "#FFFFFF"), sleeve=SILVER, shade="#8C2A45", finish="gloss",
        cap_print=None, print=P(INK_WHITE, size=0.22))),
    "liquid-matte-lipstick": dict(arch="wand", params=dict(
        r=0.82, h=7.0, cap_h=4.6, n=4.8, clear=True, wall=0.2, body=GLASS, fill=("cream", "#8F2F2E", {"rough": 0.5}),
        fill_level=0.84, cap=NOIR, applicator="doe", applicator_color="#8F3331", print=P(INK_WHITE, size=0.28))),
    "water-tint-lip-stain": dict(arch="wand", params=dict(
        r=0.7, h=6.0, cap_h=4.0, clear=True, wall=0.2, body=GLASS, fill=("liquid", "#B21E35", {"trans": 0.85}),
        fill_level=0.78, cap=NOIR, collar=GOLD, collar_h=0.18, applicator="paint", bristle="#B42C3E",
        print=P(INK_WHITE, size=0.24))),
    "tinted-balm-stick": dict(arch="lipstick", params=dict(
        r=1.0, body=FROST_BLUSH, cap=FROST_BLUSH, sleeve=ROSE_GOLD, shade="#C77A78", finish="sheer", tip="round",
        print=None, cap_print=P(INK_WHITE, size=0.24))),
    "click-cap-lipstick-concept": dict(arch="lipstick", params=dict(
        n=3.4, r=1.06, body=BRUSHED_GOLD, cap=BRUSHED_GOLD, sleeve=CHAMPAGNE, shade="#A2414A", finish="satin",
        top_print=P(INK_BLACK, size=0.2, lines=["YOUR", "BRAND"], sizes=[0.2, 0.2]), cap_bevel=0.32)),
    "slim-bullet-lipstick": dict(arch="lipstick", params=dict(
        r=0.78, base_h=4.6, cap_h=5.4, body=MOCHA, cap=MOCHA, sleeve=GOLD, accent=GOLD, shade="#8C4E44",
        finish="satin", bullet_h=2.4, cap_print=P(FOIL_GOLD, size=0.2))),

    # ===================================================================== FACE
    "second-skin-liquid-foundation": dict(arch="bottle", params=dict(
        kind="pump", r=1.75, h=8.2, n=4.2, body=GLASS, fill=("cream", "#D8B497"), collar=CHAMPAGNE, cap=FROST,
        print=P(INK_BLACK, size=0.34)),
        colorway_list=["noir"],
        colorways={"noir": dict(collar=NOIR, cap=NOIR, print=P(INK_BLACK, size=0.34))}),
    "serum-skin-tint": dict(arch="bottle", params=dict(
        kind="dropper", r=1.55, h=7.0, body=GLASS, fill=("liquid", "#D2A07F", {"trans": 0.35}), collar=GOLD,
        bulb=("rubber", "#D8C1B4"), print=P(INK_BLACK, size=0.3))),
    "soft-focus-liquid-concealer": dict(arch="wand", params=dict(
        r=0.78, h=7.2, cap_h=4.6, clear=True, body=CLEAR, fill=("cream", "#D9B091"), cap=ROSE_GOLD,
        applicator="doe", applicator_color="#DBB596", print=P(INK_WHITE, size=0.28))),
    "cream-blush-pot": dict(arch="jar", params=dict(
        r=2.2, h=1.9, lid_h=1.1, body=IVORY, lid=GOLD, fill=("cream", "#D9837E"), swirl=True,
        top_print=P(INK_WHITE, size=0.32)), camera=JAR_CAM),
    "liquid-blush": dict(arch="wand", params=dict(
        r=0.76, h=7.0, cap_h=4.6, n=4.5, clear=True, body=FROST, fill=("liquid", "#E2766A", {"trans": 0.3}),
        cap=IVORY, applicator="doe", applicator_color="#E27D70", print=P(INK_WHITE, size=0.28))),
    "pressed-powder-blush": dict(arch="compact", params=dict(
        r=3.4, body=IVORY, shade="#E09E92", pattern="waves", top_print=P(FOIL_GOLD, size=0.38)),
        camera=COMPACT_CAM,
        colorway_list=["noir", "blush"],
        colorways={"noir": dict(body=NOIR, inner=NOIR), "blush": dict(body=BLUSH_GLOSS, top_print=P(INK_WHITE, size=0.38))}),
    "sun-kissed-bronzer": dict(arch="compact", params=dict(
        r=3.8, n=6.0, body=NOIR_MATTE, accent=GOLD, shade="#B87A55", pattern="waves",
        top_print=P(FOIL_GOLD, size=0.4)), camera=COMPACT_CAM),
    "luminous-highlighter": dict(arch="compact", params=dict(
        r=3.4, body=NOIR, shade="#E9CFB0", shimmer=1.0, lid_inlay=CHAMPAGNE, top_print=P(INK_BLACK, size=0.34)),
        camera=COMPACT_CAM),
    "pressed-setting-powder": dict(arch="compact", params=dict(
        r=3.6, body=GOLD, shade="#E6CBB5", top_print=P(INK_WHITE, size=0.38, ink="#FFFFFF")), camera=COMPACT_CAM),
    "loose-setting-powder": dict(arch="jar", params=dict(
        r=2.6, h=2.6, lid_h=1.3, thick=True, body=GLASS, lid=NOIR, fill=("powder", "#EBD9C9"), sifter=IVORY_SOFT,
        top_print=P(FOIL_GOLD, size=0.36)), camera=JAR_CAM),
    "smoothing-primer": dict(arch="squeeze", params=dict(
        r=1.3, length=11.0, cap_h=2.0, body=IVORY_SOFT, cap=CHAMPAGNE, print=P(INK_TAUPE, size=0.42)),
        camera={"alt": {"el": 62, "az": -20, "fill_w": 0.8}}),
    "fine-mist-setting-spray": dict(arch="bottle", params=dict(
        kind="mist", r=1.7, h=11.0, body=GLASS, fill=("liquid", "#F5F2EE", {"trans": 0.97}), collar=SILVER,
        cap=FROST, fill_level=0.84, print=P(INK_BLACK, size=0.34))),
    "cream-blush-stick": dict(arch="stick", params=dict(
        r=0.95, h=7.0, body=SAND, cap=SAND, fill=("cream", "#D2776F"), print=P(INK_WHITE, size=0.3))),

    # ===================================================================== EYES
    "precision-liquid-eyeliner-pen": dict(arch="pen", params=dict(
        body=NOIR, accent=GOLD, print=P(FOIL_GOLD, size=0.24)), camera=TOP),
    "fine-brush-liquid-liner": dict(arch="wand", params=dict(
        r=0.6, h=8.6, cap_h=5.0, body=NOIR, cap=GOLD, applicator="liner", bristle="#111111",
        print=P(FOIL_GOLD, size=0.24))),
    "gel-liner-pot": dict(arch="jar", params=dict(
        r=1.3, h=1.4, lid_h=0.9, thick=True, body=GLASS, lid=NOIR, fill=("cream", "#141312", {"rough": 0.2}),
        top_print=P(FOIL_GOLD, size=0.22)), camera=JAR_CAM),
    "kohl-eye-pencil": dict(arch="pencil", params=dict(
        r=0.42, length=14.5, body=NOIR, end=GOLD, shade="#161514", second_shade="#4A3A33",
        print=P(FOIL_GOLD, size=0.24)), camera=TOP),
    "nine-shade-eyeshadow-palette": dict(arch="palette", params=dict(
        cols=3, rows=3, body=IVORY_SOFT, lid=IVORY_SOFT,
        shades=["#EAD6C4", "#D9B39C", "#C08A73", "#E3C3A0", "#A86A55", "#7C4A3E", "#D8A6A0", "#9B6E6A", "#4B3530"],
        shimmer_idx=[3, 6, 1], top_print=P(FOIL_GOLD, size=0.42)), camera=PALETTE_CAM),
    "four-shade-eyeshadow-quad": dict(arch="palette", params=dict(
        cols=2, rows=2, pan=1.9, round_pans=True, body=NOIR, lid=NOIR,
        shades=["#E8CDB4", "#B5826B", "#7A4E45", "#C9A089"], shimmer_idx=[0, 3], top_print=P(FOIL_GOLD, size=0.34)),
        camera=PALETTE_CAM),
    "micro-brow-pencil": dict(arch="pencil", params=dict(
        kind="retractable", r=0.38, length=12.5, body=TAUPE, accent=CHAMPAGNE, shade="#6A5446", lead_r=0.08,
        spoolie=True, print=P(INK_WHITE, size=0.2)), camera=TOP),
    "tinted-brow-gel": dict(arch="wand", params=dict(
        r=0.7, h=6.4, cap_h=4.4, body=TAUPE, cap=CHAMPAGNE, applicator="brush:spoolie", bristle="#5E4A3E",
        print=P(INK_WHITE, size=0.26))),

    # ===================================================================== PREP & CARE
    "cleansing-balm-concept": dict(arch="jar", params=dict(
        r=3.0, h=2.6, lid_h=1.3, body=FROST, lid=IVORY_SOFT, fill=("cream", "#F0D9A8", {"rough": 0.3}), swirl=True,
        top_print=P(INK_TAUPE, size=0.42)), camera=JAR_CAM),
    "bi-phase-makeup-remover-concept": dict(arch="bottle", params=dict(
        kind="screw", r=1.9, h=10.5, body=GLASS, fill=("liquid", "#CFE0EA", {"trans": 0.9}), fill_level=0.42,
        fill2=("liquid", "#F2E2BC", {"trans": 0.9}), fill2_level=0.8, cap=IVORY, cap_h=2.2,
        print=P(INK_BLACK, size=0.36))),
}

# Generic colourway fallbacks (unused when explicit colorways exist)
COLORWAYS = {}
