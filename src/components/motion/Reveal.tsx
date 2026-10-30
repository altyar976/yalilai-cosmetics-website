"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "./gsap";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  /** Animate direct `[data-reveal-item]` descendants with a stagger instead of the wrapper. */
  stagger?: number;
  y?: number;
  delay?: number;
  start?: string;
  id?: string;
};

/** Fades and lifts content into view. Content is fully visible without JS or with reduced motion. */
export function Reveal({ children, className, as: Tag = "div", stagger, y = 36, delay = 0, start = "top 86%", id }: Props) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion()) return;
      const items = stagger ? ref.current.querySelectorAll("[data-reveal-item]") : [ref.current];
      if (!items.length) return;
      gsap.from(items, {
        y,
        autoAlpha: 0,
        duration: 1.2,
        delay,
        stagger: stagger ?? 0,
        ease: "expo.out",
        clearProps: "transform,opacity,visibility",
        scrollTrigger: { trigger: ref.current, start, once: true },
      });
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} className={cn(className)} id={id} data-reveal="">
      {children}
    </Tag>
  );
}
