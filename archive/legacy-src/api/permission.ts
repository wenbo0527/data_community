/**
 * 权限 API(Mock 实现)
 *
 * 提供权限申请/审批/管理所需的 API 方法
 * 数据来源:pages/management/permission/mock.js 的本地 mock 数据
 *
 * @see 文档 §5 字段权限申请
 */

import type { MockMethod } from 'vite-plugin-mock'

// ===== 类型定义 =====

export type ApplicationStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'expired'
export type PermissionType = 'read' | 'write'
export type ResourceType = 'table' | 'column' | 'api' | 'report' | 'metric'

export interface PermissionApplication {
  id: string
  applicant: string
  applicantId: string
  department: string
  resourceType: ResourceType
  resourceName: string
  resourcePath: string
  permissionType: PermissionType
  reason: string
  usage: 'data_analysis' | 'risk_modeling' | 'marketing' | 'report' | 'other'
  validFrom: string
  validTo: string
  status: ApplicationStatus
  approver?: string
  approverComment?: string
  createTime: string
  updateTime: string
}

export interface ApprovalFlow {
  id: string
  applicationId: string
  steps: Array<{
    order: number
    approverRole: string
    approverName: string
    action?: 'approved' | 'rejected' | 'forwarded'
    comment?: string
    timestamp?: string
  }>
}

export interface PermissionHistory {
  id: string
  applicationId: string
  action: 'created' | 'submitted' | 'approved' | 'rejected' | 'withdrawn' | 'renewed' | 'revoked'
  operator: string
  comment?: string
  timestamp: string
}

// ===== Mock 数据 =====

const MOCK_APPLICATIONS: PermissionApplication[] = [
  {
    id: 'APP-2025-001',
    applicant: '王运营',
    applicantId: 'user-yunying',
    department: '运营部',
    resourceType: 'column',
    resourceName: 'dim_user.id_card_no',
    resourcePath: '/home/discovery/asset-detail/dim_user',
    permissionType: 'read',
    reason: '需要按身份证号关联客户画像数据,做精准营销活动',
    usage: 'marketing',
    validFrom: '2025-08-01',
    validTo: '2026-02-01',
    status: 'approved',
    approver: '张三',
    approverComment: '同意使用,但需脱敏展示',
    createTime: '2025-07-25 10:30',
    updateTime: '2025-07-26 14:20'
  },
  {
    id: 'APP-2025-002',
    applicant: '李建模',
    applicantId: 'user-fengkong',
    department: '风控中心',
    resourceType: 'table',
    resourceName: 'dws_risk_score',
    resourcePath: '/home/discovery/asset-detail/dws_risk_score',
    permissionType: 'read',
    reason: '构建信用评分模型,需要历史评分数据',
    usage: 'risk_modeling',
    validFrom: '2025-08-01',
    validTo: '2025-11-01',
    status: 'pending',
    createTime: '2025-07-30 09:15',
    updateTime: '2025-07-30 09:15'
  },
  {
    id: 'APP-2025-003',
    applicant: '张分析',
    applicantId: 'user-zhangsan',
    department: '数据团队',
    resourceType: 'api',
    resourceName: 'api_credit_query',
    resourcePath: '/home/discovery/api-market',
    permissionType: 'read',
    reason: '信贷产品接入征信查询',
    usage: 'data_analysis',
    validFrom: '2025-08-10',
    validTo: '2026-02-10',
    status: 'pending',
    createTime: '2025-08-05 14:00',
    updateTime: '2025-08-05 14:00'
  },
  {
    id: 'APP-2025-004',
    applicant: '赵运营',
    applicantId: 'user-zhaosi',
    department: '行为平台',
    resourceType: 'column',
    resourceName: 'fact_user_event.mobile',
    resourcePath: '/home/discovery/asset-detail/fact_user_event',
    permissionType: 'read',
    reason: '用户行为分析,需手机号关联',
    usage: 'data_analysis',
    validFrom: '2025-08-15',
    validTo: '2025-11-15',
    status: 'draft',
    createTime: '2025-08-08 09:30',
    updateTime: '2025-08-08 09:30'
  },
  {
    id: 'APP-2025-005',
    applicant: '王运营',
    applicantId: 'user-yunying',
    department: '运营部',
    resourceType: 'report',
    resourceName: 'CEO 经营看板',
    resourcePath: '/home/exploration/indicator-dashboard',
    permissionType: 'read',
    reason: '查看经营看板',
    usage: 'report',
    validFrom: '2025-07-01',
    validTo: '2025-12-31',
    status: 'expired',
    createTime: '2025-06-25 10:00',
    updateTime: '2025-07-01 00:00'
  }
]

const MOCK_FLOWS: ApprovalFlow[] = [
  {
    id: 'FLOW-001',
    applicationId: 'APP-2025-001',
    steps: [
      { order: 1, approverRole: '数据 Owner', approverName: '张三', action: 'approved', comment: '同意使用,但需脱敏', timestamp: '2025-07-26 14:20' },
      { order: 2, approverRole: '数据治理组', approverName: '治理值班', action: 'approved', comment: '合规审查通过', timestamp: '2025-07-26 16:00' }
    ]
  }
]

const MOCK_HISTORY: PermissionHistory[] = [
  { id: 'H001', applicationId: 'APP-2025-001', action: 'created', operator: '王运营', timestamp: '2025-07-25 10:30' },
  { id: 'H002', applicationId: 'APP-2025-001', action: 'submitted', operator: '王运营', timestamp: '2025-07-25 11:00' },
  { id: 'H003', applicationId: 'APP-2025-001', action: 'approved', operator: '张三', comment: '同意使用,但需脱敏', timestamp: '2025-07-26 14:20' }
]

// ===== API 函数 =====

/** 获取我的申请列表 */
export async function getMyApplications(params: { userId?: string; status?: ApplicationStatus; keyword?: string } = {}): Promise<PermissionApplication[]> {
  await delay(150)
  let result = [...MOCK_APPLICATIONS]
  if (params.userId) result = result.filter(a => a.applicantId === params.userId)
  if (params.status) result = result.filter(a => a.status === params.status)
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    result = result.filter(a =>
      a.resourceName.toLowerCase().includes(kw) ||
      a.reason.toLowerCase().includes(kw) ||
      a.id.toLowerCase().includes(kw)
    )
  }
  return result
}

/** 获取待我审批的申请列表 */
export async function getPendingApplications(params: { approverId?: string } = {}): Promise<PermissionApplication[]> {
  await delay(150)
  return MOCK_APPLICATIONS.filter(a => a.status === 'pending')
}

/** 获取我拥有的权限 */
export async function getMyPermissions(params: { userId?: string } = {}): Promise<PermissionApplication[]> {
  await delay(150)
  return MOCK_APPLICATIONS.filter(a => a.applicantId === params.userId && a.status === 'approved')
}

/** 审批通过 */
export async function approveApplication(id: string, comment: string): Promise<{ success: boolean; application: PermissionApplication }> {
  await delay(200)
  const app = MOCK_APPLICATIONS.find(a => a.id === id)
  if (!app) throw new Error('申请不存在')
  app.status = 'approved'
  app.approverComment = comment
  app.approver = '当前用户'
  app.updateTime = new Date().toISOString()
  return { success: true, application: app }
}

/** 审批拒绝 */
export async function rejectApplication(id: string, comment: string): Promise<{ success: boolean; application: PermissionApplication }> {
  await delay(200)
  const app = MOCK_APPLICATIONS.find(a => a.id === id)
  if (!app) throw new Error('申请不存在')
  app.status = 'rejected'
  app.approverComment = comment
  app.approver = '当前用户'
  app.updateTime = new Date().toISOString()
  return { success: true, application: app }
}

/** 转发审批 */
export async function forwardApplication(id: string, target: string, comment: string): Promise<{ success: boolean }> {
  await delay(200)
  return { success: true }
}

/** 撤回申请 */
export async function withdrawApplication(id: string, reason: string): Promise<{ success: boolean }> {
  await delay(200)
  const app = MOCK_APPLICATIONS.find(a => a.id === id)
  if (app) {
    app.status = 'draft'
    app.updateTime = new Date().toISOString()
  }
  return { success: true }
}

/** 撤销权限 */
export async function revokePermission(id: string, reason: string): Promise<{ success: boolean }> {
  await delay(200)
  const app = MOCK_APPLICATIONS.find(a => a.id === id)
  if (app) {
    app.status = 'expired'
    app.updateTime = new Date().toISOString()
  }
  return { success: true }
}

/** 续期权限 */
export async function renewPermission(id: string, months: number): Promise<{ success: boolean; application: PermissionApplication }> {
  await delay(200)
  const app = MOCK_APPLICATIONS.find(a => a.id === id)
  if (!app) throw new Error('权限不存在')
  const newValidTo = new Date()
  newValidTo.setMonth(newValidTo.getMonth() + months)
  app.validTo = newValidTo.toISOString().slice(0, 10)
  app.updateTime = new Date().toISOString()
  return { success: true, application: app }
}

/** 获取申请详情 */
export async function getApplicationDetail(id: string): Promise<PermissionApplication | null> {
  await delay(150)
  return MOCK_APPLICATIONS.find(a => a.id === id) || null
}

/** 获取审批流程 */
export async function getApplicationFlow(applicationId: string): Promise<ApprovalFlow | null> {
  await delay(150)
  return MOCK_FLOWS.find(f => f.applicationId === applicationId) || null
}

/** 获取申请历史 */
export async function getApplicationHistory(applicationId: string): Promise<PermissionHistory[]> {
  await delay(150)
  return MOCK_HISTORY.filter(h => h.applicationId === applicationId)
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ===== HTTP Mock 端点(供 vite-plugin-mock 使用)=====

export const permissionMocks: MockMethod[] = [
  {
    url: '/api/permission/my-applications',
    method: 'get',
    response: ({ query }: { query: any }) => getMyApplications(query)
  },
  {
    url: '/api/permission/pending',
    method: 'get',
    response: () => ({ code: 0, data: MOCK_APPLICATIONS.filter(a => a.status === 'pending') })
  },
  {
    url: '/api/permission/detail/:id',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const id = url.split('/').pop() || ''
      const app = MOCK_APPLICATIONS.find(a => a.id === id)
      return { code: 0, data: app }
    }
  },
  {
    url: '/api/permission/approve',
    method: 'post',
    response: ({ body }: { body: any }) => ({ code: 0, data: { success: true } })
  },
  {
    url: '/api/permission/reject',
    method: 'post',
    response: ({ body }: { body: any }) => ({ code: 0, data: { success: true } })
  }
]