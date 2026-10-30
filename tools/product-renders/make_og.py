"""Compose the 1200x630 Open Graph image from a final render (run with any Python + Pillow)."""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "out", "editorial", "editorial-lips.png")
dst = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "..", "..", "public", "images", "og", "yalilai-og.jpg")
W, H = 1200, 630
og = Image.new("RGB", (W, H), (244, 241, 236))
im = Image.open(src).convert("RGB")
# right half: cover-crop the render
tw, th = 640, H
s = max(tw / im.width, th / im.height)
im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
x0 = (im.width - tw) // 2
y0 = int((im.height - th) * 0.55)
og.paste(im.crop((x0, y0, x0 + tw, y0 + th)), (W - tw, 0))
# soft fade between halves
grad = Image.linear_gradient("L").rotate(-90).resize((160, H))  # opaque on the left, clear on the right
og.paste(Image.new("RGB", (160, H), (244, 241, 236)), (W - tw, 0), grad)
d = ImageDraw.Draw(og)
F = os.path.join(HERE, "fonts")
bodoni = ImageFont.truetype(os.path.join(F, "BodoniModa-Medium.ttf"), 64)
jost = ImageFont.truetype(os.path.join(F, "Jost-Medium.ttf"), 20)
jost_s = ImageFont.truetype(os.path.join(F, "Jost-Regular.ttf"), 22)
x = 72
# letter-spaced wordmark
cx = x
for ch in "YALILAI":
    d.text((cx, 150), ch, font=bodoni, fill=(23, 21, 19))
    cx += d.textlength(ch, font=bodoni) + 18
d.text((x, 245), "OEM · ODM · PRIVATE-LABEL MAKEUP", font=jost, fill=(124, 95, 62))
title = ImageFont.truetype(os.path.join(F, "BodoniModa-Medium.ttf"), 44)
d.text((x, 300), "Crafted for Your Brand.", font=title, fill=(23, 21, 19))
d.text((x, 356), "Made to Stand Out.", font=title, fill=(23, 21, 19))
d.text((x, 470), "Yalilai Cosmetics Co., Ltd.", font=jost_s, fill=(108, 98, 90))
try:
    zh = ImageFont.truetype("/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc", 22)
    d.text((x, 502), "雅丽莱化妆品有限公司", font=zh, fill=(108, 98, 90))
except OSError:
    pass
os.makedirs(os.path.dirname(dst), exist_ok=True)
og.save(dst, quality=88, optimize=True, progressive=True)
print("wrote", dst)
