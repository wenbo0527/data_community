/**
 * 节点配置管理器
 * 统一管理所有节点类型的配置处理逻辑，解决重复代码和维护成本高的问题
 */

import { generateDynamicNextSlots } from './nodeTypes.js'

/**
 * 节点配置策略基类
 */
class BaseNodeConfigStrategy {
  constructor(nodeType) {
    this.nodeType = nodeType
  }

  /**
   * 验证配置数据
   * @param {Object} config - 配置数据
   * @returns {Object} 验证结果 { valid: boolean, errors: string[] }
   */
  validateConfig(config) {
    return { valid: true, errors: [] }
  }

  /**
   * 预处理配置数据
   * @param {Object} config - 原始配置数据
   * @returns {Object} 处理后的配置数据
   */
  preprocessConfig(config) {
    return config
  }

  /**
   * 更新节点数据
   * @param {Object} node - 节点实例
   * @param {Object} config - 配置数据
   */
  updateNodeData(node, config) {
    const currentData = node.getData() || {}
    node.setData({
      ...currentData,
      config: this.preprocessConfig(config),
      lastUpdated: Date.now()
    })
  }

  /**
   * 更新节点样式
   * @param {Object} node - 节点实例
   * @param {Object} config - 配置数据
   */
  updateNodeStyle(node, config) {
    // 基础样式更新：节点名称
    if (config.nodeName) {
      node.setAttrByPath('text/text', config.nodeName)
    }
  }

  /**
   * 更新节点布局
   * @param {Object} node - 节点实例
   * @param {Object} config - 配置数据
   * @param {Object} layoutManager - 布局管理器
   */
  updateNodeLayout(node, config, layoutManager) {
    // 默认不需要特殊布局处理
  }

  /**
   * 触发后置处理
   * @param {Object} node - 节点实例
   * @param {Object} config - 配置数据
   * @param {Object} context - 上下文对象
   */
  postProcess(node, config, context) {
    console.log(`[NodeConfigManager] 开始后置处理 - 节点类型: ${this.nodeType}, 节点ID: ${node.id}`)
    
    // 对于分支节点，需要更新输出端口
    if (this.nodeType === 'audience-split' || this.nodeType === 'event-split' || this.nodeType === 'ab-test') {
      try {
        // 获取处理后的配置
        const processedConfig = this.preprocessConfig(config)
        console.log(`[NodeConfigManager] 更新分支节点端口 - 配置:`, processedConfig)
        
        // 计算需要的输出端口数量
        let requiredOutputs = 1
        
        if (this.nodeType === 'audience-split') {
          if (processedConfig.branches && Array.isArray(processedConfig.branches)) {
            requiredOutputs = processedConfig.branches.length
          } else if (processedConfig.branchCount && typeof processedConfig.branchCount === 'number') {
            requiredOutputs = processedConfig.branchCount + 1 // 包含未命中人群分支
          } else {
            requiredOutputs = 2 // 默认：1个分流 + 1个未命中人群
          }
        } else if (this.nodeType === 'event-split') {
          requiredOutputs = 2 // 是/否两个分支
        } else if (this.nodeType === 'ab-test') {
          if (processedConfig.versions && Array.isArray(processedConfig.versions)) {
            requiredOutputs = processedConfig.versions.length
          } else {
            requiredOutputs = 2 // 默认A/B两个版本
          }
        }
        
        console.log(`[NodeConfigManager] 节点 ${node.id} 需要 ${requiredOutputs} 个输出端口`)
        
        // 更新节点的输出端口
        this.updateNodeOutputPorts(node, requiredOutputs)
        
        // 如果有布局管理器，通知其更新分支
        if (context.structuredLayout && context.structuredLayout.updateSplitNodeBranches) {
          console.log(`[NodeConfigManager] 通过布局管理器更新分支`)
          context.structuredLayout.updateSplitNodeBranches(node, processedConfig)
        }
        
        console.log(`[NodeConfigManager] 分支节点后置处理完成 - 已更新为 ${requiredOutputs} 个输出端口`)
      } catch (error) {
        console.error(`[NodeConfigManager] 分支节点后置处理失败:`, error)
      }
    } else {
      console.log(`[NodeConfigManager] 跳过端口更新 - 节点类型: ${this.nodeType}`)
    }
    
    // 注意：预览线创建由 useConfigDrawers.js 统一处理，避免重复调用
    console.log(`[NodeConfigManager] 后置处理完成 - 节点类型: ${this.nodeType}, 节点ID: ${node.id}`)
  }

  /**
   * 更新节点的输出端口数量
   * @param {Object} node - 节点实例
   * @param {number} requiredOutputs - 需要的输出端口数量
   */
  updateNodeOutputPorts(node, requiredOutputs) {
    if (!node || typeof node.getPorts !== 'function') {
      console.warn(`[NodeConfigManager] 节点不支持端口操作`)
      return
    }

    try {
      const currentPorts = node.getPorts()
      const outputPorts = currentPorts.filter(port => port.group === 'out')
      const currentOutputCount = outputPorts.length
      
      console.log(`[NodeConfigManager] 当前输出端口数: ${currentOutputCount}, 需要: ${requiredOutputs}`)
      
      if (currentOutputCount < requiredOutputs) {
        // 需要添加更多输出端口
        for (let i = currentOutputCount; i < requiredOutputs; i++) {
          const newPortId = `out${i + 1}`
          node.addPort({
            group: 'out',
            id: newPortId
          })
          console.log(`[NodeConfigManager] 添加输出端口: ${newPortId}`)
        }
      } else if (currentOutputCount > requiredOutputs) {
        // 需要移除多余的输出端口（但保留至少1个）
        const portsToRemove = Math.min(currentOutputCount - requiredOutputs, currentOutputCount - 1)
        for (let i = 0; i < portsToRemove; i++) {
          const portToRemove = outputPorts[currentOutputCount - 1 - i]
          if (portToRemove) {
            node.removePort(portToRemove.id)
            console.log(`[NodeConfigManager] 移除输出端口: ${portToRemove.id}`)
          }
        }
      }
      
      console.log(`[NodeConfigManager] 端口更新完成`)
    } catch (error) {
      console.error(`[NodeConfigManager] 更新端口失败:`, error)
    }
  }

  /**
   * 执行完整的配置处理流程
   * @param {Object} node - 节点实例
   * @param {Object} config - 配置数据
   * @param {Object} context - 上下文对象
   */
  async process(node, config, context = {}) {
    console.log(`[NodeConfigManager] 开始处理 ${this.nodeType} 节点配置:`, { nodeId: node.id, config })

    try {
      // 1. 验证配置
      const validation = this.validateConfig(config)
      if (!validation.valid) {
        throw new Error(`配置验证失败: ${validation.errors.join(', ')}`)
      }

      // 2. 更新节点数据
      this.updateNodeData(node, config)

      // 3. 更新节点样式
      this.updateNodeStyle(node, config)

      // 4. 更新节点布局
      if (context.layoutManager) {
        this.updateNodeLayout(node, config, context.layoutManager)
      }

      // 5. 后置处理
      this.postProcess(node, config, context)

      console.log(`[NodeConfigManager] ${this.nodeType} 节点配置处理完成`)
    } catch (error) {
      console.error(`[NodeConfigManager] ${this.nodeType} 节点配置处理失败:`, error)
      throw error
    }
  }
}

/**
 * 简单节点配置策略（适用于单输出节点）
 */
class SimpleNodeConfigStrategy extends BaseNodeConfigStrategy {
  constructor(nodeType) {
    super(nodeType)
  }

  validateConfig(config) {
    const errors = []
    
    // 基础验证
    if (config.nodeName && typeof config.nodeName !== 'string') {
      errors.push('节点名称必须是字符串')
    }

    return { valid: errors.length === 0, errors }
  }
}

/**
 * 分支节点配置策略（适用于多输出节点）
 */
class BranchNodeConfigStrategy extends BaseNodeConfigStrategy {
  constructor(nodeType) {
    super(nodeType)
  }

  updateNodeLayout(node, config, layoutManager) {
    if (layoutManager && layoutManager.isReady && layoutManager.isReady.value) {
      layoutManager.updateSplitNodeBranches(node, config)
    } else if (layoutManager && layoutManager.initLayoutEngine) {
      // 如果布局引擎未就绪，初始化后再更新
      layoutManager.initLayoutEngine()
      setTimeout(() => {
        if (layoutManager.updateSplitNodeBranches) {
          layoutManager.updateSplitNodeBranches(node, config)
        }
      }, 100)
    }
  }
}

/**
 * 人群分流节点配置策略
 */
class AudienceSplitConfigStrategy extends BranchNodeConfigStrategy {
  constructor() {
    super('audience-split')
  }

  preprocessConfig(config) {
    // 将新的 crowdLayers 数据结构转换为兼容旧逻辑的 branches 格式
    if (config.crowdLayers && config.crowdLayers.length > 0) {
      const branches = config.crowdLayers.map((layer, index) => ({
        id: layer.id,
        name: layer.crowdName || `分支${index + 1}`,
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

      return {
        ...config,
        branches,
        branchCount: branches.length,
        audiences: branches.map(branch => ({
          id: branch.crowdId,
          name: branch.crowdName,
          condition: branch.id
        }))
      }
    }

    return config
  }

  validateConfig(config) {
    const errors = []
    
    if (config.crowdLayers && !Array.isArray(config.crowdLayers)) {
      errors.push('人群层级必须是数组')
    }

    return { valid: errors.length === 0, errors }
  }
}

/**
 * 事件分流节点配置策略
 */
class EventSplitConfigStrategy extends BranchNodeConfigStrategy {
  constructor() {
    super('event-split')
  }

  preprocessConfig(config) {
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

    return {
      ...config,
      branches,
      branchCount: branches.length
    }
  }
}

/**
 * AB测试节点配置策略
 */
class ABTestConfigStrategy extends BranchNodeConfigStrategy {
  constructor() {
    super('ab-test')
  }

  preprocessConfig(config) {
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

    return {
      ...config,
      branches,
      branchCount: branches.length
    }
  }

  validateConfig(config) {
    const errors = []
    
    if (config.groupARatio && (config.groupARatio < 0 || config.groupARatio > 100)) {
      errors.push('A组比例必须在0-100之间')
    }
    
    if (config.groupBRatio && (config.groupBRatio < 0 || config.groupBRatio > 100)) {
      errors.push('B组比例必须在0-100之间')
    }

    const totalRatio = (config.groupARatio || 50) + (config.groupBRatio || 50)
    if (Math.abs(totalRatio - 100) > 0.01) {
      errors.push('A组和B组比例之和必须等于100%')
    }

    return { valid: errors.length === 0, errors }
  }
}

/**
 * 开始节点配置策略
 */
class StartNodeConfigStrategy extends BaseNodeConfigStrategy {
  constructor() {
    super('start')
  }

  updateNodeStyle(node, config) {
    super.updateNodeStyle(node, config)
    
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

  validateConfig(config) {
    const errors = []
    
    if (config.taskType && !['marketing', 'notification', 'survey', 'retention'].includes(config.taskType)) {
      errors.push('任务类型必须是 marketing、notification、survey 或 retention 之一')
    }

    return { valid: errors.length === 0, errors }
  }
}

/**
 * 节点配置管理器主类
 */
class NodeConfigManager {
  constructor() {
    this.strategies = new Map()
    this.initStrategies()
  }

  /**
   * 初始化所有节点配置策略
   */
  initStrategies() {
    // 注册各种节点配置策略
    this.strategies.set('start', new StartNodeConfigStrategy())
    this.strategies.set('audience-split', new AudienceSplitConfigStrategy())
    this.strategies.set('event-split', new EventSplitConfigStrategy())
    this.strategies.set('ab-test', new ABTestConfigStrategy())
    
    // 简单节点策略
    this.strategies.set('ai-call', new SimpleNodeConfigStrategy('ai-call'))
    this.strategies.set('sms', new SimpleNodeConfigStrategy('sms'))
    this.strategies.set('manual-call', new SimpleNodeConfigStrategy('manual-call'))
    this.strategies.set('wait', new SimpleNodeConfigStrategy('wait'))
    this.strategies.set('end', new SimpleNodeConfigStrategy('end'))
  }

  /**
   * 注册自定义节点配置策略
   * @param {string} nodeType - 节点类型
   * @param {BaseNodeConfigStrategy} strategy - 配置策略实例
   */
  registerStrategy(nodeType, strategy) {
    if (!(strategy instanceof BaseNodeConfigStrategy)) {
      throw new Error('策略必须继承自 BaseNodeConfigStrategy')
    }
    this.strategies.set(nodeType, strategy)
    console.log(`[NodeConfigManager] 注册节点配置策略: ${nodeType}`)
  }

  /**
   * 获取节点配置策略
   * @param {string} nodeType - 节点类型
   * @returns {BaseNodeConfigStrategy} 配置策略实例
   */
  getStrategy(nodeType) {
    const strategy = this.strategies.get(nodeType)
    if (!strategy) {
      console.warn(`[NodeConfigManager] 未找到节点类型 ${nodeType} 的配置策略，使用默认策略`)
      return new SimpleNodeConfigStrategy(nodeType)
    }
    return strategy
  }

  /**
   * 处理节点配置
   * @param {string} nodeType - 节点类型
   * @param {Object} node - 节点实例
   * @param {Object} config - 配置数据
   * @param {Object} context - 上下文对象
   */
  async processNodeConfig(nodeType, node, config, context = {}) {
    console.log(`[NodeConfigManager] 开始处理节点配置:`, { nodeType, nodeId: node.id })
    
    const strategy = this.getStrategy(nodeType)
    await strategy.process(node, config, context)
    
    console.log(`[NodeConfigManager] 节点配置处理完成:`, { nodeType, nodeId: node.id })
  }

  /**
   * 批量处理多个节点配置
   * @param {Array} nodeConfigs - 节点配置数组 [{ nodeType, node, config, context }]
   */
  async processBatchNodeConfigs(nodeConfigs) {
    console.log(`[NodeConfigManager] 开始批量处理 ${nodeConfigs.length} 个节点配置`)
    
    const results = []
    for (const { nodeType, node, config, context } of nodeConfigs) {
      try {
        await this.processNodeConfig(nodeType, node, config, context)
        results.push({ success: true, nodeId: node.id })
      } catch (error) {
        console.error(`[NodeConfigManager] 批量处理节点 ${node.id} 失败:`, error)
        results.push({ success: false, nodeId: node.id, error: error.message })
      }
    }
    
    console.log(`[NodeConfigManager] 批量处理完成，成功: ${results.filter(r => r.success).length}，失败: ${results.filter(r => !r.success).length}`)
    return results
  }

  /**
   * 获取所有支持的节点类型
   * @returns {Array} 节点类型数组
   */
  getSupportedNodeTypes() {
    return Array.from(this.strategies.keys())
  }

  /**
   * 检查节点类型是否支持
   * @param {string} nodeType - 节点类型
   * @returns {boolean} 是否支持
   */
  isNodeTypeSupported(nodeType) {
    return this.strategies.has(nodeType)
  }
}

// 创建单例实例
const nodeConfigManager = new NodeConfigManager()

export {
  NodeConfigManager,
  BaseNodeConfigStrategy,
  SimpleNodeConfigStrategy,
  BranchNodeConfigStrategy,
  nodeConfigManager
}

export default nodeConfigManager