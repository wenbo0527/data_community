<template>
  <div 
    v-if="visible" 
    class="node-type-selector" 
    :style="selectorStyle"
  >
    <div class="node-type-selector__header">
      <h3>选择节点类型</h3>
      <button class="close-btn" @click="handleClose">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M18 6L6 18"></path>
          <path d="M6 6l12 12"></path>
        </svg>
      </button>
    </div>
    <div class="node-type-selector__content">
      <div 
        v-for="type in availableNodeTypes" 
        :key="type"
        class="node-type-item"
        :class="{ 'node-type-item--disabled': !isNodeTypeAllowed(type) }"
        @click="handleSelect(type)"
      >
        <div class="node-type-icon" :style="{ backgroundColor: getNodeColor(type) }"></div>
        <div class="node-type-label">{{ getNodeLabel(type) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getNodeConfig, getAllNodeTypes, getNodeLabel } from '../utils/nodeTypes.js'

// 组件属性
const props = defineProps({
  // 是否可见
  visible: {
    type: Boolean,
    default: false
  },
  // 选择器位置
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  // 源节点
  sourceNode: {
    type: Object,
    default: null
  },
  // 预设位
  presetSlot: {
    type: Object,
    default: null
  }
})

// 事件
const emit = defineEmits(['select', 'close'])

// 选择器样式
const selectorStyle = computed(() => ({
  left: `${props.position.x}px`,
  top: `${props.position.y}px`
}))

// 可用节点类型
const availableNodeTypes = computed(() => {
  // 获取所有节点类型
  const allTypes = getAllNodeTypes()
  
  // 过滤掉开始节点和结束节点
  return allTypes.filter(type => type !== 'start')
})

// 获取节点颜色
const getNodeColor = (nodeType) => {
  const config = getNodeConfig(nodeType)
  return config ? config.color : '#5F95FF'
}

// 检查节点类型是否允许
const isNodeTypeAllowed = (nodeType) => {
  if (!props.presetSlot || !props.presetSlot.allowedTypes || props.presetSlot.allowedTypes.length === 0) {
    console.log('预设位没有限制，允许所有节点类型')
    return true
  }
  
  const allowed = props.presetSlot.allowedTypes.includes(nodeType)
  console.log(`节点类型 ${nodeType} 是否允许:`, allowed, '允许的类型:', props.presetSlot.allowedTypes)
  
  return allowed
}

// 处理选择节点类型
const handleSelect = (nodeType) => {
  if (!isNodeTypeAllowed(nodeType)) return
  
  emit('select', nodeType)
}

// 处理关闭
const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.node-type-selector {
  position: absolute;
  width: 300px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transform: translate(-50%, -100%);
  margin-top: -20px;
}

.node-type-selector::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid white;
}

.node-type-selector__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.node-type-selector__header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  cursor: pointer;
  color: #999;
  border-radius: 4px;
  padding: 0;
}

.close-btn:hover {
  background-color: #f5f5f5;
  color: #666;
}

.node-type-selector__content {
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.node-type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.node-type-item:hover {
  background-color: #f5f5f5;
}

.node-type-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.node-type-item--disabled:hover {
  background-color: transparent;
}

.node-type-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-bottom: 8px;
}

.node-type-label {
  font-size: 12px;
  text-align: center;
  color: #333;
}
</style>