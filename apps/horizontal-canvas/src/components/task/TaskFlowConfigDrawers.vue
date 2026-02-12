<template>
  <div class="task-flow-config-drawers">
    <StartNodeConfigDrawer
      v-if="drawerStates?.start?.visible"
      :visible="drawerStates.start.visible"
      :node-data="drawerStates.start.data || {}"
      :read-only="drawerStates.start.readOnly === true"
      @confirm="handleConfigConfirm('start', $event)"
      @cancel="handleConfigCancel('start')"
      @update:visible="(visible) => handleVisibilityChange('start', visible)"
    />

    <CrowdSplitNodeConfigDrawer
      v-if="drawerStates?.['crowd-split']?.visible"
      :visible="drawerStates['crowd-split'].visible"
      :node-data="drawerStates['crowd-split'].data || {}"
      :read-only="drawerStates['crowd-split'].readOnly === true"
      @confirm="handleConfigConfirm('crowd-split', $event)"
      @cancel="handleConfigCancel('crowd-split')"
      @update:visible="(visible) => handleVisibilityChange('crowd-split', visible)"
    />

    <EventSplitNodeConfigDrawer
      v-if="drawerStates?.['event-split']?.visible"
      :visible="drawerStates['event-split'].visible"
      :node-data="drawerStates['event-split'].data || {}"
      :read-only="drawerStates['event-split'].readOnly === true"
      @confirm="handleConfigConfirm('event-split', $event)"
      @cancel="handleConfigCancel('event-split')"
      @update:visible="(visible) => handleVisibilityChange('event-split', visible)"
    />

    <ABTestNodeConfigDrawer
      v-if="drawerStates?.['ab-test']?.visible"
      :visible="drawerStates['ab-test'].visible"
      :node-data="drawerStates['ab-test'].data || {}"
      :read-only="drawerStates['ab-test'].readOnly === true"
      @confirm="handleConfigConfirm('ab-test', $event)"
      @cancel="handleConfigCancel('ab-test')"
      @update:visible="(visible) => handleVisibilityChange('ab-test', visible)"
    />

    <AICallNodeConfigDrawer
      v-if="drawerStates?.['ai-call']?.visible"
      :visible="drawerStates['ai-call'].visible"
      :node-data="drawerStates['ai-call'].data || {}"
      :read-only="drawerStates['ai-call'].readOnly === true"
      @confirm="handleConfigConfirm('ai-call', $event)"
      @cancel="handleConfigCancel('ai-call')"
      @update:visible="(visible) => handleVisibilityChange('ai-call', visible)"
    />

    <SMSNodeConfigDrawer
      v-if="drawerStates?.sms?.visible"
      :visible="drawerStates.sms.visible"
      :node-data="drawerStates.sms.data || {}"
      :read-only="drawerStates.sms.readOnly === true"
      @confirm="handleConfigConfirm('sms', $event)"
      @cancel="handleConfigCancel('sms')"
      @update:visible="(visible) => handleVisibilityChange('sms', visible)"
    />

    <AppPushNodeConfigDrawer
      v-if="drawerStates?.['app-push']?.visible"
      :visible="drawerStates['app-push'].visible"
      :node-data="drawerStates['app-push'].data || {}"
      :read-only="drawerStates['app-push'].readOnly === true"
      @confirm="handleConfigConfirm('app-push', $event)"
      @cancel="handleConfigCancel('app-push')"
      @update:visible="(visible) => handleVisibilityChange('app-push', visible)"
    />

    <WechatPushNodeConfigDrawer
      v-if="drawerStates?.['wechat-push']?.visible"
      :visible="drawerStates['wechat-push'].visible"
      :node-data="drawerStates['wechat-push'].data || {}"
      :read-only="drawerStates['wechat-push'].readOnly === true"
      @confirm="handleConfigConfirm('wechat-push', $event)"
      @cancel="handleConfigCancel('wechat-push')"
      @update:visible="(visible) => handleVisibilityChange('wechat-push', visible)"
    />

    <ManualCallNodeConfigDrawer
      v-if="drawerStates?.['manual-call']?.visible"
      :visible="drawerStates['manual-call'].visible"
      :node-data="drawerStates['manual-call'].data || {}"
      :read-only="drawerStates['manual-call'].readOnly === true"
      @confirm="handleConfigConfirm('manual-call', $event)"
      @cancel="handleConfigCancel('manual-call')"
      @update:visible="(visible) => handleVisibilityChange('manual-call', visible)"
    />

    <WaitNodeConfigDrawer
      v-if="drawerStates?.wait?.visible"
      :visible="drawerStates.wait.visible"
      :node-data="drawerStates.wait.data || {}"
      :read-only="drawerStates.wait.readOnly === true"
      @confirm="handleConfigConfirm('wait', $event)"
      @cancel="handleConfigCancel('wait')"
      @update:visible="(visible) => handleVisibilityChange('wait', visible)"
    />

    <BenefitNodeConfigDrawer
      v-if="drawerStates?.benefit?.visible"
      :visible="drawerStates.benefit.visible"
      :node-data="drawerStates.benefit.data || {}"
      :read-only="drawerStates.benefit.readOnly === true"
      @confirm="handleConfigConfirm('benefit', $event)"
      @cancel="handleConfigCancel('benefit')"
      @update:visible="(visible) => handleVisibilityChange('benefit', visible)"
    />
  </div>
</template>

<script setup>
import StartNodeConfigDrawer from './StartNodeConfigDrawer.vue'
import CrowdSplitNodeConfigDrawer from './CrowdSplitNodeConfigDrawer.vue'
import EventSplitNodeConfigDrawer from './EventSplitNodeConfigDrawer.vue'
import ABTestNodeConfigDrawer from './ABTestNodeConfigDrawer.vue'
import AICallNodeConfigDrawer from './AICallNodeConfigDrawer.vue'
import AppPushNodeConfigDrawer from './AppPushNodeConfigDrawer.vue'
import WechatPushNodeConfigDrawer from './WechatPushNodeConfigDrawer.vue'
import SMSNodeConfigDrawer from './SMSNodeConfigDrawer.vue'
import ManualCallNodeConfigDrawer from './ManualCallNodeConfigDrawer.vue'
import WaitNodeConfigDrawer from './WaitNodeConfigDrawer.vue'
import BenefitNodeConfigDrawer from './BenefitNodeConfigDrawer.vue'

const props = defineProps({
  drawerStates: { type: Object, required: true },
  readOnly: { type: Boolean, default: false }
})

const emit = defineEmits(['config-confirm','config-cancel','visibility-change'])

const handleConfigConfirm = (drawerType, config) => {
  emit('config-confirm', { drawerType, config })
}
const handleConfigCancel = (drawerType) => {
  emit('config-cancel', { drawerType })
}
const handleVisibilityChange = (drawerType, visible) => {
  emit('visibility-change', { drawerType, visible })
}
</script>

<style scoped>
.task-flow-config-drawers {}
</style>
