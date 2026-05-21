/**
 * Alert API 模块
 * Phase 2.3: types/api 类型体系
 */
import type {
  AlertAPI,
  AlertRulesAPI,
  AlertRule,
  AlertInstance,
  AlertRuleParams,
  AlertInstanceParams,
  ApiResponse,
  PaginatedResponse
} from '@/types/api/alert'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const mockAlertRules: AlertRule[] = []
const mockAlertInstances: AlertInstance[] = []

/**
 * Alert API 实现
 */
export const alertAPI: AlertAPI = {
  async getRecentAlerts(limit = 10) {
    await delay(200)
    const sorted = [...mockAlertInstances]
      .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())
    return {
      code: 200,
      message: 'success',
      data: sorted.slice(0, limit)
    }
  },

  async getAlertDetail(id: string) {
    await delay(150)
    const alert = mockAlertInstances.find(a => a.instanceId === id)
    return { code: 200, message: 'success', data: alert || null }
  },

  async acknowledgeAlert(id: string) {
    await delay(200)
    const alert = mockAlertInstances.find(a => a.instanceId === id)
    if (alert) {
      alert.status = 'acknowledged'
      alert.acknowledgedAt = new Date().toISOString()
    }
    return { code: 200, message: 'success', data: !!alert }
  },

  async resolveAlert(id: string, note?: string) {
    await delay(200)
    const alert = mockAlertInstances.find(a => a.instanceId === id)
    if (alert) {
      alert.status = 'resolved'
      alert.resolvedAt = new Date().toISOString()
    }
    return { code: 200, message: 'success', data: !!alert }
  },

  async silenceAlert(id: string, duration: number) {
    await delay(200)
    const alert = mockAlertInstances.find(a => a.instanceId === id)
    if (alert) {
      alert.status = 'silenced'
    }
    return { code: 200, message: 'success', data: true }
  }
}

/**
 * AlertRules API 实现
 */
export const alertRulesAPI: AlertRulesAPI = {
  async getAll(params: AlertRuleParams = {}) {
    await delay(300)
    let filtered = [...mockAlertRules]
    
    if (params.name) {filtered = filtered.filter(r => r.name.includes(params.name!))}
    if (params.type) {filtered = filtered.filter(r => r.type === params.type)}
    if (params.severity) {filtered = filtered.filter(r => r.severity === params.severity)}
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

  async getActive() {
    await delay(200)
    const active = mockAlertRules.filter(r => r.status === 'active')
    return { code: 200, message: 'success', data: active }
  },

  async getById(id: string) {
    await delay(150)
    const rule = mockAlertRules.find(r => r.id === id)
    return { code: 200, message: 'success', data: rule || null }
  },

  async create(data: Partial<AlertRule>) {
    await delay(300)
    const rule: AlertRule = {
      id: Date.now().toString(),
      ruleId: `RULE${Date.now()}`,
      name: data.name || '',
      type: data.type || 'threshold',
      target: data.target || '',
      severity: data.severity || 'warning',
      status: 'active',
      notifyChannels: data.notifyChannels || ['email'],
      notifyTargets: data.notifyTargets || [],
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    }
    mockAlertRules.push(rule)
    return { code: 200, message: 'success', data: rule }
  },

  async update(id: string, data: Partial<AlertRule>) {
    await delay(300)
    const rule = mockAlertRules.find(r => r.id === id)
    if (!rule) {return { code: 404, message: 'Rule not found', data: null }}
    Object.assign(rule, data, { updateTime: new Date().toISOString() })
    return { code: 200, message: 'success', data: rule }
  },

  async delete(id: string) {
    await delay(200)
    const index = mockAlertRules.findIndex(r => r.id === id)
    if (index === -1) {return { code: 404, message: 'Rule not found', data: false }}
    mockAlertRules.splice(index, 1)
    return { code: 200, message: 'success', data: true }
  },

  async toggleStatus(id: string, status: 'active' | 'paused') {
    await delay(200)
    const rule = mockAlertRules.find(r => r.id === id)
    if (rule) {
      rule.status = status
      rule.updateTime = new Date().toISOString()
    }
    return { code: 200, message: 'success', data: !!rule }
  }
}

export default { alertAPI, alertRulesAPI }
