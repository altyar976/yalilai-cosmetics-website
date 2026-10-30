import * as THREE from "three";
import { brushMesh, bulletGeometry, cylProfile, fillet, perimeter, revolve, shellProfile } from "./geometry";
import type { StudioConfig } from "../studio-config";

/* -------------------------------------------------------------------------------------------
 * Materials
 * ----------------------------------------------------------------------------------------- */

export function packMaterial(color: string, finish: string) {
  if (color === "clear" || color === "frost") {
    return new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 1,
      thickness: 0.35,
      roughness: color === "frost" ? 0.38 : 0.04,
      ior: 1.49,
      metalness: 0,
      envMapIntensity: 1.1,
    });
  }
  const c = new THREE.Color(color);
  switch (finish) {
    case "metallic":
      return new THREE.MeshPhysicalMaterial({ color: c, metalness: 1, roughness: 0.24, envMapIntensity: 1.25 });
    case "matte":
      return new THREE.MeshPhysicalMaterial({ color: c, metalness: 0, roughness: 0.72, sheen: 0.35, sheenRoughness: 0.6, sheenColor: c.clone().lerp(new THREE.Color(1, 1, 1), 0.4) });
    default:
      return new THREE.MeshPhysicalMaterial({ color: c, metalness: 0, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.05 });
  }
}

const metal = (hex: string, rough = 0.22) => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(hex), metalness: 1, roughness: rough, envMapIntensity: 1.3 });
const satin = (hex: string, rough = 0.38) => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(hex), roughness: rough, clearcoat: 0.3, clearcoatRoughness: 0.3 });
const liquid = (hex: string, opacity = 0.92) =>
  new THREE.MeshPhysicalMaterial({ color: new THREE.Color(hex), roughness: 0.08, clearcoat: 0.6, transparent: opacity < 1, opacity });

/* -------------------------------------------------------------------------------------------
 * Decoration label (brand text or uploaded logo) drawn onto a canvas texture
 * ----------------------------------------------------------------------------------------- */

export type LabelArt = { text: string; logo?: HTMLCanvasElement | null; logoMode: "mono" | "original" };

function labelCanvas(circ: number, h: number, art: LabelArt, vertical: boolean) {
  const W = 2048;
  const H = Math.max(64, Math.round((W * h) / circ));
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, W, H);
  const cx = W * 0.75; // front of the pack
  const cy = H / 2;
  if (art.logo) {
    const lw = art.logo.width;
    const lh = art.logo.height;
    const maxW = vertical ? H * 0.55 : W * 0.16;
    const maxH = vertical ? W * 0.1 : H * 0.6;
    const s = Math.min(maxW / (vertical ? lh : lw), maxH / (vertical ? lw : lh));
    ctx.save();
    ctx.translate(cx, cy);
    if (vertical) ctx.rotate(-Math.PI / 2);
    ctx.drawImage(art.logo, (-lw * s) / 2, (-lh * s) / 2, lw * s, lh * s);
    ctx.restore();
  } else {
    const text = (art.text || "YOUR BRAND").toUpperCase().slice(0, 24);
    ctx.save();
    ctx.translate(cx, cy);
    if (vertical) ctx.rotate(-Math.PI / 2);
    const avail = vertical ? H * 0.7 : W * 0.2;
    let size = vertical ? W * 0.065 : H * 0.18;
    ctx.font = `500 ${size}px Jost, "Helvetica Neue", Arial, sans-serif`;
    // letter-spacing via manual layout
    const spacing = 0.32;
    const measure = () => [...text].reduce((w, ch) => w + ctx.measureText(ch).width + size * spacing, -size * spacing);
    let w = measure();
    if (w > avail) {
      size *= avail / w;
      ctx.font = `500 ${size}px Jost, "Helvetica Neue", Arial, sans-serif`;
      w = measure();
    }
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "middle";
    let x = -w / 2;
    for (const ch of text) {
      ctx.fillText(ch, x, 0);
      x += ctx.measureText(ch).width + size * spacing;
    }
    ctx.restore();
  }
  return c;
}

function labelMaterial(tex: THREE.Texture, cfg: StudioConfig, original: boolean) {
  if (original) return new THREE.MeshPhysicalMaterial({ map: tex, transparent: true, roughness: 0.4, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false });
  const foil = cfg.decoration === "hot-stamp-gold" || cfg.decoration === "hot-stamp-silver";
  const color = cfg.decoration === "hot-stamp-gold" ? "#caa76a" : cfg.decoration === "hot-stamp-silver" ? "#d4d7db" : cfg.inkColor;
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    metalness: foil ? 1 : 0,
    roughness: foil ? 0.28 : 0.45,
    envMapIntensity: foil ? 1.6 : 1,
    alphaMap: tex,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  });
}

/** A printed band hugging a body section. Returns null when decoration is "none". */
function labelBand(r: number, y0: number, y1: number, cfg: StudioConfig, art: LabelArt, opts: { n?: number; vertical?: boolean } = {}) {
  if (cfg.decoration === "none") return null;
  const n = opts.n ?? 2;
  const circ = perimeter(r, n);
  const canvas = labelCanvas(circ, y1 - y0, art, !!opts.vertical);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const g = revolve(
    [
      [r + 0.006, y0],
      [r + 0.006, y1],
    ],
    { segments: 128, n },
  );
  if (cfg.decoration === "label") {
    // paper label: an opaque band behind the print
    const group = new THREE.Group();
    const paper = new THREE.Mesh(
      revolve(
        [
          [r + 0.004, y0 + 0.05],
          [r + 0.004, y1 - 0.05],
        ],
        { segments: 128, n },
      ),
      new THREE.MeshPhysicalMaterial({ color: "#f6f2ea", roughness: 0.85 }),
    );
    group.add(paper);
    const ink = new THREE.Mesh(g, labelMaterial(tex, { ...cfg, decoration: "screen-print", inkColor: "#1a1817" }, art.logoMode === "original" && !!art.logo));
    group.add(ink);
    return group;
  }
  return new THREE.Mesh(g, labelMaterial(tex, cfg, art.logoMode === "original" && !!art.logo));
}

/* -------------------------------------------------------------------------------------------
 * Families
 * ----------------------------------------------------------------------------------------- */

export type Built = { root: THREE.Group; openable: { obj: THREE.Object3D; closed: THREE.Matrix4; open: THREE.Matrix4 }[]; height: number };

const tag = <T extends THREE.Object3D>(o: T, role: string) => {
  o.userData.role = role;
  o.castShadow = true;
  return o;
};

const mat4 = (pos: [number, number, number], rot: [number, number, number] = [0, 0, 0]) =>
  new THREE.Matrix4().compose(new THREE.Vector3(...pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)), new THREE.Vector3(1, 1, 1));

export function buildModel(cfg: StudioConfig, art: LabelArt): Built {
  switch (cfg.family) {
    case "mascara":
      return wandTube(cfg, art, "mascara");
    case "gloss":
      return wandTube(cfg, art, "gloss");
    case "compact":
      return compact(cfg, art);
    case "foundation":
      return foundation(cfg, art);
    case "pencil":
      return pencil(cfg, art);
    default:
      return lipstick(cfg, art);
  }
}

function lipstick(cfg: StudioConfig, art: LabelArt): Built {
  const shape = { round: { R: 1.05, n: 2 }, square: { R: 1.0, n: 5 }, slim: { R: 0.78, n: 2 }, sculpted: { R: 1.06, n: 3.4 } }[cfg.silhouette] ?? { R: 1.05, n: 2 };
  const { R, n } = shape;
  const Hb = cfg.silhouette === "slim" ? 4.6 : 4.0;
  const Hc = cfg.silhouette === "slim" ? 5.4 : 4.6;
  const root = new THREE.Group();
  const seg = n === 2 ? 128 : 160;
  root.add(tag(new THREE.Mesh(revolve(fillet([[0, 0], [R, 0, 0.12], [R, Hb, 0.06], [0, Hb]]), { segments: seg, n }), packMaterial(cfg.bodyColor, cfg.finish)), "body"));
  root.add(tag(new THREE.Mesh(revolve(fillet([[R + 0.01, Hb - 0.36], [R + 0.01, Hb - 0.06]]), { segments: seg, n }), metal(cfg.accentColor)), "accent"));
  const sr = R * 0.86;
  const ext = 1.5;
  const inner = new THREE.Group();
  inner.add(tag(new THREE.Mesh(revolve(fillet([[0, Hb - 0.2], [sr, Hb - 0.2], [sr, Hb + ext, 0.04], [0, Hb + ext]]), { segments: 96 }), metal(cfg.accentColor, 0.18)), "accent"));
  const br = sr - 0.1;
  const { side, top } = bulletGeometry(br, 2.2, 48, 72, cfg.applicator === "round" ? "round" : "slant");
  const lip = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(cfg.shade), roughness: 0.34, clearcoat: 0.25, clearcoatRoughness: 0.25, sheen: 0.2 });
  const bullet = new THREE.Group();
  bullet.add(tag(new THREE.Mesh(side, lip), "product"));
  if (top) bullet.add(tag(new THREE.Mesh(top, lip), "product"));
  bullet.position.y = Hb + ext - 0.3;
  bullet.rotation.y = -0.6;
  inner.add(bullet);
  root.add(inner);
  const body = labelBand(R, 0.5, Hb - 0.55, cfg, art, { n });
  if (body) root.add(body);

  const cap = new THREE.Group();
  cap.add(tag(new THREE.Mesh(revolve(fillet([[0, 0], [R + 0.006, 0, 0.03], [R + 0.006, Hc, cfg.silhouette === "sculpted" ? 0.32 : 0.2], [0, Hc]]), { segments: seg, n }), packMaterial(cfg.capColor, cfg.finish)), "cap"));
  const capLabel = labelBand(R + 0.006, 0.7, Hc - 0.5, cfg, art, { n });
  if (capLabel) cap.add(capLabel);
  root.add(cap);
  const closed = mat4([0, Hb - 0.15, 0]);
  const open = mat4([R * 2.7 + 0.4, R + 0.006, 0.8], [Math.PI / 2, 0, -0.45]);
  // inner bullet hidden when closed by sinking it
  return {
    root,
    height: Hb + Hc,
    openable: [
      { obj: cap, closed, open },
      { obj: inner, closed: mat4([0, -ext - 0.2, 0]), open: mat4([0, 0, 0]) },
    ],
  };
}

function wandTube(cfg: StudioConfig, art: LabelArt, kind: "mascara" | "gloss"): Built {
  const shapes: Record<string, { R: number; n: number; H: number; Hc: number; heavy?: boolean }> =
    kind === "mascara"
      ? { round: { R: 0.88, n: 2, H: 8.4, Hc: 5.8 }, square: { R: 0.86, n: 4.6, H: 8.3, Hc: 5.6 }, slim: { R: 0.66, n: 2, H: 9.2, Hc: 5.8 } }
      : { round: { R: 0.74, n: 2, H: 7.2, Hc: 4.4 }, square: { R: 0.74, n: 4.5, H: 7.2, Hc: 4.4 }, heavy: { R: 1.15, n: 2, H: 5.6, Hc: 3.9, heavy: true } };
  const s = shapes[cfg.silhouette] ?? Object.values(shapes)[0];
  const { R, n, H, Hc } = s;
  const seg = n === 2 ? 128 : 160;
  const root = new THREE.Group();
  const neck = Math.min(R, 0.8) * 0.55;
  const clear = cfg.bodyColor === "clear" || cfg.bodyColor === "frost";
  if (clear) {
    const wall = s.heavy ? 0.42 : 0.12;
    const floor = s.heavy ? 1.0 : 0.35;
    root.add(tag(new THREE.Mesh(revolve(shellProfile(R, R - wall, 0, H, floor, 0.12), { segments: seg, n }), packMaterial(cfg.bodyColor, cfg.finish)), "body"));
    const fr = R - wall - 0.015;
    root.add(tag(new THREE.Mesh(revolve(cylProfile(fr, floor + 0.01, floor + (H - floor) * 0.84, 0.05), { segments: seg, n }), liquid(kind === "mascara" ? "#1b1918" : cfg.shade, 1)), "product"));
    root.add(tag(new THREE.Mesh(revolve(cylProfile(neck, H - 0.02, H + 0.9, 0.05), { segments: 64 }), satin("#ece9e4")), "neck"));
  } else {
    root.add(tag(new THREE.Mesh(revolve(fillet([[0, 0], [R, 0, 0.12], [R, H, 0.1], [neck, H, 0.05], [neck, H + 0.9, 0.05], [0, H + 0.9]]), { segments: seg, n }), packMaterial(cfg.bodyColor, cfg.finish)), "body"));
  }
  const band = labelBand(R, 0.5, H - 0.5, cfg, art, { n, vertical: true });
  if (band) root.add(band);

  const wand = new THREE.Group();
  const cap = new THREE.Group();
  cap.add(tag(new THREE.Mesh(revolve(fillet([[0, 0], [R, 0, 0.04], [R, Hc, 0.18], [0, Hc]]), { segments: seg, n }), packMaterial(cfg.capColor, cfg.finish)), "cap"));
  cap.add(tag(new THREE.Mesh(revolve(fillet([[R + 0.012, -0.001], [R + 0.012, 0.3]]), { segments: seg, n }), metal(cfg.accentColor)), "accent"));
  wand.add(cap);
  const stemLen = H * 0.78;
  wand.add(tag(new THREE.Mesh(revolve(cylProfile(0.11, -stemLen + 0.2, 0, 0.02), { segments: 24 }), satin("#dcdad6")), "stem"));
  const app = cfg.applicator;
  if (kind === "mascara") {
    const profiles: Record<string, (t: number) => number> = {
      hourglass: (t) => 0.36 + 0.13 * Math.abs(t - 0.5) * 2,
      straight: (t) => 0.4 - 0.04 * t,
      curved: (t) => 0.38 - 0.08 * Math.abs(t - 0.5),
      micro: () => 0.2,
      comb: (t) => 0.3 - 0.04 * t,
    };
    const len = app === "micro" ? 1.5 : 2.6;
    const brush = brushMesh(len, profiles[app] ?? profiles.hourglass, new THREE.MeshPhysicalMaterial({ color: app === "comb" ? "#2a2523" : "#121110", roughness: 0.4 }), app === "micro" ? 300 : 460, app === "curved" ? 9 : 0);
    brush.position.y = -stemLen - 0.05;
    wand.add(tag(brush, "applicator"));
  } else if (app === "brush") {
    const tip = new THREE.Mesh(revolve(fillet([[0, -stemLen - 1.6], [0.02, -stemLen - 1.58], [0.24, -stemLen - 0.35, 0.3], [0.24, -stemLen], [0, -stemLen]], 10), { segments: 32 }), satin(cfg.shade, 0.35));
    tip.scale.z = 0.55;
    wand.add(tag(tip, "applicator"));
  } else {
    const doe = new THREE.Mesh(revolve(fillet([[0, -stemLen - 2], [0.24, -stemLen - 1.95, 0.15], [0.34, -stemLen - 0.9, 0.5], [0.17, -stemLen + 0.1, 0.2], [0.11, -stemLen + 0.4], [0, -stemLen + 0.4]], 8), { segments: 48 }), new THREE.MeshPhysicalMaterial({ color: new THREE.Color(cfg.shade).lerp(new THREE.Color("#ffffff"), 0.25), roughness: 0.95, sheen: 1, sheenColor: new THREE.Color("#ffffff") }));
    doe.scale.z = 0.42;
    wand.add(tag(doe, "applicator"));
  }
  root.add(wand);
  return {
    root,
    height: H + Hc,
    openable: [{ obj: wand, closed: mat4([0, H + 0.04, 0]), open: mat4([R + 2.4, H + 1.4, 0.6], [0, 0, Math.PI + 0.42]) }],
  };
}

function compact(cfg: StudioConfig, art: LabelArt): Built {
  const R = cfg.silhouette === "square" ? 3.6 : 3.4;
  const n = cfg.silhouette === "square" ? 6 : 2;
  const hb = 0.95;
  const hl = 0.62;
  const seg = 160;
  const root = new THREE.Group();
  root.add(tag(new THREE.Mesh(revolve(fillet([[0, 0], [R, 0, 0.25], [R, hb, 0.08], [R - 0.35, hb, 0.04], [R - 0.35, hb - 0.32, 0.05], [0, hb - 0.32]]), { segments: seg, n }), packMaterial(cfg.bodyColor, cfg.finish)), "body"));
  const panR = R - 0.55;
  root.add(tag(new THREE.Mesh(revolve(fillet([[0, hb - 0.33], [panR, hb - 0.33], [panR, hb - 0.06, 0.04], [panR * 0.6, hb - 0.02], [0, hb]]), { segments: seg, n }), new THREE.MeshPhysicalMaterial({ color: new THREE.Color(cfg.shade), roughness: 0.85, sheen: 0.4 })), "product"));
  const hinge = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 0.35), metal(cfg.accentColor));
  hinge.position.set(0, hb, -R - 0.02);
  root.add(tag(hinge, "accent"));
  const lid = new THREE.Group();
  const lidInner = new THREE.Group();
  lidInner.add(tag(new THREE.Mesh(revolve(fillet([[0, 0], [R, 0, 0.06], [R, hl, 0.22], [0, hl]]), { segments: seg, n }), packMaterial(cfg.capColor, cfg.finish)), "cap"));
  lidInner.add(tag(new THREE.Mesh(revolve(fillet([[0, -0.012], [R - 0.45, -0.012], [R - 0.45, 0], [0, 0]]), { segments: seg, n }), new THREE.MeshPhysicalMaterial({ color: "#f4f4f4", metalness: 1, roughness: 0.02 })), "mirror"));
  if (cfg.decoration !== "none") {
    const canvas = labelCanvas(2 * R, 2 * R, art, false);
    // re-draw centred for a planar lid print
    const c2 = document.createElement("canvas");
    c2.width = c2.height = 1024;
    const ctx = c2.getContext("2d")!;
    ctx.drawImage(canvas, canvas.width * 0.75 - canvas.height / 2, 0, canvas.height, canvas.height, 0, 0, 1024, 1024);
    const tex = new THREE.CanvasTexture(c2);
    tex.colorSpace = THREE.SRGBColorSpace;
    const disc = new THREE.Mesh(new THREE.CircleGeometry(R * 0.95, 96), labelMaterial(tex, cfg, art.logoMode === "original" && !!art.logo));
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = hl + 0.006;
    lidInner.add(disc);
  }
  lidInner.position.set(0, 0, R);
  lid.add(lidInner);
  root.add(lid);
  return {
    root,
    height: 4,
    openable: [{ obj: lid, closed: mat4([0, hb + 0.02, -R]), open: mat4([0, hb + 0.02, -R], [-1.78, 0, 0]) }],
  };
}

function foundation(cfg: StudioConfig, art: LabelArt): Built {
  const round = cfg.silhouette === "round";
  const R = round ? 1.6 : 1.75;
  const n = round ? 2 : 4.2;
  const H = 8.2;
  const seg = round ? 128 : 192;
  const root = new THREE.Group();
  const glassy = cfg.bodyColor === "clear" || cfg.bodyColor === "frost";
  const neck = 0.62;
  const outer: [number, number, number?][] = [[0, 0], [R, 0, 0.35], [R, H - 0.9, 0.8], [neck, H, 0.12], [neck, H + 0.7, 0.05]];
  if (glassy) {
    const inner: [number, number, number?][] = [[neck - 0.16, H + 0.7, 0.05], [neck - 0.16, H - 0.1, 0.1], [R - 0.28, H - 0.95, 0.6], [R - 0.28, 0.8, 0.3], [0, 0.8]];
    root.add(tag(new THREE.Mesh(revolve(fillet([...outer, ...inner], 8), { segments: seg, n }), packMaterial(cfg.bodyColor, cfg.finish)), "body"));
    root.add(tag(new THREE.Mesh(revolve(fillet([[0, 0.81], [R - 0.3, 0.81, 0.28], [R - 0.3, 5.6, 0.04], [0, 5.6]]), { segments: seg, n }), new THREE.MeshPhysicalMaterial({ color: new THREE.Color(cfg.shade), roughness: 0.35 })), "product"));
  } else {
    root.add(tag(new THREE.Mesh(revolve(fillet([...outer, [0, H + 0.7]]), { segments: seg, n }), packMaterial(cfg.bodyColor, cfg.finish)), "body"));
  }
  const band = labelBand(R, H * 0.22, H * 0.7, cfg, art, { n });
  if (band) root.add(band);
  const top = H + 0.7;
  root.add(tag(new THREE.Mesh(revolve(fillet([[0, H + 0.1], [neck + 0.12, H + 0.1, 0.06], [neck + 0.12, top + 0.35, 0.08], [0, top + 0.35]]), { segments: 96 }), metal(cfg.accentColor)), "accent"));
  if (cfg.applicator === "dropper") {
    root.add(tag(new THREE.Mesh(revolve(fillet([[0, top + 0.3], [neck * 0.82, top + 0.3, 0.05], [neck * 0.8, top + 1.3, 0.3], [neck * 0.62, top + 2.2, 0.5], [0, top + 2.4]], 10), { segments: 64 }), satin(cfg.capColor === "clear" ? "#2b2522" : cfg.capColor, 0.5)), "cap"));
    return { root, height: H + 3, openable: [] };
  }
  const act = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.62, 0.72), metal(cfg.accentColor));
  act.position.set(0, top + 1.2, 0.18);
  root.add(tag(act, "accent"));
  root.add(tag(new THREE.Mesh(revolve(cylProfile(0.16, top + 0.3, top + 0.95, 0.02), { segments: 32 }), satin("#edeae5")), "stem"));
  const cap = new THREE.Group();
  const capH = top + 1.65 - (H + 0.05);
  cap.add(tag(new THREE.Mesh(revolve(fillet([[0, 0], [neck + 0.55, 0, 0.05], [neck + 0.55, capH, 0.3], [0, capH]]), { segments: 96 }), packMaterial(cfg.capColor, cfg.finish)), "cap"));
  root.add(cap);
  return {
    root,
    height: H + 2,
    openable: [{ obj: cap, closed: mat4([0, H + 0.05, 0]), open: mat4([R * 2 + 0.9, 0, 0.8]) }],
  };
}

function pencil(cfg: StudioConfig, art: LabelArt): Built {
  const kind = cfg.silhouette;
  const R = kind === "jumbo" ? 0.62 : 0.42;
  const L = kind === "jumbo" ? 11 : kind === "twist" ? 12 : 14.5;
  const root = new THREE.Group();
  const body = packMaterial(cfg.bodyColor, cfg.finish);
  const lead = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(cfg.shade), roughness: 0.42 });
  let top = L;
  if (kind === "twist") {
    root.add(tag(new THREE.Mesh(revolve(fillet([[0, 0], [R, 0, 0.1], [R, L, 0.02], [R * 0.86, L + 0.02], [0.19, L + 1.2, 0.05], [0, L + 1.2]]), { segments: 96 }), body), "body"));
    root.add(tag(new THREE.Mesh(revolve(fillet([[R + 0.008, L * 0.42], [R + 0.008, L * 0.42 + 0.3]]), { segments: 96 }), metal(cfg.accentColor)), "accent"));
    root.add(tag(new THREE.Mesh(revolve(fillet([[0, L + 1.1], [0.12, L + 1.1], [0.12, L + 1.55, 0.02], [0.02, L + 1.85, 0.02], [0, L + 1.86]]), { segments: 48 }), lead), "product"));
    top = L + 1.85;
  } else {
    const leadR = kind === "jumbo" ? 0.28 : 0.14;
    const cone = kind === "jumbo" ? 1.6 : 1.5;
    root.add(tag(new THREE.Mesh(revolve(fillet([[0, 0], [R, 0, 0.05], [R, L], [0, L]]), { segments: 96 }), body), "body"));
    root.add(tag(new THREE.Mesh(revolve(fillet([[0, -0.9], [R + 0.006, -0.9, 0.12], [R + 0.006, 0.02], [0, 0.02]]), { segments: 96 }), metal(cfg.accentColor)), "accent"));
    root.add(tag(new THREE.Mesh(revolve(fillet([[0, L - 0.01], [R * 0.97, L - 0.01], [leadR, L + cone], [0, L + cone]]), { segments: 64 }), new THREE.MeshPhysicalMaterial({ color: "#d9b48a", roughness: 0.7 })), "wood"));
    const tipH = kind === "jumbo" ? 0.65 : 0.55;
    root.add(tag(new THREE.Mesh(revolve(fillet([[0, L + cone - 0.05], [leadR, L + cone - 0.05], [kind === "jumbo" ? 0.08 : 0.03, L + cone + tipH, 0.03], [0, L + cone + tipH + 0.01]]), { segments: 48 }), lead), "product"));
    top = L + cone + tipH;
  }
  const band = labelBand(R, L * 0.15, L * 0.85, cfg, art, { vertical: true });
  if (band) root.add(band);
  const cap = new THREE.Group();
  cap.add(tag(new THREE.Mesh(revolve(fillet([[0, 0], [R + 0.03, 0, 0.03], [R + 0.03, 3.4, 0.12], [0, 3.4]]), { segments: 96 }), packMaterial(cfg.capColor, cfg.finish)), "cap"));
  root.add(cap);
  root.rotation.z = 0.08;
  return {
    root,
    height: top + 1,
    openable: [{ obj: cap, closed: mat4([0, top - 2.8, 0]), open: mat4([R * 4 + 1.2, R + 0.03, 1.4], [Math.PI / 2, 0, -0.5]) }],
  };
}
