import type { L } from "@/data/taxonomy";

export const contact = {
  meta: {
    title: { en: "Request a Quote — Private-Label Makeup Manufacturing", zh: "获取报价——自有品牌彩妆代工" },
    description: {
      en: "Send your private-label makeup brief to Yalilai Cosmetics. Call +86 195 5515 0183 or add WeChat 19555150183.",
      zh: "向雅丽莱化妆品提交您的自有品牌彩妆需求。致电 +86 195 5515 0183 或添加微信 19555150183。",
    },
  },
  eyebrow: { en: "Request a quote", zh: "获取报价" },
  title: { en: "Tell us what\nyou want to create.", zh: "告诉我们\n您想打造的产品。" },
  intro: {
    en: "A clear brief gets a clear answer. Share as much or as little as you know — we will follow up with questions, feasibility notes and next steps.",
    zh: "清晰的需求带来清晰的答复。无论您了解多少都可以分享——我们会跟进问题、可行性说明与下一步安排。",
  },
  direct: { en: "Prefer to talk directly?", zh: "希望直接沟通？" },
  directBody: {
    en: "Call or add us on WeChat. The WeChat ID is the same as the phone number.",
    zh: "欢迎致电或添加微信，微信号与电话号码相同。",
  },
  form: {
    sectionYou: { en: "About you", zh: "您的信息" },
    sectionProject: { en: "Your project", zh: "项目信息" },
    sectionFiles: { en: "References", zh: "参考资料" },
    name: { en: "Full name", zh: "姓名" },
    company: { en: "Brand / company", zh: "品牌 / 公司" },
    country: { en: "Country / region", zh: "国家 / 地区" },
    email: { en: "Email", zh: "邮箱" },
    contact: { en: "Phone or WeChat (optional)", zh: "电话或微信（选填）" },
    categories: { en: "Product categories", zh: "产品品类" },
    concepts: { en: "Products of interest", zh: "意向产品" },
    conceptsFromList: { en: "From your inquiry list", zh: "来自询价清单" },
    conceptsExtra: { en: "Other products or notes", zh: "其他产品或备注" },
    conceptsPlaceholder: {
      en: "e.g. YD-094-3 liquid brow pen in matte black, 3 shades, silver logo",
      zh: "例如：YD-094-3 液体眉笔，哑光黑，3 个色号，银色 Logo",
    },
    quantity: { en: "Estimated order quantity", zh: "预估订单数量" },
    quantityHint: {
      en: "Your own estimate per SKU or in total — minimum quantities are confirmed after review.",
      zh: "按单品或总量填写您的预估——起订量在审阅后确认。",
    },
    packaging: { en: "Packaging preferences", zh: "包装偏好" },
    packagingPlaceholder: {
      en: "Colours, finishes, materials, decoration, boxes…",
      zh: "颜色、表面效果、材质、装饰工艺、外盒……",
    },
    timeline: { en: "Timeline", zh: "时间计划" },
    timelineOptions: {
      asap: { en: "Within 3 months", zh: "3 个月内" },
      "3-6": { en: "3–6 months", zh: "3–6 个月" },
      "6-12": { en: "6–12 months", zh: "6–12 个月" },
      exploring: { en: "Just exploring", zh: "尚在了解" },
    },
    select: { en: "Select…", zh: "请选择……" },
    message: { en: "Message", zh: "留言" },
    messagePlaceholder: {
      en: "Your brand, target market, price positioning, references, questions…",
      zh: "您的品牌、目标市场、价格定位、参考产品、问题……",
    },
    files: { en: "Reference files (optional)", zh: "参考文件（选填）" },
    filesHint: {
      en: "Up to 3 files · JPG, PNG, WebP or PDF · max 8 MB each. Used only to evaluate your inquiry.",
      zh: "最多 3 个文件 · JPG、PNG、WebP 或 PDF · 单个不超过 8 MB。仅用于评估您的询价。",
    },
    addFiles: { en: "Add files", zh: "添加文件" },
    consent: {
      en: "I agree that Yalilai may use these details to respond to my inquiry, as described in the",
      zh: "我同意雅丽莱使用以上信息回复我的询价，详见",
    },
    privacy: { en: "privacy policy", zh: "隐私政策" },
    required: { en: "Required", zh: "必填" },
    submit: { en: "Send inquiry", zh: "提交询价" },
    sending: { en: "Sending…", zh: "正在发送……" },
  },
  errors: {
    required: { en: "Please complete this field.", zh: "请填写此项。" },
    email: { en: "Please enter a valid email address.", zh: "请输入有效的邮箱地址。" },
    message: { en: "Please write at least a short message (10+ characters).", zh: "请至少填写一段简短留言（10 个字符以上）。" },
    consent: { en: "Please accept the privacy notice to continue.", zh: "请同意隐私说明后继续。" },
    fileType: { en: "Only JPG, PNG, WebP or PDF files are accepted.", zh: "仅支持 JPG、PNG、WebP 或 PDF 文件。" },
    fileSize: { en: "Each file must be 8 MB or smaller.", zh: "单个文件不得超过 8 MB。" },
    fileCount: { en: "You can attach up to 3 files.", zh: "最多可上传 3 个文件。" },
    summary: { en: "Please check the highlighted fields.", zh: "请检查标出的字段。" },
  },
  states: {
    successTitle: { en: "Thank you — your inquiry has been sent.", zh: "谢谢——您的询价已发送。" },
    successBody: {
      en: "Your reference number is below. Our team will reply by email. For anything urgent, call or message us on WeChat.",
      zh: "您的询价编号如下。我们的团队将通过邮件回复。如有急事，欢迎致电或微信联系。",
    },
    reference: { en: "Reference", zh: "编号" },
    another: { en: "Send another inquiry", zh: "再提交一份询价" },
    notConfiguredTitle: { en: "Online submission is not connected yet.", zh: "在线提交功能尚未接通。" },
    notConfiguredBody: {
      en: "Your inquiry was NOT sent. Please copy your summary and send it to us by WeChat or phone — nothing you typed has been lost.",
      zh: "您的询价尚未发送。请复制询价摘要，通过微信或电话发送给我们——您填写的内容不会丢失。",
    },
    notConfiguredBanner: {
      en: "Heads-up: the online form is awaiting configuration. You can still prepare your inquiry here and copy it to WeChat.",
      zh: "提示：在线表单正在等待配置。您仍可在此填写询价，并复制发送至微信。",
    },
    copySummary: { en: "Copy inquiry summary", zh: "复制询价摘要" },
    rateLimited: { en: "Too many attempts. Please wait a few minutes and try again, or contact us by WeChat.", zh: "尝试次数过多。请稍候几分钟再试，或通过微信联系我们。" },
    bot: { en: "We could not verify the submission. Please wait a moment and try again.", zh: "无法验证此次提交，请稍候再试。" },
    failed: { en: "Something went wrong while sending. Your inquiry was not sent — please try again or contact us by WeChat.", zh: "发送时出现问题，询价未能发送——请重试或通过微信联系我们。" },
    fileInvalid: { en: "One of the files could not be accepted. Please check type and size.", zh: "有文件无法接收，请检查类型与大小。" },
  },
} satisfies Record<string, unknown>;

export type ContactCopy = typeof contact;
export type { L };
