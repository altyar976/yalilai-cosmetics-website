"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, FileText, Loader2, Paperclip, X } from "lucide-react";
import { categories, categoryIds, colorways, requestOptions, type CategoryId } from "@/data/taxonomy";
import { productBySlug } from "@/data/products";
import { company } from "@/data/company";
import { contact } from "@/content/contact";
import { ui } from "@/content/ui";
import { useHref, useLocale, useT } from "@/i18n/locale-context";
import { useInquiry, type InquiryItem } from "@/store/inquiry";
import { ACCEPTED_MIME, MAX_FILE_BYTES, MAX_FILES, inquirySchema, timelines, type InquiryResponse } from "@/lib/inquiry-schema";
import { copyText, cn } from "@/lib/utils";
import { useHydrated } from "@/components/catalog/ProductCard";

type Status = "idle" | "sending" | "success" | "not_configured" | "error";

export function itemLine(i: InquiryItem, tr: (l: { en: string; zh: string }) => string) {
  const parts = [i.model ? `${i.model} ${tr(i.title)}` : tr(i.title)];
  if (i.requests?.length) parts.push(`${tr(ui.catalog.requests)}: ${i.requests.map((r) => tr(requestOptions[r])).join(", ")}`);
  if (i.quantity) parts.push(`${tr(ui.catalog.quantity)}: ${i.quantity}`);
  if (i.colorway) parts.push(`${tr(ui.catalog.colorways)}: ${tr(colorways[i.colorway].name)}`);
  if (i.shade) parts.push(`${tr(ui.catalog.selectedShade)}: ${tr(i.shade)}`);
  if (i.lines?.length) parts.push(i.lines.map(tr).join("; "));
  if (i.notes) parts.push(`“${i.notes}”`);
  return parts.join(" — ");
}

export function RfqForm() {
  const t = useT();
  const href = useHref();
  const locale = useLocale();
  const hydrated = useHydrated();
  const items = useInquiry((s) => s.items);
  const remove = useInquiry((s) => s.remove);
  const clearItems = useInquiry((s) => s.clear);
  const formRef = useRef<HTMLFormElement>(null);
  const [startedAt] = useState(() => Date.now());
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [refId, setRefId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [fileErr, setFileErr] = useState("");
  const [cats, setCats] = useState<CategoryId[]>([]);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [turnstileKey, setTurnstileKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Pre-select categories from inquiry list items once the list is available
  const [seeded, setSeeded] = useState(false);
  if (hydrated && !seeded) {
    setSeeded(true);
    const fromItems = items.map((i) => (i.slug ? productBySlug.get(i.slug)?.category : undefined)).filter(Boolean) as CategoryId[];
    if (fromItems.length) setCats((c) => Array.from(new Set([...c, ...fromItems])));
  }

  useEffect(() => {
    fetch("/api/inquiry/status")
      .then((r) => r.json())
      .then((d: { configured: boolean; turnstileSiteKey: string | null }) => {
        setConfigured(d.configured);
        setTurnstileKey(d.turnstileSiteKey);
      })
      .catch(() => setConfigured(null));
  }, []);

  const listText = useMemo(() => items.map((i, n) => `${n + 1}. ${itemLine(i, t)}`).join("\n"), [items, t]);

  const buildSummary = () => {
    const f = formRef.current;
    if (!f) return "";
    const fd = new FormData(f);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    const tl = get("timeline") as (typeof timelines)[number] | "";
    return [
      `${t(contact.eyebrow)} — ${company.wordmark}`,
      `${t(contact.form.name)}: ${get("name")}`,
      `${t(contact.form.company)}: ${get("company")}`,
      `${t(contact.form.country)}: ${get("country")}`,
      `${t(contact.form.email)}: ${get("email")}`,
      get("contact") && `${t(contact.form.contact)}: ${get("contact")}`,
      cats.length && `${t(contact.form.categories)}: ${cats.map((c) => t(categories[c].name)).join(", ")}`,
      listText && `${t(contact.form.conceptsFromList)}:\n${listText}`,
      get("conceptsExtra") && `${t(contact.form.conceptsExtra)}: ${get("conceptsExtra")}`,
      get("quantity") && `${t(contact.form.quantity)}: ${get("quantity")}`,
      get("packaging") && `${t(contact.form.packaging)}: ${get("packaging")}`,
      tl && `${t(contact.form.timeline)}: ${t(contact.form.timelineOptions[tl])}`,
      `${t(contact.form.message)}: ${get("message")}`,
    ]
      .filter(Boolean)
      .join("\n");
  };

  const onFiles = (list: FileList | null) => {
    setFileErr("");
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (next.length >= MAX_FILES) {
        setFileErr(t(contact.errors.fileCount));
        break;
      }
      if (!(ACCEPTED_MIME as readonly string[]).includes(f.type)) {
        setFileErr(t(contact.errors.fileType));
        continue;
      }
      if (f.size > MAX_FILE_BYTES) {
        setFileErr(t(contact.errors.fileSize));
        continue;
      }
      next.push(f);
    }
    setFiles(next);
  };

  const validate = (fd: FormData) => {
    const res = inquirySchema.safeParse({
      name: fd.get("name"),
      company: fd.get("company"),
      country: fd.get("country"),
      email: fd.get("email"),
      contact: fd.get("contact") ?? "",
      categories: cats,
      concepts: fd.get("concepts") ?? "",
      quantity: fd.get("quantity") ?? "",
      packaging: fd.get("packaging") ?? "",
      timeline: fd.get("timeline") || undefined,
      message: fd.get("message"),
      consent: fd.get("consent"),
      locale,
    });
    if (res.success) return {};
    const e: Record<string, string> = {};
    for (const issue of res.error.issues) {
      const k = String(issue.path[0]);
      if (e[k]) continue;
      e[k] = k === "email" ? t(contact.errors.email) : k === "message" ? t(contact.errors.message) : k === "consent" ? t(contact.errors.consent) : t(contact.errors.required);
    }
    return e;
  };

  const onSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const f = ev.currentTarget;
    const fd = new FormData(f);
    const extra = String(fd.get("conceptsExtra") ?? "").trim();
    fd.set("concepts", [listText, extra].filter(Boolean).join("\n\n"));
    fd.delete("conceptsExtra");
    fd.delete("files");
    files.forEach((file) => fd.append("files", file));
    fd.delete("categories");
    cats.forEach((c) => fd.append("categories", c));
    fd.set("locale", locale);
    fd.set("startedAt", String(startedAt));
    const e = validate(fd);
    setErrors(e);
    if (Object.keys(e).length) {
      setErrorMsg(t(contact.errors.summary));
      const first = f.querySelector<HTMLElement>(`[name="${Object.keys(e)[0]}"]`);
      first?.focus();
      return;
    }
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/inquiry", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({ ok: false, code: "server" }))) as InquiryResponse;
      if (data.ok) {
        setRefId(data.id);
        setStatus("success");
        clearItems();
        window.scrollTo({ top: (f.getBoundingClientRect().top + window.scrollY) - 120, behavior: "smooth" });
        return;
      }
      if (data.code === "not_configured") {
        setStatus("not_configured");
        return;
      }
      setStatus("error");
      if (data.code === "validation" && data.fields) {
        setErrors(Object.fromEntries(data.fields.map((k) => [k, t(contact.errors.required)])));
        setErrorMsg(t(contact.errors.summary));
      } else
        setErrorMsg(
          t(
            data.code === "rate_limited"
              ? contact.states.rateLimited
              : data.code === "bot"
                ? contact.states.bot
                : data.code === "file_invalid"
                  ? contact.states.fileInvalid
                  : contact.states.failed,
          ),
        );
    } catch {
      setStatus("error");
      setErrorMsg(t(contact.states.failed));
    }
  };

  if (status === "success") {
    return (
      <div className="card-surface p-8 sm:p-12" role="status" aria-live="polite">
        <CheckCircle2 className="h-10 w-10 text-success" strokeWidth={1.25} />
        <h2 className="display mt-6 text-4xl">{t(contact.states.successTitle)}</h2>
        <p className="mt-4 max-w-xl text-graphite">{t(contact.states.successBody)}</p>
        <p className="mt-8 inline-flex items-center gap-3 rounded-full bg-linen px-5 py-2.5 font-medium">
          {t(contact.states.reference)}: <span className="font-mono tracking-wider">{refId}</span>
        </p>
        <div className="mt-8">
          <button type="button" className="btn btn-ghost" onClick={() => window.location.reload()}>
            {t(contact.states.another)}
          </button>
        </div>
      </div>
    );
  }

  const field = (name: string, label: string, opts: { type?: string; required?: boolean; autoComplete?: string; placeholder?: string; hint?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"] } = {}) => (
    <label className="block">
      <span className="label">
        {label}
        {opts.required && <span className="ml-1 text-danger" aria-hidden="true">*</span>}
      </span>
      <input
        name={name}
        type={opts.type ?? "text"}
        required={opts.required}
        autoComplete={opts.autoComplete}
        placeholder={opts.placeholder}
        inputMode={opts.inputMode}
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `${name}-err` : opts.hint ? `${name}-hint` : undefined}
        className="field"
      />
      {opts.hint && !errors[name] && (
        <span id={`${name}-hint`} className="mt-1.5 block text-xs text-muted">
          {opts.hint}
        </span>
      )}
      {errors[name] && (
        <span id={`${name}-err`} className="mt-1.5 block text-xs text-danger">
          {errors[name]}
        </span>
      )}
    </label>
  );

  return (
    <>
      {turnstileKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />}
      <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-12" aria-describedby={errorMsg ? "form-error" : undefined}>
        {configured === false && (
          <p className="flex gap-3 rounded-2xl border border-champagne/50 bg-blush/40 p-4 text-sm text-graphite">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-champagne-deep" />
            {t(contact.states.notConfiguredBanner)}
          </p>
        )}

        <fieldset className="space-y-5">
          <legend className="display mb-6 text-2xl">{t(contact.form.sectionYou)}</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            {field("name", t(contact.form.name), { required: true, autoComplete: "name" })}
            {field("company", t(contact.form.company), { required: true, autoComplete: "organization" })}
            {field("country", t(contact.form.country), { required: true, autoComplete: "country-name" })}
            {field("email", t(contact.form.email), { required: true, type: "email", autoComplete: "email", inputMode: "email" })}
          </div>
          {field("contact", t(contact.form.contact), { autoComplete: "tel" })}
        </fieldset>

        <fieldset className="space-y-6">
          <legend className="display mb-6 text-2xl">{t(contact.form.sectionProject)}</legend>
          <div>
            <p className="label" id="cats-label">
              {t(contact.form.categories)}
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="cats-label">
              {categoryIds.map((c) => (
                <button key={c} type="button" className="chip" aria-pressed={cats.includes(c)} onClick={() => setCats((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]))}>
                  {t(categories[c].name)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label">{t(contact.form.concepts)}</p>
            {hydrated && items.length > 0 ? (
              <div className="mb-4 rounded-2xl border hairline bg-porcelain p-4">
                <p className="mb-3 text-xs uppercase tracking-[0.14em] text-muted">{t(contact.form.conceptsFromList)}</p>
                <ul className="space-y-2 text-sm">
                  {items.map((i) => (
                    <li key={i.id} className="flex items-start justify-between gap-3">
                      <span>{itemLine(i, t)}</span>
                      <button type="button" onClick={() => remove(i.id)} aria-label={`${t(ui.cta.remove)}: ${t(i.title)}`} className="shrink-0 rounded-full p-1 text-muted hover:bg-linen hover:text-ink">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mb-3 text-sm text-muted">
                {t(ui.inquiry.empty)}{" "}
                <Link href={href("/products")} className="underline underline-offset-4">
                  {t(ui.nav.catalog)}
                </Link>
              </p>
            )}
            <label className="block">
              <span className="sr-only">{t(contact.form.conceptsExtra)}</span>
              <textarea name="conceptsExtra" rows={3} className="field resize-y" placeholder={t(contact.form.conceptsPlaceholder)} maxLength={3000} />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {field("quantity", t(contact.form.quantity), { hint: t(contact.form.quantityHint) })}
            <label className="block">
              <span className="label">{t(contact.form.timeline)}</span>
              <select name="timeline" className="field" defaultValue="">
                <option value="">{t(contact.form.select)}</option>
                {timelines.map((k) => (
                  <option key={k} value={k}>
                    {t(contact.form.timelineOptions[k])}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="label">{t(contact.form.packaging)}</span>
            <textarea name="packaging" rows={3} className="field resize-y" placeholder={t(contact.form.packagingPlaceholder)} maxLength={2000} />
          </label>
          <label className="block">
            <span className="label">
              {t(contact.form.message)}
              <span className="ml-1 text-danger" aria-hidden="true">*</span>
            </span>
            <textarea
              name="message"
              rows={5}
              required
              minLength={10}
              maxLength={5000}
              className="field resize-y"
              placeholder={t(contact.form.messagePlaceholder)}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? "message-err" : undefined}
            />
            {errors.message && (
              <span id="message-err" className="mt-1.5 block text-xs text-danger">
                {errors.message}
              </span>
            )}
          </label>
        </fieldset>

        <fieldset>
          <legend className="display mb-6 text-2xl">{t(contact.form.sectionFiles)}</legend>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/20 bg-porcelain px-6 py-8 text-center transition hover:border-ink/50">
            <Paperclip className="h-5 w-5 text-muted" strokeWidth={1.5} />
            <span className="font-medium">{t(contact.form.addFiles)}</span>
            <span className="max-w-md text-xs text-muted">{t(contact.form.filesHint)}</span>
            <input type="file" name="files" multiple accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={(e) => {
              onFiles(e.target.files);
              e.target.value = "";
            }} />
          </label>
          {fileErr && <p className="mt-2 text-xs text-danger" role="alert">{fileErr}</p>}
          {files.length > 0 && (
            <ul className="mt-4 space-y-2">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex items-center gap-3 rounded-xl bg-linen px-4 py-2.5 text-sm">
                  <FileText className="h-4 w-4 shrink-0 text-muted" />
                  <span className="min-w-0 flex-1 truncate">{f.name}</span>
                  <span className="text-xs text-muted">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                  <button type="button" onClick={() => setFiles(files.filter((_, k) => k !== i))} aria-label={`${t(ui.cta.remove)}: ${f.name}`} className="rounded-full p-1 hover:bg-porcelain">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        {/* Honeypot: invisible to people, tempting to bots */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {turnstileKey && <div className="cf-turnstile" data-sitekey={turnstileKey} data-language={locale === "zh-cn" ? "zh-cn" : "en"} />}

        <div>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="consent" value="yes" required className="mt-1 h-4 w-4 accent-ink" aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "consent-err" : undefined} />
            <span>
              {t(contact.form.consent)}{" "}
              <Link href={href("/privacy")} className="underline underline-offset-4" target="_blank">
                {t(contact.form.privacy)}
              </Link>
              .
            </span>
          </label>
          {errors.consent && (
            <span id="consent-err" className="mt-1.5 block text-xs text-danger">
              {errors.consent}
            </span>
          )}
        </div>

        {errorMsg && (
          <p id="form-error" role="alert" className="flex gap-3 rounded-2xl bg-danger/8 p-4 text-sm text-danger">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {errorMsg}
          </p>
        )}

        {status === "not_configured" && (
          <div role="alert" className="rounded-2xl border border-champagne/60 bg-blush/40 p-5">
            <p className="flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4 text-champagne-deep" /> {t(contact.states.notConfiguredTitle)}
            </p>
            <p className="mt-2 text-sm text-graphite">{t(contact.states.notConfiguredBody)}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={async () => {
                  setCopied(await copyText(buildSummary()));
                  window.setTimeout(() => setCopied(false), 2500);
                }}
              >
                {copied ? t(ui.cta.copied) : t(contact.states.copySummary)}
              </button>
              <span>
                {t(ui.contact.wechat)}: <strong>{company.wechatId}</strong>
              </span>
              <a href={`tel:${company.phoneE164}`} className="underline underline-offset-4">
                {company.phoneDisplay}
              </a>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" className={cn("btn btn-primary min-w-[220px]", status === "sending" && "opacity-80")} disabled={status === "sending"}>
            {status === "sending" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {t(contact.form.sending)}
              </>
            ) : (
              t(contact.form.submit)
            )}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={async () => {
              setCopied(await copyText(buildSummary()));
              window.setTimeout(() => setCopied(false), 2500);
            }}
          >
            {copied ? t(ui.cta.copied) : t(contact.states.copySummary)}
          </button>
        </div>
      </form>
    </>
  );
}
