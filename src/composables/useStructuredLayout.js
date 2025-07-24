/**
 * 原生Dagre布局 Composable
 * 专注于原生Dagre布局，支持预览线和拖拽点处理
 */

import { ref, computed, nextTick } from 'vue'
import { DagreLayout } from '@antv/layout'
import { Graph } from '@antv/graphlib'
import { coordinateManager } from '../utils/CoordinateSystemManager.js'
import UnifiedPreviewLineManager from '../utils/UnifiedPreviewLineManager.js'

export function useStructuredLayout(getGraph) {
  const connectionPreviewManager = ref(null)
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
  
  // 布局配置
  const layoutConfig = ref({
    levelHeight: 150,
    nodeSpacing: 120,
    branchSpacing: 180,
    centerAlignment: true,
    gridSize: 20,
    previewLineSpacing: 80,
    enableIncrementalLayout: true,
    enableBatching: true,
    layoutThrottle: 100
  })

  /**
   * 初始化布局系统
   */
  const initializeLayoutEngine = () => {
    console.log('[useStructuredLayout] 初始化原生Dagre布局系统')
    
    try {
      const graph = getGraph()
      
      if (!graph) {
        console.error('[useStructuredLayout] 图实例不存在，无法初始化')
        return false
      }
      
      // 初始化坐标管理器
      coordinateManager.setGraph(graph)
      coordinateManager.setDebugMode(process.env.NODE_ENV === 'development')
      
      // 创建统一预览线管理器
      connectionPreviewManager.value = new UnifiedPreviewLineManager(graph, null, layoutConfig.value)
      
      // 初始化预览线管理器
      if (connectionPreviewManager.value) {
        connectionPreviewManager.value.init()
      }
      
      console.log('[useStructuredLayout] 原生Dagre布局系统初始化完成', {
        coordinateManager: coordinateManager.getStatus(),
        previewManager: !!connectionPreviewManager.value
      })
      return true
      
    } catch (error) {
      console.error('[useStructuredLayout] 初始化失败:', error)
      connectionPreviewManager.value = null
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
      console.log('[useStructuredLayout] 开始居中并适应画布内容')
      
      // 先居中内容
      graph.centerContent()
      
      // 然后适应缩放，限制最大缩放比例
      const currentScale = graph.zoom()
      graph.zoomToFit({ 
        padding: 50,
        maxScale: Math.min(1.2, currentScale * 1.5) // 限制最大缩放比例
      })
      
      console.log('[useStructuredLayout] 画布居中和适应完成')
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
    
    console.log('[useStructuredLayout] 布局统计信息已更新:', layoutStats.value)
  }

  /**
   * 应用原生Dagre布局
   * @param {Object} graph - 图实例
   * @returns {Promise<Object>} 布局结果
   */
  const applyNativeDagreLayout = async (graph) => {
    if (!graph) {
      throw new Error('[useStructuredLayout] Graph实例不能为空')
    }

    console.log('[useStructuredLayout] 开始应用原生Dagre布局')
    isLayouting.value = true

    try {
      // 获取所有节点和边
      const nodes = graph.getNodes()
      const edges = graph.getEdges()

      console.log('[useStructuredLayout] 收集图数据:', {
        nodeCount: nodes.length,
        edgeCount: edges.length
      })

      // 统计分支数量（预览线数量）
      let previewLineCount = 0
      let connectionLineCount = 0
      const previewLineIds = new Set() // 用于去重
      const connectionLineIds = new Set() // 用于去重
      
      console.log('[useStructuredLayout] 🔍 开始分析边的类型:')
      edges.forEach(edge => {
        const edgeId = edge.id || edge.getId()
        const edgeData = edge.getData()
        
        // 更严格的预览线识别逻辑
        const isPreviewLine = (
          (edgeData?.type === 'preview' || edgeData?.type === 'preview-line') ||
          (edgeId.includes('unified_preview') && !edgeId.includes('hint_')) ||
          (edgeId.includes('preview') && !edgeId.includes('hint_') && !edgeId.includes('virtual_target_'))
        )
        
        console.log(`[useStructuredLayout] 边分析: ${edgeId}`, {
          edgeData,
          isPreviewLine,
          source: edge.getSourceCellId(),
          target: edge.getTargetCellId(),
          targetInfo: edge.getTarget(),
          edgeIdPattern: {
            includesUnifiedPreview: edgeId.includes('unified_preview'),
            includesPreview: edgeId.includes('preview'),
            includesHint: edgeId.includes('hint_'),
            includesVirtualTarget: edgeId.includes('virtual_target_')
          }
        })
        
        if (isPreviewLine) {
          if (!previewLineIds.has(edgeId)) {
            previewLineIds.add(edgeId)
            previewLineCount++
            console.log(`[useStructuredLayout] ✅ 确认预览线: ${edgeId} (总数: ${previewLineCount})`)
          } else {
            console.log(`[useStructuredLayout] ⚠️ 重复预览线: ${edgeId}`)
          }
        } else {
          if (!connectionLineIds.has(edgeId)) {
            connectionLineIds.add(edgeId)
            connectionLineCount++
            console.log(`[useStructuredLayout] ✅ 确认连接线: ${edgeId} (总数: ${connectionLineCount})`)
          } else {
            console.log(`[useStructuredLayout] ⚠️ 重复连接线: ${edgeId}`)
          }
        }
      })
      
      console.log('[useStructuredLayout] 边类型统计:', {
        总边数: edges.length,
        预览线数: previewLineCount,
        连接线数: connectionLineCount,
        预览线列表: Array.from(previewLineIds),
        连接线列表: Array.from(connectionLineIds)
      })

      // 记录布局前的节点位置
      const beforePositions = {}
      nodes.forEach(node => {
        const nodeId = node.id || node.getId()
        const position = node.getPosition()
        const size = node.getSize()
        beforePositions[nodeId] = {
          position: { ...position },
          size: { ...size },
          center: {
            x: position.x + size.width / 2,
            y: position.y + size.height / 2
          }
        }
      })

      // 创建 @antv/graphlib 的 Graph 对象
      const layoutGraph = new Graph({
        nodes: nodes.map(node => {
          const size = node.getSize()
          const nodeId = node.id || node.getId()
          return {
            id: nodeId,
            data: {
              x: node.getPosition().x,
              y: node.getPosition().y,
              width: size.width,
              height: size.height,
              ...node.getData()
            }
          }
        }).concat(
          // 只添加虚拟目标节点（拖拽点已经在nodes中了）
          (() => {
            console.log('[useStructuredLayout] 🔍 开始检查虚拟目标节点创建:')
            const virtualNodes = []
            
            edges.forEach(edge => {
              const edgeId = edge.id || edge.getId()
              const edgeData = edge.getData()
              
              // 使用与统计相同的严格预览线识别逻辑
              const isPreviewLine = (
                (edgeData?.type === 'preview' || edgeData?.type === 'preview-line') ||
                (edgeId.includes('unified_preview') && !edgeId.includes('hint_')) ||
                (edgeId.includes('preview') && !edgeId.includes('hint_') && !edgeId.includes('virtual_target_'))
              )
              
              console.log(`[useStructuredLayout] 检查边 ${edgeId}:`, {
                isPreviewLine,
                edgeData,
                target: edge.getTarget(),
                edgeIdPattern: {
                  includesUnifiedPreview: edgeId.includes('unified_preview'),
                  includesPreview: edgeId.includes('preview'),
                  includesHint: edgeId.includes('hint_'),
                  includesVirtualTarget: edgeId.includes('virtual_target_')
                }
              })
              
              if (isPreviewLine) {
                // 检查是否需要创建虚拟目标节点（只有当没有拖拽点时才创建）
                const hintNodeId = `hint_${edgeId}`
                const hintNode = graph.getCellById(hintNodeId)
                
                console.log(`[useStructuredLayout] 预览线 ${edgeId} 拖拽点检查:`, {
                  hintNodeId,
                  hintNodeExists: !!hintNode
                })
                
                if (!hintNode) {
                  // 没有拖拽点，检查是否需要创建虚拟目标节点
                  const target = edge.getTarget()
                  console.log(`[useStructuredLayout] 预览线 ${edgeId} 目标检查:`, {
                    target,
                    hasCoordinates: target && target.x !== undefined && target.y !== undefined
                  })
                  
                  if (target && target.x !== undefined && target.y !== undefined) {
                    const virtualTargetId = `virtual_target_${edgeId}`
                    const virtualNode = {
                      id: virtualTargetId,
                      data: {
                        x: target.x,
                        y: target.y,
                        width: 20, // 虚拟节点的默认大小
                        height: 20,
                        type: 'virtual_target'
                      }
                    }
                    
                    console.log(`[useStructuredLayout] ✅ 创建虚拟目标节点:`, {
                      virtualTargetId,
                      position: { x: target.x, y: target.y },
                      forEdge: edgeId
                    })
                    
                    virtualNodes.push(virtualNode)
                  } else {
                    console.log(`[useStructuredLayout] ❌ 预览线 ${edgeId} 无有效目标坐标`)
                  }
                } else {
                  console.log(`[useStructuredLayout] ✅ 预览线 ${edgeId} 已有拖拽点，无需创建虚拟节点`)
                }
              }
            })
            
            console.log('[useStructuredLayout] 虚拟目标节点创建汇总:', {
              总虚拟节点数: virtualNodes.length,
              虚拟节点列表: virtualNodes.map(n => ({ id: n.id, position: { x: n.data.x, y: n.data.y } }))
            })
            
            return virtualNodes
          })()
        ),
        edges: edges.map(edge => {
          const edgeId = edge.id || edge.getId()
          let sourceId = edge.getSourceCellId() || edge.getSource()?.cell || edge.getSourceCell()?.id
          let targetId = edge.getTargetCellId() || edge.getTarget()?.cell || edge.getTargetCell()?.id
          
          // 检查是否是预览线 - 使用统一的严格识别逻辑
          const edgeData = edge.getData()
          const isPreviewLine = (
            (edgeData?.type === 'preview' || edgeData?.type === 'preview-line') ||
            (edgeId.includes('unified_preview') && !edgeId.includes('hint_')) ||
            (edgeId.includes('preview') && !edgeId.includes('hint_') && !edgeId.includes('virtual_target_'))
          )
          
          // 如果是预览线且targetId为undefined，尝试查找对应的拖拽点
          if (isPreviewLine && !targetId) {
            // 查找对应的拖拽点（hint node）
            const hintNodeId = `hint_${edgeId}`
            const hintNode = graph.getCellById(hintNodeId)
            if (hintNode) {
              targetId = hintNodeId
            } else {
              // 如果没有找到拖拽点，尝试从边的target位置创建虚拟节点ID
              const target = edge.getTarget()
              if (target && target.x !== undefined && target.y !== undefined) {
                targetId = `virtual_target_${edgeId}`
              }
            }
          }
          
          // 如果仍然无法获取到source或target，跳过这条边
          if (!sourceId || !targetId) {
            return null
          }
          
          return {
            id: edgeId,
            source: sourceId,
            target: targetId,
            data: edge.getData()
          }
        }).filter(Boolean) // 过滤掉null值
      })

      // 创建DagreLayout实例
      const dagreLayout = new DagreLayout({
        type: 'dagre',
        rankdir: 'TB', // 从上到下
        align: 'UL', // 左上对齐
        nodesep: 50, // 节点间距
        ranksep: 100, // 层级间距
        controlPoints: true // 启用控制点
      })

      console.log('[useStructuredLayout] 开始Dagre布局计算')
      const startTime = performance.now()

      // 执行布局计算
      const layoutResult = await dagreLayout.execute(layoutGraph)
      
      const endTime = performance.now()
      const layoutTime = endTime - startTime

      console.log('[useStructuredLayout] Dagre布局计算完成:', {
        layoutTime: `${layoutTime.toFixed(2)}ms`,
        resultNodes: layoutResult?.nodes?.length || 0,
        resultEdges: layoutResult?.edges?.length || 0
      })

      // 检查布局结果
      if (!layoutResult || !layoutResult.nodes) {
        throw new Error('布局计算失败，未返回有效结果')
      }

      // 记录布局后的节点位置变化
      const afterPositions = {}
      const positionChanges = []

      // 应用节点位置
      layoutResult.nodes.forEach(nodeData => {
        const node = graph.getCellById(nodeData.id)
        if (node && nodeData.data) {
          // DagreLayout返回的是中心点坐标，需要转换为左上角坐标
          const size = node.getSize()
          const oldPosition = node.getPosition()
          const newCenterPoint = { x: nodeData.data.x, y: nodeData.data.y }
          const newPosition = {
            x: nodeData.data.x - size.width / 2,
            y: nodeData.data.y - size.height / 2
          }
          
          // 计算位置变化
          const positionDelta = {
            x: newPosition.x - oldPosition.x,
            y: newPosition.y - oldPosition.y
          }
          const distance = Math.sqrt(positionDelta.x ** 2 + positionDelta.y ** 2)
          
          node.setPosition(newPosition)
          
          // 判断节点类型
          const nodeType = nodeData.data.type || 'normal'
          const isHintNode = nodeData.id.startsWith('hint_')
          const isVirtualTarget = nodeData.id.startsWith('virtual_target_')
          
          // 记录详细的位置更新信息
          const updateInfo = {
            nodeId: nodeData.id,
            nodeType,
            isHintNode,
            isVirtualTarget,
            oldPosition: { ...oldPosition },
            newCenterPoint,
            newPosition: { ...newPosition },
            positionDelta,
            distance: distance.toFixed(2),
            size: { ...size }
          }
          
          afterPositions[nodeData.id] = {
            position: { ...newPosition },
            center: { ...newCenterPoint },
            size: { ...size },
            type: nodeType
          }
          
          positionChanges.push(updateInfo)
          
        } else if (nodeData.id.startsWith('virtual_target_')) {
          // 处理虚拟目标节点（这些节点在图中不存在，但需要记录位置信息）
          const newCenterPoint = { x: nodeData.data.x, y: nodeData.data.y }
          const virtualSize = { width: 20, height: 20 }
          const newPosition = {
            x: nodeData.data.x - virtualSize.width / 2,
            y: nodeData.data.y - virtualSize.height / 2
          }
          
          const updateInfo = {
            nodeId: nodeData.id,
            nodeType: 'virtual_target',
            isVirtualTarget: true,
            oldPosition: { x: 0, y: 0 }, // 虚拟节点没有旧位置
            newCenterPoint,
            newPosition: { ...newPosition },
            positionDelta: newPosition,
            distance: Math.sqrt(newPosition.x ** 2 + newPosition.y ** 2).toFixed(2),
            size: { ...virtualSize }
          }
          
          afterPositions[nodeData.id] = {
            position: { ...newPosition },
            center: { ...newCenterPoint },
            size: { ...virtualSize },
            type: 'virtual_target'
          }
          
          positionChanges.push(updateInfo)
        }
      })

      // 应用边的路径（如果有控制点）
      if (layoutResult.edges) {
        layoutResult.edges.forEach(edgeData => {
          const edge = graph.getCellById(edgeData.id)
          if (edge && edgeData.data && edgeData.data.controlPoints && edgeData.data.controlPoints.length > 0) {
            // 设置边的顶点（控制点）
            edge.setVertices(edgeData.data.controlPoints)
          }
        })
      }

      // 按节点类型分类统计
      const nodeTypeStats = {
        normal: positionChanges.filter(c => !c.isHintNode && !c.isVirtualTarget),
        hintNodes: positionChanges.filter(c => c.isHintNode),
        virtualTargets: positionChanges.filter(c => c.isVirtualTarget)
      }
      
      console.log('[useStructuredLayout] 位置变化统计:', {
        totalNodes: positionChanges.length,
        normalNodes: nodeTypeStats.normal.length,
        hintNodes: nodeTypeStats.hintNodes.length,
        virtualTargets: nodeTypeStats.virtualTargets.length,
        nodeTypeBreakdown: {
          normal: {
            count: nodeTypeStats.normal.length,
            avgDistance: nodeTypeStats.normal.length > 0 ? 
              (nodeTypeStats.normal.reduce((sum, c) => sum + parseFloat(c.distance), 0) / nodeTypeStats.normal.length).toFixed(2) : 0
          },
          hintNodes: {
            count: nodeTypeStats.hintNodes.length,
            avgDistance: nodeTypeStats.hintNodes.length > 0 ? 
              (nodeTypeStats.hintNodes.reduce((sum, c) => sum + parseFloat(c.distance), 0) / nodeTypeStats.hintNodes.length).toFixed(2) : 0
          },
          virtualTargets: {
            count: nodeTypeStats.virtualTargets.length,
            avgDistance: nodeTypeStats.virtualTargets.length > 0 ? 
              (nodeTypeStats.virtualTargets.reduce((sum, c) => sum + parseFloat(c.distance), 0) / nodeTypeStats.virtualTargets.length).toFixed(2) : 0
          }
        }
      })

      // 检查布局方向（从上到下）
      if (positionChanges.length >= 2) {
        const sortedByY = [...positionChanges].sort((a, b) => a.newPosition.y - b.newPosition.y)
        console.log('[useStructuredLayout] 布局方向检查（从上到下）:', {
          topNode: { id: sortedByY[0].nodeId, y: sortedByY[0].newPosition.y },
          bottomNode: { id: sortedByY[sortedByY.length - 1].nodeId, y: sortedByY[sortedByY.length - 1].newPosition.y },
          verticalSpread: (sortedByY[sortedByY.length - 1].newPosition.y - sortedByY[0].newPosition.y).toFixed(2),
          isTopToBottom: sortedByY[0].newPosition.y < sortedByY[sortedByY.length - 1].newPosition.y
        })
      }

      // 居中并适应画布
      await nextTick()
      centerAndFitCanvas(graph)

      // 刷新预览线连接（确保预览线正确连接到更新后的拖拽点）
      if (connectionPreviewManager.value) {
        try {
          if (typeof connectionPreviewManager.value.refreshAllPreviewLines === 'function') {
            connectionPreviewManager.value.refreshAllPreviewLines(false, true) // 智能布局后刷新
            console.log('[useStructuredLayout] 预览线刷新完成 - 使用 refreshAllPreviewLines')
          } else if (typeof connectionPreviewManager.value.updateAllPreviewLinePositions === 'function') {
            connectionPreviewManager.value.updateAllPreviewLinePositions()
            console.log('[useStructuredLayout] 预览线刷新完成 - 使用 updateAllPreviewLinePositions')
          } else {
            console.warn('[useStructuredLayout] 预览线管理器没有可用的刷新方法')
          }
        } catch (error) {
          console.warn('[useStructuredLayout] 预览线刷新失败:', error)
        }
      } else {
        console.warn('[useStructuredLayout] 预览线管理器未初始化，跳过预览线刷新')
      }

      // 更新布局统计
      updateLayoutStats(layoutTime)

      // 🎯 汇总统计信息
      console.log('🎯 [原生Dagre布局] 汇总统计信息:')
      console.log('📊 布局汇总:', {
        '总节点数': nodes.length,
        '普通节点数': nodeTypeStats.normal.length,
        '拖拽点数': nodeTypeStats.hintNodes.length,
        '虚拟目标节点数': nodeTypeStats.virtualTargets.length,
        '总分支数': previewLineCount,
        '连接线数': connectionLineCount,
        '预览线数': previewLineCount,
        '布局耗时': `${layoutTime.toFixed(2)}ms`,
        '布局方向': 'TB (从上到下)',
        '节点间距': '50px',
        '层级间距': '100px'
      })

      console.log('[useStructuredLayout] 原生Dagre布局应用完成')

      return {
        type: 'native-dagre',
        layoutTime,
        nodeCount: nodes.length,
        normalNodeCount: nodeTypeStats.normal.length,
        hintNodeCount: nodeTypeStats.hintNodes.length,
        virtualTargetCount: nodeTypeStats.virtualTargets.length,
        branchCount: previewLineCount,
        connectionLineCount: connectionLineCount,
        previewLineCount: previewLineCount,
        edgeCount: layoutResult.edges ? layoutResult.edges.length : 0,
        success: true
      }

    } catch (error) {
      console.error('[useStructuredLayout] 应用原生Dagre布局失败:', error)
      throw error
    } finally {
      isLayouting.value = false
    }
  }

  return {
    // 布局状态
    isLayouting: computed(() => isLayouting.value),
    layoutOptions: computed(() => layoutOptions.value),
    layoutStats: computed(() => layoutStats.value),
    
    // 布局配置
    layoutConfig: computed(() => layoutConfig.value),
    
    // 布局方法
    initializeLayoutEngine,
    applyNativeDagreLayout,
    
    // 布局选项控制
    updateLayoutOptions: (options) => { 
      layoutOptions.value = { ...layoutOptions.value, ...options } 
    },
    
    // 坐标管理器
    coordinateManager,
    
    // 工具方法
    centerAndFitCanvas,
    updateLayoutStats,
    
    // 调试方法
    getLayoutEngineStatus: () => ({
      coordinateManager: coordinateManager.getStatus(),
      stats: layoutStats.value
    }),
    
    // 管理器实例
    unifiedPreviewManager: computed(() => connectionPreviewManager.value),
    isReady: computed(() => !!connectionPreviewManager.value)
  }
}