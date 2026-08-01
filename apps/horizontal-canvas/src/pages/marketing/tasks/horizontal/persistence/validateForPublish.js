/**
 * 发布校验 - 纯算法（无图实例）
 * 校验项：
 *  1. 画布数据格式（nodes/connections 必须为数组）
 *  2. 至少存在一个 start 节点；至少一个非 start/end 节点
 *  3. 所有非 start/end 节点都有 config 或 isConfigured
 *  4. 所有非 end 节点都有下游出边
 *  5. 检测环路（DFS 三色染色法，定位环路径）
 * 入参：canvasData({ nodes, connections })
 * 返回：{ pass, messages: string[] }
 * 边界：纯算法，不依赖 graph；可被单测直接覆盖；图实例层的端口/分支校验仍在 PersistenceService.validateForPublish 中。
 */
export function validateForPublishPure(canvasData) {
  const messages = []
  if (!canvasData || !Array.isArray(canvasData.nodes) || !Array.isArray(canvasData.connections)) {
    return { pass: false, messages: ['画布数据格式不正确'] }
  }
  if (canvasData.nodes.length === 0) {
    messages.push('画布中没有任何节点')
  }
  const byId = new Map()
  canvasData.nodes.forEach(n => byId.set(n.id, n))

  const outgoing = new Map()
  const incoming = new Map()
  canvasData.connections.forEach(e => {
    if (!e.source || !e.target) return
    outgoing.set(e.source, (outgoing.get(e.source) || 0) + 1)
    incoming.set(e.target, (incoming.get(e.target) || 0) + 1)
  })

  if (!canvasData.nodes.some(n => n.type === 'start')) {
    messages.push('缺少开始节点')
  }

  const unconfigured = []
  const idSet = new Set()
  canvasData.nodes.forEach(n => {
    if (n.type === 'start' || n.type === 'end') return
    const cfg = n.config || {}
    const configuredFlag = n.isConfigured === true
    const noConfig = !cfg || Object.keys(cfg).length === 0
    if ((noConfig || !configuredFlag) && !idSet.has(n.id)) {
      idSet.add(n.id)
      unconfigured.push(n)
    }
  })
  if (unconfigured.length) {
    messages.push(`存在未完成配置的节点: ${unconfigured.map(n => n.label || n.id).join(', ')}`)
  }

  const noOut = canvasData.nodes.filter(n => n.type !== 'end' && (outgoing.get(n.id) || 0) === 0)
  if (noOut.length) {
    messages.push(`存在未连接后续节点的节点: ${noOut.map(n => n.label || n.id).join(', ')}`)
  }

  const cycleMsg = detectCycle(canvasData.nodes, canvasData.connections, byId)
  if (cycleMsg) messages.push(cycleMsg)

  return { pass: messages.length === 0, messages }
}

const WHITE = 0, GRAY = 1, BLACK = 2

function detectCycle(nodes, connections, byId) {
  try {
    const ids = new Set(nodes.map(n => String(n.id)))
    const adj = new Map()
    ids.forEach(id => adj.set(id, []))
    connections.forEach(e => {
      const s = String(e.source || '')
      const t = String(e.target || '')
      if (ids.has(s) && ids.has(t)) (adj.get(s) || []).push(t)
    })
    const color = new Map()
    ids.forEach(id => color.set(id, WHITE))
    let cyclePath = []
    let hasCycle = false
    const stack = []
    const dfs = (u) => {
      color.set(u, GRAY)
      stack.push(u)
      const ns = adj.get(u) || []
      for (let i = 0; i < ns.length; i++) {
        const v = ns[i]
        const c = color.get(v) || WHITE
        if (c === WHITE) { if (dfs(v)) return true }
        else if (c === GRAY) { const idx = stack.lastIndexOf(v); cyclePath = stack.slice(idx); hasCycle = true; return true }
      }
      stack.pop()
      color.set(u, BLACK)
      return false
    }
    for (const id of ids) { if ((color.get(id) || WHITE) === WHITE) { if (dfs(id)) break } }
    if (hasCycle) {
      const labels = cyclePath.map(id => {
        const n = byId.get(id)
        return `${n?.label || id}(${id})`
      })
      return `存在环路: ${labels.join(' -> ')}`
    }
  } catch {}
  return null
}
/*
用途：发布校验 - 纯算法
说明：与 PersistenceService.validateForPublish 拆分；只做结构/配置/连通性/环路的纯逻辑校验。
边界：不读取 graph 实例；端口与分支完整性校验仍在 PersistenceService.validateForPublish 中。
*/