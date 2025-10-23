/**
 * 原生Dagre布局 Composable
 * 专注于原生Dagre布局，支持预览线和拖拽点处理
 * 布局方式使用自底向上布局优化器处理节点排序
 */

import { ref, computed, nextTick } from 'vue'
import * as Layout from '@antv/layout'
import * as GraphLib from '@antv/graphlib'
const { DagreLayout } = Layout
const { Graph } = GraphLib
import { coordinateManager } from '../../utils/canvas/CoordinateSystemManager.js'
import { PreviewLineSystem } from '../../../../../utils/preview-line/PreviewLineSystem.js'
import { UnifiedStructuredLayoutEngine } from '../../utils/canvas/UnifiedStructuredLayoutEngine.js'
import { HierarchyLayoutEngine } from '../layout/HierarchyLayoutEngine.js'

export function useStructuredLayout(getGraph) {
  const connectionPreviewManager = ref(null)
  const layoutEngineInstance = ref(null) // 🔧 新增：布局引擎实例管理
  const isLayouting = ref(false)
  const layoutOptions = ref({
    centerAfterLayout: true,
    animateTransition: true,
    preserveConnections: true
  })
  
  // 布局统计
  const layoutStats = ref({
    lastLayoutTime: 0,
    totalLayouts: 0,
    averageLayoutTime: 0
  })
  
  // 布局方向状态
  const layoutDirection = ref('TB') // 'TB' (从上到下) | 'LR' (从左到右)
  
  // 布局配置
  const layoutConfig = ref({
    levelHeight: 200, // 🔧 优化：从150增加到200，改善层间距视觉效果
    nodeSpacing: 200,
    branchSpacing: 220, // 🔧 优化：从180增加到220，改善X轴节点分布
    centerAlignment: true,
    gridSize: 20,
    previewLineSpacing: 80,
    enableIncrementalLayout: true,
    enableBatching: true,
    layoutThrottle: 100,
    // 🆕 新增：布局引擎选择配置 - 临时切换回unified引擎
    layoutEngine: 'unified', // 'unified' | 'hierarchy'
    enableHierarchyEngine: true // 是否启用@antv/hierarchy引擎
  })
  
  // 根据布局方向计算动态配置
  const getDynamicLayoutConfig = () => {
    const isLR = layoutDirection.value === 'LR'
    return {
      rankdir: layoutDirection.value,
      nodesep: isLR ? 150 : 200, // 左右布局时节点间距稍小
      ranksep: isLR ? 200 : 120, // 🔧 修复：增加层级间距，改善四层节点定位
      // 预览线端口方向配置
      portDirections: isLR 
        ? { startDirections: ['right'], endDirections: ['left'] }
        : { startDirections: ['bottom'], endDirections: ['top'] }
    }
  }

  /**
   * 初始化布局系统
   */
  const initializeLayoutEngine = async () => {
    console.log('🚀 [布局系统] 开始初始化布局系统')
    
    try {
      const graph = getGraph && getGraph()
      
      if (!graph) {
        console.warn('⚠️ [useStructuredLayout] 图实例不存在，跳过布局引擎初始化')
        return false
      }
      
      console.log('✅ [布局系统] Graph实例获取成功')
      
      // 初始化坐标管理器
      console.log('🔧 [布局系统] 初始化坐标管理器')
      coordinateManager.setGraph(graph)
      coordinateManager.setDebugMode(process.env.NODE_ENV === 'development')
      
      // 创建并初始化统一预览线管理器
      console.log('🔧 [布局系统] 创建统一预览线管理器')
      try {
        connectionPreviewManager.value = new PreviewLineSystem({
          graph,
          branchManager: null,
          layoutEngine: null,
          layoutEngineReady: true
        })
        
        // 🔧 关键修复：异步初始化预览线系统
        await connectionPreviewManager.value.init()
        console.log('✅ [布局系统] 预览线管理器初始化成功')
        
        // 初始化完成后再设置布局方向
        connectionPreviewManager.value.updateLayoutDirection(layoutDirection.value)
        console.log('✅ [布局系统] 预览线管理器布局方向设置成功')
        
      } catch (previewError) {
        console.error('❌ [布局系统] 预览线管理器创建或初始化失败:', previewError)
        connectionPreviewManager.value = null
      }
      
      // 🔧 关键修复：创建布局引擎实例
      console.log('🏗️ [布局系统初始化] 开始创建布局引擎实例')
      console.log('🔍 [布局系统初始化] 当前布局配置:', layoutConfig.value)
      
      try {
        layoutEngineInstance.value = createLayoutEngineInstance(graph)
        
        if (layoutEngineInstance.value) {
          console.log('✅ [布局系统初始化] 布局引擎实例创建成功，类型:', layoutConfig.value.layoutEngine || 'unified')
        } else {
          console.warn('⚠️ [布局系统初始化] 布局引擎实例创建失败，返回null')
        }
      } catch (engineError) {
        console.error('❌ [布局系统初始化] 布局引擎实例创建异常:', engineError)
        layoutEngineInstance.value = null
      }
      
      console.log('✅ [布局系统] 原生Dagre布局系统初始化完成')
      return true
      
    } catch (error) {
      console.error('❌ [useStructuredLayout] 初始化失败:', error)
      connectionPreviewManager.value = null
      layoutEngineInstance.value = null
      return false
    }
  }

  /**
   * 居中并适应画布内容
   */
  const centerAndFitCanvas = async () => {
    const graph = getGraph()
    if (!graph) return

    try {
      // 先居中内容
      graph.centerContent()
      
      // 然后适应缩放，限制最大缩放比例
      const currentScale = graph.zoom()
      graph.zoomToFit({ 
        padding: 50,
        maxScale: Math.min(1.2, currentScale * 1.5) // 限制最大缩放比例
      })
      
      console.log('✅ [画布操作] 画布居中和适应完成')
    } catch (error) {
      console.warn('[useStructuredLayout] 画布居中和适应失败:', error)
    }
  }

  /**
   * 更新布局统计信息
   * @param {number} layoutTime - 布局耗时
   */
  const updateLayoutStats = (layoutTime) => {
    layoutStats.value = {
      ...layoutStats.value,
      lastLayoutTime: layoutTime,
      totalLayouts: (layoutStats.value.totalLayouts || 0) + 1,
      lastLayoutTimestamp: Date.now()
    }
  }

  /**
   * 🆕 切换布局引擎类型
   * @param {string} engineType - 布局引擎类型 'unified' | 'hierarchy'
   * @returns {Promise<Object>} 切换结果
   */
  const switchLayoutEngine = async (engineType) => {
    if (!['unified', 'hierarchy'].includes(engineType)) {
      console.warn('[useStructuredLayout] 无效的布局引擎类型:', engineType)
      return { success: false, message: '无效的布局引擎类型' }
    }
    
    const oldEngineType = layoutConfig.value.layoutEngine
    
    if (oldEngineType === engineType) {
      console.log(`[布局引擎切换] 已经是${engineType}引擎，无需切换`)
      return { success: true, message: '无需切换' }
    }
    
    console.log(`🔄 [布局引擎切换] 从 ${oldEngineType} 切换到 ${engineType}`)
    
    try {
      // 更新配置
      layoutConfig.value.layoutEngine = engineType
      
      // 清除现有布局引擎实例，强制重新创建
      layoutEngineInstance.value = null
      
      // 获取图实例
      const graph = getGraph()
      if (!graph) {
        throw new Error('图实例不存在，无法切换布局引擎')
      }
      
      // 重新应用布局
      const result = await applyUnifiedStructuredLayout(graph)
      
      console.log(`✅ [布局引擎切换] 布局引擎切换完成: ${engineType}`)
      return {
        success: true,
        message: `成功切换到${engineType === 'hierarchy' ? '@antv/hierarchy' : 'UnifiedStructured'}引擎`,
        engineType,
        layoutResult: result
      }
      
    } catch (error) {
      console.error('[useStructuredLayout] 切换布局引擎失败:', error)
      // 回滚配置
      layoutConfig.value.layoutEngine = oldEngineType
      return {
        success: false,
        message: `切换失败: ${error.message}`,
        error
      }
    }
  }

  /**
   * 切换布局方向
   * @param {string} direction - 布局方向 'TB' | 'LR'
   */
  const switchLayoutDirection = async (direction) => {
    if (!['TB', 'LR'].includes(direction)) {
      console.warn('[useStructuredLayout] 无效的布局方向:', direction)
      return
    }
    
    const oldDirection = layoutDirection.value
    layoutDirection.value = direction
    
    console.log(`🔄 [方向切换] 布局方向从 ${oldDirection} 切换到 ${direction}`)
    
    // 获取图实例
    const graph = getGraph()
    if (!graph) {
      console.error('[useStructuredLayout] 图实例不存在，无法切换布局方向')
      return
    }
    
    try {
      // 1. 更新所有现有节点的端口配置
      await updateAllNodePorts(graph, direction)
      
      // 2. 更新所有现有连接的方向配置
      await updateAllConnectionDirections(graph, direction)
      
      // 3. 更新预览线管理器的布局方向
      if (connectionPreviewManager.value && connectionPreviewManager.value.updateLayoutDirection) {
        connectionPreviewManager.value.updateLayoutDirection(direction)
        console.log(`🔄 [预览线管理器] 布局方向已更新为: ${direction}`)
      }
      
      // 4. 重新应用布局
      const result = await applyUnifiedStructuredLayout(graph)
      
      // 5. 添加重绘完成后的总结日志
      await logRedrawSummary(graph)
      
      console.log(`✅ [方向切换] 布局方向切换完成: ${direction}`)
      return result
    } catch (error) {
      console.error('[useStructuredLayout] 切换布局方向失败:', error)
      // 回滚到原来的方向
      layoutDirection.value = oldDirection
      // 回滚预览线管理器的方向
      if (connectionPreviewManager.value && connectionPreviewManager.value.updateLayoutDirection) {
        connectionPreviewManager.value.updateLayoutDirection(oldDirection)
      }
      throw error
    }
  }

  /**
   * 更新所有节点的端口配置
   * @param {Object} graph - 图实例
   * @param {string} direction - 布局方向
   */
  const updateAllNodePorts = async (graph, direction) => {
    console.log(`🔌 [端口更新] 开始更新所有节点端口配置，布局方向: ${direction}`)
    
    const nodes = graph.getNodes()
    let updatedCount = 0
    
    // 动态导入端口配置工厂
    const { createNodePortConfig } = await import('../../utils/canvas/portConfigFactory.js')
    
    nodes.forEach(node => {
      try {
        const nodeData = node.getData() || {}
        const nodeType = nodeData.nodeType || nodeData.type
        
        if (!nodeType || nodeType === 'endpoint') {
          return // 跳过endpoint
        }
        
        console.log(`🔧 [端口更新] 更新节点 ${node.id} (${nodeType}) 的端口配置`)
        
        // 获取新的端口配置
        const newPortConfig = createNodePortConfig(nodeType, nodeData.config || {}, direction)
        
        // 移除所有现有端口
        const existingPorts = node.getPorts()
        existingPorts.forEach(port => {
          node.removePort(port.id)
        })
        
        // 添加新的端口配置
        if (newPortConfig.items && newPortConfig.items.length > 0) {
          newPortConfig.items.forEach(portConfig => {
            node.addPort(portConfig)
          })
        }
        
        updatedCount++
        console.log(`✅ [端口更新] 节点 ${node.id} 端口配置已更新`)
        
      } catch (error) {
        console.error(`❌ [端口更新] 更新节点 ${node.id} 端口配置失败:`, error)
      }
    })
    
    console.log(`🎯 [端口更新] 端口配置更新完成，共更新 ${updatedCount} 个节点`)
  }

  /**
   * 更新所有连接的方向配置
   * @param {Object} graph - 图实例
   * @param {string} direction - 布局方向
   */
  const updateAllConnectionDirections = async (graph, direction) => {
    console.log(`🔗 [连接更新] 开始更新所有连接方向配置，布局方向: ${direction}`)
    
    const edges = graph.getEdges()
    let updatedCount = 0
    
    // 动态方向配置函数
    const getDynamicDirectionConfig = (layoutDirection) => {
      if (layoutDirection === 'LR') {
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
    
    const directionConfig = getDynamicDirectionConfig(direction)
    
    edges.forEach(edge => {
      try {
        const edgeData = edge.getData() || {}
        
        // 跳过预览线
        if (edgeData.isPersistentPreview || edgeData.isPreview) {
          return
        }
        
        console.log(`🔧 [连接更新] 更新连接 ${edge.id} 的方向配置`)
        
        // 更新路由器配置
        edge.setRouter({
          name: 'orth',
          args: {
            padding: 10,
            ...directionConfig
          }
        })
        
        updatedCount++
        console.log(`✅ [连接更新] 连接 ${edge.id} 方向配置已更新`)
        
      } catch (error) {
        console.error(`❌ [连接更新] 更新连接 ${edge.id} 方向配置失败:`, error)
      }
    })
    
    console.log(`🎯 [连接更新] 连接方向配置更新完成，共更新 ${updatedCount} 个连接`)
  }

  /**
   * 构建拓扑分层结构
   * @param {Array} nodes - 节点数组
   * @param {Array} edges - 边数组
   * @param {Object} previewLineSystem - 预览线系统实例
   * @returns {Object} 拓扑分层结构
   */
  const buildTopologicalLayers = (nodes, edges, previewLineSystem = null) => {
    console.log('🔍 [拓扑分层] 开始构建节点拓扑分层结构')
    
    // 🚨 关键调试：检查输入参数
    if (!nodes || !Array.isArray(nodes)) {
      console.error('❌ [拓扑分层] nodes参数无效:', nodes)
      return { layers: [], nodeToLayer: new Map(), adjacencyList: new Map(), totalLayers: 0 }
    }
    
    if (!edges || !Array.isArray(edges)) {
      console.error('❌ [拓扑分层] edges参数无效:', edges)
      return { layers: [], nodeToLayer: new Map(), adjacencyList: new Map(), totalLayers: 0 }
    }
    
    console.log(`🔍 [拓扑分层] 输入参数检查: nodes=${nodes.length}个, edges=${edges.length}个`)
    
    // 🔍 详细调试：输出当前图中所有节点的类型和属性
    console.log('🔍 [拓扑分层] 当前图中所有节点详情:')
    nodes.forEach((node, index) => {
      const nodeId = node.id || node.getId()
      const nodeData = node.getData() || {}
      const position = node.getPosition()
      const size = node.getSize()
      
      console.log(`  节点${index + 1}: ${nodeId}`, {
        nodeType: nodeData.nodeType,
        isEndpoint: nodeData.isEndpoint,
        isPreview: nodeData.isPreview,
        isPersistentPreview: nodeData.isPersistentPreview,
        isUnifiedPreview: nodeData.isUnifiedPreview,
        position: position,
        size: size,
        allData: nodeData
      })
    })
    
    // 🔍 详细调试：输出当前图中所有边的类型和属性
    console.log('🔍 [拓扑分层] 当前图中所有边详情:')
    edges.forEach((edge, index) => {
      const edgeId = edge.id || edge.getId()
      const edgeData = edge.getData() || {}
      const sourceId = edge.getSourceCellId()
      const targetId = edge.getTargetCellId()
      
      console.log(`  边${index + 1}: ${edgeId}`, {
        sourceId: sourceId,
        targetId: targetId,
        isPreview: edgeData.isPreview,
        isPersistentPreview: edgeData.isPersistentPreview,
        isUnifiedPreview: edgeData.isUnifiedPreview,
        allData: edgeData
      })
    })
    
    // 🔍 详细调试：输出预览线管理器状态
    if (previewLineSystem) {
      console.log('🔍 [拓扑分层] 预览线系统状态:', {
        previewLinesCount: previewLineSystem.getAllPreviewLines ? previewLineSystem.getAllPreviewLines().length : 0,
        previewLines: previewLineSystem.getAllPreviewLines ? previewLineSystem.getAllPreviewLines() : []
      })
    } else {
      console.log('🔍 [拓扑分层] 预览线系统为空')
    }
    
    // 构建邻接表
    const adjacencyList = new Map()
    const inDegree = new Map()
    const outDegree = new Map()
    const previewEndpointToSource = new Map() // 预览线endpoint到源节点的映射
    
    // 初始化
    nodes.forEach(node => {
      const nodeId = node.id || node.getId()
      adjacencyList.set(nodeId, [])
      inDegree.set(nodeId, 0)
      outDegree.set(nodeId, 0)
    })
    
    // 构建图结构（排除预览线）
    edges.forEach(edge => {
      const edgeData = edge.getData() || {}
      const edgeId = edge.id || edge.getId()
      
      // 处理预览线，建立预览线endpoint与源节点的关系
      if (edgeData.isPreview || edgeData.isPersistentPreview || edgeData.isUnifiedPreview || 
          edgeId.includes('preview') || edgeId.includes('unified_preview')) {
        const sourceId = edge.getSourceCellId()
        
        // 🔧 使用预览线endpoint位置而不是拖拽点
        if (sourceId && previewLineSystem) {
          const previewInstance = previewLineSystem.getPreviewLine ? previewLineSystem.getPreviewLine(sourceId) : null
          if (previewInstance) {
            if (Array.isArray(previewInstance)) {
              // 分支预览线
              previewInstance.forEach(instance => {
                if (instance.endPosition) {
                  const endpointKey = `endpoint_${sourceId}_${instance.branchId || 'default'}`
                  previewEndpointToSource.set(endpointKey, {
                    sourceId: sourceId,
                    endPosition: instance.endPosition,
                    branchId: instance.branchId,
                    branchLabel: instance.branchLabel
                  })
                  console.log(`🎯 [拓扑分层] 发现分支预览线endpoint关系: ${endpointKey} <- ${sourceId}`, {
                    endPosition: instance.endPosition,
                    branchId: instance.branchId
                  })
                }
              })
            } else {
              // 单一预览线
              if (previewInstance.endPosition) {
                const endpointKey = `endpoint_${sourceId}_single`
                previewEndpointToSource.set(endpointKey, {
                  sourceId: sourceId,
                  endPosition: previewInstance.endPosition,
                  branchId: null,
                  branchLabel: null
                })
                console.log(`🎯 [拓扑分层] 发现单一预览线endpoint关系: ${endpointKey} <- ${sourceId}`, {
                  endPosition: previewInstance.endPosition
                })
              }
            }
          }
        }
        return
      }
      
      const sourceId = edge.getSourceCellId()
      const targetId = edge.getTargetCellId()
      
      if (sourceId && targetId && adjacencyList.has(sourceId) && adjacencyList.has(targetId)) {
        adjacencyList.get(sourceId).push(targetId)
        inDegree.set(targetId, inDegree.get(targetId) + 1)
        outDegree.set(sourceId, outDegree.get(sourceId) + 1)
      }
    })
    
    // 🔧 新的预览线分层策略：直接使用预览线坐标进行分层计算（不依赖endpoint节点）
    const previewLineElements = new Map() // 存储预览线元素信息
    
    previewEndpointToSource.forEach((endpointInfo, endpointKey) => {
      const { sourceId, endPosition, branchId, branchLabel } = endpointInfo
      
      // 直接将预览线作为分层元素，根据其Y坐标确定层级
      const previewElementId = branchId ? `preview_branch_${sourceId}_${branchId}` : `preview_single_${sourceId}`
      
      previewLineElements.set(previewElementId, {
        type: branchId ? 'branch_preview_line' : 'single_preview_line',
        sourceId,
        endPosition,
        branchId,
        branchLabel,
        isPreviewLine: true,
        // 根据Y坐标计算相对层级（相对于源节点）
        calculateLayer: (sourceNodeLayer, sourceNodeY) => {
          const yDifference = endPosition.y - sourceNodeY
          // 如果预览线终点在源节点下方，则分配到下一层或更下层
          if (yDifference > 50) {
            return sourceNodeLayer + Math.ceil(yDifference / 100) // 每100px一层
          } else {
            return sourceNodeLayer + 1 // 默认下一层
          }
        }
      })
      
      console.log(`🎯 [拓扑分层] 记录预览线元素: ${previewElementId}`, {
        sourceId,
        endPosition,
        branchId,
        branchLabel,
        type: branchId ? 'branch_preview_line' : 'single_preview_line'
      })
    })
    
    // 拓扑排序确定层级
    const layers = []
    const nodeToLayer = new Map()
    const queue = []
    
    // 找到所有入度为0的节点（起始节点）
    nodes.forEach(node => {
      const nodeId = node.id || node.getId()
      const nodeData = node.getData() || {}
      const isEndpoint = nodeData.nodeType === 'endpoint' || nodeData.isEndpoint || nodeId.startsWith('hint_')
      
      // 跳过endpoint，稍后单独处理
      if (!isEndpoint && inDegree.get(nodeId) === 0) {
        queue.push({ nodeId, level: 0 })
        nodeToLayer.set(nodeId, 0)
      }
    })
    
    // BFS遍历确定每个节点的层级
    while (queue.length > 0) {
      const { nodeId, level } = queue.shift()
      
      // 确保layers数组有足够的层级
      while (layers.length <= level) {
        layers.push([])
      }
      
      // 处理真实节点
      const node = nodes.find(n => (n.id || n.getId()) === nodeId)
      if (node) {
        const nodeData = node.getData() || {}
        layers[level].push({
          node,
          nodeId,
          position: node.getPosition(),
          size: node.getSize(),
          data: nodeData,
          type: nodeData.nodeType || nodeData.type || 'normal',
          isEndpoint: false,
          isPreviewLine: false
        })
      }
      
      // 处理子节点
      const children = adjacencyList.get(nodeId) || []
      children.forEach(childId => {
        const newInDegree = inDegree.get(childId) - 1
        inDegree.set(childId, newInDegree)
        
        if (newInDegree === 0) {
          const childLevel = level + 1
          nodeToLayer.set(childId, childLevel)
          queue.push({ nodeId: childId, level: childLevel })
        }
      })
    }
    
    // 🎯 新增：将预览线元素直接添加到相应层级
    previewLineElements.forEach((previewElement, previewElementId) => {
      const { sourceId, endPosition, calculateLayer } = previewElement
      const sourceNodeLevel = nodeToLayer.get(sourceId)
      
      if (sourceNodeLevel !== undefined) {
        // 获取源节点的Y坐标
        const sourceNode = nodes.find(n => (n.id || n.getId()) === sourceId)
        const sourceNodeY = sourceNode ? sourceNode.getPosition().y : 0
        
        // 计算预览线应该分配到的层级
        const previewLineLevel = calculateLayer(sourceNodeLevel, sourceNodeY)
        
        // 确保目标层级存在
        while (layers.length <= previewLineLevel) {
          layers.push([])
        }
        
        // 将预览线元素添加到对应层级
        layers[previewLineLevel].push({
          node: null, // 预览线没有真实的node对象
          nodeId: previewElementId,
          position: endPosition,
          size: { width: 0, height: 0 }, // 预览线没有尺寸
          data: previewElement,
          type: 'preview_line',
          isEndpoint: false,
          isPreviewLine: true
        })
        
        console.log(`🎯 [拓扑分层] 预览线元素 ${previewElementId} 分配到第${previewLineLevel}层 (源节点 ${sourceId} 在第${sourceNodeLevel}层)`, {
          endPosition,
          sourceNodeY,
          calculatedLevel: previewLineLevel
        })
      } else {
        console.warn(`⚠️ [拓扑分层] 预览线元素 ${previewElementId} 的源节点 ${sourceId} 未找到层级信息`)
      }
    })
    

    
    // 处理拖拽点：将拖拽点放在其源节点的下一层
    nodes.forEach(node => {
      const nodeId = node.id || node.getId()
      const nodeData = node.getData() || {}
      const isEndpoint = nodeData.nodeType === 'endpoint' || nodeData.isEndpoint || nodeId.startsWith('hint_')
      
      if (isEndpoint) {
        // 尝试从拖拽点ID中提取源节点信息
        let sourceNodeId = null
        if (nodeId.startsWith('hint_')) {
          // 从hint_preview_xxx或hint_xxx格式中提取源节点ID
          const parts = nodeId.split('_')
          if (parts.length >= 3) {
            sourceNodeId = parts.slice(2).join('_')
          }
        }
        
        let targetLevel = 0 // 默认层级
        
        if (sourceNodeId && nodeToLayer.has(sourceNodeId)) {
          // endpoint应该在其源节点的下一层
          targetLevel = nodeToLayer.get(sourceNodeId) + 1
          console.log(`🎯 [拓扑分层] endpoint ${nodeId} 分配到第${targetLevel}层 (源节点 ${sourceNodeId} 在第${nodeToLayer.get(sourceNodeId)}层)`)
        } else {
          console.log(`⚠️ [拓扑分层] endpoint ${nodeId} 未找到源节点，分配到第0层`)
        }
        
        // 确保目标层级存在
        while (layers.length <= targetLevel) {
          layers.push([])
        }
        
        layers[targetLevel].push({
          node,
          nodeId,
          position: node.getPosition(),
          size: node.getSize(),
          data: nodeData,
          type: nodeData.nodeType || nodeData.type || 'endpoint',
          isEndpoint: true
        })
        nodeToLayer.set(nodeId, targetLevel)
      }
    })
    
    // 处理其他孤立节点（没有连接的普通节点）
    nodes.forEach(node => {
      const nodeId = node.id || node.getId()
      const nodeData = node.getData() || {}
      const isEndpoint = nodeData.nodeType === 'endpoint' || nodeData.isEndpoint || nodeId.startsWith('hint_')
    
    if (!isEndpoint && !nodeToLayer.has(nodeId)) {
        // 将孤立的普通节点放在第0层
        if (layers.length === 0) {
          layers.push([])
        }
        layers[0].push({
          node,
          nodeId,
          position: node.getPosition(),
          size: node.getSize(),
          data: nodeData,
          type: nodeData.nodeType || nodeData.type || 'normal',
          isEndpoint: false
        })
        nodeToLayer.set(nodeId, 0)
        console.log(`⚠️ [拓扑分层] 孤立普通节点 ${nodeId} 分配到第0层`)
      }
    })
    
    console.log('📊 [拓扑分层] 拓扑分层结构构建完成', {
      totalLayers: layers.length,
      previewLineElements: Array.from(previewLineElements.entries()),
      layerDistribution: layers.map((layer, index) => ({
        layer: index,
        nodeCount: layer.length,
        normalNodes: (layer || []).filter(n => !n.isEndpoint && !n.isPreviewLine).length,
        endpoints: (layer || []).filter(n => n.isEndpoint).length,
        previewLines: (layer || []).filter(n => n.isPreviewLine).length,
        nodes: layer.map(n => {
          if (n.isEndpoint) return `${n.nodeId}(endpoint)`
          if (n.isPreviewLine) return `${n.nodeId}(预览线)`
          return `${n.nodeId}(普通节点)`
        })
      }))
    })
    
    // 🚨 关键调试：检查返回值
    const result = {
      layers,
      nodeToLayer,
      adjacencyList,
      totalLayers: layers.length
    }
    
    console.log('🔍 [拓扑分层] 返回结果检查:', {
      layersLength: result.layers.length,
      nodeToLayerSize: result.nodeToLayer.size,
      totalLayers: result.totalLayers
    })
    
    if (result.totalLayers === 0 && nodes.length > 0) {
      console.error('❌ [拓扑分层] 严重错误：有节点但总层数为0！', {
        nodesCount: nodes.length,
        edgesCount: edges.length,
        queueProcessed: queue.length === 0,
        inDegreeMap: Array.from(inDegree.entries()),
        adjacencyListMap: Array.from(adjacencyList.entries())
      })
    }
    
    return result
  }

  /**
   * 🔧 预创建布局引擎实例（性能优化）
   * @param {Object} graph - 图实例
   * @returns {Object} 布局引擎实例
   */
  const createLayoutEngineInstance = (graph) => {
    // 🔧 修复：如果没有传入graph，尝试从getGraph获取
    if (!graph) {
      graph = getGraph()
      if (!graph) {
        console.warn('⚠️ [布局引擎预创建] Graph实例为空，跳过预创建')
        return null
      }
      console.log('🔧 [布局引擎预创建] 从getGraph()获取到Graph实例')
    }

    const engineType = layoutConfig.value.layoutEngine || 'unified'
    console.log(`🏗️ [布局引擎预创建] 开始预创建布局引擎实例，类型: ${engineType}`)

    let layoutEngine
    
    // 🆕 根据配置选择布局引擎
    if (engineType === 'hierarchy' && layoutConfig.value.enableHierarchyEngine) {
      console.log('🌲 [布局引擎选择] 使用HierarchyLayoutEngine (@antv/hierarchy)')
      
      layoutEngine = new HierarchyLayoutEngine(graph, {
        // 层级配置
        layer: {
          baseHeight: layoutConfig.value.levelHeight || 200,
          dynamicSpacing: true,
          maxLayers: 10,
          tolerance: 20
        },
        
        // 节点配置
        node: {
          minSpacing: layoutConfig.value.nodeSpacing * 0.6 || 120,
          preferredSpacing: layoutConfig.value.nodeSpacing || 200,
          maxSpacing: layoutConfig.value.nodeSpacing * 1.5 || 300,
          endpointSize: { width: 20, height: 20 }
        },
        
        // @antv/hierarchy特定配置
        hierarchy: {
          algorithm: 'compactBox', // 使用CompactBox算法
          direction: layoutDirection.value === 'TB' ? 'TB' : 'LR',
          getHGap: () => layoutConfig.value.nodeSpacing || 200,
          getVGap: () => layoutConfig.value.levelHeight || 200,
          enableOptimization: true
        },
        
        // 优化配置
        optimization: {
          enableGlobalOptimization: true,
          maxIterations: 3, // hierarchy引擎迭代次数较少
          convergenceThreshold: 0.01,
          enableAestheticOptimization: true,
          enableEndpointIntegration: true
        },
        
        // 性能配置
        performance: {
          enableParallelProcessing: false,
          batchSize: 50,
          enableCaching: true
        }
      }, connectionPreviewManager.value)
      
    } else {
      console.log('🔧 [布局引擎选择] 使用UnifiedStructuredLayoutEngine (默认)')
      
      layoutEngine = new UnifiedStructuredLayoutEngine(graph, {
        // 层级配置
        layer: {
          baseHeight: layoutConfig.value.levelHeight || 150,
          dynamicSpacing: true,
          maxLayers: 10,
          tolerance: 20
        },
        
        // 节点配置
        node: {
          minSpacing: layoutConfig.value.nodeSpacing * 0.6 || 120,
          preferredSpacing: layoutConfig.value.nodeSpacing || 180,
          maxSpacing: layoutConfig.value.nodeSpacing * 1.5 || 300,
          endpointSize: { width: 20, height: 20 }
        },
        
        // 优化配置
        optimization: {
          enableGlobalOptimization: true,
          maxIterations: 5,
          convergenceThreshold: 0.01,
          enableAestheticOptimization: true,
          enableEndpointIntegration: true // 🎯 关键：启用endpoint集成
        },
        
        // 性能配置
        performance: {
          enableParallelProcessing: false,
          batchSize: 50,
          enableCaching: true
        }
      }, connectionPreviewManager.value) // 🎯 关键：传递预览线管理器实例
    }

    // 🔗 集成预览线管理器
    if (connectionPreviewManager.value && connectionPreviewManager.value.setLayoutEngine) {
      connectionPreviewManager.value.setLayoutEngine(layoutEngine)
      console.log('🔗 [布局引擎集成] 布局引擎引用已传递给预览线管理器')
    } else if (connectionPreviewManager.value) {
      connectionPreviewManager.value.layoutEngine = layoutEngine
      console.log('🔗 [布局引擎集成] 布局引擎引用已直接设置到预览线管理器')
    }
    
    // 🌐 设置全局引用作为备用方案
    window.layoutEngine = layoutEngine
    // 🔧 关键修复：设置UnifiedStructuredLayoutEngine构造函数到全局，供PreviewLineSystem使用
    window.UnifiedStructuredLayoutEngine = UnifiedStructuredLayoutEngine
    console.log('🌐 [全局引用] 布局引擎实例和构造函数已设置为全局引用')
    console.log('🔧 [修复验证] UnifiedStructuredLayoutEngine构造函数已可用:', typeof window.UnifiedStructuredLayoutEngine === 'function')

    console.log('✅ [布局引擎预创建] 布局引擎实例预创建完成')
    return layoutEngine
  }

  /**
   * 应用统一结构化布局（基于父子关联关系的分层分级自底向上定位）
   * @param {Object} graph - 图实例
   * @returns {Promise<Object>} 布局结果
   */
  const applyUnifiedStructuredLayout = async (graph) => {
    if (!graph) {
      throw new Error('[useStructuredLayout] Graph实例不能为空')
    }

    // 🎯 关键修复：添加节点数量验证，与LayoutModeManager保持一致
    const nodes = graph.getNodes()
    console.log('🔍 [调试] applyUnifiedStructuredLayout - 节点数量检查:', {
      nodes: nodes ? nodes.length : 0,
      nodeIds: nodes ? nodes.map(n => n.id) : [],
      nodeDetails: nodes ? nodes.map(n => ({
        id: n.id,
        type: n.getData()?.type || n.getData()?.nodeType,
        isPreview: n.getData()?.isPreview,
        isHint: n.getData()?.type === 'hint'
      })) : []
    })
    
    if (!nodes || nodes.length === 0) {
      console.warn('[useStructuredLayout] 没有节点可以布局')
      return {
        type: 'unified-structured',
        success: false,
        message: '没有节点可以布局',
        layoutTime: 0,
        nodeCount: 0,
        skipped: true
      }
    }

    // 🎯 关键修复：统一布局需要至少2个节点才能执行（降低门槛以支持更多场景）
    if (nodes.length < 2) {
      console.error('❌ [useStructuredLayout] 统一布局需要至少2个节点，当前节点数量:', nodes.length)
      console.error('❌ [useStructuredLayout] 节点详情:', nodes.map(n => ({
        id: n.id,
        type: n.getData()?.type || n.getData()?.nodeType,
        data: n.getData()
      })))
      return {
        type: 'unified-structured',
        success: false,
        message: `统一布局需要至少2个节点，当前节点数量: ${nodes.length}`,
        layoutTime: 0,
        nodeCount: nodes.length,
        skipped: true
      }
    }
    
    // 🔍 额外调试：检查节点类型分布
    const nodeTypeStats = nodes.reduce((stats, node) => {
      const nodeData = node.getData() || {}
      const nodeType = nodeData.type || nodeData.nodeType || 'unknown'
      stats[nodeType] = (stats[nodeType] || 0) + 1
      return stats
    }, {})
    console.log('📊 [useStructuredLayout] 节点类型分布:', nodeTypeStats)
    console.log('📊 [useStructuredLayout] 节点数量检查通过，当前节点数量:', nodes.length)
    
    console.log('✅ [调试] 节点数量检查通过，开始执行布局')

    console.log('🚀 [统一结构化布局] 开始应用基于父子关联关系的分层分级自底向上布局')
    
    // 🔍 调试：检查预览线管理器状态
    console.log('🔍 [调试] connectionPreviewManager状态:', {
      存在: !!connectionPreviewManager.value,
      类型: typeof connectionPreviewManager.value,
      构造函数: connectionPreviewManager.value?.constructor?.name,
      有预览线数据: !!connectionPreviewManager.value?.previewLines,
      预览线数量: connectionPreviewManager.value?.previewLines?.size || 0
    })
    
    // 详细检查节点和连接状态
    if (connectionPreviewManager.value) {
      const edges = graph.getEdges()
      
      console.log('🔍 [调试] 图形状态检查:', {
        totalNodes: nodes.length,
        totalEdges: edges.length
      })
      
      // 检查每个节点是否应该创建预览线
      nodes.forEach(node => {
        const nodeData = node.getData() || {}
        const nodeType = nodeData.type || nodeData.nodeType
        const shouldCreate = connectionPreviewManager.value.shouldCreatePreviewLine(node)
        const hasConnections = connectionPreviewManager.value.hasExistingConnections(node)
        
        console.log('🔍 [调试] 节点预览线检查:', {
          nodeId: node.id,
          nodeType: nodeType,
          shouldCreatePreviewLine: shouldCreate,
          hasExistingConnections: hasConnections,
          isConfigured: nodeData.isConfigured || !!nodeData.config
        })
      })
      
      // 执行节点连接线有效性检查
      if (connectionPreviewManager.value && typeof connectionPreviewManager.value.validateNodeConnections === 'function') {
        console.log('🔍 [调试] 执行节点连接线有效性检查...')
        const validationResult = connectionPreviewManager.value.validateNodeConnections(graph, { verbose: true })
        
        console.log('🔍 [节点连接线检查结果]:', {
          '总体状态': validationResult.isValid ? '✅ 全部有效' : '❌ 存在无效节点',
          '统计信息': validationResult.summary,
          '边统计': `预览线: ${validationResult.statistics.totalPreviewLines}, 连接线: ${validationResult.statistics.totalConnections}`
        })
        
        // 输出无效节点的详细信息
        const invalidNodes = validationResult.nodeValidations.filter(v => !v.isValid)
        if (invalidNodes.length > 0) {
          console.warn('⚠️ [无效节点详情]:')
          invalidNodes.forEach(node => {
            console.warn(`  - ${node.nodeId} (${node.nodeType}): 应有${node.expectedBranches}条线，实际${node.totalLines}条 (预览线:${node.actualPreviewLines}, 连接线:${node.actualConnections})`)
          })
        }
      } else {
        console.warn('⚠️ [调试] 预览线管理器不支持节点连接线有效性检查')
      }
      
      // 手动触发预览线初始化
      console.log('🔄 [调试] 手动触发预览线初始化')
      connectionPreviewManager.value.initializeExistingNodes()
      
      console.log('🔍 [调试] 初始化后预览线数量:', connectionPreviewManager.value.previewLines.size)
    }
    
    isLayouting.value = true

    try {
      const startTime = performance.now()

      // 🔧 性能优化：优先使用预创建的布局引擎实例
      let layoutEngine = layoutEngineInstance.value
      
      if (!layoutEngine || layoutEngine.graph !== graph) {
        console.log('🏗️ [布局引擎管理] 需要创建新的布局引擎实例')
        layoutEngine = createLayoutEngineInstance(graph)
        layoutEngineInstance.value = layoutEngine
      } else {
        console.log('♻️ [布局引擎管理] 复用现有布局引擎实例')
        // 更新图实例和预览线管理器
        layoutEngine.updateGraph(graph)
        if (connectionPreviewManager.value) {
          layoutEngine.updatePreviewManager(connectionPreviewManager.value)
        }
      }

      console.log('💾 [布局引擎管理] 布局引擎实例已准备就绪')

      // 🔧 关键修复：将布局引擎引用传递给预览线管理器
      if (connectionPreviewManager.value && connectionPreviewManager.value.setLayoutEngine) {
        connectionPreviewManager.value.setLayoutEngine(layoutEngine)
        console.log('🔗 [布局引擎集成] 布局引擎引用已传递给预览线管理器')
      } else if (connectionPreviewManager.value) {
        // 如果没有setLayoutEngine方法，直接设置属性
        connectionPreviewManager.value.layoutEngine = layoutEngine
        console.log('🔗 [布局引擎集成] 布局引擎引用已直接设置到预览线管理器')
      }
      
      // 🌐 设置全局引用作为备用方案
      window.layoutEngine = layoutEngine
      console.log('🌐 [全局引用] 布局引擎已设置为全局引用')

      // 执行统一结构化布局
      console.log('🚀 [调试] 即将调用 layoutEngine.executeLayout()')
      const layoutResult = await layoutEngine.executeLayout()
      console.log('✅ [调试] layoutEngine.executeLayout() 调用完成，结果:', layoutResult)

      const endTime = performance.now()
      const layoutTime = endTime - startTime

      // 更新布局统计
      updateLayoutStats(layoutTime)

      console.log('✅ [统一结构化布局] 布局执行完成', {
        耗时: `${layoutTime.toFixed(2)}ms`,
        成功: layoutResult.success,
        总层数: layoutResult.statistics?.totalLayers || 0,
        总节点数: layoutResult.statistics?.totalNodes || 0,
        普通节点数: layoutResult.statistics?.normalNodes || 0,
        endpoint节点数: layoutResult.statistics?.endpointNodes || 0
      })

      // 如果启用了居中和适应画布
      if (layoutOptions.value.centerAfterLayout) {
        await nextTick()
        await centerAndFitCanvas()
      }

      return {
        type: 'unified-structured',
        layoutTime,
        success: layoutResult.success,
        statistics: layoutResult.statistics,
        performance: layoutResult.performance,
        message: layoutResult.message || '统一结构化布局执行完成',
        
        // 兼容性字段
        nodeCount: layoutResult.statistics?.totalNodes || 0,
        normalNodeCount: layoutResult.statistics?.normalNodes || 0,
        endpointNodeCount: layoutResult.statistics?.endpointNodes || 0,
        layerCount: layoutResult.statistics?.totalLayers || 0
      }

    } catch (error) {
      console.error('❌ [统一结构化布局] 布局执行失败:', error)
      
      return {
        type: 'unified-structured',
        success: false,
        error: error.message,
        message: `统一结构化布局执行失败: ${error.message}`,
        layoutTime: 0,
        nodeCount: 0,
        normalNodeCount: 0,
        endpointNodeCount: 0,
        layerCount: 0
      }
    } finally {
      isLayouting.value = false
    }
  }

  /**
   * 重绘完成后的总结日志
   * @param {Object} graph - 图实例
   */
  const logRedrawSummary = async (graph) => {
    console.log(`📋 [重绘总结] 开始生成重绘完成总结，布局方向: ${layoutDirection.value}`)
    
    try {
      const nodes = graph.getNodes()
      const edges = graph.getEdges()
      
      // 分类统计
      const nodesSummary = {
        normal: [],
        endpoints: [],
        total: 0
      }
      
      const portsSummary = {
        input: [],
        output: [],
        total: 0
      }
      
      const edgesSummary = {
        connections: [],
        previews: [],
        total: 0
      }
      
      // 统计节点信息
      nodes.forEach(node => {
        const position = node.getPosition()
        const size = node.getSize()
        const nodeData = node.getData() || {}
        const nodeType = nodeData.nodeType || nodeData.type || 'unknown'
        
        // 🎯 关键修复：检查并修复节点位置中的NaN值
        const safeNodePosition = {
          x: isNaN(position.x) ? 0 : position.x,
          y: isNaN(position.y) ? 100 : position.y // 使用默认Y坐标100
        }
        
        if (isNaN(position.y)) {
          console.warn(`⚠️ [NaN修复] 节点 ${node.id} 的Y坐标为NaN，在节点信息统计中使用默认值100`)
        }
        
        const nodeInfo = {
          id: node.id,
          type: nodeType,
          position: {
            x: Math.round(safeNodePosition.x),
            y: Math.round(safeNodePosition.y)
          },
          size: {
            width: Math.round(size.width),
            height: Math.round(size.height)
          },
          center: {
            x: Math.round(safeNodePosition.x + size.width / 2),
            y: Math.round(safeNodePosition.y + size.height / 2)
          }
        }
        
        if (nodeType === 'endpoint' || nodeData.isEndpoint || node.id.startsWith('virtual_endpoint_')) {
          nodesSummary.endpoints.push(nodeInfo)
        } else {
          nodesSummary.normal.push(nodeInfo)
        }
        
        // 统计端口信息
        const ports = node.getPorts()
        ports.forEach(port => {
          const portConfig = node.getPortProp(port.id, 'position') || {}
          const portGroup = port.group || 'unknown'
          
          // 🎯 关键修复：检查并修复节点位置中的NaN值
          const safePosition = {
            x: isNaN(position.x) ? 0 : position.x,
            y: isNaN(position.y) ? 100 : position.y // 使用默认Y坐标100
          }
          
          if (isNaN(position.y)) {
            console.warn(`⚠️ [NaN修复] 节点 ${node.id} 的Y坐标为NaN，使用默认值100`)
          }
          
          // 计算端口的实际位置
          let portX = 0
          let portY = 0
          let absoluteX = safePosition.x
          let absoluteY = safePosition.y
          
          if (portConfig.name === 'bottom') {
            const args = portConfig.args || {}
            const xPercent = typeof args.x === 'string' && args.x.includes('%') ? 
              parseFloat(args.x) / 100 : 0.5
            portX = size.width * xPercent + (args.dx || 0)
            portY = size.height + (args.dy || 0)
            absoluteX = safePosition.x + portX
            absoluteY = safePosition.y + portY
          } else if (portConfig.name === 'top') {
            const args = portConfig.args || {}
            const xPercent = typeof args.x === 'string' && args.x.includes('%') ? 
              parseFloat(args.x) / 100 : 0.5
            portX = size.width * xPercent + (args.dx || 0)
            portY = args.dy || 0
            absoluteX = safePosition.x + portX
            absoluteY = safePosition.y + portY
          } else if (portConfig.name === 'left') {
            const args = portConfig.args || {}
            const yPercent = typeof args.y === 'string' && args.y.includes('%') ? 
              parseFloat(args.y) / 100 : 0.5
            portX = args.dx || 0
            portY = size.height * yPercent + (args.dy || 0)
            absoluteX = safePosition.x + portX
            absoluteY = safePosition.y + portY
          } else if (portConfig.name === 'right') {
            const args = portConfig.args || {}
            const yPercent = typeof args.y === 'string' && args.y.includes('%') ? 
              parseFloat(args.y) / 100 : 0.5
            portX = size.width + (args.dx || 0)
            portY = size.height * yPercent + (args.dy || 0)
            absoluteX = safePosition.x + portX
            absoluteY = safePosition.y + portY
          }
          
          const portInfo = {
            id: port.id,
            nodeId: node.id,
            group: portGroup,
            config: portConfig.name || 'unknown',
            position: {
              x: Math.round(portX),
              y: Math.round(portY)
            },
            absolutePosition: {
              x: Math.round(absoluteX),
              y: Math.round(absoluteY)
            }
          }
          
          if (portGroup === 'in' || portGroup === 'input') {
            portsSummary.input.push(portInfo)
          } else if (portGroup === 'out' || portGroup === 'output') {
            portsSummary.output.push(portInfo)
          }
          
          portsSummary.total++
        })
        
        nodesSummary.total++
      })
      
      // 统计连接线信息
      edges.forEach(edge => {
        const edgeData = edge.getData() || {}
        const sourceId = edge.getSourceCellId()
        const targetId = edge.getTargetCellId()
        const sourcePort = edge.getSourcePortId()
        const targetPort = edge.getTargetPortId()
        
        let sourcePoint = null
        let targetPoint = null
        
        try {
          sourcePoint = edge.getSourcePoint()
          targetPoint = edge.getTargetPoint()
        } catch (error) {
          // 获取坐标失败
        }
        
        // 检查目标是否为坐标点（预览线的情况）
        const targetCell = edge.getTargetCell()
        const isTargetCoordinate = !targetCell && targetPoint
        
        const edgeInfo = {
          id: edge.id,
          source: {
            nodeId: sourceId,
            portId: sourcePort,
            point: sourcePoint ? {
              x: Math.round(sourcePoint.x),
              y: Math.round(sourcePoint.y)
            } : null
          },
          target: isTargetCoordinate ? {
            nodeId: '坐标点',
            portId: `(${Math.round(targetPoint.x)}, ${Math.round(targetPoint.y)})`,
            point: targetPoint ? {
              x: Math.round(targetPoint.x),
              y: Math.round(targetPoint.y)
            } : null
          } : {
            nodeId: targetId,
            portId: targetPort,
            point: targetPoint ? {
              x: Math.round(targetPoint.x),
              y: Math.round(targetPoint.y)
            } : null
          },
          router: edge.getRouter()
        }
        
        if (edgeData.isPersistentPreview || edgeData.isPreview || edgeData.isUnifiedPreview || edge.id.includes('preview')) {
          edgesSummary.previews.push(edgeInfo)
        } else {
          edgesSummary.connections.push(edgeInfo)
        }
        
        edgesSummary.total++
      })
      
      // 🎯 拓扑分层分析：基于节点连接关系进行逻辑分层
      const layerAnalysis = {
        layers: [],
        nodeToLayer: new Map(),
        totalLayers: 0,
        mixedLayers: 0,
        pureNormalLayers: 0,
        pureEndpointLayers: 0,
        virtualEndpoints: [] // 存储虚拟endpoint信息
      }
      
      // 构建拓扑分层结构
      const topologicalLayers = buildTopologicalLayers(nodes, edges, connectionPreviewManager.value)
      layerAnalysis.layers = topologicalLayers.layers
      layerAnalysis.nodeToLayer = topologicalLayers.nodeToLayer
      layerAnalysis.totalLayers = topologicalLayers.layers.length
      
      // 🗑️ [已删除] 虚拟endpoint收集逻辑已被新的预览线分层策略替代
      
      // 🗑️ [已删除] endpoint节点类型分布分析已被新的预览线分层策略替代
      
      // 输出总结日志
      console.log(`📊 [重绘总结] 节点统计 (布局方向: ${layoutDirection.value}):`)
      console.log(`  ├─ 普通节点: ${nodesSummary.normal.length} 个`)
      console.log(`  └─ 节点总计: ${nodesSummary.total} 个`)
      
      console.log(`📏 [重绘总结] 分层统计 (${layoutDirection.value === 'TB' ? '垂直分层' : '水平分层'}):`);
      console.log(`  └─ 总层数: ${layerAnalysis.totalLayers} 层`)
      
      console.log(`🔌 [重绘总结] 端口统计:`)
      console.log(`  ├─ 输入端口: ${portsSummary.input.length} 个`)
      console.log(`  ├─ 输出端口: ${portsSummary.output.length} 个`)
      console.log(`  └─ 总计: ${portsSummary.total} 个`)
      
      console.log(`🔗 [重绘总结] 连接线统计:`)
      console.log(`  ├─ 普通连接: ${edgesSummary.connections.length} 条`)
      console.log(`  ├─ 预览线: ${edgesSummary.previews.length} 条`)
      console.log(`  └─ 总计: ${edgesSummary.total} 条`)
      
      // 🗑️ [已删除] 拓扑分层详情中的endpoint处理已被新的预览线分层策略替代
      
      // 详细位置信息
      if (nodesSummary.normal.length > 0) {
        console.log(`📍 [重绘总结] 普通节点位置详情:`)
        nodesSummary.normal.forEach((node, index) => {
          console.log(`  ${index + 1}. ${node.type} (${node.id}): 中心点(${node.center.x}, ${node.center.y}), 位置(${node.position.x}, ${node.position.y}), 尺寸(${node.size.width}×${node.size.height})`)
        })
      }
      
      // 🗑️ [已删除] endpoint位置详情已被新的预览线分层策略替代
      
      if (portsSummary.input.length > 0) {
        console.log(`🔌 [重绘总结] 输入端口位置详情:`)
        portsSummary.input.forEach((port, index) => {
          console.log(`  ${index + 1}. 输入端口 (${port.id}) 在节点 ${port.nodeId}: 绝对位置(${port.absolutePosition.x}, ${port.absolutePosition.y}), 相对位置(${port.position.x}, ${port.position.y}), 配置: ${port.config}`)
        })
      }
      
      if (portsSummary.output.length > 0) {
        console.log(`🔌 [重绘总结] 输出端口位置详情:`)
        portsSummary.output.forEach((port, index) => {
          console.log(`  ${index + 1}. 输出端口 (${port.id}) 在节点 ${port.nodeId}: 绝对位置(${port.absolutePosition.x}, ${port.absolutePosition.y}), 相对位置(${port.position.x}, ${port.position.y}), 配置: ${port.config}`)
        })
      }
      
      if (edgesSummary.connections.length > 0) {
        console.log(`🔗 [重绘总结] 普通连接线位置详情:`)
        edgesSummary.connections.forEach((edge, index) => {
          const routerName = typeof edge.router === 'string' ? edge.router : edge.router?.name || 'unknown'
          console.log(`  ${index + 1}. 连接线 (${edge.id}): ${edge.source.nodeId}[${edge.source.portId}] → ${edge.target.nodeId}[${edge.target.portId}], 路由器: ${routerName}`)
          if (edge.source.point && edge.target.point) {
            console.log(`     起点(${edge.source.point.x}, ${edge.source.point.y}) → 终点(${edge.target.point.x}, ${edge.target.point.y})`)
          }
        })
      }
      
      if (edgesSummary.previews.length > 0) {
        console.log(`🔗 [重绘总结] 预览线位置详情 (基于图中边):`)
        edgesSummary.previews.forEach((edge, index) => {
          const routerName = typeof edge.router === 'string' ? edge.router : edge.router?.name || 'unknown'
          console.log(`  ${index + 1}. 预览线 (${edge.id}): ${edge.source.nodeId}[${edge.source.portId}] → ${edge.target.nodeId}[${edge.target.portId}], 路由器: ${routerName}`)
          if (edge.source.point && edge.target.point) {
            console.log(`     起点(${edge.source.point.x}, ${edge.source.point.y}) → 终点(${edge.target.point.x}, ${edge.target.point.y})`)
          }
        })
      }
      
      // 🗑️ [已删除] 虚拟endpoint详情已被新的预览线分层策略替代
      
      // 布局质量分析
      const layoutQuality = analyzeLayoutQuality(nodesSummary, layoutDirection.value)
      console.log(`📈 [重绘总结] 布局质量分析:`)
      console.log(`  ├─ 对齐质量: ${layoutQuality.alignment}`)
      console.log(`  ├─ 间距分布: ${layoutQuality.spacing}`)
      console.log(`  ├─ 整体评分: ${layoutQuality.overall}`)
      console.log(`  └─ 建议: ${layoutQuality.suggestion}`)
      
      console.log(`✅ [重绘总结] 重绘完成总结生成完毕`)
      
    } catch (error) {
      console.error(`❌ [重绘总结] 生成总结失败:`, error)
    }
  }

  /**
   * 分析布局质量
   * @param {Object} nodesSummary - 节点统计信息
   * @param {string} direction - 布局方向
   * @returns {Object} 布局质量分析结果
   */
  const analyzeLayoutQuality = (nodesSummary, direction) => {
    const allNodes = [...nodesSummary.normal]
    
    if (allNodes.length === 0) {
      return {
        alignment: '无节点',
        spacing: '无节点',
        overall: '无法评估',
        suggestion: '请添加节点后重新评估'
      }
    }
    
    // 分析对齐情况
    let alignmentScore = 100
    const positions = allNodes.map(node => node.center)
    
    if (direction === 'TB') {
      // 垂直布局，检查X轴对齐
      const xCoords = positions.map(pos => pos.x)
      const xSpread = Math.max(...xCoords) - Math.min(...xCoords)
      if (xSpread > 50) alignmentScore -= 30
    } else {
      // 水平布局，检查Y轴对齐
      const yCoords = positions.map(pos => pos.y)
      const ySpread = Math.max(...yCoords) - Math.min(...yCoords)
      if (ySpread > 50) alignmentScore -= 30
    }
    
    // 分析间距分布
    let spacingScore = 100
    const distances = []
    for (let i = 0; i < positions.length - 1; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dx = positions[i].x - positions[j].x
        const dy = positions[i].y - positions[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)
        distances.push(distance)
      }
    }
    
    if (distances.length > 0) {
      const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length
      const minDistance = Math.min(...distances)
      
      if (minDistance < 50) spacingScore -= 20 // 节点太近
      if (avgDistance > 300) spacingScore -= 20 // 节点太远
    }
    
    // 综合评分
    const overallScore = (alignmentScore + spacingScore) / 2
    
    return {
      alignment: alignmentScore >= 80 ? '优秀' : alignmentScore >= 60 ? '良好' : '需要改进',
      spacing: spacingScore >= 80 ? '合理' : spacingScore >= 60 ? '可接受' : '需要调整',
      overall: overallScore >= 80 ? '优秀' : overallScore >= 60 ? '良好' : '需要优化',
      suggestion: overallScore >= 80 ? '布局质量良好，无需调整' : 
                 overallScore >= 60 ? '布局基本合理，可考虑微调' : 
                 '建议重新调整布局参数或手动优化节点位置'
    }
  }

  return {
    // 布局状态
    isLayouting: computed(() => isLayouting.value),
    layoutOptions: computed(() => layoutOptions.value),
    layoutStats: computed(() => layoutStats.value),
    layoutDirection: computed(() => layoutDirection.value),
    
    // 布局配置
    layoutConfig: computed(() => layoutConfig.value),
    
    // 布局方法
    initializeLayoutEngine,
    applyUnifiedStructuredLayout, // 🎯 统一结构化布局方法
    switchLayoutDirection,
    switchLayoutEngine, // 🆕 布局引擎切换方法
    
    // 布局选项控制
    updateLayoutOptions: (options) => { 
      layoutOptions.value = { ...layoutOptions.value, ...options } 
    },
    
    // 🆕 布局配置控制
    updateLayoutConfig: (config) => {
      layoutConfig.value = { ...layoutConfig.value, ...config }
    },
    
    // 🆕 获取当前布局引擎类型
    getCurrentLayoutEngine: () => layoutConfig.value.layoutEngine,
    
    // 🆕 检查是否支持hierarchy引擎
    isHierarchyEngineEnabled: () => layoutConfig.value.enableHierarchyEngine,
     
    // 坐标管理器
    coordinateManager,
    
    // 工具方法
    centerAndFitCanvas,
    updateLayoutStats,
    
    // 分层分析方法
    generateRedrawSummary: logRedrawSummary,
    analyzeLayoutQuality,
    
    // 调试方法
    getLayoutEngineStatus: () => ({
      coordinateManager: coordinateManager.getStatus(),
      stats: layoutStats.value
    }),
    
    // 🔧 关键修复：添加 getLayoutEngine 方法
    getLayoutEngine: () => {
      console.log('🔍 [布局引擎获取] 当前布局引擎实例:', !!layoutEngineInstance.value)
      return layoutEngineInstance.value
    },
    
    // 🔧 新增：暴露createLayoutEngineInstance方法供外部调用
    createLayoutEngineInstance,
    
    // 🔧 关键修复：添加setGetGraphFunction方法
    setGetGraphFunction: (getGraphFunc) => {
      console.log('🔧 [useStructuredLayout] 设置getGraph函数')
      getGraph = getGraphFunc
      console.log('✅ [useStructuredLayout] getGraph函数已设置，类型:', typeof getGraph)
    },
    
    // 管理器实例
    previewLineSystem: computed(() => connectionPreviewManager.value),
    isReady: computed(() => !!connectionPreviewManager.value)
  }
}