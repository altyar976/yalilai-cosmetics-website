"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowUpRight, Expand } from "lucide-react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { factoryPhotoById, factoryPhotos, type FactoryPhoto } from "@/data/factory-photos";
import { useHref, useT } from "@/i18n/locale-context";
import { home } from "@/content/home";
import { ui } from "@/content/ui";
import { Lightbox } from "@/components/factory/Lightbox";
import { cn } from "@/lib/utils";

const columns: { ids: string[]; speed: number; offset: string }[] = [
  { ids: ["reception", "assembly-feeders", "corridor", "meeting-room"], speed: 0, offset: "lg:pt-0" },
  { ids: ["workshop-wide", "hand-finishing", "packaging-machine", "corridor-2"], speed: -14, offset: "lg:pt-40" },
  { ids: ["production-hall", "changing-rooms", "assembly-operator", "assembly-workshop"], speed: 9, offset: "lg:pt-16" },
];

/** "Inside our factory": every authentic client photograph, in a parallax collage with lightbox. */
export function FactoryGallery() {
  const t = useT();
  const href = useHref();
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-col]").forEach((col) => {
          const s = Number(col.dataset.col);
          if (!s) return;
          gsap.fromTo(col, { yPercent: -s / 2 }, { yPercent: s / 2, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.8 } });
        });
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-tile]").forEach((tile) => {
          gsap.fromTo(
            tile,
            { clipPath: "inset(18% 0% 0% 0% round 1.25rem)" },
            { clipPath: "inset(0% 0% 0% 0% round 1.25rem)", duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: tile, start: "top 92%", once: true } },
          );
          const img = tile.querySelector("img");
          if (img) gsap.fromTo(img, { scale: 1.25 }, { scale: 1, duration: 2, ease: "expo.out", scrollTrigger: { trigger: tile, start: "top 92%", once: true } });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const tile = (p: FactoryPhoto) => {
    const idx = factoryPhotos.findIndex((x) => x.id === p.id);
    const landscape = p.w > p.h;
    return (
      <button
        key={p.id}
        type="button"
        data-tile
        data-cursor={t(ui.misc.openImage).split(" ")[0]}
        onClick={() => setOpen(idx)}
        className={cn("group relative block w-full overflow-hidden rounded-[1.25rem] bg-graphite text-left", landscape ? "aspect-[16/10]" : "aspect-[4/5]")}
        aria-label={`${t(ui.misc.openImage)}: ${t(p.title)}`}
      >
        <Image
          src={p.src}
          alt={t(p.alt)}
          fill
          sizes="(min-width: 1024px) 31vw, 48vw"
          quality={72}
          placeholder={p.blur ? "blur" : "empty"}
          blurDataURL={p.blur}
          className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-luxe)] group-hover:scale-[1.06]"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 transition-opacity duration-700 group-hover:opacity-100" />
        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
          <span>
            <span className="block text-[0.62rem] uppercase tracking-[0.2em] text-champagne">{t(p.area)}</span>
            <span className="mt-1 block text-sm font-medium text-porcelain sm:text-base">{t(p.title)}</span>
          </span>
          <Expand className="h-4 w-4 shrink-0 text-porcelain/80 opacity-0 transition duration-500 group-hover:opacity-100" />
        </span>
      </button>
    );
  };

  return (
    <section ref={root} className="relative overflow-hidden bg-ink py-24 text-porcelain lg:py-36" aria-labelledby="factory-title">
      <div className="container-x">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow !text-champagne">{t(home.factory.eyebrow)}</p>
            <SplitHeadline id="factory-title" text={t(home.factory.title)} className="display mt-5 text-[clamp(2.4rem,5vw,5rem)]" />
          </div>
          <div className="lg:col-span-5 lg:pb-2">
            <p className="lede !text-porcelain/80">{t(home.factory.body)}</p>
            <Link href={href("/factory")} className="btn btn-light mt-8">
              {t(ui.cta.tour)} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6 lg:pb-44">
          {columns.map((c, ci) => (
            <div key={ci} data-col={c.speed} className={cn("flex flex-col gap-3 sm:gap-5 lg:gap-6", c.offset, ci === 2 && "col-span-2 grid grid-cols-2 lg:col-span-1 lg:flex")}>
              {c.ids.map((id) => tile(factoryPhotoById.get(id)!))}
            </div>
          ))}
        </div>
        <p className="mt-14 max-w-3xl text-xs leading-relaxed text-porcelain/50">{t(home.factory.provenance)}</p>
      </div>
      <Lightbox photos={factoryPhotos} index={open} onClose={() => setOpen(null)} />
    </section>
  );
}
