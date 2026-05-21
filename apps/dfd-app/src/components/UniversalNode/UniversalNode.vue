<template>
  <div
    :class="[
      'universal-node',
      `node-type--${nodeType}`,
      `node-state--${nodeState}`,
      `node-size--${nodeSize}`,
      {
        'node--selected': isSelected,
        'node--disabled': isDisabled,
        'node--dragging': isDragging,
      }
    ]"
    :style="nodeStyles"
    @click="handleNodeClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 节点头部 -->
    <div class="node-header" :style="headerStyles">
      <div class="node-icon" v-if="showIcon">
        <component :is="iconComponent" :size="iconSize" />
      </div>
      <div class="node-title" :style="titleStyles">
        {{ title }}
      </div>
      <div class="node-actions" v-if="showActions">
        <button
          v-for="action in actions"
          :key="action.name"
          class="node-action-btn"
          @click.stop="handleActionClick(action)"
        >
          <component :is="action.icon" :size="16" />
        </button>
      </div>
    </div>

    <!-- 节点内容区 -->
    <div class="node-content" :style="contentStyles">
      <!-- 输入端口区 -->
      <div class="node-ports node-ports--input" v-if="inputPorts.length">
        <div
          v-for="(port, index) in inputPorts"
          :key="`input-${index}`"
          class="node-port node-port--input"
          :class="[`port-type--${port.type}`, `port-state--${port.state}`]"
          :style="getPortStyles(port, 'input')"
          @click.stop="handlePortClick(port, 'input')"
          @mouseenter="handlePortMouseEnter(port, 'input')"
          @mouseleave="handlePortMouseLeave(port, 'input')"
        >
          <div class="port-indicator"></div>
          <div class="port-label" v-if="port.label">{{ port.label }}</div>
        </div>
      </div>

      <!-- 主要内容区 -->
      <div class="node-main-content">
        <div class="node-description" v-if="description">
          {{ description }}
        </div>
        <div class="node-params" v-if="params.length">
          <div
            v-for="(param, index) in params"
            :key="`param-${index}`"
            class="node-param"
            :class="[`param-type--${param.type}`]"
          >
            <label class="param-label">{{ param.label }}</label>
            <div class="param-value">{{ param.value }}</div>
          </div>
        </div>
      </div>

      <!-- 输出端口区 -->
      <div class="node-ports node-ports--output" v-if="outputPorts.length">
        <div
          v-for="(port, index) in outputPorts"
          :key="`output-${index}`"
          class="node-port node-port--output"
          :class="[`port-type--${port.type}`, `port-state--${port.state}`]"
          :style="getPortStyles(port, 'output')"
          @click.stop="handlePortClick(port, 'output')"
          @mouseenter="handlePortMouseEnter(port, 'output')"
          @mouseleave="handlePortMouseLeave(port, 'output')"
        >
          <div class="port-label" v-if="port.label">{{ port.label }}</div>
          <div class="port-indicator"></div>
        </div>
      </div>
    </div>

    <!-- 节点状态指示器 -->
    <div class="node-status" v-if="showStatus">
      <div class="status-indicator" :class="`status--${status}`"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import type { Component } from 'vue'
import { useNodeSpacing } from './composables/useNodeSpacing'
import { useNodeStyles } from './composables/useNodeStyles'
import { useNodeResponsive } from './composables/useNodeResponsive'

// 类型定义
interface NodePort {
  id: string
  type: 'data' | 'control' | 'flow' | 'custom'
  state: 'default' | 'active' | 'hover' | 'disabled' | 'connected'
  label?: string
  position?: { x: number; y: number }
}

interface NodeParam {
  label: string
  value: string | number
  type: 'text' | 'number' | 'boolean' | 'select'
}

interface NodeAction {
  name: string
  icon: Component
  handler: () => void
}

// 组件Props定义
interface Props {
  // 基础属性
  nodeType: string
  nodeState?: 'default' | 'active' | 'hover' | 'disabled' | 'selected' | 'dragging' | 'error' | 'warning'
  nodeSize?: 'S' | 'M' | 'L' | 'XL'
  title: string
  description?: string
  
  // 样式属性
  width?: number
  minWidth?: number
  maxWidth?: number
  
  // 端口配置
  inputPorts?: NodePort[]
  outputPorts?: NodePort[]
  
  // 参数配置
  params?: NodeParam[]
  
  // 图标配置
  icon?: Component
  showIcon?: boolean
  
  // 动作配置
  actions?: NodeAction[]
  showActions?: boolean
  
  // 状态配置
  status?: 'idle' | 'running' | 'success' | 'error' | 'warning'
  showStatus?: boolean
  
  // 交互状态
  isSelected?: boolean
  isDisabled?: boolean
  isDragging?: boolean
  
  // 自定义样式
  customStyles?: Record<string, any>
}

// Props默认值
const props = withDefaults(defineProps<Props>(), {
  nodeState: 'default',
  nodeSize: 'M',
  minWidth: 240,
  maxWidth: 480,
  inputPorts: () => [],
  outputPorts: () => [],
  params: () => [],
  showIcon: true,
  showActions: false,
  showStatus: true,
  isSelected: false,
  isDisabled: false,
  isDragging: false,
  customStyles: () => ({})
})

// 事件定义
const emit = defineEmits<{
  nodeClick: [event: MouseEvent]
  nodeHover: [hovering: boolean]
  portClick: [port: NodePort, type: 'input' | 'output', event: MouseEvent]
  portHover: [port: NodePort, type: 'input' | 'output', hovering: boolean]
  actionClick: [action: NodeAction, event: MouseEvent]
}>()

// 解构props
const { 
  nodeType, 
  nodeState, 
  nodeSize, 
  width, 
  minWidth, 
  maxWidth,
  inputPorts,
  outputPorts,
  customStyles 
} = toRefs(props)

// 组合式函数
const { calculateSpacing } = useNodeSpacing()
const { getNodeStyles, getPortStyles: getPortBaseStyles } = useNodeStyles()
const { getResponsiveStyles } = useNodeResponsive()

// 响应式计算属性
const iconSize = computed(() => {
  const sizeMap = { S: 16, M: 20, L: 24, XL: 28 }
  return sizeMap[nodeSize.value]
})

const iconComponent = computed(() => props.icon)

// 样式计算
const nodeStyles = computed(() => {
  const baseStyles = getNodeStyles(nodeType.value, nodeState.value, nodeSize.value)
  const responsiveStyles = getResponsiveStyles()
  const spacingStyles = calculateSpacing(nodeSize.value)
  
  return {
    ...baseStyles,
    ...responsiveStyles,
    ...spacingStyles,
    ...customStyles.value,
    minWidth: `${minWidth.value}px`,
    maxWidth: `${maxWidth.value}px`,
    width: width.value ? `${width.value}px` : undefined
  }
})

const headerStyles = computed(() => ({
  padding: calculateSpacing(nodeSize.value).headerPadding
}))

const titleStyles = computed(() => ({
  fontSize: getResponsiveStyles().titleFontSize,
  lineHeight: getResponsiveStyles().titleLineHeight
}))

const contentStyles = computed(() => ({
  padding: calculateSpacing(nodeSize.value).contentPadding,
  gap: calculateSpacing(nodeSize.value).contentGap
}))

// 端口样式计算
const getPortStyles = (port: NodePort, type: 'input' | 'output') => {
  const baseStyles = getPortBaseStyles(port.type, port.state)
  const spacingStyles = calculateSpacing(nodeSize.value)
  
  return {
    ...baseStyles,
    margin: spacingStyles.portMargin,
    minHeight: spacingStyles.portMinHeight
  }
}

// 事件处理函数
const handleNodeClick = (event: MouseEvent) => {
  if (!props.isDisabled) {
    emit('nodeClick', event)
  }
}

const handleMouseEnter = () => {
  if (!props.isDisabled) {
    emit('nodeHover', true)
  }
}

const handleMouseLeave = () => {
  if (!props.isDisabled) {
    emit('nodeHover', false)
  }
}

const handlePortClick = (port: NodePort, type: 'input' | 'output', event: MouseEvent) => {
  if (port.state !== 'disabled') {
    emit('portClick', port, type, event)
  }
}

const handlePortMouseEnter = (port: NodePort, type: 'input' | 'output') => {
  if (port.state !== 'disabled') {
    emit('portHover', port, type, true)
  }
}

const handlePortMouseLeave = (port: NodePort, type: 'input' | 'output') => {
  if (port.state !== 'disabled') {
    emit('portHover', port, type, false)
  }
}

const handleActionClick = (action: NodeAction, event: MouseEvent) => {
  emit('actionClick', action, event)
  action.handler()
}
</script>

<style lang="scss" scoped>
// 基础样式将在单独的SCSS文件中定义
@import './styles/universal-node';
</style>