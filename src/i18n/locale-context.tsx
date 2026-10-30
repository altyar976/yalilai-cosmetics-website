"use client";

import { createContext, useCallback, useContext } from "react";
import type { Locale } from "./config";
import type { L } from "@/data/taxonomy";

const LocaleContext = createContext<Locale>("en");

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** Returns a translator for bilingual `{ en, zh }` strings. */
export function useT() {
  const locale = useLocale();
  return useCallback((l: L) => (locale === "zh-cn" ? l.zh : l.en), [locale]);
}

/** Prefix a site path with the active locale. */
export function useHref() {
  const locale = useLocale();
  return useCallback((path: string) => `/${locale}${path === "/" ? "" : path}`, [locale]);
}
