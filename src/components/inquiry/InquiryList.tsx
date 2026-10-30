"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Printer, Trash2, Wand2 } from "lucide-react";
import { productBySlug, productPath, type Product } from "@/data/products";
import { categories, colorways, requestOptions } from "@/data/taxonomy";
import { company } from "@/data/company";
import { useHref, useT } from "@/i18n/locale-context";
import { ui } from "@/content/ui";
import { useInquiry } from "@/store/inquiry";
import { useHydrated } from "@/components/catalog/ProductCard";
import { RelatedGrid } from "@/components/catalog/RelatedGrid";

export function InquiryList() {
  const t = useT();
  const href = useHref();
  const hydrated = useHydrated();
  const items = useInquiry((s) => s.items);
  const update = useInquiry((s) => s.update);
  const remove = useInquiry((s) => s.remove);
  const clear = useInquiry((s) => s.clear);
  const shortlist = useInquiry((s) => s.shortlist);

  if (!hydrated) return <div className="h-64 animate-pulse rounded-3xl bg-linen" aria-busy="true" aria-label={t(ui.misc.loading)} />;

  return (
    <div>
      {items.length === 0 ? (
        <div className="card-surface flex flex-col items-start gap-6 p-8 sm:p-12">
          <p className="max-w-xl text-lg">{t(ui.inquiry.empty)}</p>
          <div className="flex flex-wrap gap-3">
            <Link href={href("/products")} className="btn btn-primary">
              {t(ui.cta.discoverProducts)}
            </Link>
            <Link href={href("/customization-studio")} className="btn btn-ghost">
              <Wand2 className="h-4 w-4" /> {t(ui.cta.openStudio)}
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4" data-no-print>
            <p className="text-sm text-muted">
              {items.length} {t(ui.inquiry.count)} · {t(ui.inquiry.savedLocally)}
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => window.print()} className="btn btn-ghost btn-sm">
                <Printer className="h-3.5 w-3.5" /> {t(ui.cta.print)}
              </button>
              <button type="button" onClick={clear} className="btn btn-ghost btn-sm">
                <Trash2 className="h-3.5 w-3.5" /> {t(ui.cta.clear)}
              </button>
            </div>
          </div>
          <div className="hidden print:block">
            <p className="text-2xl">YALILAI · {t(ui.inquiry.summary)}</p>
            <p className="text-sm">
              {company.nameEn} · {company.nameZh} · {company.phoneDisplay} · WeChat {company.wechatId}
            </p>
            <p className="mb-6 text-sm">{new Date().toLocaleDateString()}</p>
          </div>
          <ul className="divide-y divide-ink/10 border-y hairline">
            {items.map((i) => {
              const p: Product | undefined = i.slug ? productBySlug.get(i.slug) : undefined;
              return (
                <li key={i.id} className="grid grid-cols-[88px_1fr] gap-5 py-6 sm:grid-cols-[120px_1fr_auto] break-inside-avoid">
                  <div className={`relative aspect-[4/5] overflow-hidden rounded-2xl ${i.kind === "studio" ? "bg-render" : "bg-white ring-1 ring-ink/[0.06]"}`}>
                    {i.preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={i.preview} alt="" className="h-full w-full object-cover" />
                    ) : i.image ? (
                      <Image src={i.image} alt="" fill sizes="120px" className="object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted">
                      {i.kind === "studio" ? t(ui.inquiry.custom) : p ? t(categories[p.category].name) : ""}
                    </p>
                    <p className="mt-1 text-lg font-medium">
                      {i.model && <span className="mr-2 font-mono text-sm text-champagne-deep">{i.model}</span>}
                      {p ? (
                        <Link href={href(productPath(p))} className="link-underline">
                          {t(i.title)}
                        </Link>
                      ) : (
                        t(i.title)
                      )}
                    </p>
                    <dl className="mt-2 space-y-1 text-sm text-graphite">
                      {i.requests && i.requests.length > 0 && (
                        <div className="flex gap-2">
                          <dt className="text-muted">{t(ui.catalog.requests)}:</dt>
                          <dd>{i.requests.map((r) => t(requestOptions[r])).join(" · ")}</dd>
                        </div>
                      )}
                      {i.quantity && (
                        <div className="flex gap-2">
                          <dt className="text-muted">{t(ui.catalog.quantity)}:</dt>
                          <dd>{i.quantity}</dd>
                        </div>
                      )}
                      {i.colorway && (
                        <div className="flex gap-2">
                          <dt className="text-muted">{t(ui.catalog.colorways)}:</dt>
                          <dd>{t(colorways[i.colorway].name)}</dd>
                        </div>
                      )}
                      {i.shade && (
                        <div className="flex gap-2">
                          <dt className="text-muted">{t(ui.catalog.selectedShade)}:</dt>
                          <dd>{t(i.shade)}</dd>
                        </div>
                      )}
                      {i.lines?.map((l, k) => (
                        <div key={k}>{t(l)}</div>
                      ))}
                    </dl>
                    <label className="mt-3 block" data-no-print>
                      <span className="sr-only">{t(ui.catalog.notes)}</span>
                      <textarea
                        value={i.notes ?? ""}
                        onChange={(e) => update(i.id, { notes: e.target.value })}
                        rows={2}
                        maxLength={600}
                        placeholder={t(ui.catalog.notes)}
                        className="field resize-y !py-2 text-sm"
                      />
                    </label>
                    {i.notes && <p className="mt-2 hidden text-sm print:block">“{i.notes}”</p>}
                  </div>
                  <div className="col-span-2 sm:col-span-1" data-no-print>
                    <button type="button" onClick={() => remove(i.id)} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
                      <Trash2 className="h-3.5 w-3.5" /> {t(ui.cta.remove)}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3" data-no-print>
            <Link href={href("/contact")} className="btn btn-primary">
              {t(ui.inquiry.continue)} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={href("/products")} className="btn btn-ghost">
              {t(ui.cta.discoverProducts)}
            </Link>
          </div>
        </>
      )}

      {shortlist.length > 0 && (
        <section className="mt-24" data-no-print>
          <h2 className="display text-4xl">{t(ui.catalog.shortlistTitle)}</h2>
          <RelatedGrid slugs={shortlist} />
        </section>
      )}
    </div>
  );
}
