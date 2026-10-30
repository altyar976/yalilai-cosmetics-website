"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Printer, RotateCcw, Rotate3D, Trash2, Box, PackageOpen } from "lucide-react";
import { useHref, useT } from "@/i18n/locale-context";
import { studio } from "@/content/studio";
import { ui } from "@/content/ui";
import type { L } from "@/data/taxonomy";
import { useInquiry } from "@/store/inquiry";
import { announceAdded } from "@/components/inquiry/InquiryToast";
import { cn } from "@/lib/utils";
import {
  accentPalette,
  colourName,
  decorations,
  defaultConfig,
  families,
  familyIds,
  finishesOpt,
  inkPalette,
  palette,
  specialBodies,
  type Family,
  type StudioConfig,
} from "./studio-config";
import type { ViewerHandle } from "./Viewer3D";
import type { LabelArt } from "./three/models";

const Viewer3D = dynamic(() => import("./Viewer3D"), { ssr: false });

type Draft = {
  config: StudioConfig;
  step: number;
  shades: string[];
  quantity: string;
  notes: string;
  brandText: string;
  logoMode: "mono" | "original";
  set: (p: Partial<Omit<Draft, "set" | "reset">>) => void;
  setConfig: (p: Partial<StudioConfig>) => void;
  reset: (f?: Family) => void;
};

const useDraft = create<Draft>()(
  persist(
    (set, get) => ({
      config: defaultConfig("lipstick"),
      step: 0,
      shades: [],
      quantity: "",
      notes: "",
      brandText: "",
      logoMode: "mono",
      set: (p) => set(p),
      setConfig: (p) => set({ config: { ...get().config, ...p } }),
      reset: (f) => set({ config: defaultConfig(f ?? get().config.family), step: f ? 1 : 0, shades: [], quantity: "", notes: "" }),
    }),
    {
      name: "yalilai-studio-draft-v1",
      skipHydration: true,
      storage: createJSONStorage(() => {
        try {
          return window.localStorage;
        } catch {
          const m = new Map<string, string>();
          return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) };
        }
      }),
    },
  ),
);

const LOGO_KEY = "yalilai-studio-logo";
const MAX_LOGO = 5 * 1024 * 1024;

function sniff(buf: Uint8Array) {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (String.fromCharCode(...buf.slice(0, 4)) === "RIFF" && String.fromCharCode(...buf.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

/** Turn a logo into a white-on-transparent mask (alpha if present, otherwise darkness). */
function toMask(src: HTMLCanvasElement) {
  const c = document.createElement("canvas");
  c.width = src.width;
  c.height = src.height;
  const ctx = c.getContext("2d")!;
  const d = src.getContext("2d")!.getImageData(0, 0, src.width, src.height);
  let hasAlpha = false;
  for (let i = 3; i < d.data.length; i += 4 * 7) if (d.data[i] < 240) hasAlpha = true;
  const out = ctx.createImageData(src.width, src.height);
  for (let i = 0; i < d.data.length; i += 4) {
    const lum = (0.299 * d.data[i] + 0.587 * d.data[i + 1] + 0.114 * d.data[i + 2]) / 255;
    const a = hasAlpha ? d.data[i + 3] / 255 : Math.max(0, Math.min(1, (0.82 - lum) / 0.5));
    out.data[i] = out.data[i + 1] = out.data[i + 2] = 255;
    out.data[i + 3] = Math.round(a * 255);
  }
  ctx.putImageData(out, 0, 0);
  return c;
}

async function loadCanvas(dataUrl: string) {
  const img = new window.Image();
  img.decoding = "async";
  img.src = dataUrl;
  await img.decode();
  const max = 900;
  const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(img.naturalWidth * s));
  c.height = Math.max(1, Math.round(img.naturalHeight * s));
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c;
}

export function StudioApp() {
  const t = useT();
  const href = useHref();
  const router = useRouter();
  const params = useSearchParams();
  const d = useDraft();
  const { config, step } = d;
  const fam = families[config.family];
  const viewer = useRef<ViewerHandle>(null);
  const [hydrated, setHydrated] = useState(false);
  const [webgl, setWebgl] = useState<"loading" | "ok" | "fail">("loading");
  const [open, setOpen] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [logo, setLogo] = useState<{ original: HTMLCanvasElement; mono: HTMLCanvasElement; name: string } | null>(null);
  const [logoErr, setLogoErr] = useState("");
  const [added, setAdded] = useState(false);
  const addItem = useInquiry((s) => s.add);

  // Hydrate draft + logo, honour ?family=
  useEffect(() => {
    void Promise.resolve(useDraft.persist.rehydrate()).then(() => {
      const f = params.get("family") as Family | null;
      if (f && familyIds.includes(f) && useDraft.getState().config.family !== f) {
        useDraft.setState({ config: defaultConfig(f), step: 1, shades: [] });
      }
      setHydrated(true);
    });
    try {
      const saved = sessionStorage.getItem(LOGO_KEY);
      if (saved) {
        const { dataUrl, name } = JSON.parse(saved) as { dataUrl: string; name: string };
        loadCanvas(dataUrl).then((c) => setLogo({ original: c, mono: toMask(c), name }));
      }
    } catch {
      /* storage unavailable */
    }
    const probe = requestAnimationFrame(() => {
      try {
        const c = document.createElement("canvas");
        if (!(c.getContext("webgl2") || c.getContext("webgl"))) setWebgl("fail");
      } catch {
        setWebgl("fail");
      }
    });
    return () => cancelAnimationFrame(probe);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const art: LabelArt = useMemo(
    () => ({ text: d.brandText, logo: logo ? (d.logoMode === "original" ? logo.original : logo.mono) : null, logoMode: d.logoMode }),
    [d.brandText, d.logoMode, logo],
  );

  const goto = (n: number) => {
    d.set({ step: Math.max(0, Math.min(8, n)) });
    setAdded(false);
    if (window.matchMedia("(max-width: 1023px)").matches) document.getElementById("studio-steps")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onLogo = async (file: File | undefined) => {
    setLogoErr("");
    if (!file) return;
    if (file.size > MAX_LOGO) return setLogoErr(t(studio.logo.tooBig));
    const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    if (!sniff(head)) return setLogoErr(t(studio.logo.invalidType));
    try {
      const url = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result));
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const c = await loadCanvas(url);
      setLogo({ original: c, mono: toMask(c), name: file.name.slice(0, 80) });
      try {
        sessionStorage.setItem(LOGO_KEY, JSON.stringify({ dataUrl: c.toDataURL("image/png"), name: file.name.slice(0, 80) }));
      } catch {
        /* quota exceeded — keep in memory only */
      }
    } catch {
      setLogoErr(t(studio.logo.unreadable));
    }
  };

  const buildSummary = (tr: (l: L) => string): { k: L; v: string }[] => {
    const sil = fam.silhouettes.find((s) => s.id === config.silhouette);
    const app = fam.applicators.find((a) => a.id === config.applicator);
    const dec = decorations.find((x) => x.id === config.decoration)!;
    const fin = finishesOpt.find((x) => x.id === config.finish)!;
    const shadeNames = d.shades.map((hex) => fam.shades.find((s) => s.hex === hex)).filter(Boolean).map((s) => tr(s!.name));
    return [
      { k: studio.summary.family, v: tr(fam.label) },
      { k: studio.summary.silhouette, v: sil ? tr(sil.label) : "—" },
      { k: studio.summary.colours, v: `${tr(studio.body)}: ${tr(colourName(config.bodyColor))} · ${tr(studio.cap)}: ${tr(colourName(config.capColor))} · ${tr(studio.accent)}: ${tr(colourName(config.accentColor))}` },
      { k: studio.summary.finish, v: tr(fin.label) },
      { k: studio.summary.decoration, v: `${tr(dec.label)}${config.decoration === "screen-print" ? ` (${tr(studio.ink)} ${tr(colourName(config.inkColor))})` : ""}${d.brandText ? ` · “${d.brandText}”` : ""}` },
      { k: studio.summary.logo, v: logo ? `${tr(studio.summary.logoYes)} — ${logo.name}` : tr(studio.summary.logoNo) },
      { k: studio.summary.shades, v: shadeNames.join(", ") || "—" },
      ...(app ? [{ k: studio.summary.applicator, v: tr(app.label) }] : []),
      { k: studio.summary.quantity, v: d.quantity || "—" },
      ...(d.notes ? [{ k: studio.summary.notes, v: d.notes }] : []),
    ];
  };
  const summary = buildSummary(t);

  const addToInquiry = (thenQuote: boolean) => {
    const preview = webgl === "ok" ? viewer.current?.snapshot(360) ?? undefined : undefined;
    const en = (l: L) => l.en;
    const zh = (l: L) => l.zh;
    const sEn = buildSummary(en);
    const sZh = buildSummary(zh);
    const lines: L[] = sEn.map((row, i) => ({ en: `${row.k.en}: ${row.v}`, zh: `${sZh[i].k.zh}：${sZh[i].v}` }));
    const title: L = { en: `${studio.summary.title.en} — ${en(fam.label)}`, zh: `${studio.summary.title.zh}——${zh(fam.label)}` };
    addItem({
      kind: "studio",
      title,
      image: fam.image,
      preview,
      lines,
      studio: {
        family: config.family,
        silhouette: config.silhouette,
        bodyColor: config.bodyColor,
        capColor: config.capColor,
        accentColor: config.accentColor,
        finish: config.finish,
        decoration: config.decoration,
        inkColor: config.inkColor,
        hasLogo: !!logo,
        logoName: logo?.name,
        shades: d.shades,
        applicator: config.applicator,
        quantity: d.quantity,
        notes: d.notes,
      },
    });
    announceAdded({ title, image: fam.image });
    setAdded(true);
    if (thenQuote) router.push(href("/contact"));
  };

  const swatch = (hex: string, active: boolean, onClick: () => void, label: string) => (
    <button
      key={hex}
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn("h-9 w-9 rounded-full border border-ink/10 transition", active && "ring-1 ring-ink ring-offset-2 ring-offset-porcelain")}
      style={{
        background:
          hex === "clear"
            ? "linear-gradient(135deg,#fff 0 45%,#e8eef2 45% 55%,#fff 55%)"
            : hex === "frost"
              ? "linear-gradient(135deg,#f3f1ee,#dedad4)"
              : hex,
      }}
    />
  );

  const colourRow = (label: L, key: "bodyColor" | "capColor", allowClear: boolean) => (
    <fieldset className="mb-7">
      <legend className="label">
        {t(label)} — <span className="normal-case tracking-normal text-ink">{t(colourName(config[key]))}</span>
      </legend>
      <div className="flex flex-wrap gap-2.5">
        {allowClear && specialBodies.map((s) => swatch(s.id, config[key] === s.id, () => d.setConfig({ [key]: s.id }), t(s.name)))}
        {palette.map((p) => swatch(p.hex, config[key].toLowerCase() === p.hex, () => d.setConfig({ [key]: p.hex }), t(p.name)))}
        <label className="relative flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-ink/30" title={t(studio.custom)}>
          <span className="sr-only">{t(studio.custom)}</span>
          <span aria-hidden="true" className="text-lg leading-none text-muted">+</span>
          <input
            type="color"
            value={/^#/.test(config[key]) ? config[key] : "#ffffff"}
            onChange={(e) => d.setConfig({ [key]: e.target.value })}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
      </div>
    </fieldset>
  );

  const stepBody = () => {
    switch (step) {
      case 0:
        return (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {familyIds.map((f) => (
              <li key={f}>
                <button
                  type="button"
                  aria-pressed={config.family === f}
                  onClick={() => {
                    if (config.family !== f) useDraft.setState({ config: defaultConfig(f), shades: [] });
                    goto(1);
                  }}
                  className={cn("group block w-full overflow-hidden rounded-2xl border text-left transition", config.family === f ? "border-ink" : "border-ink/10 hover:border-ink/40")}
                >
                  <span className="relative block aspect-square bg-render">
                    <Image src={families[f].image} alt="" fill sizes="180px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  </span>
                  <span className="block p-3">
                    <span className="block text-sm font-medium">{t(families[f].label)}</span>
                    <span className="block text-xs text-muted">{t(families[f].desc)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        );
      case 1:
        return (
          <div className="flex flex-wrap gap-2">
            {fam.silhouettes.map((s) => (
              <button key={s.id} type="button" className="chip !px-4 !py-2.5 text-sm" aria-pressed={config.silhouette === s.id} onClick={() => d.setConfig({ silhouette: s.id })}>
                {t(s.label)}
              </button>
            ))}
          </div>
        );
      case 2:
        return (
          <div>
            {colourRow(studio.body, "bodyColor", fam.bodyClear)}
            {colourRow(studio.cap, "capColor", config.family === "foundation")}
            <fieldset>
              <legend className="label">
                {t(studio.accent)} — <span className="normal-case tracking-normal text-ink">{t(colourName(config.accentColor))}</span>
              </legend>
              <div className="flex flex-wrap gap-2.5">{accentPalette.map((hex) => swatch(hex, config.accentColor === hex, () => d.setConfig({ accentColor: hex }), t(colourName(hex))))}</div>
            </fieldset>
          </div>
        );
      case 3:
        return (
          <ul className="space-y-2">
            {finishesOpt.map((f) => (
              <li key={f.id}>
                <button type="button" aria-pressed={config.finish === f.id} onClick={() => d.setConfig({ finish: f.id })} className={cn("flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition", config.finish === f.id ? "border-ink bg-porcelain" : "border-ink/10 hover:border-ink/40")}>
                  <span>
                    <span className="block font-medium">{t(f.label)}</span>
                    <span className="block text-xs text-muted">{t(f.desc)}</span>
                  </span>
                  {config.finish === f.id && <Check className="h-4 w-4" />}
                </button>
              </li>
            ))}
            {(config.bodyColor === "clear" || config.bodyColor === "frost") && (
              <li className="text-xs text-muted">{t({ en: "Clear and frosted bodies keep their transparency; the finish applies to the other components.", zh: "透明与磨砂管身保持通透效果，表面效果作用于其他部件。" })}</li>
            )}
          </ul>
        );
      case 4:
        return (
          <div className="space-y-6">
            <ul className="space-y-2">
              {decorations.map((x) => (
                <li key={x.id}>
                  <button type="button" aria-pressed={config.decoration === x.id} onClick={() => d.setConfig({ decoration: x.id })} className={cn("flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition", config.decoration === x.id ? "border-ink bg-porcelain" : "border-ink/10 hover:border-ink/40")}>
                    <span>
                      <span className="block font-medium">{t(x.label)}</span>
                      <span className="block text-xs text-muted">{t(x.desc)}</span>
                    </span>
                    {config.decoration === x.id && <Check className="h-4 w-4" />}
                  </button>
                </li>
              ))}
            </ul>
            {config.decoration === "screen-print" && (
              <fieldset>
                <legend className="label">{t(studio.ink)}</legend>
                <div className="flex flex-wrap gap-2.5">{inkPalette.map((hex) => swatch(hex, config.inkColor === hex, () => d.setConfig({ inkColor: hex }), hex))}</div>
              </fieldset>
            )}
            <label className="block">
              <span className="label">{t(studio.brandText)}</span>
              <input value={d.brandText} onChange={(e) => d.set({ brandText: e.target.value.slice(0, 24) })} maxLength={24} className="field" placeholder="YOUR BRAND" />
              <span className="mt-1.5 block text-xs text-muted">{t(studio.brandTextHint)}</span>
            </label>
          </div>
        );
      case 5:
        return (
          <div className="space-y-5">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/25 bg-porcelain px-6 py-8 text-center transition hover:border-ink/60">
              <ImagePlus className="h-6 w-6 text-muted" strokeWidth={1.25} />
              <span className="font-medium">{t(studio.logo.upload)}</span>
              <span className="max-w-sm text-xs text-muted">{t(studio.logo.hint)}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(e) => {
                  void onLogo(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            {logoErr && (
              <p role="alert" className="text-sm text-danger">
                {logoErr}
              </p>
            )}
            {logo ? (
              <div className="flex items-center gap-4 rounded-2xl bg-linen p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo.original.toDataURL()} alt="" className="h-14 w-14 rounded-lg bg-porcelain object-contain p-1" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{logo.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["mono", "original"] as const).map((m) => (
                      <button key={m} type="button" className="chip !py-1 text-xs" aria-pressed={d.logoMode === m} onClick={() => d.set({ logoMode: m })}>
                        {t(studio.logo[m])}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLogo(null);
                    try {
                      sessionStorage.removeItem(LOGO_KEY);
                    } catch {
                      /* ignore */
                    }
                  }}
                  aria-label={t(studio.logo.remove)}
                  className="rounded-full p-2 hover:bg-porcelain"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className="text-sm text-muted">{t(studio.logo.noneHint)}</p>
            )}
          </div>
        );
      case 6:
        return (
          <div className="space-y-7">
            <fieldset>
              <legend className="label">{t(ui.catalog.shades)}</legend>
              <p className="mb-3 text-xs text-muted">{t(studio.shadesHint)}</p>
              <div className="flex flex-wrap gap-2.5">
                {fam.shades.map((s) => {
                  const on = d.shades.includes(s.hex);
                  return (
                    <button
                      key={`${s.hex}-${s.name.en}`}
                      type="button"
                      aria-pressed={on}
                      title={t(s.name)}
                      aria-label={t(s.name)}
                      onClick={() => {
                        const next = on ? d.shades.filter((h) => h !== s.hex) : [...d.shades, s.hex];
                        d.set({ shades: next });
                        d.setConfig({ shade: next[0] ?? families[config.family].defaults.shade ?? s.hex });
                      }}
                      className={cn("relative h-10 w-10 rounded-full border border-ink/10 transition", on && "ring-1 ring-ink ring-offset-2 ring-offset-porcelain")}
                      style={{ background: s.hex }}
                    >
                      {on && <Check className="absolute inset-0 m-auto h-4 w-4 text-porcelain mix-blend-difference" />}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            {fam.applicators.length > 0 && (
              <fieldset>
                <legend className="label">{t(studio.applicator)}</legend>
                <div className="flex flex-wrap gap-2">
                  {fam.applicators.map((a) => (
                    <button key={a.id} type="button" className="chip !px-4 !py-2" aria-pressed={config.applicator === a.id} onClick={() => d.setConfig({ applicator: a.id })}>
                      {t(a.label)}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
          </div>
        );
      case 7:
        return (
          <div className="space-y-6">
            <label className="block">
              <span className="label">{t(studio.quantity)}</span>
              <input value={d.quantity} onChange={(e) => d.set({ quantity: e.target.value.slice(0, 200) })} className="field" placeholder="e.g. 3 × 3,000" />
              <span className="mt-1.5 block text-xs text-muted">{t(studio.quantityHint)}</span>
            </label>
            <label className="block">
              <span className="label">{t(studio.notes)}</span>
              <textarea value={d.notes} onChange={(e) => d.set({ notes: e.target.value.slice(0, 1500) })} rows={4} className="field resize-y" placeholder={t(studio.notesPlaceholder)} />
            </label>
          </div>
        );
      default:
        return (
          <div>
            <dl className="divide-y divide-ink/10 border-y hairline text-sm">
              {summary.map((r) => (
                <div key={r.k.en} className="grid grid-cols-3 gap-3 py-3">
                  <dt className="text-muted">{t(r.k)}</dt>
                  <dd className="col-span-2">{r.v}</dd>
                </div>
              ))}
            </dl>
            {added && (
              <p role="status" className="mt-5 flex items-center gap-2 rounded-2xl bg-linen p-4 text-sm">
                <Check className="h-4 w-4 text-success" /> {t(studio.summary.added)}
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-3" data-no-print>
              <button type="button" className="btn btn-primary" onClick={() => addToInquiry(true)}>
                {t(studio.summary.addAndQuote)} <ArrowRight className="h-4 w-4" />
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => addToInquiry(false)}>
                {t(studio.summary.add)}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> {t(ui.cta.print)}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => d.reset()}>
                <RotateCcw className="h-4 w-4" /> {t(studio.summary.restart)}
              </button>
            </div>
            <p className="mt-4 text-xs text-muted">
              <Link href={href("/inquiry")} className="underline underline-offset-4">
                {t(ui.cta.viewInquiry)}
              </Link>
            </p>
          </div>
        );
    }
  };

  return (
    <div className="container-x grid gap-8 pb-28 lg:grid-cols-12 lg:gap-12">
      {/* Viewer */}
      <div className="min-w-0 lg:col-span-7">
        <div className="relative h-[58svh] min-h-[380px] overflow-hidden rounded-[1.75rem] bg-[#efebe5] lg:sticky lg:top-24 lg:h-[calc(100svh-8rem)]">
          {webgl !== "fail" && hydrated && (
            <Viewer3D ref={viewer} config={config} art={art} open={open} autoRotate={autoRotate} onReady={() => setWebgl("ok")} onError={() => setWebgl("fail")} />
          )}
          {webgl === "loading" && <p className="absolute inset-0 flex items-center justify-center text-sm text-muted">{t(studio.viewer.loading)}</p>}
          {webgl === "fail" && (
            <div className="absolute inset-0">
              <Image src={fam.image} alt={t(fam.label)} fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />
              <p className="absolute inset-x-4 bottom-4 rounded-2xl bg-porcelain/90 p-4 text-xs text-graphite backdrop-blur">{t(studio.viewer.fallback)}</p>
            </div>
          )}
          <div className="absolute left-4 top-4 flex flex-wrap gap-2" data-no-print>
            <span className="concept-badge">{t(ui.misc.illustrative)}</span>
          </div>
          {webgl === "ok" && (
            <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-2" data-no-print>
              <div className="flex gap-1 rounded-full bg-porcelain/85 p-1 backdrop-blur">
                <button type="button" aria-pressed={open} onClick={() => setOpen(true)} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs", open && "bg-ink text-porcelain")}>
                  <PackageOpen className="h-3.5 w-3.5" /> {t(studio.viewer.open)}
                </button>
                <button type="button" aria-pressed={!open} onClick={() => setOpen(false)} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs", !open && "bg-ink text-porcelain")}>
                  <Box className="h-3.5 w-3.5" /> {t(studio.viewer.closed)}
                </button>
              </div>
              <p className="hidden text-[0.7rem] text-muted sm:block">{t(studio.viewer.drag)}</p>
              <div className="flex gap-1 rounded-full bg-porcelain/85 p-1 backdrop-blur">
                <button type="button" aria-pressed={autoRotate} onClick={() => setAutoRotate((a) => !a)} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs", autoRotate && "bg-ink text-porcelain")}>
                  <Rotate3D className="h-3.5 w-3.5" /> {t(studio.viewer.rotate)}
                </button>
                <button type="button" onClick={() => viewer.current?.resetView()} className="rounded-full px-3 py-1.5 text-xs" aria-label={t(studio.viewer.reset)}>
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">{t(studio.disclaimer)}</p>
      </div>

      {/* Steps */}
      <div id="studio-steps" className="min-w-0 scroll-mt-24 lg:col-span-5">
        <ol className="no-scrollbar -mx-1 mb-8 flex gap-1.5 overflow-x-auto px-1 pb-1" aria-label={t(studio.eyebrow)} data-no-print>
          {studio.steps.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => goto(i)}
                aria-current={i === step ? "step" : undefined}
                className={cn("flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition", i === step ? "border-ink bg-ink text-porcelain" : i < step ? "border-ink/30 text-ink" : "border-ink/10 text-muted hover:border-ink/40")}
              >
                <span className="font-[family-name:var(--font-display)]">{i + 1}</span> {t(s)}
              </button>
            </li>
          ))}
        </ol>
        <p className="eyebrow">
          {t(studio.stepOf)} {step + 1} {t(studio.stepOfSuffix)}
        </p>
        <h2 className="display mt-3 text-[2.2rem] leading-tight">{t(studio.stepTitles[step])}</h2>
        <div key={step} className="mt-8 animate-[fadein_0.5s_var(--ease-luxe)_both]">
          {hydrated ? stepBody() : <div className="h-48 animate-pulse rounded-2xl bg-linen" />}
        </div>
        <div className="mt-10 flex items-center justify-between gap-3 border-t hairline pt-6" data-no-print>
          <button type="button" className="btn btn-ghost" disabled={step === 0} onClick={() => goto(step - 1)}>
            <ArrowLeft className="h-4 w-4" /> {t(ui.cta.back)}
          </button>
          {step < 8 && (
            <button type="button" className="btn btn-primary" onClick={() => goto(step + 1)}>
              {t(ui.cta.next)} <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
