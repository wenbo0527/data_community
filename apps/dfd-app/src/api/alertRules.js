// 预警规则统一数据源
// 用于统一预警管理和全局规则中的预警规则数据

// 预警规则数据 - 统一数据源
export const alertRulesData = [
  {
    id: 'alert_1',
    name: '库存不足预警',
    type: 'inventory',
    description: '监控券库存，低于阈值时发送预警',
    conditions: {
      granularity: 'coupon_stock',
      metricConfigs: [
        { metric: 'remaining_stock_count', operator: 'less_than', threshold: 100, content: '券库存：{{券库存名称}}剩余不足{{指标值}}张，请关注' }
      ]
    },
    channels: ['wechat'],
    needProcessing: true,
    status: 'active',
    enabled: true,
    created_at: '2024-01-10 09:00:00',
    createdAt: '2024-01-10 09:00:00',
    createTime: '2024-01-10 09:00:00',
    triggerCount: 15,
    lastTriggerTime: '2024-01-15 14:30:00'
  },
  {
    id: 'alert_2',
    name: '券包到期预警',
    type: 'expiry',
    description: '监控券包有效期，提前预警',
    conditions: {
      granularity: 'coupon_package',
      metricConfigs: [
        { metric: 'package_remaining_days', operator: 'less_than', threshold: 3, content: '券包：{{券包名称}}有效期不足{{指标值}}日，请关注' }
      ]
    },
    channels: ['wechat'],
    needProcessing: false,
    status: 'active',
    enabled: true,
    created_at: '2024-01-10 09:30:00',
    createdAt: '2024-01-10 09:30:00',
    createTime: '2024-01-10 09:30:00',
    triggerCount: 8,
    lastTriggerTime: '2024-01-15 10:15:00'
  },
  {
    id: 'alert_3',
    name: '失败率监控',
    type: 'failure',
    description: '监控失败率，超过阈值时预警',
    conditions: {
      granularity: 'coupon_instance_lifecycle',
      metricConfigs: [
        { metric: 'redemption_failure_ratio', operator: 'greater_than', threshold: 5, window: '24h', content: '今日{{券库存名称}}核销失败超过{{指标值}}，请关注' }
      ]
    },
    channels: ['wechat'],
    needProcessing: true,
    status: 'active',
    enabled: true,
    created_at: '2024-01-10 10:00:00',
    createdAt: '2024-01-10 10:00:00',
    createTime: '2024-01-10 10:00:00',
    triggerCount: 3,
    lastTriggerTime: '2024-01-14 16:45:00'
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
    createdAt: new Date().toLocaleString('zh-CN'),
    createTime: new Date().toLocaleString('zh-CN'),
    triggerCount: 0,
    lastTriggerTime: null,
    status: rule.status || 'active',
    enabled: (rule.status || 'active') === 'active'
  }
  alertRulesData.push(newRule)
  return newRule
}

export const getRuleById = (id) => {
  return alertRulesData.find(r => r.id === id)
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
