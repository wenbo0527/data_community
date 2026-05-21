// 预警管理 Mock API

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

// Mock API 数据导出
export const alertMockData = {
  recent: (query) => {
    const { pageSize = 10, status, type } = query
    let alerts = generateAlerts(50)
    
    // 状态过滤
    if (status) {
      alerts = alerts.filter(alert => alert.status === status)
    }
    
    // 类型过滤
    if (type) {
      alerts = alerts.filter(alert => alert.type === type)
    }
    
    // 按时间排序（最新的在前）
    alerts.sort((a, b) => new Date(b.time) - new Date(a.time))
    
    return {
      code: 200,
      data: {
        list: alerts.slice(0, parseInt(pageSize)),
        total: alerts.length
      },
      message: 'success'
    }
  },
  overview: () => {
    return {
      code: 200,
      data: {
        activeRules: Math.floor(Math.random() * 50) + 10,
        todayAlerts: Math.floor(Math.random() * 100) + 20,
        inventoryAlerts: Math.floor(Math.random() * 30) + 5,
        expiryAlerts: Math.floor(Math.random() * 20) + 3
      },
      message: 'success'
    }
  }
}