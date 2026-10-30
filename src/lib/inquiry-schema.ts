import { z } from "zod";
import { categoryIds } from "@/data/taxonomy";

export const timelines = ["asap", "3-6", "6-12", "exploring"] as const;

export const MAX_FILES = 3;
export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 20 * 1024 * 1024;
export const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;
export const MIN_FILL_MS = 3000;

const trimmed = (min: number, max: number) => z.string().trim().min(min).max(max);

/** Shared by the client form (pre-validation) and the API route (authoritative validation). */
export const inquirySchema = z.object({
  name: trimmed(2, 100),
  company: trimmed(1, 150),
  country: trimmed(2, 80),
  email: z.string().trim().email().max(200),
  contact: z.string().trim().max(100).optional().default(""),
  categories: z.array(z.enum(categoryIds)).max(categoryIds.length).optional().default([]),
  concepts: z.string().trim().max(6000).optional().default(""),
  quantity: z.string().trim().max(200).optional().default(""),
  packaging: z.string().trim().max(2000).optional().default(""),
  timeline: z.enum(timelines).optional(),
  message: trimmed(10, 5000),
  consent: z.literal("yes"),
  locale: z.enum(["en", "zh-cn"]).default("en"),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export type InquiryResponse =
  | { ok: true; id: string }
  | {
      ok: false;
      code: "validation" | "rate_limited" | "bot" | "not_configured" | "delivery_failed" | "file_invalid" | "server";
      fields?: string[];
    };

/** Detect the real file type from its first bytes — never trust the browser-provided MIME type. */
export function sniffMime(buf: Uint8Array): (typeof ACCEPTED_MIME)[number] | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf.length >= 12 && String.fromCharCode(...buf.slice(0, 4)) === "RIFF" && String.fromCharCode(...buf.slice(8, 12)) === "WEBP") return "image/webp";
  if (buf.length >= 5 && String.fromCharCode(...buf.slice(0, 5)) === "%PDF-") return "application/pdf";
  return null;
}

export function safeFileName(name: string, mime: string) {
  const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf" }[mime] ?? "bin";
  const base = name
    .replace(/\.[^.]*$/, "")
    .normalize("NFKD")
    .replace(/[^\w\-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/^-|-$/g, "");
  return `${base || "reference"}.${ext}`;
}
