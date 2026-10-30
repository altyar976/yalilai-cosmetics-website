"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { useHref, useT } from "@/i18n/locale-context";
import { ui } from "@/content/ui";
import type { L } from "@/data/taxonomy";

type Detail = { title: L; image?: string };

export function announceAdded(detail: Detail) {
  window.dispatchEvent(new CustomEvent<Detail>("yl:inquiry-added", { detail }));
}

/** Polite confirmation after adding something to the inquiry list. */
export function InquiryToast() {
  const t = useT();
  const href = useHref();
  const [item, setItem] = useState<Detail | null>(null);
  useEffect(() => {
    let timer: number | undefined;
    const on = (e: Event) => {
      setItem((e as CustomEvent<Detail>).detail);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setItem(null), 5200);
    };
    window.addEventListener("yl:inquiry-added", on);
    return () => {
      window.removeEventListener("yl:inquiry-added", on);
      window.clearTimeout(timer);
    };
  }, []);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex justify-center px-4 sm:bottom-6 sm:justify-end sm:px-6" data-no-print>
      {item && (
        <div className="pointer-events-auto flex w-full max-w-sm items-center gap-4 rounded-2xl bg-ink p-3 pr-4 text-porcelain shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
          <span className="relative h-14 w-12 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-ink/[0.06]">
            {item.image ? <Image src={item.image} alt="" fill sizes="48px" className="object-cover" /> : null}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[0.7rem] uppercase tracking-[0.16em] text-champagne">
              <Check className="h-3.5 w-3.5" /> {t(ui.cta.added)}
            </p>
            <p className="truncate text-sm">{t(item.title)}</p>
            <Link href={href("/inquiry")} className="text-xs text-porcelain/70 underline underline-offset-4 hover:text-porcelain">
              {t(ui.cta.viewInquiry)}
            </Link>
          </div>
          <button type="button" onClick={() => setItem(null)} aria-label={t(ui.nav.close)} className="rounded-full p-1.5 hover:bg-porcelain/10">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
