import request from './request'

// 通知规则相关API
export const notificationApi = {
  // 获取通知规则列表
  getRuleList: (params) => {
    return request({
      url: '/api/notification/rules',
      method: 'get',
      params
    })
  },

  // 获取通知规则详情
  getRuleDetail: (id) => {
    return request({
      url: `/api/notification/rules/${id}`,
      method: 'get'
    })
  },

  // 创建通知规则
  createRule: (data) => {
    return request({
      url: '/api/notification/rules',
      method: 'post',
      data
    })
  },

  // 更新通知规则
  updateRule: (id, data) => {
    return request({
      url: `/api/notification/rules/${id}`,
      method: 'put',
      data
    })
  },

  // 删除通知规则
  deleteRule: (id) => {
    return request({
      url: `/api/notification/rules/${id}`,
      method: 'delete'
    })
  },

  // 批量删除通知规则
  batchDeleteRules: (ids) => {
    return request({
      url: '/api/notification/rules/batch-delete',
      method: 'post',
      data: { ids }
    })
  },

  // 启用/禁用通知规则
  toggleRuleStatus: (id, status) => {
    return request({
      url: `/api/notification/rules/${id}/status`,
      method: 'put',
      data: { status }
    })
  },

  // 批量启用/禁用通知规则
  batchToggleRulesStatus: (ids, status) => {
    return request({
      url: '/api/notification/rules/batch-status',
      method: 'put',
      data: { ids, status }
    })
  },

  // 复制通知规则
  copyRule: (id) => {
    return request({
      url: `/api/notification/rules/${id}/copy`,
      method: 'post'
    })
  },

  // 获取规则类型统计
  getRuleStatistics: () => {
    return request({
      url: '/api/notification/rules/statistics',
      method: 'get'
    })
  },

  // 测试通知规则
  testRule: (id) => {
    return request({
      url: `/api/notification/rules/${id}/test`,
      method: 'post'
    })
  },

  // 获取规则执行日志
  getRuleLogs: (ruleId, params) => {
    return request({
      url: `/api/notification/rules/${ruleId}/logs`,
      method: 'get',
      params
    })
  },

  // 获取通知变量列表
  getNotificationVariables: (type) => {
    return request({
      url: '/api/notification/variables',
      method: 'get',
      params: { type }
    })
  },

  // 发送测试通知
  sendTestNotification: (data) => {
    return request({
      url: '/api/notification/test-send',
      method: 'post',
      data
    })
  }
}

// 通知模板相关API
export const templateApi = {
  // 获取模板列表
  getTemplateList: (params) => {
    return request({
      url: '/api/notification/templates',
      method: 'get',
      params
    })
  },

  // 获取模板详情
  getTemplateDetail: (id) => {
    return request({
      url: `/api/notification/templates/${id}`,
      method: 'get'
    })
  },

  // 创建模板
  createTemplate: (data) => {
    return request({
      url: '/api/notification/templates',
      method: 'post',
      data
    })
  },

  // 更新模板
  updateTemplate: (id, data) => {
    return request({
      url: `/api/notification/templates/${id}`,
      method: 'put',
      data
    })
  },

  // 删除模板
  deleteTemplate: (id) => {
    return request({
      url: `/api/notification/templates/${id}`,
      method: 'delete'
    })
  },

  // 批量删除模板
  batchDeleteTemplates: (ids) => {
    return request({
      url: '/api/notification/templates/batch-delete',
      method: 'post',
      data: { ids }
    })
  },

  // 复制模板
  copyTemplate: (id) => {
    return request({
      url: `/api/notification/templates/${id}/copy`,
      method: 'post'
    })
  },

  // 获取预设模板列表
  getPresetTemplates: () => {
    return request({
      url: '/api/notification/templates/presets',
      method: 'get'
    })
  },

  // 使用模板
  useTemplate: (id) => {
    return request({
      url: `/api/notification/templates/${id}/use`,
      method: 'post'
    })
  },

  // 获取模板使用统计
  getTemplateUsageStats: (id) => {
    return request({
      url: `/api/notification/templates/${id}/usage-stats`,
      method: 'get'
    })
  },

  // 预览模板内容
  previewTemplate: (data) => {
    return request({
      url: '/api/notification/templates/preview',
      method: 'post',
      data
    })
  },

  // 验证模板变量
  validateTemplateVariables: (data) => {
    return request({
      url: '/api/notification/templates/validate-variables',
      method: 'post',
      data
    })
  }
}

export default {
  notificationApi,
  templateApi
}