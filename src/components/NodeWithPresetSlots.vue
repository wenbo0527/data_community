<template>
  <div class="node-with-slots" :style="containerStyle">
    <!-- 节点本身 -->
    <div class="node-container" ref="nodeContainer">
      <!-- 节点内容由插槽提供 -->
      <slot name="node"></slot>
    </div>
    
    <!-- 预设位容器 -->
    <div class="preset-slots-container">
      <template v-for="(slot, index) in presetSlots" :key="slot.id">
        <PresetSlot
          :slot="slot"
          :state="slot.state"
          :parent-position="nodePosition"
          :show-connector="true"
          @click="handlePresetSlotClick(slot)"
          @add-node="handleAddNodeToSlot(slot)"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import PresetSlot from './PresetSlot.vue'

// 组件属性
const props = defineProps({
  // 节点ID
  nodeId: {
    type: String,
    required: true
  },
  // 节点类型
  nodeType: {
    type: String,
    required: true
  },
  // 节点位置
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  // 节点配置
  config: {
    type: Object,
    default: () => ({})
  },
  // 预设位数据
  presetSlots: {
    type: Array,
    default: () => []
  },
  // 是否可拖动
  draggable: {
    type: Boolean,
    default: true
  }
})

// 事件
const emit = defineEmits([
  'update:position',
  'preset-slot-click',
  'add-node-to-slot',
  'node-click',
  'node-config-change'
])

// 节点容器引用
const nodeContainer = ref(null)

// 节点位置状态
const nodePosition = computed(() => props.position)

// 容器样式
const containerStyle = computed(() => ({
  position: 'absolute',
  left: `${props.position.x}px`,
  top: `${props.position.y}px`,
  zIndex: props.nodeType === 'start' ? 10 : 1
}))

// 处理预设位点击
const handlePresetSlotClick = (slot) => {
  emit('preset-slot-click', slot)
}

// 处理在预设位添加节点
const handleAddNodeToSlot = (slot) => {
  emit('add-node-to-slot', slot)
}

// 拖拽相关变量
let isDragging = false
let startX = 0
let startY = 0
let originalX = 0
let originalY = 0

// 处理拖拽开始
const handleDragStart = (e) => {
  if (!props.draggable) return
  
  // 只有鼠标左键才能拖动
  if (e.button !== 0) return
  
  isDragging = true
  startX = e.clientX
  startY = e.clientY
  originalX = props.position.x
  originalY = props.position.y
  
  // 阻止事件冒泡和默认行为
  e.stopPropagation()
  e.preventDefault()
  
  // 添加全局事件监听
  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', handleDragEnd)
}

// 处理拖拽移动
const handleDragMove = (e) => {
  if (!isDragging) return
  
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  
  // 计算新位置并对齐到网格
  const newX = snapToGrid(originalX + dx)
  const newY = snapToGrid(originalY + dy)
  
  // 更新位置
  emit('update:position', { x: newX, y: newY })
}

// 处理拖拽结束
const handleDragEnd = () => {
  isDragging = false
  
  // 移除全局事件监听
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
}

// 对齐到网格
const snapToGrid = (value) => {
  const gridSize = 20 // 小网格大小
  return Math.round(value / gridSize) * gridSize
}

// 组件挂载时添加事件监听
onMounted(() => {
  if (nodeContainer.value) {
    nodeContainer.value.addEventListener('mousedown', handleDragStart)
  }
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  if (nodeContainer.value) {
    nodeContainer.value.removeEventListener('mousedown', handleDragStart)
  }
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
})

// 暴露方法
defineExpose({
  nodePosition
})
</script>

<style scoped>
.node-with-slots {
  position: absolute;
  user-select: none;
}

.node-container {
  position: relative;
  cursor: move;
}

.preset-slots-container {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.preset-slots-container > * {
  pointer-events: auto;
}
</style>