// 权限申请模块Mock数据

// 模拟延迟
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// 生成UUID
const generateId = () => Math.random().toString(36).substr(2, 9)

// 生成申请编号
const generateApplicationNo = () => `APP${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`

// 模拟用户数据
const mockUsers = [
  { id: 'user1', name: '张三', department: '数据部门', email: 'zhangsan@company.com' },
  { id: 'user2', name: '李四', department: '技术部门', email: 'lisi@company.com' },
  { id: 'user3', name: '王五', department: '业务部门', email: 'wangwu@company.com' },
  { id: 'user4', name: '赵六', department: '安全部门', email: 'zhaoliu@company.com' },
  { id: 'user5', name: '钱七', department: '管理层', email: 'qianqi@company.com' }
]

// 模拟资源数据
const mockResources = [
  { id: 'res1', name: '用户行为数据表', type: 'table', sensitivityLevel: 'sensitive', database: 'analytics', schema: 'public' },
  { id: 'res2', name: '销售数据表', type: 'table', sensitivityLevel: 'core', database: 'sales', schema: 'public' },
  { id: 'res3', name: '产品信息表', type: 'table', sensitivityLevel: 'normal', database: 'product', schema: 'public' },
  { id: 'res4', name: '月度销售指标', type: 'metric', sensitivityLevel: 'sensitive', category: 'sales' },
  { id: 'res5', name: '用户增长指标', type: 'metric', sensitivityLevel: 'core', category: 'growth' },
  { id: 'res6', name: 'API接口服务', type: 'service', sensitivityLevel: 'normal', endpoint: '/api/v1/data' },
  { id: 'res7', name: '数据订阅服务', type: 'subscribe', sensitivityLevel: 'sensitive', topic: 'data-updates' },
  { id: 'res8', name: '外部数据接口', type: 'external_data', sensitivityLevel: 'core', provider: '第三方' }
]

// 模拟申请数据
const mockApplications = []

// 生成模拟申请数据
for (let i = 1; i <= 50; i++) {
  const user = mockUsers[Math.floor(Math.random() * mockUsers.length)]
  const resource = mockResources[Math.floor(Math.random() * mockResources.length)]
  const status = ['pending', 'processing', 'approved', 'rejected', 'expired', 'withdrawn'][Math.floor(Math.random() * 6)]
  const permissionType = ['view', 'edit', 'call', 'subscribe'][Math.floor(Math.random() * 4)]
  
  mockApplications.push({
    id: `app${i}`,
    applicationNo: generateApplicationNo(),
    applicantId: user.id,
    applicantName: user.name,
    department: user.department,
    resourceId: resource.id,
    resourceName: resource.name,
    resourceType: resource.type,
    sensitivityLevel: resource.sensitivityLevel,
    permissionType: permissionType,
    duration: Math.random() > 0.5 ? Math.floor(Math.random() * 365) + 30 : null,
    reason: `申请${resource.name}的${permissionType}权限，用于业务分析和数据查询`,
    status: status,
    approvalLevel: ['1', '2', '3', 'dual'][Math.floor(Math.random() * 4)],
    isUrgent: Math.random() > 0.8,
    isExpired: status === 'expired',
    isNearExpiry: status === 'approved' && Math.random() > 0.7,
    currentApprover: status === 'pending' || status === 'processing' ? mockUsers[Math.floor(Math.random() * mockUsers.length)] : null,
    applyTime: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
    createTime: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
    updateTime: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString()
  })
}

// 模拟审批流程数据
const generateApprovalFlow = (application) => {
  const flow = []
  const steps = [
    { name: '直属上级审批', level: 1 },
    { name: '部门负责人审批', level: 2 },
    { name: '数据负责人审批', level: 2 },
    { name: '安全负责人审批', level: 3 },
    { name: '高级管理层审批', level: 3 }
  ]
  
  let requiredSteps = []
  
  // 根据敏感度确定审批步骤
  if (application.sensitivityLevel === 'normal') {
    requiredSteps = [steps[0]]
  } else if (application.sensitivityLevel === 'sensitive') {
    requiredSteps = [steps[0], steps[1], steps[2]]
  } else if (application.sensitivityLevel === 'core') {
    requiredSteps = [steps[0], steps[1], steps[2], steps[3], steps[4]]
  }
  
  // 根据审批级别调整
  if (application.approvalLevel === '1') {
    requiredSteps = [steps[0]]
  } else if (application.approvalLevel === '2') {
    requiredSteps = [steps[0], steps[1]]
  } else if (application.approvalLevel === '3') {
    requiredSteps = [steps[0], steps[1], steps[2], steps[3]]
  } else if (application.approvalLevel === 'dual') {
    requiredSteps = [steps[0], steps[1], steps[2], steps[3], steps[4]]
  }
  
  return requiredSteps.map((step, index) => {
    const approver = mockUsers.find(u => u.department === '管理层') || mockUsers[4]
    let status = 'pending'
    let action = null
    let reason = null
    let time = null
    
    // 根据申请状态模拟审批进度
    if (application.status === 'approved') {
      status = 'completed'
      action = 'approve'
      reason = '同意授权'
      time = new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString()
    } else if (application.status === 'rejected') {
      if (index === 0) {
        status = 'completed'
        action = 'reject'
        reason = '权限范围过大，需要调整'
        time = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    } else if (application.status === 'processing') {
      if (index === 0) {
        status = 'completed'
        action = 'approve'
        reason = '符合权限要求'
        time = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
      } else if (index === 1) {
        status = 'processing'
      }
    } else if (application.status === 'pending') {
      if (index === 0) {
        status = 'processing'
      }
    }
    
    return {
      id: `step${index}`,
      name: step.name,
      level: step.level,
      status: status,
      approver: status !== 'pending' ? approver : null,
      action: action,
      reason: reason,
      time: time
    }
  })
}

// 模拟审批历史数据
const generateApprovalHistory = (application) => {
  const history = []
  
  // 提交记录
  history.push({
    id: 'hist1',
    type: 'submit',
    operatorName: application.applicantName,
    description: '提交权限申请',
    createTime: application.createTime
  })
  
  // 根据状态生成审批记录
  if (application.status !== 'pending') {
    history.push({
      id: 'hist2',
      type: 'approve',
      operatorName: mockUsers[0].name,
      description: '直属上级审批通过',
      createTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    })
  }
  
  if (['approved', 'rejected'].includes(application.status)) {
    const isApproved = application.status === 'approved'
    history.push({
      id: 'hist3',
      type: isApproved ? 'approve' : 'reject',
      operatorName: mockUsers[4].name,
      description: isApproved ? '最终审批通过' : '审批被拒绝',
      createTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    })
  }
  
  return history
}

// Mock API函数
export const mockPermissionAPI = {
  // 获取我的申请列表
  async getMyApplications(params = {}) {
    await delay()
    
    let result = [...mockApplications]
    
    // 筛选条件
    if (params.search) {
      const keyword = params.search.toLowerCase()
      result = result.filter(app => 
        app.resourceName.toLowerCase().includes(keyword) ||
        app.applicationNo.toLowerCase().includes(keyword)
      )
    }
    
    if (params.status) {
      result = result.filter(app => app.status === params.status)
    }
    
    if (params.startDate) {
      result = result.filter(app => new Date(app.applyTime) >= new Date(params.startDate))
    }
    
    if (params.endDate) {
      result = result.filter(app => new Date(app.applyTime) <= new Date(params.endDate))
    }
    
    // 分页
    const total = result.length
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    return {
      code: 200,
      message: 'success',
      data: {
        list: result.slice(start, end),
        total: total
      }
    }
  },

  // 获取待审批申请列表
  async getPendingApplications(params = {}) {
    await delay()
    
    let result = mockApplications.filter(app => ['pending', 'processing'].includes(app.status))
    
    // 筛选条件
    if (params.search) {
      const keyword = params.search.toLowerCase()
      result = result.filter(app => 
        app.applicantName.toLowerCase().includes(keyword) ||
        app.resourceName.toLowerCase().includes(keyword)
      )
    }
    
    if (params.status) {
      result = result.filter(app => app.status === params.status)
    }
    
    // 分页
    const total = result.length
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    return {
      code: 200,
      message: 'success',
      data: {
        list: result.slice(start, end),
        total: total
      }
    }
  },

  // 获取申请详情
  async getApplicationDetail(applicationId) {
    await delay()
    
    const application = mockApplications.find(app => app.id === applicationId)
    if (!application) {
      return { code: 404, message: '申请不存在' }
    }
    
    return {
      code: 200,
      message: 'success',
      data: application
    }
  },

  // 获取申请审批流程
  async getApplicationFlow(applicationId) {
    await delay()
    
    const application = mockApplications.find(app => app.id === applicationId)
    if (!application) {
      return { code: 404, message: '申请不存在' }
    }
    
    const flow = generateApprovalFlow(application)
    const currentStep = flow.find(step => step.status === 'processing') || null
    const completedSteps = flow.filter(step => step.status === 'completed').length
    const estimatedTime = completedSteps > 0 ? new Date(Date.now() + (flow.length - completedSteps) * 24 * 60 * 60 * 1000).toISOString() : null
    
    return {
      code: 200,
      message: 'success',
      data: {
        flow: flow,
        currentStep: currentStep,
        estimatedTime: estimatedTime
      }
    }
  },

  // 获取申请历史
  async getApplicationHistory(applicationId) {
    await delay()
    
    const application = mockApplications.find(app => app.id === applicationId)
    if (!application) {
      return { code: 404, message: '申请不存在' }
    }
    
    const history = generateApprovalHistory(application)
    
    return {
      code: 200,
      message: 'success',
      data: {
        application: application,
        history: history,
        statistics: {
          totalCount: history.length,
          forwardCount: history.filter(h => h.type === 'forward').length,
          durationHours: 48
        }
      }
    }
  },

  // 创建申请
  async createApplication(data) {
    await delay()
    
    const newApplication = {
      id: generateId(),
      applicationNo: generateApplicationNo(),
      applicantId: 'currentUser',
      applicantName: '当前用户',
      department: '数据部门',
      resourceId: data.resourceId,
      resourceName: data.resourceName,
      resourceType: data.resourceType,
      sensitivityLevel: data.sensitivityLevel,
      permissionType: data.permissionType,
      duration: data.duration,
      reason: data.reason,
      status: 'pending',
      approvalLevel: data.approvalLevel || '2',
      isUrgent: data.isUrgent || false,
      isExpired: false,
      isNearExpiry: false,
      currentApprover: mockUsers[0],
      applyTime: new Date().toISOString(),
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    }
    
    mockApplications.unshift(newApplication)
    
    return {
      code: 200,
      message: '申请创建成功',
      data: newApplication
    }
  },

  // 批量创建申请
  async batchCreateApplications(data) {
    await delay()
    
    const applications = data.applications.map(app => ({
      id: generateId(),
      applicationNo: generateApplicationNo(),
      applicantId: 'currentUser',
      applicantName: '当前用户',
      department: '数据部门',
      resourceId: app.resourceId,
      resourceName: app.resourceName,
      resourceType: app.resourceType,
      sensitivityLevel: app.sensitivityLevel,
      permissionType: app.permissionType,
      duration: app.duration,
      reason: app.reason,
      status: 'pending',
      approvalLevel: app.approvalLevel || '2',
      isUrgent: app.isUrgent || false,
      applyTime: new Date().toISOString(),
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    }))
    
    mockApplications.unshift(...applications)
    
    return {
      code: 200,
      message: '批量申请创建成功',
      data: {
        successCount: applications.length,
        failedCount: 0,
        applications: applications
      }
    }
  },

  // 审批通过
  async approveApplication(data) {
    await delay()
    
    const application = mockApplications.find(app => app.id === data.applicationId)
    if (!application) {
      return { code: 404, message: '申请不存在' }
    }
    
    application.status = 'approved'
    application.updateTime = new Date().toISOString()
    
    return {
      code: 200,
      message: '审批通过成功',
      data: application
    }
  },

  // 审批拒绝
  async rejectApplication(data) {
    await delay()
    
    const application = mockApplications.find(app => app.id === data.applicationId)
    if (!application) {
      return { code: 404, message: '申请不存在' }
    }
    
    application.status = 'rejected'
    application.updateTime = new Date().toISOString()
    
    return {
      code: 200,
      message: '审批拒绝成功',
      data: application
    }
  },

  // 转发申请
  async forwardApplication(data) {
    await delay()
    
    const application = mockApplications.find(app => app.id === data.applicationId)
    if (!application) {
      return { code: 404, message: '申请不存在' }
    }
    
    application.status = 'processing'
    application.currentApprover = mockUsers.find(u => u.id === data.forwardTo) || mockUsers[0]
    application.updateTime = new Date().toISOString()
    
    return {
      code: 200,
      message: '转发成功',
      data: application
    }
  },

  // 撤回申请
  async withdrawApplication(data) {
    await delay()
    
    const application = mockApplications.find(app => app.id === data.applicationId)
    if (!application) {
      return { code: 404, message: '申请不存在' }
    }
    
    application.status = 'withdrawn'
    application.updateTime = new Date().toISOString()
    
    return {
      code: 200,
      message: '撤回成功',
      data: application
    }
  },

  // 获取可申请的资源列表
  async getAvailableResources(params = {}) {
    await delay()
    
    let result = [...mockResources]
    
    // 搜索筛选
    if (params.search) {
      const keyword = params.search.toLowerCase()
      result = result.filter(res => 
        res.name.toLowerCase().includes(keyword) ||
        res.type.toLowerCase().includes(keyword)
      )
    }
    
    // 类型筛选
    if (params.type) {
      result = result.filter(res => res.type === params.type)
    }
    
    // 敏感度筛选
    if (params.sensitivityLevel) {
      result = result.filter(res => res.sensitivityLevel === params.sensitivityLevel)
    }
    
    // 分页
    const total = result.length
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    return {
      code: 200,
      message: 'success',
      data: {
        list: result.slice(start, end),
        total: total
      }
    }
  },

  // 获取审批人列表
  async getApproverUsers(params = {}) {
    await delay()
    
    // 根据资源类型和敏感度返回合适的审批人
    let approvers = [...mockUsers]
    
    if (params.sensitivityLevel === 'core') {
      approvers = approvers.filter(u => u.department === '管理层')
    } else if (params.sensitivityLevel === 'sensitive') {
      approvers = approvers.filter(u => ['安全部门', '管理层'].includes(u.department))
    }
    
    return {
      code: 200,
      message: 'success',
      data: approvers
    }
  },

  // 冲突检测
  async detectConflicts(data) {
    await delay()
    
    const conflicts = []
    
    // 模拟冲突检测
    data.resourceIds.forEach(resourceId => {
      const existing = mockApplications.find(app => 
        app.resourceId === resourceId && 
        app.applicantId === 'currentUser' &&
        ['pending', 'processing', 'approved'].includes(app.status)
      )
      
      if (existing) {
        conflicts.push({
          resourceId: resourceId,
          type: 'duplicate',
          description: '已存在相同资源的申请',
          existingApplication: existing
        })
      }
    })
    
    return {
      code: 200,
      message: 'success',
      data: {
        hasConflict: conflicts.length > 0,
        conflicts: conflicts
      }
    }
  }
}

export default mockPermissionAPI