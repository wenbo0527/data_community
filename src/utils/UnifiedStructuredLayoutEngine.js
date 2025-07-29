/**
 * 统一结构化布局引擎
 * 基于父子关联关系的分层分级自底向上定位系统
 * 统一处理预览线endpoint和普通节点的同层排列
 */

export class UnifiedStructuredLayoutEngine {
  constructor(graph, options = {}) {
    this.graph = graph
    this.options = {
      // 层级配置
      layer: {
        baseHeight: 150,        // 基础层级高度
        dynamicSpacing: true,   // 动态间距调整
        maxLayers: 10,          // 最大层级数
        tolerance: 20           // 层级容差
      },
      
      // 节点配置
      node: {
        minSpacing: 120,       // 最小节点间距
        preferredSpacing: 180, // 首选节点间距
        maxSpacing: 300,       // 最大节点间距
        endpointSize: { width: 20, height: 20 } // endpoint虚拟节点大小
      },
      
      // 优化配置
      optimization: {
        enableGlobalOptimization: true,
        maxIterations: 5,
        convergenceThreshold: 0.01,
        enableAestheticOptimization: true,
        enableEndpointIntegration: true // 启用endpoint集成
      },
      
      // 性能配置
      performance: {
        enableParallelProcessing: false, // 暂时禁用并行处理
        batchSize: 50,
        enableCaching: true
      },
      
      ...options
    }
    
    // 布局数据模型
    this.layoutModel = {
      layers: [],                    // 分层结构
      nodePositions: new Map(),      // 节点位置
      parentChildMap: new Map(),     // 父子关系
      childParentMap: new Map(),     // 子父关系
      layerMetrics: new Map(),       // 层级指标
      endpointNodes: new Map(),      // endpoint虚拟节点
      mixedLayerNodes: new Map(),    // 混合层级节点（普通节点+endpoint）
      optimizationHistory: []        // 优化历史
    }
  }

  /**
   * 执行统一结构化布局
   * @returns {Object} 布局结果
   */
  async executeLayout() {
    console.log('🚀 [统一结构化布局] 开始执行布局')
    
    try {
      // 阶段1：数据预处理
      const preprocessResult = await this.preprocessLayoutData()
      
      // 阶段2：分层构建（包含endpoint集成）
      const layerStructure = await this.buildHierarchicalLayers(preprocessResult)
      
      // 阶段3：自底向上位置计算
      const positions = await this.calculateBottomUpPositions(layerStructure)
      
      // 阶段4：层级内统一优化（普通节点+endpoint）
      const optimizedPositions = await this.optimizeUnifiedLayerAlignment(positions, layerStructure)
      
      // 阶段5：全局平衡优化
      const finalPositions = await this.applyGlobalOptimization(optimizedPositions, layerStructure)
      
      // 阶段6：应用到图形
      await this.applyPositionsToGraph(finalPositions)
      
      return this.generateLayoutReport(layerStructure, finalPositions)
      
    } catch (error) {
      console.error('❌ [统一结构化布局] 布局执行失败:', error)
      return {
        success: false,
        error: error.message,
        message: `布局执行失败: ${error.message}`
      }
    }
  }

  /**
   * 数据预处理：提取节点、边和预览线endpoint
   * @returns {Object} 预处理结果
   */
  async preprocessLayoutData() {
    console.log('📊 [数据预处理] 开始提取布局数据')
    
    const nodes = this.graph.getNodes()
    const edges = this.graph.getEdges()
    
    // 过滤有效节点（排除拖拽点）
    const validNodes = nodes.filter(node => {
      const nodeId = node.id || node.getId()
      const nodeData = node.getData() || {}
      return !nodeId.includes('hint') && 
             !nodeData.isDragHint && 
             !nodeData.isPreview &&
             !nodeId.startsWith('hint_')
    })
    
    // 过滤有效边（排除预览线）
    const validEdges = edges.filter(edge => {
      const edgeId = edge.id || edge.getId()
      const edgeData = edge.getData() || {}
      return !edgeId.includes('preview') && 
             !edgeId.includes('unified_preview') && 
             !edgeData.isPreview &&
             !edgeData.isPersistentPreview
    })
    
    // 🎯 关键：提取预览线endpoint作为虚拟节点
    const endpointNodes = await this.extractPreviewEndpoints()
    
    console.log(`📊 [数据预处理] 数据统计:`, {
      普通节点: validNodes.length,
      有效连线: validEdges.length,
      预览线endpoint: endpointNodes.length,
      总处理节点: validNodes.length + endpointNodes.length
    })
    
    return {
      validNodes,
      validEdges,
      endpointNodes,
      totalNodes: validNodes.length + endpointNodes.length
    }
  }

  /**
   * 提取预览线endpoint作为虚拟节点
   * @returns {Array} endpoint虚拟节点数组
   */
  async extractPreviewEndpoints() {
    const endpointNodes = []
    
    // 从全局预览线管理器获取预览线信息
    const previewLineManager = window.unifiedPreviewLineManager || 
                              this.graph.previewLineManager ||
                              null
    
    if (!previewLineManager || !previewLineManager.getAllPreviewLines) {
      console.log('⚠️ [预览线提取] 未找到预览线管理器')
      return endpointNodes
    }
    
    const previewLines = previewLineManager.getAllPreviewLines()
    console.log(`🔍 [预览线提取] 开始提取预览线endpoint，发现 ${previewLines.size} 个源节点的预览线`)
    
    previewLines.forEach((previewInstance, sourceNodeId) => {
      console.log(`🔍 [预览线提取] 处理源节点 ${sourceNodeId} 的预览线:`, previewInstance)
      
      if (Array.isArray(previewInstance)) {
        // 分支预览线
        console.log(`📋 [预览线提取] 源节点 ${sourceNodeId} 有 ${previewInstance.length} 个分支预览线`)
        previewInstance.forEach((instance, index) => {
          if (instance.endPosition && !instance.isAttached) {
            const endpointNode = this.createEndpointVirtualNode(
              sourceNodeId, 
              instance.branchId || `branch_${index}`, 
              instance.endPosition,
              instance.branchLabel
            )
            endpointNodes.push(endpointNode)
            this.layoutModel.endpointNodes.set(endpointNode.id, endpointNode)
            console.log(`✅ [预览线提取] 成功创建分支endpoint虚拟节点: ${endpointNode.id}`)
          } else {
            console.log(`⚠️ [预览线提取] 跳过已附着或无端点的分支预览线:`, instance)
          }
        })
      } else if (previewInstance && previewInstance.endPosition && !previewInstance.isAttached) {
        // 单一预览线
        console.log(`📋 [预览线提取] 源节点 ${sourceNodeId} 有单一预览线`)
        const endpointNode = this.createEndpointVirtualNode(
          sourceNodeId, 
          'single', 
          previewInstance.endPosition,
          null
        )
        endpointNodes.push(endpointNode)
        this.layoutModel.endpointNodes.set(endpointNode.id, endpointNode)
        console.log(`✅ [预览线提取] 成功创建单一endpoint虚拟节点: ${endpointNode.id}`)
      } else {
        console.log(`⚠️ [预览线提取] 跳过已附着或无端点的预览线:`, previewInstance)
      }
    })
    
    console.log(`🎯 [预览线提取] 提取完成，共创建 ${endpointNodes.length} 个endpoint虚拟节点:`, 
      endpointNodes.map(node => node.id))
    
    return endpointNodes
  }

  /**
   * 创建endpoint虚拟节点
   * @param {string} sourceNodeId - 源节点ID
   * @param {string} branchId - 分支ID
   * @param {Object} endPosition - 端点位置
   * @param {string} branchLabel - 分支标签
   * @returns {Object} 虚拟节点对象
   */
  createEndpointVirtualNode(sourceNodeId, branchId, endPosition, branchLabel) {
    // 🎯 关键：使用与 useStructuredLayout.js 一致的ID格式
    const originalEndpointId = `endpoint_${sourceNodeId}_${branchId}`
    const endpointId = `virtual_endpoint_${originalEndpointId}`
    
    console.log(`🎯 [虚拟节点创建] 创建endpoint虚拟节点: ${endpointId}`, {
      sourceNodeId,
      branchId,
      endPosition: { x: endPosition.x, y: endPosition.y }
    })
    
    return {
      id: endpointId,
      type: 'endpoint',
      sourceNodeId,
      branchId,
      branchLabel,
      isVirtual: true,
      isEndpoint: true,
      position: {
        x: endPosition.x,
        y: endPosition.y
      },
      size: this.options.node.endpointSize,
      
      // 模拟节点接口
      getId: () => endpointId,
      getPosition: () => ({ x: endPosition.x, y: endPosition.y }),
      getSize: () => this.options.node.endpointSize,
      getData: () => ({ 
        type: 'endpoint', 
        isEndpoint: true, 
        sourceNodeId, 
        branchId 
      }),
      setPosition: (pos) => {
        endPosition.x = pos.x
        endPosition.y = pos.y
        // 同步更新预览线管理器中的位置
        this.updatePreviewEndpointPosition(sourceNodeId, branchId, pos)
      }
    }
  }

  /**
   * 更新预览线endpoint位置
   * @param {string} sourceNodeId - 源节点ID
   * @param {string} branchId - 分支ID
   * @param {Object} position - 新位置
   */
  updatePreviewEndpointPosition(sourceNodeId, branchId, position) {
    const previewLineManager = window.unifiedPreviewLineManager || 
                              this.graph.previewLineManager
    
    if (previewLineManager && previewLineManager.updateEndpointPosition) {
      previewLineManager.updateEndpointPosition(sourceNodeId, branchId, {
        x: position.x + this.options.node.endpointSize.width / 2,
        y: position.y + this.options.node.endpointSize.height / 2
      })
    }
  }

  /**
   * 构建分层结构（包含endpoint集成）
   * @param {Object} preprocessResult - 预处理结果
   * @returns {Object} 层级结构
   */
  async buildHierarchicalLayers(preprocessResult) {
    console.log('🔍 [分层构建] 开始构建包含endpoint的分层结构')
    
    const { validNodes, validEdges, endpointNodes } = preprocessResult
    
    // 🎯 关键：将普通节点和endpoint节点合并处理
    const allNodes = [...validNodes, ...endpointNodes]
    
    // 构建父子关系图
    this.buildParentChildRelationships(allNodes, validEdges, endpointNodes)
    
    // 识别叶子节点（最底层）
    const leafNodes = this.identifyLeafNodes(allNodes)
    
    // 自底向上分层
    const layers = this.calculateLayersBottomUp(leafNodes, allNodes)
    
    // 🎯 关键：为每层创建混合节点列表（普通节点+endpoint）
    this.createMixedLayerNodes(layers)
    
    console.log(`🔍 [分层构建] 分层完成:`, {
      总层数: layers.length,
      各层节点分布: layers.map((layer, index) => {
        const normalCount = layer.filter(n => !n.isEndpoint).length
        const endpointCount = layer.filter(n => n.isEndpoint).length
        return `第${index + 1}层: ${normalCount}普通+${endpointCount}endpoint`
      }).join(', ')
    })
    
    return {
      layers,
      nodeToLayer: this.layoutModel.nodeToLayer,
      parentChildMap: this.layoutModel.parentChildMap,
      childParentMap: this.layoutModel.childParentMap,
      mixedLayerNodes: this.layoutModel.mixedLayerNodes,
      totalLayers: layers.length
    }
  }

  /**
   * 构建父子关系（包含endpoint的虚拟关系）
   * @param {Array} allNodes - 所有节点（普通+endpoint）
   * @param {Array} validEdges - 有效边
   * @param {Array} endpointNodes - endpoint节点
   */
  buildParentChildRelationships(allNodes, validEdges, endpointNodes) {
    // 初始化关系映射
    allNodes.forEach(node => {
      const nodeId = node.id || node.getId()
      this.layoutModel.parentChildMap.set(nodeId, [])
      this.layoutModel.childParentMap.set(nodeId, [])
    })
    
    // 处理普通节点间的连接关系
    validEdges.forEach(edge => {
      const sourceId = edge.getSourceCellId()
      const targetId = edge.getTargetCellId()
      
      if (sourceId && targetId) {
        // 建立父子关系
        if (this.layoutModel.parentChildMap.has(sourceId)) {
          this.layoutModel.parentChildMap.get(sourceId).push(targetId)
        }
        if (this.layoutModel.childParentMap.has(targetId)) {
          this.layoutModel.childParentMap.get(targetId).push(sourceId)
        }
      }
    })
    
    // 🎯 关键：建立endpoint与源节点的虚拟父子关系
    endpointNodes.forEach(endpointNode => {
      const sourceNodeId = endpointNode.sourceNodeId
      const endpointId = endpointNode.id
      
      // endpoint作为源节点的子节点
      if (this.layoutModel.parentChildMap.has(sourceNodeId)) {
        this.layoutModel.parentChildMap.get(sourceNodeId).push(endpointId)
      }
      if (this.layoutModel.childParentMap.has(endpointId)) {
        this.layoutModel.childParentMap.get(endpointId).push(sourceNodeId)
      }
    })
    
    console.log(`🔗 [关系构建] 父子关系构建完成`, {
      节点数: allNodes.length,
      连接数: validEdges.length,
      endpoint虚拟关系: endpointNodes.length
    })
  }

  /**
   * 识别叶子节点（出度为0的节点）
   * @param {Array} allNodes - 所有节点
   * @returns {Array} 叶子节点数组
   */
  identifyLeafNodes(allNodes) {
    const leafNodes = allNodes.filter(node => {
      const nodeId = node.id || node.getId()
      const children = this.layoutModel.parentChildMap.get(nodeId) || []
      return children.length === 0
    })
    
    console.log(`🌿 [叶子识别] 识别到 ${leafNodes.length} 个叶子节点`)
    
    return leafNodes
  }

  /**
   * 自底向上计算层级
   * @param {Array} leafNodes - 叶子节点
   * @param {Array} allNodes - 所有节点
   * @returns {Array} 分层结果
   */
  calculateLayersBottomUp(leafNodes, allNodes) {
    const layers = []
    const processedNodes = new Set()
    const nodeToLayer = new Map()
    let currentLayer = leafNodes
    let layerIndex = 0
    
    // 从叶子节点开始，逐层向上构建
    while (currentLayer.length > 0) {
      // 当前层级
      const layerNodes = [...currentLayer]
      layers.push(layerNodes)
      
      // 记录节点层级
      layerNodes.forEach(node => {
        const nodeId = node.id || node.getId()
        processedNodes.add(nodeId)
        nodeToLayer.set(nodeId, layerIndex)
      })
      
      // 查找下一层（父节点层）
      const nextLayer = []
      const candidateParents = new Set()
      
      layerNodes.forEach(node => {
        const nodeId = node.id || node.getId()
        const parents = this.layoutModel.childParentMap.get(nodeId) || []
        
        parents.forEach(parentId => {
          if (!processedNodes.has(parentId)) {
            candidateParents.add(parentId)
          }
        })
      })
      
      // 验证候选父节点的所有子节点是否都已处理
      candidateParents.forEach(parentId => {
        const children = this.layoutModel.parentChildMap.get(parentId) || []
        const allChildrenProcessed = children.every(childId => processedNodes.has(childId))
        
        if (allChildrenProcessed) {
          const parentNode = allNodes.find(n => (n.id || n.getId()) === parentId)
          if (parentNode) {
            nextLayer.push(parentNode)
          }
        }
      })
      
      currentLayer = nextLayer
      layerIndex++
    }
    
    // 反转层级顺序（使第0层为顶层）
    layers.reverse()
    
    // 重新计算层级索引
    this.layoutModel.nodeToLayer = new Map()
    layers.forEach((layer, index) => {
      layer.forEach(node => {
        const nodeId = node.id || node.getId()
        this.layoutModel.nodeToLayer.set(nodeId, index)
      })
    })
    
    return layers
  }

  /**
   * 为每层创建混合节点列表（普通节点+endpoint统一管理）
   * @param {Array} layers - 分层结果
   */
  createMixedLayerNodes(layers) {
    layers.forEach((layer, layerIndex) => {
      const mixedNodes = {
        normalNodes: [],
        endpointNodes: [],
        allNodes: layer,
        layerIndex
      }
      
      layer.forEach(node => {
        if (node.isEndpoint) {
          mixedNodes.endpointNodes.push(node)
        } else {
          mixedNodes.normalNodes.push(node)
        }
      })
      
      this.layoutModel.mixedLayerNodes.set(layerIndex, mixedNodes)
      
      console.log(`📊 [混合层级] 第${layerIndex}层: ${mixedNodes.normalNodes.length}普通节点 + ${mixedNodes.endpointNodes.length}endpoint节点`)
    })
  }

  /**
   * 自底向上位置计算
   * @param {Object} layerStructure - 层级结构
   * @returns {Map} 节点位置映射
   */
  async calculateBottomUpPositions(layerStructure) {
    console.log('🎯 [位置计算] 开始自底向上位置计算')
    
    const { layers } = layerStructure
    const positions = new Map()
    
    // 从最底层开始计算
    for (let layerIndex = layers.length - 1; layerIndex >= 0; layerIndex--) {
      const layer = layers[layerIndex]
      const isBottomLayer = layerIndex === layers.length - 1
      
      if (isBottomLayer) {
        // 最底层：统一排列所有节点（普通+endpoint）
        this.calculateBottomLayerPositions(layer, positions, layerIndex)
      } else {
        // 上层：基于子节点分布计算
        this.calculateParentLayerPositions(layer, positions, layerIndex, layerStructure)
      }
    }
    
    console.log(`🎯 [位置计算] 位置计算完成，共计算 ${positions.size} 个节点位置`)
    
    return positions
  }

  /**
   * 计算最底层位置（统一排列普通节点和endpoint）
   * @param {Array} bottomLayer - 最底层节点
   * @param {Map} positions - 位置映射
   * @param {number} layerIndex - 层级索引
   */
  calculateBottomLayerPositions(bottomLayer, positions, layerIndex) {
    const nodeSpacing = this.options.node.preferredSpacing
    const totalWidth = (bottomLayer.length - 1) * nodeSpacing
    const startX = -totalWidth / 2
    const layerY = layerIndex * this.options.layer.baseHeight
    
    // 🎯 关键：按X坐标排序，确保endpoint和普通节点统一排列
    const sortedNodes = bottomLayer.sort((a, b) => {
      let aPos, bPos
      
      // 处理虚拟 endpoint 节点
      if (a.isEndpoint && a.getPosition) {
        aPos = a.getPosition()
      } else if (a.isEndpoint && a.position) {
        aPos = a.position
      } else if (a.getPosition) {
        aPos = a.getPosition()
      } else {
        aPos = { x: 0, y: 0 }
      }
      
      if (b.isEndpoint && b.getPosition) {
        bPos = b.getPosition()
      } else if (b.isEndpoint && b.position) {
        bPos = b.position
      } else if (b.getPosition) {
        bPos = b.getPosition()
      } else {
        bPos = { x: 0, y: 0 }
      }
      
      console.log(`🔍 [排序调试] 节点 ${a.id || a.getId()}: x=${aPos.x}, 节点 ${b.id || b.getId()}: x=${bPos.x}`)
      
      return aPos.x - bPos.x
    })
    
    console.log(`📊 [底层排序] 排序后的节点顺序:`, sortedNodes.map(node => {
      const nodeId = node.id || node.getId()
      const pos = node.isEndpoint && node.position ? node.position : (node.getPosition ? node.getPosition() : { x: 0, y: 0 })
      return `${nodeId}(${node.isEndpoint ? 'endpoint' : 'normal'}, x=${pos.x})`
    }))
    
    sortedNodes.forEach((node, index) => {
      const nodeId = node.id || node.getId()
      const finalX = startX + index * nodeSpacing
      
      // 获取原始位置用于记录
      let originalPos
      if (node.isEndpoint && node.position) {
        originalPos = node.position
      } else if (node.getPosition) {
        originalPos = node.getPosition()
      } else {
        originalPos = { x: 0, y: 0 }
      }
      
      positions.set(nodeId, {
        x: finalX,
        y: layerY,
        layerIndex,
        isBottomLayer: true,
        nodeType: node.isEndpoint ? 'endpoint' : 'normal',
        originalX: originalPos.x
      })
      
      console.log(`📍 [底层定位] ${node.isEndpoint ? 'Endpoint' : '普通节点'} ${nodeId}: (${finalX}, ${layerY}), 原始X: ${originalPos.x}`)
    })
  }

  /**
   * 计算父层位置（基于子节点分布）
   * @param {Array} parentLayer - 父层节点
   * @param {Map} positions - 位置映射
   * @param {number} layerIndex - 层级索引
   * @param {Object} layerStructure - 层级结构
   */
  calculateParentLayerPositions(parentLayer, positions, layerIndex, layerStructure) {
    const layerY = layerIndex * this.options.layer.baseHeight
    
    parentLayer.forEach(parentNode => {
      const parentId = parentNode.id || parentNode.getId()
      const children = layerStructure.parentChildMap.get(parentId) || []
      
      // 获取子节点位置
      const childPositions = children
        .map(childId => positions.get(childId))
        .filter(pos => pos !== undefined)
      
      if (childPositions.length > 0) {
        // 🎯 关键：基于子节点（包含endpoint）计算父节点最优位置
        const parentX = this.calculateOptimalParentPosition(childPositions)
        
        positions.set(parentId, {
          x: parentX,
          y: layerY,
          layerIndex,
          nodeType: parentNode.isEndpoint ? 'endpoint' : 'normal',
          childrenCount: childPositions.length,
          childrenSpread: this.calculateChildrenSpread(childPositions)
        })
        
        console.log(`📍 [父层定位] ${parentNode.isEndpoint ? 'Endpoint' : '普通节点'} ${parentId}: (${parentX}, ${layerY}), 子节点数: ${childPositions.length}`)
      }
    })
  }

  /**
   * 计算父节点最优位置
   * @param {Array} childPositions - 子节点位置数组
   * @returns {number} 最优X坐标
   */
  calculateOptimalParentPosition(childPositions) {
    const childXCoords = childPositions.map(pos => pos.x)
    
    if (childXCoords.length === 1) {
      // 单个子节点：直接对齐
      return childXCoords[0]
    } else if (childXCoords.length === 2) {
      // 两个子节点：中心点
      return (childXCoords[0] + childXCoords[1]) / 2
    } else {
      // 多个子节点：加权中心
      const minX = Math.min(...childXCoords)
      const maxX = Math.max(...childXCoords)
      const centerX = childXCoords.reduce((sum, x) => sum + x, 0) / childXCoords.length
      
      // 混合策略：中心点权重70%，边界中心权重30%
      return centerX * 0.7 + ((minX + maxX) / 2) * 0.3
    }
  }

  /**
   * 计算子节点分布范围
   * @param {Array} childPositions - 子节点位置数组
   * @returns {number} 分布范围
   */
  calculateChildrenSpread(childPositions) {
    if (childPositions.length <= 1) return 0
    
    const xCoords = childPositions.map(pos => pos.x)
    return Math.max(...xCoords) - Math.min(...xCoords)
  }

  /**
   * 层级内统一优化（普通节点+endpoint）
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   * @returns {Map} 优化后的位置映射
   */
  async optimizeUnifiedLayerAlignment(positions, layerStructure) {
    console.log('🔧 [统一优化] 开始层级内统一优化')
    
    let totalAdjustments = 0
    
    // 对每一层进行统一优化
    for (let layerIndex = 0; layerIndex < layerStructure.layers.length; layerIndex++) {
      const mixedNodes = this.layoutModel.mixedLayerNodes.get(layerIndex)
      
      if (mixedNodes && mixedNodes.allNodes.length > 1) {
        // 🎯 关键：统一处理该层的所有节点（普通+endpoint）
        const layerAdjustments = await this.optimizeSingleLayerUnified(
          mixedNodes, 
          positions, 
          layerStructure
        )
        totalAdjustments += layerAdjustments
      }
    }
    
    console.log(`🔧 [统一优化] 优化完成，共调整 ${totalAdjustments} 个节点位置`)
    
    return positions
  }

  /**
   * 优化单层的统一排列（普通节点+endpoint）
   * @param {Object} mixedNodes - 混合节点数据
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   * @returns {number} 调整次数
   */
  async optimizeSingleLayerUnified(mixedNodes, positions, layerStructure) {
    const { allNodes, layerIndex } = mixedNodes
    let adjustments = 0
    
    // 第一步：解决节点重叠
    adjustments += this.resolveNodeOverlaps(allNodes, positions)
    
    // 第二步：优化父子对齐（考虑endpoint）
    adjustments += this.optimizeParentChildAlignment(allNodes, positions, layerStructure)
    
    // 第三步：层级内居中对齐
    adjustments += this.centerAlignLayer(allNodes, positions)
    
    console.log(`🔧 [单层优化] 第${layerIndex}层优化完成，调整 ${adjustments} 次`)
    
    return adjustments
  }

  /**
   * 解决节点重叠
   * @param {Array} layerNodes - 层级节点
   * @param {Map} positions - 位置映射
   * @returns {number} 调整次数
   */
  resolveNodeOverlaps(layerNodes, positions) {
    const minSpacing = this.options.node.minSpacing
    let adjustments = 0
    
    // 按X坐标排序
    const sortedNodes = layerNodes.sort((a, b) => {
      const aPos = positions.get(a.id || a.getId())
      const bPos = positions.get(b.id || b.getId())
      return aPos.x - bPos.x
    })
    
    // 从左到右检查并调整重叠
    for (let i = 1; i < sortedNodes.length; i++) {
      const currentNode = sortedNodes[i]
      const prevNode = sortedNodes[i - 1]
      
      const currentPos = positions.get(currentNode.id || currentNode.getId())
      const prevPos = positions.get(prevNode.id || prevNode.getId())
      
      const requiredSpacing = minSpacing
      const actualSpacing = currentPos.x - prevPos.x
      
      if (actualSpacing < requiredSpacing) {
        const adjustment = requiredSpacing - actualSpacing
        currentPos.x += adjustment
        adjustments++
        
        console.log(`🔧 [重叠解决] 调整节点 ${currentNode.id || currentNode.getId()}: +${adjustment}px`)
      }
    }
    
    return adjustments
  }

  /**
   * 优化父子对齐
   * @param {Array} layerNodes - 层级节点
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   * @returns {number} 调整次数
   */
  optimizeParentChildAlignment(layerNodes, positions, layerStructure) {
    let adjustments = 0
    const alignmentThreshold = 50 // 对齐阈值
    
    layerNodes.forEach(node => {
      const nodeId = node.id || node.getId()
      const nodePos = positions.get(nodeId)
      const children = layerStructure.parentChildMap.get(nodeId) || []
      
      if (children.length > 0) {
        const childPositions = children
          .map(childId => positions.get(childId))
          .filter(pos => pos !== undefined)
        
        if (childPositions.length > 0) {
          const optimalX = this.calculateOptimalParentPosition(childPositions)
          const currentX = nodePos.x
          
          // 如果调整幅度在合理范围内，则进行调整
          if (Math.abs(optimalX - currentX) <= alignmentThreshold) {
            nodePos.x = optimalX
            adjustments++
            
            console.log(`🔧 [父子对齐] 调整节点 ${nodeId}: ${currentX} -> ${optimalX}`)
          }
        }
      }
    })
    
    return adjustments
  }

  /**
   * 层级居中对齐
   * @param {Array} layerNodes - 层级节点
   * @param {Map} positions - 位置映射
   * @returns {number} 调整次数
   */
  centerAlignLayer(layerNodes, positions) {
    if (layerNodes.length === 0) return 0
    
    // 计算当前层级的边界
    const xCoords = layerNodes.map(node => {
      const pos = positions.get(node.id || node.getId())
      return pos.x
    })
    
    const minX = Math.min(...xCoords)
    const maxX = Math.max(...xCoords)
    const currentCenterX = (minX + maxX) / 2
    const targetCenterX = 0 // 以原点为中心
    
    const offsetX = targetCenterX - currentCenterX
    
    // 如果偏移量足够大，则进行调整
    if (Math.abs(offsetX) > 5) {
      layerNodes.forEach(node => {
        const nodeId = node.id || node.getId()
        const pos = positions.get(nodeId)
        pos.x += offsetX
      })
      
      console.log(`🔧 [层级居中] 整体偏移 ${offsetX.toFixed(1)}px`)
      return layerNodes.length
    }
    
    return 0
  }

  /**
   * 全局优化
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   * @returns {Map} 最终位置映射
   */
  async applyGlobalOptimization(positions, layerStructure) {
    console.log('🌍 [全局优化] 开始全局布局优化')
    
    // 全局优化1：调整层级间距
    this.adjustGlobalLayerSpacing(positions, layerStructure)
    
    // 全局优化2：整体居中
    this.centerAlignGlobalLayout(positions)
    
    // 全局优化3：美学优化
    if (this.options.optimization.enableAestheticOptimization) {
      this.applyAestheticOptimizations(positions, layerStructure)
    }
    
    console.log('🌍 [全局优化] 全局优化完成')
    
    return positions
  }

  /**
   * 调整全局层级间距
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   */
  adjustGlobalLayerSpacing(positions, layerStructure) {
    const baseHeight = this.options.layer.baseHeight
    
    layerStructure.layers.forEach((layer, layerIndex) => {
      const targetY = layerIndex * baseHeight
      
      layer.forEach(node => {
        const nodeId = node.id || node.getId()
        const pos = positions.get(nodeId)
        if (pos) {
          pos.y = targetY
        }
      })
    })
  }

  /**
   * 全局居中对齐
   * @param {Map} positions - 位置映射
   */
  centerAlignGlobalLayout(positions) {
    const allPositions = Array.from(positions.values())
    
    if (allPositions.length === 0) return
    
    // 计算整体边界
    const minX = Math.min(...allPositions.map(pos => pos.x))
    const maxX = Math.max(...allPositions.map(pos => pos.x))
    const minY = Math.min(...allPositions.map(pos => pos.y))
    
    // 居中到原点
    const offsetX = -(minX + maxX) / 2
    const offsetY = -minY
    
    positions.forEach(pos => {
      pos.x += offsetX
      pos.y += offsetY
    })
    
    console.log(`🌍 [全局居中] 整体偏移: (${offsetX.toFixed(1)}, ${offsetY.toFixed(1)})`)
  }

  /**
   * 美学优化
   * @param {Map} positions - 位置映射
   * @param {Object} layerStructure - 层级结构
   */
  applyAestheticOptimizations(positions, layerStructure) {
    // 美学优化可以在这里添加更多细节
    console.log('✨ [美学优化] 应用美学优化')
  }

  /**
   * 应用位置到图形
   * @param {Map} finalPositions - 最终位置映射
   */
  async applyPositionsToGraph(finalPositions) {
    console.log('📍 [位置应用] 开始应用位置到图形')
    
    let appliedCount = 0
    let endpointCount = 0
    
    finalPositions.forEach((position, nodeId) => {
      // 处理普通节点
      const graphNode = this.graph.getCellById(nodeId)
      if (graphNode) {
        const size = graphNode.getSize()
        const newPosition = {
          x: position.x - size.width / 2,
          y: position.y - size.height / 2
        }
        graphNode.setPosition(newPosition)
        appliedCount++
        
        console.log(`📍 [位置应用] 普通节点 ${nodeId}: (${newPosition.x.toFixed(1)}, ${newPosition.y.toFixed(1)})`)
      }
      
      // 🎯 关键：处理endpoint虚拟节点
      const endpointNode = this.layoutModel.endpointNodes.get(nodeId)
      if (endpointNode) {
        const newPosition = {
          x: position.x - endpointNode.size.width / 2,
          y: position.y - endpointNode.size.height / 2
        }
        endpointNode.setPosition(newPosition)
        endpointCount++
        
        console.log(`📍 [位置应用] Endpoint ${nodeId}: (${newPosition.x.toFixed(1)}, ${newPosition.y.toFixed(1)})`)
      }
    })
    
    console.log(`📍 [位置应用] 应用完成: ${appliedCount}个普通节点 + ${endpointCount}个endpoint`)
  }

  /**
   * 生成布局报告
   * @param {Object} layerStructure - 层级结构
   * @param {Map} finalPositions - 最终位置
   * @returns {Object} 布局报告
   */
  generateLayoutReport(layerStructure, finalPositions) {
    const report = {
      success: true,
      timestamp: new Date().toISOString(),
      statistics: {
        totalLayers: layerStructure.totalLayers,
        totalNodes: finalPositions.size,
        normalNodes: 0,
        endpointNodes: 0,
        layerDistribution: []
      },
      performance: {
        executionTime: Date.now() - this.startTime,
        optimizationIterations: this.layoutModel.optimizationHistory.length
      },
      message: '统一结构化布局执行成功'
    }
    
    // 统计节点类型分布
    finalPositions.forEach((position, nodeId) => {
      if (position.nodeType === 'endpoint') {
        report.statistics.endpointNodes++
      } else {
        report.statistics.normalNodes++
      }
    })
    
    // 统计层级分布
    layerStructure.layers.forEach((layer, index) => {
      const normalCount = layer.filter(n => !n.isEndpoint).length
      const endpointCount = layer.filter(n => n.isEndpoint).length
      
      report.statistics.layerDistribution.push({
        layer: index,
        normalNodes: normalCount,
        endpointNodes: endpointCount,
        total: layer.length
      })
    })
    
    console.log('📊 [布局报告]', report)
    
    return report
  }
}