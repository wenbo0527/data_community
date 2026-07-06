/**
 * 统一状态 / 颜色 / 标签映射
 * 8 个页面共用，禁重复定义
 */

export type VariableStatus = 'draft' | 'pending' | 'active' | 'inactive' | 'expired'
export type TopicStatus = 'exploring' | 'adopted' | 'rejected' | 'paused'
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed'
export type InsightStatus = 'open' | 'tracking' | 'resolved'
export type RiskLevel = 'high' | 'medium' | 'low'
export type Priority = 'P0' | 'P1' | 'P2' | 'P3'
export type Visibility = 'public' | 'team' | 'private'
export type SourceType = 'internal' | 'credit' | 'external'

const STATUS_MAPS = {
  variable: {
    draft: { label: '草稿', color: 'gray' },
    pending: { label: '待审核', color: 'orange' },
    active: { label: '已发布', color: 'green' },
    inactive: { label: '已停用', color: 'red' },
    expired: { label: '已过期', color: 'lightgray' }
  },
  topic: {
    exploring: { label: '探索中', color: 'arcoblue' },
    adopted: { label: '已采纳', color: 'green' },
    rejected: { label: '已否决', color: 'red' },
    paused: { label: '已暂缓', color: 'orange' }
  },
  task: {
    pending: { label: '待执行', color: 'gray' },
    running: { label: '执行中', color: 'arcoblue' },
    completed: { label: '已完成', color: 'green' },
    failed: { label: '失败', color: 'red' }
  },
  insight: {
    open: { label: '待处理', color: 'red' },
    tracking: { label: '跟进中', color: 'orange' },
    resolved: { label: '已闭环', color: 'green' }
  },
  risk: {
    high: { label: '高风险', color: 'red' },
    medium: { label: '跟进中', color: 'orange' },
    low: { label: '稳定', color: 'green' }
  },
  priority: {
    P0: { label: 'P0 紧急', color: 'red' },
    P1: { label: 'P1 高', color: 'orange' },
    P2: { label: 'P2 中', color: 'arcoblue' },
    P3: { label: 'P3 低', color: 'gray' }
  },
  visibility: {
    public: { label: '公开', color: 'arcoblue' },
    team: { label: '团队', color: 'purple' },
    private: { label: '私有', color: 'gray' }
  },
  sourceType: {
    internal: { label: '内数', color: 'blue' },
    credit: { label: '征信', color: 'purple' },
    external: { label: '外数', color: 'arcoblue' }
  }
} as const

/**
 * 通用取值：{ statusType, status } => { label, color }
 * status 不存在时返回 { label: '—', color: 'gray' }
 */
export const getStatus = (statusType, status) => {
  const map = STATUS_MAPS[statusType]
  if (!map) return { label: '—', color: 'gray' }
  return map[status] || { label: '—', color: 'gray' }
}

export const statusLabel = (statusType, status) => getStatus(statusType, status).label
export const statusColor = (statusType, status) => getStatus(statusType, status).color

/**
 * 同名 status 在不同域可能含义不同（pending=待审核 or 待执行）
 * 提供按域的快捷调用
 */
export const variableStatus = (s) => getStatus('variable', s)
export const topicStatus = (s) => getStatus('topic', s)
export const taskStatus = (s) => getStatus('task', s)
export const insightStatus = (s) => getStatus('insight', s)
export const riskStatus = (s) => getStatus('risk', s)
export const priorityStatus = (s) => getStatus('priority', s)
export const visibilityStatus = (s) => getStatus('visibility', s)
export const sourceTypeStatus = (s) => getStatus('sourceType', s)

export default STATUS_MAPS
