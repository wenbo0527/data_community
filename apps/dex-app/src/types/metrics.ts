// Metric types for dex-app

export type MetricType = string
export type RegulatoryCategory = string

// MetricType enum values
export const MetricType = {
  BUSINESS: 'business',
  BUSINESS_CORE: 'business_core',
  REGULATORY: 'regulatory'
} as const

// RegulatoryCategory enum values
export const RegulatoryCategory = {
  CAPITAL_ADEQUACY: 'capital_adequacy',
  LIQUIDITY_RISK: 'liquidity_risk',
  CREDIT_RISK: 'credit_risk',
  MARKET_RISK: 'market_risk',
  AM_001: 'AM-001',
  AM_002: 'AM-002',
  CUSTOM: 'custom'
} as const

// Labels
export const METRIC_TYPE_LABELS: Record<string, string> = {
  business: '业务指标',
  business_core: '业务核心指标',
  regulatory: '监管指标'
}

export const RegulatoryLabels: Record<string, string> = {
  capital_adequacy: '资本充足率',
  liquidity_risk: '流动性风险',
  credit_risk: '信用风险',
  market_risk: '市场风险',
  'AM-001': 'AM-001',
  'AM-002': 'AM-002',
  custom: '自定义'
}

export const REGULATORY_CATEGORY_LABELS: Record<string, string> = {
  capital_adequacy: '资本充足率',
  liquidity_risk: '流动性风险',
  credit_risk: '信用风险',
  market_risk: '市场风险',
  'AM-001': 'AM-001',
  'AM-002': 'AM-002',
  custom: '自定义'
}

export interface Metric {
  id: string
  name: string
  description: string
  category: MetricType
  status: 'active' | 'inactive'
}

export interface PaginatedResponse<T> {
  list: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
  }
}
