// UserConversion Mock 数据 (营销数仓转化漏斗)
// TASK-20260717-2FFA5BCA · 候选 #235 dev 范围 · PM A' 拍板 23:00 CST

import type { UserConversion } from '@/types/marketing'

const now = () => new Date().toISOString().replace('T', ' ').substring(0, 19)

export const mockUserConversions: UserConversion[] = [
  {
    id: '1',
    userId: 'U10001',
    userName: '张三',
    fromStage: '注册',
    toStage: '实名',
    conversionRate: 0.85,
    channel: 'wechat',
    timestamp: now(),
  },
  {
    id: '2',
    userId: 'U10002',
    userName: '李四',
    fromStage: '实名',
    toStage: '绑卡',
    conversionRate: 0.72,
    channel: 'app',
    timestamp: now(),
  },
  {
    id: '3',
    userId: 'U10003',
    userName: '王五',
    fromStage: '绑卡',
    toStage: '首单',
    conversionRate: 0.58,
    channel: 'web',
    timestamp: now(),
  },
  {
    id: '4',
    userId: 'U10004',
    userName: '赵六',
    fromStage: '首单',
    toStage: '复购',
    conversionRate: 0.34,
    channel: 'sms',
    timestamp: now(),
  },
  {
    id: '5',
    userId: 'U10005',
    userName: '钱七',
    fromStage: '注册',
    toStage: '实名',
    conversionRate: 0.91,
    channel: 'miniapp',
    timestamp: now(),
  },
  {
    id: '6',
    userId: 'U10006',
    userName: '孙八',
    fromStage: '实名',
    toStage: '绑卡',
    conversionRate: 0.68,
    channel: 'wechat',
    timestamp: now(),
  },
  {
    id: '7',
    userId: 'U10007',
    userName: '周九',
    fromStage: '绑卡',
    toStage: '首单',
    conversionRate: 0.62,
    channel: 'app',
    timestamp: now(),
  },
  {
    id: '8',
    userId: 'U10008',
    userName: '吴十',
    fromStage: '首单',
    toStage: '复购',
    conversionRate: 0.41,
    channel: 'web',
    timestamp: now(),
  },
]

export default mockUserConversions