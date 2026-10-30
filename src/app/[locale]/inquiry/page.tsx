import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { resolveLocale, makeT, makeHref } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { ui } from "@/content/ui";
import { PageHero } from "@/components/ui/PageHero";
import { InquiryList } from "@/components/inquiry/InquiryList";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({
    locale,
    path: "/inquiry",
    title: ui.inquiry.title,
    description: { en: "Review the models and concepts you have added before requesting a quote.", zh: "提交询价前，查看您已添加的型号与方案。" },
    noindex: true,
  });
}

export default async function InquiryPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const t = makeT(locale);
  const href = makeHref(locale);
  return (
    <>
      <PageHero
        size="sm"
        eyebrow={t(ui.nav.inquiry)}
        title={t(ui.inquiry.title)}
        intro={t(ui.inquiry.savedLocally)}
        crumbs={[{ label: t(ui.misc.breadcrumbHome), href: href("/") }, { label: t(ui.nav.inquiry) }]}
      />
      <section className="container-x pb-28">
        <InquiryList />
      </section>
    </>
  );
}
