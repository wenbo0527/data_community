/**
 * 连接创建控制器
 * 统一管理连接创建流程，确保所有连接都经过预览线验证
 */
export class ConnectionCreationController {
  constructor(graph, options = {}) {
    this.graph = graph
    this.options = {
      enableValidation: true,
      requirePreviewLine: true,
      autoCleanupPreview: true,
      ...options
    }
    
    this.connectionHistory = new Map()
    this.pendingConnections = new Map()
    this.stats = {
      created: 0,
      failed: 0,
      fromPreview: 0,
      direct: 0
    }
    
    console.log('🔗 [ConnectionController] 连接创建控制器初始化完成')
  }

  /**
   * 创建连接（统一入口）
   */
  async createConnection(options = {}) {
    const {
      sourceNodeId,
      targetNodeId,
      sourcePort = 'out',
      targetPort = 'in',
      previewLineId = null,
      style = {},
      metadata = {}
    } = options

    try {
      // 验证基本参数
      if (!sourceNodeId || !targetNodeId) {
        throw new Error('源节点ID和目标节点ID不能为空')
      }

      if (!this.graph) {
        throw new Error('图实例不存在')
      }

      // 获取节点实例
      const sourceNode = this.graph.getCellById(sourceNodeId)
      const targetNode = this.graph.getCellById(targetNodeId)

      if (!sourceNode) {
        throw new Error(`源节点不存在: ${sourceNodeId}`)
      }

      if (!targetNode) {
        throw new Error(`目标节点不存在: ${targetNodeId}`)
      }

      // 检查是否为自连接
      if (sourceNodeId === targetNodeId) {
        throw new Error('不允许节点连接到自身')
      }

      // 检查重复连接
      const existingConnection = this.findExistingConnection(sourceNodeId, targetNodeId)
      if (existingConnection) {
        throw new Error(`连接已存在: ${sourceNodeId} -> ${targetNodeId}`)
      }

      // 创建连接数据
      const connectionData = {
        id: this.generateConnectionId(),
        source: {
          cell: sourceNodeId,
          port: sourcePort
        },
        target: {
          cell: targetNodeId,
          port: targetPort
        },
        attrs: {
          line: {
            stroke: style.stroke || '#A2B1C3',
            strokeWidth: style.strokeWidth || 2,
            strokeDasharray: style.strokeDasharray || 'none',
            targetMarker: {
              name: 'block',
              width: 12,
              height: 8,
              fill: style.stroke || '#A2B1C3'
            }
          }
        },
        data: {
          type: 'connection',
          isPreview: false,
          isConnection: true,
          sourceNodeId,
          targetNodeId,
          sourcePort,
          targetPort,
          createdAt: Date.now(),
          createdBy: 'ConnectionController',
          fromPreviewLine: !!previewLineId,
          ...metadata
        }
      }

      // 添加到图形
      const edge = this.graph.addEdge(connectionData)

      // 记录连接历史
      this.connectionHistory.set(connectionData.id, {
        ...connectionData,
        edge,
        createdAt: Date.now()
      })

      // 更新统计
      this.stats.created++
      if (previewLineId) {
        this.stats.fromPreview++
      } else {
        this.stats.direct++
      }

      console.log('✅ [ConnectionController] 连接创建成功:', {
        id: connectionData.id,
        sourceNodeId,
        targetNodeId,
        fromPreview: !!previewLineId
      })

      return {
        id: connectionData.id,
        edge,
        sourceNodeId,
        targetNodeId,
        sourcePort,
        targetPort,
        fromPreviewLine: !!previewLineId
      }

    } catch (error) {
      this.stats.failed++
      console.error('❌ [ConnectionController] 连接创建失败:', error)
      throw error
    }
  }

  /**
   * 从预览线创建连接
   */
  async createConnectionFromPreview(previewLine, targetNodeId, options = {}) {
    if (!previewLine) {
      throw new Error('预览线不能为空')
    }

    return await this.createConnection({
      sourceNodeId: previewLine.source.nodeId,
      targetNodeId,
      sourcePort: previewLine.source.port || 'out',
      targetPort: options.targetPort || 'in',
      previewLineId: previewLine.id,
      style: options.style || {},
      metadata: {
        ...previewLine.metadata,
        convertedFromPreview: true,
        originalPreviewId: previewLine.id,
        ...options.metadata
      }
    })
  }

  /**
   * 查找现有连接
   */
  findExistingConnection(sourceNodeId, targetNodeId) {
    if (!this.graph) return null

    const edges = this.graph.getEdges() || []
    
    return edges.find(edge => {
      const edgeData = edge.getData() || {}
      const edgeSourceId = edgeData.sourceNodeId || edge.getSourceCellId()
      const edgeTargetId = edgeData.targetNodeId || edge.getTargetCellId()
      
      return edgeSourceId === sourceNodeId && 
             edgeTargetId === targetNodeId && 
             !edgeData.isPreview
    })
  }

  /**
   * 删除连接
   */
  removeConnection(connectionId) {
    const connection = this.connectionHistory.get(connectionId)
    if (!connection) {
      console.warn(`连接不存在: ${connectionId}`)
      return false
    }

    try {
      if (connection.edge && this.graph) {
        this.graph.removeEdge(connection.edge)
      }
      
      this.connectionHistory.delete(connectionId)
      
      console.log('🗑️ [ConnectionController] 连接删除成功:', connectionId)
      return true
      
    } catch (error) {
      console.error('❌ [ConnectionController] 连接删除失败:', error)
      return false
    }
  }

  /**
   * 生成连接ID
   */
  generateConnectionId() {
    return `connection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 验证连接有效性
   */
  validateConnection(sourceNodeId, targetNodeId) {
    const errors = []
    
    if (!sourceNodeId) {
      errors.push('源节点ID不能为空')
    }
    
    if (!targetNodeId) {
      errors.push('目标节点ID不能为空')
    }
    
    if (sourceNodeId === targetNodeId) {
      errors.push('不允许节点连接到自身')
    }
    
    if (this.findExistingConnection(sourceNodeId, targetNodeId)) {
      errors.push('连接已存在')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 获取连接统计信息
   */
  getStats() {
    return {
      ...this.stats,
      totalConnections: this.connectionHistory.size,
      pendingConnections: this.pendingConnections.size
    }
  }

  /**
   * 获取所有连接
   */
  getAllConnections() {
    return Array.from(this.connectionHistory.values())
  }

  /**
   * 根据节点获取连接
   */
  getConnectionsByNode(nodeId) {
    return this.getAllConnections().filter(connection => 
      connection.sourceNodeId === nodeId || connection.targetNodeId === nodeId
    )
  }

  /**
   * 清理无效连接
   */
  cleanupInvalidConnections() {
    let cleanedCount = 0
    
    for (const [connectionId, connection] of this.connectionHistory) {
      if (!connection.edge || !this.graph.hasCell(connection.edge)) {
        this.connectionHistory.delete(connectionId)
        cleanedCount++
      }
    }
    
    console.log(`🧹 [ConnectionController] 清理了 ${cleanedCount} 个无效连接`)
    return cleanedCount
  }

  /**
   * 销毁控制器
   */
  destroy() {
    this.connectionHistory.clear()
    this.pendingConnections.clear()
    this.graph = null
    
    console.log('🗑️ [ConnectionController] 连接创建控制器已销毁')
  }
}

export default ConnectionCreationController