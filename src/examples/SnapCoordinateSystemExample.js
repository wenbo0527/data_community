/**
 * 吸附功能坐标系实践示例
 * 
 * 本文件展示了如何在实际开发中正确使用坐标系进行吸附功能开发
 * 基于当前代码分析的最佳实践
 */

// ===== 1. 坐标系管理器使用示例 =====

import { coordinateManager } from '@/utils/CoordinateSystemManager.js'

/**
 * 节点移动吸附的标准实现
 * 使用逻辑坐标系 + 坐标修正
 */
class NodeMoveSnapHandler {
  constructor(graph) {
    this.graph = graph
    this.coordinateManager = coordinateManager
    this.SNAP_THRESHOLD = 80 // 标准吸附阈值
  }

  /**
   * 处理节点移动时的吸附逻辑
   * @param {Object} node - 移动的节点
   * @param {Object} position - 节点位置
   */
  handleNodeMove(node, position) {
    // 1. 获取节点基础信息
    const size = node.getSize()
    
    // 2. 使用坐标管理器验证和修正坐标
    const coordinateValidation = this.coordinateManager.validateCoordinateTransform(node)
    let centerX = position.x + size.width / 2
    let centerY = position.y + size.height / 2
    
    // 3. 应用坐标修正（如果检测到偏差）
    if (coordinateValidation && coordinateValidation.difference) {
      centerX -= coordinateValidation.difference.x
      centerY -= coordinateValidation.difference.y
      
      console.log('🔍 [坐标修正] 检测到坐标偏差:', {
        nodeId: node.id,
        originalCenter: { x: position.x + size.width / 2, y: position.y + size.height / 2 },
        correctedCenter: { x: centerX, y: centerY },
        difference: coordinateValidation.difference
      })
    }
    
    // 4. 执行吸附检测
    const snapResult = this.detectSnapTargets(centerX, centerY)
    
    // 5. 应用吸附效果
    if (snapResult.hasSnap) {
      this.applySnapEffect(node, snapResult)
    }
    
    return { centerX, centerY, snapResult }
  }

  /**
   * 检测吸附目标（仅支持单节点吸附）
   * @param {number} x - 修正后的X坐标
   * @param {number} y - 修正后的Y坐标
   */
  detectSnapTargets(x, y) {
    const nodes = this.graph.getNodes()
    let closestTarget = null
    let minDistance = Infinity
    
    for (const targetNode of nodes) {
      const nodeData = targetNode.getData() || {}
      
      // 跳过特殊节点
      if (nodeData.isEndpoint || nodeData.type === 'endpoint' || 
          nodeData.isUnifiedPreview || nodeData.isPersistentPreview) {
        continue
      }
      
      // 获取目标节点的修正坐标
      const targetPosition = targetNode.getPosition()
      const targetSize = targetNode.getSize()
      
      // 使用坐标管理器修正目标节点坐标
      const targetValidation = this.coordinateManager.validateCoordinateTransform(targetNode)
      let targetCenterX = targetPosition.x + targetSize.width / 2
      let targetCenterY = targetPosition.y + targetSize.height / 2
      
      if (targetValidation && targetValidation.difference) {
        targetCenterX -= targetValidation.difference.x
        targetCenterY -= targetValidation.difference.y
      }
      
      // 计算距离（在统一的逻辑坐标系中）
      const distance = Math.sqrt(
        Math.pow(x - targetCenterX, 2) +
        Math.pow(y - targetCenterY, 2)
      )
      
      // 检查是否在吸附范围内，并且是最近的节点
      if (distance <= this.SNAP_THRESHOLD && distance < minDistance) {
        minDistance = distance
        closestTarget = {
          node: targetNode,
          distance,
          center: { x: targetCenterX, y: targetCenterY }
        }
      }
    }
    
    // 仅返回最近的单个吸附目标
    return {
      hasSnap: !!closestTarget,
      target: closestTarget
    }
  }

  /**
   * 应用吸附效果
   * @param {Object} node - 当前节点
   * @param {Object} snapResult - 吸附检测结果
   */
  applySnapEffect(node, snapResult) {
    if (!snapResult.hasSnap) return
    
    const targetNode = snapResult.target.node
    
    // 高亮目标节点
    this.highlightNode(targetNode)
    
    console.log('🎯 [吸附检测] 检测到吸附目标:', {
      sourceNodeId: node.id,
      targetNodeId: targetNode.id,
      distance: snapResult.target.distance.toFixed(2),
      threshold: this.SNAP_THRESHOLD
    })
  }

  /**
   * 高亮节点
   * @param {Object} node - 要高亮的节点
   */
  highlightNode(node) {
    const nodeData = node.getData() || {}
    
    // 保存原始样式
    if (!nodeData.originalAttrs) {
      nodeData.originalAttrs = JSON.parse(JSON.stringify(node.getAttrs()))
    }
    
    // 应用高亮样式
    node.setAttrs({
      body: {
        ...node.getAttrs().body,
        stroke: '#52c41a',
        strokeWidth: 3,
        filter: 'drop-shadow(0 0 10px rgba(82, 196, 26, 0.5))'
      }
    })
    
    // 标记为高亮状态
    nodeData.isHighlighted = true
    node.setData(nodeData)
  }
}

// ===== 2. 拖拽点吸附的标准实现 =====

/**
 * 拖拽点吸附处理器
 * 处理拖拽点的坐标转换和吸附逻辑
 */
class DragHintSnapHandler {
  constructor(graph) {
    this.graph = graph
    this.coordinateManager = coordinateManager
    this.HIGHLIGHT_THRESHOLD = 50 // 高亮阈值
    this.CONNECT_THRESHOLD = 80   // 连接阈值
  }

  /**
   * 检测拖拽点吸附
   * @param {Object} draggedNode - 被拖拽的节点
   * @param {Object} position - 节点位置
   */
  checkDragHintSnap(draggedNode, position) {
    const size = draggedNode.getSize()
    
    // 计算拖拽节点中心（使用坐标修正）
    const validation = this.coordinateManager.validateCoordinateTransform(draggedNode)
    let centerX = position.x + size.width / 2
    let centerY = position.y + size.height / 2
    
    if (validation && validation.difference) {
      centerX -= validation.difference.x
      centerY -= validation.difference.y
    }
    
    // 获取所有拖拽提示点
    const dragHints = this.graph.getNodes().filter(n => {
      const data = n.getData() || {}
      return data.isEndpoint || data.type === 'endpoint'
    })
    
    let nearestHint = null
    let nearestDistance = Infinity
    
    // 检测每个拖拽提示点
    dragHints.forEach(hint => {
      const hintPos = hint.getPosition()
      const hintSize = hint.getSize()
      
      // 使用坐标管理器修正拖拽提示点位置
      const hintValidation = this.coordinateManager.validateCoordinateTransform(hint)
      let hintCenterX = hintPos.x + hintSize.width / 2
      let hintCenterY = hintPos.y + hintSize.height / 2
      
      if (hintValidation && hintValidation.difference) {
        hintCenterX -= hintValidation.difference.x
        hintCenterY -= hintValidation.difference.y
      }
      
      // 计算距离
      const distance = Math.sqrt(
        Math.pow(centerX - hintCenterX, 2) +
        Math.pow(centerY - hintCenterY, 2)
      )
      
      // 高亮检测
      if (distance <= this.HIGHLIGHT_THRESHOLD) {
        this.highlightDragHint(hint)
      }
      
      // 连接检测
      if (distance <= this.CONNECT_THRESHOLD && distance < nearestDistance) {
        nearestDistance = distance
        nearestHint = hint
      }
    })
    
    return {
      nearestHint,
      distance: nearestDistance,
      canConnect: nearestDistance <= this.CONNECT_THRESHOLD
    }
  }

  /**
   * 高亮拖拽提示点
   * @param {Object} hint - 拖拽提示点
   */
  highlightDragHint(hint) {
    hint.setAttrs({
      body: {
        ...hint.getAttrs().body,
        stroke: '#ff4d4f',
        strokeWidth: 3,
        fill: 'rgba(255, 77, 79, 0.1)'
      }
    })
  }

  /**
   * 执行自动连接
   * @param {Object} sourceNode - 源节点
   * @param {Object} targetNode - 目标节点
   * @param {Object} dragHint - 拖拽提示点
   */
  executeAutoConnect(sourceNode, targetNode, dragHint) {
    const hintData = dragHint.getData() || {}
    
    console.log('🔗 [自动连接] 执行拖拽点吸附连接:', {
      sourceNodeId: sourceNode.id,
      targetNodeId: targetNode.id,
      dragHintId: dragHint.id,
      branchId: hintData.branchId,
      branchLabel: hintData.branchLabel
    })
    
    // 创建连接配置
    const connectionConfig = {
      source: { cell: sourceNode.id, port: 'out' },
      target: { cell: targetNode.id, port: 'in' },
      router: { 
        name: 'orth', 
        args: { 
          padding: 10,
          startDirections: ['bottom'],
          endDirections: ['top']
        } 
      },
      connector: { name: 'rounded', args: { radius: 8 } },
      attrs: {
        line: { stroke: '#5F95FF', strokeWidth: 2 }
      },
      data: {
        branchId: hintData.branchId,
        branchLabel: hintData.branchLabel,
        sourceNodeId: sourceNode.id,
        targetNodeId: targetNode.id
      }
    }
    
    // 创建连接
    const connection = this.graph.addEdge(connectionConfig)
    
    // 删除拖拽提示点
    this.graph.removeNode(dragHint)
    
    return connection
  }
}

// ===== 3. 预览线坐标管理示例 =====

/**
 * 预览线坐标管理器
 * 处理预览线的坐标计算和路径修正
 */
class PreviewLineCoordinateManager {
  constructor(graph) {
    this.graph = graph
    this.coordinateManager = coordinateManager
  }

  /**
   * 计算预览线终点位置
   * @param {Object} sourceNode - 源节点
   * @param {number} branchIndex - 分支索引
   */
  calculatePreviewLineEndpoint(sourceNode, branchIndex = 0) {
    const nodePosition = sourceNode.getPosition()
    const nodeSize = sourceNode.getSize()
    
    // 基础终点位置（逻辑坐标系）
    const baseEndX = nodePosition.x + nodeSize.width / 2
    const baseEndY = nodePosition.y + nodeSize.height + 100
    
    // 分支偏移
    const branchOffset = branchIndex * 150 // 分支间距
    const endX = baseEndX + branchOffset
    const endY = baseEndY
    
    // 使用坐标管理器修正路径
    const pathCorrection = this.coordinateManager.correctPreviewLinePath(
      sourceNode.id,
      branchIndex,
      { x: nodePosition.x + nodeSize.width / 2, y: nodePosition.y + nodeSize.height },
      { x: endX, y: endY }
    )
    
    return {
      original: { x: endX, y: endY },
      corrected: pathCorrection.endPoint,
      pathData: pathCorrection
    }
  }

  /**
   * 创建拖拽提示点
   * @param {Object} sourceNode - 源节点
   * @param {Object} endpoint - 终点位置
   * @param {Object} branchInfo - 分支信息
   */
  createDragHint(sourceNode, endpoint, branchInfo) {
    // 使用坐标管理器修正拖拽点位置
    const correctedPosition = this.coordinateManager.correctDragHintPosition(
      sourceNode.id,
      endpoint.corrected,
      { width: 12, height: 12 },
      branchInfo.index
    )
    
    const dragHintConfig = {
      id: `endpoint-${sourceNode.id}-${branchInfo.id}`,
      shape: 'circle',
      x: correctedPosition.x - 6,
      y: correctedPosition.y - 6,
      width: 12,
      height: 12,
      attrs: {
        body: {
          fill: '#fa8c16',
          stroke: '#fa8c16',
          strokeWidth: 2,
          cursor: 'grab'
        }
      },
      data: {
        isEndpoint: true,
          type: 'endpoint',
        sourceNodeId: sourceNode.id,
        branchId: branchInfo.id,
        branchLabel: branchInfo.label,
        originalPosition: endpoint.original,
        correctedPosition: correctedPosition
      }
    }
    
    return this.graph.addNode(dragHintConfig)
  }
}

// ===== 4. 统一吸附配置 =====

/**
 * 吸附配置常量
 * 统一管理所有吸附相关的阈值和配置
 */
export const SNAP_CONFIG = {
  // 主要吸附距离
  PRIMARY_SNAP_DISTANCE: 80,
  
  // 精确吸附距离
  PRECISE_SNAP_DISTANCE: 50,
  
  // 高亮提示距离
  HIGHLIGHT_DISTANCE: 100,
  
  // 拖拽点特殊距离
  DRAG_HINT_DISTANCE: 50,
  
  // 坐标修正容差
  COORDINATE_TOLERANCE: 5,
  
  // 性能优化配置
  PERFORMANCE: {
    // 批量处理大小
    BATCH_SIZE: 50,
    
    // 缓存过期时间（毫秒）
    CACHE_TTL: 1000,
    
    // 防抖延迟（毫秒）
    DEBOUNCE_DELAY: 16
  }
}

// ===== 5. 使用示例 =====

/**
 * 在TaskFlowCanvas.vue中的使用示例
 */
export function setupSnapHandlers(graph, coordinateManager) {
  const nodeSnapHandler = new NodeMoveSnapHandler(graph)
  const dragHintSnapHandler = new DragHintSnapHandler(graph)
  const previewLineManager = new PreviewLineCoordinateManager(graph)
  
  // 节点移动事件
  graph.on('node:moving', ({ node }) => {
    const position = node.getPosition()
    const result = nodeSnapHandler.handleNodeMove(node, position)
    
    console.log('🎯 [节点移动] 吸附检测结果:', {
      nodeId: node.id,
      correctedCenter: { x: result.centerX, y: result.centerY },
      hasSnap: result.snapResult.hasSnap,
      snapTarget: result.snapResult.target?.node?.id
    })
  })
  
  // 节点移动完成事件
  graph.on('node:moved', ({ node }) => {
    const position = node.getPosition()
    const snapResult = dragHintSnapHandler.checkDragHintSnap(node, position)
    
    if (snapResult.canConnect) {
      // 执行自动连接
      const sourceNode = findSourceNode(snapResult.nearestHint)
      if (sourceNode) {
        dragHintSnapHandler.executeAutoConnect(
          sourceNode, 
          node, 
          snapResult.nearestHint
        )
      }
    }
  })
  
  return {
    nodeSnapHandler,
    dragHintSnapHandler,
    previewLineManager
  }
}

/**
 * 辅助函数：查找源节点
 */
function findSourceNode(dragHint) {
  const hintData = dragHint.getData() || {}
  const sourceNodeId = hintData.sourceNodeId
  
  if (sourceNodeId) {
    return graph.getCellById(sourceNodeId)
  }
  
  return null
}

// ===== 6. 性能优化示例 =====

/**
 * 坐标验证结果缓存
 */
class CoordinateValidationCache {
  constructor(ttl = 1000) {
    this.cache = new WeakMap()
    this.timestamps = new WeakMap()
    this.ttl = ttl
  }
  
  get(node) {
    const timestamp = this.timestamps.get(node)
    if (timestamp && Date.now() - timestamp < this.ttl) {
      return this.cache.get(node)
    }
    return null
  }
  
  set(node, validation) {
    this.cache.set(node, validation)
    this.timestamps.set(node, Date.now())
  }
  
  clear() {
    this.cache = new WeakMap()
    this.timestamps = new WeakMap()
  }
}

/**
 * 优化的坐标验证函数
 */
const validationCache = new CoordinateValidationCache()

export function getValidatedCoordinates(node, coordinateManager) {
  // 尝试从缓存获取
  let validation = validationCache.get(node)
  
  if (!validation) {
    // 缓存未命中，执行验证
    validation = coordinateManager.validateCoordinateTransform(node)
    validationCache.set(node, validation)
  }
  
  return validation
}

export {
  NodeMoveSnapHandler,
  DragHintSnapHandler,
  PreviewLineCoordinateManager,
  CoordinateValidationCache
}