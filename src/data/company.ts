/**
 * Company facts.
 *
 * VERIFIED — supplied by the client / visible in the client's own factory photographs.
 * PLACEHOLDER — must be confirmed by Yalilai before being published. Anything set to `null`
 * is hidden on the site automatically; nothing is invented.
 */

export const company = {
  // ---- VERIFIED --------------------------------------------------------------------------
  nameEn: "Yalilai Cosmetics Co., Ltd.",
  nameZh: "雅丽莱化妆品有限公司",
  wordmark: "YALILAI",
  /** Chinese address is authoritative. */
  addressZh: "浙江省金华市东阳市北鹿西街676号，4号楼2-3号电梯2楼",
  /** English rendering for visitors — romanisation to be confirmed by the client. */
  addressEn: "2nd Floor, Elevators 2–3, Building 4, No. 676 Beilu West Street, Dongyang City, Jinhua, Zhejiang Province, China",
  phoneDisplay: "+86 195 5515 0183",
  phoneE164: "+8619555150183",
  wechatId: "19555150183",
  business: "Cosmetics OEM/ODM, private-label makeup manufacturing and custom packaging",

  // ---- PLACEHOLDERS (CMS-editable, hidden while null) ---------------------------------------
  email: null as string | null,
  /** Public site URL, used for canonical links, sitemap and Open Graph. Set NEXT_PUBLIC_SITE_URL. */
  foundedYear: null as number | null,
  factoryAreaSqm: null as number | null,
  certifications: [] as string[],
  /** Only show if Yalilai explicitly approves a WhatsApp account. */
  whatsapp: null as string | null,
  /** Path to an authentic WeChat QR image supplied by Yalilai, e.g. "/images/contact/wechat-qr.png". */
  wechatQr: null as string | null,
};

/** Map search links use a text query — never an invented map pin. */
export const mapLinks = {
  amap: `https://uri.amap.com/search?keyword=${encodeURIComponent(company.addressZh)}`,
  baidu: `https://map.baidu.com/search/${encodeURIComponent(company.addressZh)}`,
  google: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.addressZh)}`,
};

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
