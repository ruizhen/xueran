<template>
  <div class="container">
    <!--操作部分-->
    <div class="operation-container">
      <p>当局总时长：{{getTimeText(roundTime)}}</p>
      <el-scrollbar ref="scrollbar" class="scrollbar">
        <div class="info-container">
          <div v-for="dayInfo in dayInfoList" :key="dayInfo" class="day-info-container" :data-cancel="dayInfo.cancel" :data-hide="dayInfo.hide">
            <el-button size="small" type="primary" v-if="dayInfo.cancel === true" @click="dayInfo.hide = !dayInfo.hide" class="button">显示/隐藏</el-button>
            <span class="day-title" :data-type="dayInfo.dayType">{{dayTitleText(dayInfo.dayIndex, dayInfo.dayType)}} {{getTimeText(dayInfo.roundTime, false)}}</span>
            <div v-for="info in dayInfo.infoList" :key="info" class="info-row">
              <template v-if="info.type === `status`">
                <span class="info-text">说书人将</span>
                <span class="info-text">{{info.playerNo}}</span>
                <span class="name">{{info.playerName}}</span>
                <span class="info-status" :data-status="info.status">{{info.statusText}}</span>
              </template>
              <span v-else-if="info.type === `result`" class="info-result">{{info.deadCount > 0 ? `死亡人数：${info.deadCount}` : `无事发生`}}</span>
              <span v-else class="info-text">{{info.text}}</span>
            </div>
            <div class="step-container">
              <!--毒-->
              <div class="step-row" :data-active="dayInfo.stepIndex === 0">
                <el-icon v-if="dayInfo.stepIndex === 0" color="green"><Right/></el-icon>
                <el-icon v-else-if="dayInfo.stepIndex > 0" color="green"><Check/></el-icon>
                <span v-if="dayInfo.poisonCount === 0">没有毒药</span>
                <span v-else class="step-text">请选择邪恶阵营选择下毒对象...毒药数量：{{poisonCount}}</span>
                <el-button v-if="dayInfo.stepIndex === 0" size="small" type="primary" @click="nextStepInNight(dayInfo)">下一步</el-button>
              </div>
              <!--刀-->
              <div class="step-row" :data-active="dayInfo.stepIndex === 1">
                <el-icon v-if="dayInfo.stepIndex === 1" color="green"><Right/></el-icon>
                <el-icon v-else-if="dayInfo.stepIndex > 1" color="green"><Check/></el-icon>
                <span class="step-text">请选择邪恶阵营选择夺魂对象</span>
                <el-button v-if="dayInfo.stepIndex === 1" size="small" type="primary" @click="nextStepInNight(dayInfo)">下一步</el-button>
              </div>
              <!--验-->
              <div class="step-row" :data-active="dayInfo.stepIndex === 2">
                <el-icon v-if="dayInfo.stepIndex === 2" color="green"><Right/></el-icon>
                <el-icon v-else-if="dayInfo.stepIndex > 2" color="green"><Check/></el-icon>
                <span class="step-text">dayInfo.validInfo</span>
                <el-button v-if="dayInfo.stepIndex === 2" size="small" type="primary" @click="nextStepInNight(dayInfo)">下一步</el-button>
              </div>
              <!--守-->
              <div class="step-row" :data-active="dayInfo.stepIndex === 3">
                <el-icon v-if="dayInfo.stepIndex === 3" color="green"><Right/></el-icon>
                <el-icon v-else-if="dayInfo.stepIndex > 3" color="green"><Check/></el-icon>
                <span class="step-text">请僧侣选择要守护的对象</span>
                <el-button v-if="dayInfo.stepIndex === 3" size="small" type="primary" @click="nextStepInNight(dayInfo)">下一步</el-button>
              </div>
            </div>
            <div v-if="dayIndex === dayInfo.dayIndex && dayType === dayInfo.dayType" class="day-operation-container">
            </div>
          </div>
        </div>
      </el-scrollbar>
      <div v-if="isPlaying === true" class="operation-shortcut">
        <el-button type="primary" @click="nextStep">进入下一阶段({{nextStepText}})</el-button>
        <el-button type="primary" v-if="dayIndex > 0" @click="prevStep">返回上一阶段({{prevStepText}})</el-button>
      </div>
      <div v-if="isPlaying === true" class="operation-shortcut">
        <el-button v-if="allPlayerInfo.some(data => data.role.id === `13`)" type="warning" @click="poisonCount++">添加一瓶毒药(管家送毒)</el-button>
        <el-button v-if="allPlayerInfo.some(data => data.role.id === `13`) && poisonCount > 0" type="warning" @click="poisonCount++">减少一瓶毒药</el-button>
      </div>
      <div v-if="isPlaying === true" class="operation-shortcut">
        <el-button @click="roll">掷骰子(1-100)</el-button>
        <el-button @click="rollPlayer">掷存活玩家号码骰子</el-button>
      </div>
    </div>
    <!--玩家信息配置面板-->
    <div class="config-container">
      <div class="player-select">
        <el-button v-for="player in defaultPlayer" :key="player" class="player-add-button" :type="allPlayerInfo.some(data => data.name === player.name) ? `success` : null" size="small" @click="addPlayer(player.name)">添加 {{player.name}}</el-button>
      </div>
      <div class="player-add-container">
        <el-input v-model="newPlayer.name" size="small" placeholder="输入新玩家名字"/>
        <el-button size="small" type="primary" @click="addPlayer">添加新玩家</el-button>
      </div>
      <div class="role-container">
        <span>村民个数：</span>
        <el-input-number v-model="assignRoleData.goodCount" class="role-number" size="small"  :step="1" :precision="0" :step-strictly="true" :min="2" :max="13"></el-input-number>
        <span>外来者个数：</span>
        <el-input-number v-model="assignRoleData.normalCount" class="role-number" size="small"  :step="1" :precision="0" :step-strictly="true" :min="0" :max="4"></el-input-number>
        <span>爪牙个数：</span>
        <el-input-number v-model="assignRoleData.badCount" class="role-number" size="small"  :step="1" :precision="0" :step-strictly="true" :min="0" :max="4"></el-input-number>
      </div>
      <p class="role-total">角色总人数：{{assignRoleCount}}，村民：{{assignRoleData.goodCount}}，外来者：{{assignRoleData.normalCount}}，爪牙：{{assignRoleData.badCount}}，小恶魔: 1<span v-if="roleErrorMessage" class="role-error-message">{{roleErrorMessage}}</span></p>
      <p>玩家总人数：{{allPlayerInfo.length}}</p>
      <!--玩家-->
      <div class="player-container">
        <div v-for="(player, index) in allPlayerInfo" :key="index" class="player-row" :data-status="player.status" :data-group="player.role?.group">
          <span class="number">{{(index + 1).toString().padStart(2, "0")}}</span>
          <span class="name">{{player.name}}</span>
          <span class="role" :data-role="player.role?.group">{{getRoleName(player)}}</span>
          <span v-if="player.deadDayIndex == null" class="status">{{getStatusText(player.status)}}<span v-if="player.poison == true" class="poison">(中毒)</span></span>
          <span v-else class="status">{{getStatusText(player.status)}}({{dayTitleText(player.deadDayIndex, player.deadDayType)}})<span v-if="player.poison == true" class="poison">(中毒)</span></span>
          <el-button v-if="isPlaying === false" size="small" type="danger" @click="removePlayer(index)">移除</el-button>
          <template v-if="isPlaying === true">
            <el-button v-if="player.status !== 0" size="small" @click="setPlayerStatus(player, 0)" type="success">复活</el-button>
            <el-button size="small" @click="player.poison = !player.poison" color="#5eff6e">{{player.poison === true ? "解毒" : "下毒"}}</el-button>
            <el-button v-if="dayIndex > 0 && player.status === 0" size="small" @click="setPlayerStatus(player, 1)" color="#9b9cff">{{statusMap[1]}}</el-button>
            <el-button v-if="dayIndex > 0 && player.status === 0" size="small" @click="setPlayerStatus(player, 2)" color="darkred">{{statusMap[2]}}</el-button>
            <el-button v-if="dayIndex > 0 && allPlayerInfo.some(data => data.role.id === `9`) && player.status === 0" size="small" @click="setPlayerStatus(player, 3)" color="#ffaac4">{{statusMap[3]}}</el-button>
            <el-button v-if="dayIndex > 0 && allPlayerInfo.some(data => data.role.id === `10`) && player.status === 0" size="small" @click="setPlayerStatus(player, 4)" color="#fff686">{{statusMap[4]}}</el-button>
            <el-button v-if="dayIndex > 0 && allPlayerInfo.some(data => data.role.id === `12`) && player.status === 0" size="small" @click="setPlayerStatus(player, 5)" color="#5876ff">{{statusMap[5]}}</el-button>
            <el-button v-if="dayIndex > 0 && player.status === 0 && player.role.group === 2" size="small" @click="setPlayerStatus(player, 6)" color="#ff4ba7">{{statusMap[6]}}</el-button>
          </template>
        </div>
      </div>
      <div v-if="isPlaying === false">
        <el-button v-if="!roleErrorMessage" type="primary" @click="assignRole">分配角色</el-button>
        <el-button v-if="isPlaying === false && assignRoleData.goodRole?.length > 0" type="danger" @click="clearRole">重置分配</el-button>
      </div>
      <div v-if="assignRoleData.goodRole?.length > 0" class="assign-role-container">
        <div class="row">
          <div v-for="role in assignRoleData.goodRole" :key="role" class="role-block" data-role="good" :data-strong="role.strong">
            <el-icon v-if="role.info === true" class="info" color="green"><View/></el-icon>
            <el-icon v-if="role.poison === true" class="poison" color="#C396ED"><HotWater/></el-icon>
            <el-icon v-if="role.f4 === true" class="f4" color="#5295ff"><Hide/></el-icon>
            <el-icon v-if="role.absolute === true" class="absolute" color="#67ff4f"><Flag/></el-icon>
            <span class="role-name">{{role.name}}</span>
          </div>
        </div>
        <div class="row">
          <div class="info-column">
            <span class="info-column-text" style="color: gold">强神：{{assignRoleData.goodRole.filter(data => data.strong).length}}</span>
          </div>
          <div class="info-column">
            <el-icon :size="20" color="#67ff4f"><Flag/></el-icon>
            <span style="color: #67ff4f;margin-right: 10px;">铁好人：{{assignRoleData.goodRole.filter(data => data.absolute === true).length}}</span>
          </div>
          <div class="info-column">
            <el-icon :size="20" color="#5295ff"><Hide/></el-icon>
            <span style="color: #5295ff;">首夜信息位(F4)：{{assignRoleData.goodRole.filter(data => data.f4 === true).length}}</span>
          </div>
          <div class="info-column">
            <el-icon :size="20" color="green"><View/></el-icon>
            <span style="color: green;">信息位：{{assignRoleData.goodRole.filter(data => data.info).length}}</span>
          </div>
          <div class="info-column">
            <el-icon :size="20" color="#C396ED"><HotWater/></el-icon>
            <span style="color: #C396ED;">吃天毒数：{{assignRoleData.goodRole.filter(data => data.poison).length}}</span>
          </div>
        </div>
        <div class="row">
          <div v-for="role in assignRoleData.normalRole" :key="role" class="role-block" data-role="normal">
            <span class="role-name">{{role.name}}</span>
          </div>
        </div>
        <div class="row">
          <div v-for="role in assignRoleData.badRole" :key="role" class="role-block" data-role="bad">
            <span class="role-name">{{role.name}}</span>
          </div>
        </div>
        <div class="row" v-if="badRoleAssignStatus !== 0">
          <span v-if="badRoleAssignStatus % 2 === 1" style="color: red">共情者两侧均有邪恶阵营！</span>
          <span v-if="badRoleAssignStatus >= 10" style="color: red">邪恶阵营连坐！</span>
        </div>
      </div>
      <div>
        <el-button v-if="isPlaying === false && assignRoleData.goodRole?.length > 0" type="success" @click="startPlay">开始游戏</el-button>
        <el-button v-if="isPlaying === true" type="danger" @click="endPlay">结束游戏</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, reactive, ref, watch} from "vue";
import {statusMap, defaultPlayer, random, roleList} from "./model.ts";

const roundTime = ref(0);
const scrollbar = ref(null);
const isPlaying = ref(false); //是否开始了
const dayIndex = ref(0);
const dayType = ref("night");
const poisonCount = ref(0);

const dayInfoList = reactive([]);
const assignRoleData = reactive({goodCount: 0, normalCount: 0, badCount: 0});
const allPlayerInfo = reactive([]);
const newPlayer = reactive({});

const assignRoleCount = computed(() =>
{
  return assignRoleData.goodCount + assignRoleData.normalCount + assignRoleData.badCount + 1;
});

const roleErrorMessage = computed(() =>
{
  const total = assignRoleCount.value;

  //外来者>=3个,爪牙有4个,是不允许的,因为没法出男爵
  if (assignRoleData.normalCount >= 3 && assignRoleData.badCount === 4)
  {
    return "邪恶阵营一定包含男爵时，外来者至多只能2个！";
  }
  else if (total > allPlayerInfo.length)
  {
    return `分配的角色多了 ${total - allPlayerInfo.length} 个!`;
  }
  else if (total < allPlayerInfo.length)
  {
    return `分配的角色少了 ${allPlayerInfo.length - total} 个!`;
  }
  else
  {
    return "";
  }
});

const dayTitleText = (dayIndex, dayType) =>
{
  //晚上
  if (dayType === "night")
  {
    if (dayIndex === 0)
    {
      return "首夜";
    }
    else
    {
      return `第 ${dayIndex} 天 夜晚`;
    }
  }
  //白天
  else
  {
    return `第 ${dayIndex} 天 白天`;
  }
};

const getTimeText = (number, hasHour) =>
{
  if (hasHour === false)
  {
    const minute = Math.floor(number / 60);
    const second = (number % 3600) % 60;

    return `${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`;
  }
  else
  {
    const hour = Math.floor(number / 3600);
    const minute = Math.floor((number % 3600) / 60);
    const second = (number % 3600) % 60;

    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`;
  }
};

const nextStepText = computed(() =>
{
  return dayType.value === "night" ? `第${dayIndex.value + 1}天白天` : `第${dayIndex.value}天夜晚`;
});

const prevStepText = computed(() =>
{
  //晚上
  if (dayType.value === "night")
  {
    return `第${dayIndex.value}天白天`;
  }
  //白天
  else
  {
    if (dayIndex.value === 1)
    {
      return "首夜";
    }
    else
    {
      return `第${dayIndex.value - 1}天夜晚`;
    }
  }
});

const getStatusText = status => statusMap[status] || statusMap.default;

const getRoleName = player =>
{
  if (player.role)
  {
    let roleName = player.role.name;

    if (player.drunkRole)
    {
      roleName += `(${player.drunkRole.name})`;
    }

    return roleName;
  }
  else
  {
    return "未分配"
  }
};

//邪恶阵营分配的情况
const badRoleAssignStatus = computed(() =>
{
  const indexList = []; //座位号
  allPlayerInfo.forEach((player, index) =>
  {
    if (player.role.group === 2)
    {
      indexList.push(index);
    }
  });

  let status = 0;
  //坏人个数>1
  if (indexList.length > 1)
  {
    const gongqingIndex = allPlayerInfo.findIndex(data => data.role.id === "4");

    //判断共情
    if (gongqingIndex >= 0)
    {
      for (let i = 0; i < indexList.length; i++)
      {
        const index = indexList[i];

        if (Math.abs(gongqingIndex - index) === 1)
        {
          const nextIndex = i === indexList.length - 1 ? indexList[0] : indexList[i + 1];

          if (Math.abs(gongqingIndex - nextIndex) === 1)
          {
            console.info("共情", gongqingIndex, index, nextIndex, indexList);

            status += 1;
            break;
          }
        }
      }
    }

    const cookIndex = allPlayerInfo.findIndex(data => data.role.id === "3");

    //判断厨师
    if (cookIndex >= 0)
    {
      for (let i = 0; i < indexList.length; i++)
      {
        const index = indexList[i];
        const nextIndex = i === indexList.length - 1 ? indexList[0] : indexList[i + 1];

        if (Math.abs(nextIndex - index) === 1)
        {
          console.info("连坐了", indexList, index, nextIndex);

          status += 10;
          break;
        }
      }
    }
  }

  return status;
});

const addPlayer = name =>
{
  if (typeof name === "string")
  {
    if (allPlayerInfo.some(data => data.name === name) === false)
    {
      const newPlayer = {name};

      allPlayerInfo.push({...newPlayer});
    }

    clearRole();
  }
  else if (newPlayer.name && allPlayerInfo.some(data => data.name === newPlayer.name) === false)
  {
    allPlayerInfo.push({...newPlayer});
    newPlayer.name = null;

    clearRole();
  }
};

const removePlayer = index =>
{
  allPlayerInfo.splice(index, 1);
};

//清空角色
const clearRole = () =>
{
  delete assignRoleData.goodRole;
  delete assignRoleData.normalRole;
  delete assignRoleData.badRole;

  allPlayerInfo.forEach(player =>
  {
    delete player.role;
    delete player.drunkRole;
    delete player.status;
  });
};

//分配角色
const assignRole = () =>
{
  const goodRole = roleList.filter(data => data.group === 0);
  const normalRole = roleList.filter(data => data.group === 1);
  const badRole = roleList.filter(data =>
  {
    //外来者至少3个,则不能有男爵
    if (normalRole.length >= 3)
    {
      return data.group === 2 && data.devil !== true && data.id !== "20";
    }
    else
    {
      return data.group === 2 && data.devil !== true;
    }
  });

  //先生成邪恶阵营
  assignRoleData.badRole = randomRole(badRole, assignRoleData.badCount);

  const hasBaron = assignRoleData.badRole.some(data => data.id === "20");
  const countOffset = hasBaron === true ? 2 : 0;

  assignRoleData.goodRole = randomRole(goodRole, assignRoleData.goodCount - countOffset);

  assignRoleData.normalRole = randomRole(normalRole, assignRoleData.normalCount + countOffset);


  const allRoleList = assignRoleData.goodRole.concat(assignRoleData.normalRole).concat(assignRoleData.badRole);
  allRoleList.push(roleList.find(data => data.devil === true));

  const count = allRoleList.length;

  for (let i = 0; i < count; i++)
  {
    const player = allPlayerInfo[i];
    const index = random(allRoleList.length);
    player.role = allRoleList[index];

    //若是酒鬼,则分配村民身份
    if (player.role.drunk === true)
    {
      const otherRole = goodRole.length === assignRoleData.goodRole.length ? goodRole : goodRole.filter(role => assignRoleData.goodRole.some(data => data.id === role.id) === false);

      player.drunkRole = randomRole(otherRole, 1)[0];
    }
    else
    {
      delete player.drunkRole;
    }

    allRoleList.splice(index, 1);
  }

  function randomRole(roleList, assignCount)
  {
    const numberMap = [];
    for (let i = 0; i < 1000000; i++)
    {
      const number = random(roleList.length);

      if (numberMap[number] == null)
      {
        numberMap[number] =
        {
          id: roleList[number].id,
          count: 0
        };
      }

      numberMap[number].count++;
    }

    const assignRoleList = numberMap.sort((dataA, dataB) => dataB.count - dataA.count).slice(0, assignCount);

    return assignRoleList.map(data =>
    {
      return roleList.find(roleData => roleData.id === data.id);
    });
  }
}

const startPlay = () =>
{
  allPlayerInfo.forEach(player =>
  {
    player.status = 0;
  });

  isPlaying.value = true;

  dayInfoList.length = 0;

  startTimer();

  nextStep(true);
};

const endPlay = () =>
{
  isPlaying.value = false;

  clearInterval(timer);

  dayInfoList.forEach(data =>
  {
    clearInterval(data.timer);
  });
};

let timer;
const startTimer = () =>
{
  roundTime.value = 0;
  const startNow = Math.floor(Date.now() / 1000);

  clearInterval(timer);

  timer = setInterval(() =>
  {
    roundTime.value = Math.floor(Date.now() / 1000) - startNow;
  });
};

//设置玩家状态(复活或者各种死亡)
const setPlayerStatus = (player, status) =>
{
  const playerNo = (allPlayerInfo.indexOf(player) + 1).toString().padStart(2, "0");

  const {infoList} = dayInfoList[dayInfoList.length - 1];

  infoList.push
  ({
    type: "status",
    playerNo,
    playerName: player.name,
    status: status,
    statusText: statusMap[status],
  });

  player.status = status;

  if (player.status !== 0)
  {
    player.deadDayIndex = dayIndex.value;
    player.deadDayType = dayType.value;
  }
  else
  {
    delete player.deadDayIndex;
    delete player.deadDayType;
  }
};

//进入下一阶段
const nextStep = (firstDay) =>
{
  if (firstDay === true)
  {
    dayIndex.value = 0;
    dayType.value = "night";

    dayInfoList.push
    ({
      dayType: "night",
      dayIndex: 0,
      infoList: [],
      stepIndex: 0,
    });
  }
  else
  {
    const deadPlayer = allPlayerInfo.filter(data => data.deadDayIndex === dayIndex.value && data.deadDayType === dayType.value);

    const lastDay = dayInfoList[dayInfoList.length - 1];

    clearInterval(lastDay.timer);

    lastDay.infoList.push
    ({
      type: "result",
      deadCount: deadPlayer.length
    });

    if (dayType.value === "night")
    {
      dayType.value = "day";
      dayIndex.value++;

      dayInfoList.push
      ({
        dayType: "day",
        dayIndex: dayIndex.value,
        infoList: [],
      });
    }
    else
    {
      dayType.value = "night";

      dayInfoList.push
      ({
        dayType: "night",
        dayIndex: dayIndex.value,
        infoList: [],
        stepIndex: 0,
      });
    }
  }

  const currentDay = dayInfoList[dayInfoList.length - 1];

  if (currentDay.dayType === "night")
  {
    //是否有下毒者(包括管家继承和管家送毒)
    const hasPoisonPlayer = allPlayerInfo.some(data =>
    {
      if (data.status === 0)
      {
        if (data.role.id === "17")
        {
          return true;
        }
        else if (data.role.id === "13" && data.inherit === true)
        {
          const master = allPlayerInfo[data.master];

          return master.role.id === "17";
        }
      }
    });

    if (hasPoisonPlayer === true)
    {
      poisonCount.value++;
    }

    //没有毒,则跳过第一步
    if (poisonCount.value === 0)
    {
      currentDay.stepIndex = 1;
    }
  }
  //切换到白天,毒清零
  else
  {
    poisonCount.value = 0;
  }

  const startNow = Math.floor(Date.now() / 1000);
  currentDay.timer = setInterval(() =>
  {
    currentDay.roundTime = Math.floor(Date.now() / 1000) - startNow;
  });
};

//返回上一阶段
const prevStep = () =>
{
  const newDayType = dayType.value === "day" ? "night" : "day";
  const newDayIndex = newDayType === "day" ? dayIndex.value : dayIndex.value - 1;

  dayInfoList.forEach(data =>
  {
    if (newDayType === "day")
    {
      if (data.dayIndex >= newDayIndex)
      {
        data.cancel = true;
        data.hide = true;
        clearInterval(data.timer);
      }
    }
    else
    {
      if (data.dayIndex > newDayIndex || (data.dayIndex === newDayIndex && data.dayType === newDayType))
      {
        data.cancel = true;
        data.hide = true;
        clearInterval(data.timer);
      }
    }
  });

  dayType.value = newDayType;
  dayIndex.value = newDayIndex;

  dayInfoList.push
  ({
    dayType: newDayType,
    dayIndex: newDayIndex,
    infoList: []
  });

  const currentDay = dayInfoList[dayInfoList.length - 1];

  const startNow = Math.floor(Date.now() / 1000);
  currentDay.timer = setInterval(() =>
  {
    currentDay.roundTime = Math.floor(Date.now() / 1000) - startNow;
  });
};

//夜晚的下一步
const nextStepInNight = dayInfo =>
{

};

watch(dayInfoList, () =>
{
  nextTick(() =>
  {
    scrollbar.value.wrapRef.scrollTop = scrollbar.value.wrapRef.scrollHeight;
  });
});

const roll = () =>
{
  const number = random(99) + 1;
  const text = `说书人进行掷骰子(1-100)：${number}`;
  const {infoList} = dayInfoList[dayInfoList.length - 1];

  infoList.push
  ({
    text: text,
  });
};

const rollPlayer = () =>
{
  const alivePlayerList = allPlayerInfo.filter(data => data.status === 0);
  const count = alivePlayerList.length;

  const rollList = [];
  for (let i = 0; i < 1000000; i++)
  {
    const number = random(count);

    if (rollList[number] == null)
    {
      rollList[number] = 0;
    }

    rollList[number]++;
  }

  let max = 0;
  let maxIndex = 0;

  for (let i = 0; i < rollList.length; i++)
  {
    const number = rollList[i];

    if (number > max)
    {
      max = number;
      maxIndex = i;
    }
  }

  const number = maxIndex;
  const player = alivePlayerList[number];
  const playerNo = allPlayerInfo.findIndex(data => data.name === player.name);
  const text = `说书人进行掷存活玩家号码骰子：${(playerNo + 1).toString().padStart(2, "0")} - ${player.name}`;
  const {infoList} = dayInfoList[dayInfoList.length - 1];

  infoList.push
  ({
    text: text,
  });
};
</script>

<style scoped lang="less">

@good-color: #6ac33e;
@normal-color: #A871E3;
@bad-color: #F5524C;

.container
{
  width:100%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  gap: 20px;
  padding: 20px;
  color: #FFFFFF;
  background-color: black;
  overflow: auto;
}

//操作部分
.operation-container
{
  border: 2px solid gold;
  padding: 20px;
  overflow: auto;
  width: 500px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 10px;

  .scrollbar
  {
    flex: 1;
  }

  .info-container
  {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    gap: 8px;

    .day-info-container
    {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
      gap: 8px;

      &[data-cancel="true"]
      {
        opacity: 0.3;

        *
        {
          text-decoration: line-through;
        }
      }

      &[data-hide="true"]
      {
        .info-row
        {
          display: none;
        }
      }
    }

    //展开收拢被取消的
    .button
    {
      position: absolute;
      top: 10px;
      right: 10px;
    }

    .day-title
    {
      font-size: 30px;
      text-align: center;
      flex: 1;

      &[data-type="day"]
      {
        color: sandybrown;
      }

      &[data-type="night"]
      {
        color: gray;
      }
    }

    .info-row
    {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 10px;

      .info-text
      {
        font-size: 12px;
        color: #ffffff;
        text-align: left;
        word-break: break-all;
      }

      .name
      {
        font-size: 16px;
        width: 80px;
        white-space: nowrap;
      }

      .info-status
      {
        font-size: 16px;
        text-align: left;
        word-break: break-all;
        margin-left: 8px;

        &[data-status="0"]
        {
          color: lawngreen;
        }

        &[data-status="1"]
        {
          color: #9b9cff;
        }

        &[data-status="2"]
        {
          color: darkred;
        }

        &[data-status="3"]
        {
          color: #ffaac4;
        }

        &[data-status="4"]
        {
          color: #fff686;
        }
      }

      .info-result
      {
        flex: 1;
        text-align: center;
        font-size: 18px;
        background-color: rgba(255, 255, 255, 0.12);
        padding: 4px;
      }
    }

    .day-operation-container
    {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 8px;
    }
  }

  .operation-shortcut
  {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
  }
}

//配置部分
.config-container
{
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 10px;

  .player-select
  {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    width: 500px;

    .player-add-button
    {
      margin: 0;
    }
  }

  .role-container
  {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;

    .role-number
    {
      width: 100px;
    }
  }

  .role-total
  {
    .role-error-message
    {
      margin-left: 10px;
      color: red;
    }
  }

  .assign-role-container
  {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    gap: 10px;

    .row
    {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 8px;

      .role-block
      {
        height: 40px;
        padding: 0 25px;
        display: flex;
        position: relative;
        justify-content: center;
        align-items: center;
        border-radius: 8px;
        border-width: 2px;
        border-style: solid;

        &[data-strong="true"]
        {
          .role-name
          {
            color: gold;
            font-weight: bold;
          }
        }

        &[data-role="good"]
        {
          border-color: @good-color;
        }

        &[data-role="normal"]
        {
          border-color: @normal-color;
        }

        &[data-role="bad"]
        {
          border-color: @bad-color;
        }

        .info
        {
          position: absolute;
          top: 0;
          left: 1px;
        }

        .poison
        {
          position: absolute;
          bottom: 1px;
          left: 1px;
        }

        .f4
        {
          position: absolute;
          right: 1px;
          top: 0;
        }

        .absolute
        {
          position: absolute;
          right: 1px;
          bottom: 1px;
        }

        .role-name
        {
          color: white;
          font-size: 14px;
        }
      }

      .info-column
      {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: 2px;
        margin-right: 10px;

        .info-column-text
        {

        }
      }
    }
  }

  .player-add-container
  {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
    width: 200px;
  }

  .player-container
  {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    gap: 4px;

    .player-row
    {
      height: 30px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 20px;
      padding: 0 10px;
      border: 2px solid transparent;

      --row-color: white;
      --status-color: gray;

      &[data-group="2"]
      {
        border-color: darkred;
      }

      //存活
      &[data-status="0"]
      {
        --status-color: lawngreen;
        background-color: rgba(255, 255, 255, 0.12);
      }

      //处决
      &[data-status="1"]
      {
        --status-color: #9b9cff;

        opacity: 0.4;

        .number, .name
        {
          text-decoration: line-through;
        }
      }

      //夺魂
      &[data-status="2"]
      {
        --status-color: darkred;

        opacity: 0.4;

        .number, .name
        {
          text-decoration: line-through;
        }
      }

      //神罚
      &[data-status="3"]
      {
        --status-color: #ffaac4;

        opacity: 0.4;

        .number, .name
        {
          text-decoration: line-through;
        }
      }

      //枪杀
      &[data-status="4"]
      {
        --status-color: #fff686;

        opacity: 0.4;

        .number, .name
        {
          text-decoration: line-through;
        }
      }

      //反弹
      &[data-status="5"]
      {
        --status-color: #5876ff;

        opacity: 0.4;

        .number, .name
        {
          text-decoration: line-through;
        }
      }

      //自尽
      &[data-status="6"]
      {
        --status-color: #ff4ba7;

        opacity: 0.4;

        .number, .name
        {
          text-decoration: line-through;
        }
      }

      &:nth-child(1)
      {
        --row-color: red;
      }

      &:nth-child(2)
      {
        --row-color: cornflowerblue;
      }

      &:nth-child(3)
      {
        --row-color: greenyellow;
      }

      &:nth-child(3)
      {
        --row-color: orange;
      }

      &:nth-child(4)
      {
        --row-color: yellow;
      }

      &:nth-child(5)
      {
        --row-color: pink;
      }

      &:nth-child(6)
      {
        --row-color: #a6ffd7;
      }

      &:nth-child(7)
      {
        --row-color: #db4eff;
      }

      &:nth-child(8)
      {
        --row-color: darkcyan;
      }

      &:nth-child(9)
      {
        --row-color: #ff91aa;
      }

      &:nth-child(10)
      {
        --row-color: #00ffe7;
      }

      &:nth-child(11)
      {
        --row-color: #77ff96;
      }

      &:nth-child(12)
      {
        --row-color: purple;
      }

      .number
      {
        width: 30px;
        color: var(--row-color);
      }

      .name
      {
        width: 100px;
        color: var(--row-color);
      }

      .role
      {
        color: gray;
        width: 150px;

        &[data-role="0"]
        {
          color: @good-color;
        }

        &[data-role="1"]
        {
          color: @normal-color;
        }

        &[data-role="2"]
        {
          color: @bad-color;
        }
      }

      .status
      {
        width: 200px;
        color: var(--status-color);
      }

      .poison
      {
        margin-left: 4px;
        color: #5eff6e;
      }

      .name-input
      {
        margin-right: 20px;
      }
    }
  }
}
</style>
