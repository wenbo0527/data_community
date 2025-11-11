// PreviewLineManager.js - 统一预览线管理器
import { PreviewLineSystem } from '../PreviewLineSystem.js'
import { PreviewLineService } from '../../../pages/marketing/tasks/services/PreviewLineService.js'
import { PreviewLineValidator } from './PreviewLineValidator.js'
import { PreviewLineConfigManager, defaultConfigManager } from '../config/PreviewLineConfig.js'
import { PreviewLineStates, PreviewLineTypes, CreationRequirementTypes } from '../types/PreviewLineTypes.js'
import { NodePortValidator } from '../../NodePortValidator.js'

/**
 * 统一预览线管理器
 * 负责协调预览线的创建、更新、验证和生命周期管理
 */
export class PreviewLineManager {
  constructor(options = {}) {
    // 验证和标准化选项
    this.initOptions = this._validateAndNormalizeOptions(options)
    
    // 核心组件
    this.graph = this.initOptions.graph
    this.system = null // 🔧 修复：延迟初始化，避免循环依赖
    this.service = null
    this.validator = null
    this.configManager = null
    
    // 存储
    this.previewLines = new Map() // nodeId -> [previewLine, ...]
    this.previewLineInstances = new Map() // previewLineId -> previewLine
    this.nodeStates = new Map() // nodeId -> state
    this.cache = new Map() // 缓存计算结果
    this.pendingOperations = new Map() // 待处理操作
    this.eventListeners = new Map() // 事件监听器
    
    // 状态
    this.isInitialized = false
    this.debugMode = this.initOptions.debug || false
    this.performanceMetrics = null
    
    // 初始化配置管理器
    this._initializeConfigManager(this.initOptions)
    
    // 初始化性能选项
    this._initializePerformanceOptions(this.initOptions)
    
    // 自动初始化（如果启用）
    if (this.initOptions.autoInitialize) {
      this.initialize()
    }
    
    // 初始化端口验证器
    this.nodePortValidator = new NodePortValidator({
      enableLogging: options.enablePortValidationLogging !== false,
      strictMode: options.strictPortValidation || false
    })
  }

  /**
   * 验证和标准化选项
   * @param {Object} options - 原始选项
   * @returns {Object} 标准化后的选项
   * @private
   */
  _validateAndNormalizeOptions(options) {
    if (!options.graph) {
      throw new Error('PreviewLineManager 需要 graph 实例')
    }

    return {
      graph: options.graph,
      debug: options.debug || false,
      autoInitialize: options.autoInitialize !== false, // 默认为 true
      createForExistingNodes: options.createForExistingNodes || false,
      performance: options.performance || {},
      config: options.config || {}
    }
  }

  /**
   * 初始化配置管理器
   * @param {Object} options - 初始化选项
   * @private
   */
  _initializeConfigManager(options) {
    if (options.configManager) {
      this.configManager = options.configManager
    } else {
      this.configManager = new PreviewLineConfigManager({
        debug: {
          enabled: options.debug || false,
          logLevel: options.debug ? 'debug' : 'info'
        },
        performance: {
          enableMetrics: options.performance?.enableMetrics || false,
          metricsInterval: options.performance?.metricsInterval || 1000
        },
        validation: {
          strictMode: options.validation?.strictMode || false,
          coordinateThreshold: options.validation?.coordinateThreshold || 5
        }
      })
    }
    
    // 监听配置变更
    this.configManager.onChange((path, newValue, oldValue) => {
      this.handleConfigChange(path, newValue, oldValue)
    })
  }

  /**
   * 初始化性能选项
   * @param {Object} options - 初始化选项
   * @private
   */
  _initializePerformanceOptions(options) {
    const performanceOptions = options.performance || {}
    
    if (performanceOptions.enableMetrics) {
      this.setupPerformanceMonitoring()
    }
    
    // 设置性能相关配置
    this.performanceConfig = {
      enableMetrics: performanceOptions.enableMetrics || false,
      metricsInterval: performanceOptions.metricsInterval || 1000,
      maxCacheSize: performanceOptions.maxCacheSize || 1000
    }
  }

  /**
   * 初始化管理器
   */
  initialize() {
    if (this.isInitialized) {
      this.log('warn', '管理器已经初始化')
      return
    }

    // 🔧 修复：避免循环依赖，不再创建新的PreviewLineSystem实例
    // 而是直接初始化必要的组件
    
    try {
      // 初始化服务组件（不依赖PreviewLineSystem）
      this.service = new PreviewLineService(this.graph, { debug: this.debugMode })
      
      // 初始化验证器（不依赖PreviewLineSystem）
      this.validator = new PreviewLineValidator(this.configManager, this.graph)
      
      // 设置组件间的引用
      if (this.service && typeof this.service.setValidator === 'function') {
        this.service.setValidator(this.validator)
      }
      
      this.isInitialized = true
      this.log('info', '预览线管理器初始化完成')
      
    } catch (error) {
      console.error('❌ [PreviewLineManager] 初始化失败:', error)
      this.isInitialized = false
      throw error
    }
  }

  /**
   * 创建统一预览线
   * @param {Object} node - 节点对象
   * @param {string} state - 预览线状态
   * @param {boolean} forceUpdate - 是否强制更新
   * @returns {Object} 创建结果
   */
  createUnifiedPreviewLine(node, state = PreviewLineStates.INTERACTIVE, forceUpdate = false) {
    const startTime = Date.now()
    
    try {
      if (!this.isInitialized) {
        throw new Error('管理器未初始化')
      }

      if (!node || !node.id) {
        throw new Error('无效的节点对象')
      }

      // 检查创建需求
      const existingLines = this.previewLines.get(node.id) || []
      const requirement = this.validator.checkPreviewLineRequirement(node, state, existingLines, forceUpdate)
      
      this.log('debug', `节点 ${node.id} 预览线创建需求: ${requirement.type}`, requirement)
      
      // 🔧 增强日志：记录处理方法调用前的状态
      this.log('debug', `[PreviewLineManager] 准备处理节点 ${node.id}`, {
        requirementType: requirement.type,
        nodeState: state,
        forceUpdate,
        existingLinesCount: existingLines.length
      })

      let result = null

      // 根据需求类型执行相应操作
      switch (requirement.type) {
        case CreationRequirementTypes.NO_CREATION_NEEDED:
          result = this.handleNoCreationNeeded(node, requirement)
          break
        case CreationRequirementTypes.CREATE_NEW:
          result = this.handleCreateNewPreviewLine(node, state, requirement)
          break
        case CreationRequirementTypes.NEEDS_CREATION:
          // NEEDS_CREATION 使用与 CREATE_NEW 相同的处理逻辑
          result = this.handleCreateNewPreviewLine(node, state, requirement)
          break
        case CreationRequirementTypes.UPDATE_EXISTING:
          result = this.handleUpdatePreviewLine(node, state, requirement)
          break
        case CreationRequirementTypes.CLEANUP_AND_RECREATE:
          result = this.handleCleanupAndRecreate(node, state, requirement)
          break
        default:
          throw new Error(`未知的创建需求类型: ${requirement.type}`)
      }

      // 🔧 增强日志：记录处理方法返回结果
      this.log('debug', `[PreviewLineManager] 处理方法返回结果: ${node?.id}`, {
        requirementType: requirement?.type,
        resultExists: !!result,
        resultType: typeof result,
        resultSuccess: result?.success,
        resultAction: result?.action,
        resultError: result?.error
      })

      // 记录性能指标
      const duration = Date.now() - startTime
      this.recordPerformanceMetric('createUnifiedPreviewLine', duration)

      if (!result) {
        this.log('error', `创建预览线处理方法返回空值: ${node?.id}`, {
          nodeId: node?.id,
          requirementType: requirement?.type,
          state,
          handlerMethod: this.getHandlerMethodName(requirement?.type)
        })
        return {
          success: false,
          error: '处理方法返回空值，可能是内部逻辑错误'
        }
      }
      
      return result

    } catch (error) {
      this.log('error', `创建预览线失败: ${node?.id}`, error)
      return {
        success: false,
        error: error.message,
        nodeId: node?.id
      }
    }
  }

  /**
   * 处理无需创建的情况
   * @param {Object} node - 节点对象
   * @param {Object} requirement - 创建需求
   * @returns {Object} 处理结果
   */
  handleNoCreationNeeded(node, requirement) {
    try {
      // 更新节点状态缓存
      this.nodeStates.set(node.id, {
        lastChecked: Date.now(),
        requirement: requirement.type,
        reason: requirement.reason,
        metadata: {
          timestamp: Date.now()
        }
      })

      // 如果有现有预览线，验证其状态
      const existingLines = this.previewLines.get(node.id)
      let validLinesCount = 0
      let invalidLinesCount = 0
      
      if (existingLines && existingLines.length > 0) {
        for (const line of existingLines) {
          if (this.validator.isValidPreviewLine(line, node)) {
            validLinesCount++
            this.log('debug', `节点 ${node.id} 现有预览线有效，无需操作: ${line.id}`)
          } else {
            invalidLinesCount++
            this.log('warn', `节点 ${node.id} 现有预览线无效，可能需要重新创建: ${line.id}`)
          }
        }
      }

      // 记录到待处理操作（用于批量处理）
      this.pendingOperations.set(node.id, {
        type: 'no_action',
        node,
        requirement,
        timestamp: Date.now()
      })

      // 🔧 修复：返回有效的结果对象而不是 null
      return {
        success: true,
        action: 'no_creation_needed',
        nodeId: node.id,
        reason: requirement.reason,
        details: {
          existingLinesCount: existingLines?.length || 0,
          validLinesCount,
          invalidLinesCount,
          requirementType: requirement.type
        },
        timestamp: Date.now()
      }
    } catch (error) {
      this.log('error', `处理无需创建操作时发生异常: ${node?.id}`, {
        error: error.message,
        stack: error.stack,
        nodeId: node?.id,
        requirementType: requirement?.type
      })
      
      return {
        success: false,
        action: 'no_creation_needed',
        nodeId: node?.id,
        error: `处理异常: ${error.message}`,
        timestamp: Date.now()
      }
    }
  }

  /**
   * 处理创建新预览线
   * @param {Object} node - 节点对象
   * @param {string} state - 预览线状态
   * @param {Object} requirement - 创建需求
   * @returns {Object} 创建结果
   */
  handleCreateNewPreviewLine(node, state, requirement) {
    try {
      this.log('debug', `为节点 ${node.id} 创建新预览线`)

      // 检查节点是否为分支节点
      if (this.isBranchNode(node)) {
        const branchAnalysis = requirement.branchAnalysis
        if (branchAnalysis && branchAnalysis.branches.length > 0) {
          return this.createBranchPreviewLines(node, state, branchAnalysis)
        }
      }

      // 创建单个预览线
      return this.createSinglePreviewLine(node, state)

    } catch (error) {
      this.log('error', `创建新预览线失败: ${node.id}`, error)
      
      // 记录到待处理操作
      this.pendingOperations.set(node.id, {
        type: 'create_failed',
        node,
        state,
        requirement,
        error: error.message,
        timestamp: Date.now()
      })
      
      return {
        success: false,
        error: error.message,
        nodeId: node.id
      }
    }
  }

  /**
   * 处理更新现有预览线
   * @param {Object} node - 节点对象
   * @param {string} state - 预览线状态
   * @param {Object} requirement - 创建需求
   * @returns {Object} 更新结果
   */
  handleUpdatePreviewLine(node, state, requirement) {
    try {
      const existingLines = this.previewLines.get(node.id) || []
      const results = []

      for (const previewLine of existingLines) {
        try {
          // 更新预览线状态
          this.updatePreviewLineState(previewLine, state)
          results.push({ success: true, previewLineId: previewLine.id })
        } catch (error) {
          this.log('error', `更新预览线状态失败: ${previewLine.id}`, error)
          results.push({ 
            success: false, 
            previewLineId: previewLine.id, 
            error: error.message 
          })
        }
      }

      // 记录到待处理操作
      this.pendingOperations.set(node.id, {
        type: 'update_completed',
        node,
        state,
        requirement,
        results,
        timestamp: Date.now()
      })

      return {
        success: results.every(r => r.success),
        results,
        nodeId: node.id
      }

    } catch (error) {
      this.log('error', `更新预览线失败: ${node.id}`, error)
      
      // 记录到待处理操作
      this.pendingOperations.set(node.id, {
        type: 'update_failed',
        node,
        state,
        requirement,
        error: error.message,
        timestamp: Date.now()
      })
      
      return {
        success: false,
        error: error.message,
        nodeId: node.id
      }
    }
  }

  /**
   * 处理清理并重新创建
   * @param {Object} node - 节点对象
   * @param {string} state - 预览线状态
   * @param {Object} requirement - 创建需求
   * @returns {Object} 处理结果
   */
  handleCleanupAndRecreate(node, state, requirement) {
    try {
      this.log('debug', `清理并重新创建节点 ${node.id} 的预览线`)

      // 清理现有预览线
      const existingLines = this.previewLines.get(node.id) || []
      for (const previewLine of existingLines) {
        try {
          this.removePreviewLine(previewLine)
        } catch (error) {
          this.log('warn', `清理预览线失败: ${previewLine.id}`, error)
        }
      }

      // 清理存储
      this.previewLines.delete(node.id)
      this.nodeStates.delete(node.id)

      // 重新创建
      const createResult = this.handleCreateNewPreviewLine(node, state, {
        ...requirement,
        type: CreationRequirementTypes.CREATE_NEW
      })

      // 记录到待处理操作
      this.pendingOperations.set(node.id, {
        type: 'cleanup_and_recreate_completed',
        node,
        state,
        requirement,
        createResult,
        timestamp: Date.now()
      })

      return createResult

    } catch (error) {
      this.log('error', `清理并重新创建失败: ${node.id}`, error)
      
      // 记录到待处理操作
      this.pendingOperations.set(node.id, {
        type: 'cleanup_and_recreate_failed',
        node,
        state,
        requirement,
        error: error.message,
        timestamp: Date.now()
      })
      
      return {
        success: false,
        error: error.message,
        nodeId: node.id
      }
    }
  }

  /**
   * 渲染预览线
   * @param {Object} previewLine - 预览线实例
   * @returns {Object} 渲染结果
   */
  renderPreviewLine(previewLine) {
    if (!previewLine) {
      throw new Error('预览线实例为空')
    }

    // 🔧 修复：检查系统初始化状态，提供降级处理
    if (!this.system) {
      console.warn('[PreviewLineManager] 预览线系统未初始化，跳过渲染');
      return { 
        success: false, 
        skipped: true, 
        reason: '预览线系统未初始化' 
      };
    }

    if (previewLine.line) {
      this.log('debug', `预览线 ${previewLine.id} 已存在图形对象，跳过渲染`)
      return { success: true, skipped: true }
    }

    if (!previewLine.sourceNode) {
      throw new Error(`预览线 ${previewLine.id} 缺少源节点`)
    }

    try {
      // 使用系统创建图形对象
      const lineOptions = {
        id: previewLine.id,
        sourceNodeId: previewLine.sourceNode.id,
        state: previewLine.state,
        branchIndex: previewLine.branchIndex,
        metadata: previewLine.metadata
      }

      const graphLine = this.system.createPreviewLine(previewLine.sourceNode, lineOptions)
      
      if (graphLine) {
        previewLine.line = graphLine
        previewLine.renderedAt = Date.now()
        
        this.log('debug', `预览线 ${previewLine.id} 渲染成功`)
        
        // 触发渲染成功事件
        this._emitEvent('previewLineRendered', {
          previewLine,
          graphLine,
          timestamp: Date.now()
        });
        
        return { success: true, graphLine }
      } else {
        throw new Error('系统返回空的图形对象')
      }

    } catch (error) {
      this.log('error', `渲染预览线失败: ${previewLine.id}`, error)
      return this.handleRenderFailure(previewLine, error)
    }
  }
  
  /**
   * 处理渲染失败
   * @param {Object} previewLine - 预览线实例
   * @param {Error} error - 错误对象
   * @returns {Object} 失败处理结果
   * @private
   */
  handleRenderFailure(previewLine, error) {
    previewLine.renderError = error.message
    previewLine.renderFailedAt = Date.now()
    
    return {
      success: false,
      error: error.message,
      previewLineId: previewLine.id
    }
  }

  /**
   * 创建单个预览线
   * @param {Object} node - 节点对象
   * @param {string} state - 预览线状态
   * @returns {Object} 创建结果
   */
  createSinglePreviewLine(node, state) {
    try {
      this.log('debug', `开始创建单个预览线: ${node?.id}`, { nodeId: node?.id, state })
      
      if (!this.service) {
        const error = 'PreviewLineService 未初始化'
        this.log('error', error, { nodeId: node?.id })
        return { success: false, error }
      }
      
      const previewLine = this.service.createPreviewLine(node, { state })
      
      if (previewLine) {
        this.addPreviewLineToStorage(node.id, previewLine)
        const renderResult = this.renderPreviewLine(previewLine)
        this.log('debug', `单个预览线创建成功: ${node?.id}`, { 
          nodeId: node?.id, 
          previewLineId: previewLine.id,
          renderSuccess: renderResult.success 
        })
        return { success: renderResult.success, previewLine, renderResult }
      }
      
      const error = 'PreviewLineService.createPreviewLine 返回空值'
      this.log('error', error, { nodeId: node?.id })
      return { success: false, error }
    } catch (error) {
      this.log('error', `创建单个预览线失败: ${node?.id}`, { 
        nodeId: node?.id, 
        error: error.message,
        stack: error.stack 
      })
      return { success: false, error: error.message }
    }
  }

  /**
   * 创建分支预览线
   * @param {Object} node - 节点对象
   * @param {string} state - 预览线状态
   * @param {Object} branchAnalysis - 分支分析结果
   * @returns {Object} 创建结果
   */
  createBranchPreviewLines(node, state, branchAnalysis) {
    try {
      this.log('debug', `开始创建分支预览线: ${node?.id}`, { 
        nodeId: node?.id, 
        branchCount: branchAnalysis?.branches?.length || 0 
      })
      
      if (!branchAnalysis || !branchAnalysis.branches || branchAnalysis.branches.length === 0) {
        const error = '分支分析结果无效或无分支'
        this.log('error', error, { nodeId: node?.id, branchAnalysis })
        return { success: false, error }
      }
      
      const results = []
      
      for (let i = 0; i < branchAnalysis.branches.length; i++) {
        const branch = branchAnalysis.branches[i]
        const result = this.createBranchPreviewLine(node, state, branch)
        results.push(result)
      }
      
      const success = results.every(r => r.success)
      this.log('debug', `分支预览线创建完成: ${node?.id}`, { 
        nodeId: node?.id, 
        totalBranches: results.length,
        successCount: results.filter(r => r.success).length,
        success 
      })
      
      return { success, results }
    } catch (error) {
      this.log('error', `创建分支预览线失败: ${node?.id}`, { 
        nodeId: node?.id, 
        error: error.message,
        stack: error.stack 
      })
      return { success: false, error: error.message }
    }
  }

  /**
   * 创建单个分支预览线
   * @param {Object} node - 节点对象
   * @param {string} state - 预览线状态
   * @param {Object} branch - 分支信息
   * @returns {Object} 创建结果
   */
  async createBranchPreviewLine(node, state, branch) {
    try {
      const previewLine = this.service.createPreviewLine(node, {
        state,
        branchIndex: branch.index,
        branchLabel: branch.label,
        branchCondition: branch.condition
      })
      
      if (previewLine) {
        this.addPreviewLineToStorage(node.id, previewLine)
        const renderResult = this.renderPreviewLine(previewLine)
        return { success: renderResult.success, previewLine, renderResult }
      }
      
      return { success: false, error: '创建分支预览线失败' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * 更新预览线状态
   * @param {Object} previewLine - 预览线实例
   * @param {string} newState - 新状态
   */
  async updatePreviewLineState(previewLine, newState) {
    previewLine.state = newState
    previewLine.updatedAt = Date.now()
    
    // 执行坐标验证 - 在状态更新时验证坐标
    if (previewLine.sourceNodeId && this.graph) {
      try {
        const sourceNode = this.graph.getCellById?.(previewLine.sourceNodeId);
        if (sourceNode) {
          console.log('🔍 [PreviewLineManager] 预览线状态更新时进行坐标验证:', {
            previewLineId: previewLine.id,
            sourceNodeId: previewLine.sourceNodeId,
            newState: newState,
            updateType: 'state_update'
          });
          
          // 使用验证器进行坐标验证
          if (this.validator && this.validator.validatePortCoordinates) {
            const coordinateValidation = this.validator.validatePortCoordinates(previewLine, sourceNode);
            console.log('📊 [PreviewLineManager] 预览线状态更新坐标验证结果:', {
              previewLineId: previewLine.id,
              sourceNodeId: previewLine.sourceNodeId,
              newState: newState,
              validationResult: coordinateValidation.isValid ? '✅ 通过' : '❌ 失败',
              coordinates: coordinateValidation.coordinates,
              errors: coordinateValidation.errors
            });
          }
        }
      } catch (validationError) {
        this.log('warn', '预览线状态更新坐标验证异常', {
          error: validationError.message,
          previewLineId: previewLine.id,
          sourceNodeId: previewLine.sourceNodeId
        });
      }
    }
    
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
    
    // 🔍 调试：记录存储操作
    console.log('🔍 [PreviewLineManager] 预览线存储操作:', {
      nodeId,
      previewLineId: previewLine.id,
      totalNodeLines: this.previewLines.get(nodeId).length,
      totalInstances: this.previewLineInstances.size,
      allNodeIds: Array.from(this.previewLines.keys()),
      allInstanceIds: Array.from(this.previewLineInstances.keys())
    })
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
   * 获取处理方法名称
   * @param {string} requirementType - 需求类型
   * @returns {string} 处理方法名称
   */
  getHandlerMethodName(requirementType) {
    const handlerMap = {
      [CreationRequirementTypes.NO_CREATION_NEEDED]: 'handleNoCreationNeeded',
      [CreationRequirementTypes.CREATE_NEW]: 'handleCreateNewPreviewLine',
      [CreationRequirementTypes.NEEDS_CREATION]: 'handleCreateNewPreviewLine',
      [CreationRequirementTypes.UPDATE_EXISTING]: 'handleUpdatePreviewLine',
      [CreationRequirementTypes.CLEANUP_AND_RECREATE]: 'handleCleanupAndRecreate'
    }
    return handlerMap[requirementType] || 'unknown'
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
    console.log('🗑️ [PreviewLineManager] 开始销毁管理器...');
    
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
    
    // 清理事件监听器 - 防止内存泄漏
    this.clearAllEventListeners()
    
    // 销毁配置管理器
    if (this.configManager) {
      this.configManager.destroy()
    }
    
    this.log('info', '预览线管理器已销毁')
  }

  /**
   * 清理所有事件监听器 - 防止内存泄漏
   */
  clearAllEventListeners() {
    console.log('🧹 [PreviewLineManager] 清理事件监听器...');
    
    let totalListeners = 0;
    for (const [eventName, handlers] of this.eventListeners) {
      totalListeners += handlers.size;
      console.log(`  - 清理事件 "${eventName}": ${handlers.size} 个监听器`);
      handlers.clear();
    }
    
    this.eventListeners.clear();
    console.log(`✅ [PreviewLineManager] 已清理 ${totalListeners} 个事件监听器`);
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
   
  /**
   * 验证节点连接（增强版）
   * 支持详细的坐标验证和预览线状态检查
   * @param {Object} graph - 图形实例
   * @param {Object} options - 验证选项
   * @returns {Object} 验证结果
   */
  validateNodeConnections(graph, options = {}) {
    console.log('🔍 [PreviewLineManager] 开始增强的节点连接验证')
    
    const {
      verbose = false,
      includeCoordinates = true,
      includePortValidation = true,
      thresholds = { position: 5, distance: 10 }
    } = options

    const result = {
      isValid: true,
      totalNodes: 0,
      validNodes: 0,
      invalidNodes: 0,
      nodeValidations: [],
      portValidation: null,
      statistics: {
        totalPreviewLines: 0,
        totalConnections: 0,
        coordinateValidations: 0,
        portValidations: 0
      },
      errors: [],
      warnings: []
    }

    try {
      const nodes = graph.getNodes()
      const previewEdges = graph.getEdges().filter(edge => this.isPreviewLine(edge))
      const connectionEdges = graph.getEdges().filter(edge => !this.isPreviewLine(edge))

      result.totalNodes = nodes.length
      result.statistics.totalPreviewLines = previewEdges.length
      result.statistics.totalConnections = connectionEdges.length

      console.log(`📊 [验证统计] 节点: ${nodes.length}, 预览线: ${previewEdges.length}, 连接线: ${connectionEdges.length}`)

      // 🔧 新增：端口位置验证
      if (includePortValidation) {
        console.log('🔍 [端口验证] 开始验证所有节点的端口配置')
        result.portValidation = this.nodePortValidator.validateAllNodes(nodes)
        result.statistics.portValidations = result.portValidation.nodeResults.length
        
        // 将端口验证错误和警告合并到总结果中
        if (!result.portValidation.isValid) {
          result.isValid = false
          result.errors.push(...result.portValidation.errors.map(err => `[端口验证] ${err}`))
        }
        result.warnings.push(...result.portValidation.warnings.map(warn => `[端口验证] ${warn}`))
        
        console.log('📋 [端口验证结果]:', {
          总节点数: result.portValidation.totalNodes,
          有效节点: result.portValidation.validNodes,
          无效节点: result.portValidation.invalidNodes,
          开始节点: result.portValidation.summary.startNodes,
          结束节点: result.portValidation.summary.endNodes,
          中间节点: result.portValidation.summary.middleNodes
        })
      }

      // 验证每个节点的连接
      for (const node of nodes) {
        const nodeValidation = this._validateSingleNodeConnection(node, previewEdges, connectionEdges, verbose)
        result.nodeValidations.push(nodeValidation)

        if (nodeValidation.isValid) {
          result.validNodes++
        } else {
          result.invalidNodes++
          result.isValid = false
        }

        result.errors.push(...nodeValidation.errors)
        result.warnings.push(...nodeValidation.warnings)

        // 统计坐标验证
        if (nodeValidation.details.coordinates) {
          result.statistics.coordinateValidations++
        }
      }

      // 输出详细的验证结果
      if (verbose || !result.isValid) {
        console.log('📊 [节点连接验证总结]:', {
          整体状态: result.isValid ? '✅ 通过' : '❌ 失败',
          节点统计: {
            总数: result.totalNodes,
            有效: result.validNodes,
            无效: result.invalidNodes
          },
          线条统计: {
            预览线: result.statistics.totalPreviewLines,
            连接线: result.statistics.totalConnections
          },
          验证统计: {
            坐标验证: result.statistics.coordinateValidations,
            端口验证: result.statistics.portValidations
          },
          问题统计: {
            错误: result.errors.length,
            警告: result.warnings.length
          }
        })

        if (result.errors.length > 0) {
          console.error('❌ [验证错误]:', result.errors)
        }

        if (result.warnings.length > 0) {
          console.warn('⚠️ [验证警告]:', result.warnings)
        }

        // 输出端口验证详情
        if (includePortValidation && result.portValidation) {
          console.log('🔍 [端口验证详情]:', {
            开始节点: `${result.portValidation.summary.startNodes.valid}/${result.portValidation.summary.startNodes.total}`,
            结束节点: `${result.portValidation.summary.endNodes.valid}/${result.portValidation.summary.endNodes.total}`,
            中间节点: `${result.portValidation.summary.middleNodes.valid}/${result.portValidation.summary.middleNodes.total}`
          })
        }
      }

      return result

    } catch (error) {
      console.error('❌ [PreviewLineManager] 节点连接验证异常:', error)
      return {
        isValid: false,
        error: error.message,
        totalNodes: 0,
        validNodes: 0,
        invalidNodes: 0,
        nodeValidations: [],
        portValidation: null,
        statistics: {
          totalPreviewLines: 0,
          totalConnections: 0,
          coordinateValidations: 0,
          portValidations: 0
        },
        errors: [`验证异常: ${error.message}`],
        warnings: []
      }
    }
  }

  /**
   * 验证单个节点的连接状态
   * @param {Object} node - 节点对象
   * @param {Array} previewEdges - 预览线数组
   * @param {Array} connectionEdges - 连接线数组
   * @param {boolean} verbose - 是否详细输出
   * @returns {Object} 节点验证结果
   * @private
   */
  _validateSingleNodeConnection(node, previewEdges, connectionEdges, verbose = false) {
    const nodeId = node.id
    const nodeData = node.getData() || {}
    const nodeType = nodeData.nodeType || nodeData.type || 'unknown'
    
    const validation = {
      nodeId,
      nodeType,
      isValid: true,
      expectedBranches: 0,
      actualPreviewLines: 0,
      actualConnections: 0,
      totalLines: 0,
      status: 'valid',
      details: {
        deficit: 0,
        surplus: 0,
        coordinates: null
      },
      errors: [],
      warnings: []
    }

    try {
      // 计算该节点的出向边
      const nodePreviewLines = previewEdges.filter(edge => 
        edge.getSourceCellId() === nodeId
      )
      const nodeConnections = connectionEdges.filter(edge => 
        edge.getSourceCellId() === nodeId
      )

      validation.actualPreviewLines = nodePreviewLines.length
      validation.actualConnections = nodeConnections.length
      validation.totalLines = validation.actualPreviewLines + validation.actualConnections

      // 计算期望的分支数
      validation.expectedBranches = this._calculateExpectedBranches(node, nodeData, nodeType)

      // 🔧 新增：坐标验证
      if (nodePreviewLines.length > 0 || nodeConnections.length > 0) {
        validation.details.coordinates = this._validateNodeCoordinates(node, nodePreviewLines, nodeConnections, verbose)
      }

      // 验证逻辑
      const totalExpected = validation.expectedBranches
      const totalActual = validation.totalLines

      if (totalActual < totalExpected) {
        validation.details.deficit = totalExpected - totalActual
        validation.status = 'deficit'
        validation.isValid = false
        validation.errors.push(`节点 ${nodeId} 缺失 ${validation.details.deficit} 条线`)
      } else if (totalActual > totalExpected) {
        validation.details.surplus = totalActual - totalExpected
        validation.status = 'surplus'
        validation.warnings.push(`节点 ${nodeId} 多余 ${validation.details.surplus} 条线`)
      }

      if (verbose) {
        console.log(`[PreviewLineManager] 🔍 节点 ${nodeId} 验证:`, {
          类型: nodeType,
          期望: totalExpected,
          实际: totalActual,
          预览线: validation.actualPreviewLines,
          连接线: validation.actualConnections,
          状态: validation.status,
          坐标验证: validation.details.coordinates ? '✅' : '⏭️'
        })
      }

    } catch (error) {
      validation.isValid = false
      validation.status = 'error'
      validation.errors.push(`节点 ${nodeId} 验证异常: ${error.message}`)
      console.error(`[PreviewLineManager] ❌ 节点 ${nodeId} 验证异常:`, error)
    }

    return validation
  }

  /**
   * 计算节点期望的分支数
   * @param {Object} node - 节点对象
   * @param {Object} nodeData - 节点数据
   * @param {string} nodeType - 节点类型
   * @returns {number} 期望分支数
   * @private
   */
  _calculateExpectedBranches(node, nodeData, nodeType) {
    // 结束节点不需要输出
    if (nodeType === 'end') {
      return 0
    }

    // 未配置的节点不需要输出
    if (!nodeData.isConfigured && nodeType !== 'start') {
      return 0
    }

    // 分支节点的特殊处理
    const branchNodeTypes = ['audience-split', 'event-split', 'ab-test', 'crowd-split']
    if (branchNodeTypes.includes(nodeType)) {
      const config = nodeData.config || {}
      
      switch (nodeType) {
        case 'audience-split':
        case 'crowd-split':
          const crowdLayers = config.crowdLayers || []
          const hasUnmatchBranch = config.unmatchBranch && config.unmatchBranch.enabled !== false
          const expectedFromCrowds = crowdLayers.length + (hasUnmatchBranch ? 1 : 0)
          
          // 如果没有 crowdLayers 但有 branches 配置，使用 branches
          if (expectedFromCrowds === 0 && config.branches) {
            return config.branches.length
          }
          
          return expectedFromCrowds
          
        case 'event-split':
          return config.branches ? config.branches.length : 2 // 是/否分支
          
        case 'ab-test':
          return config.variants ? config.variants.length : 2 // A/B 分支
          
        default:
          return config.branches ? config.branches.length : 2 // 默认分支数
      }
    }

    // 普通节点默认1个输出
    return 1
  }

  /**
   * 验证节点坐标位置
   * @param {Object} node - 节点对象
   * @param {Array} previewLines - 节点的预览线
   * @param {Array} connections - 节点的连接线
   * @param {boolean} verbose - 是否详细输出
   * @returns {Object|null} 坐标验证结果
   * @private
   */
  _validateNodeCoordinates(node, previewLines, connections, verbose = false) {
    try {
      const nodeId = node.id
      const nodePosition = node.getPosition()
      const nodeSize = node.getSize()
      
      // 计算节点的输出端口坐标（底部中心）
      const nodeOutPortCoords = {
        x: nodePosition.x + nodeSize.width / 2,
        y: nodePosition.y + nodeSize.height
      }

      const coordinateValidation = {
        nodeId,
        nodePosition,
        nodeSize,
        nodeOutPortCoords,
        previewLineCoords: [],
        connectionCoords: [],
        validationResults: []
      }

      // 验证预览线坐标
      for (const previewLine of previewLines) {
        const lineCoords = this._extractLineCoordinates(previewLine)
        coordinateValidation.previewLineCoords.push(lineCoords)
        
        const coordValidation = this._validateLineCoordinates(nodeOutPortCoords, lineCoords, 'preview')
        coordinateValidation.validationResults.push(coordValidation)
      }

      // 验证连接线坐标
      for (const connection of connections) {
        const lineCoords = this._extractLineCoordinates(connection)
        coordinateValidation.connectionCoords.push(lineCoords)
        
        const coordValidation = this._validateLineCoordinates(nodeOutPortCoords, lineCoords, 'connection')
        coordinateValidation.validationResults.push(coordValidation)
      }

      if (verbose) {
        console.log(`[PreviewLineManager] 📍 节点 ${nodeId} 坐标验证:`, {
          节点位置: nodePosition,
          节点尺寸: nodeSize,
          输出端口坐标: nodeOutPortCoords,
          预览线数量: previewLines.length,
          连接线数量: connections.length,
          坐标验证结果: coordinateValidation.validationResults.length
        })

        // 输出详细的坐标验证信息
        coordinateValidation.validationResults.forEach((result, index) => {
          console.log(`  线条 ${index + 1} (${result.lineType}):`, {
            起点坐标: result.startCoords,
            期望起点: result.expectedStartCoords,
            坐标偏差: result.deviation,
            验证通过: result.isValid ? '✅' : '❌'
          })
        })
      }

      return coordinateValidation

    } catch (error) {
      console.error(`[PreviewLineManager] ❌ 节点 ${node.id} 坐标验证异常:`, error)
      return null
    }
  }

  /**
   * 提取线条坐标信息
   * @param {Object} line - 线条对象（预览线或连接线）
   * @returns {Object} 坐标信息
   * @private
   */
  _extractLineCoordinates(line) {
    try {
      const lineData = line.getData() || {}
      const source = line.getSourcePoint ? line.getSourcePoint() : null
      const target = line.getTargetPoint ? line.getTargetPoint() : null
      
      return {
        lineId: line.id,
        lineType: lineData.isPreview ? 'preview' : 'connection',
        startPoint: source,
        endPoint: target,
        sourceNodeId: line.getSourceCellId ? line.getSourceCellId() : null,
        targetNodeId: line.getTargetCellId ? line.getTargetCellId() : null
      }
    } catch (error) {
      console.warn(`[PreviewLineManager] ⚠️ 提取线条坐标失败:`, error)
      return {
        lineId: line.id || 'unknown',
        lineType: 'unknown',
        startPoint: null,
        endPoint: null,
        sourceNodeId: null,
        targetNodeId: null
      }
    }
  }

  /**
   * 验证线条坐标与节点端口的匹配度
   * @param {Object} expectedCoords - 期望的端口坐标
   * @param {Object} lineCoords - 线条坐标信息
   * @param {string} lineType - 线条类型
   * @returns {Object} 坐标验证结果
   * @private
   */
  _validateLineCoordinates(expectedCoords, lineCoords, lineType) {
    const validation = {
      lineId: lineCoords.lineId,
      lineType,
      expectedStartCoords: expectedCoords,
      startCoords: lineCoords.startPoint,
      deviation: null,
      isValid: false,
      threshold: 5 // 5像素的容差
    }

    try {
      if (lineCoords.startPoint && expectedCoords) {
        // 计算坐标偏差
        const deltaX = Math.abs(lineCoords.startPoint.x - expectedCoords.x)
        const deltaY = Math.abs(lineCoords.startPoint.y - expectedCoords.y)
        const totalDeviation = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        
        validation.deviation = {
          deltaX,
          deltaY,
          total: totalDeviation
        }
        
        // 判断是否在容差范围内
        validation.isValid = totalDeviation <= validation.threshold
      }
    } catch (error) {
      console.warn(`[PreviewLineManager] ⚠️ 坐标验证计算失败:`, error)
    }

    return validation
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