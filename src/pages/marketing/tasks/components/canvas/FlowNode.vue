<template>
  <div 
    class="flow-node" 
    :class="[`flow-node--${actualNodeType}`, { 'flow-node--selected': actualSelected }]"
    @click="handleClick"
  >
    <div class="flow-node__icon">
      <slot name="icon">
        <div class="flow-node__default-icon" :style="{ backgroundColor: nodeColor }"></div>
      </slot>
    </div>
    <div class="flow-node__label">{{ actualLabel }}</div>
    
    <!-- 删除按钮（开始节点不显示） -->
    <div 
      v-if="actualDeletable" 
      class="flow-node__delete-btn" 
      @click.stop.prevent="handleDeleteClick"
      @mousedown.stop.prevent
      @mouseup.stop.prevent
      title="删除节点"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
        <path d="M3 6h18"></path>
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
        <path d="M8 6V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>
    </div>
    
    <!-- 预设位 -->
    <div v-if="presetSlots && presetSlots.length > 0" class="preset-slots">
      <div
        v-for="slot in presetSlots"
        :key="slot.id"
        class="preset-slot"
        :class="{ 'occupied': slot.occupied }"
        :style="getSlotStyle(slot)"
        @click.stop="handleSlotClick(slot)"
      >
        <div class="slot-indicator">
          <div class="slot-icon" v-if="!slot.occupied">+</div>
        </div>
        <div class="slot-label" v-if="slot.label">{{ slot.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getNodeConfig } from '../../../../../utils/nodeTypes.js'

// 组件属性
const props = defineProps({
  // X6 Vue Shape 传递的节点对象
  node: {
    type: Object,
    default: null
  },
  // X6 Vue Shape 传递的图对象
  graph: {
    type: Object,
    default: null
  },
  // 节点类型（向后兼容）
  nodeType: {
    type: String,
    default: ''
  },
  // 节点标签（向后兼容）
  label: {
    type: String,
    default: ''
  },
  // 是否选中（向后兼容）
  selected: {
    type: Boolean,
    default: false
  },
  // 是否可删除（向后兼容）
  deletable: {
    type: Boolean,
    default: true
  },
  // 节点数据（向后兼容）
  data: {
    type: Object,
    default: () => ({})
  },
  // 预占位相关属性
  presetSlots: {
    type: Array,
    default: () => []
  }
})

// 事件
const emit = defineEmits(['click', 'delete', 'slot-click'])

// 从X6节点或props中获取数据
const nodeData = computed(() => {
  if (props.node && typeof props.node.getData === 'function') {
    try {
      return props.node.getData() || {}
    } catch (error) {
      console.warn('[FlowNode] 获取节点数据失败:', error)
      return props.node.data || props.node.store?.data?.data || {}
    }
  }
  return props.data || {}
})

const actualNodeType = computed(() => {
  // 🔧 修复：与TaskFlowCanvasRefactored保持一致的节点类型获取逻辑
  const data = nodeData.value
  const actualType = data?.type || data?.nodeType || props.nodeType || 'start'
  
  console.log('🔍 [FlowNode] 节点类型确认:', {
    dataType: data?.type,
    dataNodeType: data?.nodeType,
    propsNodeType: props.nodeType,
    actualType: actualType,
    nodeId: props.node?.id
  })
  
  return actualType
})

const actualLabel = computed(() => {
  // 安全访问nodeData.value
  if (nodeData && nodeData.value && nodeData.value.label) {
    return nodeData.value.label
  }
  return props.label || '节点'
})

const actualSelected = computed(() => {
  // 安全访问nodeData.value
  if (nodeData && nodeData.value && nodeData.value.selected !== undefined) {
    return nodeData.value.selected
  }
  return props.selected || false
})

const actualDeletable = computed(() => {
  // 安全访问nodeData.value
  let deletable = props.deletable
  if (nodeData && nodeData.value && nodeData.value.deletable !== undefined) {
    deletable = nodeData.value.deletable
  }
  return deletable && actualNodeType.value !== 'start'
})

// 获取节点颜色
const nodeColor = computed(() => {
  const config = getNodeConfig(actualNodeType.value)
  return config ? config.color : '#5F95FF'
})

// 处理节点点击 - 现在点击节点直接展示配置抽屉
const handleClick = (event) => {
  const safeNodeData = nodeData && nodeData.value ? nodeData.value : {}
  emit('click', { 
    event, 
    nodeType: actualNodeType.value, 
    data: safeNodeData,
    node: props.node 
  })
}

// 处理删除按钮点击
const handleDeleteClick = (event) => {
  console.log('[FlowNode] 删除按钮被点击:', props.node?.id)
  
  // 阻止事件冒泡和默认行为
  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation()
  
  const safeNodeData = nodeData && nodeData.value ? nodeData.value : {}
  
  // 首先尝试通过emit触发事件（用于LayeredFlowCanvas等直接使用的场景）
  emit('delete', { 
    event, 
    nodeType: actualNodeType.value, 
    data: safeNodeData,
    node: props.node 
  })
  
  // 如果是在X6环境中，通过X6的事件系统触发事件
  if (props.node && props.graph) {
    console.log('[FlowNode] 通过X6事件系统触发删除事件')
    props.graph.trigger('vue:delete', { node: props.node })
  }
}

// 处理预占位点击
const handleSlotClick = (slot) => {
  console.log('[FlowNode] 预设位被点击:', slot, props.node?.id)
  
  const slotData = {
    slot,
    nodeType: actualNodeType.value,
    data: nodeData.value,
    node: props.node
  }
  
  // 首先尝试通过emit触发事件（用于LayeredFlowCanvas等直接使用的场景）
  emit('slot-click', slotData)
  
  // 如果是在X6环境中，通过X6的事件系统触发事件
  if (props.node && props.graph) {
    console.log('[FlowNode] 通过X6事件系统触发预设位点击事件')
    props.graph.trigger('vue:slot-click', { node: props.node, data: slotData })
  }
}

// 获取预占位样式
const getSlotStyle = (slot) => {
  return {
    position: 'absolute',
    left: slot.position?.x + 'px' || '0px',
    top: slot.position?.y + 'px' || '0px'
  }
}
</script>

<style scoped>
.flow-node {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  min-height: 60px;
  padding: 12px 16px;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.flow-node:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.flow-node--selected {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.flow-node__icon {
  margin-bottom: 8px;
}

.flow-node__default-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #5f95ff;
}

.flow-node__label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  text-align: center;
  line-height: 1.4;
  word-break: break-word;
}

.flow-node__delete-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: #ef4444;
  border: 2px solid #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  opacity: 0;
  transition: all 0.2s ease;
  z-index: 10;
}

.flow-node:hover .flow-node__delete-btn {
  opacity: 1;
}

.flow-node__delete-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.preset-slots {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.preset-slot {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.2s ease;
}

.preset-slot:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.preset-slot.occupied {
  background: #10b981;
  border-color: #059669;
}

.slot-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.slot-icon {
  font-size: 12px;
  font-weight: bold;
  color: #6b7280;
}

.slot-label {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: #6b7280;
  white-space: nowrap;
  margin-top: 2px;
}

/* 节点类型特定样式 */
.flow-node--start {
  border-color: #10b981;
}

.flow-node--start:hover {
  border-color: #059669;
}

.flow-node--end {
  border-color: #ef4444;
}

.flow-node--end:hover {
  border-color: #dc2626;
}

.flow-node--condition {
  border-color: #f59e0b;
  transform: rotate(45deg);
}

.flow-node--condition .flow-node__label {
  transform: rotate(-45deg);
}

.flow-node--condition:hover {
  border-color: #d97706;
}

.flow-node--process {
  border-color: #3b82f6;
}

.flow-node--process:hover {
  border-color: #2563eb;
}
</style>