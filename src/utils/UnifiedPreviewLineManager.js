/**
 * 统一预览线管理器
 * 将持久化预览线和可拖拽预设线合并为一个统一的系统
 * 核心理念：一条预览线，多种状态
 */

// 导入坐标系统管理器
import { coordinateManager } from './CoordinateSystemManager.js'

// 分支标签生成工具类
class BranchLabelUtils {
  /**
   * 根据分支ID和索引生成默认标签
   * @param {string} branchId - 分支ID
   * @param {number} branchIndex - 分支索引
   * @param {string} nodeType - 节点类型
   * @returns {string} 生成的标签
   */
  static generateDefaultLabel(branchId, branchIndex, nodeType) {
    if (branchId.includes('audience') || nodeType === 'audience-split') {
      return branchId.includes('default') ? '未命中人群' : `人群${branchIndex + 1}`
    } else if (branchId.includes('event') || nodeType === 'event-split') {
      return branchIndex === 0 ? '是' : '否'
    } else if (branchId.includes('group') || branchId.includes('version') || nodeType === 'ab-test') {
      return branchIndex === 0 ? 'A组' : 'B组'
    } else {
      return `分支${branchIndex + 1}`
    }
  }

  /**
   * 验证并修复分支标签
   * @param {Object} branch - 分支对象
   * @param {number} branchIndex - 分支索引
   * @param {string} nodeType - 节点类型
   * @returns {Object} 修复后的分支对象
   */
  static validateAndFixBranchLabel(branch, branchIndex, nodeType) {
    // 对于人群分流，确保使用正确的人群名称
    if (nodeType === 'audience-split') {
      // 如果分支有crowdName属性，使用它作为标签
      if (branch.crowdName && branch.crowdName !== branch.label) {
        console.log('🔧 [分支标签工具] 修复人群分流标签:', {
          branchId: branch.id,
          oldLabel: branch.label,
          newLabel: branch.crowdName,
          branchIndex: branchIndex
        })
        branch.label = branch.crowdName
      }
      // 如果是默认分支（未命中人群），确保标签正确
    else if (branch.id === 'unmatch_default' || branch.id === 'default') {
      branch.label = '未命中人群'
      }
      // 如果没有标签，生成默认标签
      else if (!branch.label) {
        branch.label = this.generateDefaultLabel(branch.id, branchIndex, nodeType)
        console.log('🔧 [分支标签工具] 自动生成人群分流标签:', {
          branchId: branch.id,
          branchIndex: branchIndex,
          generatedLabel: branch.label
        })
      }
    } else {
      // 对于其他类型的节点，只在标签为空时修复
      if (!branch.label) {
        branch.label = this.generateDefaultLabel(branch.id, branchIndex, nodeType)
        console.log('🔧 [分支标签工具] 自动修复分支标签:', {
          branchId: branch.id,
          branchIndex: branchIndex,
          nodeType: nodeType,
          generatedLabel: branch.label
        })
      }
    }
    return branch
  }
}

// 性能优化工具类
class PerformanceUtils {
  /**
   * 防抖函数 - 增强版本，支持最大等待时间
   * @param {Function} func - 要防抖的函数
   * @param {number} wait - 等待时间（毫秒）
   * @param {number} maxWait - 最大等待时间（毫秒）
   * @returns {Function} 防抖后的函数
   */
  static debounce(func, wait, maxWait = wait * 5) {
    let timeout
    let maxTimeout
    let lastCallTime = 0
    
    return function executedFunction(...args) {
      const now = Date.now()
      
      // 如果超过最大等待时间，立即执行
      if (lastCallTime && (now - lastCallTime) >= maxWait) {
        clearTimeout(timeout)
        clearTimeout(maxTimeout)
        lastCallTime = now
        return func.apply(this, args)
      }
      
      const later = () => {
        clearTimeout(timeout)
        clearTimeout(maxTimeout)
        lastCallTime = now
        func.apply(this, args)
      }
      
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      
      if (!lastCallTime) {
        lastCallTime = now
        maxTimeout = setTimeout(later, maxWait)
      }
    }
  }

  /**
   * 节流函数
   * @param {Function} func - 要节流的函数
   * @param {number} limit - 限制时间（毫秒）
   * @returns {Function} 节流后的函数
   */
  static throttle(func, limit) {
    let inThrottle
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }
}

// 统一预览线状态枚举
export const UnifiedPreviewStates = {
  STATIC_DISPLAY: 'static_display',     // 静态显示（替代持久化预览线）
  INTERACTIVE: 'interactive',           // 可交互（节点配置完成后）
  DRAGGING: 'dragging',                // 拖拽中
  CONNECTED: 'connected',              // 已连接
  HIDDEN: 'hidden'                     // 隐藏状态
}

// 预览线类型枚举
export const PreviewLineTypes = {
  SINGLE: 'single',                    // 单一预览线
  BRANCH: 'branch'                     // 分支预览线
}

export class UnifiedPreviewLineManager {
  constructor(graph, branchManager, layoutConfig, layoutDirection = 'TB', layoutEngine = null) {
    this.graph = graph
    this.branchManager = branchManager
    this.layoutConfig = layoutConfig
    this.layoutDirection = layoutDirection
    // 🎯 修复循环引用：使用WeakRef来避免强引用
    this._layoutEngineRef = layoutEngine ? new WeakRef(layoutEngine) : null;
    
    // 调试模式开关
    this.debugMode = false
    
    // 初始化坐标系统管理器
    this.coordinateManager = coordinateManager
    this.coordinateManager.setGraph(graph)
    
    // 统一存储所有预览线
    this.previewLines = new Map() // key: nodeId, value: PreviewLineInstance
    
    // 🗑️ [已删除] endpoint存储已被新的预览线分层策略替代
    
    // 🔧 新增：手工调整的拖拽点位置记录
    this.manuallyAdjustedHints = new Map() // 存储手工调整的拖拽点位置 {hintId: {x, y, timestamp}}
    
    // 节点配置状态管理
    this.nodeStates = new Map() // key: nodeId, value: configState
    
    // 拖拽相关状态
    this.isDragging = false
    this.currentDragLine = null
    this.dragStartPosition = null
    // 🗑️ [已删除] isEndpointActive已被新的预览线分层策略替代
    
    // 事件监听器存储
    this.eventListeners = new Map()
    
    // 性能优化：缓存机制
    this.branchInfoCache = new Map() // key: nodeId, value: { branches, timestamp }
    this.positionCache = new Map() // key: nodeId, value: { position, timestamp }
    this.cacheTimeout = 5000 // 缓存5秒
    
    // 定期清理过期缓存 - 降低清理频率
    this.cacheCleanupInterval = setInterval(() => {
      this.clearExpiredCache()
    }, 60000) // 每60秒清理一次过期缓存，减少定时器触发
    
    // 性能优化：防抖和节流函数 - 优化防抖控制
    this.debouncedUpdatePosition = PerformanceUtils.debounce(
      this.updatePreviewLinePosition.bind(this), 
      50  // 🔧 优化：减少防抖延迟到50ms，提升预览线跟随响应速度
    )
    this.throttledRefreshAll = PerformanceUtils.throttle(
      this.refreshAllPreviewLines.bind(this), 
      1000  // 增加节流时间到1秒，减少全量刷新频率
    )
    
    // 🔧 新增：立即更新方法，用于实时响应
    this.immediateUpdatePosition = this.updatePreviewLinePosition.bind(this)
    
    // 防重复吸附状态管理
    this.isProcessingSnap = false
    this.snappedNodes = new Set()
    
    // 🔧 新增：待处理计算队列机制
    this.pendingCalculations = new Map() // key: nodeId, value: { node, type, timestamp }
    this.layoutEngineReady = false
    
    // 🔧 新增：刷新状态跟踪机制，避免短时间内重复刷新
    this.isRefreshing = false
    this.lastRefreshTime = 0
    this.refreshCooldown = 100 // 100ms冷却时间
    this.refreshQueue = new Set() // 待刷新的节点队列
    this.batchRefreshTimer = null
    this.batchRefreshDelay = 16 // 批量刷新延迟时间，与节点移动防抖保持一致
    this.isMounted = false // 挂载状态标记
    this.hasInitialRefresh = false // 是否已进行初始刷新
    
    // console.log('🚀 [统一预览线管理器] 初始化完成 - 已启用性能优化、坐标系统管理和待处理计算队列')
  }

  /**
   * 获取动态方向配置
   * 根据当前布局方向返回相应的连接线方向
   * @returns {Object} 包含startDirections和endDirections的配置对象
   */
  getDynamicDirectionConfig() {
    if (this.layoutDirection === 'LR') {
      return {
        startDirections: ['right'],
        endDirections: ['left']
      }
    } else {
      return {
        startDirections: ['bottom'],
        endDirections: ['top']
      }
    }
  }

  /**
   * 更新布局方向
   * @param {string} newDirection - 新的布局方向 ('TB' 或 'LR')
   */
  updateLayoutDirection(newDirection) {
    if (this.layoutDirection !== newDirection) {
      this.layoutDirection = newDirection
      // console.log('🔄 [统一预览线管理器] 布局方向已更新:', newDirection)
      // 刷新所有预览线以应用新的方向配置
      this.smartRefresh()
    }
  }

  /**
   * 设置布局引擎引用
   * @param {Object} layoutEngine - 布局引擎实例
   */
  setLayoutEngine(layoutEngine) {
    // 🎯 修复循环引用：使用WeakRef
    this._layoutEngineRef = layoutEngine ? new WeakRef(layoutEngine) : null;
    this.layoutEngineReady = !!layoutEngine
    
    // console.log('🔗 [统一预览线管理器] 布局引擎引用已设置:', {
    //   引擎类型: layoutEngine?.constructor?.name,
    //   有getNodeLayerY方法: typeof layoutEngine?.getNodeLayerY === 'function',
    //   有getNextLayerY方法: typeof layoutEngine?.getNextLayerY === 'function',
    //   引擎就绪状态: this.layoutEngineReady
    // })
    
    // 🎯 添加layoutEngine的getter方法
    if (!this.hasOwnProperty('layoutEngine')) {
      Object.defineProperty(this, 'layoutEngine', {
        get: function() {
          if (this._layoutEngineRef) {
            const engine = this._layoutEngineRef.deref();
            if (engine) {
              return engine;
            } else {
              // WeakRef已被垃圾回收，清理引用
              this._layoutEngineRef = null;
              // console.log('🗑️ [预览线管理器] 布局引擎已被垃圾回收，清理WeakRef');
            }
          }
          
          // 回退到全局查找
    return (typeof window !== 'undefined' ? window.unifiedStructuredLayoutEngine : null) || 
           this.graph?.layoutEngine || 
           null;
        },
        configurable: true
      });
    }
    
    // 🔧 关键修复：重新计算所有预览线位置
    if (layoutEngine && this.previewLines.size > 0) {
      // console.log('🔄 [统一预览线管理器] 开始重新计算所有预览线位置...')
      this.recalculateAllPreviewPositions()
    }
    
    // 🔧 修复：不在此处立即处理待处理队列，等待布局引擎完全就绪
    // 布局引擎会在nodeToLayer映射建立完成后主动调用processPendingCalculations
    if (layoutEngine && this.pendingCalculations.size > 0) {
      // console.log('📋 [统一预览线管理器] 发现待处理计算队列:', this.pendingCalculations.size, '个任务，等待布局引擎就绪通知')
    }
  }

  /**
   * 重新计算所有预览线位置
   * 当布局引擎设置后调用，确保所有预览线使用正确的Y坐标
   * 🎯 新增：添加清理逻辑，处理无效的预览线实例
   */
  recalculateAllPreviewPositions() {
    let recalculatedCount = 0
    let errorCount = 0
    let cleanedCount = 0
    const invalidPreviewLines = []
    
    // console.log('🔄 [统一预览线管理器] 开始重新计算预览线位置，同时检查有效性')
    
    this.previewLines.forEach((previewInstance, nodeId) => {
      try {
        const node = previewInstance.sourceNode
        
        // 🎯 优先检查sourceNode是否存在
        if (!node) {
          // console.log('🧹 [统一预览线管理器] sourceNode为null，正常清理流程:', nodeId)
          invalidPreviewLines.push(nodeId)
          return // 立即跳过后续处理
        }
        
        // 🎯 检查节点是否在graph中（只有在node存在时才检查）
        const isNodeValid = this.graph && this.graph.hasCell(node.id)
        if (!isNodeValid) {
          // console.warn('⚠️ [统一预览线管理器] 节点不在graph中，标记清理:', nodeId)
          invalidPreviewLines.push(nodeId)
          return
        }
        
        // 🎯 检查预览线实例是否有效
        if (previewInstance.line && (previewInstance.line.removed || !this.graph.hasCell(previewInstance.line.id))) {
          // console.warn('⚠️ [统一预览线管理器] 预览线已被移除，标记清理:', nodeId)
          invalidPreviewLines.push(nodeId)
          return
        }
        
        const nodePosition = node.getPosition()
        const nodeSize = node.getSize()
        
        if (previewInstance.type === PreviewLineTypes.SINGLE) {
          // 重新计算单一预览线位置
          const newEndPosition = this.calculateSinglePreviewPosition(node, nodePosition, nodeSize)
          this.updatePreviewLineEndPosition(previewInstance, newEndPosition)
          recalculatedCount++
        } else if (previewInstance.type === PreviewLineTypes.BRANCH) {
          // 重新计算分支预览线位置
          this.recalculateBranchPreviewPositions(previewInstance, node, nodePosition, nodeSize)
          recalculatedCount++
        }
      } catch (error) {
        console.error('❌ [统一预览线管理器] 重新计算预览线位置失败:', nodeId, error)
        errorCount++
        // 🎯 出错的预览线也标记为需要清理
        invalidPreviewLines.push(nodeId)
      }
    })
    
    // 🎯 清理无效的预览线实例
    if (invalidPreviewLines.length > 0) {
      console.log('🧹 [统一预览线管理器] 开始清理无效预览线:', invalidPreviewLines)
      
      invalidPreviewLines.forEach(nodeId => {
        try {
          const previewInstance = this.previewLines.get(nodeId)
          
          // 🎯 清理相关的endpoints和关联数据
          if (previewInstance) {
            // 清理预览线的endpoints
            if (previewInstance.line && this.graph.hasCell(previewInstance.line.id)) {
              this.graph.removeCell(previewInstance.line)
            }
            
            // 清理分支预览线的endpoints
            if (previewInstance.branches && Array.isArray(previewInstance.branches)) {
              previewInstance.branches.forEach(branch => {
                if (branch.line && this.graph.hasCell(branch.line.id)) {
                  this.graph.removeCell(branch.line)
                }
              })
            }
            
            // 清理节点状态
            this.nodeStates.delete(nodeId)
            
            // 清理缓存
            this.branchInfoCache.delete(nodeId)
            this.positionCache.delete(nodeId)
          }
          
          // 从预览线Map中移除
          this.previewLines.delete(nodeId)
          cleanedCount++
          
        } catch (cleanupError) {
          console.error('❌ [统一预览线管理器] 清理预览线失败:', nodeId, cleanupError)
        }
      })
    }
    
    // 🎯 输出详细的统计信息
    // console.log('✅ [统一预览线管理器] 预览线位置重新计算完成:', {
    //   原始总数: this.previewLines.size + cleanedCount,
    //   当前总数: this.previewLines.size,
    //   重新计算成功: recalculatedCount,
    //   计算失败: errorCount,
    //   清理的无效预览线: cleanedCount,
    //   清理详情: cleanedCount > 0 ? '已清理无效实例' : '无需清理'
    // })
    
    // 🎯 如果清理了预览线，触发一次完整性检查
    if (cleanedCount > 0) {
      // console.log('🔍 [统一预览线管理器] 清理完成，触发完整性检查')
      // 延迟执行完整性检查，避免影响当前计算流程
      setTimeout(() => {
        this.validatePreviewLineIntegrity()
      }, 100)
    }
   }

  /**
   * 强制清理所有预览线
   * 用于在画布加载完成后强制清理残留的预览线
   */
  forceCleanupAllPreviewLines() {
    // console.log('🧹 [统一预览线管理器] 开始强制清理所有预览线...')
    
    let cleanedCount = 0
    const cleanupErrors = []
    
    // 清理所有预览线实例
    this.previewLines.forEach((previewInstance, nodeId) => {
      try {
        // 清理单一预览线
        if (previewInstance.line && this.graph && this.graph.hasCell(previewInstance.line.id)) {
          this.graph.removeCell(previewInstance.line)
          cleanedCount++
        }
        
        // 清理分支预览线
        if (previewInstance.branches && Array.isArray(previewInstance.branches)) {
          previewInstance.branches.forEach(branch => {
            if (branch.line && this.graph && this.graph.hasCell(branch.line.id)) {
              this.graph.removeCell(branch.line)
              cleanedCount++
            }
          })
        }
        
        // 清理相关数据
        this.nodeStates.delete(nodeId)
        this.branchInfoCache.delete(nodeId)
        this.positionCache.delete(nodeId)
        
      } catch (error) {
        console.error('❌ [统一预览线管理器] 强制清理预览线失败:', nodeId, error)
        cleanupErrors.push({ nodeId, error })
      }
    })
    
    // 清空所有Map
    this.previewLines.clear()
    this.nodeStates.clear()
    this.branchInfoCache.clear()
    this.positionCache.clear()
    
    // console.log('✅ [统一预览线管理器] 强制清理完成:', {
    //   清理的预览线数量: cleanedCount,
    //   清理错误数量: cleanupErrors.length,
    //   剩余预览线: this.previewLines.size
    // })
    
    if (cleanupErrors.length > 0) {
      // console.warn('⚠️ [统一预览线管理器] 强制清理过程中出现错误:', cleanupErrors)
    }
  }

  /**
   * 验证并清理重复的预览线
   * 检查是否有重复创建的预览线并清理
   */
  validateAndCleanupDuplicates() {
    // console.log('🔍 [统一预览线管理器] 开始验证并清理重复预览线...')
    
    if (!this.graph) {
      // console.warn('⚠️ [统一预览线管理器] Graph未初始化，跳过重复检查')
      return
    }
    
    const allEdges = this.graph.getEdges() || []
    const previewEdgesBySource = new Map()
    let duplicateCount = 0
    
    // 统计每个源节点的预览线数量
    allEdges.forEach(edge => {
      const edgeData = edge.getData() || {}
      const isPreview = edgeData.isPersistentPreview || 
                       edgeData.isPreview || 
                       edgeData.isUnifiedPreview ||
                       edgeData.type === 'preview-line' ||
                       edgeData.type === 'unified-preview-line' ||
                       edgeData.type === 'draggable-preview'
      
      if (isPreview) {
        const sourceId = edge.getSourceCellId()
        if (!previewEdgesBySource.has(sourceId)) {
          previewEdgesBySource.set(sourceId, [])
        }
        previewEdgesBySource.get(sourceId).push(edge)
      }
    })
    
    // 检查并清理重复的预览线
    previewEdgesBySource.forEach((edges, sourceId) => {
      if (edges.length > 1) {
        // console.warn(`⚠️ [统一预览线管理器] 发现节点 ${sourceId} 有 ${edges.length} 条预览线，开始智能清理`)
        
        // 🎯 智能选择要保留的预览线
        const sourceNode = this.graph.getCellById(sourceId)
        const sourceData = sourceNode ? sourceNode.getData() : {}
        
        // 按优先级排序预览线：统一预览线 > 持久预览线 > 普通预览线
        const sortedEdges = edges.sort((a, b) => {
          const aData = a.getData() || {}
          const bData = b.getData() || {}
          
          // 统一预览线优先级最高
          if (aData.isUnifiedPreview && !bData.isUnifiedPreview) return -1
          if (!aData.isUnifiedPreview && bData.isUnifiedPreview) return 1
          
          // 持久预览线次之
          if (aData.isPersistentPreview && !bData.isPersistentPreview) return -1
          if (!aData.isPersistentPreview && bData.isPersistentPreview) return 1
          
          // 其他按创建时间排序（较新的优先）
          return (bData.createdAt || 0) - (aData.createdAt || 0)
        })
        
        // 保留第一条（优先级最高的），删除其余的
        const keepEdge = sortedEdges[0]
        // console.log(`✅ [统一预览线管理器] 保留预览线: ${keepEdge.id} (类型: ${keepEdge.getData()?.type || 'unknown'})`)
        
        for (let i = 1; i < sortedEdges.length; i++) {
          const edgeToRemove = sortedEdges[i]
          try {
            this.graph.removeCell(edgeToRemove)
            duplicateCount++
            // console.log(`🗑️ [统一预览线管理器] 清理重复预览线: ${edgeToRemove.id} (类型: ${edgeToRemove.getData()?.type || 'unknown'})`)
          } catch (error) {
            console.error(`❌ [统一预览线管理器] 清理重复预览线失败: ${edgeToRemove.id}`, error)
          }
        }
        
        // 🎯 同时清理预览线管理器中的重复数据
        if (this.previewLines.has(sourceId)) {
          const previewInstance = this.previewLines.get(sourceId)
          
          // 如果是分支预览线，需要重新验证分支数据
          if (previewInstance.branches && Array.isArray(previewInstance.branches)) {
            // 检查源节点的实际分支配置
            const actualBranches = sourceData.branches || []
            
            // 只保留与实际分支配置匹配的预览线分支
            previewInstance.branches = previewInstance.branches.filter(branch => {
              return actualBranches.some(actualBranch => actualBranch.id === branch.branchId)
            })
            
            // console.log(`🔧 [统一预览线管理器] 重新验证分支预览线，保留 ${previewInstance.branches.length} 个分支`)
          }
        }
      }
    })
    
    // console.log('✅ [统一预览线管理器] 重复检查完成:', {
    //   检查的源节点数量: previewEdgesBySource.size,
    //   清理的重复预览线: duplicateCount,
    //   当前预览线管理器中的实例: this.previewLines.size
    // })
  }

  /**
   * 处理待处理计算队列
   * 当布局引擎设置后，处理所有待处理的预览线计算任务
   * 🎯 新增：增强节点有效性检查
   */
  processPendingCalculations() {
    let processedCount = 0
    let errorCount = 0
    let skippedCount = 0
    
    this.pendingCalculations.forEach((task, nodeId) => {
      try {
        const { node, type } = task
        
        // 🎯 增强的节点有效性检查
        if (!node) {
          // console.warn('⚠️ [待处理队列] 节点对象为null，跳过:', nodeId)
          skippedCount++
          return
        }
        
        if (!this.graph || !this.graph.hasCell(node.id)) {
          console.warn('⚠️ [待处理队列] 节点不在graph中，跳过:', nodeId)
          skippedCount++
          return
        }
        
        // 🎯 检查节点是否已被移除
        if (node.removed) {
          console.warn('⚠️ [待处理队列] 节点已被移除，跳过:', nodeId)
          skippedCount++
          return
        }
        
        // 根据任务类型执行相应的计算
        if (type === 'create') {
          this.createUnifiedPreviewLine(node, UnifiedPreviewStates.STATIC_DISPLAY)
        } else if (type === 'update') {
          this.updatePreviewLinePosition(node)
        }
        
        processedCount++
        console.log('✅ [待处理队列] 任务处理完成:', { nodeId, type })
        
      } catch (error) {
        console.error('❌ [待处理队列] 任务处理失败:', nodeId, error)
        errorCount++
      }
    })
    
    // 清空队列
    this.pendingCalculations.clear()
    
    console.log('📋 [待处理队列] 处理完成:', {
      总任务数: processedCount + errorCount + skippedCount,
      成功: processedCount,
      失败: errorCount,
      跳过: skippedCount
    })
  }

  /**
   * 添加任务到待处理计算队列
   * @param {string} nodeId - 节点ID
   * @param {Object} node - 节点对象
   * @param {string} type - 任务类型 ('create' 或 'update')
   */
  addToPendingCalculations(nodeId, node, type) {
    if (!this.layoutEngineReady) {
      this.pendingCalculations.set(nodeId, {
        node,
        type,
        timestamp: Date.now()
      })
      console.log('📋 [待处理队列] 任务已添加:', { nodeId, type, 队列大小: this.pendingCalculations.size })
      return true
    }
    return false
  }

  /**
   * 更新预览线终点位置
   * @param {Object} previewInstance - 预览线实例
   * @param {Object} newEndPosition - 新的终点位置
   */
  updatePreviewLineEndPosition(previewInstance, newEndPosition) {
    if (!previewInstance.line || !newEndPosition) return
    
    try {
      // 更新存储的终点位置
      previewInstance.endPosition = newEndPosition
      
      // 🔧 坐标验证：确保newEndPosition坐标有效
      const validEndPosition = {
        x: (typeof newEndPosition.x === 'number' && !isNaN(newEndPosition.x) && isFinite(newEndPosition.x)) ? newEndPosition.x : 300,
        y: (typeof newEndPosition.y === 'number' && !isNaN(newEndPosition.y) && isFinite(newEndPosition.y)) ? newEndPosition.y : 150
      }
      
      // 更新X6线条的终点
      const currentTarget = previewInstance.line.getTarget()
      try {
        previewInstance.line.setTarget({
          ...currentTarget,
          x: validEndPosition.x,
          y: validEndPosition.y
        })
      } catch (error) {
        console.error('❌ [坐标修正] setTarget操作失败:', error, { validEndPosition })
      }
      
      // 只在调试模式下输出位置更新日志，避免频繁日志影响性能
      if (this.debugMode) {
        console.log('🎯 [统一预览线管理器] 预览线位置已更新:', {
          节点ID: previewInstance.sourceNode?.id,
          新位置: newEndPosition
        })
      }
    } catch (error) {
      console.error('❌ [统一预览线管理器] 更新预览线位置失败:', error)
    }
  }

  /**
   * 重新计算分支预览线位置
   * @param {Object} previewInstance - 分支预览线实例
   * @param {Object} node - 源节点
   * @param {Object} nodePosition - 节点位置
   * @param {Object} nodeSize - 节点大小
   */
  recalculateBranchPreviewPositions(previewInstance, node, nodePosition, nodeSize) {
    if (!previewInstance.branches || !Array.isArray(previewInstance.branches)) {
      console.warn('⚠️ [统一预览线管理器] 分支预览线数据无效')
      return
    }
    
    previewInstance.branches.forEach((branch, index) => {
      try {
        const newEndPosition = this.calculateBranchPreviewPosition(node, nodePosition, nodeSize, index, previewInstance.branches.length)
        
        if (branch.line && newEndPosition) {
          // 🔧 坐标验证：确保newEndPosition坐标有效
          const validEndPosition = {
            x: (typeof newEndPosition.x === 'number' && !isNaN(newEndPosition.x) && isFinite(newEndPosition.x)) ? newEndPosition.x : 300,
            y: (typeof newEndPosition.y === 'number' && !isNaN(newEndPosition.y) && isFinite(newEndPosition.y)) ? newEndPosition.y : 150
          }
          
          // 更新分支线条的终点
          const currentTarget = branch.line.getTarget()
          try {
            branch.line.setTarget({
              ...currentTarget,
              x: validEndPosition.x,
              y: validEndPosition.y
            })
          } catch (error) {
            console.error('❌ [坐标修正] 分支setTarget操作失败:', error, { validEndPosition })
          }
          
          // 更新存储的位置
          branch.endPosition = newEndPosition
        }
      } catch (error) {
        console.error('❌ [统一预览线管理器] 重新计算分支预览线位置失败:', index, error)
      }
    })
  }

  /**
   * 添加事件监听器
   * @param {string} eventType - 事件类型
   * @param {Function} callback - 回调函数
   */
  addEventListener(eventType, callback) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, [])
    }
    this.eventListeners.get(eventType).push(callback)
    console.log('📡 [统一预览线管理器] 添加事件监听器:', eventType)
  }

  /**
   * 移除事件监听器
   * @param {string} eventType - 事件类型
   * @param {Function} callback - 回调函数
   */
  removeEventListener(eventType, callback) {
    if (this.eventListeners.has(eventType)) {
      const listeners = this.eventListeners.get(eventType)
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
        console.log('📡 [统一预览线管理器] 移除事件监听器:', eventType)
      }
    }
  }

  /**
   * 触发事件
   * @param {string} eventType - 事件类型
   * @param {Object} eventData - 事件数据
   */
  emit(eventType, eventData) {
    if (this.eventListeners.has(eventType)) {
      const listeners = this.eventListeners.get(eventType)
      listeners.forEach(callback => {
        try {
          callback(eventData)
        } catch (error) {
          console.error('❌ [统一预览线管理器] 事件监听器执行错误:', error)
        }
      })
    }
    
    // 🔧 重置刷新状态
    this.isRefreshing = false
  }

  /**
   * 初始化管理器
   */
  init() {
    this.setupEventListeners()
    this.initializeExistingNodes()
    console.log('✅ [统一预览线管理器] 初始化事件监听器和现有节点预览线')
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 节点相关事件
    this.graph.on('node:added', this.handleNodeAdded.bind(this))
    this.graph.on('node:removed', this.handleNodeRemoved.bind(this))
    this.graph.on('node:move', this.handleNodeMove.bind(this))
    this.graph.on('node:moving', this.handleNodeMoving.bind(this))
    this.graph.on('node:moved', this.handleNodeMoved.bind(this))
    this.graph.on('node:mousedown', this.handleNodeMouseDown.bind(this))
    this.graph.on('node:mouseup', this.handleNodeMouseUp.bind(this))
    this.graph.on('node:config-updated', this.handleNodeConfigUpdated.bind(this))
    
    // 边相关事件
    this.graph.on('edge:added', this.handleEdgeAdded.bind(this))
    this.graph.on('edge:removed', this.handleEdgeRemoved.bind(this))
    
    // 预览线相关事件
    this.graph.on('edge:mousedown', this.handlePreviewLineMouseDown.bind(this))
    this.graph.on('edge:mouseenter', this.handlePreviewLineMouseEnter.bind(this))
    this.graph.on('edge:mouseleave', this.handlePreviewLineMouseLeave.bind(this))
    
    // 画布事件
    this.graph.on('blank:mouseup', this.handleBlankMouseUp.bind(this))
    
    // 全局鼠标事件（用于拖拽）
    document.addEventListener('mousemove', this.handleGlobalMouseMove.bind(this))
    document.addEventListener('mouseup', this.handleGlobalMouseUp.bind(this))
  }

  /**
   * 初始化现有节点的预览线
   */
  initializeExistingNodes() {
    const nodes = this.graph.getNodes()
    console.log('🔄 [统一预览线管理器] 开始初始化现有节点预览线:', {
      totalNodes: nodes.length,
      existingPreviewLines: this.previewLines.size
    })
    
    nodes.forEach(node => {
      // 🔧 修复：检查是否已经存在预览线，避免重复创建
      const existingPreview = this.previewLines.get(node.id)
      if (existingPreview) {
        console.log('⏭️ [统一预览线管理器] 节点已有预览线，跳过:', node.id)
        return
      }
      
      if (this.shouldCreatePreviewLine(node)) {
        console.log('✅ [统一预览线管理器] 为节点创建预览线:', node.id)
        this.createUnifiedPreviewLine(node, UnifiedPreviewStates.STATIC_DISPLAY)
      }
    })
    
    console.log('✅ [统一预览线管理器] 初始化完成，当前预览线数量:', this.previewLines.size)
  }

  /**
   * 创建统一预览线
   * @param {Object} node - 源节点
   * @param {string} initialState - 初始状态
   * @param {Object} options - 额外选项
   */
  createUnifiedPreviewLine(node, initialState = UnifiedPreviewStates.STATIC_DISPLAY, options = {}) {
    // 🔧 双重验证：检查节点是否存在
    if (!node || !node.id) {
      console.warn('⚠️ [统一预览线管理器] 节点对象无效，跳过预览线创建')
      return null
    }
    
    // 🎯 防止重复创建检查
    if (this.previewLines.has(node.id)) {
      const existingPreview = this.previewLines.get(node.id)
      // 🔧 优化：降级为调试信息，减少内存影响
      if (this.debugMode) {
        console.log('🔍 [统一预览线管理器] 节点已存在预览线，跳过重复创建:', {
          nodeId: node.id,
          existingType: existingPreview.type || (Array.isArray(existingPreview) ? 'branch' : 'single'),
          requestedState: initialState
        })
      }
      return existingPreview
    }
    
    // 检查节点是否在graph中存在
    if (this.graph && !this.graph.hasCell(node.id)) {
      console.warn('⚠️ [统一预览线管理器] 节点不在graph中，跳过预览线创建:', node.id)
      return null
    }
    
    // 检查节点是否已被移除
    if (node.removed || node.isRemoved?.()) {
      console.warn('⚠️ [统一预览线管理器] 节点已被移除，跳过预览线创建:', node.id)
      return null
    }
    
    if (!this.shouldCreatePreviewLine(node)) {
      console.log('⏭️ [统一预览线管理器] 跳过预览线创建:', node.id)
      return null
    }

    // 🔧 关键修复：重新获取节点数据，确保获取到最新的isConfigured状态
    // 因为shouldCreatePreviewLine可能已经自动修复了isConfigured字段
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    console.log('📊 [统一预览线管理器] 预览线创建前的节点数据验证:', {
      nodeId: node.id,
      nodeType: nodeType,
      isConfigured: nodeData.isConfigured,
      hasConfig: !!(nodeData.config && Object.keys(nodeData.config).length > 0)
    })

    // 🔧 新增：如果布局引擎未就绪，添加到待处理队列
    if (!this.layoutEngineReady) {
      const added = this.addToPendingCalculations(node.id, node, 'create')
      if (added) {
        console.log('📋 [统一预览线管理器] 预览线创建任务已加入待处理队列:', node.id)
        return null
      }
    }

    // 检查是否是分支节点，传递配置参数
    const isBranchNode = this.isBranchNode(node, options.config)
    
    if (isBranchNode) {
      return this.createBranchPreviewLines(node, initialState, options)
    } else {
      return this.createSinglePreviewLine(node, initialState, options)
    }
  }

  /**
   * 创建单一预览线
   * @param {Object} node - 源节点
   * @param {string} initialState - 初始状态
   * @param {Object} options - 额外选项
   */
  createSinglePreviewLine(node, initialState, options = {}) {
    const nodePosition = node.getPosition()
    const nodeSize = node.getSize()
    
    // 计算预览线终点位置
    const endPosition = this.calculateSinglePreviewPosition(node, nodePosition, nodeSize)
    
    // 创建预览线
    const previewLine = this.createBasicPreviewLine(node, endPosition, {
      type: PreviewLineTypes.SINGLE,
      ...options
    })

    // 检查预览线是否创建成功
    if (!previewLine) {
      console.error('❌ [统一预览线管理器] 单一预览线创建失败:', node.id)
      return null
    }

    // 创建预览线实例
    const previewInstance = {
      line: previewLine,
      sourceNode: node,
      state: initialState,
      type: PreviewLineTypes.SINGLE,
      dragHandler: null,
      hintNode: null,
      endPosition: endPosition
    }

    // 设置初始状态
    this.setPreviewLineState(previewInstance, initialState)
    
    // 存储预览线
    this.previewLines.set(node.id, previewInstance)
    
    return previewInstance
  }

  /**
   * 创建分支预览线
   * @param {Object} node - 源节点
   * @param {string} initialState - 初始状态
   * @param {Object} options - 额外选项
   */
  createBranchPreviewLines(node, initialState, options = {}) {
    const nodeId = node.id
    
    console.log('🔧 [统一预览线管理器] 开始创建分支预览线:', {
      nodeId: nodeId,
      initialState: initialState,
      options: options
    })
    
    // 🔧 修复：检查是否已经存在预览线实例，避免重复创建
    const existingPreview = this.previewLines.get(nodeId)
    if (existingPreview) {
      // 🔧 优化：降级为调试信息，减少内存影响
      if (this.debugMode) {
        console.log('🔍 [统一预览线管理器] 节点已有预览线，跳过重复创建:', {
          nodeId: nodeId,
          existingType: Array.isArray(existingPreview) ? 'branch' : 'single',
          existingCount: Array.isArray(existingPreview) ? existingPreview.length : 1
        })
      }
      return existingPreview
    }
    
    // 获取分支信息，优先使用传入的配置
    const branches = this.getNodeBranches(node, options.config)
    
    console.log('📊 [统一预览线管理器] 获取到分支信息:', {
      nodeId: nodeId,
      branchCount: branches.length,
      branches: branches.map(b => ({ id: b.id, label: b.label }))
    })
    
    const previewInstances = []

    branches.forEach((branch, index) => {
      // 🔧 关键修复：检查该分支是否已有真实连接
      const hasRealConnection = this.checkBranchHasRealConnection(node, branch.id)
      
      if (hasRealConnection) {
        console.log('⏭️ [统一预览线管理器] 分支已有真实连接，跳过预览线创建:', {
          nodeId: nodeId,
          branchId: branch.id,
          branchLabel: branch.label,
          branchIndex: index
        })
        return // 跳过已有连接的分支
      }
      
      const endPosition = this.calculateBranchPreviewPosition(node, branches, index)
      
      // 创建分支预览线，传递分支标签
      const previewLine = this.createBasicPreviewLine(node, endPosition, {
        type: PreviewLineTypes.BRANCH,
        branchId: branch.id,
        branchIndex: index,
        totalBranches: branches.length,
        branchLabel: branch.label, // 传递分支标签
        ...options
      })

      // 检查预览线是否创建成功
      if (!previewLine) {
        console.error('❌ [统一预览线管理器] 分支预览线创建失败:', {
          nodeId: node.id,
          branchId: branch.id,
          branchIndex: index
        })
        return // 跳过这个分支，继续处理下一个
      }

      // 创建预览线实例
      const previewInstance = {
        line: previewLine,
        sourceNode: node,
        state: initialState,
        type: PreviewLineTypes.BRANCH,
        branchId: branch.id,
        branchLabel: branch.label, // 添加分支标签
        branchIndex: index,
        totalBranches: branches.length,
        dragHandler: null,
        hintNode: null,
        endPosition: endPosition,
        branchInfo: branch // 保存分支信息
      }

      // 设置初始状态
      this.setPreviewLineState(previewInstance, initialState)
      
      previewInstances.push(previewInstance)
      
      console.log('✅ [统一预览线管理器] 分支预览线创建成功:', {
        nodeId: nodeId,
        branchId: branch.id,
        branchLabel: branch.label,
        branchIndex: index,
        lineId: previewLine.id
      })
    })

    // 只有在有预览线实例时才存储
    if (previewInstances.length > 0) {
      // 存储分支预览线（使用复合键）
      this.previewLines.set(node.id, previewInstances)
    }
    
    console.log('✅ [统一预览线管理器] 分支预览线创建完成:', {
      nodeId: nodeId,
      totalBranches: branches.length,
      createdCount: previewInstances.length,
      skippedCount: branches.length - previewInstances.length,
      totalPreviewLines: this.previewLines.size
    })
    
    return previewInstances
  }

  /**
   * 创建单个分支预览线
   * @param {Object} node - 源节点
   * @param {Object} branch - 分支信息
   * @param {number} branchIndex - 分支索引
   * @param {number} totalBranches - 总分支数
   * @param {string} initialState - 初始状态
   */
  createBranchPreviewLine(node, branch, branchIndex, totalBranches, initialState) {
    console.log('🔧 [统一预览线管理器] 创建单个分支预览线:', {
      nodeId: node.id,
      branchId: branch.id,
      branchLabel: branch.label,
      branchIndex: branchIndex,
      totalBranches: totalBranches
    })

    // 计算分支预览线位置
    const branches = Array(totalBranches).fill(null).map((_, index) => {
      if (index === branchIndex) {
        return branch
      }
      return { id: `temp_${index}`, label: `分支${index + 1}` }
    })
    
    const endPosition = this.calculateBranchPreviewPosition(node, branches, branchIndex)
    
    // 创建分支预览线，传递分支标签
    const previewLine = this.createBasicPreviewLine(node, endPosition, {
      type: PreviewLineTypes.BRANCH,
      branchId: branch.id,
      branchIndex: branchIndex,
      totalBranches: totalBranches,
      branchLabel: branch.label
    })

    // 检查预览线是否创建成功
    if (!previewLine) {
      console.error('❌ [统一预览线管理器] 单个分支预览线创建失败:', {
        nodeId: node.id,
        branchId: branch.id,
        branchIndex: branchIndex
      })
      return null
    }

    // 创建预览线实例
    const previewInstance = {
      line: previewLine,
      sourceNode: node,
      state: initialState,
      type: PreviewLineTypes.BRANCH,
      branchId: branch.id,
      branchLabel: branch.label,
      branchIndex: branchIndex,
      totalBranches: totalBranches,
      dragHandler: null,
      hintNode: null,
      endPosition: endPosition,
      branchInfo: branch
    }

    // 设置初始状态
    this.setPreviewLineState(previewInstance, initialState)
    
    // 🔧 多线偏移优化：分支预览线创建完成后应用偏移
    if (totalBranches > 1) {
      setTimeout(() => {
        this.optimizeOverlappingPreviewLines(node)
      }, 100) // 稍长延迟确保所有分支线都创建完成
    }
    
    console.log('✅ [统一预览线管理器] 单个分支预览线创建成功:', {
      lineId: previewLine.id,
      branchId: branch.id,
      branchLabel: branch.label
    })
    
    return previewInstance
  }

  /**
   * 创建基础预览线
   * @param {Object} sourceNode - 源节点
   * @param {Object} endPosition - 终点位置
   * @param {Object} options - 选项
   */
  createBasicPreviewLine(sourceNode, endPosition, options = {}) {
    const { type, branchId, branchIndex = 0, totalBranches = 1, branchLabel } = options
    
    // 检查源节点是否存在于图中
    const graphNode = this.graph.getCellById(sourceNode.id)
    if (!graphNode || !graphNode.isNode()) {
      console.error('❌ [统一预览线管理器] 源节点不存在于图中:', {
        sourceNodeId: sourceNode.id,
        nodeExists: !!graphNode,
        isNode: graphNode ? graphNode.isNode() : false
      })
      return null
    }
    
    // 🔧 多线偏移处理：检查是否有其他预览线连接到相同目标
    const offsetConfig = this.calculateMultiLineOffset(sourceNode, endPosition, branchIndex, totalBranches)
    
    // 🔧 关键修复：获取节点的实际DOM中心位置，解决坐标不一致问题
    const actualCenter = this.getActualNodeCenter(sourceNode)
    const nodeSize = sourceNode.getSize()
    
    // 🔧 坐标验证：确保actualCenter坐标有效
    const validActualCenter = {
      x: (typeof actualCenter.x === 'number' && !isNaN(actualCenter.x) && isFinite(actualCenter.x)) ? actualCenter.x : 200,
      y: (typeof actualCenter.y === 'number' && !isNaN(actualCenter.y) && isFinite(actualCenter.y)) ? actualCenter.y : 100
    }
    
    // 🔧 验证节点尺寸
    const validNodeSize = {
      width: (typeof nodeSize.width === 'number' && !isNaN(nodeSize.width) && isFinite(nodeSize.width)) ? nodeSize.width : 40,
      height: (typeof nodeSize.height === 'number' && !isNaN(nodeSize.height) && isFinite(nodeSize.height)) ? nodeSize.height : 40
    }
    
    // 计算预览线的实际起始位置（从节点底部中心开始）
    const actualSourcePosition = {
      x: validActualCenter.x,
      y: validActualCenter.y + validNodeSize.height / 2
    }
    
    // 🔧 坐标验证：确保endPosition坐标有效
    const validEndPosition = {
      x: (typeof endPosition.x === 'number' && !isNaN(endPosition.x) && isFinite(endPosition.x)) ? endPosition.x : 300,
      y: (typeof endPosition.y === 'number' && !isNaN(endPosition.y) && isFinite(endPosition.y)) ? endPosition.y : 150
    }
    
    // 🔧 最终坐标验证：确保起始和结束位置都是有效数值
    if (isNaN(actualSourcePosition.x) || isNaN(actualSourcePosition.y) || 
        !isFinite(actualSourcePosition.x) || !isFinite(actualSourcePosition.y)) {
      console.error('❌ [UnifiedPreviewLineManager] 起始位置坐标无效:', actualSourcePosition);
      return null;
    }
    
    if (isNaN(validEndPosition.x) || isNaN(validEndPosition.y) || 
        !isFinite(validEndPosition.x) || !isFinite(validEndPosition.y)) {
      console.error('❌ [UnifiedPreviewLineManager] 结束位置坐标无效:', validEndPosition);
      return null;
    }
    
    console.log('📍 [统一预览线管理器] 使用实际DOM坐标创建预览线:', {
      nodeId: sourceNode.id,
      branchIndex: branchIndex,
      branchId: branchId,
      actualCenter: actualCenter,
      actualSourcePosition: actualSourcePosition,
      targetPosition: endPosition,
      offsetConfig: offsetConfig
    })
    
    // 生成唯一ID
    const lineId = `unified_preview_${sourceNode.id}_${branchId || 'single'}_${Date.now()}`
    
    // 🔧 路由器选择逻辑
    const useOrthRouter = totalBranches > 1 && Math.abs(offsetConfig.offset) > 5
    const routerName = useOrthRouter ? 'orth' : 'normal'
    
    console.log('🛤️ [预览线路由器] 路由器选择:', {
      sourceNodeId: sourceNode.id,
      branchId: branchId,
      totalBranches: totalBranches,
      offsetValue: offsetConfig.offset,
      routerSelected: routerName,
      reason: useOrthRouter ? '多分支需要偏移路径' : '单分支使用直线路径'
    })
    
    // 基础预览线配置 - 使用实际DOM坐标确保准确的起始位置
    const edgeConfig = {
      id: lineId,
      shape: 'edge',
      source: actualSourcePosition,  // 🔧 使用实际DOM坐标而不是端口连接
      target: validEndPosition,
      router: {
        name: routerName,
        args: useOrthRouter ? {
          padding: 15, // 统一使用15，与其他配置保持一致
          step: 10, // 统一使用10
          ...this.getDynamicDirectionConfig(),
          offset: offsetConfig.offset,
          excludeEnds: offsetConfig.excludeEnds,
          // 🔧 简化路径约束
          maxAllowedDirectionChange: 1,
          perpendicular: true
        } : {}
      },
      attrs: {
        line: {
          stroke: offsetConfig.strokeColor, // 使用偏移配置的颜色
          strokeWidth: offsetConfig.strokeWidth,
          strokeDasharray: offsetConfig.dashArray,
          opacity: 0.6,
          cursor: 'default',
          targetMarker: {
            name: 'block',
            width: 8,
            height: 6,
            fill: offsetConfig.strokeColor
          }
        }
      },
      zIndex: 1001 + branchIndex, // 🔧 根据分支索引调整层级
      data: {
        type: 'unified-preview-line',
        sourceNodeId: sourceNode.id,
        previewType: type,
        branchId: branchId,
        branchIndex: branchIndex,
        totalBranches: totalBranches,
        branchLabel: branchLabel, // 🔧 关键修复：添加分支标签到data对象
        isUnifiedPreview: true,
        offsetConfig: offsetConfig // 保存偏移配置用于后续调整
      }
    }
    
    // 如果是分支节点且分支数大于1，添加标签
    if (totalBranches > 1 && branchLabel) {
      edgeConfig.labels = [{
        attrs: {
          text: {
            text: branchLabel,
            fill: '#333',
            fontSize: 14,
            fontWeight: 'bold',
            textAnchor: 'middle',
            textVerticalAnchor: 'middle'
          },
          rect: {
            ref: 'text',
            refX: -8,
            refY: -6,
            refWidth: '100%',
            refHeight: '100%',
            refWidth2: 16,
            refHeight2: 12,
            fill: '#fff',
            stroke: '#fa8c16',
            strokeWidth: 2,
            rx: 4,
            ry: 4
          }
        },
        position: 0.8 // 将标签放在靠近端点的位置（80%处）
      }]
    } else {
      // 无标签情况
    }
    
    // 🔧 最终坐标验证：在addEdge前验证edgeConfig中的所有坐标
    if (!edgeConfig.source || isNaN(edgeConfig.source.x) || isNaN(edgeConfig.source.y) ||
        !isFinite(edgeConfig.source.x) || !isFinite(edgeConfig.source.y)) {
      console.error('❌ [UnifiedPreviewLineManager] edgeConfig.source坐标无效:', edgeConfig.source);
      return null;
    }
    
    if (!edgeConfig.target || isNaN(edgeConfig.target.x) || isNaN(edgeConfig.target.y) ||
        !isFinite(edgeConfig.target.x) || !isFinite(edgeConfig.target.y)) {
      console.error('❌ [UnifiedPreviewLineManager] edgeConfig.target坐标无效:', edgeConfig.target);
      return null;
    }
    
    // 🔧 验证路由器参数中的坐标
    if (edgeConfig.router && edgeConfig.router.args) {
      const args = edgeConfig.router.args;
      if (args.offset !== undefined && (isNaN(args.offset) || !isFinite(args.offset))) {
        console.warn('⚠️ [UnifiedPreviewLineManager] 路由器offset无效，重置为0:', args.offset);
        args.offset = 0;
      }
      if (args.padding !== undefined && (isNaN(args.padding) || !isFinite(args.padding))) {
        console.warn('⚠️ [UnifiedPreviewLineManager] 路由器padding无效，重置为15:', args.padding);
        args.padding = 15;
      }
      if (args.step !== undefined && (isNaN(args.step) || !isFinite(args.step))) {
        console.warn('⚠️ [UnifiedPreviewLineManager] 路由器step无效，重置为10:', args.step);
        args.step = 10;
      }
    }
    
    // 创建预览线
    let previewLine;
    try {
      previewLine = this.graph.addEdge(edgeConfig);
    } catch (error) {
      console.error('❌ [UnifiedPreviewLineManager] addEdge失败:', {
        error: error.message,
        edgeConfig: edgeConfig
      });
      return null;
    }

    // 🔧 关键修复：创建后立即验证并修正坐标，解决坐标不一致问题
    setTimeout(() => {
      this.validateAndCorrectPreviewLineCoordinates(sourceNode.id)
    }, 10) // 短暂延迟确保线条完全创建

    // 🔧 多线偏移优化：创建完成后立即应用偏移配置
    if (totalBranches > 1) {
      setTimeout(() => {
        this.optimizeOverlappingPreviewLines(sourceNode)
      }, 50) // 短暂延迟确保线条完全创建
    }

    // 强制设置标签样式（如果有标签）
    if (totalBranches > 1 && branchLabel) {
      setTimeout(() => {
        // 🔧 安全检查：确保方法存在（避免测试环境错误）
        if (typeof previewLine.getLabels === 'function') {
          const labels = previewLine.getLabels()
          
          // 强制设置标签样式
          if (labels && labels.length > 0 && typeof previewLine.setLabelAt === 'function') {
            previewLine.setLabelAt(0, {
              attrs: {
                text: {
                  text: branchLabel,
                  fill: '#333',
                  fontSize: 14,
                  fontWeight: 'bold',
                  textAnchor: 'middle',
                  textVerticalAnchor: 'middle',
                  visibility: 'visible'
                },
                rect: {
                  fill: '#fff',
                  stroke: '#fa8c16',
                  strokeWidth: 2,
                  rx: 4,
                  ry: 4,
                  visibility: 'visible'
                }
              },
              position: 0.8
            })
          }
        }
      }, 100)
    }

    return previewLine
  }

  /**
   * 获取节点的实际DOM中心位置
   * 解决逻辑坐标与DOM坐标不一致的问题
   * @param {Object} node - 节点对象
   * @returns {Object} 实际中心坐标
   */
  getActualNodeCenter(node) {
    try {
      const logicalPosition = node.getPosition()
      const nodeSize = node.getSize()
      
      // 🔧 验证逻辑位置和节点尺寸
      if (!logicalPosition || isNaN(logicalPosition.x) || isNaN(logicalPosition.y) ||
          !isFinite(logicalPosition.x) || !isFinite(logicalPosition.y)) {
        console.warn('⚠️ [坐标修正] 节点逻辑位置无效，使用默认位置:', {
          nodeId: node.id,
          invalidPosition: logicalPosition
        });
        // 设置默认位置
        node.setPosition(200, 100);
        logicalPosition.x = 200;
        logicalPosition.y = 100;
      }
      
      if (!nodeSize || isNaN(nodeSize.width) || isNaN(nodeSize.height) ||
          !isFinite(nodeSize.width) || !isFinite(nodeSize.height)) {
        console.warn('⚠️ [坐标修正] 节点尺寸无效，使用默认尺寸:', {
          nodeId: node.id,
          invalidSize: nodeSize
        });
        nodeSize.width = 40;
        nodeSize.height = 40;
      }
      
      // 获取DOM元素
      const nodeView = this.graph.findViewByCell(node)
      if (nodeView && nodeView.el) {
        const nodeElement = nodeView.el
        const rect = nodeElement.getBoundingClientRect()
        const graphContainer = this.graph.container.getBoundingClientRect()
        
        // 🔧 验证DOM矩形数据
        if (isNaN(rect.left) || isNaN(rect.top) || isNaN(rect.width) || isNaN(rect.height) ||
            !isFinite(rect.left) || !isFinite(rect.top) || !isFinite(rect.width) || !isFinite(rect.height)) {
          console.warn('⚠️ [坐标修正] DOM矩形数据无效，使用逻辑坐标:', {
            nodeId: node.id,
            invalidRect: rect
          });
          // 降级到逻辑坐标
          return {
            x: logicalPosition.x + nodeSize.width / 2,
            y: logicalPosition.y + nodeSize.height / 2
          };
        }
        
        // 计算相对于图形容器的实际位置
        const actualX = rect.left - graphContainer.left + rect.width / 2
        const actualY = rect.top - graphContainer.top + rect.height / 2
        
        // 🔧 验证计算结果
        if (isNaN(actualX) || isNaN(actualY) || !isFinite(actualX) || !isFinite(actualY)) {
          console.warn('⚠️ [坐标修正] 计算的实际位置无效，使用逻辑坐标:', {
            nodeId: node.id,
            invalidActual: { x: actualX, y: actualY }
          });
          // 降级到逻辑坐标
          return {
            x: logicalPosition.x + nodeSize.width / 2,
            y: logicalPosition.y + nodeSize.height / 2
          };
        }
        
        // 转换为图形坐标系
        const graphPoint = this.graph.clientToGraph(actualX, actualY)
        
        // 🔧 验证图形坐标
        if (!graphPoint || isNaN(graphPoint.x) || isNaN(graphPoint.y) ||
            !isFinite(graphPoint.x) || !isFinite(graphPoint.y)) {
          console.warn('⚠️ [坐标修正] 图形坐标转换结果无效，使用逻辑坐标:', {
            nodeId: node.id,
            invalidGraphPoint: graphPoint
          });
          // 降级到逻辑坐标
          return {
            x: logicalPosition.x + nodeSize.width / 2,
            y: logicalPosition.y + nodeSize.height / 2
          };
        }
        
        console.log('📍 [坐标修正] 获取节点实际DOM中心:', {
          nodeId: node.id,
          logicalPosition,
          domRect: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
          graphPoint,
          difference: {
            x: graphPoint.x - (logicalPosition.x + nodeSize.width / 2),
            y: graphPoint.y - (logicalPosition.y + nodeSize.height / 2)
          }
        })
        
        return graphPoint
      }
    } catch (error) {
      console.warn('⚠️ [坐标修正] 获取DOM中心失败，使用逻辑坐标:', error)
    }
    
    // 降级到逻辑坐标
    const logicalPosition = node.getPosition()
    const nodeSize = node.getSize()
    
    // 🔧 最终验证逻辑坐标
    const safeX = (typeof logicalPosition.x === 'number' && !isNaN(logicalPosition.x) && isFinite(logicalPosition.x)) ? logicalPosition.x : 200;
    const safeY = (typeof logicalPosition.y === 'number' && !isNaN(logicalPosition.y) && isFinite(logicalPosition.y)) ? logicalPosition.y : 100;
    const safeWidth = (typeof nodeSize.width === 'number' && !isNaN(nodeSize.width) && isFinite(nodeSize.width)) ? nodeSize.width : 40;
    const safeHeight = (typeof nodeSize.height === 'number' && !isNaN(nodeSize.height) && isFinite(nodeSize.height)) ? nodeSize.height : 40;
    
    return {
      x: safeX + safeWidth / 2,
      y: safeY + safeHeight / 2
    }
  }

  /**
   * 同步预览线起始位置
   * 当节点位置发生变化时，同步更新预览线的起始坐标
   * @param {string} nodeId - 节点ID
   */
  syncPreviewLinePosition(nodeId) {
    const previewInstance = this.previewLines.get(nodeId)
    if (!previewInstance) return
    
    const node = this.graph.getCellById(nodeId)
    if (!node) return
    
    try {
      const actualCenter = this.getActualNodeCenter(node)
      const nodeSize = node.getSize()
      
      // 🔧 验证实际中心坐标
      if (!actualCenter || isNaN(actualCenter.x) || isNaN(actualCenter.y) ||
          !isFinite(actualCenter.x) || !isFinite(actualCenter.y)) {
        console.warn('⚠️ [预览线同步] 节点实际中心坐标无效，跳过同步:', {
          nodeId,
          invalidCenter: actualCenter
        });
        return;
      }
      
      // 🔧 验证节点尺寸
      if (!nodeSize || isNaN(nodeSize.width) || isNaN(nodeSize.height) ||
          !isFinite(nodeSize.width) || !isFinite(nodeSize.height)) {
        console.warn('⚠️ [预览线同步] 节点尺寸无效，跳过同步:', {
          nodeId,
          invalidSize: nodeSize
        });
        return;
      }
      
      // 🔧 修复：使用端口连接而不是固定坐标
      // 确保预览线正确连接到节点的out端口
      
      // 只在调试模式下输出同步日志，避免频繁日志影响性能
      if (this.debugMode) {
        console.log('🔄 [预览线同步] 同步预览线起始位置:', {
          nodeId,
          actualCenter
        })
      }
      
      if (Array.isArray(previewInstance)) {
        // 分支预览线
        previewInstance.forEach((instance, index) => {
          if (instance.line) {
            try {
              // 🔧 使用端口连接而不是固定坐标
              instance.line.setSource({
                cell: nodeId,
                port: 'out'
              })
              
              // 🔧 强制刷新端口连接
              const sourcePortPosition = node.getPortProp('out', 'position')
              if (sourcePortPosition) {
                instance.line.prop('source', {
                  cell: nodeId,
                  port: 'out'
                })
              }
              
              // 只在调试模式下输出更新日志
              if (this.debugMode) {
                console.log('✅ [预览线同步] 分支预览线位置已更新:', {
                  nodeId,
                  branchIndex: index,
                  lineId: instance.line.id
                })
              }
            } catch (error) {
              console.error('❌ [预览线同步] 分支预览线同步失败:', {
                nodeId,
                branchIndex: index,
                error: error.message
              })
            }
          }
        })
      } else {
        // 单一预览线
        if (previewInstance.line) {
          try {
            // 🔧 使用端口连接而不是固定坐标
            previewInstance.line.setSource({
              cell: nodeId,
              port: 'out'
            })
            
            // 🔧 强制刷新端口连接
            const sourcePortPosition = node.getPortProp('out', 'position')
            if (sourcePortPosition) {
              previewInstance.line.prop('source', {
                cell: nodeId,
                port: 'out'
              })
            }
            
            // 只在调试模式下输出更新日志
            if (this.debugMode) {
              console.log('✅ [预览线同步] 单一预览线位置已更新:', {
                nodeId,
                lineId: previewInstance.line.id
              })
            }
          } catch (error) {
            console.error('❌ [预览线同步] 单一预览线同步失败:', {
              nodeId,
              error: error.message
            })
          }
        }
      }
    } catch (error) {
      console.error('❌ [预览线同步] 同步预览线位置失败:', {
        nodeId,
        error: error.message
      })
    }
  }

  /**
   * 校验并修正预览线坐标
   * 检测预览线起始坐标与节点实际位置的偏差，超过阈值时进行修正
   * @param {string} nodeId - 节点ID
   */
  validateAndCorrectPreviewLineCoordinates(nodeId) {
    const previewInstance = this.previewLines.get(nodeId)
    if (!previewInstance) return
    
    const node = this.graph.getCellById(nodeId)
    if (!node) return
    
    // 获取节点的实际位置
    const actualCenter = this.getActualNodeCenter(node)
    const nodeSize = node.getSize()
    const expectedSource = {
      x: actualCenter.x,
      y: actualCenter.y + nodeSize.height / 2
    }
    
    const threshold = 5 // 5像素阈值
    
    const validateAndCorrectLine = (line, lineId) => {
      if (!line) return
      
      // 检查line对象是否有getSourcePoint方法
      if (typeof line.getSourcePoint !== 'function') {
        console.warn('⚠️ [预览线坐标修正] line对象缺少getSourcePoint方法:', { lineId, line })
        return false
      }
      
      const currentSource = line.getSourcePoint()
      
      // 计算偏差
      const deviation = {
        x: Math.abs(currentSource.x - expectedSource.x),
        y: Math.abs(currentSource.y - expectedSource.y)
      }
      
      // 如果偏差超过阈值，进行修正
      if (deviation.x > threshold || deviation.y > threshold) {
        console.log('🔧 [预览线坐标修正] 检测到坐标偏差，进行修正:', {
          nodeId,
          lineId,
          currentSource,
          expectedSource,
          deviation,
          threshold
        })
        
        // 修正坐标
        line.setSource(expectedSource)
        return true
      }
      return false
    }
    
    if (Array.isArray(previewInstance)) {
      // 分支预览线
      let correctedCount = 0
      previewInstance.forEach((instance, index) => {
        if (validateAndCorrectLine(instance.line, instance.line?.id)) {
          correctedCount++
        }
      })
      
      if (correctedCount > 0) {
        console.log('✅ [预览线坐标修正] 分支预览线修正完成:', {
          nodeId,
          totalBranches: previewInstance.length,
          correctedCount
        })
      }
    } else {
      // 单一预览线
      if (validateAndCorrectLine(previewInstance.line, previewInstance.line?.id)) {
        console.log('✅ [预览线坐标修正] 单一预览线修正完成:', {
          nodeId,
          lineId: previewInstance.line?.id
        })
      }
    }
  }

  /**
   * 计算多线偏移配置
   * 当多条预览线连接到相同目标时，提供偏移和视觉区分
   * @param {Object} sourceNode - 源节点
   * @param {Object} endPosition - 终点位置
   * @param {number} branchIndex - 分支索引
   * @param {number} totalBranches - 总分支数
   * @returns {Object} 偏移配置
   */
  calculateMultiLineOffset(sourceNode, endPosition, branchIndex, totalBranches) {
    // 🎨 颜色配置：为不同分支提供不同颜色
    const branchColors = [
      '#1890ff', // 蓝色
      '#fa8c16', // 橙色
      '#52c41a', // 绿色
      '#722ed1', // 紫色
      '#eb2f96', // 粉色
      '#13c2c2', // 青色
      '#f5222d', // 红色
      '#faad14'  // 黄色
    ]
    
    // 🔧 基础偏移配置
    const baseConfig = {
      padding: 15,
      step: 15,
      offset: 0,
      excludeEnds: [],
      strokeColor: '#d9d9d9',
      strokeWidth: 2,
      dashArray: '5,5'
    }
    
    // 🔧 单线情况：使用默认配置
    if (totalBranches <= 1) {
      return baseConfig
    }
    
    // 🔧 多线情况：计算偏移和视觉区分
    const colorIndex = branchIndex % branchColors.length
    const strokeColor = branchColors[colorIndex]
    
    // 计算水平偏移：每条线在不同的水平位置
    const maxOffset = 30 // 最大偏移距离
    const offsetStep = totalBranches > 1 ? maxOffset / (totalBranches - 1) : 0
    const horizontalOffset = branchIndex * offsetStep - maxOffset / 2
    
    // 计算路由器参数偏移
    const paddingOffset = Math.abs(horizontalOffset) * 0.5
    const stepOffset = Math.abs(horizontalOffset) * 0.3
    
    console.log('🎨 [多线偏移] 计算偏移配置:', {
      sourceNodeId: sourceNode.id,
      branchIndex: branchIndex,
      totalBranches: totalBranches,
      horizontalOffset: horizontalOffset,
      strokeColor: strokeColor,
      paddingOffset: paddingOffset,
      stepOffset: stepOffset
    })
    
    return {
      padding: baseConfig.padding + paddingOffset,
      step: baseConfig.step + stepOffset,
      offset: horizontalOffset,
      excludeEnds: horizontalOffset !== 0 ? ['source'] : [],
      strokeColor: strokeColor,
      strokeWidth: 2.5, // 稍微加粗以提高可见性
      dashArray: branchIndex % 2 === 0 ? '5,5' : '8,3' // 交替使用不同的虚线样式
    }
  }

  /**
   * 检查并优化重叠的预览线
   * 当检测到多条预览线路径重叠时，自动应用偏移优化
   * @param {Object} sourceNode - 源节点
   */
  optimizeOverlappingPreviewLines(sourceNode) {
    const previewInstance = this.previewLines.get(sourceNode.id)
    if (!previewInstance) return
    
    // 处理分支预览线的重叠优化
    if (Array.isArray(previewInstance)) {
      console.log('🔧 [重叠优化] 开始优化分支预览线重叠:', {
        sourceNodeId: sourceNode.id,
        branchCount: previewInstance.length
      })
      
      previewInstance.forEach((instance, index) => {
        if (instance.line) {
          // 重新计算偏移配置
          const endPosition = this.getLineEndPosition(instance.line)
          const offsetConfig = this.calculateMultiLineOffset(
            sourceNode, 
            endPosition, 
            index, 
            previewInstance.length
          )
          
          // 应用新的偏移配置
          this.applyOffsetToLine(instance.line, offsetConfig)
        }
      })
    }
  }

  /**
   * 获取预览线的终点位置
   * @param {Object} line - 预览线对象
   * @returns {Object} 终点位置
   */
  getLineEndPosition(line) {
    const target = line.getTarget()
    if (target.x !== undefined && target.y !== undefined) {
      return { x: target.x, y: target.y }
    }
    
    // 如果目标是节点，获取节点位置
    if (target.cell) {
      const targetNode = this.graph.getCellById(target.cell)
      if (targetNode) {
        const pos = targetNode.getPosition()
        const size = targetNode.getSize()
        return {
          x: pos.x + size.width / 2,
          y: pos.y
        }
      }
    }
    
    return { x: 0, y: 0 }
  }

  /**
   * 将偏移配置应用到预览线
   * @param {Object} line - 预览线对象
   * @param {Object} offsetConfig - 偏移配置
   */
  applyOffsetToLine(line, offsetConfig) {
    // 🔧 安全检查：确保方法存在（避免测试环境错误）
    if (typeof line.setRouter === 'function') {
      // 更新路由器配置
      line.setRouter({
        name: 'orth',
        args: {
          padding: offsetConfig.padding,
          step: offsetConfig.step,
          ...this.getDynamicDirectionConfig(),
          offset: offsetConfig.offset,
          excludeEnds: offsetConfig.excludeEnds
        }
      })
    }
    
    // 更新视觉样式
    if (typeof line.attr === 'function') {
      line.attr({
        line: {
          stroke: offsetConfig.strokeColor,
          strokeWidth: offsetConfig.strokeWidth,
          strokeDasharray: offsetConfig.dashArray,
          targetMarker: {
            fill: offsetConfig.strokeColor
          }
        }
      })
    }
    
    // 更新数据中的偏移配置
    if (typeof line.getData === 'function' && typeof line.setData === 'function') {
      const data = line.getData() || {}
      data.offsetConfig = offsetConfig
      line.setData(data)
    }
    
    console.log('✅ [偏移应用] 已应用偏移配置到预览线:', {
      lineId: line.id,
      offsetConfig: offsetConfig
    })
  }
  setPreviewLineState(previewInstance, state) {
    if (!previewInstance || !previewInstance.line) {
      console.warn('⚠️ [统一预览线管理器] 预览线实例无效')
      return
    }
    
    // 🔧 双重验证：检查源节点是否存在
    if (previewInstance.sourceNode) {
      const sourceNode = previewInstance.sourceNode
      
      // 检查节点对象是否有效
      if (!sourceNode || !sourceNode.id) {
        console.warn('⚠️ [统一预览线管理器] 预览线的源节点对象无效')
        return
      }
      
      // 检查节点是否在graph中存在
      if (this.graph && !this.graph.hasCell(sourceNode.id)) {
        console.warn('⚠️ [统一预览线管理器] 预览线的源节点不在graph中:', sourceNode.id)
        return
      }
      
      // 检查节点是否已被移除
      if (sourceNode.removed || sourceNode.isRemoved?.()) {
        console.warn('⚠️ [统一预览线管理器] 预览线的源节点已被移除:', sourceNode.id)
        return
      }
    }

    const { line } = previewInstance
    previewInstance.state = state

    console.log('🔄 [统一预览线管理器] 设置预览线状态:', {
      lineId: line.id,
      state: state
    })

    switch (state) {
      case UnifiedPreviewStates.STATIC_DISPLAY:
        this.configureStaticDisplay(previewInstance)
        break
        
      case UnifiedPreviewStates.INTERACTIVE:
        this.configureInteractive(previewInstance)
        break
        
      case UnifiedPreviewStates.DRAGGING:
        this.configureDragging(previewInstance)
        break
        
      case UnifiedPreviewStates.CONNECTED:
        this.configureConnected(previewInstance)
        break
        
      case UnifiedPreviewStates.HIDDEN:
        this.configureHidden(previewInstance)
        break
    }
  }

  /**
   * 配置静态显示状态（替代持久化预览线）
   */
  configureStaticDisplay(previewInstance) {
    const { line } = previewInstance
    
    line.attr({
      line: {
        stroke: '#d9d9d9',
        strokeWidth: 2,
        strokeDasharray: '5,5',
        opacity: 0.6,
        cursor: 'default',
        targetMarker: {
          fill: '#d9d9d9'
        }
      }
    })
    
    // 更新标签样式（如果有标签）
    this.updateLabelStyle(line, {
      text: { fill: '#999' },
      rect: { stroke: '#d9d9d9', fill: '#f5f5f5' }
    })
    
    // 移除交互能力
    this.removeInteractivity(previewInstance)
    
    console.log('📊 [统一预览线管理器] 配置为静态显示状态:', line.id)
  }

  /**
   * 配置交互状态（替代可拖拽预设线）
   */
  configureInteractive(previewInstance) {
    const { line, sourceNode } = previewInstance
    const nodeData = sourceNode.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    // 根据节点类型确定颜色
    let strokeColor, markerColor, labelColor
    if (nodeType === 'start') {
      // 开始节点：蓝色
      strokeColor = '#1890ff'
      markerColor = '#1890ff'
      labelColor = '#1890ff'
    } else {
      // 其他节点：橙色
      strokeColor = '#fa8c16'
      markerColor = '#fa8c16'
      labelColor = '#fa8c16'
    }
    
    line.attr({
      line: {
        stroke: strokeColor,
        strokeWidth: 2,
        strokeDasharray: '5,5',
        opacity: 0.8,
        cursor: 'grab',
        targetMarker: {
          fill: markerColor
        }
      }
    })
    
    // 更新标签样式（如果有标签）
    this.updateLabelStyle(line, {
      text: { fill: labelColor },
      rect: { stroke: strokeColor, fill: '#fff' }
    })
    
    // 添加交互能力
    this.addInteractivity(previewInstance)
    
    console.log('🎯 [统一预览线管理器] 配置为交互状态:', line.id)
  }

  /**
   * 配置拖拽状态
   */
  configureDragging(previewInstance) {
    const { line } = previewInstance
    
    line.attr({
      line: {
        cursor: 'grabbing',
        opacity: 1.0
      }
    })
    
    // 更新标签样式（如果有标签）
    this.updateLabelStyle(line, {
      text: { fill: '#333' },
      rect: { stroke: '#1890ff', fill: '#e6f7ff' }
    })
    
    console.log('🖱️ [统一预览线管理器] 配置为拖拽状态:', line.id)
  }

  /**
   * 配置连接状态
   */
  configureConnected(previewInstance) {
    const { line } = previewInstance
    
    line.attr({
      line: {
        stroke: '#52c41a',
        opacity: 0.3,
        cursor: 'default'
      }
    })
    
    // 更新标签样式（如果有标签）
    this.updateLabelStyle(line, {
      text: { fill: '#52c41a' },
      rect: { stroke: '#52c41a', fill: '#f6ffed' }
    })
    
    // 移除交互能力
    this.removeInteractivity(previewInstance)
    
    console.log('🔗 [统一预览线管理器] 配置为连接状态:', line.id)
  }

  /**
   * 配置隐藏状态
   */
  configureHidden(previewInstance) {
    const { line } = previewInstance
    
    line.attr({
      line: {
        opacity: 0
      }
    })
    
    // 隐藏标签（如果有标签）
    this.updateLabelStyle(line, {
      text: { opacity: 0 },
      rect: { opacity: 0 }
    })
    
    // 移除交互能力
    this.removeInteractivity(previewInstance)
    
    console.log('👻 [统一预览线管理器] 配置为隐藏状态:', line.id)
  }

  /**
   * 更新标签样式
   * @param {Object} line - 预览线对象
   * @param {Object} styles - 标签样式配置
   */
  updateLabelStyle(line, styles) {
    const labels = line.getLabels()
    if (labels && labels.length > 0) {
      // 更新第一个标签的样式，使用正确的选择器
      const currentAttrs = labels[0].attrs || {}
      line.setLabelAt(0, {
        attrs: {
          text: {
            ...currentAttrs.text,
            ...styles.text
          },
          rect: {
            ...currentAttrs.rect,
            ...styles.rect
          }
        }
      })
    }
  }

  /**
   * 添加交互能力 - 直接在预览线终点实现拖拽功能
   */
  addInteractivity(previewInstance) {
    const { line } = previewInstance
    
    // 为预览线添加拖拽功能，不再创建独立的拖拽点
    this.addPreviewLineEndpointDrag(previewInstance)
    
    // 注意：预览线的鼠标事件现在通过X6的标准事件系统处理
    // 在setupEventListeners方法中已经绑定了edge:mousedown等事件
  }

  /**
   * 移除交互能力
   */
  removeInteractivity(previewInstance) {
    const { line } = previewInstance
    
    // 移除预览线终点拖拽功能
    this.removePreviewLineEndpointDrag(previewInstance)
    
    // 注意：预览线的鼠标事件通过X6的标准事件系统处理，无需手动移除
  }

  /**
   * 为预览线终点添加拖拽功能
   */
  addPreviewLineEndpointDrag(previewInstance) {
    const { line, sourceNode } = previewInstance
    
    // 设置预览线终点的可视化样式
    this.updatePreviewLineEndpointStyle(previewInstance, false)
    
    // 设置预览线终点拖拽功能
    this.setupPreviewLineEndpointDrag(line)
    
    // 存储预览线实例以便后续访问
    if (!this.endpointDragInstances) {
      this.endpointDragInstances = new Map()
    }
    this.endpointDragInstances.set(line.id, previewInstance)
    
    console.log('✅ [预览线终点] 添加拖拽功能:', {
      lineId: line.id,
      sourceNodeId: sourceNode?.id,
      branchId: previewInstance.branchId
    })
  }

  /**
   * 移除预览线终点拖拽功能
   */
  removePreviewLineEndpointDrag(previewInstance) {
    const { line } = previewInstance
    
    if (this.endpointDragInstances) {
      this.endpointDragInstances.delete(line.id)
    }
    
    // 重置预览线样式
    this.updatePreviewLineEndpointStyle(previewInstance, false)
    
    console.log('🗑️ [预览线终点] 移除拖拽功能:', line.id)
  }

  /**
   * 检查鼠标点击是否在预览线终点附近
   */
  isClickNearEndpoint(event, previewInstance) {
    const { line } = previewInstance
    const targetPoint = line.getTargetPoint()
    
    if (!targetPoint) return false
    
    // 获取鼠标在画布上的坐标
    const rect = this.graph.container.getBoundingClientRect()
    const domX = event.clientX - rect.left
    const domY = event.clientY - rect.top
    
    // 转换为逻辑坐标
    let logicalCoords = { x: domX, y: domY }
    if (this.coordinateManager) {
      logicalCoords = this.coordinateManager.DOMToLogical(domX, domY)
    }
    
    // 计算距离
    const distance = Math.sqrt(
      Math.pow(logicalCoords.x - targetPoint.x, 2) + 
      Math.pow(logicalCoords.y - targetPoint.y, 2)
    )
    
    // 如果距离小于20像素，认为是点击在终点附近
    const isNearEndpoint = distance < 20
    
    console.log('🎯 [预览线终点] 点击检测:', {
      lineId: line.id,
      clickPosition: logicalCoords,
      endpointPosition: targetPoint,
      distance: distance,
      isNearEndpoint: isNearEndpoint
    })
    
    return isNearEndpoint
  }

  /**
   * 高亮预览线终点
   */
  highlightPreviewLineEndpoint(previewInstance, highlight) {
    this.updatePreviewLineEndpointStyle(previewInstance, highlight)
  }

  /**
   * 更新预览线终点样式
   */
  updatePreviewLineEndpointStyle(previewInstance, highlight) {
    // 🔧 添加安全检查，确保previewInstance和line存在
    if (!previewInstance) {
      console.warn('⚠️ [统一预览线管理器] updatePreviewLineEndpointStyle: 预览线实例不存在')
      return
    }
    
    if (!previewInstance.line || previewInstance.line.removed) {
      console.warn('⚠️ [统一预览线管理器] updatePreviewLineEndpointStyle: 预览线实例或line对象不存在', {
        hasPreviewInstance: !!previewInstance,
        hasLine: !!(previewInstance && previewInstance.line),
        lineRemoved: !!(previewInstance && previewInstance.line && previewInstance.line.removed)
      })
      
      // 🔧 如果line对象不存在或已被删除，尝试重新创建预览线
      if (previewInstance.sourceNode && previewInstance.branchId) {
        console.log('🔄 [统一预览线管理器] 尝试重新创建已删除的预览线:', {
          nodeId: previewInstance.sourceNode.id,
          branchId: previewInstance.branchId,
          branchLabel: previewInstance.branchLabel
        })
        
        // 重新创建分支预览线
        this.createBranchPreviewLine(
          previewInstance.sourceNode, 
          { id: previewInstance.branchId, label: previewInstance.branchLabel }, 
          0, 
          1, 
          'pending'
        )
      } else if (previewInstance.sourceNode) {
        console.log('🔄 [统一预览线管理器] 尝试重新创建已删除的单一预览线:', {
          nodeId: previewInstance.sourceNode.id
        })
        
        // 重新创建单一预览线
        this.createUnifiedPreviewLine(previewInstance.sourceNode, UnifiedPreviewStates.INTERACTIVE)
      }
      
      return
    }
    
    const { line } = previewInstance
    
    // 🔧 确保line对象有setAttrs方法
    if (typeof line.setAttrs !== 'function') {
      console.warn('⚠️ [统一预览线管理器] updatePreviewLineEndpointStyle: line对象没有setAttrs方法', {
        lineId: line.id,
        lineType: typeof line,
        hasSetAttrs: typeof line.setAttrs
      })
      return
    }
    
    try {
      if (highlight) {
        // 高亮状态：增加线宽，改变颜色，添加终点标记
        line.setAttrs({
          line: {
            strokeWidth: 3,
            stroke: '#4080FF',
            cursor: 'grab'
          }
        })
        
        // 在终点添加可视化标记
        this.addEndpointMarker(previewInstance)
      } else {
        // 正常状态：恢复原始样式
        line.setAttrs({
          line: {
            strokeWidth: 2,
            stroke: '#1890ff',
            cursor: 'default'
          }
        })
        
        // 移除终点标记
        this.removeEndpointMarker(previewInstance)
      }
    } catch (error) {
      console.error('💥 [统一预览线管理器] updatePreviewLineEndpointStyle 执行失败:', {
        error: error.message,
        lineId: line.id,
        highlight: highlight
      })
    }
  }



  /**
   * 开始预览线拖拽 - 适配预览线终点拖拽
   */
  startPreviewLineDrag(previewInstance, event) {
    this.isDragging = true
    
    // 设置当前拖拽的预览线实例
    this.currentDragLine = {
      ...previewInstance,
      // 确保分支信息完整
      branchId: previewInstance.branchId || 'default',
      branchLabel: previewInstance.branchLabel || '',
      sourceNodeId: previewInstance.sourceNode?.id
    }
    
    // 获取初始位置 - X6事件对象结构
    const rect = this.graph.container.getBoundingClientRect()
    let clientX = 0, clientY = 0
    
    // 尝试从不同的事件属性获取鼠标位置
    if (event.clientX !== undefined && event.clientY !== undefined) {
      clientX = event.clientX
      clientY = event.clientY
    } else if (event.originalEvent) {
      clientX = event.originalEvent.clientX || 0
      clientY = event.originalEvent.clientY || 0
    } else if (event.e) {
      clientX = event.e.clientX || 0
      clientY = event.e.clientY || 0
    }
    
    this.dragStartPosition = {
      x: clientX,
      y: clientY
    }
    
    // 设置为拖拽状态
    this.setPreviewLineState(previewInstance, UnifiedPreviewStates.DRAGGING)
    
    // 高亮预览线终点，表示正在拖拽
    this.highlightPreviewLineEndpoint(previewInstance, true)
    
    // 更新预览线样式为拖拽状态
    previewInstance.line.setAttrs({
      line: {
        strokeWidth: 4,
        stroke: '#ff4d4f',
        cursor: 'grabbing'
      }
    })
    
    // 阻止事件冒泡
    if (event.stopPropagation) {
      event.stopPropagation()
    }
  }

  /**
   * 节点配置完成后的状态转换
   * @param {Object} node - 已配置的节点
   */
  onNodeConfigured(node) {
    const previewInstance = this.previewLines.get(node.id)
    if (previewInstance) {
      if (Array.isArray(previewInstance)) {
        // 分支预览线
        previewInstance.forEach(instance => {
          this.setPreviewLineState(instance, UnifiedPreviewStates.INTERACTIVE)
        })
      } else {
        // 单一预览线
        this.setPreviewLineState(previewInstance, UnifiedPreviewStates.INTERACTIVE)
      }
      
      // 更新节点状态
      this.nodeStates.set(node.id, 'configured')
    }
  }

  /**
   * 节点配置完成后创建预览线
   * @param {Object} node - 节点实例
   * @param {Object} config - 节点配置
   */
  async createPreviewLineAfterConfig(node, config = {}) {
    if (!node) return
    
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    // console.log(`🔧 [UnifiedPreviewLineManager] 开始配置后预览线创建:`, {
    //   nodeId: node.id,
    //   nodeType: nodeType,
    //   config: config
    // })
    
    // 先清理已存在的预览线，避免重复创建
    if (this.previewLines.has(node.id)) {
      this.removePreviewLine(node.id)
    }
    
    // 标记节点为已配置
    const updatedNodeData = {
      ...nodeData,
      isConfigured: true,
      config: config,
      lastConfigured: Date.now()
    }
    
    node.setData(updatedNodeData)
    
    // 🔧 修复：验证数据是否正确更新，解决时序问题
    let retryCount = 0
    const maxRetries = 5
    let dataVerified = false
    
    while (retryCount < maxRetries && !dataVerified) {
      const currentData = node.getData() || {}
      if (currentData.isConfigured === true) {
        // console.log(`✅ [UnifiedPreviewLineManager] 数据更新验证成功: ${node.id}`)
        dataVerified = true
        break
      }
      
      // console.log(`⏳ [UnifiedPreviewLineManager] 数据更新验证失败，重试 ${retryCount + 1}/${maxRetries}: ${node.id}`, {
      //   currentIsConfigured: currentData.isConfigured,
      //   expectedIsConfigured: true
      // })
      
      await new Promise(resolve => setTimeout(resolve, 50))
      retryCount++
    }
    
    if (!dataVerified) {
      // console.warn(`⚠️ [UnifiedPreviewLineManager] 数据更新验证超时: ${node.id}`)
    }
    
    // 等待节点数据更新完成，确保图状态同步
    await this.waitForNodeSync(node)
    
    // 检查是否应该创建预览线（现在应该返回true，因为节点已配置）
    const shouldCreate = this.shouldCreatePreviewLine(node)
    // console.log(`🔍 [UnifiedPreviewLineManager] 预览线创建检查:`, {
    //   nodeId: node.id,
    //   shouldCreate: shouldCreate,
    //   isConfigured: node.getData()?.isConfigured,
    //   configuredFlag: node.getData()?.isConfigured // 添加调试信息
    // })
    
    if (shouldCreate) {
      // 根据节点类型和配置确定分支数
      const branchCount = this.calculateBranchCount(node, config)
      
      // console.log(`🚀 [UnifiedPreviewLineManager] 开始创建预览线:`, {
      //   nodeId: node.id,
      //   branchCount: branchCount
      // })
      
      // 创建预览线
      const result = await this.createUnifiedPreviewLineWithRetry(node, UnifiedPreviewStates.INTERACTIVE, {
        branchCount: branchCount,
        config: config
      })
      
      // console.log(`🎯 [UnifiedPreviewLineManager] 预览线创建完成:`, {
      //   nodeId: node.id,
      //   result: result ? 'success' : 'failed'
      // })
    } else {
      // console.log(`❌ [UnifiedPreviewLineManager] 跳过预览线创建:`, {
      //   nodeId: node.id,
      //   reason: 'shouldCreatePreviewLine returned false'
      // })
    }
  }

  /**
   * 等待节点同步到图中
   * @param {Object} node - 节点实例
   * @param {number} maxRetries - 最大重试次数
   * @param {number} delay - 每次重试的延迟（毫秒）
   */
  async waitForNodeSync(node, maxRetries = 5, delay = 50) {
    // console.log(`🔄 [统一预览线管理器] 开始等待节点同步:`, {
    //   nodeId: node.id,
    //   maxRetries: maxRetries,
    //   delay: delay
    // })
    
    for (let i = 0; i < maxRetries; i++) {
      const graphNode = this.graph.getCellById(node.id)
      const nodeExists = !!graphNode
      const isNode = graphNode ? graphNode.isNode() : false
      
      // console.log(`🔍 [统一预览线管理器] 节点同步检查 (${i + 1}/${maxRetries}):`, {
      //   nodeId: node.id,
      //   nodeExists: nodeExists,
      //   isNode: isNode,
      //   graphNodeType: graphNode ? graphNode.constructor.name : 'N/A'
      // })
      
      if (graphNode && graphNode.isNode()) {
        // console.log('✅ [统一预览线管理器] 节点已同步到图中:', node.id)
        return true
      }
      
      if (i < maxRetries - 1) {
        // console.log(`⏳ [统一预览线管理器] 等待节点同步 (${i + 1}/${maxRetries})，${delay}ms后重试:`, node.id)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    // console.warn('⚠️ [统一预览线管理器] 节点同步超时:', {
    //   nodeId: node.id,
    //   maxRetries: maxRetries,
    //   totalWaitTime: maxRetries * delay
    // })
    return false
  }

  /**
   * 带重试机制的预览线创建
   * @param {Object} node - 节点实例
   * @param {string} initialState - 初始状态
   * @param {Object} options - 选项
   * @param {number} maxRetries - 最大重试次数
   */
  async createUnifiedPreviewLineWithRetry(node, initialState, options = {}, maxRetries = 3) {
    // console.log(`🔄 [统一预览线管理器] 开始重试创建预览线:`, {
    //   nodeId: node.id,
    //   maxRetries: maxRetries
    // })
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        // console.log(`🔄 [统一预览线管理器] 预览线创建尝试 (${i + 1}/${maxRetries}):`, node.id)
        
        // 在每次重试前检查节点是否存在于图中
        const graphNode = this.graph.getCellById(node.id)
        if (!graphNode || !graphNode.isNode()) {
          // console.warn(`⚠️ [统一预览线管理器] 重试前检查：节点不存在于图中 (${i + 1}/${maxRetries}):`, {
          //   nodeId: node.id,
          //   nodeExists: !!graphNode,
          //   isNode: graphNode ? graphNode.isNode() : false
          // })
          
          if (i < maxRetries - 1) {
            // 等待一段时间后重试
            // console.log(`⏳ [统一预览线管理器] 等待后重试 (${i + 1}/${maxRetries}):`, node.id)
            await new Promise(resolve => setTimeout(resolve, 200))
            continue
          } else {
            // console.error(`❌ [统一预览线管理器] 所有重试后节点仍不存在:`, node.id)
            return null
          }
        }
        
        const result = this.createUnifiedPreviewLine(node, initialState, options)
        if (result) {
          // console.log(`✅ [统一预览线管理器] 预览线创建成功 (${i + 1}/${maxRetries}):`, node.id)
          return result
        } else {
          // console.warn(`⚠️ [统一预览线管理器] 预览线创建返回空值 (${i + 1}/${maxRetries}):`, node.id)
        }
      } catch (error) {
        // console.warn(`🔄 [统一预览线管理器] 预览线创建异常 (${i + 1}/${maxRetries}):`, {
        //   nodeId: node.id,
        //   error: error.message,
        //   stack: error.stack
        // })
      }
      
      if (i < maxRetries - 1) {
        // 等待一段时间后重试
        // console.log(`⏳ [统一预览线管理器] 等待后重试 (${i + 1}/${maxRetries}):`, node.id)
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }
    
    // console.error('❌ [统一预览线管理器] 预览线创建重试失败:', node.id)
    return null
  }

  /**
   * 根据节点类型和配置计算分支数
   * @param {Object} node - 节点实例
   * @param {Object} config - 节点配置
   * @returns {number} 分支数量
   */
  calculateBranchCount(node, config = {}) {
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    switch (nodeType) {
      case 'audience-split':
        // 人群分流：根据配置的人群层数 + 1个未命中分支
        if (config.crowdLayers && Array.isArray(config.crowdLayers)) {
          return config.crowdLayers.length + 1
        } else if (config.branches && Array.isArray(config.branches)) {
          return config.branches.length
        }
        return 2 // 默认：1个分流 + 1个未命中
        
      case 'event-split':
        // 事件分流：固定2个分支（是/否）
        return 2
        
      case 'ab-test':
        // AB测试：根据配置的版本数，默认2个（A/B）
        if (config.versions && Array.isArray(config.versions)) {
          return config.versions.length
        } else if (config.branches && Array.isArray(config.branches)) {
          return config.branches.length
        }
        return 2 // 默认A/B两个版本
        
      default:
        // 其他节点类型：单一输出
        return 1
    }
  }

  /**
   * 配置取消后恢复预览线
   * @param {Object} cancelledNode - 被取消配置的节点实例
   */
  async restorePreviewLinesAfterCancel(cancelledNode) {
    if (!cancelledNode) return
    
    const cancelledNodeData = cancelledNode.getData() || {}
    const cancelledNodeType = cancelledNodeData.type || cancelledNodeData.nodeType
    
    console.log('🔄 [统一预览线管理器] 配置取消，检查需要恢复的预览线:', {
      cancelledNodeId: cancelledNode.id,
      cancelledNodeType: cancelledNodeType
    })
    
    // 查找所有已配置的源节点，这些节点可能需要恢复预览线
    const allNodes = this.graph.getNodes()
    const configuredSourceNodes = allNodes.filter(node => {
      const nodeData = node.getData() || {}
      const nodeType = nodeData.type || nodeData.nodeType
      
      // 检查是否是已配置的分支节点
      const isConfigured = nodeData.isConfigured || nodeData.config
      const isBranchNode = ['audience-split', 'event-split', 'ab-test'].includes(nodeType)
      
      return isConfigured && isBranchNode && node.id !== cancelledNode.id
    })
    
    console.log('🔍 [统一预览线管理器] 找到已配置的源节点:', {
      count: configuredSourceNodes.length,
      nodes: configuredSourceNodes.map(node => ({
        id: node.id,
        type: node.getData()?.type,
        isConfigured: node.getData()?.isConfigured
      }))
    })
    
    // 为每个已配置的源节点恢复预览线
    for (const sourceNode of configuredSourceNodes) {
      try {
        const sourceNodeData = sourceNode.getData() || {}
        const sourceNodeType = sourceNodeData.type || sourceNodeData.nodeType
        const sourceConfig = sourceNodeData.config || {}
        
        console.log('🔄 [统一预览线管理器] 恢复源节点预览线:', {
          sourceNodeId: sourceNode.id,
          sourceNodeType: sourceNodeType,
          hasExistingPreviewLine: this.previewLines.has(sourceNode.id)
        })
        
        // 如果源节点已经有预览线，先清理
        if (this.previewLines.has(sourceNode.id)) {
          console.log('🧹 [统一预览线管理器] 清理源节点已存在的预览线:', sourceNode.id)
          this.removePreviewLine(sourceNode.id)
        }
        
        // 等待节点同步
        await this.waitForNodeSync(sourceNode)
        
        // 检查是否应该创建预览线
        if (this.shouldCreatePreviewLine(sourceNode)) {
          // 根据节点类型和配置确定分支数
          const branchCount = this.calculateBranchCount(sourceNode, sourceConfig)
          
          console.log('📊 [统一预览线管理器] 恢复预览线分支数:', {
            sourceNodeId: sourceNode.id,
            sourceNodeType: sourceNodeType,
            branchCount: branchCount
          })
          
          // 创建预览线
          const result = await this.createUnifiedPreviewLineWithRetry(sourceNode, UnifiedPreviewStates.INTERACTIVE, {
            branchCount: branchCount,
            config: sourceConfig
          })
          
          if (result) {
            console.log('✅ [统一预览线管理器] 源节点预览线恢复成功:', sourceNode.id)
          } else {
            console.warn('⚠️ [统一预览线管理器] 源节点预览线恢复失败:', sourceNode.id)
          }
        } else {
          console.log('⚠️ [统一预览线管理器] 源节点不满足预览线创建条件:', sourceNode.id)
        }
      } catch (error) {
        console.error('❌ [统一预览线管理器] 恢复源节点预览线时出错:', {
          sourceNodeId: sourceNode.id,
          error: error.message,
          stack: error.stack
        })
      }
    }
    
    console.log('🔄 [统一预览线管理器] 配置取消后预览线恢复完成')
  }

  /**
   * 节点连接后的状态转换
   * @param {Object} node - 已连接的节点
   * @param {string} branchId - 连接的分支ID（可选）
   * @param {string} branchLabel - 连接的分支标签（可选）
   */
  onNodeConnected(node, branchId = null, branchLabel = null) {
    const previewInstance = this.previewLines.get(node.id)
    if (previewInstance) {
      // 🔧 修复：临时保存拖拽状态，确保拖拽点能被正确删除
      const originalIsDragging = this.isDragging
      const originalCurrentDragLine = this.currentDragLine
      
      if (Array.isArray(previewInstance)) {
        // 分支预览线 - 只隐藏特定分支的预览线
        if (branchId) {
          const targetInstance = previewInstance.find(instance => 
            instance.branchId === branchId
          )
          if (targetInstance) {
            this.setPreviewLineState(targetInstance, UnifiedPreviewStates.HIDDEN)
            
            console.log('🔄 [统一预览线管理器] 特定分支预览线已隐藏:', {
              nodeId: node.id,
              branchId: branchId,
              branchLabel: branchLabel
            })
          }
        } else {
          // 如果没有指定分支ID，隐藏所有分支预览线（向后兼容）
          previewInstance.forEach(instance => {
            this.setPreviewLineState(instance, UnifiedPreviewStates.HIDDEN)
          })
          console.log('🔄 [统一预览线管理器] 所有分支预览线已隐藏:', node.id)
        }
      } else {
        // 单一预览线
        this.setPreviewLineState(previewInstance, UnifiedPreviewStates.HIDDEN)
        
        console.log('🔄 [统一预览线管理器] 单一预览线已隐藏:', {
          nodeId: node.id,
          branchLabel: branchLabel
        })
      }
      
      // 恢复拖拽状态
      this.isDragging = originalIsDragging
      this.currentDragLine = originalCurrentDragLine
    }
  }

  /**
   * 节点断开连接后的状态恢复
   * @param {Object} node - 断开连接的节点
   * @param {string} branchId - 断开连接的分支ID（可选）
   */
  onNodeDisconnected(node, branchId = null, branchLabel = null) {
    const previewInstance = this.previewLines.get(node.id)
    if (previewInstance) {
      if (Array.isArray(previewInstance)) {
        // 分支预览线 - 只恢复特定分支的预览线
        if (branchId) {
          const targetInstance = previewInstance.find(instance => 
            instance.branchId === branchId
          )
          if (targetInstance) {
            // 🔧 检查预览线的line对象是否存在，如果不存在则重新创建
            if (!targetInstance.line || targetInstance.line.removed) {
              console.log('🔄 [统一预览线管理器] 预览线line对象不存在，重新创建分支预览线:', {
                nodeId: node.id,
                branchId: branchId,
                branchLabel: branchLabel
              })
              
              // 重新创建该分支的预览线
              this.createBranchPreviewLine(node, { id: branchId, label: branchLabel }, 0, 1, 'pending')
              return
            }
            
            // 如果有标签信息，更新预览线实例的标签
            if (branchLabel) {
              targetInstance.branchLabel = branchLabel
              
              // 更新预览线的标签显示
              this.updatePreviewLineLabel(targetInstance.line, branchLabel)
              
              console.log('🏷️ [统一预览线管理器] 恢复分支预览线标签:', {
                nodeId: node.id,
                branchId: branchId,
                branchLabel: branchLabel
              })
            }
            
            // 重新计算预览线的结束位置，确保拖拽提示点位置正确
            this.recalculatePreviewLineEndPosition(targetInstance)
            
            this.setPreviewLineState(targetInstance, UnifiedPreviewStates.INTERACTIVE)
            console.log('🔄 [统一预览线管理器] 特定分支预览线已恢复:', {
              nodeId: node.id,
              branchId: branchId,
              branchLabel: branchLabel,
              newEndPosition: targetInstance.endPosition
            })
          } else {
            // 如果找不到目标实例，创建新的分支预览线
            console.log('🔄 [统一预览线管理器] 未找到目标分支实例，创建新的分支预览线:', {
              nodeId: node.id,
              branchId: branchId,
              branchLabel: branchLabel
            })
            this.createBranchPreviewLine(node, { id: branchId, label: branchLabel }, 0, 1, 'pending')
          }
        } else {
          // 如果没有指定分支ID，恢复所有分支预览线（向后兼容）
          previewInstance.forEach(instance => {
            // 🔧 检查每个分支的line对象是否存在
            if (!instance.line || instance.line.removed) {
              console.log('🔄 [统一预览线管理器] 分支预览线line对象不存在，重新创建:', {
                nodeId: node.id,
                branchId: instance.branchId,
                branchLabel: instance.branchLabel
              })
              this.createBranchPreviewLine(node, { id: instance.branchId, label: instance.branchLabel }, 0, 1, 'pending')
              return
            }
            
            // 重新计算预览线的结束位置
            this.recalculatePreviewLineEndPosition(instance)
            this.setPreviewLineState(instance, UnifiedPreviewStates.INTERACTIVE)
          })
          console.log('🔄 [统一预览线管理器] 所有分支预览线已恢复:', node.id)
        }
      } else {
        // 单一预览线
        // 🔧 检查预览线的line对象是否存在，如果不存在则重新创建
        if (!previewInstance.line || previewInstance.line.removed) {
          console.log('🔄 [统一预览线管理器] 单一预览线line对象不存在，重新创建:', {
            nodeId: node.id,
            branchLabel: branchLabel
          })
          
          // 重新创建单一预览线
          this.createUnifiedPreviewLine(node, UnifiedPreviewStates.INTERACTIVE)
          return
        }
        
        if (branchLabel) {
          previewInstance.branchLabel = branchLabel
          this.updatePreviewLineLabel(previewInstance.line, branchLabel)
        }
        
        // 重新计算预览线的结束位置，确保拖拽提示点位置正确
        this.recalculatePreviewLineEndPosition(previewInstance)
        
        this.setPreviewLineState(previewInstance, UnifiedPreviewStates.INTERACTIVE)
        console.log('🔄 [统一预览线管理器] 单一预览线已恢复:', {
          nodeId: node.id,
          branchLabel: branchLabel,
          newEndPosition: previewInstance.endPosition
        })
      }
    } else {
      // 如果预览线实例不存在，创建新的预览线
      console.log('🔄 [统一预览线管理器] 预览线实例不存在，创建新的预览线:', {
        nodeId: node.id,
        branchId: branchId,
        branchLabel: branchLabel
      })
      
      if (branchId) {
        this.createBranchPreviewLine(node, { id: branchId, label: branchLabel }, 0, 1, 'pending')
      } else {
        this.createUnifiedPreviewLine(node, UnifiedPreviewStates.INTERACTIVE)
      }
    }
  }

  /**
   * 重新计算预览线的结束位置
   * @param {Object} previewInstance - 预览线实例
   */
  recalculatePreviewLineEndPosition(previewInstance) {
    const { line, sourceNode } = previewInstance
    
    if (!line || !sourceNode) {
      console.warn('⚠️ [统一预览线管理器] 无法重新计算结束位置，缺少必要信息')
      return
    }
    
    // 🔧 修复：验证源节点坐标
    const sourcePosition = sourceNode.getPosition()
    if (!sourcePosition || isNaN(sourcePosition.x) || isNaN(sourcePosition.y) || 
        !isFinite(sourcePosition.x) || !isFinite(sourcePosition.y)) {
      console.warn('⚠️ [统一预览线管理器] 源节点坐标无效，使用默认坐标:', {
        sourceNodeId: sourceNode.id,
        invalidPosition: sourcePosition
      })
      sourceNode.setPosition(200, 100)
    }
    
    // 获取预览线的当前路径点
    const vertices = line.getVertices()
    let endPosition
    
    if (vertices && vertices.length > 0) {
      // 如果有路径点，使用最后一个路径点作为结束位置
      endPosition = vertices[vertices.length - 1]
    } else {
      // 如果没有路径点，使用预览线的目标点
      const targetPoint = line.getTargetPoint()
      endPosition = targetPoint || previewInstance.endPosition
    }
    
    // 🔧 修复：验证结束位置坐标
    if (!endPosition || isNaN(endPosition.x) || isNaN(endPosition.y) || 
        !isFinite(endPosition.x) || !isFinite(endPosition.y)) {
      console.warn('⚠️ [统一预览线管理器] 结束位置坐标无效，使用默认坐标:', {
        lineId: line.id,
        invalidEndPosition: endPosition
      })
      endPosition = { x: 300, y: 150 }
    }
    
    // 更新预览线实例的结束位置
    previewInstance.endPosition = {
      x: endPosition.x,
      y: endPosition.y
    }
    
    console.log('📍 [统一预览线管理器] 重新计算预览线结束位置:', {
      lineId: line.id,
      oldEndPosition: previewInstance.endPosition,
      newEndPosition: endPosition,
      hasVertices: !!(vertices && vertices.length > 0),
      verticesCount: vertices ? vertices.length : 0
    })
  }

  /**
   * 更新预览线标签
   * @param {Object} line - 预览线对象
   * @param {string} branchLabel - 分支标签
   */
  updatePreviewLineLabel(line, branchLabel) {
    if (!line || !branchLabel) return
    
    console.log('🏷️ [统一预览线管理器] 更新预览线标签:', {
      lineId: line.id,
      branchLabel: branchLabel
    })
    
    // 创建标签配置
    const labelConfig = {
      attrs: {
        text: {
          text: branchLabel,
          fill: '#333',
          fontSize: 14,
          fontWeight: 'bold',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle'
        },
        rect: {
          ref: 'text',
          refX: -8,
          refY: -6,
          refWidth: '100%',
          refHeight: '100%',
          refWidth2: 16,
          refHeight2: 12,
          fill: '#fff',
          stroke: '#fa8c16',
          strokeWidth: 2,
          rx: 4,
          ry: 4
        }
      },
      position: 0.8 // 将标签放在靠近端点的位置（80%处）
    }
    
    // 设置标签
    line.setLabels([labelConfig])
    
    // 强制设置标签样式
    setTimeout(() => {
      if (line && !line.removed) {
        const labels = line.getLabels()
        if (labels && labels.length > 0) {
          line.setLabelAt(0, {
            attrs: {
              text: {
                text: branchLabel,
                fill: '#333',
                fontSize: 14,
                fontWeight: 'bold',
                textAnchor: 'middle',
                textVerticalAnchor: 'middle',
                visibility: 'visible'
              },
              rect: {
                fill: '#fff',
                stroke: '#fa8c16',
                strokeWidth: 2,
                rx: 4,
                ry: 4,
                visibility: 'visible'
              }
            },
            position: 0.8
          })
        }
      }
    }, 100)
  }

  // ==================== 事件处理方法 ====================

  /**
   * 处理节点添加事件
   * 🔧 修复：在节点刚添加时不立即创建预览线，只有配置完成后才创建
   */
  handleNodeAdded(e) {
    const { node } = e
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type
    
    console.log('➕ [统一预览线管理器] 节点添加事件:', {
      nodeId: node.id,
      nodeType: nodeType,
      isConfigured: nodeData.isConfigured,
      hasConfig: !!nodeData.config
    })
    
    // 清理该节点的缓存（如果存在）
    this.clearNodeCache(node.id)
    
    // 🎯 关键修复：对于特殊节点类型，延迟预览线创建直到配置完成
    const delayedPreviewNodeTypes = ['sms', 'manual_call', 'ai_call']
    if (delayedPreviewNodeTypes.includes(nodeType)) {
      console.log('⏳ [统一预览线管理器] 特殊节点类型，延迟预览线创建直到配置完成:', {
        nodeId: node.id,
        nodeType: nodeType,
        reason: '等待用户配置完成'
      })
      // 不立即创建预览线，等待配置完成事件
      return
    }
    
    // 🔧 对于其他节点类型，使用原有逻辑
    if (this.shouldCreatePreviewLine(node)) {
      console.log('✅ [统一预览线管理器] 创建预览线:', {
        nodeId: node.id,
        nodeType: nodeType
      })
      // 所有预览线默认为可交互状态，支持移动和吸附
      this.createUnifiedPreviewLine(node, UnifiedPreviewStates.INTERACTIVE)
    } else {
      console.log('⏭️ [统一预览线管理器] 节点不应创建预览线:', {
        nodeId: node.id,
        nodeType: nodeType,
        isConfigured: nodeData.isConfigured
      })
    }
  }

  /**
   * 处理节点配置更新事件
   * @param {Object} data - 事件数据，包含节点、节点类型和配置信息
   */
  handleNodeConfigUpdated(data) {
    const { node, nodeType, config } = data
    const nodeData = node.getData() || {}
    
    console.log('🔄 [统一预览线管理器] 节点配置已更新:', {
      nodeId: node.id,
      nodeType: nodeType,
      isConfigured: nodeData.isConfigured,
      hasConfig: !!nodeData.config
    })
    
    // 清理该节点的缓存，确保使用最新的配置信息
    this.clearNodeCache(node.id)
    
    // 判断是否是分支节点
    const isBranchNode = this.isBranchNode(node, config)
    
    if (isBranchNode) {
      // 分支节点：智能更新预览线
      console.log('🌿 [统一预览线管理器] 分支节点配置更新，智能更新预览线:', {
        nodeId: node.id,
        nodeType: nodeType
      })
      
      // 获取当前分支信息
      const branches = this.getNodeBranches(node, config)
      const existingPreview = this.previewLines.get(node.id)
      
      // 检查每个分支的连接状态
      const branchConnectionStatus = branches.map(branch => ({
        ...branch,
        hasConnection: this.checkBranchHasRealConnection(node, branch.id)
      }))
      
      console.log('🔍 [统一预览线管理器] 分支连接状态检查:', {
        nodeId: node.id,
        branches: branchConnectionStatus.map(b => ({
          id: b.id,
          label: b.label,
          hasConnection: b.hasConnection
        }))
      })
      
      // 如果有未连接的分支，需要创建/更新预览线
      const unconnectedBranches = branchConnectionStatus.filter(b => !b.hasConnection)
      
      if (unconnectedBranches.length > 0) {
        console.log('✅ [统一预览线管理器] 发现未连接的分支，创建预览线:', {
          nodeId: node.id,
          unconnectedBranches: unconnectedBranches.map(b => ({ id: b.id, label: b.label }))
        })
        
        // 移除旧的预览线
        this.removePreviewLine(node.id)
        
        // 创建新的分支预览线，传递配置信息
        this.createUnifiedPreviewLine(node, UnifiedPreviewStates.INTERACTIVE, { config })
      } else {
        console.log('⏭️ [统一预览线管理器] 所有分支都已连接，移除预览线:', {
          nodeId: node.id,
          totalBranches: branches.length
        })
        
        // 所有分支都已连接，移除预览线
        this.removePreviewLine(node.id)
      }
    } else {
      // 非分支节点：使用原有逻辑
      if (this.shouldCreatePreviewLine(node)) {
        console.log('✅ [统一预览线管理器] 配置完成后创建预览线:', {
          nodeId: node.id,
          nodeType: nodeType
        })
        
        // 先移除可能存在的旧预览线
        this.removePreviewLine(node.id)
        
        // 创建新的预览线，传递配置信息以便正确处理分支节点
        this.createUnifiedPreviewLine(node, UnifiedPreviewStates.INTERACTIVE, { config })
      } else {
        console.log('⏭️ [统一预览线管理器] 节点配置更新后仍不应创建预览线:', {
          nodeId: node.id,
          nodeType: nodeType,
          isConfigured: nodeData.isConfigured
        })
      }
    }
  }

  /**
   * 处理节点移除事件
   * @param {Object} e - 事件对象，包含被删除的节点
   * @param {Array} providedIncomingEdges - 可选的传入边数组，用于优化性能
   */
  handleNodeRemoved(e, providedIncomingEdges = null) {
    const { node } = e
    
    // 检查是否是预览相关节点
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type
    // 🗑️ [已删除] isEndpoint检查已被新的预览线分层策略替代
    const isPreviewRelated = nodeData.isUnifiedPreview || nodeData.isPersistentPreview || 
                            nodeData.isPreview || nodeType === 'unified-preview-line'
    
    if (isPreviewRelated) {
      console.log('🗑️ [统一预览线管理器] 跳过预览相关节点的删除处理:', {
        nodeId: node.id,
        nodeType: nodeType,
        isPreviewRelated: isPreviewRelated
      })
      return
    }
    
    // 检查是否已经处理过这个节点的删除事件
    if (this.processedNodeDeletions && this.processedNodeDeletions.has(node.id)) {
      console.log('🗑️ [统一预览线管理器] 节点删除事件已处理过，跳过:', node.id)
      return
    }
    
    // 初始化已处理删除事件的集合
    if (!this.processedNodeDeletions) {
      this.processedNodeDeletions = new Set()
    }
    
    // 标记这个节点的删除事件已处理
    this.processedNodeDeletions.add(node.id)
    
    // 设置清理定时器，避免内存泄漏
    setTimeout(() => {
      if (this.processedNodeDeletions) {
        this.processedNodeDeletions.delete(node.id)
      }
    }, 1000) // 1秒后清理标记
    
    console.log('🗑️ [统一预览线管理器] 节点删除事件开始处理:', {
      nodeId: node.id,
      nodeType: nodeType,
      timestamp: new Date().toISOString(),
      currentPreviewLines: Array.from(this.previewLines.keys()),
      currentEndpoints: this.endpoints ? Array.from(this.endpoints.keys()) : [],
      providedIncomingEdges: !!providedIncomingEdges,
      providedIncomingEdgesLength: providedIncomingEdges ? providedIncomingEdges.length : 'null'
    })
    
    // 使用提供的传入边信息，或者重新获取（如果没有提供或为空数组）
    let incomingEdges
    if (providedIncomingEdges && providedIncomingEdges.length > 0) {
      incomingEdges = providedIncomingEdges
      console.log('🗑️ [统一预览线管理器] 使用提供的传入边信息')
    } else {
      incomingEdges = this.graph.getIncomingEdges(node.id) || []
      console.log('🗑️ [统一预览线管理器] 重新从图中获取传入边信息')
    }
    
    console.log('🗑️ [统一预览线管理器] 被删除节点的传入连接:', {
      nodeId: node.id,
      incomingEdgesCount: incomingEdges.length,
      incomingEdges: incomingEdges.map(edge => ({
        id: edge.id,
        sourceId: edge.getSourceCellId(),
        targetId: edge.getTargetCellId(),
        data: edge.getData()
      }))
    })
    
    // 1. 删除被移除节点的预览线
    this.removePreviewLine(node.id)
    
    // 2. 清理该节点的缓存
    this.clearNodeCache(node.id)
    
    // 3. 清理与该节点相关的所有拖拽提示点
    this.cleanupRelatedEndpoints(node.id)
    
    console.log('🗑️ [统一预览线管理器] 调用预览线恢复方法')
    // 3. 检查是否有其他节点连接到被删除的节点，如果有，恢复它们的预览线
    this.restorePreviewLinesAfterNodeDeletion(node, incomingEdges)
    
    console.log('🗑️ [统一预览线管理器] 节点删除事件处理完成:', {
      nodeId: node.id,
      remainingPreviewLines: Array.from(this.previewLines.keys()),
      remainingEndpoints: this.endpoints ? Array.from(this.endpoints.keys()) : []
    })
  }

  /**
   * 处理节点移动中事件（实时更新）
   */
  handleNodeMoving(e) {
    const { node } = e
    const nodeData = node.getData() || {}
    
    // 🗑️ [已删除] endpoint检查已被新的预览线分层策略替代
    
    // 检查节点是否应该有预览线
    if (!this.shouldCreatePreviewLine(node)) {
      return
    }
    
    // 实时更新预览线位置，不使用防抖以确保流畅的跟随效果
    // 减少日志输出，避免频繁日志导致性能问题
    try {
      this.immediateUpdatePosition(node)
    } catch (error) {
      // 只在调试模式下输出错误日志
      if (this.debugMode) {
        console.warn('⚠️ [统一预览线管理器] 节点移动中更新失败:', error)
      }
    }
  }

  /**
   * 处理节点移动事件（使用防抖优化）
   */
  handleNodeMove(e) {
    const { node } = e
    const nodeData = node.getData() || {}
    
    // 检查节点是否应该有预览线
    if (!this.shouldCreatePreviewLine(node)) {
      return
    }
    
    // 🔧 修复：使用立即更新提升实时性，同时保留防抖作为备份
    try {
      // 立即更新预览线位置，确保实时响应
      this.immediateUpdatePosition(node)
    } catch (error) {
      console.warn('⚠️ [统一预览线管理器] 立即更新失败，使用防抖更新:', error)
      // 如果立即更新失败，回退到防抖更新
      this.debouncedUpdatePosition(node)
    }
  }

  /**
   * 处理节点移动完成事件
   */
  handleNodeMoved(e) {
    // 安全检查事件对象和node属性
    if (!e || !e.node) {
      console.warn('⚠️ [统一预览线管理器] handleNodeMoved: 无效的事件对象或缺少node属性', e)
      return
    }
    
    const { node } = e
    const nodeData = node.getData() || {}
    
    console.log('🚚 [统一预览线管理器] 节点移动完成:', {
      nodeId: node.id,
      nodeType: nodeData.nodeType || nodeData.type,
      isEndpoint: nodeData.isEndpoint,
      isConfigured: nodeData.isConfigured
    })
    
    // 🗑️ [已删除] endpoint检查已被新的预览线分层策略替代
    
    // 检查节点是否应该有预览线
    if (!this.shouldCreatePreviewLine(node)) {
      console.log('⏭️ [统一预览线管理器] 节点不应该有预览线，跳过位置更新:', {
        nodeId: node.id,
        nodeType: nodeData.nodeType || nodeData.type,
        isConfigured: nodeData.isConfigured || false
      })
      return
    }
    
    // 检查是否是以hint_开头的节点ID，如果是，提取原始节点ID
    let targetNodeId = node.id
    if (node.id.startsWith('hint_')) {
      // 从hint_unified_preview_nodeId_xxx格式中提取原始节点ID
      const parts = node.id.split('_')
      if (parts.length >= 4 && parts[0] === 'hint' && parts[1] === 'unified' && parts[2] === 'preview') {
        targetNodeId = parts[3]
        console.log('🔍 [统一预览线管理器] 从拖拽提示点ID提取原始节点ID:', {
          hintNodeId: node.id,
          extractedNodeId: targetNodeId
        })
      }
    }
    
    // 🔧 添加防抖机制，避免频繁的预览线刷新
    const debounceKey = targetNodeId || node.id
    
    // 清除之前的防抖定时器
    if (this.nodeMoveDebounceTimers && this.nodeMoveDebounceTimers.has(debounceKey)) {
      clearTimeout(this.nodeMoveDebounceTimers.get(debounceKey))
    }
    
    // 初始化防抖定时器Map
    if (!this.nodeMoveDebounceTimers) {
      this.nodeMoveDebounceTimers = new Map()
    }
    
    // 设置新的防抖定时器
    const debounceTimer = setTimeout(() => {
      this.executeNodeMoveUpdate(node, targetNodeId)
      this.nodeMoveDebounceTimers.delete(debounceKey)
    }, 16) // 16ms防抖延迟，约等于一帧时间，提升响应速度
    
    this.nodeMoveDebounceTimers.set(debounceKey, debounceTimer)
    
    console.log('⏱️ [统一预览线管理器] 节点移动防抖已设置:', {
      nodeId: debounceKey,
      debounceDelay: '16ms'
    })
  }
  
  /**
   * 🔧 执行节点移动后的预览线更新
   * 从handleNodeMoved中提取的实际更新逻辑
   */
  executeNodeMoveUpdate(node, targetNodeId) {
    // 🔧 优化：检查是否正在刷新，避免重复操作
    if (this.isRefreshing) {
      console.log('⏭️ [统一预览线管理器] 正在刷新中，跳过节点移动更新:', {
        nodeId: node.id,
        targetNodeId: targetNodeId
      })
      return
    }
    
    console.log('🔄 [统一预览线管理器] 执行节点移动更新:', {
      nodeId: node.id,
      targetNodeId: targetNodeId
    })
    
    // 🔧 使用批量刷新机制，避免频繁的单独刷新
    if (this.isMounted && this.hasInitialRefresh) {
      // 如果已挂载且已进行过初始刷新，使用批量刷新
      this.queueRefresh(targetNodeId || node.id)
      
      // 清除缓存，确保下次获取最新位置
      this.positionCache.delete(targetNodeId || node.id)
      
      console.log('📋 [统一预览线管理器] 节点移动已加入批量刷新队列:', {
        nodeId: targetNodeId || node.id
      })
    } else {
      // 如果未挂载或未进行初始刷新，使用直接刷新
      const nodeToUpdate = targetNodeId ? this.graph?.getCellById(targetNodeId) : node
      if (nodeToUpdate) {
        this.updatePreviewLinePosition(nodeToUpdate)
        this.positionCache.delete(nodeToUpdate.id)
        
        console.log('🔄 [统一预览线管理器] 直接刷新节点预览线:', {
          nodeId: nodeToUpdate.id
        })
      }
    }
  }

  /**
   * 处理节点鼠标按下事件
   */
  handleNodeMouseDown(e) {
    const { node } = e
    const nodeData = node.getData() || {}
    
    // 检查是否是拖拽提示点
    if (nodeData.isEndpoint || nodeData.type === 'endpoint') {
      // 查找对应的预览线实例
      const parentLineId = nodeData.parentPreviewLine
      if (parentLineId) {
        // 遍历所有预览线实例，找到对应的预览线
        for (const [nodeId, previewInstance] of this.previewLines) {
          if (Array.isArray(previewInstance)) {
            // 分支预览线
            const targetInstance = previewInstance.find(instance => 
              instance.line.id === parentLineId
            )
            if (targetInstance) {
              this.startPreviewLineDrag(targetInstance, e)
              return
            }
          } else {
            // 单一预览线
            if (previewInstance.line.id === parentLineId) {
              this.startPreviewLineDrag(previewInstance, e)
              return
            }
          }
        }
      }
      
      return
    }
    
    // 检查是否是拖拽提示点激活状态
    if (this.isEndpointActive) {
      return
    }
  }

  /**
   * 处理节点鼠标释放事件
   */
  handleNodeMouseUp(e) {
    // 处理节点鼠标释放
  }

  /**
   * 处理预览线鼠标按下事件
   */
  handlePreviewLineMouseDown(e) {
    const { edge } = e
    console.log('🖱️ [统一预览线管理器] 预览线鼠标按下事件:', {
      edgeId: edge.id,
      edgeData: edge.getData()
    })
    
    // 查找对应的预览线实例
    const previewInstance = this.findPreviewInstanceByEdgeId(edge.id)
    if (previewInstance) {
      console.log('✅ [统一预览线管理器] 找到预览线实例，开始拖拽')
      this.startPreviewLineDrag(previewInstance, e)
    } else {
      console.warn('⚠️ [统一预览线管理器] 未找到预览线实例:', edge.id)
    }
  }

  /**
   * 处理预览线鼠标进入事件
   */
  handlePreviewLineMouseEnter(e) {
    const { edge } = e
    console.log('🖱️ [统一预览线管理器] 预览线鼠标进入事件:', edge.id)
    
    // 查找对应的预览线实例
    const previewInstance = this.findPreviewInstanceByEdgeId(edge.id)
    if (previewInstance) {
      this.setPreviewLineState(previewInstance, UnifiedPreviewStates.HOVER)
    }
  }

  /**
   * 处理预览线鼠标离开事件
   */
  handlePreviewLineMouseLeave(e) {
    const { edge } = e
    console.log('🖱️ [统一预览线管理器] 预览线鼠标离开事件:', edge.id)
    
    // 查找对应的预览线实例
    const previewInstance = this.findPreviewInstanceByEdgeId(edge.id)
    if (previewInstance && !this.isDragging) {
      this.setPreviewLineState(previewInstance, UnifiedPreviewStates.INTERACTIVE)
    }
  }

  /**
   * 根据边ID查找预览线实例
   */
  findPreviewInstanceByEdgeId(edgeId) {
    for (const [nodeId, previewInstance] of this.previewLines) {
      if (Array.isArray(previewInstance)) {
        // 分支预览线
        const targetInstance = previewInstance.find(instance => 
          instance.line.id === edgeId
        )
        if (targetInstance) {
          return targetInstance
        }
      } else {
        // 单一预览线
        if (previewInstance.line.id === edgeId) {
          return previewInstance
        }
      }
    }
    return null
  }

  /**
   * 处理边添加事件
   */
  handleEdgeAdded(e) {
    const { edge } = e
    const sourceNode = edge.getSourceNode()
    if (sourceNode) {
      // 获取边数据中的分支ID
      const edgeData = edge.getData() || {}
      const branchId = edgeData.branchId
      
      console.log('🔗 [统一预览线管理器] 边添加事件:', {
        sourceNodeId: sourceNode.id,
        branchId: branchId,
        edgeData: edgeData
      })
      
      // 传递分支ID给连接处理方法
      this.onNodeConnected(sourceNode, branchId)
    }
  }

  /**
   * 处理边移除事件
   */
  handleEdgeRemoved(e) {
    const { edge } = e
    const edgeData = edge.getData() || {}

    // 跳过预览线的删除事件，只处理真实连线的删除
    if (edgeData.isUnifiedPreview || edgeData.isPersistentPreview || edgeData.isPreview || 
        edgeData.type === 'unified-preview-line' || edgeData.type === 'preview-line') {
      console.log('⏭️ [统一预览线管理器] 跳过预览线删除事件:', {
        edgeId: edge.id,
        edgeType: edgeData.type,
        isPreview: edgeData.isUnifiedPreview || edgeData.isPersistentPreview || edgeData.isPreview
      })
      return
    }
    
    const sourceNode = edge.getSourceNode()
    
    if (sourceNode) {
      // 获取边数据中的分支ID和标签
      const branchId = edgeData.branchId
      const branchLabel = edgeData.branchLabel
      
      console.log('🔗 [统一预览线管理器] 真实连线删除，恢复预览线:', {
        sourceNodeId: sourceNode.id,
        branchId: branchId,
        branchLabel: branchLabel,
        edgeData: edgeData
      })
      
      // 如果有分支ID，恢复特定分支的预览线
      if (branchId) {
        this.onNodeDisconnected(sourceNode, branchId, branchLabel)
      } else if (this.shouldCreatePreviewLine(sourceNode)) {
        // 如果没有分支ID且应该创建预览线，重新创建预览线
        this.createUnifiedPreviewLine(sourceNode, UnifiedPreviewStates.INTERACTIVE)
      }
    }
  }

  /**
   * 处理画布空白区域鼠标释放事件
   */
  handleBlankMouseUp(e) {
    this.resetDragState()
  }

  /**
   * 处理全局鼠标移动事件
   */
  handleGlobalMouseMove(e) {
    if (this.isDragging && this.currentDragLine) {
      this.updateDragPosition(e)
    }
  }

  /**
   * 处理全局鼠标释放事件
   */
  handleGlobalMouseUp(e) {
    if (this.isDragging && this.currentDragLine) {
      this.handleDragEnd(e)
    }
  }

  // ==================== 辅助方法 ====================

  /**
   * 判断是否应该创建预览线
   * 重构：统一按照"有分支"和"无分支"节点进行处理
   */
  shouldCreatePreviewLine(node, excludeEdgeId = null) {
    if (!node) {
      console.log('⏭️ [统一预览线管理器] 节点为空，跳过预览线创建')
      return false
    }
    
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    console.log('🔍 [统一预览线管理器] 检查是否应该创建预览线:', {
      nodeId: node.id,
      nodeType: nodeType,
      nodeData: nodeData
    })
    
    // 🎯 新增：检查是否为强制更新模式
    if (nodeData._forcePreviewUpdate) {
      console.log('🔄 [统一预览线管理器] 强制更新模式，跳过连接检查:', node.id)
      return true
    }
    
    // 跳过拖拽提示点
    if (nodeData.isEndpoint || nodeData.type === 'endpoint' || nodeType === 'endpoint') {
      console.log('⏭️ [统一预览线管理器] 跳过拖拽提示点:', node.id)
      return false
    }
    
    // 跳过结束节点
    if (nodeType === 'end' || nodeType === 'finish') {
      console.log('⏭️ [统一预览线管理器] 跳过结束节点:', node.id)
      return false
    }
    
    // 跳过预览线相关的节点
    if (nodeData.isUnifiedPreview || nodeData.isPersistentPreview || nodeData.isPreview) {
      console.log('⏭️ [统一预览线管理器] 跳过预览线相关节点:', node.id)
      return false
    }
    
    // 🔧 重构：统一的连接检查逻辑，基于节点是否有分支
    const isBranchNode = this.isBranchNode(node)
    const hasFullConnections = this.checkNodeFullConnections(node, isBranchNode, excludeEdgeId)
    
    console.log('🔗 [统一预览线管理器] 节点连接检查结果:', {
      nodeId: node.id,
      nodeType: nodeType,
      isBranchNode: isBranchNode,
      hasFullConnections: hasFullConnections
    })
    
    // 跳过已完全连接的节点
    if (hasFullConnections) {
      console.log('⏭️ [统一预览线管理器] 跳过已完全连接的节点:', node.id)
      return false
    }
    
    // 🔧 统一规则：所有节点都必须明确标记为已配置才能生成预览线
    console.log('⚙️ [统一预览线管理器] 节点配置检查:', {
      nodeId: node.id,
      nodeType: nodeType,
      isConfigured: nodeData.isConfigured,
      hasConfig: !!(nodeData.config && Object.keys(nodeData.config).length > 0),
      nodeData: nodeData
    })
    
    // 🎯 统一规则：所有节点都必须明确标记为已配置才能生成预览线
    // 🔧 新增：自动修复isConfigured字段的逻辑
    if (nodeData.isConfigured === undefined) {
      // 检查节点是否应该被认为是已配置的
      const shouldBeConfigured = this.shouldNodeBeConfigured(nodeData, nodeType)
      
      if (shouldBeConfigured) {
        console.log('🔧 [统一预览线管理器] 自动修复isConfigured字段:', {
          nodeId: node.id,
          nodeType: nodeType,
          oldValue: nodeData.isConfigured,
          newValue: true
        })
        
        // 自动修复isConfigured字段
        const updatedData = {
          ...nodeData,
          isConfigured: true
        }
        node.setData(updatedData)
        
        // 🔧 关键修复：强制刷新节点数据，确保更新立即生效
        try {
          // 等待一个微任务周期，确保数据更新完成
          setTimeout(() => {
            const refreshedData = node.getData() || {}
            console.log('🔄 [统一预览线管理器] 节点数据刷新验证:', {
              nodeId: node.id,
              oldIsConfigured: nodeData.isConfigured,
              newIsConfigured: refreshedData.isConfigured,
              updateSuccess: refreshedData.isConfigured === true
            })
          }, 0)
        } catch (error) {
          console.warn('⚠️ [统一预览线管理器] 节点数据刷新验证失败:', error)
        }
        
        return true
      } else {
        console.log('⏭️ [统一预览线管理器] 节点无配置数据，跳过预览线创建:', {
          nodeId: node.id,
          nodeType: nodeType,
          isConfigured: nodeData.isConfigured
        })
        return false
      }
    }
    
    // 不对任何节点类型进行特殊处理，确保规则的一致性
    if (nodeData.isConfigured !== true) {
      console.log('⏭️ [统一预览线管理器] 节点未明确配置，跳过预览线创建:', {
        nodeId: node.id,
        nodeType: nodeType,
        isConfigured: nodeData.isConfigured,
        reason: '所有节点都必须明确标记为已配置才能生成预览线'
      })
      return false
    }
    
    console.log('✅ [统一预览线管理器] 节点应该创建预览线:', {
      nodeId: node.id,
      nodeType: nodeType,
      isBranchNode: isBranchNode
    })
    
    return true
  }

  /**
   * 判断节点是否应该被认为是已配置的
   * 🔧 修复：严格控制预览线创建，确保只有真正配置完成的节点才创建预览线
   * @param {Object} nodeData - 节点数据
   * @param {string} nodeType - 节点类型
   * @returns {boolean} 是否应该被认为是已配置的
   */
  shouldNodeBeConfigured(nodeData, nodeType) {
    // 开始节点默认为已配置
    if (nodeType === 'start') {
      return true
    }
    
    // 🎯 关键修复：严格控制AI外呼、人工外呼、短信等节点的预览线创建
    const strictNodeTypes = ['sms', 'manual_call', 'ai_call']
    if (strictNodeTypes.includes(nodeType)) {
      // 🔧 严格检查：只有明确标记为已配置的节点才创建预览线
      if (nodeData.isConfigured === true) {
        console.log('✅ [统一预览线管理器] 特殊节点已明确配置，允许创建预览线:', {
          nodeType,
          isConfigured: nodeData.isConfigured
        })
        return true
      }
      
      // 🔧 严格控制：即使有配置数据，也必须明确标记为已配置
      if (nodeData.config && Object.keys(nodeData.config).length > 0) {
        console.log('⚠️ [统一预览线管理器] 特殊节点有配置数据但未明确标记为已配置，不创建预览线:', {
          nodeType,
          hasConfig: true,
          isConfigured: nodeData.isConfigured,
          configKeys: Object.keys(nodeData.config)
        })
      }
      
      // 🎯 关键修复：对于这些特殊节点，必须明确配置才能创建预览线
      console.log('❌ [统一预览线管理器] 特殊节点未明确配置，跳过预览线创建:', {
        nodeType,
        isConfigured: nodeData.isConfigured,
        reason: '必须明确标记为已配置才能创建预览线'
      })
      return false
    }
    
    // 其他节点类型：严格检查isConfigured字段
    // 只有明确标记为true的节点才被认为是已配置
    return nodeData.isConfigured === true
  }

  /**
   * 检查节点是否已完全连接
   * 统一处理有分支和无分支节点的连接检查逻辑
   * @param {Object} node - 要检查的节点
   * @param {boolean} isBranchNode - 是否为分支节点
   * @param {string} excludeEdgeId - 要排除的边ID（可选）
   * @returns {boolean} 是否已完全连接
   */
  checkNodeFullConnections(node, isBranchNode, excludeEdgeId = null) {
    const outgoingEdges = this.graph.getOutgoingEdges(node) || []
    
    // 过滤出真实连接（排除预览线）
    const realConnections = outgoingEdges.filter(edge => {
      const edgeData = edge.getData() || {}
      const isRealConnection = !edgeData.isUnifiedPreview && 
                              !edgeData.isPersistentPreview && 
                              !edgeData.isPreview &&
                              edgeData.type !== 'unified-preview-line' &&
                              edgeData.type !== 'preview-line' &&
                              (excludeEdgeId ? edge.id !== excludeEdgeId : true)
      return isRealConnection
    })
    
    if (isBranchNode) {
      // 有分支的节点：检查是否所有分支都已连接
      const branches = this.getNodeBranches(node)
      
      // 获取已连接的分支ID
      const connectedBranches = new Set()
      realConnections.forEach(edge => {
        const edgeData = edge.getData() || {}
        if (edgeData.branchId) {
          connectedBranches.add(edgeData.branchId)
        }
      })
      
      // 检查是否所有分支都已连接
      const allBranchesConnected = branches.every(branch => connectedBranches.has(branch.id))
      
      console.log('🌿 [统一预览线管理器] 分支节点连接检查:', {
        nodeId: node.id,
        totalBranches: branches.length,
        connectedBranches: Array.from(connectedBranches),
        allBranchesConnected: allBranchesConnected,
        branches: branches.map(b => ({ 
          id: b.id, 
          label: b.label, 
          connected: connectedBranches.has(b.id) 
        }))
      })
      
      return allBranchesConnected
    } else {
      // 无分支的节点：检查是否有任何真实连接
      const hasAnyConnection = realConnections.length > 0
      
      console.log('🔗 [统一预览线管理器] 单一节点连接检查:', {
        nodeId: node.id,
        totalOutgoingEdges: outgoingEdges.length,
        realConnections: realConnections.length,
        hasAnyConnection: hasAnyConnection,
        connectionDetails: realConnections.map(edge => {
          const edgeData = edge.getData() || {}
          return {
            edgeId: edge.id,
            target: edge.getTargetCellId(),
            type: edgeData.type || 'unknown'
          }
        })
      })
      
      return hasAnyConnection
    }
  }

  /**
   * 检查节点是否已有连接
   * @param {Object} node - 要检查的节点
   * @param {string} excludeEdgeId - 要排除的边ID（可选）
   */
  hasExistingConnections(node, excludeEdgeId = null) {
    const outgoingEdges = this.graph.getOutgoingEdges(node) || []
    return outgoingEdges.some(edge => {
      const edgeData = edge.getData() || {}
      return !edgeData.isUnifiedPreview && 
             !edgeData.isPersistentPreview && 
             !edgeData.isPreview &&
             edgeData.type !== 'unified-preview-line' &&
             (excludeEdgeId ? edge.id !== excludeEdgeId : true) // 排除指定的边
    })
  }

  /**
   * 检查节点是否有任何输入连接（排除预览线）
   * @param {Object} node - 节点
   * @returns {boolean} 是否有输入连接
   */
  hasAnyIncomingConnections(node) {
    const edges = this.graph.getConnectedEdges(node, { incoming: true })
    
    // 过滤掉预览线，只检查真实的业务连接
    const realConnections = edges.filter(edge => {
      const edgeData = edge.getData() || {}
      return !edgeData.isUnifiedPreview && 
             !edgeData.isPersistentPreview && 
             !edgeData.isPreview &&
             edgeData.type !== 'unified-preview-line' &&
             edgeData.type !== 'preview-line'
    })
    
    console.log('🔍 [统一预览线管理器] 检查节点输入连接:', {
      nodeId: node.id,
      totalIncomingEdges: edges.length,
      realConnections: realConnections.length,
      hasIncomingConnections: realConnections.length > 0
    })
    
    return realConnections.length > 0
  }

  /**
   * 节点配置完成事件监听
   * @param {string} nodeId - 节点ID
   * @param {Object} config - 新的配置数据
   */
  async onNodeConfigured(nodeId, config) {
    console.log('🎯 [统一预览线管理器] 节点配置完成事件:', {
      nodeId,
      config
    })
    
    // 更新节点的配置状态
    const node = this.graph.getCellById(nodeId)
    if (node) {
      const nodeData = node.getData() || {}
      nodeData.config = { ...nodeData.config, ...config }
      nodeData.isConfigured = true
      node.setData(nodeData)
      
      console.log('✅ [统一预览线管理器] 节点配置状态已更新:', {
        nodeId,
        isConfigured: nodeData.isConfigured,
        nodeType: nodeData.type || nodeData.nodeType
      })
      
      // 🔧 关键修复：等待节点数据更新完成后再触发预览线重新评估
      setTimeout(async () => {
        try {
          await this.reevaluateNodePreviewLines(nodeId)
          console.log('🔄 [统一预览线管理器] 预览线重新评估完成:', { nodeId })
        } catch (error) {
          console.error('❌ [统一预览线管理器] 预览线重新评估失败:', error)
        }
      }, 50) // 给一个短暂的延迟确保数据更新完成
    }
  }

  /**
   * 重新评估节点的预览线
   * @param {string} nodeId - 节点ID
   */
  async reevaluateNodePreviewLines(nodeId) {
    console.log('🔄 [统一预览线管理器] 重新评估节点预览线:', { nodeId })
    
    const node = this.graph.getCellById(nodeId)
    if (!node) {
      console.warn('⚠️ [统一预览线管理器] 节点不存在:', { nodeId })
      return
    }
    
    // 清除该节点的现有预览线
    if (this.previewLines && this.previewLines.has(nodeId)) {
      this.removePreviewLine(nodeId)
    }
    
    // 重新创建预览线（如果节点现在已配置）
    if (this.shouldCreatePreviewLine(node)) {
      const nodeData = node.getData() || {}
      await this.createPreviewLineAfterConfig(node, nodeData.config || {})
    }
  }

  /**
   * 判断是否是分支节点
   * @param {Object} node - 节点
   * @param {Object} config - 节点配置（可选）
   * @returns {boolean} 是否为分支节点
   */
  isBranchNode(node, config = null) {
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    const nodeConfig = config || nodeData.config || {}
    
    // 基于节点类型判断
    const branchNodeTypes = ['audience-split', 'event-split', 'ab-test']
    const isBranchByType = branchNodeTypes.includes(nodeType)
    
    // 基于配置判断分支数量
    let branchCount = 1
    if (nodeConfig.branchCount && typeof nodeConfig.branchCount === 'number') {
      branchCount = nodeConfig.branchCount
    } else {
      branchCount = this.calculateBranchCount(node, nodeConfig)
    }
    
    const isBranchByCount = branchCount > 1
    
    const isBranch = isBranchByType || isBranchByCount
    
    console.log('🔍 [统一预览线管理器] 节点类型检查:', {
      nodeId: node.id,
      nodeType,
      isBranchByType,
      branchCount,
      isBranchByCount,
      isBranchNode: isBranch
    })
    
    return isBranch
  }

  /**
   * 获取节点的分支信息
   * @param {Object} node - 节点
   * @param {Object} config - 节点配置（可选）
   * @returns {Array} 分支数组
   */
  getNodeBranches(node, config = null) {
    const nodeId = node.id
    const nodeData = node.getData() || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    // 检查缓存
    const cached = this.branchInfoCache.get(nodeId)
    const now = Date.now()
    
    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      console.log('📦 [统一预览线管理器] 使用缓存的分支信息:', {
        nodeId: nodeId,
        cacheAge: now - cached.timestamp,
        branches: cached.branches.map(b => ({ id: b.id, label: b.label }))
      })
      return cached.branches
    }
    
    // 优先使用传入的配置，否则使用节点数据中的配置
    const nodeConfig = config || nodeData.config || {}
    
    console.log('🔍 [统一预览线管理器] getNodeBranches 被调用:', {
      nodeId: nodeId,
      nodeType: nodeType,
      nodeData: nodeData,
      passedConfig: config,
      finalConfig: nodeConfig,
      hasStoredBranches: !!(nodeConfig.branches && Array.isArray(nodeConfig.branches)),
      cacheStatus: cached ? 'expired' : 'miss'
    })
    
    let branches = []
    
    // 检查节点是否有存储的分支数据，但需要验证这些分支是否基于有效配置
    if (nodeConfig.branches && Array.isArray(nodeConfig.branches)) {
      // 对于分流节点，需要验证是否有真实的配置支持这些分支
      const isValidBranchConfig = this.validateStoredBranches(nodeType, nodeConfig, nodeId)
      
      if (isValidBranchConfig) {
        console.log('🔄 [统一预览线管理器] 使用存储的分支数据:', nodeConfig.branches)
        branches = nodeConfig.branches
      } else {
        console.log('⚠️ [统一预览线管理器] 存储的分支数据无效，重新生成:', {
          nodeId: nodeId,
          nodeType: nodeType,
          storedBranches: nodeConfig.branches.length
        })
        // 根据节点类型和配置重新生成分支
        branches = this.generateBranchesByType(nodeType, nodeConfig, nodeId)
      }
    } else {
      // 根据节点类型和配置生成分支
      branches = this.generateBranchesByType(nodeType, nodeConfig, nodeId)
    }
    
    // 使用工具类验证并修复所有分支标签
    branches = branches.map((branch, index) => 
      BranchLabelUtils.validateAndFixBranchLabel(branch, index, nodeType)
    )
    
    // 缓存结果
    this.branchInfoCache.set(nodeId, {
      branches: branches,
      timestamp: now
    })
    
    console.log('💾 [统一预览线管理器] 分支信息已缓存:', {
      nodeId: nodeId,
      branchCount: branches.length,
      branches: branches.map(b => ({ id: b.id, label: b.label }))
    })
    
    return branches
  }

  /**
   * 智能验证节点配置状态
   * @param {Object} node - 节点对象
   * @param {string} nodeType - 节点类型
   * @param {Object} nodeData - 节点数据
   * @returns {Object} 验证结果 { isConfigured, hasConfig, hasBranchData, method, reason }
   */
  validateNodeConfiguration(node, nodeType, nodeData) {
    const nodeConfig = nodeData.config || {}
    
    // 方法1：检查 isConfigured 标志
    if (nodeData.isConfigured === true) {
      return {
        isConfigured: true,
        hasConfig: !!nodeData.config,
        hasBranchData: !!(nodeData.branches && nodeData.branches.length > 0),
        method: 'isConfigured_flag',
        reason: '节点标记为已配置'
      }
    }
    
    // 方法2：检查是否有实际配置数据
    const hasConfigData = nodeConfig && Object.keys(nodeConfig).length > 0
    if (hasConfigData) {
      // 对于分流节点，需要验证配置的有效性
      const isBranchNode = this.isBranchNode(node)
      
      if (isBranchNode) {
        const isValidBranchConfig = this.validateStoredBranches(nodeType, nodeConfig, node.id)
        if (isValidBranchConfig) {
          return {
            isConfigured: true,
            hasConfig: true,
            hasBranchData: !!(nodeData.branches && nodeData.branches.length > 0),
            method: 'valid_branch_config',
            reason: '分流节点有有效的配置数据'
          }
        } else {
          return {
            isConfigured: false,
            hasConfig: true,
            hasBranchData: !!(nodeData.branches && nodeData.branches.length > 0),
            method: 'invalid_branch_config',
            reason: '分流节点配置数据无效'
          }
        }
      } else {
        // 非分流节点，有配置数据就认为已配置
        return {
          isConfigured: true,
          hasConfig: true,
          hasBranchData: false,
          method: 'has_config_data',
          reason: '节点有配置数据'
        }
      }
    }
    
    // 方法3：对于分流节点，检查是否有分支数据（即使没有明确的配置）
    const isBranchNode = this.isBranchNode(node)
    if (isBranchNode && nodeData.branches && nodeData.branches.length > 0) {
      // 验证分支数据的合理性
      const validBranches = nodeData.branches.filter(branch => 
        branch && (branch.id || branch.label || branch.name)
      )
      
      if (validBranches.length > 0) {
        return {
          isConfigured: true,
          hasConfig: hasConfigData,
          hasBranchData: true,
          method: 'has_branch_data',
          reason: '分流节点有有效的分支数据'
        }
      }
    }
    
    // 方法4：对于开始节点，总是允许生成预览线
    if (nodeType === 'start') {
      return {
        isConfigured: true,
        hasConfig: hasConfigData,
        hasBranchData: false,
        method: 'start_node',
        reason: '开始节点总是允许预览线'
      }
    }
    
    // 方法5：检查节点是否有任何有意义的数据
    const hasAnyMeaningfulData = !!(
      nodeData.label || 
      nodeData.name || 
      nodeData.title ||
      (nodeData.data && Object.keys(nodeData.data).length > 0)
    )
    
    if (hasAnyMeaningfulData) {
      return {
        isConfigured: true,
        hasConfig: hasConfigData,
        hasBranchData: !!(nodeData.branches && nodeData.branches.length > 0),
        method: 'has_meaningful_data',
        reason: '节点有有意义的数据'
      }
    }
    
    // 默认：节点未配置
    return {
      isConfigured: false,
      hasConfig: hasConfigData,
      hasBranchData: !!(nodeData.branches && nodeData.branches.length > 0),
      method: 'default_unconfigured',
      reason: '节点未配置或配置不完整'
    }
  }

  /**
   * 验证存储的分支数据是否基于有效配置
   * @param {string} nodeType - 节点类型
   * @param {Object} nodeConfig - 节点配置
   * @param {string} nodeId - 节点ID
   * @returns {boolean} 是否有效
   */
  validateStoredBranches(nodeType, nodeConfig, nodeId) {
    switch (nodeType) {
      case 'audience-split':
        return nodeConfig.crowdLayers && 
               Array.isArray(nodeConfig.crowdLayers) && 
               nodeConfig.crowdLayers.length > 0
        
      case 'event-split':
        return !!(nodeConfig.eventCondition || 
                 nodeConfig.yesLabel || 
                 nodeConfig.noLabel)
        
      case 'ab-test':
        return !!(
          (nodeConfig.versions && Array.isArray(nodeConfig.versions) && nodeConfig.versions.length > 0) ||
          nodeConfig.groupALabel || 
          nodeConfig.groupBLabel || 
          nodeConfig.groupARatio || 
          nodeConfig.groupBRatio
        )
        
      default:
        return true
    }
  }

  /**
   * 根据节点类型生成分支信息
   * @param {string} nodeType - 节点类型
   * @param {Object} nodeConfig - 节点配置
   * @param {string} nodeId - 节点ID
   * @returns {Array} 分支数组
   */
  generateBranchesByType(nodeType, nodeConfig, nodeId) {
    switch (nodeType) {
      case 'audience-split':
        // 人群分流：根据配置的人群层数生成分支
        if (nodeConfig.crowdLayers && Array.isArray(nodeConfig.crowdLayers)) {
          const branches = nodeConfig.crowdLayers.map((layer, index) => ({
            id: layer.id || `audience_${index}`,
            label: layer.crowdName || `人群${index + 1}`,
            crowdName: layer.crowdName || `人群${index + 1}`, // 添加crowdName属性
            type: 'audience',
            crowdId: layer.crowdId,
            order: layer.order || index + 1
          }))
          
          // 从配置中读取未命中分支信息
          if (nodeConfig.unmatchBranch) {
            branches.push({
              id: nodeConfig.unmatchBranch.id || 'unmatch_default',
              label: nodeConfig.unmatchBranch.name || '未命中人群',
              crowdName: nodeConfig.unmatchBranch.crowdName || nodeConfig.unmatchBranch.name || '未命中人群',
              type: 'audience',
              crowdId: nodeConfig.unmatchBranch.crowdId || null,
              order: nodeConfig.unmatchBranch.order || branches.length + 1,
              isDefault: true
            })
          }
          
          return branches
        }
        // 如果没有配置人群层，返回空数组，不创建默认分支
        console.log('⏭️ [统一预览线管理器] 人群分流节点未配置，不生成默认分支:', nodeId)
        return []
        
      case 'event-split':
        // 事件分流：只有在有配置时才生成分支
        if (nodeConfig.eventCondition || nodeConfig.yesLabel || nodeConfig.noLabel) {
          const eventBranches = [
            { id: 'event_yes', label: nodeConfig.yesLabel || '是', type: 'event' },
            { id: 'event_no', label: nodeConfig.noLabel || '否', type: 'event' }
          ]
          
          return eventBranches
        }
        // 如果没有配置事件条件，返回空数组
        return []
        
      case 'ab-test':
        // AB测试：根据配置的版本数生成分支
        if (nodeConfig.versions && Array.isArray(nodeConfig.versions)) {
          return nodeConfig.versions.map((version, index) => ({
            id: version.id || `version_${index}`,
            label: version.name || `版本${index + 1}`,
            type: 'ab-test',
            ratio: version.ratio
          }))
        }
        // 如果有AB测试的基本配置，生成默认分支
        if (nodeConfig.groupALabel || nodeConfig.groupBLabel || nodeConfig.groupARatio || nodeConfig.groupBRatio) {
          return [
            { id: 'group_a', label: nodeConfig.groupALabel || 'A组', type: 'ab-test', ratio: nodeConfig.groupARatio || 50 },
            { id: 'group_b', label: nodeConfig.groupBLabel || 'B组', type: 'ab-test', ratio: nodeConfig.groupBRatio || 50 }
          ]
        }
        // 如果没有配置AB测试，返回空数组
        return []
        
      default:
        return []
    }
  }

  /**
   * 安全地设置路由器配置
   * 当manhattan算法失败时自动回退到orth路由器
   * @param {Object} edge - 边对象
   * @param {Object} routerConfig - 路由器配置
   */
  setSafeRouter(edge, routerConfig = {}) {
    if (!edge) {
      console.warn('⚠️ [路由器设置] 边对象无效')
      return
    }

    // 🔧 优化：根据连接类型智能选择路由器
    const source = edge.getSourcePoint()
    const target = edge.getTargetPoint()
    
    // 检查源点和目标点是否有效
    const hasValidPoints = source && target && 
                          typeof source.x === 'number' && !isNaN(source.x) &&
                          typeof source.y === 'number' && !isNaN(source.y) &&
                          typeof target.x === 'number' && !isNaN(target.x) &&
                          typeof target.y === 'number' && !isNaN(target.y)
    
    if (!hasValidPoints) {
      console.warn('⚠️ [路由器设置] 源点或目标点坐标无效，使用默认路由器:', {
        edgeId: edge.id,
        source,
        target
      })
      edge.setRouter('normal')
      return
    }

    // 计算连接距离和角度，选择最适合的路由器
    const distance = Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2))
    const isVerticalConnection = Math.abs(target.x - source.x) < 50 // 垂直连接阈值
    const isShortConnection = distance < 100 // 短距离连接阈值

    // 🔧 智能路由器选择策略
    let preferredRouter = 'orth' // 默认使用更稳定的orth路由器
    
    // 只在特定条件下使用manhattan路由器
    if (!isShortConnection && !isVerticalConnection && distance > 150) {
      preferredRouter = 'manhattan'
    }

    try {
      if (preferredRouter === 'manhattan') {
        // 尝试使用manhattan路由器
        const manhattanConfig = {
          name: 'manhattan',
          args: {
            step: 10, // 统一步长
            padding: 15, // 统一边距
            excludeEnds: ['source'],
            ...this.getDynamicDirectionConfig(),
            ...routerConfig.args
          }
        }
        
        edge.setRouter(manhattanConfig)
        
        // 🔧 简化验证：只检查基本有效性
        const vertices = edge.getVertices()
        if (vertices && Array.isArray(vertices)) {
          if (this.debugMode) {
            console.log('✅ [路由器设置] Manhattan路由器设置成功:', {
              edgeId: edge.id,
              distance: distance.toFixed(2),
              config: manhattanConfig.args
            })
          }
          return
        } else {
          throw new Error('Manhattan router generated invalid vertices')
        }
      } else {
        // 直接使用orth路由器
        throw new Error('Using orth router by preference')
      }
      
    } catch (error) {
      // 🔧 完全静默处理：拖拽时不输出任何日志，避免控制台噪音
      // 只在非拖拽状态且调试模式下输出信息
      const isDragging = this.currentDragLine !== null
      if (!isDragging && this.debugMode) {
        console.log('🔄 [路由器设置] 使用Orth路由器:', {
          edgeId: edge.id,
          reason: preferredRouter === 'manhattan' ? 'Manhattan失败' : '智能选择',
          distance: distance.toFixed(2),
          isVertical: isVerticalConnection,
          isShort: isShortConnection
        })
      }
      
      // 使用orth路由器 - 智能最短路径优化
      const orthConfig = {
        name: 'orth',
        args: {
          padding: 15, // 统一边距
          step: 10, // 统一步长
          ...this.getDynamicDirectionConfig()
          // 🚀 [智能路径] 移除手动干预，完全依赖orth路由器的自动最短路径算法
        }
      }
      
      try {
        edge.setRouter(orthConfig)
      } catch (orthError) {
        // 只在非拖拽状态下输出错误信息
        if (!isDragging) {
          console.warn('⚠️ [路由器设置] Orth路由器失败，使用默认路由器:', {
            edgeId: edge.id,
            error: orthError.message
          })
        }
        edge.setRouter('normal')
      }
    }
  }

  /**
   * 计算单一预览线位置
   */
  calculateSinglePreviewPosition(node, nodePosition, nodeSize) {
    // 🔧 修复：确保预览线从节点的out端口出发
    const nodeId = node.id || node.getId()
    
    // 🔧 坐标验证：确保nodePosition坐标有效
    const validNodePosition = {
      x: (typeof nodePosition.x === 'number' && !isNaN(nodePosition.x) && isFinite(nodePosition.x)) ? nodePosition.x : 200,
      y: (typeof nodePosition.y === 'number' && !isNaN(nodePosition.y) && isFinite(nodePosition.y)) ? nodePosition.y : 100
    }
    
    // 🔧 坐标验证：确保nodeSize有效
    const validNodeSize = {
      width: (typeof nodeSize.width === 'number' && !isNaN(nodeSize.width) && isFinite(nodeSize.width)) ? nodeSize.width : 120,
      height: (typeof nodeSize.height === 'number' && !isNaN(nodeSize.height) && isFinite(nodeSize.height)) ? nodeSize.height : 40
    }
    
    // 获取节点的out端口位置
    let outPortPosition
    try {
      // 尝试获取节点的out端口位置
      const ports = node.getPorts()
      const outPort = ports.find(port => port.id === 'out')
      if (outPort) {
        // 修复：直接计算out端口位置（节点底部中心）
        outPortPosition = {
          x: validNodePosition.x + validNodeSize.width / 2,
          y: validNodePosition.y + validNodeSize.height
        }
      }
    } catch (error) {
      console.warn(`⚠️ [预览线位置] 获取out端口位置失败: ${error.message}`)
    }
    
    // 如果无法获取端口位置，使用节点底部中心作为fallback
    if (!outPortPosition) {
      outPortPosition = {
        x: validNodePosition.x + validNodeSize.width / 2,
        y: validNodePosition.y + validNodeSize.height
      }
    }
    
    // 🔧 坐标验证：确保outPortPosition坐标有效
    const validOutPortPosition = {
      x: (typeof outPortPosition.x === 'number' && !isNaN(outPortPosition.x) && isFinite(outPortPosition.x)) ? outPortPosition.x : 260,
      y: (typeof outPortPosition.y === 'number' && !isNaN(outPortPosition.y) && isFinite(outPortPosition.y)) ? outPortPosition.y : 140
    }
    
    // 🎯 关键修复：使用布局引擎的层级Y坐标系统
    let endY = outPortPosition.y + 120 // 默认向下延伸120px
    
    // 尝试获取布局引擎并使用层级Y坐标
    const layoutEngine = this.layoutEngine || 
                      (typeof window !== 'undefined' ? window.unifiedStructuredLayoutEngine : null) || 
                      this.graph?.layoutEngine || 
                      null
    
    if (layoutEngine && typeof layoutEngine.getNextLayerY === 'function') {
      try {
        const nextLayerY = layoutEngine.getNextLayerY(nodeId)
        endY = nextLayerY
        console.log(`📍 [预览线位置] 节点 ${nodeId} 使用布局引擎层级Y坐标: ${endY}`)
      } catch (error) {
        console.warn(`⚠️ [预览线位置] 获取布局引擎层级Y坐标失败，使用默认延伸: ${error.message}`)
      }
    }
    
    return {
      x: outPortPosition.x,  // 使用out端口X坐标
      y: endY  // 使用布局引擎的层级Y坐标或默认延伸
    }
  }

  /**
   * 计算分支预览线位置
   * 修改：所有分支预览线都从节点的out端口出发
   */
  calculateBranchPreviewPosition(node, branches, index) {
    const nodePosition = node.getPosition()  // 左上角坐标
    const nodeSize = node.getSize()
    const nodeId = node.id || node.getId()
    
    // 🔧 坐标验证：确保nodePosition坐标有效
    const validNodePosition = {
      x: (typeof nodePosition.x === 'number' && !isNaN(nodePosition.x) && isFinite(nodePosition.x)) ? nodePosition.x : 200,
      y: (typeof nodePosition.y === 'number' && !isNaN(nodePosition.y) && isFinite(nodePosition.y)) ? nodePosition.y : 100
    }
    
    // 🔧 坐标验证：确保nodeSize有效
    const validNodeSize = {
      width: (typeof nodeSize.width === 'number' && !isNaN(nodeSize.width) && isFinite(nodeSize.width)) ? nodeSize.width : 120,
      height: (typeof nodeSize.height === 'number' && !isNaN(nodeSize.height) && isFinite(nodeSize.height)) ? nodeSize.height : 40
    }
    
    // 🔧 修复：获取节点的out端口位置
    let outPortPosition
    try {
      // 尝试获取节点的out端口位置
      const ports = node.getPorts()
      const outPort = ports.find(port => port.id === 'out')
      if (outPort) {
        // 修复：直接计算out端口位置（节点底部中心）
        outPortPosition = {
          x: validNodePosition.x + validNodeSize.width / 2,
          y: validNodePosition.y + validNodeSize.height
        }
      }
    } catch (error) {
      console.warn(`⚠️ [分支预览线位置] 获取out端口位置失败: ${error.message}`)
    }
    
    // 如果无法获取端口位置，使用节点底部中心作为fallback
    if (!outPortPosition) {
      outPortPosition = {
        x: validNodePosition.x + validNodeSize.width / 2,
        y: validNodePosition.y + validNodeSize.height
      }
    }
    
    // 🔧 坐标验证：确保outPortPosition坐标有效
    const validOutPortPosition = {
      x: (typeof outPortPosition.x === 'number' && !isNaN(outPortPosition.x) && isFinite(outPortPosition.x)) ? outPortPosition.x : 260,
      y: (typeof outPortPosition.y === 'number' && !isNaN(outPortPosition.y) && isFinite(outPortPosition.y)) ? outPortPosition.y : 140
    }
    
    // 🎯 关键修复：使用布局引擎的层级Y坐标系统
    let baseY = validOutPortPosition.y + 120 // 默认向下延伸120px
    
    // 尝试获取布局引擎并使用层级Y坐标
    const layoutEngine = this.layoutEngine || 
                        (typeof window !== 'undefined' ? window.unifiedStructuredLayoutEngine : null) || 
                        this.graph?.layoutEngine
    
    if (layoutEngine) {
      // 🎯 新增：优先从布局模型获取endpoint位置
      if (layoutEngine.layoutModel && layoutEngine.layoutModel.nodePositions) {
        const endpointId = `${nodeId}_branch_${index}_endpoint`
        const endpointPosition = layoutEngine.layoutModel.nodePositions.get(endpointId)
        
        if (endpointPosition && endpointPosition.nodeType === 'endpoint') {
          console.log(`🎯 [分支预览线位置] 节点 ${nodeId} 分支 ${index} 使用布局模型endpoint位置: (${endpointPosition.x}, ${endpointPosition.y})`)
          return {
            x: endpointPosition.x,
            y: endpointPosition.y
          }
        }
      }
      
      // 🎯 备选方案：使用布局引擎的层级Y坐标
      if (typeof layoutEngine.getNextLayerY === 'function') {
        try {
          const nextLayerY = layoutEngine.getNextLayerY(nodeId)
          baseY = nextLayerY
          console.log(`📍 [分支预览线位置] 节点 ${nodeId} 使用布局引擎层级Y坐标: ${baseY}`)
        } catch (error) {
          console.warn(`⚠️ [分支预览线位置] 获取布局引擎层级Y坐标失败，使用固定偏移: ${error.message}`)
        }
      }
    } else {
      console.warn(`⚠️ [分支预览线位置] 布局引擎不可用，节点 ${nodeId} 使用固定偏移Y坐标: ${baseY}`)
    }
    
    // 🎯 新增：检查是否有结构化布局后的endpoint位置缓存
    const endpointCacheKey = `${nodeId}_branch_${index}`
    if (this.endpointPositionCache && this.endpointPositionCache.has(endpointCacheKey)) {
      const cachedPosition = this.endpointPositionCache.get(endpointCacheKey)
      console.log(`🎯 [分支预览线位置] 节点 ${nodeId} 分支 ${index} 使用缓存endpoint位置: (${cachedPosition.x}, ${cachedPosition.y})`)
      return cachedPosition
    }
    
    // 计算终点位置的分散，基于out端口位置
    const baseSpacing = Math.max(validNodeSize.width * 0.8, 60) // 最小60px，最大为节点宽度的80%
    const maxSpacing = 120 // 最大间距限制
    const spacing = Math.min(baseSpacing, maxSpacing)
    
    const totalWidth = (branches.length - 1) * spacing
    const endX = validOutPortPosition.x - totalWidth / 2 + index * spacing
    
    // 🔧 坐标验证：确保计算结果有效
    const calculatedPosition = {
      x: (typeof endX === 'number' && !isNaN(endX) && isFinite(endX)) ? endX : 300, // 终点X坐标分散
      y: (typeof baseY === 'number' && !isNaN(baseY) && isFinite(baseY)) ? baseY : 260  // 使用布局引擎的层级Y坐标或固定偏移
    }
    
    // 🎯 新增：缓存计算结果
    if (!this.endpointPositionCache) {
      this.endpointPositionCache = new Map()
    }
    this.endpointPositionCache.set(endpointCacheKey, calculatedPosition)
    
    return calculatedPosition
  }

  /**
   * 🎯 新增：同步结构化布局后的endpoint位置
   * @param {Map<string, any>} layoutPositions - 布局引擎计算的位置映射
   */
  syncLayoutEndpointPositions(layoutPositions) {
    if (!layoutPositions || layoutPositions.size === 0) {
      console.warn('⚠️ [Endpoint同步] 布局位置映射为空，跳过同步')
      return
    }

    console.log('🔄 [Endpoint同步] 开始同步结构化布局后的endpoint位置')
    
    // 清空现有的endpoint位置缓存
    if (this.endpointPositionCache) {
      this.endpointPositionCache.clear()
    } else {
      this.endpointPositionCache = new Map()
    }

    let syncedCount = 0
    
    // 遍历布局位置，找到endpoint节点
    layoutPositions.forEach((position, nodeId) => {
      if (position && position.nodeType === 'endpoint' && position.sourceNodeId) {
        // 解析endpoint信息
        const sourceNodeId = position.sourceNodeId
        const branchId = position.branchId || 'default'
        
        // 构建缓存键
        let cacheKey
        if (branchId !== 'default') {
          // 分支预览线endpoint
          const branchIndex = this.extractBranchIndexFromId(branchId)
          cacheKey = `${sourceNodeId}_branch_${branchIndex}`
        } else {
          // 单一预览线endpoint
          cacheKey = `${sourceNodeId}_single`
        }
        
        // 缓存endpoint位置
        this.endpointPositionCache.set(cacheKey, {
          x: position.x,
          y: position.y,
          sourceNodeId,
          branchId,
          isLayoutSynced: true
        })
        
        // 立即更新对应的预览线位置
        this.updatePreviewLineEndpointPosition(sourceNodeId, branchId, position)
        
        syncedCount++
        if (position.x && position.y) {
          console.log(`🎯 [Endpoint同步] ${cacheKey}: (${position.x.toFixed(1)}, ${position.y.toFixed(1)})`)
        }
      }
    })

    console.log(`✅ [Endpoint同步] 同步完成，共处理 ${syncedCount} 个endpoint位置`)
    
    // 🎯 关键：标记布局同步完成，触发预览线位置更新
    this.layoutSyncCompleted = true
    this.triggerPreviewLinePositionUpdate()
  }

  /**
   * 从分支ID中提取分支索引
   * @param {string} branchId - 分支ID
   * @returns {number} 分支索引
   */
  extractBranchIndexFromId(branchId) {
    if (typeof branchId === 'string') {
      const match = branchId.match(/branch_(\d+)/)
      if (match) {
        return parseInt(match[1], 10)
      }
    }
    return 0
  }

  /**
   * 更新预览线endpoint位置
   * @param {string} sourceNodeId - 源节点ID
   * @param {string} branchId - 分支ID
   * @param {any} position - 新位置
   */
  updatePreviewLineEndpointPosition(sourceNodeId, branchId, position) {
    const previewInstance = this.previewLines.get(sourceNodeId)
    if (!previewInstance) {
      return
    }

    // 确保position有效
    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
      console.warn(`⚠️ [预览线更新] 无效的位置信息: ${JSON.stringify(position)}`)
      return
    }

    const targetPosition = { x: position.x, y: position.y }

    if (Array.isArray(previewInstance)) {
      // 分支预览线
      const branchIndex = this.extractBranchIndexFromId(branchId)
      if (previewInstance[branchIndex]) {
        const instance = previewInstance[branchIndex]
        if (instance.line && typeof instance.line.setTarget === 'function') {
          instance.line.setTarget(targetPosition)
          instance.endPosition = targetPosition
          this.updateEndpointMarker(instance.line, targetPosition)
          console.log(`🔄 [预览线更新] 分支预览线 ${sourceNodeId}[${branchIndex}] 位置已更新`)
        }
      }
    } else {
      // 单一预览线
      if (previewInstance.line && typeof previewInstance.line.setTarget === 'function') {
        previewInstance.line.setTarget(targetPosition)
        previewInstance.endPosition = targetPosition
        this.updateEndpointMarker(previewInstance.line, targetPosition)
        console.log(`🔄 [预览线更新] 单一预览线 ${sourceNodeId} 位置已更新`)
      }
    }
  }

  /**
   * 触发预览线位置更新
   */
  triggerPreviewLinePositionUpdate() {
    if (!this.layoutSyncCompleted) {
      return
    }

    console.log('🔄 [预览线更新] 触发所有预览线位置更新')
    
    // 遍历所有预览线实例，使用最新的endpoint位置
    this.previewLines.forEach((previewInstance, nodeId) => {
      const sourceNode = this.graph.getCellById(nodeId)
      if (sourceNode) {
        this.updatePreviewLinePosition(sourceNode)
      }
    })
  }

  /**
   * 更新预览线位置
   */
  updatePreviewLinePosition(node) {
    // 🔧 双重验证：检查节点是否存在
    if (!node || !node.id) {
      console.warn('⚠️ [统一预览线管理器] 节点对象无效，跳过位置更新')
      return
    }
    
    // 检查节点是否在graph中存在
    if (this.graph && !this.graph.hasCell(node.id)) {
      console.warn('⚠️ [统一预览线管理器] 节点不在graph中，跳过位置更新:', node.id)
      return
    }
    
    // 检查节点是否已被移除
    if (node.removed || node.isRemoved?.()) {
      console.warn('⚠️ [统一预览线管理器] 节点已被移除，跳过位置更新:', node.id)
      return
    }
    
    // 检查节点是否应该有预览线
    if (!this.shouldCreatePreviewLine(node)) {
      return
    }

    // 🔧 新增：如果布局引擎未就绪，添加到待处理队列
    if (!this.layoutEngineReady) {
      const added = this.addToPendingCalculations(node.id, node, 'update')
      if (added) {
        console.log('📋 [统一预览线管理器] 预览线更新任务已加入待处理队列:', node.id)
        return
      }
    }

    // 🔧 修复：在更新位置前先清理旧的预览线实例，避免重复预览线
    const existingInstance = this.previewLines.get(node.id)
    if (existingInstance) {
      console.log('🧹 [预览线位置更新] 清理旧预览线实例，避免重复:', node.id)
      
      // 临时保存预览线状态信息
      const preservedState = this.preservePreviewLineState(existingInstance)
      
      // 清理旧的预览线实例
      this.removePreviewLine(node.id)
      
      // 短暂延迟后重新创建预览线，确保清理完成
      setTimeout(() => {
        this.createPreviewLineAfterCleanup(node, preservedState)
      }, 10)
      return
    }

    const previewInstance = this.previewLines.get(node.id)
    if (!previewInstance) {
      // 如果没有预览线实例，创建新的
      console.log('ℹ️ [预览线位置更新] 未找到预览线实例，创建新的:', node.id)
      this.createUnifiedPreviewLine(node)
      return
    }

    // 🔧 新增：使用增强版预览线位置更新方法
    try {
      this.updatePreviewLinePositionEnhanced(node)
      return
    } catch (error) {
      console.warn('⚠️ [预览线位置更新] 增强版更新失败，回退到原有方法:', error)
      // 继续执行原有逻辑作为回退方案
    }

    // 检查预览线状态，如果是隐藏状态则跳过更新
    if (Array.isArray(previewInstance)) {
      // 分支预览线 - 检查是否所有分支都被隐藏
      const allHidden = previewInstance.every(instance => instance.state === UnifiedPreviewStates.HIDDEN)
      if (allHidden) {
        return
      }
    } else {
      // 单一预览线 - 检查是否被隐藏
      if (previewInstance.state === UnifiedPreviewStates.HIDDEN) {
        return
      }
    }
    
    if (Array.isArray(previewInstance)) {
      // 分支预览线 - 只更新未隐藏的分支
      const branches = this.getNodeBranches(node)
      previewInstance.forEach((instance, index) => {
        // 跳过已隐藏的分支预览线
        if (instance.state === UnifiedPreviewStates.HIDDEN) {
          return
        }

        // 计算新的终点位置
        const newEndPosition = this.calculateBranchPreviewPosition(node, branches, index)
        
        // 强制刷新端口位置，确保X6正确计算端口坐标
        if (typeof node.updatePorts === 'function') {
          node.updatePorts()
        }
        
        // 强制重新设置out端口位置属性，确保坐标正确
        try {
          const outPort = node.getPort('out')
          if (outPort) {
            node.setPortProp('out', 'position/args/dx', 0)
            node.setPortProp('out', 'position/args/dy', 0)
          }
        } catch (error) {
          console.warn('⚠️ [预览线位置更新] 端口位置刷新失败:', error)
        }
        
        // 🔧 使用X6规范的方式更新分支预览线位置
        // 保持源端口连接，确保节点移动时预览线跟随
        try {
          if (node && node.id) {
            instance.line.setSource({
              cell: node.id,
              port: 'out'
            })
          }
        } catch (error) {
          console.error('❌ [坐标修正] 分支预览线setSource操作失败:', error, { nodeId: node?.id })
        }
        
        // 🔧 关键修复：强制刷新预览线的源端口连接
        // 确保预览线起始点正确跟随节点的out端口
        const sourcePortPosition = node.getPortProp('out', 'position')
        if (sourcePortPosition) {
          // 使用端口的相对位置，让X6自动计算绝对位置
          instance.line.prop('source', {
            cell: node.id,
            port: 'out'
          })
        }
        
        // 使用setVertices方法设置路径点，而不是直接设置target
        // 这样可以让X6的路由器正确计算路径
        // 修复：使用正确的X6 API获取端口位置
        let sourcePosition
        try {
          // 尝试使用X6的getPortProp方法获取端口位置
          const portProp = node.getPortProp('out', 'position')
          if (portProp) {
            const nodePosition = node.getPosition()
            const nodeSize = node.getSize()
            sourcePosition = {
              x: nodePosition.x + (portProp.x || nodeSize.width / 2),
              y: nodePosition.y + (portProp.y || nodeSize.height)
            }
          } else {
            // 如果端口属性不存在，使用节点底部中心作为默认位置
            const nodePosition = node.getPosition()
            const nodeSize = node.getSize()
            sourcePosition = {
              x: nodePosition.x + nodeSize.width / 2,
              y: nodePosition.y + nodeSize.height
            }
          }
        } catch (error) {
          console.warn('⚠️ [预览线位置更新] 获取端口位置失败，使用默认位置:', error)
          // 使用节点底部中心作为默认位置
          const nodePosition = node.getPosition()
          const nodeSize = node.getSize()
          sourcePosition = {
            x: nodePosition.x + nodeSize.width / 2,
            y: nodePosition.y + nodeSize.height
          }
        }
        const vertices = []
        
        // 对于分支预览线，可以添加中间路径点来实现分支效果
        // 例如：vertices.push({ x: sourcePosition.x + (index * 50), y: newEndPosition.y })
        
        // 设置路径点（不包括起点和终点）
        instance.line.setVertices(vertices)
        
        // 🔧 坐标验证：确保newEndPosition坐标有效
        const validEndPosition = {
          x: (typeof newEndPosition.x === 'number' && !isNaN(newEndPosition.x) && isFinite(newEndPosition.x)) ? newEndPosition.x : 300,
          y: (typeof newEndPosition.y === 'number' && !isNaN(newEndPosition.y) && isFinite(newEndPosition.y)) ? newEndPosition.y : 150
        }
        
        // 设置终点位置
        try {
          instance.line.setTarget(validEndPosition)
        } catch (error) {
          console.error('❌ [坐标修正] 分支预览线setTarget操作失败:', error, { validEndPosition })
        }
        
        // 使用安全的路由器设置方法
        this.setSafeRouter(instance.line, {
          args: {
            step: 10,
            padding: 15,
            excludeEnds: ['source', 'target'],
            startDirections: ['bottom'],
            endDirections: ['top']
          }
        })
        instance.endPosition = newEndPosition

        // 记录更新后的连接属性
        const afterProps = instance.line.prop()
        
        // 更新预览线终点标记位置
        this.updateEndpointMarker(instance.line, newEndPosition)
      })
    } else {
      // 单一预览线
      // 计算新的终点位置
      const nodePosition = node.getPosition()
      const nodeSize = node.getSize()
      
      const newEndPosition = this.calculateSinglePreviewPosition(node, nodePosition, nodeSize)
      
      // 强制刷新端口位置，确保X6正确计算端口坐标
      if (typeof node.updatePorts === 'function') {
        node.updatePorts()
      }
      
      // 强制重新设置out端口位置属性，确保坐标正确
      try {
        const outPort = node.getPort('out')
        if (outPort) {
          node.setPortProp('out', 'position/args/dx', 0)
          node.setPortProp('out', 'position/args/dy', 0)
        }
      } catch (error) {
        console.warn('⚠️ [预览线位置更新] 端口位置刷新失败:', error)
      }
      
      // 🔧 使用X6规范的方式更新预览线位置
      // 保持源端口连接，确保节点移动时预览线跟随
      try {
        if (node && node.id) {
          previewInstance.line.setSource({
            cell: node.id,
            port: 'out'
          })
        }
      } catch (error) {
        console.error('❌ [坐标修正] 单一预览线setSource操作失败:', error, { nodeId: node?.id })
      }
      
      // 🔧 关键修复：强制刷新预览线的源端口连接
      // 确保预览线起始点正确跟随节点的out端口
      const sourcePortPosition = node.getPortProp('out', 'position')
      if (sourcePortPosition) {
        // 使用端口的相对位置，让X6自动计算绝对位置
        previewInstance.line.prop('source', {
          cell: node.id,
          port: 'out'
        })
      }
      
      // 使用setVertices方法设置路径点，而不是直接设置target
      // 这样可以让X6的路由器正确计算路径
      // 修复：使用正确的X6 API获取端口位置
      let sourcePosition
      try {
        // 尝试使用X6的getPortProp方法获取端口位置
        const portProp = node.getPortProp('out', 'position')
        if (portProp) {
          const nodePosition = node.getPosition()
          const nodeSize = node.getSize()
          sourcePosition = {
            x: nodePosition.x + (portProp.x || nodeSize.width / 2),
            y: nodePosition.y + (portProp.y || nodeSize.height)
          }
        } else {
          // 如果端口属性不存在，使用节点底部中心作为默认位置
          const nodePosition = node.getPosition()
          const nodeSize = node.getSize()
          sourcePosition = {
            x: nodePosition.x + nodeSize.width / 2,
            y: nodePosition.y + nodeSize.height
          }
        }
      } catch (error) {
        console.warn('⚠️ [预览线位置更新] 获取端口位置失败，使用默认位置:', error)
        // 使用节点底部中心作为默认位置
        const nodePosition = node.getPosition()
        const nodeSize = node.getSize()
        sourcePosition = {
          x: nodePosition.x + nodeSize.width / 2,
          y: nodePosition.y + nodeSize.height
        }
      }
      const vertices = []
      
      // 如果需要中间路径点，可以在这里添加
      // 例如：vertices.push({ x: sourcePosition.x, y: newEndPosition.y })
      
      // 设置路径点（不包括起点和终点）
      previewInstance.line.setVertices(vertices)
      
      // 🔧 坐标验证：确保newEndPosition坐标有效
      const validEndPosition = {
        x: (typeof newEndPosition.x === 'number' && !isNaN(newEndPosition.x) && isFinite(newEndPosition.x)) ? newEndPosition.x : 300,
        y: (typeof newEndPosition.y === 'number' && !isNaN(newEndPosition.y) && isFinite(newEndPosition.y)) ? newEndPosition.y : 150
      }
      
      // 设置终点位置
      try {
        previewInstance.line.setTarget(validEndPosition)
      } catch (error) {
        console.error('❌ [坐标修正] 单一预览线setTarget操作失败:', error, { validEndPosition })
      }
      
      // 使用安全的路由器设置方法
      this.setSafeRouter(previewInstance.line, {
        args: {
          step: 10,
          padding: 15,
          excludeEnds: ['source', 'target'],
          startDirections: ['bottom'],
          endDirections: ['top']
        }
      })
      previewInstance.endPosition = newEndPosition

      // 记录更新后的连接属性
      const afterProps = previewInstance.line.prop()
      
      // 更新预览线终点标记位置
      this.updateEndpointMarker(previewInstance.line, newEndPosition)
    }
  }

  /**
   * 设置预览线终点拖拽功能
   * @param {Object} line - 预览线实例
   */
  setupPreviewLineEndpointDrag(line) {
    if (!line) {
      return
    }
    
    try {
      // 设置预览线的拖拽样式
      line.attr('line/cursor', 'grab')
      
      // 注意：预览线的鼠标事件现在通过X6的标准事件系统处理
      // 在setupEventListeners方法中已经绑定了edge:mousedown等事件
    } catch (error) {
      console.error('❌ [预览线终点拖拽] 设置拖拽功能失败:', error)
    }
  }

  /**
   * 开始预览线终点拖拽
   * @param {Object} line - 预览线实例
   * @param {Event} event - 鼠标事件
   */
  startPreviewLineEndpointDrag(line, event) {
    // 设置当前拖拽状态
    this.currentDragLine = { line }
    this.isDragging = true
    
    // 高亮预览线
    const previewInstance = this.endpointDragInstances?.get(line.id)
    if (previewInstance) {
      this.highlightPreviewLineEndpoint(previewInstance, true)
    }
    line.attr('line/cursor', 'grabbing')
  }

  /**
   * 添加终点标记
   * @param {Object} line - 预览线实例
   * @param {Object} position - 终点位置
   */
  addEndpointMarker(line, position) {
    if (!line || !position) return
    
    try {
      // 添加终点标记的可视化逻辑
      // 例如在终点位置添加一个小圆点或其他标记
      
      // 查找对应的预览线实例
      const previewInstance = this.findPreviewInstanceByLine(line)
      if (previewInstance) {
        // 如果已有终点标记，先移除
        if (previewInstance.endpointMarker) {
          this.removeEndpointMarker(previewInstance)
        }
        
        // 创建新的终点标记（可选实现）
        // previewInstance.endpointMarker = this.createEndpointMarkerElement(position)
        
        console.log('✅ [统一预览线管理器] 终点标记已添加:', line.id)
      }
    } catch (error) {
      console.error('❌ [统一预览线管理器] 添加终点标记失败:', error)
    }
  }

  /**
   * 根据线条查找预览线实例
   * @param {Object} line - 线条对象
   * @returns {Object|null} 预览线实例
   */
  findPreviewInstanceByLine(line) {
    if (!line) return null
    
    for (const [nodeId, instance] of this.previewLines) {
      if (Array.isArray(instance)) {
        const found = instance.find(inst => inst.line && inst.line.id === line.id)
        if (found) return found
      } else if (instance.line && instance.line.id === line.id) {
        return instance
      }
    }
    return null
  }

  /**
   * 移除预览线终点拖拽功能
   * @param {Object} line - 预览线实例
   */
  removePreviewLineEndpointDrag(line) {
    if (!line) {
      return
    }
    
    try {
      // 移除预览线终点的高亮效果
      const previewInstance = this.endpointDragInstances?.get(line.id)
      if (previewInstance) {
        this.highlightPreviewLineEndpoint(previewInstance, false)
      }
    } catch (error) {
      console.error('❌ [预览线终点拖拽] 移除拖拽功能失败:', error)
    }
  }

  /**
   * 移除终点标记
   * @param {Object} previewInstance - 预览线实例
   */
  removeEndpointMarker(previewInstance) {
    if (!previewInstance || !previewInstance.line) return
    
    try {
      // 移除终点标记的可视化逻辑
      // 例如移除终点位置的小圆点或其他标记
      const line = previewInstance.line
      
      // 如果有存储的终点标记元素，移除它们
      if (previewInstance.endpointMarker) {
        if (this.graph && this.graph.hasCell(previewInstance.endpointMarker.id)) {
          this.graph.removeCell(previewInstance.endpointMarker)
        }
        delete previewInstance.endpointMarker
      }
      
      console.log('🗑️ [统一预览线管理器] 终点标记已移除:', line.id)
    } catch (error) {
      console.error('❌ [统一预览线管理器] 移除终点标记失败:', error)
    }
  }

  /**
   * 更新预览线终点标记位置
   * @param {Object} line - 预览线对象
   * @param {Object} position - 新的终点位置
   */
  updateEndpointMarker(line, position) {
    if (!line || !position) return
    
    // 更新预览线终点的可视化标记
    this.addEndpointMarker(line, position)
  }

  /**
   * 增强版预览线位置更新方法
   * 综合考虑源节点分支和连接线位置
   * @param {Object} node - 源节点
   */
  updatePreviewLinePositionEnhanced(node) {
    console.log('🔧 [增强预览线更新] 开始综合分析和更新:', node.id)
    
    // 检查节点是否应该有预览线
    if (!this.shouldCreatePreviewLine(node)) {
      return
    }

    const previewInstance = this.previewLines.get(node.id)
    if (!previewInstance) {
      return
    }

    // 综合分析源节点分支和连接线状态
    const branchAnalysis = this.analyzeSourceNodeBranches(node)
    const connectionAnalysis = this.analyzeExistingConnections(node)
    
    console.log('🔍 [增强预览线更新] 分析结果:', {
      nodeId: node.id,
      branches: branchAnalysis,
      connections: connectionAnalysis
    })

    // 根据分析结果更新预览线位置
    if (Array.isArray(previewInstance)) {
      this.updateBranchPreviewLinesEnhanced(node, previewInstance, branchAnalysis, connectionAnalysis)
    } else {
      this.updateSinglePreviewLineEnhanced(node, previewInstance, branchAnalysis, connectionAnalysis)
    }
  }

  /**
   * 更新分支预览线（增强版）
   * @param {Object} node - 源节点
   * @param {Array} previewInstances - 预览线实例数组
   * @param {Object} branchAnalysis - 分支分析结果
   * @param {Object} connectionAnalysis - 连接分析结果
   */
  updateBranchPreviewLinesEnhanced(node, previewInstances, branchAnalysis, connectionAnalysis) {
    const branches = this.getNodeBranches(node)
    
    previewInstances.forEach((instance, index) => {
      // 跳过已隐藏的分支预览线
      if (instance.state === UnifiedPreviewStates.HIDDEN) {
        return
      }

      // 获取对应的分支信息
      const branchInfo = branchAnalysis.activeBranches && branchAnalysis.activeBranches[index]
      let newEndPosition

      if (branchInfo && !branchInfo.isConnected) {
        // 使用分析得出的优化位置
        newEndPosition = branchInfo.position
        
        // 检查是否与现有连接线位置冲突
        const hasConflict = connectionAnalysis.connectionPositions && 
          connectionAnalysis.connectionPositions.some(conn => {
            if (!conn.targetPosition) return false
            const distance = Math.sqrt(
              Math.pow(conn.targetPosition.x - newEndPosition.x, 2) + 
              Math.pow(conn.targetPosition.y - newEndPosition.y, 2)
            )
            return distance < 80
          })
        
        // 如果有冲突，调整位置
        if (hasConflict) {
          const offsetX = (index % 2 === 0 ? 1 : -1) * 50
          newEndPosition = {
            x: newEndPosition.x + offsetX,
            y: newEndPosition.y + 20
          }
        }
      } else {
        // 使用原有计算方式
        newEndPosition = this.calculateBranchPreviewPosition(node, branches, index)
      }

      // 更新预览线位置
      this.updatePreviewLineInstance(instance, node, newEndPosition)
    })
  }

  /**
   * 更新单一预览线（增强版）
   * @param {Object} node - 源节点
   * @param {Object} previewInstance - 预览线实例
   * @param {Object} branchAnalysis - 分支分析结果
   * @param {Object} connectionAnalysis - 连接分析结果
   */
  updateSinglePreviewLineEnhanced(node, previewInstance, branchAnalysis, connectionAnalysis) {
    // 跳过已隐藏的预览线
    if (previewInstance.state === UnifiedPreviewStates.HIDDEN) {
      return
    }

    // 计算优化的终点位置
    const nodePosition = node.getPosition()
    const nodeSize = node.getSize()
    let newEndPosition = this.calculateSinglePreviewPosition(node, nodePosition, nodeSize)

    // 检查是否与现有连接线位置冲突
    const hasConflict = connectionAnalysis.connectionPositions && 
      connectionAnalysis.connectionPositions.some(conn => {
        if (!conn.targetPosition) return false
        const distance = Math.sqrt(
          Math.pow(conn.targetPosition.x - newEndPosition.x, 2) + 
          Math.pow(conn.targetPosition.y - newEndPosition.y, 2)
        )
        return distance < 80
      })
    
    // 如果有冲突，调整位置
    if (hasConflict) {
      newEndPosition = {
        x: newEndPosition.x + 60,
        y: newEndPosition.y + 20
      }
    }

    // 更新预览线位置
    this.updatePreviewLineInstance(previewInstance, node, newEndPosition)
  }

  /**
   * 更新预览线实例的位置
   * @param {Object} instance - 预览线实例
   * @param {Object} node - 源节点
   * @param {Object} newEndPosition - 新的终点位置
   */
  updatePreviewLineInstance(instance, node, newEndPosition) {
    try {
      // 强制刷新端口位置
      if (typeof node.updatePorts === 'function') {
        node.updatePorts()
      }
      
      // 设置源端口连接
      instance.line.setSource({
        cell: node.id,
        port: 'out'
      })
      
      // 设置终点位置
      instance.line.setTarget(newEndPosition)
      
      // 设置路由器
      this.setSafeRouter(instance.line, {
        args: {
          step: 10,
          padding: 15,
          excludeEnds: ['source', 'target'],
          startDirections: ['bottom'],
          endDirections: ['top']
        }
      })
      
      // 更新实例的终点位置记录
      instance.endPosition = newEndPosition
      
      // 更新终点标记
      this.updateEndpointMarker(instance.line, newEndPosition)
      
      console.log('✅ [预览线实例更新] 位置更新成功:', {
        lineId: instance.line.id,
        newPosition: newEndPosition
      })
    } catch (error) {
      console.error('❌ [预览线实例更新] 更新失败:', error)
    }
  }

  /**
   * 分析源节点的分支状态
   * @param {Object} node - 源节点
   * @returns {Object} 分支分析结果
   */
  analyzeSourceNodeBranches(node) {
    try {
      const branches = this.getNodeBranches(node)
      const analysis = {
         totalBranches: branches.length,
         activeBranches: [],
         connectedBranches: [],
         availableBranches: [],
         branchPositions: new Map()
       }

      branches.forEach((branch, index) => {
        const branchInfo = {
          id: branch.id || `branch_${index}`,
          label: branch.label,
          condition: branch.condition,
          isConnected: this.isBranchConnected(node, branch),
          position: this.calculateBranchPosition(node, branch, index)
        }

        analysis.activeBranches.push(branchInfo)
        analysis.branchPositions.set(branchInfo.id, branchInfo.position)

        if (branchInfo.isConnected) {
          analysis.connectedBranches.push(branchInfo)
        } else {
          analysis.availableBranches.push(branchInfo)
        }
      })

      return analysis
    } catch (error) {
      console.warn('⚠️ [分支分析] 分析源节点分支失败:', error)
      return {
        totalBranches: 0,
        activeBranches: [],
        connectedBranches: [],
        availableBranches: [],
        branchPositions: new Map()
      }
    }
  }

  /**
   * 分析现有连接线状态
   * @param {Object} node - 源节点
   * @returns {Object} 连接线分析结果
   */
  analyzeExistingConnections(node) {
    try {
      const connections = this.graph.getConnectedEdges(node, { outgoing: true })
      const analysis = {
        totalConnections: connections.length,
        connectionsByBranch: new Map(),
        connectionPositions: [],
        occupiedPorts: new Set()
      }

      connections.forEach(edge => {
        const sourcePort = edge.getSourcePortId()
        const targetNode = edge.getTargetNode()
        const targetPosition = targetNode ? targetNode.getPosition() : null

        if (sourcePort) {
          analysis.occupiedPorts.add(sourcePort)
        }

        if (targetPosition) {
          analysis.connectionPositions.push({
            edgeId: edge.id,
            sourcePort,
            targetPosition,
            targetNodeId: targetNode?.id
          })
        }

        // 尝试识别连接对应的分支
        const branchId = this.identifyConnectionBranch(node, edge)
        if (branchId) {
          if (!analysis.connectionsByBranch.has(branchId)) {
            analysis.connectionsByBranch.set(branchId, [])
          }
          analysis.connectionsByBranch.get(branchId).push({
            edgeId: edge.id,
            targetNodeId: targetNode?.id,
            targetPosition
          })
        }
      })

      return analysis
    } catch (error) {
      console.warn('⚠️ [连接分析] 分析现有连接线失败:', error)
      return {
        totalConnections: 0,
        connectionsByBranch: new Map(),
        connectionPositions: [],
        occupiedPorts: new Set()
      }
    }
  }

  /**
   * 检查分支是否已连接
   * @param {Object} node - 源节点
   * @param {Object} branch - 分支信息
   * @returns {boolean} 是否已连接
   */
  isBranchConnected(node, branch) {
    try {
      const connections = this.graph.getConnectedEdges(node, { outgoing: true })
      return connections.some(edge => {
        const branchId = this.identifyConnectionBranch(node, edge)
        return branchId === branch.id || branchId === branch.label
      })
    } catch (error) {
      console.warn('⚠️ [分支检查] 检查分支连接状态失败:', error)
      return false
    }
  }

  /**
   * 计算分支位置
   * @param {Object} node - 源节点
   * @param {Object} branch - 分支信息
   * @param {number} index - 分支索引
   * @returns {Object} 分支位置
   */
  calculateBranchPosition(node, branch, index) {
    try {
      const nodePosition = node.getPosition()
      const nodeSize = node.getSize()
      
      // 基础位置：节点底部中心
      const baseX = nodePosition.x + nodeSize.width / 2
      const baseY = nodePosition.y + nodeSize.height
      
      // 根据分支索引计算偏移
      const branchOffset = (index - Math.floor(index / 2)) * 60
      
      return {
        x: baseX + branchOffset,
        y: baseY + 100 // 预览线默认长度
      }
    } catch (error) {
      console.warn('⚠️ [位置计算] 计算分支位置失败:', error)
      return { x: 0, y: 0 }
    }
  }

  /**
   * 识别连接对应的分支
   * @param {Object} node - 源节点
   * @param {Object} edge - 连接边
   * @returns {string|null} 分支ID
   */
  identifyConnectionBranch(node, edge) {
    try {
      // 尝试从边的属性中获取分支信息
      const branchInfo = edge.getData()?.branch || edge.prop('branch')
      if (branchInfo) {
        return branchInfo.id || branchInfo.label || branchInfo
      }

      // 尝试从源端口信息推断分支
      const sourcePort = edge.getSourcePortId()
      if (sourcePort && sourcePort !== 'out') {
        return sourcePort
      }

      // 如果无法确定，返回null
      return null
    } catch (error) {
      console.warn('⚠️ [分支识别] 识别连接分支失败:', error)
      return null
    }
  }

  /**
   * 移除预览线
   */
  removePreviewLine(nodeId) {
    const previewInstance = this.previewLines.get(nodeId)
    if (!previewInstance) return
    
    // 清理相关的手工调整记录
    const removedHints = []
    
    if (Array.isArray(previewInstance)) {
      // 分支预览线
      previewInstance.forEach(instance => {
        this.removePreviewLineEndpointDrag(instance)
        this.graph.removeEdge(instance.line)
        
        // 清理对应的手工调整记录
        const hintId = `hint_${instance.line.id}`
        if (this.manuallyAdjustedHints.has(hintId)) {
          this.manuallyAdjustedHints.delete(hintId)
          removedHints.push(hintId)
        }
      })
    } else {
      // 单一预览线
      this.removePreviewLineEndpointDrag(previewInstance)
      this.graph.removeEdge(previewInstance.line)
      
      // 清理对应的手工调整记录
      const hintId = `hint_${previewInstance.line.id}`
      if (this.manuallyAdjustedHints.has(hintId)) {
        this.manuallyAdjustedHints.delete(hintId)
        removedHints.push(hintId)
      }
    }
    
    this.previewLines.delete(nodeId)
    this.nodeStates.delete(nodeId)
  }

  /**
   * 移除特定分支的预览线
   * @param {string} nodeId - 节点ID
   * @param {string} branchId - 分支ID
   */
  removeSpecificBranchPreviewLine(nodeId, branchId) {
    const previewInstance = this.previewLines.get(nodeId)
    if (!previewInstance) {
      return
    }
    
    const removedHints = []
    
    if (Array.isArray(previewInstance)) {
      // 分支预览线：找到并删除特定分支
      const targetIndex = previewInstance.findIndex(instance => instance.branchId === branchId)
      
      if (targetIndex !== -1) {
        const targetInstance = previewInstance[targetIndex]
        
        // 移除预览线终点拖拽功能和预览线
        this.removePreviewLineEndpointDrag(targetInstance)
        this.graph.removeEdge(targetInstance.line)
        
        // 清理对应的手工调整记录
        const hintId = `hint_${targetInstance.line.id}`
        if (this.manuallyAdjustedHints.has(hintId)) {
          this.manuallyAdjustedHints.delete(hintId)
          removedHints.push(hintId)
        }
        
        // 从数组中移除该分支
        previewInstance.splice(targetIndex, 1)
        
        // 如果没有剩余分支，清理整个预览线实例
        if (previewInstance.length === 0) {
          this.previewLines.delete(nodeId)
          this.nodeStates.delete(nodeId)
        }
      }
    } else {
      // 单一预览线：如果指定了分支ID但实际是单一预览线，则删除整个预览线
      this.removePreviewLineEndpointDrag(previewInstance)
      this.graph.removeEdge(previewInstance.line)
      
      // 清理对应的手工调整记录
      const hintId = `hint_${previewInstance.line.id}`
      if (this.manuallyAdjustedHints.has(hintId)) {
        this.manuallyAdjustedHints.delete(hintId)
        removedHints.push(hintId)
      }
      
      this.previewLines.delete(nodeId)
      this.nodeStates.delete(nodeId)
    }
  }

  /**
   * 更新拖拽位置
   */
  updateDragPosition(e) {
    if (!this.currentDragLine) {
      return
    }
    
    const { line, sourceNode, branchId } = this.currentDragLine
    
    // 🔧 修复：验证事件对象和必要属性
    if (!e || typeof e.clientX !== 'number' || typeof e.clientY !== 'number') {
      console.warn('⚠️ [UnifiedPreviewLineManager] 无效的鼠标事件对象');
      return;
    }
    
    const rect = this.graph.container.getBoundingClientRect()
    const domX = e.clientX - rect.left
    const domY = e.clientY - rect.top
    
    // 🔧 修复坐标系转换问题：将DOM坐标转换为逻辑坐标
    let logicalCoords = { x: domX, y: domY }
    if (this.coordinateManager) {
      try {
        logicalCoords = this.coordinateManager.DOMToLogical(domX, domY)
      } catch (error) {
        console.warn('⚠️ [UnifiedPreviewLineManager] 坐标转换失败，使用DOM坐标:', error);
      }
    }
    
    let { x, y } = logicalCoords
    
    // 🔧 修复NaN坐标问题：验证并处理无效坐标
    if (typeof x !== 'number' || isNaN(x) || !isFinite(x)) {
      console.warn(`⚠️ [UnifiedPreviewLineManager] X坐标无效 (${x})，使用默认值 200`);
      x = 200; // 默认X坐标
    }
    
    if (typeof y !== 'number' || isNaN(y) || !isFinite(y)) {
      console.warn(`⚠️ [UnifiedPreviewLineManager] Y坐标无效 (${y})，使用默认值 100`);
      y = 100; // 默认Y坐标
    }
    
    // 🔧 修复：验证源节点坐标
    try {
      const sourcePosition = sourceNode.getPosition()
      if (!sourcePosition || isNaN(sourcePosition.x) || isNaN(sourcePosition.y) || 
          !isFinite(sourcePosition.x) || !isFinite(sourcePosition.y)) {
        console.warn('⚠️ [UnifiedPreviewLineManager] 源节点坐标无效，重置坐标:', {
          sourceNodeId: sourceNode.id,
          invalidPosition: sourcePosition
        });
        sourceNode.setPosition(200, 100);
      }
    } catch (error) {
      console.warn('⚠️ [UnifiedPreviewLineManager] 验证源节点坐标失败:', error);
    }
    
    // 🔧 修复：安全设置source，确保预览线始终从源节点的out端口开始
    try {
      line.setSource({
        cell: sourceNode.id,
        port: 'out',  // 始终使用out端口，不使用branchId作为端口
        connectionPoint: {
          name: 'boundary',
          args: {
            sticky: true
          }
        }
      })
    } catch (error) {
      console.error('❌ [UnifiedPreviewLineManager] 设置source失败:', error);
      return;
    }
    
    // 🔧 修复：安全设置target，使用验证后的逻辑坐标
    try {
      line.setTarget({
        x: x,
        y: y,
        connectionPoint: {
          name: 'boundary',
          args: {
            sticky: true
          }
        }
      })
    } catch (error) {
      console.error('❌ [UnifiedPreviewLineManager] 设置target失败:', error);
      return;
    }
    
    // 🔧 使用X6规范的方式更新拖拽位置
    try {
      // 使用setVertices方法设置路径点，而不是直接设置target
      const vertices = []
      line.setVertices(vertices)
      
      // 确保使用正确的路由器 - 拖拽时优先使用稳定的orth路由器
      line.setRouter({
        name: 'orth',
        args: {
          padding: 15,
          step: 10,
          ...this.getDynamicDirectionConfig()
        }
      })
      
      // 设置连接器配置
      line.setConnector({
        name: 'rounded',
        args: {
          radius: 6
        }
      })
    } catch (error) {
      console.error('❌ [UnifiedPreviewLineManager] 设置路径配置失败:', error);
    }
    
    // 更新预览线终点的高亮效果
    try {
      const previewInstance = this.endpointDragInstances?.get(line.id)
      if (previewInstance) {
        this.highlightPreviewLineEndpoint(previewInstance, true)
      }
    } catch (error) {
      console.warn('⚠️ [UnifiedPreviewLineManager] 更新终点高亮失败:', error);
    }
    
    // 检测附近的节点并高亮显示（使用逻辑坐标）
    try {
      this.highlightNearbyNodes(x, y)
    } catch (error) {
      console.warn('⚠️ [UnifiedPreviewLineManager] 高亮附近节点失败:', error);
    }
  }

  /**
   * 高亮附近的节点
   */
  highlightNearbyNodes(x, y) {
    const tolerance = 80 // 检测范围
    const nodes = this.graph.getNodes()
    
    // 清除之前的高亮
    this.clearNodeHighlights()
    
    // 如果当前拖拽的是分支预览线，需要智能选择最近的分流端口
    if (this.currentDragLine && this.currentDragLine.type === PreviewLineTypes.BRANCH) {
      this.highlightNearestBranchPort(x, y, tolerance)
      return
    }
    
    for (const node of nodes) {
      const nodeData = node.getData() || {}
      
      // 跳过拖拽提示点和预览相关节点
      if (nodeData.isEndpoint || nodeData.type === 'endpoint' || 
          nodeData.isUnifiedPreview || nodeData.isPersistentPreview) {
        continue
      }
      
      // 跳过源节点
      if (this.currentDragLine && node.id === this.currentDragLine.sourceNode.id) {
        continue
      }
      
      const nodePosition = node.getPosition()
      const nodeSize = node.getSize()
      
      // 🔧 使用坐标管理器验证和修正节点坐标
      let nodeCenterX = nodePosition.x + nodeSize.width / 2
      let nodeCenterY = nodePosition.y + nodeSize.height / 2
      
      if (this.coordinateManager) {
        const coordinateValidation = this.coordinateManager.validateCoordinateTransform(node)
        if (coordinateValidation && coordinateValidation.difference) {
          nodeCenterX -= coordinateValidation.difference.x
          nodeCenterY -= coordinateValidation.difference.y
          
          // 已禁用坐标修正日志以减少控制台冗余信息
          // console.log('🔍 [吸附坐标修正] 检测到节点坐标偏差:', {
          //   nodeId: node.id,
          //   originalCenter: { x: nodePosition.x + nodeSize.width / 2, y: nodePosition.y + nodeSize.height / 2 },
          //   correctedCenter: { x: nodeCenterX, y: nodeCenterY },
          //   coordinateValidation
          // })
        }
      }
      
      // 检查是否在检测范围内（使用修正后的坐标）
      const distance = Math.sqrt(
        Math.pow(x - nodeCenterX, 2) +
        Math.pow(y - nodeCenterY, 2)
      )
      
      if (distance <= tolerance) {
        // 高亮节点
        this.highlightNode(node)
        
        console.log('🎯 [节点吸附] 高亮附近节点:', {
          nodeId: node.id,
          nodeType: nodeData.type,
          distance: distance.toFixed(2),
          tolerance,
          dragPosition: { x, y },
          nodeCenter: { x: nodeCenterX, y: nodeCenterY }
        })
      }
    }
  }

  /**
   * 为分支预览线高亮最近的分流端口
   */
  highlightNearestBranchPort(x, y, tolerance) {
    const nodes = this.graph.getNodes()
    let nearestNode = null
    let nearestDistance = Infinity
    
    for (const node of nodes) {
      const nodeData = node.getData() || {}
      
      // 跳过拖拽提示点和预览相关节点
      if (nodeData.isEndpoint || nodeData.type === 'endpoint' || 
          nodeData.isUnifiedPreview || nodeData.isPersistentPreview) {
        continue
      }
      
      // 跳过源节点
      if (this.currentDragLine && node.id === this.currentDragLine.sourceNode.id) {
        continue
      }
      
      const nodePosition = node.getPosition()
      const nodeSize = node.getSize()
      
      // 🔧 使用坐标管理器验证和修正节点坐标
      let nodeCenterX = nodePosition.x + nodeSize.width / 2
      let nodeCenterY = nodePosition.y + nodeSize.height / 2
      
      if (this.coordinateManager) {
        const coordinateValidation = this.coordinateManager.validateCoordinateTransform(node)
        if (coordinateValidation && coordinateValidation.difference) {
          nodeCenterX -= coordinateValidation.difference.x
          nodeCenterY -= coordinateValidation.difference.y
          
          // 已禁用分支吸附坐标修正日志以减少控制台冗余信息
          // console.log('🔍 [分支吸附坐标修正] 检测到节点坐标偏差:', {
          //   nodeId: node.id,
          //   originalCenter: { x: nodePosition.x + nodeSize.width / 2, y: nodePosition.y + nodeSize.height / 2 },
          //   correctedCenter: { x: nodeCenterX, y: nodeCenterY },
          //   coordinateValidation
          // })
        }
      }
      
      // 检查是否在检测范围内（使用修正后的坐标）
      const distance = Math.sqrt(
        Math.pow(x - nodeCenterX, 2) +
        Math.pow(y - nodeCenterY, 2)
      )
      
      if (distance <= tolerance && distance < nearestDistance) {
        nearestDistance = distance
        nearestNode = node
      }
    }
    
    // 高亮最近的节点
    if (nearestNode) {
      this.highlightNode(nearestNode)
      
      // 更新当前拖拽线的目标信息，用于后续连接
      if (this.currentDragLine) {
        this.currentDragLine.nearestTargetNode = nearestNode
        this.currentDragLine.nearestDistance = nearestDistance
        
        console.log('🎯 [统一预览线管理器] 分支预览线找到最近目标:', {
          branchId: this.currentDragLine.branchId,
          targetNodeId: nearestNode.id,
          distance: nearestDistance
        })
      }
    }
  }

  /**
   * 高亮节点
   */
  highlightNode(node) {
    const nodeData = node.getData() || {}
    
    // 保存原始样式
    if (!nodeData.originalAttrs) {
      nodeData.originalAttrs = JSON.parse(JSON.stringify(node.getAttrs()))
    }
    
    // 应用高亮样式
    node.setAttrs({
      body: {
        ...node.getAttrs().body,
        stroke: '#52c41a',
        strokeWidth: 3,
        filter: 'drop-shadow(0 0 10px rgba(82, 196, 26, 0.5))'
      }
    })
    
    // 标记为高亮状态
    nodeData.isHighlighted = true
    node.setData(nodeData)
  }

  /**
   * 清除所有节点高亮
   */
  clearNodeHighlights() {
    const nodes = this.graph.getNodes()
    
    nodes.forEach(node => {
      const nodeData = node.getData() || {}
      
      if (nodeData.isHighlighted && nodeData.originalAttrs) {
        // 恢复原始样式
        node.setAttrs(nodeData.originalAttrs)
        
        // 清除高亮标记
        delete nodeData.isHighlighted
        delete nodeData.originalAttrs
        node.setData(nodeData)
      }
    })
  }

  /**
   * 处理拖拽结束
   */
  handleDragEnd(e) {
    if (!this.currentDragLine) return
    
    const { line, sourceNode, branchId, nearestTargetNode, branchLabel } = this.currentDragLine
    const rect = this.graph.container.getBoundingClientRect()
    const domDropX = e.clientX - rect.left
    const domDropY = e.clientY - rect.top
    
    // 🔧 修复坐标系转换问题：将DOM坐标转换为逻辑坐标
    let logicalDropCoords = { x: domDropX, y: domDropY }
    if (this.coordinateManager) {
      logicalDropCoords = this.coordinateManager.DOMToLogical(domDropX, domDropY)
    }
    
    const dropX = logicalDropCoords.x
    const dropY = logicalDropCoords.y
    
    // 🔍 记录拖拽结束时的初始状态
    const dragEndInfo = {
      dragLine: {
        id: line?.id,
        sourceNodeId: sourceNode?.id,
        branchId: branchId,
        branchLabel: branchLabel
      },
      dropPosition: { x: dropX, y: dropY },
      domDropPosition: { x: domDropX, y: domDropY },
      nearestTargetNode: nearestTargetNode?.id,
      timestamp: new Date().toISOString()
    }
    
    console.log('🎯 [预览线终点拖拽] 拖拽结束处理:', dragEndInfo)
    
    // 优先使用智能选择的最近目标节点
    let targetNode = nearestTargetNode
    
    // 如果没有智能选择的目标，则使用传统的位置检测
    if (!targetNode) {
      targetNode = this.findNodeAtPosition(dropX, dropY)
    }
    
    if (targetNode && targetNode.id !== sourceNode.id) {
      // 找到目标节点，显示吸附完成的标签（如果有分支标签）
      if (branchLabel) {
        this.showSnapCompleteLabel(line, branchLabel, targetNode)
      }
      
      // 创建连接（源节点out → 目标节点in）
      this.createConnection(sourceNode, targetNode, this.currentDragLine)
      
      console.log('✅ [预览线终点拖拽] 连接成功:', {
        source: sourceNode.id,
        target: targetNode.id,
        branchId: branchId
      })
    } else {
      // 没有找到目标节点，检查是否需要创建新节点
      const shouldCreateNode = this.shouldCreateNodeAtPosition(dropX, dropY)
      
      if (shouldCreateNode) {
        this.createNodeAtPosition(dropX, dropY, sourceNode, this.currentDragLine)
        console.log('✅ [预览线终点拖拽] 创建新节点:', { x: dropX, y: dropY })
      } else {
        console.log('❌ [预览线终点拖拽] 拖拽未成功吸附，恢复预览线状态')
      }
    }
    
    this.resetDragState()
  }

  /**
   * 节点删除后恢复相关预览线
   * @param {Object} deletedNode - 被删除的节点
   * @param {Array} incomingEdges - 传入的边数组（可选，用于优化性能）
   */
  restorePreviewLinesAfterNodeDeletion(deletedNode, incomingEdges = null) {
    // 已禁用节点删除后恢复预览线日志以减少控制台冗余信息
    // console.log('🔄 [统一预览线管理器] 开始检查节点删除后的预览线恢复:', {
    //   deletedNodeId: deletedNode.id,
    //   deletedNodeType: deletedNode.getData()?.type,
    //   providedIncomingEdges: !!incomingEdges
    // })
    
    // 获取所有连接到被删除节点的边（如果没有提供则重新获取）
    const edges = incomingEdges || this.graph.getIncomingEdges(deletedNode) || []
    
    // 已禁用边信息日志以减少控制台冗余信息
    // console.log('🔍 [统一预览线管理器] 找到连接到被删除节点的边:', {
    //   deletedNodeId: deletedNode.id,
    //   incomingEdgesCount: edges.length,
    //   edges: edges.map(edge => ({
    //     id: edge.id,
    //     sourceId: edge.getSourceNode()?.id,
    //     targetId: edge.getTargetNode()?.id,
    //     data: edge.getData()
    //   }))
    // })

    // 收集所有需要检查的源节点
    const sourceNodesToCheck = new Set()
    
    // 遍历所有连接到被删除节点的边
    edges.forEach((edge, index) => {
      const sourceNode = edge.getSourceNode()
      if (sourceNode) {
        sourceNodesToCheck.add(sourceNode)
        
        const edgeData = edge.getData() || {}
        const branchId = edgeData.branchId
        
        console.log(`🔄 [统一预览线管理器] 处理第${index + 1}个源节点的预览线恢复:`, {
          sourceNodeId: sourceNode.id,
          sourceNodeType: sourceNode.getData()?.type,
          branchId: branchId,
          edgeData: edgeData
        })
        
        // 检查源节点是否还有其他连接
        const remainingOutgoingEdges = this.graph.getOutgoingEdges(sourceNode) || []
        const realConnections = remainingOutgoingEdges.filter(e => {
          const data = e.getData() || {}
          return !data.isUnifiedPreview && 
                 !data.isPersistentPreview && 
                 !data.isPreview &&
                 data.type !== 'unified-preview-line' &&
                 e.id !== edge.id // 排除即将被删除的边
        })
        
        console.log('🔍 [统一预览线管理器] 源节点剩余连接检查:', {
          sourceNodeId: sourceNode.id,
          totalOutgoingEdges: remainingOutgoingEdges.length,
          realConnections: realConnections.length,
          realConnectionIds: realConnections.map(e => e.id),
          excludedEdgeId: edge.id
        })
        
        // 如果源节点没有其他真实连接，恢复其预览线
        if (realConnections.length === 0) {
          // 检查源节点是否应该有预览线（排除即将被删除的边）
          if (this.shouldCreatePreviewLine(sourceNode, edge.id)) {
            console.log('✅ [统一预览线管理器] 恢复源节点的预览线:', {
              sourceNodeId: sourceNode.id,
              branchId: branchId,
              restoreType: branchId ? 'branch-specific' : 'full-recreate'
            })
            
            // 如果是分支连接，只恢复特定分支的预览线
            if (branchId) {
              // 获取被删除连接的标签信息
              const deletedEdgeData = edgeData || {}
              const branchLabel = deletedEdgeData.branchLabel
              
              console.log('🏷️ [统一预览线管理器] 恢复分支预览线时传递标签信息:', {
                sourceNodeId: sourceNode.id,
                branchId: branchId,
                branchLabel: branchLabel
              })
              
              // 🔧 修复：在恢复分支预览线前验证源节点坐标
              const sourcePosition = sourceNode.getPosition()
              if (!sourcePosition || isNaN(sourcePosition.x) || isNaN(sourcePosition.y) || 
                  !isFinite(sourcePosition.x) || !isFinite(sourcePosition.y)) {
                console.warn('⚠️ [统一预览线管理器] 源节点坐标无效，使用默认坐标:', {
                  sourceNodeId: sourceNode.id,
                  invalidPosition: sourcePosition
                })
                sourceNode.setPosition(200, 100)
              }
              
              this.onNodeDisconnected(sourceNode, branchId, branchLabel)
            } else {
              // 重新创建预览线（获取节点的分支信息以恢复标签）
              const nodeData = sourceNode.getData() || {}
              const nodeConfig = nodeData.config || {}
              
              console.log('🏷️ [统一预览线管理器] 重新创建预览线时恢复标签:', {
                sourceNodeId: sourceNode.id,
                nodeConfig: nodeConfig
              })
              
              // 🔧 修复：在重新创建预览线前验证源节点坐标
              const sourcePosition = sourceNode.getPosition()
              if (!sourcePosition || isNaN(sourcePosition.x) || isNaN(sourcePosition.y) || 
                  !isFinite(sourcePosition.x) || !isFinite(sourcePosition.y)) {
                console.warn('⚠️ [统一预览线管理器] 源节点坐标无效，使用默认坐标:', {
                  sourceNodeId: sourceNode.id,
                  invalidPosition: sourcePosition
                })
                sourceNode.setPosition(200, 100)
              }
              
              this.createUnifiedPreviewLine(sourceNode, UnifiedPreviewStates.INTERACTIVE, {
                preserveLabels: true,
                config: nodeConfig
              })
            }
          } else {
            console.log('⏭️ [统一预览线管理器] 源节点不需要预览线:', {
              sourceNodeId: sourceNode.id,
              reason: '不满足预览线创建条件'
            })
          }
        } else {
          console.log('⏭️ [统一预览线管理器] 源节点仍有其他连接，不恢复预览线:', {
            sourceNodeId: sourceNode.id,
            remainingConnections: realConnections.length,
            connectionDetails: realConnections.map(e => ({
              id: e.id,
              targetId: e.getTargetNode()?.id,
              data: e.getData()
            }))
          })
        }
      } else {
        console.warn('⚠️ [统一预览线管理器] 边的源节点不存在:', {
          edgeId: edge.id,
          edgeData: edge.getData()
        })
      }
    })

    // 对所有受影响的源节点进行完整性检查
    console.log('🔍 [统一预览线管理器] 开始对受影响的源节点进行分支完整性检查')
    sourceNodesToCheck.forEach(sourceNode => {
      this.ensureAllBranchesRestored(sourceNode, true) // 传入isAfterNodeDeletion=true
    })
    
    console.log('🔄 [统一预览线管理器] 节点删除后预览线恢复检查完成:', {
      deletedNodeId: deletedNode.id,
      processedEdges: edges.length,
      checkedSourceNodes: sourceNodesToCheck.size
    })
  }

  /**
   * 确保节点的所有分支都正确恢复
   * @param {Object} node - 需要检查的节点
   * @param {boolean} isAfterNodeDeletion - 是否是节点删除后的恢复过程
   */
  ensureAllBranchesRestored(node, isAfterNodeDeletion = false) {
    if (!this.isBranchNode(node)) {
      console.log('⏭️ [分支完整性检查] 非分支节点，跳过检查:', node.id)
      return
    }

    // 获取节点应该有的分支数
    const expectedBranches = this.getNodeBranches(node)
    const expectedBranchCount = expectedBranches.length
    
    // 获取当前预览线实例
    const previewInstance = this.previewLines.get(node.id)
    
    console.log('🔍 [分支完整性检查] 检查节点分支完整性:', {
      nodeId: node.id,
      expectedBranchCount: expectedBranchCount,
      expectedBranches: expectedBranches.map(b => ({ id: b.id, label: b.label })),
      hasPreviewInstance: !!previewInstance,
      currentInstanceCount: Array.isArray(previewInstance) ? previewInstance.length : 0,
      isAfterNodeDeletion: isAfterNodeDeletion
    })

    if (!previewInstance || !Array.isArray(previewInstance)) {
      // 如果是节点删除后的恢复过程，且节点还有真实连接，则不重新创建预览线
      if (isAfterNodeDeletion) {
        const hasRealConnections = this.nodeHasRealConnections(node)
        if (hasRealConnections) {
          console.log('⏭️ [分支完整性检查] 节点删除后恢复：节点仍有真实连接，跳过预览线重建:', {
            nodeId: node.id,
            hasRealConnections: hasRealConnections
          })
          return
        }
      }
      
      console.log('🔄 [分支完整性检查] 预览线实例不存在或不是数组，重新创建:', node.id)
      this.createUnifiedPreviewLine(node, UnifiedPreviewStates.INTERACTIVE)
      return
    }

    // 检查每个期望的分支是否都有对应的预览线实例
    let missingBranches = []
    let restoredCount = 0

    expectedBranches.forEach((expectedBranch, index) => {
      const existingInstance = previewInstance.find(instance => 
        instance.branchId === expectedBranch.id
      )

      if (!existingInstance) {
        // 如果是节点删除后的恢复过程，检查该分支是否有真实连接
        if (isAfterNodeDeletion) {
          const hasRealConnection = this.checkBranchHasRealConnection(node, expectedBranch.id)
          if (hasRealConnection) {
            console.log('⏭️ [分支完整性检查] 节点删除后恢复：分支有真实连接，跳过重建:', {
              nodeId: node.id,
              branchId: expectedBranch.id,
              branchLabel: expectedBranch.label
            })
            return
          }
        }
        
        missingBranches.push(expectedBranch)
        console.log('❌ [分支完整性检查] 发现缺失的分支:', {
          nodeId: node.id,
          branchId: expectedBranch.id,
          branchLabel: expectedBranch.label,
          branchIndex: index,
          isAfterNodeDeletion: isAfterNodeDeletion
        })
      } else if (existingInstance.state === UnifiedPreviewStates.HIDDEN) {
        // 检查隐藏的分支是否应该恢复
        const hasRealConnection = this.checkBranchHasRealConnection(node, expectedBranch.id)
        if (!hasRealConnection) {
          console.log('🔄 [分支完整性检查] 恢复隐藏的分支:', {
            nodeId: node.id,
            branchId: expectedBranch.id,
            branchLabel: expectedBranch.label
          })
          
          // 恢复隐藏的分支
          existingInstance.state = UnifiedPreviewStates.INTERACTIVE
          this.configureInteractive(existingInstance)
          
          // 恢复标签
          if (!existingInstance.branchLabel && expectedBranch.label) {
            existingInstance.branchLabel = expectedBranch.label
          }
          if (existingInstance.branchLabel) {
            this.updatePreviewLineLabel(existingInstance.line, existingInstance.branchLabel)
          }
          
          restoredCount++
        }
      } else {
        console.log('✅ [分支完整性检查] 分支状态正常:', {
          nodeId: node.id,
          branchId: expectedBranch.id,
          branchState: existingInstance.state
        })
      }
    })

    // 如果有缺失的分支，重新创建整个预览线
    if (missingBranches.length > 0) {
      console.log('🔄 [分支完整性检查] 发现缺失分支，重新创建预览线:', {
        nodeId: node.id,
        missingBranchCount: missingBranches.length,
        missingBranches: missingBranches.map(b => ({ id: b.id, label: b.label })),
        isAfterNodeDeletion: isAfterNodeDeletion
      })
      
      // 移除现有的不完整预览线
      this.removePreviewLine(node.id)
      
      // 重新创建完整的预览线
      this.createUnifiedPreviewLine(node, UnifiedPreviewStates.INTERACTIVE)
    } else if (restoredCount > 0) {
      console.log('✅ [分支完整性检查] 恢复了隐藏分支，刷新预览线位置:', {
        nodeId: node.id,
        restoredCount: restoredCount
      })
      
      // 刷新预览线位置
      this.updatePreviewLinePosition(node)
    }

    console.log('✅ [分支完整性检查] 节点分支完整性检查完成:', {
      nodeId: node.id,
      expectedBranchCount: expectedBranchCount,
      missingBranchCount: missingBranches.length,
      restoredHiddenCount: restoredCount,
      isAfterNodeDeletion: isAfterNodeDeletion
    })
  }

  /**
   * 显示吸附完成的标签
   * @param {Object} line - 预览线对象
   * @param {string} branchLabel - 分支标签
   * @param {Object} targetNode - 目标节点
   */
  showSnapCompleteLabel(line, branchLabel, targetNode) {
    if (!line || !branchLabel) return
    
    console.log('🏷️ [统一预览线管理器] 显示吸附完成标签:', {
      lineId: line.id,
      branchLabel: branchLabel,
      targetNodeId: targetNode.id
    })
    
    // 更新预览线的标签，使其更加突出
    const snapCompleteLabel = {
      attrs: {
        text: {
          text: branchLabel,
          fill: '#52c41a', // 绿色表示成功吸附
          fontSize: 16,
          fontWeight: 'bold',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle'
        },
        rect: {
          ref: 'text',
          refX: -10,
          refY: -8,
          refWidth: '100%',
          refHeight: '100%',
          refWidth2: 20,
          refHeight2: 16,
          fill: '#f6ffed', // 浅绿色背景
          stroke: '#52c41a',
          strokeWidth: 2,
          rx: 6,
          ry: 6
        }
      },
      position: 0.8 // 靠近目标节点
    }
    
    // 设置标签
    line.setLabels([snapCompleteLabel])
    
    // 短暂显示后恢复原样
    setTimeout(() => {
      if (line && !line.removed) {
        // 恢复原始标签样式
        const originalLabel = {
          attrs: {
            text: {
              text: branchLabel,
              fill: '#333',
              fontSize: 14,
              fontWeight: 'bold',
              textAnchor: 'middle',
              textVerticalAnchor: 'middle'
            },
            rect: {
              ref: 'text',
              refX: -8,
              refY: -6,
              refWidth: '100%',
              refHeight: '100%',
              refWidth2: 16,
              refHeight2: 12,
              fill: '#fff',
              stroke: '#fa8c16',
              strokeWidth: 2,
              rx: 4,
              ry: 4
            }
          },
          position: 0.8
        }
        
        line.setLabels([originalLabel])
      }
    }, 1000) // 1秒后恢复
  }

  /**
   * 在指定位置查找节点
   */
  findNodeAtPosition(x, y, tolerance = 50) {
    const nodes = this.graph.getNodes()
    
    for (const node of nodes) {
      const nodeData = node.getData() || {}
      
      // 跳过拖拽提示点和预览相关节点
      if (nodeData.isEndpoint || nodeData.type === 'endpoint' || 
          nodeData.isUnifiedPreview || nodeData.isPersistentPreview) {
        continue
      }
      
      const nodePosition = node.getPosition()
      const nodeSize = node.getSize()
      
      // 🔧 使用坐标管理器验证和修正节点坐标
      let correctedX = nodePosition.x
      let correctedY = nodePosition.y
      
      if (this.coordinateManager) {
        const coordinateValidation = this.coordinateManager.validateCoordinateTransform(node)
        if (coordinateValidation && coordinateValidation.difference) {
          correctedX -= coordinateValidation.difference.x
          correctedY -= coordinateValidation.difference.y
          
          console.log('🔍 [位置查找坐标修正] 检测到节点坐标偏差:', {
            nodeId: node.id,
            originalPosition: { x: nodePosition.x, y: nodePosition.y },
            correctedPosition: { x: correctedX, y: correctedY },
            coordinateValidation
          })
        }
      }
      
      // 检查点是否在节点范围内（包含容差，使用修正后的坐标）
      if (x >= correctedX - tolerance && 
          x <= correctedX + nodeSize.width + tolerance &&
          y >= correctedY - tolerance && 
          y <= correctedY + nodeSize.height + tolerance) {
        
        console.log('🎯 [位置查找] 在位置找到节点:', {
          nodeId: node.id,
          nodeType: nodeData.type,
          searchPosition: { x, y },
          nodePosition: { x: correctedX, y: correctedY },
          nodeSize,
          tolerance
        })
        
        return node
      }
    }
    
    console.log('❌ [位置查找] 在位置未找到节点:', {
      searchPosition: { x, y },
      tolerance,
      totalNodesChecked: nodes.length
    })
    
    return null
  }

  /**
   * 创建连接
   */
  createConnection(sourceNode, targetNode, previewInstance) {
    const { branchId, branchLabel } = previewInstance
    
    // 注意：移除对目标节点已有连接的检查，因为节点的in端口支持多个连接
    
    // 确定源端口（源节点的out端口）- 修改：所有连接都使用统一的'out'端口，从UI层面的同一个位置出发
    const sourcePort = 'out'
    
    console.log('🔗 [连接创建] 开始创建连接:', {
      sourceNodeId: sourceNode.id,
      targetNodeId: targetNode.id,
      sourcePort: sourcePort,
      targetPort: 'in',
      branchId: branchId,
      branchLabel: branchLabel
    })
    
    // 创建连接配置
    const connectionConfig = {
      source: {
        cell: sourceNode.id,
        port: sourcePort
      },
      target: {
        cell: targetNode.id,
        port: 'in' // 目标节点的in端口，支持多个连接
      },
      router: {
        name: 'orth', // 使用更稳定的orth路由算法
        args: {
          padding: 10,
          startDirections: ['bottom'],
          endDirections: ['top']
        }
      },
      connector: {
        name: 'rounded',
        args: {
          radius: 8
        }
      },
      // 使用更可靠的boundary连接点
      connectionPoint: {
        name: 'boundary',
        args: {
          anchor: 'center'
        }
      },
      attrs: {
        line: {
          stroke: '#5F95FF',
          strokeWidth: 2,
          targetMarker: {
            name: 'block',
            width: 8,
            height: 6,
            fill: '#5F95FF'
          }
        }
      },
      data: {
        type: 'connection',
        sourceNodeId: sourceNode.id,
        targetNodeId: targetNode.id,
        branchId: branchId,
        branchLabel: branchLabel,
        allowMultipleConnections: true // 标记支持多连接
      }
    }

    console.log('⚙️ [连接创建] 连接配置:', {
      connectionConfig,
      connectionPoint: connectionConfig.connectionPoint
    })
    
    // 如果有分支标签，添加到连接上
    if (branchLabel) {
      connectionConfig.labels = [{
        attrs: {
          text: {
            text: branchLabel,
            fill: '#333',
            fontSize: 14,
            fontWeight: 'bold',
            textAnchor: 'middle',
            textVerticalAnchor: 'middle'
          },
          rect: {
            ref: 'text',
            refX: -8,
            refY: -6,
            refWidth: '100%',
            refHeight: '100%',
            refWidth2: 16,
            refHeight2: 12,
            fill: '#fff',
            stroke: '#5F95FF',
            strokeWidth: 2,
            rx: 4,
            ry: 4
          }
        },
        position: 0.5 // 将标签放在连接线中间
      }]
      console.log('🏷️ [连接创建] 添加分支标签:', branchLabel)
    }
    
    // 创建实际连接
    const connection = this.graph.addEdge(connectionConfig)
    
    // 验证连接创建后的属性
    const createdProps = connection.prop()
    console.log('✅ [连接创建] 连接创建成功，验证属性:', {
      connectionId: connection.id,
      source: createdProps.source,
      target: createdProps.target,
      connectionPoint: createdProps.connectionPoint,
      hasLabels: !!branchLabel
    })
    
    // 强制设置标签样式（如果有标签）
    if (branchLabel) {
      setTimeout(() => {
        const labels = connection.getLabels()
        if (labels && labels.length > 0) {
          connection.setLabelAt(0, {
            attrs: {
              text: {
                text: branchLabel,
                fill: '#333',
                fontSize: 14,
                fontWeight: 'bold',
                textAnchor: 'middle',
                textVerticalAnchor: 'middle',
                visibility: 'visible'
              },
              rect: {
                fill: '#fff',
                stroke: '#5F95FF',
                strokeWidth: 2,
                rx: 4,
                ry: 4,
                visibility: 'visible'
              }
            },
            position: 0.5
          })
        }
      }, 100)
    }
    
    // 智能删除预览线：如果是分支预览线，只删除特定分支；如果是单一预览线，删除整个预览线
    if (branchId) {
      // 分支预览线：只删除特定分支的预览线
      this.removeSpecificBranchPreviewLine(sourceNode.id, branchId)
      console.log('🗑️ [统一预览线管理器] 删除特定分支预览线:', {
        sourceNodeId: sourceNode.id,
        branchId: branchId,
        branchLabel: branchLabel
      })
    } else {
      // 单一预览线：删除整个预览线
      this.removePreviewLine(sourceNode.id)
      console.log('🗑️ [统一预览线管理器] 删除单一预览线:', {
        sourceNodeId: sourceNode.id
      })
    }
    
    console.log('✅ [统一预览线管理器] 连接创建成功:', {
      sourceId: sourceNode.id,
      targetId: targetNode.id,
      connectionId: connection.id,
      sourcePort: sourcePort,
      targetPort: 'in',
      branchId: branchId,
      branchLabel: branchLabel,
      hasLabel: !!branchLabel
    })
    
    return connection
  }

  /**
   * 判断是否应该在指定位置创建节点
   */
  shouldCreateNodeAtPosition(x, y) {
    // 简单实现：如果拖拽距离足够远，就创建新节点
    // 实际应用中可以根据具体需求调整
    return true
  }

  /**
   * 在指定位置创建新节点
   */
  createNodeAtPosition(x, y, sourceNode, previewInstance) {
    // 这里可以触发节点创建对话框或直接创建默认节点
    // 当前实现为示例，实际应用中需要根据业务需求调整
    
    console.log('📝 [统一预览线管理器] 请求在位置创建新节点:', {
      position: { x, y },
      sourceNodeId: sourceNode.id
    })
    
    // 触发节点创建请求事件
    this.emit('createNodeRequest', {
      position: { x, y },
      sourceNode: sourceNode,
      previewInstance: previewInstance
    })
  }

  /**
   * 重置拖拽状态
   */
  resetDragState() {
    if (this.currentDragLine) {
      // 在重置状态前，先更新预览线实例的endPosition到当前拖拽位置
      const { line } = this.currentDragLine
      if (line) {
        const targetPoint = line.getTargetPoint()
        if (targetPoint) {
          this.currentDragLine.endPosition = {
            x: targetPoint.x,
            y: targetPoint.y
          }
          
          console.log('📍 [预览线终点拖拽] 拖拽结束时更新endPosition:', {
            lineId: line.id,
            newEndPosition: this.currentDragLine.endPosition,
            targetPoint: targetPoint
          })
        }
      }
      
      // 检查预览线是否已被隐藏（即连接已建立）
      if (this.currentDragLine.state !== UnifiedPreviewStates.HIDDEN) {
        // 只有在预览线未被隐藏时才重置为交互状态
        this.setPreviewLineState(this.currentDragLine, UnifiedPreviewStates.INTERACTIVE)
        
        // 移除预览线终点的高亮效果
        if (this.currentDragLine.line) {
          this.updatePreviewLineEndpointStyle(this.currentDragLine.line, false)
        }
        
        console.log('🔄 [预览线终点拖拽] 预览线状态重置为交互状态:', {
          lineId: this.currentDragLine.line.id,
          state: this.currentDragLine.state
        })
      } else {
        console.log('⏭️ [预览线终点拖拽] 预览线已隐藏，跳过状态重置:', {
          lineId: this.currentDragLine.line.id,
          state: this.currentDragLine.state
        })
      }
      
      // 清除智能选择的目标节点信息
      delete this.currentDragLine.nearestTargetNode
      delete this.currentDragLine.nearestDistance
    }
    
    // 清除节点高亮
    this.clearNodeHighlights()
    
    this.isDragging = false
    this.isEndpointActive = false
    this.currentDragLine = null
    this.dragStartPosition = null
    
    console.log('🔄 [预览线终点拖拽] 拖拽状态已重置')
  }

  // ==================== 兼容性API ====================

  /**
   * 批量刷新预览线
   * 将多个刷新请求合并为一次批量操作，避免频繁刷新
   * @param {string} nodeId - 需要刷新的节点ID
   */
  queueRefresh(nodeId) {
    if (!nodeId) return
    
    this.refreshQueue.add(nodeId)
    
    // 清除之前的定时器
    if (this.batchRefreshTimer) {
      clearTimeout(this.batchRefreshTimer)
    }
    
    // 设置新的批量刷新定时器
    this.batchRefreshTimer = setTimeout(() => {
      this.processBatchRefresh()
    }, this.batchRefreshDelay)
  }
  
  /**
   * 处理批量刷新队列
   */
  processBatchRefresh() {
    if (this.refreshQueue.size === 0) return
    
    console.log('🔄 [统一预览线管理器] 开始批量刷新预览线:', {
      queueSize: this.refreshQueue.size,
      nodeIds: Array.from(this.refreshQueue)
    })
    
    const nodesToRefresh = Array.from(this.refreshQueue)
    this.refreshQueue.clear()
    this.batchRefreshTimer = null
    
    // 批量处理刷新
    nodesToRefresh.forEach(nodeId => {
      const node = this.graph?.getCellById(nodeId)
      if (node) {
        this.updatePreviewLinePosition(node)
      }
    })
    
    console.log('✅ [统一预览线管理器] 批量刷新完成:', {
      processedNodes: nodesToRefresh.length
    })
  }
  
  /**
   * 设置挂载状态
   * @param {boolean} mounted - 是否已挂载
   */
  setMounted(mounted) {
    this.isMounted = mounted
    console.log('🔧 [统一预览线管理器] 挂载状态更新:', mounted)
    
    // 如果是首次挂载且未进行过初始刷新，则进行一次完整刷新
    if (mounted && !this.hasInitialRefresh) {
      this.hasInitialRefresh = true
      console.log('🚀 [统一预览线管理器] 执行初始刷新')
      this.refreshAllPreviewLines(false, false)
    }
  }
  
  /**
   * 智能刷新预览线
   * 根据挂载状态和刷新历史决定是否需要刷新
   * @param {boolean} isAfterNodeDeletion - 是否是节点删除后的刷新
   * @param {boolean} isAfterSmartLayout - 是否是智能布局后的刷新
   */
  smartRefresh(isAfterNodeDeletion = false, isAfterSmartLayout = false) {
    // 如果未挂载，跳过刷新
    if (!this.isMounted) {
      console.log('⏭️ [统一预览线管理器] 未挂载，跳过刷新')
      return
    }
    
    // 如果已进行过初始刷新且不是特殊情况，使用批量刷新
    if (this.hasInitialRefresh && !isAfterNodeDeletion && !isAfterSmartLayout) {
      console.log('🔄 [统一预览线管理器] 使用智能批量刷新')
      // 对所有节点进行批量刷新
      this.previewLines.forEach((_, nodeId) => {
        this.queueRefresh(nodeId)
      })
      return
    }
    
    // 特殊情况下仍使用完整刷新
    this.refreshAllPreviewLines(isAfterNodeDeletion, isAfterSmartLayout)
  }

  /**
   * 刷新所有预览线
   * 用于在节点删除后确保剩余预览线正确显示
   * @param {boolean} isAfterNodeDeletion - 是否是节点删除后的刷新
   */
  refreshAllPreviewLines(isAfterNodeDeletion = false, isAfterSmartLayout = false) {
    // 防重复刷新检查
    const currentTime = Date.now()
    if (this.isRefreshing) {
      return
    }
    
    if (currentTime - this.lastRefreshTime < this.refreshCooldown) {
      return
    }
    
    this.isRefreshing = true
    this.lastRefreshTime = currentTime
    
    let refreshedCount = 0
    let totalBranchesRefreshed = 0
    let restoredHiddenBranches = 0
    let newPreviewLinesCreated = 0
    
    // 🔧 修复：智能布局后特殊处理，避免重新创建已连接的未命中人群预览线
    if (isAfterSmartLayout) {
      // 只刷新现有预览线的位置，不创建新的预览线
      this.previewLines.forEach((previewInstance, nodeId) => {
        const node = this.graph.getCellById(nodeId)
        
        if (node) {
          
          // 如果是分支预览线，为每个分支单独更新位置
          if (Array.isArray(previewInstance)) {
            previewInstance.forEach((instance, branchIndex) => {
              // 只处理非隐藏状态的分支
              if (instance.line && instance.state !== UnifiedPreviewStates.HIDDEN) {
                // 为每个分支单独调用位置更新
                this.updatePreviewLinePosition(node, instance.branchId, branchIndex)
                totalBranchesRefreshed++
                
                // 🔧 智能布局后强制刷新预览线终点位置
                try {
                  const currentTarget = instance.line.getTarget()
                  if (currentTarget && typeof currentTarget === 'object' && currentTarget.x !== undefined) {
                    // 🔧 修复NaN坐标问题：验证坐标有效性
                    let targetX = currentTarget.x
                    let targetY = currentTarget.y
                    
                    if (typeof targetX !== 'number' || isNaN(targetX) || !isFinite(targetX)) {
                      console.warn(`⚠️ [UnifiedPreviewLineManager] 分支预览线目标X坐标无效 (${targetX})，使用默认值 200`);
                      targetX = 200;
                    }
                    
                    if (typeof targetY !== 'number' || isNaN(targetY) || !isFinite(targetY)) {
                      console.warn(`⚠️ [UnifiedPreviewLineManager] 分支预览线目标Y坐标无效 (${targetY})，使用默认值 100`);
                      targetY = 100;
                    }
                    
                    // 强制重新设置终点位置，确保X6正确渲染
                    instance.line.setTarget({ x: targetX, y: targetY })
                    instance.endPosition = { x: targetX, y: targetY }
                  }
                } catch (error) {
                  console.warn('⚠️ [智能布局后] 强制刷新分支预览线终点位置失败:', error)
                }
                
                // 更新预览线终点标记位置
                this.updateEndpointMarker(instance.line, instance.endPosition)
              }
            })
          } else {
            // 单一预览线
            this.updatePreviewLinePosition(node)
            totalBranchesRefreshed++
            
            // 🔧 智能布局后强制刷新预览线终点位置
            try {
              const currentTarget = previewInstance.line.getTarget()
              if (currentTarget && typeof currentTarget === 'object' && currentTarget.x !== undefined) {
                // 🔧 修复NaN坐标问题：验证坐标有效性
                let targetX = currentTarget.x
                let targetY = currentTarget.y
                
                if (typeof targetX !== 'number' || isNaN(targetX) || !isFinite(targetX)) {
                  console.warn(`⚠️ [UnifiedPreviewLineManager] 单一预览线目标X坐标无效 (${targetX})，使用默认值 200`);
                  targetX = 200;
                }
                
                if (typeof targetY !== 'number' || isNaN(targetY) || !isFinite(targetY)) {
                  console.warn(`⚠️ [UnifiedPreviewLineManager] 单一预览线目标Y坐标无效 (${targetY})，使用默认值 100`);
                  targetY = 100;
                }
                
                // 强制重新设置终点位置，确保X6正确渲染
                previewInstance.line.setTarget({ x: targetX, y: targetY })
                previewInstance.endPosition = { x: targetX, y: targetY }
                console.log('🔧 [智能布局后] 强制刷新单一预览线终点位置:', {
                  nodeId: nodeId,
                  refreshedTarget: { x: targetX, y: targetY }
                })
              }
            } catch (error) {
              console.warn('⚠️ [智能布局后] 强制刷新单一预览线终点位置失败:', error)
            }
            
            // 更新预览线终点标记位置
            this.updateEndpointMarker(previewInstance.line, previewInstance.endPosition)
          }
          
          refreshedCount++
        }
      })
      
      // 智能布局后预览线刷新完成
      
      return // 智能布局后只刷新位置，不创建新预览线
    }
    
    // 第一步：刷新已有的预览线实例
    this.previewLines.forEach((previewInstance, nodeId) => {
      const node = this.graph.getCellById(nodeId)
      
      if (node) {
        // 刷新节点预览线
        
        // 如果是分支预览线，为每个分支单独更新位置
        if (Array.isArray(previewInstance)) {
          previewInstance.forEach((instance, branchIndex) => {
            // 检查分支是否被隐藏，如果是则尝试恢复
             if (instance.state === UnifiedPreviewStates.HIDDEN) {
               // 检查该分支是否还有真实连接
               const hasRealConnection = this.checkBranchHasRealConnection(node, instance.branchId)
               if (!hasRealConnection) {
                 // 恢复隐藏的分支预览线
                 console.log('🔄 [统一预览线管理器] 恢复被隐藏的分支预览线:', {
                   nodeId: nodeId,
                   branchId: instance.branchId,
                   branchIndex: branchIndex
                 })
                 
                 // 恢复状态
                 instance.state = UnifiedPreviewStates.INTERACTIVE
                 this.configureInteractive(instance)
                 
                 // 恢复分支标签
                 if (instance.branchLabel) {
                   this.updatePreviewLineLabel(instance.line, instance.branchLabel)
                 } else {
                   // 如果实例中没有保存标签，从节点配置中获取
                   const branches = this.getNodeBranches(node)
                   const branchConfig = branches.find(branch => branch.id === instance.branchId)
                   if (branchConfig && branchConfig.label) {
                     instance.branchLabel = branchConfig.label
                     this.updatePreviewLineLabel(instance.line, branchConfig.label)
                   }
                 }
                 
                 restoredHiddenBranches++
               } else {
                 // 跳过仍有连接的隐藏分支，但继续处理其他分支
               }
             }
            
            // 只处理非隐藏状态的分支
            if (instance.line && instance.state !== UnifiedPreviewStates.HIDDEN) {
              // 为每个分支单独调用位置更新
              this.updatePreviewLinePosition(node, instance.branchId, branchIndex)
              totalBranchesRefreshed++
              
              // 更新预览线终点标记位置
              this.updateEndpointMarker(instance.line, instance.endPosition)
            }
          })
        } else {
          // 单一预览线
          this.updatePreviewLinePosition(node)
          totalBranchesRefreshed++
          
          // 更新预览线终点标记位置
          this.updateEndpointMarker(previewInstance.line, previewInstance.endPosition)
        }
        
        refreshedCount++
      } else {
        console.warn('⚠️ [统一预览线管理器] 节点不存在，移除预览线:', nodeId)
        this.removePreviewLine(nodeId)
      }
    })
    
    // 第二步：检查所有节点，为需要预览线但没有预览线的节点创建预览线
    const allNodes = this.graph.getNodes()
    
    allNodes.forEach(node => {
      const nodeId = node.id
      const nodeData = node.getData() || {}
      
      // 跳过拖拽提示点和预览相关节点
      if (nodeData.isEndpoint || nodeData.type === 'endpoint' || 
          nodeData.isUnifiedPreview || nodeData.isPersistentPreview || nodeData.isPreview) {
        return
      }
      
      // 检查节点是否已有预览线实例
      const existingPreview = this.previewLines.get(nodeId)
      if (!existingPreview) {
        // 🔧 修复：对于分支节点，不应该因为有部分真实连接就完全跳过
        // 需要检查每个分支是否需要预览线
        if (isAfterNodeDeletion) {
          const nodeType = nodeData.type || nodeData.nodeType
          const branchNodeTypes = ['audience-split', 'event-split', 'ab-test']
          
          if (branchNodeTypes.includes(nodeType)) {
            // 分支节点：检查是否所有分支都有真实连接
            const branches = this.getNodeBranches(node)
            const allBranchesHaveConnections = branches.every(branch => 
              this.checkBranchHasRealConnection(node, branch.id)
            )
            
            if (allBranchesHaveConnections) {
              return
            }
          } else {
            // 非分支节点：检查是否有真实连接
            if (this.nodeHasRealConnections(node)) {
              return
            }
          }
        }
        
        // 检查是否应该创建预览线
        if (this.shouldCreatePreviewLine(node)) {
          
          // 强制检查节点类型，确保分支节点正确创建分支预览线
          const nodeType = nodeData.type || nodeData.nodeType
          const branchNodeTypes = ['audience-split', 'event-split', 'ab-test']
          
          if (branchNodeTypes.includes(nodeType)) {
            // 分支节点：直接创建分支预览线
            const branches = this.getNodeBranches(node)
            
            if (branches.length > 0) {
              this.createBranchPreviewLines(node, UnifiedPreviewStates.INTERACTIVE)
              newPreviewLinesCreated++
            } else {
              console.warn('⚠️ [统一预览线管理器] 分支节点没有分支信息，创建单一预览线:', nodeId)
              this.createUnifiedPreviewLine(node, UnifiedPreviewStates.INTERACTIVE)
              newPreviewLinesCreated++
            }
          } else {
            // 非分支节点：创建单一预览线
            this.createUnifiedPreviewLine(node, UnifiedPreviewStates.INTERACTIVE)
            newPreviewLinesCreated++
          }
        }
      } else {
        // 节点已有预览线实例，检查是否需要补充缺失的分支
        if (this.isBranchNode(node)) {
          const branches = this.getNodeBranches(node)
          const currentBranches = Array.isArray(existingPreview) ? existingPreview : [existingPreview]
          
          // 检查分支节点是否有缺失的分支
          
          // 检查是否有缺失的分支（只考虑没有真实连接的分支）
          const missingBranches = branches.filter(branch => {
            const hasPreviewLine = currentBranches.some(current => current.branchId === branch.id)
            const hasRealConnection = this.checkBranchHasRealConnection(node, branch.id)
            
            // 只有既没有预览线又没有真实连接的分支才被认为是缺失的
            return !hasPreviewLine && !hasRealConnection
          })
          
          // 🔧 修复：检查当前分支数是否已经超过预期，如果是则不创建新分支
          const expectedBranchCount = branches.length
          const currentBranchCount = currentBranches.length
          
          // 分支数量检查
          
          // 只有当前分支数少于预期且有缺失分支时才创建
          if (currentBranchCount < expectedBranchCount && missingBranches.length > 0) {
            
            // 为缺失的分支创建预览线
            missingBranches.forEach((branch, index) => {
              const branchIndex = branches.findIndex(b => b.id === branch.id)
              
              // 使用工具类验证并修复分支标签
              const fixedBranch = BranchLabelUtils.validateAndFixBranchLabel(
                branch, 
                branchIndex, 
                nodeData.type || nodeData.nodeType
              )
              
              // 为缺失分支创建预览线
              
              // 创建单个分支预览线
              const newBranchInstance = this.createBranchPreviewLine(node, fixedBranch, branchIndex, branches.length, UnifiedPreviewStates.INTERACTIVE)
              
              if (newBranchInstance) {
                // 将新创建的分支实例添加到现有数组中
                if (Array.isArray(existingPreview)) {
                  existingPreview.push(newBranchInstance)
                } else {
                  // 如果原来是单一预览线，转换为数组
                  this.previewLines.set(nodeId, [existingPreview, newBranchInstance])
                }
                newPreviewLinesCreated++
                
                // 缺失分支预览线已添加到现有数组
              }
            })
          }
        }
      }
    })
    
    // 预览线刷新完成 - 简化日志输出
    if (newPreviewLinesCreated > 0) {
      console.log(`✅ [统一预览线管理器] 预览线刷新完成: 新创建${newPreviewLinesCreated}条预览线`)
    }
  }

  /**
   * 检查分支是否还有真实连接
   * @param {Object} node - 节点对象
   * @param {string} branchId - 分支ID
   * @returns {boolean} 是否有真实连接
   */
  checkBranchHasRealConnection(node, branchId) {
    const outgoingEdges = this.graph.getOutgoingEdges(node) || []
    
    const realConnections = outgoingEdges.filter(edge => {
      const edgeData = edge.getData() || {}
      // 排除所有类型的预览线，只检查真实连接
      const isPreviewLine = edgeData.isUnifiedPreview || 
                           edgeData.isPersistentPreview || 
                           edgeData.isPreview ||
                           edgeData.type === 'preview-line' ||
                           edgeData.type === 'unified-preview-line' ||
                           edgeData.type === 'draggable-preview'
      
      // 只有非预览线且分支ID匹配的连接才算真实连接
      return !isPreviewLine && edgeData.branchId === branchId
    })
    
    // 检查分支真实连接
    
    return realConnections.length > 0
  }

  /**
   * 检查节点是否还有真实连接
   * @param {Object} node - 节点对象
   * @returns {boolean} 是否有真实连接
   */
  nodeHasRealConnections(node) {
    const outgoingEdges = this.graph.getOutgoingEdges(node) || []
    
    const realConnections = outgoingEdges.filter(edge => {
      const edgeData = edge.getData() || {}
      // 排除所有类型的预览线，只检查真实连接
      const isPreviewLine = edgeData.isUnifiedPreview || 
                           edgeData.isPersistentPreview || 
                           edgeData.isPreview ||
                           edgeData.type === 'preview-line' ||
                           edgeData.type === 'unified-preview-line' ||
                           edgeData.type === 'draggable-preview'
      
      return !isPreviewLine
    })
    
    console.log('🔍 [统一预览线管理器] 检查节点真实连接:', {
      nodeId: node.id,
      totalOutgoingEdges: outgoingEdges.length,
      realConnections: realConnections.length,
      realConnectionDetails: realConnections.map(edge => {
        const edgeData = edge.getData() || {}
        return {
          edgeId: edge.id,
          branchId: edgeData.branchId || 'none',
          target: edge.getTargetCellId(),
          type: edgeData.type || 'unknown'
        }
      }),
      hasRealConnections: realConnections.length > 0
    })
    
    return realConnections.length > 0
  }

  /**
   * 获取当前活跃的预览线（兼容结构化布局）
   * @returns {Array} 预览线数组
   */
  getActivePreviewLines() {
    const activeLines = []
    
    console.log('🔍 [统一预览线管理器] 获取活跃预览线:', {
      totalPreviewInstances: this.previewLines.size
    })
    
    // 遍历所有预览线实例
    this.previewLines.forEach((previewInstance, nodeId) => {
      const node = this.graph.getCellById(nodeId)
      
      if (!node) {
        console.warn('⚠️ [统一预览线管理器] 节点不存在，跳过预览线:', nodeId)
        return
      }
      
      if (Array.isArray(previewInstance)) {
        // 分支预览线
        previewInstance.forEach((instance, branchIndex) => {
          if (instance.line && this.graph.hasCell(instance.line)) {
            const previewLine = {
              id: instance.line.id,
              sourceNode: node,
              targetNode: null, // 统一预览线没有目标节点
              sourcePort: 'out',
              targetPort: null,
              type: 'unified',
              branchId: instance.branchId,
              branchIndex: branchIndex,
              branchLabel: instance.branchLabel,
              position: {
                start: instance.line.getSourcePoint(),
                end: instance.line.getTargetPoint()
              },
              state: instance.state
            }
            activeLines.push(previewLine)
          }
        })
      } else {
        // 单一预览线
        if (previewInstance.line && this.graph.hasCell(previewInstance.line)) {
          const previewLine = {
            id: previewInstance.line.id,
            sourceNode: node,
            targetNode: null,
            sourcePort: 'out',
            targetPort: null,
            type: 'unified',
            branchId: previewInstance.branchId || null,
            position: {
              start: previewInstance.line.getSourcePoint(),
              end: previewInstance.line.getTargetPoint()
            },
            state: previewInstance.state
          }
          activeLines.push(previewLine)
        }
      }
    })
    
    console.log('✅ [统一预览线管理器] 获取活跃预览线完成:', {
      totalActiveLines: activeLines.length,
      branchLines: activeLines.filter(line => line.branchId).length,
      singleLines: activeLines.filter(line => !line.branchId).length
    })
    
    return activeLines
  }

  /**
   * 获取所有预览线（包括活跃和非活跃的）
   * @returns {Array} 所有预览线数组
   */
  getAllPreviewLines() {
    const allLines = []
    
    console.log('🔍 [统一预览线管理器] 获取所有预览线:', {
      totalPreviewInstances: this.previewLines.size
    })
    
    // 遍历所有预览线实例
    this.previewLines.forEach((previewInstance, nodeId) => {
      const node = this.graph ? this.graph.getCellById(nodeId) : null
      
      if (Array.isArray(previewInstance)) {
        // 分支预览线
        previewInstance.forEach((instance, branchIndex) => {
          if (instance.line) {
            const previewLine = {
              id: instance.line.id,
              sourceNode: node,
              targetNode: null, // 统一预览线没有目标节点
              sourcePort: 'out',
              targetPort: null,
              type: 'unified',
              branchId: instance.branchId,
              branchIndex: branchIndex,
              branchLabel: instance.branchLabel,
              position: {
                start: instance.line.getSourcePoint ? instance.line.getSourcePoint() : null,
                end: instance.line.getTargetPoint ? instance.line.getTargetPoint() : null
              },
              state: instance.state,
              isActive: this.graph ? this.graph.hasCell(instance.line) : false
            }
            allLines.push(previewLine)
          }
        })
      } else {
        // 单一预览线
        if (previewInstance.line) {
          const previewLine = {
            id: previewInstance.line.id,
            sourceNode: node,
            targetNode: null,
            sourcePort: 'out',
            targetPort: null,
            type: 'unified',
            branchId: previewInstance.branchId || null,
            position: {
              start: previewInstance.line.getSourcePoint ? previewInstance.line.getSourcePoint() : null,
              end: previewInstance.line.getTargetPoint ? previewInstance.line.getTargetPoint() : null
            },
            state: previewInstance.state,
            isActive: this.graph ? this.graph.hasCell(previewInstance.line) : false
          }
          allLines.push(previewLine)
        }
      }
    })
    
    console.log('✅ [统一预览线管理器] 获取所有预览线完成:', {
      totalLines: allLines.length,
      branchLines: allLines.filter(line => line.branchId).length,
      singleLines: allLines.filter(line => !line.branchId).length,
      activeLines: allLines.filter(line => line.isActive).length
    })
    
    return allLines
  }

  /**
   * 兼容持久化预览线API
   */
  createPersistentPreview(node) {
    return this.createUnifiedPreviewLine(node, UnifiedPreviewStates.STATIC_DISPLAY)
  }

  /**
   * 兼容可拖拽预设线API
   */
  createDraggablePreviewLine(node, branchId = null, branchIndex = 0, totalBranches = 1) {
    return this.createUnifiedPreviewLine(node, UnifiedPreviewStates.INTERACTIVE, {
      branchId,
      branchIndex,
      totalBranches
    })
  }

  /**
   * 更新拖拽提示点位置（手工调整）- 已废弃，改为预览线终点拖拽
   * @param {Object} hintNode - 拖拽提示点节点
   * @param {Object} newPosition - 新位置 {x, y}
   */
  /*
  updateHintPosition(hintNode, newPosition) {
    const hintData = hintNode.getData() || {}
    const hintId = hintNode.id
    
    // 🔧 安全检查：确保新位置是有效数字
    if (!newPosition || 
        typeof newPosition.x !== 'number' || isNaN(newPosition.x) ||
        typeof newPosition.y !== 'number' || isNaN(newPosition.y)) {
      console.error('💥 [统一预览线管理器] 新位置无效，无法更新拖拽提示点:', {
        hintId,
        newPosition
      })
      return
    }
    
    console.log('🎯 [统一预览线管理器] 开始更新拖拽提示点位置:', {
      hintId: hintId,
      newPosition: newPosition,
      hintData: hintData
    })
    
    // 🔧 记录手工调整的位置
    this.manuallyAdjustedHints.set(hintId, {
      x: newPosition.x,
      y: newPosition.y,
      timestamp: Date.now()
    })
    
    console.log('📝 [统一预览线管理器] 记录手工调整的拖拽点位置:', {
      hintId: hintId,
      adjustedPosition: newPosition,
      totalAdjustedHints: this.manuallyAdjustedHints.size
    })
    
    // 查找对应的预览线实例
    let foundPreviewInstance = null
    let sourceNodeId = null
    let branchId = null
    let branchIndex = -1
    
    // 遍历所有预览线实例，找到包含这个拖拽提示点的实例
    for (const [nodeId, previewInstance] of this.previewLines) {
      if (Array.isArray(previewInstance)) {
        // 分支预览线
        for (let i = 0; i < previewInstance.length; i++) {
          const instance = previewInstance[i]
          if (instance.hintNode && instance.hintNode.id === hintId) {
            foundPreviewInstance = instance
            sourceNodeId = nodeId
            branchId = instance.branchId
            branchIndex = i
            break
          }
        }
      } else {
        // 单一预览线
        if (previewInstance.hintNode && previewInstance.hintNode.id === hintId) {
          foundPreviewInstance = previewInstance
          sourceNodeId = nodeId
          branchId = previewInstance.branchId || 'default'
          break
        }
      }
      
      if (foundPreviewInstance) break
    }
    
    if (!foundPreviewInstance) {
      // 提供详细的调试信息
      const allPreviewLines = Array.from(this.previewLines.entries()).map(([nodeId, instance]) => {
        if (Array.isArray(instance)) {
          return {
            nodeId,
            type: 'branch',
            branches: instance.map(inst => ({
              branchId: inst.branchId,
              lineId: inst.line.id,
              hintNodeId: inst.hintNode ? inst.hintNode.id : null
            }))
          }
        } else {
          return {
            nodeId,
            type: 'single',
            lineId: instance.line.id,
            hintNodeId: instance.hintNode ? instance.hintNode.id : null
          }
        }
      })
      
      console.warn('⚠️ [统一预览线管理器] 未找到对应的预览线实例:', {
        searchingForHintId: hintId,
        allPreviewLines: allPreviewLines,
        manuallyAdjustedHints: Array.from(this.manuallyAdjustedHints.keys()),
        possibleCause: '预览线可能已被删除但手工调整记录未清理'
      })
      
      // 如果找不到预览线实例，清理对应的手工调整记录
      if (this.manuallyAdjustedHints.has(hintId)) {
        this.manuallyAdjustedHints.delete(hintId)
        console.log('🧹 [统一预览线管理器] 已清理孤立的手工调整记录:', {
          hintId,
          remainingAdjustments: this.manuallyAdjustedHints.size
        })
      }
      
      return
    }
    
    console.log('🔍 [统一预览线管理器] 找到对应的预览线实例:', {
      sourceNodeId: sourceNodeId,
      branchId: branchId,
      branchIndex: branchIndex,
      previewLineId: foundPreviewInstance.line.id
    })
    
    // 计算拖拽提示点中心位置作为预览线的新终点
    const hintSize = hintNode.getSize()
    
    // 🔧 安全检查：确保hintSize是有效的
    if (!hintSize || 
        typeof hintSize.width !== 'number' || isNaN(hintSize.width) ||
        typeof hintSize.height !== 'number' || isNaN(hintSize.height)) {
      console.error('💥 [统一预览线管理器] 拖拽提示点尺寸无效:', {
        hintId,
        hintSize
      })
      return
    }
    
    const newEndPosition = {
      x: newPosition.x + hintSize.width / 2,
      y: newPosition.y + hintSize.height / 2
    }
    
    // 🔧 最终安全检查：确保计算结果是有效数字
    if (typeof newEndPosition.x !== 'number' || isNaN(newEndPosition.x) ||
        typeof newEndPosition.y !== 'number' || isNaN(newEndPosition.y)) {
      console.error('💥 [统一预览线管理器] 计算的新终点位置无效:', {
        hintId,
        newPosition,
        hintSize,
        newEndPosition
      })
      return
    }
    
    console.log('📐 [统一预览线管理器] 计算新的预览线终点位置:', {
      hintPosition: newPosition,
      hintSize: hintSize,
      newEndPosition: newEndPosition
    })
    
    try {
      // 更新预览线的终点位置
      foundPreviewInstance.line.setTarget(newEndPosition)
      
      // 更新预览线实例中存储的终点位置
      foundPreviewInstance.endPosition = newEndPosition
      
      // 强制重新路由预览线
      this.setSafeRouter(foundPreviewInstance.line, {
        args: {
          step: 10,
          padding: 15,
          excludeEnds: ['source', 'target'],
          startDirections: ['bottom'],
          endDirections: ['top']
        }
      })
      
      console.log('✅ [统一预览线管理器] 拖拽提示点位置更新成功:', {
        hintId: hintId,
        sourceNodeId: sourceNodeId,
        branchId: branchId,
        newEndPosition: newEndPosition,
        previewLineId: foundPreviewInstance.line.id
      })
      
    } catch (error) {
      console.error('💥 [统一预览线管理器] 更新拖拽提示点位置失败:', error)
    }
  }
  */

  /**
   * 清理过期缓存
   */
  clearExpiredCache() {
    const now = Date.now()
    
    // 清理分支信息缓存
    for (const [nodeId, cache] of this.branchInfoCache.entries()) {
      if ((now - cache.timestamp) > this.cacheTimeout) {
        this.branchInfoCache.delete(nodeId)
      }
    }
    
    // 清理位置缓存
    for (const [nodeId, cache] of this.positionCache.entries()) {
      if ((now - cache.timestamp) > this.cacheTimeout) {
        this.positionCache.delete(nodeId)
      }
    }
  }

  /**
   * 清理指定节点的缓存
   * @param {string} nodeId - 节点ID
   */
  clearNodeCache(nodeId) {
    this.branchInfoCache.delete(nodeId)
    this.positionCache.delete(nodeId)
    console.log('🧹 [统一预览线管理器] 已清理节点缓存:', nodeId)
  }

  /**
   * 🗑️ [已删除] cleanupRelatedEndpoints 方法已被新的预览线分层策略替代
   */
  cleanupRelatedEndpoints(nodeId) {
    // 🗑️ [已删除] endpoint清理逻辑已被新的预览线分层策略替代
    console.log('🗑️ [统一预览线管理器] endpoint清理已被新策略替代:', nodeId)
  }

  /**
   * 统一重新计算所有预览线的终点位置
   * 用于布局完成后与普通节点同步更新预览线终点位置
   */
  recalculateAllPreviewLineEndPositions() {
    console.log('🔧 [统一预览线管理器] 开始统一重新计算所有预览线终点位置')
    
    let updatedCount = 0
    let totalBranches = 0
    let syncedHintNodes = 0
    
    this.previewLines.forEach((previewInstance, nodeId) => {
      const node = this.graph.getCellById(nodeId)
      
      if (!node) {
        console.warn('⚠️ [统一预览线管理器] 节点不存在，跳过:', nodeId)
        return
      }
      
      console.log('🔄 [统一预览线管理器] 重新计算节点预览线终点位置:', {
        nodeId: nodeId,
        isArray: Array.isArray(previewInstance),
        branchCount: Array.isArray(previewInstance) ? previewInstance.length : 1
      })
      
      // 如果是分支预览线，为每个分支单独重新计算终点位置
      if (Array.isArray(previewInstance)) {
        const branches = this.getNodeBranches(node)
        
        previewInstance.forEach((instance, branchIndex) => {
          if (instance.line && instance.state !== UnifiedPreviewStates.HIDDEN) {
            // 🔧 获取对应的拖拽点实际位置（布局引擎计算后的位置）
            let actualHintPosition = null
            if (instance.hintNode) {
              const hintPosition = instance.hintNode.getPosition()
              const hintSize = instance.hintNode.getSize()
              // 计算拖拽点的中心坐标
              actualHintPosition = {
                x: hintPosition.x + hintSize.width / 2,
                y: hintPosition.y + hintSize.height / 2
              }
              
              console.log('🎯 [终点位置重新计算] 获取拖拽点实际位置:', {
                nodeId: nodeId,
                branchId: instance.branchId,
                branchIndex: branchIndex,
                hintNodeId: instance.hintNode.id,
                hintPosition: hintPosition,
                hintSize: hintSize,
                actualHintPosition: actualHintPosition
              })
            }
            
            // 🔧 优先使用拖拽点的实际位置，如果没有则重新计算
            let newEndPosition
            if (actualHintPosition) {
              // 使用拖拽点的实际位置作为终点位置
              newEndPosition = actualHintPosition
              console.log('✅ [终点位置重新计算] 使用拖拽点实际位置作为终点:', {
                nodeId: nodeId,
                branchId: instance.branchId,
                newEndPosition: newEndPosition
              })
            } else {
              // 如果没有拖拽点，重新计算终点位置
              newEndPosition = this.calculateBranchPreviewPosition(node, branches, branchIndex)
              console.log('⚠️ [终点位置重新计算] 拖拽点不存在，重新计算终点位置:', {
                nodeId: nodeId,
                branchId: instance.branchId,
                newEndPosition: newEndPosition
              })
            }
            
            // 更新预览线的终点位置
            instance.line.setTarget(newEndPosition)
            
            // 更新存储的endPosition
            instance.endPosition = newEndPosition
            
            console.log('✅ [统一预览线管理器] 分支预览线终点位置已重新计算:', {
              nodeId: nodeId,
              branchId: instance.branchId,
              branchIndex: branchIndex,
              newEndPosition: newEndPosition,
              usedHintPosition: !!actualHintPosition
            })
            
            totalBranches++
            if (actualHintPosition) {
              syncedHintNodes++
            }
          }
        })
      } else {
        // 单一预览线
        if (previewInstance.line && previewInstance.state !== UnifiedPreviewStates.HIDDEN) {
          // 🔧 获取对应的拖拽点实际位置（布局引擎计算后的位置）
          let actualHintPosition = null
          if (previewInstance.hintNode) {
            const hintPosition = previewInstance.hintNode.getPosition()
            const hintSize = previewInstance.hintNode.getSize()
            // 计算拖拽点的中心坐标
            actualHintPosition = {
              x: hintPosition.x + hintSize.width / 2,
              y: hintPosition.y + hintSize.height / 2
            }
            
            console.log('🎯 [终点位置重新计算] 获取单一预览线拖拽点实际位置:', {
              nodeId: nodeId,
              hintNodeId: previewInstance.hintNode.id,
              hintPosition: hintPosition,
              hintSize: hintSize,
              actualHintPosition: actualHintPosition
            })
          }
          
          // 🔧 优先使用拖拽点的实际位置，如果没有则重新计算
          let newEndPosition
          if (actualHintPosition) {
            // 使用拖拽点的实际位置作为终点位置
            newEndPosition = actualHintPosition
            console.log('✅ [终点位置重新计算] 使用单一预览线拖拽点实际位置作为终点:', {
              nodeId: nodeId,
              newEndPosition: newEndPosition
            })
          } else {
            // 如果没有拖拽点，重新计算终点位置
            const nodePosition = node.getPosition()
            const nodeSize = node.getSize()
            newEndPosition = this.calculateSinglePreviewPosition(node, nodePosition, nodeSize)
            console.log('⚠️ [终点位置重新计算] 单一预览线拖拽点不存在，重新计算终点位置:', {
              nodeId: nodeId,
              newEndPosition: newEndPosition
            })
          }
          
          // 更新预览线的终点位置
          previewInstance.line.setTarget(newEndPosition)
          
          // 更新存储的endPosition
          previewInstance.endPosition = newEndPosition
          
          console.log('✅ [统一预览线管理器] 单一预览线终点位置已重新计算:', {
            nodeId: nodeId,
            newEndPosition: newEndPosition,
            usedHintPosition: !!actualHintPosition
          })
          
          totalBranches++
          if (actualHintPosition) {
            syncedHintNodes++
          }
        }
      }
      
      updatedCount++
    })
    
    console.log('✅ [统一预览线管理器] 所有预览线终点位置重新计算完成:', {
      totalPreviewLines: this.previewLines.size,
      updatedNodes: updatedCount,
      totalBranches: totalBranches,
      syncedHintNodes: syncedHintNodes,
      syncRate: totalBranches > 0 ? `${((syncedHintNodes / totalBranches) * 100).toFixed(1)}%` : '0%'
    })
  }

  /**
   * 检查并执行自动吸附到预览线终点
   * 这是一个代理方法，调用统一预览线管理器的checkSnapToPreviewLines方法
   * @param {Object} dragNode - 被拖拽的节点
   * @param {Object} nodePosition - 节点位置
   * @param {Object} nodeSize - 节点大小
   */
  checkSnapToPreviewLines(dragNode, nodePosition, nodeSize) {
    // 检查节点是否已有输入连接，如果有则跳过吸附
    const edges = this.graph.getIncomingEdges(dragNode)
    if (edges && edges.length > 0) {
      console.log('⏭️ [统一预览线管理器] 节点已有输入连接，跳过预览线终点吸附:', dragNode.id)
      return
    }
    
    // 🔧 防止重复吸附：检查是否正在处理吸附
    if (this.isProcessingSnap) {
      console.log('⏭️ [统一预览线管理器] 正在处理吸附，跳过重复调用:', dragNode.id)
      return
    }
    
    // 🔧 防止重复吸附：检查节点是否已经被标记为吸附目标
    if (this.snappedNodes && this.snappedNodes.has(dragNode.id)) {
      console.log('⏭️ [统一预览线管理器] 节点已被吸附，跳过重复处理:', dragNode.id)
      return
    }
    
    const dragNodeCenter = {
      x: nodePosition.x + nodeSize.width / 2,
      y: nodePosition.y + nodeSize.height / 2
    }
    
    let closestSnap = null
    let minDistance = Infinity
    const snapDistance = 80 // 80px吸附距离
    
    // 检查所有预览线的终点是否在吸附范围内
    this.previewLines.forEach((previewInstance, sourceNodeId) => {
      // 跳过自己的预览线
      if (sourceNodeId === dragNode.id) return
      
      // 🔧 新增：检查是否已经存在从这个源节点到目标节点的连接
      const existingConnection = this.graph.getEdges().find(edge => {
        const sourceNode = edge.getSourceNode()
        const targetNode = edge.getTargetNode()
        return sourceNode && targetNode && 
               sourceNode.id === sourceNodeId && 
               targetNode.id === dragNode.id
      })
      
      if (existingConnection) {
        console.log('⏭️ [统一预览线管理器] 已存在连接，跳过此源节点:', {
          sourceNodeId,
          targetNodeId: dragNode.id,
          existingEdgeId: existingConnection.id
        })
        return
      }
      
      // 处理分支预览线
      if (Array.isArray(previewInstance)) {
        previewInstance.forEach((instance, branchIndex) => {
          if (instance.line && instance.state !== UnifiedPreviewStates.HIDDEN && instance.endPosition) {
            const distance = Math.sqrt(
              Math.pow(dragNodeCenter.x - instance.endPosition.x, 2) + 
              Math.pow(dragNodeCenter.y - instance.endPosition.y, 2)
            )
            
            if (distance < snapDistance && distance < minDistance) {
              minDistance = distance
              closestSnap = {
                x: instance.endPosition.x - nodeSize.width / 2,
                y: instance.endPosition.y - nodeSize.height / 2,
                sourceNodeId: sourceNodeId,
                branchId: instance.branchId,
                branchLabel: instance.branchLabel,
                distance: distance,
                endPosition: instance.endPosition
              }
            }
          }
        })
      } else {
        // 处理单一预览线
        if (previewInstance.line && previewInstance.state !== UnifiedPreviewStates.HIDDEN && previewInstance.endPosition) {
          const distance = Math.sqrt(
            Math.pow(dragNodeCenter.x - previewInstance.endPosition.x, 2) + 
            Math.pow(dragNodeCenter.y - previewInstance.endPosition.y, 2)
          )
          
          if (distance < snapDistance && distance < minDistance) {
            minDistance = distance
            closestSnap = {
              x: previewInstance.endPosition.x - nodeSize.width / 2,
              y: previewInstance.endPosition.y - nodeSize.height / 2,
              sourceNodeId: sourceNodeId,
              branchId: null,
              branchLabel: null,
              distance: distance,
              endPosition: previewInstance.endPosition
            }
          }
        }
      }
    })
    
    // 执行自动吸附
    if (closestSnap) {
      console.log('🎯 [统一预览线管理器] 检测到预览线终点吸附:', {
        dragNodeId: dragNode.id,
        sourceNodeId: closestSnap.sourceNodeId,
        branchId: closestSnap.branchId,
        distance: closestSnap.distance,
        snapPosition: { x: closestSnap.x, y: closestSnap.y }
      })
      
      // 🔧 设置吸附处理标志，防止重复处理
      this.isProcessingSnap = true
      
      // 🔧 初始化已吸附节点集合
      if (!this.snappedNodes) {
        this.snappedNodes = new Set()
      }
      this.snappedNodes.add(dragNode.id)
      
      // 设置节点位置到吸附点
      dragNode.setPosition(closestSnap.x, closestSnap.y)
      
      // 高亮显示吸附的预览线
      this.highlightSnapTarget(closestSnap.sourceNodeId, closestSnap.branchId)
      
      // 延迟创建连接，避免拖拽过程中的冲突
      setTimeout(() => {
        // 🔧 再次检查是否已经存在连接，防止重复创建
        const finalCheck = this.graph.getEdges().find(edge => {
          const sourceNode = edge.getSourceNode()
          const targetNode = edge.getTargetNode()
          return sourceNode && targetNode && 
                 sourceNode.id === closestSnap.sourceNodeId && 
                 targetNode.id === dragNode.id
        })
        
        if (!finalCheck) {
          this.createSnapConnection(closestSnap.sourceNodeId, dragNode.id, closestSnap.branchId, closestSnap.branchLabel)
        } else {
          console.log('⏭️ [统一预览线管理器] 连接已存在，跳过创建:', {
            sourceNodeId: closestSnap.sourceNodeId,
            targetNodeId: dragNode.id,
            existingEdgeId: finalCheck.id
          })
        }
        
        // 🔧 重置吸附处理标志
        this.isProcessingSnap = false
      }, 100)
      
      return true
    }
    
    return false
  }

  /**
   * 高亮吸附目标预览线
   * @param {string} sourceNodeId - 源节点ID
   * @param {string} branchId - 分支ID（可选）
   */
  highlightSnapTarget(sourceNodeId, branchId) {
    const previewInstance = this.previewLines.get(sourceNodeId)
    if (!previewInstance) return
    
    if (Array.isArray(previewInstance)) {
      // 分支预览线
      const targetInstance = previewInstance.find(instance => instance.branchId === branchId)
      if (targetInstance && targetInstance.line) {
        targetInstance.line.setAttrs({
          line: {
            stroke: '#ff4d4f',
            strokeWidth: 3,
            strokeDasharray: '5,5'
          }
        })
      }
    } else {
      // 单一预览线
      if (previewInstance.line) {
        previewInstance.line.setAttrs({
          line: {
            stroke: '#ff4d4f',
            strokeWidth: 3,
            strokeDasharray: '5,5'
          }
        })
      }
    }
  }

  /**
   * 创建吸附连接
   * @param {string} sourceNodeId - 源节点ID
   * @param {string} targetNodeId - 目标节点ID
   * @param {string} branchId - 分支ID（可选）
   * @param {string} branchLabel - 分支标签（可选）
   */
  createSnapConnection(sourceNodeId, targetNodeId, branchId, branchLabel) {
    const sourceNode = this.graph.getCellById(sourceNodeId)
    const targetNode = this.graph.getCellById(targetNodeId)
    
    if (!sourceNode || !targetNode) {
      console.warn('🚫 [统一预览线管理器] 无法找到源节点或目标节点:', {
        sourceNodeId,
        targetNodeId,
        sourceNodeFound: !!sourceNode,
        targetNodeFound: !!targetNode
      })
      return
    }
    
    // 创建连接边
    const edge = this.graph.addEdge({
      source: {
        cell: sourceNodeId,
        port: 'out'
      },
      target: {
        cell: targetNodeId,
        port: 'in'
      },
      router: {
        name: 'orth',
        args: {
          padding: 10
        }
      },
      connector: {
        name: 'rounded',
        args: {
          radius: 8
        }
      },
      connectionPoint: {
        name: 'boundary',
        args: {
          anchor: 'center'
        }
      },
      attrs: {
        line: {
          stroke: branchId ? '#1890ff' : '#52c41a',
          strokeWidth: 2,
          targetMarker: {
            name: 'block',
            width: 8,
            height: 6
          }
        }
      },
      data: {
        branchId,
        branchLabel,
        label: branchLabel, // 确保label字段也被设置
        sourceNodeId,
        targetNodeId,
        isAutoSnapped: true
      }
    })
    
    // 如果是分支连接，添加标签
    if (branchId && branchLabel) {
      edge.setLabels([{
        markup: [
          {
            tagName: 'rect',
            selector: 'body'
          },
          {
            tagName: 'text',
            selector: 'label'
          }
        ],
        position: {
          distance: 0.5,
          offset: 0
        },
        attrs: {
          label: {
            text: branchLabel,
            fontSize: 12,
            fill: '#666'
          },
          body: {
            fill: '#fff',
            stroke: '#1890ff',
            strokeWidth: 1,
            rx: 3,
            ry: 3
          }
        }
      }])
      
      console.log('🏷️ [统一预览线管理器] 为分支连接添加标签:', {
        edgeId: edge.id,
        branchId: branchId,
        branchLabel: branchLabel
      })
    }
    
    // 移除对应的预览线
    if (branchId) {
      // 分支预览线：移除特定分支
      this.removeSpecificBranchPreviewLine(sourceNodeId, branchId)
    } else {
      // 单一预览线：移除整个预览线
      this.removePreviewLine(sourceNodeId)
    }
    
    console.log('✅ [统一预览线管理器] 预览线终点吸附连接创建成功:', {
      edgeId: edge.id,
      sourceNodeId,
      targetNodeId,
      branchId,
      branchLabel
    })
    
    return edge
  }

  /**
   * 清理吸附状态
   * 在节点拖拽结束后调用，清理防重复状态
   */
  clearSnapState() {
    this.isProcessingSnap = false
    if (this.snappedNodes) {
      this.snappedNodes.clear()
    }
    console.log('🧹 [统一预览线管理器] 已清理吸附状态')
  }

  /**
   * 🎯 新增：清理孤立预览线
   * 清理源节点不存在或已连接的预览线
   */
  cleanupOrphanedPreviewLines() {
    console.log('🧹 [预览线清理] 开始清理孤立预览线')
    
    let cleanedCount = 0
    const previewLinesToRemove = []
    
    // 检查所有预览线
    this.previewLines.forEach((previewInstance, nodeId) => {
      try {
        // 🎯 修复：检查预览线实例的sourceNode属性
        let sourceNode = null
        
        // 优先使用预览线实例中的sourceNode
        if (previewInstance && previewInstance.sourceNode) {
          sourceNode = previewInstance.sourceNode
        } else {
          // 如果预览线实例中没有sourceNode，尝试从graph中获取
          sourceNode = this.graph.getCellById(nodeId)
        }
        
        // 检查源节点是否存在
        if (!sourceNode) {
          previewLinesToRemove.push(nodeId)
          console.warn(`⚠️ [预览线清理] sourceNode为null，标记清理: ${nodeId}`, {
            previewInstance: previewInstance ? 'exists' : 'null',
            hasSourceNodeProperty: previewInstance && previewInstance.hasOwnProperty('sourceNode'),
            sourceNodeValue: previewInstance ? previewInstance.sourceNode : 'N/A'
          })
          return
        }
        
        // 验证节点是否仍在graph中
        if (!this.graph.hasCell(sourceNode.id)) {
          previewLinesToRemove.push(nodeId)
          console.log(`🗑️ [预览线清理] 节点不在graph中，标记清理: ${nodeId}`)
          return
        }
        
        // 检查节点是否已有实际连接
        const hasRealConnections = this.hasExistingRealConnections(sourceNode)
        if (hasRealConnections) {
          previewLinesToRemove.push(nodeId)
          console.log(`🗑️ [预览线清理] 节点已有实际连接，标记清理: ${nodeId}`)
          return
        }
        
        // 检查预览线实例是否有效
        if (previewInstance.line && previewInstance.line.removed) {
          previewLinesToRemove.push(nodeId)
          console.log(`🗑️ [预览线清理] 预览线已被移除，标记清理: ${nodeId}`)
          return
        }
        
        // 🎯 新增：检查分支预览线的有效性
        if (previewInstance.branches && Array.isArray(previewInstance.branches)) {
          const invalidBranches = previewInstance.branches.filter(branch => 
            branch.line && (branch.line.removed || !this.graph.hasCell(branch.line.id))
          )
          
          if (invalidBranches.length > 0) {
            previewLinesToRemove.push(nodeId)
            console.log(`🗑️ [预览线清理] 分支预览线无效，标记清理: ${nodeId}`, {
              invalidBranches: invalidBranches.map(b => b.branchId)
            })
            return
          }
        }
        
      } catch (error) {
        console.error(`❌ [预览线清理] 检查预览线时出错: ${nodeId}`, error)
        previewLinesToRemove.push(nodeId)
      }
    })
    
    // 执行清理
    previewLinesToRemove.forEach(nodeId => {
      this.removePreviewLine(nodeId)
      cleanedCount++
    })
    
    if (cleanedCount > 0) {
      console.log(`🧹 [预览线清理] 清理完成，共清理 ${cleanedCount} 条孤立预览线`)
    } else {
      console.log('✅ [预览线清理] 无需清理，所有预览线状态正常')
    }
    
    return cleanedCount
  }

  /**
   * 🎯 新增：执行加载完成检查
   * 在数据加载完成后调用，确保预览线状态正确
   */
  performLoadCompleteCheck() {
    console.log('🔍 [加载完成检查] 开始检查预览线状态')
    
    // 🎯 关键修复：增加更长的延迟，确保布局和endpoint创建完全完成
    setTimeout(() => {
      // 🎯 新增：检查是否刚完成布局，如果是则跳过清理
      const now = Date.now()
      if (this.lastLayoutTime && (now - this.lastLayoutTime) < 3000) {
        console.log('⏭️ [加载完成检查] 刚完成布局，跳过预览线清理，保留endpoint预览线')
        
        // 仅统计状态，不执行清理
        const totalPreviewLines = this.previewLines.size
        const totalNodes = this.graph.getNodes().length
        
        console.log('📊 [加载完成检查] 状态统计（跳过清理）:', {
          总节点数: totalNodes,
          预览线数量: totalPreviewLines,
          清理数量: 0,
          状态: '保留endpoint预览线'
        })
        return
      }
      
      // 🎯 关键修复：检查是否有虚拟endpoint节点，如果有则延迟清理
      const nodes = this.graph.getNodes()
      const hasVirtualEndpoints = nodes.some(node => {
        const nodeData = node.getData() || {}
        return nodeData.isEndpoint && nodeData.isVirtual
      })
      
      if (hasVirtualEndpoints) {
        console.log('⏭️ [加载完成检查] 检测到虚拟endpoint节点，延迟清理以保护endpoint预览线')
        
        // 仅统计状态，不执行清理
        const totalPreviewLines = this.previewLines.size
        const totalNodes = this.graph.getNodes().length
        
        console.log('📊 [加载完成检查] 状态统计（保护endpoint）:', {
          总节点数: totalNodes,
          预览线数量: totalPreviewLines,
          虚拟endpoint数量: nodes.filter(n => n.getData()?.isEndpoint && n.getData()?.isVirtual).length,
          清理数量: 0,
          状态: '保护endpoint预览线'
        })
        return
      }
      
      const cleanedCount = this.cleanupOrphanedPreviewLines()
      
      // 统计当前状态
      const totalPreviewLines = this.previewLines.size
      const totalNodes = this.graph.getNodes().length
      
      console.log('📊 [加载完成检查] 状态统计:', {
        总节点数: totalNodes,
        预览线数量: totalPreviewLines,
        清理数量: cleanedCount,
        状态: cleanedCount > 0 ? '已优化' : '正常'
      })
      
      if (cleanedCount === 0 && totalPreviewLines > 0) {
        console.log('✅ [加载完成检查] 预览线状态良好，无需清理')
      }
    }, 1000) // 🎯 增加延迟到1000ms，确保endpoint创建完成
  }

  /**
   * 检查节点是否已有实际连接
   * @param {Object} node - 节点对象
   * @returns {boolean} 是否有实际连接
   */
  hasExistingRealConnections(node) {
    if (!node || !this.graph) return false

    // 🎯 关键修复：使用getOutgoingEdges与布局引擎保持一致
    const outgoingEdges = this.graph.getOutgoingEdges(node) || []

    // 过滤掉预览线，只检查实际连接
    const realConnections = outgoingEdges.filter((edge) => {
      const edgeData = edge.getData() || {}
      return (
        !edgeData.isUnifiedPreview &&
        !edgeData.isPersistentPreview &&
        !edgeData.isPreview &&
        edgeData.type !== "preview-line" &&
        edgeData.type !== "unified-preview-line"
      )
    })

    console.log(
      `🔍 [连接检查] 节点 ${node.id} 实际连接数: ${realConnections.length}`,
      {
        totalEdges: outgoingEdges.length,
        realConnections: realConnections.length,
        realConnectionIds: realConnections.map((edge) => edge.id),
      },
    )

    return realConnections.length > 0
  }

  /**
   * 🎯 新增：验证预览线完整性
   * 检查所有预览线实例的有效性，确保数据一致性
   */
  validatePreviewLineIntegrity() {
    console.log('🔍 [统一预览线管理器] 开始验证预览线完整性')
    
    let validCount = 0
    let invalidCount = 0
    const issues = []
    
    this.previewLines.forEach((previewInstance, nodeId) => {
      try {
        // 🎯 修复：与cleanupOrphanedPreviewLines保持一致的sourceNode检查逻辑
        let sourceNode = null
        
        // 优先使用预览线实例中的sourceNode
        if (previewInstance && previewInstance.sourceNode) {
          sourceNode = previewInstance.sourceNode
        } else {
          // 如果预览线实例中没有sourceNode，尝试从graph中获取
          sourceNode = this.graph.getCellById(nodeId)
        }
        
        // 检查sourceNode是否存在
        if (!sourceNode) {
          issues.push({ 
            nodeId, 
            issue: 'sourceNode为null',
            details: {
              previewInstance: previewInstance ? 'exists' : 'null',
              hasSourceNodeProperty: previewInstance && previewInstance.hasOwnProperty('sourceNode'),
              sourceNodeValue: previewInstance ? previewInstance.sourceNode : 'N/A'
            }
          })
          invalidCount++
          return
        }
        
        // 检查节点是否在graph中
        if (!this.graph || !this.graph.hasCell(sourceNode.id)) {
          issues.push({ 
            nodeId, 
            issue: '节点不在graph中',
            details: {
              nodeId: sourceNode.id,
              hasGraph: !!this.graph
            }
          })
          invalidCount++
          return
        }
        
        // 🆕 增强：检查节点坐标完整性
        const nodePosition = sourceNode.getPosition()
        if (!nodePosition || isNaN(nodePosition.x) || isNaN(nodePosition.y)) {
          issues.push({ 
            nodeId, 
            issue: '节点坐标无效（NaN或undefined）',
            details: {
              position: nodePosition,
              xValid: nodePosition && !isNaN(nodePosition.x),
              yValid: nodePosition && !isNaN(nodePosition.y),
              nodeType: sourceNode.getData()?.type
            }
          })
          invalidCount++
          return
        }
        
        // 🆕 增强：检查预览线端点坐标完整性
        if (previewInstance.endPosition) {
          if (isNaN(previewInstance.endPosition.x) || isNaN(previewInstance.endPosition.y)) {
            issues.push({ 
              nodeId, 
              issue: '预览线端点坐标无效（NaN）',
              details: {
                endPosition: previewInstance.endPosition,
                xValid: !isNaN(previewInstance.endPosition.x),
                yValid: !isNaN(previewInstance.endPosition.y)
              }
            })
            invalidCount++
            return
          }
        }
        
        // 检查预览线是否存在且有效
        if (previewInstance.line) {
          if (previewInstance.line.removed || !this.graph.hasCell(previewInstance.line.id)) {
            issues.push({ 
              nodeId, 
              issue: '预览线已被移除或不在graph中',
              details: {
                lineId: previewInstance.line.id,
                removed: previewInstance.line.removed,
                inGraph: this.graph.hasCell(previewInstance.line.id)
              }
            })
            invalidCount++
            return
          }
        }
        
        // 检查分支预览线
        if (previewInstance.branches && Array.isArray(previewInstance.branches)) {
          const invalidBranches = []
          
          for (const branch of previewInstance.branches) {
            if (branch.line && (branch.line.removed || !this.graph.hasCell(branch.line.id))) {
              invalidBranches.push({
                branchId: branch.branchId,
                lineId: branch.line.id,
                removed: branch.line.removed,
                inGraph: this.graph.hasCell(branch.line.id)
              })
            }
          }
          
          if (invalidBranches.length > 0) {
            issues.push({ 
              nodeId, 
              issue: '分支预览线无效',
              details: {
                invalidBranches: invalidBranches,
                totalBranches: previewInstance.branches.length
              }
            })
            invalidCount++
            return
          }
        }
        
        validCount++
        
      } catch (error) {
        issues.push({ 
          nodeId, 
          issue: `验证时出错: ${error.message}`,
          details: {
            errorStack: error.stack
          }
        })
        invalidCount++
      }
    })
    
    // 输出验证结果
    console.log('📊 [统一预览线管理器] 完整性验证结果:', {
      总数: this.previewLines.size,
      有效: validCount,
      无效: invalidCount,
      问题详情: issues.length > 0 ? issues : '无问题'
    })
    
    // 如果发现问题，记录详细信息
    if (issues.length > 0) {
      console.warn('⚠️ [统一预览线管理器] 发现完整性问题:', issues)
    }
    
    return {
      valid: validCount,
      invalid: invalidCount,
      issues: issues
    }
  }
  
  /**
   * 🔧 保存预览线状态信息
   * 在清理旧预览线前保存必要的状态信息
   */
  preservePreviewLineState(previewInstance) {
    if (!previewInstance) {
      return null
    }
    
    const state = {
      nodeId: null,
      type: null,
      endPosition: null,
      branches: null,
      visibility: null
    }
    
    try {
      // 保存基本信息
      if (previewInstance.sourceNode) {
        state.nodeId = previewInstance.sourceNode.id
      }
      
      // 判断预览线类型并保存相应状态
      if (Array.isArray(previewInstance)) {
        // 分支预览线
        state.type = 'branch'
        state.branches = previewInstance.map(instance => ({
          endPosition: instance.endPosition,
          state: instance.state,
          branchId: instance.branchId
        }))
      } else {
        // 单一预览线
        state.type = 'single'
        state.endPosition = previewInstance.endPosition
        state.visibility = previewInstance.state
      }
      
      console.log('💾 [预览线状态保存] 已保存状态:', state)
      return state
      
    } catch (error) {
      console.warn('⚠️ [预览线状态保存] 保存状态失败:', error)
      return null
    }
  }
  
  /**
   * 🔧 在清理后重新创建预览线
   * 使用保存的状态信息重新创建预览线
   */
  createPreviewLineAfterCleanup(node, preservedState) {
    if (!node || !node.id) {
      console.warn('⚠️ [预览线重建] 节点无效，跳过重建')
      return
    }
    
    try {
      // 检查节点是否仍然需要预览线
      if (!this.shouldCreatePreviewLine(node)) {
        console.log('ℹ️ [预览线重建] 节点不再需要预览线，跳过重建:', node.id)
        return
      }
      
      // 重新创建预览线
      console.log('🔄 [预览线重建] 开始重建预览线:', node.id)
      
      // 使用统一的预览线创建方法
      this.createUnifiedPreviewLine(node)
      
      // 如果有保存的状态，尝试恢复
      if (preservedState && preservedState.endPosition) {
        const newInstance = this.previewLines.get(node.id)
        if (newInstance) {
          // 恢复终点位置
          if (preservedState.type === 'single' && !Array.isArray(newInstance)) {
            newInstance.endPosition = preservedState.endPosition
            if (newInstance.line) {
              newInstance.line.setTarget(preservedState.endPosition)
            }
          } else if (preservedState.type === 'branch' && Array.isArray(newInstance) && preservedState.branches) {
            // 恢复分支预览线状态
            preservedState.branches.forEach((branchState, index) => {
              if (newInstance[index] && branchState.endPosition) {
                newInstance[index].endPosition = branchState.endPosition
                if (newInstance[index].line) {
                  newInstance[index].line.setTarget(branchState.endPosition)
                }
              }
            })
          }
          
          console.log('✅ [预览线重建] 预览线重建完成，状态已恢复:', node.id)
        }
      } else {
        console.log('✅ [预览线重建] 预览线重建完成（无状态恢复）:', node.id)
      }
      
    } catch (error) {
      console.error('❌ [预览线重建] 重建失败:', error)
      // 如果重建失败，尝试简单的创建
      try {
        this.createUnifiedPreviewLine(node)
        console.log('🔄 [预览线重建] 使用简单创建方式成功:', node.id)
      } catch (fallbackError) {
        console.error('❌ [预览线重建] 简单创建也失败:', fallbackError)
      }
    }
  }
  
  /**
   * 🔧 新增：修复NaN坐标问题
   * 检查并修复所有节点和预览线中的NaN坐标
   */
  fixNaNCoordinates() {
    console.log('🔧 [统一预览线管理器] 开始修复NaN坐标问题')
    
    let fixedNodeCount = 0
    let fixedPreviewLineCount = 0
    const fixResults = []
    
    // 1. 检查并修复所有节点的坐标
    const allNodes = this.graph.getNodes()
    allNodes.forEach(node => {
      try {
        const position = node.getPosition()
        let needsFix = false
        let newPosition = { ...position }
        
        if (isNaN(position.x)) {
          newPosition.x = 100 // 默认X坐标
          needsFix = true
        }
        
        if (isNaN(position.y)) {
          // 尝试从布局引擎获取正确的Y坐标
          if (this.layoutEngine && typeof this.layoutEngine.getNodeLayerY === 'function') {
            const calculatedY = this.layoutEngine.getNodeLayerY(node.id)
            newPosition.y = !isNaN(calculatedY) ? calculatedY : 100
          } else {
            newPosition.y = 100 // 默认Y坐标
          }
          needsFix = true
        }
        
        if (needsFix) {
          node.setPosition(newPosition, { silent: true })
          fixedNodeCount++
          fixResults.push({
            type: 'node',
            nodeId: node.id,
            oldPosition: position,
            newPosition: newPosition
          })
          console.log(`🔧 [坐标修复] 修复节点坐标: ${node.id}`, {
            旧坐标: position,
            新坐标: newPosition
          })
        }
      } catch (error) {
        console.error(`❌ [坐标修复] 修复节点坐标失败: ${node.id}`, error)
      }
    })
    
    // 2. 检查并修复预览线坐标
    this.previewLines.forEach((previewInstance, nodeId) => {
      try {
        if (previewInstance.line) {
          const source = previewInstance.line.getSource()
          const target = previewInstance.line.getTarget()
          let needsFix = false
          
          // 修复源端点
          if (source && (isNaN(source.x) || isNaN(source.y))) {
            const sourceNode = previewInstance.sourceNode
            if (sourceNode) {
              const nodePosition = sourceNode.getPosition()
              const nodeSize = sourceNode.getSize()
              const newSource = {
                x: !isNaN(source.x) ? source.x : nodePosition.x + nodeSize.width / 2,
                y: !isNaN(source.y) ? source.y : nodePosition.y + nodeSize.height
              }
              previewInstance.line.setSource(newSource)
              needsFix = true
            }
          }
          
          // 修复目标端点
          if (target && (isNaN(target.x) || isNaN(target.y))) {
            const sourceNode = previewInstance.sourceNode
            if (sourceNode) {
              const nodePosition = sourceNode.getPosition()
              const newTarget = {
                x: !isNaN(target.x) ? target.x : nodePosition.x,
                y: !isNaN(target.y) ? target.y : nodePosition.y + 100
              }
              previewInstance.line.setTarget(newTarget)
              needsFix = true
            }
          }
          
          if (needsFix) {
            fixedPreviewLineCount++
            fixResults.push({
              type: 'previewLine',
              nodeId: nodeId,
              lineId: previewInstance.line.id
            })
          }
        }
        
        // 修复分支预览线坐标
        if (previewInstance.branches && Array.isArray(previewInstance.branches)) {
          previewInstance.branches.forEach(branch => {
            if (branch.line) {
              const branchSource = branch.line.getSource()
              const branchTarget = branch.line.getTarget()
              let branchNeedsFix = false
              
              if (branchSource && (isNaN(branchSource.x) || isNaN(branchSource.y))) {
                const sourceNode = previewInstance.sourceNode
                if (sourceNode) {
                  const nodePosition = sourceNode.getPosition()
                  const nodeSize = sourceNode.getSize()
                  const newBranchSource = {
                    x: !isNaN(branchSource.x) ? branchSource.x : nodePosition.x + nodeSize.width / 2,
                    y: !isNaN(branchSource.y) ? branchSource.y : nodePosition.y + nodeSize.height
                  }
                  branch.line.setSource(newBranchSource)
                  branchNeedsFix = true
                }
              }
              
              if (branchTarget && (isNaN(branchTarget.x) || isNaN(branchTarget.y))) {
                const sourceNode = previewInstance.sourceNode
                if (sourceNode) {
                  const nodePosition = sourceNode.getPosition()
                  const newBranchTarget = {
                    x: !isNaN(branchTarget.x) ? branchTarget.x : nodePosition.x,
                    y: !isNaN(branchTarget.y) ? branchTarget.y : nodePosition.y + 100
                  }
                  branch.line.setTarget(newBranchTarget)
                  branchNeedsFix = true
                }
              }
              
              if (branchNeedsFix) {
                fixedPreviewLineCount++
                fixResults.push({
                  type: 'branchPreviewLine',
                  nodeId: nodeId,
                  branchId: branch.branchId,
                  lineId: branch.line.id
                })
              }
            }
          })
        }
      } catch (error) {
        console.error(`❌ [坐标修复] 修复预览线坐标失败: ${nodeId}`, error)
      }
    })
    
    console.log('✅ [统一预览线管理器] NaN坐标修复完成:', {
      修复节点数: fixedNodeCount,
      修复预览线数: fixedPreviewLineCount,
      总修复数: fixedNodeCount + fixedPreviewLineCount,
      详细结果: fixResults
    })
    
    return {
      fixedNodes: fixedNodeCount,
      fixedPreviewLines: fixedPreviewLineCount,
      results: fixResults
    }
  }
  
  /**
   * 🔧 新增：全面完整性检查和修复
   * 执行完整的系统完整性检查并自动修复发现的问题
   */
  performComprehensiveIntegrityCheck() {
    console.log('🔍 [统一预览线管理器] 开始全面完整性检查')
    
    const results = {
      timestamp: new Date().toISOString(),
      checks: {},
      fixes: {},
      summary: {}
    }
    
    try {
      // 1. 验证预览线完整性
      console.log('📋 [完整性检查] 步骤1: 验证预览线完整性')
      results.checks.previewLineIntegrity = this.validatePreviewLineIntegrity()
      
      // 2. 修复NaN坐标
      console.log('🔧 [完整性检查] 步骤2: 修复NaN坐标')
      results.fixes.nanCoordinates = this.fixNaNCoordinates()
      
      // 3. 清理孤立预览线
      console.log('🧹 [完整性检查] 步骤3: 清理孤立预览线')
      const cleanedCount = this.cleanupOrphanedPreviewLines()
      results.fixes.orphanedPreviewLines = { cleanedCount }
      
      // 4. 重新验证修复后的状态
      console.log('✅ [完整性检查] 步骤4: 重新验证修复后状态')
      results.checks.postFixIntegrity = this.validatePreviewLineIntegrity()
      
      // 5. 生成摘要
      results.summary = {
        totalNodes: this.graph.getNodes().length,
        totalPreviewLines: this.previewLines.size,
        integrityIssuesFound: results.checks.previewLineIntegrity.invalid,
        integrityIssuesRemaining: results.checks.postFixIntegrity.invalid,
        nodesFixed: results.fixes.nanCoordinates.fixedNodes,
        previewLinesFixed: results.fixes.nanCoordinates.fixedPreviewLines,
        orphanedLinesRemoved: results.fixes.orphanedPreviewLines.cleanedCount,
        overallStatus: results.checks.postFixIntegrity.invalid === 0 ? 'HEALTHY' : 'NEEDS_ATTENTION'
      }
      
      console.log('📊 [完整性检查] 检查完成，摘要:', results.summary)
      
      // 如果仍有问题，输出详细信息
      if (results.summary.overallStatus === 'NEEDS_ATTENTION') {
        console.warn('⚠️ [完整性检查] 仍存在问题，需要进一步处理:', results.checks.postFixIntegrity.issues)
      } else {
        console.log('✅ [完整性检查] 系统状态良好，所有问题已修复')
      }
      
    } catch (error) {
      console.error('❌ [完整性检查] 检查过程中出现错误:', error)
      results.error = {
        message: error.message,
        stack: error.stack
      }
      results.summary.overallStatus = 'ERROR'
    }
    
    return results
  }
  
  /**
   * 🔧 新增：增强的完整性校验
   * 包含节点坐标、预览线端点、连接线完整性的全面检查
   */
  validateEnhancedIntegrity() {
    console.log('🔍 [统一预览线管理器] 开始增强完整性校验')
    
    const results = {
      nodeCoordinates: { valid: 0, invalid: 0, issues: [] },
      previewLines: { valid: 0, invalid: 0, issues: [] },
      connections: { valid: 0, invalid: 0, issues: [] },
      summary: {},
      criticalIssues: [] // 新增：关键问题列表
    }
    
    // 1. 检查所有节点坐标完整性
    const allNodes = this.graph.getNodes()
    allNodes.forEach(node => {
      try {
        const position = node.getPosition()
        const nodeData = node.getData() || {}
        const nodeType = nodeData.type || 'unknown'
        
        // 更严格的坐标验证
        const hasValidPosition = position && 
          typeof position.x === 'number' && 
          typeof position.y === 'number' && 
          !isNaN(position.x) && 
          !isNaN(position.y) &&
          isFinite(position.x) && 
          isFinite(position.y)
        
        if (!hasValidPosition) {
          results.nodeCoordinates.invalid++
          const issue = {
            nodeId: node.id,
            nodeType: nodeType,
            issue: '节点坐标无效或包含NaN/Infinity',
            position: position,
            details: {
              x: position?.x,
              y: position?.y,
              xIsNaN: isNaN(position?.x),
              yIsNaN: isNaN(position?.y),
              xIsFinite: isFinite(position?.x),
              yIsFinite: isFinite(position?.y),
              positionExists: !!position
            },
            severity: 'critical'
          }
          results.nodeCoordinates.issues.push(issue)
          
          // 特别关注audience-split类型节点的Y坐标NaN问题
          if (nodeType === 'audience-split' && isNaN(position?.y)) {
            results.criticalIssues.push({
              type: 'AUDIENCE_SPLIT_Y_NAN',
              nodeId: node.id,
              message: `audience-split节点Y坐标为NaN: ${position?.y}`,
              position: position,
              priority: 'HIGH'
            })
          }
        } else {
          results.nodeCoordinates.valid++
        }
      } catch (error) {
        results.nodeCoordinates.invalid++
        results.nodeCoordinates.issues.push({
          nodeId: node.id,
          issue: `检查节点坐标时出错: ${error.message}`,
          error: error.stack,
          severity: 'error'
        })
      }
    })
    
    // 2. 检查预览线完整性
    this.previewLines.forEach((previewInstance, nodeId) => {
      try {
        // 检查源节点存在性和有效性
        if (!previewInstance.sourceNode) {
          results.previewLines.invalid++
          const issue = {
            nodeId,
            issue: '预览线缺少源节点',
            severity: 'critical'
          }
          results.previewLines.issues.push(issue)
          results.criticalIssues.push({
            type: 'PREVIEW_LINE_NO_SOURCE',
            nodeId,
            message: '预览线缺少源节点',
            priority: 'HIGH'
          })
          return
        }
        
        // 检查源节点是否在graph中
        if (!this.graph.hasCell(previewInstance.sourceNode.id)) {
          results.previewLines.invalid++
          const issue = {
            nodeId,
            issue: '预览线源节点不在graph中',
            sourceNodeId: previewInstance.sourceNode.id,
            severity: 'critical'
          }
          results.previewLines.issues.push(issue)
          results.criticalIssues.push({
            type: 'PREVIEW_LINE_SOURCE_NOT_IN_GRAPH',
            nodeId,
            sourceNodeId: previewInstance.sourceNode.id,
            message: '预览线源节点不在graph中',
            priority: 'HIGH'
          })
          return
        }
        
        // 检查源节点坐标有效性
        const sourcePosition = previewInstance.sourceNode.getPosition()
        if (!sourcePosition || isNaN(sourcePosition.x) || isNaN(sourcePosition.y)) {
          results.previewLines.invalid++
          results.previewLines.issues.push({
            nodeId,
            issue: '预览线源节点坐标无效',
            sourcePosition: sourcePosition,
            severity: 'warning'
          })
        }
        
        // 检查预览线端点坐标
        if (previewInstance.line) {
          const source = previewInstance.line.getSource()
          const target = previewInstance.line.getTarget()
          
          if (source && (isNaN(source.x) || isNaN(source.y))) {
            results.previewLines.invalid++
            results.previewLines.issues.push({
              nodeId,
              issue: '预览线源端点坐标包含NaN',
              source: source
            })
            return
          }
          
          if (target && (isNaN(target.x) || isNaN(target.y))) {
            results.previewLines.invalid++
            results.previewLines.issues.push({
              nodeId,
              issue: '预览线目标端点坐标包含NaN',
              target: target
            })
            return
          }
        }
        
        // 检查分支预览线
        if (previewInstance.branches && Array.isArray(previewInstance.branches)) {
          for (const branch of previewInstance.branches) {
            if (branch.line) {
              const branchSource = branch.line.getSource()
              const branchTarget = branch.line.getTarget()
              
              if (branchSource && (isNaN(branchSource.x) || isNaN(branchSource.y))) {
                results.previewLines.invalid++
                results.previewLines.issues.push({
                  nodeId,
                  issue: '分支预览线源端点坐标包含NaN',
                  branchId: branch.branchId,
                  source: branchSource
                })
                return
              }
              
              if (branchTarget && (isNaN(branchTarget.x) || isNaN(branchTarget.y))) {
                results.previewLines.invalid++
                results.previewLines.issues.push({
                  nodeId,
                  issue: '分支预览线目标端点坐标包含NaN',
                  branchId: branch.branchId,
                  target: branchTarget
                })
                return
              }
            }
          }
        }
        
        results.previewLines.valid++
        
      } catch (error) {
        results.previewLines.invalid++
        results.previewLines.issues.push({
          nodeId,
          issue: `检查预览线时出错: ${error.message}`,
          error: error.stack
        })
      }
    })
    
    // 3. 检查连接线完整性
    const allEdges = this.graph.getEdges()
    allEdges.forEach(edge => {
      try {
        const source = edge.getSource()
        const target = edge.getTarget()
        
        // 检查连接线是否有完整的两个节点
        if (!source || !source.cell) {
          results.connections.invalid++
          const issue = {
            edgeId: edge.id,
            issue: '连接线缺少源节点',
            source: source,
            severity: 'critical'
          }
          results.connections.issues.push(issue)
          results.criticalIssues.push({
            type: 'CONNECTION_NO_SOURCE',
            edgeId: edge.id,
            message: '连接线缺少源节点',
            priority: 'HIGH'
          })
          return
        }
        
        if (!target || !target.cell) {
          results.connections.invalid++
          const issue = {
            edgeId: edge.id,
            issue: '连接线缺少目标节点',
            target: target,
            severity: 'critical'
          }
          results.connections.issues.push(issue)
          results.criticalIssues.push({
            type: 'CONNECTION_NO_TARGET',
            edgeId: edge.id,
            message: '连接线缺少目标节点',
            priority: 'HIGH'
          })
          return
        }
        
        // 检查源节点和目标节点是否在graph中
        if (!this.graph.hasCell(source.cell)) {
          results.connections.invalid++
          const issue = {
            edgeId: edge.id,
            issue: '连接线源节点不在graph中',
            sourceCell: source.cell,
            severity: 'critical'
          }
          results.connections.issues.push(issue)
          results.criticalIssues.push({
            type: 'CONNECTION_SOURCE_NOT_IN_GRAPH',
            edgeId: edge.id,
            sourceCell: source.cell,
            message: '连接线源节点不在graph中',
            priority: 'HIGH'
          })
          return
        }
        
        if (!this.graph.hasCell(target.cell)) {
          results.connections.invalid++
          const issue = {
            edgeId: edge.id,
            issue: '连接线目标节点不在graph中',
            targetCell: target.cell,
            severity: 'critical'
          }
          results.connections.issues.push(issue)
          results.criticalIssues.push({
            type: 'CONNECTION_TARGET_NOT_IN_GRAPH',
            edgeId: edge.id,
            targetCell: target.cell,
            message: '连接线目标节点不在graph中',
            priority: 'HIGH'
          })
          return
        }
        
        // 检查源节点和目标节点的坐标有效性
        const sourceNode = this.graph.getCell(source.cell)
        const targetNode = this.graph.getCell(target.cell)
        
        if (sourceNode) {
          const sourcePos = sourceNode.getPosition()
          if (!sourcePos || isNaN(sourcePos.x) || isNaN(sourcePos.y)) {
            results.connections.invalid++
            results.connections.issues.push({
              edgeId: edge.id,
              issue: '连接线源节点坐标无效',
              sourceNodeId: sourceNode.id,
              sourcePosition: sourcePos,
              severity: 'warning'
            })
            return
          }
        }
        
        if (targetNode) {
          const targetPos = targetNode.getPosition()
          if (!targetPos || isNaN(targetPos.x) || isNaN(targetPos.y)) {
            results.connections.invalid++
            results.connections.issues.push({
              edgeId: edge.id,
              issue: '连接线目标节点坐标无效',
              targetNodeId: targetNode.id,
              targetPosition: targetPos,
              severity: 'warning'
            })
            return
          }
        }
        
        results.connections.valid++
        
      } catch (error) {
        results.connections.invalid++
        results.connections.issues.push({
          edgeId: edge.id,
          issue: `检查连接线时出错: ${error.message}`,
          error: error.stack
        })
      }
    })
    
    // 生成摘要
    const totalIssues = results.nodeCoordinates.invalid + results.previewLines.invalid + results.connections.invalid
    const criticalIssuesCount = results.criticalIssues.length
    
    results.summary = {
      totalNodes: allNodes.length,
      totalPreviewLines: this.previewLines.size,
      totalConnections: allEdges.length,
      nodeCoordinatesValid: results.nodeCoordinates.valid,
      nodeCoordinatesInvalid: results.nodeCoordinates.invalid,
      previewLinesValid: results.previewLines.valid,
      previewLinesInvalid: results.previewLines.invalid,
      connectionsValid: results.connections.valid,
      connectionsInvalid: results.connections.invalid,
      totalIssues: totalIssues,
      criticalIssues: criticalIssuesCount,
      overallStatus: totalIssues === 0 ? 'HEALTHY' : (criticalIssuesCount > 0 ? 'CRITICAL' : 'NEEDS_ATTENTION'),
      healthScore: Math.round(((results.nodeCoordinates.valid + results.previewLines.valid + results.connections.valid) / 
        (allNodes.length + this.previewLines.size + allEdges.length)) * 100),
      timestamp: new Date().toISOString()
    }
    
    console.log('📊 [增强完整性校验] 检查完成:', results.summary)
    
    if (results.summary.overallStatus === 'CRITICAL') {
      console.error('🚨 [增强完整性校验] 发现关键问题:', {
        关键问题数量: criticalIssuesCount,
        关键问题列表: results.criticalIssues,
        节点坐标问题: results.nodeCoordinates.issues.filter(i => i.severity === 'critical'),
        预览线问题: results.previewLines.issues.filter(i => i.severity === 'critical'),
        连接线问题: results.connections.issues.filter(i => i.severity === 'critical')
      })
    } else if (results.summary.overallStatus === 'NEEDS_ATTENTION') {
      console.warn('⚠️ [增强完整性校验] 发现问题:', {
        总问题数量: totalIssues,
        节点坐标问题: results.nodeCoordinates.issues,
        预览线问题: results.previewLines.issues,
        连接线问题: results.connections.issues
      })
    } else {
      console.log('✅ [增强完整性校验] 系统状态良好，健康评分:', results.summary.healthScore + '%')
    }
    
    return results
  }
  
  /**
   * 🔧 自动修复NaN坐标问题
   * 特别针对audience-split类型节点的Y坐标NaN问题
   */
  fixNaNCoordinates() {
    console.log('🔧 [统一预览线管理器] 开始修复NaN坐标问题')
    
    const fixResults = {
      fixed: 0,
      failed: 0,
      details: []
    }
    
    const allNodes = this.graph.getNodes()
    
    allNodes.forEach(node => {
      try {
        const position = node.getPosition()
        const nodeData = node.getData() || {}
        const nodeType = nodeData.type || 'unknown'
        
        if (!position || isNaN(position.x) || isNaN(position.y)) {
          console.log(`🔧 修复节点坐标: ${node.id} (${nodeType})`, position)
          
          // 计算修复后的坐标
          let fixedX = position?.x || 0
          let fixedY = position?.y || 0
          
          if (isNaN(fixedX)) {
            fixedX = 100 // 默认X坐标
          }
          
          if (isNaN(fixedY)) {
            // 根据节点类型计算Y坐标
            if (nodeType === 'audience-split') {
              // 尝试从布局引擎获取正确的Y坐标
              if (window.layoutEngine && typeof window.layoutEngine.calculateLayerY === 'function') {
                try {
                  const layerIndex = this.getNodeLayerIndex(node)
                  fixedY = window.layoutEngine.calculateLayerY(layerIndex)
                  console.log(`🎯 使用布局引擎计算Y坐标: ${fixedY} (层级: ${layerIndex})`)
                } catch (error) {
                  console.warn('布局引擎计算失败，使用默认值:', error.message)
                  fixedY = 200 // audience-split默认Y坐标
                }
              } else {
                fixedY = 200 // audience-split默认Y坐标
              }
            } else {
              fixedY = 100 // 其他节点默认Y坐标
            }
          }
          
          // 应用修复后的坐标
          node.setPosition({ x: fixedX, y: fixedY }, { silent: true })
          
          fixResults.fixed++
          fixResults.details.push({
            nodeId: node.id,
            nodeType: nodeType,
            originalPosition: position,
            fixedPosition: { x: fixedX, y: fixedY },
            status: 'fixed'
          })
          
          console.log(`✅ 节点坐标已修复: ${node.id} -> (${fixedX}, ${fixedY})`)
        }
      } catch (error) {
        fixResults.failed++
        fixResults.details.push({
          nodeId: node.id,
          error: error.message,
          status: 'failed'
        })
        console.error(`❌ 修复节点坐标失败: ${node.id}`, error)
      }
    })
    
    console.log('🔧 [坐标修复] 完成:', {
      修复成功: fixResults.fixed,
      修复失败: fixResults.failed,
      详细信息: fixResults.details
    })
    
    return fixResults
  }
  
  /**
   * 🔧 获取节点层级索引（用于坐标修复）
   */
  getNodeLayerIndex(node) {
    try {
      const nodeData = node.getData() || {}
      
      // 优先使用节点数据中的layer信息
      if (nodeData.layer !== undefined) {
        return nodeData.layer
      }
      
      // 根据节点类型推断层级
      const nodeType = nodeData.type || 'unknown'
      const typeLayerMap = {
        'start': 0,
        'audience-split': 1,
        'condition': 2,
        'action': 3,
        'end': 4
      }
      
      return typeLayerMap[nodeType] || 1
    } catch (error) {
      console.warn('获取节点层级失败，使用默认值:', error.message)
      return 1
    }
  }
  
  /**
   * 销毁管理器
   */
  destroy() {
    // 清理所有预览线
    this.previewLines.forEach((instance, nodeId) => {
      this.removePreviewLine(nodeId)
    })
    
    // 移除事件监听器
    this.graph.off('node:added')
    this.graph.off('node:removed')
    this.graph.off('node:move')
    this.graph.off('node:moved')
    this.graph.off('node:mousedown')
    this.graph.off('node:mouseup')
    this.graph.off('edge:added')
    this.graph.off('edge:removed')
    this.graph.off('blank:mouseup')
    
    document.removeEventListener('mousemove', this.handleGlobalMouseMove)
    document.removeEventListener('mouseup', this.handleGlobalMouseUp)
    
    // 清理状态
    this.previewLines.clear()
    this.nodeStates.clear()
    this.eventListeners.clear()
    
    // 清理缓存
    this.branchInfoCache.clear()
    this.positionCache.clear()
    
    // 清理定时器
    if (this.cacheCleanupInterval) {
      clearInterval(this.cacheCleanupInterval)
      this.cacheCleanupInterval = null
    }
    
    // 清理防抖定时器
    if (this.nodeMoveDebounceTimers) {
      this.nodeMoveDebounceTimers.forEach((timer) => {
        clearTimeout(timer)
      })
      this.nodeMoveDebounceTimers.clear()
      this.nodeMoveDebounceTimers = null
    }
    
    console.log('🧹 [统一预览线管理器] 已销毁 - 包括缓存清理和防抖定时器清理')
  }
}

export default UnifiedPreviewLineManager