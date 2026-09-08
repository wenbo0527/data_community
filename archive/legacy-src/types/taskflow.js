/**
 * TaskFlow 系统类型定义
 * 提供完整的类型安全和智能提示
 */

/**
 * 节点类型枚举
 * @typedef {string} NodeType
 */
export const NODE_TYPES = {
  START: 'start',
  AUDIENCE_SPLIT: 'audience-split',
  EVENT_SPLIT: 'event-split',
  AB_TEST: 'ab-test',
  SMS: 'sms',
  AI_CALL: 'ai-call',
  MANUAL_CALL: 'manual-call',
  WAIT: 'wait',
  END: 'end'
}

/**
 * 节点数据结构
 * @typedef {Object} NodeData
 * @property {string} id - 节点唯一标识
 * @property {NodeType} type - 节点类型
 * @property {string} label - 节点标签
 * @property {Object} config - 节点配置
 * @property {Position} position - 节点位置
 * @property {Size} size - 节点大小
 * @property {string[]} inputs - 输入端口
 * @property {string[]} outputs - 输出端口
 * @property {Object} metadata - 元数据
 */

/**
 * 位置信息
 * @typedef {Object} Position
 * @property {number} x - X坐标
 * @property {number} y - Y坐标
 */

/**
 * 尺寸信息
 * @typedef {Object} Size
 * @property {number} width - 宽度
 * @property {number} height - 高度
 */

/**
 * 分支信息
 * @typedef {Object} Branch
 * @property {string} id - 分支ID
 * @property {string} label - 分支标签
 * @property {string} type - 分支类型
 * @property {Object} condition - 分支条件
 * @property {string} portId - 端口ID
 * @property {number} index - 分支索引
 */

/**
 * 连接信息
 * @typedef {Object} Connection
 * @property {string} id - 连接ID
 * @property {string} sourceNodeId - 源节点ID
 * @property {string} targetNodeId - 目标节点ID
 * @property {string} sourcePortId - 源端口ID
 * @property {string} targetPortId - 目标端口ID
 * @property {Object} style - 连接样式
 */

/**
 * 预览线配置
 * @typedef {Object} PreviewLineConfig
 * @property {string} stroke - 线条颜色
 * @property {number} strokeWidth - 线条宽度
 * @property {string} strokeDasharray - 虚线样式
 * @property {number} opacity - 透明度
 * @property {boolean} animated - 是否动画
 */

/**
 * 布局配置
 * @typedef {Object} LayoutConfig
 * @property {string} direction - 布局方向 ('TB' | 'BT' | 'LR' | 'RL')
 * @property {number} nodeSpacing - 节点间距
 * @property {number} rankSpacing - 层级间距
 * @property {boolean} autoResize - 自动调整大小
 * @property {Object} constraints - 布局约束
 */

/**
 * 事件数据
 * @typedef {Object} EventData
 * @property {string} type - 事件类型
 * @property {Object} target - 事件目标
 * @property {Object} data - 事件数据
 * @property {number} timestamp - 时间戳
 */

/**
 * 管理器接口
 * @typedef {Object} Manager
 * @property {Function} init - 初始化方法
 * @property {Function} destroy - 销毁方法
 * @property {Function} update - 更新方法
 * @property {Function} reset - 重置方法
 */

/**
 * 图形实例接口
 * @typedef {Object} GraphInstance
 * @property {Function} addNode - 添加节点
 * @property {Function} removeNode - 删除节点
 * @property {Function} addEdge - 添加连接
 * @property {Function} removeEdge - 删除连接
 * @property {Function} getNodes - 获取所有节点
 * @property {Function} getEdges - 获取所有连接
 * @property {Function} getCellById - 根据ID获取元素
 * @property {Function} on - 绑定事件
 * @property {Function} off - 解绑事件
 * @property {Function} trigger - 触发事件
 */

/**
 * 验证函数类型
 * @typedef {Function} Validator
 * @param {*} value - 要验证的值
 * @param {string} context - 验证上下文
 * @throws {Error} 验证失败时抛出错误
 */

/**
 * 错误处理器类型
 * @typedef {Object} ErrorHandler
 * @property {Function} logError - 记录错误
 * @property {Function} logWarning - 记录警告
 * @property {Function} validateRequired - 验证必需参数
 * @property {Function} safeExecute - 安全执行
 */

/**
 * 性能监控数据
 * @typedef {Object} PerformanceData
 * @property {string} operation - 操作名称
 * @property {number} duration - 执行时间（毫秒）
 * @property {number} timestamp - 时间戳
 * @property {Object} metadata - 元数据
 */

/**
 * 缓存配置
 * @typedef {Object} CacheConfig
 * @property {number} maxSize - 最大缓存大小
 * @property {number} ttl - 生存时间（毫秒）
 * @property {Function} keyGenerator - 键生成器
 * @property {Function} serializer - 序列化器
 */

// 导出类型检查函数
export const TypeCheckers = {
  isNodeData: (obj) => {
    return obj && 
           typeof obj.id === 'string' && 
           typeof obj.type === 'string' && 
           typeof obj.label === 'string'
  },
  
  isPosition: (obj) => {
    return obj && 
           typeof obj.x === 'number' && 
           typeof obj.y === 'number'
  },
  
  isSize: (obj) => {
    return obj && 
           typeof obj.width === 'number' && 
           typeof obj.height === 'number'
  },
  
  isBranch: (obj) => {
    return obj && 
           typeof obj.id === 'string' && 
           typeof obj.label === 'string' && 
           typeof obj.type === 'string'
  },
  
  isConnection: (obj) => {
    return obj && 
           typeof obj.sourceNodeId === 'string' && 
           typeof obj.targetNodeId === 'string'
  }
}