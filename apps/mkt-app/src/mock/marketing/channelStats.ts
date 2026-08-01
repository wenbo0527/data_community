/**
 * Channel Stats Mock Data（多渠道投放效果对比）
 * 用途：营销渠道投放效果 mock（曝光/点击/转化/成本/ROI）
 * 来源：TASK-20260717-2FFA5BCA · 候选 #235 dev 范围 · PM A' 拍板 23:00 CST
 * 消费方：@/api/marketing.ts + @/mock/marketing/index.ts 聚合
 * 边界：纯前端 demo；5 大渠道（微信/短信/AI外呼/人工电销/邮件）
 */
import type { ChannelStat } from '@/types/marketing'

const today = new Date().toISOString().substring(0, 10)

export const mockChannelStats: ChannelStat[] = [
  {
    channelId: 'CH001',
    channelName: '微信公众号',
    impressions: 285000,
    clicks: 14250,
    conversions: 1850,
    cost: 28500,
    ctr: 0.05,
    cvr: 0.13,
    cpa: 15.4,
    date: today,
  },
  {
    channelId: 'CH002',
    channelName: 'APP Push',
    impressions: 168000,
    clicks: 12600,
    conversions: 2380,
    cost: 12600,
    ctr: 0.075,
    cvr: 0.189,
    cpa: 5.29,
    date: today,
  },
  {
    channelId: 'CH003',
    channelName: '官网 Banner',
    impressions: 95000,
    clicks: 4750,
    conversions: 620,
    cost: 9500,
    ctr: 0.05,
    cvr: 0.13,
    cpa: 15.32,
    date: today,
  },
  {
    channelId: 'CH004',
    channelName: '短信营销',
    impressions: 52000,
    clicks: 3120,
    conversions: 285,
    cost: 5200,
    ctr: 0.06,
    cvr: 0.091,
    cpa: 18.25,
    date: today,
  },
  {
    channelId: 'CH005',
    channelName: '微信小程序',
    impressions: 142000,
    clicks: 9940,
    conversions: 1620,
    cost: 8520,
    ctr: 0.07,
    cvr: 0.163,
    cpa: 5.26,
    date: today,
  },
  {
    channelId: 'CH006',
    channelName: '抖音信息流',
    impressions: 380000,
    clicks: 15200,
    conversions: 1240,
    cost: 38000,
    ctr: 0.04,
    cvr: 0.082,
    cpa: 30.65,
    date: today,
  },
  {
    channelId: 'CH007',
    channelName: '小红书种草',
    impressions: 125000,
    clicks: 6250,
    conversions: 580,
    cost: 18750,
    ctr: 0.05,
    cvr: 0.093,
    cpa: 32.33,
    date: today,
  },
  {
    channelId: 'CH008',
    channelName: '线下扫码',
    impressions: 18500,
    clicks: 5550,
    conversions: 1280,
    cost: 7400,
    ctr: 0.3,
    cvr: 0.231,
    cpa: 5.78,
    date: today,
  },
]

export default mockChannelStats