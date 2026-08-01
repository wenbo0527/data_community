/**
 * 埋点服务（仅画布交互）
 * 说明：
 *  - 本地存储：localStorage 'horizontal_canvas_tracker_events'，上限 5000 条；超出后按 FIFO 丢弃。
 *  - 远程上报：默认 mock（不发送）；如需接入后端，配置 tracker.setRemote(remoteFn) 即可。
 *  - 时间戳统一使用 Date.now()；事件统一 schema：{ event, ts, taskId, version, props }
 *  - 会话维度：每个页面会话生成 sessionId（仅进程内），用于漏斗去重（同一会话不重复计 funnel）。
 * 边界：仅画布交互，不涉及全站路由/表单/性能/错误；可被 useTracker 组合式包装。
 */

const STORAGE_KEY = 'horizontal_canvas_tracker_events'
const MAX_EVENTS = 5000
const SESSION_KEY = 'horizontal_canvas_tracker_session'
const FUNNEL_KEY = 'horizontal_canvas_tracker_funnel'

let _remote = null
let _sessionId = loadOrCreateSession()
let _suppress = false
let _listeners = new Set()

function loadOrCreateSession() {
  try {
    let s = sessionStorage.getItem(SESSION_KEY)
    if (!s) {
      s = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      sessionStorage.setItem(SESSION_KEY, s)
    }
    return s
  } catch {
    return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  }
}

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

function writeAll(events) {
  try {
    const trimmed = events.length > MAX_EVENTS ? events.slice(events.length - MAX_EVENTS) : events
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch {}
}

function notify(event) {
  for (const fn of _listeners) {
    try { fn(event) } catch {}
  }
}

/**
 * 记录一个画布事件
 * 入参：event(string), payload({ taskId?, version?, props? })
 * 返回：写入的事件对象（含自动 sessionId）
 * 副作用：写入 localStorage；触发 _listeners；可选远程上报
 */
export function track(event, payload = {}) {
  if (!event || _suppress) return null
  const { taskId = null, version = null, props = {} } = payload || {}
  const entry = {
    event: String(event),
    ts: Date.now(),
    sessionId: _sessionId,
    taskId: taskId != null ? String(taskId) : null,
    version: version != null ? Number(version) : null,
    props: props || {}
  }
  const events = readAll()
  events.push(entry)
  writeAll(events)
  notify(entry)
  if (typeof _remote === 'function') {
    try { Promise.resolve(_remote(entry)).catch(() => {}) } catch {}
  }
  return entry
}

/**
 * 配置远程上报端点；传 null 关闭
 */
export function setRemote(fn) {
  _remote = typeof fn === 'function' ? fn : null
}

/**
 * 开关：暂停采集（用于清除测试数据等场景）
 */
export function setSuppressed(v) { _suppress = !!v }

/**
 * 当前会话 id
 */
export function getSessionId() { return _sessionId }

/**
 * 重置会话（仅测试用）
 */
export function resetSession() {
  _sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  try { sessionStorage.setItem(SESSION_KEY, _sessionId) } catch {}
}

/**
 * 订阅新增事件（实时面板使用）
 * 返回取消订阅函数
 */
export function subscribe(fn) {
  _listeners.add(fn)
  return () => _listeners.delete(fn)
}

/**
 * 读取所有事件（按时间升序）
 */
export function getEvents() { return readAll() }

/**
 * 清空事件
 */
export function clearEvents() { writeAll([]) }

/**
 * 按 taskId 过滤事件
 */
export function getEventsByTask(taskId) {
  const tid = String(taskId)
  return readAll().filter(e => String(e.taskId || '') === tid)
}

/**
 * 按 sessionId 过滤事件
 */
export function getEventsBySession(sessionId) {
  return readAll().filter(e => e.sessionId === sessionId)
}

/**
 * 时间窗口过滤（毫秒）
 */
export function getEventsBetween(fromTs, toTs) {
  return readAll().filter(e => e.ts >= fromTs && e.ts <= toTs)
}

/**
 * 漏斗 key 持久化存储（会话维度）：每个 sessionId 仅记录一次 funnel 进度
 * 入参：funnelId('canvas_creation')、stepKey('first_node_drop')、payload({})
 * 副作用：写入 localStorage；同一 (sessionId, funnelId, stepKey) 仅记录首次时间
 */
export function trackFunnelStep(funnelId, stepKey, payload = {}) {
  if (!funnelId || !stepKey || _suppress) return null
  const all = readFunnelState()
  const k = `${_sessionId}|${funnelId}`
  const cur = all[k] || { firstTs: Date.now(), steps: {} }
  if (!cur.steps[stepKey]) {
    cur.steps[stepKey] = { ts: Date.now(), payload: payload || {} }
    all[k] = cur
    writeFunnelState(all)
  }
  return cur.steps[stepKey]
}

export function getFunnelState(sessionId, funnelId) {
  const all = readFunnelState()
  return all[`${sessionId || _sessionId}|${funnelId}`] || null
}

export function getAllFunnelStates(funnelId) {
  const all = readFunnelState()
  return Object.keys(all)
    .filter(k => k.endsWith(`|${funnelId}`))
    .map(k => ({ sessionId: k.split('|')[0], ...all[k] }))
}

export function clearFunnelState() {
  try { localStorage.removeItem(FUNNEL_KEY) } catch {}
}

function readFunnelState() {
  try {
    const raw = localStorage.getItem(FUNNEL_KEY)
    if (!raw) return {}
    const obj = JSON.parse(raw)
    return obj && typeof obj === 'object' ? obj : {}
  } catch { return {} }
}

function writeFunnelState(state) {
  try { localStorage.setItem(FUNNEL_KEY, JSON.stringify(state)) } catch {}
}

export const TRACKER_KEYS = {
  EVENTS: STORAGE_KEY,
  SESSION: SESSION_KEY,
  FUNNEL: FUNNEL_KEY
}
/*
用途：埋点服务（仅画布交互）
说明：localStorage 本地存储；上限 5000 条 FIFO；预留远程上报接口；漏斗状态按 session 维度去重。
边界：仅画布交互，不覆盖全站路由/表单/性能；不做网络请求；测试可用 resetSession/clearEvents/clearFunnelState。
*/