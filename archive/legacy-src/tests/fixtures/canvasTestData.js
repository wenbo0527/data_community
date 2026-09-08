// 营销画布测试数据fixtures
// 提供接近生产环境的真实测试数据

// 基础节点类型配置
export const NODE_TYPES = {
  START: 'start',
  AUDIENCE_SPLIT: 'audience-split',
  SMS: 'sms',
  EMAIL: 'email',
  PUSH: 'push',
  WAIT: 'wait',
  WEBHOOK: 'webhook',
  END: 'end'
};

// 节点形状映射
export const NODE_SHAPES = {
  [NODE_TYPES.START]: 'circle',
  [NODE_TYPES.AUDIENCE_SPLIT]: 'circle',
  [NODE_TYPES.SMS]: 'circle',
  [NODE_TYPES.EMAIL]: 'circle',
  [NODE_TYPES.PUSH]: 'circle',
  [NODE_TYPES.WAIT]: 'circle',
  [NODE_TYPES.WEBHOOK]: 'circle',
  [NODE_TYPES.END]: 'circle'
};

// 有效的节点数据
export const VALID_NODES = [
  {
    id: 'start-node-1',
    type: NODE_TYPES.START,
    position: { x: 100, y: 100 },
    data: {
      label: '营销活动开始',
      description: '新用户注册触发点',
      config: {
        triggerType: 'user_registration',
        conditions: []
      }
    }
  },
  {
    id: 'audience-split-1',
    type: NODE_TYPES.AUDIENCE_SPLIT,
    position: { x: 300, y: 100 },
    data: {
      label: '用户分群',
      description: '根据用户属性进行分群',
      config: {
        conditions: [
          {
            field: 'age',
            operator: 'gte',
            value: 18
          },
          {
            field: 'city',
            operator: 'in',
            value: ['北京', '上海', '广州', '深圳']
          }
        ],
        logic: 'AND'
      }
    }
  },
  {
    id: 'sms-node-1',
    type: NODE_TYPES.SMS,
    position: { x: 500, y: 50 },
    data: {
      label: 'SMS推送',
      description: '发送欢迎短信',
      config: {
        template: 'welcome_sms',
        content: '欢迎注册我们的服务！点击链接完成验证：{{verification_link}}',
        variables: ['verification_link'],
        sendTime: 'immediate'
      }
    }
  },
  {
    id: 'email-node-1',
    type: NODE_TYPES.EMAIL,
    position: { x: 500, y: 150 },
    data: {
      label: '邮件推送',
      description: '发送欢迎邮件',
      config: {
        template: 'welcome_email',
        subject: '欢迎加入我们！',
        content: '<h1>欢迎！</h1><p>感谢您注册我们的服务...</p>',
        attachments: [],
        sendTime: 'immediate'
      }
    }
  },
  {
    id: 'wait-node-1',
    type: NODE_TYPES.WAIT,
    position: { x: 700, y: 100 },
    data: {
      label: '等待',
      description: '等待用户行为',
      config: {
        waitType: 'time',
        duration: 24,
        unit: 'hours',
        conditions: [
          {
            event: 'email_opened',
            timeout: 48
          }
        ]
      }
    }
  },
  {
    id: 'push-node-1',
    type: NODE_TYPES.PUSH,
    position: { x: 900, y: 100 },
    data: {
      label: 'App推送',
      description: '发送App通知',
      config: {
        title: '别忘了完成设置！',
        body: '完善您的个人资料，获得更好的服务体验',
        icon: 'notification_icon',
        action: 'open_profile',
        sendTime: 'immediate'
      }
    }
  },
  {
    id: 'webhook-node-1',
    type: NODE_TYPES.WEBHOOK,
    position: { x: 1100, y: 100 },
    data: {
      label: 'Webhook调用',
      description: '调用外部API',
      config: {
        url: 'https://api.example.com/user/update',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer {{api_token}}'
        },
        payload: {
          userId: '{{user_id}}',
          status: 'onboarded',
          timestamp: '{{current_time}}'
        }
      }
    }
  },
  {
    id: 'end-node-1',
    type: NODE_TYPES.END,
    position: { x: 1300, y: 100 },
    data: {
      label: '流程结束',
      description: '营销流程完成',
      config: {
        completionAction: 'mark_completed',
        analytics: {
          trackConversion: true,
          conversionEvent: 'onboarding_completed'
        }
      }
    }
  }
];

// 有效的连接数据
export const VALID_CONNECTIONS = [
  {
    id: 'conn-1',
    source: 'start-node-1',
    target: 'audience-split-1',
    data: {
      label: '所有用户',
      condition: null
    }
  },
  {
    id: 'conn-2',
    source: 'audience-split-1',
    target: 'sms-node-1',
    data: {
      label: '满足条件',
      condition: 'true_branch'
    }
  },
  {
    id: 'conn-3',
    source: 'audience-split-1',
    target: 'email-node-1',
    data: {
      label: '不满足条件',
      condition: 'false_branch'
    }
  },
  {
    id: 'conn-4',
    source: 'sms-node-1',
    target: 'wait-node-1',
    data: {
      label: 'SMS发送完成',
      condition: null
    }
  },
  {
    id: 'conn-5',
    source: 'email-node-1',
    target: 'wait-node-1',
    data: {
      label: '邮件发送完成',
      condition: null
    }
  },
  {
    id: 'conn-6',
    source: 'wait-node-1',
    target: 'push-node-1',
    data: {
      label: '等待完成',
      condition: null
    }
  },
  {
    id: 'conn-7',
    source: 'push-node-1',
    target: 'webhook-node-1',
    data: {
      label: '推送完成',
      condition: null
    }
  },
  {
    id: 'conn-8',
    source: 'webhook-node-1',
    target: 'end-node-1',
    data: {
      label: 'API调用完成',
      condition: null
    }
  }
];

// 无效的节点数据（用于测试验证）
export const INVALID_NODES = [
  {
    id: null,
    type: NODE_TYPES.SMS,
    position: { x: 100, y: 100 },
    data: { label: '无效节点 - 空ID' }
  },
  {
    id: 'invalid-type-node',
    type: 'invalid-type',
    position: { x: 100, y: 100 },
    data: { label: '无效节点 - 错误类型' }
  },
  {
    id: 'invalid-position-node',
    type: NODE_TYPES.EMAIL,
    position: { x: 'invalid', y: 100 },
    data: { label: '无效节点 - 错误位置' }
  },
  {
    id: 'missing-data-node',
    type: NODE_TYPES.PUSH,
    position: { x: 100, y: 100 }
    // 缺少 data 字段
  },
  {
    id: 'empty-label-node',
    type: NODE_TYPES.WAIT,
    position: { x: 100, y: 100 },
    data: { label: '' } // 空标签
  }
];

// 边界值测试数据
export const BOUNDARY_TEST_DATA = {
  positions: {
    zero: { x: 0, y: 0 },
    negative: { x: -100, y: -200 },
    large: { x: 10000, y: 10000 },
    decimal: { x: 100.5, y: 200.7 },
    maxSafe: { x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER }
  },
  ids: {
    empty: '',
    null: null,
    undefined: undefined,
    numeric: 123,
    special: 'node-with-special-chars-!@#$%^&*()'
  },
  labels: {
    empty: '',
    long: 'A'.repeat(1000),
    unicode: '节点标签 🚀 测试',
    html: '<script>alert("test")</script>',
    newlines: 'Line 1\nLine 2\nLine 3'
  }
};

// 复杂的营销流程数据
export const COMPLEX_MARKETING_FLOW = {
  nodes: [
    {
      id: 'start-complex',
      type: NODE_TYPES.START,
      position: { x: 50, y: 300 },
      data: {
        label: '用户注册',
        config: { triggerType: 'registration' }
      }
    },
    {
      id: 'split-age',
      type: NODE_TYPES.AUDIENCE_SPLIT,
      position: { x: 200, y: 300 },
      data: {
        label: '年龄分群',
        config: {
          conditions: [{ field: 'age', operator: 'gte', value: 25 }]
        }
      }
    },
    {
      id: 'split-location',
      type: NODE_TYPES.AUDIENCE_SPLIT,
      position: { x: 350, y: 200 },
      data: {
        label: '地域分群',
        config: {
          conditions: [{ field: 'city', operator: 'in', value: ['北京', '上海'] }]
        }
      }
    },
    {
      id: 'sms-young',
      type: NODE_TYPES.SMS,
      position: { x: 500, y: 100 },
      data: {
        label: '年轻用户SMS',
        config: { content: '年轻人专属优惠！' }
      }
    },
    {
      id: 'email-mature',
      type: NODE_TYPES.EMAIL,
      position: { x: 500, y: 300 },
      data: {
        label: '成熟用户邮件',
        config: { subject: '专业服务推荐' }
      }
    },
    {
      id: 'push-local',
      type: NODE_TYPES.PUSH,
      position: { x: 500, y: 200 },
      data: {
        label: '本地推送',
        config: { title: '附近门店优惠' }
      }
    },
    {
      id: 'wait-engagement',
      type: NODE_TYPES.WAIT,
      position: { x: 650, y: 200 },
      data: {
        label: '等待互动',
        config: { waitType: 'event', event: 'click' }
      }
    },
    {
      id: 'end-complex',
      type: NODE_TYPES.END,
      position: { x: 800, y: 200 },
      data: {
        label: '流程完成',
        config: { completionAction: 'mark_completed' }
      }
    }
  ],
  connections: [
    { id: 'c1', source: 'start-complex', target: 'split-age' },
    { id: 'c2', source: 'split-age', target: 'split-location', data: { condition: 'true_branch' } },
    { id: 'c3', source: 'split-age', target: 'email-mature', data: { condition: 'false_branch' } },
    { id: 'c4', source: 'split-location', target: 'push-local', data: { condition: 'true_branch' } },
    { id: 'c5', source: 'split-location', target: 'sms-young', data: { condition: 'false_branch' } },
    { id: 'c6', source: 'sms-young', target: 'wait-engagement' },
    { id: 'c7', source: 'push-local', target: 'wait-engagement' },
    { id: 'c8', source: 'email-mature', target: 'wait-engagement' },
    { id: 'c9', source: 'wait-engagement', target: 'end-complex' }
  ]
};

// 性能测试数据生成器
export const generatePerformanceTestData = (nodeCount = 100, connectionRatio = 1.5) => {
  const nodes = Array.from({ length: nodeCount }, (_, i) => {
    const types = Object.values(NODE_TYPES);
    const type = types[i % types.length];
    
    return {
      id: `perf-node-${i}`,
      type,
      position: {
        x: (i % 10) * 150 + Math.random() * 50,
        y: Math.floor(i / 10) * 100 + Math.random() * 50
      },
      data: {
        label: `${type} Node ${i}`,
        config: {
          generated: true,
          index: i
        }
      }
    };
  });
  
  const connectionCount = Math.floor(nodeCount * connectionRatio);
  const connections = Array.from({ length: connectionCount }, (_, i) => {
    const sourceIndex = Math.floor(Math.random() * nodeCount);
    let targetIndex = Math.floor(Math.random() * nodeCount);
    
    // 避免自连接
    while (targetIndex === sourceIndex) {
      targetIndex = Math.floor(Math.random() * nodeCount);
    }
    
    return {
      id: `perf-conn-${i}`,
      source: `perf-node-${sourceIndex}`,
      target: `perf-node-${targetIndex}`,
      data: {
        generated: true,
        index: i
      }
    };
  });
  
  return { nodes, connections };
};

// 用户交互模拟数据
export const USER_INTERACTIONS = {
  dragSequence: [
    { action: 'start', position: { x: 100, y: 100 } },
    { action: 'move', position: { x: 110, y: 105 } },
    { action: 'move', position: { x: 125, y: 115 } },
    { action: 'move', position: { x: 150, y: 130 } },
    { action: 'end', position: { x: 200, y: 150 } }
  ],
  selectionSequence: [
    { action: 'select', nodeId: 'node-1' },
    { action: 'multiSelect', nodeIds: ['node-1', 'node-2'] },
    { action: 'addToSelection', nodeId: 'node-3' },
    { action: 'removeFromSelection', nodeId: 'node-2' },
    { action: 'clearSelection' }
  ],
  connectionSequence: [
    { action: 'startConnection', nodeId: 'start-node-1' },
    { action: 'hoverTarget', nodeId: 'sms-node-1' },
    { action: 'endConnection', nodeId: 'sms-node-1' }
  ]
};

// 错误场景测试数据
export const ERROR_SCENARIOS = {
  networkErrors: {
    timeout: { code: 'TIMEOUT', message: 'Request timeout' },
    serverError: { code: 'SERVER_ERROR', message: 'Internal server error' },
    notFound: { code: 'NOT_FOUND', message: 'Resource not found' }
  },
  validationErrors: {
    invalidNodeType: { field: 'type', message: 'Unsupported node type' },
    invalidPosition: { field: 'position', message: 'Invalid coordinates' },
    missingRequired: { field: 'data.label', message: 'Label is required' }
  },
  stateErrors: {
    concurrentModification: { message: 'Concurrent modification detected' },
    invalidTransition: { message: 'Invalid state transition' },
    memoryLeak: { message: 'Memory usage exceeded threshold' }
  }
};

// 默认导出完整的测试数据集
export default {
  NODE_TYPES,
  NODE_SHAPES,
  VALID_NODES,
  VALID_CONNECTIONS,
  INVALID_NODES,
  BOUNDARY_TEST_DATA,
  COMPLEX_MARKETING_FLOW,
  generatePerformanceTestData,
  USER_INTERACTIONS,
  ERROR_SCENARIOS
};