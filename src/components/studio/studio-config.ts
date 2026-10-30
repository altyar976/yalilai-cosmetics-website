import { shadeSets, type L, type Shade } from "@/data/taxonomy";

export type Family = "lipstick" | "mascara" | "gloss" | "compact" | "foundation" | "pencil";

export type StudioConfig = {
  family: Family;
  silhouette: string;
  bodyColor: string;
  capColor: string;
  accentColor: string;
  finish: "matte" | "gloss" | "metallic";
  decoration: "screen-print" | "hot-stamp-gold" | "hot-stamp-silver" | "label" | "none";
  inkColor: string;
  shade: string;
  applicator: string;
};

type Opt = { id: string; label: L };

export const families: Record<Family, { label: L; desc: L; image: string; silhouettes: Opt[]; applicators: Opt[]; shades: Shade[]; defaults: Partial<StudioConfig>; bodyClear: boolean }> = {
  lipstick: {
    label: { en: "Lipstick", zh: "口红" },
    desc: { en: "Bullet lipstick in a twist-up case", zh: "旋转管装膏体口红" },
    image: "/images/studio/lipstick.webp",
    silhouettes: [
      { id: "round", label: { en: "Round", zh: "圆管" } },
      { id: "square", label: { en: "Soft square", zh: "圆角方管" } },
      { id: "slim", label: { en: "Slim", zh: "细管" } },
      { id: "sculpted", label: { en: "Sculpted (magnetic-style concept)", zh: "雕塑感（磁吸风格概念）" } },
    ],
    applicators: [
      { id: "slant", label: { en: "Slanted bullet", zh: "斜切膏体" } },
      { id: "round", label: { en: "Rounded bullet", zh: "圆头膏体" } },
    ],
    shades: shadeSets.lip,
    defaults: { silhouette: "round", bodyColor: "#121110", capColor: "#121110", accentColor: "#d6be98", finish: "gloss", shade: "#a3202b", applicator: "slant" },
    bodyClear: false,
  },
  mascara: {
    label: { en: "Mascara", zh: "睫毛膏" },
    desc: { en: "Wand tube with your choice of brush", zh: "刷头管，可选刷型" },
    image: "/images/studio/mascara.webp",
    silhouettes: [
      { id: "round", label: { en: "Round", zh: "圆管" } },
      { id: "square", label: { en: "Soft square", zh: "圆角方管" } },
      { id: "slim", label: { en: "Slim", zh: "细长管" } },
    ],
    applicators: [
      { id: "hourglass", label: { en: "Hourglass fibre", zh: "沙漏纤维刷" } },
      { id: "straight", label: { en: "Straight fibre", zh: "直筒纤维刷" } },
      { id: "curved", label: { en: "Curved", zh: "弯月刷" } },
      { id: "comb", label: { en: "Moulded comb", zh: "硅胶梳刷" } },
      { id: "micro", label: { en: "Micro", zh: "细小刷" } },
    ],
    shades: shadeSets.mascara,
    defaults: { silhouette: "round", bodyColor: "#121110", capColor: "#121110", accentColor: "#d6be98", finish: "gloss", shade: "#121212", applicator: "hourglass" },
    bodyClear: true,
  },
  gloss: {
    label: { en: "Lip gloss / liquid", zh: "唇彩 / 液体" },
    desc: { en: "Clear or tinted tube with applicator", zh: "透明或有色管，配涂抹器" },
    image: "/images/studio/gloss.webp",
    silhouettes: [
      { id: "round", label: { en: "Round", zh: "圆管" } },
      { id: "square", label: { en: "Soft square", zh: "圆角方管" } },
      { id: "heavy", label: { en: "Heavy base", zh: "厚底瓶" } },
    ],
    applicators: [
      { id: "doe", label: { en: "Doe-foot", zh: "鹿脚刷" } },
      { id: "brush", label: { en: "Brush tip", zh: "刷头" } },
    ],
    shades: shadeSets.gloss,
    defaults: { silhouette: "round", bodyColor: "clear", capColor: "#121110", accentColor: "#d6be98", finish: "gloss", shade: "#d98e88", applicator: "doe" },
    bodyClear: true,
  },
  compact: {
    label: { en: "Compact", zh: "粉盒" },
    desc: { en: "Pressed powder, blush or highlighter", zh: "压粉、腮红或高光" },
    image: "/images/studio/compact.webp",
    silhouettes: [
      { id: "round", label: { en: "Round", zh: "圆形" } },
      { id: "square", label: { en: "Soft square", zh: "圆角方形" } },
    ],
    applicators: [],
    shades: [...shadeSets.blush, ...shadeSets.powder, ...shadeSets.highlight],
    defaults: { silhouette: "round", bodyColor: "#e7ddcf", capColor: "#e7ddcf", accentColor: "#cdaa6e", finish: "gloss", shade: "#e7a2a0", applicator: "" },
    bodyClear: false,
  },
  foundation: {
    label: { en: "Foundation bottle", zh: "粉底瓶" },
    desc: { en: "Glass-look bottle with pump or dropper", zh: "玻璃质感瓶，按压泵或滴管" },
    image: "/images/studio/foundation.webp",
    silhouettes: [
      { id: "square", label: { en: "Soft square", zh: "圆角方瓶" } },
      { id: "round", label: { en: "Round", zh: "圆瓶" } },
    ],
    applicators: [
      { id: "pump", label: { en: "Pump", zh: "按压泵" } },
      { id: "dropper", label: { en: "Dropper", zh: "滴管" } },
    ],
    shades: shadeSets.complexion,
    defaults: { silhouette: "square", bodyColor: "clear", capColor: "frost", accentColor: "#d6be98", finish: "gloss", shade: "#d9b08e", applicator: "pump" },
    bodyClear: true,
  },
  pencil: {
    label: { en: "Pencil", zh: "笔类" },
    desc: { en: "Lip, eye or brow pencils", zh: "唇线笔、眼线笔或眉笔" },
    image: "/images/studio/pencil.webp",
    silhouettes: [
      { id: "wood", label: { en: "Wood pencil", zh: "木杆笔" } },
      { id: "twist", label: { en: "Twist-up", zh: "旋转笔" } },
      { id: "jumbo", label: { en: "Jumbo", zh: "粗芯笔" } },
    ],
    applicators: [],
    shades: [...shadeSets.liner, ...shadeSets.eye, ...shadeSets.brow],
    defaults: { silhouette: "wood", bodyColor: "#8e5a4e", capColor: "#8e5a4e", accentColor: "#cdaa6e", finish: "gloss", shade: "#94584b", applicator: "" },
    bodyClear: false,
  },
};

export const familyIds = Object.keys(families) as Family[];

/** Editable packaging palette. */
export const palette: { hex: string; name: L }[] = [
  { hex: "#121110", name: { en: "Noir", zh: "曜石黑" } },
  { hex: "#3b2a23", name: { en: "Espresso", zh: "咖啡棕" } },
  { hex: "#6a5045", name: { en: "Mocha", zh: "摩卡" } },
  { hex: "#a08c80", name: { en: "Taupe", zh: "灰褐" } },
  { hex: "#c7b29b", name: { en: "Sand", zh: "砂岩" } },
  { hex: "#e7ddcf", name: { en: "Ivory", zh: "象牙白" } },
  { hex: "#f4f1ec", name: { en: "Porcelain", zh: "瓷白" } },
  { hex: "#ddb7ac", name: { en: "Blush", zh: "裸粉" } },
  { hex: "#c9616e", name: { en: "Peony", zh: "牡丹粉" } },
  { hex: "#8e4f51", name: { en: "Rosewood", zh: "玫瑰木" } },
  { hex: "#6e1b2a", name: { en: "Garnet", zh: "石榴红" } },
  { hex: "#2f3a35", name: { en: "Forest", zh: "墨绿" } },
  { hex: "#cdaa6e", name: { en: "Gold", zh: "金色" } },
  { hex: "#d6be98", name: { en: "Champagne", zh: "香槟色" } },
  { hex: "#d7a894", name: { en: "Rose gold", zh: "玫瑰金" } },
  { hex: "#d6d8da", name: { en: "Silver", zh: "银色" } },
];

export const specialBodies: { id: "clear" | "frost"; name: L }[] = [
  { id: "clear", name: { en: "Clear", zh: "透明" } },
  { id: "frost", name: { en: "Frosted", zh: "磨砂" } },
];

export const accentPalette = ["#d6be98", "#cdaa6e", "#d7a894", "#d6d8da", "#121110"];

export const finishesOpt: { id: StudioConfig["finish"]; label: L; desc: L }[] = [
  { id: "matte", label: { en: "Matte / soft-touch", zh: "哑光 / 亲肤" }, desc: { en: "Velvety, low reflection", zh: "丝绒质感，低反光" } },
  { id: "gloss", label: { en: "Glossy", zh: "亮面" }, desc: { en: "High shine with a clear coat", zh: "高光泽，带透明涂层" } },
  { id: "metallic", label: { en: "Metallic", zh: "金属感" }, desc: { en: "Plated or metallised effect", zh: "电镀或金属化效果" } },
];

export const decorations: { id: StudioConfig["decoration"]; label: L; desc: L }[] = [
  { id: "screen-print", label: { en: "Screen print", zh: "丝印" }, desc: { en: "Ink printed directly on the component", zh: "油墨直接印刷于部件" } },
  { id: "hot-stamp-gold", label: { en: "Hot stamp — gold", zh: "烫金" }, desc: { en: "Metallic foil, gold tone", zh: "金色金属箔" } },
  { id: "hot-stamp-silver", label: { en: "Hot stamp — silver", zh: "烫银" }, desc: { en: "Metallic foil, silver tone", zh: "银色金属箔" } },
  { id: "label", label: { en: "Printed label", zh: "印刷标签" }, desc: { en: "Paper or film label", zh: "纸质或薄膜标签" } },
  { id: "none", label: { en: "No decoration", zh: "无装饰" }, desc: { en: "Plain component", zh: "素面部件" } },
];

export const inkPalette = ["#ffffff", "#121110", "#cdaa6e", "#8e4f51", "#6c625a"];

export function defaultConfig(family: Family = "lipstick"): StudioConfig {
  const d = families[family].defaults;
  return {
    family,
    silhouette: d.silhouette ?? families[family].silhouettes[0].id,
    bodyColor: d.bodyColor ?? "#121110",
    capColor: d.capColor ?? "#121110",
    accentColor: d.accentColor ?? "#d6be98",
    finish: d.finish ?? "gloss",
    decoration: "hot-stamp-gold",
    inkColor: "#ffffff",
    shade: d.shade ?? "#a3202b",
    applicator: d.applicator ?? "",
  };
}

export const colourName = (hex: string): L => {
  if (hex === "clear") return specialBodies[0].name;
  if (hex === "frost") return specialBodies[1].name;
  return palette.find((p) => p.hex.toLowerCase() === hex.toLowerCase())?.name ?? { en: hex.toUpperCase(), zh: hex.toUpperCase() };
};
