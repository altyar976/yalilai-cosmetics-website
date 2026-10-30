"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "./gsap";
import { useLocale } from "@/i18n/locale-context";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  /** Animate immediately on mount (hero) instead of on scroll. */
  immediate?: boolean;
  delay?: number;
  /** Words (EN) / characters (ZH) to italicise in the display face, e.g. ["Stand", "Out."] */
  italic?: string[];
  id?: string;
};

/** Masked split-text reveal. Screen readers get the plain sentence via aria-label. */
export function SplitHeadline({ text, as: Tag = "h2", className, immediate, delay = 0, italic = [], id }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);
  const locale = useLocale();
  const isZh = locale === "zh-cn";
  const lines = text.split("\n");

  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion()) return;
      const pieces = ref.current.querySelectorAll("[data-piece]");
      gsap.from(pieces, {
        yPercent: 115,
        rotate: isZh ? 0 : 2,
        duration: 1.35,
        ease: "expo.out",
        delay,
        stagger: isZh ? 0.035 : 0.06,
        scrollTrigger: immediate ? undefined : { trigger: ref.current, start: "top 88%", once: true },
      });
    },
    { scope: ref, dependencies: [text] },
  );

  return (
    <Tag ref={ref} id={id} className={cn(className)} aria-label={text.replace(/\n/g, " ")}>
      {lines.map((line, li) => {
        const tokens = isZh ? Array.from(line) : line.split(" ");
        return (
          <span key={li} className="block" aria-hidden="true">
            {tokens.map((tok, ti) => (
              <span key={ti} className="inline-block overflow-hidden pb-[0.08em] align-bottom -mb-[0.08em]">
                <span data-piece className={cn("inline-block will-change-transform", italic.includes(tok) && "italic")}>
                  {tok}
                </span>
                {!isZh && ti < tokens.length - 1 ? " " : null}
              </span>
            ))}
          </span>
        );
      })}
    </Tag>
  );
}
