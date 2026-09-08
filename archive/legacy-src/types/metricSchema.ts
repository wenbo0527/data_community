/**
 * 统一 Metric Schema 适配层(P1#1 整合点)
 *
 * 历史问题:指标在三个模块有不同字段名
 *   - exploration/indicator-dashboard: definition / businessOwner
 *   - discovery/metrics-map:           businessDefinition / owner
 *   - management/metric-management:    businessDefinition / businessOwner
 *
 * 解决方案:建立单一权威 MetricItem(在 types/metrics.ts),
 * 本文件提供 schema 适配器,兼容老字段名,逐步废弃。
 */
import type { MetricItem as UnifiedMetric } from './metrics'

// 适配器:支持多套字段名
export interface MetricWithLegacyFields extends UnifiedMetric {
  // 兼容 exploration 用的字段
  definition?: string
  metricOwner?: string

  // 兼容 management 老字段
  version?: string
  versionStatus?: string
  versionDescription?: string
  reports?: Array<{ name: string; url: string }>
  status?: string
  updateTime?: string
  isViewMode?: boolean

  // 通用兼容
  description?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * 标准化一个 metric 对象,把多套字段映射到统一 schema
 */
export function normalizeMetric(input: any): UnifiedMetric {
  if (!input) return input
  return {
    id: input.id,
    type: input.type,
    name: input.name,
    code: input.code,
    category: input.category,
    businessDomain: input.businessDomain,
    // 业务定义:优先 businessDefinition,否则 definition,否则 description
    businessDefinition:
      input.businessDefinition ||
      input.definition ||
      input.description ||
      '',
    useCase: input.useCase,
    statisticalPeriod: input.statisticalPeriod,
    sourceTable: input.sourceTable,
    processingLogic: input.processingLogic,
    fieldDescription: input.fieldDescription,
    reportInfo: input.reportInfo,
    storageLocation: input.storageLocation,
    queryCode: input.queryCode,
    versions: input.versions || [],
    isFavorite: input.isFavorite,
    // 业务 Owner:优先 businessOwner,否则 metricOwner,否则 owner
    businessOwner:
      input.businessOwner ||
      input.metricOwner ||
      input.businessOwnerResolved,
    technicalOwner: input.technicalOwner,
    // 兼容字段保留
    owner: input.businessOwner || input.metricOwner || input.owner,
    regulatoryCategory: input.regulatoryCategory,
    reportName: input.reportName
  }
}

/**
 * 批量标准化
 */
export function normalizeMetrics(list: any[]): UnifiedMetric[] {
  if (!Array.isArray(list)) return []
  return list.map(normalizeMetric)
}

/**
 * 字段名映射(给 UI 层使用)
 */
export const METRIC_FIELD_MAP = {
  definition: 'businessDefinition',
  desc: 'businessDefinition',
  description: 'businessDefinition',
  businessOwnerResolved: 'businessOwner',
  metricOwner: 'businessOwner',
  owner: 'businessOwner'
} as const

/**
 * 取业务定义文本(兼容多字段)
 */
export function getMetricDefinition(m: any): string {
  return m?.businessDefinition || m?.definition || m?.description || ''
}

/**
 * 取业务 Owner(兼容多字段)
 */
export function getMetricOwner(m: any): string {
  return m?.businessOwner || m?.metricOwner || m?.owner || '-'
}

/**
 * 判断两个 metric 是否同一个(跨模块跳带 ID 时用)
 */
export function isSameMetric(a: any, b: any): boolean {
  if (!a || !b) return false
  // 优先 ID 比对
  if (a.id && b.id && a.id === b.id) return true
  // 兜底:code 比对
  if (a.code && b.code && a.code === b.code) return true
  // 名称作为最终兜底(注意重名风险)
  if (a.name && b.name && a.name === b.name) return true
  return false
}