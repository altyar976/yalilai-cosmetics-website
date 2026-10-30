import * as THREE from "three";

/** Profile point (radius, height) with an optional fillet radius at that corner. */
export type Corner = [number, number, number?];

/** Round the corners of a polyline profile (quadratic approximation of each fillet). */
export function fillet(corners: Corner[], seg = 6): [number, number][] {
  const out: [number, number][] = [];
  const n = corners.length;
  for (let i = 0; i < n; i++) {
    const [r, z, rad = 0] = corners[i];
    if (rad <= 0 || i === 0 || i === n - 1) {
      out.push([r, z]);
      continue;
    }
    const p0 = new THREE.Vector2(corners[i - 1][0], corners[i - 1][1]);
    const p1 = new THREE.Vector2(r, z);
    const p2 = new THREE.Vector2(corners[i + 1][0], corners[i + 1][1]);
    const d1 = p0.clone().sub(p1);
    const d2 = p2.clone().sub(p1);
    const l1 = d1.length();
    const l2 = d2.length();
    if (l1 < 1e-9 || l2 < 1e-9) {
      out.push([r, z]);
      continue;
    }
    d1.normalize();
    d2.normalize();
    const ang = Math.acos(Math.max(-1, Math.min(1, d1.dot(d2))));
    let t = ang > 1e-4 ? rad / Math.tan(ang / 2) : 0;
    t = Math.min(t, l1 * 0.49, l2 * 0.49);
    const a = p1.clone().add(d1.clone().multiplyScalar(t));
    const b = p1.clone().add(d2.clone().multiplyScalar(t));
    for (let k = 0; k <= seg; k++) {
      const s = k / seg;
      const q = a
        .clone()
        .multiplyScalar((1 - s) ** 2)
        .add(p1.clone().multiplyScalar(2 * (1 - s) * s))
        .add(b.clone().multiplyScalar(s * s));
      out.push([q.x, q.y]);
    }
  }
  return out;
}

const se = (t: number, n: number): [number, number] => {
  const c = Math.cos(t);
  const s = Math.sin(t);
  if (n === 2) return [c, s];
  const e = 2 / n;
  return [Math.sign(c) * Math.abs(c) ** e, Math.sign(s) * Math.abs(s) ** e];
};

/** Unit superellipse points evenly spaced by perimeter (no texture stretch on flat faces). */
export function uniformRing(segments: number, n: number, ax = 1, ay = 1): [number, number][] {
  if (n === 2) return Array.from({ length: segments }, (_, j) => se((j / segments) * Math.PI * 2, 2));
  const N = 2048;
  const pts = Array.from({ length: N + 1 }, (_, k) => se((k / N) * Math.PI * 2, n));
  const cum = [0];
  for (let k = 1; k <= N; k++) cum.push(cum[k - 1] + Math.hypot((pts[k][0] - pts[k - 1][0]) * ax, (pts[k][1] - pts[k - 1][1]) * ay));
  const total = cum[N];
  const out: [number, number][] = [];
  let k = 0;
  for (let j = 0; j < segments; j++) {
    const target = (total * j) / segments;
    while (cum[k + 1] < target) k++;
    const f = (target - cum[k]) / Math.max(1e-12, cum[k + 1] - cum[k]);
    out.push([pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f]);
  }
  return out;
}

export function perimeter(r: number, n: number) {
  const N = 1024;
  let p = 0;
  let prev = se(0, n);
  for (let k = 1; k <= N; k++) {
    const cur = se((k / N) * Math.PI * 2, n);
    p += Math.hypot(cur[0] - prev[0], cur[1] - prev[1]);
    prev = cur;
  }
  return p * r;
}

type RevolveOpts = { segments?: number; n?: number; ax?: number; ay?: number; closed?: boolean };

/**
 * Revolve a profile around the Y axis (three.js is Y-up). Material faces the left of travel.
 * `n` > 2 gives a superellipse ("soft-square") cross-section. UV.x runs around, UV.y along the profile.
 */
export function revolve(profile: [number, number][], { segments = 96, n = 2, ax = 1, ay = 1, closed = false }: RevolveOpts = {}) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const L = [0];
  for (let i = 1; i < profile.length; i++) L.push(L[i - 1] + Math.hypot(profile[i][0] - profile[i - 1][0], profile[i][1] - profile[i - 1][1]));
  const total = (L[L.length - 1] || 1) + (closed ? Math.hypot(profile[0][0] - profile.at(-1)![0], profile[0][1] - profile.at(-1)![1]) : 0);
  const cols = segments + 1; // duplicate seam column for clean UVs
  const ring = uniformRing(segments, n, ax, ay);
  for (let i = 0; i < profile.length; i++) {
    const [r, y] = profile[i];
    for (let j = 0; j < cols; j++) {
      const [c, s] = ring[j % segments];
      // three.js: X right, Z towards camera. Front of the pack (UV.x = 0.75) faces +Z.
      positions.push(r * c * ax, y, -r * s * ay);
      uvs.push(j / segments, L[i] / total);
    }
  }
  const rows = closed ? profile.length : profile.length - 1;
  for (let i = 0; i < rows; i++) {
    const a = i * cols;
    const b = ((i + 1) % profile.length) * cols;
    for (let j = 0; j < segments; j++) {
      indices.push(a + j, a + j + 1, b + j, a + j + 1, b + j + 1, b + j);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

export const cylProfile = (r: number, y0: number, y1: number, bevel = 0.08, topBevel?: number): [number, number][] =>
  fillet([[0, y0], [r, y0, bevel], [r, y1, topBevel ?? bevel], [0, y1]]);

export const shellProfile = (rOut: number, rIn: number, y0: number, y1: number, floor: number, bevel = 0.06): [number, number][] =>
  fillet([[0, y0], [rOut, y0, bevel], [rOut, y1, bevel * 0.6], [rIn, y1, bevel * 0.6], [rIn, floor, bevel], [0, floor]]);

/** Lipstick bullet: a cylinder sliced by a slanted plane, with a separate elliptical top face. */
export function bulletGeometry(R: number, h: number, angleDeg: number, segments = 72, tip: "slant" | "round" = "slant"): { side: THREE.BufferGeometry; top: THREE.BufferGeometry | null } {
  if (tip === "round") {
    const prof: [number, number][] = [[0, 0], [R, 0], [R, h - R * 0.6]];
    for (let k = 1; k < 12; k++) {
      const a = (k / 12) * (Math.PI / 2);
      prof.push([R * Math.cos(a), h - R * 0.6 + R * 0.75 * Math.sin(a)]);
    }
    prof.push([0, h + R * 0.15]);
    return { side: revolve(prof, { segments }), top: null };
  }
  const tan = Math.tan((angleDeg * Math.PI) / 180);
  const topAt = (x: number) => h - tan * (x + R) * 0.55;
  const positions: number[] = [];
  const indices: number[] = [];
  const ring = segments + 1;
  // bottom ring, top ring (clipped), then top fan
  for (let j = 0; j < ring; j++) {
    const t = (j / segments) * Math.PI * 2;
    const x = R * Math.cos(t);
    const z = -R * Math.sin(t);
    positions.push(x, 0, z);
  }
  for (let j = 0; j < ring; j++) {
    const t = (j / segments) * Math.PI * 2;
    const x = R * Math.cos(t);
    const z = -R * Math.sin(t);
    positions.push(x, topAt(x), z);
  }
  for (let j = 0; j < segments; j++) indices.push(j, j + 1, ring + j, j + 1, ring + j + 1, ring + j);
  const side = new THREE.BufferGeometry();
  side.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  side.setIndex(indices);
  side.computeVertexNormals();
  // top cap
  const cap: number[] = [0, topAt(0), 0];
  for (let j = 0; j < ring; j++) {
    const t = (j / segments) * Math.PI * 2;
    const x = R * Math.cos(t);
    cap.push(x, topAt(x), -R * Math.sin(t));
  }
  const capIdx: number[] = [];
  for (let j = 1; j <= segments; j++) capIdx.push(0, j, j + 1);
  const top = new THREE.BufferGeometry();
  top.setAttribute("position", new THREE.Float32BufferAttribute(cap, 3));
  top.setIndex(capIdx);
  top.computeVertexNormals();
  return { side, top };
}

/** Spiral fibre brush as a single instanced mesh. */
export function brushMesh(length: number, profile: (t: number) => number, material: THREE.Material, count = 420, curve = 0) {
  const bristle = new THREE.CylinderGeometry(0.012, 0.018, 1, 4, 1, true);
  bristle.translate(0, 0.5, 0);
  const mesh = new THREE.InstancedMesh(bristle, material, count);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const y = -t * length;
    const ang = 2 * Math.PI * 28 * t + (i % 7) * 0.9;
    const R = profile(t);
    const dir = new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang));
    q.setFromUnitVectors(up, dir);
    let x = 0;
    if (curve) x = curve - Math.sqrt(Math.max(0, curve * curve - y * y));
    m.compose(new THREE.Vector3(x, y, 0).addScaledVector(dir, 0.05), q, new THREE.Vector3(1, R, 1));
    mesh.setMatrixAt(i, m);
  }
  return mesh;
}

/** Soft radial contact-shadow texture. */
export function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 128);
  g.addColorStop(0, "rgba(40,30,25,0.42)");
  g.addColorStop(0.45, "rgba(40,30,25,0.16)");
  g.addColorStop(1, "rgba(40,30,25,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
