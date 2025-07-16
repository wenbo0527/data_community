import { ref, reactive } from 'vue'
import useStructuredLayout from './useStructuredLayout.js'
import { validateInterface, createInterfaceWrapper, STRUCTURED_LAYOUT_INTERFACE } from '../utils/interfaceValidator.js'

/**
 * 配置抽屉管理 Composable
 * 统一管理所有节点配置抽屉的状态和逻辑
 */
export function useConfigDrawers(getGraph, nodeOperations = {}) {
  // 初始化结构化布局
  const structuredLayout = useStructuredLayout(getGraph)
  
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
    // 映射节点类型到抽屉类型
    const drawerType = getDrawerType(nodeType)
    
    if (!drawerStates[drawerType]) {
      console.warn(`Unknown drawer type: ${drawerType}`)
      return
    }

    // 关闭其他抽屉
    closeAllDrawers()

    // 确保data中包含节点ID
    const drawerData = {
      ...data,
      nodeId: node.id,
      nodeType: nodeType
    }

    // 打开指定抽屉
    drawerStates[drawerType].visible = true
    drawerStates[drawerType].data = drawerData
    drawerStates[drawerType].instance = node

    console.log(`[useConfigDrawers] 打开配置抽屉: ${drawerType}, 节点ID: ${node.id}`)
  }

  /**
   * 关闭配置抽屉
   * @param {string} drawerType - 抽屉类型
   */
  const closeConfigDrawer = (drawerType) => {
    if (!drawerStates[drawerType]) {
      console.warn(`Unknown drawer type: ${drawerType}`)
      return
    }

    drawerStates[drawerType].visible = false
    drawerStates[drawerType].data = {}
    drawerStates[drawerType].instance = null

    console.log(`Closed config drawer: ${drawerType}`)
  }

  /**
   * 关闭所有抽屉
   */
  const closeAllDrawers = () => {
    Object.keys(drawerStates).forEach(drawerType => {
      if (drawerStates[drawerType].visible) {
        closeConfigDrawer(drawerType)
      }
    })
  }

  /**
   * 处理配置确认
   * @param {string} drawerType - 抽屉类型
   * @param {Object} config - 配置数据
   */
  const handleConfigConfirm = (drawerType, config) => {
    console.log(`[useConfigDrawers] 处理配置确认 - 抽屉类型: ${drawerType}`, config)
    
    const drawerState = drawerStates[drawerType]
    if (!drawerState) {
      console.error(`[useConfigDrawers] 未找到抽屉状态: ${drawerType}`)
      return
    }

    console.log(`[useConfigDrawers] 抽屉状态:`, drawerState)
    
    // 获取有效的节点实例
    let nodeInstance = drawerState.instance
    
    if (!nodeInstance || typeof nodeInstance.getData !== 'function') {
      console.warn(`[useConfigDrawers] 节点实例无效，尝试从图中获取 - 抽屉类型: ${drawerType}`)
      console.log(`[useConfigDrawers] 当前实例:`, nodeInstance)
      console.log(`[useConfigDrawers] 抽屉数据:`, drawerState.data)
      
      // 尝试从图中获取节点实例
      const graph = getGraph()
      if (graph && drawerState.data && drawerState.data.nodeId) {
        const node = graph.getCellById(drawerState.data.nodeId)
        if (node && typeof node.getData === 'function') {
          console.log(`[useConfigDrawers] 从图中成功获取节点实例:`, node)
          nodeInstance = node
          drawerState.instance = node // 更新抽屉状态中的实例
        } else {
          console.error(`[useConfigDrawers] 从图中获取的节点实例无效:`, node)
        }
      }
      
      if (!nodeInstance || typeof nodeInstance.getData !== 'function') {
        console.error(`[useConfigDrawers] 无法获取有效的节点实例，配置保存失败`)
        console.error(`[useConfigDrawers] 最终节点实例:`, nodeInstance)
        console.error(`[useConfigDrawers] 图实例:`, graph)
        console.error(`[useConfigDrawers] 节点ID:`, drawerState.data?.nodeId)
        return
      }
    }

    try {
      // 根据不同的节点类型处理配置
      switch (drawerType) {
        case 'start':
          handleStartNodeConfig(nodeInstance, config)
          break
        case 'crowd-split':
          handleCrowdSplitNodeConfig(nodeInstance, config)
          break
        case 'event-split':
          handleEventSplitNodeConfig(nodeInstance, config)
          break
        case 'ai-call':
          handleAICallNodeConfig(nodeInstance, config)
          break
        case 'sms':
          handleSMSNodeConfig(nodeInstance, config)
          break
        case 'manual-call':
          handleManualCallNodeConfig(nodeInstance, config)
          break
        case 'ab-test':
          handleABTestNodeConfig(nodeInstance, config)
          break
        case 'wait':
          handleWaitNodeConfig(nodeInstance, config)
          break
        default:
          handleDefaultNodeConfig(nodeInstance, config)
      }

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
  const handleConfigCancel = (drawerType) => {
    closeConfigDrawer(drawerType)
    console.log(`Config cancelled for ${drawerType}`)
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
   * 处理开始节点配置
   */
  const handleStartNodeConfig = (node, config) => {
    // 更新节点数据
    const currentData = node.getData() || {}
    node.setData({
      ...currentData,
      config
    })

    // 更新节点样式
    updateStartNodeStyle(node, config)
  }

  /**
   * 获取节点操作对象
   */
  const getNodeOperations = () => {
    return nodeOperations
  }

  /**
   * 处理人群分流节点配置
   */
  const handleCrowdSplitNodeConfig = (node, config) => {
    const graph = getGraph()
    if (!graph) {
      console.error('[useConfigDrawers] 图实例不存在')
      return
    }

    console.log('[useConfigDrawers] 处理人群分流节点配置:', config)
    console.log('[useConfigDrawers] 节点实例:', node)

    // 验证节点实例
    if (!node || typeof node.getData !== 'function') {
      console.error('[useConfigDrawers] 无效的节点实例:', node)
      console.error('[useConfigDrawers] 节点类型:', typeof node)
      console.error('[useConfigDrawers] 节点方法:', node ? Object.getOwnPropertyNames(node) : 'node is null/undefined')
      return
    }

    try {
      // 更新节点数据
      const currentNodeData = node.getData() || {}
      const nodeData = {
        ...currentNodeData,
        config
      }
      node.setData(nodeData)

      // 更新节点标签
      if (config.nodeName) {
        node.setAttrByPath('text/text', config.nodeName)
      }

      // 将新的 crowdLayers 数据结构转换为兼容旧逻辑的 branches 格式
      if (config.crowdLayers && config.crowdLayers.length > 0) {
        const branches = config.crowdLayers.map((layer, index) => ({
          id: layer.id,
          name: layer.crowdName || `分支${index + 1}`, // 使用人群名称作为分支名称
          crowdId: layer.crowdId,
          crowdName: layer.crowdName,
          order: layer.order || index + 1
        }))

        // 添加默认的未命中分支
        branches.push({
          id: 'default',
          name: '未命中人群',
          crowdId: null,
          crowdName: '未命中人群',
          order: branches.length + 1
        })

        // 更新节点配置，包含转换后的分支信息
        const updatedConfig = {
          ...config,
          branches,
          branchCount: branches.length,
          audiences: branches.map(branch => ({
            id: branch.crowdId,
            name: branch.crowdName,
            condition: branch.id
          }))
        }

        node.setData({
          ...nodeData,
          config: updatedConfig
        })

        console.log('[useConfigDrawers] 转换后的分支配置:', branches)

        // 使用结构化布局管理器更新分支布局
        if (structuredLayout.isReady.value) {
          structuredLayout.updateSplitNodeBranches(node, updatedConfig)
        } else {
          // 如果布局引擎未就绪，初始化后再更新
          structuredLayout.initLayoutEngine()
          setTimeout(() => {
            structuredLayout.updateSplitNodeBranches(node, updatedConfig)
          }, 100)
        }
      }

      // 触发预设位重新生成
      const nodeOperations = getNodeOperations()
      if (nodeOperations && nodeOperations.updateNodePorts) {
        nodeOperations.updateNodePorts(node.id)
      }
    } catch (error) {
      console.error('[useConfigDrawers] 处理人群分流节点配置时发生错误:', error)
      throw error
    }
  }

  /**
   * 处理事件分流节点配置
   */
  const handleEventSplitNodeConfig = (node, config) => {
    const graph = getGraph()
    if (!graph) {
      console.error('[useConfigDrawers] 图实例不存在')
      return
    }

    console.log('[useConfigDrawers] 处理事件分流节点配置:', config)

    try {
      // 更新节点数据
      const currentNodeData = node.getData() || {}
      const nodeData = {
        ...currentNodeData,
        config
      }
      node.setData(nodeData)

      // 更新节点标签
      if (config.nodeName) {
        node.setAttrByPath('text/text', config.nodeName)
      }

      // 事件分流节点固定有两个分支：是/否
      const branches = [
        {
          id: 'event_yes',
          name: config.yesLabel || '是',
          condition: 'yes'
        },
        {
          id: 'event_no', 
          name: config.noLabel || '否',
          condition: 'no'
        }
      ]

      const updatedConfig = {
        ...config,
        branches,
        branchCount: branches.length
      }

      node.setData({
        ...nodeData,
        config: updatedConfig
      })

      console.log('[useConfigDrawers] 事件分流分支配置:', branches)

      // 使用结构化布局管理器更新分支布局
      if (structuredLayout.isReady.value) {
        structuredLayout.updateSplitNodeBranches(node, updatedConfig)
      } else {
        // 如果布局引擎未就绪，初始化后再更新
        structuredLayout.initLayoutEngine()
        setTimeout(() => {
          structuredLayout.updateSplitNodeBranches(node, updatedConfig)
        }, 100)
      }

      // 触发预设位重新生成
      const nodeOperations = getNodeOperations()
      if (nodeOperations && nodeOperations.updateNodePorts) {
        nodeOperations.updateNodePorts(node.id)
      }
    } catch (error) {
      console.error('[useConfigDrawers] 处理事件分流节点配置时发生错误:', error)
      throw error
    }
  }

  /**
   * 处理AI外呼节点配置
   */
  const handleAICallNodeConfig = (node, config) => {
    nodeOperations.updateNodeData(node.id, { config })
  }

  /**
   * 处理短信节点配置
   */
  const handleSMSNodeConfig = (node, config) => {
    nodeOperations.updateNodeData(node.id, { config })
  }

  /**
   * 处理人工外呼节点配置
   */
  const handleManualCallNodeConfig = (node, config) => {
    nodeOperations.updateNodeData(node.id, { config })
  }

  /**
   * 处理AB测试节点配置
   */
  const handleABTestNodeConfig = (node, config) => {
    const graph = getGraph()
    if (!graph) {
      console.error('[useConfigDrawers] 图实例不存在')
      return
    }

    console.log('[useConfigDrawers] 处理AB测试节点配置:', config)

    try {
      // 更新节点数据
      const currentNodeData = node.getData() || {}
      const nodeData = {
        ...currentNodeData,
        config
      }
      node.setData(nodeData)

      // 更新节点标签
      if (config.nodeName) {
        node.setAttrByPath('text/text', config.nodeName)
      }

      // AB测试节点固定有两个分支：A组/B组
      const branches = [
        {
          id: 'ab_a',
          name: config.groupALabel || '实验组A',
          condition: 'group_a',
          ratio: config.groupARatio || 50
        },
        {
          id: 'ab_b',
          name: config.groupBLabel || '实验组B',
          condition: 'group_b',
          ratio: config.groupBRatio || 50
        }
      ]

      const updatedConfig = {
        ...config,
        branches,
        branchCount: branches.length
      }

      node.setData({
        ...nodeData,
        config: updatedConfig
      })

      console.log('[useConfigDrawers] AB测试分支配置:', branches)

      // 使用结构化布局管理器更新分支布局
      if (structuredLayout.isReady.value) {
        structuredLayout.updateSplitNodeBranches(node, updatedConfig)
      } else {
        // 如果布局引擎未就绪，初始化后再更新
        structuredLayout.initLayoutEngine()
        setTimeout(() => {
          structuredLayout.updateSplitNodeBranches(node, updatedConfig)
        }, 100)
      }

      // 触发预设位重新生成
      const nodeOperations = getNodeOperations()
      if (nodeOperations && nodeOperations.updateNodePorts) {
        nodeOperations.updateNodePorts(node.id)
      }
    } catch (error) {
      console.error('[useConfigDrawers] 处理AB测试节点配置时发生错误:', error)
      throw error
    }
  }

  /**
   * 处理等待节点配置
   */
  const handleWaitNodeConfig = (node, config) => {
    nodeOperations.updateNodeData(node.id, { config })
  }

  /**
   * 处理默认节点配置
   */
  const handleDefaultNodeConfig = (node, config) => {
    nodeOperations.updateNodeData(node.id, { config })
  }

  /**
   * 更新开始节点样式
   */
  const updateStartNodeStyle = (node, config) => {
    // 根据任务类型设置不同的颜色
    const typeColors = {
      marketing: '#FF6B6B',
      notification: '#4ECDC4',
      survey: '#45B7D1',
      retention: '#96CEB4'
    }

    const color = typeColors[config.taskType] || '#5F95FF'

    node.attr({
      body: {
        fill: color,
        stroke: color
      }
    })

    // 更新标签显示配置信息
    const taskTypeLabels = {
      marketing: '营销活动',
      notification: '通知推送',
      survey: '问卷调研',
      retention: '用户留存'
    }
    
    const label = config.taskType 
      ? `开始\n(${taskTypeLabels[config.taskType] || config.taskType})`
      : '开始'
    
    node.attr({
      text: {
        text: label
      }
    })
  }

  /**
   * 动态更新端口
   */
  const updateDynamicPorts = (node, portGroup, branches) => {
    const oldPorts = node.getPorts().filter(p => p.group === portGroup)
    oldPorts.forEach(p => node.removePort(p.id))

    branches.forEach((branch, index) => {
      const portId = `${portGroup}-${index}`
      node.addPort({
        id: portId,
        group: portGroup,
        attrs: {
          text: {
            text: branch.name,
            fill: '#666',
            fontSize: 10,
            textAnchor: 'middle',
            textVerticalAnchor: 'top'
          }
        }
      })
    })
  }

  /**
   * 创建分支节点
   */
  const createBranchNodes = (graph, parentNode, config) => {
    const { x, y } = parentNode.position()
    const { width } = parentNode.size()
    const gap = 150

    config.branches?.forEach((branch, index) => {
      const branchX = x + width + 100
      const branchY = y + (index - (config.branches.length - 1) / 2) * gap
      const portId = `out-${index}`

      // 创建分支节点
      const branchNode = nodeOperations.addNode({
        type: 'branch-node',
        data: {
          parentNode: parentNode.id,
          branchIndex: index,
          branchConfig: branch
        }
      }, { x: branchX + 50, y: branchY + 50 })

      if (branchNode) {
        // 创建连接线
        graph.addEdge({
          source: { cell: parentNode.id, port: portId },
          target: { cell: branchNode.id },
          attrs: {
            line: {
              stroke: '#A2B1C3',
              strokeWidth: 2,
              targetMarker: {
                name: 'block',
                width: 12,
                height: 8
              }
            }
          },
          data: {
            branchIndex: index
          }
        })

        // 将分支节点置于底层
        branchNode.toBack()
      }
    })
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
      isReady: structuredLayout.isReady
    }
  }
}