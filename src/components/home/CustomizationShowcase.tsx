"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, useGSAP, prefersReducedMotion } from "@/components/motion/gsap";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { ProductImage } from "@/components/ui/ProductImage";
import { productByModel, productPath, type Product } from "@/data/products";
import type { L } from "@/data/taxonomy";
import { useHref, useT } from "@/i18n/locale-context";
import { home } from "@/content/home";
import { ui } from "@/content/ui";
import { cn } from "@/lib/utils";

type Tab = keyof typeof home.showcase.tabs;
type Option = { label: L; model: string };

/** Each option points at a real catalogue model that shows the detail. */
const groups: Record<Tab, Option[]> = {
  tips: [
    { label: home.showcase.labels.fineBrush, model: "YD-098" },
    { label: home.showcase.labels.multiProng, model: "YD-033" },
    { label: home.showcase.labels.angled, model: "YD-094" },
    { label: home.showcase.labels.hooked, model: "YD-071" },
    { label: home.showcase.labels.stamp, model: "YD-074-2" },
  ],
  barrels: [
    { label: home.showcase.labels.aluminium, model: "YD-077" },
    { label: home.showcase.labels.square, model: "YD-066-1" },
    { label: home.showcase.labels.glitter, model: "YD-035" },
    { label: home.showcase.labels.crystal, model: "YD-089" },
    { label: home.showcase.labels.sculpted, model: "YD-091" },
  ],
  formats: [
    { label: home.showcase.labels.retractable, model: "YD-017T" },
    { label: home.showcase.labels.gel, model: "YD-128-3" },
    { label: home.showcase.labels.dual, model: "YD-067-4" },
    { label: home.showcase.labels.dip, model: "YD-306" },
    { label: home.showcase.labels.refillable, model: "YD-062" },
  ],
};

export function CustomizationShowcase() {
  const t = useT();
  const href = useHref();
  const root = useRef<HTMLElement>(null);
  const [tab, setTab] = useState<Tab>("tips");
  const [active, setActive] = useState(0);

  const options = groups[tab].map((o) => ({ ...o, product: productByModel.get(o.model) as Product }));
  const current = options[Math.min(active, options.length - 1)];

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-sc-panel]", {
        y: 60,
        autoAlpha: 0,
        duration: 1.3,
        ease: "expo.out",
        stagger: 0.12,
        scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative bg-linen py-24 lg:py-36" aria-labelledby="showcase-title">
      <div className="container-x">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow">{t(home.showcase.eyebrow)}</p>
            <SplitHeadline id="showcase-title" text={t(home.showcase.title)} className="display mt-5 text-[clamp(2.4rem,5vw,5rem)]" />
          </div>
          <p className="lede lg:col-span-5 lg:pb-2">{t(home.showcase.body)}</p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div data-sc-panel className="relative lg:col-span-7">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-ink/[0.06] sm:aspect-square lg:aspect-[4/4.4]">
              {(Object.keys(groups) as Tab[]).flatMap((k) =>
                groups[k].map((o) => {
                  const p = productByModel.get(o.model)!;
                  const shown = p.model === current.product.model;
                  return (
                    <div key={`${k}-${o.model}`} className={cn("absolute inset-0 transition-[opacity,transform] duration-[900ms] ease-[var(--ease-luxe)]", shown ? "scale-100 opacity-100" : "scale-[1.03] opacity-0")} aria-hidden={!shown}>
                      {(k === tab || shown) && <ProductImage src={p.image} alt={shown ? `${t(p.name)} — ${p.model}` : ""} sizes="(min-width: 1024px) 56vw, 100vw" className="!object-contain" />}
                    </div>
                  );
                }),
              )}
              <span className="absolute left-4 top-4 rounded-full bg-ivory/90 px-3 py-1.5 font-mono text-xs tracking-[0.08em]">{current.product.model}</span>
            </div>
          </div>

          <div data-sc-panel className="lg:col-span-5">
            <div role="tablist" aria-label={t(home.showcase.eyebrow)} className="flex flex-wrap gap-x-6 gap-y-2 border-b hairline">
              {(Object.keys(groups) as Tab[]).map((k) => (
                <button
                  key={k}
                  role="tab"
                  type="button"
                  id={`sc-tab-${k}`}
                  aria-selected={tab === k}
                  aria-controls="sc-panel"
                  onClick={() => {
                    setTab(k);
                    setActive(0);
                  }}
                  className={cn("relative -mb-px pb-3 text-sm transition-colors", tab === k ? "text-ink" : "text-muted hover:text-ink")}
                >
                  {t(home.showcase.tabs[k])}
                  <span className={cn("absolute inset-x-0 bottom-0 h-px origin-left bg-ink transition-transform duration-500 ease-[var(--ease-luxe)]", tab === k ? "scale-x-100" : "scale-x-0")} />
                </button>
              ))}
            </div>

            <div id="sc-panel" role="tabpanel" aria-labelledby={`sc-tab-${tab}`} className="pt-8">
              <ul className="space-y-2">
                {options.map((o, i) => (
                  <li key={o.model}>
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-pressed={i === active}
                      className={cn("flex w-full items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition duration-500", i === active ? "border-ink bg-porcelain" : "border-transparent hover:bg-porcelain/60")}
                    >
                      <span className="w-9 shrink-0 font-[family-name:var(--font-display)] text-lg text-champagne-deep">{String(i + 1).padStart(2, "0")}</span>
                      <span className="flex-1">
                        <span className="block font-medium">{t(o.label)}</span>
                        <span className="block text-xs text-muted">
                          {o.product.model} · {t(o.product.name)}
                        </span>
                      </span>
                      <ArrowRight className={cn("h-4 w-4 transition", i === active ? "opacity-100" : "opacity-0")} />
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs leading-relaxed text-muted">{t(home.showcase.note)}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={href(productPath(current.product))} className="btn btn-primary">
                  {t(ui.cta.viewDetails)}
                </Link>
                <Link href={href("/products")} className="btn btn-ghost">
                  {t(ui.cta.viewAll)}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
