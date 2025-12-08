<template>
  <div v-if="hasError" class="node-error">
    节点渲染错误: {{ errorMessage }}
  </div>
  <BaseNode
    v-else
    :node-type="nodeType"
    :title="headerTitle"
    :selected="selected"
    :hover="hover"
    :disabled="disabled"
  >
    <template #icon>
      <component 
        :is="nodeIconComponent" 
        class="arco-icon arco-icon--node"
        :style="{ 
          fontSize: '16px',
          color: 'inherit'
        }"
      />
    </template>
    <template #title>{{ headerTitle }}</template>

    <!-- 内容区：纯展示，端口由X6系统管理 -->
    <div class="horizontal-node__content" :style="contentContainerStyle">
      <!-- 输出端口指示器（每行内容对应一个） -->
      <div 
        v-for="(text, idx) in outRows" 
        :key="idx"
        class="port-indicator port-indicator--out"
        :style="rowEvenStyle(idx)"
        :data-row="idx"
        :data-text="text"
      >
        <span class="port-indicator__label">{{ text }}</span>
      </div>
    </div>
  </BaseNode>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import BaseNode from '@/components/nodes/BaseNode.vue'
import { getNodeLabel } from '@/utils/nodeTypes.js'
import { buildDisplayLines } from './createVueShapeNode.js'
import { NODE_DIMENSIONS } from './styles/nodeStyles.js'
import * as ArcoIcons from '@arco-design/web-vue/es/icon'

// X6 vue-shape系统传递的props
const props = defineProps({
  node: { type: Object, required: true },
  graph: { type: Object, default: null }
})

console.log('🚀 [HorizontalNode] 组件初始化:', {
  hasNode: !!props.node,
  nodeId: props.node?.id,
  hasGraph: !!props.graph,
  timestamp: Date.now()
})

const hasError = computed(() => false)
const errorMessage = computed(() => '')

// 从节点数据中提取所需信息
const nodeDataRef = ref(props.node?.getData?.() || {})
const nodeData = computed(() => nodeDataRef.value)

// 基础属性计算
const id = computed(() => props.node?.id || '')
const nodeType = computed(() => nodeData.value?.nodeType || nodeData.value?.type || '')
const config = computed(() => nodeData.value?.config || {})
const selected = computed(() => nodeData.value?.selected || false)
const hover = computed(() => nodeData.value?.hover || false)
const disabled = computed(() => nodeData.value?.disabled || false)

// Arco Design 图标映射 - 与节点选择器保持一致
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

// 获取节点图标组件
const nodeIconComponent = computed(() => {
  const iconName = ICON_NAME_MAP[nodeType.value] || 'IconApps'
  return ArcoIcons[iconName] || ArcoIcons.IconApps
})

// 显示属性计算
const iconText = computed(() => getNodeIconText(nodeType.value))
const headerTitle = computed(() => {
  const title = config.value?.nodeName || getNodeLabel(nodeType.value) || '节点'
  console.log('📝 [HorizontalNode] 标题计算:', {
    configNodeName: config.value?.nodeName,
    nodeType: nodeType.value,
    getNodeLabel: getNodeLabel(nodeType.value),
    finalTitle: title,
    config: config.value
  })
  return title
})

const rawLinesCount = computed(() => Array.isArray(config.value?.displayLines) ? config.value.displayLines.length : 0)
const contentHeight = computed(() => {
  const isStart = nodeType.value === 'start'
  const rowsCount = Array.isArray(outRows.value) ? outRows.value.length : 0
  const baseCount = isStart ? Math.max(1, rawLinesCount.value) : Math.max(1, rowsCount)
  const gap = NODE_DIMENSIONS.ROW_GAP || 0
  return baseCount * NODE_DIMENSIONS.ROW_HEIGHT + Math.max(0, baseCount - 1) * gap
})

const contentContainerStyle = computed(() => ({
  position: 'relative',
  height: contentHeight.value + 'px',
  paddingTop: '0px',
  paddingRight: '12px',
  paddingBottom: '0px',
  paddingLeft: '12px',
  gap: '0px'
}))

function rowEvenStyle(idx) {
  const isStart = nodeType.value === 'start'
  const gap = NODE_DIMENSIONS.ROW_GAP || 0
  if (isStart) {
    return { position: 'absolute', top: '0px', height: contentHeight.value + 'px', lineHeight: '20px', whiteSpace: 'pre-line', left: '0', right: '0' }
  }
  const top = idx * (NODE_DIMENSIONS.ROW_HEIGHT + gap)
  return { position: 'absolute', top: top + 'px', height: NODE_DIMENSIONS.ROW_HEIGHT + 'px', lineHeight: NODE_DIMENSIONS.ROW_HEIGHT + 'px', left: '0', right: '0' }
}

// 监听节点数据变化，确保组件响应更新
watch(() => props.node, (newNode, oldNode) => {
  console.log('👀 [HorizontalNode] 节点实例变化:', {
    newNodeId: newNode?.id,
    oldNodeId: oldNode?.id,
    hasNewNode: !!newNode,
    hasOldNode: !!oldNode
  })
}, { immediate: true })

// 🔧 X6 vue-shape系统：监听节点数据变化事件
onMounted(() => {
  if (props.node) {
    console.log('🔧 [HorizontalNode] 注册数据变化监听器')
    
    // 监听X6节点的数据变化事件
    props.node.on('change:data', ({ current, previous }) => {
      console.log('🔧 [HorizontalNode] 接收到change:data事件:', {
        nodeId: props.node?.id,
        current: current,
        previous: previous,
        currentDisplayLines: current?.config?.displayLines,
        previousDisplayLines: previous?.config?.displayLines,
        timestamp: Date.now()
      })
      nodeDataRef.value = current || props.node?.getData?.() || {}
    })
    
    // 监听X6节点的props变化事件
    props.node.on('change:props', ({ current, previous }) => {
      console.log('🔧 [HorizontalNode] 接收到change:props事件:', {
        nodeId: props.node?.id,
        current: current,
        previous: previous,
        timestamp: Date.now()
      })
    })
  }
})

const lastOutRowsSig = ref('')
const lastOutRowsLogTime = ref(0)
watch(outRows, (newRows) => {
  const sig = JSON.stringify(newRows)
  const now = Date.now()
  if (
    newRows.length > 0 &&
    sig !== lastOutRowsSig.value &&
    now - lastOutRowsLogTime.value > 500
  ) {
    lastOutRowsSig.value = sig
    lastOutRowsLogTime.value = now
  }
}, { immediate: false })

onMounted(() => {
  console.log('✅ [HorizontalNode] 组件挂载完成:', {
    nodeId: props.node?.id,
    initialData: props.node?.getData?.(),
    timestamp: Date.now(),
    componentReady: true
  })
  
  // 延迟检查DOM元素和内容行，确保计算属性已初始化
  setTimeout(() => {
    const element = document.querySelector(`[data-node-id="${props.node?.id}"]`)
    const contentElements = element?.querySelectorAll('.port-indicator')
    console.log('🔍 [HorizontalNode] DOM检查:', {
      nodeId: props.node?.id,
      elementFound: !!element,
      contentElementsCount: contentElements?.length || 0,
      timestamp: Date.now()
    })
    
    // 延迟访问outRows，确保计算属性已初始化
  setTimeout(() => {
      if (outRows.value.length > 0) {
        void 0
      }
    }, 0)
  }, 100)
})

onUnmounted(() => {
  console.log('❌ [HorizontalNode] 组件卸载:', {
    nodeId: props.node?.id
  })
})

// 由 buildDisplayLines 提供的分支文字数组
const outRows = computed(() => {
  if (config.value?.displayLines?.length) {
    const labelFallback = getNodeLabel(nodeType.value) || '节点'
    if (config.value.displayLines.length === 1 && config.value.displayLines[0] === labelFallback) {
      return []
    }
    if (nodeType.value === 'start') {
      return [config.value.displayLines.join('\n')]
    }
    return config.value.displayLines
  }
  const topLevelLines = nodeData.value?.displayLines
  if (Array.isArray(topLevelLines) && topLevelLines.length) {
    const labelFallback = getNodeLabel(nodeType.value) || '节点'
    if (topLevelLines.length === 1 && topLevelLines[0] === labelFallback) {
      return []
    }
    return topLevelLines
  }
  const lines = buildDisplayLines(nodeType.value, config.value || {})
  const labelFallback = getNodeLabel(nodeType.value) || '节点'
  if (lines.length === 1 && lines[0] === labelFallback) {
    return []
  }
  return lines
})
</script>

<style scoped>
.horizontal-node__content {
  display: block;
}

/* 🎨 参考图片风格 - 极简现代设计系统 */
.port-indicator {
  display: flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  position: relative;
  line-height: 1.4;
  text-align: left;
  font-weight: 400;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

/* 输入端口 - 极简灰白色调 */
.port-indicator--in {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  color: #475569;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 1px 2px rgba(0, 0, 0, 0.03);
}

/* 输出端口 - 浅灰白色调，轻微温暖感 */
.port-indicator--out {
  background: linear-gradient(135deg, #fefefe 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  color: #475569;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 1px 2px rgba(0, 0, 0, 0.03);
}

/* 标签文字 - 参考图片风格 */
.port-indicator__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  line-height: 1.3;
  font-weight: 400;
  color: #334155;
  letter-spacing: 0.005em;
}

/* 输入标签 - 中灰色 */
.port-indicator--in .port-indicator__label {
  color: #64748b;
}

/* 输出标签 - 深灰色 */
.port-indicator--out .port-indicator__label {
  color: #475569;
}

/* 悬停效果 - 轻微提升 */
.port-indicator:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.port-indicator--in:hover {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-color: #cbd5e1;
}

.port-indicator--out:hover {
  background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
  border-color: #cbd5e1;
}

/* 图标样式 - 小型化简洁设计 */
.node-icon {
  font-size: 12px;
  color: #64748b;
  margin-right: 4px;
  filter: none;
  opacity: 0.8;
}

.port-indicator--in .node-icon {
  color: #94a3b8;
}

.port-indicator--out .node-icon {
  color: #64748b;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .port-indicator {
    padding: 3px 10px;
    font-size: 12px;
  }
  
  .port-indicator__label {
    font-size: 11px;
  }
  
  .node-icon {
    font-size: 11px;
    margin-right: 3px;
  }
}
</style>
