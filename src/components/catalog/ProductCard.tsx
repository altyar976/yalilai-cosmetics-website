"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { Heart, Plus, Eye, GitCompareArrows, Check } from "lucide-react";
import { type Product, productPath } from "@/data/products";
import { categories } from "@/data/taxonomy";
import { useHref, useT } from "@/i18n/locale-context";
import { ui } from "@/content/ui";
import { useInquiry } from "@/store/inquiry";
import { ProductImage } from "@/components/ui/ProductImage";
import { announceAdded } from "@/components/inquiry/InquiryToast";
import { cn } from "@/lib/utils";

type Props = {
  product: Product;
  onQuickView?: (p: Product) => void;
  priority?: boolean;
  sizes?: string;
  className?: string;
  compact?: boolean;
};

const noopSubscribe = () => () => {};

/** false during SSR and the hydration pass, true afterwards — without an effect. */
export function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export function ProductCard({ product, onQuickView, priority, sizes, className, compact }: Props) {
  const t = useT();
  const href = useHref();
  const hydrated = useHydrated();
  const shortlisted = useInquiry((s) => s.shortlist.includes(product.slug));
  const comparing = useInquiry((s) => s.compare.includes(product.slug));
  const inInquiry = useInquiry((s) => s.items.some((i) => i.slug === product.slug));
  const toggleShortlist = useInquiry((s) => s.toggleShortlist);
  const toggleCompare = useInquiry((s) => s.toggleCompare);
  const add = useInquiry((s) => s.add);
  const [compareFull, setCompareFull] = useState(false);
  const url = href(productPath(product));
  const label = `${product.model} ${t(product.name)}`;

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-white ring-1 ring-ink/[0.06] transition-shadow duration-700 group-hover:shadow-[0_30px_60px_-34px_rgba(23,21,19,0.35)]">
        <Link href={url} aria-label={label} className="absolute inset-0 z-[1]" tabIndex={-1} data-cursor={t(ui.cta.viewDetails).split(" ")[0]} />
        <ProductImage
          src={product.image}
          alt={`${t(product.name)} — ${t(ui.catalog.model)} ${product.model}`}
          sizes={sizes ?? "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"}
          priority={priority}
          className="transition-transform duration-[1.1s] ease-[var(--ease-luxe)] group-hover:scale-[1.035]"
        />
        <span className="pointer-events-none absolute left-3 top-3 z-[2] rounded-full bg-ivory/90 px-2.5 py-1 font-mono text-[0.68rem] tracking-[0.08em] text-ink">{product.model}</span>
        <div className="absolute right-3 top-3 z-[2] flex flex-col gap-2">
          <button
            type="button"
            onClick={() => toggleShortlist(product.slug)}
            aria-pressed={hydrated && shortlisted}
            aria-label={`${t(shortlisted ? ui.cta.shortlisted : ui.cta.shortlist)}: ${label}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-porcelain/85 backdrop-blur transition hover:bg-porcelain"
          >
            <Heart className={cn("h-4 w-4", hydrated && shortlisted && "fill-ink")} strokeWidth={1.5} />
          </button>
          {!compact && (
            <button
              type="button"
              onClick={() => {
                const ok = toggleCompare(product.slug);
                setCompareFull(!ok);
                if (!ok) window.setTimeout(() => setCompareFull(false), 2000);
              }}
              aria-pressed={hydrated && comparing}
              aria-label={`${t(ui.cta.compare)}: ${label}`}
              title={compareFull ? t(ui.catalog.compareHint) : undefined}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition",
                hydrated && comparing ? "bg-ink text-porcelain" : "bg-porcelain/85 hover:bg-porcelain",
                compareFull && "ring-2 ring-danger",
              )}
            >
              <GitCompareArrows className="h-4 w-4" strokeWidth={1.5} />
            </button>
          )}
        </div>
        <div className="absolute inset-x-2 bottom-2 z-[2] flex justify-end gap-2 transition duration-500 ease-[var(--ease-luxe)] sm:inset-x-3 sm:bottom-3 sm:justify-stretch md:translate-y-2 md:opacity-0 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100">
          {onQuickView && (
            <button
              type="button"
              onClick={() => onQuickView(product)}
              aria-label={`${t(ui.cta.quickView)}: ${label}`}
              className="btn btn-light btn-sm h-10 w-10 !min-h-0 !p-0 shadow-sm sm:h-auto sm:w-auto sm:flex-1 sm:!min-h-[2.5rem] sm:!px-3"
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t(ui.cta.quickView)}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              add({ kind: "product", slug: product.slug, model: product.model, title: product.name, image: product.image });
              announceAdded({ title: product.name, image: product.image });
            }}
            className="btn btn-primary btn-sm h-10 w-10 !min-h-0 !p-0 sm:h-auto sm:w-auto sm:flex-1 sm:!min-h-[2.5rem] sm:!px-3"
            aria-label={`${t(ui.cta.addToInquiry)}: ${label}`}
          >
            {hydrated && inInquiry ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            <span className="hidden truncate sm:inline">{t(ui.cta.addToInquiry)}</span>
          </button>
        </div>
      </div>
      <div className="mt-4 px-1">
        <p className="text-[0.68rem] uppercase tracking-[0.2em] text-muted">{t(categories[product.category].short)}</p>
        <h3 className="mt-1.5 text-[1.02rem] font-medium leading-snug">
          <Link href={url} className="link-underline">
            {t(product.name)}
          </Link>
        </h3>
        {!compact && <p className="mt-1 text-sm text-muted">{product.size}</p>}
      </div>
    </article>
  );
}
