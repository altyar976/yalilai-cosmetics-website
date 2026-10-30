"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { products, type Product } from "@/data/products";
import { categories, collections, type CategoryId, type L } from "@/data/taxonomy";
import { useHref, useT } from "@/i18n/locale-context";
import { home } from "@/content/home";
import { ui } from "@/content/ui";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { ProductCard } from "@/components/catalog/ProductCard";
import { QuickView } from "@/components/catalog/QuickView";
import { cn } from "@/lib/utils";

const filters: { id: string; label: L; cats: CategoryId[] }[] = [
  { id: "all", label: home.carousel.all, cats: [] },
  { id: "eyebrow", label: collections.eyebrow.name, cats: collections.eyebrow.categories },
  { id: "eyeliner", label: collections.eyeliner.name, cats: collections.eyeliner.categories },
  { id: "dual", label: categories["dual-ended-pens"].short, cats: ["dual-ended-pens"] },
  { id: "lips", label: categories["lip-liners-pens"].short, cats: ["lip-liners-pens"] },
  { id: "face", label: categories["face-specialty-pens"].short, cats: ["face-specialty-pens"] },
];

export function ProductCarousel() {
  const t = useT();
  const href = useHref();
  const [filter, setFilter] = useState("all");
  const [quick, setQuick] = useState<Product | null>(null);
  const scroller = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const list = useMemo(() => {
    const f = filters.find((x) => x.id === filter)!;
    const base = f.cats.length
      ? products.filter((p) => f.cats.includes(p.category)).sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
      : products.filter((p) => p.featured);
    return base.slice(0, 12);
  }, [filter]);

  const update = () => {
    const el = scroller.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  };
  useEffect(() => {
    scroller.current?.scrollTo({ left: 0, behavior: "instant" as ScrollBehavior });
    update();
  }, [filter]);

  const page = (d: number) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: d * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="bg-ivory py-24 lg:py-36" aria-labelledby="carousel-title">
      <div className="container-x">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">{t(home.carousel.eyebrow)}</p>
            <SplitHeadline id="carousel-title" text={t(home.carousel.title)} className="display mt-5 text-[clamp(2.4rem,4.6vw,4.6rem)]" />
          </div>
          <div className="flex flex-col gap-5 lg:items-end">
            <div role="group" aria-label={t(ui.catalog.filters)} className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button key={f.id} type="button" className="chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                  {t(f.label)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Link href={href("/products")} className="mr-3 inline-flex items-center gap-2 text-sm font-medium link-underline">
                {t(ui.cta.viewAll)} <ArrowUpRight className="h-4 w-4" />
              </Link>
              <button type="button" onClick={() => page(-1)} disabled={edge.start} aria-label={t(ui.misc.previous)} className="flex h-11 w-11 items-center justify-center rounded-full border hairline transition hover:border-ink disabled:opacity-30">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => page(1)} disabled={edge.end} aria-label={t(ui.misc.nextImage)} className="flex h-11 w-11 items-center justify-center rounded-full border hairline transition hover:border-ink disabled:opacity-30">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <ul
        ref={scroller}
        onScroll={update}
        className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-[clamp(1rem,4vw,3.5rem)] px-[clamp(1rem,4vw,3.5rem)] pb-4 lg:gap-7"
      >
        {list.map((p) => (
          <li key={`${filter}-${p.slug}`} className={cn("w-[70vw] shrink-0 snap-start sm:w-[42vw] lg:w-[26vw] xl:w-[22vw]", "animate-[fadein_0.8s_var(--ease-luxe)_both]")}>
            <ProductCard product={p} onQuickView={setQuick} sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 26vw, 70vw" />
          </li>
        ))}
      </ul>
      <QuickView product={quick} onClose={() => setQuick(null)} />
    </section>
  );
}
