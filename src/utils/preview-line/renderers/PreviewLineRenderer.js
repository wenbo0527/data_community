/**
 * 预览线渲染器
 * 负责预览线的创建、更新、删除和状态管理
 * 从 PreviewLineSystem 中提取的渲染相关功能
 */

import { StyleRenderer } from './StyleRenderer.js'
import { UnifiedPreviewStates } from '../core/PreviewLineStates.js'
import GeometryUtils from '../utils/GeometryUtils.js';
import ValidationUtils from '../utils/ValidationUtils.js';
import BranchLabelUtils from '../utils/BranchLabelUtils.js';
import RouterConfigManager from '../algorithms/RouterConfigManager.js';
import NodeMethodValidator from '../utils/NodeMethodValidator.js';

export class PreviewLineRenderer {
  constructor(options = {}) {
    // 🔧 修复：重构构造函数，确保方法定义在属性设置之前
    
    // 1. 首先初始化基础属性
    this.graph = null;
    this.graphValidated = false;
    this.eventManager = options.eventManager;
    this.stateManager = options.stateManager;
    this.configManager = options.configManager;
    
    // 2. 初始化存储结构
    this.previewLines = new Map();
    this.endpointHighlights = new Map();
    this.pendingOperations = [];
    
    // 3. 初始化统计信息
    this.stats = {
      created: 0,
      updated: 0,
      removed: 0,
      stateChanges: 0
    };
    
    // 4. 创建 StyleRenderer（允许 graph 为 null）
    this.styleRenderer = new StyleRenderer({
      graph: null, // 稍后通过 setGraph 设置
      eventManager: this.eventManager,
      configManager: this.configManager
    });
    
    console.log('✅ [预览线渲染器] StyleRenderer 初始化完成:', {
      hasStyleRenderer: !!this.styleRenderer,
      styleRendererType: typeof this.styleRenderer
    });
    
    // 5. 创建 graph 实例的备份引用（如果提供）
    if (options.graph) {
      Object.defineProperty(this, '_graphRef', {
        value: options.graph,
        writable: false,
        enumerable: false,
        configurable: false
      });
      console.log('✅ [预览线渲染器] graph 实例备份引用已创建');
    }
    
    // 6. 🔧 关键修复：延迟 graph 设置，确保 setGraph 方法已定义
    // 使用 setTimeout 确保构造函数完成后再调用 setGraph
    if (options.graph) {
      setTimeout(() => {
        if (typeof this.setGraph === 'function') {
          const success = this.setGraph(options.graph);
          if (!success) {
            console.warn('⚠️ [预览线渲染器] 延迟 graph 设置失败，将在运行时重试');
          }
        } else {
          console.error('❌ [预览线渲染器] setGraph 方法未定义，无法设置 graph');
        }
      }, 0);
    } else {
      console.warn('⚠️ [预览线渲染器] 初始化时缺少 graph 参数，将在运行时进行验证');
    }
    
    console.log('🎨 [预览线渲染器] 初始化完成', {
      graphType: options.graph?.constructor?.name,
      graphValidated: this.graphValidated,
      hasEventManager: !!this.eventManager,
      hasStateManager: !!this.stateManager,
      hasConfigManager: !!this.configManager,
      hasStyleRenderer: !!this.styleRenderer
    });
  }

  /**
   * 重新注入 graph 实例
   * @param {Object} graph - graph 实例
   */
  setGraph(graph) {
    if (!graph) {
      console.warn('⚠️ [预览线渲染器] 尝试注入空的 graph 实例')
      return false
    }
    
    this.graph = graph
    this.graphValidated = true
    
    // 🔧 简化：确保 styleRenderer 始终存在且更新 graph 引用
    if (this.styleRenderer) {
      this.styleRenderer.graph = graph
    }
    
    console.log('✅ [预览线渲染器] graph 实例注入成功')
    return true
  }

  /**
   * 处理待执行的操作 - 简化版本
   */
  processPendingOperations() {
    // 简化：移除复杂的待执行操作队列机制
    // 直接清空队列，不再处理
    this.pendingOperations = []
  }

  /**
   * 验证 graph 实例是否可用
   */
  validateGraph() {
    console.log('🔍 [预览线渲染器] 验证 graph 实例:', {
      graphExists: !!this.graph,
      graphValidated: this.graphValidated,
      graphType: typeof this.graph,
      graphConstructor: this.graph?.constructor?.name
    })
    
    if (!this.graph) {
      console.error('❌ [预览线渲染器] graph 实例验证失败: graph 实例为空', {
        graphExists: false,
        graphValidated: this.graphValidated
      })
      return { valid: false, reason: 'graph 实例为空' }
    }
    
    const requiredMethods = ['addEdge', 'getEdges', 'hasCell', 'getCellById', 'getNodes']
    const missingMethods = requiredMethods.filter(method => typeof this.graph[method] !== 'function')
    
    if (missingMethods.length > 0) {
      console.error('❌ [预览线渲染器] graph 实例验证失败: 缺少必要方法', {
        missingMethods: missingMethods,
        availableMethods: Object.getOwnPropertyNames(this.graph).filter(name => typeof this.graph[name] === 'function')
      })
      return { valid: false, reason: `缺少必要方法: ${missingMethods.join(', ')}` }
    }
    
    try {
      // 测试 graph 实例是否正常工作
      this.graph.getNodes()
      console.log('✅ [预览线渲染器] graph 实例验证通过')
      return { valid: true }
    } catch (error) {
      console.error('❌ [预览线渲染器] graph 实例验证失败: 运行时异常', error)
      return { valid: false, reason: `graph 实例异常: ${error.message}` }
    }
  }

  /**
   * 设置位置计算器
   * @param {Object} positionCalculator - 位置计算器实例
   */
  setPositionCalculator(positionCalculator) {
    this.positionCalculator = positionCalculator
  }

  /**
   * 设置碰撞检测器
   * @param {Object} collisionDetector - 碰撞检测器实例
   */
  setCollisionDetector(collisionDetector) {
    this.collisionDetector = collisionDetector
  }

  /**
   * 设置分支标签工具类
   * @param {Object} branchLabelUtils - 分支标签工具类实例
   */
  setBranchLabelUtils(branchLabelUtils) {
    this.branchLabelUtils = branchLabelUtils
  }

  /**
   * 设置性能优化器
   * @param {Object} performanceOptimizer - 性能优化器实例
   */
  setPerformanceOptimizer(performanceOptimizer) {
    this.performanceOptimizer = performanceOptimizer
  }

  /**
   * 设置缓存管理器
   * @param {Object} cacheManager - 缓存管理器实例
   */
  setCacheManager(cacheManager) {
    this.cacheManager = cacheManager
  }

  /**
   * 设置预览线状态
   * 从 PreviewLineSystem 迁移
   * @param {Object} previewInstance - 预览线实例
   * @param {string} state - 状态
   */
  setPreviewLineState(previewInstance, state) {
    if (!previewInstance || !previewInstance.line) {
      console.warn('⚠️ [预览线渲染器] 预览线实例无效')
      return
    }
    
    // 双重验证：检查源节点是否存在
    if (previewInstance.sourceNode) {
      const sourceNode = previewInstance.sourceNode
      
      // 检查节点对象是否有效
      if (!sourceNode || !sourceNode.id) {
        console.warn('⚠️ [预览线渲染器] 预览线的源节点对象无效')
        return
      }
      
      // 检查节点是否在graph中存在
      if (this.graph && !this.graph.hasCell(sourceNode.id)) {
        console.warn('⚠️ [预览线渲染器] 预览线的源节点不在graph中:', sourceNode.id)
        return
      }
      
      // 检查节点是否已被移除
      if (sourceNode.removed || sourceNode.isRemoved?.()) {
        console.warn('⚠️ [预览线渲染器] 预览线的源节点已被移除:', sourceNode.id)
        return
      }
    }

    const { line } = previewInstance
    previewInstance.state = state
    
    // 更新统计
    this.stats.stateChanges++

    console.log('🔧 [预览线渲染器] 设置预览线状态:', {
      lineId: line.id,
      state: state,
      hasStyleRenderer: !!this.styleRenderer
    })

    // 🔧 关键修复：确保 styleRenderer 存在
    if (!this.styleRenderer) {
      console.error('❌ [预览线渲染器] styleRenderer 为 null，无法设置预览线状态')
      return
    }

    // 委托给样式渲染器处理具体的状态配置
    switch (state) {
      case UnifiedPreviewStates.INTERACTIVE:
        this.styleRenderer.configureInteractive(previewInstance)
        this.addInteractivity(previewInstance)
        break
        
      case UnifiedPreviewStates.DRAGGING:
        this.styleRenderer.configureDragging(previewInstance)
        break
        
      case UnifiedPreviewStates.CONNECTED:
        this.styleRenderer.configureConnected(previewInstance)
        this.removeInteractivity(previewInstance)
        break
        
      case UnifiedPreviewStates.HOVER:
        this.styleRenderer.configureHover(previewInstance)
        break
    }
    
    // 触发状态变化事件
    this.eventManager?.emit('previewLine:stateChanged', {
      previewInstance,
      state,
      lineId: line.id
    })
  }

  /**
   * 创建预览线
   * @param {Object} sourceNode - 源节点
   * @param {Object} config - 配置选项
   * @returns {Object} 预览线实例
   */
  createPreviewLine(sourceNode, config = {}) {
    console.log('🎯 [预览线渲染器] 开始创建预览线:', {
      sourceNodeId: sourceNode?.id || sourceNode?.getId?.() || 'unknown',
      config: config
    })
    
    try {
      // 🔧 关键修复：增强 graph 实例检查和恢复机制
      if (!this.graph && this._graphRef) {
        console.log('🔄 [预览线渲染器] 检测到 graph 实例丢失，尝试从备份引用恢复')
        this.graph = this._graphRef
        this.graphValidated = true
      }
      
      // 🔧 关键修复：实时验证 graph 实例
      const graphValidation = this.validateGraph()
      
      if (!graphValidation.valid) {
        const errorMsg = `❌ [预览线渲染器] graph 实例验证失败: ${graphValidation.reason}`
        console.error(errorMsg, {
          sourceNodeId: sourceNode?.id || sourceNode?.getId?.() || 'unknown',
          config: config,
          graphExists: !!this.graph,
          graphValidated: this.graphValidated,
          hasBackupRef: !!this._graphRef
        })
        
        // 如果 graph 不可用，将操作加入待处理队列
        if (!this.isWaitingForGraph) {
          this.isWaitingForGraph = true
          console.log('⏳ [预览线渲染器] 将操作加入待处理队列，等待 graph 实例可用')
        }
        
        this.pendingOperations.push({
          type: 'createPreviewLine',
          execute: () => this.createPreviewLine(sourceNode, config)
        })
        
        throw new Error(`PreviewLineRenderer: ${graphValidation.reason}`)
      }

      // 验证 graph 实例是否具有必要的方法
      const requiredMethods = ['addEdge', 'getEdges', 'getCellById', 'getNodes', 'hasCell']
      const missingMethods = requiredMethods.filter(method => typeof this.graph[method] !== 'function')
      
      if (missingMethods.length > 0) {
        const errorMsg = `❌ [预览线渲染器] graph 实例缺少必要方法: ${missingMethods.join(', ')}`
        console.error(errorMsg, {
          graphType: this.graph?.constructor?.name,
          availableMethods: Object.getOwnPropertyNames(this.graph).filter(name => typeof this.graph[name] === 'function'),
          missingMethods: missingMethods,
          sourceNodeId: sourceNode?.id || sourceNode?.getId?.() || 'unknown'
        })
        throw new Error(`PreviewLineRenderer: graph 实例缺少必要的方法: ${missingMethods.join(', ')}`)
      }
      
      // 实时验证 graph 实例状态
      try {
        const testResult = this.graph.getNodes()
        console.log('✅ [预览线渲染器] Graph 实例状态验证通过，当前节点数:', testResult?.length || 0)
      } catch (testError) {
        const errorMsg = '❌ [预览线渲染器] Graph 实例状态异常'
        console.error(errorMsg, testError)
        throw new Error(`PreviewLineRenderer: graph 实例状态异常: ${testError.message}`)
      }

      console.log('✅ [预览线渲染器] graph 实例验证通过:', {
        graphExists: !!this.graph,
        graphType: this.graph?.constructor?.name,
        hasAddEdge: typeof this.graph.addEdge === 'function',
        hasGetEdges: typeof this.graph.getEdges === 'function',
        hasHasCell: typeof this.graph.hasCell === 'function'
      })
      
      // 1. 节点验证
      const nodeValidation = NodeMethodValidator.validateNodeMethods(sourceNode)
      if (!nodeValidation.isValid) {
        console.warn('🔍 [预览线渲染器] 节点验证失败，创建安全包装器:', nodeValidation)
        sourceNode = NodeMethodValidator.createSafeNodeWrapper(sourceNode)
      }

      // 2. 安全包装
      const safeNode = NodeMethodValidator.createSafeNodeWrapper(sourceNode)
      
      // 3. 构建边配置
      const edgeConfig = this.buildEdgeConfig(safeNode, config)
      if (!edgeConfig) {
        const errorMsg = '❌ [预览线渲染器] 边配置构建失败'
        console.error(errorMsg, {
          sourceNodeId: safeNode?.id,
          config: config
        })
        throw new Error('PreviewLineRenderer: 边配置构建失败')
      }
      
      console.log('🔧 [预览线渲染器] 构建的边配置:', edgeConfig)
      
      // 4. 创建预览线 - 添加详细的调试信息
      console.log('📍 [预览线渲染器] 准备调用 graph.addEdge:', {
        graphExists: !!this.graph,
        graphType: this.graph?.constructor?.name,
        edgeId: edgeConfig.id,
        edgeSource: edgeConfig.source,
        edgeTarget: edgeConfig.target,
        edgeConfig: edgeConfig
      })
      
      // 🔧 关键修复：再次确认 graph 实例在调用前仍然存在并进行最终验证
      if (!this.graph || typeof this.graph.addEdge !== 'function') {
        const errorMsg = '❌ [预览线渲染器] graph 实例在调用前变为无效'
        console.error(errorMsg, {
          graphExists: !!this.graph,
          graphType: typeof this.graph,
          hasAddEdge: this.graph ? typeof this.graph.addEdge === 'function' : false
        })
        throw new Error('PreviewLineRenderer: graph 实例在调用前变为无效')
      }
      
      // 最终的 graph 实例状态检查
      try {
        // 测试 graph 实例是否可以正常工作
        const currentNodes = this.graph.getNodes()
        const currentEdges = this.graph.getEdges()
        console.log('🔍 [预览线渲染器] 最终 graph 状态检查通过:', {
          nodeCount: currentNodes?.length || 0,
          edgeCount: currentEdges?.length || 0,
          graphReady: true
        })
      } catch (graphTestError) {
        const errorMsg = '❌ [预览线渲染器] Graph 实例最终状态检查失败'
        console.error(errorMsg, graphTestError)
        throw new Error(`PreviewLineRenderer: graph 实例最终状态检查失败: ${graphTestError.message}`)
      }
      
      let line
      try {
        console.log('🚀 [预览线渲染器] 执行 graph.addEdge 调用...')
        line = this.graph.addEdge(edgeConfig)
        console.log('✅ [预览线渲染器] graph.addEdge 调用成功，返回结果:', !!line)
      } catch (addEdgeError) {
        const errorMsg = '❌ [预览线渲染器] graph.addEdge 调用失败'
        console.error(errorMsg, addEdgeError, {
          edgeConfig: edgeConfig,
          graphState: {
            nodeCount: this.graph.getNodes?.()?.length || 'unknown',
            edgeCount: this.graph.getEdges?.()?.length || 'unknown'
          }
        })
        throw new Error(`PreviewLineRenderer: graph.addEdge 调用失败: ${addEdgeError.message}`)
      }
      
      // 5. 验证 addEdge 调用结果
      if (!line) {
        const errorMsg = '❌ [预览线渲染器] graph.addEdge 返回了空值'
        console.error(errorMsg, {
          edgeConfig: edgeConfig,
          graphState: {
            nodeCount: this.graph.getNodes?.()?.length || 'unknown',
            edgeCount: this.graph.getEdges?.()?.length || 'unknown'
          }
        })
        throw new Error('PreviewLineRenderer: graph.addEdge 返回了空值')
      }

      // 6. 立即验证预览线是否被成功添加
      let isInGraph = false
      let allEdges = []
      let edgeCount = 0
      let foundEdge = null
      
      try {
        if (typeof this.graph.hasCell === 'function') {
          isInGraph = this.graph.hasCell(edgeConfig.id)
        }
        if (typeof this.graph.getEdges === 'function') {
          allEdges = this.graph.getEdges()
          edgeCount = allEdges.length
          foundEdge = allEdges.find(edge => edge.id === edgeConfig.id)
        }
      } catch (validationError) {
        console.warn('⚠️ [预览线渲染器] 预览线验证时出错:', validationError)
      }
      
      console.log('🔍 [预览线渲染器] 预览线添加后的验证:', {
        lineCreated: !!line,
        lineId: line?.id,
        isInGraph: isInGraph,
        totalEdgesInGraph: edgeCount,
        foundInEdgesList: !!foundEdge,
        edgeVisible: foundEdge?.visible !== false,
        edgeOpacity: foundEdge?.getAttrByPath?.('line/opacity') || 'unknown',
        allEdgeIds: allEdges.map(e => e.id)
      })
      
      // 验证预览线是否成功添加到图形中
      let addedLine = null
      try {
        if (typeof this.graph.getCellById === 'function') {
          addedLine = this.graph.getCellById(edgeConfig.id)
        }
      } catch (getCellError) {
        console.warn('⚠️ [预览线渲染器] 获取添加的预览线时出错:', getCellError)
      }
      
      if (!addedLine) {
        console.error(`❌ [PreviewLineRenderer] 预览线添加失败，无法在图形中找到边: ${edgeConfig.id}`)
        try {
          if (typeof this.graph.getEdges === 'function') {
            console.error(`❌ [PreviewLineRenderer] 图形中当前所有边:`, this.graph.getEdges().map(e => e.id))
          }
        } catch (getEdgesError) {
          console.error(`❌ [PreviewLineRenderer] 获取图形边列表时出错:`, getEdgesError)
        }
        return null
      }
      
      console.log(`✅ [PreviewLineRenderer] 预览线已成功添加到图形: ${edgeConfig.id}`, {
        edgeExists: !!addedLine,
        edgeType: addedLine.constructor.name,
        isVisible: addedLine.isVisible ? addedLine.isVisible() : true,
        zIndex: addedLine.getZIndex ? addedLine.getZIndex() : 1,
        totalEdgesInGraph: this.graph.getEdges().length
      })
      
      if (!line) {
        console.error('❌ [预览线渲染器] graph.addEdge 返回了空值!', {
          edgeConfig: edgeConfig,
          graphState: {
            nodeCount: this.graph.getNodes().length,
            edgeCount: this.graph.getEdges().length
          }
        })
        throw new Error('graph.addEdge 返回了空值')
      }
      
      if (!isInGraph) {
        console.error('❌ [预览线渲染器] 预览线未被正确添加到图形中!', {
          expectedId: edgeConfig.id,
          actualEdgeIds: allEdges.map(e => e.id),
          graphCells: this.graph.getCells().map(c => ({ id: c.id, type: c.shape }))
        })
        throw new Error('预览线未被正确添加到图形中')
      }
      
      // 6. 强制设置预览线的可见性和样式
      try {
        // 确保预览线可见
        line.setVisible(true)
        
        // 设置透明度
        const opacity = config.opacity || 0.6
        line.setAttrByPath('line/opacity', opacity)
        
        // 设置层级
        line.setZIndex(1000)
        
        // 强制设置stroke属性确保可见
        const nodeType = safeNode.getData?.()?.type || 'start'
        const strokeColor = this.getNodeTypeColor(nodeType)
        line.setAttrByPath('line/stroke', strokeColor)
        line.setAttrByPath('line/strokeWidth', 2)
        line.setAttrByPath('line/strokeDasharray', '5,5') // 虚线样式
        
        // 🔧 修复：强制设置预览线为可见状态
        line.attr('line/display', 'block')
        line.attr('line/visibility', 'visible')
        
        // 🔧 修复：确保预览线在DOM中正确渲染
        if (line.view && line.view.el) {
          line.view.el.style.display = 'block'
          line.view.el.style.visibility = 'visible'
        }
        
        // 强制刷新视图
        if (this.graph && typeof this.graph.refreshViews === 'function') {
          this.graph.refreshViews()
        }
        
        // 🔧 修复：强制重绘预览线
        if (line.view && typeof line.view.update === 'function') {
          line.view.update()
        }
        
        console.log('✅ [预览线渲染器] 强制设置预览线样式完成:', {
          visible: line.visible,
          opacity: line.getAttrByPath('line/opacity'),
          zIndex: line.getZIndex(),
          stroke: line.getAttrByPath('line/stroke'),
          strokeWidth: line.getAttrByPath('line/strokeWidth'),
          strokeDasharray: line.getAttrByPath('line/strokeDasharray'),
          display: line.getAttrByPath('line/display'),
          visibility: line.getAttrByPath('line/visibility')
        })
      } catch (styleError) {
        console.warn('⚠️ [预览线渲染器] 设置预览线样式时出错:', styleError)
      }
      
      // 7. 创建预览线实例
      const previewInstance = {
        id: edgeConfig.id,
        line: line,
        sourceNode: safeNode,
        config: config,
        state: config.state || UnifiedPreviewStates.INTERACTIVE,
        createdAt: Date.now()
      }
      
      // 8. 存储预览线实例
      this.previewLines.set(edgeConfig.id, previewInstance)
      
      // 9. 设置初始状态
      this.setPreviewLineState(previewInstance, previewInstance.state)
      
      // 10. 更新统计
      this.stats.created++
      
      // 11. 最终验证
      const finalCheck = {
        storedInRenderer: this.previewLines.has(edgeConfig.id),
        stillInGraph: this.graph.hasCell(edgeConfig.id),
        finalEdgeCount: this.graph.getEdges().length,
        lineVisible: line.visible,
        lineOpacity: line.getAttrByPath ? line.getAttrByPath('line/opacity') : 'N/A',
        lineStroke: line.getAttrByPath ? line.getAttrByPath('line/stroke') : 'N/A',
        lineStrokeWidth: line.getAttrByPath ? line.getAttrByPath('line/strokeWidth') : 'N/A'
      }
      
      console.log('🎉 [预览线渲染器] 预览线创建完成 - 最终检查:', finalCheck)
      
      // 额外验证：检查预览线是否真的在图形中可见
      const graphEdges = this.graph.getEdges()
      const createdEdge = graphEdges.find(edge => edge.id === edgeConfig.id)
      if (createdEdge) {
        console.log('✅ [预览线渲染器] 预览线在图形边列表中找到:', {
          edgeId: createdEdge.id,
          edgeVisible: createdEdge.visible,
          edgeData: createdEdge.getData ? createdEdge.getData() : {}
        })
      } else {
        console.error('❌ [预览线渲染器] 预览线未在图形边列表中找到!')
      }
      
      // 12. 触发创建事件
      this.eventManager?.emit('previewLine:created', {
        previewInstance,
        sourceNode: safeNode
      })
      
      return previewInstance
      
    } catch (error) {
      console.error('❌ [预览线渲染器] 创建预览线失败:', error)
      console.error('错误堆栈:', error.stack)
      throw error
    }
  }

  /**
   * 构建边配置
   * @param {Object} sourceNode - 源节点
   * @param {Object} config - 配置选项
   * @returns {Object} 边配置
   */
  buildEdgeConfig(sourceNode, config = {}) {
    // 使用节点方法验证器验证节点
    const nodeValidation = NodeMethodValidator.validateNodeMethods(sourceNode);
    
    if (!nodeValidation.isValid) {
      console.error('❌ [预览线渲染器] buildEdgeConfig: 节点验证失败:', {
        nodeId: nodeValidation.nodeInfo.id,
        missingMethods: nodeValidation.missingMethods
      });
      
      // 尝试使用安全包装器
      sourceNode = NodeMethodValidator.createSafeNodeWrapper(sourceNode);
      const wrapperValidation = NodeMethodValidator.validateNodeMethods(sourceNode);
      if (!wrapperValidation.isValid) {
        console.error('❌ [预览线渲染器] buildEdgeConfig: 安全包装器创建失败');
        return null;
      }
    }
    
    // 安全获取节点数据
    const nodeData = (typeof sourceNode.getData === 'function' ? sourceNode.getData() : sourceNode.data || sourceNode.store?.data?.data) || {}
    const nodeType = nodeData.type || nodeData.nodeType
    
    // 生成预览线ID
    const previewId = `preview_${sourceNode.id}_${Date.now()}`
    
    // 基础配置
    const baseConfig = {
      id: previewId,
      shape: 'edge',
      source: {
        cell: sourceNode.id,
        port: 'out'  // 确保使用正确的out端口
      },
      target: config.target || this.calculateDefaultTarget(sourceNode),
      router: {
        name: 'orth',
        args: {
          padding: 20,
          step: 20
        }
      },
      connector: {
        name: 'rounded'
      },
      attrs: {
        line: {
          stroke: this.getNodeTypeColor(nodeType),
          strokeWidth: 2,
          strokeDasharray: '5,5',
          targetMarker: {
            name: 'classic',
            size: 8
          }
        }
      },
      data: {
        type: 'preview-line',
        sourceNodeId: sourceNode.id,
        sourceNodeType: nodeType,  // 添加源节点类型信息
        branchId: config.branchId,
        branchLabel: config.branchLabel,
        isUnifiedPreview: true,
        createdAt: Date.now()
      }
    }
    
    // 添加标签（如果有）
    if (config.branchLabel) {
      baseConfig.labels = [{
        attrs: {
          text: {
            text: config.branchLabel,
            fill: '#333',
            fontSize: 14,
            fontWeight: 'bold',
            textAnchor: 'middle',
            textVerticalAnchor: 'middle'
          },
          rect: {
            fill: '#fff',
            stroke: this.getNodeTypeColor(nodeType),
            strokeWidth: 2,
            rx: 4,
            ry: 4
          }
        },
        position: 0.8
      }]
    }
    
    return baseConfig
  }

  /**
   * 计算默认目标位置
   * @param {Object} sourceNode - 源节点
   * @returns {Object} 目标位置
   */
  calculateDefaultTarget(sourceNode) {
    // 使用节点方法验证器验证节点
    const nodeValidation = NodeMethodValidator.validateNodeMethods(sourceNode);
    
    if (!nodeValidation.isValid) {
      console.error('❌ [预览线渲染器] calculateDefaultTarget: 节点验证失败:', {
        nodeId: nodeValidation.nodeInfo.id,
        missingMethods: nodeValidation.missingMethods
      });
      
      // 尝试使用安全包装器
      sourceNode = NodeMethodValidator.createSafeNodeWrapper(sourceNode);
      const wrapperValidation = NodeMethodValidator.validateNodeMethods(sourceNode);
      if (!wrapperValidation.isValid) {
        console.error('❌ [预览线渲染器] calculateDefaultTarget: 安全包装器创建失败');
        return { x: 0, y: 0 };
      }
    }
    
    const position = sourceNode.getPosition()
    const size = sourceNode.getSize()
    
    return {
      x: position.x + size.width / 2,
      y: position.y + size.height + 100
    }
  }

  /**
   * 获取节点类型对应的颜色
   * @param {string} nodeType - 节点类型
   * @returns {string} 颜色值
   */
  getNodeTypeColor(nodeType) {
    const colorMap = {
      'start': '#1890ff',
      'sms': '#52c41a',
      'ai-call': '#722ed1',
      'manual-call': '#fa8c16',
      'audience-split': '#13c2c2',
      'event-split': '#eb2f96',
      'ab-test': '#f5222d',
      'end': '#8c8c8c'
    }
    
    return colorMap[nodeType] || '#1890ff'
  }

  /**
   * 更新预览线
   * @param {string} lineId - 预览线ID
   * @param {Object} updates - 更新内容
   */
  updatePreviewLine(lineId, updates = {}) {
    const previewInstance = this.previewLines.get(lineId)
    if (!previewInstance) {
      // 改为调试信息，避免不必要的警告
      console.debug('🔍 [预览线渲染器] 预览线实例不存在，跳过更新:', lineId)
      return false
    }
    
    try {
      const { line } = previewInstance
      
      // 更新目标位置
      if (updates.target) {
        line.setTarget(updates.target)
      }
      
      // 更新样式
      if (updates.attrs) {
        line.setAttrs(updates.attrs)
      }
      
      // 更新标签
      if (updates.labels) {
        line.setLabels(updates.labels)
      }
      
      // 更新数据
      if (updates.data) {
        const currentData = line.getData() || {}
        line.setData({ ...currentData, ...updates.data })
      }
      
      // 更新预览线实例
      Object.assign(previewInstance, updates.instance || {})
      
      // 更新统计
      this.stats.updated++
      
      console.log('✅ [预览线渲染器] 预览线更新成功:', lineId)
      
      // 触发更新事件
      this.eventManager?.emit('previewLine:updated', {
        previewInstance,
        updates,
        lineId
      })
      
      return true
      
    } catch (error) {
      console.error('❌ [预览线渲染器] 更新预览线失败:', error)
      return false
    }
  }

  /**
   * 移除预览线
   * @param {string} lineId - 预览线ID
   */
  removePreviewLine(lineId) {
    try {
      console.log('🗑️ [预览线渲染器] 开始移除预览线:', lineId)
      
      const previewInstance = this.previewLines.get(lineId)
      if (!previewInstance) {
        // 改为调试信息，避免不必要的警告
        console.debug('🔍 [预览线渲染器] 预览线实例不存在，跳过删除:', lineId)
        return true // 返回true表示成功（目标已不存在）
      }
      
      const { line } = previewInstance
      console.log('🔍 [预览线渲染器] 预览线实例详情:', {
        lineId: lineId,
        hasLine: !!line,
        lineInGraph: line ? this.graph.hasCell(line.id) : false,
        graphEdgeCount: this.graph.getEdges().length
      })
      
      // 移除交互能力
      try {
        this.removeInteractivity(previewInstance)
      } catch (interactivityError) {
        console.warn('移除预览线交互能力失败:', interactivityError.message);
      }
      
      // 移除终点高亮
      try {
        this.removeEndpointHighlight(line)
      } catch (highlightError) {
        console.warn('移除预览线终点高亮失败:', highlightError.message);
      }
      
      // 从图中移除预览线
      if (line && this.graph && this.graph.hasCell(line.id)) {
        console.log('🗑️ [预览线渲染器] 从图中移除预览线:', line.id)
        this.graph.removeCell(line.id)
        
        // 验证是否真的被移除
        const stillInGraph = this.graph.hasCell(line.id)
        console.log('🔍 [预览线渲染器] 移除后验证:', {
          lineId: line.id,
          stillInGraph: stillInGraph,
          newEdgeCount: this.graph.getEdges().length
        })
      } else {
        console.debug('🔍 [预览线渲染器] 预览线不在图中或图不可用，无需从图中移除:', line?.id || lineId)
      }
      
      // 从存储中移除
      this.previewLines.delete(lineId)
      
      // 更新统计
      this.stats.removed++
      
      console.log('✅ [预览线渲染器] 预览线移除成功:', lineId)
      
      // 安全地触发移除事件
      try {
        this.eventManager?.emit('previewLine:removed', {
          previewInstance,
          lineId
        })
      } catch (eventError) {
        console.warn('触发预览线移除事件失败:', eventError.message);
      }
      
      return true
      
    } catch (error) {
      console.error('❌ [预览线渲染器] 移除预览线失败:', error)
      return false
    }
  }

  /**
   * 删除预览线（removePreviewLine的别名，用于兼容PreviewLineSystem的调用）
   * @param {string} lineId - 预览线ID
   * @returns {boolean} 是否删除成功
   */
  deletePreviewLine(lineId) {
    try {
      console.log('🗑️ [预览线渲染器] 尝试删除预览线:', lineId)
      
      // 检查预览线是否存在
      const exists = this.previewLines.has(lineId)
      console.log('🔍 [预览线渲染器] 预览线存在性检查:', { lineId, exists })
      
      if (!exists) {
        // 改为调试信息，避免不必要的警告
        console.debug('🔍 [预览线渲染器] 预览线不存在，跳过删除:', lineId)
        return true // 返回true表示"删除成功"（因为目标已经不存在了）
      }
      
      const result = this.removePreviewLine(lineId)
      console.log('🔍 [预览线渲染器] 删除结果:', { lineId, result })
      
      return result
    } catch (error) {
      console.error('删除预览线失败:', error.message);
      return false;
    }
  }

  /**
   * 检查预览线是否存在
   * @param {string} lineId - 预览线ID
   * @returns {boolean} 是否存在预览线
   */
  hasPreviewLine(lineId) {
    return this.previewLines.has(lineId)
  }

  /**
   * 添加交互能力
   * 从 PreviewLineSystem 迁移
   * @param {Object} previewInstance - 预览线实例
   */
  addInteractivity(previewInstance) {
    const { line } = previewInstance
    
    // 为预览线添加拖拽功能
    this.addPreviewLineEndpointDrag(previewInstance)
    
    console.log('✅ [预览线渲染器] 添加交互能力:', line.id)
  }

  /**
   * 移除交互能力
   * 从 PreviewLineSystem 迁移
   * @param {Object} previewInstance - 预览线实例
   */
  removeInteractivity(previewInstance) {
    const { line } = previewInstance
    
    // 移除预览线终点拖拽功能
    this.removePreviewLineEndpointDrag(previewInstance)
    
    console.log('🗑️ [预览线渲染器] 移除交互能力:', line.id)
  }

  /**
   * 为预览线终点添加拖拽功能
   * 从 PreviewLineSystem 迁移
   * @param {Object} previewInstance - 预览线实例
   */
  addPreviewLineEndpointDrag(previewInstance) {
    const { line, sourceNode } = previewInstance
    
    // 设置预览线终点的可视化样式
    this.styleRenderer.updatePreviewLineEndpointStyle(previewInstance, false)
    
    // 设置预览线终点拖拽功能
    this.setupPreviewLineEndpointDrag(line)
    
    console.log('✅ [预览线渲染器] 添加终点拖拽功能:', {
      lineId: line.id,
      sourceNodeId: sourceNode?.id,
      branchId: previewInstance.branchId
    })
  }

  /**
   * 移除预览线终点拖拽功能
   * 从 PreviewLineSystem 迁移
   * @param {Object} previewInstance - 预览线实例
   */
  removePreviewLineEndpointDrag(previewInstance) {
    const { line } = previewInstance
    
    // 重置预览线样式
    this.styleRenderer.updatePreviewLineEndpointStyle(previewInstance, false)
    
    console.log('🗑️ [预览线渲染器] 移除终点拖拽功能:', line.id)
  }

  /**
   * 设置预览线终点拖拽功能
   * @param {Object} line - 预览线对象
   */
  setupPreviewLineEndpointDrag(line) {
    // 这里可以添加具体的拖拽逻辑
    // 目前保持简单实现，具体拖拽逻辑由事件管理器处理
    console.log('🔧 [预览线渲染器] 设置终点拖拽:', line.id)
  }

  /**
   * 检查鼠标点击是否在预览线终点附近
   * 从 PreviewLineSystem 迁移
   * @param {Event} event - 鼠标事件
   * @param {Object} previewInstance - 预览线实例
   * @returns {boolean} 是否在终点附近
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
    const logicalCoords = this.graph.clientToGraph(domX, domY)
    
    // 计算距离
    const distance = Math.sqrt(
      Math.pow(logicalCoords.x - targetPoint.x, 2) + 
      Math.pow(logicalCoords.y - targetPoint.y, 2)
    )
    
    // 如果距离小于20像素，认为是点击在终点附近
    const isNearEndpoint = distance < 20
    
    console.log('🎯 [预览线渲染器] 终点点击检测:', {
      lineId: line.id,
      clickPosition: logicalCoords,
      targetPosition: targetPoint,
      distance: distance,
      isNearEndpoint: isNearEndpoint
    })
    
    return isNearEndpoint
  }

  /**
   * 创建终点高亮标记
   * 从 PreviewLineSystem 迁移
   * @param {Object} line - 预览线对象
   * @param {Object} targetPoint - 目标点坐标
   */
  createEndpointHighlight(line, targetPoint) {
    try {
      const highlightId = `endpoint-highlight-${line.id}`
      
      // 移除已存在的高亮标记
      this.removeEndpointHighlight(line)
      
      // 创建终点高亮圆圈
      const highlight = this.graph.addNode({
        id: highlightId,
        shape: 'circle',
        x: targetPoint.x - 8,
        y: targetPoint.y - 8,
        width: 16,
        height: 16,
        attrs: {
          body: {
            fill: 'rgba(64, 128, 255, 0.3)',
            stroke: '#4080FF',
            strokeWidth: 2,
            r: 8
          }
        },
        zIndex: 1000
      })
      
      // 保存高亮标记引用
      this.endpointHighlights.set(line.id, highlight)
      
      // 添加脉冲动画
      this.startHighlightAnimation(line.id, highlight)
      
    } catch (error) {
      console.error('💥 [预览线渲染器] 创建终点高亮失败:', error)
    }
  }

  /**
   * 移除终点高亮标记
   * 从 PreviewLineSystem 迁移
   * @param {Object} line - 预览线对象
   */
  removeEndpointHighlight(line) {
    try {
      if (!line) return
      
      const highlight = this.endpointHighlights.get(line.id)
      if (highlight) {
        this.graph.removeNode(highlight.id)
        this.endpointHighlights.delete(line.id)
      }
    } catch (error) {
      console.error('💥 [预览线渲染器] 移除终点高亮失败:', error)
    }
  }

  /**
   * 开始高亮动画
   * @param {string} lineId - 预览线ID
   * @param {Object} highlight - 高亮节点
   */
  startHighlightAnimation(lineId, highlight) {
    let scale = 1
    let growing = true
    
    const animate = () => {
      if (this.endpointHighlights.has(lineId)) {
        scale += growing ? 0.1 : -0.1
        if (scale >= 1.3) growing = false
        if (scale <= 0.8) growing = true
        
        highlight.setAttrs({
          body: {
            transform: `scale(${scale})`
          }
        })
        
        setTimeout(animate, 100)
      }
    }
    
    animate()
  }



  /**
   * 获取预览线实例
   * @param {string} lineId - 预览线ID
   * @returns {Object|null} 预览线实例
   */
  getPreviewLine(lineId) {
    return this.previewLines.get(lineId) || null
  }

  /**
   * 获取所有预览线实例
   * @returns {Map} 所有预览线实例
   */
  getAllPreviewLines() {
    return new Map(this.previewLines)
  }

  /**
   * 批量更新预览线
   * @param {Array} updates - 更新列表
   */
  batchUpdatePreviewLines(updates = []) {
    const results = []
    
    updates.forEach(update => {
      const result = this.updatePreviewLine(update.lineId, update.data)
      results.push({ lineId: update.lineId, success: result })
    })
    
    console.log('📦 [预览线渲染器] 批量更新完成:', {
      total: updates.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    })
    
    return results
  }

  /**
   * 清理所有预览线
   */
  clearAllPreviewLines() {
    const lineIds = Array.from(this.previewLines.keys())
    let removed = 0
    
    lineIds.forEach(lineId => {
      if (this.removePreviewLine(lineId)) {
        removed++
      }
    })
    
    console.log('🧹 [预览线渲染器] 清理完成:', {
      total: lineIds.length,
      removed: removed
    })
    
    return removed
  }

  /**
   * 获取渲染器统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      activeLines: this.previewLines.size,
      activeHighlights: this.endpointHighlights.size,
      timestamp: Date.now()
    }
  }

  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      created: 0,
      updated: 0,
      removed: 0,
      stateChanges: 0
    }
    
    console.log('📊 [预览线渲染器] 统计信息已重置')
  }

  /**
   * 销毁渲染器
   */
  destroy() {
    console.log('🗑️ [预览线渲染器] 开始销毁...')
    
    // 清理所有预览线
    this.clearAllPreviewLines()
    
    // 销毁样式渲染器
    if (this.styleRenderer && typeof this.styleRenderer.destroy === 'function') {
      this.styleRenderer.destroy()
    }
    
    // 清理引用
    this.graph = null
    this.eventManager = null
    this.stateManager = null
    this.configManager = null
    this.styleRenderer = null
    this.previewLines.clear()
    this.endpointHighlights.clear()
    
    console.log('✅ [预览线渲染器] 销毁完成')
  }
}

export default PreviewLineRenderer