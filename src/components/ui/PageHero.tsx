import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { Reveal } from "@/components/motion/Reveal";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow: string;
  title: string;
  intro?: string;
  crumbs?: Crumb[];
  children?: React.ReactNode;
  className?: string;
  align?: "left" | "split";
  size?: "lg" | "sm";
};

export function PageHero({ eyebrow, title, intro, crumbs, children, className, align = "split", size = "lg" }: Props) {
  return (
    <section className={cn("container-x", size === "lg" ? "pb-14 pt-32 lg:pb-20 lg:pt-44" : "pb-10 pt-28 lg:pb-12 lg:pt-36", className)}>
      {crumbs && <Breadcrumbs items={crumbs} className={size === "lg" ? "mb-10" : "mb-7"} />}
      <div className={cn("grid gap-8", align === "split" && "lg:grid-cols-12 lg:items-end")}>
        <div className={cn(align === "split" && "lg:col-span-7")}>
          <p className="eyebrow">{eyebrow}</p>
          <SplitHeadline
            as="h1"
            text={title}
            immediate
            className={cn("display mt-5 text-balance", size === "lg" ? "text-[clamp(2.6rem,6.4vw,6rem)]" : "text-[clamp(2.4rem,4.8vw,4.6rem)]")}
          />
        </div>
        {(intro || children) && (
          <Reveal className={cn(align === "split" && "lg:col-span-5 lg:pb-3")} delay={0.2}>
            {intro && <p className="lede text-pretty">{intro}</p>}
            {children}
          </Reveal>
        )}
      </div>
    </section>
  );
}
