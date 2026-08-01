import { TaskStorage } from './taskStorage.js'

/**
 * 运行态统计 mock（节点级/分支级/画布级）
 * 说明：纯前端 mock，无后端；通过 taskId/nodeId 哈希生成伪随机数据，便于联调。
 * 边界：数据不具备业务意义；不持久化；不调用网络。
 */
export const RuntimeStatsMock = {
  /** 最近 7 天每日进入/离开节点的人数 */
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

  /** 用户在画布中的路径（基于确定性哈希选择下一节点） */
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

  /** 按分支拆分的每日出人数（用于分流/AB节点） */
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

  /** 画布级每日统计（进入画布/进入结束） */
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
/*
用途：运行态统计 mock（节点级/分支级/画布级）
说明：从原 taskStorage.js 拆分；纯前端伪数据，用于画布统计面板的联调展示。
边界：不调用后端；不持久化；不接受业务参数（百分比由调用方在 branches 中传入）。
*/