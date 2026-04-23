/**
 * Alert 模块类型定义
 * Phase 2.3: types/api 类型体系
 */
import type { PaginatedResponse, ApiResponse } from './common'

// ==================== 告警规则 ====================

/** 告警规则 */
export interface AlertRule {
  id: string
  ruleId: string
  name: string
  description?: string
  type: 'threshold' | 'trend' | 'anomaly' | 'schedule'
  target: string // 监控目标
  metric?: string // 指标名
  threshold?: number // 阈值
  condition?: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' // 比较条件
  severity: 'critical' | 'warning' | 'info'
  status: 'active' | 'paused' | 'deleted'
  notifyChannels: ('email' | 'sms' | 'webhook' | 'dingtalk')[]
  notifyTargets: string[]
  createTime: string
  updateTime: string
  lastTriggeredTime?: string
  triggerCount?: number
}

export interface AlertRuleParams {
  page?: number
  pageSize?: number
  name?: string
  type?: string
  severity?: string
  status?: string
}

// ==================== 告警记录 ====================

/** 告警实例/记录 */
export interface AlertInstance {
  id: string
  instanceId: string
  ruleId: string
  ruleName: string
  type: 'threshold' | 'trend' | 'anomaly' | 'schedule'
  severity: 'critical' | 'warning' | 'info'
  status: 'firing' | 'acknowledged' | 'resolved' | 'silenced'
  message: string
  target: string
  metric?: string
  currentValue?: number
  threshold?: number
  triggeredAt: string
  acknowledgedAt?: string
  acknowledgedBy?: string
  resolvedAt?: string
  resolvedBy?: string
}

export interface AlertInstanceParams {
  page?: number
  pageSize?: number
  ruleId?: string
  severity?: string
  status?: string
  startTime?: string
  endTime?: string
}

// ==================== API 方法签名 ====================

/** Alert API */
export interface AlertAPI {
  getRecentAlerts(limit?: number): Promise<ApiResponse<AlertInstance[]>>
  getAlertDetail(id: string): Promise<ApiResponse<AlertInstance | null>>
  acknowledgeAlert(id: string): Promise<ApiResponse<boolean>>
  resolveAlert(id: string, note?: string): Promise<ApiResponse<boolean>>
  silenceAlert(id: string, duration: number): Promise<ApiResponse<boolean>>
}

/** AlertRules API */
export interface AlertRulesAPI {
  getAll(params?: AlertRuleParams): Promise<ApiResponse<PaginatedResponse<AlertRule>>>
  getActive(): Promise<ApiResponse<AlertRule[]>>
  getById(id: string): Promise<ApiResponse<AlertRule | null>>
  create(data: Partial<AlertRule>): Promise<ApiResponse<AlertRule | null>>
  update(id: string, data: Partial<AlertRule>): Promise<ApiResponse<AlertRule | null>>
  delete(id: string): Promise<ApiResponse<boolean>>
  toggleStatus(id: string, status: 'active' | 'paused'): Promise<ApiResponse<boolean>>
}
