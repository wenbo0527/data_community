/**
 * 偏移计算器 - 负责预览线的偏移量计算和路由器配置
 * 从 PreviewLineSystem 中提取的偏移计算相关算法
 */

/**
 * 偏移计算器类
 * 负责多线偏移配置、路由器安全设置和动态方向配置
 */
export class OffsetCalculator {
  constructor(config = {}) {
    this.config = {
      // 基础偏移配置
      basePadding: 15, // 基础填充
      baseStep: 10, // 基础步长
      maxOffset: 30, // 最大偏移距离
      
      // 路由器配置
      shortConnectionThreshold: 100, // 短距离连接阈值
      verticalConnectionThreshold: 50, // 垂直连接阈值
      manhattanDistanceThreshold: 150, // Manhattan路由器距离阈值
      
      // 颜色配置
      branchColors: [
        '#1890ff', // 蓝色
        '#fa8c16', // 橙色
        '#52c41a', // 绿色
        '#722ed1', // 紫色
        '#eb2f96', // 粉色
        '#13c2c2', // 青色
        '#f5222d', // 红色
        '#faad14'  // 黄色
      ],
      
      // 节点类型颜色映射
      nodeTypeColors: {
        'sms': '#52c41a', // 短信节点使用绿色
        'ai-call': '#722ed1', // AI呼叫使用紫色
        'manual-call': '#fa8c16', // 人工呼叫使用橙色
        'default': '#1890ff' // 默认蓝色
      },
      
      // 调试配置
      enableDebug: false,
      enableLogging: true,
      
      ...config
    }
    
    // 当前拖拽状态
    this.currentDragLine = null
    
    // 动态方向配置缓存
    this.directionConfigCache = new Map()
  }

  /**
   * 计算多线偏移配置
   * @param {Object} sourceNode - 源节点
   * @param {Object} endPosition - 终点位置
   * @param {number} branchIndex - 分支索引
   * @param {number} totalBranches - 总分支数
   * @returns {Object} 偏移配置
   */
  calculateMultiLineOffset(sourceNode, endPosition, branchIndex, totalBranches) {
    // 获取节点类型，确定预览线颜色
    // 安全获取节点数据
    const nodeData = (typeof sourceNode.getData === 'function' ? sourceNode.getData() : sourceNode.data || sourceNode.store?.data?.data) || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    // 根据节点类型确定默认颜色
    const defaultColor = this.config.nodeTypeColors[nodeType] || this.config.nodeTypeColors.default
    
    // 基础偏移配置
    const baseConfig = {
      padding: this.config.basePadding,
      step: this.config.baseStep,
      offset: 0,
      excludeEnds: [],
      strokeColor: defaultColor,
      strokeWidth: 2,
      dashArray: '5,5'
    }
    
    // 单线情况：使用节点类型对应的彩色配置
    if (totalBranches <= 1) {
      return baseConfig
    }
    
    // 多线情况：计算偏移和视觉区分
    const colorIndex = branchIndex % this.config.branchColors.length
    const strokeColor = this.config.branchColors[colorIndex]
    
    // 计算水平偏移：每条线在不同的水平位置
    const offsetStep = totalBranches > 1 ? this.config.maxOffset / (totalBranches - 1) : 0
    const horizontalOffset = branchIndex * offsetStep - this.config.maxOffset / 2
    
    // 计算路由器参数偏移
    const paddingOffset = Math.abs(horizontalOffset) * 0.5
    const stepOffset = Math.abs(horizontalOffset) * 0.3
    
    if (this.config.enableDebug) {
      console.log('🎨 [偏移计算器] 计算偏移配置:', {
        sourceNodeId: sourceNode.id,
        branchIndex: branchIndex,
        totalBranches: totalBranches,
        horizontalOffset: horizontalOffset,
        strokeColor: strokeColor,
        paddingOffset: paddingOffset,
        stepOffset: stepOffset
      })
    }
    
    return {
      padding: baseConfig.padding + paddingOffset,
      step: baseConfig.step + stepOffset,
      offset: horizontalOffset,
      excludeEnds: horizontalOffset !== 0 ? ['source'] : [],
      strokeColor: strokeColor,
      strokeWidth: 2.5, // 稍微加粗以提高可见性
      dashArray: branchIndex % 2 === 0 ? '5,5' : '8,3' // 交替使用不同的虚线样式
    }
  }

  /**
   * 安全地设置路由器配置
   * 当manhattan算法失败时自动回退到orth路由器
   * @param {Object} edge - 边对象
   * @param {Object} routerConfig - 路由器配置
   */
  setSafeRouter(edge, routerConfig = {}) {
    if (!edge) {
      console.warn('⚠️ [偏移计算器] 边对象无效')
      return
    }

    // 优化：根据连接类型智能选择路由器
    const source = edge.getSourcePoint()
    const target = edge.getTargetPoint()
    
    // 检查源点和目标点是否有效
    const hasValidPoints = source && target && 
                          typeof source.x === 'number' && !isNaN(source.x) &&
                          typeof source.y === 'number' && !isNaN(source.y) &&
                          typeof target.x === 'number' && !isNaN(target.x) &&
                          typeof target.y === 'number' && !isNaN(target.y)
    
    if (!hasValidPoints) {
      console.warn('⚠️ [偏移计算器] 源点或目标点坐标无效，使用默认路由器:', {
        edgeId: edge.id,
        source,
        target
      })
      edge.setRouter('normal')
      return
    }

    // 计算连接距离和角度，选择最适合的路由器
    const distance = Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2))
    const isVerticalConnection = Math.abs(target.x - source.x) < this.config.verticalConnectionThreshold
    const isShortConnection = distance < this.config.shortConnectionThreshold

    // 智能路由器选择策略
    let preferredRouter = 'orth' // 默认使用更稳定的orth路由器
    
    // 只在特定条件下使用manhattan路由器
    if (!isShortConnection && !isVerticalConnection && distance > this.config.manhattanDistanceThreshold) {
      preferredRouter = 'manhattan'
    }

    try {
      if (preferredRouter === 'manhattan') {
        // 尝试使用manhattan路由器
        const manhattanConfig = {
          name: 'manhattan',
          args: {
            step: this.config.baseStep,
            padding: this.config.basePadding,
            excludeEnds: ['source'],
            ...this.getDynamicDirectionConfig(),
            ...routerConfig.args
          }
        }
        
        edge.setRouter(manhattanConfig)
        
        // 简化验证：只检查基本有效性
        const vertices = edge.getVertices()
        if (vertices && Array.isArray(vertices)) {
          if (this.config.enableDebug) {
            console.log('✅ [偏移计算器] Manhattan路由器设置成功:', {
              edgeId: edge.id,
              distance: distance.toFixed(2),
              config: manhattanConfig.args
            })
          }
          return
        } else {
          throw new Error('Manhattan router generated invalid vertices')
        }
      } else {
        // 直接使用orth路由器
        throw new Error('Using orth router by preference')
      }
      
    } catch (error) {
      // 完全静默处理：拖拽时不输出任何日志，避免控制台噪音
      const isDragging = this.currentDragLine !== null
      if (!isDragging && this.config.enableDebug) {
        console.log('🔄 [偏移计算器] 使用Orth路由器:', {
          edgeId: edge.id,
          reason: preferredRouter === 'manhattan' ? 'Manhattan失败' : '智能选择',
          distance: distance.toFixed(2),
          isVertical: isVerticalConnection,
          isShort: isShortConnection
        })
      }
      
      // 使用orth路由器 - 智能最短路径优化
      const orthConfig = {
        name: 'orth',
        args: {
          padding: this.config.basePadding,
          step: this.config.baseStep,
          ...this.getDynamicDirectionConfig()
        }
      }
      
      try {
        edge.setRouter(orthConfig)
      } catch (orthError) {
        // 只在非拖拽状态下输出错误信息
        if (!isDragging) {
          console.warn('⚠️ [偏移计算器] Orth路由器失败，使用默认路由器:', {
            edgeId: edge.id,
            error: orthError.message
          })
        }
        edge.setRouter('normal')
      }
    }
  }

  /**
   * 获取动态方向配置
   * @returns {Object} 动态方向配置
   */
  getDynamicDirectionConfig() {
    // 检查缓存
    const cacheKey = 'dynamic-direction'
    if (this.directionConfigCache.has(cacheKey)) {
      return this.directionConfigCache.get(cacheKey)
    }
    
    // 基础动态方向配置
    const config = {
      // 允许的方向：优先垂直方向
      directions: ['bottom', 'top', 'right', 'left'],
      
      // 方向权重：垂直方向优先
      directionWeights: {
        bottom: 1.0,  // 最高优先级
        top: 0.8,     // 次高优先级
        right: 0.6,   // 中等优先级
        left: 0.4     // 最低优先级
      },
      
      // 避免方向：尽量避免水平方向
      avoidDirections: [],
      
      // 智能路径优化
      enableSmartPath: true,
      
      // 最小段长度
      minSegmentLength: 20
    }
    
    // 缓存配置
    this.directionConfigCache.set(cacheKey, config)
    
    return config
  }

  /**
   * 计算单一预览线位置
   * @param {Object} node - 节点对象
   * @param {Object} nodePosition - 节点位置
   * @param {Object} nodeSize - 节点大小
   * @param {Object} layoutEngine - 布局引擎（可选）
   * @returns {Object} 预览线终点位置
   */
  calculateSinglePreviewPosition(node, nodePosition, nodeSize, layoutEngine = null) {
    const nodeId = node.id || node.getId()
    
    // 获取节点的out端口位置
    let outPortPosition
    try {
      // 尝试获取节点的out端口位置
      const ports = node.getPorts()
      const outPort = ports.find(port => port.id === 'out')
      if (outPort) {
        // 直接计算out端口位置（节点底部中心）
        outPortPosition = {
          x: nodePosition.x + nodeSize.width / 2,
          y: nodePosition.y + nodeSize.height
        }
      }
    } catch (error) {
      if (this.config.enableLogging) {
        console.warn(`⚠️ [偏移计算器] 获取out端口位置失败: ${error.message}`)
      }
    }
    
    // 如果无法获取端口位置，使用节点底部中心作为fallback
    if (!outPortPosition) {
      outPortPosition = {
        x: nodePosition.x + nodeSize.width / 2,
        y: nodePosition.y + nodeSize.height
      }
    }
    
    // 使用布局引擎的层级Y坐标系统
    let endY = outPortPosition.y + 120 // 默认向下延伸120px
    
    if (layoutEngine && typeof layoutEngine.getNextLayerY === 'function') {
      try {
        const nextLayerY = layoutEngine.getNextLayerY(nodeId)
        endY = nextLayerY
        if (this.config.enableDebug) {
          console.log(`📍 [偏移计算器] 节点 ${nodeId} 使用布局引擎层级Y坐标: ${endY}`)
        }
      } catch (error) {
        if (this.config.enableLogging) {
          console.warn(`⚠️ [偏移计算器] 获取布局引擎层级Y坐标失败，使用默认延伸: ${error.message}`)
        }
      }
    }
    
    return {
      x: outPortPosition.x,  // 使用out端口X坐标
      y: endY  // 使用布局引擎的层级Y坐标或默认延伸
    }
  }

  /**
   * 计算分支预览线位置
   * @param {Object} node - 节点对象
   * @param {Array} branches - 分支数组
   * @param {number} index - 分支索引
   * @param {Object} layoutEngine - 布局引擎（可选）
   * @returns {Object} 分支预览线终点位置
   */
  calculateBranchPreviewPosition(node, branches, index, layoutEngine = null) {
    const nodePosition = node.getPosition()  // 左上角坐标
    const nodeSize = node.getSize()
    const nodeId = node.id || node.getId()
    
    // 获取节点的out端口位置
    let outPortPosition
    try {
      // 尝试获取节点的out端口位置
      const ports = node.getPorts()
      const outPort = ports.find(port => port.id === 'out')
      if (outPort) {
        // 直接计算out端口位置（节点底部中心）
        outPortPosition = {
          x: nodePosition.x + nodeSize.width / 2,
          y: nodePosition.y + nodeSize.height
        }
      }
    } catch (error) {
      if (this.config.enableLogging) {
        console.warn(`⚠️ [偏移计算器] 获取分支out端口位置失败: ${error.message}`)
      }
    }
    
    // 如果无法获取端口位置，使用节点底部中心作为fallback
    if (!outPortPosition) {
      outPortPosition = {
        x: nodePosition.x + nodeSize.width / 2,
        y: nodePosition.y + nodeSize.height
      }
    }
    
    // 计算分支间距
    const branchCount = branches.length
    const totalWidth = Math.min(branchCount * 60, 300) // 限制最大宽度
    const branchSpacing = branchCount > 1 ? totalWidth / (branchCount - 1) : 0
    
    // 计算分支的X坐标偏移
    const startX = outPortPosition.x - totalWidth / 2
    const branchX = branchCount > 1 ? startX + index * branchSpacing : outPortPosition.x
    
    // 使用布局引擎的层级Y坐标系统
    let endY = outPortPosition.y + 120 // 默认向下延伸120px
    
    if (layoutEngine && typeof layoutEngine.getNextLayerY === 'function') {
      try {
        const nextLayerY = layoutEngine.getNextLayerY(nodeId)
        endY = nextLayerY
        if (this.config.enableDebug) {
          console.log(`📍 [偏移计算器] 分支节点 ${nodeId} 使用布局引擎层级Y坐标: ${endY}`)
        }
      } catch (error) {
        if (this.config.enableLogging) {
          console.warn(`⚠️ [偏移计算器] 获取分支布局引擎层级Y坐标失败，使用默认延伸: ${error.message}`)
        }
      }
    }
    
    return {
      x: branchX,  // 分支特定的X坐标
      y: endY      // 使用布局引擎的层级Y坐标或默认延伸
    }
  }

  /**
   * 应用偏移配置到预览线
   * @param {Object} line - 预览线对象
   * @param {Object} offsetConfig - 偏移配置
   */
  applyOffsetToLine(line, offsetConfig) {
    try {
      // 更新路由器配置
      if (typeof line.setRouter === 'function') {
        line.setRouter({
          name: 'orth',
          args: {
            padding: offsetConfig.padding,
            step: offsetConfig.step,
            offset: offsetConfig.offset,
            excludeEnds: offsetConfig.excludeEnds
          }
        })
      }
      
      // 更新视觉样式
      if (typeof line.attr === 'function') {
        line.attr({
          line: {
            stroke: offsetConfig.strokeColor,
            strokeWidth: offsetConfig.strokeWidth,
            strokeDasharray: offsetConfig.dashArray,
            targetMarker: {
              fill: offsetConfig.strokeColor
            }
          }
        })
      }
      
      // 更新数据中的偏移配置
      if (typeof line.getData === 'function' && typeof line.setData === 'function') {
        const data = line.getData() || {}
        data.offsetConfig = offsetConfig
        line.setData(data)
      }
      
      if (this.config.enableDebug) {
        console.log('✅ [偏移计算器] 已应用偏移配置到预览线:', {
          lineId: line.id,
          offsetConfig: offsetConfig
        })
      }
      
    } catch (error) {
      console.error('💥 [偏移计算器] 应用偏移配置失败:', error)
    }
  }

  /**
   * 设置当前拖拽状态
   * @param {Object} dragLine - 当前拖拽的预览线
   */
  setCurrentDragLine(dragLine) {
    this.currentDragLine = dragLine
  }

  /**
   * 清除当前拖拽状态
   */
  clearCurrentDragLine() {
    this.currentDragLine = null
  }

  /**
   * 清理缓存
   */
  clearCache() {
    this.directionConfigCache.clear()
    
    if (this.config.enableDebug) {
      console.log('🧹 [偏移计算器] 清理缓存')
    }
  }

  /**
   * 销毁计算器，清理资源
   */
  destroy() {
    this.clearCache()
    this.currentDragLine = null
    
    if (this.config.enableDebug) {
      console.log('🗑️ [偏移计算器] 已销毁')
    }
  }
}

/**
 * 创建偏移计算器实例的工厂函数
 * @param {Object} config - 配置选项
 * @returns {OffsetCalculator} 偏移计算器实例
 */
export function createOffsetCalculator(config = {}) {
  return new OffsetCalculator(config)
}

/**
 * 默认偏移计算器实例
 */
export const defaultOffsetCalculator = createOffsetCalculator({
  enableDebug: false,
  enableLogging: true
})

export default OffsetCalculator