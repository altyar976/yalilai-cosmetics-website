"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, Search, X, Heart } from "lucide-react";
import { byModel, categoryOrder, products, type Product } from "@/data/products";
import { categories, categoryIds, features, productTypes, tips, type CategoryId, type L } from "@/data/taxonomy";
import { useT } from "@/i18n/locale-context";
import { ui } from "@/content/ui";
import { useInquiry } from "@/store/inquiry";
import { ProductCard, useHydrated } from "./ProductCard";
import { QuickView } from "./QuickView";
import { CompareBar } from "./CompareBar";
import { Dialog } from "@/components/ui/Dialog";
import { searchProducts } from "@/components/layout/SearchDialog";
import { cn } from "@/lib/utils";

type FacetKey = "category" | "type" | "tip" | "feature";

const facetDefs: { key: FacetKey; label: L; options: Record<string, L>; get: (p: Product) => string[] }[] = [
  { key: "category", label: ui.catalog.category, options: Object.fromEntries(categoryIds.map((c) => [c, categories[c].name])), get: (p) => [p.category] },
  { key: "type", label: ui.catalog.type, options: productTypes, get: (p) => [p.type] },
  { key: "tip", label: ui.catalog.tip, options: tips, get: (p) => p.tips },
  { key: "feature", label: ui.catalog.feature, options: features, get: (p) => p.features },
];

type Sort = "featured" | "model" | "az" | "category";
const PAGE = 24;

/**
 * Filterable catalogue grid. `scope` limits the list to one category or a collection (several
 * categories); the category facet is then offered only when the scope spans more than one.
 */
export function CatalogView({ scope }: { scope?: CategoryId[] }) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const hydrated = useHydrated();
  const shortlist = useInquiry((s) => s.shortlist);
  const [quick, setQuick] = useState<Product | null>(null);
  const [drawer, setDrawer] = useState(false);

  const read = useCallback(
    (k: string) => (params.get(k) ? params.get(k)!.split(",").filter(Boolean) : []),
    [params],
  );
  const lockedCategory = scope?.length === 1;
  const selected: Record<FacetKey, string[]> = {
    category: lockedCategory ? [] : read("category"),
    type: read("type"),
    tip: read("tip"),
    feature: read("feature"),
  };
  const q = params.get("q") ?? "";
  const sort = (params.get("sort") as Sort) || "featured";
  const [limit, setLimit] = useState(PAGE);
  const onlyShortlist = params.get("shortlist") === "1";
  const [qDraft, setQDraft] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    // URL changed (e.g. back/forward): adopt it as the new draft
    setPrevQ(q);
    setQDraft(q);
  }

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v) next.set(k, v);
        else next.delete(k);
      }
      const s = next.toString();
      router.replace(`${pathname}${s ? `?${s}` : ""}`, { scroll: false });
    },
    [params, pathname, router],
  );

  // Debounced search sync
  useEffect(() => {
    if (qDraft === q) return;
    const id = window.setTimeout(() => update({ q: qDraft || null }), 260);
    return () => window.clearTimeout(id);
  }, [qDraft, q, update]);

  const toggle = (k: FacetKey, v: string) => {
    const cur = selected[k];
    const nextVals = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    update({ [k]: nextVals.join(",") || null });
  };

  const base = useMemo(() => {
    const list = q ? searchProducts(q) : products;
    return scope ? list.filter((p) => scope.includes(p.category)) : list;
  }, [q, scope]);
  const filtered = useMemo(() => {
    let list = base.filter((p) =>
      facetDefs.every((f) => {
        const sel = selected[f.key];
        if (!sel.length) return true;
        const vals = f.get(p);
        return sel.some((s) => vals.includes(s));
      }),
    );
    if (onlyShortlist && hydrated) list = list.filter((p) => shortlist.includes(p.slug));
    if (sort === "az") list = [...list].sort((a, b) => t(a.name).localeCompare(t(b.name)));
    else if (sort === "model") list = [...list].sort(byModel);
    else if (sort === "category") list = [...list].sort((a, b) => categoryOrder(a.category) - categoryOrder(b.category) || byModel(a, b));
    else if (!q) list = [...list].sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || categoryOrder(a.category) - categoryOrder(b.category) || byModel(a, b));
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, params, sort, onlyShortlist, shortlist, hydrated, t]);

  // Facet option counts given the other active filters
  const countFor = (k: FacetKey, v: string) =>
    base.filter((p) =>
      facetDefs.every((f) => {
        if (f.key === k) return f.get(p).includes(v);
        const sel = selected[f.key];
        return !sel.length || sel.some((s) => f.get(p).includes(s));
      }),
    ).length;

  const activeCount = facetDefs.reduce((n, f) => n + selected[f.key].length, 0);
  // a new filter / search / sort starts from the first page again
  const signature = params.toString();
  const [prevSignature, setPrevSignature] = useState(signature);
  if (signature !== prevSignature) {
    setPrevSignature(signature);
    setLimit(PAGE);
  }
  const visible = filtered.slice(0, limit);

  const filterPanel = (
    <div className="space-y-8">
      {facetDefs
        .filter((f) => !(lockedCategory && f.key === "category"))
        .map((f) => {
          const entries = Object.entries(f.options).filter(([v]) => countFor(f.key, v) > 0 || selected[f.key].includes(v));
          if (!entries.length) return null;
          return (
            <fieldset key={f.key}>
              <legend className="label">{t(f.label)}</legend>
              <div className="flex flex-wrap gap-2">
                {entries.map(([v, l]) => (
                  <button key={v} type="button" className="chip" aria-pressed={selected[f.key].includes(v)} onClick={() => toggle(f.key, v)}>
                    {t(l)}
                    <span className="text-[0.68rem] opacity-60">{countFor(f.key, v)}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          );
        })}
    </div>
  );

  return (
    <div className="container-x pb-28">
      <div className="sticky top-[4.5rem] z-20 -mx-[clamp(1rem,4vw,3.5rem)] mb-8 border-b hairline bg-ivory/90 px-[clamp(1rem,4vw,3.5rem)] py-3 backdrop-blur-xl lg:top-20">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative flex min-w-[220px] flex-1 items-center">
            <Search className="pointer-events-none absolute left-4 h-4 w-4 text-muted" aria-hidden="true" />
            <span className="sr-only">{t(ui.nav.search)}</span>
            <input
              type="search"
              value={qDraft}
              onChange={(e) => setQDraft(e.target.value)}
              placeholder={t(ui.catalog.searchPlaceholder)}
              className="field !rounded-full !py-2.5 !pl-11"
            />
          </label>
          <button type="button" onClick={() => setDrawer(true)} className="btn btn-ghost btn-sm lg:hidden">
            <SlidersHorizontal className="h-4 w-4" /> {t(ui.catalog.filters)}
            {activeCount > 0 && <span className="rounded-full bg-ink px-1.5 text-[0.65rem] text-porcelain">{activeCount}</span>}
          </button>
          <button
            type="button"
            aria-pressed={onlyShortlist}
            onClick={() => update({ shortlist: onlyShortlist ? null : "1" })}
            className="chip !py-2"
          >
            <Heart className={cn("h-3.5 w-3.5", onlyShortlist && "fill-current")} />
            {t(ui.catalog.shortlistTitle)}
            {hydrated && shortlist.length > 0 && <span className="text-[0.68rem] opacity-70">{shortlist.length}</span>}
          </button>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted">{t(ui.catalog.sort)}</span>
            <select value={sort} onChange={(e) => update({ sort: e.target.value === "featured" ? null : e.target.value })} className="rounded-full border hairline bg-porcelain px-3 py-2 text-sm">
              <option value="featured">{t(ui.catalog.sortFeatured)}</option>
              <option value="model">{t(ui.catalog.sortModel)}</option>
              <option value="az">{t(ui.catalog.sortAZ)}</option>
              <option value="category">{t(ui.catalog.sortCategory)}</option>
            </select>
          </label>
          <p className="ml-auto text-sm text-muted" aria-live="polite">
            {filtered.length} {t(ui.catalog.results)}
          </p>
        </div>
        {activeCount > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {facetDefs.map((f) =>
              selected[f.key].map((v) => (
                <button key={`${f.key}-${v}`} type="button" onClick={() => toggle(f.key, v)} className="chip !border-ink/30 !py-1 text-xs">
                  {t(f.options[v])} <X className="h-3 w-3" />
                </button>
              )),
            )}
            <button
              type="button"
              onClick={() => update(Object.fromEntries(facetDefs.map((f) => [f.key, null])))}
              className="text-xs text-muted underline underline-offset-4 hover:text-ink"
            >
              {t(ui.catalog.clearAll)}
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-10 lg:grid-cols-[260px_1fr] xl:grid-cols-[290px_1fr]">
        <aside className="hidden lg:block" aria-label={t(ui.catalog.filters)}>
          <div className="sticky top-44 max-h-[calc(100vh-12rem)] overflow-y-auto pb-10 pr-2 no-scrollbar">{filterPanel}</div>
        </aside>
        <div>
          {filtered.length === 0 ? (
            <div className="card-surface flex flex-col items-center gap-4 px-6 py-20 text-center">
              <p className="display text-2xl">{t(ui.catalog.noResults)}</p>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => router.replace(pathname, { scroll: false })}>
                {t(ui.catalog.clearAll)}
              </button>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 2xl:grid-cols-4">
                {visible.map((p, i) => (
                  <li key={p.slug}>
                    <ProductCard product={p} onQuickView={setQuick} priority={i < 4} />
                  </li>
                ))}
              </ul>
              <div className="mt-14 flex flex-col items-center gap-4">
                <p className="text-sm text-muted">
                  {t(ui.catalog.showing)} {visible.length} {t(ui.catalog.of)} {filtered.length}
                </p>
                <div className="h-px w-48 overflow-hidden rounded-full bg-ink/10" aria-hidden="true">
                  <div className="h-full bg-ink transition-[width] duration-700" style={{ width: `${(visible.length / filtered.length) * 100}%` }} />
                </div>
                {visible.length < filtered.length && (
                  <button type="button" className="btn btn-ghost" onClick={() => setLimit((n) => n + PAGE)}>
                    {t(ui.catalog.showMore)}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog open={drawer} onClose={() => setDrawer(false)} label={t(ui.catalog.filters)} closeLabel={t(ui.nav.close)} variant="drawer-bottom">
        <div className="p-6 pb-28 pt-8">
          <p className="display mb-8 text-3xl">{t(ui.catalog.filters)}</p>
          {filterPanel}
        </div>
        <div className="sticky bottom-0 flex gap-3 border-t hairline bg-porcelain p-4">
          <button type="button" className="btn btn-ghost flex-1" onClick={() => update(Object.fromEntries(facetDefs.map((f) => [f.key, null])))}>
            {t(ui.cta.reset)}
          </button>
          <button type="button" className="btn btn-primary flex-1" onClick={() => setDrawer(false)}>
            {t(ui.cta.showResults)} ({filtered.length})
          </button>
        </div>
      </Dialog>

      <QuickView product={quick} onClose={() => setQuick(null)} />
      <CompareBar />
    </div>
  );
}
