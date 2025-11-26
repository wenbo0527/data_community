<template>
  <a-drawer :visible="visible" width="320" @cancel="$emit('close')" :footer="false" title="历史">
    <div class="history">
      <div v-for="(item, idx) in historyStack" :key="idx" class="history-item" @click="$emit('jump-to-state', item)">
        <span class="idx">#{{ idx + 1 }}</span>
        <span class="desc">{{ item?.description || '变更' }}</span>
      </div>
    </div>
  </a-drawer>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  historyStack: { type: Array, default: () => [] }
})
</script>

<style scoped>
.history { display: flex; flex-direction: column; gap: 8px }
.history-item { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border: 1px solid #e5e6eb; border-radius: 6px; cursor: pointer }
.history-item:hover { background: #f7f8fa }
.idx { color: #86909c; font-size: 12px }
.desc { color: #1d2129; font-size: 12px }
</style>
