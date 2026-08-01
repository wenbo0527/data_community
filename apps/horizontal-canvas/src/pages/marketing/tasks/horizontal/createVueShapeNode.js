import { NODE_DIMENSIONS, TYPOGRAPHY } from './styles/nodeStyles.js'
import { createHorizontalPortConfig } from './utils/portConfigFactoryHorizontal.js'
import { getNodeLabel } from '@/utils/nodeTypes.js'
import HorizontalNode from './HorizontalNode.vue'

export function buildDisplayLines(nodeType, config = {}) {
  const lines = []
  if (nodeType === 'start') {
    if (config?.taskType) lines.push(`任务类型：${config.taskType}`)
    if (Array.isArray(config?.targetAudience) && config.targetAudience.length) lines.push(`目标人群：${config.targetAudience.join('、')}`)
    if (Array.isArray(config?.products) && config.products.length) {
      const PRODUCT_LABEL = { sudai: '苏贷', jd_low_interest: '京东大额低息', meituan_low_interest: '美团大额低息' }
      const names = config.products.map(p => PRODUCT_LABEL[p] || p).filter(Boolean)
      if (names.length) lines.push(`产品：${names.join('、')}`)
    }
  } else if (nodeType === 'crowd-split' || nodeType === 'audience-split') {
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
  } else if (nodeType === 'event-split') {
    const timeoutVal = config?.timeout != null ? String(config.timeout) : ''
    const timeoutUnit = config?.unit || '分钟'
    // 仅展示分支：按顺序匹配命中第一即落入；miss 分支的触发条件=超时未发生
    const branches = Array.isArray(config?.branches) ? config.branches : []
    branches.forEach(b => {
      const isMiss = b.type === 'miss'
      const unconditional = Boolean(b.unconditional)
      const label = b.name || b.label || (isMiss ? '否' : (unconditional ? '发生事件' : ''))
      const eventTag = isMiss ? '' : (b.eventTypeLabel || b.customEventName || b.eventType || '')
      if (isMiss) {
        if (timeoutVal) {
          lines.push(`↳ ${timeoutVal}${timeoutUnit}未发生 → ${label}`)
        } else {
          lines.push(`↳ 未设置超时未发生 → ${label}`)
        }
        return
      }
      const eventPrefix = eventTag ? `【${eventTag}】` : '【未选事件】'
      if (unconditional) {
        lines.push(`↳ ${eventPrefix}${label}: 无条件`)
        return
      }
      const conds = Array.isArray(b.conditions) ? b.conditions.filter(c => c && (c.field || c.value)) : []
      if (!conds.length) {
        lines.push(`↳ ${eventPrefix}${label}`)
        return
      }
      const condTexts = conds.map(c => {
        const opLabel = c.operatorLabel || ({ eq: '=', neq: '≠', contains: '包含', gt: '>', lt: '<', in: '属于', not_in: '不属于' }[c.operator] || c.operator)
        const field = c.field || '属性'
        const value = c.value != null ? String(c.value) : ''
        return `${field} ${opLabel} ${value}`
      })
      lines.push(`↳ ${eventPrefix}${label}: ${condTexts.join(' AND ')}`)
    })
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
    if (config?.value) lines.push(`等待：${config.value}${config.unit || ''}`)
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
  const rowGapHeight= (Math.max(1, rows.length) -1) * NODE_DIMENSIONS.ROW_GAP
  const width = NODE_DIMENSIONS.WIDTH
  const height = Math.max(NODE_DIMENSIONS.MIN_HEIGHT, headerHeight + contentPadding + rowGapHeight + Math.max(1, rows.length) * rowHeight)
  const componentData = { id, nodeType, headerTitle, displayLines: rows, disabled: data?.disabled || false, selected: false, hover: false, config: { ...data?.config, displayLines: rows } }
  const isStart = nodeType === 'start'
  const hasConfigLines = rows.length > 0
  const computedOutCount = isStart ? 1 : (hasConfigLines ? rows.length : 1)
  const outIds = isStart 
    ? ['out-0'] 
    : Array.from({ length: Math.max(1, rows.length || 1) }, (_, i) => `out-${i}`)
  // 复制节点偏移：避免新节点的头部菜单落在当前鼠标位置
  let nx = x
  let ny = y
  try { if (typeof id === 'string' && id.includes('-copy-')) { nx = x + 160; ny = y + 200 } } catch {}
  return {
    id, x: nx, y: ny, width, height,
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
      // contentStart: headerHeight + contentPadding,
      // contentEnd: headerHeight + contentPadding + Math.max(1, (hasConfigLines ? rows.length : 1)) * rowHeight ,
      contentStart: headerHeight + (contentPadding / 2),
      contentEnd: headerHeight +  (contentPadding / 2) + rowGapHeight + Math.max(1, (hasConfigLines ? rows.length : 1)) * rowHeight,
      contentLines: hasConfigLines ? rows : null,
      enableValidation: hasConfigLines
    }),
    zIndex: 10
  }
}
/*
用途：节点视图规格工厂（横版 Vue Shape）
说明：根据节点类型与配置生成渲染规格（尺寸/端口/显示行），与 `HorizontalNode.vue` 配合；端口按内容行中点对齐。
边界：不做持久化；类型显示行按业务规则生成；起始节点仅出端口、结束节点无出端口。
*/
