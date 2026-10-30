"use client";

import { useState } from "react";
import { Heart, ZoomIn, Info } from "lucide-react";
import type { Product } from "@/data/products";
import { requestOptions, type RequestOptionId } from "@/data/taxonomy";
import { useT } from "@/i18n/locale-context";
import { ui } from "@/content/ui";
import { useInquiry } from "@/store/inquiry";
import { ProductImage } from "@/components/ui/ProductImage";
import { Dialog } from "@/components/ui/Dialog";
import { AddToInquiryButton } from "./AddToInquiryButton";
import { useHydrated } from "./ProductCard";
import { cn } from "@/lib/utils";

/** Gallery + inquiry column for a product page. */
export function ProductDetail({ product }: { product: Product }) {
  const t = useT();
  const hydrated = useHydrated();
  const [requests, setRequests] = useState<RequestOptionId[]>([]);
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [zoom, setZoom] = useState(false);
  const shortlisted = useInquiry((s) => s.shortlist.includes(product.slug));
  const toggleShortlist = useInquiry((s) => s.toggleShortlist);
  const alt = `${t(product.name)} — ${t(ui.catalog.model)} ${product.model}`;
  const toggle = (id: RequestOptionId) => setRequests((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]));

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="min-w-0 lg:col-span-7">
        <div className="lg:sticky lg:top-28">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-ink/[0.06]">
            <ProductImage src={product.image} alt={alt} sizes="(min-width: 1024px) 58vw, 100vw" priority quality={88} />
            <span className="absolute left-4 top-4 rounded-full bg-ivory/90 px-3 py-1.5 font-mono text-xs tracking-[0.08em]">{product.model}</span>
            <button type="button" onClick={() => setZoom(true)} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-ivory/90 hover:bg-ivory" aria-label={t(ui.misc.openImage)}>
              <ZoomIn className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
          {product.imageLimited && <p className="mt-3 text-xs text-muted">{t(ui.reference.imageLimited)}</p>}
        </div>
      </div>

      <div className="min-w-0 lg:col-span-5">
        <fieldset>
          <legend className="label">{t(ui.catalog.requests)}</legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(requestOptions) as RequestOptionId[]).map((id) => (
              <button key={id} type="button" className="chip" aria-pressed={requests.includes(id)} onClick={() => toggle(id)}>
                {t(requestOptions[id])}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">{t(ui.catalog.requestsHint)}</p>
        </fieldset>

        <label className="mt-7 block">
          <span className="label">{t(ui.catalog.quantity)}</span>
          <input value={quantity} onChange={(e) => setQuantity(e.target.value)} maxLength={80} className="field" placeholder={t(ui.catalog.quantityPlaceholder)} />
        </label>

        <label className="mt-6 block">
          <span className="label">{t(ui.catalog.notes)}</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={600} className="field resize-y" placeholder={t(ui.catalog.notesPlaceholder)} />
        </label>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <AddToInquiryButton product={product} requests={requests} quantity={quantity} notes={notes} className="flex-1" />
          <button type="button" onClick={() => toggleShortlist(product.slug)} aria-pressed={hydrated && shortlisted} className="btn btn-ghost sm:w-auto">
            <Heart className={cn("h-4 w-4", hydrated && shortlisted && "fill-ink")} strokeWidth={1.5} />
            {t(hydrated && shortlisted ? ui.cta.shortlisted : ui.cta.shortlist)}
          </button>
        </div>

        <div className="mt-8 flex gap-3 rounded-2xl bg-linen p-5 text-sm text-graphite">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-champagne-deep" />
          <p>{t(ui.reference.disclaimer)}</p>
        </div>
      </div>

      <Dialog open={zoom} onClose={() => setZoom(false)} label={`${product.model} ${t(product.name)}`} closeLabel={t(ui.nav.close)} variant="full">
        <ZoomView src={product.image} alt={alt} />
      </Dialog>
    </div>
  );
}

function ZoomView({ src, alt }: { src: string; alt: string }) {
  const [origin, setOrigin] = useState("50% 50%");
  const [zoomed, setZoomed] = useState(false);
  return (
    <div
      className="relative h-full w-full cursor-zoom-in overflow-hidden bg-white"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
      }}
      onClick={() => setZoomed((z) => !z)}
    >
      <div className="absolute inset-0 transition-transform duration-500 ease-[var(--ease-luxe)]" style={{ transform: zoomed ? "scale(2)" : "scale(1)", transformOrigin: origin }}>
        <ProductImage src={src} alt={alt} sizes="100vw" className="!object-contain" quality={88} />
      </div>
    </div>
  );
}
