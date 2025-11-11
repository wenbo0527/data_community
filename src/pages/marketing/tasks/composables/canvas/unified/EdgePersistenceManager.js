/**
 * 边持久化管理器 (EdgePersistenceManager)
 * 
 * 核心职责：
 * 1. 为UnifiedEdgeManager提供完整的持久化能力
 * 2. 处理预览线和连接线的状态序列化和反序列化
 * 3. 实现自动保存和恢复机制
 * 4. 支持增量更新和批量操作优化
 * 
 * 设计原则：
 * - 数据完整性：确保所有边状态的完整保存和恢复
 * - 性能优化：通过增量更新和批量操作提升性能
 * - 错误恢复：提供完善的错误处理和降级机制
 * - 版本兼容：支持数据结构版本升级和兼容性处理
 * 
 * @author EdgePersistenceManager Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import StorageUtils, { StorageType } from '../../../utils/StorageUtils.js'
import { StateService, StateType } from '../../../services/StateService.js'
import DataMigrationManager, { DataVersion, MigrationType } from '../../../utils/DataMigrationManager.js'
import UnifiedDataValidator, { ValidationResult, ValidationRuleType, ValidationSeverity, DataType } from '../../../utils/UnifiedDataValidator.js'

/**
 * 持久化数据版本
 */
export const PERSISTENCE_VERSION = '1.0.0'

/**
 * 持久化状态类型枚举
 */
export const PersistenceStateType = {
  PREVIEW_LINES: 'previewLines',
  CONNECTIONS: 'connections',
  NODE_EDGES: 'nodeEdges',
  PORT_USAGE: 'portUsage',
  EDGE_METADATA: 'edgeMetadata',
  PERFORMANCE_STATS: 'performanceStats',
  CONFIGURATION: 'configuration',
  DRAG_STATE: 'dragState',
  SNAP_STATE: 'snapState'
}

/**
 * 序列化选项
 */
export const SerializationOptions = {
  MINIMAL: 'minimal',           // 最小化数据
  COMPLETE: 'complete',         // 完整数据
  INCREMENTAL: 'incremental'    // 增量数据
}

/**
 * 边持久化管理器类
 */
export class EdgePersistenceManager {
  /**
   * 构造函数
   * @param {UnifiedEdgeManager} edgeManager - 边管理器实例
   * @param {Object} options - 配置选项
   */
  constructor(edgeManager, options = {}) {
    // ==================== 核心依赖 ====================
    this.edgeManager = edgeManager
    this.stateService = options.stateService || null
    
    // ==================== 数据修复和迁移 ====================
    this.storageUtils = StorageUtils
    this.dataMigrationManager = new DataMigrationManager({
      autoMigration: true,
      validateAfterMigration: true,
      backupBeforeMigration: true,
      enableRollback: true,
      errorRecovery: true
    })
    this.dataValidator = new UnifiedDataValidator({
      strictMode: false,
      autoFix: true,
      validateReferences: true,
      validateFormat: true,
      validateIntegrity: true
    })
    
    // ==================== 配置管理 ====================
    this.options = {
      // 基础配置
      enablePersistence: true,
      enableAutoSave: true,
      enableIncrementalSave: true,
      enableCompression: false,
      
      // 存储配置
      storageType: StorageType.LOCAL,
      storageKey: 'unified-edge-manager-state',
      backupKey: 'unified-edge-manager-backup',
      maxBackups: 5,
      
      // 自动保存配置
      autoSaveInterval: 5000,      // 5秒
      autoSaveDebounce: 1000,      // 1秒防抖
      saveOnStateChange: true,
      saveOnBatchComplete: true,
      
      // 序列化配置
      serializationMode: SerializationOptions.COMPLETE,
      includeMetadata: true,
      includePerformanceStats: false,
      includeDebugInfo: false,
      
      // 恢复配置
      enableAutoRestore: true,
      validateOnRestore: true,
      enableFallback: true,
      maxRestoreAttempts: 3,
      
      // 性能配置
      enableBatching: true,
      batchSize: 50,
      enableOptimization: true,
      compressionThreshold: 10000,
      
      // 错误处理配置
      enableErrorRecovery: true,
      logErrors: true,
      enableFallbackStorage: true,
      
      // 调试配置
      debug: false,
      logLevel: 'info',
      
      // 就绪事件延迟配置（基础功能）
      // 如果提供了 delayValidationEventName + eventBus，则在该事件触发后再执行恢复与验证
      delayValidationEventName: undefined,
      eventBus: undefined,

      ...options
    }
    
    // ==================== 状态管理 ====================
    this.isInitialized = false
    this.isPersisting = false
    this.isRestoring = false
    this.lastSaveTime = 0
    this.lastRestoreTime = 0
    
    // ==================== 数据存储 ====================
    this.persistedState = {
      version: PERSISTENCE_VERSION,
      timestamp: Date.now(),
      data: {},
      metadata: {},
      checksum: null
    }
    
    // ==================== 缓存管理 ====================
    this.serializationCache = new Map()
    this.deserializationCache = new Map()
    this.changeTracker = new Map()
    
    // ==================== 定时器管理 ====================
    this.autoSaveTimer = null
    this.debounceTimer = null
    
    // ==================== 统计信息 ====================
    this.stats = {
      saveOperations: 0,
      restoreOperations: 0,
      serializationTime: 0,
      deserializationTime: 0,
      dataSize: 0,
      compressionRatio: 0,
      errors: 0,
      lastError: null
    }
    
    // ==================== 事件监听器 ====================
    this.eventListeners = new Map()
    
    console.log('💾 [边持久化管理器] 初始化完成')
  }
  
  /**
   * 初始化持久化管理器
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn('⚠️ [边持久化管理器] 已经初始化，跳过重复初始化')
      return
    }
    
    try {
      console.log('🔧 [边持久化管理器] 开始初始化...')
      
      // 1. 初始化存储环境检测和修复
      console.log('🔍 [边持久化管理器] 检测存储环境...')
      StorageUtils.initializeStorage()
      
      // 2. 检查并加载现有数据进行迁移
      console.log('🔄 [边持久化管理器] 执行数据迁移检查...')
      const existingData = await this.loadRawDataForMigration()
      if (existingData) {
        const migrationResult = await this.dataMigrationManager.migrateData(existingData)
        if (migrationResult.success && migrationResult.migrationCount > 0) {
          console.log('✅ [边持久化管理器] 数据迁移完成:', {
            migrationCount: migrationResult.migrationCount,
            results: migrationResult.results
          })
          // 保存迁移后的数据
          await this.saveToStorage(migrationResult.data)
        }
      }
      
      // 3. 设置事件监听
      this.setupEventListeners()
      
      // 4. 设置自动保存
      if (this.options.enableAutoSave) {
        this.setupAutoSave()
      }
      
      // 5. 自动恢复状态（带验证和修复，支持画布就绪事件延迟）
      if (this.options.enableAutoRestore) {
        const { delayValidationEventName, eventBus } = this.options
        if (delayValidationEventName && eventBus && typeof eventBus.once === 'function') {
          console.log('⏳ [边持久化管理器] 延迟恢复，等待事件:', delayValidationEventName)
          // 使用一次性监听，避免重复恢复
          eventBus.once(delayValidationEventName, async () => {
            try {
              console.log('🎯 [边持久化管理器] 收到就绪事件，开始恢复状态')
              await this.restoreStateWithValidation()
            } catch (err) {
              console.error('❌ [边持久化管理器] 延迟恢复失败:', err)
              this.handleError(err, 'delayed-restore')
            }
          })
        } else {
          // 未配置延迟，立即恢复
          await this.restoreStateWithValidation()
        }
      }
      
      this.isInitialized = true
      console.log('✅ [边持久化管理器] 初始化成功')
      
    } catch (error) {
      console.error('❌ [边持久化管理器] 初始化失败:', error)
      this.handleError(error, 'initialization')
      throw error
    }
  }
  
  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    if (!this.edgeManager) return
    
    // 监听边状态变化
    this.edgeManager.on('edge:created', this.handleEdgeCreated.bind(this))
    this.edgeManager.on('edge:updated', this.handleEdgeUpdated.bind(this))
    this.edgeManager.on('edge:removed', this.handleEdgeRemoved.bind(this))
    this.edgeManager.on('batch:completed', this.handleBatchCompleted.bind(this))
    
    // 监听状态服务变化
    if (this.stateService) {
      this.stateService.subscribe(StateType.EDGES, this.handleStateChange.bind(this))
      this.stateService.subscribe(StateType.PREVIEW_LINES, this.handleStateChange.bind(this))
    }
    
    // 🔧 修复：移除旧的窗口事件监听，统一事件系统会处理这些事件
    // if (typeof window !== 'undefined') {
    //   window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this))
    //   window.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
    // }
  }
  
  /**
   * 设置自动保存
   */
  setupAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
    }
    
    this.autoSaveTimer = setInterval(() => {
      if (this.hasUnsavedChanges()) {
        this.saveState()
      }
    }, this.options.autoSaveInterval)
  }
  
  /**
   * 保存状态
   * @param {Object} options - 保存选项
   * @returns {Promise<boolean>} - 是否保存成功
   */
  async saveState(options = {}) {
    if (this.isPersisting) {
      console.warn('⚠️ [边持久化管理器] 正在保存中，跳过重复保存')
      return false
    }
    
    const {
      force = false,
      incremental = this.options.enableIncrementalSave,
      backup = true
    } = options
    
    this.isPersisting = true
    const startTime = performance.now()
    
    try {
      // 检查是否需要保存
      if (!force && !this.hasUnsavedChanges()) {
        console.log('📝 [边持久化管理器] 无需保存，状态未变化')
        return true
      }
      
      // 验证当前状态数据
      await this.validateCurrentState()
      
      // 序列化状态
      const serializedData = await this.serializeState(incremental)
      
      // 创建备份
      if (backup && this.options.maxBackups > 0) {
        await this.createBackup()
      }
      
      // 保存到存储
      const success = await this.saveToStorage(serializedData)
      
      if (success) {
        this.lastSaveTime = Date.now()
        this.stats.saveOperations++
        this.stats.serializationTime += performance.now() - startTime
        this.stats.dataSize = serializedData ? JSON.stringify(serializedData).length : 0
        
        // 清除变更跟踪
        this.changeTracker.clear()
        
        console.log('💾 [边持久化管理器] 状态保存成功', {
          incremental,
          dataSize: this.stats.dataSize,
          time: performance.now() - startTime
        })
        
        this.emit('state:saved', { serializedData, incremental })
      }
      
      return success
      
    } catch (error) {
      console.error('❌ [边持久化管理器] 状态保存失败:', error)
      this.handleError(error, 'save')
      return false
      
    } finally {
      this.isPersisting = false
    }
  }
  
  /**
   * 带验证的状态恢复
   * @param {Object} options - 恢复选项
   * @returns {Promise<boolean>} - 是否恢复成功
   */
  async restoreStateWithValidation(options = {}) {
    console.log('🔍 [边持久化管理器] 开始带验证的状态恢复...')
    
    try {
      // 1. 尝试从存储加载原始数据
      let rawData = await this.loadFromStorage()
      
      if (!rawData) {
        console.log('📂 [边持久化管理器] 未找到持久化数据，跳过恢复')
        return true
      }
      
      // 2. 验证存储数据格式
      const storageValidationResult = await this.dataValidator.validateData(rawData)
      if (!storageValidationResult.isValid) {
        console.warn('⚠️ [边持久化管理器] 存储数据格式有错误:', storageValidationResult.errors)
        // 如果有严重错误，尝试数据迁移
        if (storageValidationResult.errors.length > 0) {
          const migrationResult = await this.dataMigrationManager.migrateData(rawData)
          if (migrationResult.success) {
            console.log('✅ [边持久化管理器] 存储数据迁移修复成功')
            rawData = migrationResult.data
          } else {
            throw new Error('存储数据无法修复')
          }
        }
      }
      
      // 3. 反序列化状态
      const restoredState = await this.deserializeState(rawData)
      
      // 4. 验证边缘数据
      const edgeValidationResults = []
      if (restoredState.edges) {
        for (const [edgeId, edgeData] of Object.entries(restoredState.edges)) {
          // 创建单个边的数据结构进行验证
          const edgeValidationData = {
            edges: [edgeData],
            nodes: restoredState.nodes || []
          }
          const result = await this.dataValidator.validateData(edgeValidationData)
          if (!result.isValid) {
            edgeValidationResults.push({ edgeId, result })
          }
        }
      }
      
      // 5. 修复有问题的边缘数据
      if (edgeValidationResults.length > 0) {
        console.log(`🔧 [边持久化管理器] 发现 ${edgeValidationResults.length} 个边缘数据问题，开始修复...`)
        
        for (const { edgeId, result } of edgeValidationResults) {
          const hasErrors = result.errors.length > 0
          if (hasErrors) {
            // 尝试数据迁移修复
            const edgeDataForMigration = { edges: [restoredState.edges[edgeId]] }
            const migrationResult = await this.dataMigrationManager.migrateData(edgeDataForMigration)
            if (migrationResult.success && migrationResult.data.edges && migrationResult.data.edges.length > 0) {
              restoredState.edges[edgeId] = migrationResult.data.edges[0]
              console.log(`✅ [边持久化管理器] 边缘 ${edgeId} 修复成功`)
            } else {
              console.warn(`⚠️ [边持久化管理器] 边缘 ${edgeId} 无法修复，将被移除`)
              delete restoredState.edges[edgeId]
            }
          }
        }
      }
      
      // 6. 验证数据完整性
      const integrityResult = await this.dataValidator.validateData(restoredState)
      if (!integrityResult.isValid) {
        console.warn('⚠️ [边持久化管理器] 数据完整性检查发现问题:', integrityResult.errors.map(e => e.message))
      }
      
      // 7. 应用恢复的状态
      await this.applyRestoredState(restoredState)
      
      console.log('✅ [边持久化管理器] 带验证的状态恢复完成', {
        edgeCount: Object.keys(restoredState.edges || {}).length,
        validationIssues: edgeValidationResults.length,
        integrityIssues: integrityResult.errors.length
      })
      
      return true
      
    } catch (error) {
      console.error('❌ [边持久化管理器] 带验证的状态恢复失败:', error)
      
      // 尝试使用原始恢复方法作为后备
      console.log('🔄 [边持久化管理器] 尝试使用原始恢复方法...')
      return await this.restoreState(options)
    }
  }

  /**
   * 恢复状态
   * @param {Object} options - 恢复选项
   * @returns {Promise<boolean>} - 是否恢复成功
   */
  async restoreState(options = {}) {
    if (this.isRestoring) {
      console.warn('⚠️ [边持久化管理器] 正在恢复中，跳过重复恢复')
      return false
    }
    
    const {
      validate = this.options.validateOnRestore,
      fallback = this.options.enableFallback
    } = options
    
    this.isRestoring = true
    const startTime = performance.now()
    
    try {
      // 从存储加载数据
      const serializedData = await this.loadFromStorage()
      
      if (!serializedData) {
        console.log('📂 [边持久化管理器] 未找到持久化数据')
        return true // 没有数据不算失败
      }
      
      // 验证数据
      if (validate && !this.validateSerializedData(serializedData)) {
        if (fallback) {
          console.warn('⚠️ [边持久化管理器] 数据验证失败，尝试从备份恢复')
          return await this.restoreFromBackup()
        } else {
          throw new Error('持久化数据验证失败')
        }
      }
      
      // 反序列化状态
      const restoredState = await this.deserializeState(serializedData)
      
      // 应用状态到边管理器
      await this.applyRestoredState(restoredState)
      
      this.lastRestoreTime = Date.now()
      this.stats.restoreOperations++
      this.stats.deserializationTime += performance.now() - startTime
      
      console.log('📂 [边持久化管理器] 状态恢复成功', {
        edgeCount: Object.keys(restoredState.edges || {}).length,
        time: performance.now() - startTime
      })
      
      this.emit('state:restored', { restoredState })
      return true
      
    } catch (error) {
      console.error('❌ [边持久化管理器] 状态恢复失败:', error)
      this.handleError(error, 'restore')
      
      // 尝试从备份恢复
      if (fallback) {
        return await this.restoreFromBackup()
      }
      
      return false
      
    } finally {
      this.isRestoring = false
    }
  }
  
  /**
   * 序列化状态
   * @param {boolean} incremental - 是否增量序列化
   * @returns {Promise<Object>} - 序列化数据
   */
  async serializeState(incremental = false) {
    const startTime = performance.now()
    
    try {
      const serializedData = {
        version: PERSISTENCE_VERSION,
        timestamp: Date.now(),
        incremental,
        data: {},
        metadata: {}
      }
      
      // 序列化预览线
      if (!incremental || this.hasChanges(PersistenceStateType.PREVIEW_LINES)) {
        serializedData.data.previewLines = this.serializePreviewLines()
      }
      
      // 序列化连接线
      if (!incremental || this.hasChanges(PersistenceStateType.CONNECTIONS)) {
        serializedData.data.connections = this.serializeConnections()
      }
      
      // 序列化节点边索引
      if (!incremental || this.hasChanges(PersistenceStateType.NODE_EDGES)) {
        serializedData.data.nodeEdges = this.serializeNodeEdges()
      }
      
      // 序列化端口使用情况
      if (!incremental || this.hasChanges(PersistenceStateType.PORT_USAGE)) {
        serializedData.data.portUsage = this.serializePortUsage()
      }
      
      // 序列化元数据
      if (this.options.includeMetadata) {
        serializedData.metadata = this.serializeMetadata()
      }
      
      // 序列化性能统计
      if (this.options.includePerformanceStats) {
        serializedData.data.performanceStats = this.serializePerformanceStats()
      }
      
      // 计算校验和
      serializedData.checksum = this.calculateChecksum(serializedData.data)
      
      console.log('🔄 [边持久化管理器] 状态序列化完成', {
        incremental,
        dataSize: JSON.stringify(serializedData).length,
        time: performance.now() - startTime
      })
      
      return serializedData
      
    } catch (error) {
      console.error('❌ [边持久化管理器] 状态序列化失败:', error)
      throw error
    }
  }
  
  /**
   * 反序列化状态
   * @param {Object} serializedData - 序列化数据
   * @returns {Promise<Object>} - 反序列化状态
   */
  async deserializeState(serializedData) {
    const startTime = performance.now()
    
    try {
      const restoredState = {
        edges: {},
        nodeEdges: {},
        portUsage: {},
        metadata: {},
        performanceStats: {}
      }
      
      // 确保数据结构存在
      const data = serializedData.data || serializedData
      
      // 反序列化预览线
      if (data.previewLines) {
        const previewLines = this.deserializePreviewLines(data.previewLines)
        Object.assign(restoredState.edges, previewLines)
      }
      
      // 反序列化连接线
      if (data.connections) {
        const connections = this.deserializeConnections(data.connections)
        Object.assign(restoredState.edges, connections)
      }
      
      // 反序列化节点边索引
      if (data.nodeEdges) {
        restoredState.nodeEdges = this.deserializeNodeEdges(data.nodeEdges)
      }
      
      // 反序列化端口使用情况
      if (data.portUsage) {
        restoredState.portUsage = this.deserializePortUsage(data.portUsage)
      }
      
      // 反序列化元数据
      if (serializedData.metadata) {
        restoredState.metadata = this.deserializeMetadata(serializedData.metadata)
      }
      
      // 反序列化性能统计
      if (data.performanceStats) {
        restoredState.performanceStats = this.deserializePerformanceStats(data.performanceStats)
      }
      
      console.log('🔄 [边持久化管理器] 状态反序列化完成', {
        edgeCount: Object.keys(restoredState.edges).length,
        time: performance.now() - startTime
      })
      
      return restoredState
      
    } catch (error) {
      console.error('❌ [边持久化管理器] 状态反序列化失败:', error)
      throw error
    }
  }
  
  /**
   * 序列化预览线（包含拖拽和吸附状态）
   * @returns {Object} - 序列化的预览线数据
   */
  serializePreviewLines() {
    const previewLines = {}
    
    if (this.edgeManager && this.edgeManager.edges) {
      for (const [edgeId, edge] of this.edgeManager.edges) {
        if (edge.type === 'preview' || edge.type === 'preview-line') {
          previewLines[edgeId] = {
            id: edge.id,
            type: edge.type,
            state: edge.state,
            source: {
              nodeId: edge.source.nodeId,
              port: edge.source.port
            },
            target: edge.target ? {
              nodeId: edge.target.nodeId,
              port: edge.target.port
            } : null,
            branch: edge.branch ? {
              id: edge.branch.id,
              label: edge.branch.label,
              index: edge.branch.index
            } : null,
            style: edge.style ? {
              stroke: edge.style.stroke,
              strokeWidth: edge.style.strokeWidth,
              strokeDasharray: edge.style.strokeDasharray,
              opacity: edge.style.opacity
            } : null,
            metadata: edge.metadata ? {
              createdAt: edge.metadata.createdAt,
              createdBy: edge.metadata.createdBy,
              ...edge.metadata.custom
            } : null,
            // 拖拽状态信息
            dragState: this.serializePreviewLineDragState(edge),
            // 吸附状态信息
            snapState: this.serializePreviewLineSnapState(edge),
            // 时间戳用于状态恢复验证
            timestamp: Date.now()
          }
        }
      }
    }
    
    return previewLines
  }

  /**
   * 序列化预览线的拖拽状态
   * @param {Object} edge - 预览线边对象
   * @returns {Object|null} - 拖拽状态数据
   */
  serializePreviewLineDragState(edge) {
    // 检查是否有拖拽状态管理器
    if (!this.edgeManager.dragStateManager) {
      return null
    }

    const dragStateInfo = this.edgeManager.dragStateManager.getStateInfo()
    
    // 如果当前有拖拽状态，序列化拖拽信息
    if (dragStateInfo.currentDrag && dragStateInfo.currentState === 'dragging') {
      return {
        isDragging: true,
        dragType: dragStateInfo.currentDrag.type,
        startPosition: dragStateInfo.currentDrag.startPosition,
        currentPosition: dragStateInfo.currentDrag.currentPosition,
        sourceNode: dragStateInfo.currentDrag.sourceNode,
        targetNode: dragStateInfo.currentDrag.targetNode,
        sourcePort: dragStateInfo.currentDrag.sourcePort,
        dragPhase: dragStateInfo.currentDrag.phase || 'active',
        branchId: dragStateInfo.currentDrag.branchId,
        branchLabel: dragStateInfo.currentDrag.branchLabel,
        metadata: dragStateInfo.currentDrag.metadata,
        timestamp: Date.now()
      }
    }

    return null
  }

  /**
   * 序列化预览线的吸附状态
   * @param {Object} edge - 预览线边对象
   * @returns {Object|null} - 吸附状态数据
   */
  serializePreviewLineSnapState(edge) {
    // 检查是否有吸附信息
    if (!this.edgeManager.snapInfo) {
      return null
    }

    const snapInfo = this.edgeManager.snapInfo
    
    // 如果当前有吸附状态，序列化吸附信息
    if (snapInfo.isSnapping) {
      return {
        isSnapping: snapInfo.isSnapping || false,
        snapTarget: snapInfo.snapTarget ? {
          nodeId: snapInfo.snapTarget.nodeId,
          portId: snapInfo.snapTarget.port,
          position: snapInfo.snapTarget.position,
          distance: snapInfo.snapTarget.distance,
          type: snapInfo.snapTarget.type || 'port'
        } : null,
        snapDistance: snapInfo.snapDistance || 30,
        snapConfig: {
          enabled: snapInfo.snapConfig?.enabled !== false,
          distance: snapInfo.snapConfig?.distance || 30,
          showIndicators: snapInfo.snapConfig?.showIndicators !== false,
          tolerance: snapInfo.snapConfig?.tolerance || 5
        },
        lastSnapTime: snapInfo.lastSnapTime || null,
        timestamp: Date.now()
      }
    }

    return null
  }
  
  /**
   * 序列化连接线
   * @returns {Object} - 序列化的连接线数据
   */
  serializeConnections() {
    const connections = {}
    
    if (this.edgeManager && this.edgeManager.edges) {
      for (const [edgeId, edge] of this.edgeManager.edges) {
        if (edge.type === 'connection') {
          connections[edgeId] = {
            id: edge.id,
            type: edge.type,
            state: edge.state,
            source: {
              nodeId: edge.source.nodeId,
              port: edge.source.port
            },
            target: edge.target ? {
              nodeId: edge.target.nodeId,
              port: edge.target.port
            } : null,
            branch: edge.branch ? {
              id: edge.branch.id,
              label: edge.branch.label,
              index: edge.branch.index
            } : null,
            style: edge.style ? {
              stroke: edge.style.stroke,
              strokeWidth: edge.style.strokeWidth,
              opacity: edge.style.opacity
            } : null,
            metadata: edge.metadata ? {
              createdAt: edge.metadata.createdAt,
              createdBy: edge.metadata.createdBy,
              ...edge.metadata.custom
            } : null
          }
        }
      }
    }
    
    return connections
  }
  
  /**
   * 序列化节点边索引
   * @returns {Object} - 序列化的节点边索引
   */
  serializeNodeEdges() {
    const nodeEdges = {}
    
    if (this.edgeManager && this.edgeManager.nodeEdges) {
      for (const [nodeId, edges] of this.edgeManager.nodeEdges) {
        nodeEdges[nodeId] = Array.from(edges)
      }
    }
    
    return nodeEdges
  }
  
  /**
   * 序列化端口使用情况
   * @returns {Object} - 序列化的端口使用情况
   */
  serializePortUsage() {
    const portUsage = {}
    
    if (this.edgeManager && this.edgeManager.portUsage) {
      for (const [portKey, usage] of this.edgeManager.portUsage) {
        portUsage[portKey] = usage
      }
    }
    
    return portUsage
  }
  
  /**
   * 序列化元数据
   * @returns {Object} - 序列化的元数据
   */
  serializeMetadata() {
    return {
      edgeCount: this.edgeManager && this.edgeManager.edges ? this.edgeManager.edges.size : 0,
      previewLineCount: this.getPreviewLineCount(),
      connectionCount: this.getConnectionCount(),
      nodeCount: this.edgeManager && this.edgeManager.nodeEdges ? this.edgeManager.nodeEdges.size : 0,
      lastUpdate: Date.now(),
      version: PERSISTENCE_VERSION
    }
  }
  
  /**
   * 序列化性能统计
   * @returns {Object} - 序列化的性能统计
   */
  serializePerformanceStats() {
    return {
      ...this.stats,
      edgeManagerStats: this.edgeManager ? this.edgeManager.getStats() : {}
    }
  }

  
  /**
   * 反序列化预览线（包含拖拽和吸附状态恢复）
   * @param {Object} data - 预览线数据
   * @returns {Object} - 反序列化的预览线
   */
  deserializePreviewLines(data) {
    const previewLines = {}
    
    if (!data || typeof data !== 'object') {
      console.warn('⚠️ [边持久化管理器] 预览线数据为空或格式错误')
      return previewLines
    }
    
    for (const [edgeId, edgeData] of Object.entries(data)) {
      // 基础预览线数据恢复
      previewLines[edgeId] = {
        ...edgeData,
        // 确保必要的属性存在
        created: edgeData.created || Date.now(),
        updated: edgeData.updated || Date.now()
      }

      // 恢复拖拽状态（如果存在且有效）
      if (edgeData.dragState) {
        const dragRestored = this.restorePreviewLineDragState(edgeData.dragState, edgeId)
        if (dragRestored) {
          previewLines[edgeId].dragStateRestored = true
          console.log('✅ [边持久化管理器] 预览线拖拽状态已恢复:', edgeId)
        }
      }

      // 恢复吸附状态（如果存在且有效）
      if (edgeData.snapState) {
        const snapRestored = this.restorePreviewLineSnapState(edgeData.snapState, edgeId)
        if (snapRestored) {
          previewLines[edgeId].snapStateRestored = true
          console.log('✅ [边持久化管理器] 预览线吸附状态已恢复:', edgeId)
        }
      }
    }
    
    return previewLines
  }

  /**
   * 恢复预览线的拖拽状态
   * @param {Object} dragState - 拖拽状态数据
   * @param {string} edgeId - 预览线ID
   * @returns {boolean} - 是否成功恢复
   */
  restorePreviewLineDragState(dragState, edgeId) {
    if (!dragState || !this.edgeManager.dragStateManager) {
      return false
    }

    try {
      // 检查数据时效性（超过5分钟的拖拽状态不恢复）
      const now = Date.now()
      if (dragState.timestamp && (now - dragState.timestamp > 5 * 60 * 1000)) {
        console.log('🕐 [边持久化管理器] 预览线拖拽状态已过期，跳过恢复:', edgeId)
        return false
      }

      // 只恢复安全的拖拽状态（非进行中的拖拽）
      if (dragState.isDragging) {
        console.log('⚠️ [边持久化管理器] 跳过进行中的拖拽状态恢复:', edgeId)
        return false
      }

      // 恢复拖拽历史信息（用于调试和分析）
      if (dragState.startPosition && dragState.currentPosition) {
        // 可以在这里添加拖拽轨迹的恢复逻辑
        console.log('📍 [边持久化管理器] 拖拽轨迹信息已记录:', {
          edgeId,
          from: dragState.startPosition,
          to: dragState.currentPosition
        })
      }

      return true
    } catch (error) {
      console.warn('⚠️ [边持久化管理器] 预览线拖拽状态恢复失败:', error)
      return false
    }
  }

  /**
   * 恢复预览线的吸附状态
   * @param {Object} snapState - 吸附状态数据
   * @param {string} edgeId - 预览线ID
   * @returns {boolean} - 是否成功恢复
   */
  restorePreviewLineSnapState(snapState, edgeId) {
    if (!snapState) {
      return false
    }

    try {
      // 检查数据时效性
      const now = Date.now()
      if (snapState.timestamp && (now - snapState.timestamp > 5 * 60 * 1000)) {
        console.log('🕐 [边持久化管理器] 预览线吸附状态已过期，跳过恢复:', edgeId)
        return false
      }

      // 恢复吸附配置（非激活状态）
      if (this.edgeManager.snapInfo && snapState.snapConfig) {
        // 更新全局吸附配置
        this.edgeManager.snapInfo.snapConfig = {
          ...this.edgeManager.snapInfo.snapConfig,
          enabled: snapState.snapConfig.enabled,
          distance: snapState.snapConfig.distance,
          showIndicators: snapState.snapConfig.showIndicators,
          tolerance: snapState.snapConfig.tolerance
        }

        // 记录吸附历史信息
        if (snapState.snapTarget) {
          console.log('🎯 [边持久化管理器] 吸附目标信息已记录:', {
            edgeId,
            target: snapState.snapTarget,
            distance: snapState.snapTarget.distance
          })
        }
      }

      return true
    } catch (error) {
      console.warn('⚠️ [边持久化管理器] 预览线吸附状态恢复失败:', error)
      return false
    }
  }
  
  /**
   * 反序列化连接线
   * @param {Object} data - 连接线数据
   * @returns {Object} - 反序列化的连接线
   */
  deserializeConnections(data) {
    const connections = {}
    
    if (!data || typeof data !== 'object') {
      console.warn('⚠️ [边持久化管理器] 连接线数据为空或格式错误')
      return connections
    }
    
    for (const [edgeId, edgeData] of Object.entries(data)) {
      connections[edgeId] = {
        ...edgeData,
        // 确保必要的属性存在
        created: edgeData.created || Date.now(),
        updated: edgeData.updated || Date.now()
      }
    }
    
    return connections
  }
  
  /**
   * 反序列化节点边索引
   * @param {Object} data - 节点边索引数据
   * @returns {Object} - 反序列化的节点边索引
   */
  deserializeNodeEdges(data) {
    const nodeEdges = {}
    
    for (const [nodeId, edges] of Object.entries(data)) {
      nodeEdges[nodeId] = new Set(edges)
    }
    
    return nodeEdges
  }
  
  /**
   * 反序列化端口使用情况
   * @param {Object} data - 端口使用情况数据
   * @returns {Object} - 反序列化的端口使用情况
   */
  deserializePortUsage(data) {
    return { ...data }
  }
  
  /**
   * 反序列化元数据
   * @param {Object} data - 元数据
   * @returns {Object} - 反序列化的元数据
   */
  deserializeMetadata(data) {
    return { ...data }
  }
  
  /**
   * 反序列化性能统计
   * @param {Object} data - 性能统计数据
   * @returns {Object} - 反序列化的性能统计
   */
  deserializePerformanceStats(data) {
    return { ...data }
  }

  
  /**
   * 应用恢复的状态到边管理器
   * @param {Object} restoredState - 恢复的状态
   */
  async applyRestoredState(restoredState) {
    if (!this.edgeManager) {
      throw new Error('边管理器未初始化')
    }
    
    try {
      // 清除现有状态
      this.edgeManager.edges.clear()
      this.edgeManager.nodeEdges.clear()
      this.edgeManager.portUsage.clear()
      
      // 恢复边数据
      for (const [edgeId, edgeData] of Object.entries(restoredState.edges)) {
        this.edgeManager.edges.set(edgeId, edgeData)
      }
      
      // 恢复节点边索引
      for (const [nodeId, edges] of Object.entries(restoredState.nodeEdges)) {
        this.edgeManager.nodeEdges.set(nodeId, edges)
      }
      
      // 恢复端口使用情况
      for (const [portKey, usage] of Object.entries(restoredState.portUsage)) {
        this.edgeManager.portUsage.set(portKey, usage)
      }
      
      // 重建X6图形中的边
      await this.rebuildGraphEdges(restoredState.edges)
      
      console.log('✅ [边持久化管理器] 状态应用成功', {
        edgeCount: Object.keys(restoredState.edges).length,
        nodeCount: Object.keys(restoredState.nodeEdges).length
      })
      
    } catch (error) {
      console.error('❌ [边持久化管理器] 状态应用失败:', error)
      throw error
    }
  }
  
  /**
   * 重建图形中的边
   * @param {Object} edges - 边数据
   */
  async rebuildGraphEdges(edges) {
    if (!this.edgeManager.graph) return
    
    for (const [edgeId, edgeData] of Object.entries(edges)) {
      try {
        // 创建X6边配置
        const edgeConfig = await this.edgeManager.createX6EdgeConfig(edgeData)
        
        // 添加到图形
        const x6Edge = this.edgeManager.graph.addEdge(edgeConfig)
        
        // 更新边数据中的X6引用
        if (this.edgeManager.edges.has(edgeId)) {
          const edge = this.edgeManager.edges.get(edgeId)
          edge.x6Edge = x6Edge
        }
        
      } catch (error) {
        console.error(`❌ [边持久化管理器] 重建边失败: ${edgeId}`, error)
      }
    }
  }
  
  /**
   * 保存到存储
   * @param {Object} data - 要保存的数据
   * @returns {Promise<boolean>} - 是否保存成功
   */
  async saveToStorage(data) {
    try {
      const success = StorageUtils.setItem(
        this.options.storageKey,
        data,
        {
          type: this.options.storageType,
          serialize: true
        }
      )
      
      return success
      
    } catch (error) {
      console.error('❌ [边持久化管理器] 存储保存失败:', error)
      
      // 尝试备用存储
      if (this.options.enableFallbackStorage) {
        return await this.saveToFallbackStorage(data)
      }
      
      return false
    }
  }
  
  /**
   * 从存储加载
   * @returns {Promise<Object|null>} - 加载的数据
   */
  async loadFromStorage() {
    try {
      const data = StorageUtils.getItem(
        this.options.storageKey,
        {
          type: this.options.storageType,
          serialize: true
        }
      )
      
      return data
      
    } catch (error) {
      console.error('❌ [边持久化管理器] 存储加载失败:', error)
      
      // 尝试备用存储
      if (this.options.enableFallbackStorage) {
        return await this.loadFromFallbackStorage()
      }
      
      return null
    }
  }
  
  /**
   * 创建备份
   */
  async createBackup() {
    try {
      const currentData = await this.loadFromStorage()
      if (!currentData) return
      
      const backupKey = `${this.options.backupKey}-${Date.now()}`
      
      StorageUtils.setItem(
        backupKey,
        currentData,
        {
          type: this.options.storageType,
          serialize: true
        }
      )
      
      // 清理旧备份
      await this.cleanupOldBackups()
      
    } catch (error) {
      console.error('❌ [边持久化管理器] 创建备份失败:', error)
    }
  }
  
  /**
   * 从备份恢复
   * @returns {Promise<boolean>} - 是否恢复成功
   */
  async restoreFromBackup() {
    try {
      const backupKeys = this.getBackupKeys()
      
      for (const backupKey of backupKeys) {
        try {
          const backupData = StorageUtils.getItem(
            backupKey,
            {
              type: this.options.storageType,
              serialize: true
            }
          )
          
          if (backupData && this.validateSerializedData(backupData)) {
            const restoredState = await this.deserializeState(backupData)
            await this.applyRestoredState(restoredState)
            
            console.log('✅ [边持久化管理器] 从备份恢复成功:', backupKey)
            return true
          }
          
        } catch (error) {
          console.warn('⚠️ [边持久化管理器] 备份恢复失败:', backupKey, error)
        }
      }
      
      console.error('❌ [边持久化管理器] 所有备份恢复失败')
      return false
      
    } catch (error) {
      console.error('❌ [边持久化管理器] 备份恢复过程失败:', error)
      return false
    }
  }
  
  /**
   * 获取备份键列表
   * @returns {Array<string>} - 备份键列表
   */
  getBackupKeys() {
    const keys = StorageUtils.getKeys({ type: this.options.storageType })
    return keys
      .filter(key => key.startsWith(this.options.backupKey))
      .sort((a, b) => {
        const timeA = parseInt(a.split('-').pop())
        const timeB = parseInt(b.split('-').pop())
        return timeB - timeA // 最新的在前
      })
  }
  
  /**
   * 清理旧备份
   */
  async cleanupOldBackups() {
    try {
      const backupKeys = this.getBackupKeys()
      
      if (backupKeys.length > this.options.maxBackups) {
        const keysToDelete = backupKeys.slice(this.options.maxBackups)
        
        for (const key of keysToDelete) {
          StorageUtils.removeItem(key, { type: this.options.storageType })
        }
        
        console.log('🧹 [边持久化管理器] 清理旧备份:', keysToDelete.length)
      }
      
    } catch (error) {
      console.error('❌ [边持久化管理器] 清理备份失败:', error)
    }
  }
  
  /**
   * 验证序列化数据
   * @param {Object} data - 序列化数据
   * @returns {boolean} - 是否有效
   */
  validateSerializedData(data) {
    try {
      // 检查基本结构
      if (!data || typeof data !== 'object') {
        return false
      }
      
      // 检查版本
      if (!data.version) {
        return false
      }
      
      // 检查时间戳
      if (!data.timestamp || typeof data.timestamp !== 'number') {
        return false
      }
      
      // 检查数据部分
      if (!data.data || typeof data.data !== 'object') {
        return false
      }
      
      // 验证校验和
      if (data.checksum) {
        const calculatedChecksum = this.calculateChecksum(data.data)
        if (calculatedChecksum !== data.checksum) {
          console.warn('⚠️ [边持久化管理器] 数据校验和不匹配')
          return false
        }
      }
      
      return true
      
    } catch (error) {
      console.error('❌ [边持久化管理器] 数据验证失败:', error)
      return false
    }
  }
  
  /**
   * 计算校验和
   * @param {Object} data - 数据
   * @returns {string} - 校验和
   */
  calculateChecksum(data) {
    try {
      const str = JSON.stringify(data, Object.keys(data).sort())
      let hash = 0
      
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // 转换为32位整数
      }
      
      return hash.toString(16)
      
    } catch (error) {
      console.error('❌ [边持久化管理器] 校验和计算失败:', error)
      return ''
    }
  }
  
  /**
   * 检查是否有未保存的变更
   * @returns {boolean} - 是否有变更
   */
  hasUnsavedChanges() {
    return this.changeTracker.size > 0
  }
  
  /**
   * 检查特定类型是否有变更
   * @param {string} type - 状态类型
   * @returns {boolean} - 是否有变更
   */
  hasChanges(type) {
    return this.changeTracker.has(type)
  }
  
  /**
   * 标记变更
   * @param {string} type - 状态类型
   * @param {*} data - 变更数据
   */
  markChange(type, data = null) {
    this.changeTracker.set(type, {
      timestamp: Date.now(),
      data
    })
    
    // 触发防抖保存
    if (this.options.saveOnStateChange) {
      this.debouncedSave()
    }
  }
  
  /**
   * 防抖保存
   */
  debouncedSave() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    
    this.debounceTimer = setTimeout(() => {
      this.saveState()
    }, this.options.autoSaveDebounce)
  }
  
  /**
   * 获取预览线数量
   * @returns {number} - 预览线数量
   */
  getPreviewLineCount() {
    if (!this.edgeManager || !this.edgeManager.edges) return 0
    
    let count = 0
    for (const edge of this.edgeManager.edges.values()) {
      if (edge.type === 'preview') {
        count++
      }
    }
    return count
  }
  
  /**
   * 获取连接线数量
   * @returns {number} - 连接线数量
   */
  getConnectionCount() {
    if (!this.edgeManager || !this.edgeManager.edges) return 0
    
    let count = 0
    for (const edge of this.edgeManager.edges.values()) {
      if (edge.type === 'connection') {
        count++
      }
    }
    return count
  }
  
  /**
   * 事件处理器
   */
  
  /**
   * 处理边变化事件（统一入口）
   * @param {string} operation - 操作类型 ('created', 'updated', 'removed')
   * @param {Object} edge - 边对象
   * @returns {Promise} - 处理结果
   */
  async handleEdgeChange(operation, edge) {
    try {
      console.log(`🔄 [边持久化管理器] 处理边变化事件:`, { operation, edgeId: edge?.id })
      
      switch (operation) {
        case 'create':      // 支持create操作类型，映射到created
        case 'created':
        case 'edge:added':  // 支持UnifiedEdgeManager的edge:added操作
          return await this.handleEdgeCreated({ edge })
        case 'updated':
        case 'edge:updated':  // 支持edge:updated操作
          return await this.handleEdgeUpdated({ edge })
        case 'removed':
        case 'edge:removed':  // 支持edge:removed操作
          return await this.handleEdgeRemoved({ edge })
        default:
          console.warn(`⚠️ [边持久化管理器] 未知的操作类型: ${operation}`)
          return Promise.resolve()
      }
    } catch (error) {
      console.error(`❌ [边持久化管理器] 处理边变化事件失败:`, error)
      this.handleError(error, `handleEdgeChange-${operation}`)
      throw error
    }
  }
  
  /**
   * 处理边创建事件
   * @param {Object} event - 事件数据
   */
  handleEdgeCreated(event) {
    this.markChange(PersistenceStateType.PREVIEW_LINES)
    this.markChange(PersistenceStateType.CONNECTIONS)
    this.markChange(PersistenceStateType.NODE_EDGES)
  }
  
  /**
   * 处理边更新事件
   * @param {Object} event - 事件数据
   */
  handleEdgeUpdated(event) {
    this.markChange(PersistenceStateType.PREVIEW_LINES)
    this.markChange(PersistenceStateType.CONNECTIONS)
  }
  
  /**
   * 处理边删除事件
   * @param {Object} event - 事件数据
   */
  handleEdgeRemoved(event) {
    this.markChange(PersistenceStateType.PREVIEW_LINES)
    this.markChange(PersistenceStateType.CONNECTIONS)
    this.markChange(PersistenceStateType.NODE_EDGES)
    this.markChange(PersistenceStateType.PORT_USAGE)
  }
  
  /**
   * 处理批量操作完成事件
   * @param {Object} event - 事件数据
   */
  handleBatchCompleted(event) {
    if (this.options.saveOnBatchComplete) {
      this.saveState()
    }
  }
  
  /**
   * 处理状态变化事件
   * @param {Object} changes - 状态变化
   */
  handleStateChange(changes) {
    this.markChange(PersistenceStateType.EDGE_METADATA, changes)
  }
  
  /**
   * 处理页面卸载事件
   * @param {Event} event - 事件对象
   */
  handleBeforeUnload(event) {
    if (this.hasUnsavedChanges()) {
      // 同步保存
      this.saveState({ force: true })
    }
  }
  
  /**
   * 处理页面可见性变化事件
   * @param {Event} event - 事件对象
   */
  handleVisibilityChange(event) {
    if (document.hidden && this.hasUnsavedChanges()) {
      // 页面隐藏时保存
      this.saveState()
    }
  }
  
  /**
   * 验证当前状态数据
   * @returns {Promise<void>}
   */
  async validateCurrentState() {
    if (!this.edgeManager || !this.edgeManager.edges) {
      return
    }

    console.log('🔍 [边持久化管理器] 验证当前状态数据...')
    
    // 构建当前状态数据（统一映射为验证器期望的 {source:{cell}, target:{cell}} 格式）
    const mapEndpointToCell = (endpoint) => {
      if (!endpoint) return undefined
      // 统一支持多种来源结构
      const nodeId = endpoint.cell || endpoint.nodeId || endpoint.id || endpoint
      if (typeof nodeId === 'string' && nodeId.length > 0) {
        return { cell: nodeId }
      }
      return undefined
    }

    const currentData = {
      nodes: Array.from(this.edgeManager.nodes || []).map(([id, node]) => ({ id, ...node })),
      // 仅将“连接线”纳入 edges，用于格式迁移与严格校验；排除预览线
      edges: Array.from(this.edgeManager.edges || [])
        .filter(([_, edge]) => {
          try {
            if (typeof edge.isConnectionLine === 'function') {
              return edge.isConnectionLine()
            }
            return edge.type === 'connection'
          } catch (e) {
            return false
          }
        })
        .map(([id, edge]) => ({
          id,
          source: mapEndpointToCell(edge.source),
          target: mapEndpointToCell(edge.target),
          // 保留必要元数据以便迁移器参考
          type: edge.type,
          branch: edge.branch,
        })),
      // 预览线仅出现在 previewLines 集合，避免被当作正式边参与迁移校验
      previewLines: Array.from(this.edgeManager.previewLines || []).map(([id, line]) => ({
        id,
        source: mapEndpointToCell(line.source),
        // 预览线可能没有目标端，按验证器规则仅在存在时要求结构正确
        target: mapEndpointToCell(line.target),
        type: line.type,
        branch: line.branch,
      })),
      connections: Array.from(this.edgeManager.connections || []).map(([id, conn]) => ({
        id,
        source: mapEndpointToCell(conn.source),
        target: mapEndpointToCell(conn.target),
        type: conn.type,
        branch: conn.branch,
      })),
    }

    // 使用新的数据验证器进行验证
    const validationResult = await this.dataValidator.validateData(currentData)
    
    // 安全检查验证结果属性
    const errors = Array.isArray(validationResult.errors) ? validationResult.errors : []
    const warnings = Array.isArray(validationResult.warnings) ? validationResult.warnings : []
    const fixSuggestions = Array.isArray(validationResult.fixSuggestions) ? validationResult.fixSuggestions : []
    
    let repairActions = []
    
    if (!validationResult.isValid) {
      console.warn(`⚠️ [边持久化管理器] 发现数据问题:`, {
        errors: errors.length,
        warnings: warnings.length,
        fixSuggestions: fixSuggestions.length
      })
      
      // 报告错误详情
      errors.forEach(error => {
        console.warn(`  - 错误: ${error.message || error}`)
      })
      
      // 尝试自动修复
      if (errors.length > 0) {
        console.log('🔧 [边持久化管理器] 尝试自动修复数据问题...')
        
        try {
          console.log('🔧 [边持久化管理器] 开始数据迁移修复...')
          
          const migrationResult = await this.dataMigrationManager.migrateData(currentData)
          
          console.log('🔧 [边持久化管理器] 迁移结果:', {
            success: migrationResult.success,
            migrationCount: migrationResult.migrationCount,
            hasData: !!migrationResult.data
          })
          
          if (migrationResult.success) {
            if (migrationResult.migrationCount > 0) {
              console.log(`✅ [边持久化管理器] 自动修复成功，修复了 ${migrationResult.migrationCount} 个问题`)
              
              // 构建修复操作记录
              repairActions = [{
                action: `边数据格式修复`,
                success: true,
                count: migrationResult.migrationCount,
                details: migrationResult.report
              }]
              
              // 应用修复后的数据到边管理器
              await this.applyMigratedDataToEdgeManager(migrationResult.data)
              
              // 保存修复后的数据
              await this.saveToStorage(migrationResult.data)
              
              console.log('✅ [边持久化管理器] 修复数据已保存')
              
            } else {
              console.log('ℹ️ [边持久化管理器] 数据迁移成功，但无需修复')
              repairActions = [{
                action: '边数据格式修复',
                success: true,
                count: 0,
                reason: '数据已是最新格式，无需修复'
              }]
            }
          } else {
            console.warn('⚠️ [边持久化管理器] 数据迁移失败')
            repairActions = [{
              action: '边数据格式修复',
              success: false,
              reason: migrationResult.error || '迁移过程失败'
            }]
          }
          
        } catch (error) {
          console.error('❌ [边持久化管理器] 自动修复失败:', error)
          repairActions = [{
            action: '边数据格式修复',
            success: false,
            reason: error.message
          }]
        }
      }
      
      // 报告修复操作
      if (repairActions.length > 0) {
        console.log(`🔧 [边持久化管理器] 执行了 ${repairActions.length} 个自动修复操作`)
        repairActions.forEach(action => {
          if (action && action.success) {
            console.log(`  - 修复成功: ${action.action} (修复数量: ${action.count || 0})`)
          } else if (action) {
            console.warn(`  - 修复失败: ${action.action} (${action.reason})`)
          }
        })
      }
    } else {
      console.log('✅ [边持久化管理器] 状态数据验证通过')
    }

    // 更新统计信息
    this.stats.lastValidationTime = Date.now()
    this.stats.lastValidationResult = {
      ...validationResult,
      repairActions // 添加修复操作记录
    }
  }

  /**
   * 应用迁移后的数据到边管理器
   * @param {Object} migratedData - 迁移后的数据
   */
  async applyMigratedDataToEdgeManager(migratedData) {
    try {
      console.log('🔄 [边持久化管理器] 应用迁移后的数据到边管理器...')
      
      // 更新边数据
      if (Array.isArray(migratedData.edges)) {
        for (const edgeData of migratedData.edges) {
          if (this.edgeManager.edges.has(edgeData.id)) {
            // 更新现有边的数据
            const existingEdge = this.edgeManager.edges.get(edgeData.id)
            Object.assign(existingEdge, edgeData)
            console.log(`✅ [边持久化管理器] 更新边数据: ${edgeData.id}`)
          }
        }
      }
      
      // 更新预览线数据
      if (Array.isArray(migratedData.previewLines)) {
        for (const previewData of migratedData.previewLines) {
          if (this.edgeManager.previewLines.has(previewData.id)) {
            // 更新现有预览线的数据
            const existingPreview = this.edgeManager.previewLines.get(previewData.id)
            Object.assign(existingPreview, previewData)
            console.log(`✅ [边持久化管理器] 更新预览线数据: ${previewData.id}`)
          }
        }
      }
      
      // 更新连接数据
      if (Array.isArray(migratedData.connections)) {
        for (const connectionData of migratedData.connections) {
          if (this.edgeManager.connections.has(connectionData.id)) {
            // 更新现有连接的数据
            const existingConnection = this.edgeManager.connections.get(connectionData.id)
            Object.assign(existingConnection, connectionData)
            console.log(`✅ [边持久化管理器] 更新连接数据: ${connectionData.id}`)
          }
        }
      }
      
      console.log('✅ [边持久化管理器] 迁移数据应用完成')
      
    } catch (error) {
      console.error('❌ [边持久化管理器] 应用迁移数据失败:', error)
      throw error
    }
  }

  /**
   * 加载原始数据进行迁移
   * @returns {Promise<Object|null>} - 原始数据或null
   */
  async loadRawDataForMigration() {
    try {
      console.log('📂 [边持久化管理器] 加载原始数据进行迁移检查...')
      
      // 尝试从主存储键加载
      let rawData = StorageUtils.getItem(this.options.storageKey)
      
      // 如果主存储为空，尝试从备份键加载
      if (!rawData) {
        rawData = StorageUtils.getItem(this.options.backupKey)
      }
      
      // 如果仍然为空，尝试从旧版本键加载
      if (!rawData) {
        const legacyKeys = [
          'edge-manager-state',
          'preview-line-state', 
          'canvas-state',
          'unified-edge-state'
        ]
        
        for (const key of legacyKeys) {
          rawData = StorageUtils.getItem(key)
          if (rawData) {
            console.log(`📂 [边持久化管理器] 从旧版本键 ${key} 加载数据`)
            break
          }
        }
      }
      
      if (rawData) {
        console.log('📂 [边持久化管理器] 成功加载原始数据，大小:', JSON.stringify(rawData).length)
        return rawData
      } else {
        console.log('📂 [边持久化管理器] 未找到需要迁移的数据')
        return null
      }
      
    } catch (error) {
      console.error('❌ [边持久化管理器] 加载原始数据失败:', error)
      return null
    }
  }

  /**
   * 错误处理
   * @param {Error} error - 错误对象
   * @param {string} context - 错误上下文
   */
  handleError(error, context) {
    this.stats.errors++
    this.stats.lastError = {
      error: error.message,
      context,
      timestamp: Date.now()
    }
    
    if (this.options.logErrors) {
      console.error(`❌ [边持久化管理器] ${context} 错误:`, error)
    }
    
    this.emit('error', { error, context })
  }
  
  /**
   * 事件发射器
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   */
  emit(event, data) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('❌ [边持久化管理器] 事件监听器错误:', error)
        }
      })
    }
  }
  
  /**
   * 添加事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event).add(callback)
  }
  
  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  off(event, callback) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(callback)
    }
  }
  
  /**
   * 获取统计信息
   * @returns {Object} - 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      isInitialized: this.isInitialized,
      isPersisting: this.isPersisting,
      isRestoring: this.isRestoring,
      lastSaveTime: this.lastSaveTime,
      lastRestoreTime: this.lastRestoreTime,
      hasUnsavedChanges: this.hasUnsavedChanges(),
      changeCount: this.changeTracker.size
    }
  }
  
  /**
   * 清理资源
   */
  destroy() {
    // 最后保存
    if (this.hasUnsavedChanges()) {
      this.saveState({ force: true })
    }
    
    // 清理定时器
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
      this.autoSaveTimer = null
    }
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
    
    // 清理事件监听器
    this.eventListeners.clear()
    
    // 清理缓存
    this.serializationCache.clear()
    this.deserializationCache.clear()
    this.changeTracker.clear()
    
    // 🔧 修复：移除旧的窗口事件解绑，统一事件系统会处理
    // if (typeof window !== 'undefined') {
    //   window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this))
    //   window.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
    // }
    
    this.isInitialized = false
    
    console.log('🗑️ [边持久化管理器] 资源清理完成')
  }
}

/**
 * 创建边持久化管理器
 * @param {UnifiedEdgeManager} edgeManager - 边管理器实例
 * @param {Object} options - 配置选项
 * @returns {EdgePersistenceManager} - 边持久化管理器实例
 */
export function createEdgePersistenceManager(edgeManager, options = {}) {
  return new EdgePersistenceManager(edgeManager, options)
}

export default EdgePersistenceManager

// 触发热更新 - 修复完成