"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { type Product, productPath } from "@/data/products";
import { categories, features, productTypes, tips } from "@/data/taxonomy";
import { useHref, useT } from "@/i18n/locale-context";
import { ui } from "@/content/ui";
import { Dialog } from "@/components/ui/Dialog";
import { ProductImage } from "@/components/ui/ProductImage";
import { AddToInquiryButton } from "./AddToInquiryButton";

export function QuickView({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const t = useT();
  return (
    <Dialog open={!!product} onClose={onClose} label={product ? `${product.model} ${t(product.name)}` : ""} closeLabel={t(ui.nav.close)}>
      {product && <QuickViewBody key={product.slug} product={product} onClose={onClose} />}
    </Dialog>
  );
}

function QuickViewBody({ product, onClose }: { product: Product; onClose: () => void }) {
  const t = useT();
  const href = useHref();
  const rows = [
    { k: t(ui.catalog.type), v: t(productTypes[product.type]) },
    { k: t(ui.catalog.tips), v: product.tips.map((x) => t(tips[x])).join(" · ") },
    { k: t(ui.catalog.dimensions), v: product.size },
    ...(product.capacity ? [{ k: t(ui.catalog.capacity), v: t(product.capacity) }] : []),
    ...(product.features.length ? [{ k: t(ui.catalog.features), v: product.features.map((x) => t(features[x])).join(" · ") }] : []),
  ];
  return (
    <div className="grid md:grid-cols-2">
      <div className="relative aspect-[4/5] bg-white md:aspect-auto md:min-h-[640px]">
        <ProductImage src={product.image} alt={`${t(product.name)} — ${t(ui.catalog.model)} ${product.model}`} sizes="(min-width: 768px) 550px, 100vw" className="animate-[fadein_0.6s_ease]" />
      </div>
      <div className="flex flex-col p-6 sm:p-10">
        <p className="eyebrow">{t(categories[product.category].name)}</p>
        <p className="mt-4 font-mono text-sm tracking-[0.08em] text-champagne-deep">{product.model}</p>
        <h2 className="display mt-1 text-4xl">{t(product.name)}</h2>
        <p className="mt-6 leading-relaxed text-graphite">{t(product.description)}</p>
        <dl className="mt-7 divide-y divide-ink/10 border-y hairline text-sm">
          {rows.map((r) => (
            <div key={r.k} className="grid grid-cols-3 gap-3 py-3">
              <dt className="text-muted">{r.k}</dt>
              <dd className="col-span-2">{r.v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-auto flex flex-col gap-3 pt-8 sm:flex-row">
          <AddToInquiryButton product={product} className="flex-1" />
          <Link href={href(productPath(product))} onClick={onClose} className="btn btn-ghost flex-1">
            {t(ui.cta.viewDetails)} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <p className="mt-5 text-xs leading-relaxed text-muted">{t(ui.reference.disclaimer)}</p>
      </div>
    </div>
  );
}
