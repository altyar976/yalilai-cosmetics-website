"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "./gsap";
import { useInquiry } from "@/store/inquiry";

/** Client bootstrapping: storage rehydration, ScrollTrigger refresh after fonts/route changes. */
export function MotionProvider() {
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.classList.add("js");
    void useInquiry.persist.rehydrate();
    if ("fonts" in document) {
      document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    }
  }, []);
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => window.clearTimeout(id);
  }, [pathname]);
  return null;
}
