/**
 * Factor Attribution Mock Data（多因子贡献度分析）
 * 用途：营销多因子贡献度 mock（曝光/价格/活动/渠道 + 权重 + 贡献率）
 * 来源：TASK-20260717-2FFA5BCA · 候选 #235 dev 范围 · PM A' 拍板 23:00 CST
 * 消费方：@/api/marketing.ts + @/mock/marketing/index.ts 聚合
 * 边界：纯前端 demo；4 类因子 + 关联 campaign
 */
import type { FactorAttribution } from '@/types/marketing'

const today = new Date().toISOString().substring(0, 10)

export const mockFactorAttribution: FactorAttribution[] = [
  {
    factorId: 'F001',
    factorName: '渠道曝光',
    weight: 0.35,
    contribution: 0.42,
    channel: 'wechat',
    campaignId: 'CMP202607001',
    date: today,
  },
  {
    factorId: 'F002',
    factorName: '优惠券力度',
    weight: 0.25,
    contribution: 0.28,
    channel: 'app',
    campaignId: 'CMP202607001',
    date: today,
  },
  {
    factorId: 'F003',
    factorName: '活动文案',
    weight: 0.15,
    contribution: 0.12,
    channel: 'web',
    campaignId: 'CMP202607001',
    date: today,
  },
  {
    factorId: 'F004',
    factorName: '用户画像匹配',
    weight: 0.1,
    contribution: 0.09,
    channel: 'miniapp',
    campaignId: 'CMP202607002',
    date: today,
  },
  {
    factorId: 'F005',
    factorName: '推送时段',
    weight: 0.08,
    contribution: 0.05,
    channel: 'sms',
    campaignId: 'CMP202607002',
    date: today,
  },
  {
    factorId: 'F006',
    factorName: 'KOL 推荐',
    weight: 0.07,
    contribution: 0.04,
    channel: 'douyin',
    campaignId: 'CMP202607003',
    date: today,
  },
]

export default mockFactorAttribution