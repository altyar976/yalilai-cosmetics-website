import type { Locale } from "@/i18n/config";
import { makeT } from "@/i18n/server";
import { home } from "@/content/home";
import { Marquee } from "@/components/motion/Marquee";

export function MarqueeBand({ locale }: { locale: Locale }) {
  const t = makeT(locale);
  return (
    <div className="border-y hairline bg-ivory py-6" aria-hidden="true">
      <Marquee duration={60}>
        {home.marquee.map((m, i) => (
          <span key={i} className="flex items-center">
            <span className="display whitespace-nowrap px-8 text-[clamp(1.6rem,3vw,2.6rem)] italic text-ink/80">{t(m)}</span>
            <span className="h-1.5 w-1.5 rotate-45 bg-champagne" />
          </span>
        ))}
      </Marquee>
    </div>
  );
}
