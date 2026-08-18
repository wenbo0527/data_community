/**
 * 模型回溯日志解析器（模块C P0）
 * 支持两种日志结构：
 *   1) 单模型日志：顶层含 layers + result，stages 在 result.stages，main_model 在 result.main_model
 *   2) 嵌套日志：  顶层含 stages + main_model + sub_models
 * 解析规则见 PRD《离线模型平台优化》第 C1/C2/C3 节。
 */

// 时间戳正则：[YYYY-MM-DD HH:mm:ss]
const TS_REGEX = /\[(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\]/
// 耗时正则：耗时=1h18m38s / 耗时=49m41s / 耗时 49m41s / 耗时4m51s
// 支持 d/h/m/s 任意组合，兼容带等号、带空格、无分隔三种写法
const COST_REGEX = /耗时[=\s]*([0-9dhms]+)/
// session 子任务 耗时正则（日志条目用，耗时在方括号内）
const SESSION_REGEX = /\[session=([^\]]+)\]/
const SUBTASK_REGEX = /\[子任务=([^\]]+)\]/
const SUBTASK_COST_REGEX = /\[耗时=([^\]]+)\]/

/**
 * 判断日志类型
 * 注意：layers 可能为数字 0（falsy），用 'in' 判断字段是否存在而非真值
 * @param {Object} log - 原始日志对象
 * @returns {'single'|'nested'|null}
 */
export function detectLogType(log) {
  if (!log || typeof log !== 'object') return null
  if (Array.isArray(log.sub_models) || Array.isArray(log.stages)) return 'nested'
  if ('layers' in log || 'result' in log) return 'single'
  return null
}

/**
 * 解析单条 stages 元素：[2026-08-17 10:00:00] 阶段描述（耗时 49m41s）
 * @param {string} raw
 * @returns {{ timestamp: string, desc: string, cost: string|null, status: 'running'|'done' }}
 */
export function parseStageItem(raw) {
  const text = String(raw || '').trim()
  let timestamp = '―'
  let desc = text || '未知阶段'
  let cost = null
  const tsMatch = text.match(TS_REGEX)
  if (tsMatch) {
    timestamp = tsMatch[1]
    desc = text.replace(TS_REGEX, '').trim() || '未知阶段'
  }
  const costMatch = desc.match(COST_REGEX)
  if (costMatch) cost = costMatch[1]
  // 状态判断：含「完成/结束/成功」 -> 已完成；含「开始/进行」 -> 进行中；其余 -> 默认已完成
  let status = 'done'
  if (/开始|进行/.test(desc)) status = 'running'
  else if (/完成|结束|成功/.test(desc)) status = 'done'
  return { timestamp, desc, cost, status }
}

/**
 * 解析 stages 数组为时间线节点
 * @param {Object} log
 * @returns {Array} 节点数组（已按时间戳排序）
 */
export function parseTimeline(log) {
  if (!log) return []
  const type = detectLogType(log)
  let stages = []
  if (type === 'nested') stages = Array.isArray(log.stages) ? log.stages : []
  else if (type === 'single') stages = Array.isArray(log.result?.stages) ? log.result.stages : []
  if (!stages.length) return []
  const nodes = stages.map((s, i) => ({ id: `stage_${i}`, ...parseStageItem(s) }))
  // 按时间戳正序排列
  return nodes.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

/**
 * 提取模型对象（兼容单/嵌套）
 */
function pickMainModel(log) {
  if (!log) return null
  const type = detectLogType(log)
  if (type === 'nested') return log.main_model || null
  if (type === 'single') return log.result?.main_model || null
  return null
}

/**
 * 解析执行结果（主模型 + 子模型列表）
 * @param {Object} log
 * @returns {{ main: Object|null, subs: Array, type: string|null }}
 */
export function parseExecutionResult(log) {
  if (!log) return { main: null, subs: [], type: null }
  const type = detectLogType(log)
  const main = pickMainModel(log)
  const subs = type === 'nested' && Array.isArray(log.sub_models) ? log.sub_models : []
  return { main, subs, type }
}

/**
 * 提取模型卡片字段
 * @param {Object} model
 * @param {boolean} includeState - 是否展示 state/progress/result_table（嵌套日志适用）
 */
export function pickModelCardFields(model, includeState = false) {
  if (!model) return null
  const successCount = Array.isArray(model.successInfo) ? model.successInfo.length : 0
  const errorCount = Array.isArray(model.errorInfo) ? model.errorInfo.length : 0
  const fields = {
    model_id: model.model_id || '主模型',
    model_version: model.model_version || '―',
    successCount,
    errorCount
  }
  if (includeState) {
    fields.state = typeof model.state === 'number' ? model.state : null
    fields.progress = model.progress || null
    fields.result_table = model.result_table || null
  }
  return fields
}

/**
 * 解析单条日志条目：[时间戳] [session=xxx] [子任务=xxx][耗时=xxx]:执行结果
 * @param {string} raw
 */
export function parseLogEntry(raw) {
  const text = String(raw || '').trim()
  const result = { timestamp: '―', session: '―', subtask: '―', cost: null, content: text || '―' }
  const ts = text.match(TS_REGEX)
  if (ts) result.timestamp = ts[1]
  const ss = text.match(SESSION_REGEX)
  if (ss) result.session = ss[1]
  const st = text.match(SUBTASK_REGEX)
  if (st) result.subtask = st[1]
  const ct = text.match(SUBTASK_COST_REGEX)
  if (ct) result.cost = ct[1]
  // 去掉所有方括号字段，剩余即为「执行结果」
  result.content = text
    .replace(TS_REGEX, '')
    .replace(SESSION_REGEX, '')
    .replace(SUBTASK_REGEX, '')
    .replace(SUBTASK_COST_REGEX, '')
    .replace(/^[\s:：]+/, '')
    .trim() || '―'
  return result
}

/**
 * 把详细日志按模型分组（嵌套日志：主模型 + 各子模型；单模型：仅主模型）
 * @param {Object} log
 * @returns {Array<{ groupId: string, groupName: string, successEntries: Array, errorEntries: Array }>}
 */
export function parseLogGroups(log) {
  if (!log) return []
  const type = detectLogType(log)
  const groups = []
  if (type === 'nested') {
    if (log.main_model) {
      groups.push({
        groupId: 'main',
        groupName: `主模型 ${log.main_model.model_version || ''}`.trim(),
        successEntries: (log.main_model.successInfo || []).map(parseLogEntry),
        errorEntries: (log.main_model.errorInfo || []).map(parseLogEntry)
      })
    }
    ;(log.sub_models || []).forEach((sm, idx) => {
      groups.push({
        groupId: sm.model_id || `sub_${idx}`,
        groupName: `子模型 ${sm.model_id || idx + 1} ${sm.model_version || ''}`.trim(),
        successEntries: (sm.successInfo || []).map(parseLogEntry),
        errorEntries: (sm.errorInfo || []).map(parseLogEntry)
      })
    })
  } else if (type === 'single') {
    const main = log.result?.main_model
    if (main) {
      groups.push({
        groupId: 'main',
        groupName: `主模型 ${main.model_version || ''}`.trim(),
        successEntries: (main.successInfo || []).map(parseLogEntry),
        errorEntries: (main.errorInfo || []).map(parseLogEntry)
      })
    }
  }
  return groups
}