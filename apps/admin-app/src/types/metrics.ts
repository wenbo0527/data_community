// Metric type definitions

export const MetricType = {
  BUSINESS_CORE: 'business_core',
  REGULATORY: 'regulatory',
  PERFORMANCE: 'performance',
  FINANCIAL: 'financial'
} as const

export type MetricTypeValue = typeof MetricType[keyof typeof MetricType]

export const RegulatoryCategory = {
  AM_001: 'AM-001',
  AM_002: 'AM-002',
  AM_003: 'AM-003',
  CUSTOM: 'custom'
} as const

export interface Metric {
  id: string
  name: string
  description: string
  category: MetricTypeValue
  regulatoryCategory?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface MetricParams {
  page?: number
  pageSize?: number
  keyword?: string
  category?: MetricTypeValue
}

export interface PaginatedResponse<T> {
  list: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
