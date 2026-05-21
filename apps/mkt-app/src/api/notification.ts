/**
 * Notification API 模块
 * Phase 2.3: types/api 类型体系
 * 
 * 改造说明：
 * - 将 .js 改为 .ts
 * - 添加完整的类型定义
 * - 使用 mock 数据替代真实请求
 */
import request from './request'

// ==================== 类型定义 ====================

/** 通知规则 */
export interface NotificationRule {
  id: string
  ruleId: string
  name: string
  description?: string
  type: 'email' | 'sms' | 'webhook' | 'dingtalk' | 'wechat'
  triggerCondition: string
  templateId?: string
  status: 'active' | 'paused' | 'deleted'
  notifyTargets: string[]
  createTime: string
  updateTime: string
  lastTriggeredTime?: string
  triggerCount?: number
}

export interface NotificationRuleParams {
  page?: number
  pageSize?: number
  name?: string
  type?: string
  status?: string
}

/** 通知模板 */
export interface NotificationTemplate {
  id: string
  templateId: string
  name: string
  type: 'email' | 'sms' | 'webhook' | 'dingtalk' | 'wechat'
  subject?: string
  content: string
  variables?: string[]
  status: 'active' | 'draft' | 'archived'
  createTime: string
  updateTime: string
  usageCount?: number
}

export interface NotificationTemplateParams {
  page?: number
  pageSize?: number
  name?: string
  type?: string
  status?: string
}

/** 通知变量 */
export interface NotificationVariable {
  key: string
  name: string
  description: string
  type: 'string' | 'number' | 'boolean' | 'date' | 'object'
}

/** 规则执行日志 */
export interface RuleExecutionLog {
  id: string
  ruleId: string
  ruleName: string
  status: 'success' | 'failed' | 'partial'
  executedAt: string
  duration: number // ms
  message?: string
  error?: string
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const mockRules: NotificationRule[] = []
const mockTemplates: NotificationTemplate[] = []

// ==================== Notification API ====================

export const notificationApi = {
  async getRuleList(params: NotificationRuleParams) {
    await delay(300)
    let filtered = [...mockRules]
    if (params.name) {filtered = filtered.filter(r => r.name.includes(params.name!))}
    if (params.type) {filtered = filtered.filter(r => r.type === params.type)}
    if (params.status) {filtered = filtered.filter(r => r.status === params.status)}

    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const start = (page - 1) * pageSize
    const list = filtered.slice(start, start + pageSize)

    return {
      code: 200,
      message: 'success',
      data: {
        list,
        pagination: { page, pageSize, total: filtered.length, totalPages: Math.ceil(filtered.length / pageSize) }
      }
    }
  },

  async getRuleDetail(id: string) {
    await delay(150)
    const rule = mockRules.find(r => r.id === id)
    return { code: 200, message: 'success', data: rule || null }
  },

  async createRule(data: Partial<NotificationRule>) {
    await delay(300)
    const rule: NotificationRule = {
      id: Date.now().toString(),
      ruleId: `NR${Date.now()}`,
      name: data.name || '',
      type: data.type || 'email',
      triggerCondition: data.triggerCondition || '',
      status: 'active',
      notifyTargets: data.notifyTargets || [],
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    }
    mockRules.push(rule)
    return { code: 200, message: 'success', data: rule }
  },

  async updateRule(id: string, data: Partial<NotificationRule>) {
    await delay(300)
    const rule = mockRules.find(r => r.id === id)
    if (!rule) {return { code: 404, message: 'Rule not found', data: null }}
    Object.assign(rule, data, { updateTime: new Date().toISOString() })
    return { code: 200, message: 'success', data: rule }
  },

  async deleteRule(id: string) {
    await delay(200)
    const index = mockRules.findIndex(r => r.id === id)
    if (index === -1) {return { code: 404, message: 'Rule not found', data: false }}
    mockRules.splice(index, 1)
    return { code: 200, message: 'success', data: true }
  },

  async batchDeleteRules(ids: string[]) {
    await delay(300)
    const initialLength = mockRules.length
    ids.forEach(id => {
      const index = mockRules.findIndex(r => r.id === id)
      if (index !== -1) {mockRules.splice(index, 1)}
    })
    return { code: 200, message: 'success', data: { success: initialLength - mockRules.length, failed: ids.length - (initialLength - mockRules.length) } }
  },

  async toggleRuleStatus(id: string, status: 'active' | 'paused') {
    await delay(200)
    const rule = mockRules.find(r => r.id === id)
    if (rule) {rule.status = status}
    return { code: 200, message: 'success', data: !!rule }
  },

  async batchToggleRulesStatus(ids: string[], status: 'active' | 'paused') {
    await delay(300)
    ids.forEach(id => {
      const rule = mockRules.find(r => r.id === id)
      if (rule) {rule.status = status}
    })
    return { code: 200, message: 'success', data: { success: ids.length, failed: 0 } }
  },

  async copyRule(id: string) {
    await delay(200)
    const rule = mockRules.find(r => r.id === id)
    if (!rule) {return { code: 404, message: 'Rule not found', data: null }}
    const newRule: NotificationRule = { ...rule, id: Date.now().toString(), ruleId: `NR${Date.now()}`, name: `${rule.name} (copy)`, createTime: new Date().toISOString(), updateTime: new Date().toISOString() }
    mockRules.push(newRule)
    return { code: 200, message: 'success', data: newRule }
  },

  async getRuleStatistics() {
    await delay(200)
    return {
      code: 200,
      message: 'success',
      data: {
        total: mockRules.length,
        active: mockRules.filter(r => r.status === 'active').length,
        paused: mockRules.filter(r => r.status === 'paused').length
      }
    }
  },

  async testRule(id: string) {
    await delay(500)
    return { code: 200, message: 'success', data: { success: true, message: 'Test notification sent' } }
  },

  async getRuleLogs(ruleId: string, params: { page?: number; pageSize?: number }) {
    await delay(300)
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    return {
      code: 200,
      message: 'success',
      data: { list: [], pagination: { page, pageSize, total: 0, totalPages: 0 } }
    }
  },

  async getNotificationVariables(type?: string) {
    await delay(200)
    const variables: NotificationVariable[] = [
      { key: 'userName', name: '用户名', description: '接收人姓名', type: 'string' },
      { key: 'alertTime', name: '告警时间', description: '触发时间', type: 'date' },
      { key: 'alertType', name: '告警类型', description: '告警类型', type: 'string' },
      { key: 'alertLevel', name: '告警级别', description: '告警严重程度', type: 'string' },
      { key: 'alertMessage', name: '告警消息', description: '告警内容', type: 'string' }
    ]
    return { code: 200, message: 'success', data: variables }
  },

  async sendTestNotification(data: { type: string; target: string; content: string }) {
    await delay(500)
    return { code: 200, message: 'success', data: { success: true } }
  }
}

// ==================== Template API ====================

export const templateApi = {
  async getTemplateList(params: NotificationTemplateParams) {
    await delay(300)
    let filtered = [...mockTemplates]
    if (params.name) {filtered = filtered.filter(t => t.name.includes(params.name!))}
    if (params.type) {filtered = filtered.filter(t => t.type === params.type)}
    if (params.status) {filtered = filtered.filter(t => t.status === params.status)}

    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const start = (page - 1) * pageSize
    const list = filtered.slice(start, start + pageSize)

    return {
      code: 200,
      message: 'success',
      data: {
        list,
        pagination: { page, pageSize, total: filtered.length, totalPages: Math.ceil(filtered.length / pageSize) }
      }
    }
  },

  async getTemplateDetail(id: string) {
    await delay(150)
    const template = mockTemplates.find(t => t.id === id)
    return { code: 200, message: 'success', data: template || null }
  },

  async createTemplate(data: Partial<NotificationTemplate>) {
    await delay(300)
    const template: NotificationTemplate = {
      id: Date.now().toString(),
      templateId: `TPL${Date.now()}`,
      name: data.name || '',
      type: data.type || 'email',
      content: data.content || '',
      status: 'draft',
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    }
    mockTemplates.push(template)
    return { code: 200, message: 'success', data: template }
  },

  async updateTemplate(id: string, data: Partial<NotificationTemplate>) {
    await delay(300)
    const template = mockTemplates.find(t => t.id === id)
    if (!template) {return { code: 404, message: 'Template not found', data: null }}
    Object.assign(template, data, { updateTime: new Date().toISOString() })
    return { code: 200, message: 'success', data: template }
  },

  async deleteTemplate(id: string) {
    await delay(200)
    const index = mockTemplates.findIndex(t => t.id === id)
    if (index === -1) {return { code: 404, message: 'Template not found', data: false }}
    mockTemplates.splice(index, 1)
    return { code: 200, message: 'success', data: true }
  },

  async batchDeleteTemplates(ids: string[]) {
    await delay(300)
    const initialLength = mockTemplates.length
    ids.forEach(id => {
      const index = mockTemplates.findIndex(t => t.id === id)
      if (index !== -1) {mockTemplates.splice(index, 1)}
    })
    return { code: 200, message: 'success', data: { success: initialLength - mockTemplates.length, failed: ids.length - (initialLength - mockTemplates.length) } }
  },

  async copyTemplate(id: string) {
    await delay(200)
    const template = mockTemplates.find(t => t.id === id)
    if (!template) {return { code: 404, message: 'Template not found', data: null }}
    const newTemplate: NotificationTemplate = { ...template, id: Date.now().toString(), templateId: `TPL${Date.now()}`, name: `${template.name} (copy)`, createTime: new Date().toISOString(), updateTime: new Date().toISOString() }
    mockTemplates.push(newTemplate)
    return { code: 200, message: 'success', data: newTemplate }
  },

  async getPresetTemplates() {
    await delay(200)
    return { code: 200, message: 'success', data: [] }
  },

  async useTemplate(id: string) {
    await delay(200)
    const template = mockTemplates.find(t => t.id === id)
    if (template) {template.usageCount = (template.usageCount || 0) + 1}
    return { code: 200, message: 'success', data: !!template }
  },

  async getTemplateUsageStats(id: string) {
    await delay(200)
    return { code: 200, message: 'success', data: { usageCount: 0, lastUsedAt: null } }
  },

  async previewTemplate(data: { content: string; variables: Record<string, string> }) {
    await delay(100)
    let preview = data.content
    Object.entries(data.variables).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
    })
    return { code: 200, message: 'success', data: { preview } }
  },

  async validateTemplateVariables(data: { content: string }) {
    await delay(100)
    const matches = data.content.match(/\{\{(\w+)\}\}/g) || []
    const variables = matches.map(m => m.replace(/\{\{|\}\}/g, ''))
    return { code: 200, message: 'success', data: { valid: true, variables: [...new Set(variables)] } }
  }
}

export default { notificationApi, templateApi }
