"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LOCALE_COOKIE, locales, localeMeta, swapLocale, type Locale } from "@/i18n/config";
import { useLocale, useT } from "@/i18n/locale-context";
import { ui } from "@/content/ui";
import { cn } from "@/lib/utils";

function remember(locale: Locale) {
  // Explicit choice only — the site never infers language from the browser.
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

function SwitchInner({ className, tone = "ink" }: { className?: string; tone?: "ink" | "light" }) {
  const locale = useLocale();
  const t = useT();
  const pathname = usePathname() || `/${locale}`;
  const search = useSearchParams();
  const qs = search?.toString();
  return (
    <nav aria-label={t(ui.misc.language)} className={cn("flex items-center gap-1 text-[0.72rem] font-medium tracking-[0.14em]", className)}>
      {locales.map((l, i) => {
        const active = l === locale;
        const href = swapLocale(pathname, l) + (qs ? `?${qs}` : "");
        return (
          <span key={l} className="flex items-center">
            {i > 0 && <span className={cn("mx-1.5 h-3 w-px", tone === "light" ? "bg-porcelain/40" : "bg-ink/25")} aria-hidden="true" />}
            <Link
              href={href}
              hrefLang={localeMeta[l].hreflang}
              lang={localeMeta[l].htmlLang}
              aria-current={active ? "true" : undefined}
              aria-label={`${localeMeta[l].short} · ${localeMeta[l].label}`}
              onClick={() => remember(l)}
              scroll={false}
              className={cn(
                "rounded-full px-2 py-1.5 transition-colors",
                active ? (tone === "light" ? "text-porcelain" : "text-ink") : tone === "light" ? "text-porcelain/55 hover:text-porcelain" : "text-ink/60 hover:text-ink",
              )}
            >
              {localeMeta[l].short}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}

export function LanguageSwitch(props: { className?: string; tone?: "ink" | "light" }) {
  return (
    <Suspense fallback={<span className={cn("text-[0.72rem] tracking-[0.14em]", props.className)}>EN | 中文</span>}>
      <SwitchInner {...props} />
    </Suspense>
  );
}
