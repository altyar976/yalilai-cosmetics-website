import type { L } from "./taxonomy";
import manifest from "./generated/image-manifest.json";

/**
 * Authentic photographs supplied by Yalilai (taken on site, converted from the original HEIC
 * files, resized, metadata/GPS stripped — no retouching, no AI generation).
 * Captions describe only what is visible. They must not be read as proof of certification.
 */
export type FactoryPhoto = {
  id: string;
  src: string;
  w: number;
  h: number;
  blur?: string;
  title: L;
  caption: L;
  alt: L;
  area: L;
  original: string;
};

type Raw = Omit<FactoryPhoto, "w" | "h" | "blur" | "src"> & { file: string };

const raw: Raw[] = [
  {
    id: "reception",
    file: "reception-wall-yalilai-cosmetics.jpg",
    original: "IMG_2755.HEIC",
    area: { en: "Reception", zh: "前台" },
    title: { en: "Reception wall", zh: "企业形象墙" },
    caption: {
      en: "The company name in Chinese and English at the entrance, with the door to the production workshop on the right.",
      zh: "入口处的中英文企业名称墙，右侧为通往生产车间的门。",
    },
    alt: {
      en: "Wood-panelled reception wall with the lettering 雅丽莱化妆品有限公司 and Yalilai Cosmetics Co., Ltd.",
      zh: "木纹饰面形象墙，上有“雅丽莱化妆品有限公司”及“Yalilai Cosmetics Co., Ltd.”字样",
    },
  },
  {
    id: "meeting-room",
    file: "meeting-room.jpg",
    original: "IMG_2757.HEIC",
    area: { en: "Office", zh: "办公区" },
    title: { en: "Meeting room", zh: "会议室" },
    caption: {
      en: "Where project briefs, samples and packaging options are reviewed with clients.",
      zh: "与客户沟通项目需求、审阅样品及包材方案的会议室。",
    },
    alt: { en: "Meeting room with a long dark table, leather chairs and a projection screen", zh: "会议室内的深色长桌、皮质座椅与投影幕布" },
  },
  {
    id: "production-hall",
    file: "production-hall-packaging-equipment.jpg",
    original: "IMG_2759.HEIC",
    area: { en: "Workshop", zh: "车间" },
    title: { en: "Production hall", zh: "生产大厅" },
    caption: {
      en: "A bright, open production hall with automated packaging equipment and cartons staged for packing.",
      zh: "明亮开阔的生产大厅，配有自动化包装设备与待包装纸箱。",
    },
    alt: { en: "Spacious white workshop with stainless-steel packaging machinery and cardboard boxes", zh: "宽敞白色车间内的不锈钢包装设备与纸箱" },
  },
  {
    id: "packaging-machine",
    file: "automated-packaging-machine.jpg",
    original: "IMG_2762.HEIC",
    area: { en: "Workshop", zh: "车间" },
    title: { en: "Automated packaging line", zh: "自动化包装设备" },
    caption: {
      en: "Stainless-steel automated packaging equipment behind clear safety guarding.",
      zh: "配有透明防护罩的不锈钢自动化包装设备。",
    },
    alt: { en: "Stainless-steel automated machine with transparent guards in a clean white room", zh: "洁净白色房间内配透明防护罩的不锈钢自动化设备" },
  },
  {
    id: "assembly-feeders",
    file: "assembly-line-component-feeders.jpg",
    original: "IMG_2768.HEIC",
    area: { en: "Assembly", zh: "组装区" },
    title: { en: "Component feeders", zh: "组件送料设备" },
    caption: {
      en: "Vibratory bowl feeders supply components to an assembly station, operated by staff in protective clothing.",
      zh: "振动盘为组装工位输送组件，操作人员身着防护服。",
    },
    alt: { en: "Assembly machine with teal vibratory bowl feeders and a worker in a blue protective suit", zh: "配青绿色振动盘的组装设备与身穿蓝色防护服的员工" },
  },
  {
    id: "assembly-operator",
    file: "assembly-line-operator.jpg",
    original: "IMG_2769.HEIC",
    area: { en: "Assembly", zh: "组装区" },
    title: { en: "Assembly station", zh: "组装工位" },
    caption: {
      en: "An operator tending an automated assembly line, with packaging components staged in lined crates.",
      zh: "操作人员照看自动化组装线，包材组件放置于内衬周转箱中。",
    },
    alt: { en: "Worker in a blue gown and cap at an automated assembly line beside crates of dark components", zh: "身穿蓝色工作服与帽子的员工在自动化组装线旁，旁边是装有深色组件的周转箱" },
  },
  {
    id: "assembly-workshop",
    file: "assembly-workshop-stations.jpg",
    original: "IMG_2772.HEIC",
    area: { en: "Assembly", zh: "组装区" },
    title: { en: "Assembly workshop", zh: "组装车间" },
    caption: {
      en: "Multiple assembly stations running side by side, with components organised in covered crates.",
      zh: "多个组装工位并行运作，组件分类存放于加盖周转箱中。",
    },
    alt: { en: "Workshop with several assembly machines, workers in protective clothing and stacked blue crates", zh: "车间内多台组装设备、身穿防护服的员工与堆叠的蓝色周转箱" },
  },
  {
    id: "workshop-wide",
    file: "production-workshop-wide.jpg",
    original: "IMG_2774.HEIC",
    area: { en: "Workshop", zh: "车间" },
    title: { en: "Production workshop", zh: "生产车间全景" },
    caption: {
      en: "A wide view across the production workshop — epoxy floors, panelled walls and organised workstations.",
      zh: "生产车间全景——环氧地坪、彩钢板墙面与井然有序的工位。",
    },
    alt: { en: "Wide view of a white production workshop with glossy floor, workstations and equipment", zh: "白色生产车间全景，地面光洁，工位与设备整齐排列" },
  },
  {
    id: "hand-finishing",
    file: "conveyor-workstation-hand-finishing.jpg",
    original: "IMG_2777.HEIC",
    area: { en: "Assembly", zh: "组装区" },
    title: { en: "Conveyor workstation", zh: "输送线工位" },
    caption: {
      en: "Hand-finishing at a conveyor workstation, where components are checked and placed by hand.",
      zh: "输送线工位上的人工作业，对组件进行检查与手工放置。",
    },
    alt: { en: "Worker in a blue protective suit and hairnet handling small components beside a conveyor", zh: "身穿蓝色防护服、佩戴发帽的员工在输送线旁处理小组件" },
  },
  {
    id: "changing-rooms",
    file: "second-changing-rooms-workshop-entry.jpg",
    original: "IMG_2778.HEIC",
    area: { en: "Workshop entry", zh: "车间入口" },
    title: { en: "Changing rooms before the workshop", zh: "进入车间前的更衣区" },
    caption: {
      en: "Second-stage changing rooms (male / female) with the workshop-entry and hand-washing procedures posted on the wall.",
      zh: "男女二更室，墙上张贴进入车间流程与洗手步骤。",
    },
    alt: { en: "Two blue doors labelled for second-stage changing, a posted entry procedure and stainless benches", zh: "两扇标有二更字样的蓝色门、墙上张贴的进入车间流程与不锈钢台面" },
  },
  {
    id: "corridor",
    file: "clean-corridor-windows.jpg",
    original: "IMG_2765.HEIC",
    area: { en: "Corridor", zh: "走廊" },
    title: { en: "Workshop corridor", zh: "车间走廊" },
    caption: {
      en: "A long, daylit corridor with panelled walls and coved skirting running alongside the workshop.",
      zh: "沿车间延伸的明亮长廊，彩钢板墙面配圆弧踢脚。",
    },
    alt: { en: "Long white corridor with windows on the right and a no-smoking sign on the left wall", zh: "右侧开窗、左墙贴有禁止吸烟标识的白色长走廊" },
  },
  {
    id: "corridor-2",
    file: "clean-corridor-perspective.jpg",
    original: "IMG_2766.HEIC",
    area: { en: "Corridor", zh: "走廊" },
    title: { en: "Corridor perspective", zh: "走廊透视" },
    caption: {
      en: "A second view of the corridor, looking towards the workshop entrances.",
      zh: "走廊的另一视角，望向各车间入口。",
    },
    alt: { en: "Perspective of a bright corridor with windows and wall-mounted inspection windows", zh: "带窗户与墙面观察窗的明亮走廊透视" },
  },
];

const m = manifest as Record<string, { w: number; h: number; blur: string }>;

export const factoryPhotos: FactoryPhoto[] = raw.map(({ file, ...r }) => {
  const src = `/images/factory/${file}`;
  const meta = m[src];
  return { ...r, src, w: meta?.w ?? 1350, h: meta?.h ?? 2400, blur: meta?.blur };
});

export const factoryPhotoById = new Map(factoryPhotos.map((p) => [p.id, p]));
