import { NextResponse } from "next/server";
import { configuredProviders } from "@/lib/inquiry-delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lets the form tell visitors up-front whether online submission is connected. Reveals no secrets. */
export function GET() {
  return NextResponse.json(
    { configured: configuredProviders().length > 0, turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
