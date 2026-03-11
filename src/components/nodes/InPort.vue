<template>
  <div
    ref="el"
    class="in-port"
    :data-port-group="'in'"
    :data-port-id="portId"
  >
    <span class="in-port__label">{{ label }}</span>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useGraphInstance } from '@/pages/marketing/tasks/composables/useGraphInstance.js'

const props = defineProps({
  nodeId:     { type: String, required: true },
  portId:   { type: String, required: true },
  label:    { type: String, default: '' }
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

  console.log(`[InPort] 注册输入端口: ${props.portId}`, {
    nodeId: props.nodeId,
    portCenter,
    group: 'in'
  })

  graph.value.addPort({
    id: props.portId,
    group: 'in',
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
.in-port {
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 8px;
  background: #f0f8ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  cursor: crosshair;
}
.in-port__label {
  font-size: 12px;
  color: #0050b3;
  white-space: nowrap;
}
</style>