"use client";

import { Check, Plus } from "lucide-react";
import type { Product } from "@/data/products";
import type { RequestOptionId } from "@/data/taxonomy";
import { useT } from "@/i18n/locale-context";
import { ui } from "@/content/ui";
import { useInquiry } from "@/store/inquiry";
import { announceAdded } from "@/components/inquiry/InquiryToast";
import { useHydrated } from "./ProductCard";
import { cn } from "@/lib/utils";

type Props = { product: Product; requests?: RequestOptionId[]; quantity?: string; notes?: string; className?: string };

export function AddToInquiryButton({ product, requests, quantity, notes, className }: Props) {
  const t = useT();
  const add = useInquiry((s) => s.add);
  const count = useInquiry((s) => s.items.filter((i) => i.slug === product.slug).length);
  const hydrated = useHydrated();
  return (
    <button
      type="button"
      className={cn("btn btn-primary", className)}
      onClick={() => {
        add({
          kind: "product",
          slug: product.slug,
          model: product.model,
          title: product.name,
          image: product.image,
          requests: requests?.length ? requests : undefined,
          quantity: quantity?.trim() || undefined,
          notes: notes?.trim() || undefined,
        });
        announceAdded({ title: product.name, image: product.image });
      }}
    >
      {hydrated && count > 0 ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      {t(ui.cta.addToInquiry)}
      {hydrated && count > 0 ? <span className="rounded-full bg-porcelain/15 px-2 py-0.5 text-[0.65rem]">{count}</span> : null}
    </button>
  );
}
