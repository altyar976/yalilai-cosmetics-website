import type { Locale } from "@/i18n/config";

/** Bilingual string. `zh` is Simplified Chinese. */
export type L = { en: string; zh: string };

export const tr = (l: L, locale: Locale) => (locale === "zh-cn" ? l.zh : l.en);

// ---------------------------------------------------------------------------------------------
// Catalogue categories (reference models — see src/data/catalog-data.ts)
// ---------------------------------------------------------------------------------------------

export const categoryIds = [
  "eyebrow-pencils",
  "liquid-eyebrow-pens",
  "liquid-eyeliners",
  "gel-eyeliners",
  "dip-eyeliners",
  "dual-ended-pens",
  "lip-liners-pens",
  "face-specialty-pens",
] as const;
export type CategoryId = (typeof categoryIds)[number];

export const categories: Record<CategoryId, { name: L; short: L; intro: L; cover: string }> = {
  "eyebrow-pencils": {
    name: { en: "Eyebrow Pencils & Brow Gels", zh: "眉笔与眉胶" },
    short: { en: "Brow Pencils", zh: "眉笔" },
    intro: {
      en: "Retractable and refillable brow pencils with spoolies, soft brushes and powder ends, plus brow cream pens and a clear brow gel.",
      zh: "自动与可替换眉笔，可配螺旋眉刷、软毛刷或眉粉端，另有眉膏笔与透明眉胶。",
    },
    cover: "YD-066-1",
  },
  "liquid-eyebrow-pens": {
    name: { en: "Liquid Eyebrow Pens", zh: "液体眉笔" },
    short: { en: "Liquid Brow", zh: "液体眉笔" },
    intro: {
      en: "Multi-prong, angled and ultra-slim brush tips for hair-stroke brow effects, in a range of barrel sizes.",
      zh: "多叉、斜切与极细毛刷笔头，适合描绘根根分明的眉形，提供多种笔杆规格。",
    },
    cover: "YD-033",
  },
  "liquid-eyeliners": {
    name: { en: "Liquid Eyeliner Pens", zh: "液体眼线笔" },
    short: { en: "Liquid Liner", zh: "液体眼线" },
    intro: {
      en: "Direct-fill, felt-core and refillable eyeliner pens — fine brush, hooked, multi-prong and stamp tips in plastic or aluminium barrels.",
      zh: "直液式、棉芯式与可替换芯眼线笔——极细刷头、弯钩、多叉与印章笔头，塑料或铝管笔杆。",
    },
    cover: "YD-091",
  },
  "gel-eyeliners": {
    name: { en: "Gel Eyeliner Pencils", zh: "眼线胶笔" },
    short: { en: "Gel Liner", zh: "眼线胶笔" },
    intro: {
      en: "Retractable and capped gel eyeliner pencils, with smudgers, brushes or sharpeners on selected models.",
      zh: "旋转式与带帽眼线胶笔，部分型号配晕染头、刷头或卷笔刀。",
    },
    cover: "YD-128-3",
  },
  "dip-eyeliners": {
    name: { en: "Dip Eyeliners", zh: "蘸取式眼线液" },
    short: { en: "Dip Liner", zh: "眼线液" },
    intro: {
      en: "Bottle-and-brush eyeliner packs with sculpted, faceted and slim silhouettes.",
      zh: "瓶身配刷头的眼线液包装，造型包括雕塑感、切面与纤细款。",
    },
    cover: "YD-306",
  },
  "dual-ended-pens": {
    name: { en: "Dual-Ended Eye Pens", zh: "双头眼部笔" },
    short: { en: "Dual-Ended", zh: "双头笔" },
    intro: {
      en: "Two-in-one designs combining eyeliner, brow, gel-pencil and correction ends in a single barrel.",
      zh: "二合一设计，将眼线、眉笔、胶笔与修正等功能结合于一支笔杆。",
    },
    cover: "YD-067-4",
  },
  "lip-liners-pens": {
    name: { en: "Lip Liners & Lip Pens", zh: "唇线笔与唇部笔" },
    short: { en: "Lip", zh: "唇部" },
    intro: {
      en: "Lip liner pencils, lipstick pencils, lip tint markers and click or twist-up lip formats.",
      zh: "唇线笔、口红笔、染唇笔，以及按压式与旋转式唇部产品。",
    },
    cover: "YD-074-6",
  },
  "face-specialty-pens": {
    name: { en: "Face & Specialty Pens", zh: "面部与功能笔" },
    short: { en: "Face & Specialty", zh: "面部与功能" },
    intro: {
      en: "Contour, highlight and eyeshadow sticks, under-eye highlight pens, freckle pens and correction pens.",
      zh: "修容、高光与眼影棒，卧蚕笔、点斑笔与修正笔。",
    },
    cover: "YD-030",
  },
};

/** Collections group categories into the two headline ranges. */
export const collectionIds = ["eyebrow", "eyeliner"] as const;
export type CollectionId = (typeof collectionIds)[number];

export const collections: Record<CollectionId, { name: L; tagline: L; intro: L; categories: CategoryId[]; cover: string }> = {
  eyebrow: {
    name: { en: "Eyebrow Collection", zh: "眉妆系列" },
    tagline: { en: "Pencils, liquid pens and brow gels", zh: "眉笔、液体眉笔与眉胶" },
    intro: {
      en: "Every brow format in one place — retractable and refillable pencils, multi-prong and fine-brush liquid pens, cream pens and clear gel.",
      zh: "汇集全部眉妆形态——自动与可替换眉笔、多叉与极细毛刷液体眉笔、眉膏笔与透明眉胶。",
    },
    categories: ["eyebrow-pencils", "liquid-eyebrow-pens"],
    cover: "YD-094-3",
  },
  eyeliner: {
    name: { en: "Eyeliner Collection", zh: "眼线系列" },
    tagline: { en: "Liquid pens, gel pencils and dip liners", zh: "液体眼线笔、眼线胶笔与眼线液" },
    intro: {
      en: "Liquid eyeliner pens with brush, felt, hooked, multi-prong and stamp tips, retractable gel pencils and dip eyeliner bottles.",
      zh: "刷头、棉芯、弯钩、多叉与印章头液体眼线笔，旋转式眼线胶笔与蘸取式眼线液。",
    },
    categories: ["liquid-eyeliners", "gel-eyeliners", "dip-eyeliners"],
    cover: "YD-089",
  },
};

// ---------------------------------------------------------------------------------------------
// Filter facets
// ---------------------------------------------------------------------------------------------

export const productTypes = {
  "liquid-pen": { en: "Liquid pen", zh: "液体笔" },
  retractable: { en: "Retractable pencil", zh: "旋转 / 自动笔" },
  pencil: { en: "Capped pencil", zh: "带帽笔" },
  stick: { en: "Stick / crayon", zh: "棒状" },
  "click-pen": { en: "Click pen", zh: "按压笔" },
  bottle: { en: "Bottle & applicator", zh: "瓶装配刷" },
} satisfies Record<string, L>;
export type ProductTypeId = keyof typeof productTypes;

export const tips = {
  "fine-brush": { en: "Fine brush", zh: "极细刷头" },
  "felt-tip": { en: "Felt / fibre tip", zh: "棉芯笔头" },
  "multi-prong": { en: "Multi-prong", zh: "多叉笔头" },
  "angled-tip": { en: "Angled tip", zh: "斜切笔头" },
  "hook-tip": { en: "Hooked tip", zh: "弯钩笔头" },
  stamp: { en: "Stamp head", zh: "印章头" },
  "pencil-lead": { en: "Pencil lead", zh: "笔芯" },
  spoolie: { en: "Spoolie", zh: "螺旋眉刷" },
  "applicator-brush": { en: "Applicator brush", zh: "刷头" },
  "sponge-tip": { en: "Sponge / cotton tip", zh: "海绵 / 棉头" },
  roller: { en: "Roller ball", zh: "滚珠头" },
  "direct-apply": { en: "Direct-apply bullet", zh: "直涂膏体" },
} satisfies Record<string, L>;
export type TipId = keyof typeof tips;

export const features = {
  "dual-ended": { en: "Dual-ended / multi-function", zh: "双头 / 多功能" },
  refillable: { en: "Refillable core", zh: "可替换芯" },
  "metal-barrel": { en: "Metal barrel", zh: "金属笔杆" },
  sharpener: { en: "Built-in sharpener", zh: "自带卷笔刀" },
  decorative: { en: "Decorative detailing", zh: "装饰细节" },
} satisfies Record<string, L>;
export type FeatureId = keyof typeof features;

/** What a brand can ask us to develop on any reference model — phrased as requests, never as guarantees. */
export const requestOptions = {
  logo: { en: "Logo printing", zh: "Logo 印刷" },
  colour: { en: "Barrel / cap colour", zh: "笔杆 / 笔帽颜色" },
  shades: { en: "Formula shades", zh: "膏体色号" },
  packaging: { en: "Outer packaging", zh: "外包装" },
} satisfies Record<string, L>;
export type RequestOptionId = keyof typeof requestOptions;

// ---------------------------------------------------------------------------------------------
// Packaging colourways (rendered photography exists for each listed product colourway)
// ---------------------------------------------------------------------------------------------

export const colorways = {
  noir: { name: { en: "Noir", zh: "曜石黑" }, swatch: ["#121110", "#D6BE98"] },
  ivory: { name: { en: "Ivory", zh: "象牙白" }, swatch: ["#EFE9E0", "#D6BE98"] },
  blush: { name: { en: "Blush", zh: "裸粉" }, swatch: ["#DDB7AC", "#D7A894"] },
  gold: { name: { en: "Gold", zh: "香槟金" }, swatch: ["#CDAA6E", "#EADCC2"] },
  sand: { name: { en: "Sand", zh: "砂岩" }, swatch: ["#D2C1AE", "#6A5045"] },
  crystal: { name: { en: "Crystal", zh: "透明" }, swatch: ["#F6F5F3", "#D6D2CC"] },
  espresso: { name: { en: "Espresso", zh: "咖啡棕" }, swatch: ["#3B2A23", "#CDAA6E"] },
  mocha: { name: { en: "Mocha", zh: "摩卡" }, swatch: ["#6A5045", "#D6BE98"] },
  frost: { name: { en: "Frost", zh: "磨砂白" }, swatch: ["#F1EFEB", "#D6BE98"] },
  taupe: { name: { en: "Taupe", zh: "灰褐" }, swatch: ["#A08C80", "#D6BE98"] },
  pearl: { name: { en: "Pearl", zh: "珍珠白" }, swatch: ["#F3EEE8", "#121110"] },
  silver: { name: { en: "Silver", zh: "银色" }, swatch: ["#D6D8DA", "#F4F4F4"] },
  rosewood: { name: { en: "Rosewood", zh: "玫瑰木" }, swatch: ["#8E5A4E", "#CDAA6E"] },
  petal: { name: { en: "Petal", zh: "花瓣粉" }, swatch: ["#B97B74", "#E6C4BB"] },
  terracotta: { name: { en: "Terracotta", zh: "陶土" }, swatch: ["#A9634F", "#E0B9A6"] },
} satisfies Record<string, { name: L; swatch: [string, string] }>;
export type ColorwayId = keyof typeof colorways;

// ---------------------------------------------------------------------------------------------
// Representative shade families (swatches are illustrative, final shades developed per brief)
// ---------------------------------------------------------------------------------------------

export type Shade = { name: L; hex: string };
const s = (en: string, zh: string, hex: string): Shade => ({ name: { en, zh }, hex });

export const shadeSets = {
  lip: [
    s("Cashmere Nude", "羊绒裸", "#C08A7A"),
    s("Rosewood", "玫瑰木", "#8E4F51"),
    s("Peony", "牡丹粉", "#C9616E"),
    s("Coral Silk", "珊瑚丝", "#D9675A"),
    s("Classic Red", "经典正红", "#A3202B"),
    s("Garnet", "石榴红", "#6E1B2A"),
    s("Fig", "无花果", "#5C2B33"),
    s("Cinnamon", "肉桂", "#9A5440"),
  ],
  gloss: [
    s("Crystal", "清透", "#F3EEE9"),
    s("Petal Pink", "花瓣粉", "#E7A6A5"),
    s("Rose Tint", "玫瑰调", "#C86C78"),
    s("Berry Glaze", "莓果釉", "#8A2C48"),
    s("Peach Nectar", "蜜桃汁", "#EBA383"),
    s("Champagne", "香槟闪", "#E3C7A6"),
  ],
  liner: [
    s("Bare", "素颜", "#B98073"),
    s("Spice", "香料棕", "#94584B"),
    s("Mauve", "豆沙紫", "#9C6273"),
    s("Brick", "砖红", "#8E3B33"),
    s("Berry", "莓果", "#6E2A3D"),
    s("Cocoa", "可可", "#5A3A31"),
  ],
  mascara: [
    s("Jet Black", "乌黑", "#121212"),
    s("Brown Black", "棕黑", "#2F2420"),
    s("Espresso", "咖啡棕", "#4A3328"),
    s("Clear", "透明", "#EDE9E3"),
  ],
  complexion: [
    s("Porcelain", "瓷白", "#F1D9C5"),
    s("Ivory", "象牙", "#E8C9AE"),
    s("Sand", "沙色", "#D9B08E"),
    s("Honey", "蜜色", "#C9965F"),
    s("Golden", "金调", "#B9844F"),
    s("Caramel", "焦糖", "#9B6A44"),
    s("Cocoa", "可可", "#6F4A33"),
    s("Espresso", "深棕", "#4A3022"),
  ],
  blush: [
    s("Petal", "花瓣", "#E7A2A0"),
    s("Rose", "玫瑰", "#D27C84"),
    s("Coral", "珊瑚", "#E58B6E"),
    s("Apricot", "杏色", "#E9A27A"),
    s("Berry", "莓果", "#A8506A"),
    s("Mauve", "豆沙", "#B07A86"),
  ],
  bronze: [s("Sunlit", "暖阳", "#C99569"), s("Bronze", "古铜", "#A97553"), s("Deep Bronze", "深古铜", "#7E5338")],
  highlight: [
    s("Champagne", "香槟", "#EBD3B5"),
    s("Pearl", "珍珠", "#F1E6DA"),
    s("Rose Gold", "玫瑰金", "#E3B7A2"),
    s("Bronze Glow", "古铜光", "#C99A70"),
  ],
  powder: [s("Translucent", "透明", "#F0E3D8"), s("Light", "浅色", "#E8D3BF"), s("Medium", "中间色", "#D2B192"), s("Deep", "深色", "#A87C5B")],
  eye: [
    s("Kohl Black", "墨黑", "#141414"),
    s("Espresso", "咖啡", "#3E2B24"),
    s("Bronze", "古铜", "#8A5A3B"),
    s("Taupe", "灰褐", "#7F6E66"),
    s("Deep Plum", "深梅", "#4A2737"),
  ],
  brow: [
    s("Blonde", "浅金棕", "#B08D6E"),
    s("Taupe", "灰褐", "#8A7365"),
    s("Soft Brown", "柔棕", "#6A5040"),
    s("Dark Brown", "深棕", "#4A372D"),
    s("Soft Black", "柔黑", "#2E2724"),
  ],
  neutralsPalette: [
    s("Linen", "亚麻", "#EAD6C4"),
    s("Biscuit", "饼干", "#D9B39C"),
    s("Clay", "陶土", "#C08A73"),
    s("Gilded", "鎏金", "#E3C3A0"),
    s("Terracotta", "赤陶", "#A86A55"),
    s("Mocha", "摩卡", "#7C4A3E"),
    s("Rose Quartz", "粉晶", "#D8A6A0"),
    s("Dusk", "暮色", "#9B6E6A"),
    s("Espresso", "浓咖", "#4B3530"),
  ],
  balm: [s("Honey Balm", "蜂蜜", "#F0D9A8"), s("Rose Balm", "玫瑰", "#EBC2B8")],
} satisfies Record<string, Shade[]>;
