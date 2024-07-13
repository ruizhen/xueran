<template>
  <div class="container">
    <div class="operation-container">
    </div>
    <div class="playground">
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
      <div class="player-container">
        <div v-for="(player, index) in allPlayerInfo" :key="index" class="player-row" :data-status="player.status">
          <span class="number">{{(index + 1).toString().padStart(2, "0")}}</span>
          <span class="name">{{player.name}}</span>
          <span class="role" :data-role="player.role?.group">{{getRoleName(player)}}</span>
          <span class="status">{{getStatusText(player.status)}}</span>
          <el-button v-if="isPlaying === false" size="small" type="danger" @click="removePlayer(index)">移除</el-button>
          <template v-if="isPlaying === true">
            <el-button v-if="player.status !== 0" size="small" @click="player.status = 0;" type="success">复活</el-button>
            <el-button v-if="player.status === 0" size="small" @click="player.status = 1;" color="#9b9cff">{{statusMap[1]}}</el-button>
            <el-button v-if="player.status === 0" size="small" @click="player.status = 2;" color="darkred">{{statusMap[2]}}</el-button>
            <el-button v-if="allPlayerInfo.some(data => data.role.id === `9`) && player.status === 0" size="small" @click="player.status = 3;" color="#ffaac4">{{statusMap[3]}}</el-button>
            <el-button v-if="allPlayerInfo.some(data => data.role.id === `10`) && player.status === 0" size="small" @click="player.status = 4;" color="#fff686">{{statusMap[4]}}</el-button>
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
        <el-button v-if="isPlaying === true" type="danger" @click="isPlaying = false;">结束游戏</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, reactive, ref} from "vue";
import {statusMap, defaultPlayer, random, roleList} from "./model.ts";

const isPlaying = ref(false); //是否开始了

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

.playground
{
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 10px;
}

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

    --row-color: white;
    --status-color: gray;

    &[data-status="0"]
    {
      --status-color: lawngreen;
      background-color: rgba(255, 255, 255, 0.12);
    }

    &[data-status="1"]
    {
      --status-color: #9b9cff;

      opacity: 0.4;

      .number, .name
      {
        text-decoration: line-through;
      }
    }

    &[data-status="2"]
    {
      --status-color: darkred;

      opacity: 0.4;

      .number, .name
      {
        text-decoration: line-through;
      }
    }

    &[data-status="3"]
    {
      --status-color: #ffaac4;

      opacity: 0.4;

      .number, .name
      {
        text-decoration: line-through;
      }
    }

    &[data-status="4"]
    {
      --status-color: #fff686;

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
      --row-color: lavenderblush;
    }

    &:nth-child(11)
    {
      --row-color: #ebffbc;
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
      width: 100px;
      color: var(--status-color);
    }

    .name-input
    {
      margin-right: 20px;
    }
  }
}
</style>
