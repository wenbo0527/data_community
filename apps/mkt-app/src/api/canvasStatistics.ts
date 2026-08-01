// 画布统计API接口（mock 实现）
// 用途：原实现从 supabase 拉数据；项目无后端，改为本地 mock 生成。
// 边界：纯前端 demo；保留原函数签名 + 返回结构。
import type {
  CanvasOverviewStats,
  NodeStats,
  UserPathData,
  ExportRequest,
  FilterState
} from '@/components/canvas-statistics'

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

// 内联 mock 数据生成
const generateMockNodeStats = (canvasId: string, count: number = 12): any[] => {
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => {
    const enter = Math.floor(Math.random() * 1000) + 100
    const exit = Math.floor(enter * (0.5 + Math.random() * 0.4))
    return {
      canvas_id: canvasId,
      node_id: `node_${i + 1}`,
      stat_date: new Date(now - i * 86400000).toISOString().substring(0, 10),
      enter_count: enter,
      exit_count: exit,
      unique_users: Math.floor(enter * 0.7),
      avg_stay_time: Math.floor(Math.random() * 60) + 10,
      max_stay_time: Math.floor(Math.random() * 120) + 60,
      min_stay_time: Math.floor(Math.random() * 10) + 1,
      conversion_rate: +(exit / enter * 100).toFixed(2),
      hourly_stats: Array.from({ length: 24 }, (_, h) => ({ hour: h, count: Math.floor(Math.random() * 50) }))
    }
  })
}

const generateMockUserSession = (canvasId: string, userId: string) => ({
  id: `session_${Date.now()}`,
  user_id: userId,
  device_type: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
  location: ['北京', '上海', '广州', '深圳'][Math.floor(Math.random() * 4)],
  session_start: new Date(Date.now() - 3600000).toISOString(),
  session_end: new Date().toISOString(),
  total_duration: 3600,
  nodes_visited: ['node_1', 'node_2', 'node_3'],
  conversions_count: Math.floor(Math.random() * 3),
  metadata: { total_visits: Math.floor(Math.random() * 10) + 1 }
})

const generateMockPathNodes = (sessionId: string, count: number = 4) => {
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => ({
    id: `path_${sessionId}_${i}`,
    session_id: sessionId,
    node_id: `node_${i + 1}`,
    enter_time: new Date(now - (count - i) * 600000).toISOString(),
    exit_time: new Date(now - (count - i - 1) * 600000).toISOString(),
    stay_time: Math.floor(Math.random() * 120) + 30,
    conversion_type: i === count - 1 ? 'goal_complete' : null,
    conversion_value: i === count - 1 ? 1 : 0,
    previous_node_id: i > 0 ? `node_${i}` : null,
    next_node_ids: i < count - 1 ? `node_${i + 2}` : '',
    node_position: { x: i * 200, y: 100 }
  }))
}

/**
 * 获取画布整体统计概览
 */
export async function getCanvasOverviewStats(
  canvasId: string,
  filters: FilterState
): Promise<CanvasOverviewStats> {
  await delay(150)
  try {
    const raw = generateMockNodeStats(canvasId, 12)
    const filtered = raw.filter(item => {
      if (filters.dateFrom && item.stat_date < filters.dateFrom) return false
      if (filters.dateTo && item.stat_date > filters.dateTo) return false
      return true
    }).slice(0, 100)
    const stats = calculateOverviewStats(filtered)
    return {
      totalVisits: stats.totalVisits,
      totalConversions: stats.totalConversions,
      activeUsers: stats.activeUsers,
      avgStayTime: stats.avgStayTime,
      conversionRate: stats.conversionRate,
      topNodes: stats.topNodes,
      trend: stats.trend,
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('获取画布统计概览失败:', error)
    throw error
  }
}

/**
 * 获取节点统计详情
 */
export async function getNodeStatistics(
  canvasId: string,
  filters: FilterState,
  page: number = 1,
  pageSize: number = 50,
  sortBy: string = 'enter_count',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<{
  nodes: NodeStats[]
  total: number
  page: number
  pageSize: number
  summary: {
    totalNodes: number
    totalVisits: number
    avgConversionRate: number
  }
}> {
  await delay(150)
  try {
    const raw = generateMockNodeStats(canvasId, 30)
    const filtered = raw.filter(item => {
      if (filters.dateFrom && item.stat_date < filters.dateFrom) return false
      if (filters.dateTo && item.stat_date > filters.dateTo) return false
      return true
    })
    filtered.sort((a, b) => {
      const av = (a as any)[sortBy] || 0
      const bv = (b as any)[sortBy] || 0
      return sortOrder === 'asc' ? av - bv : bv - av
    })
    const start = (page - 1) * pageSize
    const slice = filtered.slice(start, start + pageSize)
    const nodes: NodeStats[] = slice.map(item => ({
      nodeId: item.node_id,
      nodeType: 'start',
      nodeLabel: `节点 ${item.node_id}`,
      position: { x: 0, y: 0 },
      enterCount: item.enter_count,
      exitCount: item.exit_count,
      conversionRate: item.conversion_rate,
      avgStayTime: item.avg_stay_time,
      maxStayTime: item.max_stay_time,
      minStayTime: item.min_stay_time,
      uniqueUsers: item.unique_users,
      trend: item.hourly_stats || []
    }))
    const summary = calculateNodeSummary(filtered)
    return { nodes, total: filtered.length, page, pageSize, summary }
  } catch (error) {
    console.error('获取节点统计详情失败:', error)
    throw error
  }
}

/**
 * 获取用户行为路径
 */
export async function getUserPathData(
  canvasId: string,
  userId: string
): Promise<UserPathData> {
  await delay(120)
  try {
    const session = generateMockUserSession(canvasId, userId)
    const pathData = generateMockPathNodes(session.id, 4)
    const path = pathData.map(item => ({
      nodeId: item.node_id,
      nodeLabel: `节点 ${item.node_id}`,
      position: item.node_position || { x: 0, y: 0 },
      enterTime: item.enter_time,
      exitTime: item.exit_time,
      stayTime: item.stay_time,
      conversionRate: item.conversion_value || 0,
      nextNodes: item.next_node_ids ? item.next_node_ids.split(',').filter(Boolean) : []
    }))
    return {
      userId: session.user_id,
      userProfile: {
        firstVisit: session.session_start,
        lastVisit: session.session_end,
        totalVisits: session.metadata?.total_visits || 1,
        deviceType: session.device_type,
        location: session.location
      },
      path,
      totalStayTime: session.total_duration || 0,
      conversionPath: session.conversions_count > 0
    }
  } catch (error) {
    console.error('获取用户路径数据失败:', error)
    throw error
  }
}

/**
 * 导出统计数据
 */
export async function exportStatisticsData(
  canvasId: string,
  request: ExportRequest
): Promise<{
  filename: string
  data: Blob
  size: number
}> {
  try {
    const exportData: any = {}

    if (request.dataType === 'overview' || request.dataType === 'all') {
      const overviewStats = await getCanvasOverviewStats(canvasId, request.filters)
      exportData.overview = overviewStats
    }

    if (request.dataType === 'nodes' || request.dataType === 'all') {
      const nodeStats = await getNodeStatistics(canvasId, request.filters, 1, 1000)
      exportData.nodes = nodeStats
    }

    let blob: Blob
    let filename: string
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)

    switch (request.format) {
      case 'csv':
        blob = generateCSV(exportData, request.fields)
        filename = `canvas_statistics_${canvasId}_${timestamp}.csv`
        break

      case 'excel':
        blob = generateExcel(exportData, request.fields)
        filename = `canvas_statistics_${canvasId}_${timestamp}.xlsx`
        break

      case 'json':
        blob = generateJSON(exportData)
        filename = `canvas_statistics_${canvasId}_${timestamp}.json`
        break

      default:
        throw new Error('不支持的导出格式')
    }

    return {
      filename,
      data: blob,
      size: blob.size
    }
  } catch (error) {
    console.error('导出统计数据失败:', error)
    throw error
  }
}

/**
 * 计算概览统计数据
 */
function calculateOverviewStats(data: any[]) {
  if (data.length === 0) {
    return {
      totalVisits: 0,
      totalConversions: 0,
      activeUsers: 0,
      avgStayTime: 0,
      conversionRate: 0,
      topNodes: [],
      trend: []
    }
  }

  const totalVisits = data.reduce((sum, item) => sum + item.enter_count, 0)
  const totalConversions = data.reduce((sum, item) => sum + item.exit_count, 0)
  const activeUsers = data.reduce((sum, item) => sum + item.unique_users, 0)
  const avgStayTime = data.reduce((sum, item) => sum + item.avg_stay_time, 0) / data.length
  const conversionRate = totalVisits > 0 ? (totalConversions / totalVisits) * 100 : 0

  // 获取热门节点
  const topNodes = data
    .sort((a, b) => b.enter_count - a.enter_count)
    .slice(0, 5)
    .map(item => ({
      nodeId: item.node_id,
      nodeType: 'start',
      nodeLabel: `节点 ${item.node_id}`,
      enterCount: item.enter_count,
      conversionRate: item.conversion_rate
    }))

  // 生成趋势数据
  const trend = data.slice(0, 7).map(item => ({
    timestamp: item.stat_date,
    value: item.conversion_rate,
    label: new Date(item.stat_date).toLocaleDateString('zh-CN')
  }))

  return {
    totalVisits,
    totalConversions,
    activeUsers,
    avgStayTime,
    conversionRate,
    topNodes,
    trend
  }
}

/**
 * 计算节点汇总数据
 */
function calculateNodeSummary(data: any[]) {
  if (data.length === 0) {
    return {
      totalNodes: 0,
      totalVisits: 0,
      avgConversionRate: 0
    }
  }

  const totalNodes = data.length
  const totalVisits = data.reduce((sum, item) => sum + item.enter_count, 0)
  const avgConversionRate = data.reduce((sum, item) => sum + item.conversion_rate, 0) / data.length

  return {
    totalNodes,
    totalVisits,
    avgConversionRate
  }
}

/**
 * 生成CSV文件
 */
function generateCSV(data: any, fields?: string[]): Blob {
  let csvContent = ''
  
  // 生成概览数据CSV
  if (data.overview) {
    csvContent += '统计概览\n'
    csvContent += '指标,数值\n'
    csvContent += `总访问量,${data.overview.totalVisits}\n`
    csvContent += `总转化数,${data.overview.totalConversions}\n`
    csvContent += `活跃用户,${data.overview.activeUsers}\n`
    csvContent += `平均停留时间,${data.overview.avgStayTime}\n`
    csvContent += `转化率,${data.overview.conversionRate}%\n\n`
  }

  // 生成节点数据CSV
  if (data.nodes) {
    csvContent += '节点统计\n'
    csvContent += '节点ID,节点名称,节点类型,进入人数,离开人数,转化率,平均停留时间\n'
    
    data.nodes.nodes.forEach((node: any) => {
      csvContent += `${node.nodeId},${node.nodeLabel},${node.nodeType},${node.enterCount},${node.exitCount},${node.conversionRate},${node.avgStayTime}\n`
    })
  }

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
}

/**
 * 生成Excel文件
 */
function generateExcel(data: any, fields?: string[]): Blob {
  // 这里需要使用xlsx库来生成Excel文件
  // 简化实现，实际项目中需要引入xlsx库
  const csvContent = generateCSV(data, fields)
  return new Blob([csvContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

/**
 * 生成JSON文件
 */
function generateJSON(data: any): Blob {
  const jsonContent = JSON.stringify(data, null, 2)
  return new Blob([jsonContent], { type: 'application/json;charset=utf-8' })
}