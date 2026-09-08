<template>
  <div
    ref="el"
    class="out-port"
    :data-port-group="'out'"
    :data-port-id="portId"
  >
    <span class="out-port__label">{{ label }}</span>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useGraphInstance } from '@/pages/marketing/tasks/composables/useGraphInstance.js'

const props = defineProps({
  nodeId:   { type: String, required: true },
  portId: { type: String, required: true },
  label:  { type: String, default: '' }
})

const el = ref(null)
const { graph } = useGraphInstance()

onMounted(async () => {
  await nextTick()
  if (!graph?.value || !el.value) return

  // 以 DOM 中心作为端口位置，废弃 rowIndex/dy 计算
  const { x, y, width, height } = el.value.getBoundingClientRect()
  const portCenter = {
    x: x + width / 2,
    y: y + height / 2
  }

  console.log(`[OutPort] 注册输出端口: ${props.portId}`, {
    nodeId: props.nodeId,
    portCenter,
    group: 'out'
  })

  graph.value.addPort({
    id: props.portId,
    group: 'out',
    args: {
      x: portCenter.x,
      y: portCenter.y
    }
  })
})

onBeforeUnmount(() => {
  if (!graph?.value) return
  graph.value.removePort(props.portId)
})
</script>

<style scoped>
.out-port {
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 8px;
  margin-top: 4px;          /* 自上而下排列时保持间距 */
  background: #fff7e6;
  border: 1px solid #ffa940;
  border-radius: 4px;
  cursor: crosshair;
}
.out-port__label {
  font-size: 12px;
  color: #d46b08;
  white-space: nowrap;
}
</style>