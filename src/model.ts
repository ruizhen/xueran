//角色 group:0平民,1为外来者,2为恶魔 strong:是否为强神 poison: 是否吃天毒 info: 是否为信息位
export const roleList =
[
  {
    id: "0",
    name: "洗衣妇",
    group: 0,
    strong: false,
    info: false,
    poison: true,
    f4: true,
  },
  {
    id: "1",
    name: "图书管理员",
    group: 0,
    strong: false,
    info: false,
    poison: true,
    f4: true,
  },
  {
    id: "2",
    name: "调查员",
    group: 0,
    strong: false,
    info: false,
    poison: true,
    f4: true,
  },
  {
    id: "3",
    name: "厨师",
    group: 0,
    strong: false,
    info: false,
    poison: true,
    f4: true,
  },
  {
    id: "4",
    name: "共情者",
    group: 0,
    strong: true,
    info: true,
    poison: true,
  },
  {
    id: "5",
    name: "占卜师",
    group: 0,
    strong: true,
    info: true,
    poison: true,
  },
  {
    id: "6",
    name: "掘墓人",
    group: 0,
    strong: true,
    info: true,
    poison: false,
  },
  {
    id: "7",
    name: "僧侣",
    group: 0,
    strong: true,
    info: false,
    poison: false,
  },
  {
    id: "8",
    name: "守鸦人",
    group: 0,
    strong: true,
    info: true,
    poison: false,
  },
  {
    id: "9",
    name: "圣女",
    group: 0,
    strong: true,
    info: false,
    absolute: true,
    poison: true,
  },
  {
    id: "10",
    name: "枪手",
    group: 0,
    strong: true,
    info: false,
    absolute: true,
    poison: true,
  },
  {
    id: "11",
    name: "士兵",
    group: 0,
    strong: false,
    info: false,
    poison: false,
  },
  {
    id: "12",
    name: "市长",
    group: 0,
    strong: true,
    info: false,
    poison: false,
  },
  {
    id: "13",
    name: "管家",
    group: 1
  },
  {
    id: "14",
    name: "酒鬼",
    group: 1,
    drunk: true
  },
  {
    id: "15",
    name: "隐士",
    group: 1
  },
  {
    id: "16",
    name: "圣徒",
    group: 1
  },
  {
    id: "17",
    name: "下毒者",
    group: 2
  },
  {
    id: "18",
    name: "间谍",
    group: 2
  },
  {
    id: "19",
    name: "猩红女巫",
    group: 2
  },
  {
    id: "20",
    name: "男爵",
    group: 2
  },
  {
    id: "21",
    name: "小恶魔",
    group: 2,
    devil: true
  }
];

export const statusMap =
{
  default: "等待开始", //未开始
  0: "存活",
  1: "处决",
  2: "夺魂",
  3: "神罚",
  4: "枪杀",
  5: "反弹",
  6: "自尽"
};

export const defaultPlayer =
[
  {
    name: "王瑞"
  },
  {
    name: "王丹敏"
  },
  {
    name: "崔瑞"
  },
  {
    name: "豆总"
  },
  {
    name: "毛毛"
  },
  {
    name: "丽华"
  },
  {
    name: "馨怡"
  },
  {
    name: "陈靖"
  },
  {
    name: "耿耿"
  },
  {
    name: "陈总"
  },
  {
    name: "陈多肉"
  },
  {
    name: "汶雨"
  },
];

export function random(max)
{
  return Math.floor(Math.random() * max);
}