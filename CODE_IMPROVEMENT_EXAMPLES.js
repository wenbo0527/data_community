/**
 * 代码质量改进示例
 * 展示如何在现有的 UnifiedPreviewLineManager 中集成新的工具类
 */

// 改进前的代码示例
class OldUnifiedPreviewLineManager {
  shouldCreatePreviewLine(node, excludeEdgeId = null) {
    // 原始代码 - 缺乏充分的边界检查
    if (!node) return false
    
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    // 跳过拖拽提示点
    if (nodeData.isDragHint || nodeData.type === 'drag-hint' || nodeType === 'drag-hint') {
      return false
    }
    
    // ... 其他逻辑
  }
}

// 改进后的代码示例
import { ValidationUtils, performanceMonitor, errorHandler } from './commonUtils.js'

class ImprovedUnifiedPreviewLineManager {
  constructor(graph, branchManager, layoutConfig) {
    this.graph = graph
    this.branchManager = branchManager
    this.layoutConfig = layoutConfig
    
    // 使用新的工具类
    this.validator = ValidationUtils
    this.performance = performanceMonitor
    this.errorHandler = errorHandler
    
    // 包装关键方法以自动处理错误和性能监控
    this.shouldCreatePreviewLine = this.errorHandler.wrapFunction(
      this.shouldCreatePreviewLine.bind(this),
      'shouldCreatePreviewLine'
    )
    
    this.createUnifiedPreviewLine = this.performance.measureAsync(
      'createUnifiedPreviewLine',
      this.createUnifiedPreviewLine.bind(this)
    )
  }

  /**
   * 改进的预览线创建判断方法
   * @param {Object} node - 要检查的节点
   * @param {string} excludeEdgeId - 要排除的边ID
   * @returns {boolean} 是否应该创建预览线
   */
  shouldCreatePreviewLine(node, excludeEdgeId = null) {
    // 使用新的验证工具进行边界检查
    if (!this.validator.isValidNode(node)) {
      console.warn('⚠️ [统一预览线管理器] 无效节点，跳过预览线创建')
      return false
    }
    
    // 安全地获取节点数据
    const nodeData = this.validator.safeGet(node, 'getData', () => ({}))()
    const nodeType = this.validator.safeGet(nodeData, 'type') || 
                    this.validator.safeGet(nodeData, 'nodeType')
    
    // 跳过拖拽提示点
    if (nodeData.isDragHint || nodeData.type === 'drag-hint' || nodeType === 'drag-hint') {
      return false
    }
    
    // 跳过结束节点
    if (nodeType === 'end' || nodeType === 'finish') {
      return false
    }
    
    // 跳过预览线相关的节点
    if (nodeData.isUnifiedPreview || nodeData.isPreview) {
      return false
    }
    
    // 检查是否已有连接
    if (this.hasExistingConnections(node, excludeEdgeId)) {
      return false
    }
    
    // 对于非开始节点，检查配置状态
    if (nodeType !== 'start') {
      const isConfigured = this.validator.safeGet(nodeData, 'isConfigured', false) || 
                          this.validator.safeGet(nodeData, 'config', false)
      if (!isConfigured) {
        console.log('⏭️ [统一预览线管理器] 跳过未配置节点的预览线创建:', {
          nodeId: node.id,
          nodeType: nodeType,
          isConfigured: isConfigured
        })
        return false
      }
    }
    
    return true
  }

  /**
   * 改进的预览线创建方法
   * @param {Object} sourceNode - 源节点
   * @param {Object} options - 配置选项
   * @returns {Promise<Object>} 预览线对象
   */
  async createUnifiedPreviewLine(sourceNode, options = {}) {
    // 验证输入参数
    if (!this.validator.isValidNode(sourceNode)) {
      throw new Error('无效的源节点')
    }

    // 验证配置选项
    const validatedOptions = {
      branchId: this.validator.safeGet(options, 'branchId', 'default'),
      persistent: this.validator.safeGet(options, 'persistent', false),
      onCreated: this.validator.safeGet(options, 'onCreated', () => {}),
      ...options
    }

    try {
      // 使用重试机制创建预览线
      const previewLine = await this.validator.retry(async () => {
        return this._doCreatePreviewLine(sourceNode, validatedOptions)
      }, 3, 500)

      // 触发创建完成回调
      if (typeof validatedOptions.onCreated === 'function') {
        validatedOptions.onCreated(previewLine)
      }

      return previewLine
    } catch (error) {
      this.errorHandler.handleError(error, 'createUnifiedPreviewLine', {
        sourceNodeId: sourceNode.id,
        options: validatedOptions
      })
      throw error
    }
  }

  /**
   * 改进的边有效性检查
   * @param {Object} node - 节点
   * @param {string} excludeEdgeId - 要排除的边ID
   * @returns {boolean} 是否已有连接
   */
  hasExistingConnections(node, excludeEdgeId = null) {
    if (!this.validator.isValidNode(node)) {
      return false
    }

    try {
      const outgoingEdges = this.graph.getOutgoingEdges(node) || []
      return outgoingEdges.some(edge => {
        // 使用新的边验证工具
        if (!this.validator.isValidEdge(edge, this.graph)) {
          return false
        }

        const edgeData = this.validator.safeGet(edge, 'getData', () => ({}))()
        return !edgeData.isUnifiedPreview && 
               !edgeData.isPreview &&
               edgeData.type !== 'unified-preview-line' &&
               (excludeEdgeId ? edge.id !== excludeEdgeId : true)
      })
    } catch (error) {
      this.errorHandler.handleError(error, 'hasExistingConnections', {
        nodeId: node.id,
        excludeEdgeId
      })
      return false
    }
  }

  /**
   * 改进的节点配置验证
   * @param {Object} config - 节点配置
   * @param {string} nodeType - 节点类型
   * @returns {Object} 验证结果
   */
  validateNodeConfiguration(config, nodeType) {
    const validation = this.validator.validateNodeConfig(config, nodeType)
    
    if (!validation.isValid) {
      console.warn('⚠️ [统一预览线管理器] 节点配置验证失败:', {
        nodeType,
        errors: validation.errors
      })
    }
    
    return validation
  }

  /**
   * 改进的缓存管理
   * @param {string} key - 缓存键
   * @param {*} value - 缓存值
   * @param {number} ttl - 生存时间（毫秒）
   */
  setCache(key, value, ttl = this.cacheTimeout) {
    if (this.validator.isEmpty(key)) {
      console.warn('⚠️ [统一预览线管理器] 缓存键不能为空')
      return
    }

    this.branchInfoCache.set(key, {
      value: this.validator.deepClone(value),
      expiry: Date.now() + ttl,
      timestamp: Date.now()
    })
  }

  /**
   * 改进的缓存获取
   * @param {string} key - 缓存键
   * @returns {*} 缓存值或null
   */
  getCache(key) {
    if (this.validator.isEmpty(key)) {
      return null
    }

    const item = this.branchInfoCache.get(key)
    if (!item) {
      return null
    }

    if (Date.now() > item.expiry) {
      this.branchInfoCache.delete(key)
      return null
    }

    return this.validator.deepClone(item.value)
  }

  /**
   * 改进的性能统计
   * @returns {Object} 性能统计信息
   */
  getPerformanceStats() {
    return {
      cacheStats: {
        size: this.branchInfoCache.size,
        hitRate: this.calculateCacheHitRate()
      },
      performanceMetrics: this.performance.getStats(),
      errorStats: {
        recentErrors: this.errorHandler.getErrorHistory(10),
        errorCount: this.errorHandler.getErrorHistory().length
      }
    }
  }

  /**
   * 计算缓存命中率
   * @returns {number} 命中率百分比
   */
  calculateCacheHitRate() {
    // 这里可以实现更复杂的缓存命中率计算逻辑
    return 0.85 // 示例值
  }

  /**
   * 改进的清理方法
   */
  cleanup() {
    try {
      // 清理缓存
      this.branchInfoCache.clear()
      this.positionCache.clear()
      
      // 清理事件监听器
      this.eventListeners.clear()
      
      // 清理定时器
      if (this.cacheCleanupInterval) {
        clearInterval(this.cacheCleanupInterval)
      }
      
      // 清理性能监控和错误历史
      this.performance.clearHistory()
      this.errorHandler.clearErrorHistory()
      
      console.log('🧹 [统一预览线管理器] 清理完成')
    } catch (error) {
      this.errorHandler.handleError(error, 'cleanup')
    }
  }

  /**
   * 内部预览线创建方法
   * @private
   */
  async _doCreatePreviewLine(sourceNode, options) {
    // 实际的预览线创建逻辑
    // 这里只是示例，实际实现会更复杂
    return {
      id: this.validator.generateId('preview_line'),
      sourceNode: sourceNode.id,
      options,
      createdAt: new Date().toISOString()
    }
  }
}

// 使用示例
export function createImprovedPreviewLineManager(graph, branchManager, layoutConfig) {
  return new ImprovedUnifiedPreviewLineManager(graph, branchManager, layoutConfig)
}

// 迁移指南
export const MigrationGuide = {
  /**
   * 从旧版本迁移到新版本的步骤
   */
  steps: [
    '1. 导入新的工具类: import { ValidationUtils, performanceMonitor, errorHandler } from "./commonUtils.js"',
    '2. 在构造函数中初始化工具类实例',
    '3. 使用 ValidationUtils.isValidNode() 替换简单的 node 检查',
    '4. 使用 ValidationUtils.safeGet() 替换直接属性访问',
    '5. 使用 errorHandler.wrapFunction() 包装关键方法',
    '6. 使用 performanceMonitor.measureAsync() 监控异步方法性能',
    '7. 添加适当的错误处理和重试机制',
    '8. 实现统一的缓存管理策略'
  ],

  /**
   * 常见问题和解决方案
   */
  commonIssues: {
    'TypeError: Cannot read properties of undefined': {
      solution: '使用 ValidationUtils.safeGet() 安全地访问嵌套属性',
      example: 'const nodeType = ValidationUtils.safeGet(nodeData, "type", "unknown")'
    },
    '性能问题': {
      solution: '使用 performanceMonitor 监控关键方法，使用防抖和节流优化频繁调用',
      example: 'this.debouncedUpdate = ValidationUtils.debounce(this.update.bind(this), 100)'
    },
    '错误处理不统一': {
      solution: '使用 errorHandler.wrapFunction() 统一包装方法',
      example: 'this.method = errorHandler.wrapFunction(this.method.bind(this), "methodName")'
    }
  }
}

export default {
  ImprovedUnifiedPreviewLineManager,
  createImprovedPreviewLineManager,
  MigrationGuide
}