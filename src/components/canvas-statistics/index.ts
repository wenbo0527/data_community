// 统计面板组件索引
export { default as CanvasStatisticsPanel } from './CanvasStatisticsPanel.vue'
export { default as DataFilterControls } from './DataFilterControls.vue'
export { default as StatisticsOverview } from './StatisticsOverview.vue'
export { default as NodeStatisticsList } from './NodeStatisticsList.vue'
export { default as UserPathAnalyzer } from './UserPathAnalyzer.vue'
export { default as ChartDisplayArea } from './ChartDisplayArea.vue'
export { default as DataExportPanel } from './DataExportPanel.vue'

// 类型定义
export interface FilterState {
  timeRange: 'day' | 'week' | 'month' | 'quarter' | 'custom'
  dateFrom?: string
  dateTo?: string
  nodeType?: string[]
  userGroup?: string[]
}

export interface NodeStats {
  nodeId: string
  nodeType: string
  nodeLabel: string
  position: { x: number; y: number }
  enterCount: number
  exitCount: number
  conversionRate: number
  avgStayTime: number
  maxStayTime: number
  minStayTime: number
  uniqueUsers: number
  trend: any[]
}

export interface UserPathData {
  userId: string
  userProfile: {
    firstVisit: string
    lastVisit: string
    totalVisits: number
    deviceType: string
    location: string
  }
  path: PathNode[]
  totalStayTime: number
  conversionPath: boolean
}

export interface PathNode {
  nodeId: string
  nodeLabel: string
  position: { x: number; y: number }
  enterTime: string
  exitTime: string
  stayTime: number
  conversionRate: number
  nextNodes: string[]
}

export interface CanvasOverviewStats {
  totalVisits: number
  totalConversions: number
  activeUsers: number
  avgStayTime: number
  conversionRate: number
  topNodes: NodeStats[]
  trend: TimeSeriesData[]
  lastUpdated: string
}

export interface TimeSeriesData {
  timestamp: string
  value: number
  label?: string
}

export interface ExportRequest {
  format: 'csv' | 'excel' | 'json'
  dataType: 'overview' | 'nodes' | 'users' | 'all'
  filters: {
    timeRange?: string
    nodeType?: string
    userId?: string
    dateFrom?: string
    dateTo?: string
  }
  fields?: string[]
}

export interface ExportConfig {
  format: 'csv' | 'excel' | 'json'
  dataTypes: string[]
  timeRange: 'current' | 'all' | 'custom'
  customDateRange: string[]
  includeCharts: boolean
  includeMetadata: boolean
  compressFile: boolean
}