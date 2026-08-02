/**
 * 任务构建漏斗 - 步骤定义与归因算法
 *
 * 漏斗步骤（按顺序）：
 *  1. canvas_open       进入画布
 *  2. first_node_drop   拖入首个业务节点（除 start 外）
 *  3. first_node_saved  首个节点配置完成（drawer_save 触发）
 *  4. validate_pass     发布校验通过
 *  5. save_draft        保存草稿
 *  6. publish           发布成功
 *
 * 设计要点：
 *  - 漏斗按 sessionId 去重：每个会话仅记录一次步骤首次触发时间
 *  - 跨会话聚合：统计每步骤触发的独立会话数
 *  - 转化率：每一步相对第一步的会话数计算
 *  - 跨任务支持：一个 sessionId 内可能编辑多个 taskId
 */

import { getAllFunnelStates } from './trackerService.js'

export const FUNNEL_ID = 'canvas_creation'

export const CANVAS_FUNNEL_STEPS = [
  { key: 'canvas_open',      label: '进入画布' },
  { key: 'first_node_drop',  label: '拖入首个业务节点' },
  { key: 'first_node_saved', label: '首节点配置完成' },
  { key: 'validate_pass',    label: '发布校验通过' },
  { key: 'save_draft',       label: '保存草稿' },
  { key: 'publish',          label: '发布成功' }
]

/**
 * 计算漏斗各步骤的独立会话数与相对第一步的转化率
 * 返回：steps: [{ key, label, count, conversion }]
 *       totalSessions: 第一步触发的独立会话数
 */
export function computeFunnel(funnelId = FUNNEL_ID) {
  const states = getAllFunnelStates(funnelId) || []
  const totalSessions = states.length
  const result = CANVAS_FUNNEL_STEPS.map(step => {
    const count = states.filter(s => s.steps && s.steps[step.key]).length
    const conversion = totalSessions > 0 ? Number((count / totalSessions).toFixed(4)) : 0
    return { key: step.key, label: step.label, count, conversion }
  })
  return { steps: result, totalSessions }
}

/**
 * 漏斗步骤间的转化（相邻步转化率），便于发现最大流失点
 * 返回：[{ from, to, fromCount, toCount, dropoff }]
 */
export function computeFunnelDropoff(funnelId = FUNNEL_ID) {
  const { steps } = computeFunnel(funnelId)
  const out = []
  for (let i = 1; i < steps.length; i++) {
    const from = steps[i - 1]
    const to = steps[i]
    const dropoff = from.count > 0 ? Number((1 - to.count / from.count).toFixed(4)) : 0
    out.push({ from: from.key, to: to.key, fromCount: from.count, toCount: to.count, dropoff })
  }
  return out
}

/**
 * 计算基础指标（与漏斗独立）
 * 入参：events（数组）
 * 返回：{
 *   totalTasks: 被编辑过的独立 taskId 数,
 *   totalSaves: save_draft 事件数,
 *   totalPublish: publish 事件数,
 *   validateFailCount: validate_fail 事件数,
 *   comboInsertCount: combo_insert 事件数,
 *   drawerSaveFailRate: drawer_save_fail / (drawer_save + drawer_save_fail) 占比
 * }
 */
export function computeBasicMetrics(events = []) {
  const tasks = new Set()
  let totalSaves = 0
  let totalPublish = 0
  let validateFailCount = 0
  let comboInsertCount = 0
  let drawerSave = 0
  let drawerSaveFail = 0
  for (const e of events) {
    if (e.taskId) tasks.add(String(e.taskId))
    switch (e.event) {
      case 'save_draft': totalSaves++; break
      case 'publish': totalPublish++; break
      case 'validate_fail': validateFailCount++; break
      case 'combo_insert': comboInsertCount++; break
      case 'drawer_save': drawerSave++; break
      case 'drawer_save_fail': drawerSaveFail++; break
    }
  }
  const drawerSaveFailRate = (drawerSave + drawerSaveFail) > 0
    ? Number((drawerSaveFail / (drawerSave + drawerSaveFail)).toFixed(4))
    : 0
  return {
    totalTasks: tasks.size,
    totalSaves,
    totalPublish,
    validateFailCount,
    comboInsertCount,
    drawerSaveFailRate
  }
}
/*
用途：任务构建漏斗定义与归因算法
说明：从 trackerService 读 funnelState 与 events 聚合；提供 computeFunnel / computeFunnelDropoff / computeBasicMetrics。
边界：仅画布交互漏斗；不处理远程上报；测试可用 tracker.clearEvents/clearFunnelState 重置。
*/