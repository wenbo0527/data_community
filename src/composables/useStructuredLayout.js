/**
 * 原生Dagre布局 Composable
 * 专注于原生Dagre布局，支持预览线和拖拽点处理
 * 布局方式使用自底向上布局优化器处理节点排序
 */

import { ref, computed, nextTick } from 'vue'
import { DagreLayout } from '@antv/layout'
import { Graph } from '@antv/graphlib'
import { coordinateManager } from '../utils/CoordinateSystemManager.js'
import { UnifiedStructuredLayoutEngine } from '../utils/UnifiedStructuredLayoutEngine.js'
import { HierarchyLayoutEngine } from './layout/HierarchyLayoutEngine.js'
import { getLayoutPreviewLineCoordinator } from '../utils/LayoutPreviewLineCoordinator.js'

export function useStructuredLayout(getGraph) {
  const connectionPreviewManager = ref(null)
  const layoutEngineInstance = ref(null)
  const isLayouting = ref(false)
  const layoutOptions = ref({
    centerAfterLayout: true,
    animateTransition: true,
    preserveConnections: true
  })

  /**
   * 查找可以连接的目标节点
   */
  const findConnectableNodes = (graph, sourceNode, nodeType, config) => {
    console.log('🔍 [findConnectableNodes] 开始查找可连接节点:', {
      sourceNodeId: sourceNode.id,
      nodeType,
      config,
      timestamp: new Date().toISOString()
    })
    
    if (!graph) {
      console.error('❌ [findConnectableNodes] 图形实例不存在')
      return []
    }
    
    try {
      const allNodes = graph.getNodes()
      console.log('🔍 [findConnectableNodes] 图中总节点数:', allNodes.length)
      
      const connectableNodes = []
      
      allNodes.forEach((node, index) => {
        if (node.id === sourceNode.id) {
          console.log(`🔍 [findConnectableNodes] 跳过源节点 ${index + 1}/${allNodes.length}: ${node.id}`)
          return // 跳过自己
        }
        
        const nodeData = node.getData() || {}
        const targetNodeType = nodeData.nodeType || nodeData.type
        
        console.log(`🔍 [findConnectableNodes] 检查节点 ${index + 1}/${allNodes.length}:`, {
          nodeId: node.id,
          targetType: targetNodeType,
          nodeData: nodeData
        })
        
        if (targetNodeType === 'endpoint') {
          console.log(`🔍 [findConnectableNodes] 跳过端点节点: ${node.id}`)
          return
        }
        
        const existingEdges = graph.getConnectedEdges(sourceNode)
        const alreadyConnected = existingEdges.some(edge => {
          const target = edge.getTargetCell()
          return target && target.id === node.id
        })
        
        if (alreadyConnected) {
          console.log(`🔍 [findConnectableNodes] 节点已连接，跳过: ${node.id}`)
          return
        }
        
        if (canConnect(sourceNode, node, nodeType, targetNodeType, config)) {
          connectableNodes.push({
            id: node.id,
            type: targetNodeType,
            node: node
          })
          console.log(`✅ [findConnectableNodes] 找到可连接节点:`, {
            id: node.id,
            type: targetNodeType
          })
        } else {
          console.log(`❌ [findConnectableNodes] 节点不可连接: ${nodeType} -> ${targetNodeType}`)
        }
      })
      
      console.log('🔍 [findConnectableNodes] 查找完成，可连接节点总数:', {
        total: connectableNodes.length,
        nodes: connectableNodes.map(n => ({ id: n.id, type: n.type }))
      })
      
      return connectableNodes
      
    } catch (error) {
      console.error('❌ [findConnectableNodes] 查找可连接节点失败:', error)
      return []
    }
  }

  /**
   * 判断两个节点是否可以连接
   */
  const canConnect = (sourceNode, targetNode, sourceType, targetType, config) => {
    // 节点类型映射 - 统一不同的节点类型名称
    const normalizeNodeType = (type) => {
      const typeMapping = {
        'crowd-split': 'audience-split',
        'audience-split': 'audience-split',
        'event-split': 'event-split',
        'ab-test': 'ab-test',
        'ai-call': 'ai-call',
        'manual-call': 'manual-call'
      }
      return typeMapping[type] || type
    }
    
    const normalizedSourceType = normalizeNodeType(sourceType)
    const normalizedTargetType = normalizeNodeType(targetType)
    
    const connectionRules = {
      'start': ['audience-split', 'event-split', 'ab-test', 'sms', 'ai-call', 'manual-call', 'email', 'push', 'webhook', 'delay', 'condition'],
      'audience-split': ['sms', 'ai-call', 'manual-call', 'email', 'push', 'webhook', 'delay', 'condition', 'audience-split', 'event-split'],
      'event-split': ['sms', 'ai-call', 'manual-call', 'email', 'push', 'webhook', 'delay', 'condition', 'audience-split', 'event-split'],
      'ab-test': ['sms', 'ai-call', 'manual-call', 'email', 'push', 'webhook', 'delay', 'condition'],
      'sms': ['delay', 'condition', 'audience-split', 'event-split', 'ai-call', 'manual-call', 'email', 'push', 'webhook'],
      'ai-call': ['delay', 'condition', 'audience-split', 'event-split', 'sms', 'manual-call', 'email', 'push', 'webhook'],
      'manual-call': ['delay', 'condition', 'audience-split', 'event-split', 'sms', 'ai-call', 'email', 'push', 'webhook'],
      'email': ['delay', 'condition', 'audience-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'push', 'webhook'],
      'push': ['delay', 'condition', 'audience-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'email', 'webhook'],
      'webhook': ['delay', 'condition', 'audience-split', 'event-split', 'sms', 'ai-call', 'manual-call', 'email', 'push'],
      'delay': ['sms', 'ai-call', 'manual-call', 'email', 'push', 'webhook', 'condition', 'audience-split', 'event-split'],
      'condition': ['sms', 'ai-call', 'manual-call', 'email', 'push', 'webhook', 'delay', 'audience-split', 'event-split']
    }
    
    const allowedTargets = connectionRules[normalizedSourceType] || []
    const canConnectResult = allowedTargets.includes(normalizedTargetType)
    
    console.log(`🔗 [连接规则检查] ${sourceType}(${normalizedSourceType}) -> ${targetType}(${normalizedTargetType}): ${canConnectResult}`)
    
    return canConnectResult
  }

  /**
   * 创建预览线
   */
  const createPreviewLine = (sourceNode, targetNode, previewLineId, options = {}) => {
    try {
      // 确保预览线从源节点的out端口出发
      const sourcePort = 'out' // 固定使用out端口作为源端口
      const targetPort = 'in'  // 固定使用in端口作为目标端口
      
      console.log('🔧 [createPreviewLine] 创建预览线配置:', {
        sourceNodeId: sourceNode.id,
        targetNodeId: targetNode.id,
        sourcePort,
        targetPort,
        previewLineId
      })
      
      const previewLineConfig = {
        id: previewLineId,
        source: { 
          cell: sourceNode.id,
          port: sourcePort // 明确指定从out端口出发
        },
        target: { 
          cell: targetNode.id,
          port: targetPort // 明确指定到in端口
        },
        attrs: {
          line: {
            stroke: '#1890ff',
            strokeWidth: 2,
            strokeDasharray: '5,5',
            targetMarker: {
              name: 'classic',
              size: 8,
              fill: '#1890ff'
            }
          }
        },
        data: {
          type: 'preview-line',
          isPreview: true,
          sourceNodeId: sourceNode.id,
          targetNodeId: targetNode.id,
          sourcePort,
          targetPort,
          createdAt: Date.now(),
          ...options
        },
        zIndex: 1
      }
      
      console.log('✅ [createPreviewLine] 预览线配置创建成功:', previewLineConfig)
      return previewLineConfig
      
    } catch (error) {
      console.error('❌ [预览线管理器] 创建预览线失败:', error)
      return null
    }
  }

  /**
   * 统一预览线管理器
   */
  const unifiedPreviewManager = computed(() => {
    return {
      // 布局引擎引用
      layoutEngine: null,
      
      /**
       * 设置布局引擎引用
       * @param {Object} engine - 布局引擎实例
       */
      setLayoutEngine(engine) {
        this.layoutEngine = engine
        console.log('✅ [unifiedPreviewManager] 布局引擎引用已设置:', !!engine)
      },
      
      /**
       * 执行数据加载完成检查
       */
      performLoadCompleteCheck() {
        console.log('🔍 [unifiedPreviewManager] 执行数据加载完成检查')
        try {
          const graph = getGraph()
          if (!graph) {
            console.warn('⚠️ [unifiedPreviewManager] 图形实例不存在，跳过检查')
            return false
          }
          
          const nodeCount = graph.getNodes().length
          const edgeCount = graph.getEdges().length
          
          console.log('📊 [unifiedPreviewManager] 数据加载状态:', {
            nodes: nodeCount,
            edges: edgeCount,
            layoutEngine: !!this.layoutEngine
          })
          
          return true
        } catch (error) {
          console.error('❌ [unifiedPreviewManager] 数据加载完成检查失败:', error)
          return false
        }
      },
      
      /**
       * 节点配置完成后的处理
       * @param {string} nodeId - 节点ID
       * @param {string} nodeType - 节点类型
       * @param {Object} config - 配置数据
       */
      onNodeConfigured(nodeId, nodeType, config) {
        // 添加全局调试标记检查
        if (window.TASK_FLOW_DEBUG) {
          console.log('🚀 [useStructuredLayout] 开始处理节点配置完成事件')
        }
        
        console.log('🔧 [unifiedPreviewManager] 节点配置完成，开始处理预览线:', {
          nodeId,
          nodeType,
          config,
          timestamp: new Date().toISOString(),
          debugMode: !!window.TASK_FLOW_DEBUG
        })
        
        // 检查getGraph函数是否可用
        if (!getGraph || typeof getGraph !== 'function') {
          console.error('❌ [unifiedPreviewManager] getGraph函数不可用:', typeof getGraph)
          return
        }
        
        const graph = getGraph()
        if (!graph) {
          console.error('❌ [unifiedPreviewManager] 图形实例不可用')
          return
        }
        
        console.log('✅ [unifiedPreviewManager] 图形实例获取成功:', !!graph)
        
        // 标记节点为已配置
        this.configuredNodes = this.configuredNodes || new Set()
        this.configuredNodes.add(nodeId)
        console.log('✅ [unifiedPreviewManager] 节点已标记为已配置:', nodeId)
        
        // 查找可连接的目标节点
        const sourceNode = graph.getCellById(nodeId)
        if (!sourceNode) {
          console.warn(`[unifiedPreviewManager] 找不到节点: ${nodeId}`)
          return
        }
        
        const connectableNodes = findConnectableNodes(graph, sourceNode, nodeType, config)
        console.log('🔍 [unifiedPreviewManager] 找到可连接节点:', {
          count: connectableNodes.length,
          nodes: connectableNodes
        })
        
        if (connectableNodes.length === 0) {
          console.warn('⚠️ [unifiedPreviewManager] 没有找到可连接的节点')
          return
        }
        
        // 为每个可连接的节点创建预览线
        connectableNodes.forEach((targetNodeInfo, index) => {
          console.log(`🔗 [unifiedPreviewManager] 创建预览线 ${index + 1}/${connectableNodes.length}:`, {
            sourceId: nodeId,
            targetId: targetNodeInfo.id,
            sourceType: nodeType,
            targetType: targetNodeInfo.type
          })
          
          this.createPreviewLineAfterConfig(nodeId, targetNodeInfo.id, {
            sourceType: nodeType,
            targetType: targetNodeInfo.type
          })
        })
        
        console.log('✅ [unifiedPreviewManager] 预览线创建完成')
      },
      
      /**
       * 检查数据是否加载完成
       * @returns {boolean} 数据加载状态
       */
      isDataLoadComplete() {
        const graph = getGraph()
        if (!graph) {
          console.warn('⚠️ [unifiedPreviewManager] 图形实例不存在，数据未加载完成')
          return false
        }
        
        const nodes = graph.getNodes()
        const hasNodes = nodes && nodes.length > 0
        
        console.log('🔧 [unifiedPreviewManager] 数据加载状态检查:', {
          hasGraph: !!graph,
          nodeCount: nodes ? nodes.length : 0,
          isComplete: hasNodes
        })
        
        return hasNodes
      },
      
      /**
       * 配置完成后创建预览线
       * @param {string} sourceId - 源节点ID
       * @param {string} targetId - 目标节点ID
       * @param {Object} options - 选项配置
       */
      createPreviewLineAfterConfig(sourceId, targetId, options = {}) {
        console.log('🔧 [unifiedPreviewManager] 开始创建配置后预览线:', {
          sourceId,
          targetId,
          options,
          timestamp: new Date().toISOString()
        })
        
        const graph = getGraph()
        if (!graph) {
          console.error('❌ [unifiedPreviewManager] 图形实例不存在')
          return null
        }
        
        console.log('✅ [unifiedPreviewManager] 图形实例获取成功')
        
        const sourceNode = graph.getCellById(sourceId)
        const targetNode = graph.getCellById(targetId)
        
        if (!sourceNode || !targetNode) {
          console.error('❌ [unifiedPreviewManager] 源节点或目标节点不存在:', {
            sourceId,
            targetId,
            sourceNode: !!sourceNode,
            targetNode: !!targetNode
          })
          return null
        }
        
        console.log('✅ [unifiedPreviewManager] 源节点和目标节点都存在')
        
        // 创建预览线配置
        const previewLineId = `preview-${sourceId}-${targetId}-${Date.now()}`
        console.log('🔧 [unifiedPreviewManager] 生成预览线ID:', previewLineId)
        
        const previewLineConfig = createPreviewLine(sourceNode, targetNode, previewLineId, options)
        
        if (!previewLineConfig) {
          console.error('❌ [unifiedPreviewManager] 预览线配置创建失败')
          return null
        }
        
        console.log('✅ [unifiedPreviewManager] 预览线配置创建成功:', previewLineConfig)
        
        // 添加预览线到图形
        try {
          console.log('🔧 [unifiedPreviewManager] 开始添加预览线到图形...')
          const previewEdge = graph.addEdge(previewLineConfig)
          console.log('✅ [unifiedPreviewManager] 预览线创建成功:', {
            previewLineId,
            edgeId: previewEdge.id,
            sourceId: previewEdge.getSourceCellId(),
            targetId: previewEdge.getTargetCellId()
          })
          
          // 🔧 修复：确保预览线只从源节点的out端口出发
          const sourcePort = previewEdge.getSourcePortId()
          if (!sourcePort || !sourcePort.includes('out')) {
            console.warn('⚠️ [unifiedPreviewManager] 预览线未从out端口出发，尝试修正')
            try {
              // 查找源节点的out端口
              const sourcePorts = sourceNode.getPorts()
              const outPort = sourcePorts.find(port => port.id && port.id.includes('out'))
              if (outPort) {
                previewEdge.setSource({ cell: sourceId, port: outPort.id })
                console.log('✅ [unifiedPreviewManager] 预览线端口已修正为out端口:', outPort.id)
              }
            } catch (portError) {
              console.warn('⚠️ [unifiedPreviewManager] 端口修正失败:', portError.message)
            }
          }
          
          return previewEdge
        } catch (error) {
          console.error('❌ [unifiedPreviewManager] 添加预览线失败:', error)
          return null
        }
      }
    }
  })

  /**
   * 初始化布局引擎
   * @param {Object} graph - 图形实例
   * @returns {Promise<Object>} 布局引擎实例
   */
  const initializeLayoutEngine = async (graph) => {
    console.log('🔧 [useStructuredLayout] 初始化布局引擎')
    try {
      if (!graph) {
        console.error('❌ [useStructuredLayout] 图形实例不存在，无法初始化布局引擎')
        throw new Error('图形实例不存在，无法初始化布局引擎')
      }

      // 创建布局引擎实例
      const layoutEngine = createLayoutEngineInstance(graph)
      
      // 验证布局引擎实例
      if (!layoutEngine) {
        console.error('❌ [useStructuredLayout] 布局引擎实例创建失败')
        throw new Error('布局引擎实例创建失败')
      }

      // 设置全局引用
      if (typeof window !== 'undefined') {
        window.unifiedStructuredLayoutEngine = layoutEngine
        console.log('✅ [useStructuredLayout] 布局引擎全局引用设置成功')
      }

      console.log('✅ [useStructuredLayout] 布局引擎初始化成功')
      return layoutEngine
    } catch (error) {
      console.error('❌ [useStructuredLayout] 布局引擎初始化失败:', error)
      // 清理全局引用
      if (typeof window !== 'undefined') {
        window.unifiedStructuredLayoutEngine = null
      }
      throw error // 重新抛出错误
    }
  }

  /**
   * 获取连接预览管理器
   * @returns {Object} 统一预览线管理器实例
   */
  const getConnectionPreviewManager = () => {
    console.log('🔧 [useStructuredLayout] 获取连接预览管理器:', {
      exists: !!unifiedPreviewManager.value,
      timestamp: new Date().toISOString()
    })
    return unifiedPreviewManager.value
  }

  /**
   * 创建布局引擎实例
   * @param {Object} graph - 图形实例
   * @returns {Object} 布局引擎实例
   */
  const createLayoutEngineInstance = (graph) => {
    console.log('🔧 [useStructuredLayout] 创建布局引擎实例')
    try {
      if (!graph) {
        console.error('❌ [useStructuredLayout] 图形实例不存在，无法创建布局引擎')
        throw new Error('图形实例不存在')
      }

      // 检查UnifiedStructuredLayoutEngine是否可用
      if (typeof UnifiedStructuredLayoutEngine !== 'function') {
        console.error('❌ [useStructuredLayout] UnifiedStructuredLayoutEngine类不可用')
        throw new Error('UnifiedStructuredLayoutEngine类不可用')
      }

      // 创建统一结构化布局引擎实例
      const layoutEngine = new UnifiedStructuredLayoutEngine(graph, {
        // 布局配置
        direction: 'TB', // 从上到下
        align: 'UL', // 左上对齐
        nodesep: 50, // 节点间距
        ranksep: 100, // 层级间距
        marginx: 20,
        marginy: 20
      })

      // 验证布局引擎实例
      if (!layoutEngine || typeof layoutEngine.layout !== 'function') {
        console.error('❌ [useStructuredLayout] 布局引擎实例创建失败或缺少必要方法')
        throw new Error('布局引擎实例无效')
      }

      // 保存布局引擎实例引用
      layoutEngineInstance.value = layoutEngine
      
      console.log('✅ [useStructuredLayout] 布局引擎实例创建成功:', {
        hasLayoutMethod: typeof layoutEngine.layout === 'function',
        hasApplyMethod: typeof layoutEngine.apply === 'function'
      })
      return layoutEngine
    } catch (error) {
      console.error('❌ [useStructuredLayout] 创建布局引擎实例失败:', error)
      // 重置布局引擎实例引用
      layoutEngineInstance.value = null
      throw error // 重新抛出错误，让调用者知道失败了
    }
  }

  /**
   * 获取布局引擎实例
   * @returns {Object} 布局引擎实例
   */
  const getLayoutEngine = () => {
    console.log('🔧 [useStructuredLayout] 获取布局引擎实例:', !!layoutEngineInstance.value)
    return layoutEngineInstance.value
  }

  // 返回对象
  return {
    findConnectableNodes,
    canConnect,
    createPreviewLine,
    connectionPreviewManager,
    layoutEngineInstance,
    isLayouting,
    layoutOptions,
    unifiedPreviewManager,
    initializeLayoutEngine,
    getConnectionPreviewManager,
    createLayoutEngineInstance,
    getLayoutEngine
  }
}