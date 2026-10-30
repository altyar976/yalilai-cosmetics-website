// Convert raw renders from tools/product-renders/out into web-ready assets.
//   (product renders are no longer published — the catalogue uses audited reference photographs)
//   editorial/*.png         -> public/images/editorial/*.webp
//   hero/cutout-*.png       -> public/images/hero/*.webp (alpha kept)
//   hero/frames/fNNN.png    -> public/images/hero/frames/{d,m}/fNNN.webp + poster.webp
// Then rebuilds the image manifest.  Usage: node scripts/prepare-renders.mjs [rawDir]
import { readdir, mkdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const src = process.argv[2] ?? "tools/product-renders/out";
const pub = "public/images";

async function fresh(a, b) {
  try {
    const [sa, sb] = await Promise.all([stat(a), stat(b)]);
    return sb.mtimeMs >= sa.mtimeMs;
  } catch {
    return false;
  }
}
async function out(file, target, fn) {
  if (await fresh(file, target)) return 0;
  await mkdir(path.dirname(target), { recursive: true });
  await fn(sharp(file)).toFile(target);
  return 1;
}

let n = 0;
if (existsSync(path.join(src, "editorial"))) {
  for (const f of await readdir(path.join(src, "editorial"))) {
    if (!f.endsWith(".png")) continue;
    n += await out(path.join(src, "editorial", f), path.join(pub, "editorial", f.replace(".png", ".webp")), (s) => s.webp({ quality: 84, effort: 5 }));
  }
}
const heroDir = path.join(src, "hero");
let frameCount = 0;
if (existsSync(heroDir)) {
  for (const f of await readdir(heroDir)) {
    if (f.startsWith("cutout-") && f.endsWith(".png")) {
      n += await out(path.join(heroDir, f), path.join(pub, "hero", f.replace(".png", ".webp")), (s) => s.webp({ quality: 88, alphaQuality: 90, effort: 5 }));
    }
  }
  const fd = path.join(heroDir, "frames");
  if (existsSync(fd)) {
    const frames = (await readdir(fd)).filter((f) => /^f\d{3}\.png$/.test(f)).sort();
    // only a contiguous run from f000 is usable for the scrubbed sequence
    while (frames[frameCount] === `f${String(frameCount).padStart(3, "0")}.png`) frameCount++;
    for (const f of frames.slice(0, frameCount)) {
      const file = path.join(fd, f);
      n += await out(file, path.join(pub, "hero", "frames", "d", f.replace(".png", ".webp")), (s) => s.resize({ width: 1440, withoutEnlargement: true }).webp({ quality: 78, effort: 4 }));
      n += await out(file, path.join(pub, "hero", "frames", "m", f.replace(".png", ".webp")), (s) =>
        s.resize({ width: 900, height: 900, fit: "cover", position: "centre" }).webp({ quality: 74, effort: 4 }),
      );
    }
    if (frameCount) {
      n += await out(path.join(fd, "f000.png"), path.join(pub, "hero", "poster.webp"), (s) => s.webp({ quality: 84, effort: 5 }));
    }
  }
}
await writeFile(
  "src/data/generated/hero-frames.json",
  JSON.stringify({ count: frameCount, desktop: "/images/hero/frames/d/f{i}.webp", mobile: "/images/hero/frames/m/f{i}.webp", poster: "/images/hero/poster.webp" }, null, 1) + "\n",
);
console.log(`prepared ${n} files; hero frames: ${frameCount}`);
execFileSync("node", ["scripts/build-image-manifest.mjs"], { stdio: "inherit" });
