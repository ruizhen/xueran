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
              <!--设置状态-->
              <template v-if="info.type === `status`">
                <span class="info-text">说书人设置</span>
                <span class="info-text">{{info.playerNo}}</span>
                <span class="name">{{info.playerName}}</span>
                <span class="info-status" :data-status="info.status">{{info.statusText}}</span>
              </template>
              <!--下毒/解毒-->
              <template v-else-if="info.type === `poison`">
                <span class="info-text">说书人设置</span>
                <span class="info-text">{{info.playerNo}}</span>
                <span class="name">{{info.playerName}}</span>
                <span class="info-poison">{{info.poisonText}}</span>
              </template>
              <!--守卫/解除守卫-->
              <template v-else-if="info.type === `guard`">
                <span class="info-text">说书人设置</span>
                <span class="info-text">{{info.playerNo}}</span>
                <span class="name">{{info.playerName}}</span>
                <span class="info-guard">{{info.guardText}}</span>
              </template>
              <!--酒鬼骰子-->
              <template v-else-if="info.type === `drunk`">
                <template v-if="info.player">
                  <span v-if="info.skillType === `normal`" class="info-text">说书人进行 酒鬼({{player.drunkRole.name}}) 普通技能掷骰子(1-100)：</span>
                  <span v-else class="info-text">说书人进行 酒鬼({{player.drunkRole.name}}) 超级技能掷骰子(1-100)：</span>
                </template>
                <template v-else>
                  <span v-if="info.skillType === `normal`" class="info-text">说书人进行酒鬼普通技能掷骰子(1-100)：</span>
                  <span v-else class="info-text">说书人进行酒鬼超级技能掷骰子(1-100)：</span>
                </template>
                <span class="info-text">{{info.roll}}，结果判定为：</span>
                <span class="info-roll" :data-success="info.success">{{info.success === true ? `成功` : `失败`}}</span>
              </template>
              <span v-else-if="info.type === `result`" class="info-result">{{info.deadCount > 0 ? `死亡人数：${info.deadCount}` : `无事发生`}}</span>
              <span v-else class="info-text">{{info.text}}</span>
            </div>
            <div v-if="dayInfo.dayType === `night`" class="step-container">
              <div v-for="(stepData, index) in dayInfo.stepDataList" :key="stepData" class="step-row" :data-active="dayInfo.stepIndex === index">
                <el-icon v-if="dayInfo.stepIndex === index" color="lightgreen"><Right/></el-icon>
                <el-icon v-else-if="dayInfo.stepIndex > index" color="lightgreen"><Check/></el-icon>
                <div class="step-content">
                  <el-popover v-for="step in stepData" :key="step" :width="500" placement="right" :title="step.copyTitle" trigger="hover" :content="step.copyText">
                    <template #reference>
                      <div class="step-content-row" @click="copyStepInfo(step)">
                        <span class="step-type-text">{{step.title}}</span>
                        <span v-if="step.player" class="step-player-text">{{step.player}}</span>
                        <span class="step-text">{{step.text}}</span>
                      </div>
                    </template>
                  </el-popover>
                </div>
                <el-popconfirm v-if="dayInfo.stepIndex === index" title="请确认该步骤的行动已经完成！" @confirm="nextStepInNight(dayInfo)">
                  <template #reference>
                    <el-button size="small" type="primary">下一步</el-button>
                  </template>
                </el-popconfirm>
              </div>
              <!--步骤结束-->
              <div v-if="dayInfo.cancel !== true && dayIndex === dayInfo.dayIndex && dayType === `night` && dayInfo.stepIndex === 2" class="step-row" :data-active="dayInfo.stepIndex === 2">
                <el-popconfirm title="确定要天亮吗？" @confirm="nextStep">
                  <template #reference>
                    <el-button size="small" type="primary">天亮了</el-button>
                  </template>
                </el-popconfirm>
              </div>
            </div>
           <!--入夜选项-->
            <div v-if="dayIndex === dayInfo.dayIndex && dayType === `day`" class="day-operation-container">
              <el-popconfirm title="确定要入夜吗？" @confirm="nextStep">
                <template #reference>
                  <el-button size="small" type="danger">入夜了</el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>
        </div>
      </el-scrollbar>
      <!--快捷语言复制-->
      <div class="operation-shortcut">
        <el-button size="small" type="primary" @click="copyText(`该玩家不配吃毒，请换`)">该玩家不配吃毒，请换</el-button>
        <el-button size="small" type="primary" @click="copyText(`请确认操作`)">请确认操作</el-button>
        <el-button size="small" type="primary" @click="copyText(`执行操作`)">执行操作</el-button>
      </div>
      <!--切换白天夜晚-->
      <div v-if="isPlaying === true" class="operation-shortcut">
        <el-popconfirm v-if="dayIndex > 0" title="确定要返回到上一步吗？" @confirm="prevStep">
          <template #reference>
            <el-button type="primary">返回上一阶段({{prevStepText}})</el-button>
          </template>
        </el-popconfirm>
      </div>
      <!--有市长时的弹刀判定-->
      <div v-if="canRebound" class="operation-shortcut">
        <el-button type="warning" @click="reboundDetermine">进行弹刀判定</el-button>
        <el-button v-if="reboundResult.player" type="warning" @click="reboundConfirm">认可该结果并执行</el-button>
      </div>
      <!--有管家的时候添加/减少毒药-->
      <div v-if="isPlaying === true && allPlayerInfo.some(data => data.role.id === `13`)" class="operation-shortcut">
        <span>管家送毒数：{{housekeeperPoisonCount}}</span>
        <!--白天才能控制管家毒数-->
        <template v-if="dayType === `day`">
          <el-button type="warning" @click="housekeeperPoisonCount++">添加一瓶毒药(管家送毒)</el-button>
          <el-button v-if="housekeeperPoisonCount > 0" type="warning" @click="housekeeperPoisonCount++">减少一瓶毒药</el-button>
        </template>
      </div>
      <div v-if="isPlaying === true" class="operation-shortcut">
        <el-button size="small" @click="roll">掷骰子(1-100)</el-button>
        <el-button size="small" @click="rollPlayer">掷存活玩家号码骰子</el-button>
        <el-button size="small" @click="drunkRoll(`normal`)">掷酒鬼普通技能骰子</el-button>
        <el-button size="small" @click="drunkRoll(`super`)">掷酒鬼超级技能骰子</el-button>
      </div>
    </div>
    <!--玩家信息配置面板-->
    <div class="config-container">
      <div v-show="isPlaying === false" class="player-select">
        <el-button v-for="player in defaultPlayer" :key="player" class="player-add-button" :type="allPlayerInfo.some(data => data.name === player.name) ? `success` : null" size="small" @click="addPlayer(player.name)">添加 {{player.name}}</el-button>
      </div>
      <div v-show="isPlaying === false" class="player-add-container">
        <el-input v-model="newPlayer.name" size="small" placeholder="输入新玩家名字"/>
        <el-button size="small" type="primary" @click="addPlayer">添加新玩家</el-button>
      </div>
      <!--说明-->
      <template v-if="isPlaying === false">
        <p class="info-text">洗衣妇技能获得的两个玩家中的干扰玩家，可能为任何身份(除了自己)</p>
        <p class="info-text">图书管理员同上，且在中毒时,一定洗到狼人,且一定洗为狼人的外来者身份或者酒鬼(洗的狼人没有穿外来者伪装)，只有1个外来者且是酒鬼调查员的情况下，酒鬼技能一定发动失败</p>
        <p class="info-text">调查员在中毒或者酒鬼发动技能失败时，获取到的2个玩家，一定都不为邪恶阵营。技能发动成功时，干扰玩家不为邪恶阵营</p>
        <p class="info-text">管家若继承主人身份时，若为F4(洗衣妇/图书管理员/调查员/厨师)身份，则以首夜的情况重新获取信息</p>
        <p class="info-text">管家中毒不会影响继承，但视作继承后的身份中毒。未继承时中毒，白天可以视作没有主人。管家白天每次没有跟随主人投票或进行投票提名，则当晚邪恶阵营毒+1，且无上限</p>
        <p class="info-text">没有爪牙时，不会有调查员和厨师。原本就没有外来者时，不会有图书管理员。外来者>=3或村民<3，则不会有男爵</p>
      </template>
      <!--洗衣妇/图书管理员配置-->
      <div class="assign-operation-container">
        <template v-if="isPlaying === false">
          <span>洗衣妇/图书管理员中毒后判定洗出伪装信息的概率：</span>
          <el-input-number v-model="washChance" class="number-input" size="small" :step="1" :precision="0" :step-strictly="true" :min="0" :max="100"/>
        </template>
        <span v-else>洗衣妇/图书管理员中毒后判定洗出伪装信息的概率：{{washChance}}%</span>
      </div>
      <!--管家配置-->
      <div class="assign-operation-container">
        <template v-if="isPlaying === false">
          <span>管家能否继承主人身份(当主人死亡后)：</span><el-switch v-model="masterConfig.enabled" size="small"/>
          <template v-if="masterConfig.enabled === false">
            <span> 管家是否每天认主：</span><el-switch v-model="masterConfig.everyday" size="small"/>
          </template>
        </template>
        <span v-else>
          {{masterConfig.enabled === true ? "管家继承主人身份" : "管家不继承主人身份"}}
          {{masterConfig.everyday === true ? "，每天认一次主人" : "，仅首夜认主人"}}
        </span>
      </div>
      <!--酒鬼配置-->
      <div class="assign-operation-container">
        <template v-if="isPlaying === false">
          <span>酒鬼技能成功概率：</span>
          <span>普通技能(除了超级技能外的)：</span>
          <el-input-number v-model="drunkConfig.normal" class="number-input" size="small" :step="1" :precision="0" :step-strictly="true" :min="0" :max="100"/>
          <span>超级技能({{drunkConfig.superRole.map(roleId => roleList.find(role => role.id === roleId).name).join(" | ")}})：</span>
          <el-input-number v-model="drunkConfig.special" class="number-input" size="small" :step="1" :precision="0" :step-strictly="true" :min="0" :max="100"/>
        </template>
        <span v-else>酒鬼正确发动技能的概率：普通技能 {{drunkConfig.normal}}%，超级技能 {{drunkConfig.special}}%</span>
      </div>
      <!--弹刀配置-->
      <div class="assign-operation-container">
        <template v-if="isPlaying === false">
          <span>弹刀概率：</span>
          <span>市长(0则必然不会)：</span>
          <el-input-number v-model="reboundConfig.self" class="number-input" size="small" :step="1" :precision="0" :step-strictly="true" :min="0"/>
          <span>士兵(0则必然会)：</span>
          <el-input-number v-model="reboundConfig.soldier" class="number-input" size="small" :step="1" :precision="0" :step-strictly="true" :min="0"/>
        </template>
        <template v-else>
          <span v-if="reboundConfig.self == null || reboundConfig.self === 0">市长必然不会被弹刀，</span>
          <span v-else>市长被弹刀相对基准概率为：{{reboundConfig.self}}%，</span>
          <span v-if="reboundConfig.soldier == null || reboundConfig.soldier === 0">士兵必然会被弹刀</span>
          <span v-else>士兵被弹刀相对基准概率为：{{reboundConfig.soldier}}%</span>
        </template>
      </div>
      <!--邪恶阵营度外伪装个数-->
      <div class="assign-operation-container">
        <template v-if="isPlaying === false">
          <span>首夜给邪恶阵营分发的额外伪装身份个数(大于邪恶阵营人数的部分)：</span>
          <el-input-number v-model="extraMaskCount" class="number-input" size="small" :step="1" :precision="0" :step-strictly="true" :min="0" :max="16"/>
        </template>
        <span v-else>首夜给邪恶阵营分发的额外伪装身份个数(大于邪恶阵营人数的部分)：{{extraMaskCount}}</span>
      </div>
      <div v-show="isPlaying === false" class="role-container">
        <span>村民个数：</span>
        <el-input-number v-model="assignRoleData.goodCount" class="number-input" size="small"  :step="1" :precision="0" :step-strictly="true" :min="3" :max="13"></el-input-number>
        <span>外来者个数：</span>
        <el-input-number v-model="assignRoleData.normalCount" class="number-input" size="small"  :step="1" :precision="0" :step-strictly="true" :min="0" :max="4"></el-input-number>
        <span>爪牙个数：</span>
        <el-input-number v-model="assignRoleData.badCount" class="number-input" size="small"  :step="1" :precision="0" :step-strictly="true" :min="0" :max="4"></el-input-number>
      </div>
      <p class="role-total">角色总人数：{{assignRoleCount}}，村民：{{assignRoleData.goodCount}}，外来者：{{assignRoleData.normalCount}}，爪牙：{{assignRoleData.badCount}}，小恶魔: 1<span v-if="roleErrorMessage" class="role-error-message">{{roleErrorMessage}}</span></p>
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
            <!--设置伪装-->
            <el-dropdown v-if="player.status === 0 && player.role.group === 2" trigger="click" @command="role => player.maskRole = role">
              <el-button type="warning" size="small">伪装</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="role in maskRoleList" :key="role" :command="role">{{role.name}}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <!--管家认主-->
            <el-dropdown v-if="player.status === 0 && player.role.id === `13`" trigger="click" @command="master => player.master = master">
              <el-button type="primary" size="small">认主</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="player in masterPlayerList" :key="player" :command="player">{{getPlayerInfoText([player], allPlayerInfo)}}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <!--复活-->
            <el-button v-if="player.status !== 0" size="small" @click="setPlayerStatus(player, 0)" type="success">复活</el-button>
            <!--下毒-->
            <el-button v-if="player.status === 0 && player.role.group !== 2" size="small" @click="poisonPlayer(player)" color="#5eff6e">{{player.poison === true ? "解毒" : "下毒"}}</el-button>
            <!--守卫-->
            <el-button v-if="dayIndex > 0 && dayType === `night` && hasAlivePlayerByRole(allPlayerInfo, `7`, true) && player.status === 0" size="small" @click="guardPlayer(player)" color="#389fff">{{player.guard === true ? "不守" : "守护"}}</el-button>
            <!--处决-->
            <el-button v-if="dayIndex > 0 && player.status === 0" size="small" @click="setPlayerStatus(player, 1)" color="#9b9cff">{{statusMap[1]}}</el-button>
            <!--夺魂-->
            <el-button v-if="dayIndex > 0 && player.status === 0 && player.role.group !== 2" size="small" @click="setPlayerStatus(player, 2)" color="darkred">{{statusMap[2]}}</el-button>
            <!--神罚-->
            <el-button v-if="dayIndex > 0 && hasAlivePlayerByRole(allPlayerInfo, `9`, true) && player.status === 0" size="small" @click="setPlayerStatus(player, 3)" color="#ffaac4">{{statusMap[3]}}</el-button>
            <!--枪杀-->
            <el-button v-if="dayIndex > 0 && hasAlivePlayerByRole(allPlayerInfo, `10`, true) && player.status === 0" size="small" @click="setPlayerStatus(player, 4)" color="#fff686">{{statusMap[4]}}</el-button>
            <!--反弹-->
            <el-button v-if="dayIndex > 0 && hasAlivePlayerByRole(allPlayerInfo, `12`, true) && player.status === 0" size="small" @click="setPlayerStatus(player, 5)" color="#5876ff">{{statusMap[5]}}</el-button>
            <!--自尽-->
            <el-button v-if="dayIndex > 0 && player.status === 0 && player.role.group === 2" size="small" @click="setPlayerStatus(player, 6)" color="#ff4ba7">{{statusMap[6]}}</el-button>
          </template>
        </div>
      </div>
      <div v-if="isPlaying === false">
        <el-button v-if="!roleErrorMessage" type="primary" @click="assignRole">分配角色</el-button>
        <el-button v-if="isPlaying === false && assignRoleData.goodRole?.length > 0" type="danger" @click="resetAssignRole">重置分配</el-button>
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
          <span v-if="badRoleAssignStatus >= 10" style="color: red">邪恶阵营连坐数>1！</span>
        </div>
      </div>
      <div class="assign-operation-container">
        <el-popconfirm v-if="isPlaying === false && assignRoleData.goodRole?.length > 0" title="确定要开始游戏吗？" @confirm="startPlay">
          <template #reference>
            <el-button type="success">开始游戏</el-button>
          </template>
        </el-popconfirm>
        <el-popconfirm v-if="isPlaying === true" title="确定要结束游戏吗？" @confirm="endPlay">
          <template #reference>
            <el-button type="danger">结束游戏</el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, reactive, ref, watch} from "vue";
import {
  statusMap,
  defaultPlayer,
  random,
  roleList,
  hasAlivePlayerByRole,
  alivePlayerByRole,
  getPlayerInfoText, sortPlayer
} from "./model.ts";
import {ElMessage} from "element-plus";

const roundTime = ref(0);
const scrollbar = ref(null);
const isPlaying = ref(false); //是否开始了
const dayIndex = ref(0);
const dayType = ref("night");
const extraMaskCount = ref(1); //邪恶阵营首夜分发的额外伪装个数
const housekeeperPoisonCount = ref(0); //管家毒
const washChance = ref(75); //洗衣中毒后得知伪装信息的概率
const masterConfig = reactive({enabled: false, everyday: false});
const drunkConfig = reactive({normal: 25, special: 0, superRole: ["9", "10", "12"]}); //酒鬼正确概率,超级技能有圣女枪手市长
const reboundConfig = reactive({self: 50, soldier: 200}); //弹刀配置
const reboundResult = reactive({}); //弹刀结果

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

    //管家主人
    if (player.master)
    {
      //管家继承,则显示继承身份
      if (player.inherit === true)
      {
        roleName += `(${player.master.role.name})`;

        //主人的酒鬼身份
        if (player.master.role.drunk === true)
        {
          roleName += `(${player.drunkRole.name})`;
        }
      }
      //还未继承,则显示主人号码名字
      else
      {
        roleName += `(${getPlayerInfoText([player.master], allPlayerInfo)})`;
      }
    }
    //酒鬼身份
    else if (player.drunkRole)
    {
      roleName += `(${player.drunkRole.name})`;
    }
    //伪装
    else if (player.maskRole)
    {
      roleName += `(${player.maskRole.name})`;
    }

    return roleName;
  }
  else
  {
    return "未分配";
  }
};

//能否进行反弹,判定依据是,游戏中,且在夜晚,且场上有存活的市长/酒鬼市长/管家继承,且未中毒
const canRebound = computed(() =>
{
  if (isPlaying.value === true && dayIndex.value > 0 && dayType.value === "night")
  {
    const player = alivePlayerByRole(allPlayerInfo, "12", true)[0];

    //有市长,则判定是否有毒
    if (player)
    {
      return player.poison !== true;
    }
    else
    {
      return false;
    }
  }
  else
  {
    return false;
  }
})

//邪恶阵营分配的提示情况(1为共情两侧,10为连坐)
const badRoleAssignStatus = computed(() =>
{
  const indexList = []; //座位号
  //间谍不计算连坐
  allPlayerInfo.forEach((player, index) =>
  {
    if (player.role.group === 2 && player.role.id !== "18")
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
            status += 1;
            break;
          }
        }
      }
    }

    const cookIndex = allPlayerInfo.findIndex(data => data.role.id === "3");

    //判断厨师,只提示连坐>1的
    if (cookIndex >= 0)
    {
      const isBadList = allPlayerInfo.map(player =>
      {
        //邪恶阵营非间谍
        if (player.role.group === 2 && player.role.id !== "18")
        {
          return true;
        }
        //隐士
        else if (player.role.id === "15")
        {
          return true;
        }
        else
        {
          return false;
        }
      });

      let repeatCount = 0;
      let current = 0;
      for (let i = 0; i < isBadList.length; i++)
      {
        const isBad = isBadList[i];

        //邪恶阵营,计数+1
        if (isBad === true)
        {
          current++;
        }
        else
        {
          current = 0;
        }

        //连续2个邪恶阵营,则连坐+1
        if (current >= 2)
        {
          repeatCount++;
        }

        //最后一个,则再判断一次第一个
        if (i === isBadList.length - 1)
        {
          if (isBadList[0] === true)
          {
            current++;

            if (current >= 2)
            {
              repeatCount++;
            }
          }
        }
      }

      if (repeatCount > 1)
      {
        status += 10;
      }
    }
  }

  return status;
});

//邪恶阵营的伪装列表
const maskRoleList = computed(() =>
{
  //所有非邪恶阵营未上场的角色,同时排除酒鬼
  const allOtherRole = roleList.filter(role =>
  {
    if (role.group !== 2 && role.drunk !== true)
    {
      return allPlayerInfo.some(player => player.role.id === role.id) === false;
    }
  });

  //伪装个数
  const maskCount = extraMaskCount.value + assignRoleData.badCount + 1;

  const numberMap = [];
  for (let i = 0; i < 1000000; i++)
  {
    const number = random(allOtherRole.length);

    if (numberMap[number] == null)
    {
      numberMap[number] =
          {
            id: allOtherRole[number].id,
            count: 0
          };
    }

    numberMap[number].count++;
  }

  const maskRoleList = numberMap.sort((dataA, dataB) => dataB.count - dataA.count).slice(0, maskCount);

  return maskRoleList.map(data =>
  {
    return allOtherRole.find(role => role.id === data.id);
  });
});

//管家认主的玩家列表
const masterPlayerList = computed(() =>
{
  return allPlayerInfo.filter(player =>
  {
    //不能是管家
    if (player.role.id === "13")
    {
      return false;
    }
    //存活
    else if (player.status === 0)
    {
      return true;
    }
    //若死亡,只能是当晚死亡
    else if (player.deadDayIndex === dayIndex.value && player.deadDayType === dayType.value)
    {
      return true;
    }
  });
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

    //添加玩家后,重置分配角色
    resetAssignRole();
  }
  else if (newPlayer.name && allPlayerInfo.some(data => data.name === newPlayer.name) === false)
  {
    allPlayerInfo.push({...newPlayer});
    newPlayer.name = null;

    //添加玩家后,重置分配角色
    resetAssignRole();
  }
};

const removePlayer = index =>
{
  allPlayerInfo.splice(index, 1);
};

//重置分配
const resetAssignRole = () =>
{
  delete assignRoleData.goodRole;
  delete assignRoleData.normalRole;
  delete assignRoleData.badRole;

  allPlayerInfo.forEach(player =>
  {
    // delete player.skillDone;
    delete player.master;
    delete player.inherit;
    delete player.guard;
    delete player.poison;
    delete player.deadDayIndex;
    delete player.deadDayType;
    delete player.role;
    delete player.maskRole;
    delete player.drunkRole;
    delete player.inheritDevil;
    delete player.status;
  });
};

//分配角色
const assignRole = () =>
{
  //分配角色首先清空
  resetAssignRole();

  const goodRole = roleList.filter(role =>
  {
     if (role.group === 0)
     {
       //没有爪牙的情况下
       if (assignRoleData.badCount === 0)
       {
         //不能有调查员
         if (role.id === "2")
         {
           return false;
         }
         //不能有厨师
         else if (role.id === "3")
         {
           return false;
         }
         //同时没有外来者的情况下,不能有图书管理员
         else if (assignRoleData.normalCount === 0 && role.id === "1")
         {
           return false;
         }
         else
         {
           return true;
         }
       }
       else
       {
         return true;
       }
     }
     else
     {
       return false;
     }
  });

  const normalRole = roleList.filter(role => role.group === 1);

  const badRole = roleList.filter(role =>
  {
    if (role.group === 2 && role.devil !== true)
    {
      //外来者>=3个,或好人玩家不足3个,则不能有男爵
      if (role.id === "20" && (assignRoleData.normalCount >= 3 || assignRoleData.goodlCount < 3))
      {
        return false;
      }
      else
      {
        return true;
      }
    }
    else
    {
      return false;
    }
  });

  //先生成邪恶阵营
  assignRoleData.badRole = randomRole(badRole, assignRoleData.badCount);

  const hasBaron = assignRoleData.badRole.some(role => role.id === "20");
  const countOffset = hasBaron === true ? 2 : 0; //若是男爵则村民-2 外来者+2

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

    //若是酒鬼,则分配村民身份,若村民全齐备,则出重复角色
    if (player.role.drunk === true)
    {
      const otherRole = goodRole.length === assignRoleData.goodRole.length ? goodRole : goodRole.filter(role => assignRoleData.goodRole.some(data => data.id === role.id) === false);

      player.drunkRole = randomRole(otherRole, 1)[0];
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
      return roleList.find(role => role.id === data.id);
    });
  }
}

const startPlay = () =>
{
  //开始游戏时,重置玩家状态
  allPlayerInfo.forEach(player =>
  {
    player.status = 0;

    // delete player.skillDone;
    delete player.master;
    delete player.inherit;
    delete player.guard;
    delete player.poison;
    delete player.deadDayIndex;
    delete player.deadDayType;
    delete player.maskRole;
    delete player.inheritDevil;

    //如果不是酒鬼,则删除酒鬼身份(删除掉上一把的管家继承的酒鬼身份)
    if (player.role.id.drunk !== true)
    {
      delete player.drunkRole;
    }
  });

  //清空弹刀结果
  delete reboundResult.player;

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

  appendInfo
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
    });
  }
  else
  {
    const deadPlayer = allPlayerInfo.filter(data => data.deadDayIndex === dayIndex.value && data.deadDayType === dayType.value);
    const lastDay = dayInfoList[dayInfoList.length - 1];

    clearInterval(lastDay.timer);

    //添加结论统计
    appendInfo
    ({
      type: "result",
      deadCount: deadPlayer.length
    });

    //现在是夜晚,进入白天
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
    //现在是白天,进入夜晚
    else
    {
      dayType.value = "night";

      dayInfoList.push
      ({
        dayType: "night",
        dayIndex: dayIndex.value,
        infoList: [],
      });
    }
  }

  scrollToBottom();

  const currentDay = dayInfoList[dayInfoList.length - 1];

  //进入夜晚后,开始行动
  if (currentDay.dayType === "night")
  {
    //进入夜晚所有玩家解毒
    allPlayerInfo.forEach(player =>
    {
      delete player.poison;
    });

    nextStepInNight(currentDay);
  }
  //切换到白天,清空反弹结果,管家毒清零
  else
  {
    delete reboundResult.player;

    housekeeperPoisonCount.value = 0;
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
  const newDayIndex = dayType.value === "day" ? dayIndex.value - 1 : dayIndex.value;

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
    dayType: dayType.value,
    dayIndex: dayIndex.value,
    infoList: [],
  });

  scrollToBottom();

  const currentDay = dayInfoList[dayInfoList.length - 1];

  //进入夜晚后,开始行动
  if (currentDay.dayType === "night")
  {
    nextStepInNight(currentDay);
  }
  //切换到白天,清空反弹结果,管家毒清零
  else
  {
    delete reboundResult.player;

    housekeeperPoisonCount.value = 0;
  }

  const startNow = Math.floor(Date.now() / 1000);
  currentDay.timer = setInterval(() =>
  {
    currentDay.roundTime = Math.floor(Date.now() / 1000) - startNow;
  });
};

//夜晚的下一步
const nextStepInNight = dayInfo =>
{
  if (dayInfo.stepIndex == null)
  {
    dayInfo.stepIndex = -1;
  }

  //跳转到第二步,进行第一步的验证
  if (dayInfo.stepIndex === 0)
  {
    //首夜,进行伪装和天毒检查,必须设置所有伪装和执行天毒
    if (dayInfo.dayIndex === 0)
    {
      const allHaveMask = allPlayerInfo.every(player =>
      {
        if (player.role.group === 2)
        {
          return player.maskRole != null;
        }
        else
        {
          return true;
        }
      });

      if (allHaveMask === false)
      {
        ElMessage.error("请给所有邪恶阵营的玩家设置好伪装，才能进行下一步！");

        return;
      }

      const hasPoison = allPlayerInfo.some(player => player.poison === true);

      if (hasPoison === false)
      {
        ElMessage.error("请执行天毒操作，才能进行下一步！");

        return;
      }
    }
  }
  //跳转到第三步,进行第二步的验证
  else if (dayInfo.stepIndex === 1)
  {
    //首夜,进行管家认主
    if (dayInfo.dayIndex === 0)
    {
      const keeperPlayer = allPlayerInfo.find(player => player.role.id === "13");

      if (keeperPlayer && keeperPlayer.master == null)
      {
        ElMessage.error("请让管家选择主人，才能进行下一步！");

        return;
      }
    }
    else
    {
      //不继承,每天认主
      if (masterConfig.enabled === false && masterConfig.everyday === true)
      {
        const keeperPlayer = allPlayerInfo.find(player => player.role.id === "13" && player.status === 0);

        if (keeperPlayer)
        {
          const master = keeperPlayer.master;

          if (master == null)
          {
            ElMessage.error("请让管家选择主人，才能进行下一步！");

            return;
          }
          //死了,但不是当夜死的,就需要重新选择主人
          else if (master.status !== 0 && master.deadDayType === "night" && master.deadDayIndex === dayIndex.value)
          {
            ElMessage.error("请让管家选择主人，才能进行下一步！");

            return;
          }
        }
      }
    }
  }

  dayInfo.stepIndex++;

  //构建步骤
  createNightStepData(dayInfo);
};

//生成晚上步骤数据
const createNightStepData = dayInfo =>
{
  const {dayIndex, stepIndex} = dayInfo;
  const stepData = [];

  //存活的玩家,判定为,未死亡,或者非当晚死的
  const alivePlayer = allPlayerInfo.filter(data => data.deadDayIndex == null || (data.deadDayIndex === dayIndex && data.deadDayType === "night"));

  //毒守刀
  if (stepIndex === 0)
  {
    //首夜,相认
    if (dayIndex === 0)
    {
      doKnow(); //相认
    }

    //非首夜,首先执行继承,因为有可能白天死了管家的主人,继承第一优先级
    if (dayIndex > 0)
    {
      doInherit();
    }

    doPoison(); //毒

    //首夜间谍
    if (dayIndex === 0)
    {
      doSpy();
    }

    //非首夜
    if (dayIndex > 0)
    {
      doGuard(); //僧侣

      doKill(); //刀
    }

    dayInfo.stepDataList = [stepData];
  }
  //继承和其他验证
  else if (stepIndex === 1)
  {
    const {stepDataList} = dayInfo;

    //首夜
    if (dayIndex === 0)
    {
      doF4(); //处理F4信息

      //管家认主
      doMaster();
    }
    else
    {
      let inherit;

      //继承
      if (masterConfig.enabled === true)
      {
        inherit = doInherit();
      }
      //管家每天认主
      else if (masterConfig.everyday === true)
      {
        doMaster();
      }

      //管家今夜继承了
      if (inherit === true)
      {

      }
      else if (masterConfig.enabled === true)
      {
        const keeperPlayer = alivePlayerByRole(allPlayerInfo, "13")[0];

        //有管家且是今天白天继承的,且继承的是F4(包括酒鬼),则这个时候才能发动技能
        if (keeperPlayer && keeperPlayer.inherit === true && keeperPlayer.master.deadDayType === "day" && keeperPlayer.master.deadDayIndex === dayIndex && (["0", "1", "2", "3"].includes(keeperPlayer.master.role.id) === true || ["0", "1", "2", "3"].includes(keeperPlayer.drunkRole.id) === true))
        {
          doKeeperF4(keeperPlayer);
        }
      }
    }

    stepDataList.push(stepData);
  }

  //相认
  function doKnow()
  {
    const player = allPlayerInfo.filter(player => player.role.group === 2);
    const playerText = getPlayerInfoText(player, allPlayerInfo, true);

    //伪装个数
    const maskCount = extraMaskCount.value + assignRoleData.badCount + 1;
    const maskRoleName = maskRoleList.value.map(data => data.name).join(" | ");

    //邪恶阵营相认
    stepData.push
    ({
      type: "认",
      player: "邪恶阵营",
      copyTitle: "请粘贴进邪恶阵营频道",
      copyText: `请互相认识：${playerText}，并选择伪装：${maskRoleName}`,
      title: "认",
      text: `请建立邪恶阵营频道并互相认识，并分发伪装：${maskCount} 个`
    });
  }

  //毒
  function doPoison()
  {
    let poisonCount;

    //首夜
    if (dayIndex === 0)
    {
      //固定为1毒
      poisonCount = 1;
    }
    //非首夜
    else
    {
      poisonCount = housekeeperPoisonCount.value; //继承管家毒

      //是否有下毒者
      const hasPoisonPlayer = hasAlivePlayerByRole(allPlayerInfo, "17");

      //有下毒者,毒+1
      if (hasPoisonPlayer === true)
      {
        poisonCount++;
      }
    }

    dayInfo.poisonCount = poisonCount; //记录当夜的毒

    //有毒
    if (poisonCount > 0)
    {
      //存活玩家里的好人
      const aliveGoodPlayer = alivePlayer.filter(player => player.role.group !== 2);
      const aliveGoodPlayerText = getPlayerInfoText(aliveGoodPlayer, allPlayerInfo);

      stepData.push
      ({
        type: "毒",
        player: "邪恶阵营",
        copyTitle: "请粘贴进邪恶阵营频道",
        copyText: `请选择下毒对象，今晚毒药数量：${poisonCount}，存活好人玩家有：${aliveGoodPlayerText}`,
        title: "毒",
        text: `请邪恶阵营选择下毒对象，并在右侧面板执行，今晚毒药数量：${poisonCount}`
      });
    }
  }

  //间谍
  function doSpy()
  {
    //有间谍
    if (hasAlivePlayerByRole(allPlayerInfo, "18") === true)
    {
      const playerText = getPlayerInfoText(allPlayerInfo, allPlayerInfo, true);

      stepData.push
      ({
        type: "谍",
        player: "邪恶阵营",
        copyTitle: "请粘贴进邪恶阵营频道",
        copyText: playerText,
        title: "谍",
        text: "请给邪恶阵营发送所有玩家身份"
      });
    }
  }

  //僧侣
  function doGuard()
  {
    const guardPlayer = alivePlayerByRole(allPlayerInfo, "7", true)[0];
    //有僧侣
    if (guardPlayer)
    {
      const guardPlayerText = getPlayerInfoText([guardPlayer], allPlayerInfo);
      const targetPlayer = alivePlayer.filter(player => player.name !== guardPlayer.name); //不能守护自己
      const targetPlayerText = getPlayerInfoText(targetPlayer, allPlayerInfo);

      stepData.push
      ({
        type: "守",
        copyTitle: `请复制给：${guardPlayerText}`,
        copyText: `请选择要守护的玩家：${targetPlayerText}`,
        title: "守",
        player: guardPlayerText,
        text: "请僧侣选择要守护的对象并在右侧面板执行"
      });
    }
  }

  //刀
  function doKill()
  {
    //存活玩家里的好人
    const aliveGoodPlayer = alivePlayer.filter(player => player.role.group !== 2);
    const aliveGoodPlayerText = getPlayerInfoText(aliveGoodPlayer, allPlayerInfo);

    stepData.push
    ({
      type: "刀",
      player: "邪恶阵营",
      copyTitle: "请粘贴进邪恶阵营频道",
      copyText: `请选择夺魂对象，存活好人玩家有：${aliveGoodPlayerText}`,
      title: "刀",
      text: "请邪恶阵营选择夺魂对象并在右侧面板执行"
    });
  }

  //F4
  function doF4()
  {
    const map = {};

    const rollPlayerList = []; //洗衣妇,图书管理员,调查员随机到的玩家,他们之间不能重叠

    const washPlayer = alivePlayerByRole(allPlayerInfo, "0", true)[0];
    const libraryPlayer = alivePlayerByRole(allPlayerInfo, "1", true)[0];
    const investigatePlayer = alivePlayerByRole(allPlayerInfo, "2", true)[0];

    //有洗衣妇,判定中毒/洗伪装/酒鬼
    if (washPlayer)
    {
      map.wash = {};

      //中毒
      if (washPlayer.poison === true)
      {
        const roll = random(100) + 1;
        const bingo = roll > 100 - washChance.value;

        map.wash.poison = true;
        map.wash.roll = roll;

        //洗伪装
        if (bingo === true)
        {
          map.wash.washMask = true;
        }
      }
      //酒鬼
      else if (washPlayer.role.drunk === true)
      {
        const result = drunkRoll("normal", washPlayer);

        if (result === false)
        {
          map.wash.drunk = true;
        }
      }
    }

    //有图书管理员,判定中毒/洗伪装/酒鬼
    if (libraryPlayer)
    {
      map.library = {};

      //酒鬼
      if (libraryPlayer.poison !== true && libraryPlayer.role.drunk === true)
      {
        //若外来者只有自己这个酒鬼,则酒鬼技能一定失败
        if (assignRoleData.normalRole.length === 1)
        {
          map.library.drunk = true;
        }
        //否则掷酒鬼骰子
        else
        {
          const result = drunkRoll("normal", libraryPlayer);

          if (result === false)
          {
            map.library.drunk = true;
          }
        }
      }
    }

    //有调查员,判定中毒/酒鬼
    if (investigatePlayer)
    {
      map.investigate = {};

      //中毒
      if (investigatePlayer.poison === true)
      {
        map.investigate.poison = true;
      }
      //酒鬼
      else if (investigatePlayer.role.drunk === true)
      {
        const result = drunkRoll("normal", investigatePlayer);

        if (result === false)
        {
          map.investigate.drunk = true;
        }
      }
    }

    let badCount = assignRoleData.badCount; //可用来随机的爪牙个数,若被调查员优先用光,则无法洗伪装

    //有洗衣妇,且洗衣妇正常发动技能,则洗衣妇最优先使用村民名额
    if (washPlayer && map.wash.poison !== true && map.wash.drunk !== true)
    {
      const targetPlayerList = allPlayerInfo.filter(player => player.role.group === 0 && player !== washPlayer);
      const targetPlayerIndex = random(targetPlayerList.length);
      const targetPlayer = targetPlayerList[targetPlayerIndex];

      map.wash.targetPlayer = targetPlayer;
      map.wash.targetPlayerRoleName = targetPlayer.role.name;

      rollPlayerList.push(targetPlayer);
    }

    //有图书管理员,且图书管理员正常发动技能,则图书管理员最优先使用外来者名额,这里同时排除了只有一个外来者且是酒鬼调查员的情况
    if (libraryPlayer && map.library.poison !== true && map.library.drunk !== true)
    {
      const targetPlayerList = allPlayerInfo.filter(player => player.role.group === 1 && player !== libraryPlayer);
      const targetPlayerIndex = random(targetPlayerList.length);
      const targetPlayer = targetPlayerList[targetPlayerIndex];

      map.library.targetPlayer = targetPlayer;
      map.library.targetPlayerRoleName = targetPlayer.role.name;

      rollPlayerList.push(targetPlayer);
    }

    //有调查员,且调查员正常发动技能,则调查员最优先使用爪牙名额
    if (investigatePlayer && map.investigate.poison !== true && map.investigate.drunk !== true)
    {
      const targetPlayerList = allPlayerInfo.filter(player => player.role.group === 2 && player.role.devil !== true);
      const targetPlayerIndex = random(targetPlayerList.length);
      const targetPlayer = targetPlayerList[targetPlayerIndex];

      map.investigate.targetPlayer = targetPlayer;
      map.investigate.targetPlayerRoleName = targetPlayer.role.name;

      rollPlayerList.push(targetPlayer);

      badCount--;
    }

    //洗衣妇判定是否有可以洗的伪装对象
    if (washPlayer)
    {
      map.wash.canWash = allPlayerInfo.some(player => rollPlayerList.includes(player) === false && player.role.group === 2 && player.maskRole.group === 0);
    }

    //图书管理员判定是否有可以洗的伪装对象
    if (libraryPlayer)
    {
      map.library.canWash = allPlayerInfo.some(player => rollPlayerList.includes(player) === false && player.role.group === 2 && player.maskRole.group === 1);
    }

    //洗衣妇发动错误技能,中毒/酒鬼
    if (washPlayer)
    {
      //中毒
      if (map.wash.poison === true)
      {
        const {canWash, roll, washMask} = map.wash;

        //可洗的情况下,才roll
        if (canWash === true)
        {
          appendInfo
          ({
            text: `说书人掷洗衣妇洗到伪装的骰子：${roll}，判定${washMask === true ? "成功" : "失败"}`
          });
        }

        const targetPlayerList = allPlayerInfo.filter(player =>
        {
          //洗伪装
          if (canWash === true && washMask === true)
          {
            return rollPlayerList.includes(player) === false && player.role.group === 2 && player.maskRole.group === 0;
          }
          else
          {
            return rollPlayerList.includes(player) === false && player !== washPlayer && player.role.group === 0;
          }
        });

        const targetPlayerIndex = random(targetPlayerList.length);
        const targetPlayer = targetPlayerList[targetPlayerIndex];

        map.wash.targetPlayer = targetPlayer;

        //洗伪装
        if (canWash === true && washMask === true)
        {
          map.wash.targetPlayerRoleName = targetPlayer.maskRole.name;
        }

        rollPlayerList.push(targetPlayer);
      }
      //酒鬼,则洗其他所有村民
      else if (map.wash.drunk === true)
      {
        const targetPlayerList = allPlayerInfo.filter(player => rollPlayerList.includes(player) === false && player !== washPlayer && player.role.group === 0);
        const targetPlayerIndex = random(targetPlayerList.length);
        const targetPlayer = targetPlayerList[targetPlayerIndex];

        map.wash.targetPlayer = targetPlayer;

        rollPlayerList.push(targetPlayer);
      }
    }

    //图书管理员发动错误技能,中毒/酒鬼
    if (libraryPlayer)
    {
      //中毒
      if (map.library.poison === true)
      {
        const {canWash} = map.library;

        //能洗伪装,则一定洗伪装
        if (canWash === true)
        {
          const targetPlayerList = allPlayerInfo.filter(player => rollPlayerList.includes(player) === false && player.role.group === 2 && player.maskRole.group === 1);
          const targetPlayerIndex = random(targetPlayerList.length);
          const targetPlayer = targetPlayerList[targetPlayerIndex];

          map.library.targetPlayer = targetPlayer;
          map.library.targetPlayerRoleName = targetPlayer.maskRole.name;

          rollPlayerList.push(targetPlayer);
        }
        //不能洗伪装,则洗狼人的村民身份为酒鬼
        else
        {
          const targetPlayerList = allPlayerInfo.filter(player => rollPlayerList.includes(player) === false && player.role.group === 2);
          const targetPlayerIndex = random(targetPlayerList.length);
          const targetPlayer = targetPlayerList[targetPlayerIndex];

          map.library.targetPlayer = targetPlayer;
          map.library.targetPlayerRoleName = roleList.find(role => role.drunk === true).name;

          rollPlayerList.push(targetPlayer);
        }
      }
      //酒鬼,随机洗村民和狼人中村民伪装的,洗为酒鬼
      else if (map.library.drunk === true)
      {
        const targetPlayerList = allPlayerInfo.filter(player => rollPlayerList.includes(player) === false && player !== libraryPlayer && (player.role.group === 0 || player.role.group === 2 && player.maskRole.group === 0));
        const targetPlayerIndex = random(targetPlayerList.length);
        const targetPlayer = targetPlayerList[targetPlayerIndex];

        map.library.targetPlayer = targetPlayer;
        map.library.targetPlayerRoleName = roleList.find(role => role.drunk === true).name;

        rollPlayerList.push(targetPlayer);
      }
    }

    //调查员发动错误技能,中毒/酒鬼
    if (investigatePlayer)
    {
      //中毒或者酒鬼,是一样的,均是洗除了邪恶阵营外的所有人
      if (map.investigate.poison === true || map.investigate.drunk === true)
      {
        const targetPlayerList = allPlayerInfo.filter(player => rollPlayerList.includes(player) === false && player !== investigatePlayer && player.role.group !== 2);
        const targetPlayerIndex = random(targetPlayerList.length);
        const targetPlayer = targetPlayerList[targetPlayerIndex];

        map.investigate.targetPlayer = targetPlayer;

        //随机爪牙身份
        const fakeRoleList = roleList.filter(role => role.group === 2 && role.devil !== true);
        const fakeRoleIndex = random(fakeRoleList.length);
        const fakeRole = fakeRoleList[fakeRoleIndex];

        map.investigate.targetPlayerRoleName = fakeRole.name;

        rollPlayerList.push(targetPlayer);
      }
    }

    //调查员获取另外个号码,调查员最优先,因为调查员另外个号码一定不为邪恶阵营
    if (investigatePlayer)
    {
      const otherPlayerList = allPlayerInfo.filter(player => rollPlayerList.includes(player) === false && player !== investigatePlayer && player.role.group !== 2);
      const otherPlayerIndex = random(otherPlayerList.length);
      const otherPlayer = otherPlayerList[otherPlayerIndex];

      map.investigate.otherPlayer = otherPlayer;

      const skillPlayer = sortPlayer([map.investigate.targetPlayer, map.investigate.otherPlayer], allPlayerInfo);
      const playerText = getPlayerInfoText([investigatePlayer], allPlayerInfo);
      const skillPlayerText = getPlayerInfoText(skillPlayer, allPlayerInfo);

      stepData.push
      ({
        type: "调",
        copyTitle: `请复制给：${playerText}`,
        copyText: `今晚你得知的信息为：${skillPlayerText} 中有 ${map.investigate.targetPlayerRoleName}`,
        title: "调",
        player: playerText,
        text: "请发送给调查员获取的信息"
      });

      rollPlayerList.push(otherPlayer);
    }

    //洗衣妇获取另外个号码
    if (washPlayer)
    {
      const otherPlayerList = allPlayerInfo.filter(player => rollPlayerList.includes(player) === false && player !== washPlayer);
      const otherPlayerIndex = random(otherPlayerList.length);
      const otherPlayer = otherPlayerList[otherPlayerIndex];

      map.wash.otherPlayer = otherPlayer;

      //还没有身份,则是中毒非伪装或者酒鬼,随机获取村民身份
      if (map.wash.targetPlayerRoleName == null)
      {
        //村民且不是洗衣妇且不是洗的2个人中的身份
        const fakeRoleList = roleList.filter(role => role.group === 0 && role.id !== washPlayer.role.id && role.id !== otherPlayer.role.id && role.id !== map.wash.targetPlayer.role.id);
        const fakeRoleIndex = random(fakeRoleList.length);
        const fakeRole = fakeRoleList[fakeRoleIndex];

        map.wash.targetPlayerRoleName = fakeRole.name;
      }

      const skillPlayer = sortPlayer([map.wash.targetPlayer, map.wash.otherPlayer], allPlayerInfo);
      const playerText = getPlayerInfoText([washPlayer], allPlayerInfo);
      const skillPlayerText = getPlayerInfoText(skillPlayer, allPlayerInfo);

      stepData.push
      ({
        type: "洗",
        copyTitle: `请复制给：${playerText}`,
        copyText: `今晚你得知的信息为：${skillPlayerText} 中有 ${map.wash.targetPlayerRoleName}`,
        title: "洗",
        player: playerText,
        text: "请发送给洗衣妇获取的信息"
      });

      rollPlayerList.push(otherPlayer);
    }

    //图书管理员获取另外个号码
    if (libraryPlayer)
    {
      //没有外来者
      if (map.library.targetPlayer == null)
      {
        const playerText = getPlayerInfoText([libraryPlayer], allPlayerInfo);

        stepData.push
        ({
          type: "图",
          copyTitle: `请复制给：${playerText}`,
          copyText: "今晚你得知的信息为：没有外来者",
          title: "图",
          player: playerText,
          text: "请发送给图书管理员获取的信息"
        });
      }
      else
      {
        const otherPlayerList = allPlayerInfo.filter(player => rollPlayerList.includes(player) === false && player !== libraryPlayer);
        const otherPlayerIndex = random(otherPlayerList.length);
        const otherPlayer = otherPlayerList[otherPlayerIndex];

        map.library.otherPlayer = otherPlayer;

        //还没有身份,则是中毒非伪装或者酒鬼,随机获取外来者身份
        if (map.library.targetPlayerRoleName == null)
        {
          //外来者且不是且不是洗的2个人中的身份
          const fakeRoleList = roleList.filter(role => role.group === 1 && role.id !== otherPlayer.role.id && role.id !== map.library.targetPlayer.role.id);
          const fakeRoleIndex = random(fakeRoleList.length);
          const fakeRole = fakeRoleList[fakeRoleIndex];

          map.library.targetPlayerRoleName = fakeRole.name;
        }

        const skillPlayer = sortPlayer([map.library.targetPlayer, map.library.otherPlayer], allPlayerInfo);
        const playerText = getPlayerInfoText([libraryPlayer], allPlayerInfo);
        const skillPlayerText = getPlayerInfoText(skillPlayer, allPlayerInfo);

        stepData.push
        ({
          type: "图",
          copyTitle: `请复制给：${playerText}`,
          copyText: `今晚你得知的信息为：${skillPlayerText} 中有 ${map.library.targetPlayerRoleName}`,
          title: "图",
          player: playerText,
          text: "请发送给图书管理员获取的信息"
        });

        rollPlayerList.push(otherPlayer);
      }
    }

    const cookPlayer = alivePlayerByRole(allPlayerInfo, "3", true)[0];

    //有厨师
    if (cookPlayer)
    {
      const playerText = getPlayerInfoText([cookPlayer], allPlayerInfo);

      const isBadList = allPlayerInfo.map(player =>
      {
        //邪恶阵营非间谍
        if (player.role.group === 2 && player.role.id !== "18")
        {
          return true;
        }
        //未中毒的隐士
        else if (player.role.id === "15" && player.poison !== true)
        {
          return true;
        }
        else
        {
          return false;
        }
      });

      let repeatCount = 0;
      let current = 0;
      for (let i = 0; i < isBadList.length; i++)
      {
        const isBad = isBadList[i];

        //邪恶阵营,计数+1
        if (isBad === true)
        {
          current++;
        }
        else
        {
          current = 0;
        }

        //连续2个邪恶阵营,则连坐+1
        if (current >= 2)
        {
          repeatCount++;
        }

        //最后一个,则再判断一次第一个
        if (i === isBadList.length - 1)
        {
          if (isBadList[0] === true)
          {
            current++;

            if (current >= 2)
            {
              repeatCount++;
            }
          }
        }
      }

      //中毒,获取的连坐数只要不等于实际连坐数即可
      if (cookPlayer.poison === true)
      {
        const count = random(repeatCount);

        stepData.push
        ({
          type: "厨",
          copyTitle: `请复制给：${playerText}`,
          copyText: `今晚你得知的信息为：邪恶阵营连坐数为 ${count}对`,
          title: "厨",
          player: playerText,
          text: "请发送给厨师获取的信息"
        });
      }
      //酒鬼
      else if (cookPlayer.role.drunk === true)
      {
        const result = drunkRoll("normal", cookPlayer);

        //酒鬼发动失败
        if (result === false)
        {
          const count = random(repeatCount);

          stepData.push
          ({
            type: "厨",
            copyTitle: `请复制给：${playerText}`,
            copyText: `今晚你得知的信息为：邪恶阵营连坐数为 ${count}对`,
            title: "厨",
            player: playerText,
            text: "请发送给厨师获取的信息"
          });
        }
        //正常发动
        else
        {
          stepData.push
          ({
            type: "厨",
            copyTitle: `请复制给：${playerText}`,
            copyText: `今晚你得知的信息为：邪恶阵营连坐数为 ${repeatCount}对`,
            title: "厨",
            player: playerText,
            text: "请发送给厨师获取的信息"
          });
        }
      }
      //正常发动
      else
      {
        stepData.push
        ({
          type: "厨",
          copyTitle: `请复制给：${playerText}`,
          copyText: `今晚你得知的信息为：邪恶阵营连坐数为 ${repeatCount}对`,
          title: "厨",
          player: playerText,
          text: "请发送给厨师获取的信息"
        });
      }
    }
  }

  //管家认主
  function doMaster()
  {
    const stepPlayer = alivePlayerByRole(allPlayerInfo, "13", true)[0];

    if (stepPlayer)
    {
      const stepPlayerText = getPlayerInfoText([stepPlayer], allPlayerInfo);

      //存活玩家,或者非今晚死的
      const targetPlayer = alivePlayer.filter(player => player !== stepPlayer);
      const targetPlayerText = getPlayerInfoText(targetPlayer, allPlayerInfo);

      stepData.push
      ({
        type: "管",
        copyTitle: `请复制给：${stepPlayerText}`,
        copyText: `请选择你的主人：${targetPlayerText}`,
        title: "管",
        player: stepPlayerText,
        text: "请管家选择主人"
      });
    }
  }

  //管家继承
  function doInherit()
  {
    const stepPlayer = alivePlayerByRole(allPlayerInfo, "13", true)[0];

    //有管家且开启了继承
    if (stepPlayer && masterConfig.enabled === true)
    {
      const {master, inherit} = stepPlayer;

      //还未继承且主人死了,则执行继承
      if (inherit !== true && master.status !== 0)
      {
        stepPlayer.inherit = true;

        //酒鬼,则继承酒鬼身份
        if (master.role.drunk === true)
        {
          stepPlayer.drunkRole = master.drunkRole;
        }

        const stepPlayerText = getPlayerInfoText([stepPlayer], allPlayerInfo);
        const masterRoleName = master.role.drunk === true ? stepPlayer.drunkRole.name : master.role.name;

        stepData.push
        ({
          type: "继",
          copyTitle: `请复制给：${stepPlayerText}`,
          copyText: `你的主人已经死亡，你继承了主人的身份：${masterRoleName}`,
          title: "继",
          player: stepPlayerText,
          text: "请发送给管家继承信息"
        });

        return true;
      }
    }
  }

  //管家的F4技能
  function doKeeperF4(keeperPlayer)
  {
    const keeperPlayerText = getPlayerInfoText([keeperPlayer], allPlayerInfo);
    const {master} = keeperPlayer;
    const isDrunk = master.role.drunk === true; //是否是酒鬼
    const roleId = isDrunk === true ? keeperPlayer.drunkRole.id : master.role.id;

    //洗衣妇
    if (roleId === "0")
    {
      let washMask;
      let drunkSkill;

      let targetPlayer;
      let targetPlayerRoleName;

      //中毒
      if (keeperPlayer.poison === true)
      {
        const canWash = allPlayerInfo.some(player => player.role.group === 2 && player.maskRole.group === 0);

        if (canWash === true)
        {
          const roll = random(100) + 1;

          washMask = roll > 100 - washChance.value;

          appendInfo
          ({
            text: `说书人掷洗衣妇洗到伪装的骰子：${roll}，判定${washMask === true ? "成功" : "失败"}`
          });
        }

        const targetPlayerList = allPlayerInfo.filter(player =>
        {
          //洗伪装
          if (washMask === true)
          {
            return player.role.group === 2 && player.maskRole.group === 0;
          }
          //不洗伪装
          else
          {
            return player !== master && player !== keeperPlayer && player.role.group === 0;
          }
        });

        const targetPlayerIndex = random(targetPlayerList.length);

        targetPlayer = targetPlayerList[targetPlayerIndex];
      }
      //酒鬼
      else if (isDrunk === true)
      {
        drunkSkill = drunkRoll("normal", keeperPlayer) === false;

        const targetPlayerList = allPlayerInfo.filter(player => player !== master && player.role.group === 0);
        const targetPlayerIndex = random(targetPlayerList.length);

        targetPlayer = targetPlayerList[targetPlayerIndex];
      }
      //正常发动
      else
      {
        const targetPlayerList = allPlayerInfo.filter(player => player !== master && player.role.group === 0);
        const targetPlayerIndex = random(targetPlayerList.length);

        targetPlayer = targetPlayerList[targetPlayerIndex];
      }

      //另外个干扰玩家,排除主人,自己,洗的对象
      const otherPlayerList = allPlayerInfo.filter(player => player !== master && player !== targetPlayer && player !== keeperPlayer);
      const otherPlayerIndex = random(otherPlayerList.length);
      const otherPlayer = otherPlayerList[otherPlayerIndex];

      //洗伪装
      if (washMask === true)
      {
        targetPlayerRoleName = targetPlayer.maskRole.name;
      }
      //中毒或者酒鬼发动失败,则随机洗村民身份
      else if (keeperPlayer.poison === true || drunkSkill === true)
      {
        //村民且不是洗衣妇且不是洗的2个人中的身份
        const fakeRoleList = roleList.filter(role => role.group === 0 && role.id !== roleId && role.id !== otherPlayer.role.id && role.id !== targetPlayer.role.id);
        const fakeRoleIndex = random(fakeRoleList.length);
        const fakeRole = fakeRoleList[fakeRoleIndex];

        targetPlayerRoleName = fakeRole.name;
      }
      //正常洗
      else
      {
        targetPlayerRoleName = targetPlayer.role.name;
      }

      const skillPlayer = sortPlayer([targetPlayer, otherPlayer], allPlayerInfo);
      const playerText = getPlayerInfoText([keeperPlayer], allPlayerInfo);
      const skillPlayerText = getPlayerInfoText(skillPlayer, allPlayerInfo);

      stepData.push
      ({
        type: "洗",
        copyTitle: `请复制给：${playerText}`,
        copyText: `今晚你得知的信息为：${skillPlayerText} 中有 ${targetPlayerRoleName}`,
        title: "洗",
        player: playerText,
        text: "请发送给洗衣妇获取的信息"
      });
    }
    //图书管理员
    else if (roleId === "1")
    {
      let drunkSkill;

      let targetPlayer;
      let targetPlayerRoleName;

      //中毒
      if (keeperPlayer.poison === true)
      {
        const canWash = allPlayerInfo.some(player => player.role.group === 2 && player.maskRole.group === 1);

        if (canWash === true)
        {
          const targetPlayerList = allPlayerInfo.filter(player => player.role.group === 2 && player.maskRole.group === 1);
          const targetPlayerIndex = random(targetPlayerList.length);

          targetPlayer = targetPlayerList[targetPlayerIndex];
          targetPlayerRoleName = targetPlayer.maskRole.name;
        }
        //不能洗伪装,则洗狼人的村民身份为酒鬼
        else
        {
          const targetPlayerList = allPlayerInfo.filter(player => player.role.group === 2);
          const targetPlayerIndex = random(targetPlayerList.length);

          targetPlayer = targetPlayerList[targetPlayerIndex];
          targetPlayerRoleName = roleList.find(role => role.drunk === true).name;
        }
      }
      //酒鬼
      else if (isDrunk === true)
      {
        //如果外来者只有主人这一个酒鬼,则一定发动失败
        if (assignRoleData.normalCount === 1)
        {
          drunkSkill = true;
        }
        else
        {
          drunkSkill = drunkRoll("normal", washPlayer) === false;
        }

        //酒鬼,随机洗村民和狼人中村民伪装的,洗为酒鬼
        if (drunkSkill === true)
        {
          const targetPlayerList = allPlayerInfo.filter(player => player !== keeperPlayer && player !== master && (player.role.group === 0 || player.role.group === 2 && player.maskRole.group === 0));
          const targetPlayerIndex = random(targetPlayerList.length);

          targetPlayer = targetPlayerList[targetPlayerIndex];
          targetPlayerRoleName = roleList.find(role => role.drunk === true).name;
        }
        //正常发动,正常发动时,能洗到主人的酒鬼身份
        else
        {
          const targetPlayerList = allPlayerInfo.filter(player => player.role.group === 1 && player !== keeperPlayer);

          if (targetPlayerList.length > 0)
          {
            const targetPlayerIndex = random(targetPlayerList.length);

            targetPlayer = targetPlayerList[targetPlayerIndex];
            targetPlayerRoleName = targetPlayer.role.name;
          }
        }
      }
      //正常发动,能洗到主人的酒鬼身份
      else
      {
        const targetPlayerList = allPlayerInfo.filter(player => player.role.group === 1 && player !== keeperPlayer);

        if (targetPlayerList.length > 0)
        {
          const targetPlayerIndex = random(targetPlayerList.length);

          targetPlayer = targetPlayerList[targetPlayerIndex];
          targetPlayerRoleName = targetPlayer.role.name;
        }
      }

      //没有外来者
      if (targetPlayer == null)
      {
        stepData.push
        ({
          type: "图",
          copyTitle: `请复制给：${keeperPlayerText}`,
          copyText: "今晚你得知的信息为：外来者只有你一人",
          title: "图",
          player: keeperPlayerText,
          text: "请发送给图书管理员获取的信息"
        });
      }
      else
      {
        //另外个干扰玩家,排除主人,自己,洗的对象
        const otherPlayerList = allPlayerInfo.filter(player => player !== master && player !== targetPlayer && player !== keeperPlayer);
        const otherPlayerIndex = random(otherPlayerList.length);
        const otherPlayer = otherPlayerList[otherPlayerIndex];

        const skillPlayer = sortPlayer([targetPlayer, otherPlayer], allPlayerInfo);
        const skillPlayerText = getPlayerInfoText(skillPlayer, allPlayerInfo);

        stepData.push
        ({
          type: "图",
          copyTitle: `请复制给：${keeperPlayerText}`,
          copyText: `今晚你得知的信息为：${skillPlayerText} 中有 ${targetPlayerRoleName}`,
          title: "图",
          player: keeperPlayerText,
          text: "请发送给图书管理员获取的信息"
        });
      }
    }
  }
};

//反弹判定
const reboundDetermine = () =>
{
  const majorPlayer = alivePlayerByRole(allPlayerInfo, "12", true)[0]; //市长,包括酒鬼市长

  //酒鬼市长,则进行一次酒鬼判定
  if (majorPlayer.role.drunk === true)
  {
    const result = drunkRoll(drunkConfig.superRole.includes("12") === true ? "super" : "normal", majorPlayer);

    //酒鬼市长技能不发动,则不进行反弹判定
    if (result === false)
    {
      return;
    }
  }

  const {self, soldier} = reboundConfig;
  const alivePlayer = allPlayerInfo.filter(player => player.status === 0); //存活玩家
  const soldierPlayer = alivePlayerByRole(allPlayerInfo, "11", true)[0]; //士兵,包括酒鬼士兵

  const eachRollCount = Math.floor(100 / alivePlayer.length);
  const rollList = new Array(alivePlayer.length).fill(eachRollCount);
  //有士兵,包括酒鬼士兵,没中毒,才对士兵进行挡刀判定
  if (soldierPlayer && soldierPlayer.poison !== true)
  {
    //是否能发动技能,判定依据是,如果是酒鬼士兵,则掷骰子决定是否发动,否则一定发动
    const activeSkill = soldierPlayer.role.drunk === true ? drunkRoll("normal", soldierPlayer) : true;

    //能发动技能,才继续做挡刀判定
    if (activeSkill === true)
    {
      //必然挡刀
      if (soldier === 0 || soldier == null)
      {
        reboundResult.player = soldierPlayer;

        return;
      }
      //概率挡刀
      else
      {
        const index = alivePlayer.indexOf(soldierPlayer);

        rollList[index] = Math.floor(eachRollCount * (soldier / 100));
      }
    }
  }

  const majorIndex = alivePlayer.indexOf(majorPlayer);
  rollList[majorIndex] = Math.floor(eachRollCount * (self / 100)); //市长弹刀概率

  const max = Math.round(rollList.reduce((total, current) => total + current, 0));
  const roll = random(max) + 1;
  let count = 0;
  let targetIndex;

  for (let i = 0; i < rollList.length; i++)
  {
    const start = count;
    count += rollList[i];
    const end = count;

    if (start !== end && start <= roll && roll <= end)
    {
      targetIndex = i;
      break;
    }
  }

  reboundResult.player = alivePlayer[targetIndex];

  const playerText = getPlayerInfoText([reboundResult.player], allPlayerInfo);

  appendInfo
  ({
    text: `弹刀判定结果为：${playerText}`,
  });
};

//确认执行弹刀结果
const reboundConfirm = () =>
{
  const {player} = reboundResult;

  //没有被守卫,则执行反弹死亡
  if (player.guard !== true)
  {
    setPlayerStatus(player, 5);
  }
  else
  {
    const playerText = getPlayerInfoText([player], allPlayerInfo);

    appendInfo
    ({
      text: `由于僧侣守卫了 ${playerText}，因此该玩家没有被反弹死亡`
    });
  }
};

//酒鬼掷骰子
const drunkRoll = (type, player) =>
{
  const {normal, special} = drunkConfig;
  const result = random(100) + 1;

  if (type === "normal")
  {
    const success = result > 100 - normal;

    appendInfo
    ({
      type: "drunk",
      roll: result,
      skillType: type,
      player,
      success,
    });

    return success;
  }
  else
  {
    const success = result > 100 - special;

    appendInfo
    ({
      type: "drunk",
      roll: result,
      skillType: type,
      player,
      success,
    });

    return success;
  }
};

//下毒/解毒玩家
const poisonPlayer = player =>
{
  const playerNo = (allPlayerInfo.indexOf(player) + 1).toString().padStart(2, "0");

  player.poison = !player.poison;

  appendInfo
  ({
    type: "poison",
    playerNo,
    playerName: player.name,
    poison: player.poison,
    poisonText: player.poison === true ? "中毒" : "解毒",
  });
};

//守卫/不守玩家
const guardPlayer = player =>
{
  const playerNo = (allPlayerInfo.indexOf(player) + 1).toString().padStart(2, "0");

  player.guard = !player.guard;

  appendInfo
  ({
    type: "guard",
    playerNo,
    playerName: player.name,
    guard: player.guard,
    poisonText: player.guard === true ? "被守卫" : "取消守卫",
  });
};

const roll = () =>
{
  const number = random(100) + 1;
  const text = `说书人进行掷骰子(1-100)：${number}`;

  appendInfo
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

  appendInfo
  ({
    text: text,
  });
};

//添加信息
const appendInfo = info =>
{
  const {infoList} = dayInfoList[dayInfoList.length - 1];

  infoList.push(info);

  scrollToBottom();
};

const scrollToBottom = () =>
{
  nextTick(() =>
  {
    scrollbar.value.wrapRef.scrollTop = scrollbar.value.wrapRef.scrollHeight;
  });
}

//复制行动步骤的信息
const copyStepInfo = stepData =>
{
  const {copyText} = stepData;

  navigator.clipboard.writeText(copyText);

  ElMessage.success(`${copyText} 已经复制进粘贴板`);
};

const copyText = text =>
{
  navigator.clipboard.writeText(text);

  ElMessage.success(`${text} 已经复制进粘贴板`);
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
  width: 650px;
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

      &:not(:last-child)
      {
        padding-bottom: 20px;
        border-bottom: 4px dashed rgba(255, 255, 255, 0.3);
      }

      &[data-cancel="true"]
      {
        opacity: 0.3;

        span
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

      .info-poison
      {
        font-size: 16px;
        text-align: left;
        word-break: break-all;
        margin-left: 8px;
        color: #5eff6e;
      }

      .info-guard
      {
        font-size: 16px;
        text-align: left;
        word-break: break-all;
        margin-left: 8px;
        color: #389fff;
      }

      .info-roll
      {
        font-size: 16px;
        text-align: left;
        word-break: break-all;
        margin-left: 8px;

        &[data-success="true"]
        {
          color: lightgreen;
        }

        &[data-success="false"]
        {
          color: red;
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
      justify-content: center;
      align-items: center;
      gap: 8px;
    }
  }

  .step-container
  {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    gap: 8px;

    .step-row
    {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      padding: 4px;
      overflow: hidden;
      border: 2px solid transparent;
      min-height: 40px;

      &[data-active="true"]
      {
        border-color: lightgreen;
        border-radius: 8px;
        background-color: rgba(255, 255, 255, 0.12);
      }

      .step-content
      {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: stretch;
        gap: 4px;

        .step-content-row
        {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          cursor: pointer;

          &:hover
          {
            background-color: rgba(255, 255, 255, 0.12);
          }
        }
      }

      .step-type-text
      {
        font-size: 12px;
      }

      .step-player-text
      {
        font-size: 12px;
      }

      .step-text
      {
        flex: 1;
        word-break: break-all;
        font-size: 12px;
      }

      .step-result
      {
        font-size: 20px;
        flex: 1;
        text-align: center;
        color: lightblue;
      }
    }
  }

  .operation-shortcut
  {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;

    .el-button
    {
      margin: 0;
    }
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
  flex: 1;

  .player-select
  {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    width: 600px;

    .player-add-button
    {
      margin: 0;
    }
  }

  .info-text
  {
    font-size: 12px;
    color: yellow;
  }

  .role-container
  {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
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

      .el-button
      {
        margin: 0;
      }
    }
  }

  .assign-operation-container
  {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
  }

  .number-input
  {
    width: 90px;
  }
}
</style>
