# YALILAI — Yalilai Cosmetics Co., Ltd. · 雅丽莱化妆品有限公司

Bilingual (English default · 简体中文) website for a cosmetics OEM/ODM and private-label makeup manufacturer.
Built with **Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · GSAP/ScrollTrigger · three.js**.

> **Nothing here is invented.** Unverified business facts (email, founding year, capacities, certifications,
> MOQs, lead times…) are not published — see [`docs/CONFIGURATION-CHECKLIST.md`](docs/CONFIGURATION-CHECKLIST.md).
> The product catalogue shows 139 reference models (model codes preserved) photographed from the client-supplied
> reference catalogue; 3D renderings elsewhere use an illustrative "YOUR BRAND" placeholder. See
> [`docs/catalog/CATALOG-REPORT.md`](docs/catalog/CATALOG-REPORT.md) before publishing.

---

## Quick start

Requirements: Node.js ≥ 20.9 (tested with Node 22), npm.

```bash
npm install
npm run dev            # http://localhost:3000  → redirects to /en
```

Production preview:

```bash
npm run build
npm run start          # http://localhost:3000
```

Quality checks:

```bash
npm run typecheck
npm run lint
npx playwright install chromium     # first time only
npm run build && npm run test:e2e   # starts `next start` on :3100 and runs the browser tests
```

## What's inside

| Area | Route(s) |
|---|---|
| Cinematic homepage (rotating rendered stage, editorial category gallery, customisation showcase, journey timeline, real factory gallery, carousel, services, quality, CTA) | `/en`, `/zh-cn` |
| Product catalogue — 139 reference models in 8 categories, with dedicated **Eyebrow** and **Eyeliner** collection pages; filters (category, format, tip / applicator, features), model-code search, sort, "show more" pagination, mobile filter drawer, quick view, shortlist, compare (3), add to inquiry with optional logo / colour / shade / packaging requests and quantity | `/[locale]/products`, `/[locale]/products/eyebrow`, `/[locale]/products/eyeliner`, `/[locale]/products/[category]`, `/[locale]/products/[category]/[slug]` |
| Customization Studio — 9-step real-time 3D configurator (family, silhouette, colours, finish, decoration, logo upload, shades/applicator, quantity, summary + print/PDF) | `/[locale]/customization-studio` |
| Inquiry list (persists across pages, print / save as PDF) | `/[locale]/inquiry` |
| Request a quote (validated form + secure API) | `/[locale]/contact`, `POST /api/inquiry` |
| Factory tour with lightbox (all 12 supplied photos) | `/[locale]/factory` |
| About · OEM/ODM Services · Quality & Process · How It Works · FAQ · Insights (3 guides) · Privacy · Terms | `/[locale]/…` |
| SEO: localized metadata, canonical + hreflang (en / zh-CN / x-default), Open Graph, sitemap, robots, JSON-LD (Organization, Breadcrumb, FAQ, Article, Service) | `/sitemap.xml`, `/robots.txt` |

### Languages

- Every page exists under `/en` and `/zh-cn`. A visitor without an explicit choice **always lands on English**
  (browser language is ignored). The EN / 中文 toggle keeps the current page and stores the choice in the
  `yalilai_locale` cookie.
- All copy lives in typed bilingual objects (`{ en, zh }`) in `src/content/*` and `src/data/*` — TypeScript fails the
  build if a translation is missing.

## Inquiry / RFQ delivery

The form validates on the client and again on the server (zod), checks a honeypot field and a minimum fill time,
rate-limits per IP, sniffs uploaded files by magic bytes (JPG/PNG/WebP/PDF, ≤ 3 files, ≤ 8 MB each), and
optionally verifies Cloudflare Turnstile.

Configure **at least one** provider in `.env.local` (copy from `.env.example`):

| Provider | Variables |
|---|---|
| Resend (email API) | `RESEND_API_KEY`, `INQUIRY_TO_EMAIL`, `INQUIRY_FROM_EMAIL` |
| SMTP mailbox | `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `INQUIRY_TO_EMAIL`, `INQUIRY_FROM_EMAIL` |
| Webhook (CRM, Zapier, Make, n8n…) | `INQUIRY_WEBHOOK_URL`, optional `INQUIRY_WEBHOOK_SECRET` (HMAC-SHA256 header) |
| Local testing only | `INQUIRY_DEV_STORE=1` → saves to `./.data/inquiries/` (disabled in production) |

Until a provider is configured the site **does not pretend** to send anything: the form shows
"Online submission is not connected yet", keeps the visitor's text, offers *Copy inquiry summary*, and points to
phone / WeChat. `GET /api/inquiry/status` reports `{ configured }` without exposing secrets.

## Imagery

- **Factory photos** (`public/images/factory/`) — the client's 12 on-site photos, converted from HEIC, resized,
  metadata (incl. GPS) removed, otherwise untouched. Captions describe only what is visible.
- **Catalogue photographs** (`public/images/catalog/`) — 139 product photos from the client-supplied reference
  catalogue, isolated on pure white (#FFFFFF) without retouching the products; any model with a brand mark or
  printed text on the product was excluded rather than edited. Provenance and QA: [`docs/catalog/`](docs/catalog/CATALOG-REPORT.md).
- **Illustrative renderings** (`public/images/editorial|hero|studio/`) — original photoreal renders produced by the
  procedural Blender pipeline in [`tools/product-renders`](tools/product-renders/README.md). No stock images,
  no hotlinks, no third-party branding.
- Manifests: [`docs/IMAGE-MANIFEST.md`](docs/IMAGE-MANIFEST.md) · shot list & prompts for real photography:
  [`docs/PHOTOGRAPHY-SHOT-LIST.md`](docs/PHOTOGRAPHY-SHOT-LIST.md).
- After adding/replacing images run `npm run images:manifest` (sizes + blur placeholders).

## Project structure

```
src/
  app/[locale]/…          routes (App Router), sitemap.ts, robots.ts, api/inquiry
  components/             layout, motion (GSAP), home, catalog, studio (three.js), inquiry, factory, ui
  content/                bilingual page copy (ui, home, contact, studio, pages, insights)
  data/                   company facts, taxonomy, 139 catalogue models (catalog-data.ts), factory photos, generated manifests
  i18n/                   locale config, client/server helpers
  lib/                    SEO, inquiry schema + delivery, rate limit, utils
  proxy.ts                locale routing (Next 16 "proxy", formerly middleware)
tools/product-renders/    Blender (bpy) procedural packaging + studio renderer
scripts/                  image preparation & manifest/doc generators
tests/                    Playwright end-to-end tests
docs/                     configuration checklist, image manifest, shot list
```

## Motion & accessibility

GSAP + ScrollTrigger drive split-headline reveals, a scroll-scrubbed rotating hero stage, pinned horizontal
category gallery, masked image reveals, parallax, drawn timeline, card tilt, magnetic CTAs, a pointer-only cursor
follower, marquees that pause offscreen and a light page-transition sweep. Everything is transform/opacity based
and respects `prefers-reduced-motion` (content is fully visible without JS). Keyboard navigation, visible focus,
skip link, native `<dialog>` modals, ARIA labelling and ≥ 4.5:1 text contrast are built in.

---

## دليل التشغيل السريع (عربي)

1. ثبّت Node.js (الإصدار 20.9 أو أحدث).
2. داخل مجلد المشروع نفّذ: `npm install` ثم `npm run dev` وافتح `http://localhost:3000` (يفتح بالإنجليزية افتراضيًا، والتبديل إلى الصينية من زر EN / 中文).
3. للمعاينة بنسخة الإنتاج: `npm run build` ثم `npm run start`.
4. لتفعيل إرسال طلبات عروض الأسعار فعليًا: انسخ `.env.example` إلى `.env.local` واملأ بيانات Resend أو SMTP أو Webhook، ثم أعد التشغيل.
5. راجع قائمة التحقق قبل النشر في `docs/CONFIGURATION-CHECKLIST.md`.
