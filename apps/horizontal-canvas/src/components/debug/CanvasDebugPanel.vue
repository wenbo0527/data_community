<template>
  <div v-if="visible" class="bottom-debug-panel" role="region" aria-label="调试面板" :style="inlineDockStyle">
    <div class="dbg-header">
      <div class="dbg-title">
        <span>调试</span>
        <span class="dbg-sub">节点 {{ stats.nodes }} · 连线 {{ stats.edges }} · 缩放 {{ stats.zoom }}</span>
      </div>
      <a-button size="mini" type="text" @click="$emit('close')">
        <template #icon><icon-close /></template>
      </a-button>
    </div>
    <div class="dbg-body">
      <div class="dbg-empty" v-if="!logs.length">
        <div class="robot" />
        <div class="hint">暂无调试输出</div>
      </div>
      <div class="dbg-log" v-else>
        <pre>{{ logs.join('\n') }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { IconClose } from '@arco-design/web-vue/es/icon'
const props = defineProps({ visible: { type: Boolean, default: false }, graph: { type: Object, default: null }, dockBounds: { type: Object, default: null } })
const stats = computed(() => {
  const g = props.graph
  return { nodes: g?.getNodes?.().length || 0, edges: g?.getEdges?.().length || 0, zoom: (g?.zoom?.() || 1).toFixed(2) }
})
const logs = computed(() => [])

const inlineDockStyle = computed(() => {
  const b = props.dockBounds || {}
  const style = {}
  if (typeof b.left === 'number') style.left = b.left + 'px'
  if (typeof b.width === 'number') style.width = b.width + 'px'
  return style
})
</script>

<style scoped>
.bottom-debug-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 220px;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.06);
  z-index: 1100;
  display: flex;
  flex-direction: column;
}
.dbg-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #e5e7eb }
.dbg-title { display: flex; align-items: baseline; gap: 12px; font-weight: 600; color: #111827 }
.dbg-sub { font-size: 12px; color: #6b7280 }
.dbg-body { flex: 1; overflow: auto; padding: 12px }
.dbg-empty { height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px; color: #6b7280 }
.robot { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg,#e8eefc,#f3f4f6) }
.dbg-log pre { font-size: 12px; line-height: 1.5; white-space: pre-wrap }
</style>
