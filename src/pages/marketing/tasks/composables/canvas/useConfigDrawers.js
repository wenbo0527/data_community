import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useStructuredLayout } from './useStructuredLayout.js'
import { nodeConfigManager } from '../../utils/canvas/NodeConfigManager.js'

/**
 * 配置抽屉管理 Composable
 * 统一管理所有节点配置抽屉的状态和逻辑
 */
export function useConfigDrawers(getGraph, nodeOperations = {}) {
  // 调试：验证getGraph函数
  console.log('[useConfigDrawers] 接收到的getGraph函数:', typeof getGraph, !!getGraph)
  if (getGraph) {
    const graphInstance = getGraph()
    console.log('[useConfigDrawers] 测试getGraph函数调用:', graphInstance ? 'Graph实例存在' : 'Graph实例为null')
  }
  
  // 初始化结构化布局
  const structuredLayout = useStructuredLayout(getGraph)
  
  // 增强预设线管理器引用
  let enhancedPreviewManager = null
  
  // 设置增强预设线管理器
  const setEnhancedPreviewManager = (manager) => {
    enhancedPreviewManager = manager
    console.log('[useConfigDrawers] 设置增强预设线管理器:', !!manager)
  }
  
  // 抽屉状态管理
  const drawerStates = reactive({
    start: {
      visible: false,
      data: {},
      instance: null
    },
    'crowd-split': {
      visible: false,
      data: {},
      instance: null
    },
    'event-split': {
      visible: false,
      data: {},
      instance: null
    },
    'ai-call': {
      visible: false,
      data: {},
      instance: null
    },
    sms: {
      visible: false,
      data: {},
      instance: null
    },
    'manual-call': {
      visible: false,
      data: {},
      instance: null
    },
    'ab-test': {
      visible: false,
      data: {},
      instance: null
    },
    wait: {
      visible: false,
      data: {},
      instance: null
    },
    benefit: {
      visible: false,
      data: {},
      instance: null
    }
  })

  /**
   * 打开配置抽屉
   * @param {string} nodeType - 节点类型
   * @param {Object} node - 节点实例
   * @param {Object} data - 配置数据
   */
  const openConfigDrawer = (nodeType, node, data = {}) => {
    console.log(`[useConfigDrawers] 开始打开配置抽屉 - 节点类型: ${nodeType}, 节点ID: ${node.id}`)
    
    // 映射节点类型到抽屉类型
    const drawerType = getDrawerType(nodeType)
    console.log(`[useConfigDrawers] 映射后的抽屉类型: ${drawerType}`)
    
    if (!drawerStates[drawerType]) {
      console.warn(`Unknown drawer type: ${drawerType}`)
      return
    }

    // 检查当前抽屉状态
    console.log(`[useConfigDrawers] 当前抽屉状态:`, {
      drawerType,
      visible: drawerStates[drawerType].visible,
      hasData: Object.keys(drawerStates[drawerType].data).length > 0,
      hasInstance: !!drawerStates[drawerType].instance
    })

    // 关闭其他抽屉（除了当前要打开的抽屉）
    console.log(`[useConfigDrawers] 关闭其他抽屉（除了 ${drawerType}）...`)
    closeAllDrawers(drawerType)

    // 检查是否为新节点（没有配置数据或配置数据为空）
    const isNewNode = !data || Object.keys(data).length === 0 || 
                     (data.config && Object.keys(data.config).length === 0)
    
    console.log(`[useConfigDrawers] 节点状态检查:`, {
      nodeId: node.id,
      isNewNode,
      dataKeys: data ? Object.keys(data) : [],
      configKeys: data?.config ? Object.keys(data.config) : []
    })

    // 确保data中包含节点ID和新节点标识
    const drawerData = {
      ...data,
      nodeId: node.id,
      nodeType: nodeType,
      isNewNode: isNewNode  // 添加新节点标识
    }

    // 打开指定抽屉
    console.log(`[useConfigDrawers] 设置抽屉状态为可见...`)
    drawerStates[drawerType].visible = true
    drawerStates[drawerType].data = drawerData
    drawerStates[drawerType].instance = node

    console.log(`[useConfigDrawers] 打开配置抽屉完成: ${drawerType}, 节点ID: ${node.id}, 是否新节点: ${isNewNode}`)
    console.log(`[useConfigDrawers] 最终抽屉状态:`, {
      visible: drawerStates[drawerType].visible,
      dataKeys: Object.keys(drawerStates[drawerType].data),
      instanceId: drawerStates[drawerType].instance?.id
    })
  }

  /**
   * 关闭配置抽屉
   * @param {string} drawerType - 抽屉类型
   */
  const closeConfigDrawer = (drawerType) => {
    console.log(`[useConfigDrawers] 开始关闭配置抽屉: ${drawerType}`)
    
    if (!drawerStates[drawerType]) {
      console.warn(`[useConfigDrawers] 未知的抽屉类型: ${drawerType}`)
      return
    }

    const wasVisible = drawerStates[drawerType].visible
    
    // 如果抽屉已经关闭，避免重复操作
    if (!wasVisible) {
      console.log(`[useConfigDrawers] 抽屉 ${drawerType} 已经关闭，跳过重复关闭操作`)
      return
    }
    
    drawerStates[drawerType].visible = false
    drawerStates[drawerType].data = {}
    drawerStates[drawerType].instance = null

    console.log(`[useConfigDrawers] 关闭配置抽屉完成: ${drawerType}`)
  }

  /**
   * 关闭所有抽屉
   * @param {string} excludeDrawerType - 要排除的抽屉类型（不关闭）
   */
  const closeAllDrawers = (excludeDrawerType = null) => {
    console.log(`[useConfigDrawers] 关闭所有抽屉，排除: ${excludeDrawerType}`)
    Object.keys(drawerStates).forEach(drawerType => {
      if (drawerStates[drawerType].visible && drawerType !== excludeDrawerType) {
        console.log(`[useConfigDrawers] 关闭抽屉: ${drawerType}`)
        closeConfigDrawer(drawerType)
      } else if (drawerType === excludeDrawerType) {
        console.log(`[useConfigDrawers] 跳过关闭抽屉: ${drawerType}`)
      }
    })
  }

  /**
   * 处理配置确认
   * @param {string} drawerType - 抽屉类型
   * @param {Object} config - 配置数据
   */
  const handleConfigConfirm = async (drawerType, config) => {
    console.log(`[useConfigDrawers] 开始处理配置确认 - ${drawerType}:`, config)
    
    try {
      const nodeInstance = getCurrentNodeInstance()
      console.log(`[useConfigDrawers] 获取到节点实例:`, { nodeId: nodeInstance?.id, nodeType: nodeInstance?.getData()?.type })
      
      if (!nodeInstance) {
        console.error('[useConfigDrawers] 节点实例不存在')
        throw new Error('节点实例不存在')
      }

      // 获取节点类型
      const nodeType = getNodeTypeFromDrawerType(drawerType)
      console.log(`[useConfigDrawers] 映射节点类型: ${drawerType} -> ${nodeType}`)
      
      // 准备上下文对象
      const context = {
        nodeOperations,
        structuredLayout,
        graph: getGraph()
      }

      // 使用统一的节点配置管理器处理配置
      await nodeConfigManager.processNodeConfig(nodeType, nodeInstance, config, context)

      // 触发节点更新事件，让父组件能够同步本地数据
      const graph = getGraph()
      if (graph && graph.trigger) {
        graph.trigger('node:config-updated', {
          node: nodeInstance,
          nodeType: nodeType,
          config: config
        })
      }

      // 🔧 关键修复：触发统一预览线创建（配置完成后）
      console.log(`[useConfigDrawers] 检查是否需要创建配置后预览线`)
      
      // 🎯 修复：正确获取预览线系统实例
      // 优先从全局window对象获取，确保获取到正确初始化的实例
      let previewLineSystem = null
      let unifiedPreviewManager = null
      
      // 方案1：从全局window对象获取PreviewLineSystem（最可靠）
      if (typeof window !== 'undefined' && window.previewLineSystem) {
        previewLineSystem = window.previewLineSystem
        console.log(`[useConfigDrawers] 从全局window获取预览线系统:`, !!previewLineSystem)
      }
      
      // 方案2：从全局window对象获取UnifiedEdgeManager（最可靠）
      if (typeof window !== 'undefined' && window.unifiedEdgeManager) {
        unifiedPreviewManager = window.unifiedEdgeManager
        console.log(`[useConfigDrawers] 从全局window获取统一边管理器:`, !!unifiedPreviewManager)
      }
      
      // 方案3：从structuredLayout获取previewLineSystem（备用）
      if (!previewLineSystem && structuredLayout) {
        const previewLineSystemRef = structuredLayout.previewLineSystem?.value || structuredLayout.previewLineSystem
        if (previewLineSystemRef) {
          previewLineSystem = previewLineSystemRef
          console.log(`[useConfigDrawers] 从structuredLayout获取预览线系统:`, !!previewLineSystem)
        }
      }
      
      // 方案4：从structuredLayout获取unifiedPreviewManager（备用）
      if (!unifiedPreviewManager && structuredLayout) {
        const unifiedPreviewManagerRef = structuredLayout.unifiedPreviewManager?.value || structuredLayout.unifiedPreviewManager
        if (unifiedPreviewManagerRef) {
          unifiedPreviewManager = unifiedPreviewManagerRef
          console.log(`[useConfigDrawers] 从structuredLayout获取统一预览管理器:`, !!unifiedPreviewManager)
        }
      }
      
      // 输出详细调试信息
      console.log(`[useConfigDrawers] 预览线系统实例:`, previewLineSystem ? 'Available' : 'undefined')
      console.log(`[useConfigDrawers] 统一边管理器实例:`, unifiedPreviewManager ? 'Available' : 'undefined')
      console.log(`[useConfigDrawers] 预览线系统类型:`, previewLineSystem?.constructor?.name || 'undefined')
      console.log(`[useConfigDrawers] 统一边管理器类型:`, unifiedPreviewManager?.constructor?.name || 'undefined')
      
      // 🔧 增强调试：检查管理器初始化状态
      if (previewLineSystem) {
        console.log(`[useConfigDrawers] PreviewLineSystem初始化状态:`, {
          isInitialized: typeof previewLineSystem.isInitialized === 'function' ? previewLineSystem.isInitialized() : 'unknown',
          hasGraph: !!previewLineSystem.graph,
          hasPreviewLineManager: !!previewLineSystem.previewLineManager
        })
      }
      
      if (unifiedPreviewManager) {
        console.log(`[useConfigDrawers] UnifiedEdgeManager初始化状态:`, {
          isInitialized: unifiedPreviewManager.isInitialized?.value || 'unknown',
          hasGraph: !!unifiedPreviewManager.graph,
          edgesCount: unifiedPreviewManager.edges?.size || 0,
          previewLinesCount: unifiedPreviewManager.previewLines?.size || 0
        })
      }
      
      if (!previewLineSystem && !unifiedPreviewManager) {
        console.warn(`[useConfigDrawers] 预览线管理器不存在或方法不可用`)
        console.log(`[useConfigDrawers] 调试信息:`, {
          structuredLayoutExists: !!structuredLayout,
          structuredLayoutKeys: structuredLayout ? Object.keys(structuredLayout) : [],
          windowKeys: typeof window !== 'undefined' ? Object.keys(window).filter(key => key.includes('preview') || key.includes('unified') || key.includes('edge')) : [],
          windowPreviewLineSystem: !!(typeof window !== 'undefined' && window.previewLineSystem),
          windowUnifiedEdgeManager: !!(typeof window !== 'undefined' && window.unifiedEdgeManager)
        })
      } else {
        // 输出可用方法列表
        const previewSystemMethods = []
        const unifiedManagerMethods = []
        
        if (previewLineSystem) {
          const testMethods = ['onNodeConfigured', 'createUnifiedPreviewLine', 'handleNodeConfigured', 'createPreviewLineAfterConfig']
          for (const method of testMethods) {
            if (typeof previewLineSystem[method] === 'function') {
              previewSystemMethods.push(method)
            }
          }
        }
        
        if (unifiedPreviewManager) {
          const testMethods = ['onNodeConfigured', 'createPreviewLineAfterConfig', 'handleNodeConfigured', 'createBranchPreviewLines']
          for (const method of testMethods) {
            if (typeof unifiedPreviewManager[method] === 'function') {
              unifiedManagerMethods.push(method)
            }
          }
        }
        
        console.log(`[useConfigDrawers] PreviewLineSystem可用方法:`, previewSystemMethods.join(', ') || 'N/A')
        console.log(`[useConfigDrawers] UnifiedEdgeManager可用方法:`, unifiedManagerMethods.join(', ') || 'N/A')
      }
      
      // 🎯 优先使用PreviewLineSystem的方法
      if (previewLineSystem) {
        console.log(`[useConfigDrawers] 使用PreviewLineSystem处理节点配置完成事件`)
        
        // 🔧 增强调试：检查PreviewLineSystem状态
        console.log(`[useConfigDrawers] PreviewLineSystem详细状态:`, {
          isInitialized: typeof previewLineSystem.isInitialized === 'function' ? previewLineSystem.isInitialized() : 'unknown',
          hasGraph: !!previewLineSystem.graph,
          hasPreviewLineManager: !!previewLineSystem.previewLineManager,
          graphCellsCount: previewLineSystem.graph?.getCells()?.length || 0,
          nodeExists: !!previewLineSystem.graph?.getCellById(nodeInstance.id)
        })
        
        // 检查可用的方法
        const availableMethods = []
        if (typeof previewLineSystem.onNodeConfigured === 'function') {
          availableMethods.push('onNodeConfigured')
        }
        if (typeof previewLineSystem.createUnifiedPreviewLine === 'function') {
          availableMethods.push('createUnifiedPreviewLine')
        }
        if (typeof previewLineSystem.handleNodeConfigured === 'function') {
          availableMethods.push('handleNodeConfigured')
        }
        if (typeof previewLineSystem.createPreviewLineAfterConfig === 'function') {
          availableMethods.push('createPreviewLineAfterConfig')
        }
        
        console.log(`[useConfigDrawers] PreviewLineSystem可用方法:`, availableMethods)
        
        // 🔧 增强调试：检查节点数据
        const nodeData = nodeInstance.getData() || {}
        console.log(`[useConfigDrawers] 节点数据检查:`, {
          nodeId: nodeInstance.id,
          nodeType: nodeData.type || nodeData.nodeType,
          isConfigured: nodeData.isConfigured,
          configKeys: config ? Object.keys(config) : [],
          nodeDataKeys: Object.keys(nodeData)
        })
        
        // 尝试调用最合适的方法
        if (typeof previewLineSystem.onNodeConfigured === 'function') {
          console.log(`[useConfigDrawers] 调用PreviewLineSystem.onNodeConfigured: ${nodeInstance.id}`)
          try {
            const result = await previewLineSystem.onNodeConfigured(nodeInstance.id, config)
            console.log(`[useConfigDrawers] PreviewLineSystem节点配置完成事件处理结果:`, result)
            
            // 🔧 增强调试：检查预览线创建结果
            if (previewLineSystem.hasNodePreviewLine && typeof previewLineSystem.hasNodePreviewLine === 'function') {
              const hasPreviewLine = previewLineSystem.hasNodePreviewLine(nodeInstance.id)
              console.log(`[useConfigDrawers] 预览线创建检查:`, {
                nodeId: nodeInstance.id,
                hasPreviewLine: hasPreviewLine,
                result: result
              })
            }
          } catch (error) {
            console.error(`[useConfigDrawers] PreviewLineSystem节点配置完成事件处理失败:`, error)
            console.error(`[useConfigDrawers] 错误堆栈:`, error.stack)
          }
        } else if (typeof previewLineSystem.handleNodeConfigured === 'function') {
          console.log(`[useConfigDrawers] 调用PreviewLineSystem.handleNodeConfigured: ${nodeInstance.id}`)
          try {
            const result = await previewLineSystem.handleNodeConfigured(nodeInstance, config)
            console.log(`[useConfigDrawers] PreviewLineSystem节点配置处理结果:`, result)
          } catch (error) {
            console.error(`[useConfigDrawers] PreviewLineSystem节点配置处理失败:`, error)
            console.error(`[useConfigDrawers] 错误堆栈:`, error.stack)
          }
        } else if (typeof previewLineSystem.createUnifiedPreviewLine === 'function') {
          console.log(`[useConfigDrawers] 调用PreviewLineSystem.createUnifiedPreviewLine: ${nodeInstance.id}`)
          try {
            const result = await previewLineSystem.createUnifiedPreviewLine(nodeInstance)
            console.log(`[useConfigDrawers] PreviewLineSystem统一预览线创建结果:`, result)
          } catch (error) {
            console.error(`[useConfigDrawers] PreviewLineSystem统一预览线创建失败:`, error)
            console.error(`[useConfigDrawers] 错误堆栈:`, error.stack)
          }
        }
      } 
      // 🔄 备用方案：使用UnifiedEdgeManager
      else if (unifiedPreviewManager) {
        console.log(`[useConfigDrawers] 使用UnifiedEdgeManager处理节点配置完成事件`)
        
        // 🔧 增强调试：检查UnifiedEdgeManager状态
        console.log(`[useConfigDrawers] UnifiedEdgeManager详细状态:`, {
          isInitialized: unifiedPreviewManager.isInitialized?.value || 'unknown',
          hasGraph: !!unifiedPreviewManager.graph,
          edgesCount: unifiedPreviewManager.edges?.size || 0,
          previewLinesCount: unifiedPreviewManager.previewLines?.size || 0,
          connectionsCount: unifiedPreviewManager.connections?.size || 0,
          graphCellsCount: unifiedPreviewManager.graph?.getCells()?.length || 0,
          nodeExists: !!unifiedPreviewManager.graph?.getCellById(nodeInstance.id)
        })
        
        const availableMethods = []
        if (typeof unifiedPreviewManager.onNodeConfigured === 'function') {
          availableMethods.push('onNodeConfigured')
        }
        if (typeof unifiedPreviewManager.createPreviewLineAfterConfig === 'function') {
          availableMethods.push('createPreviewLineAfterConfig')
        }
        if (typeof unifiedPreviewManager.handleNodeConfigured === 'function') {
          availableMethods.push('handleNodeConfigured')
        }
        if (typeof unifiedPreviewManager.createBranchPreviewLines === 'function') {
          availableMethods.push('createBranchPreviewLines')
        }
        
        console.log(`[useConfigDrawers] UnifiedEdgeManager可用方法:`, availableMethods)
        
        // 🔧 增强调试：检查节点数据和配置
        const nodeData = nodeInstance.getData() || {}
        console.log(`[useConfigDrawers] UnifiedEdgeManager节点数据检查:`, {
          nodeId: nodeInstance.id,
          nodeType: nodeData.type || nodeData.nodeType,
          configType: config.type,
          isConfigured: nodeData.isConfigured,
          configKeys: config ? Object.keys(config) : [],
          nodeDataKeys: Object.keys(nodeData),
          isBranchType: ['crowd-split', 'event-split', 'ab-test', 'audience-split'].includes(config.type || nodeData.type || nodeData.nodeType)
        })
        
        if (typeof unifiedPreviewManager.onNodeConfigured === 'function') {
          console.log(`[useConfigDrawers] 调用UnifiedEdgeManager.onNodeConfigured: ${nodeInstance.id}`)
          try {
            const result = await unifiedPreviewManager.onNodeConfigured(nodeInstance.id, config)
            console.log(`[useConfigDrawers] UnifiedEdgeManager节点配置完成事件处理结果:`, result)
            
            // 🔧 增强调试：检查预览线创建结果
            if (unifiedPreviewManager.hasPreviewLine && typeof unifiedPreviewManager.hasPreviewLine === 'function') {
              const hasPreviewLine = unifiedPreviewManager.hasPreviewLine(nodeInstance.id)
              console.log(`[useConfigDrawers] UnifiedEdgeManager预览线创建检查:`, {
                nodeId: nodeInstance.id,
                hasPreviewLine: hasPreviewLine,
                result: result
              })
            }
          } catch (error) {
            console.error(`[useConfigDrawers] UnifiedEdgeManager节点配置完成事件处理失败:`, error)
            console.error(`[useConfigDrawers] 错误堆栈:`, error.stack)
          }
        } else if (typeof unifiedPreviewManager.createPreviewLineAfterConfig === 'function') {
          console.log(`[useConfigDrawers] 调用UnifiedEdgeManager.createPreviewLineAfterConfig: ${nodeInstance.id}`)
          try {
            const result = await unifiedPreviewManager.createPreviewLineAfterConfig(nodeInstance, config)
            console.log(`[useConfigDrawers] UnifiedEdgeManager配置后预览线创建结果:`, result)
          } catch (error) {
            console.error(`[useConfigDrawers] UnifiedEdgeManager配置后预览线创建失败:`, error)
            console.error(`[useConfigDrawers] 错误堆栈:`, error.stack)
          }
        } else if (typeof unifiedPreviewManager.handleNodeConfigured === 'function') {
          console.log(`[useConfigDrawers] 调用UnifiedEdgeManager.handleNodeConfigured: ${nodeInstance.id}`)
          try {
            const result = await unifiedPreviewManager.handleNodeConfigured(nodeInstance, config)
            console.log(`[useConfigDrawers] UnifiedEdgeManager节点配置处理结果:`, result)
          } catch (error) {
            console.error(`[useConfigDrawers] UnifiedEdgeManager节点配置处理失败:`, error)
            console.error(`[useConfigDrawers] 错误堆栈:`, error.stack)
          }
        }
      }

      console.log(`[useConfigDrawers] 配置处理完成，准备关闭抽屉: ${drawerType}`)
      
      // 关闭抽屉
      closeConfigDrawer(drawerType)
      
      console.log(`[useConfigDrawers] 配置确认成功 - ${drawerType}:`, config)
    } catch (error) {
      console.error(`[useConfigDrawers] 配置处理失败 - ${drawerType}:`, error)
      throw error
    }
  }

  /**
   * 处理配置取消
   * @param {string} drawerType - 抽屉类型
   */
  const handleConfigCancel = async (drawerType) => {
    console.log(`[useConfigDrawers] 开始处理配置取消 - ${drawerType}`)
    
    try {
      // 获取当前节点实例
      const nodeInstance = getCurrentNodeInstance()
      
      if (nodeInstance) {
        console.log(`[useConfigDrawers] 配置取消，检查是否需要恢复预览线:`, { 
          nodeId: nodeInstance.id, 
          nodeType: nodeInstance.getData()?.type 
        })
        
        // 检查是否有已配置的源节点需要恢复预览线
        const unifiedPreviewManager = structuredLayout.unifiedPreviewManager?.value || structuredLayout.unifiedPreviewManager
        if (unifiedPreviewManager && typeof unifiedPreviewManager.restorePreviewLinesAfterCancel === 'function') {
          console.log(`[useConfigDrawers] 尝试恢复预览线`)
          try {
            await unifiedPreviewManager.restorePreviewLinesAfterCancel(nodeInstance)
            console.log(`[useConfigDrawers] 预览线恢复成功`)
          } catch (error) {
            console.error(`[useConfigDrawers] 预览线恢复失败:`, error)
          }
        } else {
          console.log(`[useConfigDrawers] 预览线恢复方法不可用`)
        }
      }
      
      // 关闭抽屉
      closeConfigDrawer(drawerType)
      console.log(`[useConfigDrawers] 配置取消处理完成 - ${drawerType}`)
    } catch (error) {
      console.error(`[useConfigDrawers] 配置取消处理失败 - ${drawerType}:`, error)
      // 即使出错也要关闭抽屉
      closeConfigDrawer(drawerType)
    }
  }

  /**
   * 获取抽屉类型
   * @param {string} nodeType - 节点类型
   * @returns {string} 抽屉类型
   */
  const getDrawerType = (nodeType) => {
    const mapping = {
      'start': 'start',                    // 开始节点 -> StartNodeConfigDrawer.vue
      'audience-split': 'crowd-split',     // 人群分流节点 -> CrowdSplitNodeConfigDrawer.vue
      'event-split': 'event-split',        // 事件分流节点 -> EventSplitNodeConfigDrawer.vue
      'ai-call': 'ai-call',               // AI外呼节点 -> AICallNodeConfigDrawer.vue
      'sms': 'sms',                       // 短信节点 -> SMSNodeConfigDrawer.vue
      'manual-call': 'manual-call',       // 人工外呼节点 -> ManualCallNodeConfigDrawer.vue
      'ab-test': 'ab-test',               // AB测试节点 -> ABTestNodeConfigDrawer.vue
      'wait': 'wait',                     // 等待节点 -> WaitNodeConfigDrawer.vue
      'benefit': 'benefit'                // 权益节点 -> BenefitNodeConfigDrawer.vue
    }
    return mapping[nodeType] || nodeType
  }

  /**
   * 从抽屉类型获取节点类型
   * @param {string} drawerType - 抽屉类型
   * @returns {string} 节点类型
   */
  const getNodeTypeFromDrawerType = (drawerType) => {
    const reverseMapping = {
      'start': 'start',
      'crowd-split': 'audience-split',
      'event-split': 'event-split',
      'ai-call': 'ai-call',
      'sms': 'sms',
      'manual-call': 'manual-call',
      'ab-test': 'ab-test',
      'wait': 'wait',
      'benefit': 'benefit'
    }
    return reverseMapping[drawerType] || drawerType
  }

  /**
   * 获取当前节点实例
   */
  const getCurrentNodeInstance = () => {
    // 遍历所有抽屉状态，找到当前打开的抽屉
    for (const [drawerType, state] of Object.entries(drawerStates)) {
      if (state.visible && state.instance) {
        console.log(`[useConfigDrawers] 从 ${drawerType} 抽屉获取节点实例:`, state.instance.id)
        return state.instance
      }
    }
    
    console.warn('[useConfigDrawers] 未找到当前打开的抽屉或节点实例')
    return null
  }

  return {
    // 状态
    drawerStates,
    
    // 方法
    openConfigDrawer,
    closeConfigDrawer,
    closeAllDrawers,
    handleConfigConfirm,
    handleConfigCancel,
    getDrawerType,
    getNodeTypeFromDrawerType,
    setEnhancedPreviewManager,
    
    // 节点配置管理器
    nodeConfigManager,
    
    // 🔧 关键修复：直接暴露原始的structuredLayout对象，而不是重新包装
    structuredLayout
  }
}