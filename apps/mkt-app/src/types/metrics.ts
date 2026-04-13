export interface MetricItem {
  id: string
  name: string
  value: number
}

export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram'
}

export enum RegulatoryCategory {
  COMPLIANCE = 'compliance',
  RISK = 'risk',
  FINANCE = 'finance'
}

export interface BatchRegistrationItem {
  id: string
  name: string
  category: string
}

export const METRIC_TYPE_LABELS = {
  [MetricType.COUNTER]: '计数器',
  [MetricType.GAUGE]: '仪表',
  [MetricType.HISTOGRAM]: '直方图'
}

export const REGULATORY_CATEGORY_LABELS = {
  [RegulatoryCategory.COMPLIANCE]: '合规',
  [RegulatoryCategory.RISK]: '风险',
  [RegulatoryCategory.FINANCE]: '财务'
}

export const RegulatoryLabels = {
  compliance: '合规',
  risk: '风险',
  finance: '财务'
}

export const RegulatoryCategories = {
  COMPLIANCE: 'compliance',
  RISK: 'risk',
  FINANCE: 'finance'
}
