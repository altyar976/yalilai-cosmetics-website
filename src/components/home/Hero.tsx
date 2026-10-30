"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion, isFinePointer } from "@/components/motion/gsap";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { Magnetic } from "@/components/motion/Magnetic";
import { useHref, useT } from "@/i18n/locale-context";
import { home } from "@/content/home";
import { ui } from "@/content/ui";
import heroManifest from "@/data/generated/hero-frames.json";

type FrameSet = { count: number; desktop: string; mobile: string; poster: string };
const frames = heroManifest as FrameSet;

// Desktop pins the hero for part of a viewport so the stage turns while the headline holds.
const PIN_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const PIN_RATIO = 0.6;
const pinsHero = () => window.matchMedia(PIN_QUERY).matches;
/**
 * Scroll distance (px) over which the hero is on screen: pin duration + its own height. Scroll-linked
 * effects use absolute numeric starts (the hero is the first section) — ScrollTrigger would otherwise
 * push "top top" triggers on the pinned element itself past the pin.
 */
const heroSpan = (el: HTMLElement | null) => (el?.offsetHeight ?? window.innerHeight) + (pinsHero() ? window.innerHeight * PIN_RATIO : 0);

/**
 * Cinematic hero: a rendered, rotating arrangement on an ivory stage. The poster frame is the LCP
 * image; the remaining frames stream in after load and are scrubbed by scroll on a canvas.
 * Reduced motion, data-saver or failed loads keep the still poster — never a blank stage.
 */
export function Hero() {
  const t = useT();
  const href = useHref();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const images = useRef<HTMLImageElement[]>([]);
  const current = useRef(0);

  // Progressive frame loading (skipped for reduced motion / save-data)
  useEffect(() => {
    if (!frames.count || prefersReducedMotion()) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;
    const small = window.matchMedia("(max-width: 767px)").matches;
    const pattern = small ? frames.mobile : frames.desktop;
    const stride = small ? 2 : 1;
    let cancelled = false;
    let loaded = 0;
    const list: HTMLImageElement[] = [];
    const indices = Array.from({ length: Math.ceil(frames.count / stride) }, (_, i) => i * stride);
    const start = () => {
      indices.forEach((idx, k) => {
        const img = new window.Image();
        img.decoding = "async";
        img.src = pattern.replace("{i}", String(idx).padStart(3, "0"));
        img.onload = () => {
          loaded++;
          if (!cancelled && loaded === indices.length) {
            images.current = list;
            setReady(true);
          }
        };
        list[k] = img;
      });
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(start, { timeout: 1500 });
    else window.setTimeout(start, 600);
    return () => {
      cancelled = true;
    };
  }, []);

  const draw = (i: number) => {
    const c = canvas.current;
    const img = images.current[i];
    if (!c || !img || !img.complete) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = c.clientWidth * dpr;
    const h = c.clientHeight * dpr;
    if (c.width !== w || c.height !== h) {
      c.width = w;
      c.height = h;
    }
    const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * s;
    const dh = img.naturalHeight * s;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  };

  // Scroll-linked rotation + depth once frames are ready
  useGSAP(
    () => {
      if (!ready || !root.current) return;
      const n = images.current.length;
      draw(0);
      const state = { f: 0 };
      // brief intro turn so the stage reads as 3D straight away
      gsap.fromTo(state, { f: n * 0.1 }, { f: 0, duration: 1.6, ease: "power3.out", onUpdate: () => draw(Math.round(state.f) % n) });
      ScrollTrigger.create({
        start: 0,
        end: () => heroSpan(root.current),
        scrub: 0.4,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const f = Math.round(self.progress * (n * 0.75)) % n;
          if (f !== current.current) {
            current.current = f;
            draw(f);
          }
        },
      });
      const onResize = () => draw(current.current);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    },
    { scope: root, dependencies: [ready] },
  );

  // Desktop: pin the stage briefly so it turns while the headline holds
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(PIN_QUERY, () => {
        ScrollTrigger.create({ trigger: root.current, start: "top top", end: () => `+=${window.innerHeight * PIN_RATIO}`, pin: true, pinSpacing: true, anticipatePin: 1, invalidateOnRefresh: true });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // Depth parallax and pointer float
  useGSAP(
    () => {
      if (!root.current || prefersReducedMotion()) return;
      const span = () => heroSpan(root.current);
      // explicit start state: a refresh must never re-record a hidden copy as the starting point
      gsap.fromTo(
        "[data-hero-copy]",
        { yPercent: 0, autoAlpha: 1 },
        {
          yPercent: -18,
          autoAlpha: 0.2,
          ease: "none",
          scrollTrigger: { start: 0, end: span, scrub: 0.5, invalidateOnRefresh: true },
        },
      );
      gsap.to(stage.current, {
        yPercent: 8,
        scale: 1.04,
        ease: "none",
        scrollTrigger: { start: 0, end: span, scrub: 0.6, invalidateOnRefresh: true },
      });
      gsap.utils.toArray<HTMLElement>("[data-depth]").forEach((el) => {
        const d = Number(el.dataset.depth || 1);
        gsap.to(el, { yPercent: -40 * d, ease: "none", scrollTrigger: { start: 0, end: span, scrub: 0.8, invalidateOnRefresh: true } });
      });
      gsap.from("[data-hero-fade]", { autoAlpha: 0, y: 20, duration: 1.4, stagger: 0.12, delay: 0.5, ease: "expo.out" });
      gsap.from(stage.current, { autoAlpha: 0, scale: 0.96, duration: 1.8, ease: "expo.out" });
      if (isFinePointer()) {
        const layers = gsap.utils.toArray<HTMLElement>("[data-float]");
        const move = (e: PointerEvent) => {
          const x = e.clientX / window.innerWidth - 0.5;
          const y = e.clientY / window.innerHeight - 0.5;
          layers.forEach((l) => {
            const d = Number(l.dataset.float || 1);
            gsap.to(l, { x: x * 30 * d, y: y * 22 * d, rotate: x * 4 * d, duration: 1.4, ease: "power3.out", overwrite: "auto" });
          });
        };
        window.addEventListener("pointermove", move, { passive: true });
        return () => window.removeEventListener("pointermove", move);
      }
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-[#f4f1ec] lg:min-h-[100svh]" aria-labelledby="hero-title">
      {/* stage — above the copy on phones, full-bleed behind it on large screens */}
      <div ref={stage} className="relative h-[52svh] min-h-[340px] lg:absolute lg:inset-0 lg:left-[30%] lg:h-auto">
        <div className="absolute inset-0">
          <Image
            src={frames.poster}
            alt={t(home.hero.renderNote)}
            fill
            preload
            sizes="(min-width: 1024px) 70vw, 100vw"
            quality={80}
            className="object-cover object-[50%_60%] lg:object-center"
          />
          <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 h-full w-full transition-opacity duration-700" style={{ opacity: ready ? 1 : 0 }} />
        </div>
        {/* soft vignette to merge stage with page */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_60%_50%,transparent_55%,rgba(244,241,236,0.9)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#f4f1ec] to-transparent lg:hidden" />
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-[#f4f1ec] to-transparent lg:block" />
      </div>

      {/* floating foreground cut-outs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
        <div data-depth="1.6" className="absolute right-[4%] top-[14%] w-[9vw] max-w-[150px]">
          <div data-float="1.4" className="float-soft" style={{ ["--d" as string]: "8s", ["--r" as string]: "-14deg" }}>
            <Image src="/images/hero/cutout-gloss.webp" alt="" width={450} height={600} className="h-auto w-full rotate-[-14deg] blur-[0.4px] drop-shadow-[0_30px_40px_rgba(60,40,30,0.18)]" />
          </div>
        </div>
        <div data-depth="2.2" className="absolute bottom-[8%] right-[30%] w-[7vw] max-w-[120px]">
          <div data-float="2" className="float-soft" style={{ ["--d" as string]: "9.5s", ["--r" as string]: "18deg" }}>
            <Image src="/images/hero/cutout-mascara-wand.webp" alt="" width={450} height={600} className="h-auto w-full rotate-[18deg] blur-[1.2px] drop-shadow-[0_30px_40px_rgba(60,40,30,0.18)]" />
          </div>
        </div>
      </div>

      {/* copy */}
      <div className="container-x relative z-10 flex flex-col pb-14 pt-2 lg:min-h-[100svh] lg:justify-center lg:pb-24 lg:pt-28">
        <div data-hero-copy className="max-w-[40rem]">
          <p data-hero-fade className="eyebrow">
            {t(home.hero.eyebrow)}
          </p>
          <SplitHeadline
            as="h1"
            id="hero-title"
            text={t(home.hero.title)}
            immediate
            delay={0.15}
            italic={home.hero.italic}
            className="display mt-6 text-[clamp(2.8rem,6vw,6.2rem)] [html[lang=zh-CN]_&]:text-[clamp(2.4rem,4.8vw,4.8rem)]"
          />
          <p data-hero-fade className="lede mt-6 max-w-[31rem] text-pretty">
            {t(home.hero.body)}
          </p>
          <div data-hero-fade className="mt-8 flex flex-wrap gap-3">
            <Magnetic>
              <Link href={href("/factory")} className="btn btn-primary">
                {t(ui.cta.exploreManufacturing)} <ArrowRight className="h-4 w-4" />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href={href("/products")} className="btn btn-ghost bg-porcelain/60 backdrop-blur">
                {t(ui.cta.discoverProducts)}
              </Link>
            </Magnetic>
          </div>
        </div>
        <div data-hero-fade className="mt-12 flex items-center gap-6 text-[0.7rem] uppercase tracking-[0.22em] text-muted lg:absolute lg:bottom-10 lg:left-[clamp(1rem,4vw,3.5rem)] lg:mt-0">
          <span className="flex items-center gap-2">
            <ArrowDown className="float-soft h-3.5 w-3.5" style={{ ["--d" as string]: "3s" }} /> {t(ui.misc.scroll)}
          </span>
          <span className="hidden sm:inline">{t(home.hero.location)}</span>
        </div>
        <p data-hero-fade className="absolute bottom-4 right-[clamp(1rem,4vw,3.5rem)] hidden text-[0.65rem] tracking-[0.08em] text-muted/80 lg:block">
          {t(home.hero.renderNote)} · {t(home.hero.rotate)}
        </p>
      </div>
    </section>
  );
}
