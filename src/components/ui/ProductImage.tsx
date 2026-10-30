import Image from "next/image";
import { imageMeta } from "@/lib/images";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  quality?: number;
};

/** next/image with intrinsic size + blur placeholder from the generated image manifest. */
export function ProductImage({ src, alt, sizes, className, priority, fill = true, quality = 80 }: Props) {
  const meta = imageMeta(src);
  const common = {
    src,
    alt,
    sizes,
    quality,
    // Next 16: `priority` is deprecated — eager + high fetch priority for above-the-fold images
    loading: priority ? ("eager" as const) : undefined,
    fetchPriority: priority ? ("high" as const) : undefined,
    className: cn("object-cover", className),
    placeholder: meta?.blur ? ("blur" as const) : ("empty" as const),
    blurDataURL: meta?.blur,
  };
  if (fill || !meta) return <Image {...common} fill alt={alt} />;
  return <Image {...common} width={meta.w} height={meta.h} alt={alt} />;
}
