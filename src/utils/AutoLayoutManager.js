/**
 * 自动布局管理器
 * 负责节点的自动排版和画布的动态扩展
 */

import { getNodeConfig } from './nodeTypes.js'

export class AutoLayoutManager {
  constructor(graph) {
    this.graph = graph
    this.nodeSpacing = { x: 200, y: 150 } // 节点间距
    this.gridSize = 20 // 网格大小
    this.canvasMargin = { top: 100, left: 100, right: 100, bottom: 100 } // 画布边距
    this.branchOffset = 120 // 分支偏移量
  }

  /**
   * 自动添加节点到最佳位置
   * @param {string} nodeType - 节点类型
   * @param {Object} parentNode - 父节点
   * @param {Object} options - 选项
   * @returns {Object} 新节点的位置和数据
   */
  addNodeWithAutoLayout(nodeType, parentNode, options = {}) {
    const {
      branchIndex = 0,
      totalBranches = 1,
      connectionLabel = ''
    } = options

    // 计算新节点位置
    const position = this.calculateNodePosition(parentNode, branchIndex, totalBranches)
    
    // 创建节点数据
    const nodeConfig = getNodeConfig(nodeType)
    const nodeData = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: nodeType,
      label: nodeConfig.label,
      position: position,
      data: {},
      config: nodeConfig
    }

    // 自动扩展画布
    this.expandCanvasIfNeeded(position)

    return {
      nodeData,
      position,
      connectionLabel
    }
  }

  /**
   * 计算新节点的最佳位置
   * @param {Object} parentNode - 父节点
   * @param {number} branchIndex - 分支索引
   * @param {number} totalBranches - 总分支数
   * @returns {Object} 计算出的位置
   */
  calculateNodePosition(parentNode, branchIndex = 0, totalBranches = 1) {
    const parentPosition = parentNode.getPosition()
    const parentSize = parentNode.getSize()
    
    let position = {
      x: parentPosition.x,
      y: parentPosition.y + parentSize.height + this.nodeSpacing.y
    }

    // 如果有多个分支，需要水平分布
    if (totalBranches > 1) {
      const totalWidth = (totalBranches - 1) * this.branchOffset
      const startX = parentPosition.x - totalWidth / 2
      position.x = startX + branchIndex * this.branchOffset
    }

    // 避免重叠
    position = this.avoidNodeOverlap(position)
    
    // 对齐到网格
    position = this.snapToGrid(position)

    return position
  }

  /**
   * 避免节点重叠
   * @param {Object} position - 目标位置
   * @returns {Object} 调整后的位置
   */
  avoidNodeOverlap(position) {
    const nodes = this.graph.getNodes()
    const minDistance = 120
    let adjustedPosition = { ...position }
    let attempts = 0
    const maxAttempts = 20

    while (attempts < maxAttempts) {
      let hasOverlap = false
      
      for (const node of nodes) {
        const nodePosition = node.getPosition()
        const distance = Math.sqrt(
          Math.pow(adjustedPosition.x - nodePosition.x, 2) +
          Math.pow(adjustedPosition.y - nodePosition.y, 2)
        )
        
        if (distance < minDistance) {
          hasOverlap = true
          // 向下和向右调整位置
          adjustedPosition.y += this.nodeSpacing.y / 2
          if (attempts % 2 === 1) {
            adjustedPosition.x += this.branchOffset / 2
          }
          break
        }
      }
      
      if (!hasOverlap) {
        break
      }
      
      attempts++
    }

    return adjustedPosition
  }

  /**
   * 对齐到网格
   * @param {Object} position - 原始位置
   * @returns {Object} 对齐后的位置
   */
  snapToGrid(position) {
    return {
      x: Math.round(position.x / this.gridSize) * this.gridSize,
      y: Math.round(position.y / this.gridSize) * this.gridSize
    }
  }

  /**
   * 自动扩展画布
   * @param {Object} position - 新节点位置
   */
  expandCanvasIfNeeded(position) {
    if (!this.graph) return

    const currentSize = this.graph.getGraphArea()
    const nodeSize = { width: 100, height: 100 } // 默认节点大小
    
    const requiredWidth = position.x + nodeSize.width + this.canvasMargin.right
    const requiredHeight = position.y + nodeSize.height + this.canvasMargin.bottom
    
    let needsResize = false
    let newWidth = currentSize.width
    let newHeight = currentSize.height

    if (requiredWidth > currentSize.width) {
      newWidth = requiredWidth
      needsResize = true
    }

    if (requiredHeight > currentSize.height) {
      newHeight = requiredHeight
      needsResize = true
    }

    if (needsResize) {
      this.graph.resize(newWidth, newHeight)
      console.log(`[AutoLayoutManager] 画布已扩展至: ${newWidth} x ${newHeight}`)
    }
  }

  /**
   * 重新布局所有节点
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   */
  relayoutAll(nodes, edges) {
    if (!nodes.length) return

    // 找到开始节点
    const startNode = nodes.find(node => node.getData().type === 'start')
    if (!startNode) return

    // 构建节点层级关系
    const levels = this.buildNodeLevels(nodes, edges)
    
    // 按层级重新布局
    this.layoutByLevels(levels)
  }

  /**
   * 构建节点层级关系
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   * @returns {Array} 层级数组
   */
  buildNodeLevels(nodes, edges) {
    const levels = []
    const visited = new Set()
    const nodeMap = new Map()
    
    // 构建节点映射
    nodes.forEach(node => {
      nodeMap.set(node.id, node)
    })

    // 构建邻接表
    const adjacencyList = new Map()
    edges.forEach(edge => {
      const sourceId = edge.getSourceCellId()
      const targetId = edge.getTargetCellId()
      
      if (!adjacencyList.has(sourceId)) {
        adjacencyList.set(sourceId, [])
      }
      adjacencyList.get(sourceId).push(targetId)
    })

    // 找到开始节点
    const startNode = nodes.find(node => node.getData().type === 'start')
    if (startNode) {
      levels[0] = [startNode]
      visited.add(startNode.id)
    }

    // BFS遍历构建层级
    let currentLevel = 0
    while (levels[currentLevel] && levels[currentLevel].length > 0) {
      const nextLevel = []
      
      levels[currentLevel].forEach(node => {
        const children = adjacencyList.get(node.id) || []
        children.forEach(childId => {
          if (!visited.has(childId)) {
            const childNode = nodeMap.get(childId)
            if (childNode) {
              nextLevel.push(childNode)
              visited.add(childId)
            }
          }
        })
      })

      if (nextLevel.length > 0) {
        levels[currentLevel + 1] = nextLevel
      }
      currentLevel++
    }

    return levels
  }

  /**
   * 按层级布局节点
   * @param {Array} levels - 层级数组
   */
  layoutByLevels(levels) {
    const startPosition = { x: 400, y: 100 }
    
    levels.forEach((levelNodes, levelIndex) => {
      const levelY = startPosition.y + levelIndex * this.nodeSpacing.y
      const totalWidth = (levelNodes.length - 1) * this.nodeSpacing.x
      const startX = startPosition.x - totalWidth / 2

      levelNodes.forEach((node, nodeIndex) => {
        const nodeX = startX + nodeIndex * this.nodeSpacing.x
        const position = this.snapToGrid({ x: nodeX, y: levelY })
        
        // 更新节点位置
        node.setPosition(position)
        
        // 扩展画布
        this.expandCanvasIfNeeded(position)
      })
    })
  }

  /**
   * 获取节点的下一个可用位置
   * @param {Object} parentNode - 父节点
   * @param {number} branchCount - 分支数量
   * @returns {Array} 位置数组
   */
  getNextAvailablePositions(parentNode, branchCount = 1) {
    const positions = []
    
    for (let i = 0; i < branchCount; i++) {
      const position = this.calculateNodePosition(parentNode, i, branchCount)
      positions.push(position)
    }
    
    return positions
  }

  /**
   * 清理布局数据
   */
  clear() {
    // 清理相关数据
    console.log('[AutoLayoutManager] 布局数据已清理')
  }
}

export default AutoLayoutManager