/**
 * 圈选/工作流/工单 Directory 补齐
 */

import type { MockMethod } from 'vite-plugin-mock'

// === 圈选规则(独立于人群的临时圈选) ===
export interface CrowdQuery {
  id: string
  name: string
  description: string
  rules: Array<{
    field: string
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'between' | 'contains'
    value: any
    logicalOp?: 'AND' | 'OR'
  }>
  ownerId: string
  ownerName: string
  createTime: string
  estimatedCount: number
  status: 'draft' | 'submitted' | 'processing' | 'done'
}

export const CROWD_QUERIES: CrowdQuery[] = [
  {
    id: 'q_001', name: '深圳 30+ 男性高活跃',
    description: '深圳地区 + 男性 + 30 岁以上 + 近 7 天活跃',
    rules: [
      { field: 'region', operator: 'eq', value: '深圳', logicalOp: 'AND' },
      { field: 'gender', operator: 'eq', value: 'M', logicalOp: 'AND' },
      { field: 'age', operator: 'gte', value: 30, logicalOp: 'AND' },
      { field: 'active_7d', operator: 'eq', value: true, logicalOp: 'AND' }
    ],
    ownerId: 'user-yunying', ownerName: '王运营',
    createTime: '2025-07-01 10:00', estimatedCount: 8, status: 'done'
  },
  {
    id: 'q_002', name: 'Q3 即将到期的授信用户',
    description: '授信到期日在 Q3 + B 级以上',
    rules: [
      { field: 'credit_expire_in_q3', operator: 'eq', value: true, logicalOp: 'AND' },
      { field: 'value_level', operator: 'in', value: ['A', 'B'] }
    ],
    ownerId: 'user-xindai', ownerName: '信贷经理',
    createTime: '2025-07-01 14:30', estimatedCount: 12, status: 'processing'
  },
  {
    id: 'q_003', name: '流失风险 + 高价值',
    description: '流失风险 = 高 + A/B 级用户',
    rules: [
      { field: 'churn_risk', operator: 'eq', value: 'high', logicalOp: 'AND' },
      { field: 'value_level', operator: 'in', value: ['A', 'B'] }
    ],
    ownerId: 'user-wangwu', ownerName: '王五',
    createTime: '2025-06-30 09:00', estimatedCount: 5, status: 'done'
  },
  {
    id: 'q_004', name: '近 90 天未登录的 VIP',
    description: '近 90 天未登录 + VIP 用户',
    rules: [
      { field: 'last_login_days', operator: 'gt', value: 90, logicalOp: 'AND' },
      { field: 'is_vip', operator: 'eq', value: true }
    ],
    ownerId: 'user-chanpin', ownerName: '产品经理',
    createTime: '2025-07-01 11:20', estimatedCount: 3, status: 'draft'
  }
]

// === 工单/审批 ===
export interface ApplicationItem {
  id: string
  type: 'metric_apply' | 'data_apply' | 'tag_apply' | 'permission_apply' | 'service_apply'
  title: string
  applicantId: string
  applicantName: string
  approverId?: string
  approverName?: string
  resourceId: string
  resourceName: string
  resourceType: string
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  createTime: string
  approveTime?: string
  approveComment?: string
  duration?: string
}

export const APPLICATIONS: ApplicationItem[] = [
  {
    id: 'app_001',
    type: 'metric_apply',
    title: '申请使用「DAU」指标',
    applicantId: 'user-yunying', applicantName: '王运营',
    approverId: 'user-zhangsan', approverName: '张三',
    resourceId: 'metric_001', resourceName: 'DAU 日活跃用户数', resourceType: '指标',
    reason: '用于经营周报',
    status: 'pending',
    createTime: '2025-07-02 10:30',
    duration: '30d'
  },
  {
    id: 'app_002',
    type: 'data_apply',
    title: '申请访问「dwd_user_event」表',
    applicantId: 'user-yunying', applicantName: '王运营',
    approverId: 'user-zhangsan', approverName: '张三',
    resourceId: 'tbl_005', resourceName: 'dwd_user_event', resourceType: '数据表',
    reason: '用户行为分析',
    status: 'approved',
    createTime: '2025-06-25 14:00',
    approveTime: '2025-06-26 09:00',
    approveComment: '已审批,有效期 30 天',
    duration: '30d'
  },
  {
    id: 'app_003',
    type: 'tag_apply',
    title: '申请使用「高净值用户」标签',
    applicantId: 'user-yingxiao', applicantName: '营销经理',
    approverId: 'user-wangwu', approverName: '王五',
    resourceId: 'tag_029', resourceName: '高净值用户', resourceType: '标签',
    reason: '营销活动定向',
    status: 'pending',
    createTime: '2025-07-02 08:00',
    duration: 'permanent'
  },
  {
    id: 'app_004',
    type: 'permission_apply',
    title: '申请「身份证号」字段权限',
    applicantId: 'user-yunying', applicantName: '王运营',
    approverId: 'user-fengkong', approverName: '风控值班',
    resourceId: 'field_id_card', resourceName: '身份证号', resourceType: '字段',
    reason: '客户身份核验',
    status: 'approved',
    createTime: '2025-06-20 11:30',
    approveTime: '2025-06-20 16:00',
    approveComment: '限定场景使用,禁止导出',
    duration: '90d'
  },
  {
    id: 'app_005',
    type: 'service_apply',
    title: '申请「客户授信查询」API',
    applicantId: 'user-chanpin', applicantName: '产品经理',
    approverId: 'user-xindai', approverName: '信贷经理',
    resourceId: 'api_credit_query', resourceName: '客户授信查询', resourceType: 'API',
    reason: '产品集成',
    status: 'pending',
    createTime: '2025-07-01 15:30',
    duration: 'permanent'
  },
  {
    id: 'app_006',
    type: 'metric_apply',
    title: '申请使用「GMV」指标',
    applicantId: 'user-yingxiao', applicantName: '营销经理',
    approverId: 'user-wangwu', approverName: '王五',
    resourceId: 'metric_002', resourceName: 'GMV 成交总额', resourceType: '指标',
    reason: '营销活动效果评估',
    status: 'approved',
    createTime: '2025-06-15 10:00',
    approveTime: '2025-06-15 14:00',
    approveComment: '已审批',
    duration: '30d'
  },
  {
    id: 'app_007',
    type: 'data_apply',
    title: '申请访问「dws_user_value」表',
    applicantId: 'user-yingxiao', applicantName: '营销经理',
    approverId: 'user-zhangsan', approverName: '张三',
    resourceId: 'tbl_007', resourceName: 'dws_user_value', resourceType: '数据表',
    reason: '营销圈选',
    status: 'rejected',
    createTime: '2025-06-28 09:00',
    approveTime: '2025-06-28 17:00',
    approveComment: '敏感表,需 P4 级审批',
    duration: '30d'
  },
  {
    id: 'app_008',
    type: 'permission_apply',
    title: '申请「征信报告」字段权限',
    applicantId: 'user-chanpin', applicantName: '产品经理',
    approverId: 'user-fengkong', approverName: '风控值班',
    resourceId: 'field_credit_report', resourceName: '征信报告', resourceType: '字段',
    reason: '客户洞察',
    status: 'pending',
    createTime: '2025-07-02 09:15',
    duration: '90d'
  },
  {
    id: 'app_009',
    type: 'tag_apply',
    title: '申请使用「逾期用户」标签',
    applicantId: 'user-fengkong', applicantName: '风控值班',
    resourceId: 'tag_034', resourceName: '逾期用户', resourceType: '标签',
    reason: '催收工单',
    status: 'approved',
    createTime: '2025-05-10 10:00',
    approveTime: '2025-05-10 10:05',
    approveComment: '风控团队自动审批',
    duration: 'permanent'
  },
  {
    id: 'app_010',
    type: 'service_apply',
    title: '申请「数据服务调用」API',
    applicantId: 'user-yunying', applicantName: '王运营',
    approverId: 'user-zhangsan', approverName: '张三',
    resourceId: 'api_data_service', resourceName: '数据服务调用', resourceType: 'API',
    reason: '运营活动',
    status: 'pending',
    createTime: '2025-07-01 16:00',
    duration: 'permanent'
  }
]

// === 业务域 ===
export interface BusinessDomain {
  id: string
  name: string
  code: string
  description: string
  parentId?: string
  ownerId: string
  ownerName: string
  entityCount: number
  tableCount: number
  metricCount: number
  status: 'active' | 'inactive'
}

export const BUSINESS_DOMAINS: BusinessDomain[] = [
  // 一级域
  { id: 'bd_user', name: '用户域', code: 'user_domain', description: '用户基本信息与画像', parentId: undefined, ownerId: 'user-zhangsan', ownerName: '张三', entityCount: 5, tableCount: 8, metricCount: 25, status: 'active' },
  { id: 'bd_risk', name: '风控域', code: 'risk_domain', description: '风控模型与风险指标', parentId: undefined, ownerId: 'user-fengkong', ownerName: '风控值班', entityCount: 4, tableCount: 6, metricCount: 15, status: 'active' },
  { id: 'bd_loan', name: '信贷域', code: 'loan_domain', description: '信贷业务相关', parentId: undefined, ownerId: 'user-xindai', ownerName: '信贷经理', entityCount: 6, tableCount: 10, metricCount: 20, status: 'active' },
  { id: 'bd_finance', name: '财务域', code: 'finance_domain', description: '财务结算与核算', parentId: undefined, ownerId: 'user-caiwu', ownerName: '财务主管', entityCount: 3, tableCount: 5, metricCount: 12, status: 'active' },
  { id: 'bd_marketing', name: '营销域', code: 'marketing_domain', description: '营销活动与渠道', parentId: undefined, ownerId: 'user-yingxiao', ownerName: '营销经理', entityCount: 4, tableCount: 4, metricCount: 10, status: 'active' },
  { id: 'bd_product', name: '产品域', code: 'product_domain', description: '产品功能与版本', parentId: undefined, ownerId: 'user-chanpin', ownerName: '产品经理', entityCount: 5, tableCount: 3, metricCount: 8, status: 'active' },
  { id: 'bd_operation', name: '运营域', code: 'operation_domain', description: '运营活动与客户运营', parentId: undefined, ownerId: 'user-yunying', ownerName: '王运营', entityCount: 3, tableCount: 3, metricCount: 7, status: 'active' },

  // 二级域(用户域下)
  { id: 'bd_user_base', name: '用户基础', code: 'user_base', description: '用户基本信息', parentId: 'bd_user', ownerId: 'user-zhangsan', ownerName: '张三', entityCount: 2, tableCount: 3, metricCount: 8, status: 'active' },
  { id: 'bd_user_behavior', name: '用户行为', code: 'user_behavior', description: '用户操作行为', parentId: 'bd_user', ownerId: 'user-zhaosi', ownerName: '赵六', entityCount: 2, tableCount: 4, metricCount: 12, status: 'active' },
  { id: 'bd_user_value', name: '用户价值', code: 'user_value', description: '用户价值分层', parentId: 'bd_user', ownerId: 'user-wangwu', ownerName: '王五', entityCount: 1, tableCount: 1, metricCount: 5, status: 'active' },

  // 二级域(风控域下)
  { id: 'bd_risk_credit', name: '信用风险', code: 'risk_credit', description: '信用相关风险', parentId: 'bd_risk', ownerId: 'user-fengkong', ownerName: '风控值班', entityCount: 2, tableCount: 3, metricCount: 8, status: 'active' },
  { id: 'bd_risk_fraud', name: '欺诈风险', code: 'risk_fraud', description: '欺诈检测', parentId: 'bd_risk', ownerId: 'user-fengkong', ownerName: '风控值班', entityCount: 2, tableCount: 3, metricCount: 7, status: 'active' },

  // 二级域(信贷域下)
  { id: 'bd_loan_apply', name: '贷款申请', code: 'loan_apply', description: '贷款申请流程', parentId: 'bd_loan', ownerId: 'user-xindai', ownerName: '信贷经理', entityCount: 3, tableCount: 5, metricCount: 10, status: 'active' },
  { id: 'bd_loan_repay', name: '贷款还款', code: 'loan_repay', description: '还款计划与逾期', parentId: 'bd_loan', ownerId: 'user-xindai', ownerName: '信贷经理', entityCount: 3, tableCount: 5, metricCount: 10, status: 'active' },

  // 二级域(财务域下)
  { id: 'bd_finance_settle', name: '财务结算', code: 'finance_settle', description: '结算与清分', parentId: 'bd_finance', ownerId: 'user-caiwu', ownerName: '财务主管', entityCount: 2, tableCount: 3, metricCount: 8, status: 'active' },
  { id: 'bd_finance_billing', name: '财务计费', code: 'finance_billing', description: '计费规则与流水', parentId: 'bd_finance', ownerId: 'user-caiwu', ownerName: '财务主管', entityCount: 1, tableCount: 2, metricCount: 4, status: 'active' }
]

export const CrowdQueryStore = {
  list() { return CROWD_QUERIES },
  byId: (id: string) => CROWD_QUERIES.find(q => q.id === id),
  byOwner: (ownerId: string) => CROWD_QUERIES.filter(q => q.ownerId === ownerId)
}

export const ApplicationStore = {
  list() { return APPLICATIONS },
  byId: (id: string) => APPLICATIONS.find(a => a.id === id),
  byApplicant: (applicantId: string) => APPLICATIONS.filter(a => a.applicantId === applicantId),
  byApprover: (approverId: string) => APPLICATIONS.filter(a => a.approverId === approverId),
  byStatus: (status: string) => APPLICATIONS.filter(a => a.status === status),
  pending: () => APPLICATIONS.filter(a => a.status === 'pending'),
  stats() {
    return {
      total: APPLICATIONS.length,
      pending: APPLICATIONS.filter(a => a.status === 'pending').length,
      approved: APPLICATIONS.filter(a => a.status === 'approved').length,
      rejected: APPLICATIONS.filter(a => a.status === 'rejected').length,
      byType: {
        metric: APPLICATIONS.filter(a => a.type === 'metric_apply').length,
        data: APPLICATIONS.filter(a => a.type === 'data_apply').length,
        tag: APPLICATIONS.filter(a => a.type === 'tag_apply').length,
        permission: APPLICATIONS.filter(a => a.type === 'permission_apply').length,
        service: APPLICATIONS.filter(a => a.type === 'service_apply').length
      }
    }
  }
}

export const BusinessDomainStore = {
  list() { return BUSINESS_DOMAINS },
  topLevel() { return BUSINESS_DOMAINS.filter(b => !b.parentId) },
  children(parentId: string) { return BUSINESS_DOMAINS.filter(b => b.parentId === parentId) },
  byId: (id: string) => BUSINESS_DOMAINS.find(b => b.id === id),
  byOwner: (ownerId: string) => BUSINESS_DOMAINS.filter(b => b.ownerId === ownerId)
}

export const workflowDirectoryMocks: MockMethod[] = [
  // 圈选规则
  {
    url: '/api/crowd-query/list',
    method: 'get',
    response: () => ({ code: 0, data: CROWD_QUERIES, total: CROWD_QUERIES.length })
  },
  // 工单/审批
  {
    url: '/api/application/list',
    method: 'get',
    response: ({ query }: { query: { status?: string; applicantId?: string; type?: string } }) => {
      let result = APPLICATIONS
      if (query.status) result = result.filter(a => a.status === query.status)
      if (query.applicantId) result = result.filter(a => a.applicantId === query.applicantId)
      if (query.type) result = result.filter(a => a.type === query.type)
      return { code: 0, data: result, total: result.length }
    }
  },
  {
    url: '/api/application/stats',
    method: 'get',
    response: () => ({ code: 0, data: ApplicationStore.stats() })
  },
  // 业务域
  {
    url: '/api/business-domain/list',
    method: 'get',
    response: ({ query }: { query: { parentId?: string } }) => {
      let result = BUSINESS_DOMAINS
      if (query.parentId === '') {
        result = BUSINESS_DOMAINS.filter(b => !b.parentId)
      } else if (query.parentId) {
        result = BUSINESS_DOMAINS.filter(b => b.parentId === query.parentId)
      }
      return { code: 0, data: result, total: result.length }
    }
  }
]