"use client";

import { useState } from "react";
import { productBySlug, type Product } from "@/data/products";
import { ProductCard } from "./ProductCard";
import { QuickView } from "./QuickView";

export function RelatedGrid({ slugs }: { slugs: string[] }) {
  const [quick, setQuick] = useState<Product | null>(null);
  const list = slugs.map((s) => productBySlug.get(s)).filter(Boolean) as Product[];
  return (
    <>
      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
        {list.map((p) => (
          <li key={p.slug}>
            <ProductCard product={p} onQuickView={setQuick} compact sizes="(min-width: 768px) 25vw, 50vw" />
          </li>
        ))}
      </ul>
      <QuickView product={quick} onClose={() => setQuick(null)} />
    </>
  );
}
