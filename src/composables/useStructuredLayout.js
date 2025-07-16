/**
 * 结构化布局 Composable
 * 整合结构化布局引擎和分支布局管理器
 */

import { ref, computed } from 'vue'
import StructuredLayoutEngine, { CONNECTION_RULES } from '../utils/StructuredLayoutEngine.js'
import BranchLayoutManager from '../utils/BranchLayoutManager.js'
import ConnectionPreviewManager from '../utils/ConnectionPreviewManager.js'

export function useStructuredLayout(getGraph) {
  const layoutEngine = ref(null)
  const branchManager = ref(null)
  const connectionPreviewManager = ref(null)
  const isLayouting = ref(false)

  // 初始化布局引擎
  const initLayoutEngine = () => {
    console.log('[useStructuredLayout] 尝试初始化布局引擎')
    const graph = getGraph()
    console.log('[useStructuredLayout] 获取到的图实例:', graph)
    
    if (graph && !layoutEngine.value) {
      layoutEngine.value = new StructuredLayoutEngine(graph)
      branchManager.value = new BranchLayoutManager(graph)
      connectionPreviewManager.value = new ConnectionPreviewManager(graph, branchManager.value)
      
      console.log('[useStructuredLayout] 结构化布局引擎已初始化')
      console.log('[useStructuredLayout] 布局引擎实例:', layoutEngine.value)
      console.log('[useStructuredLayout] 分支管理器实例:', branchManager.value)
      console.log('[useStructuredLayout] 连接预览管理器实例:', connectionPreviewManager.value)
    } else {
      console.log('[useStructuredLayout] 布局引擎初始化跳过 - 图实例:', !!graph, '引擎已存在:', !!layoutEngine.value)
    }
    return layoutEngine.value
  }

  // 获取布局引擎
  const getLayoutEngine = () => {
    return layoutEngine.value || initLayoutEngine()
  }

  // 获取分支管理器
  const getBranchManager = () => {
    return branchManager.value || initLayoutEngine() && branchManager.value
  }

  // 获取连接预览管理器
  const getConnectionPreviewManager = () => {
    return connectionPreviewManager.value || initLayoutEngine() && connectionPreviewManager.value
  }

  /**
   * 验证节点连接
   * @param {Object} sourceNode - 源节点
   * @param {Object} targetNode - 目标节点
   * @returns {boolean} 是否允许连接
   */
  const validateConnection = (sourceNode, targetNode) => {
    const engine = getLayoutEngine()
    if (!engine) {
      console.error('[useStructuredLayout] 布局引擎未初始化')
      return false
    }

    return engine.validateConnection(sourceNode, targetNode)
  }

  /**
   * 应用结构化布局
   * @param {boolean} includePreviewLines - 是否包含预览线处理，默认true
   */
  const applyStructuredLayout = (includePreviewLines = true) => {
    const graph = getGraph()
    if (!graph) {
      console.warn('[useStructuredLayout] 画布未初始化')
      return
    }

    try {
      console.log('[useStructuredLayout] 开始应用结构化布局', { includePreviewLines })
      
      const nodes = graph.getNodes()
      const edges = graph.getEdges()
      
      // 获取预览线管理器
      const previewManager = getConnectionPreviewManager()
      let previewLines = []
      
      if (includePreviewLines && previewManager) {
        // 获取当前的预览线
        previewLines = previewManager.getActivePreviewLines()
        console.log('[useStructuredLayout] 发现预览线:', previewLines.length)
      }

      // 使用结构化布局引擎计算布局
      const layoutEngine = getLayoutEngine()
      if (!layoutEngine) {
        console.error('[useStructuredLayout] 布局引擎未初始化')
        return
      }

      // 计算包含预览线的布局
      const layoutResult = layoutEngine.calculateLayout(nodes, edges, previewLines)
      
      if (layoutResult && layoutResult.positions) {
        console.log('[useStructuredLayout] 应用节点位置:', Object.keys(layoutResult.positions).length)
        
        // 应用节点位置
        Object.entries(layoutResult.positions).forEach(([nodeId, position]) => {
          const node = graph.getCellById(nodeId)
          if (node && node.isNode()) {
            node.setPosition(position.x, position.y, { silent: true })
          }
        })

        // 如果有预览线且布局完成，将预览线转换为实际连接
        if (includePreviewLines && previewLines.length > 0 && previewManager) {
          console.log('[useStructuredLayout] 开始转换预览线为实际连接')
          
          setTimeout(() => {
            previewLines.forEach(previewLine => {
              // 只转换持久化预览线，且需要有明确的目标节点
              if (previewLine.type === 'persistent' && previewLine.sourceNode) {
                console.log('[useStructuredLayout] 跳过持久化预览线转换:', previewLine.id)
                // 持久化预览线不需要转换，它们是用来显示可能的连接点
                return
              }
              
              if (previewLine.targetNode && previewLine.sourceNode) {
                console.log('[useStructuredLayout] 转换预览线:', previewLine.id)
                // 使用正确的参数调用createSnapConnection
                previewManager.createSnapConnection(
                  previewLine.sourceNode.id,
                  previewLine.targetNode.id,
                  previewLine.branchId
                )
              }
            })
          }, 200) // 给布局一些时间完成
        }

        // 触发画布重绘
        graph.trigger('layout:applied')
        console.log('[useStructuredLayout] 结构化布局应用完成')
      }
    } catch (error) {
      console.error('[useStructuredLayout] 应用结构化布局失败:', error)
    }
  }

  /**
   * 更新分流节点的分支布局
   * @param {Object} splitNode - 分流节点
   * @param {Object} config - 节点配置
   * @param {boolean} triggerStructuredLayout - 是否触发结构化布局，默认false
   */
  const updateSplitNodeBranches = (splitNode, config, triggerStructuredLayout = false) => {
    const manager = getBranchManager()
    if (!manager) {
      console.error('[useStructuredLayout] 分支管理器未初始化')
      return
    }

    try {
      console.log('[useStructuredLayout] 更新分流节点分支:', splitNode.id, { triggerStructuredLayout })
      // 传递skipStructuredLayout参数，与triggerStructuredLayout相反
      manager.updateBranchLayout(splitNode, config, !triggerStructuredLayout)
      
      // 创建预览线
      const previewManager = getConnectionPreviewManager()
      if (previewManager) {
        console.log('[useStructuredLayout] 为分流节点创建预览线:', splitNode.id)
        // 先清除该节点的现有预览线
        previewManager.clearNodePreviews(splitNode.id)
        // 创建新的预览线
        previewManager.createPersistentPreview(splitNode)
      } else {
        console.warn('[useStructuredLayout] 连接预览管理器未初始化，跳过预览线创建')
      }
      
      // 只有明确要求时才触发结构化布局
      if (triggerStructuredLayout) {
        console.log('[useStructuredLayout] 手动触发结构化布局')
        setTimeout(() => {
          applyStructuredLayout()
        }, 100)
      } else {
        console.log('[useStructuredLayout] 跳过自动触发结构化布局')
      }
    } catch (error) {
      console.error('[useStructuredLayout] 更新分支布局失败:', error)
    }
  }

  /**
   * 获取节点的约束信息
   * @param {Object} node - 节点
   * @returns {Object} 约束信息
   */
  const getNodeConstraints = (node) => {
    const engine = getLayoutEngine()
    if (!engine) return {}
    
    return engine.getNodeConstraints(node)
  }

  /**
   * 检查节点是否可以添加输出连接
   * @param {Object} node - 节点
   * @returns {boolean} 是否可以添加输出连接
   */
  const canAddOutput = (node) => {
    const engine = getLayoutEngine()
    if (!engine) return true
    
    const nodeType = node.getData()?.type
    const rule = CONNECTION_RULES[nodeType]
    if (!rule) return true
    
    return engine.checkOutputConstraints(node, rule)
  }

  /**
   * 检查节点是否可以添加输入连接
   * @param {Object} node - 节点
   * @returns {boolean} 是否可以添加输入连接
   */
  const canAddInput = (node) => {
    const engine = getLayoutEngine()
    if (!engine) return true
    
    const nodeType = node.getData()?.type
    const rule = CONNECTION_RULES[nodeType]
    if (!rule) return true
    
    return engine.checkInputConstraints(node, rule)
  }

  /**
   * 获取节点允许的目标类型
   * @param {Object} node - 节点
   * @returns {Array} 允许的目标类型数组
   */
  const getAllowedTargetTypes = (node) => {
    const constraints = getNodeConstraints(node)
    return constraints.allowedTargets || []
  }

  /**
   * 切换节点端口模式
   * @param {Object} node - 节点
   * @param {string} mode - 模式 ('simplified' | 'detailed' | 'auto')
   */
  const toggleNodePortMode = (node, mode = 'auto') => {
    const manager = getBranchManager()
    if (!manager) {
      console.error('[useStructuredLayout] 分支管理器未初始化')
      return
    }

    try {
      manager.togglePortMode(node, mode)
      console.log('[useStructuredLayout] 节点端口模式已切换:', node.id, mode)
    } catch (error) {
      console.error('[useStructuredLayout] 切换端口模式失败:', error)
    }
  }

  /**
   * 检查节点是否为简化模式
   * @param {Object} node - 节点
   * @returns {boolean} 是否为简化模式
   */
  const isNodeSimplified = (node) => {
    const manager = getBranchManager()
    if (!manager) return false
    
    return manager.isSimplifiedMode(node)
  }

  /**
   * 获取节点分支信息
   * @param {Object} node - 节点
   * @returns {Array} 分支数组
   */
  const getNodeBranches = (node) => {
    const manager = getBranchManager()
    if (!manager) return []
    
    return manager.getNodeBranches(node)
  }

  /**
   * 清理布局数据
   */
  const clearLayout = () => {
    if (connectionPreviewManager.value) {
      connectionPreviewManager.value.destroy()
      connectionPreviewManager.value = null
    }
    if (layoutEngine.value) {
      layoutEngine.value = null
    }
    if (branchManager.value) {
      branchManager.value = null
    }
    console.log('[useStructuredLayout] 布局数据已清理')
  }

  // 计算状态
  const isReady = computed(() => {
    const ready = !!layoutEngine.value && !!branchManager.value && !!connectionPreviewManager.value
    console.log('[useStructuredLayout] isReady 计算:', {
      layoutEngine: !!layoutEngine.value,
      branchManager: !!branchManager.value,
      connectionPreviewManager: !!connectionPreviewManager.value,
      ready
    })
    return ready
  })

  return {
    // 状态
    isLayouting,
    isReady,
    
    // 方法
    initLayoutEngine,
    getLayoutEngine,
    getBranchManager,
    getConnectionPreviewManager,
    validateConnection,
    applyLayout: applyStructuredLayout, // 添加别名
    applyStructuredLayout,
    updateSplitNodeBranches,
    getNodeConstraints,
    canAddOutput,
    canAddInput,
    getAllowedTargetTypes,
    clearLayout,
    
    // 新增的端口和预览相关方法
    toggleNodePortMode,
    isNodeSimplified,
    getNodeBranches
  }
}

export default useStructuredLayout