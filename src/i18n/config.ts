export const locales = ["en", "zh-cn"] as const;
export type Locale = (typeof locales)[number];

/** English is always the default on a first visit, regardless of browser language. */
export const defaultLocale: Locale = "en";

/** Cookie that stores a visitor's *explicit* language choice (set only by the EN / 中文 toggle). */
export const LOCALE_COOKIE = "yalilai_locale";

export const localeMeta: Record<Locale, { label: string; short: string; hreflang: string; htmlLang: string; ogLocale: string }> = {
  en: { label: "English", short: "EN", hreflang: "en", htmlLang: "en", ogLocale: "en_US" },
  "zh-cn": { label: "简体中文", short: "中文", hreflang: "zh-CN", htmlLang: "zh-CN", ogLocale: "zh_CN" },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** Replace (or add) the locale segment of a pathname — used by the language switch so the
 * visitor stays on the same page. */
export function swapLocale(pathname: string, next: Locale): string {
  const parts = pathname.split("/");
  if (isLocale(parts[1])) {
    parts[1] = next;
    return parts.join("/") || `/${next}`;
  }
  return `/${next}${pathname === "/" ? "" : pathname}`;
}
