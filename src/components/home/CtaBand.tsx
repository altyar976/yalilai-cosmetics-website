import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { makeHref, makeT } from "@/i18n/server";
import { home } from "@/content/home";
import { ui } from "@/content/ui";
import { company } from "@/data/company";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { Magnetic } from "@/components/motion/Magnetic";
import { CopyButton } from "@/components/ui/CopyButton";

/** "Let's create your next beauty icon" — dark shimmering CTA block. */
export function CtaBand({ locale }: { locale: Locale }) {
  const t = makeT(locale);
  const href = makeHref(locale);
  return (
    <section className="shimmer-backdrop grain relative isolate overflow-hidden py-28 text-porcelain lg:py-40" aria-labelledby="cta-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="shimmer-sweep absolute -inset-y-1/2 left-0 w-1/3 bg-gradient-to-r from-transparent via-champagne/15 to-transparent blur-2xl" />
      </div>
      <div className="container-x relative text-center">
        <p className="eyebrow !text-champagne">{t(ui.cta.quote)}</p>
        <SplitHeadline id="cta-title" text={t(home.cta.title)} className="display mx-auto mt-6 max-w-5xl text-[clamp(2.8rem,7vw,7rem)]" />
        <p className="lede mx-auto mt-8 max-w-xl !text-porcelain/75">{t(home.cta.body)}</p>
        <div className="mt-11 flex flex-wrap justify-center gap-3">
          <Magnetic>
            <Link href={href("/contact")} className="btn btn-light">
              {t(ui.cta.quote)} <ArrowRight className="h-4 w-4" />
            </Link>
          </Magnetic>
          <Magnetic>
            <Link href={href("/customization-studio")} className="btn border border-porcelain/30 text-porcelain hover:border-porcelain">
              {t(ui.cta.openStudio)}
            </Link>
          </Magnetic>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-porcelain/70">
          <a href={`tel:${company.phoneE164}`} className="link-underline">
            {t(ui.contact.phone)} · {company.phoneDisplay}
          </a>
          <span className="flex items-center gap-3">
            {t(ui.contact.wechat)} · {company.wechatId}
            <CopyButton value={company.wechatId} label={ui.cta.copyWechat} tone="light" />
          </span>
        </div>
      </div>
    </section>
  );
}
