/**
 * In端口吸附检测器
 * 专门针对目标节点的in端口进行精确吸附检测
 */
export class InPortSnapDetector {
  constructor(graph, options = {}) {
    this.graph = graph
    this.options = {
      snapDistance: 20,
      enableVisualFeedback: true,
      highlightColor: '#52c41a',
      highlightWidth: 3,
      ...options
    }
    
    this.snapTargets = new Map()
    this.currentHighlight = null
    this.snapCache = new Map()
    
    console.log('🎯 [InPortSnapDetector] In端口吸附检测器初始化完成')
  }

  /**
   * 检测吸附目标
   */
  detectSnapTarget(mousePosition, excludeNodeId = null) {
    const { x, y } = mousePosition
    let closestTarget = null
    let minDistance = this.options.snapDistance

    // 遍历所有节点，查找可吸附的in端口
    const nodes = this.graph.getNodes() || []
    
    for (const node of nodes) {
      const nodeId = node.id
      
      // 排除指定节点（通常是源节点）
      if (nodeId === excludeNodeId) {continue}
      
      // 检查节点是否有in端口
      const nodeData = node.getData() || {}
      const nodeType = nodeData.nodeType || nodeData.type
      
      if (!this.hasInPort(nodeType)) {continue}
      
      // 计算in端口位置
      const inPortPosition = this.calculateInPortPosition(node)
      if (!inPortPosition) {continue}
      
      // 计算距离
      const distance = Math.sqrt(
        Math.pow(x - inPortPosition.x, 2) + 
        Math.pow(y - inPortPosition.y, 2)
      )
      
      // 检查是否在吸附范围内
      if (distance < minDistance) {
        minDistance = distance
        closestTarget = {
          nodeId,
          node,
          port: 'in',
          position: inPortPosition,
          distance,
          nodeType
        }
      }
    }

    return closestTarget
  }

  /**
   * 检查节点类型是否有in端口
   */
  hasInPort(nodeType) {
    // start节点没有in端口
    if (nodeType === 'start') {return false}
    
    // 其他节点类型默认都有in端口
    return true
  }

  /**
   * 计算节点in端口的精确位置
   */
  calculateInPortPosition(node) {
    try {
      const nodePosition = node.getPosition()
      const nodeSize = node.getSize()
      
      // 🔧 修复：in端口应该在节点的顶部中心位置，与x6Config保持一致
      // 使用与x6Config.js中相同的计算逻辑
      const xPercent = 0.5  // 50%水平居中
      const yPercent = 0.0  // 0%顶部位置
      const dx = 0
      const dy = -2  // 与x6Config中in端口的dy保持一致
      
      return {
        x: nodePosition.x + nodeSize.width * xPercent + dx,  // 水平居中
        y: nodePosition.y + nodeSize.height * yPercent + dy  // 顶部位置，微调向上
      }
    } catch (error) {
      console.warn('计算in端口位置失败:', error)
      return null
    }
  }

  /**
   * 显示吸附视觉反馈
   */
  showSnapFeedback(target) {
    if (!this.options.enableVisualFeedback || !target) {return}

    // 清除之前的高亮
    this.clearSnapFeedback()

    try {
      // 创建高亮效果
      const highlight = this.graph.addNode({
        x: target.position.x - 8,
        y: target.position.y - 8,
        width: 16,
        height: 16,
        shape: 'circle',
        attrs: {
          body: {
            fill: this.options.highlightColor,
            stroke: this.options.highlightColor,
            strokeWidth: this.options.highlightWidth,
            opacity: 0.8
          }
        },
        zIndex: 1000,
        data: {
          isSnapHighlight: true,
          targetNodeId: target.nodeId
        }
      })

      this.currentHighlight = highlight

      console.log('🎯 [InPortSnapDetector] 显示吸附反馈:', target.nodeId)
      
    } catch (error) {
      console.warn('显示吸附反馈失败:', error)
    }
  }

  /**
   * 清除吸附视觉反馈
   */
  clearSnapFeedback() {
    if (this.currentHighlight && this.graph) {
      try {
        this.graph.removeNode(this.currentHighlight)
        this.currentHighlight = null
      } catch (error) {
        console.warn('清除吸附反馈失败:', error)
      }
    }
  }

  /**
   * 执行吸附操作
   */
  performSnap(target, previewLine) {
    if (!target || !previewLine) {return null}

    try {
      // 更新预览线的目标位置
      const snapPosition = target.position
      
      // 如果预览线有图形实例，更新其目标位置
      if (previewLine.graphInstance) {
        previewLine.graphInstance.setTarget({
          x: snapPosition.x,
          y: snapPosition.y
        })
      }

      console.log('🎯 [InPortSnapDetector] 执行吸附:', {
        targetNodeId: target.nodeId,
        position: snapPosition
      })

      return {
        nodeId: target.nodeId,
        port: target.port,
        position: snapPosition,
        snapped: true
      }
      
    } catch (error) {
      console.error('执行吸附失败:', error)
      return null
    }
  }

  /**
   * 批量检测多个位置的吸附目标
   */
  batchDetectSnapTargets(positions, excludeNodeId = null) {
    const results = []
    
    for (const position of positions) {
      const target = this.detectSnapTarget(position, excludeNodeId)
      results.push({
        position,
        target,
        hasTarget: !!target
      })
    }
    
    return results
  }

  /**
   * 获取节点的所有可吸附端口
   */
  getNodeSnapPorts(nodeId) {
    const node = this.graph.getCellById(nodeId)
    if (!node) {return []}

    const nodeData = node.getData() || {}
    const nodeType = nodeData.nodeType || nodeData.type
    const ports = []

    if (this.hasInPort(nodeType)) {
      const inPortPosition = this.calculateInPortPosition(node)
      if (inPortPosition) {
        ports.push({
          port: 'in',
          position: inPortPosition,
          nodeId,
          nodeType
        })
      }
    }

    return ports
  }

  /**
   * 缓存吸附结果
   */
  cacheSnapResult(key, result) {
    this.snapCache.set(key, {
      result,
      timestamp: Date.now()
    })
  }

  /**
   * 获取缓存的吸附结果
   */
  getCachedSnapResult(key, maxAge = 100) {
    const cached = this.snapCache.get(key)
    if (!cached) {return null}

    const age = Date.now() - cached.timestamp
    if (age > maxAge) {
      this.snapCache.delete(key)
      return null
    }

    return cached.result
  }

  /**
   * 清理过期缓存
   */
  cleanupCache(maxAge = 1000) {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, cached] of this.snapCache) {
      if (now - cached.timestamp > maxAge) {
        this.snapCache.delete(key)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 [InPortSnapDetector] 清理了 ${cleanedCount} 个过期缓存`)
    }
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      snapTargets: this.snapTargets.size,
      cacheSize: this.snapCache.size,
      hasHighlight: !!this.currentHighlight,
      options: this.options
    }
  }

  /**
   * 销毁检测器
   */
  destroy() {
    this.clearSnapFeedback()
    this.snapTargets.clear()
    this.snapCache.clear()
    this.graph = null
    
    console.log('🗑️ [InPortSnapDetector] In端口吸附检测器已销毁')
  }
}

export default InPortSnapDetector