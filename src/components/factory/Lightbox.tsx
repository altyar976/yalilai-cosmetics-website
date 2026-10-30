"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { FactoryPhoto } from "@/data/factory-photos";
import { useT } from "@/i18n/locale-context";
import { ui } from "@/content/ui";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";

export function Lightbox({ photos, index, onClose }: { photos: FactoryPhoto[]; index: number | null; onClose: () => void }) {
  const t = useT();
  return (
    <Dialog open={index !== null} onClose={onClose} label={t(ui.misc.openImage)} closeLabel={t(ui.nav.close)} variant="full">
      {index !== null && <LightboxBody photos={photos} start={index} />}
    </Dialog>
  );
}

function LightboxBody({ photos, start }: { photos: FactoryPhoto[]; start: number }) {
  const t = useT();
  const [i, setI] = useState(start);
  const touch = useRef<number | null>(null);
  const go = useCallback((d: number) => setI((x) => (x + d + photos.length) % photos.length), [photos.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const p = photos[i];
  return (
    <div
      className="flex h-full flex-col text-porcelain"
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      <div className="relative min-h-0 flex-1">
        {photos.map((ph, k) => (
          <div key={ph.id} className={cn("absolute inset-0 transition-opacity duration-700 ease-[var(--ease-luxe)]", k === i ? "opacity-100" : "pointer-events-none opacity-0")} aria-hidden={k !== i}>
            {Math.abs(k - i) <= 1 || (i === 0 && k === photos.length - 1) || (i === photos.length - 1 && k === 0) ? (
              <Image src={ph.src} alt={t(ph.alt)} fill sizes="100vw" quality={88} className="object-contain p-4 sm:p-10" placeholder={ph.blur ? "blur" : "empty"} blurDataURL={ph.blur} />
            ) : null}
          </div>
        ))}
        <button type="button" onClick={() => go(-1)} aria-label={t(ui.misc.previous)} className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-porcelain/10 hover:bg-porcelain/20">
          <ChevronLeft className="h-6 w-6" strokeWidth={1.25} />
        </button>
        <button type="button" onClick={() => go(1)} aria-label={t(ui.misc.nextImage)} className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-porcelain/10 hover:bg-porcelain/20">
          <ChevronRight className="h-6 w-6" strokeWidth={1.25} />
        </button>
      </div>
      <div className="flex flex-col gap-2 border-t border-porcelain/10 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-10" aria-live="polite">
        <div className="max-w-2xl">
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-champagne">
            {t(p.area)} · {t(ui.misc.realPhoto)}
          </p>
          <p className="display mt-1 text-2xl">{t(p.title)}</p>
          <p className="mt-1 text-sm text-porcelain/70">{t(p.caption)}</p>
        </div>
        <p className="shrink-0 font-[family-name:var(--font-display)] text-lg text-porcelain/60">
          {String(i + 1).padStart(2, "0")} {t(ui.misc.of)} {String(photos.length).padStart(2, "0")}
        </p>
      </div>
    </div>
  );
}
