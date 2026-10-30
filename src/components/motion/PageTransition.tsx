"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "./gsap";

/**
 * Enter transition for every route: a champagne hairline sweeps across while the page settles in.
 * Never blocks interaction and is skipped with reduced motion.
 */
let firstLoad = true;

export function PageTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      // Server-rendered first paint is never hidden; only client-side navigations animate.
      if (firstLoad) {
        firstLoad = false;
        return;
      }
      if (!ref.current || prefersReducedMotion()) return;
      const tl = gsap.timeline();
      tl.fromTo(bar.current, { scaleX: 0, transformOrigin: "0% 50%", autoAlpha: 1 }, { scaleX: 1, duration: 0.7, ease: "expo.inOut" })
        .to(bar.current, { transformOrigin: "100% 50%", scaleX: 0, duration: 0.6, ease: "expo.inOut" })
        .from(ref.current.querySelector("[data-page]"), { autoAlpha: 0, y: 14, duration: 0.9, ease: "expo.out", clearProps: "all" }, 0.15);
    },
    { scope: ref },
  );
  return (
    <div ref={ref}>
      <div ref={bar} aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] bg-champagne opacity-0" />
      <div data-page>{children}</div>
    </div>
  );
}
