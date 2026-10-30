import type { L } from "@/data/taxonomy";

/**
 * Insights — editable, evergreen guides written for brand founders. These are educational
 * articles, not company news, and contain no claims about Yalilai's own capacities or clients.
 * Add, edit or remove articles here; routes, sitemap and listing update automatically.
 */
export type Article = {
  slug: string;
  kind: L;
  title: L;
  dek: L;
  cover: string;
  minutes: number;
  sections: { heading: L; paragraphs: L[]; list?: L[] }[];
};

export const insightsPage = {
  meta: {
    title: { en: "Insights — Guides for Private-Label Makeup Brands", zh: "行业洞察——自有品牌彩妆指南" },
    description: {
      en: "Practical guides on briefing a manufacturer, choosing mascara components and selecting decoration methods.",
      zh: "实用指南：如何向制造商提交需求、如何选择睫毛膏部件，以及如何选择装饰工艺。",
    },
  },
  eyebrow: { en: "Insights", zh: "行业洞察" },
  title: { en: "Notes for\nbrand builders.", zh: "写给\n品牌创建者。" },
  intro: {
    en: "Evergreen guides from the manufacturing side of the table — written to help you brief clearly and decide confidently.",
    zh: "来自制造一方的实用指南——帮助您清晰提出需求、从容做出决定。",
  },
  guide: { en: "Guide", zh: "指南" },
  minutes: { en: "min read", zh: "分钟阅读" },
  editable: {
    en: "Editorial content managed in src/content/insights.ts.",
    zh: "编辑内容位于 src/content/insights.ts。",
  },
};

export const articles: Article[] = [
  {
    slug: "how-to-brief-a-private-label-makeup-manufacturer",
    kind: { en: "Guide", zh: "指南" },
    title: { en: "How to brief a private-label makeup manufacturer", zh: "如何向自有品牌彩妆制造商提交需求" },
    dek: {
      en: "The ten things that turn a first email into a useful quotation — and the details that can wait.",
      zh: "让第一封邮件变成一份有用报价的十件事——以及哪些细节可以稍后再定。",
    },
    cover: "/images/editorial/editorial-lips.webp",
    minutes: 6,
    sections: [
      {
        heading: { en: "Start with the customer, not the component", zh: "从顾客出发，而非从部件出发" },
        paragraphs: [
          {
            en: "A manufacturer can only recommend the right formula direction, packaging and decoration if it understands who will buy the product, where, and at what price. Two sentences about your customer and positioning are worth more than a page of component codes.",
            zh: "只有了解谁会购买、在哪里购买、以什么价格购买，制造商才能推荐合适的配方方向、包装与装饰工艺。关于目标顾客与定位的两句话，胜过一页部件编号。",
          },
        ],
      },
      {
        heading: { en: "What to include in a first brief", zh: "第一份需求应包含的内容" },
        paragraphs: [
          { en: "You don’t need every answer. You do need enough for a meaningful first response:", zh: "您无需回答所有问题，但需要足够的信息来获得有意义的初步答复：" },
        ],
        list: [
          { en: "Product types and the number of shades or SKUs", zh: "产品类型及色号或单品数量" },
          { en: "Two or three reference products, with what you like about each", zh: "两三款参考产品，以及您喜欢它们的地方" },
          { en: "Target market(s) — this shapes labelling and claims", zh: "目标市场——这会影响标签与宣称" },
          { en: "Retail price range and expected order quantity", zh: "零售价区间与预估订单量" },
          { en: "Packaging mood: colours, finishes, materials", zh: "包装风格：颜色、表面效果、材质" },
          { en: "Your timeline, including any launch date", zh: "时间计划，包括上市日期" },
        ],
      },
      {
        heading: { en: "Separate wishes from must-haves", zh: "区分“想要”与“必须”" },
        paragraphs: [
          {
            en: "Mark which requirements are fixed and which are flexible. A custom-coloured component, a specific claim or a very tight timeline can each change cost and minimum quantities; knowing your priorities lets the manufacturer propose sensible alternatives instead of a simple yes or no.",
            zh: "标明哪些要求不可更改、哪些可以灵活调整。定制颜色的部件、特定宣称或非常紧的时间，都可能改变成本与起订量；了解您的优先级，制造商才能提出合理的替代方案，而不只是简单地回答可以或不可以。",
          },
        ],
      },
      {
        heading: { en: "Claims deserve their own line", zh: "宣称值得单独列出" },
        paragraphs: [
          {
            en: "If you want to say waterproof, long-wear, transfer-resistant or anything similar, say so early. Claims need testing on the final formula and must follow the rules of each market, so they influence development from day one.",
            zh: "如果您希望宣称防水、持妆、不沾杯或类似效果，请尽早说明。宣称需要基于最终配方测试，并遵守各市场的法规，因此从第一天起就会影响开发方向。",
          },
        ],
      },
      {
        heading: { en: "What happens next", zh: "接下来会发生什么" },
        paragraphs: [
          {
            en: "Expect clarifying questions, feasibility notes and a proposal for sampling. The clearer the brief, the fewer sampling rounds you are likely to need — which is the quickest route to a product you are proud to launch.",
            zh: "您会收到澄清问题、可行性说明以及打样建议。需求越清晰，所需打样轮次通常越少——这正是打造一款令您自豪上市的产品的最快路径。",
          },
        ],
      },
    ],
  },
  {
    slug: "mascara-packaging-tubes-wipers-and-wands",
    kind: { en: "Guide", zh: "指南" },
    title: { en: "Mascara packaging 101: tubes, wipers and wands", zh: "睫毛膏包装入门：管身、刮片与刷头" },
    dek: {
      en: "Why the brush, the wiper and the tube matter as much as the formula — and how to choose them together.",
      zh: "为什么刷头、刮片与管身与配方同样重要——以及如何将它们作为一个整体来选择。",
    },
    cover: "/images/editorial/editorial-mascara.webp",
    minutes: 5,
    sections: [
      {
        heading: { en: "A system, not three parts", zh: "一个系统，而非三个部件" },
        paragraphs: [
          {
            en: "Mascara performance comes from the formula, the brush and the wiper working together. The wiper — the small ring inside the neck — controls how much product stays on the brush. Change one element and the result on the lashes can change noticeably.",
            zh: "睫毛膏的表现来自配方、刷头与刮片的共同作用。刮片——瓶口内的小环——决定刷头上保留多少膏体。改变其中任何一个，睫毛上的效果都可能明显不同。",
          },
        ],
      },
      {
        heading: { en: "Brush shapes and what they suggest", zh: "刷头造型及其传达的效果" },
        paragraphs: [{ en: "Common directions include:", zh: "常见方向包括：" }],
        list: [
          { en: "Hourglass fibre brushes — often chosen for volume stories", zh: "沙漏型纤维刷——常用于浓密卖点" },
          { en: "Straight, fine brushes — often chosen for length and separation", zh: "直型细刷——常用于纤长与分离卖点" },
          { en: "Curved brushes — designed to follow the lash line", zh: "弯月刷——贴合睫毛弧度" },
          { en: "Moulded combs — defined, separated lashes", zh: "硅胶梳刷——根根分明" },
          { en: "Micro brushes — lower lashes and corners", zh: "细小刷头——下睫毛与眼角" },
        ],
      },
      {
        heading: { en: "Tube shape is brand language", zh: "管型就是品牌语言" },
        paragraphs: [
          {
            en: "Round tubes are versatile; soft-square tubes stand out on shelf and resist rolling; slim tubes read refined. The cap is where most decoration lives, so consider cap height and finish alongside your logo.",
            zh: "圆管适用面广；圆角方管在货架上更醒目且不易滚动；细长管更显精致。大部分装饰位于瓶盖，因此在设计 Logo 时也要同时考虑盖子高度与表面效果。",
          },
        ],
      },
      {
        heading: { en: "Test the combination", zh: "测试组合效果" },
        paragraphs: [
          {
            en: "Always evaluate samples with the actual brush and wiper you plan to use. Ask to compare two brushes with the same formula — it is one of the most useful sampling exercises you can do.",
            zh: "务必使用计划采用的刷头与刮片评估样品。可以要求用同一配方对比两种刷头——这是最有价值的打样方式之一。",
          },
        ],
      },
    ],
  },
  {
    slug: "decoration-methods-screen-print-hot-stamp-labels",
    kind: { en: "Guide", zh: "指南" },
    title: { en: "Decoration methods explained: screen print, hot stamp and labels", zh: "装饰工艺详解：丝印、烫印与贴标" },
    dek: {
      en: "How your logo reaches the pack — and how to pick the right method for each component.",
      zh: "您的 Logo 如何呈现在包装上——以及如何为每个部件选择合适的工艺。",
    },
    cover: "/images/editorial/editorial-complexion.webp",
    minutes: 5,
    sections: [
      {
        heading: { en: "Screen printing", zh: "丝网印刷" },
        paragraphs: [
          {
            en: "Ink is pushed through a fine mesh onto the component. It suits crisp logos and text in one or more colours and works on many plastic and glass surfaces. Very fine details and tiny type should be checked on a sample.",
            zh: "油墨通过细网印到部件上，适合单色或多色的清晰 Logo 与文字，可用于多种塑料与玻璃表面。极细的细节和很小的字号需在样品上确认。",
          },
        ],
      },
      {
        heading: { en: "Hot stamping", zh: "烫印" },
        paragraphs: [
          {
            en: "A heated die presses metallic or coloured foil onto the surface, giving the bright gold or silver accents associated with prestige packaging. It works best on suitable flat or gently curved areas, and artwork usually needs to be simple and bold.",
            zh: "加热的模具将金属或彩色箔压印到表面，呈现高端包装常见的亮金或亮银效果。适用于平整或弧度平缓的区域，设计稿通常需简洁有力。",
          },
        ],
      },
      {
        heading: { en: "Labels", zh: "贴标" },
        paragraphs: [
          {
            en: "Printed paper or film labels are flexible for detailed artwork, small runs and regulatory text. Material choice affects durability and the overall look on shelf.",
            zh: "印刷纸质或薄膜标签适合细节丰富的设计、小批量以及法规文字。材质选择会影响耐用性与货架整体观感。",
          },
        ],
      },
      {
        heading: { en: "Choosing per component", zh: "按部件选择" },
        paragraphs: [
          {
            en: "Many products combine methods — for example a hot-stamped logo on the cap and a printed label with required information on the base. Share your artwork early so the method, colour and position can be confirmed on samples.",
            zh: "许多产品会组合使用多种工艺——例如瓶盖烫印 Logo，瓶底贴有包含必要信息的印刷标签。请尽早提供设计稿，以便在样品上确认工艺、颜色与位置。",
          },
        ],
        list: [
          { en: "Try different decoration in the Customization Studio", zh: "可在定制工作室中尝试不同装饰效果" },
          { en: "Confirm every method on a physical sample", zh: "每种工艺都以实物样品确认" },
        ],
      },
    ],
  },
];

export const articleBySlug = new Map(articles.map((a) => [a.slug, a]));
