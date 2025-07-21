/**
 * 结构化布局引擎
 * 实现自上而下的结构化节点排布
 */

/**
 * 布局层级定义
 */
export const LAYOUT_LEVELS = {
  START: 0,           // 开始节点层
  PROCESS: 1,         // 处理节点层
  SPLIT: 2,           // 分流节点层
  BRANCH: 3,          // 分支处理层
  MERGE: 4,           // 合并节点层
  END: 5              // 结束节点层
}

/**
 * 节点连接约束规则
 */
export const CONNECTION_RULES = {
  'start': { 
    maxOutput: 1, 
    allowedTargets: ['audience-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'blacklist', 'end'],
    level: LAYOUT_LEVELS.START
  },
  'audience-split': { 
    maxOutput: (node) => {
      const config = node.getData()?.config
      return config?.audiences?.length || 2
    },
    allowedTargets: ['sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'blacklist', 'end'],
    autoCreateBranches: true,
    level: LAYOUT_LEVELS.SPLIT
  },
  'event-split': { 
    maxOutput: 2,
    allowedTargets: ['sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'blacklist', 'end'],
    autoCreateBranches: true,
    level: LAYOUT_LEVELS.SPLIT
  },
  'sms': { 
    maxOutput: 1, 
    maxInput: 1,
    allowedTargets: ['audience-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'blacklist', 'end'],
    level: LAYOUT_LEVELS.PROCESS
  },
  'ai-call': { 
    maxOutput: 1, 
    maxInput: 1,
    allowedTargets: ['audience-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'blacklist', 'end'],
    level: LAYOUT_LEVELS.PROCESS
  },
  'manual-call': { 
    maxOutput: 1, 
    maxInput: 1,
    allowedTargets: ['audience-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'blacklist', 'end'],
    level: LAYOUT_LEVELS.PROCESS
  },
  'ab-test': { 
    maxOutput: 2,
    allowedTargets: ['sms', 'ai-call', 'manual-call', 'wait', 'blacklist', 'end'],
    autoCreateBranches: true,
    level: LAYOUT_LEVELS.SPLIT
  },
  'wait': { 
    maxOutput: 1, 
    maxInput: 1,
    allowedTargets: ['audience-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'blacklist', 'end'],
    level: LAYOUT_LEVELS.PROCESS
  },
  'blacklist': { 
    maxOutput: 1, 
    maxInput: 1,
    allowedTargets: ['end'],
    level: LAYOUT_LEVELS.PROCESS
  },
  'end': { 
    maxOutput: 0, 
    minInput: 1,
    level: LAYOUT_LEVELS.END
  }
}

export class StructuredLayoutEngine {
  constructor(graph) {
    this.graph = graph
    this.layoutConfig = {
      levelHeight: 150,     // 层级间距
      nodeSpacing: 120,     // 同层节点间距
      branchSpacing: 180,   // 分支间距
      centerAlignment: true, // 中心对齐
      gridSize: 20          // 网格大小
    }
  }

  /**
   * 验证节点连接是否符合约束
   * @param {Object} sourceNode - 源节点
   * @param {Object} targetNode - 目标节点
   * @returns {boolean} 是否允许连接
   */
  validateConnection(sourceNode, targetNode) {
    const sourceType = sourceNode.getData()?.type
    const targetType = targetNode.getData()?.type
    
    const sourceRule = CONNECTION_RULES[sourceType]
    const targetRule = CONNECTION_RULES[targetType]
    
    if (!sourceRule || !targetRule) {
      console.warn(`[StructuredLayoutEngine] 未知节点类型: ${sourceType} -> ${targetType}`)
      return false
    }

    // 检查源节点输出约束
    if (!this.checkOutputConstraints(sourceNode, sourceRule)) {
      return false
    }

    // 检查目标节点输入约束
    if (!this.checkInputConstraints(targetNode, targetRule)) {
      return false
    }

    // 检查允许的目标类型
    if (!sourceRule.allowedTargets.includes(targetType)) {
      console.warn(`[StructuredLayoutEngine] 不允许的连接: ${sourceType} -> ${targetType}`)
      return false
    }

    return true
  }

  /**
   * 检查输出约束
   * @param {Object} node - 节点
   * @param {Object} rule - 规则
   * @returns {boolean} 是否满足约束
   */
  checkOutputConstraints(node, rule) {
    const currentOutputs = this.getNodeOutputCount(node)
    const maxOutput = typeof rule.maxOutput === 'function' 
      ? rule.maxOutput(node) 
      : rule.maxOutput

    if (currentOutputs >= maxOutput) {
      console.warn(`[StructuredLayoutEngine] 输出端口已满: ${node.getData()?.type} (${currentOutputs}/${maxOutput})`)
      return false
    }

    return true
  }

  /**
   * 检查输入约束
   * @param {Object} node - 节点
   * @param {Object} rule - 规则
   * @returns {boolean} 是否满足约束
   */
  checkInputConstraints(node, rule) {
    const currentInputs = this.getNodeInputCount(node)
    
    if (rule.maxInput && currentInputs >= rule.maxInput) {
      console.warn(`[StructuredLayoutEngine] 输入端口已满: ${node.getData()?.type} (${currentInputs}/${rule.maxInput})`)
      return false
    }

    return true
  }

  /**
   * 获取节点的输出连接数
   * @param {Object} node - 节点
   * @returns {number} 输出连接数
   */
  getNodeOutputCount(node) {
    const edges = this.graph.getConnectedEdges(node, { outgoing: true })
    return edges.length
  }

  /**
   * 获取节点的输入连接数
   * @param {Object} node - 节点
   * @returns {number} 输入连接数
   */
  getNodeInputCount(node) {
    const edges = this.graph.getConnectedEdges(node, { incoming: true })
    return edges.length
  }

  /**
   * 计算结构化布局
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   * @param {Array} previewLines - 预览线数组（可选）
   * @returns {Object} 布局结果
   */
  calculateLayout(nodes, edges = [], previewLines = []) {
    console.log('[StructuredLayoutEngine] 开始计算结构化布局', {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      previewLineCount: previewLines.length
    })
    
    // 使用拓扑排序按连接关系分层
    const levels = this.groupNodesByTopology(nodes, edges, previewLines)
    const positions = {}
    
    // 为每个层级计算位置
    levels.forEach((levelNodes, levelIndex) => {
      const y = levelIndex * this.layoutConfig.levelHeight
      const levelPositions = this.calculateLevelPositions(levelNodes, y, levelIndex)
      
      levelNodes.forEach((node, nodeIndex) => {
        positions[node.id] = {
          x: levelPositions[nodeIndex].x,
          y: levelPositions[nodeIndex].y
        }
      })
    })
    
    // 如果有预览线，考虑预览线的影响调整布局
    if (previewLines.length > 0) {
      console.log('[StructuredLayoutEngine] 调整布局以适应预览线')
      this.adjustLayoutForPreviewLines(positions, previewLines)
    }
    
    const result = {
      positions,
      levels: levels.length,
      previewLinesProcessed: previewLines.length
    }
    
    console.log('[StructuredLayoutEngine] 布局计算完成:', result)
    return result
  }

  /**
   * 根据预览线调整布局
   * @param {Object} positions - 当前节点位置
   * @param {Array} previewLines - 预览线数组
   */
  adjustLayoutForPreviewLines(positions, previewLines) {
    previewLines.forEach(previewLine => {
      const { sourceNode, targetNode } = previewLine
      
      if (sourceNode && targetNode && positions[sourceNode.id] && positions[targetNode.id]) {
        const sourcePos = positions[sourceNode.id]
        const targetPos = positions[targetNode.id]
        
        // 确保目标节点在源节点下方
        if (targetPos.y <= sourcePos.y) {
          targetPos.y = sourcePos.y + this.layoutConfig.levelHeight
          console.log(`[StructuredLayoutEngine] 调整预览线目标节点位置: ${targetNode.id}`)
        }
        
        // 如果是分流节点，调整分支位置
        const sourceType = sourceNode.getData()?.type
        if (['audience-split', 'event-split', 'ab-test'].includes(sourceType)) {
          this.adjustBranchPositions(positions, sourceNode, previewLine)
        }
      }
    })
  }

  /**
   * 调整分支位置
   * @param {Object} positions - 节点位置
   * @param {Object} splitNode - 分流节点
   * @param {Object} previewLine - 预览线
   */
  adjustBranchPositions(positions, splitNode, previewLine) {
    const splitPos = positions[splitNode.id]
    const targetPos = positions[previewLine.targetNode.id]
    
    // 获取分支索引 - 现在从branchId或branchIndex属性获取
    let branchIndex = 0
    
    if (previewLine.branchIndex !== undefined) {
      branchIndex = previewLine.branchIndex
    } else if (previewLine.branchId) {
      // 如果有branchId，尝试从分流节点的分支列表中找到索引
      try {
        const splitNodeData = splitNode.getData() || {}
        const branches = splitNodeData.branches || []
        const foundIndex = branches.findIndex(branch => branch.id === previewLine.branchId)
        branchIndex = foundIndex >= 0 ? foundIndex : 0
      } catch (error) {
        console.warn(`[StructuredLayoutEngine] 无法从branchId获取分支索引: ${previewLine.branchId}`, error)
        branchIndex = 0
      }
    }
    
    // 根据分支索引调整水平位置
    const branchOffset = (branchIndex - 0.5) * this.layoutConfig.branchSpacing
    targetPos.x = splitPos.x + branchOffset
    
    console.log(`[StructuredLayoutEngine] 调整分支位置: ${previewLine.targetNode.id}, 分支索引: ${branchIndex}, branchId: ${previewLine.branchId}`)
  }

  /**
   * 使用拓扑排序按连接关系分组节点
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   * @param {Array} previewLines - 预览线数组
   * @returns {Array} 层级分组的节点数组
   */
  groupNodesByTopology(nodes, edges, previewLines = []) {
    console.log('[StructuredLayoutEngine] 开始拓扑排序分层')
    
    // 构建节点映射和邻接表
    const nodeMap = new Map()
    const adjacencyList = new Map()
    const inDegree = new Map()
    const nodeBranchCount = new Map() // 存储每个节点的分支数
    
    // 初始化
    nodes.forEach(node => {
      nodeMap.set(node.id, node)
      adjacencyList.set(node.id, [])
      inDegree.set(node.id, 0)
      
      // 计算节点的分支数
      const branchCount = this.getNodeBranchCount(node)
      nodeBranchCount.set(node.id, branchCount)
      console.log(`[StructuredLayoutEngine] 节点 ${node.id} (${node.getData()?.type}) 分支数: ${branchCount}`)
    })
    
    // 处理现有连接
    edges.forEach(edge => {
      const sourceId = edge.getSourceCellId()
      const targetId = edge.getTargetCellId()
      
      if (adjacencyList.has(sourceId) && adjacencyList.has(targetId)) {
        adjacencyList.get(sourceId).push(targetId)
        inDegree.set(targetId, inDegree.get(targetId) + 1)
      }
    })
    
    // 处理预览线连接
    previewLines.forEach(previewLine => {
      if (previewLine.sourceNode && previewLine.targetNode) {
        const sourceId = previewLine.sourceNode.id
        const targetId = previewLine.targetNode.id
        
        if (adjacencyList.has(sourceId) && adjacencyList.has(targetId)) {
          // 检查是否已存在连接，避免重复
          if (!adjacencyList.get(sourceId).includes(targetId)) {
            adjacencyList.get(sourceId).push(targetId)
            inDegree.set(targetId, inDegree.get(targetId) + 1)
          }
        }
      }
    })
    
    // 拓扑排序
    const levels = []
    const queue = []
    
    // 找到所有入度为0的节点（开始节点）
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId)
      }
    })
    
    // 如果没有入度为0的节点，找到start类型的节点
    if (queue.length === 0) {
      nodes.forEach(node => {
        if (node.getData()?.type === 'start') {
          queue.push(node.id)
        }
      })
    }
    
    // 按层级处理，考虑分支数
    while (queue.length > 0) {
      const currentLevel = []
      const nextQueue = []
      
      // 处理当前层级的所有节点
      while (queue.length > 0) {
        const nodeId = queue.shift()
        const node = nodeMap.get(nodeId)
        if (node) {
          currentLevel.push(node)
        }
        
        // 处理该节点的所有邻接节点
        const neighbors = adjacencyList.get(nodeId) || []
        neighbors.forEach(neighborId => {
          const newDegree = inDegree.get(neighborId) - 1
          inDegree.set(neighborId, newDegree)
          
          if (newDegree === 0) {
            nextQueue.push(neighborId)
          }
        })
      }
      
      if (currentLevel.length > 0) {
        levels.push(currentLevel)
        
        // 记录当前层级的总分支数，用于下一层级的布局计算
        const totalBranches = currentLevel.reduce((sum, node) => {
          return sum + nodeBranchCount.get(node.id)
        }, 0)
        
        console.log(`[StructuredLayoutEngine] 层级 ${levels.length - 1}: ${currentLevel.length} 个节点, 总分支数: ${totalBranches}`)
      }
      
      // 准备下一层级
      queue.push(...nextQueue)
    }
    
    // 处理剩余的孤立节点
    const processedNodes = new Set()
    levels.forEach(level => {
      level.forEach(node => processedNodes.add(node.id))
    })
    
    const isolatedNodes = nodes.filter(node => !processedNodes.has(node.id))
    if (isolatedNodes.length > 0) {
      levels.push(isolatedNodes)
    }
    
    console.log('[StructuredLayoutEngine] 拓扑排序完成，共', levels.length, '层')
    levels.forEach((level, index) => {
      const levelInfo = level.map(n => {
        const branchCount = nodeBranchCount.get(n.id)
        return `${n.getData()?.type}(${n.id})[${branchCount}分支]`
      })
      console.log(`层级 ${index}:`, levelInfo)
    })
    
    return levels
  }

  /**
   * 获取节点的分支数
   * @param {Object} node - 节点
   * @returns {number} 分支数
   */
  getNodeBranchCount(node) {
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type
    
    // 如果节点有存储的分支数据，直接使用
    if (nodeData.branches && Array.isArray(nodeData.branches)) {
      return nodeData.branches.length
    }
    
    // 如果有branchCount字段，直接使用
    if (typeof nodeData.branchCount === 'number') {
      return nodeData.branchCount
    }
    
    // 根据节点类型和配置计算分支数
    switch (nodeType) {
      case 'audience-split':
        // 人群分流节点的分支数基于配置的人群数量
        if (nodeData.config && nodeData.config.crowdLayers) {
          return nodeData.config.crowdLayers.length + 1 // +1 for 未命中人群
        }
        if (nodeData.config && nodeData.config.audiences) {
          return nodeData.config.audiences.length
        }
        return 2 // 默认2个分支
        
      case 'event-split':
        // 事件分流节点固定2个分支（是/否）
        return 2
        
      case 'ab-test':
        // AB测试节点的分支数基于配置
        if (nodeData.config && nodeData.config.branches) {
          return nodeData.config.branches.length
        }
        return 2 // 默认2个分支
        
      case 'end':
        // 结束节点没有输出分支
        return 0
        
      default:
        // 其他节点默认1个分支
        return 1
    }
  }

  /**
   * 按层级分组节点（原有方法，保留作为备用）
   * @param {Array} nodes - 节点数组
   * @returns {Array} 层级分组的节点数组
   */
  groupNodesByLevel(nodes) {
    const levels = []
    const nodeMap = new Map()
    
    // 构建节点映射
    nodes.forEach(node => {
      nodeMap.set(node.id, node)
    })

    // 按节点类型确定层级
    nodes.forEach(node => {
      const nodeType = node.getData()?.type
      const rule = CONNECTION_RULES[nodeType]
      const level = rule ? rule.level : LAYOUT_LEVELS.PROCESS
      
      if (!levels[level]) {
        levels[level] = []
      }
      levels[level].push(node)
    })

    // 过滤空层级
    return levels.filter(level => level && level.length > 0)
  }

  /**
   * 计算层级内节点位置
   * @param {Array} levelNodes - 层级内的节点
   * @param {number} y - Y坐标
   * @param {number} levelIndex - 层级索引
   * @returns {Array} 位置数组
   */
  calculateLevelPositions(levelNodes, y, levelIndex = 0) {
    const positions = []
    const nodeCount = levelNodes.length
    
    if (nodeCount === 1) {
      // 单个节点居中
      positions.push({ x: 0, y })
    } else {
      // 多个节点水平分布
      const totalWidth = (nodeCount - 1) * this.layoutConfig.nodeSpacing
      const startX = -totalWidth / 2
      
      levelNodes.forEach((node, index) => {
        positions.push({
          x: startX + index * this.layoutConfig.nodeSpacing,
          y: y
        })
      })
    }
    
    return positions.map(pos => this.snapToGrid(pos))
  }

  /**
   * 对齐到网格
   * @param {Object} position - 原始位置
   * @returns {Object} 对齐后的位置
   */
  snapToGrid(position) {
    return {
      x: Math.round(position.x / this.layoutConfig.gridSize) * this.layoutConfig.gridSize,
      y: Math.round(position.y / this.layoutConfig.gridSize) * this.layoutConfig.gridSize
    }
  }

  /**
   * 获取节点约束信息
   * @param {Object} node - 节点
   * @returns {Object} 约束信息
   */
  getNodeConstraints(node) {
    const nodeType = node.getData()?.type
    const rule = CONNECTION_RULES[nodeType]
    
    if (!rule) return {}
    
    return {
      maxOutput: typeof rule.maxOutput === 'function' ? rule.maxOutput(node) : rule.maxOutput,
      maxInput: rule.maxInput,
      allowedTargets: rule.allowedTargets || [],
      autoCreateBranches: rule.autoCreateBranches || false
    }
  }

  /**
   * 应用布局到图形
   * @param {Object} layout - 布局数据
   */
  applyLayout(layout) {
    console.log('[StructuredLayoutEngine] 应用布局')
    
    Object.entries(layout).forEach(([nodeId, position]) => {
      const node = this.graph.getCellById(nodeId)
      if (node) {
        node.position(position.x, position.y)
        console.log(`[StructuredLayoutEngine] 节点 ${nodeId} 移动到 (${position.x}, ${position.y})`)
      }
    })
  }
}

export default StructuredLayoutEngine