"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, ShoppingBag, Menu, X, ArrowUpRight, Phone } from "lucide-react";
import { categories, categoryIds, collectionIds, collections } from "@/data/taxonomy";
import { collectionCover, productsInCategory, productsInCollection } from "@/data/products";
import { company } from "@/data/company";
import { useHref, useLocale, useT } from "@/i18n/locale-context";
import { ui } from "@/content/ui";
import { useInquiry } from "@/store/inquiry";
import { cn } from "@/lib/utils";
import { LanguageSwitch } from "./LanguageSwitch";
import { SearchDialog } from "./SearchDialog";
import { Magnetic } from "@/components/motion/Magnetic";
import { useHydrated } from "@/components/catalog/ProductCard";

type MenuKey = "products" | "manufacturing" | null;

export function Wordmark({ tone = "ink", compact = false }: { tone?: "ink" | "light"; compact?: boolean }) {
  return (
    <span className={cn("flex flex-col leading-none", tone === "light" ? "text-porcelain" : "text-ink")}>
      <span className="font-[family-name:var(--font-bodoni)] text-[1.2rem] tracking-[0.28em] min-[380px]:text-[1.42rem] min-[380px]:tracking-[0.34em] sm:text-[1.55rem]">YALILAI</span>
      {!compact && (
        <span className={cn("mt-1 whitespace-nowrap text-[0.5rem] tracking-[0.3em] min-[380px]:text-[0.56rem] min-[380px]:tracking-[0.42em] sm:text-[0.6rem]", tone === "light" ? "text-porcelain/70" : "text-muted")}>
          雅丽莱化妆品 · COSMETICS
        </span>
      )}
    </span>
  );
}

export function Header() {
  const t = useT();
  const href = useHref();
  const locale = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState<MenuKey>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const count = useInquiry((s) => s.items.length);
  const mounted = useHydrated();
  const closeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 480 && y > last + 4);
      if (y < last - 4) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    // close menus after navigation
    setPrevPath(pathname);
    setMenu(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(null);
        setMobileOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const openMenu = (k: MenuKey) => {
    window.clearTimeout(closeTimer.current);
    setMenu(k);
  };
  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMenu(null), 160);
  };

  const isActive = (p: string) => pathname?.startsWith(`/${locale}${p}`);
  const solid = scrolled || menu !== null || mobileOpen;

  const manufacturing = [
    { href: "/factory", label: ui.nav.factory, desc: { en: "Real photographs from our production site", zh: "生产现场实拍照片" } },
    { href: "/quality", label: ui.nav.quality, desc: { en: "How samples and batches are reviewed", zh: "样品与批次审核方式" } },
    { href: "/how-it-works", label: ui.nav.howItWorks, desc: { en: "From brief to delivery, step by step", zh: "从需求到交付的每一步" } },
    { href: "/services", label: ui.nav.services, desc: { en: "OEM, ODM, private label and packaging", zh: "OEM、ODM、自有品牌与包装" } },
  ];

  return (
    <>
      <header
        data-site-header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[transform,background-color,box-shadow] duration-500 ease-[var(--ease-luxe)]",
          solid ? "bg-ivory/88 shadow-[0_1px_0_rgba(23,21,19,0.07)] backdrop-blur-xl" : "bg-transparent",
          hidden && !menu && !mobileOpen ? "-translate-y-full" : "translate-y-0",
        )}
        onMouseLeave={scheduleClose}
      >
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-porcelain">
          {t(ui.brand.skip)}
        </a>
        <div className="container-x flex h-[4.5rem] items-center gap-3 sm:gap-6 lg:h-20">
          <Link href={href("/")} className="shrink-0" aria-label={`YALILAI — ${locale === "zh-cn" ? company.nameZh : company.nameEn}`}>
            <Wordmark />
          </Link>

          <nav aria-label="Primary" className="ml-6 hidden flex-1 items-center gap-1 xl:flex">
            <button
              type="button"
              aria-expanded={menu === "products"}
              aria-controls="mega-products"
              onMouseEnter={() => openMenu("products")}
              onClick={() => setMenu(menu === "products" ? null : "products")}
              className={cn("nav-link rounded-full px-3.5 py-2 text-[0.82rem] tracking-[0.04em] transition-colors hover:text-ink", isActive("/products") ? "text-ink" : "text-graphite/80")}
            >
              {t(ui.nav.products)}
            </button>
            <button
              type="button"
              aria-expanded={menu === "manufacturing"}
              aria-controls="mega-manufacturing"
              onMouseEnter={() => openMenu("manufacturing")}
              onClick={() => setMenu(menu === "manufacturing" ? null : "manufacturing")}
              className={cn("rounded-full px-3.5 py-2 text-[0.82rem] tracking-[0.04em] transition-colors hover:text-ink", isActive("/factory") || isActive("/quality") ? "text-ink" : "text-graphite/80")}
            >
              {t(ui.nav.manufacturing)}
            </button>
            {[
              { p: "/services", l: ui.nav.servicesShort },
              { p: "/customization-studio", l: ui.nav.studio },
              { p: "/about", l: ui.nav.about },
              { p: "/insights", l: ui.nav.insights },
              { p: "/contact", l: ui.nav.contact },
            ].map((n) => (
              <Link
                key={n.p}
                href={href(n.p)}
                onMouseEnter={() => openMenu(null)}
                aria-current={isActive(n.p) ? "page" : undefined}
                className={cn("rounded-full px-3.5 py-2 text-[0.82rem] tracking-[0.04em] transition-colors hover:text-ink", isActive(n.p) ? "text-ink" : "text-graphite/80")}
              >
                {t(n.l)}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-0 min-[380px]:gap-1 sm:gap-2">
            <button type="button" onClick={() => setSearchOpen(true)} className="rounded-full p-2.5 transition-colors hover:bg-ink/5" aria-label={t(ui.nav.search)}>
              <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </button>
            <LanguageSwitch className="hidden sm:flex" />
            <Link href={href("/inquiry")} className="relative rounded-full p-2.5 transition-colors hover:bg-ink/5" aria-label={`${t(ui.nav.inquiry)}${mounted && count ? ` (${count})` : ""}`}>
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
              {mounted && count > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[0.6rem] font-medium text-porcelain">{count}</span>
              )}
            </Link>
            <Magnetic className="hidden md:inline-block">
              <Link href={href("/contact")} className="btn btn-primary btn-sm ml-2">
                {t(ui.cta.quote)}
              </Link>
            </Magnetic>
            <button
              type="button"
              className="rounded-full p-2.5 xl:hidden"
              aria-label={mobileOpen ? t(ui.nav.close) : t(ui.nav.menu)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* Mega menu: products */}
        <div
          id="mega-products"
          hidden={menu !== "products"}
          onMouseEnter={() => openMenu("products")}
          className="absolute inset-x-0 top-full hidden border-t hairline bg-ivory/97 backdrop-blur-xl xl:block"
        >
          <div className="container-x grid grid-cols-12 gap-8 py-10">
            <div className="col-span-3 flex flex-col justify-between">
              <div>
                <p className="eyebrow">{t(ui.catalog.eyebrow)}</p>
                <p className="display mt-4 text-3xl">{t(ui.nav.catalog)}</p>
                <p className="mt-4 max-w-xs text-sm text-muted">{t(ui.nav.megaIntro)}</p>
              </div>
              <div className="mt-8 flex flex-col gap-3">
                <Link href={href("/products")} className="link-underline inline-flex w-fit items-center gap-2 text-sm font-medium">
                  {t(ui.nav.allProducts)} <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href={href("/customization-studio")} className="link-underline inline-flex w-fit items-center gap-2 text-sm font-medium">
                  {t(ui.nav.studio)} <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <ul className="col-span-5 grid grid-cols-2 gap-4">
              {collectionIds.map((c) => {
                const cover = collectionCover(c)!;
                return (
                  <li key={c}>
                    <Link href={href(`/products/${c}`)} className="group block">
                      <span className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-white ring-1 ring-ink/[0.06]">
                        <Image src={cover.image} alt="" fill sizes="240px" className="object-cover transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:scale-[1.05]" />
                        <span className="absolute left-3 top-3 rounded-full bg-ivory/90 px-2.5 py-1 text-[0.65rem] text-muted">{productsInCollection(c).length}</span>
                      </span>
                      <span className="mt-3 block font-medium leading-snug">{t(collections[c].name)}</span>
                      <span className="block text-[0.78rem] text-muted">{t(collections[c].tagline)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <ul className="col-span-4 flex flex-col justify-center border-l hairline pl-8">
              {categoryIds.map((c) => (
                <li key={c}>
                  <Link href={href(`/products/${c}`)} className="group flex items-baseline justify-between gap-4 border-b hairline py-2.5 text-[0.9rem] transition-colors hover:text-ink">
                    <span className="link-underline">{t(categories[c].name)}</span>
                    <span className="text-[0.7rem] text-muted">{productsInCategory(c).length}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mega menu: manufacturing */}
        <div
          id="mega-manufacturing"
          hidden={menu !== "manufacturing"}
          onMouseEnter={() => openMenu("manufacturing")}
          className="absolute inset-x-0 top-full hidden border-t hairline bg-ivory/97 backdrop-blur-xl xl:block"
        >
          <div className="container-x grid grid-cols-12 gap-8 py-10">
            <ul className="col-span-7 grid grid-cols-2 gap-x-8 gap-y-6">
              {manufacturing.map((m) => (
                <li key={m.href}>
                  <Link href={href(m.href)} className="group block border-t hairline pt-4">
                    <span className="flex items-center justify-between">
                      <span className="display text-2xl">{t(m.label)}</span>
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                    <span className="mt-1.5 block text-sm text-muted">{t(m.desc)}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={href("/factory")} className="group relative col-span-5 block aspect-[16/9] overflow-hidden rounded-2xl">
              <Image src="/images/factory/production-workshop-wide.jpg" alt="" fill sizes="520px" className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-luxe)] group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent" />
              <span className="absolute bottom-4 left-5 text-sm font-medium tracking-[0.08em] text-porcelain">{t(ui.cta.tour)} →</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        hidden={!mobileOpen}
        className="fixed inset-0 z-40 overflow-y-auto bg-ivory pt-[4.5rem] xl:hidden"
        role="dialog"
        aria-modal="true"
        aria-label={t(ui.nav.menu)}
      >
        <div className="container-x flex min-h-full flex-col pb-10 pt-6">
          <ul className="flex flex-col">
            {[
              { p: "/products", l: ui.nav.catalog },
              { p: "/customization-studio", l: ui.nav.studio },
              { p: "/services", l: ui.nav.services },
              { p: "/factory", l: ui.nav.factory },
              { p: "/quality", l: ui.nav.quality },
              { p: "/how-it-works", l: ui.nav.howItWorks },
              { p: "/about", l: ui.nav.about },
              { p: "/faq", l: ui.nav.faq },
              { p: "/insights", l: ui.nav.insights },
              { p: "/contact", l: ui.nav.contact },
            ].map((n) => (
              <li key={n.p} className="border-b hairline">
                <Link href={href(n.p)} className="flex items-center justify-between py-4">
                  <span className="display text-[1.7rem]">{t(n.l)}</span>
                  <ArrowUpRight className="h-5 w-5 text-muted" strokeWidth={1.25} />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-2">
            {collectionIds.map((c) => (
              <Link key={c} href={href(`/products/${c}`)} className="chip !border-ink/30 font-medium">
                {t(collections[c].name)}
              </Link>
            ))}
            {categoryIds.map((c) => (
              <Link key={c} href={href(`/products/${c}`)} className="chip">
                {t(categories[c].short)}
              </Link>
            ))}
          </div>
          <div className="mt-auto flex flex-col gap-5 pt-10">
            <LanguageSwitch />
            <a href={`tel:${company.phoneE164}`} className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4" strokeWidth={1.5} /> {company.phoneDisplay}
            </a>
            <Link href={href("/contact")} className="btn btn-primary w-full">
              {t(ui.cta.quote)}
            </Link>
          </div>
        </div>
      </div>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
