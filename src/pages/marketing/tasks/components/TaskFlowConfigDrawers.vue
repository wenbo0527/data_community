<template>
  <div class="task-flow-config-drawers">
    <!-- 开始节点配置抽屉 -->
    <StartNodeConfigDrawer
      v-if="drawerStates?.start?.visible"
      :visible="drawerStates.start.visible"
      :node-data="drawerStates.start.data || {}"
      @confirm="handleConfigConfirm('start', $event)"
      @cancel="handleConfigCancel('start')"
      @update:visible="(visible) => handleVisibilityChange('start', visible)"
    />

    <!-- 人群分流节点配置抽屉 -->
    <CrowdSplitNodeConfigDrawer
      v-if="drawerStates?.['crowd-split']?.visible"
      :visible="drawerStates['crowd-split'].visible"
      :node-data="drawerStates['crowd-split'].data || {}"
      @confirm="handleConfigConfirm('crowd-split', $event)"
      @cancel="handleConfigCancel('crowd-split')"
      @update:visible="(visible) => handleVisibilityChange('crowd-split', visible)"
    />

    <!-- 事件分流节点配置抽屉 -->
    <EventSplitNodeConfigDrawer
      v-if="drawerStates?.['event-split']?.visible"
      :visible="drawerStates['event-split'].visible"
      :node-data="drawerStates['event-split'].data || {}"
      @confirm="handleConfigConfirm('event-split', $event)"
      @cancel="handleConfigCancel('event-split')"
      @update:visible="(visible) => handleVisibilityChange('event-split', visible)"
    />

    <!-- A/B测试节点配置抽屉 -->
    <ABTestNodeConfigDrawer
      v-if="drawerStates?.['ab-test']?.visible"
      :visible="drawerStates['ab-test'].visible"
      :node-data="drawerStates['ab-test'].data || {}"
      @confirm="handleConfigConfirm('ab-test', $event)"
      @cancel="handleConfigCancel('ab-test')"
      @update:visible="(visible) => handleVisibilityChange('ab-test', visible)"
    />

    <!-- AI外呼节点配置抽屉 -->
    <AICallNodeConfigDrawer
      v-if="drawerStates?.['ai-call']?.visible"
      :visible="drawerStates['ai-call'].visible"
      :node-data="drawerStates['ai-call'].data || {}"
      @confirm="handleConfigConfirm('ai-call', $event)"
      @cancel="handleConfigCancel('ai-call')"
      @update:visible="(visible) => handleVisibilityChange('ai-call', visible)"
    />

    <!-- 短信节点配置抽屉 -->
    <SMSNodeConfigDrawer
      v-if="drawerStates?.sms?.visible"
      :visible="drawerStates.sms.visible"
      :node-data="drawerStates.sms.data || {}"
      @confirm="handleConfigConfirm('sms', $event)"
      @cancel="handleConfigCancel('sms')"
      @update:visible="(visible) => handleVisibilityChange('sms', visible)"
    />

    <!-- 人工外呼节点配置抽屉 -->
    <ManualCallNodeConfigDrawer
      v-if="drawerStates?.['manual-call']?.visible"
      :visible="drawerStates['manual-call'].visible"
      :node-data="drawerStates['manual-call'].data || {}"
      @confirm="handleConfigConfirm('manual-call', $event)"
      @cancel="handleConfigCancel('manual-call')"
      @update:visible="(visible) => handleVisibilityChange('manual-call', visible)"
    />

    <!-- 等待节点配置抽屉 -->
    <WaitNodeConfigDrawer
      v-if="drawerStates?.wait?.visible"
      :visible="drawerStates.wait.visible"
      :node-data="drawerStates.wait.data || {}"
      @confirm="handleConfigConfirm('wait', $event)"
      @cancel="handleConfigCancel('wait')"
      @update:visible="(visible) => handleVisibilityChange('wait', visible)"
    />
  </div>
</template>

<script setup>
// 导入所有配置抽屉组件
import StartNodeConfigDrawer from './StartNodeConfigDrawer.vue'
import CrowdSplitNodeConfigDrawer from './CrowdSplitNodeConfigDrawer.vue'
import EventSplitNodeConfigDrawer from './EventSplitNodeConfigDrawer.vue'
import ABTestNodeConfigDrawer from './ABTestNodeConfigDrawer.vue'
import AICallNodeConfigDrawer from './AICallNodeConfigDrawer.vue'
import SMSNodeConfigDrawer from './SMSNodeConfigDrawer.vue'
import ManualCallNodeConfigDrawer from './ManualCallNodeConfigDrawer.vue'
import WaitNodeConfigDrawer from './WaitNodeConfigDrawer.vue'

// 定义 props
const props = defineProps({
  drawerStates: {
    type: Object,
    required: true
  }
})

// 定义事件
const emit = defineEmits([
  'config-confirm',
  'config-cancel',
  'visibility-change'
])

// 处理配置确认
const handleConfigConfirm = (drawerType, config) => {
  console.log('[TaskFlowConfigDrawers] 处理配置确认:', drawerType, config)
  emit('config-confirm', { drawerType, config })
}

// 处理配置取消
const handleConfigCancel = (drawerType) => {
  console.log('[TaskFlowConfigDrawers] 处理配置取消:', drawerType)
  emit('config-cancel', { drawerType })
}

// 处理抽屉可见性变化
const handleVisibilityChange = (drawerType, visible) => {
  console.log('[TaskFlowConfigDrawers] 抽屉可见性变化:', drawerType, visible)
  emit('visibility-change', { drawerType, visible })
}
</script>

<style scoped>
.task-flow-config-drawers {
  /* 这个组件主要用于组织抽屉组件，不需要特殊样式 */
}
</style>