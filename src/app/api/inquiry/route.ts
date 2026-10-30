import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import {
  inquirySchema,
  MAX_FILE_BYTES,
  MAX_FILES,
  MAX_TOTAL_BYTES,
  MIN_FILL_MS,
  safeFileName,
  sniffMime,
  type InquiryResponse,
} from "@/lib/inquiry-schema";
import { deliver, type Attachment } from "@/lib/inquiry-delivery";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (body: InquiryResponse, status: number) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

async function verifyTurnstile(token: string | null, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return true; // optional layer — honeypot, time-trap and rate limit still apply
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { success?: boolean };
    return !!data.success;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return json({ ok: false, code: "bot" }, 403);

  const len = Number(req.headers.get("content-length") || 0);
  if (len > MAX_TOTAL_BYTES + 512 * 1024) return json({ ok: false, code: "file_invalid" }, 413);

  if (!rateLimit(`inq:${ip}`, [{ windowMs: 10 * 60_000, max: 5 }, { windowMs: 24 * 3600_000, max: 20 }])) {
    return json({ ok: false, code: "rate_limited" }, 429);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ ok: false, code: "validation" }, 400);
  }

  // Bot traps: hidden honeypot field + minimum time to fill the form.
  const honeypot = String(form.get("website") ?? "");
  const startedAt = Number(form.get("startedAt") ?? 0);
  const elapsed = Date.now() - startedAt;
  if (honeypot || !startedAt || elapsed < MIN_FILL_MS || elapsed > 1000 * 60 * 60 * 24) {
    return json({ ok: false, code: "bot" }, 400);
  }
  if (!(await verifyTurnstile(form.get("cf-turnstile-response") as string | null, ip))) {
    return json({ ok: false, code: "bot" }, 400);
  }

  const parsed = inquirySchema.safeParse({
    name: form.get("name"),
    company: form.get("company"),
    country: form.get("country"),
    email: form.get("email"),
    contact: form.get("contact") ?? "",
    categories: form.getAll("categories").map(String),
    concepts: form.get("concepts") ?? "",
    quantity: form.get("quantity") ?? "",
    packaging: form.get("packaging") ?? "",
    timeline: form.get("timeline") || undefined,
    message: form.get("message"),
    consent: form.get("consent"),
    locale: form.get("locale") ?? "en",
  });
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((i) => String(i.path[0])))];
    return json({ ok: false, code: "validation", fields }, 422);
  }

  const files: Attachment[] = [];
  const uploads = form.getAll("files").filter((f): f is File => typeof f === "object" && f !== null && "arrayBuffer" in f && (f as File).size > 0);
  if (uploads.length > MAX_FILES) return json({ ok: false, code: "file_invalid", fields: ["files"] }, 422);
  let total = 0;
  for (const f of uploads) {
    if (f.size > MAX_FILE_BYTES) return json({ ok: false, code: "file_invalid", fields: ["files"] }, 422);
    total += f.size;
    if (total > MAX_TOTAL_BYTES) return json({ ok: false, code: "file_invalid", fields: ["files"] }, 422);
    const buf = Buffer.from(await f.arrayBuffer());
    const mime = sniffMime(new Uint8Array(buf.subarray(0, 16)));
    if (!mime) return json({ ok: false, code: "file_invalid", fields: ["files"] }, 422);
    files.push({ filename: safeFileName(f.name, mime), mime, content: buf });
  }

  const id = `YL-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${randomBytes(3).toString("hex").toUpperCase()}`;
  const result = await deliver({ id, receivedAt: new Date().toISOString(), ip, input: parsed.data, files });
  if (!result.ok) return json({ ok: false, code: result.reason }, result.reason === "not_configured" ? 503 : 502);
  return json({ ok: true, id }, 200);
}
