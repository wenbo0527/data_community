import { migrateCanvasData, MIGRATION_VERSION } from './migrateCanvasData.js'
import { RuntimeStatsMock } from './runtimeStatsMock.js'

const KEY = 'horizontal_canvas_tasks'

/**
 * 智能迁移：仅当 canvasData 未标 `_migrationVersion` 或版本低于当前时才迁移
 * 入参：canvasData(对象或 null/undefined)
 * 返回：迁移后的 canvasData（已迁移的会原样返回，避免重复遍历）
 * 边界：空值原样返回；_migrationVersion >= MIGRATION_VERSION 视为已迁移。
 */
function migrateIfNeeded(canvasData) {
  if (!canvasData || typeof canvasData !== 'object') return canvasData
  try {
    if (Number(canvasData._migrationVersion) >= MIGRATION_VERSION) return canvasData
  } catch {}
  return migrateCanvasData(canvasData)
}

/**
 * 任务本地存储（CRUD + 版本快照）
 * 说明：所有读都通过 migrateCanvasData 做一次迁移；版本快照独立维护，与任务主记录分离。
 * 边界：不负责审批流（参见 approvalService.js）；不负责运行时统计（参见 runtimeStatsMock.js）。
 */
export const TaskStorage = {
  getAllTasks() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '[]')
      return Array.isArray(raw) ? raw.map(t => ({
        ...t,
        canvasData: migrateIfNeeded(t.canvasData),
        versions: Array.isArray(t.versions)
          ? t.versions.map(v => ({ ...v, canvasData: migrateIfNeeded(v.canvasData) }))
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
      const next = { ...base, ...task, id: base.id, canvasData: migrateIfNeeded(task.canvasData || base.canvasData) }
      next.versions = Array.isArray(base.versions) ? base.versions.slice() : []
      // 版本快照：保存当前版本的画布
      if (task.version != null && task.canvasData) {
        const vNum = Number(task.version)
        const vIdx = next.versions.findIndex(v => Number(v.version) === vNum)
        const vEntry = { version: vNum, status: task.status || base.status || 'draft', approvalStatus: task.approvalStatus || null, approvalFlow: Array.isArray(task.approvalFlow) ? task.approvalFlow.slice() : (next.versions[vIdx]?.approvalFlow || [] || []), publishReady: !!task.publishReady, publishMessages: Array.isArray(task.publishMessages) ? task.publishMessages.slice() : (next.versions[vIdx]?.publishMessages || []), lastValidatedAt: task.lastValidatedAt || new Date().toISOString(), canvasData: migrateIfNeeded(task.canvasData), updateTime: task.updateTime || new Date().toISOString(), publishTime: task.publishTime || null }
        if (vIdx >= 0) next.versions[vIdx] = { ...next.versions[vIdx], ...vEntry }
        else next.versions.push(vEntry)
      }
      list[idx] = next
    } else {
      const created = { ...task, createdAt: task.createdAt || new Date().toISOString() }
      // 初始化版本快照
      created.versions = Array.isArray(created.versions) ? created.versions : []
      if (created.version != null && created.canvasData) {
        created.versions.push({ version: Number(created.version), status: created.status || 'draft', approvalStatus: created.approvalStatus || null, approvalFlow: Array.isArray(created.approvalFlow) ? created.approvalFlow.slice() : [], publishReady: !!created.publishReady, publishMessages: Array.isArray(created.publishMessages) ? created.publishMessages.slice() : [], lastValidatedAt: created.lastValidatedAt || null, canvasData: migrateIfNeeded(created.canvasData), updateTime: created.updateTime || new Date().toISOString(), publishTime: created.publishTime || null })
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
      const merged = { ...base, ...data, id: base.id, canvasData: migrateIfNeeded(data.canvasData || base.canvasData) }
      merged.versions = Array.isArray(base.versions) ? base.versions.slice() : []
      if (data.version != null && data.canvasData) {
        const vNum = Number(data.version)
        const vIdx = merged.versions.findIndex(v => Number(v.version) === vNum)
        const vEntry = { version: vNum, status: data.status || base.status || 'draft', approvalStatus: data.approvalStatus ?? merged.versions[vIdx]?.approvalStatus ?? null, approvalFlow: Array.isArray(data.approvalFlow) ? data.approvalFlow.slice() : (merged.versions[vIdx]?.approvalFlow || []), publishReady: data.publishReady ?? merged.versions[vIdx]?.publishReady ?? false, publishMessages: Array.isArray(data.publishMessages) ? data.publishMessages.slice() : (merged.versions[vIdx]?.publishMessages || []), lastValidatedAt: data.lastValidatedAt || new Date().toISOString(), canvasData: migrateIfNeeded(data.canvasData), updateTime: data.updateTime || new Date().toISOString(), publishTime: data.publishTime || null }
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
      created.versions.push({ version: Number(created.version), status: created.status || 'draft', canvasData: migrateIfNeeded(created.canvasData), updateTime: created.updateTime || new Date().toISOString(), publishTime: created.publishTime || null })
    }
    list.push(created)
    localStorage.setItem(KEY, JSON.stringify(list))
    return created
  },

  // DocRef: 架构文档「关键代码片段/本地任务存储：创建与更新」
  createTask(task) { const t = { id: String(Date.now()), ...task }; this.saveTask(t); return t },
  getStorageStats() { const list = this.getAllTasks(); return { totalTasks: list.length } },

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
      return entry && entry.canvasData ? migrateIfNeeded(entry.canvasData) : null
    } catch { return null }
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

/**
 * 兼容导出：旧代码可能从 taskStorage.js 直接 import RuntimeStatsMock；
 * 真实实现已迁移到 utils/runtimeStatsMock.js
 */
export { RuntimeStatsMock }

/*
用途：任务本地存储（CRUD + 版本快照）
说明：所有读取都通过 migrateCanvasData 做一次迁移；版本快照独立维护；审批/运行时统计已迁出。
边界：仅 localStorage 持久化；审批流请用 approvalService；运行时统计请用 runtimeStatsMock。
*/