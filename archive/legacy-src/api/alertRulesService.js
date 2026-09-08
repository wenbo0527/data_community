import request from '@/utils/request'

// 获取规则列表
export function getAlertRules(params) {
  return request({ url: '/api/alert-rules', method: 'get', params })
}

// 获取规则详情
export function getAlertRuleDetail(id) {
  return request({ url: `/api/alert-rules/${id}`, method: 'get' })
}

// 创建规则
export function createAlertRule(data) {
  return request({ url: '/api/alert-rules', method: 'post', data })
}

// 更新规则
export function updateAlertRule(id, data) {
  return request({ url: `/api/alert-rules/${id}`, method: 'put', data })
}

// 删除规则
export function deleteAlertRule(id) {
  return request({ url: `/api/alert-rules/${id}`, method: 'delete' })
}

// 切换启用状态
export function toggleAlertRule(id) {
  return request({ url: `/api/alert-rules/${id}/toggle`, method: 'put' })
}

