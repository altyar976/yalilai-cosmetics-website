"use client";

import Link from "next/link";
import { useHref, useT } from "@/i18n/locale-context";
import { ui } from "@/content/ui";

export default function NotFound() {
  const t = useT();
  const href = useHref();
  return (
    <section className="container-x flex min-h-[80svh] flex-col items-start justify-center pt-28">
      <p className="eyebrow">404</p>
      <h1 className="display mt-5 text-[clamp(2.6rem,6vw,5.6rem)]">{t(ui.misc.notFoundTitle)}</h1>
      <p className="lede mt-6 max-w-xl">{t(ui.misc.notFoundBody)}</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href={href("/")} className="btn btn-primary">
          {t(ui.nav.home)}
        </Link>
        <Link href={href("/products")} className="btn btn-ghost">
          {t(ui.nav.catalog)}
        </Link>
      </div>
    </section>
  );
}
