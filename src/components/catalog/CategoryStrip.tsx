"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { categories, categoryIds, collectionIds, collections } from "@/data/taxonomy";
import { useHref, useT } from "@/i18n/locale-context";
import { ui } from "@/content/ui";
import { products, productsInCategory, productsInCollection } from "@/data/products";

export function CategoryStrip() {
  const t = useT();
  const href = useHref();
  const pathname = usePathname();
  const all = href("/products");
  return (
    <nav aria-label={t(ui.catalog.category)} className="container-x mb-6">
      <ul className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <li>
          <Link href={all} className="chip whitespace-nowrap" data-active={pathname === all}>
            {t(ui.nav.allProducts)} <span className="text-[0.68rem] opacity-60">{products.length}</span>
          </Link>
        </li>
        {collectionIds.map((c) => {
          const h = href(`/products/${c}`);
          return (
            <li key={c}>
              <Link href={h} className="chip whitespace-nowrap !border-ink/30 font-medium" data-active={pathname === h}>
                {t(collections[c].name)} <span className="text-[0.68rem] opacity-60">{productsInCollection(c).length}</span>
              </Link>
            </li>
          );
        })}
        <li aria-hidden="true" className="mx-1 w-px shrink-0 self-stretch bg-ink/15" />
        {categoryIds.map((c) => {
          const h = href(`/products/${c}`);
          return (
            <li key={c}>
              <Link href={h} className="chip whitespace-nowrap" data-active={pathname === h}>
                {t(categories[c].name)} <span className="text-[0.68rem] opacity-60">{productsInCategory(c).length}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
