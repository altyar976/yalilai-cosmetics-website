import type { L } from "@/data/taxonomy";

type Block = { title: L; body: L };

export const about = {
  meta: {
    title: { en: "About Yalilai Cosmetics — OEM/ODM Makeup Manufacturer in Dongyang, Zhejiang", zh: "关于雅丽莱化妆品——浙江东阳彩妆 OEM/ODM 制造商" },
    description: {
      en: "Yalilai Cosmetics Co., Ltd. (雅丽莱化妆品有限公司) is a cosmetics OEM/ODM manufacturer focused on private-label makeup and custom packaging.",
      zh: "雅丽莱化妆品有限公司是一家专注自有品牌彩妆与定制包装的化妆品 OEM/ODM 制造企业。",
    },
  },
  eyebrow: { en: "About us", zh: "关于我们" },
  title: { en: "Makeup, made\nfor other brands.", zh: "为品牌\n打造彩妆。" },
  intro: {
    en: "Yalilai Cosmetics Co., Ltd. — 雅丽莱化妆品有限公司 — works with beauty brands on OEM and ODM makeup: private-label products and the custom packaging that carries them.",
    zh: "雅丽莱化妆品有限公司与美妆品牌开展彩妆 OEM 与 ODM 合作：打造自有品牌产品，以及承载品牌的定制包装。",
  },
  storyTitle: { en: "Behind someone else’s name", zh: "成就他人的品牌" },
  story: [
    {
      en: "A private-label partner succeeds when the brand on the pack succeeds. That is why our work starts with your customer, your positioning and your references — not with a fixed catalogue.",
      zh: "当包装上的品牌取得成功，代工伙伴才算成功。因此，我们的工作从您的客户、定位与参考出发，而非一份固定的目录。",
    },
    {
      en: "Our facility in Dongyang, Zhejiang brings together production and assembly areas, a controlled workshop entry and a team that reviews projects with you from brief to delivery. The photographs on this website were taken there.",
      zh: "我们位于浙江东阳的工厂设有生产与组装区域、规范的车间入口流程，以及从需求到交付全程与您沟通项目的团队。本网站上的照片即拍摄于此。",
    },
    {
      en: "We publish only facts we can stand behind. Details such as founding year, capacities or certifications appear here once they are confirmed — and anything that applies to your project is shared directly with you.",
      zh: "我们只发布可以负责的信息。成立年份、产能或认证等信息将在确认后在此公布——与您项目相关的资料将直接提供给您。",
    },
  ] as L[],
  valuesTitle: { en: "How we like to work", zh: "我们的工作方式" },
  values: [
    { title: { en: "Clarity first", zh: "清晰优先" }, body: { en: "Specifications, samples and responsibilities written down before anything is produced.", zh: "生产前，规格、样品与责任均书面确认。" } },
    { title: { en: "Craft in the details", zh: "细节见匠心" }, body: { en: "Shade, texture, component fit and decoration are the difference between a product and a brand.", zh: "色号、质地、部件配合与装饰工艺，决定了产品能否成为品牌。" } },
    { title: { en: "Honest partnership", zh: "坦诚合作" }, body: { en: "Feasibility, cost and timing are discussed openly — including what we can’t or shouldn’t claim.", zh: "公开讨论可行性、成本与时间——包括哪些事情我们无法或不应宣称。" } },
  ] as Block[],
  factsTitle: { en: "Company details", zh: "公司信息" },
  factsNote: {
    en: "Verified details supplied by the company. Additional facts are added once confirmed.",
    zh: "以下为公司提供的已核实信息，其他信息将在确认后补充。",
  },
  facts: {
    nameEn: { en: "Company (English)", zh: "公司英文名" },
    nameZh: { en: "Company (Chinese)", zh: "公司中文名" },
    business: { en: "Business", zh: "主营业务" },
    businessValue: { en: "Cosmetics OEM/ODM, private-label makeup manufacturing, custom packaging", zh: "化妆品 OEM/ODM、自有品牌彩妆生产、定制包装" },
    location: { en: "Location", zh: "所在地" },
    locationValue: { en: "Dongyang, Jinhua, Zhejiang Province, China", zh: "中国浙江省金华市东阳市" },
    contact: { en: "Contact", zh: "联系方式" },
  },
};

export const services = {
  meta: {
    title: { en: "OEM, ODM & Private-Label Makeup Services", zh: "彩妆 OEM、ODM 与自有品牌服务" },
    description: {
      en: "OEM and ODM makeup development, private label, packaging sourcing, decoration and sampling — scoped around your brand and confirmed project by project.",
      zh: "彩妆 OEM 与 ODM 开发、自有品牌、包材采购、装饰工艺与打样——围绕您的品牌规划，并逐个项目确认。",
    },
  },
  eyebrow: { en: "OEM / ODM services", zh: "OEM / ODM 服务" },
  title: { en: "Three ways\nto work with us.", zh: "三种\n合作方式。" },
  intro: {
    en: "Whether you arrive with a finished specification or a mood board, we shape the engagement around what you already have.",
    zh: "无论您带着完整规格还是一块灵感板而来，我们都会围绕您已有的基础来规划合作。",
  },
  models: [
    {
      tag: { en: "OEM", zh: "OEM" },
      title: { en: "Your specification", zh: "按您的规格" },
      body: {
        en: "You bring the formula direction, shades and packaging specification; we review feasibility, propose adjustments where needed and manufacture to the approved sample.",
        zh: "您提供配方方向、色号与包装规格；我们评估可行性，必要时提出调整建议，并按确认样生产。",
      },
      points: [
        { en: "Feasibility review of your specification", zh: "评估您的规格可行性" },
        { en: "Component and decoration matching", zh: "匹配包材部件与装饰工艺" },
        { en: "Production to the approved sample", zh: "按确认样生产" },
      ],
    },
    {
      tag: { en: "ODM", zh: "ODM" },
      title: { en: "Our models, your brand", zh: "我们的型号，您的品牌" },
      body: {
        en: "Start from a reference model in our catalogue and develop it with your shades, barrel colours and branding.",
        zh: "从本网站目录中的参考型号出发，再结合您的色号、笔杆颜色与品牌元素进行开发。",
      },
      points: [
        { en: "139 reference models as a starting point", zh: "以 139 款参考型号为起点" },
        { en: "Shade and finish development", zh: "色号与妆效开发" },
        { en: "Packaging styling around your identity", zh: "围绕品牌形象设计包装风格" },
      ],
    },
    {
      tag: { en: "Private label", zh: "自有品牌" },
      title: { en: "Fast route to market", zh: "更快进入市场" },
      body: {
        en: "Select a model, request your colours and decoration, and focus your energy on brand and launch. Scope and timing are confirmed in your quotation.",
        zh: "选择型号，提出颜色与装饰需求，把精力集中在品牌与上市上。范围与时间以报价确认为准。",
      },
      points: [
        { en: "Eyebrow and eyeliner-led catalogue", zh: "以眉妆与眼线为核心的目录" },
        { en: "Logo decoration and printed cartons", zh: "Logo 装饰与印刷彩盒" },
        { en: "Clear sampling and approval steps", zh: "清晰的打样与确认步骤" },
      ],
    },
  ] as { tag: L; title: L; body: L; points: L[] }[],
  capabilitiesTitle: { en: "What we can help with", zh: "我们可以协助的内容" },
  capabilitiesNote: {
    en: "Availability of each service depends on the product, components and target market, and is confirmed in writing for your project.",
    zh: "各项服务的可用性取决于产品、部件与目标市场，并会针对您的项目书面确认。",
  },
  briefTitle: { en: "What to send us", zh: "建议提供的资料" },
  brief: [
    { en: "Product types and the number of shades or SKUs", zh: "产品类型及色号或单品数量" },
    { en: "Reference products, textures or shade swatches", zh: "参考产品、质地或色卡" },
    { en: "Packaging ideas: colours, finishes, decoration", zh: "包装想法：颜色、表面效果、装饰工艺" },
    { en: "Target market(s) and price positioning", zh: "目标市场与价格定位" },
    { en: "Estimated quantities and ideal timing", zh: "预估数量与理想时间" },
  ] as L[],
};

export const factoryPage = {
  meta: {
    title: { en: "Factory Tour — Real Photographs from Our Production Site", zh: "工厂参观——生产现场实拍" },
    description: {
      en: "Walk through Yalilai Cosmetics’ facility in Dongyang, Zhejiang: reception, workshop entry, assembly lines and production halls — all real, on-site photographs.",
      zh: "走进雅丽莱化妆品位于浙江东阳的工厂：前台、车间入口、组装线与生产大厅——全部为现场实拍照片。",
    },
  },
  eyebrow: { en: "Manufacturing & factory tour", zh: "生产制造与工厂参观" },
  title: { en: "Inside the\nfactory.", zh: "走进\n工厂。" },
  intro: {
    en: "Every photograph on this page was taken on site and supplied by Yalilai. Select any image to view it full screen.",
    zh: "本页每一张照片均为现场拍摄并由雅丽莱提供。点击任意图片即可全屏查看。",
  },
  zones: [
    { id: "arrive", title: { en: "Arrival & meetings", zh: "到访与会议" }, ids: ["reception", "meeting-room"], body: { en: "Clients are welcomed at reception, where the company name is displayed in Chinese and English, and projects are reviewed in the meeting room.", zh: "客户在前台受到接待，形象墙上展示中英文企业名称；项目在会议室中进行评审。" } },
    { id: "entry", title: { en: "Workshop entry", zh: "车间入口" }, ids: ["changing-rooms", "corridor", "corridor-2"], body: { en: "Staff pass through changing rooms where the workshop-entry and hand-washing procedures are posted, then along the corridor serving the workshops.", zh: "员工经过张贴有进入车间流程与洗手步骤的更衣室，再沿走廊进入各车间。" } },
    { id: "assembly", title: { en: "Assembly", zh: "组装" }, ids: ["assembly-feeders", "assembly-operator", "assembly-workshop", "hand-finishing"], body: { en: "Automated assembly stations with component feeders work alongside hand-finishing at conveyor workstations.", zh: "配有组件送料设备的自动化组装工位，与输送线上的人工作业相互配合。" } },
    { id: "production", title: { en: "Production & packing", zh: "生产与包装" }, ids: ["workshop-wide", "production-hall", "packaging-machine"], body: { en: "Open production halls with automated packaging equipment, where finished goods are staged for packing.", zh: "开阔的生产大厅配有自动化包装设备，成品在此等待包装。" } },
  ] as { id: string; title: L; body: L; ids: string[] }[],
  provenanceTitle: { en: "About these photographs", zh: "关于这些照片" },
  provenance: [
    { en: "Supplied by Yalilai and photographed on site.", zh: "由雅丽莱提供，现场拍摄。" },
    { en: "Converted from the original phone files and resized for the web; location metadata removed. No retouching or AI generation.", zh: "由原始手机文件转换并调整尺寸用于网页；已移除位置元数据。未作修饰，也未使用 AI 生成。" },
    { en: "Equipment is described in general terms. Ask our team about specific lines and capabilities for your product.", zh: "设备仅作一般性描述。具体产线与能力，请向我们团队咨询。" },
    { en: "These images are not evidence of any certification.", zh: "这些图片不作为任何认证的证明。" },
  ] as L[],
  visitTitle: { en: "Plan a visit", zh: "预约参观" },
  visitBody: {
    en: "Visits can be arranged by appointment. Contact us by phone or WeChat to agree a date.",
    zh: "可预约参观。请致电或微信联系我们确定日期。",
  },
};

export const quality = {
  meta: {
    title: { en: "Quality & Process — How Samples and Batches Are Reviewed", zh: "品质与流程——样品与批次如何审核" },
    description: {
      en: "How Yalilai approaches specifications, sample approval and batch review — with no unverified certification claims.",
      zh: "雅丽莱如何对待规格、样品确认与批次审核——不做任何未经核实的认证宣称。",
    },
  },
  eyebrow: { en: "Quality & process", zh: "品质与流程" },
  title: { en: "Quality is a\nseries of decisions.", zh: "品质，\n是一系列决定。" },
  intro: {
    en: "Good products come from clear agreements made early. Here is how we structure them — and the questions we encourage every brand to ask.",
    zh: "好产品源自早期清晰的约定。以下是我们的做法——以及我们鼓励每个品牌提出的问题。",
  },
  stages: [
    { title: { en: "Brief & specification", zh: "需求与规格" }, body: { en: "We capture product type, shade targets, texture and finish direction, components and decoration in a written specification you approve.", zh: "我们将产品类型、色号目标、质地与妆效方向、部件与装饰工艺整理为书面规格，经您确认。" } },
    { title: { en: "Sampling", zh: "打样" }, body: { en: "Samples are prepared for evaluation. Each round records your feedback so changes are deliberate and traceable.", zh: "准备样品供您评估。每一轮都记录您的反馈，让每次调整有据可查。" } },
    { title: { en: "Approved sample", zh: "确认样" }, body: { en: "Once you approve, the sample becomes the reference standard for production and for later checks.", zh: "经您确认后，样品即成为生产与后续检验的参照标准。" } },
    { title: { en: "Production review", zh: "生产审核" }, body: { en: "During production, components and finished goods are compared against the approved sample and the agreed criteria.", zh: "生产过程中，部件与成品均对照确认样与约定标准进行比对。" } },
    { title: { en: "Packing & release", zh: "包装与放行" }, body: { en: "Goods are packed to the agreed standard. Any deviation is discussed with you before release.", zh: "按约定标准包装。如有偏差，放行前与您沟通。" } },
  ] as Block[],
  askTitle: { en: "Questions worth asking any manufacturer", zh: "值得向任何制造商提出的问题" },
  ask: [
    { en: "Which documents and test reports are available for this specific product and market?", zh: "这款具体产品在目标市场可提供哪些文件与检测报告？" },
    { en: "How is the approved sample stored and used as a reference?", zh: "确认样如何保存，并如何作为参照使用？" },
    { en: "What happens if a batch differs from the approved sample?", zh: "如果某批次与确认样存在差异，将如何处理？" },
    { en: "Which claims (e.g. waterproof, long-wear) have been tested — and how?", zh: "哪些宣称（如防水、持妆）经过测试——如何测试？" },
    { en: "Who is responsible for labelling and regulatory compliance in my market?", zh: "在我的市场中，标签与法规合规由谁负责？" },
  ] as L[],
  claimsTitle: { en: "On claims and certifications", zh: "关于宣称与认证" },
  claims: {
    en: "This website does not display certification logos or performance guarantees. Product claims such as “waterproof” or “long-wear” require testing on the final formula, and regulatory responsibilities differ by market. We will tell you plainly what applies to your project and provide supporting documents directly where they exist.",
    zh: "本网站不展示认证标识或功效保证。诸如“防水”“持妆”等产品宣称需基于最终配方测试，且不同市场的法规责任不同。我们会如实告知哪些内容适用于您的项目，并在有相关文件时直接提供。",
  },
};

export const process = {
  meta: {
    title: { en: "How It Works — From Brief to Delivery", zh: "合作流程——从需求到交付" },
    description: {
      en: "The OEM/ODM journey with Yalilai Cosmetics: consultation, product and packaging direction, sampling, production, inspection and delivery coordination.",
      zh: "与雅丽莱化妆品的 OEM/ODM 合作流程：需求沟通、产品与包装方向、打样、生产、检验与交付协调。",
    },
  },
  eyebrow: { en: "How it works", zh: "合作流程" },
  title: { en: "Six steps from\nbrief to delivery.", zh: "从需求到交付，\n六个步骤。" },
  intro: {
    en: "A typical project follows these stages. Exact steps, timings and responsibilities vary and are confirmed in your quotation.",
    zh: "典型项目通常经历以下阶段。具体步骤、时间与分工因项目而异，并以报价确认为准。",
  },
  deliverables: [
    [{ en: "Brief summary", zh: "需求摘要" }, { en: "Open questions list", zh: "待确认问题清单" }],
    [{ en: "Specification draft", zh: "规格草案" }, { en: "Component options", zh: "部件选项" }],
    [{ en: "Physical samples", zh: "实物样品" }, { en: "Feedback record", zh: "反馈记录" }],
    [{ en: "Production plan", zh: "生产计划" }, { en: "Approved sample reference", zh: "确认样参照" }],
    [{ en: "Review against sample", zh: "对照确认样审核" }, { en: "Packing to agreed standard", zh: "按约定标准包装" }],
    [{ en: "Handover arrangement", zh: "交接安排" }, { en: "Shipping coordination", zh: "运输协调" }],
  ] as L[][],
  youTitle: { en: "Your role", zh: "您的角色" },
  you: [
    { en: "Share references and decisions promptly", zh: "及时提供参考与决定" },
    { en: "Approve artwork and samples in writing", zh: "书面确认设计稿与样品" },
    { en: "Confirm labelling and market requirements", zh: "确认标签与市场要求" },
  ] as L[],
  usTitle: { en: "Our role", zh: "我们的角色" },
  us: [
    { en: "Clarify feasibility, options and trade-offs", zh: "说明可行性、选项与取舍" },
    { en: "Develop samples and record changes", zh: "开发样品并记录调整" },
    { en: "Produce and review against the approved sample", zh: "按确认样生产与审核" },
  ] as L[],
};

export const faq = {
  meta: {
    title: { en: "FAQ — Private-Label Makeup Manufacturing", zh: "常见问题——自有品牌彩妆代工" },
    description: {
      en: "Answers about minimum quantities, samples, packaging, claims, the reference catalogue and how to start a project with Yalilai Cosmetics.",
      zh: "关于起订量、样品、包装、宣称、目录方案以及如何与雅丽莱化妆品启动项目的解答。",
    },
  },
  eyebrow: { en: "FAQ", zh: "常见问题" },
  title: { en: "Questions,\nanswered plainly.", zh: "问题，\n直接回答。" },
  intro: { en: "Can’t find what you need? Call or message us on WeChat.", zh: "没有找到需要的答案？欢迎致电或微信联系我们。" },
  items: [
    {
      q: { en: "What is your minimum order quantity (MOQ)?", zh: "起订量（MOQ）是多少？" },
      a: {
        en: "It depends on the product, formula and packaging components — custom-coloured or decorated components usually have their own minimums. We don’t publish a fixed MOQ; we confirm it after reviewing your brief.",
        zh: "起订量取决于产品、配方与包材部件——定制颜色或带装饰的部件通常有各自的起订要求。我们不公布固定起订量，会在审阅您的需求后确认。",
      },
    },
    {
      q: { en: "Are the catalogue products in stock?", zh: "目录中的产品有现货吗？" },
      a: {
        en: "The catalogue shows reference models for OEM / ODM development rather than retail stock. Availability, minimums, decoration and timing are confirmed by our team for each project.",
        zh: "目录展示的是用于 OEM / ODM 开发的参考型号，而非零售现货。供应情况、起订量、装饰工艺与时间安排由我们团队按项目确认。",
      },
    },
    {
      q: { en: "Can you develop samples before I commit?", zh: "下单前可以先打样吗？" },
      a: {
        en: "Sampling is a core part of every project. The number of sampling rounds and any sampling costs are explained in your quotation.",
        zh: "打样是每个项目的核心环节。打样轮次及相关费用会在报价中说明。",
      },
    },
    {
      q: { en: "How long does a project take?", zh: "项目周期需要多久？" },
      a: {
        en: "Timing depends on development complexity, component sourcing and quantities. We give a realistic timeline in the quotation rather than a generic promise.",
        zh: "时间取决于开发复杂度、包材采购与数量。我们会在报价中给出切实的时间安排，而非笼统的承诺。",
      },
    },
    {
      q: { en: "Can I use my own formula or packaging?", zh: "可以使用我自己的配方或包材吗？" },
      a: {
        en: "OEM projects can start from your specification. Share the details and we will review feasibility and any adjustments needed.",
        zh: "OEM 项目可以从您的规格出发。请提供详细信息，我们将评估可行性及所需调整。",
      },
    },
    {
      q: { en: "Do you design packaging and artwork?", zh: "可以设计包装与设计稿吗？" },
      a: {
        en: "We help you choose components, colours and decoration methods. Brand artwork is usually supplied by your team; we advise on what works for each printing method.",
        zh: "我们协助您选择部件、颜色与装饰工艺。品牌设计稿通常由您的团队提供，我们会就每种印刷工艺给出建议。",
      },
    },
    {
      q: { en: "Can you make waterproof, long-wear or plumping claims?", zh: "可以宣称防水、持妆或丰唇吗？" },
      a: {
        en: "Claims must be supported by testing on the final formula and comply with the rules of your market. We won’t suggest claims that haven’t been substantiated.",
        zh: "宣称必须基于最终配方的测试并符合目标市场的法规。我们不会建议未经证实的宣称。",
      },
    },
    {
      q: { en: "Which certifications do you hold?", zh: "你们有哪些认证？" },
      a: {
        en: "We don’t display certification logos on this website. Ask us which documents are available for your product and market — we will share only what genuinely applies.",
        zh: "本网站不展示认证标识。请咨询您的产品与目标市场可提供哪些文件——我们只提供真实适用的资料。",
      },
    },
    {
      q: { en: "Do you ship internationally?", zh: "可以国际发货吗？" },
      a: {
        en: "Delivery and export arrangements are coordinated per project with you or your forwarder; terms are confirmed in the quotation.",
        zh: "交付与出口安排按项目与您或您的货代协调，条款以报价确认为准。",
      },
    },
    {
      q: { en: "How do I start?", zh: "如何开始合作？" },
      a: {
        en: "Add models to your inquiry list or build a concept in the Customization Studio, then send a quote request. You can also call +86 195 5515 0183 or add WeChat 19555150183.",
        zh: "将型号加入询价清单，或在定制工作室中创建方案，然后提交询价。也可致电 +86 195 5515 0183 或添加微信 19555150183。",
      },
    },
  ] as { q: L; a: L }[],
};

export const legal = {
  privacy: {
    meta: { title: { en: "Privacy Policy", zh: "隐私政策" }, description: { en: "How inquiry information is handled.", zh: "询价信息的处理方式。" } },
    notice: {
      en: "Template for review — this policy must be reviewed and completed by Yalilai with qualified legal counsel before the website is published.",
      zh: "待审阅模板——网站上线前，须由雅丽莱与专业法律顾问审阅并完善本政策。",
    },
    sections: [
      { title: { en: "Who we are", zh: "我们是谁" }, body: { en: "This website is operated for Yalilai Cosmetics Co., Ltd. (雅丽莱化妆品有限公司), 2nd Floor, Elevators 2–3, Building 4, No. 676 Beilu West Street, Dongyang, Jinhua, Zhejiang, China.", zh: "本网站由雅丽莱化妆品有限公司运营，地址：浙江省金华市东阳市北鹿西街676号，4号楼2-3号电梯2楼。" } },
      { title: { en: "What we collect", zh: "我们收集的信息" }, body: { en: "When you submit a quote request we receive the details you enter (such as name, company, country, email, optional phone/WeChat, project information) and any files you choose to attach.", zh: "当您提交询价时，我们会收到您填写的信息（如姓名、公司、国家或地区、邮箱、选填的电话/微信、项目信息）以及您选择上传的文件。" } },
      { title: { en: "Stored in your browser", zh: "保存在您浏览器中的信息" }, body: { en: "Your inquiry list, shortlist, language choice and Customization Studio draft are stored locally in your browser so they persist between pages. Logos uploaded to the Studio stay in your browser and are not sent unless you attach them to a quote request.", zh: "您的询价清单、收藏、语言选择与定制工作室草稿保存在您的浏览器本地，以便跨页面保留。上传到工作室的 Logo 仅保存在您的浏览器中，除非您在询价中附上，否则不会发送。" } },
      { title: { en: "How we use it", zh: "使用方式" }, body: { en: "We use inquiry information only to respond to you and to prepare quotations. [To be completed: retention period, service providers, legal basis, cross-border transfer.]", zh: "我们仅使用询价信息回复您并准备报价。[待补充：保存期限、服务提供方、法律依据、跨境传输。]" } },
      { title: { en: "Your choices", zh: "您的权利" }, body: { en: "You can ask us to access, correct or delete your information by phone (+86 195 5515 0183) or WeChat (19555150183). [To be completed per applicable law.]", zh: "您可通过电话（+86 195 5515 0183）或微信（19555150183）要求查阅、更正或删除您的信息。[依适用法律补充。]" } },
    ] as Block[],
  },
  terms: {
    meta: { title: { en: "Terms of Use", zh: "使用条款" }, description: { en: "Terms for using this website.", zh: "本网站的使用条款。" } },
    notice: {
      en: "Template for review — these terms must be reviewed and completed by Yalilai with qualified legal counsel before the website is published.",
      zh: "待审阅模板——网站上线前，须由雅丽莱与专业法律顾问审阅并完善本条款。",
    },
    sections: [
      { title: { en: "Catalogue content", zh: "目录内容" }, body: { en: "Catalogue items are reference models for OEM / ODM development. They are not stock and not offers for sale; dimensions and capacities are reference values, and availability, specifications and decoration are confirmed in writing for each project.", zh: "目录中的产品为用于 OEM / ODM 开发的参考型号，并非现货或销售要约；尺寸与容量为参考数值，供应情况、规格与装饰工艺均针对每个项目书面确认。" } },
      { title: { en: "Illustrative renderings", zh: "示意渲染" }, body: { en: "3D renderings outside the catalogue (for example on the home page and in the Customization Studio) are illustrative; “YOUR BRAND” marks where decoration can appear. No third-party trademarks are used.", zh: "目录以外的三维渲染图（例如首页与定制工作室）仅作示意；“YOUR BRAND”示意装饰可出现的位置。本网站未使用任何第三方商标。" } },
      { title: { en: "Photographs", zh: "照片" }, body: { en: "Factory photographs are genuine on-site images supplied by Yalilai and may not be reused without permission.", zh: "工厂照片为雅丽莱提供的现场真实照片，未经许可不得转载使用。" } },
      { title: { en: "Quotations", zh: "报价" }, body: { en: "Information on this website does not constitute a quotation or contract. [To be completed: governing law, liability, intellectual property.]", zh: "本网站信息不构成报价或合同。[待补充：适用法律、责任、知识产权。]" } },
    ] as Block[],
  },
};
