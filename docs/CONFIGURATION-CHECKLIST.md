# Pre-launch configuration checklist

Everything below is either **missing information** (never invented on the site) or a **setting** that must
be configured before going public. Items marked 🔒 are required for launch.

## 1. Facts to confirm with Yalilai

| # | Item | Where to edit | Status now |
|---|---|---|---|
| 1 🔒 | English romanisation of the address ("No. 676 Beilu West Street…") | `src/data/company.ts → addressEn` | Provisional; Chinese address shown as authoritative |
| 2 🔒 | Registered legal name — the workshop signage reads **东阳市**雅丽莱化妆品有限公司 ("Dongyang Yalilai…"), the reception wall reads 雅丽莱化妆品有限公司 / Yalilai Cosmetics Co., Ltd. | `src/data/company.ts` | Uses the reception-wall name supplied in the brief |
| 3 | Business email address | `company.email` (shown automatically once set) | Hidden (null) |
| 4 | Public domain | `NEXT_PUBLIC_SITE_URL` | localhost |
| 5 | WhatsApp — only if explicitly approved | `company.whatsapp` | Not shown |
| 6 | Authentic WeChat QR image | add file to `public/images/contact/`, set `company.wechatQr` | Not shown (copy-ID button + tel: link instead) |
| 7 | Founding year, factory area, capacities | `company.ts` + About copy | Not published |
| 8 | Certifications / test reports | Only with documents in hand; About/Quality copy | No logos or claims shown |
| 9 🔒 | Approve the rebuilt catalogue: confirm rights to use the reference-catalogue photos, confirm Yalilai can supply each of the 139 models, decide the review items — see the approval checklist in `docs/catalog/CATALOG-REPORT.md` | `src/data/catalog-data.ts` | Awaiting approval; not published |
| 10 | Shade names / swatches you actually offer | `src/data/taxonomy.ts → shadeSets` | Representative examples |
| 11 | Equipment captions on factory photos (described generally) | `src/data/factory-photos.ts` | Visible facts only |

## 2. Technical configuration

| # | Item | How |
|---|---|---|
| 12 🔒 | Inquiry delivery: Resend **or** SMTP **or** webhook | Fill `.env.local` from `.env.example`; restart. `/api/inquiry/status` must return `configured: true` |
| 13 | Bot protection beyond honeypot + time-trap + rate limit | Optional Cloudflare Turnstile keys (may be slow in mainland China) |
| 14 | Multi-instance hosting | Replace the in-memory rate limiter (`src/lib/rate-limit.ts`) with Redis/Upstash |
| 15 🔒 | Indexing | Set `ALLOW_INDEXING=true` only at public launch |
| 16 🔒 | Privacy policy + terms | Templates in `src/content/pages.ts → legal`; have counsel complete them |
| 17 | Analytics / cookie banner | None installed (no tracking cookies are set today) |
| 18 | Hosting in/for mainland China | Consider ICP filing and a CN-reachable host; Google Fonts are self-hosted at build time by `next/font` |

## 3. Imagery

| # | Item |
|---|---|
| 19 | Replace reference-catalogue photos with Yalilai's own photography of approved samples (11 small-source models first) — see `docs/PHOTOGRAPHY-SHOT-LIST.md` and `docs/IMAGE-MANIFEST.md` |
| 20 | Add more genuine factory photos if desired (never AI-generated factory images) |
| 21 | Open Graph image: `public/images/og/yalilai-og.jpg` (generated from the hero render; replace if wanted) |
