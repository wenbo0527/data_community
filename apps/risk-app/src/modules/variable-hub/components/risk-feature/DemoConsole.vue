<template>
  <a-trigger
    trigger="click"
    position="br"
    :popup-translate="[-340, -160]"
  >
    <template #content>
      <div class="demo-console-card">
        <div class="demo-console-header">
          <icon-experiment />
          <span>演示控制台</span>
          <a-tag size="small" color="arcoblue">demo only</a-tag>
        </div>
        <a-divider :margin="6" />
        <div class="demo-section-title">失败注入（关闭对应开关 → 联动失败）</div>
        <a-row :gutter="[8, 8]">
          <a-col :span="12">
            <div class="demo-row">
              <span>OA 系统</span>
              <a-switch v-model="flags.oaDown" size="small" />
            </div>
          </a-col>
          <a-col :span="12">
            <div class="demo-row">
              <span>内数 API</span>
              <a-switch v-model="flags.internalDown" size="small" />
            </div>
          </a-col>
          <a-col :span="12">
            <div class="demo-row">
              <span>特征中心</span>
              <a-switch v-model="flags.variableDown" size="small" />
            </div>
          </a-col>
          <a-col :span="12">
            <div class="demo-row">
              <span>数仓任务</span>
              <a-switch v-model="flags.dwDown" size="small" />
            </div>
          </a-col>
        </a-row>
        <a-divider :margin="6" />
        <div class="demo-section-title">快捷操作（当前特征）</div>
        <a-space wrap size="mini">
          <a-button size="mini" @click="emitQuick('simulate_dw_success')">
            <template #icon><icon-check-circle /></template>
            模拟数仓成功
          </a-button>
          <a-button size="mini" status="warning" @click="emitQuick('simulate_dw_failed')">
            <template #icon><icon-close-circle /></template>
            模拟数仓失败
          </a-button>
          <a-button size="mini" status="danger" @click="emitQuick('simulate_offline_failed')">
            <template #icon><icon-close /></template>
            注入下线失败
          </a-button>
        </a-space>
        <a-divider :margin="6" />
        <div class="demo-section-title">角色切换（D.2 权限矩阵）</div>
        <a-space wrap>
          <a-tag :color="currentRole === 'risk_data_member' ? 'arcoblue' : 'gray'" size="small">风险数据成员（小李）</a-tag>
          <a-tag :color="currentRole === 'risk_data_admin' ? 'purple' : 'gray'" size="small">风险数据管理员</a-tag>
          <a-tag :color="currentRole === 'community_admin' ? 'gold' : 'gray'" size="small">数字社区管理员</a-tag>
        </a-space>
        <a-radio-group v-model="currentRole" type="button" size="mini" style="margin-top: 8px; width: 100%">
          <a-radio value="risk_data_member">成员</a-radio>
          <a-radio value="risk_data_admin">管理员</a-radio>
          <a-radio value="community_admin">社区</a-radio>
        </a-radio-group>

        <a-divider :margin="6" />
        <div class="demo-section-title">重置</div>
        <a-button size="mini" type="outline" status="danger" long @click="onResetFeature">
          <template #icon><icon-refresh /></template>
          把当前特征重置到「待注册」
        </a-button>
        <a-alert type="warning" :show-icon="false" style="margin-top:8px">
          所有数据均为 in-memory mock，刷新页面后回到初始状态。
        </a-alert>
      </div>
    </template>
    <a-button class="demo-console-fab" type="primary" shape="circle" size="large">
      <template #icon><icon-experiment /></template>
    </a-button>
  </a-trigger>
</template>

<script setup>
import { reactive, ref, watch, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import MidloanStateEngine from '@/modules/variable-hub/mock/risk-feature/stateEngine'
import { DemoFlags } from '@/modules/variable-hub/mock/risk-feature/demoFlags'
import UserContext from '@/modules/variable-hub/mock/risk-feature/permissions'

const emit = defineEmits(['reset-feature', 'quick'])

const flags = reactive(Object.assign({}, DemoFlags.get()))

// 角色切换（D.2）
const currentRole = ref(UserContext.get().role)
watch(currentRole, (v) => {
  UserContext.switchRole(v)
  const labels = { risk_data_member: '风险数据成员', risk_data_admin: '风险数据管理员', community_admin: '数字社区管理员' }
  Message.success(`已切换到：${labels[v] || v}`)
  // 通知详情页刷新
  window.dispatchEvent(new CustomEvent('user-context-changed'))
})

watch(flags, (v) => DemoFlags.set(v), { deep: true })

function onResetFeature() {
  Message.success('已通知详情页重置当前特征')
  emit('reset-feature')
}

function emitQuick(action) {
  // 通过 CustomEvent 跨组件通讯
  emit('quick', action)
}

onMounted(() => {
  // 监听快捷操作
  window.addEventListener('demo-console-quick', (e) => {
    const fid = window.__midloanCurrentFeatureId
    if (!fid) {
      Message.warning('请先进入特征详情页再使用快捷操作')
      return
    }
    const detail = e.detail
    if (detail.action === 'simulate_dw_success') MidloanStateEngine.dwCallback(fid, true)
    if (detail.action === 'simulate_dw_failed') MidloanStateEngine.dwCallback(fid, false)
    if (detail.action === 'simulate_offline_failed') {
      const v = window.__midloanVariableList && window.__midloanVariableList.find(x => x.id === fid)
      if (v) {
        v.midloanStatus = 'offline_failed'
        v.syncFailedReason = '特征中心批次同步超时'
        v.syncFailedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
      }
    }
  })
})
</script>

<style scoped>
.demo-console-fab {
  position: fixed;
  right: 32px;
  bottom: 32px;
  box-shadow: 0 6px 16px rgba(22, 93, 255, 0.35);
  z-index: 999;
}
.demo-console-card {
  width: 360px;
  padding: 14px 16px;
  background: var(--color-bg-popup, #fff);
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
.demo-console-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 14px;
}
.demo-section-title {
  font-size: 12px;
  color: var(--color-text-2, #4e5969);
  margin-bottom: 8px;
}
.demo-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: var(--color-fill-2, #f7f8fa);
  border-radius: 4px;
  font-size: 12px;
}
</style>