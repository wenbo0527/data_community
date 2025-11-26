const KEY = 'horizontal_canvas_tasks'
export const TaskStorage = {
  getAllTasks() {
    try { 
      const raw = JSON.parse(localStorage.getItem(KEY) || '[]')
      return Array.isArray(raw) ? raw.map(t => ({ ...t, canvasData: migrateCanvasData(t.canvasData) })) : []
    } catch { return [] }
  },
  getTaskById(id) { return this.getAllTasks().find(t => String(t.id) === String(id)) || null },
  saveTask(task) {
    const list = this.getAllTasks()
    const idx = list.findIndex(t => String(t.id) === String(task.id))
    if (idx >= 0) list[idx] = { ...list[idx], ...task, canvasData: migrateCanvasData(task.canvasData || list[idx].canvasData) }
    else list.push({ ...task, createdAt: task.createdAt || new Date().toISOString() })
    localStorage.setItem(KEY, JSON.stringify(list))
    return task
  },
  deleteTask(id) {
    const list = this.getAllTasks().filter(t => String(t.id) !== String(id))
    localStorage.setItem(KEY, JSON.stringify(list))
    return true
  },
  updateTask(id, data) {
    // DocRef: 架构文档「关键代码片段/本地任务存储：创建与更新」
    const list = this.getAllTasks()
    const idx = list.findIndex(t => String(t.id) === String(id))
    if (idx >= 0) {
      const merged = { ...list[idx], ...data, id: list[idx].id, canvasData: migrateCanvasData(data.canvasData || list[idx].canvasData) }
      list[idx] = merged
      localStorage.setItem(KEY, JSON.stringify(list))
      return merged
    }
    const created = { id: String(id), ...data, canvasData: migrateCanvasData(data.canvasData) }
    list.push(created)
    localStorage.setItem(KEY, JSON.stringify(list))
    return created
  },
  // DocRef: 架构文档「关键代码片段/本地任务存储：创建与更新」
  createTask(task) { const t = { id: String(Date.now()), ...task }; this.saveTask(t); return t },
  getStorageStats() { const list = this.getAllTasks(); return { totalTasks: list.length } }
  ,
  seedIfEmpty() {
    const list = this.getAllTasks()
    if (Array.isArray(list) && list.length) return
    const mock = [
      {
        id: '1001', name: '消费贷促实名认证活动', type: '促实名', status: 'running', version: 2,
        createdAt: new Date().toLocaleString('zh-CN'),
        canvasData: { nodes: [ { id: 'start', type: 'start', x: 100, y: 100, label: '开始' }, { id: 'sms', type: 'sms', x: 280, y: 100, label: '短信' }, { id: 'end', type: 'end', x: 480, y: 100, label: '结束' } ], connections: [ { source: 'start', target: 'sms' }, { source: 'sms', target: 'end' } ] },
        versions: [ { version: 1, createTime: new Date().toLocaleString('zh-CN'), isActive: false }, { version: 2, createTime: new Date().toLocaleString('zh-CN'), isActive: true } ]
      },
      {
        id: '1002', name: '消费贷促授信额度提升', type: '促授信', status: 'draft', version: 1,
        createdAt: new Date().toLocaleString('zh-CN'),
        canvasData: { nodes: [ { id: 'start', type: 'start', x: 120, y: 140, label: '开始' }, { id: 'benefit', type: 'benefit', x: 320, y: 140, label: '权益' }, { id: 'end', type: 'end', x: 520, y: 140, label: '结束' } ], connections: [ { source: 'start', target: 'benefit' }, { source: 'benefit', target: 'end' } ] }
      }
    ]
    localStorage.setItem(KEY, JSON.stringify(mock))
  }
}

function migrateCanvasData(canvasData) {
  try {
    if (!canvasData || !Array.isArray(canvasData.nodes) || !Array.isArray(canvasData.connections)) return canvasData
    const idToNode = new Map()
    const nodes = canvasData.nodes.map(n => {
      const cfg = n.config || (n.data && n.data.config) || {}
      const type = n.type || (n.data && n.data.type) || ''
      const isConfigured = (n.isConfigured === true) || (n.data && n.data.isConfigured === true) || (cfg && Object.keys(cfg).length > 0)
      const migrated = { ...n, isConfigured, config: cfg }
      idToNode.set(migrated.id, migrated)
      // 为 AB 实验补齐分支 id/label
      if (type === 'ab-test' && Array.isArray(migrated.config?.branches)) {
        migrated.config.branches = migrated.config.branches.map((b, i) => ({ id: b?.id || `branch_${i + 1}`, name: b?.name || `分支${i + 1}`, label: b?.label || (b?.name || `分支${i + 1}`), percentage: b?.percentage }))
      }
      return migrated
    })
    const connections = canvasData.connections.map(e => {
      const srcNode = idToNode.get(e.source)
      let branchId = e.branchId || null
      // 为 AB 实验边补齐 branchId（根据 sourcePort 中的 out-N）
      try {
        const sp = e.sourcePort || e.sourcePortId || 'out'
        if (srcNode && srcNode.type === 'ab-test' && !branchId) {
          const match = /^out-(\d+)$/.exec(sp)
          const branches = Array.isArray(srcNode.config?.branches) ? srcNode.config.branches : []
          if (match) {
            const idx = Number(match[1])
            branchId = branches[idx]?.id || null
          }
        }
      } catch {}
      return { ...e, branchId }
    })
    return { ...canvasData, nodes, connections }
  } catch { return canvasData }
}

// 运行态统计的mock
export const RuntimeStatsMock = {
  getNodeDailyStats(taskId, nodeId) {
    try {
      const days = 7
      const list = []
      const seedBase = Number(String(taskId).slice(-6)) || 123456
      for (let i = 0; i < days; i++) {
        const date = new Date(Date.now() - i * 24 * 3600 * 1000)
        const ds = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
        const seed = seedBase + i + (String(nodeId || '').length || 1)
        const enter = 50 + ((seed * 7) % 200)
        const exit = Math.max(0, enter - ((seed * 3) % 40))
        list.push({ date: ds, enter, exit })
      }
      return list.reverse()
    } catch { return [] }
  },
  getUserPath(taskId, userId) {
    try {
      const nodes = (TaskStorage.getTaskById(taskId)?.canvasData?.nodes) || []
      const conns = (TaskStorage.getTaskById(taskId)?.canvasData?.connections) || []
      if (!nodes.length) return []
      const start = nodes.find(n => n.type === 'start') || nodes[0]
      const adj = new Map()
      conns.forEach(e => {
        const s = e.source
        const t = e.target
        if (!adj.has(s)) adj.set(s, [])
        adj.get(s).push(t)
      })
      const path = [start.id]
      let curr = start.id
      const maxSteps = 10
      for (let k = 0; k < maxSteps; k++) {
        const nexts = adj.get(curr) || []
        if (!nexts.length) break
        const pick = (userId && String(userId).length) ? (String(userId).charCodeAt(0) + k) % nexts.length : 0
        const nxt = nexts[pick]
        path.push(nxt)
        curr = nxt
      }
      return path
    } catch { return [] }
  },
  // 按分支拆分的每日出人数（用于分流/AB节点）
  getNodeDailyBranchStats(taskId, nodeId, branches = []) {
    try {
      const days = 7
      const list = []
      const baseDaily = RuntimeStatsMock.getNodeDailyStats(taskId, nodeId) || []
      const withPct = Array.isArray(branches) && branches.length && branches.every(b => typeof b.percentage === 'number')
      const weights = branches.map((b, i) => {
        if (withPct) return Math.max(0, b.percentage || 0)
        const key = String(b.id || i)
        let acc = 0
        for (let k = 0; k < key.length; k++) acc += key.charCodeAt(k)
        return (acc % 10) + 1
      })
      const weightSum = weights.reduce((a,b)=>a+b,0) || 1
      for (let i = 0; i < days; i++) {
        const r = baseDaily[i] || { date: '', exit: 0 }
        const totalExit = Number(r.exit || 0)
        const branchExits = {}
        branches.forEach((b, idx) => {
          const ratio = withPct ? ((b.percentage || 0) / 100) : (weights[idx] / weightSum)
          branchExits[String(b.id || idx)] = Math.round(totalExit * ratio)
        })
        list.push({ date: r.date, branchExits })
      }
      return list
    } catch { return [] }
  },
  // 画布级每日统计（进入画布/进入结束）
  getCanvasDailyStats(taskId) {
    try {
      const nodes = (TaskStorage.getTaskById(taskId)?.canvasData?.nodes) || []
      const starts = nodes.filter(n => n.type === 'start')
      const ends = nodes.filter(n => n.type === 'end')
      const days = 7
      const res = []
      for (let i = 0; i < days; i++) {
        const date = RuntimeStatsMock.getNodeDailyStats(taskId, starts[0]?.id || 'start')[i]?.date || ''
        const enter = starts.reduce((sum, s) => {
          const r = RuntimeStatsMock.getNodeDailyStats(taskId, s.id)[i] || { enter: 0 }
          return sum + (r.enter || 0)
        }, 0)
        const endEnter = ends.reduce((sum, s) => {
          const r = RuntimeStatsMock.getNodeDailyStats(taskId, s.id)[i] || { enter: 0 }
          return sum + (r.enter || 0)
        }, 0)
        res.push({ date, canvasEnter: enter, canvasEndEnter: endEnter })
      }
      return res
    } catch { return [] }
  }
}
