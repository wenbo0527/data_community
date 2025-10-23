/**
 * 新架构的预览线管理器主入口
 * 整合各个模块，提供统一的API接口
 */

import { PreviewLineValidator } from './PreviewLineValidator.js'
import { PreviewLineConfigManager, defaultConfigManager } from '../config/PreviewLineConfig.js'
import { PreviewLineStates, PreviewLineTypes, CreationRequirementTypes } from '../types/PreviewLineTypes.js'

/**
 * 预览线管理器主类
 * 作为新架构的统一入口，协调各个模块的工作
 * 支持 Builder 模式构建
 */
export class PreviewLineManager {
  constructor(options = {}) {
    // 参数验证和规范化
    this._validateAndNormalizeOptions(options)
    
    // 配置管理
    this.configManager = this._initializeConfigManager(options)
    
    // 核心属性
    this.graph = options.graph
    this.branchManager = options.branchManager
    this.layoutEngine = options.layoutEngine ? new WeakRef(options.layoutEngine) : null
    this.renderer = options.renderer // 渲染器实例
    
    // 验证器 - 传递布局引擎引用
    const layoutEngineRef = this.layoutEngine ? this.layoutEngine.deref() : null
    this.validator = new PreviewLineValidator(
      this.configManager, 
      options.graph, 
      layoutEngineRef,
      options.validatorOptions || {}
    )
    
    // 确保验证器有图实例的引用
    if (this.graph && this.validator) {
      this.validator.setGraph(this.graph)
    }
    
    // 预览线存储
    this.previewLines = new Map() // nodeId -> [previewLine, ...]
    this.previewLineInstances = new Map() // lineId -> previewLineInstance
    
    // 状态管理
    this.nodeStates = new Map() // nodeId -> state
    this.isDragging = false
    this.currentDragLine = null
    
    // 状态管理
    this.isRemoving = false
    
    // 性能优化
    this._initializePerformanceOptions(options)
    
    // 事件监听器
    this.eventListeners = new Map()
    
    // 调试模式
    this.debugMode = this.configManager.get('debug.enabled', false)
    
    // 初始化选项
    this.initOptions = {
      autoInitialize: true,
      createForExistingNodes: false,
      validateOnInit: true,
      ...options.initOptions
    }
    
    // 条件初始化
    if (this.initOptions.autoInitialize) {
      this.initialize()
    }
  }

  /**
   * 验证和规范化构造函数选项
   * @param {Object} options - 构造函数选项
   * @private
   */
  _validateAndNormalizeOptions(options) {
    // 必需参数验证
    if (!options.graph) {
      throw new Error('PreviewLineManager 需要 graph 参数')
    }

    // 类型验证
    if (options.configManager && !(options.configManager instanceof PreviewLineConfigManager)) {
      console.warn('configManager 应该是 PreviewLineConfigManager 的实例')
    }

    // 设置默认值
    options.config = options.config || {}
    options.validatorOptions = options.validatorOptions || {}
    options.initOptions = options.initOptions || {}
  }

  /**
   * 初始化配置管理器
   * @param {Object} options - 构造函数选项
   * @returns {PreviewLineConfigManager} 配置管理器实例
   * @private
   */
  _initializeConfigManager(options) {
    if (options.configManager) {
      return options.configManager
    }

    // 合并默认配置和用户配置
    const mergedConfig = {
      ...options.config,
      // 确保调试配置正确合并
      debug: {
        enabled: false,
        logLevel: 'info',
        enableDetailedLogs: false,
        ...options.config.debug
      },
      // 确保性能配置正确合并
      performance: {
        enablePerformanceMonitor: false,
        cacheEnabled: true,
        maxCacheSize: 1000,
        ...options.config.performance
      }
    }

    return new PreviewLineConfigManager(mergedConfig)
  }

  /**
   * 初始化性能选项
   * @param {Object} options - 构造函数选项
   * @private
   */
  _initializePerformanceOptions(options) {
    const performanceConfig = this.configManager.get('performance', {})
    
    // 缓存配置
    if (performanceConfig.cacheEnabled !== false) {
      this.cache = new Map()
      this.maxCacheSize = performanceConfig.maxCacheSize || 1000
    } else {
      this.cache = null
    }
    
    // 待处理操作队列
    this.pendingOperations = new Map()
    
    // 性能指标
    if (performanceConfig.enablePerformanceMonitor) {
      this.performanceMetrics = new Map()
    }
  }

  /**
   * 初始化管理器
   */
  initialize() {
    // 🔧 修复：在日志中显示 graph 实例信息而不是 null
    const graphInfo = this.graph ? {
      hasGraph: true,
      nodeCount: this.graph.getNodes ? this.graph.getNodes().length : 'unknown',
      edgeCount: this.graph.getEdges ? this.graph.getEdges().length : 'unknown'
    } : null
    
    this.log('info', '预览线管理器初始化开始', graphInfo)
    
    // 监听配置变更
    this.configManager.onChange('*', (newValue, oldValue, path) => {
      this.handleConfigChange(path, newValue, oldValue)
    })
    
    // 设置性能监控
    if (this.configManager.get('performance.enablePerformanceMonitor')) {
      this.setupPerformanceMonitoring()
    }
    
    this.log('info', '预览线管理器初始化完成', graphInfo)
  }

  /**
   * 创建统一预览线 - 核心方法
   * 解决用户反馈的重复创建判断问题
   * @param {Object} node - 节点对象
   * @param {string} state - 预览线状态
   * @param {boolean} forceUpdate - 是否强制更新
   * @returns {Promise<Object>} 创建结果
   */
  createUnifiedPreviewLine(node, state = PreviewLineStates.INTERACTIVE, forceUpdate = false) {
    const startTime = performance.now()
    
    try {
      this.log('info', `开始创建预览线: nodeId=${node.id}, state=${state}, forceUpdate=${forceUpdate}`)
      
      // 1. 使用新的验证器检查创建需求
      const requirement = this.validator.checkPreviewLineRequirement(
        node, 
        state, 
        this.previewLines, 
        forceUpdate
      )
      
      this.log('info', `预览线需求检查结果: ${requirement.reason}`, requirement)
      
      // 2. 根据需求类型执行相应操作
      let result
      switch (requirement.type) {
        case CreationRequirementTypes.NO_CREATION:
          result = this.handleNoCreationNeeded(node, requirement)
          break
          
        case CreationRequirementTypes.NEEDS_CREATION:
          result = this.handleCreateNewPreviewLine(node, state, requirement)
          break
          
        case CreationRequirementTypes.NEEDS_UPDATE:
          result = this.handleUpdatePreviewLine(node, state, requirement)
          break
          
        case CreationRequirementTypes.NEEDS_CLEANUP:
          result = this.handleCleanupAndRecreate(node, state, requirement)
          break
          
        default:
          throw new Error(`未知的需求类型: ${requirement.type}`)
      }
      
      // 3. 记录性能指标
      const duration = performance.now() - startTime
      this.recordPerformanceMetric('createUnifiedPreviewLine', duration)
      
      this.log('info', `预览线创建完成: nodeId=${node.id}, 耗时=${duration.toFixed(2)}ms`, result)
      
      return result
      
    } catch (error) {
      const nodeId = node?.id || 'unknown'
      this.log('error', `预览线创建异常: nodeId=${nodeId}`, error)
      return {
        success: false,
        error: error.message,
        nodeId: nodeId
      }
    }
  }

  /**
   * 处理无需创建的情况
   * @param {Object} node - 节点
   * @param {Object} requirement - 需求分析结果
   * @returns {null|Object} 处理结果 - 增强布局引擎状态检查，防止null返回
   */
  handleNoCreationNeeded(node, requirement) {
    const nodeId = node?.id || 'unknown'
    
    // 增强布局引擎状态检查 - 如果是因为布局引擎未就绪，返回有意义的结果而不是null
    if (requirement.reason === '布局引擎未就绪') {
      this.log('warn', `布局引擎未就绪，预览线创建被延迟: ${nodeId}`, {
        nodeId,
        reason: requirement.reason,
        timestamp: Date.now()
      })
      
      return {
        success: false,
        action: 'deferred',
        reason: requirement.reason,
        nodeId: nodeId,
        shouldRetry: true,
        retryAfter: 100 // 建议100ms后重试
      }
    }
    
    // 如果是因为节点不存在而无需创建，返回null（保持原有逻辑）
    if (requirement.reason === '节点不存在' || requirement.reason === '节点不在图中') {
      this.log('warn', `节点不存在，无法创建预览线: ${nodeId}`, {
        nodeId,
        reason: requirement.reason,
        timestamp: Date.now()
      })
      return null
    }
    
    const existingLines = this.previewLines.get(nodeId) || []
    
    return {
      success: true,
      action: 'skipped',
      reason: requirement.reason,
      nodeId: nodeId,
      existingLines: existingLines.map(line => ({
        id: line.id,
        type: line.type,
        state: line.state,
        branchId: line.branchId
      }))
    }
  }

  /**
   * 处理创建新预览线
   * @param {Object} node - 节点
   * @param {string} state - 状态
   * @param {Object} requirement - 需求分析结果
   * @returns {Promise<Object>} 处理结果
   */
  handleCreateNewPreviewLine(node, state, requirement) {
    const { details } = requirement
    
    if (details.nodeType === 'single') {
      // 创建单一预览线
      const previewLine = this.createSinglePreviewLine(node, state)
      return {
        success: true,
        action: 'created',
        type: 'single',
        nodeId: node?.id || 'unknown',
        previewLine: {
          id: previewLine.id,
          type: previewLine.type,
          state: previewLine.state
        }
      }
    } else {
      // 创建分支预览线
      // 安全检查 branchAnalysis
      const branchAnalysis = details.branchAnalysis
      if (!branchAnalysis || !branchAnalysis.isValid) {
        this.log('error', '分支分析结果无效，无法创建分支预览线', { 
          branchAnalysis,
          nodeId: node?.id || 'unknown',
          details 
        })
        return {
          success: false,
          action: 'failed',
          type: 'branch',
          nodeId: node?.id || 'unknown',
          error: '分支分析结果无效'
        }
      }
      
      const previewLines = this.createBranchPreviewLines(node, state, branchAnalysis)
      return {
        success: true,
        action: 'created',
        type: 'branch',
        nodeId: node?.id || 'unknown',
        previewLines: previewLines.map(line => ({
          id: line.id,
          type: line.type,
          state: line.state,
          branchId: line.branchId,
          branchLabel: line.branchLabel
        }))
      }
    }
  }

  /**
   * 处理更新预览线
   * @param {Object} node - 节点
   * @param {string} state - 状态
   * @param {Object} requirement - 需求分析结果
   * @returns {Promise<Object>} 处理结果
   */
  handleUpdatePreviewLine(node, state, requirement) {
    const { details } = requirement
    
    // 安全检查：确保 operations 对象存在且结构正确
    const operations = details?.operations || {
      createNew: [],
      updateExisting: [],
      removeExtra: [],
      removeInvalid: []
    }
    
    // 验证 operations 对象结构
    if (!operations || typeof operations !== 'object') {
      this.log('error', 'operations 对象无效，使用默认空操作', {
        nodeId: node?.id || 'unknown',
        operations: operations,
        details: details
      })
      return {
        success: false,
        action: 'update_failed',
        nodeId: node?.id || 'unknown',
        error: 'operations 对象结构无效'
      }
    }
    
    // 确保所有必需的操作数组存在
    operations.createNew = operations.createNew || []
    operations.updateExisting = operations.updateExisting || []
    operations.removeExtra = operations.removeExtra || []
    operations.removeInvalid = operations.removeInvalid || []
    
    const results = []
    
    // 创建新的分支预览线
    if (operations.createNew && operations.createNew.length > 0) {
      for (const branch of operations.createNew) {
        const previewLine = this.createBranchPreviewLine(node, state, branch)
        results.push({ action: 'created', branchId: branch.id, lineId: previewLine.id })
      }
    }
    
    // 更新现有预览线
    if (operations.updateExisting && operations.updateExisting.length > 0) {
      for (const update of operations.updateExisting) {
        this.updatePreviewLineState(update.line, update.targetState)
        results.push({ action: 'updated', branchId: update.branch.id, lineId: update.line.id })
      }
    }
    
    // 移除多余的预览线
    if (operations.removeExtra && operations.removeExtra.length > 0) {
      for (const line of operations.removeExtra) {
        this.removePreviewLine(line)
        results.push({ action: 'removed', reason: 'extra', lineId: line.id })
      }
    }
    
    // 清理无效预览线
    if (operations.removeInvalid && operations.removeInvalid.length > 0) {
      for (const line of operations.removeInvalid) {
        this.removePreviewLine(line)
        results.push({ action: 'removed', reason: 'invalid', lineId: line.id })
      }
    }
    
    return {
      success: true,
      action: 'updated',
      nodeId: node?.id || 'unknown',
      operations: results
    }
  }

  /**
   * 处理清理并重新创建
   * @param {Object} node - 节点
   * @param {string} state - 状态
   * @param {Object} requirement - 需求分析结果
   * @returns {Promise<Object>} 处理结果
   */
  handleCleanupAndRecreate(node, state, requirement) {
    try {
      // 1. 清理现有无效预览线
      const nodeId = node?.id || 'unknown'
      const existingLines = this.previewLines.get(nodeId) || []
      const cleanupResults = []
      
      for (const line of existingLines) {
        this.removePreviewLine(line)
        cleanupResults.push({ action: 'cleaned', lineId: line.id })
      }
      
      // 2. 准备重新创建预览线的参数
      let createDetails = { nodeType: 'single' }
      
      // 检查是否为分支节点，如果是则获取分支分析
      if (this.validator.isBranchNode(node)) {
        this.log('debug', `清理重建：检测到分支节点 ${nodeId}，开始分析分支配置`)
        
        try {
          const branchAnalysis = this.validator.analyzeBranchConfiguration(node)
          
          if (branchAnalysis && branchAnalysis.isValid) {
            createDetails = {
              nodeType: 'branch',
              branchAnalysis: branchAnalysis
            }
            this.log('debug', `清理重建：分支分析成功 ${nodeId}`, {
              branchCount: branchAnalysis.branchCount,
              requiredBranches: branchAnalysis.requiredBranches?.length || 0
            })
          } else {
            const errorMsg = `清理重建失败：节点 ${nodeId} 分支分析失败，缺失必要的分支配置数据`
            this.log('error', errorMsg, {
              branchAnalysis: branchAnalysis,
              nodeId: nodeId,
              nodeType: node?.getData?.()?.type || 'unknown'
            })
            throw new Error(errorMsg)
          }
        } catch (analysisError) {
          const errorMsg = `清理重建失败：节点 ${nodeId} 分支分析异常，${analysisError.message}`
          this.log('error', errorMsg, {
            error: analysisError.message,
            stack: analysisError.stack,
            nodeId: nodeId,
            nodeType: node?.getData?.()?.type || 'unknown'
          })
          throw new Error(errorMsg)
        }
      }
      
      // 3. 重新创建预览线
      const createResult = this.handleCreateNewPreviewLine(node, state, {
        details: createDetails
      })
      
      return {
        success: true,
        action: 'cleanup_and_recreate',
        nodeId: nodeId,
        cleanup: cleanupResults,
        recreation: createResult
      }
      
    } catch (error) {
      const nodeId = node?.id || 'unknown'
      this.log('error', `清理重建失败: ${nodeId}`, {
        error: error.message,
        stack: error.stack
      })
      
      return {
        success: false,
        action: 'cleanup_and_recreate_failed',
        nodeId: nodeId,
        error: error.message
      }
    }
  }

  /**
   * 统一渲染预览线
   * @param {Object} previewLine - 预览线实例
   * @returns {Promise<Object>} 渲染结果
   */
  renderPreviewLine(previewLine) {
    // 详细的渲染器验证
    if (!this.renderer) {
      this.log('error', `渲染器为 null，无法渲染预览线: ${previewLine?.id || 'unknown'}`, {
        previewLineId: previewLine?.id,
        rendererStatus: 'null',
        managerInstance: !!this,
        timestamp: new Date().toISOString()
      });
      return previewLine;
    }
    
    if (typeof this.renderer !== 'object') {
      this.log('error', `渲染器类型错误，期望 object，实际: ${typeof this.renderer}`, {
        previewLineId: previewLine?.id,
        rendererType: typeof this.renderer,
        rendererValue: this.renderer
      });
      return previewLine;
    }
    
    if (typeof this.renderer.createPreviewLine !== 'function') {
      this.log('error', `渲染器缺少 createPreviewLine 方法`, {
        previewLineId: previewLine?.id,
        rendererMethods: Object.getOwnPropertyNames(this.renderer),
        createPreviewLineType: typeof this.renderer.createPreviewLine
      });
      return previewLine;
    }
    
    // 验证预览线参数
    if (!previewLine || typeof previewLine !== 'object') {
      this.log('error', `预览线参数无效`, {
        previewLineType: typeof previewLine,
        previewLineValue: previewLine
      });
      return previewLine;
    }
    
    try {
      const rendererConfig = {
        id: previewLine.id,
        sourceNode: previewLine.sourceNode,
        state: previewLine.state,
        type: previewLine.type
      };
      
      // 添加分支相关配置
      if (previewLine.type === PreviewLineTypes.BRANCH) {
        rendererConfig.branchId = previewLine.branchId;
        rendererConfig.branchLabel = previewLine.branchLabel;
        rendererConfig.branchIndex = previewLine.branchIndex;
        rendererConfig.metadata = previewLine.metadata;
      }
      
      this.log('debug', `开始渲染预览线: ${previewLine.id}`, {
        rendererConfig,
        rendererAvailable: !!this.renderer,
        rendererType: typeof this.renderer
      });
      
      const rendererResult = this.renderer.createPreviewLine(previewLine.sourceNode, rendererConfig);
      
      if (rendererResult && rendererResult.line) {
        previewLine.line = rendererResult.line;
        this.log('debug', `预览线渲染成功: ${previewLine.id}`);
      } else {
        this.log('warn', `渲染器返回结果无效: ${previewLine.id}`, {
          rendererResult,
          hasLine: !!(rendererResult && rendererResult.line)
        });
      }
      
      return previewLine;
    } catch (error) {
      this.log('error', `预览线渲染失败: ${previewLine.id}`, {
        error: error.message,
        stack: error.stack,
        rendererAvailable: !!this.renderer,
        rendererType: typeof this.renderer,
        previewLineId: previewLine.id
      });
      
      // 严格错误处理，不使用降级方案
      this.handleRenderFailure(previewLine, error);
    }
  }
  
  /**
   * 处理渲染失败 - 严格错误处理，不使用降级方案
   * @param {Object} previewLine - 预览线实例
   * @param {Error} error - 错误对象
   * @throws {Error} 直接抛出渲染错误，阻断执行
   */
  handleRenderFailure(previewLine, error) {
    const errorMsg = `预览线渲染失败: ${previewLine.id}，错误: ${error.message}`
    this.log('error', errorMsg, {
      previewLineId: previewLine.id,
      errorMessage: error.message,
      errorStack: error.stack,
      previewLineType: previewLine.type,
      sourceNodeId: previewLine.sourceNodeId,
      timestamp: new Date().toISOString()
    });
    
    throw new Error(errorMsg);
  }

  /**
   * 创建单一预览线
   * @param {Object} node - 节点
   * @param {string} state - 状态
   * @returns {Promise<Object>} 预览线实例
   */
  createSinglePreviewLine(node, state) {
    const nodeId = node?.id || 'unknown'
    const previewLine = {
      id: `preview_${nodeId}_${Date.now()}`,
      type: PreviewLineTypes.SINGLE,
      state,
      sourceNode: node,
      line: null, // 实际的X6图形对象
      metadata: {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    // 存储预览线
    this.addPreviewLineToStorage(nodeId, previewLine)
    
    // 统一渲染
    return this.renderPreviewLine(previewLine)
  }

  /**
   * 创建分支预览线
   * @param {Object} node - 节点
   * @param {string} state - 状态
   * @param {Object} branchAnalysis - 分支分析结果
   * @returns {Promise<Array>} 预览线实例数组
   */
  createBranchPreviewLines(node, state, branchAnalysis) {
    const previewLines = []
    
    // 安全检查branchAnalysis和requiredBranches
    if (!branchAnalysis || !branchAnalysis.requiredBranches || !Array.isArray(branchAnalysis.requiredBranches)) {
      this.log('warn', '分支分析结果无效，无法创建分支预览线', { branchAnalysis })
      return previewLines
    }
    
    for (const branch of branchAnalysis.requiredBranches) {
      const previewLine = this.createBranchPreviewLine(node, state, branch)
      previewLines.push(previewLine)
    }
    
    return previewLines
  }

  /**
   * 创建单个分支预览线
   * @param {Object} node - 节点
   * @param {string} state - 状态
   * @param {Object} branch - 分支信息
   * @returns {Promise<Object>} 预览线实例
   */
  async createBranchPreviewLine(node, state, branch) {
    const nodeId = node?.id || 'unknown'
    const branchId = branch?.id || 'unknown'
    const previewLine = {
      id: `preview_${nodeId}_${branchId}_${Date.now()}`,
      type: PreviewLineTypes.BRANCH,
      state,
      sourceNode: node,
      branchId: branch.id,
      branchLabel: branch.label,
      branchIndex: branch.index,
      line: null, // 实际的X6图形对象
      metadata: { branch },
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    // 存储预览线
    this.addPreviewLineToStorage(nodeId, previewLine)
    
    // 统一渲染
    return this.renderPreviewLine(previewLine)
  }

  /**
   * 更新预览线状态
   * @param {Object} previewLine - 预览线实例
   * @param {string} newState - 新状态
   */
  async updatePreviewLineState(previewLine, newState) {
    previewLine.state = newState
    previewLine.updatedAt = Date.now()
    
    // 更新图形样式
    if (previewLine.line) {
      // 这里会调用样式更新逻辑
    }
    
    this.log('debug', `预览线状态已更新: ${previewLine.id} -> ${newState}`)
  }

  /**
   * 移除预览线
   * @param {Object} previewLine - 预览线实例
   */
  async removePreviewLine(previewLine) {
    try {
      
      // 从存储中移除（先移除存储，避免事件触发时找到已删除的预览线）
      this.removePreviewLineFromStorage(previewLine)
      
      // 从图中移除
      if (previewLine.line && this.graph) {
        // 使用静默模式移除，避免触发事件
        this.graph.removeCell(previewLine.line, { silent: true })
      }
      
      this.log('debug', `预览线已移除: ${previewLine.id}`)
    } catch (error) {
      this.log('error', `移除预览线时出错: ${previewLine.id}`, error)
    }
  }

  /**
   * 添加预览线到存储
   * @param {string} nodeId - 节点ID
   * @param {Object} previewLine - 预览线实例
   */
  addPreviewLineToStorage(nodeId, previewLine) {
    if (!this.previewLines.has(nodeId)) {
      this.previewLines.set(nodeId, [])
    }
    this.previewLines.get(nodeId).push(previewLine)
    this.previewLineInstances.set(previewLine.id, previewLine)
  }

  /**
   * 从存储中移除预览线
   * @param {Object} previewLine - 预览线实例
   */
  removePreviewLineFromStorage(previewLine) {
    const sourceNodeId = previewLine.sourceNode.id
    const nodeLines = this.previewLines.get(sourceNodeId)
    
    if (nodeLines) {
      const index = nodeLines.findIndex(line => line.id === previewLine.id)
      if (index !== -1) {
        nodeLines.splice(index, 1)
      }
      
      if (nodeLines.length === 0) {
        this.previewLines.delete(sourceNodeId)
      }
    }
    
    this.previewLineInstances.delete(previewLine.id)
  }

  /**
   * 处理配置变更
   * @param {string} path - 配置路径
   * @param {*} newValue - 新值
   * @param {*} oldValue - 旧值
   */
  handleConfigChange(path, newValue, oldValue) {
    this.log('debug', `配置变更: ${path}`, { newValue, oldValue })
    
    // 根据配置变更类型执行相应操作
    if (path.startsWith('debug.')) {
      this.debugMode = this.configManager.get('debug.enabled', false)
    } else if (path.startsWith('performance.')) {
      this.updatePerformanceSettings()
    }
  }

  /**
   * 设置性能监控
   */
  setupPerformanceMonitoring() {
    this.performanceMetrics = {
      createUnifiedPreviewLine: [],
      updatePreviewLine: [],
      removePreviewLine: []
    }
  }

  /**
   * 记录性能指标
   * @param {string} operation - 操作名称
   * @param {number} duration - 耗时（毫秒）
   */
  recordPerformanceMetric(operation, duration) {
    if (this.performanceMetrics && this.performanceMetrics[operation]) {
      this.performanceMetrics[operation].push({
        duration,
        timestamp: Date.now()
      })
      
      // 保持最近100条记录
      if (this.performanceMetrics[operation].length > 100) {
        this.performanceMetrics[operation].shift()
      }
    }
  }

  /**
   * 获取性能报告
   * @returns {Object} 性能报告
   */
  getPerformanceReport() {
    if (!this.performanceMetrics) {
      return null
    }
    
    const report = {}
    
    for (const [operation, metrics] of Object.entries(this.performanceMetrics)) {
      if (metrics.length > 0) {
        const durations = metrics.map(m => m.duration)
        report[operation] = {
          count: metrics.length,
          avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
          minDuration: Math.min(...durations),
          maxDuration: Math.max(...durations),
          totalDuration: durations.reduce((a, b) => a + b, 0)
        }
      }
    }
    
    return report
  }

  /**
   * 判断边是否为预览线
   * @param {Object} edge - 边对象
   * @returns {boolean} 是否为预览线
   */
  isPreviewLine(edge) {
    if (!edge) {
      return false
    }
    
    // 预览线的特征：有源节点但无目标节点
    const hasSource = edge.getSourceCellId && edge.getSourceCellId()
    const hasTarget = edge.getTargetCellId && edge.getTargetCellId()
    
    // 或者通过数据类型判断
    const edgeData = edge.getData ? edge.getData() : {}
    const isPreviewType = edgeData.type === 'preview-line' || edgeData.isUnifiedPreview
    
    return (hasSource && !hasTarget) || isPreviewType
  }

  /**
   * 判断节点是否为分支节点
   * @param {Object} node - 节点对象
   * @returns {boolean} 是否为分支节点
   */
  isBranchNode(node) {
    if (!node || !node.getData) {
      return false
    }
    
    const nodeData = node.getData()
    const nodeType = nodeData.type || nodeData.nodeType
    
    // 分支节点类型
    const branchNodeTypes = ['audience-split', 'event-split', 'ab-test']
    return branchNodeTypes.includes(nodeType)
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

    try {
      const logMessage = `[PreviewLineManager] ${message}`
      
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
        default:
          console.log(logMessage, data)
          break
      }
    } catch (error) {
      // 防止日志记录本身出错
      console.error('[PreviewLineManager] 日志记录失败:', error.message)
    }
  }

  /**
   * 销毁管理器
   */
  destroy() {
    // 清理所有预览线
    for (const [nodeId, lines] of this.previewLines) {
      for (const line of lines) {
        this.removePreviewLine(line)
      }
    }
    
    // 清理存储
    this.previewLines.clear()
    this.previewLineInstances.clear()
    this.nodeStates.clear()
    if (this.cache) this.cache.clear()
    this.pendingOperations.clear()
    this.eventListeners.clear()
    
    // 销毁配置管理器
    if (this.configManager) {
      this.configManager.destroy()
    }
    
    this.log('info', '预览线管理器已销毁')
  }

  /**
   * 添加事件监听器
   * @param {string} eventName - 事件名称
   * @param {Function} handler - 事件处理器
   */
  addEventListener(eventName, handler) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, new Set())
    }
    this.eventListeners.get(eventName).add(handler)
  }

  /**
   * 移除事件监听器
   * @param {string} eventName - 事件名称
   * @param {Function} handler - 事件处理器
   */
  removeEventListener(eventName, handler) {
    if (this.eventListeners.has(eventName)) {
      this.eventListeners.get(eventName).delete(handler)
    }
  }

  /**
   * 触发事件
   * @param {string} eventName - 事件名称
   * @param {*} data - 事件数据
   * @private
   */
  _emitEvent(eventName, data) {
    if (this.eventListeners.has(eventName)) {
      this.eventListeners.get(eventName).forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          this.log('error', `事件处理器执行失败: ${eventName}`, error)
        }
      })
    }
  }

  /**
   * 为现有节点创建预览线
   * 用于Builder模式中的延迟初始化
   */
  createPreviewLinesForExistingNodes() {
    if (!this.graph) return

    const nodes = this.graph.getNodes()
    nodes.forEach(node => {
      try {
        this.createUnifiedPreviewLine(node, PreviewLineStates.INTERACTIVE)
      } catch (error) {
        this.log('warn', `为现有节点创建预览线失败: ${node.id}`, error)
      }
    })
  }

  /**
   * 手动初始化管理器
   * 用于Builder模式中的手动初始化
   */
  manualInitialize() {
    if (this.initOptions.autoInitialize) {
      this.log('warn', '管理器已经自动初始化，无需手动初始化')
      return
    }
    
    this.initialize()
    
    if (this.initOptions.createForExistingNodes) {
      this.createPreviewLinesForExistingNodes()
    }
  }
}

// 导出默认管理器工厂函数
/**
 * 便捷的工厂函数 - 兼容旧版本API
 * @param {Object} options - 配置选项
 * @returns {PreviewLineManager} 管理器实例
 */
export function createPreviewLineManager(options = {}) {
  return new PreviewLineManager(options)
}

// 导出 Builder 相关类和函数
export { PreviewLineManagerBuilder, createPreviewLineManagerBuilder } from './PreviewLineManagerBuilder.js'

export {
  PreviewLineStates,
  PreviewLineTypes,
  CreationRequirementTypes
} from '../types/PreviewLineTypes.js'