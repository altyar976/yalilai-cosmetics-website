/**
 * Inquiry delivery providers (server only). Configure one or more via environment variables —
 * see `.env.example` and README. If none is configured the API answers 503 `not_configured`
 * and the website says so honestly; it never pretends a message was sent.
 */
import { createHmac } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { InquiryInput } from "./inquiry-schema";
import { categories } from "@/data/taxonomy";
import { company } from "@/data/company";

export type Attachment = { filename: string; mime: string; content: Buffer };
export type Delivery = { id: string; receivedAt: string; ip: string; input: InquiryInput; files: Attachment[] };

type Provider = { name: string; send: (d: Delivery) => Promise<void> };

const env = (k: string) => process.env[k]?.trim() || "";

export function configuredProviders(): Provider[] {
  const list: Provider[] = [];
  if (env("RESEND_API_KEY") && env("INQUIRY_TO_EMAIL") && env("INQUIRY_FROM_EMAIL")) list.push({ name: "resend", send: sendResend });
  if (env("SMTP_HOST") && env("INQUIRY_TO_EMAIL") && env("INQUIRY_FROM_EMAIL")) list.push({ name: "smtp", send: sendSmtp });
  if (env("INQUIRY_WEBHOOK_URL")) list.push({ name: "webhook", send: sendWebhook });
  if (env("INQUIRY_DEV_STORE") === "1" && process.env.NODE_ENV !== "production") list.push({ name: "dev-store", send: sendDevStore });
  return list;
}

const timelineLabel: Record<string, string> = {
  asap: "Within 3 months / 3 个月内",
  "3-6": "3–6 months / 3–6 个月",
  "6-12": "6–12 months / 6–12 个月",
  exploring: "Exploring / 尚在了解",
};

export function summaryLines(d: Delivery): [string, string][] {
  const i = d.input;
  return [
    ["Reference / 编号", d.id],
    ["Received / 时间", d.receivedAt],
    ["Name / 姓名", i.name],
    ["Brand or company / 品牌或公司", i.company],
    ["Country / 国家或地区", i.country],
    ["Email / 邮箱", i.email],
    ["Phone or WeChat / 电话或微信", i.contact || "—"],
    ["Categories / 品类", i.categories.map((c) => `${categories[c].name.en} / ${categories[c].name.zh}`).join(", ") || "—"],
    ["Product concepts / 产品方案", i.concepts || "—"],
    ["Estimated quantity / 预估数量", i.quantity || "—"],
    ["Packaging preferences / 包装偏好", i.packaging || "—"],
    ["Timeline / 时间计划", i.timeline ? timelineLabel[i.timeline] : "—"],
    ["Message / 留言", i.message],
    ["Site language / 网站语言", i.locale],
    ["Attachments / 附件", d.files.map((f) => f.filename).join(", ") || "—"],
  ];
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function emailBodies(d: Delivery) {
  const lines = summaryLines(d);
  const text = `New website inquiry / 网站新询价 — ${company.nameEn}\n\n` + lines.map(([k, v]) => `${k}:\n${v}\n`).join("\n");
  const html = `<div style="font-family:Arial,'PingFang SC','Microsoft YaHei',sans-serif;color:#171513">
<h2 style="font-weight:500">New website inquiry / 网站新询价</h2>
<table cellpadding="8" style="border-collapse:collapse;max-width:720px">${lines
    .map(([k, v]) => `<tr><td style="vertical-align:top;color:#6c625a;border-bottom:1px solid #e7e1d8;white-space:nowrap">${esc(k)}</td><td style="border-bottom:1px solid #e7e1d8;white-space:pre-wrap">${esc(v)}</td></tr>`)
    .join("")}</table></div>`;
  return { text, html, subject: `Inquiry ${d.id} — ${d.input.company} (${d.input.country})` };
}

async function sendResend(d: Delivery) {
  const { text, html, subject } = emailBodies(d);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env("INQUIRY_FROM_EMAIL"),
      to: env("INQUIRY_TO_EMAIL").split(",").map((s) => s.trim()),
      reply_to: d.input.email,
      subject,
      text,
      html,
      attachments: d.files.map((f) => ({ filename: f.filename, content: f.content.toString("base64") })),
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`resend ${res.status}`);
}

async function sendSmtp(d: Delivery) {
  const nodemailer = await import("nodemailer");
  const port = Number(env("SMTP_PORT") || 465);
  const transport = nodemailer.createTransport({
    host: env("SMTP_HOST"),
    port,
    secure: env("SMTP_SECURE") ? env("SMTP_SECURE") === "true" : port === 465,
    auth: env("SMTP_USER") ? { user: env("SMTP_USER"), pass: env("SMTP_PASS") } : undefined,
  });
  const { text, html, subject } = emailBodies(d);
  await transport.sendMail({
    from: env("INQUIRY_FROM_EMAIL"),
    to: env("INQUIRY_TO_EMAIL"),
    replyTo: d.input.email,
    subject,
    text,
    html,
    attachments: d.files.map((f) => ({ filename: f.filename, content: f.content, contentType: f.mime })),
  });
}

async function sendWebhook(d: Delivery) {
  const payload = JSON.stringify({
    id: d.id,
    receivedAt: d.receivedAt,
    inquiry: d.input,
    attachments: d.files.map((f) => ({ filename: f.filename, mime: f.mime, base64: f.content.toString("base64") })),
  });
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const secret = env("INQUIRY_WEBHOOK_SECRET");
  if (secret) headers["X-Yalilai-Signature"] = createHmac("sha256", secret).update(payload).digest("hex");
  const res = await fetch(env("INQUIRY_WEBHOOK_URL"), { method: "POST", headers, body: payload, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`webhook ${res.status}`);
}

/** Local development only: writes inquiries to ./.data/inquiries (git-ignored). */
async function sendDevStore(d: Delivery) {
  const dir = path.join(process.cwd(), ".data", "inquiries", d.id);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "inquiry.json"), JSON.stringify({ id: d.id, receivedAt: d.receivedAt, input: d.input }, null, 2));
  await writeFile(path.join(dir, "summary.txt"), emailBodies(d).text);
  for (const f of d.files) await writeFile(path.join(dir, f.filename), f.content);
}

export async function deliver(d: Delivery) {
  const providers = configuredProviders();
  if (!providers.length) return { ok: false as const, reason: "not_configured" as const };
  const results = await Promise.allSettled(providers.map((p) => p.send(d)));
  const failures = results.flatMap((r, i) => (r.status === "rejected" ? [`${providers[i].name}: ${String(r.reason)}`] : []));
  if (failures.length) console.error(`[inquiry ${d.id}] delivery failures`, failures);
  return failures.length === providers.length ? { ok: false as const, reason: "delivery_failed" as const } : { ok: true as const };
}
