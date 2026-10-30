"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { copyText, cn } from "@/lib/utils";
import { useT } from "@/i18n/locale-context";
import { ui } from "@/content/ui";
import type { L } from "@/data/taxonomy";

export function CopyButton({ value, label, className, tone = "ink" }: { value: string; label?: L; className?: string; tone?: "ink" | "light" }) {
  const t = useT();
  const [state, setState] = useState<"idle" | "ok" | "fail">("idle");
  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await copyText(value);
        setState(ok ? "ok" : "fail");
        window.setTimeout(() => setState("idle"), 2200);
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.72rem] font-medium tracking-[0.06em] transition-colors",
        tone === "light" ? "border-porcelain/25 text-porcelain hover:border-porcelain/60" : "border-ink/15 text-ink hover:border-ink/50",
        className,
      )}
    >
      {state === "ok" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      <span aria-live="polite">{state === "ok" ? t(ui.cta.copied) : t(label ?? ui.cta.copy)}</span>
      {state === "fail" && <span className="sr-only">{value}</span>}
    </button>
  );
}
