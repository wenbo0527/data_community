<template>
  <div class="universal-node" :class="nodeClasses" :style="nodeStyles">
    <!-- 节点头部区域 -->
    <div class="node-header" :class="headerClasses">
      <div class="node-icon" :class="iconClasses">
        <span class="icon-text">{{ iconText }}</span>
      </div>
      <div class="node-title" :class="titleClasses">
        {{ displayTitle }}
      </div>
      <div class="node-actions" :class="actionsClasses" @click="toggleActionsMenu">
        <div class="action-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>

    <!-- 节点内容区域 -->
    <div class="node-content" :class="contentClasses">
      <div 
        v-for="(line, index) in contentLines" 
        :key="index"
        class="content-line"
        :class="getLineClasses(index)"
        :style="getLineStyle(index)"
      >
        <span class="line-text">{{ line }}</span>
      </div>
    </div>

    <!-- 端口区域 -->
    <div class="node-ports" :class="portsClasses">
      <!-- 输入端口 -->
      <div 
        v-if="hasInputPort"
        class="port port-input"
        :class="inputPortClasses"
        :style="inputPortStyle"
        @mouseenter="onPortHover('input')"
        @mouseleave="onPortLeave('input')"
      ></div>
      
      <!-- 输出端口 -->
      <div 
        v-for="(line, index) in contentLines" 
        :key="`out-${index}`"
        class="port port-output"
        :class="getOutputPortClasses(index)"
        :style="getOutputPortStyle(index)"
        @mouseenter="onPortHover('output', index)"
        @mouseleave="onPortLeave('output', index)"
      ></div>
    </div>

    <!-- 操作菜单 -->
    <div 
      v-if="showActionsMenu"
      class="node-actions-menu"
      :class="menuClasses"
      :style="menuStyle"
    >
      <button 
        v-for="action in availableActions" 
        :key="action.key"
        class="menu-item"
        :class="getActionClasses(action)"
        @click="handleAction(action)"
      >
        {{ action.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useNodeSpacing } from '../composables/useNodeSpacing'
import { useNodeStyling } from '../composables/useNodeStyling'
import { useNodePorts } from '../composables/useNodePorts'
import { useNodeActions } from '../composables/useNodeActions'

// Props定义
const props = defineProps({
  nodeData: {
    type: Object,
    required: true
  },
  nodeType: {
    type: String,
    required: true
  },
  nodeConfig: {
    type: Object,
    default: () => ({})
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  isHovered: {
    type: Boolean,
    default: false
  },
  isDisabled: {
    type: Boolean,
    default: false
  },
  isDragging: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'M', // S, M, L, XL
    validator: (value) => ['S', 'M', 'L', 'XL'].includes(value)
  },
  customStyles: {
    type: Object,
    default: () => ({})
  }
})

// Emits定义
const emit = defineEmits([
  'node-click',
  'node-dblclick',
  'node-hover',
  'node-leave',
  'port-hover',
  'port-leave',
  'action-click',
  'config-open',
  'menu-toggle'
])

// 组合式函数
const { calculateSpacing, getFibonacciSpacing } = useNodeSpacing()
const { getNodeStyles, getStateStyles, getTypographyStyles } = useNodeStyling()
const { calculatePortPositions, getPortStyles } = useNodePorts()
const { getAvailableActions, handleNodeAction } = useNodeActions()

// 状态管理
const showActionsMenu = ref(false)
const hoveredPort = ref(null)
const portHoverIndex = ref(null)

// 计算属性
const nodeClasses = computed(() => [
  `node-type-${props.nodeType}`,
  `node-size-${props.size}`,
  {
    'node-selected': props.isSelected,
    'node-hovered': props.isHovered,
    'node-disabled': props.isDisabled,
    'node-dragging': props.isDragging
  }
])

const headerClasses = computed(() => [
  'node-header',
  `header-${props.nodeType}`
])

const iconClasses = computed(() => [
  'node-icon',
  `icon-${props.nodeType}`
])

const titleClasses = computed(() => [
  'node-title',
  `title-${props.nodeType}`
])

const actionsClasses = computed(() => [
  'node-actions',
  {
    'actions-visible': showActionsMenu.value,
    'actions-hidden': !showActionsMenu.value
  }
])

const contentClasses = computed(() => [
  'node-content',
  `content-${props.nodeType}`,
  {
    'content-empty': !contentLines.value || contentLines.value.length === 0,
    'content-multiline': contentLines.value && contentLines.value.length > 1
  }
])

const portsClasses = computed(() => [
  'node-ports',
  `ports-${props.nodeType}`
])

const menuClasses = computed(() => [
  'node-actions-menu',
  `menu-${props.nodeType}`,
  {
    'menu-visible': showActionsMenu.value,
    'menu-hidden': !showActionsMenu.value
  }
])

// 基础数据计算
const iconText = computed(() => {
  const iconMap = {
    'start': 'ST',
    'crowd-split': 'CS',
    'event-split': 'ES',
    'ab-test': 'AB',
    'ai-call': 'AI',
    'sms': 'SM',
    'manual-call': 'MC',
    'wait': 'WA',
    'benefit': 'BE',
    'end': 'EN'
  }
  return iconMap[props.nodeType] || 'ND'
})

const displayTitle = computed(() => {
  return props.nodeConfig.nodeName || 
         props.nodeData.nodeName || 
         getNodeLabel(props.nodeType) || 
         '未命名节点'
})

const contentLines = computed(() => {
  return buildDisplayLines(props.nodeType, props.nodeConfig)
})

const hasInputPort = computed(() => {
  return props.nodeType !== 'start' && props.nodeType !== 'end'
})

const availableActions = computed(() => {
  return getAvailableActions(props.nodeType, props.isDisabled)
})

// 样式计算
const nodeStyles = computed(() => {
  const baseStyles = getNodeStyles(props.size)
  const stateStyles = getStateStyles({
    isSelected: props.isSelected,
    isHovered: props.isHovered,
    isDisabled: props.isDisabled,
    isDragging: props.isDragging
  })
  const typographyStyles = getTypographyStyles(props.nodeType)
  const spacingStyles = calculateSpacing(props.nodeType, contentLines.value.length)
  
  return {
    ...baseStyles,
    ...stateStyles,
    ...typographyStyles,
    ...spacingStyles,
    ...props.customStyles
  }
})

const menuStyle = computed(() => {
  // 基于黄金比例计算菜单位置
  const spacing = getFibonacciSpacing(1.618)
  return {
    top: `${spacing}px`,
    right: `${-spacing}px`
  }
})

// 端口样式计算
const inputPortClasses = computed(() => [
  'port-input',
  {
    'port-hovered': hoveredPort.value === 'input'
  }
])

const inputPortStyle = computed(() => {
  return getPortStyles('input', {
    isHovered: hoveredPort.value === 'input',
    contentLines: contentLines.value.length
  })
})

const getOutputPortClasses = (index) => [
  'port-output',
  `port-output-${index}`,
  {
    'port-hovered': hoveredPort.value === 'output' && portHoverIndex.value === index
  }
]

const getOutputPortStyle = (index) => {
  return getPortStyles('output', {
    index,
    totalLines: contentLines.value.length,
    isHovered: hoveredPort.value === 'output' && portHoverIndex.value === index,
    contentLines: contentLines.value
  })
}

// 内容行样式
const getLineClasses = (index) => [
  'content-line',
  `line-${index}`,
  {
    'line-first': index === 0,
    'line-last': index === contentLines.value.length - 1
  }
]

const getLineStyle = (index) => {
  const baseSpacing = getFibonacciSpacing(1)
  const lineHeight = getFibonacciSpacing(2.618) // 黄金比例行高
  return {
    top: `${headerHeight + baseSpacing + index * lineHeight}px`,
    height: `${lineHeight}px`
  }
}

// 动作样式
const getActionClasses = (action) => [
  'menu-item',
  `action-${action.key}`,
  {
    'action-danger': action.danger,
    'action-disabled': action.disabled
  }
]

// 辅助函数
function buildDisplayLines(nodeType, config = {}) {
  const lines = []
  
  switch (nodeType) {
    case 'start':
      if (config?.taskType) lines.push(`任务类型：${config.taskType}`)
      if (config?.targetAudience?.length) {
        lines.push(`目标人群：${config.targetAudience.join('、')}`)
      }
      break
      
    case 'crowd-split':
      {
        const layers = Array.isArray(config?.crowdLayers) ? config.crowdLayers : []
        const branches = Array.isArray(config?.branches) ? config.branches : []
        if (layers.length) {
          layers.forEach((l, i) => { const name = l?.crowdName || l?.name || `分群${i + 1}`; lines.push(name) })
          lines.push('其他')
        } else if (branches.length) {
          branches.forEach((b, i) => { const name = b?.name || `分群${i + 1}`; lines.push(name) })
          lines.push('其他')
        } else if (typeof config?.splitCount === 'number' && config.splitCount > 0) {
          for (let i = 0; i < config.splitCount; i++) lines.push(`分群${i + 1}`)
          lines.push('其他')
        }
      }
      break
      
    case 'event-split':
      {
        const typeLabel = config?.eventTypeLabel || config?.eventType || config?.customEventName || '事件'
        const timeoutVal = config?.timeout != null ? String(config.timeout) : ''
        const unit = config?.unit || '分钟'
        lines.push(`发生【${typeLabel}】`)
        if (timeoutVal) lines.push(`【${timeoutVal}${unit}】未发生事件`)
        else lines.push('【未设置超时】未发生事件')
      }
      break
      
    case 'ab-test':
      const variants = config?.branches || config?.variants || config?.versions || []
      variants.forEach((v, i) => {
        const name = v?.name || `变体${String.fromCharCode(65 + i)}`
        const pct = v?.percentage != null ? v.percentage : (v?.ratio != null ? v.ratio : '')
        lines.push(`${name}：${pct}%`)
      })
      break
      
    case 'ai-call':
      if (config?.taskId) lines.push(`触达任务ID：${config.taskId}`)
      break
      
    case 'sms':
      if (config?.smsTemplate) lines.push(`短信模板：${config.smsTemplate}`)
      break
      
    case 'manual-call':
      if (config?.configId) lines.push(`配置ID：${config.configId}`)
      if (config?.description) lines.push(`描述：${config.description}`)
      break
      
    case 'wait':
      if (config?.value != null) lines.push(`等待：${config.value}${config.unit || ''}`)
      break
      
    case 'benefit':
      if (config?.benefitName) lines.push(`权益包：${config.benefitName}`)
      break
      
    case 'end':
      // 结束节点无内容
      break
      
    default:
      if (config?.description) lines.push(config.description)
      break
  }
  
  return lines
}

function getNodeLabel(nodeType) {
  const labels = {
    'start': '开始',
    'crowd-split': '人群分流',
    'event-split': '事件分流',
    'ab-test': 'AB实验',
    'ai-call': 'AI外呼',
    'sms': '短信触达',
    'manual-call': '人工外呼',
    'wait': '等待节点',
    'benefit': '权益节点',
    'end': '结束节点'
  }
  return labels[nodeType] || '未知节点'
}

// 事件处理
function toggleActionsMenu(event) {
  event.stopPropagation()
  showActionsMenu.value = !showActionsMenu.value
  emit('menu-toggle', showActionsMenu.value)
}

function handleAction(action) {
  if (action.disabled) return
  
  handleNodeAction(action.key, {
    nodeType: props.nodeType,
    nodeData: props.nodeData,
    nodeConfig: props.nodeConfig
  })
  
  emit('action-click', action.key)
  showActionsMenu.value = false
}

function onPortHover(portType, index = null) {
  hoveredPort.value = portType
  portHoverIndex.value = index
  emit('port-hover', { portType, index })
}

function onPortLeave(portType, index = null) {
  hoveredPort.value = null
  portHoverIndex.value = null
  emit('port-leave', { portType, index })
}

// 生命周期
onMounted(() => {
  // 初始化端口位置
  calculatePortPositions(props.nodeType, contentLines.value)
})

onUnmounted(() => {
  // 清理事件监听
  showActionsMenu.value = false
})
</script>

<style lang="scss" scoped>
// 基础样式变量
$node-min-width: 240px;
$node-max-width: 480px;
$header-height: 36px;
$row-height: 32px;
$content-padding: 12px;

// 黄金比例
$golden-ratio: 1.618;
$fibonacci-small: 8px;
$fibonacci-medium: 13px;
$fibonacci-large: 21px;

// 颜色系统
$color-primary: #14B8A6;
$color-text: #111827;
$color-border: #E5E7EB;
$color-hover: #9CA3AF;
$color-selected: #4C78FF;
$color-disabled: #D1D5DB;

// 动画
$transition-duration: 300ms;
$transition-easing: cubic-bezier(0.4, 0, 0.2, 1);

.universal-node {
  position: relative;
  min-width: $node-min-width;
  max-width: $node-max-width;
  background: white;
  border: 1px solid $color-border;
  border-radius: 8px;
  overflow: hidden;
  transition: all $transition-duration $transition-easing;
  
  // 布局系统
  display: flex;
  flex-direction: column;
  
  // 交互状态
  &.node-selected {
    border-color: $color-selected;
    border-width: 2px;
    box-shadow: 0 8px 16px rgba($color-selected, 0.15);
  }
  
  &.node-hovered {
    border-color: $color-hover;
    border-width: 2px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  &.node-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    .node-header,
    .node-content {
      opacity: 0.5;
    }
  }
  
  &.node-dragging {
    opacity: 0.8;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
  
  // 尺寸变体
  &.node-size-S {
    min-width: 200px;
    max-width: 320px;
    
    .node-header {
      height: 28px;
    }
    
    .node-icon {
      width: 20px;
      height: 16px;
    }
    
    .node-title {
      font-size: 11px;
    }
    
    .content-line {
      font-size: 11px;
      height: 24px;
    }
  }
  
  &.node-size-M {
    min-width: 240px;
    max-width: 400px;
    
    .node-header {
      height: 36px;
    }
    
    .node-icon {
      width: 28px;
      height: 20px;
    }
    
    .node-title {
      font-size: 13px;
    }
    
    .content-line {
      font-size: 13px;
      height: 32px;
    }
  }
  
  &.node-size-L {
    min-width: 280px;
    max-width: 480px;
    
    .node-header {
      height: 44px;
    }
    
    .node-icon {
      width: 32px;
      height: 24px;
    }
    
    .node-title {
      font-size: 15px;
    }
    
    .content-line {
      font-size: 14px;
      height: 36px;
    }
  }
  
  &.node-size-XL {
    min-width: 320px;
    max-width: 560px;
    
    .node-header {
      height: 52px;
    }
    
    .node-icon {
      width: 36px;
      height: 28px;
    }
    
    .node-title {
      font-size: 16px;
    }
    
    .content-line {
      font-size: 15px;
      height: 40px;
    }
  }
}

.node-header {
  display: flex;
  align-items: center;
  background: #F8FAFC;
  border-bottom: 1px solid $color-border;
  padding: 0 $fibonacci-medium;
  position: relative;
  
  .node-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    background: $color-primary;
    border-radius: 6px;
    margin-right: $fibonacci-medium;
    flex-shrink: 0;
    
    .icon-text {
      color: white;
      font-size: 12px;
      font-weight: 600;
      line-height: 1;
    }
  }
  
  .node-title {
    flex: 1;
    color: $color-text;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .node-actions {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: $fibonacci-small;
    border-radius: 4px;
    transition: background-color $transition-duration $transition-easing;
    
    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    
    .action-dots {
      display: flex;
      gap: 2px;
      
      .dot {
        width: 3px;
        height: 3px;
        background: $color-text;
        border-radius: 50%;
        opacity: 0.6;
      }
    }
  }
}

.node-content {
  padding: $content-padding;
  background: white;
  min-height: 32px;
  
  &.content-empty {
    display: none;
  }
  
  .content-line {
    display: flex;
    align-items: center;
    color: $color-text;
    font-size: 13px;
    line-height: 1.4;
    min-height: 32px;
    padding: 0 $fibonacci-small;
    position: relative;
    
    &:not(:last-child) {
      margin-bottom: 2px;
    }
    
    &.line-first {
      padding-top: 4px;
    }
    
    &.line-last {
      padding-bottom: 4px;
    }
    
    .line-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
    }
  }
}

.node-ports {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  
  .port {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1.5px solid $color-selected;
    pointer-events: auto;
    cursor: crosshair;
    transition: all $transition-duration $transition-easing;
    
    &.port-input {
      left: -4px;
      background: white;
      
      &.port-hovered {
        transform: scale(1.2);
        box-shadow: 0 0 0 4px rgba($color-selected, 0.2);
      }
    }
    
    &.port-output {
      right: -4px;
      background: $color-selected;
      
      &.port-hovered {
        transform: scale(1.2);
        box-shadow: 0 0 0 4px rgba($color-selected, 0.2);
      }
    }
  }
}

.node-actions-menu {
  position: absolute;
  background: white;
  border: 1px solid $color-border;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 120px;
  z-index: 1000;
  
  &.menu-hidden {
    display: none;
  }
  
  .menu-item {
    display: block;
    width: 100%;
    padding: 8px 12px;
    background: none;
    border: none;
    text-align: left;
    color: $color-text;
    font-size: 13px;
    cursor: pointer;
    transition: all $transition-duration $transition-easing;
    
    &:hover {
      background: #F3F4F6;
    }
    
    &.action-danger {
      color: #DC2626;
      
      &:hover {
        background: #FEE2E2;
      }
    }
    
    &.action-disabled {
      color: $color-disabled;
      cursor: not-allowed;
      
      &:hover {
        background: none;
      }
    }
  }
}

// 节点类型特定样式
@each $type in start, crowd-split, event-split, ab-test, ai-call, sms, manual-call, wait, benefit, end {
  .node-type-#{$type} {
    // 可以在这里添加特定类型的样式
  }
}

// 响应式布局
@media (max-width: 1280px) {
  .universal-node {
    min-width: 200px;
    max-width: 320px;
  }
}

@media (min-width: 1920px) {
  .universal-node {
    min-width: 280px;
    max-width: 480px;
  }
}

// CSS容器查询支持
@container (max-width: 300px) {
  .universal-node {
    .node-title {
      font-size: 11px;
    }
    
    .content-line {
      font-size: 11px;
    }
  }
}

@container (min-width: 400px) {
  .universal-node {
    .node-title {
      font-size: clamp(13px, 2vw, 16px);
    }
    
    .content-line {
      font-size: clamp(13px, 1.5vw, 14px);
    }
  }
}
</style>
