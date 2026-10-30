# Catalogue rebuild report / 产品目录重建报告

**Status: NOT PUBLISHED — awaiting the client's approval (Gate H).** Nothing in this rebuild has been deployed
or pushed. Rollback point: git tag `pre-catalog-rebuild`.

This report documents how the 56 illustrative concepts were replaced by 139 reference models taken from the
four-part reference catalogue supplied by the client, what was excluded and why, and what must be confirmed
before publication. The per-model source mapping is in [`catalog-manifest.csv`](catalog-manifest.csv) /
[`catalog-manifest.json`](catalog-manifest.json). The source manufacturer is deliberately never named in this repository.

## 1. Source coverage (Gate A)

| Part | Pages | Status |
|---|---|---|
| Catalogue part 1 | 1–25 | received, every page reviewed |
| Catalogue part 2 | 26–57 | received, every page reviewed |
| Catalogue part 3 | 58–97 | received, every page reviewed |
| Catalogue part 4 | 98–138 | received, every page reviewed |

- **138 / 138 pages processed**, contiguous, no part missing. Product pages were rendered at 300 dpi and audited
  page by page (each spread holds one or two models).
- **Non-product pages — nothing taken from them** (company identity, factory, certificates, process and component
  displays, marketing collage): p1 front cover (company identity), p2 contents, p3 company profile, p4 factory, p5 quality, p6 testing, p7 certificates, p8 packaging development process, p9 material development process, p10 nib component display (no model codes), p11 brush-head component display (no model codes), p12 brow-pencil tip shapes (no model codes), p13 barrel finish samples (includes third-party prints), p14 marketing collage (includes third-party branded product), p137 closing page, p138 back cover (company identity).
- **Product pages with no usable model**: p22 (two-in-one tip-variant arrays, no model code printed), p23 (same), p24 (same), p25 (same), p26 (same), p96 (YD-128 colour arrays - source wordmark on every barrel).
- Printed catalogue page numbers were not recorded; references use the PDF page within each part and the overall page.

## 2. Before / after

| | Before | After |
|---|---|---|
| Products | 56 illustrative concepts (3D renders) | **139 reference models** (catalogue photographs, model codes preserved) |
| Categories | 7 (mascara, lip gloss, lip liner, lipstick, face, eyes, prep & care) | **8** + 2 headline collections |
| Eyebrow collection | — | **30 models** (dedicated page `/products/eyebrow`, featured right under the home hero) |
| Eyeliner collection | — | **68 models** (dedicated page `/products/eyeliner`, featured right under the home hero) |
| Models reviewed | — | 175 (139 included, 36 excluded) |

| Category | Models |
|---|---|
| Eyebrow Pencils & Brow Gels (`eyebrow-pencils`) | 20 |
| Liquid Eyebrow Pens (`liquid-eyebrow-pens`) | 10 |
| Liquid Eyeliner Pens (`liquid-eyeliners`) | 50 |
| Gel Eyeliner Pencils (`gel-eyeliners`) | 9 |
| Dip Eyeliners (`dip-eyeliners`) | 9 |
| Dual-Ended Eye Pens (`dual-ended-pens`) | 18 |
| Lip Liners & Lip Pens (`lip-liners-pens`) | 15 |
| Face & Specialty Pens (`face-specialty-pens`) | 8 |

Categories were chosen from what the photographed products genuinely are; no category was created without
products. Old concept URLs (`/products/mascara`, `/products/lipstick/...` etc.) redirect permanently (308) to the catalogue.

## 3. Exclusions (36 models — not published)

Rule applied: any model whose product carries the source manufacturer's mark, another brand's mark, or printed
claims/text is excluded **as a whole**. No logo was erased, blurred, covered or retouched to make a model eligible.

| Reason | Models |
|---|---|
| Source manufacturer's mark on product | 18 |
| Third-party brand mark on product | 12 |
| Printed text / marketing claims on product | 5 |
| Needs review (uncertain mark) | 1 |

| Model | Part / page | Reason | Detail |
|---|---|---|---|
| YD-067B | part 1, p16 (overall 16R) | Third-party brand mark on product | third-party brand wordmark and Chinese brand name printed on every barrel |
| YD-067-6 | part 1, p19 (overall 19R) | Source manufacturer's mark on product | manufacturer wordmark printed on barrel |
| YD-079 | part 1, p21 (overall 21R) | Source manufacturer's mark on product | source round logo printed on barrels |
| YD-088 | part 2, p2 (overall 27L) | Third-party brand mark on product | third-party brand prints ('Brow Full', 'YMZY ...') on barrels |
| YD-088-1 | part 2, p3 (overall 28L) | Third-party brand mark on product | third-party brand logo printed on barrels |
| YD-110 | part 2, p7 (overall 32L) | Third-party brand mark on product | third-party brand wordmark printed on barrels |
| YD-110-1 | part 2, p7 (overall 32R) | Third-party brand mark on product | third-party brand wordmark printed on barrels |
| YD-132 | part 2, p11 (overall 36L) | Third-party brand mark on product | third-party brand wordmark and print on barrels |
| YD-022 | part 2, p14 (overall 39L) | Source manufacturer's mark on product | source wordmark printed on barrels |
| YD-094-1 | part 2, p15 (overall 40R) | Third-party brand mark on product | third-party Chinese brand name printed on barrel |
| YD-023 | part 2, p26 (overall 51R) | Printed text / marketing claims on product | printed text and Chinese brand copy on barrels |
| YD-026 | part 2, p29 (overall 54R) | Source manufacturer's mark on product | printed wordmark matching the source company's e-mail domain |
| YD-028 | part 2, p30 (overall 55L) | Source manufacturer's mark on product | source wordmark printed on barrels |
| YD-036 | part 3, p1 (overall 58R) | Printed text / marketing claims on product | marketing claim text printed on every barrel |
| YD-065 | part 3, p4 (overall 61L) | Printed text / marketing claims on product | printed wordmark ('CHINESE BEAUTY...') on the barrel band |
| YD-068 | part 3, p5 (overall 62R) | Third-party brand mark on product | third-party Chinese brand name printed on barrels |
| YD-075J | part 3, p10 (overall 67L) | Needs review (uncertain mark) | NEEDS_REVIEW - unidentified emblem embossed on the barrel end caps |
| YD-106-2 | part 3, p20 (overall 77R) | Third-party brand mark on product | third-party brand logo and script printed on barrels |
| YD-111 | part 3, p23 (overall 80R) | Printed text / marketing claims on product | marketing claim text printed on barrels |
| YD-131 | part 3, p26 (overall 83R) | Printed text / marketing claims on product | printed label text (brand copy, dates) on barrels |
| YD-072A | part 3, p31 (overall 88L) | Source manufacturer's mark on product | source logo printed on one barrel |
| YD-072B | part 3, p32 (overall 89L) | Source manufacturer's mark on product | source wordmark printed on barrels |
| YD-072-2 | part 3, p32 (overall 89R) | Source manufacturer's mark on product | source wordmark printed on barrels |
| YD-084 | part 3, p33 (overall 90L) | Source manufacturer's mark on product | source logo printed on barrel |
| YD-087 | part 3, p33 (overall 90R) | Third-party brand mark on product | third-party brand wordmark printed on barrels |
| YD-093 | part 3, p34 (overall 91R) | Source manufacturer's mark on product | source logo printed on barrels |
| YD-128 | part 3, p38 (overall 95L) | Source manufacturer's mark on product | source wordmark printed on every barrel of this model's colour range on the following spread |
| YD-128-4 | part 4, p2 (overall 99L) | Source manufacturer's mark on product | source wordmark printed on barrel |
| YD-128-5 | part 4, p2 (overall 99R) | Source manufacturer's mark on product | source wordmark printed on barrels |
| YD-029 | part 4, p3 (overall 100R) | Source manufacturer's mark on product | source wordmark printed on body |
| YD-007 | part 4, p6 (overall 103L) | Source manufacturer's mark on product | source wordmark on every barrel of colour range; brand script on hero |
| YD-112 | part 4, p11 (overall 108L) | Third-party brand mark on product | third-party brand wordmark printed on barrels |
| YD-127 | part 4, p12 (overall 109L) | Source manufacturer's mark on product | source wordmark printed on barrels |
| YD-151-1 | part 4, p19 (overall 116R) | Source manufacturer's mark on product | source wordmark printed on barrel |
| YD-083 | part 4, p31 (overall 128R) | Source manufacturer's mark on product | source wordmark printed on barrel; same code reused on the next spread |
| YD-083T-plastic | part 4, p33 (overall 130R) | Third-party brand mark on product | third-party Chinese brand name and logo printed on barrels |

## 4. Included models that need a decision (17)

| Model | Status | Detail |
|---|---|---|
| YD-031 | PARTIAL_CROP | gold sample carries decorative printed text - cropped to the three unprinted samples |
| YD-032 | PARTIAL_CROP | first sample printed 'EYES EYELINER' - cropped to the four unprinted samples |
| YD-074-1 | IMAGE_REVIEW_REQUIRED | small source photo: 613x999 px native, shown at 1.25× without enhancement |
| YD-086 | IMAGE_REVIEW_REQUIRED | small source photo: 772x976 px native, shown at 1.25× without enhancement |
| YD-001 | PARTIAL_CROP | two samples carry third-party prints - cropped to the three unprinted samples |
| YD-082 | PARTIAL_CROP | third sample carries an unidentified print - cropped to the two unprinted samples |
| YD-108 | PARTIAL_CROP | two samples printed 'EYEBROW GEL' and line art - cropped to the unprinted brown samples |
| YD-180 | CONFIRM_MOULDED_CODE | comb spine carries a moulded resin/material code ('PA'), not a brand mark - confirm |
| YD-300 | IMAGE_REVIEW_REQUIRED | small source photo: 280x772 px native, shown at 1.25× without enhancement |
| YD-301 | IMAGE_REVIEW_REQUIRED | small source photo: 280x878 px native, shown at 1.25× without enhancement |
| YD-302 | IMAGE_REVIEW_REQUIRED | small source photo: 321x974 px native, shown at 1.25× without enhancement |
| YD-303 | IMAGE_REVIEW_REQUIRED | small source photo: 354x892 px native, shown at 1.25× without enhancement |
| YD-304 | IMAGE_REVIEW_REQUIRED | small source photo: 388x879 px native, shown at 1.25× without enhancement |
| YD-305 | IMAGE_REVIEW_REQUIRED | small source photo: 367x870 px native, shown at 1.25× without enhancement |
| YD-306 | IMAGE_REVIEW_REQUIRED | small source photo: 349x898 px native, shown at 1.25× without enhancement |
| YD-307 | IMAGE_REVIEW_REQUIRED | small source photo: 294x888 px native, shown at 1.25× without enhancement |
| YD-308 | IMAGE_REVIEW_REQUIRED | small source photo: 305x818 px native, shown at 1.25× without enhancement |

- **PARTIAL_CROP (5)** — the source photo shows several samples and some carry third-party or decorative
  prints (none carry the source manufacturer's mark). Only the unprinted samples were cropped; nothing was
  retouched. If you prefer, these 5 models can be excluded entirely.
- **CONFIRM_MOULDED_CODE (1)** — YD-180's comb spine carries a small moulded material code; it is not a brand mark
  but please confirm.
- **IMAGE_REVIEW_REQUIRED (11)** — see section 5. These are published with a visible note that a
  higher-resolution photo is available on request.

## 5. Image processing and limitations (Gate E)

- Pipeline: 300 dpi page render → product isolated on pure white **#FFFFFF** by local-background matting (no
  generative fill, no AI upscaling, no colour or shape changes) → centred on a fixed **1600 × 2000 (4:5)**
  canvas with a common baseline → WebP master (q90, all metadata stripped) → next/image serves AVIF/WebP
  derivatives per screen size, with blur placeholders.
- All 139 masters verified: 1600 × 2000, border pixels pure white, no EXIF/XMP/ICC metadata, neutral file names
  (`yd-xxx-descriptive-name.webp`).
- **Resolution honesty:** the catalogue photos are small. Native product height ranges from 772 px to
  1667 px (median 1354 px) — **only 2 models have 1600 px or more of
  real detail**; most are 1300–1500 px. Scaling ranges from 0.96× to 1.25× (the cap; 22 models
  reach it), so smaller sources sit smaller on the canvas rather than being artificially enlarged or sharpened.
- 11 models come from sources under 1000 px tall (YD-074-1, YD-086, YD-300, YD-301, YD-302, YD-303, YD-304, YD-305, YD-306, YD-307, YD-308) and are flagged
  IMAGE_REVIEW_REQUIRED. They are acceptable as thumbnails but should be re-photographed first.
- Recommended before launch: replace with Yalilai's own photography of approved samples — brief in
  [`../PHOTOGRAPHY-SHOT-LIST.md`](../PHOTOGRAPHY-SHOT-LIST.md).

## 6. Data and claims (Gate B)

| Field | Source | Notes |
|---|---|---|
| Model code | printed in the catalogue | preserved exactly (e.g. `YD-094-3`, `YD-017T`, `YD-066-1`) |
| Dimensions | printed outsize spec | used only where legible |
| Capacity / weight | printed spec | only where legible; otherwise omitted |
| Name (EN / 中文) | written for this site from the visible product | descriptive, not a supplier trade name |
| Format, tip, features | from the photo and printed spec | used for filters |
| Description | template built only from the fields above | no performance, safety or quality claims |
| MOQ, lead time, price | **not published** | shown as "Confirmed after reviewing your brief" |

Not copied from the catalogue: patent / "专利产品" marks, certifications, test results, exclusive-formula or
approval claims, factory and company photos, contact details, QR codes, watermarks.

## 7. Brand-safety checks (Gate D)

- Automated tests fail the build if the source manufacturer's name (EN/中文), its location name or the
  third-party marks seen in the catalogue appear in rendered pages, the sitemap, robots.txt, or any file name or
  text file under `src/`, `docs/`, `public/` or `scripts/`. The banned list is stored encoded in the test.
- Manual scan of the production build output (`.next`), all repository files, file names and the git history: no matches.
- Product JSON-LD contains identification only (name, sku/mpn = model code, category, description, image, URL) — no brand,
  offer, rating or claim.
- The extraction tooling and the private manifest that contain the original PDF file names are kept **outside**
  this repository.

## 8. QA results (Gates F–G)

| Check | Result |
|---|---|
| TypeScript · ESLint | pass |
| Production build (`next build`) | pass |
| Playwright e2e (17 tests: routes EN/中文, filters, pagination, collections, model search, redirects, add-to-inquiry with requests, RFQ form honesty, brand-safety, mobile nav) | 17 / 17 pass |
| Crawl of all sitemap URLs (production server) | 326 pages 200 · 269 internal links OK · all images 200 · 0 duplicate titles · every page has description + canonical · JSON-LD valid |
| Data integrity | 139 unique model codes and slugs · no empty category · 139 image files present |
| Mobile (390 px) | no horizontal overflow; filter drawer, chips and product page verified |

## 9. Approval checklist (Gate H — required before publication)

- [ ] Confirm Yalilai has the right / permission to use the reference-catalogue product photographs on its website.
- [ ] Confirm Yalilai can actually supply each of the 139 models (remove any it cannot) — see the manifest.
- [ ] Review the sample gallery and the preview pages (home, `/products`, `/products/eyebrow`, `/products/eyeliner`, product pages).
- [ ] Decide the 5 PARTIAL_CROP models (keep cropped, or exclude).
- [ ] Confirm YD-180 (moulded material code on the comb).
- [ ] Decide YD-075J (NEEDS_REVIEW, currently excluded — emblem on the end caps).
- [ ] Accept the 11 small-source images for now, or hold them until re-photographed.
- [ ] Check the English and Chinese product names.
- [ ] Explicit approval to commit-push / deploy. Until then the work stays local only.
