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

//是否有存活玩家是指定的角色(包括管家继承),参数可以决定是否包含酒鬼
export function hasAlivePlayerByRole(allPlayer, roleId: string, includeDrunk?: boolean): any
{
  return allPlayer.some(player =>
  {
    if (player.status === 0)
    {
      if (player.role.id === roleId)
      {
        return true;
      }
      else if (player.role.id === "13" && player.inherit === true)
      {
        const {master} = player;

        if (master.role.id === roleId)
        {
          return true;
        }
        else if (includeDrunk === true && master.role.drunk === true)
        {
          return player.drunkRole.id === roleId;
        }
      }
      //判断酒鬼
      else if (includeDrunk === true && player.role.drunk === true)
      {
        return player.drunkRole.id === roleId;
      }
    }
  });
}

//返回存活且指定的角色(包括管家继承)的玩家,参数可以决定是否包含酒鬼
export function alivePlayerByRole(allPlayer: any[], roleId: string, includeDrunk?:boolean): any
{
  return allPlayer.filter(player =>
  {
    if (player.status === 0)
    {
      if (player.role.id === roleId)
      {
        return true;
      }
      //管家继承
      else if (player.role.id === "13" && player.inherit === true)
      {
        const {master} = player;

        if (master.role.id === roleId)
        {
          return true;
        }
        else if (includeDrunk === true && master.role.drunk === true)
        {
          return player.drunkRole.id === roleId;
        }
      }
      //判断酒鬼
      else if (includeDrunk === true && player.role.drunk === true)
      {
        return player.drunkRole.id === roleId;
      }
    }
  });
}

//返回玩家信息文本
export function getPlayerInfoText(playerList, allPlayer, includeRole?: boolean): any
{
  return playerList.map(player =>
  {
    const number = (allPlayer.indexOf(player) + 1).toString().padStart(2, "0");
    const {name} = player;

    //包括身份
    if (includeRole === true)
    {
      const {name, role} = player;
      const {name: roleName} = role;

      return `${number}-${name}(${roleName})`;
    }
    else
    {
      return `${number}-${name}`;
    }
  }).join(" | ");
}

//排序玩家,按照号码从小到大排列
export function sortPlayer(playerList, allPlayer)
{
  return playerList.sort((playerA, playerB) => allPlayer.indexOf(playerA) - allPlayer.indexOf(playerB));
}