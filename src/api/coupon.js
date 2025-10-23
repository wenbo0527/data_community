// 优惠券相关API接口

// 模拟API延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 券模板相关API
export const templateAPI = {
  // 获取券模板列表
  async getTemplateList(params = {}) {
    await delay(500)
    // TODO: 替换为真实API调用
    return {
      code: 200,
      data: {
        list: [
          {
            id: 'TPL001',
            name: '新人专享券',
            type: 'interest_free',
            status: 'online',
            createTime: '2024-01-15 10:30:00',
            creator: '张三',
            validityPeriod: ['2024-01-01', '2024-12-31'],
            applicableScope: '全产品'
          }
        ],
        total: 1,
        current: params.current || 1,
        pageSize: params.pageSize || 10
      },
      message: 'success'
    }
  },

  // 创建券模板
  async createTemplate(data) {
    await delay(1000)
    // TODO: 替换为真实API调用
    return {
      code: 200,
      data: {
        id: 'TPL' + Date.now(),
        ...data
      },
      message: '创建成功'
    }
  },

  // 更新券模板
  async updateTemplate(id, data) {
    await delay(800)
    // TODO: 替换为真实API调用
    return {
      code: 200,
      data: { id, ...data },
      message: '更新成功'
    }
  },

  // 删除券模板
  async deleteTemplate(id) {
    await delay(500)
    // TODO: 替换为真实API调用
    return {
      code: 200,
      message: '删除成功'
    }
  },

  // 上线/下线券模板
  async toggleTemplateStatus(id, status) {
    await delay(600)
    // TODO: 替换为真实API调用
    return {
      code: 200,
      data: { id, status },
      message: status === 'online' ? '上线成功' : '下线成功'
    }
  }
}

// 券库存相关API
export const inventoryAPI = {
  // 获取库存列表
  async getInventoryList(params = {}) {
    await delay(800)
    
    const mockData = [
      {
        id: '1',
        templateName: '新用户专享免息券',
        templateId: 'TPL001',
        totalCount: 10000,
        usedCount: 2500,
        remainingCount: 7500,
        status: 'active',
        createTime: '2024-01-15 10:30:00',
        expireTime: '2024-12-31 23:59:59',
        approvalStatus: 'pending'
      },
      {
        id: '2',
        templateName: '老用户回馈折扣券',
        templateId: 'TPL002',
        totalCount: 5000,
        usedCount: 1200,
        remainingCount: 3800,
        status: 'active',
        createTime: '2024-01-20 14:20:00',
        expireTime: '2024-06-30 23:59:59',
        approvalStatus: 'approved'
      },
      {
        id: '3',
        templateName: '节日特惠券',
        templateId: 'TPL003',
        totalCount: 8000,
        usedCount: 8000,
        remainingCount: 0,
        status: 'expired',
        createTime: '2024-02-01 09:00:00',
        expireTime: '2024-02-29 23:59:59',
        approvalStatus: 'rejected'
      },
      {
        id: '4',
        templateName: '生日专属券',
        templateId: 'TPL004',
        totalCount: 3000,
        usedCount: 500,
        remainingCount: 2500,
        status: 'inactive',
        createTime: '2024-03-01 16:45:00',
        expireTime: '2024-12-31 23:59:59',
        approvalStatus: 'none'
      }
    ]
    
    return {
      code: 200,
      message: 'success',
      data: {
        list: mockData,
        total: mockData.length,
        page: params.page || 1,
        pageSize: params.pageSize || 10
      }
    }
  },

  // 批量撤回券
  async batchWithdraw(couponIds) {
    await delay(1000)
    
    // 模拟撤回操作
    console.log('撤回券ID:', couponIds)
    
    return {
      code: 200,
      message: '撤回成功',
      data: {
        successCount: couponIds.length,
        failedCount: 0
      }
    }
  },

  // 导出券数据
  async exportCouponData(params = {}) {
    await delay(2000)
    // TODO: 替换为真实API调用
    return {
      code: 200,
      data: {
        downloadUrl: 'https://example.com/export/coupons.xlsx',
        fileName: `券库存数据_${new Date().toISOString().split('T')[0]}.xlsx`
      },
      message: '导出成功'
    }
  }
}

// 审批相关API
export const approvalAPI = {
  // 提交审批申请
  async submitApproval(data) {
    await delay(1500)
    // TODO: 替换为真实API调用
    return {
      code: 200,
      data: {
        id: 'AP' + Date.now(),
        ...data,
        status: 'pending',
        createTime: new Date().toISOString()
      },
      message: '审批申请已提交'
    }
  },

  // 获取审批历史
  async getApprovalHistory(params = {}) {
    await delay(600)
    // TODO: 替换为真实API调用
    return {
      code: 200,
      data: {
        list: [
          {
            id: 'AP001',
            templateName: '新人专享券',
            couponCount: 1000,
            applicant: '张三',
            approver: '李四',
            priority: 'high',
            status: 'approved',
            createTime: '2024-01-15 10:30:00',
            approvalTime: '2024-01-15 14:20:00',
            approvalReason: '新用户拉新活动需要',
            rejectReason: ''
          }
        ],
        total: 50,
        current: params.current || 1,
        pageSize: params.pageSize || 10
      },
      message: 'success'
    }
  },

  // 处理审批
  async processApproval(id, decision, reason = '') {
    await delay(1000)
    // TODO: 替换为真实API调用
    return {
      code: 200,
      data: {
        id,
        status: decision === 'approve' ? 'approved' : 'rejected',
        approvalTime: new Date().toISOString(),
        rejectReason: reason
      },
      message: decision === 'approve' ? '审批通过' : '审批拒绝'
    }
  },

  // 撤销审批申请
  async cancelApproval(id) {
    await delay(500)
    // TODO: 替换为真实API调用
    return {
      code: 200,
      data: { id, status: 'cancelled' },
      message: '申请已撤销'
    }
  },

  // 获取审批人列表
  async getApproverList() {
    await delay(300)
    // TODO: 替换为真实API调用
    return {
      code: 200,
      data: [
        { id: 'user001', name: '张三', department: '营销部' },
        { id: 'user002', name: '李四', department: '风控部' },
        { id: 'user003', name: '王五', department: '产品部' },
        { id: 'user004', name: '赵六', department: '运营部' }
      ],
      message: 'success'
    }
  }
}

// 用户相关API
export const userAPI = {
  // 获取用户群体列表
  async getUserGroups() {
    await delay(400)
    // TODO: 替换为真实API调用
    return {
      code: 200,
      data: [
        { value: 'new_users', label: '新用户', count: 1250 },
        { value: 'active_users', label: '活跃用户', count: 8900 },
        { value: 'vip_users', label: 'VIP用户', count: 450 },
        { value: 'custom', label: '自定义用户群', count: 0 }
      ],
      message: 'success'
    }
  },

  // 获取产品列表
  async getProductList() {
    await delay(300)
    // TODO: 替换为真实API调用
    return {
      code: 200,
      data: [
        { value: 'SELF_APP', label: '自营APP' },
        { value: 'PARTNER_LOAN', label: '合作贷款' },
        { value: 'CREDIT_CARD', label: '信用卡' }
      ],
      message: 'success'
    }
  }
}

// 统一错误处理
export const handleAPIError = (error) => {
  console.error('API Error:', error)
  
  if (error.response) {
    // 服务器响应错误
    const { status, data } = error.response
    switch (status) {
      case 400:
        return { message: data.message || '请求参数错误' }
      case 401:
        return { message: '未授权，请重新登录' }
      case 403:
        return { message: '权限不足' }
      case 404:
        return { message: '请求的资源不存在' }
      case 500:
        return { message: '服务器内部错误' }
      default:
        return { message: data.message || '请求失败' }
    }
  } else if (error.request) {
    // 网络错误
    return { message: '网络连接失败，请检查网络' }
  } else {
    // 其他错误
    return { message: error.message || '未知错误' }
  }
}

// API响应拦截器
export const responseInterceptor = (response) => {
  const { code, data, message } = response.data
  
  if (code === 200) {
    return { success: true, data, message }
  } else {
    return { success: false, message: message || '请求失败' }
  }
}

// 单独导出的函数，用于兼容现有的导入方式
export const createCouponTemplate = (data) => templateAPI.createTemplate(data)
export const updateCouponTemplate = (id, data) => templateAPI.updateTemplate(id, data)
export const getCouponTemplateDetail = (id) => templateAPI.getTemplateDetail ? templateAPI.getTemplateDetail(id) : Promise.resolve({ code: 200, data: {}, message: 'success' })

// 导出默认配置
export default {
  templateAPI,
  inventoryAPI,
  approvalAPI,
  userAPI,
  handleAPIError,
  responseInterceptor
}