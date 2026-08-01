/**
 * Marketing 域 mock 数据聚合
 * 用途：统一导出 4 个营销分析模块的 mock 数据，避免 import 分散
 * 来源：TASK-20260717-2FFA5BCA · 候选 #235 dev 范围
 * 消费方：@/api/marketing.ts
 */

export { mockUserConversions } from './userConversions'
export { mockDailyFunnel } from './dailyFunnel'
export { mockChannelStats } from './channelStats'
export { mockFactorAttribution } from './factorAttribution'

// 聚合默认导出（一次性引入多个模块时使用）
import { mockUserConversions } from './userConversions'
import { mockDailyFunnel } from './dailyFunnel'
import { mockChannelStats } from './channelStats'
import { mockFactorAttribution } from './factorAttribution'

export default {
  mockUserConversions,
  mockDailyFunnel,
  mockChannelStats,
  mockFactorAttribution
}
/*
用途：Marketing 域 mock 数据聚合
说明：4 个营销分析模块（用户转化/每日漏斗/渠道统计/因子归因）统一导出。
边界：仅为 re-export；不修改原文件；新增模块需同步更新此处。
*/