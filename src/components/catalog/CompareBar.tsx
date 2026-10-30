"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { GitCompareArrows, X } from "lucide-react";
import { productBySlug, productPath, type Product } from "@/data/products";
import { categories, features, productTypes, tips } from "@/data/taxonomy";
import { useHref, useT } from "@/i18n/locale-context";
import { ui } from "@/content/ui";
import { useInquiry } from "@/store/inquiry";
import { Dialog } from "@/components/ui/Dialog";
import { useHydrated } from "./ProductCard";
import { AddToInquiryButton } from "./AddToInquiryButton";

export function CompareBar() {
  const t = useT();
  const href = useHref();
  const hydrated = useHydrated();
  const compare = useInquiry((s) => s.compare);
  const toggle = useInquiry((s) => s.toggleCompare);
  const clear = useInquiry((s) => s.clearCompare);
  const [open, setOpen] = useState(false);
  const list = compare.map((s) => productBySlug.get(s)).filter(Boolean) as Product[];
  if (!hydrated || list.length === 0) return null;

  const rows: { label: string; get: (p: Product) => string }[] = [
    { label: t(ui.catalog.model), get: (p) => p.model },
    { label: t(ui.catalog.category), get: (p) => t(categories[p.category].name) },
    { label: t(ui.catalog.type), get: (p) => t(productTypes[p.type]) },
    { label: t(ui.catalog.tips), get: (p) => p.tips.map((x) => t(tips[x])).join(", ") },
    { label: t(ui.catalog.dimensions), get: (p) => p.size },
    { label: t(ui.catalog.capacity), get: (p) => (p.capacity ? t(p.capacity) : "—") },
    { label: t(ui.catalog.features), get: (p) => (p.features.length ? p.features.map((x) => t(features[x])).join(", ") : "—") },
  ];

  return (
    <>
      <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4" data-no-print>
        <div className="flex items-center gap-3 rounded-full bg-ink py-2 pl-3 pr-2 text-porcelain shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
          <div className="flex -space-x-2">
            {list.map((p) => (
              <span key={p.slug} className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-ink bg-white">
                <Image src={p.image} alt="" fill sizes="40px" className="object-cover" />
              </span>
            ))}
          </div>
          <span className="hidden text-sm sm:inline">
            {t(ui.cta.comparing)} {list.length}/3
          </span>
          <button type="button" onClick={() => setOpen(true)} className="btn btn-light btn-sm">
            <GitCompareArrows className="h-3.5 w-3.5" /> {t(ui.cta.compare)}
          </button>
          <button type="button" onClick={clear} aria-label={t(ui.cta.clear)} className="rounded-full p-2 hover:bg-porcelain/10">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} label={t(ui.catalog.compareTitle)} closeLabel={t(ui.nav.close)}>
        <div className="p-6 sm:p-10">
          <h2 className="display text-3xl sm:text-4xl">{t(ui.catalog.compareTitle)}</h2>
          <p className="mt-2 text-sm text-muted">{t(ui.catalog.compareHint)}</p>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr>
                  <th scope="col" className="w-40" />
                  {list.map((p) => (
                    <th key={p.slug} scope="col" className="p-3 align-top font-normal">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-white ring-1 ring-ink/[0.06]">
                        <Image src={p.image} alt="" fill sizes="240px" className="object-cover" />
                        <button type="button" onClick={() => toggle(p.slug)} aria-label={`${t(ui.cta.remove)}: ${t(p.name)}`} className="absolute right-2 top-2 rounded-full bg-porcelain/90 p-1.5">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <Link href={href(productPath(p))} onClick={() => setOpen(false)} className="mt-3 block font-medium link-underline w-fit">
                        <span className="block font-mono text-xs text-muted">{p.model}</span>
                        {t(p.name)}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-t hairline">
                    <th scope="row" className="p-3 align-top text-xs font-medium uppercase tracking-[0.12em] text-muted">
                      {r.label}
                    </th>
                    {list.map((p) => (
                      <td key={p.slug} className="p-3 align-top">
                        {r.get(p)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t hairline">
                  <td />
                  {list.map((p) => (
                    <td key={p.slug} className="p-3">
                      <AddToInquiryButton product={p} className="btn-sm w-full" />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Dialog>
    </>
  );
}
