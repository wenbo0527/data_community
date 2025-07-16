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
    allowedTargets: ['audience-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'end'],
    level: LAYOUT_LEVELS.START
  },
  'audience-split': { 
    maxOutput: (node) => {
      const config = node.getData()?.config
      return config?.audiences?.length || 2
    },
    allowedTargets: ['sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'end'],
    autoCreateBranches: true,
    level: LAYOUT_LEVELS.SPLIT
  },
  'event-split': { 
    maxOutput: 2,
    allowedTargets: ['sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'end'],
    autoCreateBranches: true,
    level: LAYOUT_LEVELS.SPLIT
  },
  'sms': { 
    maxOutput: 1, 
    maxInput: 1,
    allowedTargets: ['audience-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'end'],
    level: LAYOUT_LEVELS.PROCESS
  },
  'ai-call': { 
    maxOutput: 1, 
    maxInput: 1,
    allowedTargets: ['audience-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'end'],
    level: LAYOUT_LEVELS.PROCESS
  },
  'manual-call': { 
    maxOutput: 1, 
    maxInput: 1,
    allowedTargets: ['audience-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'end'],
    level: LAYOUT_LEVELS.PROCESS
  },
  'ab-test': { 
    maxOutput: 2,
    allowedTargets: ['sms', 'ai-call', 'manual-call', 'wait', 'end'],
    autoCreateBranches: true,
    level: LAYOUT_LEVELS.SPLIT
  },
  'wait': { 
    maxOutput: 1, 
    maxInput: 1,
    allowedTargets: ['audience-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'ab-test', 'wait', 'end'],
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
    
    // 按层级分组节点
    const levels = this.groupNodesByLevel(nodes)
    const positions = {}
    
    // 为每个层级计算位置
    levels.forEach((levelNodes, level) => {
      const y = level * this.layoutConfig.levelHeight
      const levelPositions = this.calculateLevelPositions(levelNodes, y)
      
      levelNodes.forEach((node, index) => {
        positions[node.id] = {
          x: levelPositions[index].x,
          y: levelPositions[index].y
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
    
    // 根据分支索引调整水平位置
    const branchIndex = previewLine.sourcePort ? parseInt(previewLine.sourcePort.replace('out-', '')) : 0
    const branchOffset = (branchIndex - 0.5) * this.layoutConfig.branchSpacing
    
    targetPos.x = splitPos.x + branchOffset
    
    console.log(`[StructuredLayoutEngine] 调整分支位置: ${previewLine.targetNode.id}, 分支索引: ${branchIndex}`)
  }

  /**
   * 按层级分组节点
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
   * @returns {Array} 位置数组
   */
  calculateLevelPositions(levelNodes, y) {
    const positions = []
    const nodeCount = levelNodes.length
    
    if (nodeCount === 1) {
      // 单个节点居中
      positions.push({ x: 0, y })
    } else {
      // 多个节点垂直分布（从上到下）
      levelNodes.forEach((node, index) => {
        positions.push({
          x: 0, // 保持相同的X坐标
          y: y + index * this.layoutConfig.nodeSpacing // 垂直分布
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