"use client";

import Image from "next/image";
import { useState } from "react";
import { Expand } from "lucide-react";
import { factoryPhotoById, factoryPhotos } from "@/data/factory-photos";
import { factoryPage } from "@/content/pages";
import { useT } from "@/i18n/locale-context";
import { ui } from "@/content/ui";
import { Reveal } from "@/components/motion/Reveal";
import { Lightbox } from "./Lightbox";
import { cn } from "@/lib/utils";

/** Zone-by-zone tour of the authentic factory photographs with a shared lightbox. */
export function FactoryTour() {
  const t = useT();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      {factoryPage.zones.map((z, zi) => (
        <section key={z.id} className={cn("py-16 lg:py-24", zi % 2 === 1 && "bg-linen")} aria-labelledby={`zone-${z.id}`}>
          <div className="container-x grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <p className="font-[family-name:var(--font-display)] text-2xl text-champagne-deep">{String(zi + 1).padStart(2, "0")}</p>
              <h2 id={`zone-${z.id}`} className="display mt-3 text-4xl lg:text-5xl">
                {t(z.title)}
              </h2>
              <p className="mt-5 leading-relaxed text-graphite">{t(z.body)}</p>
            </Reveal>
            <Reveal className={cn("grid gap-4 lg:col-span-8", z.ids.length >= 3 ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2")} stagger={0.1}>
              {z.ids.map((id) => {
                const p = factoryPhotoById.get(id)!;
                const idx = factoryPhotos.findIndex((x) => x.id === id);
                const land = p.w > p.h;
                return (
                  <figure key={id} data-reveal-item className={cn(land && z.ids.length > 2 && "col-span-2", land && z.ids.length <= 2 && "col-span-2 lg:col-span-1")}>
                    <button
                      type="button"
                      onClick={() => setOpen(idx)}
                      className={cn("group relative block w-full overflow-hidden rounded-[1.25rem] bg-graphite", land ? "aspect-[16/10]" : "aspect-[4/5]")}
                      aria-label={`${t(ui.misc.openImage)}: ${t(p.title)}`}
                      data-cursor={t(ui.misc.openImage).split(" ")[0]}
                    >
                      <Image
                        src={p.src}
                        alt={t(p.alt)}
                        fill
                        sizes="(min-width: 1024px) 30vw, 50vw"
                        className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-105"
                        placeholder={p.blur ? "blur" : "empty"}
                        blurDataURL={p.blur}
                      />
                      <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-porcelain/80 opacity-0 backdrop-blur transition group-hover:opacity-100">
                        <Expand className="h-4 w-4" />
                      </span>
                    </button>
                    <figcaption className="mt-3 text-sm">
                      <span className="font-medium">{t(p.title)}</span>
                      <span className="block text-muted">{t(p.caption)}</span>
                    </figcaption>
                  </figure>
                );
              })}
            </Reveal>
          </div>
        </section>
      ))}
      <Lightbox photos={factoryPhotos} index={open} onClose={() => setOpen(null)} />
    </>
  );
}
