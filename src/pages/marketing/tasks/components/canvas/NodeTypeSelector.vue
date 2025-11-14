<template>
  <div 
    v-if="visible" 
    class="node-type-selector"
    :class="{ 'node-type-selector--dock': dock }"
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
        draggable="true"
        @dragstart="handleDragStart(type, $event)"
      >
        <div class="node-type-icon" :style="{ backgroundColor: getNodeColor(type) }"></div>
        <div class="node-type-label">{{ getNodeLabel(type) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getNodeConfig, getAllNodeTypes, getNodeLabel } from '../../../../../utils/nodeTypes.js'

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
  },
  // 是否左上角固定停靠显示
  dock: {
    type: Boolean,
    default: false
  }
})

// 事件
const emit = defineEmits(['select', 'close', 'dragstart'])

// 选择器样式
const selectorStyle = computed(() => {
  if (props.dock) {
    return { left: '16px', top: '16px' }
  }
  return {
    left: `${props.position.x}px`,
    top: `${props.position.y}px`
  }
})

// 可用节点类型
const availableNodeTypes = computed(() => {
  // 获取所有节点类型
  const allTypes = getAllNodeTypes()
  
  // 🔧 修复：过滤掉无效值，确保不包含 undefined、null 或空字符串
  const validTypes = allTypes.filter(type => {
    return type && 
           typeof type === 'string' && 
           type.trim() !== '' && 
           type !== 'start' // 过滤掉开始节点
  })
  
  console.log('[NodeTypeSelector] 可用节点类型:', validTypes)
  return validTypes
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
  console.log('[NodeTypeSelector] 处理节点类型选择:', { nodeType, type: typeof nodeType })
  
  // 🔧 修复：添加严格的参数验证
  if (!nodeType || typeof nodeType !== 'string' || nodeType.trim() === '') {
    console.error('[NodeTypeSelector] 无效的节点类型参数:', { nodeType, type: typeof nodeType })
    return
  }
  
  const normalizedNodeType = nodeType.trim()
  
  // 验证节点类型是否在允许列表中
  if (!isNodeTypeAllowed(normalizedNodeType)) {
    console.warn('[NodeTypeSelector] 节点类型不在允许列表中:', normalizedNodeType)
    return
  }
  
  // 验证节点类型是否存在于配置中
  const nodeConfig = getNodeConfig(normalizedNodeType)
  if (!nodeConfig) {
    console.error('[NodeTypeSelector] 节点类型配置不存在:', normalizedNodeType)
    return
  }
  
  console.log('[NodeTypeSelector] 发送节点类型选择事件:', normalizedNodeType)
  emit('select', normalizedNodeType)
}

const handleDragStart = (nodeType, e) => {
  if (!nodeType || typeof nodeType !== 'string' || nodeType.trim() === '') return
  const normalizedNodeType = nodeType.trim()
  if (!isNodeTypeAllowed(normalizedNodeType)) return
  const nodeConfig = getNodeConfig(normalizedNodeType)
  if (!nodeConfig) return
  if (e && e.dataTransfer) {
    try {
      e.dataTransfer.setData('nodeType', normalizedNodeType)
      e.dataTransfer.effectAllowed = 'copy'
    } catch {}
  }
  emit('dragstart', normalizedNodeType)
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

.node-type-selector--dock {
  transform: none;
  margin-top: 0;
}

.node-type-selector--dock::after {
  display: none;
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
