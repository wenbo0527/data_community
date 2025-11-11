import { request } from '@/utils/request'
import type { PurchaseProject, PurchaseProjectSearchParams, PageResponse } from '@/types/purchase-project'

/**
 * 采购项目API服务
 */
export const purchaseProjectApiService = {
  /**
   * 获取采购项目列表
   */
  async getProjectList(params: PurchaseProjectSearchParams): Promise<PageResponse<PurchaseProject>> {
    const response = await request.get('/api/purchase-projects', { params })
    return response
  },

  /**
   * 获取采购项目详情
   */
  async getProjectDetail(id: string): Promise<PurchaseProject> {
    const response = await request.get(`/api/purchase-projects/${id}`)
    return response
  },

  /**
   * 创建采购项目
   */
  async createProject(data: Omit<PurchaseProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<PurchaseProject> {
    const response = await request.post('/api/purchase-projects', data)
    return response
  },

  /**
   * 更新采购项目
   */
  async updateProject(id: string, data: Partial<PurchaseProject>): Promise<PurchaseProject> {
    const response = await request.put(`/api/purchase-projects/${id}`, data)
    return response
  },

  /**
   * 删除采购项目
   */
  async deleteProject(id: string): Promise<void> {
    await request.delete(`/api/purchase-projects/${id}`)
  },

  /**
   * 批量删除采购项目
   */
  async batchDeleteProjects(ids: string[]): Promise<void> {
    await request.delete('/api/purchase-projects/batch', { data: { ids } })
  },

  /**
   * 关联预算和项目
   */
  async associateBudget(projectId: string, budgetId: string): Promise<void> {
    const response = await request.post('/api/purchase-projects/associate', {
      projectId,
      budgetId
    })
    return response
  },

  /**
   * 取消关联预算和项目
   */
  async disassociateBudget(projectId: string, budgetId: string): Promise<void> {
    const response = await request.delete('/api/purchase-projects/disassociate', {
      data: { projectId, budgetId }
    })
    return response
  },

  /**
   * 更新项目状态
   */
  async updateProjectStatus(projectId: string, status: string): Promise<PurchaseProject> {
    const response = await request.put(`/api/purchase-projects/${projectId}/status`, { status })
    return response
  },

  /**
   * 获取项目统计
   */
  async getProjectStatistics(): Promise<{
    totalProjects: number
    executingProjects: number
    completedProjects: number
    totalAmount: number
    executingAmount: number
    completedAmount: number
  }> {
    const response = await request.get('/api/purchase-projects/statistics')
    return response
  }
}

export default purchaseProjectApiService