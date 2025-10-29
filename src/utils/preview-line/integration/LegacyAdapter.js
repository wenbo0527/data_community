/**
 * 遗留系统适配器
 * 提供新旧预览线管理器之间的兼容性和迁移支持
 */

import { PreviewLineManager } from '../core/PreviewLineManager.js'
import { PreviewLineStates, PreviewLineTypes } from '../types/PreviewLineTypes.js'

/**
 * 遗留系统适配器类
 * 用于在新架构和旧的预览线管理器之间提供兼容性
 */
export class LegacyAdapter {
  constructor(legacyManager, options = {}) {
    this.legacyManager = legacyManager
    this.newManager = null
    this.migrationMode = options.migrationMode || 'gradual' // 'gradual' | 'immediate' | 'hybrid'
    // 移除降级机制，使用统一的错误处理
    this.debugMode = options.debugMode || false
    
    // 迁移状态跟踪
    this.migratedNodes = new Set()
    this.migrationErrors = new Map()
    this.performanceComparison = new Map()
    
    this.log('info', '遗留系统适配器初始化完成', { migrationMode: this.migrationMode })
  }

  /**
   * 初始化新管理器
   * @param {Object} options - 新管理器选项
   */
  initializeNewManager(options = {}) {
    try {
      // 从遗留管理器提取配置
      const legacyConfig = this.extractLegacyConfig()
      
      // 合并配置
      const mergedOptions = {
        ...options,
        graph: this.legacyManager.graph,
        branchManager: this.legacyManager.branchManager,
        layoutEngine: this.legacyManager.layoutEngine?.deref?.() || this.legacyManager.layoutEngine,
        config: {
          ...legacyConfig,
          ...options.config
        }
      }
      
      this.newManager = new PreviewLineManager(mergedOptions)
      
      // 迁移现有预览线数据
      this.migrateExistingData()
      
      this.log('info', '新管理器初始化完成')
      
    } catch (error) {
      this.log('error', '新管理器初始化失败', error)
      throw error
    }
  }

  /**
   * 创建统一预览线 - 适配方法
   * 根据迁移模式决定使用新旧管理器
   * @param {Object} node - 节点对象
   * @param {string} state - 预览线状态
   * @param {boolean} forceUpdate - 是否强制更新
   * @returns {Promise<Object>} 创建结果
   */
  async createUnifiedPreviewLine(node, state = PreviewLineStates.INTERACTIVE, forceUpdate = false) {
    const startTime = performance.now()
    
    try {
      // 决定使用哪个管理器
      const useNewManager = this.shouldUseNewManager(node)
      
      let result
      if (useNewManager && this.newManager) {
        this.log('debug', `使用新管理器创建预览线: ${node.id}`)
        result = await this.createWithNewManager(node, state, forceUpdate)
      } else {
        this.log('debug', `使用遗留管理器创建预览线: ${node.id}`)
        result = await this.createWithLegacyManager(node, state, forceUpdate)
      }
      
      // 记录性能对比
      const duration = performance.now() - startTime
      this.recordPerformanceComparison(node.id, useNewManager ? 'new' : 'legacy', duration)
      
      return result
      
    } catch (error) {
      this.log('error', `预览线创建失败: ${node.id}`, error)
      
      // 记录错误并抛出异常，不再使用降级机制
      this.migrationErrors.set(node.id, [...(this.migrationErrors.get(node.id) || []), error])
      
      throw error
    }
  }

  /**
   * 使用新管理器创建预览线
   * @param {Object} node - 节点
   * @param {string} state - 状态
   * @param {boolean} forceUpdate - 强制更新
   * @returns {Promise<Object>} 创建结果
   */
  async createWithNewManager(node, state, forceUpdate) {
    const result = await this.newManager.createUnifiedPreviewLine(node, state, forceUpdate)
    
    // 标记节点已迁移
    if (result.success) {
      this.migratedNodes.add(node.id)
    }
    
    return this.adaptNewManagerResult(result)
  }

  /**
   * 使用遗留管理器创建预览线
   * @param {Object} node - 节点
   * @param {string} state - 状态
   * @param {boolean} forceUpdate - 强制更新
   * @returns {Promise<Object>} 创建结果
   */
  async createWithLegacyManager(node, state, forceUpdate) {
    // 调用原有的创建方法
    const result = await this.legacyManager.createUnifiedPreviewLine(node, state, forceUpdate)
    
    return this.adaptLegacyManagerResult(result, node)
  }

  /**
   * 决定是否使用新管理器
   * @param {Object} node - 节点
   * @returns {boolean} 是否使用新管理器
   */
  shouldUseNewManager(node) {
    if (!this.newManager) {
      return false
    }
    
    switch (this.migrationMode) {
      case 'immediate':
        return true
        
      case 'gradual':
        // 逐步迁移：优先迁移分支节点
        return this.isHighPriorityNode(node) || this.migratedNodes.has(node.id)
        
      case 'hybrid':
        // 混合模式：根据节点类型和历史表现决定
        return this.shouldMigrateNode(node)
        
      default:
        return false
    }
  }

  /**
   * 检查是否为高优先级节点
   * @param {Object} node - 节点
   * @returns {boolean} 是否为高优先级
   */
  isHighPriorityNode(node) {
    const nodeData = node.getData ? node.getData() : node.data || {}
    const nodeType = nodeData.type || node.type
    
    // 分支节点优先迁移（因为这是主要优化目标）
    return ['audience-split', 'event-split', 'ab-test'].includes(nodeType)
  }

  /**
   * 决定是否应该迁移节点
   * @param {Object} node - 节点
   * @returns {boolean} 是否应该迁移
   */
  shouldMigrateNode(node) {
    // 检查历史错误率
    const errorHistory = this.migrationErrors.get(node.id)
    if (errorHistory && errorHistory.length > 3) {
      return false // 错误太多，暂不迁移
    }
    
    // 检查性能表现
    const perfHistory = this.performanceComparison.get(node.id)
    if (perfHistory && perfHistory.new.avgDuration < perfHistory.legacy.avgDuration) {
      return true // 新管理器性能更好
    }
    
    return this.isHighPriorityNode(node)
  }

  /**
   * 适配新管理器结果
   * @param {Object} result - 新管理器结果
   * @returns {Object} 适配后的结果
   */
  adaptNewManagerResult(result) {
    // 新管理器的结果格式已经是标准化的，直接返回
    return {
      ...result,
      source: 'new-manager',
      timestamp: Date.now()
    }
  }

  /**
   * 适配遗留管理器结果
   * @param {Object} result - 遗留管理器结果
   * @param {Object} node - 节点
   * @returns {Object} 适配后的结果
   */
  adaptLegacyManagerResult(result, node) {
    // 将遗留管理器的结果格式化为标准格式
    return {
      success: result !== null && result !== undefined,
      action: result ? 'created' : 'skipped',
      nodeId: node.id,
      source: 'legacy-manager',
      timestamp: Date.now(),
      legacyResult: result
    }
  }

  /**
   * 提取遗留配置
   * @returns {Object} 提取的配置
   */
  extractLegacyConfig() {
    const config = {}
    
    // 提取调试配置
    if (this.legacyManager.debugMode !== undefined) {
      config.debug = {
        enabled: this.legacyManager.debugMode
      }
    }
    
    // 提取布局配置
    if (this.legacyManager.layoutConfig) {
      config.layout = this.legacyManager.layoutConfig
    }
    
    // 提取性能配置
    if (this.legacyManager.performanceConfig) {
      config.performance = this.legacyManager.performanceConfig
    }
    
    return config
  }

  /**
   * 迁移现有数据
   */
  migrateExistingData() {
    if (!this.legacyManager.previewLines || !this.newManager) {
      return
    }
    
    try {
      // 迁移预览线数据
      for (const [nodeId, lines] of this.legacyManager.previewLines) {
        if (Array.isArray(lines)) {
          for (const line of lines) {
            this.migratePreviewLine(nodeId, line)
          }
        }
      }
      
      // 迁移节点状态
      if (this.legacyManager.nodeStates) {
        for (const [nodeId, state] of this.legacyManager.nodeStates) {
          this.newManager.nodeStates.set(nodeId, state)
        }
      }
      
      this.log('info', '现有数据迁移完成')
      
    } catch (error) {
      this.log('error', '数据迁移失败', error)
    }
  }

  /**
   * 迁移单个预览线
   * @param {string} nodeId - 节点ID
   * @param {Object} legacyLine - 遗留预览线
   */
  migratePreviewLine(nodeId, legacyLine) {
    try {
      // 转换为新格式
      const newLine = {
        id: legacyLine.id,
        type: legacyLine.type || PreviewLineTypes.PREVIEW,
        state: legacyLine.state || PreviewLineStates.INTERACTIVE,
        sourceNode: legacyLine.sourceNode,
        line: legacyLine.line,
        branchId: legacyLine.branchId,
        branchLabel: legacyLine.branchLabel,
        branchIndex: legacyLine.branchIndex,
        metadata: legacyLine.metadata || {},
        createdAt: legacyLine.createdAt || Date.now(),
        updatedAt: legacyLine.updatedAt || Date.now()
      }
      
      // 添加到新管理器
      this.newManager.addPreviewLineToStorage(nodeId, newLine)
      
    } catch (error) {
      this.log('error', `预览线迁移失败: ${legacyLine.id}`, error)
    }
  }

  /**
   * 记录性能对比
   * @param {string} nodeId - 节点ID
   * @param {string} managerType - 管理器类型
   * @param {number} duration - 耗时
   */
  recordPerformanceComparison(nodeId, managerType, duration) {
    if (!this.performanceComparison.has(nodeId)) {
      this.performanceComparison.set(nodeId, {
        new: { durations: [], avgDuration: 0 },
        legacy: { durations: [], avgDuration: 0 }
      })
    }
    
    const nodePerf = this.performanceComparison.get(nodeId)
    const typePerf = nodePerf[managerType === 'new' ? 'new' : 'legacy']
    
    typePerf.durations.push(duration)
    
    // 保持最近10次记录
    if (typePerf.durations.length > 10) {
      typePerf.durations.shift()
    }
    
    // 更新平均值
    typePerf.avgDuration = typePerf.durations.reduce((a, b) => a + b, 0) / typePerf.durations.length
  }

  /**
   * 获取迁移报告
   * @returns {Object} 迁移报告
   */
  getMigrationReport() {
    const report = {
      migrationMode: this.migrationMode,
      migratedNodesCount: this.migratedNodes.size,
      migratedNodes: Array.from(this.migratedNodes),
      errorCount: this.migrationErrors.size,
      performanceComparison: {}
    }
    
    // 性能对比统计
    let newManagerFaster = 0
    let legacyManagerFaster = 0
    
    for (const [nodeId, perf] of this.performanceComparison) {
      if (perf.new.avgDuration > 0 && perf.legacy.avgDuration > 0) {
        if (perf.new.avgDuration < perf.legacy.avgDuration) {
          newManagerFaster++
        } else {
          legacyManagerFaster++
        }
      }
    }
    
    report.performanceComparison = {
      newManagerFaster,
      legacyManagerFaster,
      totalComparisons: newManagerFaster + legacyManagerFaster
    }
    
    return report
  }

  /**
   * 强制迁移节点
   * @param {string} nodeId - 节点ID
   */
  forceMigrateNode(nodeId) {
    this.migratedNodes.add(nodeId)
    this.log('info', `强制迁移节点: ${nodeId}`)
  }

  /**
   * 回滚节点迁移
   * @param {string} nodeId - 节点ID
   */
  rollbackNodeMigration(nodeId) {
    this.migratedNodes.delete(nodeId)
    this.log('info', `回滚节点迁移: ${nodeId}`)
  }

  /**
   * 日志记录
   * @param {string} level - 日志级别
   * @param {string} message - 消息
   * @param {*} data - 附加数据
   */
  log(level, message, data = null) {
    if (!this.debugMode && level === 'debug') {
      return
    }

    const logMessage = `[LegacyAdapter] ${message}`
    
    switch (level) {
      case 'debug':
        console.debug(logMessage, data)
        break
      case 'info':
        console.info(logMessage, data)
        break
      case 'warn':
        console.warn(logMessage, data)
        break
      case 'error':
        console.error(logMessage, data)
        break
    }
  }

  /**
   * 销毁适配器
   */
  destroy() {
    if (this.newManager) {
      this.newManager.destroy()
    }
    
    this.migratedNodes.clear()
    this.migrationErrors.clear()
    this.performanceComparison.clear()
    
    this.log('info', '遗留系统适配器已销毁')
  }
}

/**
 * 创建适配器实例
 * @param {Object} legacyManager - 遗留管理器
 * @param {Object} options - 选项
 * @returns {LegacyAdapter} 适配器实例
 */
export function createLegacyAdapter(legacyManager, options = {}) {
  return new LegacyAdapter(legacyManager, options)
}

/**
 * 自动迁移工具
 * 提供自动化的迁移流程
 */
export class AutoMigrationTool {
  constructor(adapter) {
    this.adapter = adapter
    this.migrationPlan = []
    this.migrationProgress = {
      total: 0,
      completed: 0,
      failed: 0
    }
  }

  /**
   * 创建迁移计划
   * @param {Array} nodes - 要迁移的节点列表
   * @returns {Array} 迁移计划
   */
  createMigrationPlan(nodes) {
    // 按优先级排序节点
    const sortedNodes = nodes.sort((a, b) => {
      const aPriority = this.adapter.isHighPriorityNode(a) ? 1 : 0
      const bPriority = this.adapter.isHighPriorityNode(b) ? 1 : 0
      return bPriority - aPriority
    })
    
    this.migrationPlan = sortedNodes.map((node, index) => ({
      nodeId: node.id,
      node,
      priority: this.adapter.isHighPriorityNode(node) ? 'high' : 'normal',
      order: index,
      status: 'pending'
    }))
    
    this.migrationProgress.total = this.migrationPlan.length
    
    return this.migrationPlan
  }

  /**
   * 执行迁移计划
   * @param {Object} options - 执行选项
   * @returns {Promise<Object>} 执行结果
   */
  async executeMigrationPlan(options = {}) {
    const { batchSize = 5, delayBetweenBatches = 100 } = options
    const results = []
    
    for (let i = 0; i < this.migrationPlan.length; i += batchSize) {
      const batch = this.migrationPlan.slice(i, i + batchSize)
      
      const batchResults = await Promise.allSettled(
        batch.map(item => this.migrateNode(item))
      )
      
      results.push(...batchResults)
      
      // 批次间延迟
      if (i + batchSize < this.migrationPlan.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
      }
    }
    
    return {
      total: this.migrationProgress.total,
      completed: this.migrationProgress.completed,
      failed: this.migrationProgress.failed,
      results
    }
  }

  /**
   * 迁移单个节点
   * @param {Object} migrationItem - 迁移项
   * @returns {Promise<Object>} 迁移结果
   */
  async migrateNode(migrationItem) {
    try {
      migrationItem.status = 'migrating'
      
      // 强制使用新管理器
      this.adapter.forceMigrateNode(migrationItem.nodeId)
      
      // 测试创建预览线
      const result = await this.adapter.createUnifiedPreviewLine(
        migrationItem.node,
        'interactive',
        true
      )
      
      if (result.success) {
        migrationItem.status = 'completed'
        this.migrationProgress.completed++
      } else {
        throw new Error(result.error || '迁移失败')
      }
      
      return { success: true, nodeId: migrationItem.nodeId, result }
      
    } catch (error) {
      migrationItem.status = 'failed'
      migrationItem.error = error.message
      this.migrationProgress.failed++
      
      // 回滚迁移
      this.adapter.rollbackNodeMigration(migrationItem.nodeId)
      
      return { success: false, nodeId: migrationItem.nodeId, error: error.message }
    }
  }

  /**
   * 获取迁移进度
   * @returns {Object} 迁移进度
   */
  getMigrationProgress() {
    return {
      ...this.migrationProgress,
      percentage: this.migrationProgress.total > 0 
        ? (this.migrationProgress.completed / this.migrationProgress.total) * 100 
        : 0
    }
  }
}