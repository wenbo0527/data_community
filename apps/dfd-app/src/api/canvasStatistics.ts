// 画布统计API接口
import { supabase } from '@/utils/supabase'
import type { 
  CanvasOverviewStats, 
  NodeStats, 
  UserPathData, 
  ExportRequest,
  FilterState 
} from '@/components/canvas-statistics'

/**
 * 获取画布整体统计概览
 */
export async function getCanvasOverviewStats(
  canvasId: string, 
  filters: FilterState
): Promise<CanvasOverviewStats> {
  try {
    // 构建查询条件
    let query = supabase
      .from('canvas_node_stats')
      .select(`
        canvas_id,
        node_id,
        stat_date,
        enter_count,
        exit_count,
        unique_users,
        avg_stay_time,
        conversion_rate,
        hourly_stats
      `)
      .eq('canvas_id', canvasId)

    // 应用时间范围过滤
    if (filters.dateFrom && filters.dateTo) {
      query = query
        .gte('stat_date', filters.dateFrom)
        .lte('stat_date', filters.dateTo)
    }

    const { data, error } = await query
      .order('stat_date', { ascending: false })
      .limit(100)

    if (error) throw error

    // 计算统计概览
    const stats = calculateOverviewStats(data || [])
    
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
  try {
    let query = supabase
      .from('canvas_node_stats')
      .select(`
        canvas_id,
        node_id,
        stat_date,
        enter_count,
        exit_count,
        unique_users,
        avg_stay_time,
        max_stay_time,
        min_stay_time,
        conversion_rate,
        hourly_stats
      `, { count: 'exact' })
      .eq('canvas_id', canvasId)

    // 应用时间范围过滤
    if (filters.dateFrom && filters.dateTo) {
      query = query
        .gte('stat_date', filters.dateFrom)
        .lte('stat_date', filters.dateTo)
    }

    // 应用分页
    const start = (page - 1) * pageSize
    query = query
      .range(start, start + pageSize - 1)
      .order(sortBy, { ascending: sortOrder === 'asc' })

    const { data, count, error } = await query

    if (error) throw error

    // 转换数据格式
    const nodes = (data || []).map(item => ({
      nodeId: item.node_id,
      nodeType: 'start', // 需要从节点配置中获取
      nodeLabel: `节点 ${item.node_id}`, // 需要从节点配置中获取
      position: { x: 0, y: 0 }, // 需要从节点配置中获取
      enterCount: item.enter_count,
      exitCount: item.exit_count,
      conversionRate: item.conversion_rate,
      avgStayTime: item.avg_stay_time,
      maxStayTime: item.max_stay_time,
      minStayTime: item.min_stay_time,
      uniqueUsers: item.unique_users,
      trend: item.hourly_stats || []
    }))

    // 计算汇总数据
    const summary = calculateNodeSummary(data || [])

    return {
      nodes,
      total: count || 0,
      page,
      pageSize,
      summary
    }
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
  try {
    // 获取用户会话
    const { data: sessionData, error: sessionError } = await supabase
      .from('canvas_user_sessions')
      .select(`
        id,
        user_id,
        device_type,
        location,
        session_start,
        session_end,
        total_duration,
        nodes_visited,
        conversions_count,
        metadata
      `)
      .eq('canvas_id', canvasId)
      .eq('user_id', userId)
      .order('session_start', { ascending: false })
      .limit(1)
      .single()

    if (sessionError) throw sessionError

    // 获取用户路径节点
    const { data: pathData, error: pathError } = await supabase
      .from('user_path_nodes')
      .select(`
        id,
        session_id,
        node_id,
        enter_time,
        exit_time,
        stay_time,
        conversion_type,
        conversion_value,
        previous_node_id,
        next_node_ids,
        node_position
      `)
      .eq('session_id', sessionData.id)
      .order('enter_time', { ascending: true })

    if (pathError) throw pathError

    // 转换路径数据格式
    const path = (pathData || []).map(item => ({
      nodeId: item.node_id,
      nodeLabel: `节点 ${item.node_id}`, // 需要从节点配置中获取
      position: item.node_position || { x: 0, y: 0 },
      enterTime: item.enter_time,
      exitTime: item.exit_time,
      stayTime: item.stay_time,
      conversionRate: item.conversion_value || 0,
      nextNodes: item.next_node_ids ? item.next_node_ids.split(',') : []
    }))

    return {
      userId: sessionData.user_id,
      userProfile: {
        firstVisit: sessionData.session_start,
        lastVisit: sessionData.session_end,
        totalVisits: sessionData.metadata?.total_visits || 1,
        deviceType: sessionData.device_type,
        location: sessionData.location
      },
      path,
      totalStayTime: sessionData.total_duration || 0,
      conversionPath: sessionData.conversions_count > 0
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
    // 根据请求参数获取数据
    const exportData: any = {}

    if (request.dataType === 'overview' || request.dataType === 'all') {
      const overviewStats = await getCanvasOverviewStats(canvasId, request.filters)
      exportData.overview = overviewStats
    }

    if (request.dataType === 'nodes' || request.dataType === 'all') {
      const nodeStats = await getNodeStatistics(canvasId, request.filters, 1, 1000)
      exportData.nodes = nodeStats
    }

    // 根据格式生成文件
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