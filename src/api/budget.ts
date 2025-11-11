import { request } from '@/utils/request'
import type { 
  Budget, 
  BudgetStatistics, 
  ProjectStatistics, 
  BudgetProjectRelation,
  BudgetSearchParams,
  BudgetCreateParams,
  BudgetUpdateParams,
  VerificationRecord,
  VerificationCreateParams
} from '@/types/budget'

/**
 * 预算管理API服务
 */
export class BudgetApiService {
  /**
   * 获取预算列表
   */
  async getBudgets(params: BudgetSearchParams): Promise<{
    list: Budget[]
    total: number
    page: number
    pageSize: number
  }> {
    const response = await request.get('/api/budgets', { params })
    return response
  }

  /**
   * 获取预算详情
   */
  async getBudget(id: string): Promise<Budget> {
    const response = await request.get(`/api/budgets/${id}`)
    return response
  }

  /**
   * 创建预算
   */
  async createBudget(params: BudgetCreateParams): Promise<Budget> {
    const response = await request.post('/api/budgets', params)
    return response
  }

  /**
   * 更新预算
   */
  async updateBudget(id: string, params: BudgetUpdateParams): Promise<Budget> {
    const response = await request.put(`/api/budgets/${id}`, params)
    return response
  }

  /**
   * 删除预算
   */
  async deleteBudget(id: string): Promise<boolean> {
    await request.delete(`/api/budgets/${id}`)
    return true
  }

  /**
   * 批量删除预算
   */
  async batchDeleteBudgets(ids: string[]): Promise<boolean> {
    await request.delete('/api/budgets/batch', { data: { ids } })
    return true
  }

  /**
   * 批量审批预算
   */
  async batchApproveBudgets(ids: string[]): Promise<{
    success: boolean
    message: string
    failedIds?: string[]
  }> {
    const response = await request.post('/api/budgets/batch-approve', { ids })
    return response
  }

  /**
   * 获取预算统计
   */
  async getBudgetStatistics(): Promise<BudgetStatistics> {
    const response = await request.get('/api/budgets/statistics')
    return response
  }

  /**
   * 获取项目统计
   */
  async getProjectStatistics(): Promise<ProjectStatistics> {
    const response = await request.get('/api/projects/statistics')
    return response
  }

  /**
   * 获取预算-项目关联关系
   */
  async getBudgetProjectRelations(): Promise<BudgetProjectRelation[]> {
    const response = await request.get('/api/budgets/relations')
    return response
  }

  /**
   * 获取核销记录
   */
  async getVerificationRecords(params: {
    budgetId?: string
    projectId?: string
    status?: string
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
  }): Promise<{
    list: VerificationRecord[]
    total: number
    page: number
    pageSize: number
  }> {
    const response = await request.get('/api/verifications', { params })
    return response
  }

  /**
   * 创建核销记录
   */
  async createVerification(params: VerificationCreateParams): Promise<VerificationRecord> {
    const response = await request.post('/api/verifications', params)
    return response
  }

  /**
   * 批量核销
   */
  async batchVerification(params: {
    budgetId: string
    projectIds: string[]
    verificationAmount: number
    verificationDate: string
    description?: string
  }): Promise<{
    success: boolean
    message: string
    failedProjectIds?: string[]
  }> {
    const response = await request.post('/api/verifications/batch', params)
    return response
  }

  /**
   * 审核核销记录
   */
  async approveVerification(id: string): Promise<VerificationRecord> {
    const response = await request.post(`/api/verifications/${id}/approve`)
    return response
  }

  /**
   * 撤销核销记录
   */
  async revokeVerification(id: string): Promise<VerificationRecord> {
    const response = await request.post(`/api/verifications/${id}/revoke`)
    return response
  }

  /**
   * 获取采购项目列表
   */
  async getProjects(params: BudgetSearchParams): Promise<{
    list: any[]
    total: number
    page: number
    pageSize: number
  }> {
    const response = await request.get('/api/projects', { params })
    return response
  }

  /**
   * 获取采购项目详情
   */
  async getProject(id: string): Promise<any> {
    const response = await request.get(`/api/projects/${id}`)
    return response
  }

  /**
   * 创建采购项目
   */
  async createProject(params: any): Promise<any> {
    const response = await request.post('/api/projects', params)
    return response
  }

  /**
   * 更新采购项目
   */
  async updateProject(id: string, params: any): Promise<any> {
    const response = await request.put(`/api/projects/${id}`, params)
    return response
  }

  /**
   * 删除采购项目
   */
  async deleteProject(id: string): Promise<boolean> {
    await request.delete(`/api/projects/${id}`)
    return true
  }

  /**
   * 关联预算和项目
   */
  async associateBudgetWithProject(budgetId: string, projectId: string): Promise<boolean> {
    const response = await request.post('/api/budgets/associate', {
      budgetId,
      projectId
    })
    return response
  }

  /**
   * 更新项目状态
   */
  async updateProjectStatus(id: string, status: string): Promise<any> {
    const response = await request.post(`/api/projects/${id}/status`, { status })
    return response
  }

  /**
   * 导出预算数据
   */
  async exportBudgetData(params: BudgetSearchParams): Promise<void> {
    await request.download(
      '/api/budgets/export',
      params,
      `预算数据_${new Date().toISOString().split('T')[0]}.xlsx`
    )
  }

  /**
 * 获取预警统计
   */
  async getAlertStatistics(): Promise<{
    totalAlerts: number
    unreadAlerts: number
    highLevelAlerts: number
    mediumLevelAlerts: number
    lowLevelAlerts: number
  }> {
    const response = await request.get('/api/alerts/statistics')
    return response
  }

  /**
   * 获取预算关联的采购项目
   */
  async getRelatedProjects(budgetId: string): Promise<any[]> {
    const response = await request.get(`/api/budgets/${budgetId}/projects`)
    return response
  }
}

// 创建单例实例
export const budgetApiService = new BudgetApiService()