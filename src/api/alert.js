// 预警管理API模拟服务
import { Message } from '@arco-design/web-vue'

// 模拟延迟
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// 生成券库存数据
const generateCouponInventories = (count = 10) => {
  const couponTypes = ['新用户专享', '会员福利', '限时特惠', '满减优惠', '折扣券', '免邮券', '生日特惠', '节日促销']
  const categories = ['满减', '折扣', '免邮', '礼品']
  
  return Array.from({ length: count }, (_, index) => {
    const totalStock = Math.floor(Math.random() * 10000) + 1000
    const usedStock = Math.floor(Math.random() * totalStock * 0.8)
    const remainingStock = totalStock - usedStock
    const remainingRatio = (remainingStock / totalStock * 100).toFixed(2)
    
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + Math.floor(Math.random() * 30) + 1)
    const remainingDays = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24))
    
    return {
      id: `inventory_${index + 1}`,
      name: couponTypes[Math.floor(Math.random() * couponTypes.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      totalStock,
      usedStock,
      remainingStock,
      remainingRatio: parseFloat(remainingRatio),
      expiryDate: expiryDate.toISOString().split('T')[0],
      remainingDays,
      status: remainingDays <= 3 ? 'critical' : remainingDays <= 7 ? 'warning' : 'normal',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  })
}

// 生成券包数据
const generateCouponPackages = (count = 8) => {
  const packageNames = ['新人礼包', '会员专享包', '节日大礼包', '生日福利包', '满减套餐', '折扣组合', '限时抢购包', 'VIP特权包']
  const packageTypes = ['新用户', '会员', '活动', '节日']
  
  return Array.from({ length: count }, (_, index) => {
    const totalCoupons = Math.floor(Math.random() * 5000) + 500
    const claimedCoupons = Math.floor(Math.random() * totalCoupons * 0.6)
    const remainingCoupons = totalCoupons - claimedCoupons
    
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + Math.floor(Math.random() * 60) + 1)
    const remainingDays = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24))
    
    const todayIssued = Math.floor(Math.random() * 200) + 10
    const todayAttempted = todayIssued + Math.floor(Math.random() * 20)
    const todaySuccessRate = ((todayIssued / todayAttempted) * 100).toFixed(2)
    
    return {
      id: `package_${index + 1}`,
      name: packageNames[Math.floor(Math.random() * packageNames.length)],
      type: packageTypes[Math.floor(Math.random() * packageTypes.length)],
      totalCoupons,
      claimedCoupons,
      remainingCoupons,
      expiryDate: expiryDate.toISOString().split('T')[0],
      remainingDays,
      todayIssued,
      todayAttempted,
      todaySuccessRate: parseFloat(todaySuccessRate),
      status: remainingDays <= 3 ? 'critical' : remainingDays <= 7 ? 'warning' : 'normal',
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  })
}

// 生成券实例生命周期数据
const generateCouponLifecycleData = () => {
  const totalCoupons = Math.floor(Math.random() * 10000) + 5000
  const claimedCoupons = Math.floor(totalCoupons * 0.7)
  const usedCoupons = Math.floor(claimedCoupons * 0.4)
  const failedVerifications = Math.floor(usedCoupons * 0.05)
  const successfulVerifications = usedCoupons - failedVerifications
  
  const verificationFailureRate = ((failedVerifications / usedCoupons) * 100).toFixed(2)
  const conversionRate = ((usedCoupons / claimedCoupons) * 100).toFixed(2)
  const quickUseRate = ((Math.floor(usedCoupons * 0.3) / usedCoupons) * 100).toFixed(2) // 24小时内核销率
  
  return {
    totalCoupons,
    claimedCoupons,
    usedCoupons,
    failedVerifications,
    successfulVerifications,
    verificationFailureRate: parseFloat(verificationFailureRate),
    conversionRate: parseFloat(conversionRate),
    quickUseRate: parseFloat(quickUseRate),
    conversionFunnel: {
      issued: totalCoupons,
      claimed: claimedCoupons,
      used: usedCoupons,
      successful: successfulVerifications
    }
  }
}

// 生成随机数据
const generateRandomData = () => ({
  todayAlerts: Math.floor(Math.random() * 20) + 5,
  activeRules: Math.floor(Math.random() * 15) + 3,
  levelDistribution: {
    high: Math.floor(Math.random() * 5) + 1,
    medium: Math.floor(Math.random() * 8) + 2,
    low: Math.floor(Math.random() * 6) + 1
  },
  triggerFrequency: {
    inventory: Math.floor(Math.random() * 10) + 2,
    expiry: Math.floor(Math.random() * 8) + 1,
    failure: Math.floor(Math.random() * 5) + 1
  }
})

// 生成趋势数据
const generateTrendData = (days = 7) => {
  const data = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    data.push({
      date: date.toISOString().split('T')[0],
      inventory: Math.floor(Math.random() * 6) + 1,
      expiry: Math.floor(Math.random() * 4) + 1,
      failure: Math.floor(Math.random() * 3)
    })
  }
  
  return data
}

// 生成预警数据
const generateAlerts = (count = 10) => {
  const types = ['inventory', 'expiry', 'failure']
  const statuses = ['pending', 'processing', 'resolved']
  const channels = ['email', 'sms', 'webhook']
  
  const ruleNames = {
    inventory: ['库存不足预警', '库存监控', '库存告警'],
    expiry: ['即将过期预警', '过期提醒', '有效期监控'],
    failure: ['系统失败率预警', '发放失败预警', '异常监控']
  }
  
  const messages = {
    inventory: [
      '优惠券"新用户专享"库存不足，当前剩余：5张',
      '优惠券"会员专享"库存低于20%',
      '优惠券"限时特惠"库存告急'
    ],
    expiry: [
      '优惠券"春节特惠"将在3天后过期',
      '优惠券"年终大促"即将到期',
      '优惠券"会员福利"有效期不足7天'
    ],
    failure: [
      '优惠券发放失败率达到15%，超过预设阈值',
      '系统异常导致发放失败率过高',
      '优惠券发放服务响应异常'
    ]
  }
  
  return Array.from({ length: count }, (_, index) => {
    const type = types[Math.floor(Math.random() * types.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    const now = new Date()
    const alertTime = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    
    return {
      id: index + 1,
      title: ruleNames[type][Math.floor(Math.random() * ruleNames[type].length)],
      ruleName: ruleNames[type][Math.floor(Math.random() * ruleNames[type].length)],
      type,
      message: messages[type][Math.floor(Math.random() * messages[type].length)],
      time: alertTime.toISOString().replace('T', ' ').substring(0, 19),
      createTime: alertTime.toISOString(),
      status,
      channels: channels.slice(0, Math.floor(Math.random() * 3) + 1)
    }
  })
}

// 生成规则数据
const generateRules = (count = 8) => {
  const types = ['inventory', 'expiry', 'failure', 'coupon_inventory', 'coupon_package', 'coupon_lifecycle']
  const channels = ['email', 'sms', 'webhook']
  
  const ruleTemplates = {
    inventory: {
      names: ['库存不足预警', '库存监控规则', '库存告警'],
      descriptions: ['监控优惠券库存，低于阈值时发送预警', '实时监控库存变化', '库存不足自动告警'],
      conditions: [
        { threshold: 10, thresholdType: 'absolute' },
        { threshold: 20, thresholdType: 'percentage' },
        { threshold: 50, thresholdType: 'absolute' }
      ]
    },
    expiry: {
      names: ['即将过期预警', '过期提醒规则', '有效期监控'],
      descriptions: ['监控优惠券过期时间，提前预警', '自动提醒即将过期的优惠券', '有效期监控和提醒'],
      conditions: [
        { advanceDays: 3 },
        { advanceDays: 7 },
        { advanceDays: 1 }
      ]
    },
    failure: {
      names: ['系统失败率预警', '发放失败预警', '异常监控规则'],
      descriptions: ['监控系统失败率，超过阈值时预警', '监控优惠券发放失败情况', '系统异常自动监控'],
      conditions: [
        { failureRate: 10, timeWindow: 60 },
        { failureRate: 15, timeWindow: 30 },
        { failureRate: 5, timeWindow: 120 }
      ]
    },
    coupon_inventory: {
      names: ['券库存剩余量预警', '券库存比例监控', '券库存有效期预警'],
      descriptions: ['监控券库存剩余有效库存量/比例', '监控券库存剩余有效天数', '券库存综合监控'],
      conditions: [
        { inventoryThreshold: 100, thresholdType: 'absolute', metricType: 'remaining_stock' },
        { inventoryThreshold: 10, thresholdType: 'percentage', metricType: 'remaining_ratio' },
        { daysThreshold: 7, metricType: 'remaining_days' }
      ]
    },
    coupon_package: {
      names: ['券包有效期预警', '券包库存监控', '券包下发成功率预警'],
      descriptions: ['监控券包剩余有效期天数', '监控券包下有效库存量', '监控当日下发成功率'],
      conditions: [
        { daysThreshold: 3, metricType: 'package_expiry_days' },
        { stockThreshold: 50, metricType: 'package_remaining_stock' },
        { successRateThreshold: 90, metricType: 'daily_success_rate' }
      ]
    },
    coupon_lifecycle: {
      names: ['券核销失败率预警', '券转化漏斗监控', '券核销率预警'],
      descriptions: ['监控券核销失败占比', '监控核销率与转化漏斗', '券实例生命周期监控'],
      conditions: [
        { failureRateThreshold: 5, metricType: 'verification_failure_rate' },
        { conversionRateThreshold: 30, metricType: 'conversion_rate' },
        { quickUseRateThreshold: 20, metricType: 'quick_use_rate' }
      ]
    }
  }
  
  return Array.from({ length: count }, (_, index) => {
    const type = types[Math.floor(Math.random() * types.length)]
    const template = ruleTemplates[type]
    const nameIndex = Math.floor(Math.random() * template.names.length)
    
    const createdTime = new Date()
    createdTime.setDate(createdTime.getDate() - Math.floor(Math.random() * 30))
    
    const lastTriggerTime = Math.random() > 0.3 ? new Date(
      createdTime.getTime() + Math.random() * (Date.now() - createdTime.getTime())
    ) : null
    
    return {
      id: index + 1,
      name: template.names[nameIndex],
      type,
      description: template.descriptions[nameIndex],
      conditions: template.conditions[nameIndex],
      channels: channels.slice(0, Math.floor(Math.random() * 3) + 1),
      enabled: Math.random() > 0.2, // 80% 概率启用
      createdAt: createdTime.toISOString().replace('T', ' ').substring(0, 19),
      triggerCount: Math.floor(Math.random() * 50),
      lastTriggerTime: lastTriggerTime ? lastTriggerTime.toISOString().replace('T', ' ').substring(0, 19) : null
    }
  })
}

// API接口
export const alertAPI = {
  // 获取概览数据
  async getOverviewData() {
    await delay()
    return {
      success: true,
      data: generateRandomData()
    }
  },

  // 获取趋势数据
  async getTrendData(params = {}) {
    await delay()
    const { days = 7, type = 'all' } = params
    return {
      success: true,
      data: generateTrendData(days)
    }
  },

  // 获取最近预警列表
  async getRecentAlerts(params = {}) {
    await delay()
    const { page = 1, pageSize = 10, status } = params
    
    let alerts = generateAlerts(50) // 生成更多数据用于分页
    
    // 按状态筛选
    if (status) {
      alerts = alerts.filter(alert => alert.status === status)
    }
    
    // 按时间倒序排序
    alerts.sort((a, b) => new Date(b.time) - new Date(a.time))
    
    // 分页
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedAlerts = alerts.slice(start, end)
    
    return {
      success: true,
      data: {
        list: paginatedAlerts,
        total: alerts.length,
        page,
        pageSize,
        hasMore: end < alerts.length
      }
    }
  },

  // 获取券库存列表
  async getCouponInventories(params = {}) {
    await delay()
    const { page = 1, pageSize = 20, search, status } = params
    let inventories = generateCouponInventories(30)
    
    // 按搜索关键词筛选
    if (search) {
      inventories = inventories.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    // 按状态筛选
    if (status) {
      inventories = inventories.filter(item => item.status === status)
    }
    
    // 分页
    const total = inventories.length
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const data = inventories.slice(start, end)
    
    return {
      success: true,
      data: {
        list: data,
        total,
        page,
        pageSize
      }
    }
  },

  // 获取券包列表
  async getCouponPackages(params = {}) {
    await delay()
    const { page = 1, pageSize = 20, search, type } = params
    let packages = generateCouponPackages(20)
    
    // 按搜索关键词筛选
    if (search) {
      packages = packages.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.type.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    // 按类型筛选
    if (type) {
      packages = packages.filter(item => item.type === type)
    }
    
    // 分页
    const total = packages.length
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const data = packages.slice(start, end)
    
    return {
      success: true,
      data: {
        list: data,
        total,
        page,
        pageSize
      }
    }
  },

  // 获取券实例生命周期数据
  async getCouponLifecycleData() {
    await delay()
    return {
      success: true,
      data: generateCouponLifecycleData()
    }
  },

  // 获取预警规则列表
  async getAlertRules(params = {}) {
    await delay()
    const { page = 1, pageSize = 20, search, type, enabled } = params
    let rules = generateRules(20) // 生成更多数据
    
    // 按搜索关键词筛选
    if (search) {
      rules = rules.filter(rule => 
        rule.name.toLowerCase().includes(search.toLowerCase()) ||
        rule.description.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    // 按类型筛选
    if (type) {
      rules = rules.filter(rule => rule.type === type)
    }
    
    // 按启用状态筛选
    if (enabled !== undefined) {
      rules = rules.filter(rule => rule.enabled === enabled)
    }
    
    // 按创建时间倒序排序
    rules.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    // 分页
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedRules = rules.slice(start, end)
    
    return {
      success: true,
      data: {
        list: paginatedRules,
        total: rules.length,
        page,
        pageSize
      }
    }
  },

  // 处理预警
  async processAlert(alertId) {
    await delay(300)
    return {
      success: true,
      message: '预警已标记为处理中'
    }
  },

  // 解决预警
  async resolveAlert(alertId) {
    await delay(300)
    return {
      success: true,
      message: '预警已解决'
    }
  },

  // 创建规则
  async createRule(ruleData) {
    await delay(800)
    return {
      success: true,
      data: {
        id: Date.now(),
        ...ruleData,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        triggerCount: 0,
        lastTriggerTime: null
      },
      message: '规则创建成功'
    }
  },

  // 更新规则
  async updateRule(ruleId, ruleData) {
    await delay(800)
    return {
      success: true,
      data: {
        id: ruleId,
        ...ruleData
      },
      message: '规则更新成功'
    }
  },

  // 删除规则
  async deleteRule(ruleId) {
    await delay(500)
    return {
      success: true,
      message: '规则删除成功'
    }
  },

  // 启用/禁用规则
  async toggleRule(ruleId, enabled) {
    await delay(300)
    return {
      success: true,
      message: `规则已${enabled ? '启用' : '禁用'}`
    }
  },

  // 批量操作规则
  async batchOperateRules(ruleIds, operation) {
    await delay(1000)
    const operations = {
      enable: '批量启用成功',
      disable: '批量禁用成功',
      delete: '批量删除成功'
    }
    
    return {
      success: true,
      message: operations[operation] || '批量操作成功'
    }
  },

  // 获取预警历史（新增方法）
  async getAlertHistory(params = {}) {
    await delay()
    const { 
      page = 1, 
      pageSize = 20, 
      search, 
      type, 
      status,
      startDate,
      endDate
    } = params
    
    let alerts = generateAlerts(200) // 生成更多历史数据
    
    // 按搜索关键词筛选
    if (search) {
      const keyword = search.toLowerCase()
      alerts = alerts.filter(alert => 
        alert.title.toLowerCase().includes(keyword) ||
        alert.message.toLowerCase().includes(keyword) ||
        alert.ruleName.toLowerCase().includes(keyword)
      )
    }
    
    // 按类型筛选
    if (type) {
      alerts = alerts.filter(alert => alert.type === type)
    }
    

    
    // 按状态筛选
    if (status) {
      alerts = alerts.filter(alert => alert.status === status)
    }
    
    // 按日期范围筛选
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      alerts = alerts.filter(alert => {
        const alertDate = new Date(alert.createTime)
        return alertDate >= start && alertDate <= end
      })
    }
    
    // 按时间倒序排序
    alerts.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    
    // 分页
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedAlerts = alerts.slice(start, end)
    
    return {
      success: true,
      data: {
        list: paginatedAlerts,
        total: alerts.length,
        page,
        pageSize
      }
    }
  }
}

export default alertAPI