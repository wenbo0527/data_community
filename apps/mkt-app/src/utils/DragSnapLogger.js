/**
 * 拖拽吸附日志管理器
 * 优化日志输出，减少过程日志，只在拖拽结束时展示关键信息
 */

class DragSnapLogger {
  constructor() {
    this.dragSessions = new Map() // 存储拖拽会话信息
    this.isDebugMode = false // 调试模式开关
  }

  /**
   * 开始拖拽会话
   * @param {string} sessionId - 拖拽会话ID
   * @param {Object} startInfo - 开始拖拽的信息
   */
  startDragSession(sessionId, startInfo) {
    this.dragSessions.set(sessionId, {
      sessionId,
      startTime: Date.now(),
      startInfo,
      processLogs: [], // 存储过程中的关键信息，但不立即输出
      endInfo: null
    })

    if (this.isDebugMode) {
      // 已禁用拖拽开始日志以减少控制台冗余信息
      // console.log('🚀 [拖拽开始]', {
      //   sessionId,
      //   startInfo,
      //   timestamp: new Date().toISOString()
      // })
    }
  }

  /**
   * 记录拖拽过程信息（不立即输出）
   * @param {string} sessionId - 拖拽会话ID
   * @param {string} type - 日志类型
   * @param {Object} data - 日志数据
   */
  logProcess(sessionId, type, data) {
    const session = this.dragSessions.get(sessionId)
    if (session) {
      session.processLogs.push({
        type,
        data,
        timestamp: Date.now()
      })
    }
  }

  /**
   * 结束拖拽会话并输出完整日志
   * @param {string} sessionId - 拖拽会话ID
   * @param {Object} endInfo - 结束拖拽的信息
   */
  endDragSession(sessionId, endInfo) {
    const session = this.dragSessions.get(sessionId)
    if (!session) return

    session.endInfo = endInfo
    session.endTime = Date.now()
    session.duration = session.endTime - session.startTime

    // 输出完整的拖拽会话日志
    this.outputDragSessionSummary(session)

    // 清理会话
    this.dragSessions.delete(sessionId)
  }

  /**
   * 输出拖拽会话摘要
   * @param {Object} session - 拖拽会话信息
   */
  outputDragSessionSummary(session) {
    const { startInfo, endInfo, duration, processLogs } = session

    // 构建摘要信息
    const summary = {
      sessionId: session.sessionId,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      
      // 开始节点信息
      startNode: {
        id: startInfo.nodeId,
        type: startInfo.nodeType,
        position: startInfo.startPosition,
        name: startInfo.nodeName
      },

      // 结束节点信息
      endNode: endInfo.success ? {
        id: endInfo.targetNodeId,
        type: endInfo.targetNodeType,
        position: endInfo.endPosition,
        name: endInfo.targetNodeName
      } : null,

      // 拖拽点信息
      dragHint: {
        id: endInfo.dragHintId,
        branchId: endInfo.branchId,
        branchLabel: endInfo.branchLabel,
        finalPosition: endInfo.dragHintPosition
      },

      // 最近的普通节点in端口坐标
      nearestNodeInPort: this.findNearestNodeInPort(endInfo),

      // 结果信息
      result: {
        success: endInfo.success,
        action: endInfo.action, // 'connection', 'new_node', 'failed'
        snapDistance: endInfo.snapDistance,
        snapThreshold: endInfo.snapThreshold || 80
      },

      // 关键过程事件统计
      processStats: this.summarizeProcessLogs(processLogs)
    }

    // 根据结果类型输出不同的日志
    // 已禁用拖拽吸附结果日志以减少控制台冗余信息
    // if (endInfo.success) {
    //   console.log('✅ [拖拽吸附完成] 拖拽成功结束:', summary)
    // } else {
    //   console.log('❌ [拖拽吸附失败] 拖拽未成功吸附:', summary)
    // }
  }

  /**
   * 查找最近的普通节点in端口坐标
   * @param {Object} endInfo - 结束信息
   * @returns {Object|null} 最近节点的in端口坐标
   */
  findNearestNodeInPort(endInfo) {
    if (!endInfo.nearestNodes || endInfo.nearestNodes.length === 0) {
      return null
    }

    // 找到最近的普通节点
    const nearestNode = endInfo.nearestNodes.find(node => 
      node.type === 'normal' || !['endpoint', 'preview'].includes(node.type)
    )

    if (!nearestNode) return null

    // 计算in端口坐标（通常在节点顶部中心）
    const inPortPosition = {
      x: nearestNode.position.x + (nearestNode.size?.width || 100) / 2,
      y: nearestNode.position.y,
      nodeId: nearestNode.id,
      nodeType: nearestNode.type,
      distance: nearestNode.distance
    }

    return inPortPosition
  }

  /**
   * 汇总过程日志
   * @param {Array} processLogs - 过程日志数组
   * @returns {Object} 过程统计信息
   */
  summarizeProcessLogs(processLogs) {
    const stats = {
      totalEvents: processLogs.length,
      snapDetections: 0,
      positionUpdates: 0,
      highlightChanges: 0,
      coordinateCorrections: 0
    }

    processLogs.forEach(log => {
      switch (log.type) {
        case 'snap_detection':
          stats.snapDetections++
          break
        case 'position_update':
          stats.positionUpdates++
          break
        case 'highlight_change':
          stats.highlightChanges++
          break
        case 'coordinate_correction':
          stats.coordinateCorrections++
          break
      }
    })

    return stats
  }

  /**
   * 设置调试模式
   * @param {boolean} enabled - 是否启用调试模式
   */
  setDebugMode(enabled) {
    this.isDebugMode = enabled
    console.log(`🔧 [拖拽日志] 调试模式${enabled ? '已启用' : '已禁用'}`)
  }

  /**
   * 清理所有会话
   */
  clearAllSessions() {
    this.dragSessions.clear()
  }

  /**
   * 获取当前活跃的会话数量
   * @returns {number} 活跃会话数量
   */
  getActiveSessionCount() {
    return this.dragSessions.size
  }
}

// 创建全局实例
export const dragSnapLogger = new DragSnapLogger()

// 导出类以便测试
export { DragSnapLogger }

/**
 * 拖拽会话ID生成器
 * @param {string} nodeId - 节点ID
 * @returns {string} 会话ID
 */
export function generateDragSessionId(nodeId) {
  return `drag_${nodeId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 快捷方法：开始节点拖拽日志记录
 * @param {Object} node - 节点对象
 * @param {Object} position - 开始位置
 * @returns {string} 会话ID
 */
export function startNodeDragLogging(node, position) {
  const sessionId = generateDragSessionId(node.id)
  const nodeData = node.getData() || {}
  
  dragSnapLogger.startDragSession(sessionId, {
    nodeId: node.id,
    nodeType: nodeData.type,
    nodeName: nodeData.name || nodeData.label,
    startPosition: { ...position },
    startTime: Date.now()
  })
  
  return sessionId
}

/**
 * 快捷方法：结束节点拖拽日志记录
 * @param {string} sessionId - 会话ID
 * @param {Object} endPosition - 结束位置
 * @param {Object} nearestInPortCoord - 最近的普通节点in端口坐标
 */
export function endNodeDragLogging(sessionId, endPosition, nearestInPortCoord) {
  const session = dragSnapLogger.dragSessions.get(sessionId)
  if (!session) return

  // 从过程日志中提取关键信息
  const snapDetection = session.processLogs.find(log => log.type === 'snap_detection')
  const connectionCreated = session.processLogs.find(log => log.type === 'connection_created')
  const beforeSnap = session.processLogs.find(log => log.type === 'before_snap')

  // 构建结束信息
  const endInfo = {
    endPosition: { ...endPosition },
    nearestInPortCoord,
    success: !!connectionCreated,
    action: connectionCreated ? 'connection' : 'failed',
    snapDistance: snapDetection?.data?.nearestDistance,
    snapThreshold: snapDetection?.data?.threshold || 80,
    dragHintId: beforeSnap?.data?.dragHint?.id,
    branchId: connectionCreated?.data?.connection?.branchId,
    branchLabel: connectionCreated?.data?.connection?.branchLabel,
    dragHintPosition: beforeSnap?.data?.dragHint?.position,
    targetNodeId: connectionCreated?.data?.connection?.targetId,
    targetNodeType: session.startInfo.nodeType,
    targetNodeName: session.startInfo.nodeName,
    nearestNodes: nearestInPortCoord ? [{
      id: nearestInPortCoord.nodeId,
      type: nearestInPortCoord.nodeType,
      position: { x: nearestInPortCoord.x, y: nearestInPortCoord.y },
      distance: nearestInPortCoord.distance
    }] : []
  }

  dragSnapLogger.endDragSession(sessionId, endInfo)
}