/**
 * 样式渲染器
 * 负责预览线的样式配置和视觉效果
 * 从 PreviewLineSystem 中提取的样式相关功能
 */

export class StyleRenderer {
  constructor(options = {}) {
    this.graph = options.graph
    this.eventManager = options.eventManager
    this.configManager = options.configManager
    
    // 样式配置缓存
    this.styleCache = new Map()
    
    // 默认样式配置
    this.defaultStyles = {
      interactive: {
        stroke: '#1890ff',
        strokeWidth: 2,
        strokeDasharray: '5,5',
        opacity: 0.8,
        cursor: 'pointer'
      },
      dragging: {
        stroke: '#52c41a',
        strokeWidth: 3,
        strokeDasharray: '8,4',
        opacity: 1,
        cursor: 'grabbing'
      },
      connected: {
        stroke: '#8c8c8c',
        strokeWidth: 2,
        strokeDasharray: 'none',
        opacity: 0.6,
        cursor: 'default'
      },
      hover: {
        stroke: '#722ed1',
        strokeWidth: 3,
        strokeDasharray: '5,5',
        opacity: 1,
        cursor: 'pointer'
      }
    }
    
    // 节点类型颜色映射
    this.nodeTypeColors = {
      'start': '#1890ff',
      'sms': '#52c41a',
      'ai-call': '#722ed1',
      'manual-call': '#fa8c16',
      'audience-split': '#13c2c2',
      'event-split': '#eb2f96',
      'ab-test': '#f5222d',
      'end': '#8c8c8c',
      'task': '#13c2c2',
      'condition': '#fa8c16',
      'action': '#52c41a',
      'default': '#1890ff'
    }
    
    console.log('🎨 [样式渲染器] 初始化完成')
  }

  /**
   * 配置交互状态样式
   * 从 PreviewLineSystem 迁移
   * @param {Object} previewInstance - 预览线实例
   */
  configureInteractive(previewInstance) {
    if (!this.validatePreviewInstance(previewInstance)) {
      return
    }
    
    const { line, sourceNode } = previewInstance
    const nodeData = this.getNodeData(sourceNode)
    const nodeType = this.extractNodeType(nodeData)
    
    const baseColor = this.getNodeTypeColor(nodeType)
    const style = {
      ...this.defaultStyles.interactive,
      stroke: baseColor
    }
    
    this.applyLineStyle(line, style)
    this.updateLabelStyle(previewInstance, 'interactive')
    
    console.log('🎯 [样式渲染器] 配置交互状态:', {
      lineId: line.id,
      nodeType: nodeType,
      color: baseColor
    })
  }

  /**
   * 配置拖拽状态样式
   * 从 PreviewLineSystem 迁移
   * @param {Object} previewInstance - 预览线实例
   */
  configureDragging(previewInstance) {
    if (!this.validatePreviewInstance(previewInstance)) {
      return
    }
    
    const { line, sourceNode } = previewInstance
    const nodeData = this.getNodeData(sourceNode)
    const nodeType = this.extractNodeType(nodeData)
    
    const baseColor = this.getNodeTypeColor(nodeType)
    const style = {
      ...this.defaultStyles.dragging,
      stroke: this.adjustColorBrightness(baseColor, 20)
    }
    
    this.applyLineStyle(line, style)
    this.updateLabelStyle(previewInstance, 'dragging')
    
    console.log('🖱️ [样式渲染器] 配置拖拽状态:', {
      lineId: line.id,
      nodeType: nodeType
    })
  }

  /**
   * 配置连接状态样式
   * 从 PreviewLineSystem 迁移
   * @param {Object} previewInstance - 预览线实例
   */
  configureConnected(previewInstance) {
    const { line } = previewInstance
    
    const style = {
      ...this.defaultStyles.connected
    }
    
    this.applyLineStyle(line, style)
    this.updateLabelStyle(previewInstance, 'connected')
    
    console.log('🔗 [样式渲染器] 配置连接状态:', line.id)
  }

  /**
   * 配置悬停状态样式
   * 从 PreviewLineSystem 迁移
   * @param {Object} previewInstance - 预览线实例
   */
  configureHover(previewInstance) {
    if (!this.validatePreviewInstance(previewInstance)) {
      return
    }
    
    const { line, sourceNode } = previewInstance
    const nodeData = this.getNodeData(sourceNode)
    const nodeType = this.extractNodeType(nodeData)
    
    const baseColor = this.getNodeTypeColor(nodeType)
    const style = {
      ...this.defaultStyles.hover,
      stroke: this.adjustColorBrightness(baseColor, -20)
    }
    
    this.applyLineStyle(line, style)
    this.updateLabelStyle(previewInstance, 'hover')
    
    console.log('🎯 [样式渲染器] 配置悬停状态:', {
      lineId: line.id,
      nodeType: nodeType
    })
  }

  /**
   * 更新标签样式
   * 从 PreviewLineSystem 迁移
   * @param {Object} previewInstance - 预览线实例
   * @param {string} state - 状态
   */
  updateLabelStyle(previewInstance, state) {
    if (!this.validatePreviewInstance(previewInstance)) {
      return
    }
    
    const { line, branchLabel, sourceNode } = previewInstance
    
    if (!branchLabel) return
    
    const nodeData = this.getNodeData(sourceNode)
    const nodeType = this.extractNodeType(nodeData)
    const baseColor = this.getNodeTypeColor(nodeType)
    
    // 根据状态调整标签样式
    const labelStyles = {
      interactive: {
        fill: '#333',
        fontSize: 14,
        fontWeight: 'bold',
        backgroundColor: '#fff',
        borderColor: baseColor,
        borderWidth: 2
      },
      dragging: {
        fill: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
        backgroundColor: baseColor,
        borderColor: baseColor,
        borderWidth: 3
      },
      connected: {
        fill: '#666',
        fontSize: 12,
        fontWeight: 'normal',
        backgroundColor: '#f5f5f5',
        borderColor: '#d9d9d9',
        borderWidth: 1
      },
      hover: {
        fill: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        backgroundColor: this.adjustColorBrightness(baseColor, -20),
        borderColor: this.adjustColorBrightness(baseColor, -20),
        borderWidth: 2
      }
    }
    
    const labelStyle = labelStyles[state] || labelStyles.interactive
    
    // 更新标签样式
    const labels = line.getLabels() || []
    if (labels.length > 0) {
      const updatedLabels = labels.map(label => ({
        ...label,
        attrs: {
          text: {
            ...label.attrs?.text,
            fill: labelStyle.fill,
            fontSize: labelStyle.fontSize,
            fontWeight: labelStyle.fontWeight
          },
          rect: {
            ...label.attrs?.rect,
            fill: labelStyle.backgroundColor,
            stroke: labelStyle.borderColor,
            strokeWidth: labelStyle.borderWidth
          }
        }
      }))
      
      line.setLabels(updatedLabels)
    }
    
    console.log('🏷️ [样式渲染器] 更新标签样式:', {
      lineId: line.id,
      state: state,
      branchLabel: branchLabel
    })
  }

  /**
   * 更新预览线终点样式
   * 从 PreviewLineSystem 迁移
   * @param {Object} previewInstance - 预览线实例
   * @param {boolean} isDragging - 是否正在拖拽
   */
  updatePreviewLineEndpointStyle(previewInstance, isDragging = false) {
    if (!this.validatePreviewInstance(previewInstance)) {
      return
    }
    
    const { line, sourceNode } = previewInstance
    const nodeData = this.getNodeData(sourceNode)
    const nodeType = this.extractNodeType(nodeData)
    const baseColor = this.getNodeTypeColor(nodeType)
    
    const endpointStyle = isDragging ? {
      targetMarker: {
        name: 'classic',
        size: 12,
        fill: baseColor,
        stroke: baseColor,
        strokeWidth: 3
      }
    } : {
      targetMarker: {
        name: 'classic',
        size: 8,
        fill: baseColor,
        stroke: baseColor,
        strokeWidth: 2
      }
    }
    
    // 安全检查：确保line对象有getAttrs方法
    if (!line || typeof line.getAttrs !== 'function') {
      console.warn('⚠️ [样式渲染器] line对象无效或缺少getAttrs方法:', line)
      return
    }
    
    const currentAttrs = line.getAttrs() || {}
    const currentLineAttrs = currentAttrs.line || {}
    
    line.setAttrs({
      line: {
        ...currentLineAttrs,
        ...endpointStyle
      }
    })
    
    console.log('🎯 [样式渲染器] 更新终点样式:', {
      lineId: line.id,
      isDragging: isDragging,
      nodeType: nodeType
    })
  }

  /**
   * 高亮预览线终点
   * 从 PreviewLineSystem 迁移
   * @param {Object} previewInstance - 预览线实例
   * @param {boolean} highlight - 是否高亮
   */
  highlightPreviewLineEndpoint(previewInstance, highlight = true) {
    if (!this.validatePreviewInstance(previewInstance)) {
      return
    }
    
    const { line, sourceNode } = previewInstance
    const nodeData = this.getNodeData(sourceNode)
    const nodeType = this.extractNodeType(nodeData)
    const baseColor = this.getNodeTypeColor(nodeType)
    
    if (highlight) {
      // 高亮样式
      const highlightStyle = {
        stroke: this.adjustColorBrightness(baseColor, 30),
        strokeWidth: 4,
        strokeDasharray: '8,4',
        opacity: 1,
        targetMarker: {
          name: 'classic',
          size: 14,
          fill: this.adjustColorBrightness(baseColor, 30),
          stroke: this.adjustColorBrightness(baseColor, 30),
          strokeWidth: 3
        }
      }
      
      this.applyLineStyle(line, highlightStyle)
      
      // 添加脉冲效果
      this.addPulseEffect(line)
      
    } else {
      // 恢复正常样式
      this.updatePreviewLineEndpointStyle(previewInstance, false)
      
      // 移除脉冲效果
      this.removePulseEffect(line)
    }
    
    console.log('✨ [样式渲染器] 终点高亮:', {
      lineId: line.id,
      highlight: highlight,
      nodeType: nodeType
    })
  }

  /**
   * 应用线条样式
   * @param {Object} line - 预览线对象
   * @param {Object} style - 样式配置
   */
  applyLineStyle(line, style) {
    const currentAttrs = line.getAttrs() || {}
    const lineAttrs = currentAttrs.line || {}
    
    const newAttrs = {
      line: {
        ...lineAttrs,
        stroke: style.stroke,
        strokeWidth: style.strokeWidth,
        strokeDasharray: style.strokeDasharray === 'none' ? null : style.strokeDasharray,
        opacity: style.opacity,
        cursor: style.cursor
      }
    }
    
    // 保持目标标记样式
    if (style.targetMarker) {
      newAttrs.line.targetMarker = style.targetMarker
    }
    
    line.setAttrs(newAttrs)
  }

  /**
   * 获取节点类型对应的颜色
   * @param {string} nodeType - 节点类型
   * @returns {string} 颜色值
   */
  getNodeTypeColor(nodeType) {
    if (!nodeType || typeof nodeType !== 'string') {
      console.warn('⚠️ [样式渲染器] 无效的节点类型:', nodeType)
      return '#1890ff'
    }
    
    const color = this.nodeTypeColors[nodeType] || this.nodeTypeColors['default'] || '#1890ff'
    
    console.log('🎨 [样式渲染器] 获取节点颜色:', {
      nodeType: nodeType,
      color: color
    })
    
    return color
  }

  /**
   * 调整颜色亮度
   * @param {string} color - 原始颜色
   * @param {number} amount - 调整量 (-100 到 100)
   * @returns {string} 调整后的颜色
   */
  adjustColorBrightness(color, amount) {
    // 简单的颜色亮度调整实现
    const usePound = color[0] === '#'
    const col = usePound ? color.slice(1) : color
    
    const num = parseInt(col, 16)
    let r = (num >> 16) + amount
    let g = (num >> 8 & 0x00FF) + amount
    let b = (num & 0x0000FF) + amount
    
    r = r > 255 ? 255 : r < 0 ? 0 : r
    g = g > 255 ? 255 : g < 0 ? 0 : g
    b = b > 255 ? 255 : b < 0 ? 0 : b
    
    return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0')
  }

  /**
   * 添加脉冲效果
   * @param {Object} line - 预览线对象
   */
  addPulseEffect(line) {
    const lineId = line.id
    
    // 避免重复添加
    if (line._pulseAnimation) {
      return
    }
    
    let opacity = 1
    let direction = -1
    
    const animate = () => {
      if (!line.isRemoved?.() && this.graph?.hasCell(lineId)) {
        opacity += direction * 0.1
        
        if (opacity <= 0.3) {
          direction = 1
        } else if (opacity >= 1) {
          direction = -1
        }
        
        const currentAttrs = line.getAttrs() || {}
        line.setAttrs({
          line: {
            ...currentAttrs.line,
            opacity: opacity
          }
        })
        
        line._pulseAnimation = setTimeout(animate, 100)
      }
    }
    
    animate()
  }

  /**
   * 移除脉冲效果
   * @param {Object} line - 预览线对象
   */
  removePulseEffect(line) {
    if (line._pulseAnimation) {
      clearTimeout(line._pulseAnimation)
      line._pulseAnimation = null
    }
  }

  /**
   * 创建渐变样式
   * @param {string} startColor - 起始颜色
   * @param {string} endColor - 结束颜色
   * @returns {Object} 渐变配置
   */
  createGradientStyle(startColor, endColor) {
    return {
      type: 'linearGradient',
      stops: [
        { offset: '0%', color: startColor },
        { offset: '100%', color: endColor }
      ]
    }
  }

  /**
   * 应用主题样式
   * @param {string} theme - 主题名称 ('light' | 'dark')
   */
  applyTheme(theme = 'light') {
    const themes = {
      light: {
        interactive: { ...this.defaultStyles.interactive },
        dragging: { ...this.defaultStyles.dragging },
        connected: { ...this.defaultStyles.connected },
        hover: { ...this.defaultStyles.hover }
      },
      dark: {
        interactive: {
          ...this.defaultStyles.interactive,
          stroke: '#40a9ff',
          opacity: 0.9
        },
        dragging: {
          ...this.defaultStyles.dragging,
          stroke: '#73d13d',
          opacity: 1
        },
        connected: {
          ...this.defaultStyles.connected,
          stroke: '#bfbfbf',
          opacity: 0.7
        },
        hover: {
          ...this.defaultStyles.hover,
          stroke: '#9254de',
          opacity: 1
        }
      }
    }
    
    this.defaultStyles = themes[theme] || themes.light
    
    console.log('🎨 [样式渲染器] 应用主题:', theme)
  }

  /**
   * 注册自定义样式
   * @param {string} name - 样式名称
   * @param {Object} style - 样式配置
   */
  registerCustomStyle(name, style) {
    this.defaultStyles[name] = { ...style }
    
    console.log('📝 [样式渲染器] 注册自定义样式:', name)
  }

  /**
   * 获取样式配置
   * @param {string} state - 状态名称
   * @returns {Object} 样式配置
   */
  getStyleConfig(state) {
    return this.defaultStyles[state] || this.defaultStyles.interactive
  }

  /**
   * 缓存样式
   * @param {string} key - 缓存键
   * @param {Object} style - 样式对象
   */
  cacheStyle(key, style) {
    this.styleCache.set(key, { ...style, timestamp: Date.now() })
  }

  /**
   * 获取缓存样式
   * @param {string} key - 缓存键
   * @returns {Object|null} 缓存的样式
   */
  getCachedStyle(key) {
    const cached = this.styleCache.get(key)
    if (cached) {
      // 检查缓存是否过期（5分钟）
      if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
        return cached
      } else {
        this.styleCache.delete(key)
      }
    }
    return null
  }

  /**
   * 清理样式缓存
   */
  clearStyleCache() {
    this.styleCache.clear()
    console.log('🧹 [样式渲染器] 样式缓存已清理')
  }

  /**
   * 获取样式统计信息
   * @returns {Object} 统计信息
   */
  getStyleStats() {
    return {
      cacheSize: this.styleCache.size,
      registeredStyles: Object.keys(this.defaultStyles).length,
      nodeTypeColors: Object.keys(this.nodeTypeColors).length,
      timestamp: Date.now()
    }
  }

  /**
   * 设置预览线状态
   * @param {string|Object} nodeIdOrInstance - 节点ID或预览线实例
   * @param {string} state - 状态
   * @param {Object} options - 选项
   */
  setPreviewLineState(nodeIdOrInstance, state, options = {}) {
    let previewInstance
    
    // 处理不同的参数类型
    if (typeof nodeIdOrInstance === 'string') {
      // 如果传入的是节点ID，需要从某处获取预览线实例
      // 这里假设可以通过graph或其他方式获取
      console.warn('⚠️ [样式渲染器] 通过节点ID设置状态暂未完全实现:', nodeIdOrInstance)
      return
    } else if (nodeIdOrInstance && nodeIdOrInstance.line) {
      // 如果传入的是预览线实例
      previewInstance = nodeIdOrInstance
    } else {
      console.warn('⚠️ [样式渲染器] 无效的预览线参数:', nodeIdOrInstance)
      return
    }
    
    if (!previewInstance || !previewInstance.line) {
      console.warn('⚠️ [样式渲染器] 预览线实例无效')
      return
    }
    
    // 验证源节点
    if (previewInstance.sourceNode) {
      const sourceNode = previewInstance.sourceNode
      
      if (!sourceNode || !sourceNode.id) {
        console.warn('⚠️ [样式渲染器] 预览线的源节点对象无效')
        return
      }
      
      if (this.graph && !this.graph.hasCell(sourceNode.id)) {
        console.warn('⚠️ [样式渲染器] 预览线的源节点不在graph中:', sourceNode.id)
        return
      }
      
      if (sourceNode.removed || sourceNode.isRemoved?.()) {
        console.warn('⚠️ [样式渲染器] 预览线的源节点已被移除:', sourceNode.id)
        return
      }
    }
    
    // 更新预览线状态
    previewInstance.state = state
    
    console.log('🎨 [样式渲染器] 设置预览线状态:', {
      lineId: previewInstance.line.id,
      state: state,
      options: options
    })
    
    // 根据状态应用相应的样式配置
    switch (state) {
      case 'INTERACTIVE':
      case 'interactive':
        this.configureInteractive(previewInstance)
        break
        
      case 'DRAGGING':
      case 'dragging':
        this.configureDragging(previewInstance)
        break
        
      case 'CONNECTED':
      case 'connected':
        this.configureConnected(previewInstance)
        break
        
      case 'HOVER':
      case 'hover':
        this.configureHover(previewInstance)
        break
        
      default:
        console.warn('⚠️ [样式渲染器] 未知的预览线状态:', state)
        // 默认使用交互状态
        this.configureInteractive(previewInstance)
        break
    }
  }

  /**
   * 验证预览线实例
   * @param {Object} previewInstance - 预览线实例
   * @returns {boolean} 是否有效
   */
  validatePreviewInstance(previewInstance) {
    if (!previewInstance) {
      console.warn('⚠️ [样式渲染器] 预览线实例为空')
      return false
    }
    
    if (!previewInstance.line) {
      console.warn('⚠️ [样式渲染器] 预览线实例缺少line对象')
      return false
    }
    
    if (!previewInstance.sourceNode) {
      console.warn('⚠️ [样式渲染器] 预览线实例缺少sourceNode对象')
      return false
    }
    
    return true
  }

  /**
   * 安全获取节点数据
   * @param {Object} sourceNode - 源节点
   * @returns {Object} 节点数据
   */
  getNodeData(sourceNode) {
    if (!sourceNode) {
      console.warn('⚠️ [样式渲染器] 源节点为空')
      return {}
    }
    
    try {
      // 尝试多种方式获取节点数据
      if (typeof sourceNode.getData === 'function') {
        return sourceNode.getData() || {}
      } else if (sourceNode.data) {
        return sourceNode.data || {}
      } else if (sourceNode.attrs && sourceNode.attrs.data) {
        return sourceNode.attrs.data || {}
      } else {
        return sourceNode || {}
      }
    } catch (error) {
      console.warn('⚠️ [样式渲染器] 获取节点数据失败:', error)
      return {}
    }
  }

  /**
   * 提取节点类型
   * @param {Object} nodeData - 节点数据
   * @returns {string} 节点类型
   */
  extractNodeType(nodeData) {
    if (!nodeData || typeof nodeData !== 'object') {
      console.warn('⚠️ [样式渲染器] 节点数据无效')
      return 'default'
    }
    
    // 尝试多种字段获取节点类型
    const nodeType = nodeData.type || 
                     nodeData.nodeType || 
                     nodeData.componentType || 
                     nodeData.kind || 
                     nodeData.category ||
                     'default'
    
    if (!nodeType || typeof nodeType !== 'string') {
      console.warn('⚠️ [样式渲染器] 无法确定节点类型，使用默认类型')
      return 'default'
    }
    
    return nodeType
  }

  /**
   * 销毁样式渲染器
   */
  destroy() {
    console.log('🗑️ [样式渲染器] 开始销毁...')
    
    // 清理缓存
    this.clearStyleCache()
    
    // 清理引用
    this.graph = null
    this.eventManager = null
    this.configManager = null
    this.styleCache = null
    this.defaultStyles = null
    this.nodeTypeColors = null
    
    console.log('✅ [样式渲染器] 销毁完成')
  }
}

export default StyleRenderer