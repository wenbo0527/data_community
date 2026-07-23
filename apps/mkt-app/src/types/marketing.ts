// Marketing 数仓核心类型定义 (PM A' 派单 #4 子任务)
// TASK-20260717-2FFA5BCA · 候选 #235 dev 范围 · 4 JSON mock 迁移

/**
 * 用户转化漏斗 - 跨阶段转化追踪
 */
export interface UserConversion {
  id: string
  userId: string
  userName: string
  /** 来源阶段: 注册 / 实名 / 绑卡 / 首单 / 复购 */
  fromStage: string
  /** 目标阶段 */
  toStage: string
  /** 转化率 (0-1) */
  conversionRate: number
  /** 渠道: wechat / app / web / sms / miniapp */
  channel: string
  timestamp: string
}

/**
 * 每日漏斗 - 时间维度漏斗快照
 */
export interface DailyFunnel {
  /** 日期 YYYY-MM-DD */
  date: string
  /** 阶段1: 访问 */
  stage1Visitors: number
  /** 阶段2: 注册 */
  stage2Visitors: number
  /** 阶段3: 实名 */
  stage3Visitors: number
  /** 阶段4: 转化 */
  stage4Visitors: number
  /** 阶段1→4 转化率 (0-1) */
  conversionRate: number
}

/**
 * 渠道统计 - 多渠道投放效果对比
 */
export interface ChannelStat {
  channelId: string
  channelName: string
  /** 曝光数 */
  impressions: number
  /** 点击数 */
  clicks: number
  /** 转化数 */
  conversions: number
  /** 总成本 (元) */
  cost: number
  /** 点击率 (0-1) */
  ctr: number
  /** 转化率 (0-1) */
  cvr: number
  /** 单客获取成本 (元) */
  cpa: number
  /** 统计日期 */
  date: string
}

/**
 * 因子归因 - 多因子贡献度分析
 */
export interface FactorAttribution {
  factorId: string
  factorName: string
  /** 因子权重 (0-1) */
  weight: number
  /** 因子贡献度 (0-1) */
  contribution: number
  /** 归属渠道 */
  channel: string
  /** 归属活动 */
  campaignId: string
  /** 统计日期 */
  date: string
}