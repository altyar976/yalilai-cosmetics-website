"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Seamless CSS marquee that pauses while offscreen. */
export function Marquee({ children, duration = 48, className }: { children: React.ReactNode; duration?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setPaused(!e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      data-paused={paused}
      className={cn("relative overflow-hidden mask-fade-x", className)}
      style={{ ["--marquee-duration" as string]: `${duration}s` }}
    >
      <div className="marquee-track flex w-max">
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
