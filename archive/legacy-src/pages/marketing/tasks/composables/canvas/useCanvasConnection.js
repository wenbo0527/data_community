import { ref, reactive, nextTick } from 'vue'
import { EdgeOverlapManager } from '../utils/EdgeOverlapManager.js'

/**
 * 连接线管理 Composable
 * 提供连接线的创建、删除、重叠检测、样式设置等功能
 */
export function useCanvasConnection(graph) {
  // 连接线状态
  const connections = ref([])
  const previewLines = ref([])
  const edgeOverlapManager = ref(null)
  const connectionStats = reactive({
    total: 0,
    byType: {},
    byStatus: {}
  })

  // 连接线配置
  const connectionConfig = reactive({
    defaultStyle: {
      stroke: '#1890ff',
      strokeWidth: 2,
      strokeDasharray: '0',
      targetMarker: {
        name: 'block',
        width: 8,
        height: 8
      }
    },
    previewStyle: {
      stroke: '#52c41a',
      strokeWidth: 2,
      strokeDasharray: '5,5',
      opacity: 0.7
    },
    overlapOffset: 20,
    animationDuration: 300
  })

  /**
   * 初始化连接线管理器
   */
  const initConnectionManager = () => {
    if (!graph.value) {
      console.warn('Graph instance not available for connection manager')
      return
    }

    try {
      // 初始化边重叠管理器
      edgeOverlapManager.value = new EdgeOverlapManager(graph.value)
      
      // 监听连接线事件
      setupConnectionEvents()
      
      console.log('Connection manager initialized successfully')
    } catch (error) {
      console.error('Failed to initialize connection manager:', error)
    }
  }

  /**
   * 设置连接线事件监听
   */
  const setupConnectionEvents = () => {
    if (!graph.value) return

    // 连接线添加事件
    graph.value.on('edge:added', handleEdgeAdded)
    
    // 连接线移除事件
    graph.value.on('edge:removed', handleEdgeRemoved)
    
    // 连接线连接事件
    graph.value.on('edge:connected', handleEdgeConnected)
    
    // 连接线断开事件
    graph.value.on('edge:disconnected', handleEdgeDisconnected)
  }

  /**
   * 处理连接线添加
   */
  const handleEdgeAdded = ({ edge }) => {
    try {
      // 跳过临时和预览线
      if (edge.id?.includes('temp-') || edge.id?.includes('preview-')) {
        return
      }

      // 添加到连接线列表
      const connectionData = {
        id: edge.id,
        source: edge.getSourceCellId(),
        target: edge.getTargetCellId(),
        sourcePort: edge.getSourcePortId(),
        targetPort: edge.getTargetPortId(),
        style: edge.getAttrs(),
        createdAt: new Date().toISOString()
      }

      connections.value.push(connectionData)
      updateConnectionStats()

      // 处理重叠检测
      if (edgeOverlapManager.value) {
        nextTick(() => {
          edgeOverlapManager.value.processEdgeOverlap(edge.id)
        })
      }

      console.log('Edge added:', connectionData)
    } catch (error) {
      console.error('Error handling edge added:', error)
    }
  }

  /**
   * 处理连接线移除
   */
  const handleEdgeRemoved = ({ edge }) => {
    try {
      // 从连接线列表中移除
      const index = connections.value.findIndex(conn => conn.id === edge.id)
      if (index > -1) {
        connections.value.splice(index, 1)
        updateConnectionStats()
      }

      // 清理重叠管理器缓存
      if (edgeOverlapManager.value) {
        edgeOverlapManager.value.handleEdgeRemoved({ edge })
      }

      console.log('Edge removed:', edge.id)
    } catch (error) {
      console.error('Error handling edge removed:', error)
    }
  }

  /**
   * 处理连接线连接完成
   */
  const handleEdgeConnected = ({ edge }) => {
    try {
      // 应用默认样式
      applyConnectionStyle(edge, connectionConfig.defaultStyle)
      
      // 更新连接数据
      const connectionIndex = connections.value.findIndex(conn => conn.id === edge.id)
      if (connectionIndex > -1) {
        connections.value[connectionIndex].connected = true
        connections.value[connectionIndex].connectedAt = new Date().toISOString()
      }

      console.log('Edge connected:', edge.id)
    } catch (error) {
      console.error('Error handling edge connected:', error)
    }
  }

  /**
   * 处理连接线断开
   */
  const handleEdgeDisconnected = ({ edge }) => {
    try {
      // 更新连接数据
      const connectionIndex = connections.value.findIndex(conn => conn.id === edge.id)
      if (connectionIndex > -1) {
        connections.value[connectionIndex].connected = false
        connections.value[connectionIndex].disconnectedAt = new Date().toISOString()
      }

      console.log('Edge disconnected:', edge.id)
    } catch (error) {
      console.error('Error handling edge disconnected:', error)
    }
  }

  /**
   * 创建连接线
   */
  const createConnection = (sourceId, targetId, options = {}) => {
    if (!graph.value) {
      console.warn('Graph instance not available')
      return null
    }

    try {
      const edgeConfig = {
        source: { cell: sourceId, port: options.sourcePort },
        target: { cell: targetId, port: options.targetPort },
        attrs: {
          line: {
            ...connectionConfig.defaultStyle,
            ...options.style
          }
        },
        ...options
      }

      const edge = graph.value.addEdge(edgeConfig)
      return edge
    } catch (error) {
      console.error('Error creating connection:', error)
      return null
    }
  }

  /**
   * 删除连接线
   */
  const removeConnection = (edgeId) => {
    if (!graph.value) {
      console.warn('Graph instance not available')
      return false
    }

    try {
      const edge = graph.value.getCellById(edgeId)
      if (edge) {
        graph.value.removeCell(edge)
        return true
      }
      return false
    } catch (error) {
      console.error('Error removing connection:', error)
      return false
    }
  }

  /**
   * 应用连接线样式
   */
  const applyConnectionStyle = (edge, style) => {
    try {
      if (edge && style) {
        edge.setAttrs({
          line: style
        })
      }
    } catch (error) {
      console.error('Error applying connection style:', error)
    }
  }

  /**
   * 创建预览线
   */
  const createPreviewLine = (sourceId, targetPosition, options = {}) => {
    if (!graph.value) return null

    try {
      const previewId = `preview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const previewEdge = graph.value.addEdge({
        id: previewId,
        source: { cell: sourceId, port: options.sourcePort },
        target: targetPosition,
        attrs: {
          line: {
            ...connectionConfig.previewStyle,
            ...options.style
          }
        },
        zIndex: -1
      })

      previewLines.value.push({
        id: previewId,
        edge: previewEdge,
        createdAt: Date.now()
      })

      return previewEdge
    } catch (error) {
      console.error('Error creating preview line:', error)
      return null
    }
  }

  /**
   * 清理预览线
   */
  const clearPreviewLines = () => {
    try {
      previewLines.value.forEach(preview => {
        if (preview.edge && graph.value) {
          graph.value.removeCell(preview.edge)
        }
      })
      previewLines.value = []
    } catch (error) {
      console.error('Error clearing preview lines:', error)
    }
  }

  /**
   * 更新连接统计
   */
  const updateConnectionStats = () => {
    connectionStats.total = connections.value.length
    
    // 按类型统计
    connectionStats.byType = connections.value.reduce((acc, conn) => {
      const type = conn.type || 'default'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})
    
    // 按状态统计
    connectionStats.byStatus = connections.value.reduce((acc, conn) => {
      const status = conn.connected ? 'connected' : 'disconnected'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})
  }

  /**
   * 获取节点的所有连接
   */
  const getNodeConnections = (nodeId) => {
    return connections.value.filter(conn => 
      conn.source === nodeId || conn.target === nodeId
    )
  }

  /**
   * 检查两个节点是否已连接
   */
  const areNodesConnected = (sourceId, targetId) => {
    return connections.value.some(conn => 
      (conn.source === sourceId && conn.target === targetId) ||
      (conn.source === targetId && conn.target === sourceId)
    )
  }

  /**
   * 更新布局方向
   */
  const updateLayoutDirection = (direction) => {
    if (edgeOverlapManager.value) {
      edgeOverlapManager.value.updateLayoutDirection(direction)
    }
  }

  /**
   * 清理连接管理器
   */
  const cleanup = () => {
    try {
      // 清理预览线
      clearPreviewLines()
      
      // 清理事件监听
      if (graph.value) {
        graph.value.off('edge:added', handleEdgeAdded)
        graph.value.off('edge:removed', handleEdgeRemoved)
        graph.value.off('edge:connected', handleEdgeConnected)
        graph.value.off('edge:disconnected', handleEdgeDisconnected)
      }
      
      // 清理重叠管理器
      if (edgeOverlapManager.value) {
        edgeOverlapManager.value.cleanup()
        edgeOverlapManager.value = null
      }
      
      // 重置状态
      connections.value = []
      connectionStats.total = 0
      connectionStats.byType = {}
      connectionStats.byStatus = {}
      
      console.log('Connection manager cleaned up')
    } catch (error) {
      console.error('Error during connection cleanup:', error)
    }
  }

  return {
    // 状态
    connections,
    previewLines,
    connectionStats,
    connectionConfig,
    
    // 方法
    initConnectionManager,
    createConnection,
    removeConnection,
    applyConnectionStyle,
    createPreviewLine,
    clearPreviewLines,
    getNodeConnections,
    areNodesConnected,
    updateLayoutDirection,
    cleanup
  }
}