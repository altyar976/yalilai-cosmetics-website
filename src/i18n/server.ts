import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./config";
import type { L } from "@/data/taxonomy";

export async function resolveLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}

export const makeT = (locale: Locale) => (l: L) => (locale === "zh-cn" ? l.zh : l.en);
export const makeHref = (locale: Locale) => (path: string) => `/${locale}${path === "/" ? "" : path}`;
