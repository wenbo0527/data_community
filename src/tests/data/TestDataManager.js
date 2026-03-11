/**
 * 测试数据管理系统
 * 提供真实的测试数据和场景库
 */

/**
 * 节点类型定义
 */
export const NODE_TYPES = {
  START: 'start',
  END: 'end',
  CONDITION: 'condition',
  ACTION: 'action',
  DELAY: 'delay',
  SPLIT: 'split',
  MERGE: 'merge',
  API_CALL: 'api-call',
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  WEBHOOK: 'webhook'
}

/**
 * 连接类型定义
 */
export const CONNECTION_TYPES = {
  NORMAL: 'normal',
  CONDITIONAL: 'conditional',
  SUCCESS: 'success',
  FAILURE: 'failure',
  TIMEOUT: 'timeout'
}

/**
 * 测试场景定义
 */
export const TEST_SCENARIOS = {
  SIMPLE_FLOW: 'simple_flow',
  COMPLEX_FLOW: 'complex_flow',
  CONDITIONAL_FLOW: 'conditional_flow',
  PARALLEL_FLOW: 'parallel_flow',
  ERROR_HANDLING: 'error_handling',
  PERFORMANCE_TEST: 'performance_test'
}

/**
 * 测试数据管理器
 */
export class TestDataManager {
  constructor() {
    this.nodeIdCounter = 1
    this.edgeIdCounter = 1
    this.scenarios = new Map()
    this.initializeScenarios()
  }

  /**
   * 初始化测试场景
   */
  initializeScenarios() {
    // 简单流程场景
    this.scenarios.set(TEST_SCENARIOS.SIMPLE_FLOW, {
      name: '简单流程',
      description: '包含开始节点、动作节点和结束节点的基本流程',
      nodes: [
        this.createNodeData(NODE_TYPES.START, { x: 100, y: 100, label: '开始' }),
        this.createNodeData(NODE_TYPES.ACTION, { x: 300, y: 100, label: '发送邮件' }),
        this.createNodeData(NODE_TYPES.END, { x: 500, y: 100, label: '结束' })
      ],
      edges: [
        this.createEdgeData('node-1', 'node-2'),
        this.createEdgeData('node-2', 'node-3')
      ]
    })

    // 复杂流程场景
    this.scenarios.set(TEST_SCENARIOS.COMPLEX_FLOW, {
      name: '复杂流程',
      description: '包含多种节点类型和分支的复杂流程',
      nodes: [
        this.createNodeData(NODE_TYPES.START, { x: 100, y: 200, label: '开始' }),
        this.createNodeData(NODE_TYPES.CONDITION, { x: 300, y: 200, label: '用户类型判断' }),
        this.createNodeData(NODE_TYPES.EMAIL, { x: 200, y: 350, label: '发送欢迎邮件' }),
        this.createNodeData(NODE_TYPES.SMS, { x: 400, y: 350, label: '发送验证短信' }),
        this.createNodeData(NODE_TYPES.DELAY, { x: 300, y: 500, label: '等待24小时' }),
        this.createNodeData(NODE_TYPES.API_CALL, { x: 300, y: 650, label: '更新用户状态' }),
        this.createNodeData(NODE_TYPES.END, { x: 300, y: 800, label: '结束' })
      ],
      edges: [
        this.createEdgeData('node-1', 'node-2'),
        this.createEdgeData('node-2', 'node-3', { label: '新用户' }),
        this.createEdgeData('node-2', 'node-4', { label: '老用户' }),
        this.createEdgeData('node-3', 'node-5'),
        this.createEdgeData('node-4', 'node-5'),
        this.createEdgeData('node-5', 'node-6'),
        this.createEdgeData('node-6', 'node-7')
      ]
    })

    // 条件分支场景
    this.scenarios.set(TEST_SCENARIOS.CONDITIONAL_FLOW, {
      name: '条件分支流程',
      description: '测试条件判断和多分支处理',
      nodes: [
        this.createNodeData(NODE_TYPES.START, { x: 300, y: 100, label: '开始' }),
        this.createNodeData(NODE_TYPES.CONDITION, { x: 300, y: 250, label: '购买金额判断' }),
        this.createNodeData(NODE_TYPES.EMAIL, { x: 150, y: 400, label: '普通优惠券' }),
        this.createNodeData(NODE_TYPES.EMAIL, { x: 300, y: 400, label: '高级优惠券' }),
        this.createNodeData(NODE_TYPES.EMAIL, { x: 450, y: 400, label: 'VIP礼品' }),
        this.createNodeData(NODE_TYPES.MERGE, { x: 300, y: 550, label: '合并' }),
        this.createNodeData(NODE_TYPES.END, { x: 300, y: 700, label: '结束' })
      ],
      edges: [
        this.createEdgeData('node-1', 'node-2'),
        this.createEdgeData('node-2', 'node-3', { label: '< 100元' }),
        this.createEdgeData('node-2', 'node-4', { label: '100-500元' }),
        this.createEdgeData('node-2', 'node-5', { label: '> 500元' }),
        this.createEdgeData('node-3', 'node-6'),
        this.createEdgeData('node-4', 'node-6'),
        this.createEdgeData('node-5', 'node-6'),
        this.createEdgeData('node-6', 'node-7')
      ]
    })

    // 并行流程场景
    this.scenarios.set(TEST_SCENARIOS.PARALLEL_FLOW, {
      name: '并行流程',
      description: '测试并行执行和同步合并',
      nodes: [
        this.createNodeData(NODE_TYPES.START, { x: 300, y: 100, label: '开始' }),
        this.createNodeData(NODE_TYPES.SPLIT, { x: 300, y: 250, label: '并行分发' }),
        this.createNodeData(NODE_TYPES.EMAIL, { x: 150, y: 400, label: '发送邮件' }),
        this.createNodeData(NODE_TYPES.SMS, { x: 300, y: 400, label: '发送短信' }),
        this.createNodeData(NODE_TYPES.PUSH, { x: 450, y: 400, label: '推送通知' }),
        this.createNodeData(NODE_TYPES.MERGE, { x: 300, y: 550, label: '等待合并' }),
        this.createNodeData(NODE_TYPES.API_CALL, { x: 300, y: 700, label: '记录日志' }),
        this.createNodeData(NODE_TYPES.END, { x: 300, y: 850, label: '结束' })
      ],
      edges: [
        this.createEdgeData('node-1', 'node-2'),
        this.createEdgeData('node-2', 'node-3'),
        this.createEdgeData('node-2', 'node-4'),
        this.createEdgeData('node-2', 'node-5'),
        this.createEdgeData('node-3', 'node-6'),
        this.createEdgeData('node-4', 'node-6'),
        this.createEdgeData('node-5', 'node-6'),
        this.createEdgeData('node-6', 'node-7'),
        this.createEdgeData('node-7', 'node-8')
      ]
    })

    // 错误处理场景
    this.scenarios.set(TEST_SCENARIOS.ERROR_HANDLING, {
      name: '错误处理流程',
      description: '测试异常情况和错误恢复',
      nodes: [
        this.createNodeData(NODE_TYPES.START, { x: 300, y: 100, label: '开始' }),
        this.createNodeData(NODE_TYPES.API_CALL, { x: 300, y: 250, label: 'API调用' }),
        this.createNodeData(NODE_TYPES.EMAIL, { x: 150, y: 400, label: '成功通知' }),
        this.createNodeData(NODE_TYPES.EMAIL, { x: 450, y: 400, label: '失败通知' }),
        this.createNodeData(NODE_TYPES.DELAY, { x: 450, y: 550, label: '等待重试' }),
        this.createNodeData(NODE_TYPES.API_CALL, { x: 450, y: 700, label: '重试调用' }),
        this.createNodeData(NODE_TYPES.END, { x: 300, y: 850, label: '结束' })
      ],
      edges: [
        this.createEdgeData('node-1', 'node-2'),
        this.createEdgeData('node-2', 'node-3', { label: '成功', type: CONNECTION_TYPES.SUCCESS }),
        this.createEdgeData('node-2', 'node-4', { label: '失败', type: CONNECTION_TYPES.FAILURE }),
        this.createEdgeData('node-3', 'node-7'),
        this.createEdgeData('node-4', 'node-5'),
        this.createEdgeData('node-5', 'node-6'),
        this.createEdgeData('node-6', 'node-3', { label: '重试成功' }),
        this.createEdgeData('node-6', 'node-7', { label: '重试失败' })
      ]
    })

    // 性能测试场景
    this.scenarios.set(TEST_SCENARIOS.PERFORMANCE_TEST, {
      name: '性能测试流程',
      description: '包含大量节点的性能测试场景',
      nodes: this.generatePerformanceTestNodes(),
      edges: this.generatePerformanceTestEdges()
    })
  }

  /**
   * 创建节点数据
   * @param {string} type - 节点类型
   * @param {Object} options - 节点选项
   * @returns {Object} 节点数据
   */
  createNodeData(type, options = {}) {
    const nodeId = options.id || `node-${this.nodeIdCounter++}`
    
    const baseNodeData = {
      id: nodeId,
      type,
      x: options.x || 100,
      y: options.y || 100,
      width: options.width || 120,
      height: options.height || 60,
      label: options.label || type,
      shape: this.getNodeShape(type),
      attrs: this.getNodeAttrs(type),
      ports: this.getNodePorts(type),
      data: {
        type,
        config: options.config || {},
        ...options.data
      }
    }

    return { ...baseNodeData, ...options }
  }

  /**
   * 创建连接数据
   * @param {string} sourceId - 源节点ID
   * @param {string} targetId - 目标节点ID
   * @param {Object} options - 连接选项
   * @returns {Object} 连接数据
   */
  createEdgeData(sourceId, targetId, options = {}) {
    const edgeId = options.id || `edge-${this.edgeIdCounter++}`
    
    return {
      id: edgeId,
      source: sourceId,
      target: targetId,
      type: options.type || CONNECTION_TYPES.NORMAL,
      label: options.label || '',
      attrs: {
        line: {
          stroke: this.getEdgeColor(options.type),
          strokeWidth: 2,
          targetMarker: {
            name: 'classic',
            size: 8
          }
        },
        text: {
          text: options.label || '',
          fontSize: 12,
          fill: '#666'
        }
      },
      ...options
    }
  }

  /**
   * 获取节点形状
   * @param {string} type - 节点类型
   * @returns {string} 形状名称
   */
  getNodeShape(type) {
    const shapeMap = {
      [NODE_TYPES.START]: 'circle',
      [NODE_TYPES.END]: 'circle',
      [NODE_TYPES.CONDITION]: 'polygon',
      [NODE_TYPES.SPLIT]: 'polygon',
      [NODE_TYPES.MERGE]: 'polygon'
    }
    return shapeMap[type] || 'rect'
  }

  /**
   * 获取节点属性
   * @param {string} type - 节点类型
   * @returns {Object} 节点属性
   */
  getNodeAttrs(type) {
    const colorMap = {
      [NODE_TYPES.START]: '#52c41a',
      [NODE_TYPES.END]: '#ff4d4f',
      [NODE_TYPES.CONDITION]: '#faad14',
      [NODE_TYPES.ACTION]: '#1890ff',
      [NODE_TYPES.DELAY]: '#722ed1',
      [NODE_TYPES.SPLIT]: '#13c2c2',
      [NODE_TYPES.MERGE]: '#13c2c2'
    }

    const color = colorMap[type] || '#1890ff'

    return {
      body: {
        stroke: color,
        strokeWidth: 2,
        fill: `${color}20`
      },
      text: {
        fontSize: 12,
        fill: '#262626',
        textWrap: {
          width: 100,
          height: 40,
          ellipsis: true
        }
      }
    }
  }

  /**
   * 获取节点端口配置
   * @param {string} type - 节点类型
   * @returns {Object} 端口配置
   */
  getNodePorts(type) {
    const basePorts = {
      groups: {
        in: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: false,  // 🔧 禁用端口拖拽连接，连接线应仅通过预览线转换生成
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        },
        out: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: false,  // 🔧 禁用端口拖拽连接，连接线应仅通过预览线转换生成
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff'
            }
          }
        }
      }
    }

    // 根据节点类型配置端口
    switch (type) {
      case NODE_TYPES.START:
        return {
          ...basePorts,
          items: [{ group: 'out', id: 'out' }]
        }
      case NODE_TYPES.END:
        return {
          ...basePorts,
          items: [{ group: 'in', id: 'in' }]
        }
      case NODE_TYPES.CONDITION:
      case NODE_TYPES.SPLIT:
        return {
          ...basePorts,
          items: [
            { group: 'in', id: 'in' },
            { group: 'out', id: 'out1' },
            { group: 'out', id: 'out2' }
          ]
        }
      case NODE_TYPES.MERGE:
        return {
          ...basePorts,
          items: [
            { group: 'in', id: 'in1' },
            { group: 'in', id: 'in2' },
            { group: 'out', id: 'out' }
          ]
        }
      default:
        return {
          ...basePorts,
          items: [
            { group: 'in', id: 'in' },
            { group: 'out', id: 'out' }
          ]
        }
    }
  }

  /**
   * 获取连接颜色
   * @param {string} type - 连接类型
   * @returns {string} 颜色值
   */
  getEdgeColor(type) {
    const colorMap = {
      [CONNECTION_TYPES.SUCCESS]: '#52c41a',
      [CONNECTION_TYPES.FAILURE]: '#ff4d4f',
      [CONNECTION_TYPES.TIMEOUT]: '#faad14',
      [CONNECTION_TYPES.CONDITIONAL]: '#722ed1'
    }
    return colorMap[type] || '#5F95FF'
  }

  /**
   * 生成性能测试节点
   * @returns {Array} 节点数组
   */
  generatePerformanceTestNodes() {
    const nodes = []
    const nodeCount = 50
    const cols = 10
    const rows = Math.ceil(nodeCount / cols)
    
    for (let i = 0; i < nodeCount; i++) {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = 100 + col * 150
      const y = 100 + row * 120
      
      let type = NODE_TYPES.ACTION
      if (i === 0) type = NODE_TYPES.START
      if (i === nodeCount - 1) type = NODE_TYPES.END
      if (i % 10 === 5) type = NODE_TYPES.CONDITION
      
      nodes.push(this.createNodeData(type, {
        x,
        y,
        label: `节点${i + 1}`
      }))
    }
    
    return nodes
  }

  /**
   * 生成性能测试连接
   * @returns {Array} 连接数组
   */
  generatePerformanceTestEdges() {
    const edges = []
    const nodeCount = 50
    
    // 创建线性连接
    for (let i = 1; i < nodeCount; i++) {
      edges.push(this.createEdgeData(`node-${i}`, `node-${i + 1}`))
    }
    
    // 添加一些分支连接
    for (let i = 5; i < nodeCount; i += 10) {
      if (i + 5 < nodeCount) {
        edges.push(this.createEdgeData(`node-${i + 1}`, `node-${i + 6}`, {
          type: CONNECTION_TYPES.CONDITIONAL,
          label: '条件分支'
        }))
      }
    }
    
    return edges
  }

  /**
   * 获取测试场景
   * @param {string} scenarioType - 场景类型
   * @returns {Object} 场景数据
   */
  getScenario(scenarioType) {
    return this.scenarios.get(scenarioType)
  }

  /**
   * 获取所有场景
   * @returns {Map} 所有场景
   */
  getAllScenarios() {
    return this.scenarios
  }

  /**
   * 创建自定义场景
   * @param {string} name - 场景名称
   * @param {Object} scenarioData - 场景数据
   */
  createCustomScenario(name, scenarioData) {
    this.scenarios.set(name, scenarioData)
  }

  /**
   * 重置计数器
   */
  resetCounters() {
    this.nodeIdCounter = 1
    this.edgeIdCounter = 1
  }

  /**
   * 生成随机测试数据
   * @param {Object} options - 生成选项
   * @returns {Object} 随机测试数据
   */
  generateRandomData(options = {}) {
    const {
      nodeCount = 5,
      maxConnections = 8,
      includeConditions = true,
      includeParallel = false
    } = options

    const nodes = []
    const edges = []

    // 生成节点
    for (let i = 0; i < nodeCount; i++) {
      let type = NODE_TYPES.ACTION
      if (i === 0) type = NODE_TYPES.START
      if (i === nodeCount - 1) type = NODE_TYPES.END
      if (includeConditions && Math.random() < 0.3) type = NODE_TYPES.CONDITION
      if (includeParallel && Math.random() < 0.2) type = NODE_TYPES.SPLIT

      nodes.push(this.createNodeData(type, {
        x: 100 + (i % 3) * 200 + Math.random() * 50,
        y: 100 + Math.floor(i / 3) * 150 + Math.random() * 50,
        label: `节点${i + 1}`
      }))
    }

    // 生成连接
    const connectionCount = Math.min(maxConnections, nodeCount - 1)
    for (let i = 0; i < connectionCount; i++) {
      const sourceIndex = Math.floor(Math.random() * (nodeCount - 1))
      const targetIndex = sourceIndex + 1 + Math.floor(Math.random() * (nodeCount - sourceIndex - 1))
      
      edges.push(this.createEdgeData(
        nodes[sourceIndex].id,
        nodes[targetIndex].id
      ))
    }

    return { nodes, edges }
  }
}

// 导出单例实例
export const testDataManager = new TestDataManager()

// 导出便捷方法
export function getTestScenario(scenarioType) {
  return testDataManager.getScenario(scenarioType)
}

export function createTestNode(type, options = {}) {
  return testDataManager.createNodeData(type, options)
}

export function createTestEdge(sourceId, targetId, options = {}) {
  return testDataManager.createEdgeData(sourceId, targetId, options)
}