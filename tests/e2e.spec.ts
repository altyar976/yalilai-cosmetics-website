import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

// Names that must never appear in public output (the source catalogue's manufacturer and third-party marks).
// Stored encoded so this file does not itself contain them.
const banned = new RegExp(["bGFuemk=", "5YWw5ae/", "5a6B5rOi", "bmluZ2Jv", "eWltdQ==", "eWluZ2NoYW8="].map((b) => Buffer.from(b, "base64").toString("utf8")).join("|"), "i");

const routes = [
  "",
  "/about",
  "/services",
  "/products",
  "/products/eyebrow",
  "/products/eyeliner",
  "/products/liquid-eyeliners",
  "/products/liquid-eyebrow-pens/yd-094-3-three-prong-brush-liquid-brow-pen",
  "/customization-studio",
  "/factory",
  "/quality",
  "/how-it-works",
  "/faq",
  "/insights",
  "/insights/how-to-brief-a-private-label-makeup-manufacturer",
  "/contact",
  "/inquiry",
  "/privacy",
  "/terms",
];

test("first visit lands on English even when the browser prefers Chinese", async ({ browser }) => {
  const ctx = await browser.newContext({ locale: "zh-CN", extraHTTPHeaders: { "Accept-Language": "zh-CN,zh;q=0.9" } });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await ctx.close();
});

for (const locale of ["en", "zh-cn"]) {
  test(`all main routes render without errors (${locale})`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const r of routes) {
      const res = await page.goto(`/${locale}${r}`);
      expect(res?.status(), `${locale}${r}`).toBe(200);
      await expect(page.locator("h1").first()).toBeVisible();
    }
    expect(errors).toEqual([]);
  });
}

test("language switch keeps the current page and remembers the explicit choice", async ({ page, context }) => {
  await page.goto("/en/products/eyeliner");
  await page.getByRole("link", { name: /简体中文/ }).first().click();
  await expect(page).toHaveURL(/\/zh-cn\/products\/eyeliner$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  const cookies = await context.cookies();
  expect(cookies.find((c) => c.name === "yalilai_locale")?.value).toBe("zh-cn");
  await page.goto("/");
  await expect(page).toHaveURL(/\/zh-cn$/);
});

test("catalogue filters update results and the URL", async ({ page }) => {
  await page.goto("/en/products");
  const count = page.getByText(/^\d+ models$/).first();
  await expect(count).toHaveText("139 models");
  await page.locator("aside").getByRole("button", { name: /^Multi-prong/ }).click();
  await expect(page).toHaveURL(/tip=multi-prong/);
  await expect(count).not.toHaveText("139 models");
});

test("catalogue paginates with Show more", async ({ page }) => {
  await page.goto("/en/products");
  await expect(page.getByText("Showing 24 of 139")).toBeVisible();
  await page.getByRole("button", { name: "Show more" }).click();
  await expect(page.getByText("Showing 48 of 139")).toBeVisible();
});

test("eyebrow and eyeliner collections lead the home page", async ({ page }) => {
  await page.goto("/en");
  const section = page.locator('section[aria-labelledby="ec-title"]');
  await expect(page.locator("#ec-title")).toHaveAttribute("aria-label", /Brows and eyeliner/);
  await section.scrollIntoViewIfNeeded(); // panels reveal on scroll
  await section.getByRole("link", { name: /Eyebrow Collection/ }).click();
  await expect(page).toHaveURL(/\/en\/products\/eyebrow$/);
  await expect(page.getByText("30 models").first()).toBeVisible();
});

test("search finds a model by code with or without the dash", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("button", { name: "Search catalogue" }).first().click();
  await page.getByRole("dialog").getByLabel("Search catalogue").fill("yd0943");
  await page.locator("#search-results").getByRole("button", { name: /YD-094-3/ }).first().click();
  await expect(page).toHaveURL(/yd-094-3-three-prong-brush-liquid-brow-pen$/);
});

test("old concept URLs redirect to the catalogue", async ({ page }) => {
  const res = await page.goto("/en/products/lipstick/satin-signature-lipstick");
  expect(res?.url()).toMatch(/\/en\/products$/);
  expect(res?.status()).toBe(200);
});

test("add a model with requests to the inquiry list and review it", async ({ page }) => {
  await page.goto("/en/products/liquid-eyebrow-pens/yd-094-3-three-prong-brush-liquid-brow-pen");
  await page.getByRole("button", { name: "Logo printing" }).click();
  await page.getByPlaceholder("e.g. 5,000 pcs per shade").fill("3000");
  await page.getByRole("button", { name: /Add to Inquiry/i }).first().click();
  await expect(page.getByText("Added to inquiry")).toBeVisible();
  await page.goto("/en/inquiry");
  await expect(page.getByRole("link", { name: "Three-Prong Brush Liquid Brow Pen" })).toBeVisible();
  await expect(page.getByText("YD-094-3").first()).toBeVisible();
  await expect(page.getByText(/Logo printing/).first()).toBeVisible();
});

test("public pages never mention the source catalogue's manufacturer", async ({ page }) => {
  for (const r of ["/en", "/zh-cn", "/en/products", "/en/products/eyeliner", "/zh-cn/products/eyebrow", "/en/products/liquid-eyeliners/yd-089-crystal-studded-liquid-eyeliner-pen"]) {
    await page.goto(r);
    expect(await page.content(), r).not.toMatch(banned);
  }
  for (const r of ["/sitemap.xml", "/robots.txt"]) {
    const body = await page.request.get(r).then((x) => x.text());
    expect(body, r).not.toMatch(banned);
  }
});

test("source files, docs and asset names never mention the source catalogue's manufacturer", () => {
  const walk = (dir: string): string[] => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
  const files = ["src", "docs", "public", "scripts"].flatMap(walk);
  const textual = /\.(tsx?|mjs|js|json|md|csv|txt|xml|svg)$/;
  const hits = files.filter((f) => banned.test(f) || (textual.test(f) && banned.test(readFileSync(f, "utf8"))));
  expect(hits).toEqual([]);
});

test("quote form validates and never fakes success without a configured provider", async ({ page }) => {
  await page.goto("/en/contact");
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.getByText("Please check the highlighted fields.")).toBeVisible();
  await page.getByLabel("Full name").fill("Test Buyer");
  await page.getByLabel("Brand / company").fill("Test Brand");
  await page.getByLabel("Country / region").fill("France");
  await page.getByLabel("Email").fill("buyer@example.com");
  await page.getByLabel(/^Message/).fill("We would like a quote for a matte lipstick line.");
  await page.getByRole("checkbox").check();
  await page.waitForTimeout(3200); // human-speed submission (time-trap)
  await page.getByRole("button", { name: "Send inquiry" }).click();
  const status = await page.request.get("/api/inquiry/status").then((r) => r.json());
  if (status.configured) {
    await expect(page.getByText(/your inquiry has been sent/i)).toBeVisible();
  } else {
    await expect(page.getByText("Online submission is not connected yet.")).toBeVisible();
    await expect(page.getByText(/has been sent/i)).toHaveCount(0);
  }
});

test("customization studio walks through to the summary", async ({ page }) => {
  await page.goto("/en/customization-studio?family=mascara");
  await expect(page.getByText("Step 2 of 9")).toBeVisible();
  for (let i = 0; i < 7; i++) await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("heading", { name: "Review your concept" })).toBeVisible();
  await page.getByRole("button", { name: "Add to inquiry", exact: true }).click();
  await page.goto("/en/inquiry");
  await expect(page.getByText(/Studio concept/)).toBeVisible();
});

test("hero stage turns and the headline eases out while the hero is pinned", async ({ page }) => {
  await page.goto("/en");
  const canvas = page.locator("section canvas").first();
  await expect(canvas).toHaveCSS("opacity", "1", { timeout: 20_000 });
  const sample = () =>
    page.evaluate(() => {
      const c = document.querySelector<HTMLCanvasElement>("section canvas")!;
      const data = c.getContext("2d")!.getImageData((c.width / 2) | 0, (c.height / 2) | 0, 40, 40).data;
      let sum = 0;
      for (let i = 0; i < data.length; i += 4) sum += data[i];
      return { sum, copy: Number(getComputedStyle(document.querySelector("[data-hero-copy]")!).opacity) };
    });
  await page.waitForTimeout(2000); // intro turn settles
  const before = await sample();
  // stay inside the desktop pin (60% of the viewport)
  await page.mouse.wheel(0, 300);
  await expect.poll(async () => (await sample()).sum, { timeout: 5_000 }).not.toBe(before.sum);
  await expect.poll(async () => (await sample()).copy, { timeout: 5_000 }).toBeLessThan(before.copy);
});

test("unknown pages show the localized 404", async ({ page }) => {
  const res = await page.goto("/zh-cn/does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByText("未找到该页面。")).toBeVisible();
});

test("mobile navigation opens and links work @mobile", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("button", { name: "Menu" }).click();
  await page.locator("#mobile-menu").getByRole("link", { name: /Factory Tour/ }).click();
  await expect(page).toHaveURL(/\/en\/factory$/);
});
