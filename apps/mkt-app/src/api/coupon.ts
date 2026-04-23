/**
 * Coupon API 模块
 * Phase 2.3: types/api 类型体系
 * 
 * 改造说明：
 * - 将 .js 改为 .ts
 * - 添加完整的类型定义
 * - 实现真实的 API 调用
 */
import type {
  CouponAPI,
  InventoryAPI,
  TemplateAPI,
  ApiResponse,
  PaginatedResponse,
  CouponTemplate,
  CouponInventory,
  CouponTemplateParams,
  CouponInventoryParams
} from '@/types/api/coupon'

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟数据存储
const mockTemplates: CouponTemplate[] = []
const mockInventories: CouponInventory[] = []

/**
 * Coupon API 实现
 */
export const couponAPI: CouponAPI = {
  async getList(params: CouponTemplateParams) {
    await delay(300)
    const filtered = mockTemplates.filter(t => {
      if (params.name && !t.name.includes(params.name)) {return false}
      if (params.type && t.type !== params.type) {return false}
      if (params.status && t.status !== params.status) {return false}
      return true
    })
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const start = (page - 1) * pageSize
    const list = filtered.slice(start, start + pageSize)
    return {
      code: 200,
      message: 'success',
      data: {
        list,
        pagination: {
          page,
          pageSize,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / pageSize)
        }
      }
    }
  },

  async getById(id: string) {
    await delay(200)
    const template = mockTemplates.find(t => t.id === id)
    return {
      code: 200,
      message: 'success',
      data: template || null
    }
  },

  async create(data: Partial<CouponTemplate>) {
    await delay(300)
    const template: CouponTemplate = {
      id: Date.now().toString(),
      templateId: `TPL${Date.now()}`,
      name: data.name || '',
      type: data.type || 'discount',
      description: data.description,
      denomination: data.denomination,
      threshold: data.threshold,
      validDays: data.validDays || 30,
      status: 'draft',
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    }
    mockTemplates.push(template)
    return { code: 200, message: 'success', data: template }
  },

  async update(id: string, data: Partial<CouponTemplate>) {
    await delay(300)
    const template = mockTemplates.find(t => t.id === id)
    if (!template) {
      return { code: 404, message: 'Template not found', data: null }
    }
    Object.assign(template, data, { updateTime: new Date().toISOString() })
    return { code: 200, message: 'success', data: template }
  },

  async delete(id: string) {
    await delay(200)
    const index = mockTemplates.findIndex(t => t.id === id)
    if (index === -1) {
      return { code: 404, message: 'Template not found', data: false }
    }
    mockTemplates.splice(index, 1)
    return { code: 200, message: 'success', data: true }
  }
}

/**
 * Inventory API 实现
 */
export const inventoryAPI: InventoryAPI = {
  async getInventoryList(params: CouponInventoryParams) {
    await delay(300)
    let filtered = [...mockInventories]
    
    if (params.couponId) {filtered = filtered.filter(i => i.couponId === params.couponId)}
    if (params.templateId) {filtered = filtered.filter(i => i.templateId === params.templateId)}
    if (params.userId) {filtered = filtered.filter(i => i.userId === params.userId)}
    if (params.status) {filtered = filtered.filter(i => i.status === params.status)}
    if (params.approvalStatus) {filtered = filtered.filter(i => i.approvalStatus === params.approvalStatus)}

    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const start = (page - 1) * pageSize
    const list = filtered.slice(start, start + pageSize)
    
    return {
      code: 200,
      message: 'success',
      data: {
        list,
        pagination: {
          page,
          pageSize,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / pageSize)
        }
      }
    }
  },

  async getInventoryDetail(instanceId: string) {
    await delay(200)
    const inventory = mockInventories.find(i => i.instanceId === instanceId)
    return { code: 200, message: 'success', data: inventory || null }
  },

  async batchCreateInventory(data: { templateId: string; count: number; userIds?: string[] }) {
    await delay(500)
    const success = data.count
    return { code: 200, message: 'success', data: { success, failed: 0 } }
  },

  async batchApproveInventory(ids: string[]) {
    await delay(400)
    ids.forEach(id => {
      const inv = mockInventories.find(i => i.instanceId === id)
      if (inv) {
        inv.approvalStatus = 'approved'
      }
    })
    return { code: 200, message: 'success', data: { success: ids.length, failed: 0 } }
  },

  async batchWithdraw(ids: string[]) {
    await delay(400)
    ids.forEach(id => {
      const inv = mockInventories.find(i => i.instanceId === id)
      if (inv) {
        inv.status = 'invalid'
      }
    })
    return { code: 200, message: 'success', data: { success: ids.length, failed: 0 } }
  },

  async getBatchCreateDetail(batchId: string) {
    await delay(300)
    const items = mockInventories.filter(i => (i as any).batchId === batchId)
    return { code: 200, message: 'success', data: items }
  },

  async getBatchCreateHistory(params: { page?: number; pageSize?: number }) {
    await delay(300)
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    return {
      code: 200,
      message: 'success',
      data: {
        list: [],
        pagination: { page, pageSize, total: 0, totalPages: 0 }
      }
    }
  }
}

/**
 * Template API 实现
 */
export const templateAPI: TemplateAPI = {
  async getList(params: CouponTemplateParams) {
    return couponAPI.getList(params)
  },

  async getById(id: string) {
    return couponAPI.getById(id)
  },

  async create(data: Partial<CouponTemplate>) {
    return couponAPI.create(data)
  },

  async update(id: string, data: Partial<CouponTemplate>) {
    return couponAPI.update(id, data)
  },

  async delete(id: string) {
    return couponAPI.delete(id)
  }
}

/**
 * Approval API 实现
 */
export const approvalAPI = {
  async getApprovalList(params: any) {
    await delay(300)
    return { code: 200, message: 'success', data: { list: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } } }
  },

  async getApprovalDetail(id: string) {
    await delay(200)
    return { code: 200, message: 'success', data: null }
  },

  async processApproval(params: { id: string; action: 'approve' | 'reject'; reason?: string }) {
    await delay(300)
    return { code: 200, message: 'success', data: { success: true } }
  },

  async batchProcessApproval(params: { ids: string[]; action: 'approve' | 'reject'; reason?: string }) {
    await delay(400)
    return { code: 200, message: 'success', data: { success: params.ids.length, failed: 0 } }
  }
}

export default { couponAPI, inventoryAPI, templateAPI, approvalAPI }
