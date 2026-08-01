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
    :data-node-id="id"
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
        :title="text"
      >
        <span class="port-indicator__label" >{{ text }}</span>
      </div>
    </div>
  </BaseNode>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BaseNode from '@/components/nodes/BaseNode.vue'
import { getNodeLabel } from '@/utils/nodeTypes.js'
import { buildDisplayLines } from './createVueShapeNode.js'
import { NODE_DIMENSIONS } from './styles/nodeStyles.js'
import * as ArcoIcons from '@arco-design/web-vue/es/icon'

const props = defineProps({ node: { type: Object, required: true }, graph: { type: Object, default: null } })
const hasError = computed(() => false)
const errorMessage = computed(() => '')
const nodeDataRef = ref(props.node?.getData?.() || {})
const nodeData = computed(() => nodeDataRef.value)
const id = computed(() => props.node?.id || '')
const nodeType = computed(() => nodeData.value?.nodeType || nodeData.value?.type || '')
const config = computed(() => nodeData.value?.config || {})
const selected = computed(() => nodeData.value?.selected || false)
const hover = computed(() => nodeData.value?.hover || false)
const disabled = computed(() => nodeData.value?.disabled || false)

const ICON_NAME_MAP = { 'crowd-split': 'IconUserGroup', 'event-split': 'IconThunderbolt', 'ab-test': 'IconExperiment', 'wait': 'IconClockCircle', 'end': 'IconPoweroff', 'sms': 'IconMessage', 'ai-call': 'IconPhone', 'manual-call': 'IconUserAdd', 'benefit': 'IconGift' }
const nodeIconComponent = computed(() => { const iconName = ICON_NAME_MAP[nodeType.value] || 'IconApps'; return ArcoIcons[iconName] || ArcoIcons.IconApps })
const iconText = computed(() => getNodeIconText(nodeType.value))
const headerTitle = computed(() => config.value?.nodeName || getNodeLabel(nodeType.value) || '节点')
const rawLinesCount = computed(() => Array.isArray(config.value?.displayLines) ? config.value.displayLines.length : 0)
const contentHeight = computed(() => { const isStart = nodeType.value === 'start'; const rowsCount = Array.isArray(outRows.value) ? outRows.value.length : 0; const baseCount = isStart ? Math.max(1, rawLinesCount.value) : Math.max(1, rowsCount); return baseCount * NODE_DIMENSIONS.ROW_HEIGHT })
const contentContainerStyle = computed(() => ({ position: 'relative', height:'100%', padding: '0px', gap: NODE_DIMENSIONS.ROW_GAP+'px' }))
function rowEvenStyle(idx) {
  const isStart = nodeType.value === 'start'
  if (isStart) {
    return {
      // position: 'absolute',
      // top: '0px',
      height: contentHeight.value + 'px',
      lineHeight: '20px',
      whiteSpace: 'pre-line',
      // left: '0',
      // right: '0',
    }
  }
  const n = Array.isArray(outRows.value) ? outRows.value.length : 0
  const contentH = contentHeight.value
  const step = n > 0 ? contentH / n : NODE_DIMENSIONS.ROW_HEIGHT
  const centerY = (idx + 0.5) * step
  const top = Math.max(0, Math.round(centerY - NODE_DIMENSIONS.ROW_HEIGHT / 2))
  return {
    // position: 'absolute',
    // top: top + 'px',
    height: NODE_DIMENSIONS.ROW_HEIGHT + 'px',
    lineHeight: NODE_DIMENSIONS.ROW_HEIGHT + 'px',
    // left: '0',
    // right: '0'
  }
}
const outRows = computed(() => {
  if (config.value?.displayLines?.length) {
    const labelFallback = getNodeLabel(nodeType.value) || '节点'
    if (config.value.displayLines.length === 1 && config.value.displayLines[0] === labelFallback) return []
    return config.value.displayLines
  }
  const topLevelLines = nodeData.value?.displayLines
  if (Array.isArray(topLevelLines) && topLevelLines.length) {
    const labelFallback = getNodeLabel(nodeType.value) || '节点'
    if (topLevelLines.length === 1 && topLevelLines[0] === labelFallback) return []
    return topLevelLines
  }
  const lines = buildDisplayLines(nodeType.value, config.value || {})
  const labelFallback = getNodeLabel(nodeType.value) || '节点'
  if (lines.length === 1 && lines[0] === labelFallback) return []
  return lines
})

onMounted(() => {
  if (props.node) {
    props.node.on('change:data', ({ current }) => {
      nodeDataRef.value = current || props.node?.getData?.() || {}
    })
  }
})
</script>

<style scoped>
.horizontal-node__content {
  /* display: block; */
  display: flex;
  flex-direction: column;
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
  box-sizing: border-box;
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
.ab-test__experiment {
  position: absolute;
  top: 2px;
  left: 8px;
  font-size: 11px;
  line-height: 16px;
  color: #334155;
  background: rgba(241, 245, 249, 0.9);
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0 6px;
  pointer-events: none;
}
