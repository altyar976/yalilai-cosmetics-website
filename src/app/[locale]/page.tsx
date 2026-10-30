import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { resolveLocale } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { home } from "@/content/home";
import { Hero } from "@/components/home/Hero";
import { MarqueeBand } from "@/components/home/MarqueeBand";
import { CategoryGallery } from "@/components/home/CategoryGallery";
import { EyeCollections } from "@/components/home/EyeCollections";
import { CustomizationShowcase } from "@/components/home/CustomizationShowcase";
import { Journey } from "@/components/home/Journey";
import { FactoryGallery } from "@/components/home/FactoryGallery";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { Services } from "@/components/home/Services";
import { QualityStory } from "@/components/home/QualityStory";
import { CtaBand } from "@/components/home/CtaBand";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: "/", title: home.meta.title, description: home.meta.description });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  return (
    <>
      <Hero />
      <EyeCollections />
      <MarqueeBand locale={locale} />
      <CategoryGallery />
      <CustomizationShowcase />
      <Journey />
      <FactoryGallery />
      <ProductCarousel />
      <Services />
      <QualityStory />
      <CtaBand locale={locale} />
    </>
  );
}
