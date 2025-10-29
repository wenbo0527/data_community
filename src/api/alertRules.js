// 预警规则统一数据源
// 用于统一预警管理和全局规则中的预警规则数据

// 预警规则数据 - 统一数据源
export const alertRulesData = [
  {
    id: 'alert_1',
    name: '库存不足预警',
    type: 'inventory',
    description: '监控优惠券库存，低于阈值时发送预警',
    conditions: {
      threshold: 10,
      thresholdType: 'absolute'
    },
    channels: ['email', 'sms'],
    status: 'active', // 统一使用 status 字段
    enabled: true,
    created_at: '2024-01-10 09:00:00',
    createTime: '2024-01-10 09:00:00', // 兼容全局规则页面
    triggerCount: 15,
    lastTriggerTime: '2024-01-15 14:30:00'
  },
  {
    id: 'alert_2',
    name: '即将过期预警',
    type: 'expiry',
    description: '监控优惠券过期时间，提前预警',
    conditions: {
      advanceDays: 3
    },
    channels: ['email'],
    status: 'active',
    enabled: true,
    created_at: '2024-01-10 09:30:00',
    createTime: '2024-01-10 09:30:00',
    triggerCount: 8,
    lastTriggerTime: '2024-01-15 10:15:00'
  },
  {
    id: 'alert_3',
    name: '系统失败率预警',
    type: 'failure',
    description: '监控系统失败率，超过阈值时预警',
    conditions: {
      failureRate: 10,
      timeWindow: 60
    },
    channels: ['email', 'webhook'],
    status: 'active',
    enabled: true,
    created_at: '2024-01-10 10:00:00',
    createTime: '2024-01-10 10:00:00',
    triggerCount: 3,
    lastTriggerTime: '2024-01-14 16:45:00'
  },
  {
    id: 'alert_4',
    name: '券库存粒度预警',
    type: 'coupon_inventory',
    description: '监控券库存粒度，库存不足时预警',
    conditions: {
      inventoryThreshold: 50,
      thresholdType: 'absolute',
      metricType: 'remaining_stock'
    },
    channels: ['email'],
    status: 'active',
    enabled: true,
    created_at: '2024-01-12 10:00:00',
    createTime: '2024-01-12 10:00:00',
    triggerCount: 5,
    lastTriggerTime: '2024-01-14 12:30:00'
  },
  {
    id: 'alert_5',
    name: '券包粒度预警',
    type: 'coupon_package',
    description: '监控券包粒度，剩余天数不足时预警',
    conditions: {
      daysThreshold: 5,
      metricType: 'package_expiry_days'
    },
    channels: ['email', 'sms'],
    status: 'active',
    enabled: true,
    created_at: '2024-01-12 11:00:00',
    createTime: '2024-01-12 11:00:00',
    triggerCount: 3,
    lastTriggerTime: '2024-01-13 15:20:00'
  },
  {
    id: 'alert_6',
    name: '券实例生命周期预警',
    type: 'coupon_lifecycle',
    description: '监控券实例生命周期状态变化',
    conditions: {
      statusChange: 'expiring'
    },
    channels: ['email'],
    status: 'inactive',
    enabled: false,
    created_at: '2024-01-13 14:00:00',
    createTime: '2024-01-13 14:00:00',
    triggerCount: 0,
    lastTriggerTime: null
  }
]

// 获取所有预警规则
export const getAllAlertRules = () => {
  return [...alertRulesData]
}

// 获取激活的预警规则
export const getActiveAlertRules = () => {
  return alertRulesData.filter(rule => rule.status === 'active' && rule.enabled)
}

// 获取预警规则（按状态筛选）
export const getAlertRulesByStatus = (status) => {
  if (!status) return getAllAlertRules()
  return alertRulesData.filter(rule => rule.status === status)
}

// 添加预警规则
export const addAlertRule = (rule) => {
  const newRule = {
    ...rule,
    id: `alert_${Date.now()}`,
    created_at: new Date().toLocaleString('zh-CN'),
    createTime: new Date().toLocaleString('zh-CN'),
    triggerCount: 0,
    lastTriggerTime: null,
    enabled: rule.status === 'active'
  }
  alertRulesData.push(newRule)
  return newRule
}

// 更新预警规则
export const updateAlertRule = (id, updates) => {
  const index = alertRulesData.findIndex(rule => rule.id === id)
  if (index > -1) {
    alertRulesData[index] = {
      ...alertRulesData[index],
      ...updates,
      enabled: updates.status === 'active'
    }
    return alertRulesData[index]
  }
  return null
}

// 删除预警规则
export const deleteAlertRule = (id) => {
  const index = alertRulesData.findIndex(rule => rule.id === id)
  if (index > -1) {
    return alertRulesData.splice(index, 1)[0]
  }
  return null
}

// 切换预警规则状态
export const toggleAlertRuleStatus = (id) => {
  const rule = alertRulesData.find(rule => rule.id === id)
  if (rule) {
    rule.status = rule.status === 'active' ? 'inactive' : 'active'
    rule.enabled = rule.status === 'active'
    return rule
  }
  return null
}