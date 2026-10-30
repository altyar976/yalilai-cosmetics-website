import manifest from "@/data/generated/image-manifest.json";

type Meta = { w: number; h: number; blur: string };
const m = manifest as Record<string, Meta>;

export const imageMeta = (src: string): Meta | undefined => m[src];
export const hasImage = (src: string) => src in m;
