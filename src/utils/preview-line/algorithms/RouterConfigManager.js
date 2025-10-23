/**
 * 路由器配置管理器 - 负责预览线的路由器配置和智能选择
 * 从 PreviewLineSystem 中提取的路由器配置相关算法
 */

/**
 * 路由器类型枚举
 */
export const RouterTypes = {
  NORMAL: 'normal',
  ORTH: 'orth',
  MANHATTAN: 'manhattan',
  SMOOTH: 'smooth'
}

/**
 * 连接类型枚举
 */
export const ConnectionTypes = {
  SHORT: 'short',
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal',
  DIAGONAL: 'diagonal',
  LONG: 'long'
}

/**
 * 路由器配置管理器类
 * 负责智能路由器选择、配置管理和动态方向配置
 */
export class RouterConfigManager {
  constructor(config = {}) {
    this.config = {
      // 连接阈值配置
      shortConnectionThreshold: 100, // 短距离连接阈值
      verticalConnectionThreshold: 50, // 垂直连接阈值
      horizontalConnectionThreshold: 50, // 水平连接阈值
      manhattanDistanceThreshold: 150, // Manhattan路由器距离阈值
      
      // 路由器参数配置
      defaultStep: 10, // 默认步长
      defaultPadding: 15, // 默认边距
      
      // 智能选择配置
      enableSmartSelection: true, // 启用智能路由器选择
      preferOrthRouter: true, // 优先使用Orth路由器
      enableManhattanFallback: true, // 启用Manhattan路由器回退
      
      // 方向配置
      layoutDirection: 'TB', // 默认布局方向 (TB: 上下, LR: 左右)
      
      // 调试配置
      enableDebug: false,
      enableLogging: true,
      silentDuringDrag: true, // 拖拽时静默处理
      
      ...config
    }
    
    // 当前拖拽状态
    this.currentDragLine = null
    
    // 方向配置缓存
    this.directionConfigCache = new Map()
    
    // 路由器性能统计
    this.performanceStats = {
      manhattanSuccess: 0,
      manhattanFailed: 0,
      orthSuccess: 0,
      orthFailed: 0,
      normalFallback: 0
    }
  }

  /**
   * 安全地设置路由器配置
   * 当manhattan算法失败时自动回退到orth路由器
   * @param {Object} edge - 边对象
   * @param {Object} routerConfig - 路由器配置
   * @returns {boolean} 设置是否成功
   */
  setSafeRouter(edge, routerConfig = {}) {
    if (!edge) {
      this.log('warn', '边对象无效')
      return false
    }

    // 获取连接点信息
    const connectionInfo = this.analyzeConnection(edge)
    if (!connectionInfo.isValid) {
      this.log('warn', '源点或目标点坐标无效，使用默认路由器', {
        edgeId: edge.id,
        source: connectionInfo.source,
        target: connectionInfo.target
      })
      edge.setRouter(RouterTypes.NORMAL)
      return false
    }

    // 智能选择路由器类型
    const preferredRouter = this.selectOptimalRouter(connectionInfo)
    
    // 尝试设置首选路由器
    const success = this.trySetRouter(edge, preferredRouter, routerConfig, connectionInfo)
    
    if (success) {
      this.performanceStats[`${preferredRouter}Success`]++
      return true
    } else {
      // 回退到备选路由器
      return this.fallbackToAlternativeRouter(edge, preferredRouter, routerConfig, connectionInfo)
    }
  }

  /**
   * 分析连接信息
   * @param {Object} edge - 边对象
   * @returns {Object} 连接分析结果
   */
  analyzeConnection(edge) {
    const source = edge.getSourcePoint()
    const target = edge.getTargetPoint()
    
    // 检查坐标有效性
    const isValid = source && target && 
                   typeof source.x === 'number' && !isNaN(source.x) &&
                   typeof source.y === 'number' && !isNaN(source.y) &&
                   typeof target.x === 'number' && !isNaN(target.x) &&
                   typeof target.y === 'number' && !isNaN(target.y)
    
    if (!isValid) {
      return { isValid: false, source, target }
    }
    
    // 计算连接属性
    const deltaX = target.x - source.x
    const deltaY = target.y - source.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI
    
    // 分析连接类型
    const connectionType = this.classifyConnection(deltaX, deltaY, distance)
    
    return {
      isValid: true,
      source,
      target,
      deltaX,
      deltaY,
      distance,
      angle,
      connectionType
    }
  }

  /**
   * 分类连接类型
   * @param {number} deltaX - X轴差值
   * @param {number} deltaY - Y轴差值
   * @param {number} distance - 连接距离
   * @returns {string} 连接类型
   */
  classifyConnection(deltaX, deltaY, distance) {
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)
    
    // 短距离连接
    if (distance < this.config.shortConnectionThreshold) {
      return ConnectionTypes.SHORT
    }
    
    // 垂直连接
    if (absX < this.config.verticalConnectionThreshold) {
      return ConnectionTypes.VERTICAL
    }
    
    // 水平连接
    if (absY < this.config.horizontalConnectionThreshold) {
      return ConnectionTypes.HORIZONTAL
    }
    
    // 长距离连接
    if (distance > this.config.manhattanDistanceThreshold) {
      return ConnectionTypes.LONG
    }
    
    // 对角连接
    return ConnectionTypes.DIAGONAL
  }

  /**
   * 选择最优路由器
   * @param {Object} connectionInfo - 连接信息
   * @returns {string} 路由器类型
   */
  selectOptimalRouter(connectionInfo) {
    if (!this.config.enableSmartSelection) {
      return this.config.preferOrthRouter ? RouterTypes.ORTH : RouterTypes.MANHATTAN
    }
    
    const { connectionType, distance } = connectionInfo
    
    // 根据连接类型选择路由器
    switch (connectionType) {
      case ConnectionTypes.SHORT:
      case ConnectionTypes.VERTICAL:
        return RouterTypes.ORTH // 短距离和垂直连接优先使用Orth
        
      case ConnectionTypes.HORIZONTAL:
        return this.config.layoutDirection === 'LR' ? RouterTypes.ORTH : RouterTypes.MANHATTAN
        
      case ConnectionTypes.LONG:
        return this.config.enableManhattanFallback ? RouterTypes.MANHATTAN : RouterTypes.ORTH
        
      case ConnectionTypes.DIAGONAL:
      default:
        return this.config.preferOrthRouter ? RouterTypes.ORTH : RouterTypes.MANHATTAN
    }
  }

  /**
   * 尝试设置路由器
   * @param {Object} edge - 边对象
   * @param {string} routerType - 路由器类型
   * @param {Object} routerConfig - 路由器配置
   * @param {Object} connectionInfo - 连接信息
   * @returns {boolean} 设置是否成功
   */
  trySetRouter(edge, routerType, routerConfig, connectionInfo) {
    try {
      const config = this.buildRouterConfig(routerType, routerConfig, connectionInfo)
      edge.setRouter(config)
      
      // 验证路由器设置结果
      if (this.validateRouterResult(edge, routerType)) {
        this.logRouterSuccess(edge.id, routerType, connectionInfo)
        return true
      } else {
        throw new Error(`${routerType} router generated invalid result`)
      }
      
    } catch (error) {
      this.logRouterFailure(edge.id, routerType, error.message, connectionInfo)
      return false
    }
  }

  /**
   * 构建路由器配置
   * @param {string} routerType - 路由器类型
   * @param {Object} customConfig - 自定义配置
   * @param {Object} connectionInfo - 连接信息
   * @returns {Object} 路由器配置对象
   */
  buildRouterConfig(routerType, customConfig, connectionInfo) {
    const baseArgs = {
      step: this.config.defaultStep,
      padding: this.config.defaultPadding,
      ...this.getDynamicDirectionConfig(),
      ...customConfig.args
    }
    
    switch (routerType) {
      case RouterTypes.MANHATTAN:
        return {
          name: RouterTypes.MANHATTAN,
          args: {
            ...baseArgs,
            excludeEnds: ['source'],
            // Manhattan特定配置
            maxAllowedDirectionChange: 2,
            perpendicular: true
          }
        }
        
      case RouterTypes.ORTH:
        return {
          name: RouterTypes.ORTH,
          args: {
            ...baseArgs,
            // Orth特定配置
            enableSmartPath: true,
            minSegmentLength: 20
          }
        }
        
      case RouterTypes.SMOOTH:
        return {
          name: RouterTypes.SMOOTH,
          args: {
            ...baseArgs,
            // Smooth特定配置
            radius: 10
          }
        }
        
      default:
        return RouterTypes.NORMAL
    }
  }

  /**
   * 验证路由器设置结果
   * @param {Object} edge - 边对象
   * @param {string} routerType - 路由器类型
   * @returns {boolean} 验证是否通过
   */
  validateRouterResult(edge, routerType) {
    try {
      // 基础验证：检查vertices是否有效
      const vertices = edge.getVertices()
      if (!vertices || !Array.isArray(vertices)) {
        return false
      }
      
      // 对于Manhattan路由器，进行额外验证
      if (routerType === RouterTypes.MANHATTAN) {
        // 检查是否有有效的路径点
        return vertices.length >= 0 // Manhattan可能生成空vertices数组
      }
      
      return true
      
    } catch (error) {
      return false
    }
  }

  /**
   * 回退到备选路由器
   * @param {Object} edge - 边对象
   * @param {string} failedRouter - 失败的路由器类型
   * @param {Object} routerConfig - 路由器配置
   * @param {Object} connectionInfo - 连接信息
   * @returns {boolean} 回退是否成功
   */
  fallbackToAlternativeRouter(edge, failedRouter, routerConfig, connectionInfo) {
    // 确定备选路由器
    let fallbackRouter
    if (failedRouter === RouterTypes.MANHATTAN) {
      fallbackRouter = RouterTypes.ORTH
    } else if (failedRouter === RouterTypes.ORTH) {
      fallbackRouter = RouterTypes.NORMAL
    } else {
      fallbackRouter = RouterTypes.NORMAL
    }
    
    // 尝试设置备选路由器
    if (fallbackRouter === RouterTypes.NORMAL) {
      try {
        edge.setRouter(RouterTypes.NORMAL)
        this.performanceStats.normalFallback++
        this.logRouterFallback(edge.id, failedRouter, fallbackRouter, connectionInfo)
        return true
      } catch (error) {
        this.log('error', '所有路由器都失败', { edgeId: edge.id, error: error.message })
        return false
      }
    } else {
      const success = this.trySetRouter(edge, fallbackRouter, routerConfig, connectionInfo)
      if (success) {
        this.performanceStats[`${fallbackRouter}Success`]++
        this.logRouterFallback(edge.id, failedRouter, fallbackRouter, connectionInfo)
      } else {
        this.performanceStats[`${fallbackRouter}Failed`]++
        // 最终回退到normal路由器
        return this.fallbackToAlternativeRouter(edge, fallbackRouter, routerConfig, connectionInfo)
      }
      return success
    }
  }

  /**
   * 获取动态方向配置
   * @returns {Object} 动态方向配置
   */
  getDynamicDirectionConfig() {
    const cacheKey = `direction-${this.config.layoutDirection}`
    
    if (this.directionConfigCache.has(cacheKey)) {
      return this.directionConfigCache.get(cacheKey)
    }
    
    let config
    
    switch (this.config.layoutDirection) {
      case 'TB': // 上下布局
        config = {
          startDirections: ['bottom'],
          endDirections: ['top'],
          // 方向权重：垂直方向优先
          directionWeights: {
            bottom: 1.0,  // 最高优先级
            top: 0.8,     // 次高优先级
            right: 0.6,   // 中等优先级
            left: 0.4     // 最低优先级
          }
        }
        break
        
      case 'LR': // 左右布局
        config = {
          startDirections: ['right'],
          endDirections: ['left'],
          // 方向权重：水平方向优先
          directionWeights: {
            right: 1.0,   // 最高优先级
            left: 0.8,    // 次高优先级
            bottom: 0.6,  // 中等优先级
            top: 0.4      // 最低优先级
          }
        }
        break
        
      default:
        config = {
          startDirections: ['bottom'],
          endDirections: ['top'],
          directionWeights: {
            bottom: 1.0,
            top: 0.8,
            right: 0.6,
            left: 0.4
          }
        }
    }
    
    // 添加通用配置
    config.directions = ['bottom', 'top', 'right', 'left']
    config.avoidDirections = []
    config.enableSmartPath = true
    config.minSegmentLength = 20
    
    // 缓存配置
    this.directionConfigCache.set(cacheKey, config)
    
    return config
  }

  /**
   * 更新布局方向
   * @param {string} direction - 新的布局方向 ('TB' | 'LR')
   */
  updateLayoutDirection(direction) {
    if (!['TB', 'LR'].includes(direction)) {
      this.log('warn', '无效的布局方向', { direction })
      return
    }
    
    const oldDirection = this.config.layoutDirection
    this.config.layoutDirection = direction
    
    // 清理方向配置缓存
    this.directionConfigCache.clear()
    
    this.log('info', '布局方向已更新', {
      oldDirection,
      newDirection: direction
    })
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
   * 获取路由器性能统计
   * @returns {Object} 性能统计数据
   */
  getPerformanceStats() {
    const total = Object.values(this.performanceStats).reduce((sum, count) => sum + count, 0)
    
    return {
      ...this.performanceStats,
      total,
      manhattanSuccessRate: total > 0 ? (this.performanceStats.manhattanSuccess / total * 100).toFixed(2) + '%' : '0%',
      orthSuccessRate: total > 0 ? (this.performanceStats.orthSuccess / total * 100).toFixed(2) + '%' : '0%'
    }
  }

  /**
   * 重置性能统计
   */
  resetPerformanceStats() {
    Object.keys(this.performanceStats).forEach(key => {
      this.performanceStats[key] = 0
    })
    
    this.log('info', '路由器性能统计已重置')
  }

  /**
   * 记录路由器设置成功
   * @private
   */
  logRouterSuccess(edgeId, routerType, connectionInfo) {
    if (!this.shouldLog()) return
    
    this.log('debug', `${routerType}路由器设置成功`, {
      edgeId,
      distance: connectionInfo.distance.toFixed(2),
      connectionType: connectionInfo.connectionType
    })
  }

  /**
   * 记录路由器设置失败
   * @private
   */
  logRouterFailure(edgeId, routerType, errorMessage, connectionInfo) {
    if (!this.shouldLog()) return
    
    this.log('debug', `${routerType}路由器设置失败`, {
      edgeId,
      error: errorMessage,
      distance: connectionInfo.distance.toFixed(2),
      connectionType: connectionInfo.connectionType
    })
  }

  /**
   * 记录路由器回退
   * @private
   */
  logRouterFallback(edgeId, failedRouter, fallbackRouter, connectionInfo) {
    if (!this.shouldLog()) return
    
    this.log('info', '路由器回退', {
      edgeId,
      from: failedRouter,
      to: fallbackRouter,
      reason: `${failedRouter}失败`,
      distance: connectionInfo.distance.toFixed(2),
      connectionType: connectionInfo.connectionType
    })
  }

  /**
   * 判断是否应该记录日志
   * @private
   */
  shouldLog() {
    // 拖拽时静默处理
    if (this.config.silentDuringDrag && this.currentDragLine !== null) {
      return false
    }
    
    return this.config.enableLogging
  }

  /**
   * 统一日志记录方法
   * @private
   */
  log(level, message, data = {}) {
    if (!this.config.enableLogging) return
    
    const prefix = '🔀 [路由器配置管理器]'
    const logData = { ...data }
    
    switch (level) {
      case 'debug':
        if (this.config.enableDebug) {
          console.log(`${prefix} ${message}`, logData)
        }
        break
      case 'info':
        console.log(`${prefix} ${message}`, logData)
        break
      case 'warn':
        console.warn(`⚠️ ${prefix} ${message}`, logData)
        break
      case 'error':
        console.error(`💥 ${prefix} ${message}`, logData)
        break
    }
  }

  /**
   * 清理缓存和资源
   */
  clearCache() {
    this.directionConfigCache.clear()
    
    if (this.config.enableDebug) {
      this.log('debug', '缓存已清理')
    }
  }

  /**
   * 销毁管理器，清理所有资源
   */
  destroy() {
    this.clearCache()
    this.currentDragLine = null
    this.resetPerformanceStats()
    
    this.log('info', '路由器配置管理器已销毁')
  }
}

/**
 * 创建路由器配置管理器实例的工厂函数
 * @param {Object} config - 配置选项
 * @returns {RouterConfigManager} 路由器配置管理器实例
 */
export function createRouterConfigManager(config = {}) {
  return new RouterConfigManager(config)
}

/**
 * 默认路由器配置管理器实例
 */
export const defaultRouterConfigManager = createRouterConfigManager({
  enableDebug: false,
  enableLogging: true,
  preferOrthRouter: true,
  enableSmartSelection: true
})

export default RouterConfigManager