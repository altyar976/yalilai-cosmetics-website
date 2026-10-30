// Scan public/images and record intrinsic size + a tiny blurred placeholder for every image,
// so components can render <Image placeholder="blur"> without layout shift.
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = "public";
const dirs = ["images/factory", "images/catalog", "images/editorial", "images/hero", "images/studio"];
const out = {};

async function walk(dir) {
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(p)));
    else if (/\.(jpe?g|png|webp|avif)$/i.test(e.name)) files.push(p);
  }
  return files;
}

for (const d of dirs) {
  for (const file of await walk(path.join(root, d))) {
    if (file.includes(`${path.sep}frames${path.sep}`)) continue;
    const img = sharp(file);
    const meta = await img.metadata();
    const blur = await img.resize(12, null, { fit: "inside" }).webp({ quality: 40 }).toBuffer();
    const key = "/" + path.relative(root, file).split(path.sep).join("/");
    out[key] = { w: meta.width, h: meta.height, blur: `data:image/webp;base64,${blur.toString("base64")}` };
  }
}

await writeFile("src/data/generated/image-manifest.json", JSON.stringify(out, null, 0) + "\n");
console.log(`image manifest: ${Object.keys(out).length} entries`);
