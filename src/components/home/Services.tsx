"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { useHref, useT } from "@/i18n/locale-context";
import { home } from "@/content/home";
import { ui } from "@/content/ui";
import { formatIndex } from "@/lib/utils";

/** "Made around your vision" — service tiles with a soft tilt on precise pointers. */
export function Services() {
  const t = useT();
  const href = useHref();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_ctx, contextSafe) => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-tile]", { y: 50, autoAlpha: 0, duration: 1.2, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: "[data-tiles]", start: "top 80%", once: true } });
      });
      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const tiles = gsap.utils.toArray<HTMLElement>("[data-tile]");
        const handlers = tiles.map((el) => {
          const rx = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3.out" });
          const ry = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3.out" });
          const move = contextSafe!((e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            ry(((e.clientX - r.left) / r.width - 0.5) * 7);
            rx(-((e.clientY - r.top) / r.height - 0.5) * 7);
          });
          const leave = contextSafe!(() => {
            rx(0);
            ry(0);
          });
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", leave);
          return () => {
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerleave", leave);
          };
        });
        return () => handlers.forEach((h) => h());
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="bg-linen py-24 lg:py-36" aria-labelledby="services-title">
      <div className="container-x">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">{t(home.services.eyebrow)}</p>
            <SplitHeadline id="services-title" text={t(home.services.title)} className="display mt-5 text-[clamp(2.4rem,4.6vw,4.6rem)]" />
          </div>
          <Link href={href("/services")} className="inline-flex items-center gap-2 text-sm font-medium link-underline">
            {t(ui.nav.services)} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <ul data-tiles className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 [perspective:1200px]">
          {home.services.items.map((s, i) => (
            <li key={i} data-tile className="card-surface group relative flex min-h-[260px] flex-col overflow-hidden p-7 transition-shadow duration-700 [transform-style:preserve-3d] hover:shadow-[0_40px_80px_-50px_rgba(23,21,19,0.35)] lg:min-h-[300px] lg:p-9">
              <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(196,167,124,0.22),transparent_70%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              <div className="flex items-start justify-between">
                <span className="font-[family-name:var(--font-display)] text-3xl text-champagne-deep">{formatIndex(i + 1)}</span>
                <span className="rounded-full border border-champagne/50 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.14em] text-champagne-deep">{t(s.tag)}</span>
              </div>
              <h3 className="display mt-auto pt-10 text-[1.9rem]">{t(s.title)}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{t(s.body)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
