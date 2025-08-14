/**
 * 吸附坐标系统示例实现
 * 提供节点移动吸附、拖拽提示吸附和预览线坐标管理功能
 */

// ===== 节点移动吸附处理器 =====
export class NodeMoveSnapHandler {
  constructor(graph) {
    this.graph = graph
    this.coordinateManager = null
    this.SNAP_THRESHOLD = 20
  }

  handleNodeMove(movingNode, position) {
    const nodes = this.graph.getNodes().filter(node => node.id !== movingNode.id)
    let snapResult = { hasSnap: false, target: null }
    
    // 检测吸附目标
    for (const node of nodes) {
      // 跳过特殊节点（拖拽提示点等）
      if (node.getData()?.isEndpoint || node.getData()?.type === 'endpoint') {
        continue
      }
      
      const nodePos = node.getPosition()
      const distance = Math.sqrt(
        Math.pow(position.x - nodePos.x, 2) + Math.pow(position.y - nodePos.y, 2)
      )
      
      if (distance <= this.SNAP_THRESHOLD) {
        snapResult = {
          hasSnap: true,
          target: { node, distance }
        }
        break
      }
    }
    
    // 应用坐标修正
    let correctedPosition = position
    if (this.coordinateManager) {
      const validation = this.coordinateManager.validateCoordinateTransform(movingNode)
      if (!validation.isValid) {
        correctedPosition = validation.correctedPosition
      }
    }
    
    const size = movingNode.getSize()
    return {
      centerX: correctedPosition.x + size.width / 2,
      centerY: correctedPosition.y + size.height / 2,
      snapResult
    }
  }
}

// ===== 拖拽提示吸附处理器 =====
export class DragHintSnapHandler {
  constructor(graph) {
    this.graph = graph
    this.coordinateManager = null
    this.CONNECT_THRESHOLD = 30
  }

  checkDragHintSnap(draggedNode, position) {
    const dragHints = this.graph.getNodes().filter(node => 
      node.getData()?.isEndpoint && node.getData()?.type === 'endpoint'
    )
    
    let nearestHint = null
    let minDistance = Infinity
    
    for (const hint of dragHints) {
      const hintPos = hint.getPosition()
      const distance = Math.sqrt(
        Math.pow(position.x - hintPos.x, 2) + Math.pow(position.y - hintPos.y, 2)
      )
      
      if (distance < minDistance) {
        minDistance = distance
        nearestHint = hint
      }
    }
    
    return {
      canConnect: minDistance <= this.CONNECT_THRESHOLD,
      nearestHint: minDistance <= this.CONNECT_THRESHOLD ? nearestHint : null,
      distance: minDistance
    }
  }

  executeAutoConnect(sourceNode, targetNode, dragHint) {
    // 创建连接
    const connection = {
      id: `edge-${Date.now()}`,
      source: { cell: sourceNode.id },
      target: { cell: targetNode.id },
      attrs: {
        line: {
          stroke: '#1890ff',
          strokeWidth: 2
        }
      },
      data: {
        branchId: dragHint.getData().branchId,
        branchLabel: dragHint.getData().branchLabel
      }
    }
    
    // 删除拖拽提示点
    this.graph.removeNode(dragHint)
    
    return connection
  }
}

// ===== 预览线坐标管理器 =====
export class PreviewLineCoordinateManager {
  constructor(graph) {
    this.graph = graph
    this.coordinateManager = null
  }

  calculatePreviewLineEndpoint(sourceNode, branchIndex) {
    const sourcePos = sourceNode.getPosition()
    const sourceSize = sourceNode.getSize()
    
    // 计算基础终点位置
    const original = {
      x: sourcePos.x + sourceSize.width / 2 + 150 * (branchIndex + 1),
      y: sourcePos.y + sourceSize.height + 100
    }
    
    // 应用坐标修正
    let corrected = original
    if (this.coordinateManager) {
      const correction = this.coordinateManager.correctPreviewLinePath(
        sourceNode.id, branchIndex, sourcePos, original
      )
      corrected = correction.endPoint
    }
    
    return { original, corrected }
  }

  createDragHint(sourceNode, endpoint, branchInfo) {
    const dragHintConfig = {
      id: `drag-hint-${sourceNode.id}-${branchInfo.index}`,
      x: endpoint.corrected.x - 6,
      y: endpoint.corrected.y - 6,
      width: 12,
      height: 12,
      data: {
        isEndpoint: true,
        type: 'endpoint',
        sourceNodeId: sourceNode.id,
        branchId: branchInfo.id,
        branchLabel: branchInfo.label,
        branchIndex: branchInfo.index
      }
    }
    
    // 应用拖拽提示点位置修正
    if (this.coordinateManager) {
      const correctedPos = this.coordinateManager.correctDragHintPosition(
        sourceNode.id, 
        { x: dragHintConfig.x, y: dragHintConfig.y },
        { width: dragHintConfig.width, height: dragHintConfig.height },
        branchInfo.index
      )
      dragHintConfig.x = correctedPos.x
      dragHintConfig.y = correctedPos.y
    }
    
    return this.graph.addNode(dragHintConfig)
  }
}

// ===== 坐标验证缓存 =====
export class CoordinateValidationCache {
  constructor(ttl = 5000) {
    this.cache = new Map()
    this.ttl = ttl
  }

  get(node) {
    const key = node.id
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.value
  }

  set(node, validation) {
    const key = node.id
    this.cache.set(key, {
      value: validation,
      timestamp: Date.now()
    })
  }
}

// ===== 坐标验证工具函数 =====
export function getValidatedCoordinates(node, coordinateManager) {
  if (!coordinateManager) {
    return node.getPosition()
  }
  
  const validation = coordinateManager.validateCoordinateTransform(node)
  return validation.isValid ? node.getPosition() : validation.correctedPosition
}