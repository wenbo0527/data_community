/**
 * 布局计算工具类
 * 提供画布布局相关的计算功能
 * 包括节点排列、自动布局、碰撞检测等
 */

/**
 * 布局方向枚举
 */
export const LayoutDirection = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  RADIAL: 'radial',
  HIERARCHICAL: 'hierarchical'
}

/**
 * 对齐方式枚举
 */
export const AlignType = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right',
  TOP: 'top',
  MIDDLE: 'middle',
  BOTTOM: 'bottom'
}

/**
 * 分布方式枚举
 */
export const DistributeType = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  EVEN_HORIZONTAL: 'evenHorizontal',
  EVEN_VERTICAL: 'evenVertical'
}

/**
 * 布局计算工具类
 */
export class LayoutUtils {
  // 默认配置
  static DEFAULT_CONFIG = {
    nodeSpacing: 50,
    levelSpacing: 100,
    minNodeDistance: 30,
    gridSize: 20,
    snapToGrid: true,
    autoLayout: true
  }

  /**
   * 自动布局节点
   * @param {Array} nodes - 节点数组
   * @param {Array} connections - 连接数组
   * @param {Object} options - 布局选项
   * @returns {Array} 布局后的节点数组
   */
  static autoLayout(nodes, connections = [], options = {}) {
    const config = { ...this.DEFAULT_CONFIG, ...options }
    const { direction = LayoutDirection.HIERARCHICAL } = config

    if (!nodes || nodes.length === 0) return []

    switch (direction) {
      case LayoutDirection.HIERARCHICAL:
        return this.hierarchicalLayout(nodes, connections, config)
      case LayoutDirection.HORIZONTAL:
        return this.horizontalLayout(nodes, config)
      case LayoutDirection.VERTICAL:
        return this.verticalLayout(nodes, config)
      case LayoutDirection.RADIAL:
        return this.radialLayout(nodes, connections, config)
      default:
        return this.hierarchicalLayout(nodes, connections, config)
    }
  }

  /**
   * 层次布局
   * @param {Array} nodes - 节点数组
   * @param {Array} connections - 连接数组
   * @param {Object} config - 配置
   * @returns {Array} 布局后的节点数组
   */
  static hierarchicalLayout(nodes, connections, config) {
    const { nodeSpacing, levelSpacing } = config
    
    // 构建层次结构
    const levels = this.buildHierarchy(nodes, connections)
    const layoutedNodes = [...nodes]

    let currentY = 0

    levels.forEach((level, levelIndex) => {
      const levelNodes = level.map(nodeId => 
        layoutedNodes.find(node => node.id === nodeId)
      ).filter(Boolean)

      if (levelNodes.length === 0) return

      // 计算当前层的总宽度
      const totalWidth = levelNodes.reduce((sum, node) => sum + (node.width || 120), 0)
      const totalSpacing = (levelNodes.length - 1) * nodeSpacing
      const levelWidth = totalWidth + totalSpacing

      // 计算起始X坐标（居中对齐）
      let currentX = -levelWidth / 2

      levelNodes.forEach(node => {
        const nodeIndex = layoutedNodes.findIndex(n => n.id === node.id)
        if (nodeIndex !== -1) {
          layoutedNodes[nodeIndex] = {
            ...layoutedNodes[nodeIndex],
            x: currentX + (node.width || 120) / 2,
            y: currentY
          }
          currentX += (node.width || 120) + nodeSpacing
        }
      })

      currentY += levelSpacing
    })

    return this.snapToGrid(layoutedNodes, config)
  }

  /**
   * 水平布局
   * @param {Array} nodes - 节点数组
   * @param {Object} config - 配置
   * @returns {Array} 布局后的节点数组
   */
  static horizontalLayout(nodes, config) {
    const { nodeSpacing } = config
    const layoutedNodes = [...nodes]

    let currentX = 0

    layoutedNodes.forEach((node, index) => {
      layoutedNodes[index] = {
        ...node,
        x: currentX,
        y: 0
      }
      currentX += (node.width || 120) + nodeSpacing
    })

    return this.snapToGrid(layoutedNodes, config)
  }

  /**
   * 垂直布局
   * @param {Array} nodes - 节点数组
   * @param {Object} config - 配置
   * @returns {Array} 布局后的节点数组
   */
  static verticalLayout(nodes, config) {
    const { nodeSpacing } = config
    const layoutedNodes = [...nodes]

    let currentY = 0

    layoutedNodes.forEach((node, index) => {
      layoutedNodes[index] = {
        ...node,
        x: 0,
        y: currentY
      }
      currentY += (node.height || 80) + nodeSpacing
    })

    return this.snapToGrid(layoutedNodes, config)
  }

  /**
   * 径向布局
   * @param {Array} nodes - 节点数组
   * @param {Array} connections - 连接数组
   * @param {Object} config - 配置
   * @returns {Array} 布局后的节点数组
   */
  static radialLayout(nodes, connections, config) {
    const { nodeSpacing } = config
    const layoutedNodes = [...nodes]

    if (nodes.length === 0) return layoutedNodes

    // 找到中心节点（连接最多的节点）
    const centerNode = this.findCenterNode(nodes, connections)
    const centerIndex = layoutedNodes.findIndex(node => node.id === centerNode.id)

    if (centerIndex !== -1) {
      layoutedNodes[centerIndex] = {
        ...layoutedNodes[centerIndex],
        x: 0,
        y: 0
      }
    }

    // 其他节点围绕中心节点排列
    const otherNodes = layoutedNodes.filter(node => node.id !== centerNode.id)
    const radius = Math.max(150, otherNodes.length * nodeSpacing / (2 * Math.PI))
    const angleStep = (2 * Math.PI) / otherNodes.length

    otherNodes.forEach((node, index) => {
      const angle = index * angleStep
      const nodeIndex = layoutedNodes.findIndex(n => n.id === node.id)
      
      if (nodeIndex !== -1) {
        layoutedNodes[nodeIndex] = {
          ...layoutedNodes[nodeIndex],
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius
        }
      }
    })

    return this.snapToGrid(layoutedNodes, config)
  }

  /**
   * 构建层次结构
   * @param {Array} nodes - 节点数组
   * @param {Array} connections - 连接数组
   * @returns {Array<Array>} 层次结构
   */
  static buildHierarchy(nodes, connections) {
    const levels = []
    const visited = new Set()
    const nodeMap = new Map(nodes.map(node => [node.id, node]))

    // 找到根节点（没有输入连接的节点）
    const rootNodes = nodes.filter(node => 
      !connections.some(conn => conn.targetId === node.id)
    )

    if (rootNodes.length === 0 && nodes.length > 0) {
      // 如果没有明确的根节点，选择第一个节点作为根节点
      rootNodes.push(nodes[0])
    }

    // 广度优先遍历构建层次
    let currentLevel = rootNodes.map(node => node.id)
    
    while (currentLevel.length > 0) {
      levels.push([...currentLevel])
      currentLevel.forEach(nodeId => visited.add(nodeId))

      const nextLevel = []
      
      currentLevel.forEach(nodeId => {
        const outgoingConnections = connections.filter(conn => conn.sourceId === nodeId)
        outgoingConnections.forEach(conn => {
          if (!visited.has(conn.targetId) && !nextLevel.includes(conn.targetId)) {
            nextLevel.push(conn.targetId)
          }
        })
      })

      currentLevel = nextLevel
    }

    // 处理未访问的节点（可能是孤立节点）
    const unvisitedNodes = nodes.filter(node => !visited.has(node.id))
    if (unvisitedNodes.length > 0) {
      levels.push(unvisitedNodes.map(node => node.id))
    }

    return levels
  }

  /**
   * 找到中心节点
   * @param {Array} nodes - 节点数组
   * @param {Array} connections - 连接数组
   * @returns {Object} 中心节点
   */
  static findCenterNode(nodes, connections) {
    if (nodes.length === 0) return null

    const connectionCounts = new Map()

    nodes.forEach(node => {
      const inCount = connections.filter(conn => conn.targetId === node.id).length
      const outCount = connections.filter(conn => conn.sourceId === node.id).length
      connectionCounts.set(node.id, inCount + outCount)
    })

    let centerNode = nodes[0]
    let maxConnections = connectionCounts.get(centerNode.id) || 0

    nodes.forEach(node => {
      const count = connectionCounts.get(node.id) || 0
      if (count > maxConnections) {
        maxConnections = count
        centerNode = node
      }
    })

    return centerNode
  }

  /**
   * 对齐节点
   * @param {Array} nodes - 节点数组
   * @param {string} alignType - 对齐类型
   * @returns {Array} 对齐后的节点数组
   */
  static alignNodes(nodes, alignType) {
    if (!nodes || nodes.length === 0) return []

    const alignedNodes = [...nodes]
    const bounds = this.getNodesBounds(nodes)

    switch (alignType) {
      case AlignType.LEFT:
        alignedNodes.forEach((node, index) => {
          alignedNodes[index] = { ...node, x: bounds.left }
        })
        break

      case AlignType.CENTER:
        alignedNodes.forEach((node, index) => {
          alignedNodes[index] = { ...node, x: bounds.centerX }
        })
        break

      case AlignType.RIGHT:
        alignedNodes.forEach((node, index) => {
          alignedNodes[index] = { ...node, x: bounds.right - (node.width || 120) }
        })
        break

      case AlignType.TOP:
        alignedNodes.forEach((node, index) => {
          alignedNodes[index] = { ...node, y: bounds.top }
        })
        break

      case AlignType.MIDDLE:
        alignedNodes.forEach((node, index) => {
          alignedNodes[index] = { ...node, y: bounds.centerY }
        })
        break

      case AlignType.BOTTOM:
        alignedNodes.forEach((node, index) => {
          alignedNodes[index] = { ...node, y: bounds.bottom - (node.height || 80) }
        })
        break
    }

    return alignedNodes
  }

  /**
   * 分布节点
   * @param {Array} nodes - 节点数组
   * @param {string} distributeType - 分布类型
   * @returns {Array} 分布后的节点数组
   */
  static distributeNodes(nodes, distributeType) {
    if (!nodes || nodes.length < 3) return nodes

    const distributedNodes = [...nodes]
    const bounds = this.getNodesBounds(nodes)

    switch (distributeType) {
      case DistributeType.HORIZONTAL:
        distributedNodes.sort((a, b) => a.x - b.x)
        const horizontalStep = (bounds.right - bounds.left) / (nodes.length - 1)
        distributedNodes.forEach((node, index) => {
          distributedNodes[index] = { ...node, x: bounds.left + index * horizontalStep }
        })
        break

      case DistributeType.VERTICAL:
        distributedNodes.sort((a, b) => a.y - b.y)
        const verticalStep = (bounds.bottom - bounds.top) / (nodes.length - 1)
        distributedNodes.forEach((node, index) => {
          distributedNodes[index] = { ...node, y: bounds.top + index * verticalStep }
        })
        break

      case DistributeType.EVEN_HORIZONTAL:
        distributedNodes.sort((a, b) => a.x - b.x)
        const totalWidth = distributedNodes.reduce((sum, node) => sum + (node.width || 120), 0)
        const availableWidth = bounds.right - bounds.left - totalWidth
        const horizontalSpacing = availableWidth / (nodes.length - 1)
        
        let currentX = bounds.left
        distributedNodes.forEach((node, index) => {
          distributedNodes[index] = { ...node, x: currentX }
          currentX += (node.width || 120) + horizontalSpacing
        })
        break

      case DistributeType.EVEN_VERTICAL:
        distributedNodes.sort((a, b) => a.y - b.y)
        const totalHeight = distributedNodes.reduce((sum, node) => sum + (node.height || 80), 0)
        const availableHeight = bounds.bottom - bounds.top - totalHeight
        const verticalSpacing = availableHeight / (nodes.length - 1)
        
        let currentY = bounds.top
        distributedNodes.forEach((node, index) => {
          distributedNodes[index] = { ...node, y: currentY }
          currentY += (node.height || 80) + verticalSpacing
        })
        break
    }

    return distributedNodes
  }

  /**
   * 获取节点边界
   * @param {Array} nodes - 节点数组
   * @returns {Object} 边界信息
   */
  static getNodesBounds(nodes) {
    if (!nodes || nodes.length === 0) {
      return { left: 0, top: 0, right: 0, bottom: 0, centerX: 0, centerY: 0, width: 0, height: 0 }
    }

    let left = Infinity
    let top = Infinity
    let right = -Infinity
    let bottom = -Infinity

    nodes.forEach(node => {
      const nodeLeft = node.x || 0
      const nodeTop = node.y || 0
      const nodeRight = nodeLeft + (node.width || 120)
      const nodeBottom = nodeTop + (node.height || 80)

      left = Math.min(left, nodeLeft)
      top = Math.min(top, nodeTop)
      right = Math.max(right, nodeRight)
      bottom = Math.max(bottom, nodeBottom)
    })

    const width = right - left
    const height = bottom - top
    const centerX = left + width / 2
    const centerY = top + height / 2

    return { left, top, right, bottom, centerX, centerY, width, height }
  }

  /**
   * 检测节点碰撞
   * @param {Object} node1 - 节点1
   * @param {Object} node2 - 节点2
   * @param {number} margin - 边距
   * @returns {boolean} 是否碰撞
   */
  static detectCollision(node1, node2, margin = 0) {
    if (!node1 || !node2) return false

    const rect1 = {
      left: (node1.x || 0) - margin,
      top: (node1.y || 0) - margin,
      right: (node1.x || 0) + (node1.width || 120) + margin,
      bottom: (node1.y || 0) + (node1.height || 80) + margin
    }

    const rect2 = {
      left: node2.x || 0,
      top: node2.y || 0,
      right: (node2.x || 0) + (node2.width || 120),
      bottom: (node2.y || 0) + (node2.height || 80)
    }

    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom)
  }

  /**
   * 解决节点碰撞
   * @param {Array} nodes - 节点数组
   * @param {Object} options - 选项
   * @returns {Array} 解决碰撞后的节点数组
   */
  static resolveCollisions(nodes, options = {}) {
    const { minDistance = 30, maxIterations = 100 } = options
    const resolvedNodes = [...nodes]
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      let hasCollision = false

      for (let i = 0; i < resolvedNodes.length; i++) {
        for (let j = i + 1; j < resolvedNodes.length; j++) {
          if (this.detectCollision(resolvedNodes[i], resolvedNodes[j], minDistance)) {
            hasCollision = true
            
            // 计算分离向量
            const dx = (resolvedNodes[j].x || 0) - (resolvedNodes[i].x || 0)
            const dy = (resolvedNodes[j].y || 0) - (resolvedNodes[i].y || 0)
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance === 0) {
              // 如果节点完全重叠，随机分离
              resolvedNodes[j] = {
                ...resolvedNodes[j],
                x: (resolvedNodes[j].x || 0) + Math.random() * 100 - 50,
                y: (resolvedNodes[j].y || 0) + Math.random() * 100 - 50
              }
            } else {
              // 按比例分离
              const separationDistance = minDistance + (resolvedNodes[i].width || 120) / 2 + (resolvedNodes[j].width || 120) / 2
              const separationRatio = separationDistance / distance
              
              const separationX = dx * separationRatio / 2
              const separationY = dy * separationRatio / 2
              
              resolvedNodes[i] = {
                ...resolvedNodes[i],
                x: (resolvedNodes[i].x || 0) - separationX,
                y: (resolvedNodes[i].y || 0) - separationY
              }
              
              resolvedNodes[j] = {
                ...resolvedNodes[j],
                x: (resolvedNodes[j].x || 0) + separationX,
                y: (resolvedNodes[j].y || 0) + separationY
              }
            }
          }
        }
      }

      if (!hasCollision) break
    }

    return resolvedNodes
  }

  /**
   * 吸附到网格
   * @param {Array} nodes - 节点数组
   * @param {Object} config - 配置
   * @returns {Array} 吸附后的节点数组
   */
  static snapToGrid(nodes, config) {
    const { snapToGrid = true, gridSize = 20 } = config

    if (!snapToGrid || !nodes) return nodes

    return nodes.map(node => ({
      ...node,
      x: Math.round((node.x || 0) / gridSize) * gridSize,
      y: Math.round((node.y || 0) / gridSize) * gridSize
    }))
  }

  /**
   * 计算最佳画布尺寸
   * @param {Array} nodes - 节点数组
   * @param {Object} options - 选项
   * @returns {Object} 画布尺寸
   */
  static calculateCanvasSize(nodes, options = {}) {
    const { padding = 100, minWidth = 800, minHeight = 600 } = options

    if (!nodes || nodes.length === 0) {
      return { width: minWidth, height: minHeight }
    }

    const bounds = this.getNodesBounds(nodes)
    
    const width = Math.max(minWidth, bounds.width + padding * 2)
    const height = Math.max(minHeight, bounds.height + padding * 2)

    return { width, height }
  }

  /**
   * 居中节点到画布
   * @param {Array} nodes - 节点数组
   * @param {Object} canvasSize - 画布尺寸
   * @returns {Array} 居中后的节点数组
   */
  static centerNodesToCanvas(nodes, canvasSize) {
    if (!nodes || nodes.length === 0) return []

    const bounds = this.getNodesBounds(nodes)
    const offsetX = (canvasSize.width - bounds.width) / 2 - bounds.left
    const offsetY = (canvasSize.height - bounds.height) / 2 - bounds.top

    return nodes.map(node => ({
      ...node,
      x: (node.x || 0) + offsetX,
      y: (node.y || 0) + offsetY
    }))
  }
}

/**
 * 创建布局配置
 * @param {Object} options - 选项
 * @returns {Object} 布局配置
 */
export function createLayoutConfig(options = {}) {
  return { ...LayoutUtils.DEFAULT_CONFIG, ...options }
}

/**
 * 快速自动布局
 * @param {Array} nodes - 节点数组
 * @param {Array} connections - 连接数组
 * @param {Object} options - 选项
 * @returns {Array} 布局后的节点数组
 */
export function quickAutoLayout(nodes, connections = [], options = {}) {
  return LayoutUtils.autoLayout(nodes, connections, options)
}

/**
 * 快速对齐节点
 * @param {Array} nodes - 节点数组
 * @param {string} alignType - 对齐类型
 * @returns {Array} 对齐后的节点数组
 */
export function quickAlign(nodes, alignType) {
  return LayoutUtils.alignNodes(nodes, alignType)
}

/**
 * 快速分布节点
 * @param {Array} nodes - 节点数组
 * @param {string} distributeType - 分布类型
 * @returns {Array} 分布后的节点数组
 */
export function quickDistribute(nodes, distributeType) {
  return LayoutUtils.distributeNodes(nodes, distributeType)
}