/**
 * mock/listing-store.ts (R-mock 补齐)
 *
 * 任务: TASK-20260713-5F3F9CB4 (dmt-app 数据要素上下架 mock)
 * 实施: data_community_dev · 2026-07-13 11:30 CST
 *
 * 用途: metric-management 上下架聚合数据
 * 字段规范: metricName / metricCode / category / owner /
 *           registerTime / status / onShelfTime / offShelfTime /
 *           publisher / description
 */

export interface MockMetric {
  metricName: string
  metricCode: string
  category: string
  systemId: AssetSystemId
  clusterType: 'HIVE' | 'MySQL' | 'Oracle'
  owner: string
  registerTime: string
  status: 'active' | 'onShelf' | 'offShelf' | 'inactive' | 'archived'
  onShelfTime?: string
  offShelfTime?: string
  publisher: string
  description: string
}

import type { AssetSystemId } from './data-map'

export const mockMetrics: MockMetric[] = [
  {
    metricName: '客户转化率',
    metricCode: 'cust_conversion_rate',
    category: '客户',
    systemId: 'core',
    clusterType: 'MySQL',
    owner: '王芳',
    registerTime: '2026-04-10 10:00:00',
    status: 'onShelf',
    onShelfTime: '2026-04-15 14:00:00',
    publisher: '王芳',
    description: '客户从浏览到申请的转化率指标'
  },
  {
    metricName: '贷款通过率',
    metricCode: 'loan_approval_rate',
    category: '授信',
    systemId: 'risk',
    clusterType: 'HIVE',
    owner: '张敏',
    registerTime: '2026-03-15 11:00:00',
    status: 'onShelf',
    onShelfTime: '2026-03-20 09:30:00',
    publisher: '张敏',
    description: '贷款申请的通过率'
  },
  {
    metricName: '平均授信额度',
    metricCode: 'avg_credit_limit',
    category: '授信',
    systemId: 'core',
    clusterType: 'MySQL',
    owner: '张敏',
    registerTime: '2026-04-22 14:00:00',
    status: 'onShelf',
    onShelfTime: '2026-04-25 10:00:00',
    publisher: '张敏',
    description: '客户平均授信额度'
  },
  {
    metricName: '券核销率',
    metricCode: 'coupon_redemption_rate',
    category: '营销',
    systemId: 'service',
    clusterType: 'MySQL',
    owner: '刘洋',
    registerTime: '2026-05-18 16:00:00',
    status: 'onShelf',
    onShelfTime: '2026-05-22 11:00:00',
    publisher: '刘洋',
    description: '优惠券核销率'
  },
  {
    metricName: '客户活跃度',
    metricCode: 'cust_activity_score',
    category: '客户',
    systemId: 'core',
    clusterType: 'MySQL',
    owner: '王芳',
    registerTime: '2026-06-08 09:30:00',
    status: 'onShelf',
    onShelfTime: '2026-06-12 14:00:00',
    publisher: '王芳',
    description: '客户活跃度综合评分'
  },
  {
    metricName: '风险事件触发次数',
    metricCode: 'risk_event_trigger_cnt',
    category: '风控',
    systemId: 'risk',
    clusterType: 'HIVE',
    owner: '李伟',
    registerTime: '2026-02-25 13:00:00',
    status: 'onShelf',
    onShelfTime: '2026-03-01 10:00:00',
    publisher: '李伟',
    description: '风控规则触发次数'
  },
  {
    metricName: '资金回款率',
    metricCode: 'fund_repayment_rate',
    category: '放款',
    systemId: 'core',
    clusterType: 'MySQL',
    owner: '陈刚',
    registerTime: '2026-03-30 15:00:00',
    status: 'onShelf',
    onShelfTime: '2026-04-05 14:00:00',
    publisher: '陈刚',
    description: '放款资金按时回款率'
  }
]

export const listingStore = {
  metrics: mockMetrics
}

export default listingStore