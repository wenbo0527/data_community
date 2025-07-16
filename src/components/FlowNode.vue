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
      @click.stop="handleDeleteClick"
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
import { getNodeConfig } from '../utils/nodeTypes.js'

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
    return props.node.getData() || {}
  }
  return props.data || {}
})

const actualNodeType = computed(() => {
  return nodeData.value.nodeType || props.nodeType || 'start'
})

const actualLabel = computed(() => {
  return nodeData.value.label || props.label || '节点'
})

const actualSelected = computed(() => {
  return nodeData.value.selected || props.selected || false
})

const actualDeletable = computed(() => {
  const deletable = nodeData.value.deletable !== undefined ? nodeData.value.deletable : props.deletable
  return deletable && actualNodeType.value !== 'start'
})

// 获取节点颜色
const nodeColor = computed(() => {
  const config = getNodeConfig(actualNodeType.value)
  return config ? config.color : '#5F95FF'
})

// 处理节点点击 - 现在点击节点直接展示配置抽屉
const handleClick = (event) => {
  emit('click', { 
    event, 
    nodeType: actualNodeType.value, 
    data: nodeData.value,
    node: props.node 
  })
}

// 处理删除按钮点击
const handleDeleteClick = (event) => {
  console.log('[FlowNode] 删除按钮被点击:', props.node?.id)
  
  // 首先尝试通过emit触发事件（用于LayeredFlowCanvas等直接使用的场景）
  emit('delete', { 
    event, 
    nodeType: actualNodeType.value, 
    data: nodeData.value,
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
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;
}

.flow-node:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.flow-node--selected {
  box-shadow: 0 0 0 2px #5F95FF, 0 4px 8px rgba(0, 0, 0, 0.15);
}

.flow-node__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-bottom: 8px;
}

.flow-node__default-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.flow-node__label {
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  color: #333;
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.flow-node__delete-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff4d4f;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 77, 79, 0.3);
}

.flow-node__delete-btn:hover {
  background-color: #ff4d4f;
  color: white;
  transform: scale(1.1);
}

.flow-node:hover .flow-node__delete-btn {
  opacity: 1;
}

/* 节点类型特定样式 */
.flow-node--start {
  border: 2px solid #5F95FF;
}

.flow-node--end {
  border: 2px solid #8C8C8C;
}

.flow-node--audience-split {
  border: 2px solid #FF6A6A;
}

.flow-node--event-split {
  border: 2px solid #69C0FF;
}

.flow-node--condition {
  border: 2px solid #FA8C16;
}

.flow-node--sms {
  border: 2px solid #45B7D1;
}

.flow-node--email {
  border: 2px solid #FF7F50;
}

.flow-node--wechat {
  border: 2px solid #1AAD19;
}

.flow-node--ai-call {
  border: 2px solid #96CEB4;
}

.flow-node--manual-call {
  border: 2px solid #FFEAA7;
}

.flow-node--ab-test {
  border: 2px solid #DDA0DD;
}

/* 预占位样式 */
.preset-slots {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.preset-slot {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  z-index: 5;
  pointer-events: auto;
}

.slot-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border: 2px solid #1890ff;
  transition: all 0.3s;
}

.slot-icon {
  font-size: 12px;
  font-weight: bold;
  color: #1890ff;
}

.slot-label {
  margin-top: 2px;
  font-size: 10px;
  color: #666;
  white-space: nowrap;
}

.preset-slot:hover .slot-indicator {
  transform: scale(1.1);
  box-shadow: 0 0 6px rgba(24, 144, 255, 0.5);
}

.preset-slot.occupied .slot-indicator {
  background-color: #e6f7ff;
  border-color: #91d5ff;
}
</style>