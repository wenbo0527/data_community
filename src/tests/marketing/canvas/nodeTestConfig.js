/**
 * 节点测试配置文件
 * 定义支持的节点类型和配置信息
 */

// 支持的9种节点类型
export const SUPPORTED_NODE_TYPES = [
  'start',
  'audience-split', 
  'event-split',
  'sms',
  'ai-call',
  'manual-call',
  'ab-test',
  'wait',
  'benefit'
]

// 节点类型配置映射
export const NODE_TYPE_CONFIG = {
  'start': { 
    label: '开始节点', 
    hasConfig: true,
    color: '#5F95FF',
    maxOutputs: 1,
    complexity: 'medium'
  },
  'audience-split': { 
    label: '人群分流', 
    hasConfig: true,
    color: '#FF6A6A',
    maxOutputs: 'dynamic',
    complexity: 'complex'
  },
  'event-split': { 
    label: '事件分流', 
    hasConfig: true,
    color: '#69C0FF',
    maxOutputs: 2,
    complexity: 'complex'
  },
  'sms': { 
    label: '短信触达', 
    hasConfig: true,
    color: '#45B7D1',
    maxOutputs: 1,
    complexity: 'medium'
  },
  'ai-call': { 
    label: 'AI外呼', 
    hasConfig: true,
    color: '#96CEB4',
    maxOutputs: 1,
    complexity: 'medium'
  },
  'manual-call': { 
    label: '人工外呼', 
    hasConfig: true,
    color: '#FFEAA7',
    maxOutputs: 1,
    complexity: 'medium'
  },
  'ab-test': { 
    label: 'AB测试', 
    hasConfig: true,
    color: '#DDA0DD',
    maxOutputs: 2,
    complexity: 'complex'
  },
  'wait': { 
    label: '等待节点', 
    hasConfig: true,
    color: '#A8A8A8',
    maxOutputs: 1,
    complexity: 'simple'
  },
  'benefit': { 
    label: '权益节点', 
    hasConfig: true,
    color: '#FFD700',
    maxOutputs: 1,
    complexity: 'medium'
  }
}

// 测试用例配置
export const TEST_CASE_CONFIG = {
  // 节点创建测试用例
  CREATE_TESTS: SUPPORTED_NODE_TYPES.map((nodeType, index) => ({
    id: `TC_CREATE_${String(index + 1).padStart(3, '0')}`,
    nodeType,
    description: `创建${NODE_TYPE_CONFIG[nodeType].label}`,
    expectedResult: 'success'
  })),
  
  // 配置抽屉测试用例
  DRAWER_TESTS: SUPPORTED_NODE_TYPES.map((nodeType, index) => ({
    id: `TC_DRAWER_${String(index + 1).padStart(3, '0')}`,
    nodeType,
    description: `${NODE_TYPE_CONFIG[nodeType].label}配置抽屉`,
    expectedResult: 'drawer_opens_correctly'
  })),
  
  // 配置保存测试用例
  SAVE_TESTS: SUPPORTED_NODE_TYPES.map((nodeType, index) => ({
    id: `TC_SAVE_${String(index + 1).padStart(3, '0')}`,
    nodeType,
    description: `${NODE_TYPE_CONFIG[nodeType].label}配置保存`,
    expectedResult: 'config_saved'
  })),
  
  // 删除测试用例
  DELETE_TESTS: SUPPORTED_NODE_TYPES.map((nodeType, index) => ({
    id: `TC_DELETE_${String(index + 1).padStart(3, '0')}`,
    nodeType,
    description: `删除${NODE_TYPE_CONFIG[nodeType].label}`,
    expectedResult: 'node_deleted'
  }))
}

// 节点特定配置数据
export const NODE_SPECIFIC_CONFIG = {
  'start': {
    taskType: 'marketing',
    targetAudience: '全部用户',
    description: '营销任务开始'
  },
  'audience-split': {
    splits: [
      { name: '分组A', percentage: 50 },
      { name: '分组B', percentage: 50 }
    ],
    splitMethod: 'random'
  },
  'event-split': {
    events: [
      { name: '点击事件', condition: 'click' },
      { name: '浏览事件', condition: 'view' }
    ]
  },
  'sms': {
    template: '您好，这是一条测试短信',
    sendTime: 'immediate'
  },
  'ai-call': {
    script: 'AI外呼脚本内容',
    retryCount: 3
  },
  'manual-call': {
    taskDescription: '人工外呼任务',
    priority: 'high'
  },
  'ab-test': {
    variants: [
      { name: '变体A', percentage: 50 },
      { name: '变体B', percentage: 50 }
    ]
  },
  'wait': {
    duration: 60,
    unit: 'minutes'
  },
  'benefit': {
    benefitType: 'coupon',
    content: '优惠券内容',
    validPeriod: '30天'
  }
}

// 错误测试配置
export const ERROR_TEST_CONFIG = {
  INVALID_NODE_TYPES: [
    'invalid-type',
    'unknown-node',
    'deprecated-type'
  ],
  INVALID_NODE_IDS: [
    'non-existent-node',
    null,
    undefined,
    ''
  ]
}

// 性能测试配置
export const PERFORMANCE_CONFIG = {
  MAX_NODES: 100,
  MAX_CONNECTIONS: 200,
  RESPONSE_TIME_LIMITS: {
    nodeCreation: 100, // ms
    drawerOpen: 200,   // ms
    previewLine: 150,  // ms
    nodeDelete: 50     // ms
  }
}

// 验证规则
export const VALIDATION_RULES = {
  nodeId: {
    required: true,
    pattern: /^[a-zA-Z0-9_-]+$/
  },
  nodeType: {
    required: true,
    enum: SUPPORTED_NODE_TYPES
  },
  position: {
    required: true,
    properties: {
      x: { type: 'number', min: 0 },
      y: { type: 'number', min: 0 }
    }
  }
}