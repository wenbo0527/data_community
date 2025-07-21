import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useStructuredLayout } from './useStructuredLayout.js'
import { nodeConfigManager } from '../utils/NodeConfigManager.js'

/**
 * 配置抽屉管理 Composable
 * 统一管理所有节点配置抽屉的状态和逻辑
 */
export function useConfigDrawers(getGraph, nodeOperations = {}) {
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

      // 触发统一预览线创建（配置完成后）
      console.log(`[useConfigDrawers] 检查是否需要创建配置后预览线`)
      const unifiedPreviewManager = structuredLayout.getConnectionPreviewManager()
      console.log(`[useConfigDrawers] 统一预览线管理器实例:`, unifiedPreviewManager)
      console.log(`[useConfigDrawers] 管理器类型:`, unifiedPreviewManager?.constructor?.name)
      console.log(`[useConfigDrawers] createPreviewLineAfterConfig 方法存在:`, typeof unifiedPreviewManager?.createPreviewLineAfterConfig)
      
      if (unifiedPreviewManager && typeof unifiedPreviewManager.createPreviewLineAfterConfig === 'function') {
        console.log(`[useConfigDrawers] 为节点 ${nodeInstance.id} 创建配置后预览线`)
        try {
          await unifiedPreviewManager.createPreviewLineAfterConfig(nodeInstance, config)
          console.log(`[useConfigDrawers] 配置后预览线创建成功`)
        } catch (error) {
          console.error(`[useConfigDrawers] 配置后预览线创建失败:`, error)
        }
      } else {
        console.log(`[useConfigDrawers] 统一预览线管理器不存在或方法不可用`)
        console.log(`[useConfigDrawers] 可用方法:`, unifiedPreviewManager ? Object.getOwnPropertyNames(Object.getPrototypeOf(unifiedPreviewManager)) : 'N/A')
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
        const unifiedPreviewManager = structuredLayout.getConnectionPreviewManager()
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
      'wait': 'wait'                      // 等待节点 -> WaitNodeConfigDrawer.vue
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
      'wait': 'wait'
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
    
    // 结构化布局功能
    structuredLayout: {
      validateConnection: structuredLayout.validateConnection,
      applyLayout: structuredLayout.applyLayout,
      applyStructuredLayout: structuredLayout.applyStructuredLayout,
      getNodeConstraints: structuredLayout.getNodeConstraints,
      canAddOutput: structuredLayout.canAddOutput,
      canAddInput: structuredLayout.canAddInput,
      getAllowedTargetTypes: structuredLayout.getAllowedTargetTypes,
      initLayoutEngine: structuredLayout.initLayoutEngine,
      getLayoutEngine: structuredLayout.getLayoutEngine,
      getBranchManager: structuredLayout.getBranchManager,
      getConnectionPreviewManager: structuredLayout.getConnectionPreviewManager,
      updateSplitNodeBranches: structuredLayout.updateSplitNodeBranches,
      clearLayout: structuredLayout.clearLayout,
      // 保持isReady作为计算属性的引用，而不是值
      get isReady() {
        return structuredLayout.isReady
      },
      // 添加一个方法来获取isReady的值
      getIsReady() {
        return structuredLayout.isReady.value
      }
    }
  }
}