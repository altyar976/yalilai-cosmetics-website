import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, defaultLocale, isLocale } from "@/i18n/config";

/**
 * Locale routing. Every page lives under /en or /zh-cn.
 * A request without a locale prefix is redirected to the visitor's explicitly saved choice,
 * otherwise to English. Browser Accept-Language is intentionally ignored (English-first launch).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const first = pathname.split("/")[1];
  if (isLocale(first)) return NextResponse.next();

  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(saved) ? saved : defaultLocale;
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  url.search = search;
  return NextResponse.redirect(url, 307);
}

export const config = {
  // Skip API routes, Next internals, static files and metadata routes.
  matcher: ["/((?!api|_next|images|fonts|favicon.ico|icon|apple-icon|opengraph-image|robots.txt|sitemap.xml|manifest.webmanifest|.*\\..*).*)"],
};
