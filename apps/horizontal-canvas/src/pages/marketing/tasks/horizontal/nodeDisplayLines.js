import { getNodeLabel } from '@/utils/nodeTypes.js'

const PRODUCT_LABEL = { sudai: '苏贷', jd_low_interest: '京东大额低息', meituan_low_interest: '美团大额低息' }

const OPERATOR_DISPLAY = { eq: '=', neq: '≠', contains: '包含', gt: '>', lt: '<', in: '属于', not_in: '不属于' }

/**
 * 构建节点内容行（body 区域）
 * 入参：nodeType(string)、config(对象)
 * 返回：字符串数组；空内容时返回 [类型标签]
 * 边界：按节点类型分别组织显示行；AB 实验支持 branches/variants/versions 三种存储格式；事件分流按分支顺序匹配。
 */
export function buildDisplayLines(nodeType, config = {}) {
  const lines = []
  if (nodeType === 'start') {
    if (config?.taskType) lines.push(`任务类型：${config.taskType}`)
    if (Array.isArray(config?.targetAudience) && config.targetAudience.length) lines.push(`目标人群：${config.targetAudience.join('、')}`)
    if (Array.isArray(config?.products) && config.products.length) {
      const names = config.products.map(p => PRODUCT_LABEL[p] || p).filter(Boolean)
      if (names.length) lines.push(`产品：${names.join('、')}`)
    }
  } else if (nodeType === 'crowd-split' || nodeType === 'audience-split') {
    appendCrowdSplitLines(lines, config)
  } else if (nodeType === 'event-split') {
    appendEventSplitLines(lines, config)
  } else if (nodeType === 'ab-test') {
    appendAbTestLines(lines, config)
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

// —— 各节点类型私有 builder —— //
function appendCrowdSplitLines(lines, config) {
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

function appendEventSplitLines(lines, config) {
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
      if (timeoutVal) lines.push(`↳ ${timeoutVal}${timeoutUnit}未发生 → ${label}`)
      else lines.push(`↳ 未设置超时未发生 → ${label}`)
      return
    }
    const eventPrefix = eventTag ? `【${eventTag}】` : '【未选事件】'
    if (unconditional) { lines.push(`↳ ${eventPrefix}${label}: 无条件`); return }
    const conds = Array.isArray(b.conditions) ? b.conditions.filter(c => c && (c.field || c.value)) : []
    if (!conds.length) { lines.push(`↳ ${eventPrefix}${label}`); return }
    const condTexts = conds.map(c => {
      const opLabel = c.operatorLabel || OPERATOR_DISPLAY[c.operator] || c.operator
      const field = c.field || '属性'
      const value = c.value != null ? String(c.value) : ''
      return `${field} ${opLabel} ${value}`
    })
    lines.push(`↳ ${eventPrefix}${label}: ${condTexts.join(' AND ')}`)
  })
}

function appendAbTestLines(lines, config) {
  const branches = Array.isArray(config?.branches) ? config.branches : []
  const variants = Array.isArray(config?.variants) ? config.variants : []
  const versions = Array.isArray(config?.versions) ? config.versions : []
  const merged = branches.length ? branches : (variants.length ? variants : versions)
  merged.forEach((b, i) => {
    const name = b?.name || `变体${String.fromCharCode(65 + i)}`
    const pct = b?.percentage != null ? b.percentage : (b?.ratio != null ? b.ratio : '')
    lines.push(`${name}：${pct}%`)
  })
}
/*
用途：节点内容行构建器
说明：根据节点类型与配置生成 body 区域显示文本；与 createVueShapeNode 配合。
边界：纯函数，不修改节点；按业务规则组织显示行；不支持未知节点类型时返回类型标签兜底。
*/