/**
 * 统一边管理器 (UnifiedEdgeManager)
 * 
 * 核心职责：
 * 1. 统一管理预览线和连接线的生命周期
 * 2. 处理预览线与连接线之间的状态转换
 * 3. 提供高性能的边操作和批量处理
 * 4. 维护边的索引和缓存机制
 * 
 * 业务逻辑关系：
 * - 预览线：只有源节点，无目标节点，支持拖拽和吸附
 * - 连接线：有源节点和目标节点的完整连接
 * - 状态转换：预览线吸附后自动转换为连接线
 * 
 * 设计原则：
 * - 统一管理：预览线和连接线状态转换逻辑紧密耦合，统一管理避免状态同步问题
 * - 高性能：通过索引、缓存和批量操作优化性能
 * - 可维护：清晰的模块划分和详细的注释
 * 
 * @author UnifiedEdgeManager Team
 * @version 2.1.0
 * @since 2024-01-01
 */

import { ref, reactive, computed } from 'vue'
import { 
  UnifiedEdge, 
  EdgeTypes, 
  PreviewStates, 
  ConnectionStates,
  canTransitionState,
  isPreviewLine,
  isConnectionLine,
  getEdgeDisplayStyle
} from './EdgeTypes.js'
import { PortConfigurationFactory } from '../../../../../../utils/preview-line/core/PortConfigurationFactory.js'
import { ConnectionCreationController } from '../../../../../../utils/preview-line/core/ConnectionCreationController.js'
import { InPortSnapDetector } from '../../../../../../utils/preview-line/algorithms/InPortSnapDetector.js'

/**
 * 统一边管理器类
 * 
 * 负责管理画布中所有边的生命周期，包括预览线和连接线的创建、转换、删除等操作
 */
export class UnifiedEdgeManager {
  /**
   * 构造函数
   * @param {Object} graph - X6图形实例
   * @param {Object} options - 配置选项
   */
  constructor(graph, options = {}) {
    // ==================== 核心依赖 ====================
    this.graph = graph
    
    // ==================== 配置管理 ====================
    this.options = {
      // 基础配置
      enablePreviewLines: true,
      enableConnections: true,
      enableBatchOperations: true,
      enablePerformanceMonitoring: true,
      
      // 端口配置
      enforcePortDirection: true,     // 强制端口方向 out->in
      validatePortCompatibility: true, // 验证端口兼容性
      allowDirectConnection: false,   // 禁止直接连接创建
      
      // 吸附配置
      enableInPortSnap: true,         // 启用in端口吸附
      snapThreshold: 20,              // 吸附阈值
      snapHighlightDistance: 30,      // 高亮距离
      
      // 预览线配置
      previewLineStyle: {
        stroke: '#1890ff',
        strokeWidth: 2,
        strokeDasharray: '5,5',
        opacity: 0.8
      },
      
      // 连接线配置
      connectionStyle: {
        stroke: '#52c41a',
        strokeWidth: 2,
        opacity: 1
      },
      
      autoCleanup: true,
      cleanupInterval: 30000, // 30秒
      performanceOptimization: true,
      problemDiagnosis: true,
      maxEdges: 1000,
      enableConnectionValidation: true,
      enablePortValidation: true,
      maxConnectionsPerNode: 10,
      
      // 调试配置
      debug: false,
      logLevel: 'info',
      
      ...options
    }
    
    // ==================== 存储和索引 ====================
    // 统一存储所有边
    this.edges = reactive(new Map())
    
    // 专用索引映射（用于快速查找和性能优化）
    this.previewLines = reactive(new Map())      // 预览线专用存储
    this.connections = reactive(new Map())       // 连接线专用存储
    this.nodeEdgeIndex = reactive(new Map())     // 节点到边的索引
    this.portConnectionIndex = reactive(new Map()) // 端口连接索引
    
    // ==================== 状态管理 ====================
    this.isInitialized = ref(false)    // 初始化状态
    this.isProcessing = ref(false)      // 处理状态
    this.lastCleanupTime = ref(0)       // 最后清理时间
    
    // ==================== 核心模块 ====================
    // 端口配置工厂 - 负责创建和验证端口配置
    this.portConfigFactory = new PortConfigurationFactory({
      strictMode: this.options.enforcePortDirection,
      validateCompatibility: this.options.validatePortCompatibility,
      debug: this.options.debug
    })
    
    // 连接创建控制器 - 负责连接的创建和验证逻辑
    this.connectionController = new ConnectionCreationController({
      allowDirectCreation: this.options.allowDirectConnection,
      requirePreviewLine: true,
      validateBeforeCreate: true,
      debug: this.options.debug
    })
    
    // In端口吸附检测器 - 负责预览线的吸附检测
    this.snapDetector = new InPortSnapDetector({
      snapThreshold: this.options.snapThreshold,
      highlightDistance: this.options.snapHighlightDistance,
      enableVisualFeedback: true,
      debug: this.options.debug
    })
    
    // ==================== 事件系统 ====================
    this.eventListeners = new Map()    // 事件监听器映射
    
    // ==================== 性能监控 ====================
    // 性能统计数据
    this.stats = reactive({
      totalEdges: 0,              // 总边数
      previewCount: 0,            // 预览线数量
      connectionCount: 0,         // 连接线数量
      operationsCount: 0,         // 操作次数
      lastOperationTime: 0,       // 最后操作时间
      averageOperationTime: 0,    // 平均操作时间
      totalOperationTime: 0,      // 总操作时间
      batchOperationsCount: 0     // 批量操作次数
    })
    
    // ==================== 问题诊断 ====================
    // 诊断信息收集
    this.diagnostics = reactive({
      duplicateEdges: [],           // 重复边
      orphanedPreviews: [],         // 孤立预览线
      invalidConnections: [],       // 无效连接
      portConflicts: [],           // 端口冲突
      connectionLimitViolations: [], // 连接数限制违规
      lastDiagnosisTime: 0         // 最后诊断时间
    })
    
    // ==================== 连接验证 ====================
    this.connectionValidator = new ConnectionValidator(this)
    
    // ==================== 性能优化缓存 ====================
    this.cache = {
      nodeConnections: new Map(),     // 节点连接缓存
      portUsage: new Map(),          // 端口使用缓存
      validationResults: new Map(),   // 验证结果缓存
      lastCacheUpdate: 0,            // 最后缓存更新时间
      cacheTimeout: 5000             // 缓存超时时间（5秒）
    }
  }
  
  /**
   * ==================== 初始化方法 ====================
   */

  /**
   * 初始化管理器
   * 
   * 执行以下初始化步骤：
   * 1. 扫描并转换现有边
   * 2. 设置自动清理机制
   * 3. 启动性能监控
   * 4. 配置问题诊断
   * 5. 初始化连接验证器
   * 
   * @returns {Promise<void>}
   */
  initialize() {
    if (this.isInitialized.value) {
      console.warn('⚠️ [统一边管理器] 已经初始化')
      return
    }
    
    try {
      console.log('🚀 [统一边管理器] 开始初始化...')
      
      // 扫描并转换现有边
      this.scanAndConvertExistingEdges()
      
      // 设置自动清理
      if (this.options.autoCleanup) {
        this.setupAutoCleanup()
      }
      
      // 设置性能监控
      if (this.options.performanceOptimization) {
        this.setupPerformanceMonitoring()
      }
      
      // 设置问题诊断
      if (this.options.problemDiagnosis) {
        this.setupProblemDiagnosis()
      }
      
      // 初始化连接验证器
      if (this.options.enableConnectionValidation) {
        this.connectionValidator.initialize()
      }
      
      this.isInitialized.value = true
      
      console.log('✅ [统一边管理器] 初始化完成', {
        totalEdges: this.edges.size,
        previewLines: this.previewLines.size,
        connections: this.connections.size
      })
      
      this.emit('manager:initialized', { stats: this.getStats() })
      
    } catch (error) {
      console.error('❌ [统一边管理器] 初始化失败:', error)
      throw error
    }
  }
  
  // 扫描并转换现有边
  scanAndConvertExistingEdges() {
    if (!this.graph) return
    
    const existingEdges = this.graph.getEdges() || []
    console.log(`🔍 [统一边管理器] 扫描到 ${existingEdges.length} 条现有边`)
    
    for (const x6Edge of existingEdges) {
      try {
        const unifiedEdge = UnifiedEdge.fromX6EdgeData(x6Edge)
        unifiedEdge.graphInstance = x6Edge
        
        // 添加到统一存储
        this.edges.set(unifiedEdge.id, unifiedEdge)
        
        // 添加到相应索引
        if (unifiedEdge.isPreviewLine()) {
          this.previewLines.set(unifiedEdge.id, unifiedEdge)
        } else if (unifiedEdge.isConnectionLine()) {
          this.connections.set(unifiedEdge.id, unifiedEdge)
        }
        
        // 更新节点索引
        this.updateNodeIndex(unifiedEdge)
        
        // 更新端口索引
        this.updatePortIndex(unifiedEdge)
        
      } catch (error) {
        console.warn('⚠️ [统一边管理器] 转换边失败:', error, x6Edge.id)
      }
    }
    
    this.updateStats()
  }
  
  // 性能监控装饰器
  withPerformanceMonitoring(fn, operationName) {
    return async (...args) => {
      const startTime = performance.now()
      try {
        const result = await fn.call(this, ...args)
        const endTime = performance.now()
        const duration = endTime - startTime
        
        this.stats.operationsCount++
        this.stats.lastOperationTime = duration
        this.stats.totalOperationTime += duration
        this.stats.averageOperationTime = this.stats.totalOperationTime / this.stats.operationsCount
        
        console.log(`⚡ [统一边管理器] ${operationName} 完成，耗时: ${duration.toFixed(2)}ms`)
        return result
      } catch (error) {
        const endTime = performance.now()
        const duration = endTime - startTime
        console.error(`❌ [统一边管理器] ${operationName} 失败，耗时: ${duration.toFixed(2)}ms`, error)
        throw error
      }
    }
  }
  
  // 创建边（统一入口）
  async createEdge(sourceNodeId, targetNodeId = null, options = {}) {
    // 增强空值检查
    if (!this.graph) {
      throw new Error('Graph实例未初始化')
    }
    
    if (typeof this.graph.addEdge !== 'function') {
      throw new Error('Graph实例的addEdge方法不存在')
    }
    
    return this.withPerformanceMonitoring(async (sourceNodeId, targetNodeId, options) => {
      // 验证输入
      if (!sourceNodeId) {
        throw new Error('源节点ID不能为空')
      }
      
      // 验证graph实例
      if (!this.graph || typeof this.graph.addEdge !== 'function') {
        throw new Error('Graph实例未初始化或addEdge方法不存在')
      }
      
      this.isProcessing.value = true
      
      try {
        // 根据是否有目标节点决定创建类型
        if (targetNodeId) {
          // 创建连接线 - 通过连接创建控制器
          return await this.createConnectionViaController(sourceNodeId, targetNodeId, options)
        } else {
          // 创建预览线 - 直接创建
          return await this.createPreviewLineDirectly(sourceNodeId, options)
        }
        
      } finally {
        this.isProcessing.value = false
      }
    }, '创建边')(sourceNodeId, targetNodeId, options)
  }
  
  // 通过连接创建控制器创建连接
  async createConnectionViaController(sourceNodeId, targetNodeId, options = {}) {
    try {
      // 构建连接请求
      const connectionRequest = {
        sourceNodeId: sourceNodeId,
        targetNodeId: targetNodeId,
        fromPreviewLine: options.fromPreviewLine || false,
        previewLineId: options.previewLineId,
        options: {
          branchId: options.branchId,
          branchLabel: options.branchLabel,
          branchIndex: options.branchIndex,
          createdBy: options.createdBy || 'unified-edge-manager',
          metadata: options.metadata
        }
      }
      
      // 使用连接创建控制器
      const controllerResult = await this.connectionController.createConnection(connectionRequest)
      
      if (!controllerResult.success) {
        if (controllerResult.blocked) {
          console.warn('⚠️ [统一边管理器] 连接创建被阻止:', controllerResult.error)
          return null
        } else {
          throw new Error(controllerResult.error)
        }
      }
      
      // 创建统一边实例
      const portConfig = this.portConfigFactory.createPortConfiguration(
        sourceNodeId, 
        targetNodeId, 
        connectionRequest.options
      )
      
      const edgeData = {
        id: this.generateEdgeId(),
        source: { nodeId: sourceNodeId, port: portConfig.sourcePort },
        target: { nodeId: targetNodeId, port: portConfig.targetPort },
        type: 'connection',
        branch: options.branchId ? {
          id: options.branchId,
          label: options.branchLabel || `分支 ${options.branchIndex || 1}`,
          index: options.branchIndex || 0
        } : null,
        metadata: {
          createdAt: Date.now(),
          createdBy: options.createdBy || 'system',
          fromPreviewLine: options.fromPreviewLine || false,
          previewLineId: options.previewLineId,
          controllerMethod: controllerResult.method,
          ...options.metadata
        }
      }
      
      const edge = new UnifiedEdge(edgeData)
      
      // 创建X6图形实例
      const x6EdgeConfig = this.createX6EdgeConfig(edge)
      
      // 验证X6配置
      if (!x6EdgeConfig.source) {
        throw new Error(`预览线源节点配置无效: ${JSON.stringify(x6EdgeConfig)}`)
      }
      
      console.log('🎨 [统一边管理器] 准备添加预览线到X6图形:', {
        config: x6EdgeConfig,
        sourceExists: !!this.graph.getCellById(x6EdgeConfig.source),
        graphReady: !!this.graph && typeof this.graph.addEdge === 'function'
      })
      
      const graphInstance = this.graph.addEdge(x6EdgeConfig)
      
      if (!graphInstance) {
        throw new Error('X6图形实例创建失败，addEdge返回null')
      }
      
      edge.setGraphInstance(graphInstance)
      
      // 存储和索引
      this.addToStorage(edge)
      
      // 应用样式
      await this.applyEdgeStyle(edge)
      
      // 清理缓存
      this.clearCache()
      
      // 触发事件
      this.emit('connection:created', { 
        edge, 
        controllerResult,
        portConfig 
      })
      
      // 更新统计
      this.updateStats()
      
      console.log('✅ [统一边管理器] 连接创建成功:', {
        id: edge.id,
        sourceNodeId,
        targetNodeId,
        method: controllerResult.method,
        fromPreviewLine: options.fromPreviewLine
      })
      
      return edge
      
    } catch (error) {
      console.error('❌ [统一边管理器] 连接创建失败:', error)
      throw error
    }
  }
  
  // 直接创建预览线
  async createPreviewLineDirectly(sourceNodeId, options = {}) {
    try {
      // 验证源节点ID
      if (!sourceNodeId || typeof sourceNodeId !== 'string') {
        throw new Error('源节点ID必须是非空字符串')
      }
      
      // 检查预览线重复
      if (this.hasExistingPreviewLine(sourceNodeId, options.branchId)) {
        console.warn('⚠️ [统一边管理器] 预览线已存在:', { sourceNodeId, branchId: options.branchId })
        return null
      }
      
      // 为预览线创建虚拟目标节点ID（避免端口配置工厂的验证错误）
      const virtualTargetId = `preview_target_${sourceNodeId}_${Date.now()}`
      
      // 创建端口配置
      const portConfig = this.portConfigFactory.createPortConfiguration(
        sourceNodeId, 
        virtualTargetId, 
        { ...options, isPreviewLine: true }
      )
      
      // 创建统一边实例
      const edgeData = {
        id: this.generateEdgeId(),
        source: { nodeId: sourceNodeId, port: portConfig.source.port },
        target: null,
        type: 'preview',
        branch: options.branchId ? {
          id: options.branchId,
          label: options.branchLabel || `分支 ${options.branchIndex || 1}`,
          index: options.branchIndex || 0
        } : null,
        metadata: {
          createdAt: Date.now(),
          createdBy: options.createdBy || 'system',
          ...options.metadata
        }
      }
      
      const edge = new UnifiedEdge(edgeData)
      
      // 创建X6图形实例
      const x6EdgeConfig = this.createX6EdgeConfig(edge)
      
      // 验证X6配置
      if (!x6EdgeConfig.source) {
        throw new Error(`连接线源节点配置无效: ${JSON.stringify(x6EdgeConfig)}`)
      }
      
      if (!x6EdgeConfig.target) {
        throw new Error(`连接线目标节点配置无效: ${JSON.stringify(x6EdgeConfig)}`)
      }
      
      console.log('🎨 [统一边管理器] 准备添加连接线到X6图形:', {
        config: x6EdgeConfig,
        sourceExists: !!this.graph.getCellById(x6EdgeConfig.source),
        targetExists: !!this.graph.getCellById(x6EdgeConfig.target),
        graphReady: !!this.graph && typeof this.graph.addEdge === 'function'
      })
      
      const graphInstance = this.graph.addEdge(x6EdgeConfig)
      
      if (!graphInstance) {
        throw new Error('X6图形实例创建失败，addEdge返回null')
      }
      
      edge.setGraphInstance(graphInstance)
      
      // 存储和索引
      this.addToStorage(edge)
      
      // 应用样式
      await this.applyEdgeStyle(edge)
      
      // 清理缓存
      this.clearCache()
      
      // 触发事件
      this.emit('preview:created', { edge, portConfig })
      
      // 更新统计
      this.updateStats()
      
      console.log('✅ [统一边管理器] 预览线创建成功:', {
        id: edge.id,
        sourceNodeId,
        actualSourceNodeId: edge.source.nodeId,
        sourcePort: edge.source.portId,
        branchId: options.branchId,
        graphInstance: !!graphInstance,
        graphInstanceId: graphInstance?.id,
        edgeData: {
          source: edge.source,
          target: edge.target,
          type: edge.type
        }
      })
      
      return edge
      
    } catch (error) {
      console.error('❌ [统一边管理器] 预览线创建失败:', error)
      throw error
    }
  }
  
  // 创建边（原始方法，保持向后兼容）
  async createEdgeFromData(edgeData) {
    return this.withPerformanceMonitoring(async (edgeData) => {
      this.isProcessing.value = true
      
      try {
        // 验证数据
        const validation = await this.validateEdgeData(edgeData)
        if (!validation.isValid) {
          throw new Error(`边数据无效: ${validation.errors.join(', ')}`)
        }
        
        // 检查重复连接（仅对连接线进行检查）
        if (edgeData.type === EdgeTypes.CONNECTION) {
          const sourceId = edgeData.source?.nodeId
          const targetId = edgeData.target?.nodeId
          const branchId = edgeData.branchId || edgeData.branch?.id
          
          if (this.hasConnection(sourceId, targetId, branchId)) {
            console.warn('⚠️ [统一边管理器] 检测到重复连接:', {
              sourceId,
              targetId,
              branchId
            })
            // 返回现有连接而不是创建新的
            const existingConnection = Array.from(this.connections.values()).find(connection => {
              const matchesNodes = connection.source.nodeId === sourceId && 
                                  connection.target?.nodeId === targetId
              const matchesBranch = branchId ? connection.branch?.id === branchId : true
              return matchesNodes && matchesBranch
            })
            return existingConnection
          }
        }
        
        // 预览线重复检查（检查相同源节点和分支的预览线）
        if (edgeData.type === EdgeTypes.PREVIEW) {
          const sourceId = edgeData.source?.nodeId
          const branchId = edgeData.branchId || edgeData.branch?.id
          
          const existingPreview = Array.from(this.previewLines.values()).find(preview => {
            const matchesSource = preview.source.nodeId === sourceId
            const matchesBranch = branchId ? preview.branch?.id === branchId : !preview.branch?.id
            return matchesSource && matchesBranch
          })
          
          if (existingPreview) {
            console.warn('⚠️ [统一边管理器] 检测到重复预览线:', {
              sourceId,
              branchId,
              existingId: existingPreview.id
            })
            return existingPreview
          }
        }
        
        // 连接验证（如果是连接线）
        if (edgeData.type === EdgeTypes.CONNECTION && this.options.enableConnectionValidation) {
          const connectionValidation = await this.validateConnectionWithIntegratedValidators(edgeData)
          if (!connectionValidation.isValid) {
            throw new Error(`连接验证失败: ${connectionValidation.errors.join(', ')}`)
          }
        }
        
        // 创建统一边实例
        const unifiedEdge = new UnifiedEdge(edgeData)
        
        // 创建X6图形实例 - 增强空值检查
        if (!this.graph) {
          throw new Error('Graph实例未初始化')
        }
        
        if (typeof this.graph.addEdge !== 'function') {
          throw new Error('Graph实例的addEdge方法不存在')
        }
        
        const x6EdgeData = unifiedEdge.toX6EdgeData()
        const graphEdge = this.graph.addEdge(x6EdgeData)
        unifiedEdge.graphInstance = graphEdge
        
        // 添加到存储和索引
        this.addToStorage(unifiedEdge)
        
        // 应用样式
        await this.applyEdgeStyle(unifiedEdge)
        
        // 触发事件
        this.emit('edge:created', { edge: unifiedEdge })
        
        // 更新统计
        this.updateStats()
        
        console.log('✅ [统一边管理器] 边创建成功:', {
          id: unifiedEdge.id,
          type: unifiedEdge.type,
          isPreview: unifiedEdge.isPreview
        })
        
        return unifiedEdge
        
      } finally {
        this.isProcessing.value = false
      }
    }, '创建边')(edgeData)
  }
  
  // 创建预览线
  async createPreviewLine(sourceNodeId, options = {}) {
    const previewData = {
      type: EdgeTypes.PREVIEW,
      source: { nodeId: sourceNodeId, port: 'out' }, // 强制设置为 'out'，确保预览线从节点的out端口出发
      target: null,
      state: PreviewStates.INTERACTIVE,
      isPreview: true,
      isConnected: false,
      branchId: options.branchId,
      branchLabel: options.branchLabel,
      branchIndex: options.branchIndex,
      style: {
        stroke: options.stroke || '#52c41a',
        strokeWidth: options.strokeWidth || 2,
        strokeDasharray: '5,5',
        opacity: 0.7,
        ...options.style
      },
      metadata: {
        createdBy: options.createdBy || 'UnifiedEdgeManager',
        nodeType: options.nodeType
      },
      ...options
    }

    return this.createEdge(previewData)
  }
  
  // 创建连接线
  async createConnection(sourceNodeId, targetNodeId, options = {}) {
    const connectionData = {
      type: EdgeTypes.CONNECTION,
      source: { nodeId: sourceNodeId, port: 'out' }, // 强制设置为 'out'，确保连接线从节点的out端口出发
      target: { nodeId: targetNodeId, port: options.targetPort || 'in' },
      state: ConnectionStates.ACTIVE,
      isPreview: false,
      isConnected: true,
      branchId: options.branchId,
      branchLabel: options.branchLabel,
      branchIndex: options.branchIndex,
      style: {
        stroke: options.stroke || '#1890ff',
        strokeWidth: options.strokeWidth || 2,
        opacity: 1
      },
      metadata: {
        createdBy: options.createdBy || 'UnifiedEdgeManager',
        connectionType: options.connectionType || 'normal'
      },
      ...options
    }
    
    return this.createEdge(connectionData)
  }
  
  // 创建连接边（简化接口，用于TaskFlowCanvas）
  async createConnectionEdge(edgeData) {
    try {
      console.log('🔗 [UnifiedEdgeManager] 创建连接边:', edgeData)
      
      // 验证必要参数
      if (!edgeData.sourceNodeId || !edgeData.targetNodeId) {
        throw new Error('缺少必要的源节点或目标节点ID')
      }
      
      // 构建连接数据
      const connectionData = {
        type: EdgeTypes.CONNECTION,
        source: { 
          nodeId: edgeData.sourceNodeId, 
          port: 'out' // 强制设置为 'out'，确保连接线从节点的out端口出发
        },
        target: { 
          nodeId: edgeData.targetNodeId, 
          port: edgeData.targetPortId || 'in' 
        },
        state: ConnectionStates.ACTIVE,
        isPreview: false,
        isConnected: true,
        branchId: edgeData.branchId,
        branchLabel: edgeData.label || edgeData.branchLabel,
        branchIndex: edgeData.branchIndex,
        id: edgeData.id, // 使用提供的ID或自动生成
        style: {
          stroke: '#1890ff',
          strokeWidth: 2,
          opacity: 1
        },
        metadata: {
          createdBy: 'TaskFlowCanvas',
          connectionType: 'normal',
          createdAt: Date.now()
        }
      }
      
      // 使用现有的createEdgeFromData方法
      return await this.createEdgeFromData(connectionData)
      
    } catch (error) {
      console.error('❌ [UnifiedEdgeManager] 创建连接边失败:', error)
      throw error
    }
  }
  
  // 预览线转换为连接线（增强版）
  async convertPreviewToConnection(previewId, targetNodeId, options = {}) {
    return this.withPerformanceMonitoring(async (previewId, targetNodeId, options) => {
      const preview = this.previewLines.get(previewId)
      if (!preview) {
        throw new Error('预览线不存在')
      }
      
      this.isProcessing.value = true
      
      try {
        // 使用连接创建控制器进行转换
        const connectionRequest = {
          fromPreviewLine: true,
          previewLineId: previewId,
          targetNodeId: targetNodeId,
          options: {
            branchId: preview.branch?.id,
            branchLabel: preview.branch?.label,
            branchIndex: preview.branch?.index,
            convertedBy: options.convertedBy || 'system',
            ...options
          }
        }
        
        const controllerResult = await this.connectionController.createConnection(connectionRequest)
        
        if (!controllerResult.success) {
          throw new Error(`预览线转换失败: ${controllerResult.error}`)
        }
        
        // 验证端口配置
        const portConfig = this.portConfigFactory.createPortConfiguration(
          preview.source.nodeId,
          targetNodeId,
          { 
            fromPreviewLine: true,
            previewLineId: previewId,
            ...connectionRequest.options
          }
        )
        
        // 执行 in 端口吸附检测
        if (this.options.enableInPortSnap) {
          const snapResult = await this.snapDetector.checkNodeSnapToPreviewLines(
            targetNodeId,
            [preview],
            { enableHighlight: true }
          )
          
          if (snapResult.hasSnap) {
            console.log('🎯 [统一边管理器] 检测到in端口吸附:', snapResult)
            
            // 应用吸附位置
            if (snapResult.snapPosition && preview.graphInstance) {
              // 更新预览线终点到精确的in端口位置
              const targetNode = this.graph.getCellById(targetNodeId)
              if (targetNode) {
                preview.graphInstance.setTarget(targetNode, portConfig.targetPort)
              }
            }
          }
        }
        
        // 更新边数据
        preview.convertToConnection({ 
          nodeId: targetNodeId, 
          port: portConfig.targetPort
        })
        
        // 更新元数据
        preview.metadata.convertedAt = Date.now()
        preview.metadata.convertedBy = options.convertedBy || 'system'
        preview.metadata.controllerMethod = controllerResult.method
        preview.metadata.portConfig = portConfig
        
        // 更新X6图形
        if (preview.graphInstance) {
          const x6EdgeData = preview.toX6EdgeData()
          preview.graphInstance.setTarget(x6EdgeData.target, { port: portConfig.targetPort })
          preview.graphInstance.setData(x6EdgeData.data)
          preview.graphInstance.setAttrs(x6EdgeData.attrs)
        }
        
        // 更新索引
        this.previewLines.delete(previewId)
        this.connections.set(previewId, preview)
        this.updateNodeIndex(preview)
        this.updatePortIndex(preview)
        
        // 应用连接线样式
        await this.applyEdgeStyle(preview)
        
        // 清理缓存
        this.clearCache()
        
        // 触发事件
        this.emit('preview:converted', { 
          edge: preview, 
          targetNodeId,
          controllerResult,
          portConfig
        })
        
        // 更新统计
        this.updateStats()
        
        console.log('✅ [统一边管理器] 预览线转换成功:', {
          id: preview.id,
          sourceNodeId: preview.source.nodeId,
          targetNodeId,
          method: controllerResult.method,
          snapDetected: this.options.enableInPortSnap
        })
        
        return preview
        
      } finally {
        this.isProcessing.value = false
      }
    }, '预览线转换')(previewId, targetNodeId, options)
  }
  
  // 删除边（增强版）
  async removeEdge(edgeId, options = {}) {
    return this.withPerformanceMonitoring(async (edgeId, options) => {
      const edge = this.edges.get(edgeId)
      if (!edge) {
        console.warn('⚠️ [统一边管理器] 边不存在:', edgeId)
        return false
      }
      
      this.isProcessing.value = true
      
      try {
        // 记录删除信息用于恢复
        const deletionInfo = {
          edge: { ...edge },
          timestamp: Date.now(),
          reason: options.reason || 'manual'
        }
        
        // 从图形中移除
        if (edge.graphInstance && this.graph) {
          this.graph.removeEdge(edge.graphInstance)
        }
        
        // 从存储中移除
        this.removeFromStorage(edge)
        
        // 清理缓存
        this.clearCache()
        
        // 触发事件
        this.emit('edge:removed', { edgeId, edge, deletionInfo })
        
        // 如果是连接线删除，可能需要恢复预览线
        if (edge.isConnectionLine() && options.restorePreview !== false) {
          await this.handleConnectionDeletion(edge, deletionInfo)
        }
        
        // 更新统计
        this.updateStats()
        
        console.log('✅ [统一边管理器] 边删除成功:', edgeId)
        
        return true
        
      } finally {
        this.isProcessing.value = false
      }
    }, '删除边')(edgeId, options)
  }
  
  // 处理连接线删除后的预览线恢复
  async handleConnectionDeletion(deletedConnection, deletionInfo) {
    try {
      // 验证删除的连接数据
      if (!deletedConnection || !deletedConnection.source) {
        console.warn('⚠️ [统一边管理器] 删除的连接数据无效，跳过预览线恢复')
        return
      }
      
      const sourceNodeId = deletedConnection.source.nodeId || deletedConnection.source.cell
      const branchId = deletedConnection.branch?.id
      
      // 验证源节点ID
      if (!sourceNodeId || typeof sourceNodeId !== 'string') {
        console.warn('⚠️ [统一边管理器] 源节点ID无效，跳过预览线恢复:', sourceNodeId)
        return
      }
      
      // 检查源节点是否存在且已配置
      const sourceNode = this.graph?.getCellById(sourceNodeId)
      if (!sourceNode) {
        console.log(`跳过预览线恢复：源节点不存在 ${sourceNodeId}`)
        return
      }
      
      const sourceData = sourceNode.getData() || {}
      const nodeType = sourceData.nodeType || sourceData.type
      const isNodeConfigured = sourceData.isConfigured || nodeType === 'start'
      
      if (!isNodeConfigured) {
        console.log(`跳过预览线恢复：节点未配置 ${sourceNodeId}`)
        return
      }
      
      // 检查是否已存在预览线
      const existingPreview = this.getNodePreviewLines(sourceNodeId)
        .find(p => (p.branch?.id || null) === (branchId || null))
      
      if (existingPreview) {
        console.log(`预览线已存在，无需恢复: ${sourceNodeId}`)
        return
      }
      
      // 创建预览线 - 添加额外的验证
      if (!sourceNodeId || typeof sourceNodeId !== 'string') {
        console.warn('⚠️ [统一边管理器] 源节点ID无效，跳过预览线创建:', sourceNodeId)
        return
      }
      
      const previewLine = await this.createPreviewLine(sourceNodeId, {
        branchId,
        branchLabel: deletedConnection.branch?.label,
        branchIndex: deletedConnection.branch?.index,
        createdBy: 'connection-delete-recovery',
        metadata: {
          recoveredFrom: deletedConnection.id,
          recoveryTimestamp: Date.now()
        }
      })
      
      console.log(`✅ [统一边管理器] 连接删除后预览线恢复成功: ${sourceNodeId}`)
      
      // 触发恢复事件
      this.emit('preview:restored', { 
        previewLine, 
        deletedConnection, 
        deletionInfo 
      })
      
      return previewLine
      
    } catch (error) {
      console.error(`❌ [统一边管理器] 预览线恢复失败:`, error)
      this.emit('preview:restore_failed', { 
        error, 
        deletedConnection, 
        deletionInfo 
      })
    }
  }
  
  // 批量删除预览线（增强版）
  async removePreviewLines(sourceNodeId, branchId = null, options = {}) {
    return this.withPerformanceMonitoring(async (sourceNodeId, branchId, options) => {
      const previewsToRemove = Array.from(this.previewLines.values()).filter(preview => {
        const matchesSource = preview.source.nodeId === sourceNodeId
        const matchesBranch = branchId ? preview.branch?.id === branchId : true
        return matchesSource && matchesBranch
      })
      
      console.log(`🗑️ [统一边管理器] 批量删除预览线:`, {
        sourceNodeId,
        branchId,
        count: previewsToRemove.length
      })
      
      if (this.options.enableBatchOperations && previewsToRemove.length > 1) {
        // 批量操作
        this.stats.batchOperationsCount++
        
        const results = await Promise.allSettled(
          previewsToRemove.map(preview => this.removeEdge(preview.id, options))
        )
        
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length
        
        console.log(`✅ [统一边管理器] 批量删除完成: ${successCount}/${previewsToRemove.length}`)
        
        return { total: previewsToRemove.length, success: successCount, results }
      } else {
        // 单个删除
        const results = []
        for (const preview of previewsToRemove) {
          try {
            const success = await this.removeEdge(preview.id, options)
            results.push({ status: 'fulfilled', value: success })
          } catch (error) {
            results.push({ status: 'rejected', reason: error })
          }
        }
        
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length
        return { total: previewsToRemove.length, success: successCount, results }
      }
    }, '批量删除预览线')(sourceNodeId, branchId, options)
  }
  
  // 获取边
  getEdge(edgeId) {
    return this.edges.get(edgeId)
  }
  
  // 获取预览线
  getPreviewLine(edgeId) {
    return this.previewLines.get(edgeId)
  }
  
  // 获取连接线
  getConnection(edgeId) {
    return this.connections.get(edgeId)
  }
  
  // 获取节点的所有预览线（带缓存）
  getNodePreviewLines(nodeId) {
    const cacheKey = `previews_${nodeId}`
    const cached = this.getCachedResult(cacheKey)
    if (cached) return cached
    
    const result = Array.from(this.previewLines.values()).filter(
      preview => preview.source.nodeId === nodeId
    )
    
    this.setCachedResult(cacheKey, result)
    return result
  }
  
  // 获取节点的所有连接线（带缓存）
  getNodeConnections(nodeId) {
    const cacheKey = `connections_${nodeId}`
    const cached = this.getCachedResult(cacheKey)
    if (cached) return cached
    
    const result = []
    
    // 1. 从内部连接存储获取
    const internalConnections = Array.from(this.connections.values()).filter(
      connection => connection.source.nodeId === nodeId || connection.target?.nodeId === nodeId
    )
    result.push(...internalConnections)
    
    // 2. 从图形中获取实际边
    if (this.graph) {
      const edges = this.graph.getEdges() || []
      const graphConnections = edges
        .filter(edge => {
          const sourceId = edge.getSourceCellId()
          const targetId = edge.getTargetCellId()
          return sourceId === nodeId || targetId === nodeId
        })
        .map(edge => {
          const edgeData = edge.getData() || {}
          return {
            id: edge.id,
            source: { nodeId: edge.getSourceCellId() },
            target: { nodeId: edge.getTargetCellId() },
            data: edgeData,
            edge: edge,
            type: edgeData.isPreview ? 'preview' : 'connection'
          }
        })
      
      // 合并结果，避免重复
      const existingIds = new Set(result.map(conn => conn.id))
      graphConnections.forEach(conn => {
        if (!existingIds.has(conn.id)) {
          result.push(conn)
        }
      })
    }
    
    this.setCachedResult(cacheKey, result)
    return result
  }
  
  // 获取节点的出向连接数
  getNodeOutgoingConnectionCount(nodeId) {
    return this.getNodeConnections(nodeId).filter(
      connection => connection.source.nodeId === nodeId
    ).length
  }
  
  // 获取节点的入向连接数
  getNodeIncomingConnectionCount(nodeId) {
    return this.getNodeConnections(nodeId).filter(
      connection => connection.target?.nodeId === nodeId
    ).length
  }
  
  // 检查预览线是否存在
  hasPreviewLine(sourceNodeId, branchId = null) {
    if (!sourceNodeId) {
      return false
    }
    
    return Array.from(this.previewLines.values()).some(preview => {
      const matchesSource = preview.source.nodeId === sourceNodeId
      const matchesBranch = branchId !== null ? 
        preview.branch?.id === branchId : 
        true
      
      return matchesSource && matchesBranch
    })
  }

  // 检查现有预览线是否存在（别名方法，与hasPreviewLine功能相同）
  hasExistingPreviewLine(sourceNodeId, branchId = null) {
    return this.hasPreviewLine(sourceNodeId, branchId)
  }
  
  // 检查连接是否存在（增强版）
  hasConnection(sourceNodeId, targetNodeId, branchId = null) {
    if (!sourceNodeId || !targetNodeId) {
      return false
    }
    
    return Array.from(this.connections.values()).some(connection => {
      const matchesNodes = connection.source.nodeId === sourceNodeId && 
                          connection.target?.nodeId === targetNodeId
      
      // 分支匹配逻辑：
      // 1. 如果指定了 branchId，则必须完全匹配
      // 2. 如果没有指定 branchId，则忽略分支检查
      const matchesBranch = branchId !== null ? 
        connection.branch?.id === branchId : 
        true
      
      return matchesNodes && matchesBranch
    })
  }

  /**
   * 节点配置完成事件处理
   * @param {string} nodeId - 节点ID
   * @param {Object} config - 节点配置
   * @returns {Promise<boolean>} 处理结果
   */
  async onNodeConfigured(nodeId, config) {
    try {
      console.log('🔧 [UnifiedEdgeManager] 处理节点配置完成事件:', { nodeId, config })
      
      // 获取节点实例
      const node = this.graph?.getCellById(nodeId)
      if (!node) {
        console.warn('⚠️ [UnifiedEdgeManager] 节点不存在:', nodeId)
        return false
      }
      
      // 调用配置后预览线创建
      return await this.createPreviewLineAfterConfig(node, config)
      
    } catch (error) {
      console.error('❌ [UnifiedEdgeManager] 节点配置完成事件处理失败:', error)
      return false
    }
  }

  /**
   * 配置后创建预览线
   * @param {Object} node - 节点实例
   * @param {Object} config - 节点配置
   * @returns {Promise<boolean>} 创建结果
   */
  async createPreviewLineAfterConfig(node, config) {
    try {
      const nodeId = node.id
      const nodeData = node.getData() || {}
      const nodeType = config.type || nodeData.type || nodeData.nodeType
      
      console.log('🔧 [UnifiedEdgeManager] 配置后创建预览线:', { 
        nodeId, 
        nodeType, 
        config 
      })
      
      // 检查节点类型，决定创建策略
      const branchTypes = ['crowd-split', 'event-split', 'ab-test', 'audience-split']
      
      if (branchTypes.includes(nodeType)) {
        // 分支节点：根据配置创建多条预览线
        return await this.createBranchPreviewLines(node, config)
      } else {
        // 普通节点：创建单条预览线
        return await this.createSinglePreviewLine(node, config)
      }
      
    } catch (error) {
      console.error('❌ [UnifiedEdgeManager] 配置后预览线创建失败:', error)
      return false
    }
  }

  /**
   * 处理节点配置（别名方法）
   * @param {Object} node - 节点实例
   * @param {Object} config - 节点配置
   * @returns {Promise<boolean>} 处理结果
   */
  async handleNodeConfigured(node, config) {
    return await this.createPreviewLineAfterConfig(node, config)
  }

  /**
   * 为分支节点创建多条预览线
   * @param {Object} node - 节点实例
   * @param {Object} config - 节点配置
   * @returns {Promise<boolean>} 创建结果
   */
  async createBranchPreviewLines(node, config) {
    try {
      const nodeId = node.id
      const nodeType = config.type || node.getData()?.type
      const nodeData = node.getData() || {}
      
      console.log('🌿 [UnifiedEdgeManager] 创建分支预览线:', { 
        nodeId, 
        nodeType, 
        config,
        nodeData: {
          type: nodeData.type,
          isConfigured: nodeData.isConfigured,
          hasConfig: !!nodeData.config,
          configKeys: nodeData.config ? Object.keys(nodeData.config) : [],
          hasCrowdLayers: !!(nodeData.crowdLayers || nodeData.config?.crowdLayers),
          hasUnmatchBranch: !!(nodeData.unmatchBranch || nodeData.config?.unmatchBranch)
        }
      })
      
      // 获取分支配置
      let branches = []
      
      if (nodeType === 'crowd-split' || nodeType === 'audience-split') {
        // 人群分流节点 - 支持多种配置存储位置
        let crowdLayers = null
        let unmatchBranch = null
        
        // 优先级：config参数 > nodeData.config > nodeData直接属性
        if (config.crowdLayers && Array.isArray(config.crowdLayers)) {
          crowdLayers = config.crowdLayers
          unmatchBranch = config.unmatchBranch
          console.log('🔍 [UnifiedEdgeManager] 使用config参数中的crowdLayers')
        } else if (nodeData.config?.crowdLayers && Array.isArray(nodeData.config.crowdLayers)) {
          crowdLayers = nodeData.config.crowdLayers
          unmatchBranch = nodeData.config.unmatchBranch
          console.log('🔍 [UnifiedEdgeManager] 使用nodeData.config中的crowdLayers')
        } else if (nodeData.crowdLayers && Array.isArray(nodeData.crowdLayers)) {
          crowdLayers = nodeData.crowdLayers
          unmatchBranch = nodeData.unmatchBranch
          console.log('🔍 [UnifiedEdgeManager] 使用nodeData直接属性中的crowdLayers')
        }
        
        console.log('🔍 [UnifiedEdgeManager] 人群分流配置解析结果:', {
          nodeId,
          hasCrowdLayers: !!crowdLayers,
          crowdLayersCount: crowdLayers ? crowdLayers.length : 0,
          hasUnmatchBranch: !!unmatchBranch,
          crowdLayers,
          unmatchBranch
        })
        
        if (crowdLayers && crowdLayers.length > 0) {
          branches = crowdLayers.map((layer, index) => ({
            id: layer.id || `crowd_${index}`,
            label: layer.crowdName || layer.name || layer.label || `人群 ${index + 1}`,
            index: index,
            type: 'audience'
          }))
          
          // 添加未匹配分支
          if (unmatchBranch) {
            branches.push({
              id: unmatchBranch.id || 'unmatch',
              label: unmatchBranch.label || unmatchBranch.name || unmatchBranch.crowdName || '未匹配',
              index: branches.length,
              type: 'audience',
              isDefault: true
            })
          }
        } else {
          console.warn('⚠️ [UnifiedEdgeManager] 未找到有效的crowdLayers配置')
        }
      } else if (nodeType === 'event-split') {
        // 事件分流节点
        branches.push({
          id: 'yes',
          label: config.yesLabel || '是',
          index: 0,
          type: 'event'
        })
        branches.push({
          id: 'no',
          label: config.noLabel || '否',
          index: 1,
          type: 'event'
        })
      } else if (nodeType === 'ab-test') {
        // A/B测试节点
        branches.push({
          id: 'group_a',
          label: config.groupALabel || '组A',
          index: 0,
          type: 'ab-test'
        })
        branches.push({
          id: 'group_b',
          label: config.groupBLabel || '组B',
          index: 1,
          type: 'ab-test'
        })
      }
      
      console.log('🌿 [UnifiedEdgeManager] 解析到的分支:', branches)
      
      if (branches.length === 0) {
        console.warn('⚠️ [UnifiedEdgeManager] 未找到有效分支配置')
        return false
      }
      
      // 检查现有连接，避免为已连接的分支创建预览线
      const existingConnections = this.getNodeConnections(nodeId)
      const connectedBranches = new Set()
      
      existingConnections.forEach(connection => {
        if (connection.data?.branchId && !connection.data?.isPreview) {
          connectedBranches.add(connection.data.branchId)
        }
      })
      
      console.log('🔍 [UnifiedEdgeManager] 已连接的分支:', Array.from(connectedBranches))
      
      // 清理现有预览线
      await this.cleanupNodePreviewLines(nodeId)
      
      // 为每个未连接的分支创建预览线
      const results = []
      for (const branch of branches) {
        // 跳过已连接的分支
        if (connectedBranches.has(branch.id)) {
          console.log('⏭️ [UnifiedEdgeManager] 跳过已连接的分支:', {
            nodeId,
            branchId: branch.id,
            branchLabel: branch.label
          })
          continue
        }
        
        try {
          const previewLine = await this.createPreviewLineDirectly(nodeId, {
            branchId: branch.id,
            branchLabel: branch.label,
            branchIndex: branch.index,
            branchType: branch.type,
            createdBy: 'branch-config',
            nodeType: nodeType
          })
          
          if (previewLine) {
            results.push(previewLine)
            console.log('✅ [UnifiedEdgeManager] 分支预览线创建成功:', {
              nodeId,
              branchId: branch.id,
              branchLabel: branch.label
            })
          }
        } catch (error) {
          console.error('❌ [UnifiedEdgeManager] 分支预览线创建失败:', {
            nodeId,
            branchId: branch.id,
            error: error.message
          })
        }
      }
      
      console.log('🌿 [UnifiedEdgeManager] 分支预览线创建完成:', {
        nodeId,
        totalBranches: branches.length,
        connectedBranches: connectedBranches.size,
        createdPreviewLines: results.length
      })
      
      return results.length > 0
      
    } catch (error) {
      console.error('❌ [UnifiedEdgeManager] 分支预览线创建失败:', error)
      return false
    }
  }

  /**
   * 为普通节点创建单条预览线
   * @param {Object} node - 节点实例
   * @param {Object} config - 节点配置
   * @returns {Promise<boolean>} 创建结果
   */
  async createSinglePreviewLine(node, config) {
    try {
      const nodeId = node.id
      
      console.log('📏 [UnifiedEdgeManager] 创建单条预览线:', { nodeId, config })
      
      // 检查是否已存在预览线
      if (this.hasPreviewLine(nodeId)) {
        console.log('📏 [UnifiedEdgeManager] 预览线已存在，跳过创建:', nodeId)
        return true
      }
      
      // 创建预览线
      const previewLine = await this.createPreviewLineDirectly(nodeId, {
        createdBy: 'single-config',
        nodeType: config.type || node.getData()?.type
      })
      
      if (previewLine) {
        console.log('✅ [UnifiedEdgeManager] 单条预览线创建成功:', nodeId)
        return true
      } else {
        console.warn('⚠️ [UnifiedEdgeManager] 单条预览线创建失败:', nodeId)
        return false
      }
      
    } catch (error) {
      console.error('❌ [UnifiedEdgeManager] 单条预览线创建失败:', error)
      return false
    }
  }

  /**
   * 清理节点的所有预览线
   * @param {string} nodeId - 节点ID
   * @returns {Promise<number>} 清理的预览线数量
   */
  async cleanupNodePreviewLines(nodeId) {
    try {
      console.log('🧹 [UnifiedEdgeManager] 开始清理节点预览线:', nodeId)
      
      let cleanedCount = 0
      const previewLinesToRemove = []
      
      // 1. 从内部存储中查找预览线
      for (const [previewId, preview] of this.previewLines) {
        if (preview.source?.nodeId === nodeId) {
          previewLinesToRemove.push(previewId)
        }
      }
      
      // 2. 从图形中查找预览线
      if (this.graph) {
        const edges = this.graph.getEdges() || []
        edges.forEach(edge => {
          const edgeData = edge.getData() || {}
          if (edgeData.isPreview && edge.getSourceCellId() === nodeId) {
            previewLinesToRemove.push(edge.id)
          }
        })
      }
      
      // 3. 移除重复项
      const uniquePreviewIds = [...new Set(previewLinesToRemove)]
      
      // 4. 执行清理
      for (const previewId of uniquePreviewIds) {
        try {
          await this.removeEdge(previewId, { 
            skipValidation: true,
            reason: 'node-cleanup',
            silent: true 
          })
          cleanedCount++
          console.log('✅ [UnifiedEdgeManager] 清理预览线成功:', previewId)
        } catch (error) {
          console.warn('⚠️ [UnifiedEdgeManager] 清理预览线失败:', {
            previewId,
            error: error.message
          })
        }
      }
      
      // 5. 清理缓存
      this.clearCache()
      
      console.log('🧹 [UnifiedEdgeManager] 节点预览线清理完成:', {
        nodeId,
        cleanedCount,
        totalFound: uniquePreviewIds.length
      })
      
      return cleanedCount
      
    } catch (error) {
      console.error('❌ [UnifiedEdgeManager] 清理节点预览线失败:', {
        nodeId,
        error: error.message,
        stack: error.stack
      })
      return 0
    }
  }

  // 检查端口是否被占用
  isPortOccupied(nodeId, port, direction = 'out') {
    const connections = this.getNodeConnections(nodeId)
    return connections.some(connection => {
      if (direction === 'out') {
        return connection.source.nodeId === nodeId && connection.source.port === port
      } else {
        return connection.target?.nodeId === nodeId && connection.target?.port === port
      }
    })
  }
  
  // 状态转换
  async transitionEdgeState(edgeId, newState) {
    const edge = this.edges.get(edgeId)
    if (!edge) {
      throw new Error('边不存在')
    }
    
    // 验证转换
    if (!canTransitionState(edge.state, newState)) {
      throw new Error(`不允许从 ${edge.state} 转换到 ${newState}`)
    }
    
    const oldState = edge.state
    edge.updateState(newState)
    
    // 更新图形
    if (edge.graphInstance) {
      edge.graphInstance.setData(edge.toX6EdgeData().data)
    }
    
    // 清理缓存
    this.clearCache()
    
    // 触发事件
    this.emit('edge:stateChanged', { edge, oldState, newState })
    
    console.log('🔄 [统一边管理器] 状态转换:', {
      edgeId,
      oldState,
      newState
    })
    
    return edge
  }
  
  // 应用边样式
  async applyEdgeStyle(edge) {
    if (!edge.graphInstance) return
    
    const style = getEdgeDisplayStyle(edge)
    edge.graphInstance.setAttrs({ line: style })
    
    // 更新边的样式数据
    Object.assign(edge.style, style)
  }
  
  // 验证边数据（增强版）
  async validateEdgeData(edgeData) {
    const errors = []
    
    if (!edgeData.source?.nodeId && !edgeData.source) {
      errors.push('缺少源节点ID')
    }
    
    if (edgeData.type === EdgeTypes.CONNECTION && !edgeData.target?.nodeId && !edgeData.target) {
      errors.push('连接线必须有目标节点')
    }
    
    // 验证源节点存在
    if (edgeData.source?.nodeId && this.graph) {
      const sourceNode = this.graph.getCellById(edgeData.source.nodeId)
      if (!sourceNode) {
        errors.push('源节点不存在')
      }
    }
    
    // 验证目标节点存在（如果有）
    if (edgeData.target?.nodeId && this.graph) {
      const targetNode = this.graph.getCellById(edgeData.target.nodeId)
      if (!targetNode) {
        errors.push('目标节点不存在')
      }
    }
    
    // 端口验证
    if (this.options.enablePortValidation) {
      const portValidation = await this.validatePorts(edgeData)
      if (!portValidation.isValid) {
        errors.push(...portValidation.errors)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  // 端口验证
  async validatePorts(edgeData) {
    const errors = []
    
    // 检查源端口
    if (edgeData.source?.port && edgeData.source?.nodeId) {
      if (this.isPortOccupied(edgeData.source.nodeId, edgeData.source.port, 'out')) {
        errors.push(`源端口 ${edgeData.source.port} 已被占用`)
      }
    }
    
    // 检查目标端口
    if (edgeData.target?.port && edgeData.target?.nodeId) {
      if (this.isPortOccupied(edgeData.target.nodeId, edgeData.target.port, 'in')) {
        errors.push(`目标端口 ${edgeData.target.port} 已被占用`)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  // 检查重复边
  checkDuplicateEdge(edgeData) {
    console.warn('⚠️ [统一边管理器] checkDuplicateEdge 方法已弃用，请使用 hasConnection 或 hasPreviewLine')
    
    const sourceId = edgeData.source?.nodeId || edgeData.source
    const targetId = edgeData.target?.nodeId || edgeData.target
    const branchId = edgeData.branchId || edgeData.branch?.id
    
    if (edgeData.type === EdgeTypes.CONNECTION) {
      return {
        isDuplicate: this.hasConnection(sourceId, targetId, branchId),
        existing: null
      }
    } else if (edgeData.type === EdgeTypes.PREVIEW) {
      return {
        isDuplicate: this.hasPreviewLine(sourceId, branchId),
        existing: null
      }
    }
    
    return {
      isDuplicate: false,
      existing: null
    }
  }
  
  // 集成验证器的连接验证
  async validateConnectionWithIntegratedValidators(edgeData) {
    const errors = []
    
    try {
      // 使用 ConnectionLimitManager 验证
      if (this.connectionLimitManager) {
        const limitValidation = await this.connectionLimitManager.validateConnection(
          edgeData.source.nodeId,
          edgeData.target.nodeId,
          {
            sourcePort: edgeData.source.port,
            targetPort: edgeData.target.port,
            branchId: edgeData.branchId || edgeData.branch?.id
          }
        )
        
        if (!limitValidation.isValid) {
          errors.push(...limitValidation.errors)
        }
      }
      
      // 使用 PortConfigValidator 验证
      if (this.portConfigValidator) {
        // 验证源节点端口配置
        const sourceValidation = await this.portConfigValidator.validateNodePortConfig(
          edgeData.source.nodeId,
          { port: edgeData.source.port, direction: 'out' }
        )
        
        if (!sourceValidation.isValid) {
          errors.push(...sourceValidation.errors.map(err => `源节点: ${err}`))
        }
        
        // 验证目标节点端口配置
        const targetValidation = await this.portConfigValidator.validateNodePortConfig(
          edgeData.target.nodeId,
          { port: edgeData.target.port, direction: 'in' }
        )
        
        if (!targetValidation.isValid) {
          errors.push(...targetValidation.errors.map(err => `目标节点: ${err}`))
        }
      }
      
      // 使用内置 ConnectionValidator 验证
      if (this.connectionValidator) {
        const connectionValidation = await this.connectionValidator.validateConnection(edgeData)
        if (!connectionValidation.isValid) {
          errors.push(...connectionValidation.errors)
        }
      }
      
    } catch (error) {
      console.error('❌ [统一边管理器] 集成验证器验证失败:', error)
      errors.push(`验证器错误: ${error.message}`)
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  // 验证预览线到连接线转换（增强版）
  async validatePreviewToConnectionConversion(preview, targetNodeId, options = {}) {
    const errors = []
    
    if (!preview.isPreviewLine()) {
      errors.push('不是预览线')
    }
    
    if (!targetNodeId) {
      errors.push('缺少目标节点ID')
    }
    
    if (this.hasConnection(preview.source.nodeId, targetNodeId, preview.branch?.id)) {
      errors.push('连接已存在')
    }
    
    // 检查连接数限制
    if (this.options.enableConnectionValidation) {
      const outgoingCount = this.getNodeOutgoingConnectionCount(preview.source.nodeId)
      if (outgoingCount >= this.options.maxConnectionsPerNode) {
        errors.push(`源节点连接数已达上限 (${outgoingCount}/${this.options.maxConnectionsPerNode})`)
      }
      
      const incomingCount = this.getNodeIncomingConnectionCount(targetNodeId)
      if (incomingCount >= this.options.maxConnectionsPerNode) {
        errors.push(`目标节点连接数已达上限 (${incomingCount}/${this.options.maxConnectionsPerNode})`)
      }
    }
    
    // 端口验证
    if (this.options.enablePortValidation && options.targetPort) {
      if (this.isPortOccupied(targetNodeId, options.targetPort, 'in')) {
        errors.push(`目标端口 ${options.targetPort} 已被占用`)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  // 添加到存储
  addToStorage(edge) {
    this.edges.set(edge.id, edge)
    
    if (edge.isPreviewLine()) {
      this.previewLines.set(edge.id, edge)
    } else if (edge.isConnectionLine()) {
      this.connections.set(edge.id, edge)
    }
    
    // 更新索引
    this.updateNodeIndex(edge)
    this.updatePortIndex(edge)
  }
  
  // 从存储中移除
  removeFromStorage(edge) {
    this.edges.delete(edge.id)
    this.previewLines.delete(edge.id)
    this.connections.delete(edge.id)
    
    // 更新索引
    this.removeFromNodeIndex(edge)
    this.removeFromPortIndex(edge)
  }
  
  // 更新节点索引
  updateNodeIndex(edge) {
    const sourceId = edge.source.nodeId
    if (!this.nodeEdgeIndex.has(sourceId)) {
      this.nodeEdgeIndex.set(sourceId, new Set())
    }
    this.nodeEdgeIndex.get(sourceId).add(edge.id)
    
    if (edge.target?.nodeId) {
      const targetId = edge.target.nodeId
      if (!this.nodeEdgeIndex.has(targetId)) {
        this.nodeEdgeIndex.set(targetId, new Set())
      }
      this.nodeEdgeIndex.get(targetId).add(edge.id)
    }
  }
  
  // 从节点索引中移除
  removeFromNodeIndex(edge) {
    const sourceId = edge.source.nodeId
    if (this.nodeEdgeIndex.has(sourceId)) {
      this.nodeEdgeIndex.get(sourceId).delete(edge.id)
      if (this.nodeEdgeIndex.get(sourceId).size === 0) {
        this.nodeEdgeIndex.delete(sourceId)
      }
    }
    
    if (edge.target?.nodeId) {
      const targetId = edge.target.nodeId
      if (this.nodeEdgeIndex.has(targetId)) {
        this.nodeEdgeIndex.get(targetId).delete(edge.id)
        if (this.nodeEdgeIndex.get(targetId).size === 0) {
          this.nodeEdgeIndex.delete(targetId)
        }
      }
    }
  }
  
  // 更新端口索引
  updatePortIndex(edge) {
    if (edge.source?.port) {
      const sourceKey = `${edge.source.nodeId}:${edge.source.port}:out`
      this.portConnectionIndex.set(sourceKey, edge.id)
    }
    
    if (edge.target?.port) {
      const targetKey = `${edge.target.nodeId}:${edge.target.port}:in`
      this.portConnectionIndex.set(targetKey, edge.id)
    }
  }
  
  // 从端口索引中移除
  removeFromPortIndex(edge) {
    if (edge.source?.port) {
      const sourceKey = `${edge.source.nodeId}:${edge.source.port}:out`
      this.portConnectionIndex.delete(sourceKey)
    }
    
    if (edge.target?.port) {
      const targetKey = `${edge.target.nodeId}:${edge.target.port}:in`
      this.portConnectionIndex.delete(targetKey)
    }
  }
  
  // 缓存管理
  getCachedResult(key) {
    const now = Date.now()
    if (now - this.cache.lastCacheUpdate > this.cache.cacheTimeout) {
      this.clearCache()
      return null
    }
    
    return this.cache.validationResults.get(key)
  }
  
  setCachedResult(key, result) {
    this.cache.validationResults.set(key, result)
    this.cache.lastCacheUpdate = Date.now()
  }
  
  clearCache() {
    this.cache.nodeConnections.clear()
    this.cache.portUsage.clear()
    this.cache.validationResults.clear()
    this.cache.lastCacheUpdate = Date.now()
  }
  
  // 更新统计信息
  updateStats() {
    this.stats.totalEdges = this.edges.size
    this.stats.previewCount = this.previewLines.size
    this.stats.connectionCount = this.connections.size
    this.stats.operationsCount++
    this.stats.lastOperationTime = Date.now()
  }
  
  // 设置自动清理
  setupAutoCleanup() {
    setInterval(() => {
      this.performAutoCleanup()
    }, this.options.cleanupInterval)
  }
  
  // 执行自动清理（增强版）
  async performAutoCleanup() {
    try {
      console.log('🧹 [统一边管理器] 开始自动清理...')
      
      let cleanedCount = 0
      
      // 🔧 修复：添加连接线保护逻辑，避免误删真实连接线
      const protectedConnections = new Set()
      
      // 1. 识别并保护真实连接线
      for (const [id, connection] of this.connections) {
        if (connection.target && connection.target.nodeId) {
          protectedConnections.add(id)
          console.log('🛡️ [统一边管理器] 保护真实连接线:', {
            id,
            source: connection.source?.nodeId,
            target: connection.target?.nodeId
          })
        }
      }
      
      // 清理无效边
      for (const [id, edge] of this.edges) {
        // 跳过受保护的连接线
        if (protectedConnections.has(id)) {
          continue
        }
        
        if (!edge.isValid || !edge.graphInstance) {
          console.log('🧹 [统一边管理器] 清理无效边:', { id, isValid: edge.isValid, hasGraphInstance: !!edge.graphInstance })
          await this.removeEdge(id, { reason: 'auto_cleanup_invalid' })
          cleanedCount++
        }
      }
      
      // 清理孤立预览线 - 更严格的验证，但不清理连接线
      for (const [id, preview] of this.previewLines) {
        try {
          // 跳过受保护的连接线
          if (protectedConnections.has(id)) {
            continue
          }
          
          // 验证预览线的源节点ID
          const sourceNodeId = preview.source?.nodeId
          if (!sourceNodeId || typeof sourceNodeId !== 'string') {
            console.warn('⚠️ [统一边管理器] 预览线源节点ID无效，删除:', id, sourceNodeId)
            await this.removeEdge(id, { reason: 'auto_cleanup_invalid_source' })
            cleanedCount++
            continue
          }
          
          // 更严格的节点存在性检查
          const sourceNode = this.graph.getCellById(sourceNodeId)
          if (!sourceNode) {
            // 再次确认节点确实不存在，避免误删
            const allNodes = this.graph.getNodes() || []
            const nodeExists = allNodes.some(node => node.id === sourceNodeId || node.getId?.() === sourceNodeId)
            
            if (!nodeExists) {
              console.log('🧹 [统一边管理器] 清理孤立预览线:', { 
                previewId: id, 
                sourceNodeId, 
                reason: 'source_node_not_found' 
              })
              await this.removeEdge(id, { reason: 'auto_cleanup_orphaned' })
              cleanedCount++
            } else {
              console.log('🔍 [统一边管理器] 预览线源节点存在，跳过清理:', { 
                previewId: id, 
                sourceNodeId 
              })
            }
          }
        } catch (error) {
          console.warn('⚠️ [统一边管理器] 清理预览线时出错:', id, error.message)
          // 跳过有问题的预览线，继续清理其他的
        }
      }
      
      // 🔧 修复：更谨慎地清理连接线，只清理确实无效的
      for (const [id, connection] of this.connections) {
        // 跳过受保护的连接线
        if (protectedConnections.has(id)) {
          continue
        }
        
        // 只有在源节点和目标节点都不存在时才清理
        const sourceNode = this.graph.getCellById(connection.source.nodeId)
        const targetNode = connection.target ? this.graph.getCellById(connection.target.nodeId) : null
        
        // 如果是预览线（没有目标节点），不在这里清理
        if (!connection.target) {
          continue
        }
        
        if (!sourceNode || !targetNode) {
          console.log('🧹 [统一边管理器] 清理无效连接:', { 
            connectionId: id, 
            sourceExists: !!sourceNode, 
            targetExists: !!targetNode,
            hasTarget: !!connection.target
          })
          await this.removeEdge(id, { reason: 'auto_cleanup_invalid_connection' })
          cleanedCount++
        }
      }
      
      this.lastCleanupTime.value = Date.now()
      
      if (cleanedCount > 0) {
        console.log(`✅ [统一边管理器] 自动清理完成，清理了 ${cleanedCount} 条边`)
        this.emit('cleanup:completed', { cleanedCount })
      } else {
        console.log('✅ [统一边管理器] 自动清理完成，无需清理')
      }
      
    } catch (error) {
      console.error('❌ [统一边管理器] 自动清理失败:', error)
      this.emit('cleanup:failed', { error })
    }
  }
  
  // 设置性能监控
  setupPerformanceMonitoring() {
    // 监控边数量
    setInterval(() => {
      if (this.edges.size > this.options.maxEdges) {
        console.warn(`⚠️ [统一边管理器] 边数量超过限制: ${this.edges.size}/${this.options.maxEdges}`)
        this.emit('performance:warning', { 
          type: 'max_edges_exceeded', 
          current: this.edges.size, 
          max: this.options.maxEdges 
        })
      }
    }, 10000) // 每10秒检查一次
    
    // 监控缓存大小
    setInterval(() => {
      const cacheSize = this.cache.validationResults.size
      if (cacheSize > 100) {
        console.warn(`⚠️ [统一边管理器] 缓存大小过大: ${cacheSize}`)
        this.clearCache()
      }
    }, 30000) // 每30秒检查一次
  }
  
  // 设置问题诊断
  setupProblemDiagnosis() {
    setInterval(() => {
      this.performProblemDiagnosis()
    }, 60000) // 每分钟诊断一次
  }
  
  // 执行问题诊断（增强版）
  async performProblemDiagnosis() {
    try {
      // 检查重复边
      this.diagnostics.duplicateEdges = this.findDuplicateEdges()
      
      // 检查孤立预览线
      this.diagnostics.orphanedPreviews = this.findOrphanedPreviewLines()
      
      // 检查无效连接
      this.diagnostics.invalidConnections = this.findInvalidConnections()
      
      // 检查端口冲突
      this.diagnostics.portConflicts = this.findPortConflicts()
      
      // 检查连接数限制违规
      this.diagnostics.connectionLimitViolations = this.findConnectionLimitViolations()
      
      this.diagnostics.lastDiagnosisTime = Date.now()
      
      const totalProblems = this.diagnostics.duplicateEdges.length + 
                           this.diagnostics.orphanedPreviews.length + 
                           this.diagnostics.invalidConnections.length +
                           this.diagnostics.portConflicts.length +
                           this.diagnostics.connectionLimitViolations.length
      
      if (totalProblems > 0) {
        console.warn(`⚠️ [统一边管理器] 发现 ${totalProblems} 个问题`)
        this.emit('diagnosis:problems_found', { diagnostics: this.diagnostics })
      }
      
    } catch (error) {
      console.error('❌ [统一边管理器] 问题诊断失败:', error)
    }
  }
  
  // 查找重复边
  findDuplicateEdges() {
    const edgeGroups = new Map()
    
    for (const edge of this.edges.values()) {
      const key = edge.getConnectionKey()
      if (!edgeGroups.has(key)) {
        edgeGroups.set(key, [])
      }
      edgeGroups.get(key).push(edge)
    }
    
    return Array.from(edgeGroups.values()).filter(group => group.length > 1)
  }
  
  // 查找孤立预览线
  findOrphanedPreviewLines() {
    return Array.from(this.previewLines.values()).filter(preview => {
      const sourceNode = this.graph?.getCellById(preview.source.nodeId)
      const isOrphaned = !sourceNode
      
      if (isOrphaned) {
        console.log('🔍 [统一边管理器] 发现孤立预览线:', {
          previewId: preview.id,
          sourceNodeId: preview.source.nodeId,
          sourceExists: !!sourceNode,
          graphCells: this.graph?.getCells()?.length || 0
        })
      }
      
      return isOrphaned
    })
  }
  
  // 查找无效连接
  findInvalidConnections() {
    return Array.from(this.connections.values()).filter(connection => {
      const sourceNode = this.graph?.getCellById(connection.source.nodeId)
      const targetNode = this.graph?.getCellById(connection.target?.nodeId)
      return !sourceNode || !targetNode
    })
  }
  
  // 查找端口冲突
  findPortConflicts() {
    const portUsage = new Map()
    const conflicts = []
    
    for (const edge of this.edges.values()) {
      if (edge.source?.port) {
        const sourceKey = `${edge.source.nodeId}:${edge.source.port}:out`
        if (portUsage.has(sourceKey)) {
          conflicts.push({
            type: 'source_port_conflict',
            port: edge.source.port,
            nodeId: edge.source.nodeId,
            edges: [portUsage.get(sourceKey), edge.id]
          })
        } else {
          portUsage.set(sourceKey, edge.id)
        }
      }
      
      if (edge.target?.port) {
        const targetKey = `${edge.target.nodeId}:${edge.target.port}:in`
        if (portUsage.has(targetKey)) {
          conflicts.push({
            type: 'target_port_conflict',
            port: edge.target.port,
            nodeId: edge.target.nodeId,
            edges: [portUsage.get(targetKey), edge.id]
          })
        } else {
          portUsage.set(targetKey, edge.id)
        }
      }
    }
    
    return conflicts
  }
  
  // 查找连接数限制违规
  findConnectionLimitViolations() {
    const violations = []
    const nodeConnectionCounts = new Map()
    
    // 统计每个节点的连接数
    for (const connection of this.connections.values()) {
      // 出向连接
      const sourceId = connection.source.nodeId
      if (!nodeConnectionCounts.has(sourceId)) {
        nodeConnectionCounts.set(sourceId, { outgoing: 0, incoming: 0 })
      }
      nodeConnectionCounts.get(sourceId).outgoing++
      
      // 入向连接
      if (connection.target?.nodeId) {
        const targetId = connection.target.nodeId
        if (!nodeConnectionCounts.has(targetId)) {
          nodeConnectionCounts.set(targetId, { outgoing: 0, incoming: 0 })
        }
        nodeConnectionCounts.get(targetId).incoming++
      }
    }
    
    // 检查违规
    for (const [nodeId, counts] of nodeConnectionCounts) {
      if (counts.outgoing > this.options.maxConnectionsPerNode) {
        violations.push({
          type: 'outgoing_limit_exceeded',
          nodeId,
          current: counts.outgoing,
          limit: this.options.maxConnectionsPerNode
        })
      }
      
      if (counts.incoming > this.options.maxConnectionsPerNode) {
        violations.push({
          type: 'incoming_limit_exceeded',
          nodeId,
          current: counts.incoming,
          limit: this.options.maxConnectionsPerNode
        })
      }
    }
    
    return violations
  }
  
  // 事件系统
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
  }
  
  off(event, callback) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }
  
  emit(event, data) {
    const listeners = this.eventListeners.get(event) || []
    listeners.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`❌ [统一边管理器] 事件回调错误 (${event}):`, error)
      }
    })
  }
  
  // 获取统计信息
  getStats() {
    return { ...this.stats }
  }
  
  // 获取诊断信息
  getDiagnostics() {
    return { ...this.diagnostics }
  }
  
  // 创建X6边配置（关键方法实现）
  createX6EdgeConfig(edge) {
    if (!edge) {
      throw new Error('边实例不能为空')
    }
    
    // 基础配置
    const config = {
      id: edge.id,
      source: edge.source.nodeId,
      sourcePort: 'out', // 强制设置为 'out'，确保预览线从节点的out端口出发
      shape: 'edge',
      zIndex: 1,
      // 确保边可见
      visible: true
    }
    
    // 如果有目标节点，添加目标配置
    if (edge.target?.nodeId) {
      config.target = edge.target.nodeId
      config.targetPort = edge.target.portId || 'in'
    }
    
    // 根据边类型设置不同的样式
    if (edge.isPreviewLine()) {
      // 预览线样式：虚线，蓝色
      config.attrs = {
        line: {
          stroke: this.options.previewLineStyle.stroke || '#1890ff',
          strokeWidth: this.options.previewLineStyle.strokeWidth || 2,
          strokeDasharray: this.options.previewLineStyle.strokeDasharray || '5,5',
          opacity: this.options.previewLineStyle.opacity || 0.8,
          targetMarker: null, // 预览线不显示箭头
          // 确保线条可见
          display: 'block',
          visibility: 'visible'
        }
      }
    } else if (edge.isConnectionLine()) {
      // 连接线样式：实线，绿色，带箭头
      config.attrs = {
        line: {
          stroke: this.options.connectionStyle.stroke || '#52c41a',
          strokeWidth: this.options.connectionStyle.strokeWidth || 2,
          strokeDasharray: 'none',
          opacity: this.options.connectionStyle.opacity || 1,
          targetMarker: {
            name: 'block',
            width: 8,
            height: 8,
            fill: this.options.connectionStyle.stroke || '#52c41a'
          },
          // 确保线条可见
          display: 'block',
          visibility: 'visible'
        }
      }
    } else {
      // 默认样式
      config.attrs = {
        line: {
          stroke: '#5F95FF',
          strokeWidth: 2,
          strokeDasharray: 'none',
          opacity: 1,
          targetMarker: {
            name: 'block',
            width: 8,
            height: 8,
            fill: '#5F95FF'
          },
          // 确保线条可见
          display: 'block',
          visibility: 'visible'
        }
      }
    }
    
    // 添加数据属性
    config.data = {
      type: edge.type,
      isPreview: edge.isPreview,
      isConnected: edge.isConnected,
      state: edge.state,
      branchId: edge.branch?.id,
      branchLabel: edge.branch?.label,
      branchIndex: edge.branch?.index,
      createdBy: edge.metadata.createdBy,
      version: edge.metadata.version,
      edgeInstance: edge // 保存边实例引用
    }
    
    // 连接点配置
    config.defaultConnectionPoint = {
      name: 'boundary',
      args: {
        anchor: 'center'
      }
    }
    
    // 添加路由器配置，确保边能正确路由
    config.router = {
      name: 'manhattan',
      args: {
        padding: 10
      }
    }
    
    // 添加连接器配置
    config.connector = {
      name: 'rounded',
      args: {
        radius: 8
      }
    }
    
    console.log('🎨 [统一边管理器] 创建X6边配置:', {
      id: edge.id,
      type: edge.type,
      isPreview: edge.isPreview,
      hasTarget: !!edge.target?.nodeId,
      style: config.attrs.line,
      visible: config.visible
    })
    
    return config
  }
  
  // 销毁管理器
  destroy() {
    // 清理所有边
    this.edges.clear()
    this.previewLines.clear()
    this.connections.clear()
    this.nodeEdgeIndex.clear()
    this.portConnectionIndex.clear()
    
    // 清理缓存
    this.clearCache()
    
    // 销毁核心模块
    if (this.portConfigFactory) {
      this.portConfigFactory.destroy()
    }
    
    if (this.connectionController) {
      this.connectionController.destroy()
    }
    
    if (this.snapDetector) {
      this.snapDetector.destroy()
    }
    
    // 清理事件监听器
    this.eventListeners.clear()
    
    // 销毁连接验证器
    if (this.connectionValidator) {
      this.connectionValidator.destroy()
    }
    
    // 重置状态
    this.isInitialized.value = false
    this.isProcessing.value = false
    
    console.log('🗑️ [统一边管理器] 已销毁')
  }
}

/**
 * 连接验证器
 * 负责验证连接的有效性和限制
 */
class ConnectionValidator {
  constructor(edgeManager) {
    this.edgeManager = edgeManager
    this.rules = new Map()
    this.initialized = false
  }
  
  initialize() {
    if (this.initialized) return
    
    // 设置默认验证规则
    this.addRule('max_connections', this.validateMaxConnections.bind(this))
    this.addRule('port_availability', this.validatePortAvailability.bind(this))
    this.addRule('node_compatibility', this.validateNodeCompatibility.bind(this))
    this.addRule('circular_dependency', this.validateCircularDependency.bind(this))
    
    this.initialized = true
    console.log('✅ [连接验证器] 初始化完成')
  }
  
  addRule(name, validator) {
    this.rules.set(name, validator)
  }
  
  removeRule(name) {
    this.rules.delete(name)
  }
  
  async validateConnection(connectionData) {
    const errors = []
    
    for (const [name, validator] of this.rules) {
      try {
        const result = await validator(connectionData)
        if (!result.isValid) {
          errors.push(...result.errors.map(error => `${name}: ${error}`))
        }
      } catch (error) {
        console.error(`验证规则 ${name} 执行失败:`, error)
        errors.push(`${name}: 验证失败`)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  // 验证最大连接数
  async validateMaxConnections(connectionData) {
    const errors = []
    const maxConnections = this.edgeManager.options.maxConnectionsPerNode
    
    // 检查源节点出向连接数
    const sourceOutgoing = this.edgeManager.getNodeOutgoingConnectionCount(connectionData.source.nodeId)
    if (sourceOutgoing >= maxConnections) {
      errors.push(`源节点出向连接数已达上限 (${sourceOutgoing}/${maxConnections})`)
    }
    
    // 检查目标节点入向连接数
    if (connectionData.target?.nodeId) {
      const targetIncoming = this.edgeManager.getNodeIncomingConnectionCount(connectionData.target.nodeId)
      if (targetIncoming >= maxConnections) {
        errors.push(`目标节点入向连接数已达上限 (${targetIncoming}/${maxConnections})`)
      }
    }
    
    return { isValid: errors.length === 0, errors }
  }
  
  // 验证端口可用性
  async validatePortAvailability(connectionData) {
    const errors = []
    
    // 检查源端口
    if (connectionData.source?.port) {
      if (this.edgeManager.isPortOccupied(connectionData.source.nodeId, connectionData.source.port, 'out')) {
        errors.push(`源端口 ${connectionData.source.port} 已被占用`)
      }
    }
    
    // 检查目标端口
    if (connectionData.target?.port) {
      if (this.edgeManager.isPortOccupied(connectionData.target.nodeId, connectionData.target.port, 'in')) {
        errors.push(`目标端口 ${connectionData.target.port} 已被占用`)
      }
    }
    
    return { isValid: errors.length === 0, errors }
  }
  
  // 验证节点兼容性
  async validateNodeCompatibility(connectionData) {
    const errors = []
    
    // 这里可以添加节点类型兼容性检查
    // 例如：某些节点类型不能连接到特定的节点类型
    
    return { isValid: errors.length === 0, errors }
  }
  
  // 验证循环依赖
  async validateCircularDependency(connectionData) {
    const errors = []
    
    // 检查是否会形成循环
    if (connectionData.source.nodeId === connectionData.target?.nodeId) {
      errors.push('不能连接到自身')
    }
    
    // 这里可以添加更复杂的循环检测逻辑
    
    return { isValid: errors.length === 0, errors }
  }
  
  destroy() {
    this.rules.clear()
    this.initialized = false
  }
}

// 创建管理器实例的工厂函数
export function createUnifiedEdgeManager(graph, options = {}) {
  return new UnifiedEdgeManager(graph, options)
}

export default UnifiedEdgeManager