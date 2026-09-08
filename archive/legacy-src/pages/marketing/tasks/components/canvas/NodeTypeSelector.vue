<template>
  <div 
    v-if="visible" 
    class="node-type-selector"
    :class="{ 'node-type-selector--dock': dock }"
    :style="selectorStyle"
  >
    <!-- 头部搜索栏 -->
    <div class="node-type-selector__header">
      <div class="search-bar">
        <i class="icon-search search-icon"></i>
        <input 
          type="text" 
          class="search-input" 
          placeholder="搜索节点类型"
          v-model="searchKeyword"
        />
      </div>
      <button class="close-btn" @click="handleClose">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M18 6L6 18"></path>
          <path d="M6 6l12 12"></path>
        </svg>
      </button>
    </div>
    
    <div class="node-type-selector__content">
      <!-- 分层节点类型（每行2个节点） -->
      <div class="node-type-category" v-for="category in filteredCategories" :key="category.key">
        <div class="category-title">{{ category.title }}</div>
        <div class="category-content">
          <div 
            v-for="type in category.types" 
            :key="type"
            class="node-type-item"
            :class="{ 'node-type-item--disabled': !isNodeTypeAllowed(type) }"
            @click="handleSelect(type)"
            draggable="true"
            @dragstart="handleDragStart(type, $event)"
          >
            <div class="node-type-icon" :style="{ backgroundColor: getNodeColor(type) }">
              <component :is="getNodeIconComponent(type)" class="arco-icon" />
            </div>
            <div class="node-type-label">{{ getNodeLabel(type) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { getNodeConfig, getAllNodeTypes, getNodeLabel } from '../../../../../utils/nodeTypes.js'
import * as ArcoIcons from '@arco-design/web-vue/es/icon'

// 节点类型分层配置
const NODE_TYPE_CATEGORIES = [
  {
    key: 'business',
    title: '业务逻辑',
    types: ['crowd-split', 'event-split', 'ab-test', 'wait', 'end']
  },
  {
    key: 'outreach',
    title: '触达',
    types: ['sms', 'ai-call', 'manual-call']
  },
  {
    key: 'benefit',
    title: '权益',
    types: ['benefit']
  }
]

// 节点类型图标映射 - 基于Arco Design图标库
const ICON_NAME_MAP = {
  'crowd-split': 'IconUserGroup',
  'event-split': 'IconThunderbolt',
  'ab-test': 'IconExperiment',
  'wait': 'IconClockCircle',
  'end': 'IconPoweroff',
  'sms': 'IconMessage',
  'ai-call': 'IconPhone',
  'manual-call': 'IconUserAdd',
  'benefit': 'IconGift'
}

// 搜索关键词
const searchKeyword = ref('')

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

// 移除通用节点数据（不再需要）
const generalNodes = computed(() => [])

// 清理样式 - 移除通用节点相关样式

// 过滤后的分层数据
const filteredCategories = computed(() => {
  const allTypes = getAllNodeTypes()
  
  // 过滤非画布节点类型
  const canvasTypes = allTypes.filter(type => {
    return type && 
           typeof type === 'string' && 
           type.trim() !== '' && 
           type !== 'start' && // 过滤掉开始节点
           !['preview', 'temp', 'ghost'].includes(type) // 过滤非画布节点
  })
  
  // 构建分层数据并应用搜索过滤
  return NODE_TYPE_CATEGORIES.map(category => ({
    ...category,
    types: category.types.filter(type => {
      const isInCanvas = canvasTypes.includes(type)
      if (!isInCanvas) return false
      
      // 应用搜索过滤
      if (!searchKeyword.value) return true
      const label = getNodeLabel(type)
      return label.toLowerCase().includes(searchKeyword.value.toLowerCase())
    })
  })).filter(category => category.types.length > 0)
})

const getNodeIconComponent = (nodeType) => {
  const name = ICON_NAME_MAP[nodeType] || 'IconApps'
  return ArcoIcons[name] || ArcoIcons.IconApps || ArcoIcons.IconUserGroup
}

// 获取节点颜色
const getNodeColor = (nodeType) => {
  const config = getNodeConfig(nodeType)
  return config ? config.color : '#5F95FF'
}

// 检查节点类型是否允许
const isNodeTypeAllowed = (nodeType) => {
  if (!nodeType || typeof nodeType !== 'string') return false
  
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
  width: 280px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transform: translate(-50%, 0);
  margin-top: -20px;
  border: 1px solid #e5e7eb;
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
  background: #fafafa;
  border-radius: 8px 8px 0 0;
}

.search-bar {
  flex: 1;
  position: relative;
  margin-right: 12px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #4C78FF;
}

.search-input::placeholder {
  color: #999;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  color: #999;
  border-radius: 6px;
  padding: 0;
  transition: all 0.2s;
  flex-shrink: 0;
}

.close-btn:hover {
  background-color: #f5f5f5;
  color: #666;
}

.close-btn:active {
  background-color: #e5e7eb;
}

.node-type-selector__content {
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

/* 分层节点网格样式 */
.node-type-category {
  margin-bottom: 16px;
}

.node-type-category:last-child {
  margin-bottom: 0;
}

.category-title {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-left: 4px;
}

.category-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.node-type-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e5e7eb;
  background: white;
  min-height: 56px;
}

.node-type-item:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.node-type-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.node-type-item--disabled:hover {
  background-color: white;
  border-color: #e5e7eb;
  transform: none;
  box-shadow: none;
}

.node-type-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.node-type-label {
  font-size: 12px;
  text-align: left;
  color: #374151;
  font-weight: 500;
  line-height: 1.2;
}
</style>
