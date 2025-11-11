// 统一的Mock数据管理
export const mockData = {
  // 外数档案管理
  externalDataArchive: {
    products: [
      {
        id: '1',
        name: '数据产品A',
        category: '用户数据',
        provider: '供应商X',
        status: 'active',
        interfaceId: 'API001',
        description: '用户行为数据，包含访问、点击、购买等行为记录',
        updateFrequency: '每日',
        dataScale: '1000万条',
        price: '5000元/月',
        contractPeriod: '2024-01-01 至 2024-12-31',
        contact: '张经理',
        createTime: '2024-01-01 10:00:00'
      },
      {
        id: '2',
        name: '数据产品B',
        category: '交易数据',
        provider: '供应商Y',
        status: 'maintenance',
        interfaceId: 'API002',
        description: '电商交易数据，包含订单、支付、退款等信息',
        updateFrequency: '实时',
        dataScale: '500万条',
        price: '8000元/月',
        contractPeriod: '2024-02-01 至 2024-07-31',
        contact: '李经理',
        createTime: '2024-01-15 14:30:00'
      },
      {
        id: '3',
        name: '数据产品C',
        category: '金融数据',
        provider: '供应商Z',
        status: 'inactive',
        interfaceId: 'API003',
        description: '金融市场数据，包含股票、基金、债券等信息',
        updateFrequency: '每分钟',
        dataScale: '200万条',
        price: '12000元/月',
        contractPeriod: '已过期',
        contact: '王经理',
        createTime: '2023-12-01 09:15:00'
      }
    ],
    providers: [
      {
        id: '1',
        name: '供应商X',
        type: '数据平台',
        status: 'active',
        contact: '张经理',
        phone: '13800138000',
        email: 'zhang@supplierx.com',
        address: '北京市朝阳区',
        cooperationTime: '2年',
        rating: 4.5,
        totalProducts: 15,
        activeProducts: 12
      },
      {
        id: '2',
        name: '供应商Y',
        type: '技术公司',
        status: 'active',
        contact: '李经理',
        phone: '13900139000',
        email: 'li@suppliery.com',
        address: '上海市浦东新区',
        cooperationTime: '1.5年',
        rating: 4.2,
        totalProducts: 8,
        activeProducts: 6
      }
    ]
  },

  // 外数评估管理
  externalDataEvaluation: {
    introductionEvaluations: [
      {
        id: '1',
        dataProduct: '数据产品A',
        status: 'pending',
        evaluator: '张三',
        overallScore: 85,
        evaluationResult: 'qualified',
        evaluationTime: '2024-01-15 14:30:00',
        indicators: [
          { name: '数据质量', score: 90, weight: 0.3 },
          { name: '数据完整性', score: 85, weight: 0.25 },
          { name: '数据时效性', score: 80, weight: 0.25 },
          { name: '数据准确性', score: 85, weight: 0.2 }
        ],
        conclusion: '数据质量良好，建议引入',
        suggestions: '建议加强数据更新频率监控'
      }
    ],
    monitoringEvaluations: [
      {
        id: '1',
        dataProduct: '数据产品A',
        interfaceId: 'API001',
        monitoringCycle: '每日',
        monitoringStatus: 'normal',
        keyMetrics: '响应时间: 200ms, 成功率: 99.9%',
        trendScore: 85,
        monitoringTime: '2024-01-15 10:00:00'
      }
    ],
    qualityEvaluations: [
      {
        id: '1',
        dataProduct: '数据产品A',
        interfaceId: 'API001',
        qualityLevel: 'excellent',
        overallScore: 92,
        keyMetrics: '完整性: 95%, 准确性: 90%, 一致性: 91%',
        evaluator: '李四',
        evaluationTime: '2024-01-10 16:45:00'
      }
    ],
    valueEvaluations: [
      {
        id: '1',
        dataProduct: '数据产品A',
        interfaceId: 'API001',
        valueLevel: 'high',
        overallScore: 88,
        valueMetrics: '业务价值: 90分, 技术价值: 85分',
        costAnalysis: '成本效益比: 1:3.5',
        evaluationCycle: '季度',
        evaluationTime: '2024-01-05 11:20:00'
      }
    ],
    riskEvaluations: [
      {
        id: '1',
        dataProduct: '数据产品A',
        interfaceId: 'API001',
        riskLevel: 'medium',
        riskType: 'data-quality',
        riskScore: 65,
        evaluationMetrics: '数据质量风险: 中等, 供应风险: 低',
        handleStatus: 'in-progress',
        evaluationTime: '2024-01-08 13:30:00'
      }
    ]
  },

  // 预算管理
  budgetManagement: {
    budgets: [
      {
        id: '1',
        budgetId: 'BUD2024001',
        year: 2024,
        businessType: '消费金融',
        platformProduct: '风控平台',
        totalAmount: 500000,
        usedAmount: 320000,
        remainingAmount: 180000,
        executionProgress: 64,
        status: 'active',
        creator: '王预算',
        createTime: '2024-01-01 09:00:00',
        details: [
          { projectName: '数据采购', amount: 200000, category: '数据成本' },
          { projectName: '系统开发', amount: 150000, category: '技术成本' },
          { projectName: '人员培训', amount: 50000, category: '运营成本' }
        ]
      }
    ],
    contracts: [
      {
        id: '1',
        contractId: 'CONT2024001',
        contractName: '数据服务合同A',
        supplier: '供应商X',
        contractAmount: 200000,
        paidAmount: 120000,
        remainingAmount: 80000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
        creator: '李法务',
        createTime: '2024-01-05 14:30:00',
        paymentTerms: '按季度付款'
      }
    ],
    settlements: [
      {
        id: '1',
        settlementId: 'SET2024001',
        contractId: 'CONT2024001',
        supplier: '供应商X',
        settlementPeriod: '2024-Q1',
        settlementAmount: 50000,
        paidAmount: 0,
        remainingAmount: 50000,
        settlementDate: '2024-04-01',
        status: 'pending',
        creator: '财务小张',
        createTime: '2024-03-31 17:00:00',
        details: [
          { projectName: '数据服务费', amount: 40000, unit: '季度' },
          { projectName: '技术支持费', amount: 10000, unit: '季度' }
        ]
      }
    ]
  },

  // 外部数据服务
  externalDataService: {
    applications: [
      {
        id: '1',
        applicationId: 'APP2024001',
        serviceType: 'data-query',
        dataProduct: '数据产品A',
        description: '查询用户行为数据，用于用户画像分析',
        priority: 'high',
        status: 'pending',
        applicant: '张三',
        applicationTime: '2024-01-15 09:30:00',
        expectedTime: '2024-01-20 18:00:00',
        parameters: '{"user_id": "12345", "date_range": "30d"}',
        outputFormat: 'json',
        remarks: '需要实时数据'
      }
    ],
    tasks: [
      {
        id: '1',
        taskId: 'TASK2024001',
        taskType: 'data-sync',
        applicationId: 'APP2024001',
        description: '同步用户行为数据到分析平台',
        status: 'running',
        progress: 65,
        startTime: '2024-01-15 10:30:00',
        endTime: '2024-01-15 11:30:00',
        duration: '00:45:30',
        errorMessage: '',
        executor: 'system-1'
      }
    ],
    results: [
      {
        id: '1',
        resultId: 'RES2024001',
        taskId: 'TASK2024001',
        resultType: 'data',
        resultName: '用户行为数据.xlsx',
        description: '包含用户访问、点击、购买等行为数据的完整数据集',
        fileSize: 2560000,
        status: 'completed',
        generateTime: '2024-01-15 11:30:00',
        expireTime: '2024-01-22 11:30:00',
        filePath: '/results/user_behavior_data.xlsx',
        checksum: 'a1b2c3d4e5f6'
      }
    ],
    accompanyServices: [
      {
        id: '1',
        serviceId: 'SERVICE2024001',
        customerName: 'ABC科技有限公司',
        serviceType: 'data-implementation',
        servicePhase: 'implementation',
        status: 'in-progress',
        serviceManager: '张经理',
        startTime: '2024-01-01 09:00:00',
        expectedEndTime: '2024-03-31 18:00:00',
        progress: 65,
        rating: 4.5,
        serviceContent: '数据平台实施部署服务，包括数据接入、处理、分析等全流程支持',
        requirements: '需要支持实时数据处理，提供可视化分析界面',
        notes: '客户对实施进度比较满意'
      }
    ]
  },

  // 统计信息
  statistics: {
    externalDataArchive: {
      totalProducts: 156,
      activeProducts: 128,
      maintenanceProducts: 18,
      inactiveProducts: 10
    },
    externalDataEvaluation: {
      totalEvaluations: 89,
      pendingEvaluations: 12,
      completedEvaluations: 77,
      failedEvaluations: 3
    },
    budgetManagement: {
      totalBudget: 2000000,
      usedBudget: 1200000,
      remainingBudget: 800000,
      warningCount: 5
    },
    externalDataService: {
      totalApplications: 156,
      completedTasks: 128,
      pendingTasks: 18,
      failedTasks: 10
    }
  }
}

// 获取模拟数据的方法
export const getMockData = (module, type) => {
  if (module && type && mockData[module] && mockData[module][type]) {
    return mockData[module][type]
  }
  return []
}

// 获取统计数据
export const getStatistics = (module) => {
  if (module && mockData.statistics[module]) {
    return mockData.statistics[module]
  }
  return {}
}

// 生成唯一ID
export const generateId = (prefix = '') => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `${prefix}${timestamp}${random}`
}

// 格式化日期时间
export const formatDateTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('zh-CN')
}

// 格式化文件大小
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取状态颜色
export const getStatusColor = (status) => {
  const colors = {
    'active': 'green',
    'inactive': 'gray',
    'maintenance': 'orange',
    'pending': 'orange',
    'approved': 'blue',
    'rejected': 'red',
    'processing': 'cyan',
    'completed': 'green',
    'failed': 'red',
    'running': 'blue',
    'in-progress': 'blue',
    'suspended': 'red',
    'planning': 'orange'
  }
  return colors[status] || 'gray'
}

// 获取状态文本
export const getStatusText = (status) => {
  const texts = {
    'active': '活跃',
    'inactive': '停用',
    'maintenance': '维护',
    'pending': '待审批',
    'approved': '已批准',
    'rejected': '已拒绝',
    'processing': '处理中',
    'completed': '已完成',
    'failed': '已失败',
    'running': '运行中',
    'in-progress': '进行中',
    'suspended': '已暂停',
    'planning': '规划中'
  }
  return texts[status] || status
}

// 获取优先级颜色
export const getPriorityColor = (priority) => {
  const colors = {
    'high': 'red',
    'medium': 'orange',
    'low': 'green'
  }
  return colors[priority] || 'gray'
}

// 获取优先级文本
export const getPriorityText = (priority) => {
  const texts = {
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return texts[priority] || priority
}

export default {
  mockData,
  getMockData,
  getStatistics,
  generateId,
  formatDateTime,
  formatFileSize,
  getStatusColor,
  getStatusText,
  getPriorityColor,
  getPriorityText
}