<template>
  <div class="task-flow-config-drawers">
    <component
      v-for="key in DRAWER_KEYS"
      v-show="drawerStates?.[key]?.visible"
      :key="key"
      :is="registry[key]"
      :visible="!!drawerStates?.[key]?.visible"
      :node-data="drawerStates?.[key]?.data || {}"
      :read-only="!!drawerStates?.[key]?.readOnly"
      @confirm="(config) => emit('config-confirm', { drawerType: key, config })"
      @cancel="emit('config-cancel', { drawerType: key })"
      @update:visible="(visible) => emit('visibility-change', { drawerType: key, visible })"
    />
  </div>
</template>

<script setup>
import { CONFIG_DRAWER_REGISTRY as registry, DRAWER_KEYS } from './drawerRegistry.ts'

defineProps({
  drawerStates: { type: Object, required: true },
  readOnly: { type: Boolean, default: false }
})

const emit = defineEmits(['config-confirm', 'config-cancel', 'visibility-change'])
</script>

<style scoped>
.task-flow-config-drawers {}
</style>