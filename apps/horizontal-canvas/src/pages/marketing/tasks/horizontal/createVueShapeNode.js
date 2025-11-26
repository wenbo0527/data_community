import { NODE_DIMENSIONS, TYPOGRAPHY } from './styles/nodeStyles.js'
import { createHorizontalPortConfig } from './utils/portConfigFactoryHorizontal.js'
import { getNodeLabel } from '@/utils/nodeTypes.js'
import HorizontalNode from './HorizontalNode.vue'

export function buildDisplayLines(nodeType, config = {}) {
  const lines = []
  if (nodeType === 'start') {
    if (config?.taskType) lines.push(`任务类型：${config.taskType}`)
    if (Array.isArray(config?.targetAudience) && config.targetAudience.length) lines.push(`目标人群：${config.targetAudience.join('、')}`)
  } else if (nodeType === 'crowd-split' || nodeType === 'audience-split') {
    const layers = Array.isArray(config?.crowdLayers) ? config.crowdLayers : []
    if (layers.length) {
      layers.forEach(l => { const name = l?.crowdName || l?.name || '分流'; lines.push(`命中：${name}`) })
      const un = config?.unmatchBranch?.name || '未命中人群'; lines.push(`否则：${un}`)
    } else if (typeof config?.splitCount === 'number' && config.splitCount > 0) {
      for (let i = 0; i < config.splitCount; i++) lines.push(`命中：分流${i + 1}`)
      lines.push('否则：未命中人群')
    } else if (Array.isArray(config?.branches) && config.branches.length) {
      config.branches.forEach((b, i) => { const name = b?.name || `分流${i + 1}`; lines.push(`命中：${name}`) })
      lines.push('否则：未命中人群')
    }
  } else if (nodeType === 'event-split') {
    const firstEventName = Array.isArray(config?.events) && config.events.length ? (config.events[0]?.name || '事件') : (config?.eventName || '事件')
    const timeout = config?.timeout != null ? String(config.timeout) : ''
    lines.push(`命中：${firstEventName}`)
    if (timeout) {
      lines.push(`等待 ${timeout} 分钟未命中`)
    } else {
      lines.push('未命中')
    }
  } else if (nodeType === 'ab-test') {
    const branches = Array.isArray(config?.branches) ? config.branches : []
    const variants = Array.isArray(config?.variants) ? config.variants : []
    const versions = Array.isArray(config?.versions) ? config.versions : []
    const merged = branches.length ? branches : (variants.length ? variants : versions)
    merged.forEach((b, i) => { const name = b?.name || `变体${String.fromCharCode(65 + i)}`; const pct = b?.percentage != null ? b.percentage : (b?.ratio != null ? b.ratio : ''); lines.push(`${name}：${pct}%`) })
  } else if (nodeType === 'ai-call') {
    if (config?.taskId) lines.push(`触达任务ID：${config.taskId}`)
  } else if (nodeType === 'sms') {
    if (config?.smsTemplate) lines.push(`短信模板：${config.smsTemplate}`)
  } else if (nodeType === 'manual-call') {
    if (config?.configId) lines.push(`配置ID：${config.configId}`)
    if (config?.description) lines.push(config.description)
  } else if (nodeType === 'wait') {
    if (config?.value) lines.push(`等待：${config.value} ${config.unit || ''}`)
  } else if (nodeType === 'benefit') {
    if (config?.benefitName) lines.push(`权益包名称：${config.benefitName}`)
  }
  return lines.length ? lines : [getNodeLabel(nodeType) || '节点']
}

export function createVueShapeNode({ id, x, y, label, data = {}, portsOptions = {}, outCount: outCountParam = null }) {
  const nodeType = data?.nodeType || data?.type
  const cfg = data?.config || {}
  const rowsRaw = buildDisplayLines(nodeType, cfg)
  const labelFallback = getNodeLabel(nodeType) || '节点'
  const rows = (rowsRaw.length === 1 && rowsRaw[0] === labelFallback) ? [] : rowsRaw
  const headerTitle = (cfg?.nodeName) || getNodeLabel(nodeType) || label || '节点'

  const headerHeight = NODE_DIMENSIONS.HEADER_HEIGHT
  const rowHeight = NODE_DIMENSIONS.ROW_HEIGHT
  const contentPadding = NODE_DIMENSIONS.CONTENT_PADDING
  const width = NODE_DIMENSIONS.WIDTH
  const height = Math.max(NODE_DIMENSIONS.MIN_HEIGHT, headerHeight + contentPadding + Math.max(1, rows.length) * rowHeight + 12)

  const componentData = { id, nodeType, headerTitle, displayLines: rows, disabled: data?.disabled || false, selected: false, hover: false, config: { ...data?.config, displayLines: rows } }
  const isStart = nodeType === 'start'
  const hasConfigLines = rows.length > 0
  const computedOutCount = isStart ? 1 : (hasConfigLines ? rows.length : 1)
  const outIds = isStart 
    ? ['out-0'] 
    : Array.from({ length: Math.max(1, rows.length || 1) }, (_, i) => `out-${i}`)
  return {
    id, x, y, width, height,
    shape: 'horizontal-node',
    data: { ...data, ...componentData },
    ports: createHorizontalPortConfig(computedOutCount, {
      includeIn: nodeType !== 'start',
      includeOut: nodeType !== 'end',
      outIds,
      verticalOffsets: null,
      evenDistribution: true,
      nodeHeight: height,
      nodeWidth: width,
      contentStart: headerHeight + contentPadding,
      contentEnd: headerHeight + contentPadding + Math.max(1, (hasConfigLines ? rows.length : 1)) * rowHeight,
      contentLines: hasConfigLines ? rows : null,
      enableValidation: hasConfigLines
    }),
    zIndex: 1
  }
}
