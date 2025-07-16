<template>
  <div class="task-flow-config-drawers">
    <!-- 开始节点配置抽屉 -->
    <StartNodeConfigDrawer
      v-if="drawerStates?.start"
      v-model:visible="drawerStates.start.visible"
      :node-data="drawerStates.start.data || {}"
      @confirm="handleConfigConfirm('start', $event)"
      @cancel="handleConfigCancel('start')"
    />

    <!-- 人群分流节点配置抽屉 -->
    <CrowdSplitNodeConfigDrawer
      v-if="drawerStates?.['crowd-split']"
      v-model:visible="drawerStates['crowd-split'].visible"
      :node-data="drawerStates['crowd-split'].data || {}"
      @confirm="handleConfigConfirm('crowd-split', $event)"
      @cancel="handleConfigCancel('crowd-split')"
    />

    <!-- 事件分流节点配置抽屉 -->
    <EventSplitNodeConfigDrawer
      v-if="drawerStates?.['event-split']"
      v-model:visible="drawerStates['event-split'].visible"
      :node-data="drawerStates['event-split'].data || {}"
      @confirm="handleConfigConfirm('event-split', $event)"
      @cancel="handleConfigCancel('event-split')"
    />

    <!-- A/B测试节点配置抽屉 -->
    <ABTestNodeConfigDrawer
      v-if="drawerStates?.['ab-test']"
      v-model:visible="drawerStates['ab-test'].visible"
      :node-data="drawerStates['ab-test'].data || {}"
      @confirm="handleConfigConfirm('ab-test', $event)"
      @cancel="handleConfigCancel('ab-test')"
    />

    <!-- AI外呼节点配置抽屉 -->
    <AICallNodeConfigDrawer
      v-if="drawerStates?.['ai-call']"
      v-model:visible="drawerStates['ai-call'].visible"
      :node-data="drawerStates['ai-call'].data || {}"
      @confirm="handleConfigConfirm('ai-call', $event)"
      @cancel="handleConfigCancel('ai-call')"
    />

    <!-- 短信节点配置抽屉 -->
    <SMSNodeConfigDrawer
      v-if="drawerStates?.sms"
      v-model:visible="drawerStates.sms.visible"
      :node-data="drawerStates.sms.data || {}"
      @confirm="handleConfigConfirm('sms', $event)"
      @cancel="handleConfigCancel('sms')"
    />

    <!-- 人工外呼节点配置抽屉 -->
    <ManualCallNodeConfigDrawer
      v-if="drawerStates?.['manual-call']"
      v-model:visible="drawerStates['manual-call'].visible"
      :node-data="drawerStates['manual-call'].data || {}"
      @confirm="handleConfigConfirm('manual-call', $event)"
      @cancel="handleConfigCancel('manual-call')"
    />

    <!-- 等待节点配置抽屉 -->
    <WaitNodeConfigDrawer
      v-if="drawerStates?.wait"
      v-model:visible="drawerStates.wait.visible"
      :node-data="drawerStates.wait.data || {}"
      @confirm="handleConfigConfirm('wait', $event)"
      @cancel="handleConfigCancel('wait')"
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
  'config-cancel'
])

// 处理配置确认
const handleConfigConfirm = (drawerType, config) => {
  emit('config-confirm', { drawerType, config })
}

// 处理配置取消
const handleConfigCancel = (drawerType) => {
  emit('config-cancel', { drawerType })
}
</script>

<style scoped>
.task-flow-config-drawers {
  /* 这个组件主要用于组织抽屉组件，不需要特殊样式 */
}
</style>