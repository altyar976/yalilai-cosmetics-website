"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X, ArrowRight } from "lucide-react";
import { products } from "@/data/products";
import { categories, collectionIds, collections, productTypes, tips } from "@/data/taxonomy";
import { useHref, useT } from "@/i18n/locale-context";
import { ui } from "@/content/ui";
import { cn } from "@/lib/utils";

const compact = (s: string) => s.toLowerCase().replace(/[\s\-_]+/g, "");

/** Model codes match with or without dashes/spaces ("yd094", "YD-094-3"); words match names, categories, tips and formats in both languages. */
export function searchProducts(q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  const terms = s.split(/\s+/);
  const cq = compact(s);
  return products
    .map((p) => {
      const hay = [
        p.model,
        p.name.en,
        p.name.zh,
        categories[p.category].name.en,
        categories[p.category].name.zh,
        productTypes[p.type].en,
        productTypes[p.type].zh,
        ...p.tips.flatMap((x) => [tips[x].en, tips[x].zh]),
      ]
        .join(" ")
        .toLowerCase();
      const model = compact(p.model);
      const modelHit = cq.length >= 2 && model.startsWith(cq);
      const score = (model === cq ? 10 : 0) + (modelHit ? 5 : 0) + terms.reduce((acc, t) => acc + (hay.includes(t) ? 1 : 0), 0);
      return { p, score, all: modelHit || terms.every((t) => hay.includes(t)) };
    })
    .filter((r) => r.all)
    .sort((a, b) => b.score - a.score || a.p.model.localeCompare(b.p.model, "en", { numeric: true }))
    .map((r) => r.p);
}

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const t = useT();
  const href = useHref();
  const router = useRouter();
  const results = useMemo(() => searchProducts(q).slice(0, 8), [q]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      requestAnimationFrame(() => input.current?.focus());
    } else if (!open && d.open) d.close();
  }, [open]);

  const go = (slug: string, cat: string) => {
    onClose();
    router.push(href(`/products/${cat}/${slug}`));
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={t(ui.nav.search)}
      className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-ink/30 backdrop:backdrop-blur-sm"
    >
      <div className="mx-auto mt-[8vh] w-[min(720px,calc(100%-2rem))] overflow-hidden rounded-3xl bg-porcelain shadow-[0_40px_120px_-40px_rgba(23,21,19,0.45)]">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            const r = results[active];
            if (r) go(r.slug, r.category);
            else {
              onClose();
              router.push(href(`/products?q=${encodeURIComponent(q)}`));
            }
          }}
          className="flex items-center gap-3 border-b hairline px-5 py-4"
        >
          <Search className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
          <input
            ref={input}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              }
            }}
            placeholder={t(ui.catalog.searchPlaceholder)}
            aria-label={t(ui.nav.search)}
            aria-controls="search-results"
            aria-activedescendant={results[active] ? `sr-${results[active].slug}` : undefined}
            className="min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-muted/70"
            type="search"
            enterKeyHint="search"
          />
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-linen" aria-label={t(ui.nav.close)}>
            <X className="h-5 w-5" />
          </button>
        </form>
        <ul id="search-results" role="listbox" className="max-h-[60vh] overflow-y-auto p-2">
          {q && results.length === 0 && <li className="px-4 py-8 text-center text-muted">{t(ui.catalog.noResults)}</li>}
          {!q && (
            <li className="px-4 py-6 text-sm text-muted">
              {collectionIds.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push(href(`/products/${c}`));
                  }}
                  className="chip mb-2 mr-2 !border-ink/30 font-medium"
                >
                  {t(collections[c].name)}
                </button>
              ))}
              {(["liquid-eyeliners", "gel-eyeliners", "eyebrow-pencils", "liquid-eyebrow-pens", "lip-liners-pens"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push(href(`/products/${c}`));
                  }}
                  className="chip mb-2 mr-2"
                >
                  {t(categories[c].name)}
                </button>
              ))}
            </li>
          )}
          {results.map((p, i) => (
            <li key={p.slug} id={`sr-${p.slug}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(p.slug, p.category)}
                className={cn("flex w-full items-center gap-4 rounded-2xl p-2 text-left transition-colors", i === active && "bg-linen")}
              >
                <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-ink/[0.06]">
                  <Image src={p.image} alt="" fill sizes="64px" className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">
                    <span className="mr-2 font-mono text-xs text-champagne-deep">{p.model}</span>
                    {t(p.name)}
                  </span>
                  <span className="block truncate text-sm text-muted">{t(categories[p.category].name)}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
