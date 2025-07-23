/**
 * 增强的节点样式管理器
 * 提供现代化的纯色节点设计和用户体验优化
 */

import { ANIMATION_CONFIG, INTERACTION_CONFIG, VISUAL_FEEDBACK } from './uiOptimizationConfig.js'
import { nodeTypes as NODE_TYPES } from './nodeTypes.js'

export class EnhancedNodeStyleManager {
  constructor(graph) {
    this.graph = graph
    this.animationCache = new Map()
    this.styleCache = new Map()
    this.currentAnimations = new Map()
    
    this.initializeEventListeners()
  }

  /**
   * 初始化事件监听器
   */
  initializeEventListeners() {
    if (!this.graph) return

    // 完全禁用所有事件监听器，避免干扰Vue组件渲染
    // 不监听任何节点事件，让Vue组件完全自主管理
    console.log('🚫 [EnhancedNodeStyleManager] 已禁用所有事件监听器，避免干扰Vue组件渲染')
  }

  /**
   * 获取节点的增强样式
   */
  getEnhancedNodeStyle(nodeType, state = 'normal') {
    const cacheKey = `${nodeType}-${state}`
    
    if (this.styleCache.has(cacheKey)) {
      return this.styleCache.get(cacheKey)
    }

    const nodeConfig = NODE_TYPES[nodeType]
    if (!nodeConfig) {
      console.warn(`Unknown node type: ${nodeType}`)
      return this.getDefaultStyle(state)
    }

    const style = this.buildNodeStyle(nodeConfig, state)
    this.styleCache.set(cacheKey, style)
    
    return style
  }

  /**
   * 构建节点样式
   */
  buildNodeStyle(nodeConfig, state) {
    const baseStyle = {
      // 基础样式
      fill: this.getStateColor(nodeConfig, state),
      stroke: this.getStrokeColor(nodeConfig, state),
      strokeWidth: this.getStrokeWidth(state),
      rx: nodeConfig.shape === 'circle' ? nodeConfig.width / 2 : 8,
      ry: nodeConfig.shape === 'circle' ? nodeConfig.height / 2 : 8,
      
      // 阴影效果
      filter: this.getShadowFilter(state),
      
      // 过渡动画
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      
      // 透明度
      opacity: this.getOpacity(state)
    }

    // 添加状态特定的样式
    switch (state) {
      case 'hover':
        Object.assign(baseStyle, {
          transform: 'scale(1.05)',
          cursor: 'pointer'
        })
        break
        
      case 'selected':
        Object.assign(baseStyle, {
          transform: 'scale(1.05)',
          strokeWidth: 3,
          strokeDasharray: '0'
        })
        break
        
      case 'dragging':
        Object.assign(baseStyle, {
          transform: 'scale(1.1) rotate(2deg)',
          opacity: 0.8,
          zIndex: 1000
        })
        break
        
      case 'disabled':
        Object.assign(baseStyle, {
          opacity: 0.5,
          filter: 'grayscale(100%)',
          cursor: 'not-allowed'
        })
        break
    }

    return baseStyle
  }

  /**
   * 获取状态对应的颜色
   */
  getStateColor(nodeConfig, state) {
    switch (state) {
      case 'hover':
        return nodeConfig.hoverColor || this.lightenColor(nodeConfig.color, 0.1)
      case 'selected':
      case 'active':
        return nodeConfig.activeColor || this.lightenColor(nodeConfig.color, 0.2)
      case 'disabled':
        return this.desaturateColor(nodeConfig.color)
      default:
        return nodeConfig.color
    }
  }

  /**
   * 获取描边颜色
   */
  getStrokeColor(nodeConfig, state) {
    switch (state) {
      case 'selected':
        return '#1890ff'
      case 'error':
        return '#ff4d4f'
      case 'success':
        return '#52c41a'
      default:
        return this.darkenColor(nodeConfig.color, 0.2)
    }
  }

  /**
   * 获取描边宽度
   */
  getStrokeWidth(state) {
    switch (state) {
      case 'selected':
      case 'hover':
        return 2
      case 'error':
        return 3
      default:
        return 1
    }
  }

  /**
   * 获取阴影滤镜
   */
  getShadowFilter(state) {
    switch (state) {
      case 'hover':
        return 'drop-shadow(0 8px 24px rgba(0,0,0,0.15))'
      case 'selected':
        return 'drop-shadow(0 6px 20px rgba(24,144,255,0.3))'
      case 'dragging':
        return 'drop-shadow(0 12px 32px rgba(0,0,0,0.2))'
      case 'success':
        return 'drop-shadow(0 0 10px rgba(82, 196, 26, 0.5))'
      default:
        return 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))'
    }
  }

  /**
   * 获取透明度
   */
  getOpacity(state) {
    switch (state) {
      case 'disabled':
        return 0.5
      case 'dragging':
        return 0.8
      default:
        return 1
    }
  }

  /**
   * 获取节点类型
   */
  getNodeType(node) {
    if (!node) return 'default'
    
    const nodeData = node.getData()
    let nodeType = 'default'
    
    // 尝试多种方式获取节点类型
    if (nodeData) {
      nodeType = nodeData.type || nodeData.nodeType || nodeData.kind || 'default'
    }
    
    // 如果还是没有找到，尝试从节点的其他属性获取
    if (nodeType === 'default') {
      try {
        // 使用正确的 X6 API 获取节点 shape
        const shape = node.prop('shape') || node.attr('body/shape') || node.shape
        if (shape && typeof shape === 'string' && shape.includes('start')) {
          nodeType = 'start'
        }
        
        // 也可以尝试从节点 ID 或其他属性推断类型
        const nodeId = node.id || ''
        if (nodeId.includes('start')) {
          nodeType = 'start'
        } else if (nodeId.includes('end')) {
          nodeType = 'end'
        } else if (nodeId.includes('condition')) {
          nodeType = 'condition'
        } else if (nodeId.includes('action')) {
          nodeType = 'action'
        }
      } catch (error) {
        console.warn('Error getting node shape:', error)
        // 如果获取 shape 失败，使用默认类型
      }
    }
    
    // 调试信息
    if (nodeType === 'default' && nodeData) {
      console.log('Node data for default type:', nodeData)
    }
    
    return nodeType
  }

  /**
   * 应用节点样式（完全禁用版本）
   */
  applyNodeStyle(node, nodeType, state = 'normal') {
    // 完全禁用样式应用，避免干扰Vue组件渲染
    console.log('🚫 [EnhancedNodeStyleManager] 样式应用已完全禁用，避免干扰Vue组件渲染')
    return
  }

  /**
   * 获取变换样式
   */
  getTransformStyle(state) {
    switch (state) {
      case 'hover':
        return 'scale(1.05)'
      case 'selected':
        return 'scale(1.05)'
      case 'dragging':
        return 'scale(1.1) rotate(2deg)'
      default:
        return 'scale(1)'
    }
  }

  /**
   * 获取透明度样式
   */
  getOpacityStyle(state) {
    switch (state) {
      case 'disabled':
        return 0.5
      case 'dragging':
        return 0.8
      default:
        return 1
    }
  }

  /**
   * 获取容器样式
   */
  getContainerStyle(state) {
    switch (state) {
      case 'hover':
        return { filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.15))' }
      case 'selected':
        return { filter: 'drop-shadow(0 6px 20px rgba(24,144,255,0.3))' }
      case 'dragging':
        return { 
          filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.2))',
          zIndex: 1000
        }
      default:
        return null
    }
  }

  /**
   * 获取状态对应的 CSS 类名
   */
  getStateClassName(state) {
    const baseClass = 'enhanced-node'
    switch (state) {
      case 'hover':
        return `${baseClass} enhanced-node--hover`
      case 'selected':
        return `${baseClass} enhanced-node--selected`
      case 'dragging':
        return `${baseClass} enhanced-node--dragging`
      case 'disabled':
        return `${baseClass} enhanced-node--disabled`
      default:
        return baseClass
    }
  }

  /**
   * 更新节点图标
   */
  updateNodeIcon(node, nodeType, state) {
    const nodeConfig = NODE_TYPES[nodeType]
    if (!nodeConfig?.icon) return

    const iconSize = state === 'hover' || state === 'selected' ? 20 : 16
    const iconOpacity = state === 'disabled' ? 0.5 : 1

    node.attr('icon', {
      text: nodeConfig.icon,
      fontSize: iconSize,
      fill: '#ffffff',
      opacity: iconOpacity,
      textAnchor: 'middle',
      dominantBaseline: 'central'
    })
  }

  /**
   * 更新状态指示器
   */
  updateStateIndicator(node, state) {
    if (state === 'selected') {
      node.attr('indicator', {
        cx: node.size().width - 8,
        cy: 8,
        r: 4,
        fill: '#1890ff',
        stroke: '#ffffff',
        strokeWidth: 2
      })
    } else {
      // 使用X6兼容的方式移除属性
      node.attr('indicator', null)
    }
  }

  /**
   * 节点添加动画
   */
  animateNodeAdd(node) {
    const config = ANIMATION_CONFIG.NODE.ADD
    
    // 设置初始状态
    node.attr('body', {
      transform: 'scale(0.8)',
      opacity: 0.5
    })

    // 使用setTimeout模拟动画效果
    setTimeout(() => {
      node.attr('body', {
        transform: 'scale(1)',
        opacity: 1,
        transition: `all ${config.duration}ms ${config.easing}`
      })
    }, 50)
  }

  /**
   * 节点删除动画
   */
  animateNodeRemove(node) {
    const config = ANIMATION_CONFIG.NODE.REMOVE
    
    // 执行动画
    node.attr('body', {
      transform: 'scale(0.8)',
      opacity: 0.3,
      transition: `all ${config.duration}ms ${config.easing}`
    })

    // 动画完成后删除节点
    setTimeout(() => {
      this.graph.removeNode(node)
    }, config.duration)
  }

  /**
   * 节点选择动画
   */
  animateNodeSelection(node) {
    const config = ANIMATION_CONFIG.NODE.SELECT
    
    // 添加选择效果
    node.attr('body', {
      transform: 'scale(1.05)',
      transition: `all ${config.duration}ms ${config.easing}`
    })

    // 恢复正常大小
    setTimeout(() => {
      node.attr('body', {
        transform: 'scale(1)',
        transition: `all ${config.duration}ms ${config.easing}`
      })
    }, config.duration)
  }

  /**
   * 执行节点动画 - 简化版本，使用X6的attr方法
   */
  animateNode(node, keyframes, duration, easing) {
    return new Promise((resolve) => {
      const nodeId = node.id
      
      // 取消之前的动画
      if (this.currentAnimations.has(nodeId)) {
        clearTimeout(this.currentAnimations.get(nodeId))
      }

      // 应用动画样式
      if (keyframes && keyframes.length > 0) {
        const finalFrame = keyframes[keyframes.length - 1]
        node.attr('body', {
          ...finalFrame,
          transition: `all ${duration}ms ${easing}`
        })
      }

      // 设置动画完成回调
      const timeoutId = setTimeout(() => {
        this.currentAnimations.delete(nodeId)
        resolve()
      }, duration)

      this.currentAnimations.set(nodeId, timeoutId)
    })
  }

  /**
   * 显示工具提示
   */
  showTooltip(node) {
    const nodeData = node.getData()
    if (!nodeData) return

    const tooltip = {
      content: `${nodeData.label || nodeData.type}`,
      position: 'top',
      delay: INTERACTION_CONFIG.HOVER.NODE.tooltipDelay
    }

    // 这里可以集成具体的工具提示库
    console.log('Show tooltip:', tooltip)
  }

  /**
   * 隐藏工具提示
   */
  hideTooltip(node) {
    // 隐藏工具提示
    console.log('Hide tooltip for node:', node.id)
  }

  /**
   * 高亮连接线
   */
  highlightConnections(node) {
    if (!INTERACTION_CONFIG.HOVER.NODE.highlightConnections) return

    const edges = this.graph.getConnectedEdges(node)
    edges.forEach(edge => {
      edge.attr('line', {
        stroke: '#1890ff',
        strokeWidth: 3,
        opacity: 1
      })
    })
  }

  /**
   * 取消高亮连接线
   */
  unhighlightConnections(node) {
    const edges = this.graph.getConnectedEdges(node)
    edges.forEach(edge => {
      edge.attr('line', {
        stroke: '#d9d9d9',
        strokeWidth: 2,
        opacity: 0.8
      })
    })
  }

  /**
   * 颜色工具函数
   */
  lightenColor(color, amount) {
    const hex = color.replace('#', '')
    const num = parseInt(hex, 16)
    const r = Math.min(255, (num >> 16) + Math.round(255 * amount))
    const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(255 * amount))
    const b = Math.min(255, (num & 0x0000FF) + Math.round(255 * amount))
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }

  darkenColor(color, amount) {
    const hex = color.replace('#', '')
    const num = parseInt(hex, 16)
    const r = Math.max(0, (num >> 16) - Math.round(255 * amount))
    const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(255 * amount))
    const b = Math.max(0, (num & 0x0000FF) - Math.round(255 * amount))
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }

  desaturateColor(color) {
    const hex = color.replace('#', '')
    const num = parseInt(hex, 16)
    const r = (num >> 16)
    const g = (num >> 8) & 0x00FF
    const b = num & 0x0000FF
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
    return `#${((gray << 16) | (gray << 8) | gray).toString(16).padStart(6, '0')}`
  }

  /**
   * 获取默认样式
   */
  getDefaultStyle(state) {
    return {
      fill: '#f0f0f0',
      stroke: '#d9d9d9',
      strokeWidth: 1,
      rx: 8,
      ry: 8,
      opacity: state === 'disabled' ? 0.5 : 1
    }
  }

  /**
   * 清理资源
   */
  destroy() {
    // 清理所有动画定时器
    this.currentAnimations.forEach(timeoutId => clearTimeout(timeoutId))
    this.currentAnimations.clear()
    this.styleCache.clear()
    this.animationCache.clear()
  }
}

export default EnhancedNodeStyleManager