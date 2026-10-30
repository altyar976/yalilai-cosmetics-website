"use client";

import { useEffect, useRef } from "react";
import { gsap, isFinePointer, prefersReducedMotion } from "./gsap";

/** A refined ring cursor for precise pointers. Grows over links/buttons; shows a label over [data-cursor]. */
export function CursorFollower() {
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ring.current;
    const lb = label.current;
    if (!el || !lb || !isFinePointer() || prefersReducedMotion()) return;
    const xs = [gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" }), gsap.quickTo(lb, "x", { duration: 0.5, ease: "power3.out" })];
    const ys = [gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" }), gsap.quickTo(lb, "y", { duration: 0.5, ease: "power3.out" })];
    let visible = false;
    let current = "";
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      xs.forEach((f) => f(e.clientX));
      ys.forEach((f) => f(e.clientY));
      if (!visible) {
        visible = true;
        gsap.to(el, { autoAlpha: 1, duration: 0.3 });
      }
      const t = e.target as HTMLElement | null;
      const hit = t?.closest?.("[data-cursor]") as HTMLElement | null;
      const interactive = t?.closest?.("a, button, [role='button'], input, select, textarea, label");
      const text = hit?.dataset.cursor ?? "";
      if (text !== current) {
        current = text;
        lb.textContent = text;
        gsap.to(lb, { autoAlpha: text ? 1 : 0, scale: text ? 1 : 0.6, duration: 0.35, ease: "power3.out" });
      }
      gsap.to(el, { scale: text ? 0 : interactive ? 1.7 : 1, duration: 0.35, ease: "power3.out" });
    };
    const leave = () => {
      visible = false;
      gsap.to([el, lb], { autoAlpha: 0, duration: 0.3 });
      current = "";
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <>
      <div
        ref={ring}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] -ml-3.5 -mt-3.5 h-7 w-7 rounded-full border border-ink/50"
        style={{ visibility: "hidden", opacity: 0 }}
      />
      <div
        ref={label}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] -ml-9 -mt-9 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-ink/90 text-[0.62rem] font-medium uppercase tracking-[0.18em] text-porcelain backdrop-blur-sm"
        style={{ visibility: "hidden", opacity: 0 }}
      />
    </>
  );
}
