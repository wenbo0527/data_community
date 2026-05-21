import { generateUniqueId } from './idGenerator.js'
import { StyleConfig } from './StyleConfig.js'
import { ErrorHandler } from './ErrorHandler.js'

/**
 * 图形操作工具类
 * 提供节点和连接的统一操作方法，消除重复代码
 */
export class GraphOperationUtils {
  constructor(graph, emit) {
    this.graph = graph
    this.emit = emit
  }

  /**
   * 添加节点到图形
   * @param {Object} nodeData - 节点数据
   * @param {Array} nodesList - 节点列表引用
   * @returns {Object|null} 创建的节点对象
   */
  addNode(nodeData, nodesList) {
    return ErrorHandler.handleOperation(() => {
      if (!this.graph.value) {return null}

      const nodeId = nodeData.id || generateUniqueId()
      const node = {
        id: nodeId,
        type: nodeData.type,
        x: nodeData.x || 100,
        y: nodeData.y || 100,
        data: nodeData.data || {},
        ...nodeData
      }

      // 🔧 修复：使用nodeTypes.js中的配置获取正确的形状和样式
      let nodeConfig = { shape: 'circle' } // 默认配置
      let nodeAttrs = StyleConfig.getNodeStyle() // 默认样式
      
      try {
        const { getNodeConfig, getNodeAttrs } = require('../../../../utils/nodeTypes.js')
        const config = getNodeConfig(node.type)
        const attrs = getNodeAttrs(node.type)
        
        if (config) {nodeConfig = config}
        if (attrs) {nodeAttrs = attrs}
      } catch (error) {
        console.warn('[GraphOperationUtils] 获取节点配置失败，使用默认值:', error)
      }

      // 添加到图形
      this.graph.value.addNode({
        id: nodeId,
        x: node.x,
        y: node.y,
        width: nodeConfig.width || 120,
        height: nodeConfig.height || 60,
        shape: nodeConfig.shape,
        label: node.data.label || node.type,
        attrs: nodeAttrs
      })

      // 添加到节点列表
      nodesList.push(node)
      this.emit('nodes-updated', nodesList)
      
      return node
    }, '添加节点')
  }

  /**
   * 更新节点
   * @param {string} nodeId - 节点ID
   * @param {Object} updates - 更新数据
   * @param {Array} nodesList - 节点列表引用
   */
  updateNode(nodeId, updates, nodesList) {
    ErrorHandler.handleOperation(() => {
      const nodeIndex = nodesList.findIndex(n => n.id === nodeId)
      if (nodeIndex === -1) {return}

      nodesList[nodeIndex] = { ...nodesList[nodeIndex], ...updates }
      
      // 更新图形中的节点
      const graphNode = this.graph.value?.getCellById(nodeId)
      if (graphNode) {
        if (updates.x !== undefined || updates.y !== undefined) {
          graphNode.setPosition(
            updates.x || graphNode.getPosition().x, 
            updates.y || graphNode.getPosition().y
          )
        }
        if (updates.data?.label) {
          graphNode.setLabel(updates.data.label)
        }
      }
      
      this.emit('nodes-updated', nodesList)
    }, '更新节点')
  }

  /**
   * 删除节点
   * @param {string} nodeId - 节点ID
   * @param {Array} nodesList - 节点列表引用
   */
  deleteNode(nodeId, nodesList) {
    ErrorHandler.handleOperation(() => {
      const nodeIndex = nodesList.findIndex(n => n.id === nodeId)
      if (nodeIndex === -1) {return}

      nodesList.splice(nodeIndex, 1)
      
      // 从图形中删除
      const graphNode = this.graph.value?.getCellById(nodeId)
      if (graphNode) {
        this.graph.value.removeNode(graphNode)
      }
      
      this.emit('nodes-updated', nodesList)
    }, '删除节点')
  }

  /**
   * 添加连接到图形（优化版）
   * @param {Object} connectionData - 连接数据
   * @param {Array} connectionsList - 连接列表引用
   * @returns {Object|null} 创建的连接对象
   */
  addConnection(connectionData, connectionsList) {
    return ErrorHandler.handleOperation(() => {
      if (!this.graph.value) {return null}

      const connectionId = connectionData.id || generateUniqueId()
      
      // 验证源节点和目标节点是否存在于图中
      const sourceCellId = connectionData.source?.cell || connectionData.source
      const targetCellId = connectionData.target?.cell || connectionData.target
      
      const sourceNode = this.graph.value.getCellById(sourceCellId)
      const targetNode = this.graph.value.getCellById(targetCellId)
      
      if (!sourceNode) {
        throw new Error(`源节点不存在于图中: ${sourceCellId}`)
      }
      if (!targetNode) {
        throw new Error(`目标节点不存在于图中: ${targetCellId}`)
      }

      // 检查重复连接
      const branchId = connectionData.branchId || connectionData.data?.branchId
      const existingConnection = this.checkDuplicateConnection(sourceCellId, targetCellId, branchId, connectionsList)
      if (existingConnection) {
        console.warn('⚠️ [GraphOperationUtils] 检测到重复连接，返回现有连接:', {
          sourceCellId,
          targetCellId,
          branchId,
          existingConnectionId: existingConnection.id
        })
        return existingConnection
      }

      const connection = {
        id: connectionId,
        source: connectionData.source,
        target: connectionData.target,
        data: connectionData.data || {},
        ...connectionData
      }

      // 统一端口配置：源端口为out，目标端口为in
      const sourcePort = connectionData.source?.port || connectionData.sourcePort || 'out'
      const targetPort = connectionData.target?.port || connectionData.targetPort || 'in'

      // 添加到图形
      const edgeConfig = {
        id: connectionId,
        source: { 
          cell: sourceCellId,
          port: sourcePort
        },
        target: { 
          cell: targetCellId,
          port: targetPort
        },
        attrs: StyleConfig.getConnectionStyle(),
        data: {
          ...connection.data,
          branchId: branchId,
          type: connection.type || 'connection',
          createdBy: connection.createdBy || 'system',
          isConnection: true,
          isPreview: false,
          sourceNodeId: sourceCellId,
          targetNodeId: targetCellId,
          sourcePort: sourcePort,
          targetPort: targetPort
        }
      }
      
      console.log('🔗 [GraphOperationUtils] 创建连接配置:', {
        connectionId,
        source: edgeConfig.source,
        target: edgeConfig.target,
        branchId: branchId,
        type: connection.type,
        sourcePort,
        targetPort
      })
      
      const graphEdge = this.graph.value.addEdge(edgeConfig)

      // 添加到连接列表
      connectionsList.push(connection)
      
      // 触发连接创建事件
      this.emit('connection:created', {
        connection: connection,
        graphEdge: graphEdge,
        sourceNodeId: sourceCellId,
        targetNodeId: targetCellId,
        sourcePort,
        targetPort,
        branchId
      })
      
      this.emit('connections-updated', connectionsList)
      
      console.log('✅ [GraphOperationUtils] 连接创建成功:', {
        connectionId,
        sourceNodeId: sourceCellId,
        targetNodeId: targetCellId,
        sourcePort,
        targetPort,
        branchId
      })
      
      return connection
    }, '添加连接')
  }

  /**
   * 检查重复连接的辅助函数
   * @param {string} sourceNodeId - 源节点ID
   * @param {string} targetNodeId - 目标节点ID
   * @param {string} branchId - 分支ID
   * @param {Array} connectionsList - 连接列表
   * @returns {Object|null} 现有连接或null
   */
  checkDuplicateConnection(sourceNodeId, targetNodeId, branchId = null, connectionsList = []) {
    if (!sourceNodeId || !targetNodeId) {
      return null
    }

    // 首先检查连接列表
    const existingInList = connectionsList.find(connection => {
      const matchesNodes = (connection.source?.cell || connection.source) === sourceNodeId && 
                          (connection.target?.cell || connection.target) === targetNodeId
      const matchesBranch = branchId ? connection.branchId === branchId : true
      return matchesNodes && matchesBranch
    })

    if (existingInList) {
      return existingInList
    }

    // 检查图形中的边
    if (this.graph.value) {
      const allEdges = this.graph.value.getEdges() || []
      const existingInGraph = allEdges.find(edge => {
        const edgeData = edge.getData() || {}
        const edgeSourceId = edgeData.sourceNodeId || edge.getSourceCellId()
        const edgeTargetId = edgeData.targetNodeId || edge.getTargetCellId()
        const edgeBranchId = edgeData.branchId

        const matchesNodes = edgeSourceId === sourceNodeId && edgeTargetId === targetNodeId
        const matchesBranch = branchId ? edgeBranchId === branchId : true
        const isNotPreview = !edgeData.isPreview

        return matchesNodes && matchesBranch && isNotPreview
      })

      if (existingInGraph) {
        // 从图形边构造连接对象
        const edgeData = existingInGraph.getData() || {}
        return {
          id: existingInGraph.id,
          source: existingInGraph.getSourceCellId(),
          target: existingInGraph.getTargetCellId(),
          data: edgeData,
          branchId: edgeData.branchId
        }
      }
    }

    return null
  }

  /**
   * 更新连接
   * @param {string} connectionId - 连接ID
   * @param {Object} updates - 更新数据
   * @param {Array} connectionsList - 连接列表引用
   */
  updateConnection(connectionId, updates, connectionsList) {
    ErrorHandler.handleOperation(() => {
      const connectionIndex = connectionsList.findIndex(c => c.id === connectionId)
      if (connectionIndex === -1) {return}

      connectionsList[connectionIndex] = { ...connectionsList[connectionIndex], ...updates }
      
      // 更新图形中的连接
      const graphEdge = this.graph.value?.getCellById(connectionId)
      if (graphEdge) {
        if (updates.source) {
          graphEdge.setSource(updates.source)
        }
        if (updates.target) {
          graphEdge.setTarget(updates.target)
        }
      }
      
      this.emit('connections-updated', connectionsList)
    }, '更新连接')
  }

  /**
   * 删除连接
   * @param {string} connectionId - 连接ID
   * @param {Array} connectionsList - 连接列表引用
   */
  deleteConnection(connectionId, connectionsList) {
    ErrorHandler.handleOperation(() => {
      const connectionIndex = connectionsList.findIndex(c => c.id === connectionId)
      if (connectionIndex === -1) {return}

      connectionsList.splice(connectionIndex, 1)
      
      // 从图形中删除
      const graphEdge = this.graph.value?.getCellById(connectionId)
      if (graphEdge) {
        this.graph.value.removeEdge(graphEdge)
      }
      
      this.emit('connections-updated', connectionsList)
    }, '删除连接')
  }

  /**
   * 复制节点
   * @param {string} nodeId - 原节点ID
   * @param {Array} nodesList - 节点列表引用
   * @param {number} offsetX - X轴偏移量
   * @param {number} offsetY - Y轴偏移量
   */
  duplicateNode(nodeId, nodesList, offsetX = 50, offsetY = 50) {
    ErrorHandler.handleOperation(() => {
      const originalNode = nodesList.find(n => n.id === nodeId)
      if (!originalNode) {return}

      const newNode = {
        ...originalNode,
        id: generateUniqueId(),
        x: originalNode.x + offsetX,
        y: originalNode.y + offsetY
      }
      
      this.addNode(newNode, nodesList)
    }, '复制节点')
  }

  /**
   * 清空画布
   * @param {Object} previewManager - 预览线管理器实例（可选）
   */
  clearCanvas(previewManager = null) {
    ErrorHandler.handleOperation(() => {
      // 先清理预览线管理器状态
      if (previewManager) {
        try {
          if (typeof previewManager.clearAllPreviewLines === 'function') {
            console.log('[GraphOperationUtils] 清理预览线管理器状态')
            previewManager.clearAllPreviewLines()
          } else if (typeof previewManager.destroy === 'function') {
            console.log('[GraphOperationUtils] 销毁预览线管理器')
            previewManager.destroy()
          }
        } catch (error) {
          console.warn('[GraphOperationUtils] 清理预览线管理器失败:', error)
        }
      }
      
      if (this.graph.value) {
        this.graph.value.clearCells()
      }
    }, '清空画布')
  }

  /**
   * 批量恢复节点和连接
   * @param {Array} nodesData - 节点数据数组
   * @param {Array} connectionsData - 连接数据数组
   * @param {Array} nodesList - 节点列表引用
   * @param {Array} connectionsList - 连接列表引用
   */
  restoreState(nodesData, connectionsData, nodesList, connectionsList) {
    ErrorHandler.handleOperation(() => {
      // 清空当前画布
      this.clearCanvas()
      
      // 清空当前数据
      nodesList.length = 0
      connectionsList.length = 0

      // 恢复节点
      nodesData.forEach(nodeData => {
        // 🔧 修复：使用nodeTypes.js中的配置获取正确的形状和样式
        let nodeConfig = { shape: 'circle' } // 默认配置
        let nodeAttrs = StyleConfig.getNodeStyle() // 默认样式
        
        try {
          const { getNodeConfig, getNodeAttrs } = require('../../../../utils/nodeTypes.js')
          const config = getNodeConfig(nodeData.type)
          const attrs = getNodeAttrs(nodeData.type)
          
          if (config) {nodeConfig = config}
          if (attrs) {nodeAttrs = attrs}
        } catch (error) {
          console.warn('[GraphOperationUtils] 获取节点配置失败，使用默认值:', error)
        }

        this.graph.value.addNode({
          id: nodeData.id,
          x: nodeData.x,
          y: nodeData.y,
          width: nodeConfig.width || 120,
          height: nodeConfig.height || 60,
          shape: nodeConfig.shape,
          label: nodeData.data?.label || nodeData.type,
          attrs: nodeAttrs
        })
        
        nodesList.push(nodeData)
      })

      // 恢复连接
      connectionsData.forEach(connectionData => {
        this.graph.value.addEdge({
          id: connectionData.id,
          source: connectionData.source,
          target: connectionData.target,
          attrs: StyleConfig.getConnectionStyle()
        })
        
        connectionsList.push(connectionData)
      })
    }, '恢复状态')
  }
}