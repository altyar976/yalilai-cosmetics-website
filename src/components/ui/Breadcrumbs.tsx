import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { siteUrl } from "@/data/company";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${siteUrl}${c.href}` } : {}),
    })),
  };
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-[0.75rem] text-muted">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {c.href && i < items.length - 1 ? (
              <Link href={c.href} className="link-underline hover:text-ink">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {c.label}
              </span>
            )}
            {i < items.length - 1 && <ChevronRight className="h-3 w-3 opacity-50" aria-hidden="true" />}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </nav>
  );
}
