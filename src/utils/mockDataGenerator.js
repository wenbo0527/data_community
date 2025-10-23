/**
 * Mock数据生成器
 * 为查询模式和统计模式提供模拟数据
 */
export class MockDataGenerator {
  // 任务类型列表
  static TASK_TYPES = ['促实名', '促授信', '促支用', '促活跃', '风险控制']
  
  // 任务状态列表
  static TASK_STATUSES = ['draft', 'running', 'completed', 'disabled']
  
  // 节点类型列表
  static NODE_TYPES = [
    'start', 'end', 'crowd-split', 'event-split', 
    'sms', 'push', 'email', 'manual-call', 'wait', 'condition'
  ]
  
  // 创建人列表
  static CREATORS = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']
  
  /**
   * 生成查询模式的模拟数据
   * @param {number} count - 数据数量
   * @param {string} defaultUserId - 默认用户ID
   * @returns {Array} 任务数据数组
   */
  static generateQueryMockData(count = 10, defaultUserId = '1234') {
    const tasks = []
    const extendedStatuses = [...this.TASK_STATUSES, 'draft', 'published']
    
    for (let i = 0; i < count; i++) {
      const taskType = this.getRandomItem(this.TASK_TYPES)
      const status = this.getRandomItem(extendedStatuses)
      const createTime = this.generateRandomDate()
      
      const task = {
        id: `task-${i + 1}`,
        taskName: this.generateTaskName(taskType),
        taskType,
        status,
        userId: defaultUserId,
        createTime,
        updateTime: status === 'draft' ? createTime : this.generateRandomDateInRange(30),
        executeTime: status === 'draft' ? '-' : this.generateExecuteTime(),
        canvasData: this.generateCanvasData(taskType)
      }
      
      // 为发布状态的任务添加发布时间
      if (status === 'published') {
        const createDate = new Date(createTime)
        const publishDelay = Math.floor(Math.random() * 24 * 60 * 60 * 1000) // 0-24小时延迟
        const publishTime = new Date(createDate.getTime() + publishDelay)
        task.publishTime = publishTime.toLocaleString('zh-CN')
      }
      
      tasks.push(task)
    }
    
    return {
      tasks,
      totalCount: tasks.length
    }
  }
  
  /**
   * 生成统计模式的模拟数据
   * @param {number} taskCount - 任务数量
   * @param {string} defaultUserId - 默认用户ID
   * @returns {Object} 统计数据
   */
  static generateStatisticsMockData(taskCount = 20, defaultUserId = '1234') {
    const queryData = this.generateQueryMockData(taskCount, defaultUserId)
    const tasks = queryData.tasks
    
    // 计算基础统计（包含新状态）
    const taskStats = {
      total: tasks.length,
      draft: tasks.filter(t => t.status === 'draft').length,
      published: tasks.filter(t => t.status === 'published').length,
      running: tasks.filter(t => t.status === 'running').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      disabled: tasks.filter(t => t.status === 'disabled').length
    }
    
    // 计算节点统计
    let totalNodes = 0
    let totalConnections = 0
    const nodeTypeStats = {}
    
    tasks.forEach(task => {
      if (task.canvasData) {
        totalNodes += task.canvasData.nodes?.length || 0
        totalConnections += task.canvasData.connections?.length || 0
        
        task.canvasData.nodes?.forEach(node => {
          nodeTypeStats[node.type] = (nodeTypeStats[node.type] || 0) + 1
        })
      }
    })
    
    const nodeStats = {
      total: totalNodes,
      average: Math.round(totalNodes / tasks.length * 100) / 100,
      connections: totalConnections,
      typeDistribution: nodeTypeStats
    }
    
    // 计算任务类型分布
    const taskTypeStats = {}
    tasks.forEach(task => {
      taskTypeStats[task.taskType] = (taskTypeStats[task.taskType] || 0) + 1
    })
    
    // 计算状态分布
    const statusStats = {}
    tasks.forEach(task => {
      statusStats[task.status] = (statusStats[task.status] || 0) + 1
    })
    
    return {
      tasks,
      statistics: {
        taskStats,
        nodeStats,
        taskTypeStats,
        statusStats,
        executionStats: this.generateExecutionStats(tasks),
        realtimeData: this.generateRealtimeMonitoringData()
      }
    }
  }
  
  /**
   * 生成任务名称
   * @param {string} taskType - 任务类型
   * @returns {string} 任务名称
   */
  static generateTaskName(taskType) {
    const prefixes = ['智能', '精准', '高效', '自动化', '实时']
    const suffixes = {
      '促实名': ['实名认证', '身份验证', '用户激活'],
      '促授信': ['授信推广', '信贷营销', '额度提升'],
      '促支用': ['支用引导', '放款推广', '资金使用'],
      '促活跃': ['用户活跃', '留存提升', '互动增强'],
      '风险控制': ['风险监控', '安全防护', '异常检测']
    }
    
    const prefix = this.getRandomItem(prefixes)
    const taskSuffixes = suffixes[taskType] || ['营销任务', '推广活动', '用户触达']
    const suffix = this.getRandomItem(taskSuffixes)
    const number = Math.floor(Math.random() * 999) + 1
    
    return `${prefix}${suffix}_${number.toString().padStart(3, '0')}`
  }
  
  /**
   * 生成画布数据
   * @param {string} taskType - 任务类型
   * @param {number} nodeCount - 节点数量
   * @returns {Object} 画布数据
   */
  static generateCanvasData(taskType, nodeCount = 5) {
    const nodes = []
    const connections = []
    
    // 节点间距配置
    const nodeSpacing = 200
    const startX = 100
    const startY = 150
    
    // 生成开始节点
    nodes.push({
      id: 'start-node',
      type: 'start',
      name: '开始',
      status: 'active',
      x: startX,
      y: startY,
      width: 120,
      height: 60,
      ports: {
        groups: {
          out: {
            position: 'right',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#31d0c6',
                strokeWidth: 2,
                fill: '#fff'
              }
            }
          }
        }
      }
    })
    
    // 生成中间节点
    for (let i = 1; i < nodeCount - 1; i++) {
      const nodeType = this.getRandomNodeType(taskType)
      const nodeWidth = nodeType === 'audience-split' ? 140 : 120
      const nodeHeight = nodeType === 'audience-split' ? 80 : 60
      
      nodes.push({
        id: `node-${i}`,
        type: nodeType,
        name: this.getNodeLabel(nodeType),
        status: Math.random() > 0.3 ? 'active' : 'inactive',
        x: startX + i * nodeSpacing,
        y: startY,
        width: nodeWidth,
        height: nodeHeight,
        ports: {
          groups: {
            in: {
              position: 'left',
              attrs: {
                circle: {
                  r: 4,
                  magnet: true,
                  stroke: '#31d0c6',
                  strokeWidth: 2,
                  fill: '#fff'
                }
              }
            },
            out: {
              position: 'right',
              attrs: {
                circle: {
                  r: 4,
                  magnet: true,
                  stroke: '#31d0c6',
                  strokeWidth: 2,
                  fill: '#fff'
                }
              }
            }
          }
        }
      })
    }
    
    // 生成结束节点
    nodes.push({
      id: 'end-node',
      type: 'end',
      name: '结束',
      status: 'inactive',
      x: startX + (nodeCount - 1) * nodeSpacing,
      y: startY,
      width: 120,
      height: 60,
      ports: {
        groups: {
          in: {
            position: 'left',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#31d0c6',
                strokeWidth: 2,
                fill: '#fff'
              }
            }
          }
        }
      }
    })
    
    // 生成连接
    for (let i = 0; i < nodes.length - 1; i++) {
      const sourceNode = nodes[i]
      const targetNode = nodes[i + 1]
      
      connections.push({
        id: `connection-${i}`,
        source: { cell: sourceNode.id, port: 'out' },
        target: { cell: targetNode.id, port: 'in' },
        label: this.generateConnectionLabel(sourceNode.type, targetNode.type),
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
        }
      })
    }
    
    return {
      nodes,
      connections
    }
  }
  
  /**
   * 根据任务类型获取随机节点类型
   * @param {string} taskType - 任务类型
   * @returns {string} 节点类型
   */
  static getRandomNodeType(taskType) {
    const typeNodeMap = {
      '促实名': ['audience-split', 'sms', 'push', 'manual-call'],
      '促授信': ['audience-split', 'event-split', 'push', 'email'],
      '促支用': ['event-split', 'sms', 'push', 'wait'],
      '促活跃': ['audience-split', 'push', 'email', 'condition'],
      '风险控制': ['condition', 'event-split', 'manual-call', 'wait']
    }
    
    const availableTypes = taskType ? 
      typeNodeMap[taskType] || this.NODE_TYPES.slice(2, -1) :
      this.NODE_TYPES.slice(2, -1) // 排除start和end
    
    return this.getRandomItem(availableTypes)
  }
  
  /**
   * 获取节点标签
   * @param {string} nodeType - 节点类型
   * @returns {string} 节点标签
   */
  static getNodeLabel(nodeType) {
    const labelMap = {
      'start': '开始',
      'end': '结束',
      'audience-split': '人群分流',
      'event-split': '事件分流',
      'sms': '短信发送',
      'push': '推送通知',
      'email': '邮件发送',
      'manual-call': '人工外呼',
      'wait': '等待节点',
      'condition': '条件判断'
    }
    
    return labelMap[nodeType] || nodeType
  }
  
  /**
   * 生成连接标签
   * @param {string} sourceType - 源节点类型
   * @param {string} targetType - 目标节点类型
   * @returns {string} 连接标签
   */
  static generateConnectionLabel(sourceType, targetType) {
    const labels = {
      'audience-split': ['高响应客群', '中响应客群', '低响应客群', '黑名单'],
      'event-split': ['事件触发', '事件未触发', '超时'],
      'condition': ['条件满足', '条件不满足'],
      'default': ['成功', '失败', '继续', '跳过']
    }
    
    const sourceLabels = labels[sourceType] || labels['default']
    return this.getRandomItem(sourceLabels)
  }
  
  /**
   * 生成随机日期
   * @param {number} daysBack - 往前推几天
   * @returns {string} 格式化的日期时间
   */
  static generateRandomDate(daysBack = 90) {
    const now = new Date()
    const randomDays = Math.floor(Math.random() * daysBack)
    const randomHours = Math.floor(Math.random() * 24)
    const randomMinutes = Math.floor(Math.random() * 60)
    
    const date = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000)
    date.setHours(randomHours, randomMinutes, 0, 0)
    
    return date.toLocaleString('zh-CN')
  }
  
  /**
   * 生成指定范围内的随机日期
   * @param {number} daysRange - 日期范围（天数）
   * @returns {string} 格式化的日期时间
   */
  static generateRandomDateInRange(daysRange) {
    const now = new Date()
    const randomDays = Math.floor(Math.random() * daysRange)
    const randomHours = Math.floor(Math.random() * 24)
    const randomMinutes = Math.floor(Math.random() * 60)
    
    const date = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000)
    date.setHours(randomHours, randomMinutes, 0, 0)
    
    return date.toLocaleString('zh-CN')
  }
  
  /**
   * 生成执行时间
   * @returns {string} 执行时间或'-'
   */
  static generateExecuteTime() {
    // 30%的概率没有执行时间
    if (Math.random() < 0.3) {
      return '-'
    }
    
    const createTime = new Date(this.generateRandomDate())
    const executeDelay = Math.floor(Math.random() * 24 * 60 * 60 * 1000) // 0-24小时延迟
    const executeTime = new Date(createTime.getTime() + executeDelay)
    
    return executeTime.toLocaleString('zh-CN')
  }
  
  /**
   * 根据权重随机选择状态
   * @param {Object} statusDistribution - 状态分布
   * @returns {string} 状态
   */
  static getWeightedRandomStatus(statusDistribution) {
    const statuses = Object.keys(statusDistribution)
    const weights = Object.values(statusDistribution)
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
    
    let random = Math.random() * totalWeight
    
    for (let i = 0; i < statuses.length; i++) {
      random -= weights[i]
      if (random <= 0) {
        return statuses[i]
      }
    }
    
    return statuses[0] // 默认返回第一个状态
  }
  
  /**
   * 从数组中随机选择一个元素
   * @param {Array} array - 数组
   * @returns {*} 随机元素
   */
  static getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)]
  }
  
  /**
   * 生成任务执行统计数据
   * @param {Array} tasks - 任务列表
   * @returns {Object} 统计数据
   */
  static generateExecutionStats(tasks) {
    const stats = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      avgExecutionTime: 0,
      executionsByHour: new Array(24).fill(0),
      executionsByDay: {},
      nodeExecutionStats: {}
    }
    
    tasks.forEach(task => {
      if (task.status === 'running' || task.status === 'completed') {
        stats.totalExecutions++
        
        if (task.status === 'completed') {
          stats.successfulExecutions++
        }
        
        // 模拟执行时间统计
        let executeTime
        try {
          executeTime = new Date(task.executeTime || task.createTime)
          if (isNaN(executeTime.getTime())) {
            executeTime = new Date() // 使用当前时间作为默认值
          }
        } catch (e) {
          executeTime = new Date() // 使用当前时间作为默认值
        }
        
        const hour = executeTime.getHours()
        stats.executionsByHour[hour]++
        
        const day = executeTime.toISOString().split('T')[0]
        stats.executionsByDay[day] = (stats.executionsByDay[day] || 0) + 1
        
        // 节点执行统计
        if (task.canvasData?.nodes) {
          task.canvasData.nodes.forEach(node => {
            if (!stats.nodeExecutionStats[node.type]) {
              stats.nodeExecutionStats[node.type] = {
                total: 0,
                successful: 0,
                failed: 0
              }
            }
            
            stats.nodeExecutionStats[node.type].total++
            
            if (Math.random() > 0.1) { // 90%成功率
              stats.nodeExecutionStats[node.type].successful++
            } else {
              stats.nodeExecutionStats[node.type].failed++
            }
          })
        }
      }
    })
    
    stats.failedExecutions = stats.totalExecutions - stats.successfulExecutions
    stats.avgExecutionTime = Math.floor(Math.random() * 300) + 60 // 60-360秒
    
    return stats
  }
  
  /**
   * 生成实时监控数据
   * @returns {Object} 实时监控数据
   */
  static generateRealtimeMonitoringData() {
    return {
      activeConnections: Math.floor(Math.random() * 1000) + 100,
      queuedTasks: Math.floor(Math.random() * 50),
      processingTasks: Math.floor(Math.random() * 20) + 5,
      systemLoad: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      cpuUsage: Math.random() * 100,
      networkTraffic: {
        incoming: Math.floor(Math.random() * 1000),
        outgoing: Math.floor(Math.random() * 800)
      },
      errorRate: Math.random() * 5, // 0-5%错误率
      responseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
      timestamp: new Date().toISOString()
    }
  }
}

// 导出默认实例
export default MockDataGenerator