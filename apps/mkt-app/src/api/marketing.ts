// Marketing API 模块 (4 JSON mock 迁移)
// TASK-20260717-2FFA5BCA · 候选 #235 dev 范围 · PM A' 拍板 23:00 CST
// 候选 #172 v3.0 + #127+#135b 锁版守 + #235 dev 范围

import type { UserConversion, DailyFunnel, ChannelStat, FactorAttribution } from '@/types/marketing'
import { mockUserConversions } from '@/mock/marketing/userConversions'
import { mockDailyFunnel } from '@/mock/marketing/dailyFunnel'
import { mockChannelStats } from '@/mock/marketing/channelStats'
import { mockFactorAttribution } from '@/mock/marketing/factorAttribution'

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

/**
 * 获取用户转化漏斗 (按 channel 可选过滤)
 */
export const getUserConversions = async (
  channel?: string
): Promise<ApiResponse<UserConversion[]>> => {
  await delay(150)
  const data = channel
    ? mockUserConversions.filter(c => c.channel === channel)
    : mockUserConversions
  return { code: 200, message: 'success', data }
}

/**
 * 获取每日漏斗快照 (近 7 天)
 */
export const getDailyFunnel = async (): Promise<ApiResponse<DailyFunnel[]>> => {
  await delay(120)
  return { code: 200, message: 'success', data: mockDailyFunnel }
}

/**
 * 获取多渠道投放效果对比
 */
export const getChannelStats = async (): Promise<ApiResponse<ChannelStat[]>> => {
  await delay(180)
  return { code: 200, message: 'success', data: mockChannelStats }
}

/**
 * 获取多因子贡献度分析
 */
export const getFactorAttribution = async (
  campaignId?: string
): Promise<ApiResponse<FactorAttribution[]>> => {
  await delay(200)
  const data = campaignId
    ? mockFactorAttribution.filter(f => f.campaignId === campaignId)
    : mockFactorAttribution
  return { code: 200, message: 'success', data }
}

/**
 * 导出 API 对象 (与 src/api/ 18+ 文件风格一致)
 */
export const marketingAPI = {
  getUserConversions,
  getDailyFunnel,
  getChannelStats,
  getFactorAttribution,
}

export default marketingAPI