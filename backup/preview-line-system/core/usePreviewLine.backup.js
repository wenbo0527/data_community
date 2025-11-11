import { ref, reactive, computed } from 'vue'
import { PreviewLineSystem } from '../../../../../utils/preview-line/PreviewLineSystem.js'
import { PortConfigurationFactory } from '../../../../../utils/preview-line/core/PortConfigurationFactory.js'
import { ConnectionCreationController } from '../../../../../utils/preview-line/core/ConnectionCreationController.js'
import { InPortSnapDetector } from '../../../../../utils/preview-line/algorithms/InPortSnapDetector.js'
import { SpatialIndexOptimizer } from '../../../../../utils/preview-line/performance/SpatialIndexOptimizer.js'
import { BatchProcessor } from '../../../../../utils/preview-line/performance/BatchProcessor.js'
import { CacheManager } from '../../../../../utils/preview-line/performance/CacheManager.js'
import { 
  UnifiedEdge, 
  EdgeTypes, 
  PreviewStates, 
  ConnectionStates,
  isPreviewLine,
  isConnectionLine,
  classifyPreviewLine,
  getEdgeDisplayStyle
} from './unified/EdgeTypes.js'

/**
 * 预览线管理器 Composable
 * 负责管理画布的预览线相关功能
 * 已集成统一边数据模型和PreviewLineSystem架构，以及新的核心模块
 */
export function usePreviewLine(graph = null) {
  // 核心模块实例
  const portConfigFactory = ref(null)
  const connectionController = ref(null)
  const snapDetector = ref(null)
  
  // 性能优化模块实例
  const spatialOptimizer = ref(null)
  const batchProcessor = ref(null)
  const cacheManager = ref(null)

  // 预览线状态管理
  const previewLineStats = ref({
    total: 0,
    valid: 0,
    invalid: 0,
    byType: {
      single: 0,
      branch: 0
    }
  })

  // 预览线存储（使用统一数据模型）
  const previewLines = reactive(new Map())
  const previewLinesByNode = reactive(new Map())

  // 性能统计
  const performanceStats = reactive({
    operationsCount: 0,
    lastOperationTime: 0,
    averageOperationTime: 0,
    totalOperationTime: 0
  })

  // 错误处理
  const errors = reactive([])
  const warnings = reactive([])

  // 事件系统
  const eventListeners = reactive(new Map())
  
  // 缓存系统（保留原有，与新的CacheManager并存）
  const cache = reactive({
    validationResults: new Map(),
    nodeConnections: new Map(),
    lastCacheUpdate: 0,
    cacheTimeout: 5000 // 5秒缓存超时
  })

  // 配置选项
  const options = reactive({
    enableAutoCleanup: true,
    enablePerformanceMonitoring: true,
    enableCaching: true,
    maxPreviewLines: 100,
    cleanupInterval: 30000, // 30秒清理间隔
    batchSize: 10, // 批量操作大小
    
    // 新增配置
    enableSpatialOptimization: true,
    enableBatchProcessing: true,
    enableAdvancedCaching: true,
    enablePortValidation: true,
    enableSnapDetection: true
  })

  // 初始化核心模块
  const initializeCoreModules = () => {
    try {
      // 初始化端口配置工厂
      if (options.enablePortValidation) {
        portConfigFactory.value = new PortConfigurationFactory({
          enableDebug: options.enablePerformanceMonitoring,
          enableValidation: true,
          enableCaching: options.enableAdvancedCaching
        })
        console.log('✅ [usePreviewLine] PortConfigurationFactory 初始化完成')
      }

      // 初始化连接创建控制器
      connectionController.value = new ConnectionCreationController({
        graph: graph,
        portConfigFactory: portConfigFactory.value,
        enableDebug: options.enablePerformanceMonitoring,
        enableValidation: options.enablePortValidation
      })
      console.log('✅ [usePreviewLine] ConnectionCreationController 初始化完成')

      // 初始化吸附检测器
      if (options.enableSnapDetection) {
        snapDetector.value = new InPortSnapDetector({
          graph: graph,
          portConfigFactory: portConfigFactory.value,
          enableDebug: options.enablePerformanceMonitoring,
          snapDistance: 20,
          enableVisualFeedback: true
        })
        console.log('✅ [usePreviewLine] InPortSnapDetector 初始化完成')
      }

      // 初始化性能优化模块
      if (options.enableSpatialOptimization) {
        spatialOptimizer.value = new SpatialIndexOptimizer({
          gridSize: 100,
          enableDebug: options.enablePerformanceMonitoring,
          enableStats: true
        })
        console.log('✅ [usePreviewLine] SpatialIndexOptimizer 初始化完成')
      }

      if (options.enableBatchProcessing) {
        batchProcessor.value = new BatchProcessor({
          batchSize: options.batchSize,
          enableDebug: options.enablePerformanceMonitoring,
          enableStats: true
        })
        
        // 注册批量处理器
        batchProcessor.value.registerProcessor('createPreviewLine', async (operations) => {
          console.log(`🔄 [usePreviewLine] 批量创建预览线: ${operations.length} 个`)
          for (const operation of operations) {
            await createPreviewLineInternal(operation.sourceNodeId, operation.options)
          }
        })
        
        batchProcessor.value.registerProcessor('removePreviewLine', async (operations) => {
          console.log(`🔄 [usePreviewLine] 批量删除预览线: ${operations.length} 个`)
          for (const operation of operations) {
            await removePreviewLineInternal(operation.previewLineId)
          }
        })
        
        console.log('✅ [usePreviewLine] BatchProcessor 初始化完成')
      }

      if (options.enableAdvancedCaching) {
        cacheManager.value = new CacheManager({
          maxSize: 500,
          defaultTTL: 5 * 60 * 1000, // 5分钟
          enableDebug: options.enablePerformanceMonitoring,
          enableTieredCache: true
        })
        console.log('✅ [usePreviewLine] CacheManager 初始化完成')
      }

    } catch (error) {
      console.error('❌ [usePreviewLine] 核心模块初始化失败:', error)
      addError('核心模块初始化失败', error)
    }
  }

  // 计算属性
  const hasPreviewLines = computed(() => previewLines.size > 0)
  const previewLineCount = computed(() => previewLines.size)
  const validPreviewLineCount = computed(() => {
    return Array.from(previewLines.values()).filter(edge => edge.isValid).length
  })

  // 事件系统方法
  const on = (event, callback) => {
    if (!eventListeners.has(event)) {
      eventListeners.set(event, [])
    }
    eventListeners.get(event).push(callback)
  }

  const off = (event, callback) => {
    const listeners = eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  // 增强的事件系统
  const emit = (event, data) => {
    const listeners = eventListeners.get(event) || []
    
    // 创建详细的事件对象
    const eventObj = {
      type: event,
      timestamp: Date.now(),
      source: 'usePreviewLine',
      data: data,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    console.log(`📡 [PreviewLine] 触发事件: ${event}`, {
      eventId: eventObj.id,
      listenersCount: listeners.length,
      data: data
    })

    let handledCount = 0
    listeners.forEach((callback, index) => {
      try {
        const result = callback(eventObj, data)
        handledCount++
        
        // 记录成功处理的监听器
        console.log(`✅ [PreviewLine] 事件监听器 ${index + 1} 处理成功:`, {
          event,
          eventId: eventObj.id,
          result: result !== undefined ? 'returned value' : 'no return'
        })
      } catch (error) {
        console.error(`❌ [PreviewLine] 事件回调错误 (${event}) - 监听器 ${index + 1}:`, {
          error: error.message,
          eventId: eventObj.id,
          stack: error.stack
        })
        
        // 触发错误事件
        const errorListeners = eventListeners.get('error') || []
        errorListeners.forEach(errorCallback => {
          try {
            errorCallback({
              type: 'listener-error',
              originalEvent: event,
              error: error,
              eventId: eventObj.id,
              listenerIndex: index
            })
          } catch (errorHandlerError) {
            console.error('❌ [PreviewLine] 错误处理器也出错了:', errorHandlerError)
          }
        })
      }
    })

    // 记录事件处理统计
    console.log(`📊 [PreviewLine] 事件处理完成: ${event}`, {
      eventId: eventObj.id,
      totalListeners: listeners.length,
      handledSuccessfully: handledCount,
      failedCount: listeners.length - handledCount
    })

    return eventObj
  }

  // 批量事件触发
  const emitBatch = (events) => {
    console.log(`📡 [PreviewLine] 批量触发事件:`, events.map(e => e.event))
    
    const results = []
    events.forEach(({ event, data }) => {
      try {
        const result = emit(event, data)
        results.push({ event, success: true, result })
      } catch (error) {
        results.push({ event, success: false, error })
        console.error(`❌ [PreviewLine] 批量事件处理失败: ${event}`, error)
      }
    })
    
    return results
  }

  // 异步事件触发
  const emitAsync = async (event, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = emit(event, data)
        resolve(result)
      }, 0)
    })
  }

  // 缓存管理
  const getCachedResult = (key) => {
    if (!options.enableCaching) return null
    
    const cached = cache.validationResults.get(key)
    if (cached && (Date.now() - cached.timestamp) < cache.cacheTimeout) {
      return cached.data
    }
    return null
  }

  const setCachedResult = (key, data) => {
    if (!options.enableCaching) return
    
    cache.validationResults.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  const clearCache = () => {
    cache.validationResults.clear()
    cache.nodeConnections.clear()
    cache.lastCacheUpdate = Date.now()
  }

  // 性能监控装饰器
  const withPerformanceMonitoring = (fn, operationName) => {
    return async (...args) => {
      const startTime = performance.now()
      try {
        const result = await fn(...args)
        const endTime = performance.now()
        const duration = endTime - startTime
        
        performanceStats.operationsCount++
        performanceStats.lastOperationTime = duration
        performanceStats.totalOperationTime += duration
        performanceStats.averageOperationTime = performanceStats.totalOperationTime / performanceStats.operationsCount
        
        if (options.enablePerformanceMonitoring) {
          console.log(`⚡ [PreviewLine] ${operationName} 完成，耗时: ${duration.toFixed(2)}ms`)
        }
        
        emit('operation:completed', { operationName, duration, success: true })
        return result
      } catch (error) {
        const endTime = performance.now()
        const duration = endTime - startTime
        console.error(`❌ [PreviewLine] ${operationName} 失败，耗时: ${duration.toFixed(2)}ms`, error)
        addError(`${operationName}失败: ${error.message}`)
        
        emit('operation:completed', { operationName, duration, success: false, error })
        throw error
      }
    }
  }

  // 错误处理
  const addError = (message, details = null) => {
    const error = {
      id: Date.now(),
      message,
      details,
      timestamp: new Date().toISOString(),
      type: 'error'
    }
    errors.push(error)
    console.error('[PreviewLine] 错误:', error)
    emit('error:added', error)
  }

  const addWarning = (message, details = null) => {
    const warning = {
      id: Date.now(),
      message,
      details,
      timestamp: new Date().toISOString(),
      type: 'warning'
    }
    warnings.push(warning)
    console.warn('[PreviewLine] 警告:', warning)
    emit('warning:added', warning)
  }

  const clearErrors = () => {
    errors.splice(0, errors.length)
    warnings.splice(0, warnings.length)
    emit('errors:cleared')
  }

  // 内部创建预览线方法（不包装性能监控）
  const createPreviewLineInternal = async (sourceNodeId, options = {}) => {
    if (!graph) {
      throw new Error('图实例不存在')
    }

    // 验证源节点
    const sourceNode = graph.getCellById(sourceNodeId)
    if (!sourceNode) {
      throw new Error(`源节点不存在: ${sourceNodeId}`)
    }

    // 使用端口配置工厂验证端口
    if (portConfigFactory.value && options.enablePortValidation !== false) {
      const portConfig = portConfigFactory.value.getPortConfiguration(sourceNode)
      if (!portConfig.hasOutPort) {
        throw new Error(`源节点 ${sourceNodeId} 没有有效的输出端口`)
      }
    }

    // 检查是否已存在预览线
    const existingPreview = getPreviewLineByNode(sourceNodeId, options.branchId)
    if (existingPreview) {
      addWarning(`节点 ${sourceNodeId} 的预览线已存在`, { branchId: options.branchId })
      return existingPreview
    }

    // 检查预览线数量限制
    if (previewLines.size >= options.maxPreviewLines) {
      throw new Error(`预览线数量已达上限: ${options.maxPreviewLines}`)
    }

    // 创建统一边实例
    const unifiedEdge = new UnifiedEdge({
      type: EdgeTypes.PREVIEW,
      source: { 
        nodeId: sourceNodeId,
        port: 'out' // 统一使用out端口
      },
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
        opacity: 0.7
      },
      metadata: {
        createdBy: options.createdBy || 'usePreviewLine',
        nodeType: sourceNode.getData()?.nodeType,
        portValidated: !!portConfigFactory.value
      }
    })

    // 验证边数据
    const validation = unifiedEdge.validate()
    if (!validation.isValid) {
      throw new Error(`预览线数据无效: ${validation.errors.join(', ')}`)
    }

    // 添加到图形
    const x6EdgeData = unifiedEdge.toX6EdgeData()
    const graphEdge = graph.addEdge(x6EdgeData)
    unifiedEdge.graphInstance = graphEdge

    // 存储到本地管理
    previewLines.set(unifiedEdge.id, unifiedEdge)
    
    // 按节点索引
    if (!previewLinesByNode.has(sourceNodeId)) {
      previewLinesByNode.set(sourceNodeId, new Map())
    }
    const nodePreviewLines = previewLinesByNode.get(sourceNodeId)
    const key = options.branchId || 'default'
    nodePreviewLines.set(key, unifiedEdge)

    // 添加到空间索引
    if (spatialOptimizer.value) {
      const sourcePos = sourceNode.getPosition()
      spatialOptimizer.value.addItem(unifiedEdge.id, {
        x: sourcePos.x,
        y: sourcePos.y,
        width: sourceNode.getSize().width,
        height: sourceNode.getSize().height,
        type: 'previewLine',
        sourceNodeId
      })
    }

    // 清除相关缓存
    clearCache()
    if (cacheManager.value) {
      cacheManager.value.delete(`preview_${sourceNodeId}`)
    }

    // 更新统计
    updateStats()

    console.log('✅ [PreviewLine] 预览线创建成功:', {
      id: unifiedEdge.id,
      sourceNodeId,
      branchId: options.branchId,
      portValidated: !!portConfigFactory.value
    })

    emit('previewLine:created', { 
      previewLine: unifiedEdge, 
      sourceNodeId, 
      options 
    })

    return unifiedEdge
  }

  // 创建预览线（使用统一数据模型和新的核心模块）
  const createPreviewLine = withPerformanceMonitoring(async (sourceNodeId, options = {}) => {
    // 如果启用批量处理，添加到批量队列
    if (batchProcessor.value && options.enableBatch !== false) {
      return new Promise((resolve, reject) => {
        const success = batchProcessor.value.addOperation('createPreviewLine', {
          sourceNodeId,
          options
        }, {
          priority: options.priority || 'normal',
          deduplicationKey: `create_${sourceNodeId}_${options.branchId || 'default'}`
        })
        
        if (success) {
          // 监听批量处理完成事件
          const cleanup = () => {
            off('previewLine:created', onCreated)
            off('error:added', onError)
          }
          
          const onCreated = (event) => {
            if (event.data.sourceNodeId === sourceNodeId) {
              cleanup()
              resolve(event.data.previewLine)
            }
          }
          
          const onError = (event) => {
            if (event.data.message.includes(sourceNodeId)) {
              cleanup()
              reject(new Error(event.data.message))
            }
          }
          
          on('previewLine:created', onCreated)
          on('error:added', onError)
        } else {
          reject(new Error('添加到批量处理队列失败'))
        }
      })
    }

    // 直接创建
    return await createPreviewLineInternal(sourceNodeId, options)
  }, '创建预览线')

  // 内部删除预览线方法（不包装性能监控）
  const removePreviewLineInternal = async (previewLineId, options = {}) => {
    // 防止递归删除
    if (removePreviewLineInternal._isRemoving) {
      console.warn(`[PreviewLine] 预览线删除已在进行中，跳过: ${previewLineId}`)
      return false
    }

    if (!graph) {
      throw new Error('图实例不存在')
    }

    const unifiedEdge = previewLines.get(previewLineId)
    if (!unifiedEdge) {
      addWarning(`预览线不存在: ${previewLineId}`)
      return false
    }

    try {
      removePreviewLineInternal._isRemoving = true

      // 从本地存储中删除（先删除存储，避免事件触发时找到已删除的预览线）
      previewLines.delete(previewLineId)
      
      // 从节点索引中删除
      const sourceNodeId = unifiedEdge.source.nodeId
      if (previewLinesByNode.has(sourceNodeId)) {
        const nodePreviewLines = previewLinesByNode.get(sourceNodeId)
        const key = unifiedEdge.branch?.id || 'default'
        nodePreviewLines.delete(key)
        
        if (nodePreviewLines.size === 0) {
          previewLinesByNode.delete(sourceNodeId)
        }
      }

      // 从空间索引中移除
      if (spatialOptimizer.value) {
        spatialOptimizer.value.removeItem(previewLineId)
      }

      // 从图形中删除（使用静默模式避免触发事件）
      if (unifiedEdge.graphInstance) {
        graph.removeCell(unifiedEdge.graphInstance, { silent: true })
      }

      // 清除相关缓存
      clearCache()
      if (cacheManager.value) {
        cacheManager.value.delete(`preview_${sourceNodeId}`)
      }

      // 更新统计
      updateStats()

      console.log('🗑️ [PreviewLine] 预览线删除成功:', previewLineId)
      
      emit('previewLine:removed', { 
        previewLineId, 
        sourceNodeId,
        options
      })
      
      return true
    } catch (error) {
      console.error(`[PreviewLine] 删除预览线时出错: ${previewLineId}`, error)
      return false
    } finally {
      removePreviewLineInternal._isRemoving = false
    }
  }

  // 删除预览线（集成新的核心模块）
  const removePreviewLine = withPerformanceMonitoring(async (previewLineId, options = {}) => {
    // 如果启用批量处理，添加到批量队列
    if (batchProcessor.value && options.enableBatch !== false) {
      return new Promise((resolve, reject) => {
        const success = batchProcessor.value.addOperation('removePreviewLine', {
          previewLineId,
          options
        }, {
          priority: options.priority || 'normal',
          deduplicationKey: `remove_${previewLineId}`
        })
        
        if (success) {
          // 监听批量处理完成事件
          const cleanup = () => {
            off('previewLine:removed', onRemoved)
            off('error:added', onError)
          }
          
          const onRemoved = (event) => {
            if (event.data.previewLineId === previewLineId) {
              cleanup()
              resolve(true)
            }
          }
          
          const onError = (event) => {
            if (event.data.message.includes(previewLineId)) {
              cleanup()
              reject(new Error(event.data.message))
            }
          }
          
          on('previewLine:removed', onRemoved)
          on('error:added', onError)
        } else {
          reject(new Error('添加到批量处理队列失败'))
        }
      })
    }

    // 直接删除
    return await removePreviewLineInternal(previewLineId, options)
  }, '删除预览线')

  // 转换预览线为连接线
  const convertPreviewToConnection = withPerformanceMonitoring(async (previewLineId, targetNodeId, options = {}) => {
    if (!graph) {
      throw new Error('图实例不存在')
    }

    const unifiedEdge = previewLines.get(previewLineId)
    if (!unifiedEdge) {
      throw new Error(`预览线不存在: ${previewLineId}`)
    }

    // 验证目标节点
    const targetNode = graph.getCellById(targetNodeId)
    if (!targetNode) {
      throw new Error(`目标节点不存在: ${targetNodeId}`)
    }

    // 使用端口配置工厂验证目标节点端口
    if (portConfigFactory.value && options.enablePortValidation !== false) {
      const targetPortConfig = portConfigFactory.value.getPortConfiguration(targetNode)
      if (!targetPortConfig.hasInPort) {
        throw new Error(`目标节点 ${targetNodeId} 没有有效的输入端口`)
      }
    }

    const sourceNodeId = unifiedEdge.source.nodeId
    const branchId = unifiedEdge.branch?.id

    // 检查重复连接
    const existingConnection = await checkDuplicateConnection(sourceNodeId, targetNodeId, branchId)
    if (existingConnection) {
      console.warn('⚠️ [PreviewLine] 检测到重复连接，取消转换:', {
        sourceNodeId,
        targetNodeId,
        branchId,
        existingConnectionId: existingConnection.id
      })
      throw new Error(`连接已存在: ${sourceNodeId} -> ${targetNodeId}`)
    }

    // 验证端口配置
    const sourcePort = options.sourcePort || 'out'
    const targetPort = options.targetPort || 'in'

    // 使用连接创建控制器进行连接创建
    let connectionResult
    if (connectionController.value) {
      try {
        connectionResult = await connectionController.value.createConnection({
          sourceNodeId,
          targetNodeId,
          sourcePort,
          targetPort,
          previewLineId,
          style: {
            stroke: options.stroke || '#A2B1C3',
            strokeWidth: options.strokeWidth || 2,
            strokeDasharray: null,
            opacity: 1
          },
          metadata: {
            ...unifiedEdge.metadata,
            convertedAt: Date.now(),
            convertedBy: options.convertedBy || 'usePreviewLine',
            createdViaController: true
          }
        })
        console.log('✅ [PreviewLine] 使用连接创建控制器成功')
      } catch (error) {
        console.error('❌ [PreviewLine] 连接创建控制器失败:', error)
        // 强制要求使用UnifiedEdgeManager，不允许降级
        throw new Error(`连接创建控制器失败，无法创建连接: ${error.message}`)
      }
    }

    if (!connectionResult) {
      // 转换为连接线（只添加target，保持source不变）
      const originalSource = { ...unifiedEdge.source }
      unifiedEdge.convertToConnection({ 
        nodeId: targetNodeId, 
        port: targetPort 
      })

      // 确保source保持不变
      if (unifiedEdge.source.nodeId !== originalSource.nodeId) {
        console.warn('⚠️ [PreviewLine] 源节点意外改变，正在修复...')
        unifiedEdge.source = originalSource
      }
      
      // 更新图形
      const x6EdgeData = unifiedEdge.toX6EdgeData()
      if (unifiedEdge.graphInstance) {
        // 更新现有边 - 只更新target，保持source不变
        unifiedEdge.graphInstance.setTarget(x6EdgeData.target, { port: targetPort })
        unifiedEdge.graphInstance.setData({
          ...x6EdgeData.data,
          type: 'connection', // 确保类型更新
          isPreview: false,
          isConnection: true
        })
        // 更新样式为连接线样式
        unifiedEdge.graphInstance.setAttrs({
          line: {
            stroke: '#A2B1C3',
            strokeWidth: 2,
            strokeDasharray: 'none',
            targetMarker: {
              name: 'block',
              width: 12,
              height: 8,
              fill: '#A2B1C3'
            }
          }
        })
      } else {
        // 创建新边
        const graphEdge = graph.addEdge(x6EdgeData)
        unifiedEdge.graphInstance = graphEdge
      }
    }

    // 从预览线存储中移除
    previewLines.delete(previewLineId)
    
    // 从节点索引中删除预览线记录
    if (previewLinesByNode.has(sourceNodeId)) {
      const nodePreviewLines = previewLinesByNode.get(sourceNodeId)
      const key = branchId || 'default'
      nodePreviewLines.delete(key)
      
      if (nodePreviewLines.size === 0) {
        previewLinesByNode.delete(sourceNodeId)
      }
    }

    // 从空间索引中移除
    if (spatialOptimizer.value) {
      spatialOptimizer.value.removeItem(previewLineId)
    }

    // 清除相关缓存
    clearCache()
    if (cacheManager.value) {
      cacheManager.value.delete(`preview_${sourceNodeId}`)
      cacheManager.value.delete(`connection_${sourceNodeId}_${targetNodeId}`)
    }

    // 更新统计
    updateStats()

    console.log('🔄 [PreviewLine] 预览线转换为连接线成功:', {
      id: unifiedEdge.id,
      sourceNodeId,
      targetNodeId,
      sourcePort,
      targetPort,
      branchId,
      usedController: !!connectionController.value,
      portValidated: !!portConfigFactory.value
    })

    emit('previewLine:converted', { 
      previewLine: unifiedEdge, 
      sourceNodeId, 
      targetNodeId, 
      sourcePort,
      targetPort,
      branchId,
      options 
    })

    return unifiedEdge
  }, '转换预览线为连接线')

  // 检查重复连接的辅助函数
  const checkDuplicateConnection = async (sourceNodeId, targetNodeId, branchId = null) => {
    if (!graph) return null

    const allEdges = graph.getEdges() || []
    
    return allEdges.find(edge => {
      const edgeData = edge.getData() || {}
      const edgeSourceId = edgeData.sourceNodeId || edge.getSourceCellId()
      const edgeTargetId = edgeData.targetNodeId || edge.getTargetCellId()
      const edgeBranchId = edgeData.branchId

      // 检查节点匹配
      const matchesNodes = edgeSourceId === sourceNodeId && edgeTargetId === targetNodeId
      
      // 检查分支匹配
      const matchesBranch = branchId ? edgeBranchId === branchId : true
      
      // 确保不是预览线
      const isNotPreview = !edgeData.isPreview && !isPreviewLine(edge)
      
      return matchesNodes && matchesBranch && isNotPreview
    })
  }

  // 获取节点的预览线
  const getPreviewLineByNode = (nodeId, branchId = null) => {
    const nodePreviewLines = previewLinesByNode.get(nodeId)
    if (!nodePreviewLines) return null
    
    const key = branchId || 'default'
    return nodePreviewLines.get(key) || null
  }

  // 获取节点的所有预览线
  const getPreviewLinesByNode = (nodeId) => {
    const nodePreviewLines = previewLinesByNode.get(nodeId)
    if (!nodePreviewLines) return []
    
    return Array.from(nodePreviewLines.values())
  }

  // 智能验证预览线有效性（增强版）
  const validatePreviewLines = withPerformanceMonitoring(async (targetGraph = null) => {
    const workingGraph = targetGraph || graph
    if (!workingGraph) {
      addWarning('无法验证预览线：图实例不存在')
      return { invalidCount: 0, validCount: 0 }
    }

    // 检查缓存
    const cacheKey = `validate_${workingGraph.id || 'default'}`
    const cachedResult = getCachedResult(cacheKey)
    if (cachedResult) {
      console.log('🔍 [PreviewLine] 使用缓存的验证结果')
      return cachedResult
    }

    console.log('🔍 [PreviewLine] 开始智能验证预览线有效性...')
    
    const allEdges = workingGraph.getEdges() || []
    const previewEdges = allEdges.filter(edge => isPreviewLine(edge))
    
    let invalidCount = 0
    let validCount = 0
    const validationResults = []

    for (const edge of previewEdges) {
      try {
        const edgeData = edge.getData() || {}
        const sourceId = edgeData.sourceNodeId || edge.getSourceCellId()
        const sourceNode = workingGraph.getCellById(sourceId)

        // 创建或获取统一边实例进行验证
        let unifiedEdge = previewLines.get(edge.id)
        if (!unifiedEdge) {
          unifiedEdge = UnifiedEdge.fromX6EdgeData(edge)
        }

        const validation = unifiedEdge.validate()
        
        if (!validation.isValid || !sourceNode) {
          console.log(`🗑️ [PreviewLine] 清理无效预览线: ${edge.id}`, validation.errors)
          // 先从存储中删除，再从图中删除
          previewLines.delete(edge.id)
          workingGraph.removeCell(edge, { silent: true })
          invalidCount++
          
          validationResults.push({
            edgeId: edge.id,
            isValid: false,
            errors: validation.errors,
            action: 'removed'
          })
          continue
        }

        // 检查源节点配置状态
        const sourceData = sourceNode.getData() || {}
        const nodeType = sourceData.nodeType || sourceData.type
        const isSplitNode = ['audience-split', 'event-split', 'ab-test'].includes(nodeType)
        const isStartNode = nodeType === 'start'
        const isNodeConfigured = sourceData.isConfigured || isStartNode

        if (!isNodeConfigured && !isSplitNode) {
          console.log(`🗑️ [PreviewLine] 清理未配置节点的预览线: ${edge.id}, 节点类型: ${nodeType}`)
          // 先从存储中删除，再从图中删除
          previewLines.delete(edge.id)
          workingGraph.removeCell(edge, { silent: true })
          invalidCount++
          
          validationResults.push({
            edgeId: edge.id,
            isValid: false,
            errors: ['源节点未配置'],
            action: 'removed'
          })
          continue
        }

        // 有效预览线
        validCount++
        
        // 确保在本地存储中
        if (!previewLines.has(edge.id)) {
          unifiedEdge.graphInstance = edge
          previewLines.set(edge.id, unifiedEdge)
          
          // 更新节点索引
          if (!previewLinesByNode.has(sourceId)) {
            previewLinesByNode.set(sourceId, new Map())
          }
          const nodePreviewLines = previewLinesByNode.get(sourceId)
          const key = edgeData.branchId || 'default'
          nodePreviewLines.set(key, unifiedEdge)
        }
        
        validationResults.push({
          edgeId: edge.id,
          isValid: true,
          errors: [],
          action: 'kept'
        })

      } catch (error) {
        console.error(`验证预览线失败: ${edge.id}`, error)
        addError(`验证预览线失败: ${edge.id}`, error)
        invalidCount++
      }
    }

    // 更新统计信息
    previewLineStats.value = {
      total: previewEdges.length,
      valid: validCount,
      invalid: invalidCount,
      byType: {
        single: validationResults.filter(r => r.isValid && !r.branchId).length,
        branch: validationResults.filter(r => r.isValid && r.branchId).length
      }
    }

    const result = { 
      invalidCount, 
      validCount, 
      validationResults,
      stats: previewLineStats.value 
    }

    // 缓存结果
    setCachedResult(cacheKey, result)

    console.log(`✅ [PreviewLine] 智能验证完成，清理了 ${invalidCount} 条无效预览线，保留了 ${validCount} 条有效预览线`)
    
    emit('validation:completed', result)
    
    return result
  }, '验证预览线')

  // 清理已连接节点的预览线（增强版）
  const cleanupConnectedPreviewLines = withPerformanceMonitoring(async (targetGraph = null) => {
    const workingGraph = targetGraph || graph
    if (!workingGraph) {
      addWarning('无法清理预览线：图实例不存在')
      return { removed: 0, remaining: 0 }
    }

    console.log('🧹 [PreviewLine] 开始清理已连接节点的预览线...')
    
    const allEdges = workingGraph.getEdges() || []
    const allNodes = workingGraph.getNodes() || []
    
    // 统计每个节点的真实连接情况
    const nodeConnections = new Map()
    
    allNodes.forEach(node => {
      nodeConnections.set(node.id, {
        hasOutgoing: false,
        hasIncoming: false,
        branches: new Set(),
        connections: []
      })
    })

    // 分类边：真实连接和预览线
    const realConnections = []
    const previewEdgesList = []

    allEdges.forEach(edge => {
      const sourceId = edge.getSourceCellId()
      const targetId = edge.getTargetCellId()
      const edgeData = edge.getData() || {}
      
      if (isPreviewLine(edge)) {
        previewEdgesList.push({
          id: edge.id,
          edge,
          source: sourceId,
          target: targetId,
          branchId: edgeData.branchId,
          classification: classifyPreviewLine(edge)
        })
      } else if (isConnectionLine(edge)) {
        realConnections.push({
          id: edge.id,
          source: sourceId,
          target: targetId,
          branchId: edgeData.branchId
        })
        
        // 更新节点连接状态
        if (sourceId && nodeConnections.has(sourceId)) {
          const sourceConn = nodeConnections.get(sourceId)
          sourceConn.hasOutgoing = true
          sourceConn.connections.push(edge.id)
          if (edgeData.branchId) {
            sourceConn.branches.add(edgeData.branchId)
          }
        }
        
        if (targetId && nodeConnections.has(targetId)) {
          const targetConn = nodeConnections.get(targetId)
          targetConn.hasIncoming = true
        }
      }
    })

    // 确定需要删除的预览线
    const previewLinesToRemove = []
    
    previewEdgesList.forEach(previewInfo => {
      const sourceConn = nodeConnections.get(previewInfo.source)
      if (sourceConn) {
        let shouldRemove = false
        
        if (previewInfo.branchId) {
          // 分支预览线：检查该分支是否已有真实连接
          if (sourceConn.branches.has(previewInfo.branchId)) {
            shouldRemove = true
          }
        } else {
          // 单一预览线：检查节点是否已有任何出向连接
          if (sourceConn.hasOutgoing) {
            shouldRemove = true
          }
        }
        
        if (shouldRemove) {
          previewLinesToRemove.push(previewInfo)
        }
      }
    })

    // 删除已连接的预览线
    for (const previewInfo of previewLinesToRemove) {
      try {
        // 先从存储中删除，避免事件触发时找到已删除的预览线
        previewLines.delete(previewInfo.id)
        
        // 从节点索引中删除
        if (previewLinesByNode.has(previewInfo.source)) {
          const nodePreviewLines = previewLinesByNode.get(previewInfo.source)
          const key = previewInfo.branchId || 'default'
          nodePreviewLines.delete(key)
          
          if (nodePreviewLines.size === 0) {
            previewLinesByNode.delete(previewInfo.source)
          }
        }
        
        // 最后从图中删除（使用静默模式避免触发事件）
        workingGraph.removeCell(previewInfo.edge, { silent: true })
      } catch (error) {
        console.error(`删除预览线失败: ${previewInfo.id}`, error)
        addError(`删除预览线失败: ${previewInfo.id}`, error)
      }
    }

    const remainingPreviewLines = previewEdgesList.length - previewLinesToRemove.length
    
    // 更新统计
    updateStats()
    
    const result = {
      removed: previewLinesToRemove.length,
      remaining: remainingPreviewLines,
      removedDetails: previewLinesToRemove.map(p => ({
        id: p.id,
        source: p.source,
        branchId: p.branchId,
        type: p.classification.type
      }))
    }
    
    console.log(`✅ [PreviewLine] 预览线清理完成，删除了 ${previewLinesToRemove.length} 条已连接的预览线，保留了 ${remainingPreviewLines} 条未连接的预览线`)
    
    emit('cleanup:completed', result)
    
    return result
  }, '清理已连接预览线')

  // 统计预览线数量（增强版）
  const countPreviewLines = (targetGraph = null) => {
    const workingGraph = targetGraph || graph
    if (!workingGraph) {
      return { 
        realConnections: 0, 
        previewLines: 0, 
        labelCount: 0,
        byType: { single: 0, branch: 0 },
        byState: {},
        nodeDetails: new Map()
      }
    }

    const allEdges = workingGraph.getEdges() || []
    const allNodes = workingGraph.getNodes() || []
    let realConnections = 0
    let previewLineCount = 0
    let labelCount = 0
    const byType = { single: 0, branch: 0 }
    const byState = {}
    const nodeDetails = new Map()

    // 初始化每个节点的统计信息
    allNodes.forEach(node => {
      const nodeData = node.getData() || {}
      const nodeType = nodeData.type || nodeData.nodeType || 'unknown'
      
      // 获取节点配置的分支数量
      let expectedBranches = 0
      
      // 优先使用 branchCount 字段
      if (nodeData.branchCount) {
        expectedBranches = nodeData.branchCount
      } 
      // 处理特殊分支节点类型
      else if (nodeType === 'audience-split' || nodeType === 'crowd-split') {
        const config = nodeData.config || {}
        // 计算人群分流节点的分支数：crowdLayers + unmatchBranch
        const crowdLayers = config.crowdLayers || []
        const hasUnmatchBranch = config.unmatchBranch && config.unmatchBranch.enabled !== false
        expectedBranches = crowdLayers.length + (hasUnmatchBranch ? 1 : 0)
        
        // 如果没有 crowdLayers 但有 branches 配置，使用 branches
        if (expectedBranches === 0 && config.branches) {
          expectedBranches = config.branches.length
        }
      }
      else if (nodeType === 'event-split') {
        const config = nodeData.config || {}
        // 事件分流节点通常有2个分支：是/否
        expectedBranches = config.branches ? config.branches.length : 2
      }
      else if (nodeType === 'ab-test') {
        const config = nodeData.config || {}
        // A/B测试节点通常有2个分支：A/B
        expectedBranches = config.variants ? config.variants.length : 2
      }
      // 通用分支配置
      else if (nodeData.config && nodeData.config.branches) {
        expectedBranches = nodeData.config.branches.length
      } 
      // 默认分支节点
      else if (nodeType === 'decision' || nodeType === 'branch') {
        expectedBranches = 2 // 默认分支节点有2个分支
      } 
      // 结束节点不需要输出
      else if (nodeType === 'end' || nodeType === 'endpoint') {
        expectedBranches = 0
      }
      // 普通节点默认1个输出
      else {
        expectedBranches = 1
      }

      nodeDetails.set(node.id, {
        nodeId: node.id,
        nodeType: nodeType,
        expectedBranches: expectedBranches,
        actualPreviewLines: 0,
        actualConnections: 0,
        totalLines: 0,
        isValid: false,
        previewLineIds: [],
        connectionIds: []
      })
    })

    // 统计边信息并分配到对应节点
    allEdges.forEach(edge => {
      const labels = edge.getLabels() || []
      labelCount += labels.length
      
      const sourceId = edge.getSourceCellId()
      
      if (isPreviewLine(edge)) {
        previewLineCount++
        
        const classification = classifyPreviewLine(edge)
        if (classification.type === 'branch-preview') {
          byType.branch++
        } else {
          byType.single++
        }
        
        // 统计状态
        const edgeData = edge.getData() || {}
        const state = edgeData.state || PreviewStates.INTERACTIVE
        byState[state] = (byState[state] || 0) + 1
        
        // 更新源节点的预览线统计
        if (sourceId && nodeDetails.has(sourceId)) {
          const nodeDetail = nodeDetails.get(sourceId)
          nodeDetail.actualPreviewLines++
          nodeDetail.previewLineIds.push(edge.id)
        }
        
      } else if (isConnectionLine(edge)) {
        realConnections++
        
        // 更新源节点的连接线统计
        if (sourceId && nodeDetails.has(sourceId)) {
          const nodeDetail = nodeDetails.get(sourceId)
          nodeDetail.actualConnections++
          nodeDetail.connectionIds.push(edge.id)
        }
      }
    })

    // 计算每个节点的总线数和有效性
    nodeDetails.forEach((detail, nodeId) => {
      detail.totalLines = detail.actualPreviewLines + detail.actualConnections
      detail.isValid = detail.totalLines === detail.expectedBranches
    })

    return { 
      realConnections, 
      previewLines: previewLineCount, 
      labelCount,
      byType,
      byState,
      nodeDetails
    }
  }

  // 节点连接线有效性检查函数
  const validateNodeConnections = (targetGraph = null, options = {}) => {
    const workingGraph = targetGraph || graph
    if (!workingGraph) {
      console.warn('🔍 [节点连接线检查] 图实例不存在')
      return {
        isValid: false,
        totalNodes: 0,
        validNodes: 0,
        invalidNodes: 0,
        nodeValidations: [],
        summary: '图实例不存在'
      }
    }

    const stats = countPreviewLines(workingGraph)
    const nodeValidations = []
    let validNodes = 0
    let invalidNodes = 0

    console.log('🔍 [节点连接线检查] 开始检查节点连接线有效性...')

    stats.nodeDetails.forEach((detail, nodeId) => {
      const validation = {
        nodeId: detail.nodeId,
        nodeType: detail.nodeType,
        expectedBranches: detail.expectedBranches,
        actualPreviewLines: detail.actualPreviewLines,
        actualConnections: detail.actualConnections,
        totalLines: detail.totalLines,
        isValid: detail.isValid,
        status: detail.isValid ? '✅ 有效' : '❌ 无效',
        details: {
          previewLineIds: detail.previewLineIds,
          connectionIds: detail.connectionIds,
          deficit: Math.max(0, detail.expectedBranches - detail.totalLines),
          surplus: Math.max(0, detail.totalLines - detail.expectedBranches)
        }
      }

      nodeValidations.push(validation)

      if (detail.isValid) {
        validNodes++
      } else {
        invalidNodes++
      }

      // 输出详细的节点检查信息
      if (options.verbose !== false) {
        console.log(`🔍 [节点检查] ${nodeId} (${detail.nodeType}):`, {
          '应有分支数': detail.expectedBranches,
          '实际预览线': detail.actualPreviewLines,
          '实际连接线': detail.actualConnections,
          '总线数': detail.totalLines,
          '状态': validation.status,
          '预览线ID': detail.previewLineIds,
          '连接线ID': detail.connectionIds
        })
      }
    })

    const totalNodes = nodeValidations.length
    const isOverallValid = invalidNodes === 0

    const result = {
      isValid: isOverallValid,
      totalNodes,
      validNodes,
      invalidNodes,
      nodeValidations,
      summary: `总节点: ${totalNodes}, 有效: ${validNodes}, 无效: ${invalidNodes}`,
      statistics: {
        totalPreviewLines: stats.previewLines,
        totalConnections: stats.realConnections,
        totalEdges: stats.previewLines + stats.realConnections,
        byType: stats.byType,
        byState: stats.byState
      }
    }

    console.log('🔍 [节点连接线检查] 检查完成:', {
      '总体状态': isOverallValid ? '✅ 全部有效' : '❌ 存在无效节点',
      '节点统计': result.summary,
      '边统计': `预览线: ${stats.previewLines}, 连接线: ${stats.realConnections}`
    })

    return result
  }

  // 更新统计信息
  const updateStats = () => {
    const stats = countPreviewLines()
    previewLineStats.value = {
      total: stats.previewLines,
      valid: validPreviewLineCount.value,
      invalid: stats.previewLines - validPreviewLineCount.value,
      byType: stats.byType
    }
    
    emit('stats:updated', previewLineStats.value)
  }

  // 触发预览线管理器清理（集成PreviewLineSystem）
  const triggerPreviewLineCleanup = withPerformanceMonitoring(async () => {
    // 优先使用新的PreviewLineSystem
    if (window.previewLineSystem) {
      console.log('🧹 [PreviewLine] 触发新预览线系统清理无效数据...')
      if (typeof window.previewLineSystem.validateAndCleanupDuplicates === 'function') {
        await window.previewLineSystem.validateAndCleanupDuplicates()
      } else {
        addWarning('新预览线系统不支持validateAndCleanupDuplicates方法')
      }
    } else if (window.previewLineManager) {
      console.log('🧹 [PreviewLine] 兼容预览线系统清理无效数据...')
      if (typeof window.previewLineManager.validateAndCleanupDuplicates === 'function') {
        await window.previewLineManager.validateAndCleanupDuplicates()
      } else {
        addWarning('旧版预览线管理器不支持validateAndCleanupDuplicates方法')
      }
    } else {
      addWarning('预览线管理器不存在，使用本地清理')
      await validatePreviewLines()
      await cleanupConnectedPreviewLines()
    }
    
    // 更新本地统计
    updateStats()
    
    emit('cleanup:triggered')
  }, '触发预览线清理')

  // 处理节点删除时的预览线清理（增强版）
  const handleNodeRemoved = withPerformanceMonitoring(async (nodeData, incomingEdges = [], configDrawers = null) => {
    const nodeId = nodeData.node?.id || nodeData.id
    if (!nodeId) {
      addWarning('处理节点删除失败：节点ID不存在')
      return
    }

    console.log(`[PreviewLine] 处理节点删除的预览线清理: ${nodeId}`)
    
    // 清理本地存储的预览线
    const nodePreviewLines = getPreviewLinesByNode(nodeId)
    for (const previewLine of nodePreviewLines) {
      await removePreviewLine(previewLine.id)
    }
    
    // 优先使用新的PreviewLineSystem
    if (configDrawers?.value?.structuredLayout?.previewLineSystem) {
      const previewSystem = configDrawers.value.structuredLayout.previewLineSystem
      if (typeof previewSystem.handleNodeRemoved === 'function') {
        console.log(`[PreviewLine] 通知新预览线系统节点即将删除: ${nodeId}，传入边数量: ${incomingEdges.length}`)
        await previewSystem.handleNodeRemoved(nodeData, incomingEdges)
      } else {
        addWarning('新预览线系统不支持handleNodeRemoved方法')
      }
    } else if (configDrawers?.value?.structuredLayout?.unifiedPreviewManager) {
      const previewManager = configDrawers.value.structuredLayout.unifiedPreviewManager
      if (typeof previewManager.handleNodeRemoved === 'function') {
        console.log(`[PreviewLine] 通知旧版预览线管理器节点即将删除: ${nodeId}，传入边数量: ${incomingEdges.length}`)
        await previewManager.handleNodeRemoved(nodeData, incomingEdges)
      } else {
        addWarning('旧版预览线管理器不存在或handleNodeRemoved方法不可用')
      }
    } else {
      addWarning('configDrawers.value.structuredLayout 不存在')
    }
    
    // 更新统计
    updateStats()
    
    emit('node:removed', { nodeId, incomingEdges })
  }, '处理节点删除')

  // 更新预览线位置（增强版）
  const updatePreviewLinePosition = withPerformanceMonitoring(async (node, configDrawers = null) => {
    const nodeData = node.getData() || {}
    
    // 跳过拖拽提示点和预览相关节点
    if (nodeData.isUnifiedPreview || nodeData.isPersistentPreview) {
      return
    }

    const nodeId = node.id
    const nodePreviewLines = getPreviewLinesByNode(nodeId)
    
    // 更新本地预览线位置
    for (const previewLine of nodePreviewLines) {
      if (previewLine.graphInstance) {
        // 触发X6重新计算边的路径
        previewLine.graphInstance.updateConnection()
      }
    }

    // 优先使用新的PreviewLineSystem
    if (configDrawers?.value?.structuredLayout?.previewLineSystem) {
      const previewSystem = configDrawers.value.structuredLayout.previewLineSystem
      if (typeof previewSystem.updatePreviewLinePosition === 'function') {
        console.log(`[PreviewLine] 使用新系统刷新节点 ${nodeId} 的预览线`)
        await previewSystem.updatePreviewLinePosition(node)
      } else {
        addWarning('新预览线系统不支持updatePreviewLinePosition方法')
      }
    } else if (configDrawers?.value?.structuredLayout?.unifiedPreviewManager) {
      const previewManager = configDrawers.value.structuredLayout.unifiedPreviewManager
      if (previewManager.previewLines && previewManager.previewLines.has(nodeId)) {
        console.log(`[PreviewLine] 使用旧版管理器刷新节点 ${nodeId} 的预览线`)
        if (typeof previewManager.updatePreviewLinePosition === 'function') {
          await previewManager.updatePreviewLinePosition(node)
        } else {
          addWarning('旧版预览线管理器不支持updatePreviewLinePosition方法')
        }
      }
    }
    
    emit('position:updated', { nodeId, nodePreviewLines })
  }, '更新预览线位置')

  // 批量操作
  const batchCreatePreviewLines = withPerformanceMonitoring(async (nodeConfigs) => {
    const results = []
    const batchSize = options.batchSize
    
    // 分批处理
    for (let i = 0; i < nodeConfigs.length; i += batchSize) {
      const batch = nodeConfigs.slice(i, i + batchSize)
      
      for (const config of batch) {
        try {
          const previewLine = await createPreviewLine(config.nodeId, config.options)
          results.push({ success: true, previewLine, nodeId: config.nodeId })
        } catch (error) {
          results.push({ success: false, error: error.message, nodeId: config.nodeId })
          addError(`批量创建预览线失败: ${config.nodeId}`, error)
        }
      }
      
      // 批次间短暂延迟，避免阻塞UI
      if (i + batchSize < nodeConfigs.length) {
        await new Promise(resolve => setTimeout(resolve, 10))
      }
    }
    
    emit('batch:created', { results, total: nodeConfigs.length })
    return results
  }, '批量创建预览线')

  const batchRemovePreviewLines = withPerformanceMonitoring(async (previewLineIds) => {
    const results = []
    const batchSize = options.batchSize
    
    // 分批处理
    for (let i = 0; i < previewLineIds.length; i += batchSize) {
      const batch = previewLineIds.slice(i, i + batchSize)
      
      for (const id of batch) {
        try {
          const success = await removePreviewLine(id)
          results.push({ success, id })
        } catch (error) {
          results.push({ success: false, error: error.message, id })
          addError(`批量删除预览线失败: ${id}`, error)
        }
      }
      
      // 批次间短暂延迟，避免阻塞UI
      if (i + batchSize < previewLineIds.length) {
        await new Promise(resolve => setTimeout(resolve, 10))
      }
    }
    
    emit('batch:removed', { results, total: previewLineIds.length })
    return results
  }, '批量删除预览线')

  // 预览线恢复机制（用于连接线删除后）
  const restorePreviewLinesAfterConnectionDelete = withPerformanceMonitoring(async (deletedConnection) => {
    if (!deletedConnection || !graph) {
      return { restored: 0, errors: [] }
    }

    const sourceNodeId = deletedConnection.source?.nodeId || deletedConnection.sourceId
    const branchId = deletedConnection.branch?.id || deletedConnection.branchId
    
    if (!sourceNodeId) {
      addWarning('无法恢复预览线：缺少源节点信息')
      return { restored: 0, errors: ['缺少源节点信息'] }
    }

    try {
      // 检查源节点是否存在且已配置
      const sourceNode = graph.getCellById(sourceNodeId)
      if (!sourceNode) {
        addWarning(`无法恢复预览线：源节点不存在 ${sourceNodeId}`)
        return { restored: 0, errors: ['源节点不存在'] }
      }

      const sourceData = sourceNode.getData() || {}
      const nodeType = sourceData.nodeType || sourceData.type
      const isNodeConfigured = sourceData.isConfigured || nodeType === 'start'

      if (!isNodeConfigured) {
        console.log(`跳过恢复预览线：节点未配置 ${sourceNodeId}`)
        return { restored: 0, errors: ['节点未配置'] }
      }

      // 检查是否已存在预览线
      const existingPreview = getPreviewLineByNode(sourceNodeId, branchId)
      if (existingPreview) {
        console.log(`预览线已存在，无需恢复: ${sourceNodeId}`)
        return { restored: 0, errors: [] }
      }

      // 创建预览线
      const previewLine = await createPreviewLine(sourceNodeId, {
        branchId,
        branchLabel: deletedConnection.branch?.label,
        branchIndex: deletedConnection.branch?.index,
        createdBy: 'connection-delete-recovery'
      })

      console.log(`✅ [PreviewLine] 连接删除后预览线恢复成功: ${sourceNodeId}`)
      
      emit('previewLine:restored', { 
        previewLine, 
        sourceNodeId, 
        deletedConnection 
      })
      
      return { restored: 1, errors: [], previewLine }

    } catch (error) {
      console.error(`❌ [PreviewLine] 预览线恢复失败: ${sourceNodeId}`, error)
      addError(`预览线恢复失败: ${sourceNodeId}`, error)
      return { restored: 0, errors: [error.message] }
    }
  }, '恢复预览线')

  // 初始化时扫描现有预览线
  const initializeFromGraph = withPerformanceMonitoring(async (targetGraph = null) => {
    const workingGraph = targetGraph || graph
    if (!workingGraph) return

    console.log('🔄 [PreviewLine] 初始化：扫描现有预览线...')
    
    const allEdges = workingGraph.getEdges() || []
    let importedCount = 0

    for (const edge of allEdges) {
      if (isPreviewLine(edge)) {
        try {
          const unifiedEdge = UnifiedEdge.fromX6EdgeData(edge)
          unifiedEdge.graphInstance = edge
          
          previewLines.set(unifiedEdge.id, unifiedEdge)
          
          // 更新节点索引
          const sourceNodeId = unifiedEdge.source.nodeId
          if (!previewLinesByNode.has(sourceNodeId)) {
            previewLinesByNode.set(sourceNodeId, new Map())
          }
          const nodePreviewLines = previewLinesByNode.get(sourceNodeId)
          const key = unifiedEdge.branch?.id || 'default'
          nodePreviewLines.set(key, unifiedEdge)
          
          importedCount++
        } catch (error) {
          console.warn('导入预览线失败:', edge.id, error)
          addWarning(`导入预览线失败: ${edge.id}`, error)
        }
      }
    }

    updateStats()
    console.log(`✅ [PreviewLine] 初始化完成，导入了 ${importedCount} 条预览线`)
    
    emit('initialized', { importedCount })
    return importedCount
  }, '初始化预览线')

  // 自动清理机制
  const setupAutoCleanup = () => {
    if (!options.enableAutoCleanup) return

    const cleanupInterval = setInterval(async () => {
      try {
        console.log('🔄 [PreviewLine] 执行自动清理...')
        await validatePreviewLines()
        await cleanupConnectedPreviewLines()
        
        // 清理过期缓存
        const now = Date.now()
        for (const [key, cached] of cache.validationResults) {
          if (now - cached.timestamp > cache.cacheTimeout) {
            cache.validationResults.delete(key)
          }
        }
        
        emit('auto:cleanup')
      } catch (error) {
        console.error('❌ [PreviewLine] 自动清理失败:', error)
        addError('自动清理失败', error)
      }
    }, options.cleanupInterval)

    // 返回清理函数
    return () => clearInterval(cleanupInterval)
  }

  // 获取诊断信息
  const getDiagnostics = () => {
    return {
      previewLines: {
        total: previewLines.size,
        byNode: previewLinesByNode.size,
        stats: previewLineStats.value
      },
      performance: performanceStats,
      cache: {
        size: cache.validationResults.size,
        lastUpdate: cache.lastCacheUpdate
      },
      errors: errors.length,
      warnings: warnings.length,
      options
    }
  }

  // 销毁管理器
  const destroy = () => {
    // 清理所有数据
    previewLines.clear()
    previewLinesByNode.clear()
    clearErrors()
    clearCache()
    
    // 清理事件监听器
    eventListeners.clear()
    
    // 销毁核心模块
    if (portConfigFactory.value) {
      portConfigFactory.value.destroy?.()
      portConfigFactory.value = null
    }
    
    if (connectionController.value) {
      connectionController.value.destroy?.()
      connectionController.value = null
    }
    
    if (snapDetector.value) {
      snapDetector.value.destroy?.()
      snapDetector.value = null
    }
    
    // 销毁性能优化模块
    if (spatialOptimizer.value) {
      spatialOptimizer.value.destroy?.()
      spatialOptimizer.value = null
    }
    
    if (batchProcessor.value) {
      batchProcessor.value.destroy?.()
      batchProcessor.value = null
    }
    
    if (cacheManager.value) {
      cacheManager.value.destroy?.()
      cacheManager.value = null
    }
    
    // 清理自动清理定时器
    if (cleanupTimer) {
      cleanupTimer()
    }
    
    console.log('🗑️ [PreviewLine] 预览线管理器已销毁')
    emit('destroyed')
  }

  // 初始化核心模块
  initializeCoreModules()

  // 如果提供了图实例，立即初始化
  if (graph) {
    initializeFromGraph(graph)
  }

  // 设置自动清理
  const cleanupTimer = setupAutoCleanup()

  return {
    // 状态
    previewLineStats,
    performanceStats,
    errors,
    warnings,
    options,
    
    // 计算属性
    hasPreviewLines,
    previewLineCount,
    validPreviewLineCount,
    
    // 核心方法
    createPreviewLine,
    removePreviewLine,
    convertPreviewToConnection,
    
    // 查询方法
    getPreviewLineByNode,
    getPreviewLinesByNode,
    
    // 验证和清理方法
    validatePreviewLines,
    cleanupConnectedPreviewLines,
    countPreviewLines,
    validateNodeConnections,
    triggerPreviewLineCleanup,
    
    // 事件处理方法
    handleNodeRemoved,
    updatePreviewLinePosition,
    
    // 批量操作方法
    batchCreatePreviewLines,
    batchRemovePreviewLines,
    
    // 恢复机制
    restorePreviewLinesAfterConnectionDelete,
    
    // 初始化方法
    initializeFromGraph
  }

  // 返回公共API（增强版）
  return {
    // 状态
    previewLines: readonly(previewLines),
    previewLinesByNode: readonly(previewLinesByNode),
    previewLineStats,
    performanceStats: readonly(performanceStats),
    errors: readonly(errors),
    warnings: readonly(warnings),
    
    // 计算属性
    hasPreviewLines,
    previewLineCount,
    validPreviewLineCount,
    
    // 核心方法
    createPreviewLine,
    removePreviewLine,
    convertPreviewToConnection,
    
    // 查询方法
    getPreviewLineByNode,
    getPreviewLinesByNode,
    validatePreviewLines,
    cleanupConnectedPreviewLines,
    
    // 事件系统（增强版）
    on,
    off,
    emit,
    emitBatch,
    emitAsync,
    
    // 错误处理
    addError,
    addWarning,
    clearErrors,
    clearWarnings,
    
    // 缓存管理
    clearCache,
    getCachedResult,
    setCachedResult,
    
    // 工具方法
    getDiagnostics,
    destroy,
    
    // 性能监控
    withPerformanceMonitoring,
    
    // 自动清理
    setupAutoCleanup,
    
    // 清理函数
    cleanup: cleanupTimer
  }
}