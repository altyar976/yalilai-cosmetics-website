"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { buildModel, type Built, type LabelArt } from "./three/models";
import { shadowTexture } from "./three/geometry";
import type { StudioConfig } from "./studio-config";

export type ViewerHandle = { snapshot: (size?: number) => string | null; resetView: () => void };

type Props = { config: StudioConfig; art: LabelArt; open: boolean; autoRotate: boolean; onReady?: () => void; onError?: () => void };

/** Real-time WebGL viewer. Renders on demand and pauses offscreen to save battery. */
const Viewer3D = forwardRef<ViewerHandle, Props>(function Viewer3D({ config, art, open, autoRotate, onReady, onError }, ref) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    controls?: OrbitControls;
    model?: Built;
    t: number;
    open: boolean;
    raf: number;
    visible: boolean;
    dirty: boolean;
    resetTarget?: () => void;
  }>({ t: 0, open: false, raf: 0, visible: true, dirty: true });

  // Init once
  useEffect(() => {
    const el = host.current!;
    const s = state.current;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
    } catch {
      onError?.();
      return;
    }
    const small = window.matchMedia("(max-width: 767px)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.AgXToneMapping;
    renderer.toneMappingExposure = 1.05;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = "pan-y";
    renderer.domElement.setAttribute("aria-hidden", "true");

    const scene = new THREE.Scene();
    // Opaque ivory backdrop so clear/frosted plastics have something to refract.
    scene.background = new THREE.Color("#efebe5");
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.9;
    const key = new THREE.DirectionalLight(0xfff4ea, 1.6);
    key.position.set(-6, 10, 8);
    scene.add(key);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xe9e2d8, 0.6));

    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.001;
    scene.add(shadow);

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 200);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.rotateSpeed = 0.7;
    controls.addEventListener("change", () => (s.dirty = true));
    controls.addEventListener("start", () => (controls.autoRotate = false));

    Object.assign(s, { renderer, scene, camera, controls });

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      s.dirty = true;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    const io = new IntersectionObserver(([e]) => {
      s.visible = e.isIntersecting;
      if (s.visible) loop();
    });
    io.observe(el);
    const onVis = () => {
      if (!document.hidden) loop();
    };
    document.addEventListener("visibilitychange", onVis);

    let last = performance.now();
    const loop = () => {
      cancelAnimationFrame(s.raf);
      s.raf = requestAnimationFrame((now) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (!s.visible || document.hidden) return;
        // open/close easing
        const target = s.open ? 1 : 0;
        if (Math.abs(s.t - target) > 0.001) {
          s.t += (target - s.t) * Math.min(1, dt * 5);
          applyOpen();
          s.dirty = true;
        }
        const moving = controls.update(dt) || controls.autoRotate;
        if (moving || s.dirty) {
          renderer.render(scene, camera);
          s.dirty = false;
        }
        loop();
      });
    };
    const applyOpen = () => {
      const m = s.model;
      if (!m) return;
      const e = s.t * s.t * (3 - 2 * s.t);
      for (const o of m.openable) {
        const pa = new THREE.Vector3();
        const qa = new THREE.Quaternion();
        const sa = new THREE.Vector3();
        const pb = new THREE.Vector3();
        const qb = new THREE.Quaternion();
        const sb = new THREE.Vector3();
        o.closed.decompose(pa, qa, sa);
        o.open.decompose(pb, qb, sb);
        o.obj.position.copy(pa.lerp(pb, e));
        o.obj.quaternion.copy(qa.slerp(qb, e));
      }
    };
    (s as unknown as { applyOpen: () => void }).applyOpen = applyOpen;
    (s as unknown as { loop: () => void }).loop = loop;
    loop();
    onReady?.();

    return () => {
      cancelAnimationFrame(s.raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      controls.dispose();
      disposeTree(scene);
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild model when the configuration or artwork changes
  useEffect(() => {
    const s = state.current;
    if (!s.scene || !s.camera || !s.controls) return;
    if (s.model) {
      s.scene.remove(s.model.root);
      disposeTree(s.model.root);
    }
    const built = buildModel(config, art);
    s.model = built;
    s.scene.add(built.root);
    (s as unknown as { applyOpen: () => void }).applyOpen?.();

    // frame the union of closed + open states
    const box = new THREE.Box3();
    const prevT = s.t;
    for (const tt of [0, 1]) {
      s.t = tt;
      (s as unknown as { applyOpen: () => void }).applyOpen?.();
      built.root.updateMatrixWorld(true);
      box.union(new THREE.Box3().setFromObject(built.root));
    }
    s.t = prevT;
    (s as unknown as { applyOpen: () => void }).applyOpen?.();
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const radius = Math.max(size.length() / 2, 2);
    const fitH = radius / Math.sin(THREE.MathUtils.degToRad(s.camera.fov / 2));
    const fitW = fitH / Math.min(1, s.camera.aspect);
    const dist = Math.max(fitH, fitW * 0.8) * 0.92;
    const firstFrame = !s.resetTarget;
    s.resetTarget = () => {
      s.controls!.target.copy(center);
      s.camera!.position.copy(center.clone().add(new THREE.Vector3(Math.sin(-0.45) * dist, dist * 0.22, Math.cos(-0.45) * dist)));
      s.controls!.minDistance = dist * 0.55;
      s.controls!.maxDistance = dist * 1.6;
      s.controls!.update();
    };
    if (firstFrame || (s.controls.target.distanceTo(center) > 2)) s.resetTarget();
    s.dirty = true;
    (s as unknown as { loop: () => void }).loop?.();
  }, [config, art]);

  useEffect(() => {
    state.current.open = open;
    (state.current as unknown as { loop: () => void }).loop?.();
  }, [open]);

  useEffect(() => {
    const c = state.current.controls;
    if (!c) return;
    c.autoRotate = autoRotate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    c.autoRotateSpeed = 0.9;
    (state.current as unknown as { loop: () => void }).loop?.();
  }, [autoRotate]);

  useImperativeHandle(ref, () => ({
    snapshot: (size = 360) => {
      const s = state.current;
      if (!s.renderer || !s.scene || !s.camera) return null;
      s.renderer.render(s.scene, s.camera);
      const src = s.renderer.domElement;
      const c = document.createElement("canvas");
      const ratio = src.height / src.width;
      c.width = size;
      c.height = Math.round(size * ratio);
      const ctx = c.getContext("2d")!;
      ctx.drawImage(src, 0, 0, c.width, c.height);
      return c.toDataURL("image/jpeg", 0.86);
    },
    resetView: () => state.current.resetTarget?.(),
  }));

  return <div ref={host} className="absolute inset-0" />;
});

function disposeTree(o: THREE.Object3D) {
  o.traverse((n) => {
    const m = n as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
    const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
    for (const mat of mats) {
      for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose();
      mat.dispose();
    }
  });
}

export default Viewer3D;
