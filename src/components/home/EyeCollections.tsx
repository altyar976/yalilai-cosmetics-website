"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, useGSAP, prefersReducedMotion } from "@/components/motion/gsap";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { ProductImage } from "@/components/ui/ProductImage";
import { collectionCover, productPath, productsInCollection } from "@/data/products";
import { collectionIds, collections } from "@/data/taxonomy";
import { useHref, useT } from "@/i18n/locale-context";
import { home } from "@/content/home";

/** Headline Eyebrow + Eyeliner collections, directly under the hero. */
export function EyeCollections() {
  const t = useT();
  const href = useHref();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-ec-panel]", {
        clipPath: "inset(10% 6% 10% 6% round 1.75rem)",
        autoAlpha: 0,
        duration: 1.5,
        ease: "expo.out",
        stagger: 0.14,
        scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
      });
      gsap.utils.toArray<HTMLElement>("[data-ec-img]").forEach((el) => {
        gsap.fromTo(el, { yPercent: 4 }, { yPercent: -4, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 } });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="bg-ivory py-24 lg:py-32" aria-labelledby="ec-title">
      <div className="container-x">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow">{t(home.collections.eyebrow)}</p>
            <SplitHeadline id="ec-title" text={t(home.collections.title)} className="display mt-5 text-[clamp(2.4rem,4.8vw,4.8rem)]" />
          </div>
          <p className="lede lg:col-span-5 lg:pb-2">{t(home.collections.body)}</p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {collectionIds.map((id) => {
            const c = collections[id];
            const list = productsInCollection(id);
            const cover = collectionCover(id)!;
            const minis = list.filter((p) => p.featured && p.slug !== cover.slug).concat(list.filter((p) => !p.featured)).slice(0, 4);
            return (
              <article key={id} data-ec-panel className="group relative flex flex-col overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-ink/[0.06]">
                <Link href={href(`/products/${id}`)} className="absolute inset-0 z-[1]" aria-label={`${t(c.name)} — ${t(home.collections.explore)}`} />
                <div className="relative aspect-[5/4] overflow-hidden sm:aspect-[16/11]">
                  <div data-ec-img className="absolute inset-[-4%]">
                    <ProductImage src={cover.image} alt={`${t(cover.name)} — ${cover.model}`} sizes="(min-width: 1024px) 46vw, 100vw" className="!object-contain transition-transform duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-[1.04]" />
                  </div>
                  <span className="absolute left-5 top-5 rounded-full bg-ivory/90 px-3 py-1.5 text-xs text-muted">
                    {list.length} {t(home.collections.models)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-6 border-t hairline p-6 sm:p-8">
                  <div className="flex items-end justify-between gap-6">
                    <div>
                      <h3 className="display text-[clamp(2rem,3vw,3rem)]">{t(c.name)}</h3>
                      <p className="mt-2 text-sm text-muted">{t(c.tagline)}</p>
                    </div>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border hairline transition duration-500 group-hover:bg-ink group-hover:text-porcelain">
                      <ArrowUpRight className="h-5 w-5" />
                    </span>
                  </div>
                  <ul className="relative z-[2] grid grid-cols-4 gap-2 sm:gap-3">
                    {minis.map((p) => (
                      <li key={p.slug}>
                        <Link href={href(productPath(p))} className="block" aria-label={`${p.model} ${t(p.name)}`}>
                          <span className="relative block aspect-[4/5] overflow-hidden rounded-xl bg-white ring-1 ring-ink/[0.06] transition hover:ring-ink/30">
                            <Image src={p.image} alt="" fill sizes="(min-width: 1024px) 10vw, 22vw" className="object-cover" />
                          </span>
                          <span className="mt-1.5 block truncate font-mono text-[0.65rem] text-muted">{p.model}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
