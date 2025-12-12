const KEY = 'horizontal_canvas_tasks'
export const TaskStorage = {
  getAllTasks() {
    try { 
      const raw = JSON.parse(localStorage.getItem(KEY) || '[]')
      return Array.isArray(raw) ? raw.map(t => ({
        ...t,
        canvasData: migrateCanvasData(t.canvasData),
        versions: Array.isArray(t.versions)
          ? t.versions.map(v => ({ ...v, canvasData: migrateCanvasData(v.canvasData) }))
          : []
      })) : []
    } catch { return [] }
  },
  getTaskById(id) { return this.getAllTasks().find(t => String(t.id) === String(id)) || null },
  saveTask(task) {
    const list = this.getAllTasks()
    const idx = list.findIndex(t => String(t.id) === String(task.id))
    if (idx >= 0) {
      const base = list[idx]
      const next = { ...base, ...task, id: base.id, canvasData: migrateCanvasData(task.canvasData || base.canvasData) }
      next.versions = Array.isArray(base.versions) ? base.versions.slice() : []
      // 版本快照：保存当前版本的画布
      if (task.version != null && task.canvasData) {
        const vNum = Number(task.version)
        const vIdx = next.versions.findIndex(v => Number(v.version) === vNum)
        const vEntry = { version: vNum, status: task.status || base.status || 'draft', approvalStatus: task.approvalStatus || null, approvalFlow: Array.isArray(task.approvalFlow) ? task.approvalFlow.slice() : (next.versions[vIdx]?.approvalFlow || [] || []), publishReady: !!task.publishReady, publishMessages: Array.isArray(task.publishMessages) ? task.publishMessages.slice() : (next.versions[vIdx]?.publishMessages || []), lastValidatedAt: task.lastValidatedAt || new Date().toISOString(), canvasData: migrateCanvasData(task.canvasData), updateTime: task.updateTime || new Date().toISOString(), publishTime: task.publishTime || null }
        if (vIdx >= 0) next.versions[vIdx] = { ...next.versions[vIdx], ...vEntry }
        else next.versions.push(vEntry)
      }
      list[idx] = next
    } else {
      const created = { ...task, createdAt: task.createdAt || new Date().toISOString() }
      // 初始化版本快照
      created.versions = Array.isArray(created.versions) ? created.versions : []
      if (created.version != null && created.canvasData) {
        created.versions.push({ version: Number(created.version), status: created.status || 'draft', approvalStatus: created.approvalStatus || null, approvalFlow: Array.isArray(created.approvalFlow) ? created.approvalFlow.slice() : [], publishReady: !!created.publishReady, publishMessages: Array.isArray(created.publishMessages) ? created.publishMessages.slice() : [], lastValidatedAt: created.lastValidatedAt || null, canvasData: migrateCanvasData(created.canvasData), updateTime: created.updateTime || new Date().toISOString(), publishTime: created.publishTime || null })
      }
      list.push(created)
    }
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
      const base = list[idx]
      const merged = { ...base, ...data, id: base.id, canvasData: migrateCanvasData(data.canvasData || base.canvasData) }
      merged.versions = Array.isArray(base.versions) ? base.versions.slice() : []
      if (data.version != null && data.canvasData) {
        const vNum = Number(data.version)
        const vIdx = merged.versions.findIndex(v => Number(v.version) === vNum)
        const vEntry = { version: vNum, status: data.status || base.status || 'draft', approvalStatus: data.approvalStatus ?? merged.versions[vIdx]?.approvalStatus ?? null, approvalFlow: Array.isArray(data.approvalFlow) ? data.approvalFlow.slice() : (merged.versions[vIdx]?.approvalFlow || []), publishReady: data.publishReady ?? merged.versions[vIdx]?.publishReady ?? false, publishMessages: Array.isArray(data.publishMessages) ? data.publishMessages.slice() : (merged.versions[vIdx]?.publishMessages || []), lastValidatedAt: data.lastValidatedAt || new Date().toISOString(), canvasData: migrateCanvasData(data.canvasData), updateTime: data.updateTime || new Date().toISOString(), publishTime: data.publishTime || null }
        if (vIdx >= 0) merged.versions[vIdx] = { ...merged.versions[vIdx], ...vEntry }
        else merged.versions.push(vEntry)
      }
      list[idx] = merged
      localStorage.setItem(KEY, JSON.stringify(list))
      return merged
    }
    const created = { id: String(id), ...data, canvasData: migrateCanvasData(data.canvasData) }
    created.versions = Array.isArray(created.versions) ? created.versions : []
    if (created.version != null && created.canvasData) {
      created.versions.push({ version: Number(created.version), status: created.status || 'draft', canvasData: migrateCanvasData(created.canvasData), updateTime: created.updateTime || new Date().toISOString(), publishTime: created.publishTime || null })
    }
    list.push(created)
    localStorage.setItem(KEY, JSON.stringify(list))
    return created
  },
  // DocRef: 架构文档「关键代码片段/本地任务存储：创建与更新」
  createTask(task) { const t = { id: String(Date.now()), ...task }; this.saveTask(t); return t },
  getStorageStats() { const list = this.getAllTasks(); return { totalTasks: list.length } }
  ,
  // 版本读取
  getTaskVersions(id) {
    const t = this.getTaskById(id)
    return (t && Array.isArray(t.versions)) ? t.versions : []
  },
  getTaskVersionCanvas(id, version) {
    try {
      const vNum = Number(version)
      const t = this.getTaskById(id)
      const entry = (t && Array.isArray(t.versions)) ? t.versions.find(v => Number(v.version) === vNum) : null
      return entry && entry.canvasData ? migrateCanvasData(entry.canvasData) : null
    } catch { return null }
  },
  submitApproval(id, version, user, remark) {
    const list = this.getAllTasks()
    const idx = list.findIndex(t => String(t.id) === String(id))
    if (idx < 0) return false
    const t = list[idx]
    const vIdx = (t.versions || []).findIndex(v => Number(v.version) === Number(version))
    if (vIdx < 0) return false
    const v = t.versions[vIdx]
    const flow = Array.isArray(v.approvalFlow) ? v.approvalFlow.slice() : []
    flow.push({ action: 'submit', by: String(user || ''), at: new Date().toISOString(), remark: String(remark || '') })
    t.versions[vIdx] = { ...v, approvalStatus: 'pending_approval', approvalFlow: flow }
    t.status = 'pending_approval'
    localStorage.setItem(KEY, JSON.stringify(list))
    return true
  },
  approveVersions(items, decision, user, remark) {
    const list = this.getAllTasks()
    const dec = decision === 'reject' ? 'rejected' : 'approved'
    const res = []
    items.forEach(it => {
      const idx = list.findIndex(t => String(t.id) === String(it.id))
      if (idx < 0) { res.push({ id: it.id, version: it.version, status: 'error', message: 'not_found' }); return }
      const t = list[idx]
      const vIdx = (t.versions || []).findIndex(v => Number(v.version) === Number(it.version))
      if (vIdx < 0) { res.push({ id: it.id, version: it.version, status: 'error', message: 'version_not_found' }); return }
      const v = t.versions[vIdx]
      if (v.approvalStatus !== 'pending_approval') { res.push({ id: it.id, version: it.version, status: 'error', message: 'not_pending' }); return }
      const flow = Array.isArray(v.approvalFlow) ? v.approvalFlow.slice() : []
      flow.push({ action: dec === 'approved' ? 'approve' : 'reject', by: String(user || ''), at: new Date().toISOString(), remark: String(remark || '') })
      t.versions[vIdx] = { ...v, approvalStatus: dec, approvalFlow: flow }
      t.status = dec
      localStorage.setItem(KEY, JSON.stringify(list))
      res.push({ id: it.id, version: it.version, status: 'success' })
    })
    return res
  },
  withdrawApproval(id, version, user, remark) {
    const list = this.getAllTasks()
    const idx = list.findIndex(t => String(t.id) === String(id))
    if (idx < 0) return false
    const t = list[idx]
    const vIdx = (t.versions || []).findIndex(v => Number(v.version) === Number(version))
    if (vIdx < 0) return false
    const v = t.versions[vIdx]
    const flow = Array.isArray(v.approvalFlow) ? v.approvalFlow.slice() : []
    flow.push({ action: 'withdraw', by: String(user || ''), at: new Date().toISOString(), remark: String(remark || '') })
    t.versions[vIdx] = { ...v, approvalStatus: null, approvalFlow: flow }
    localStorage.setItem(KEY, JSON.stringify(list))
    return true
  },
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
