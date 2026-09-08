/**
 * 营销画布测试Mock策略优化配置
 * 目标：减少过度Mock，保留关键集成点，提高测试真实性
 */
import { vi } from 'vitest';

// 1. 最小化Mock策略 - 只Mock外部依赖和不稳定的部分
export const minimalMockConfig = {
  // 需要Mock的外部依赖
  externalDependencies: [
    'react-router-dom', // 路由相关
    'axios', // HTTP请求
    'lodash/debounce', // 防抖函数
  ],
  
  // 需要Mock的浏览器API
  browserAPIs: [
    'ResizeObserver',
    'IntersectionObserver',
    'requestAnimationFrame',
    'cancelAnimationFrame'
  ],
  
  // 不需要Mock的内部模块（保留真实实现）
  keepRealImplementation: [
    '../pages/marketing/tasks/utils/canvas/canvasValidation',
    '../pages/marketing/tasks/utils/canvas/nodeTypes',
    '../pages/marketing/tasks/utils/canvas/canvasUtils'
  ]
};

// 2. 分层Mock策略
export const layeredMockStrategy = {
  // 单元测试：Mock所有外部依赖
  unit: {
    mockLevel: 'high',
    mockExternalDeps: true,
    mockInternalDeps: true,
    keepBusinessLogic: false
  },
  
  // 集成测试：只Mock外部依赖，保留内部逻辑
  integration: {
    mockLevel: 'medium',
    mockExternalDeps: true,
    mockInternalDeps: false,
    keepBusinessLogic: true
  },
  
  // 端到端测试：最小化Mock
  e2e: {
    mockLevel: 'low',
    mockExternalDeps: false,
    mockInternalDeps: false,
    keepBusinessLogic: true
  }
};

// 3. 智能Mock工厂
export class SmartMockFactory {
  constructor(testType = 'unit') {
    this.strategy = layeredMockStrategy[testType];
    this.mocks = new Map();
  }
  
  // 创建轻量化的useCanvasNodes Mock
  createCanvasNodesMock(overrides = {}) {
    const baseMock = {
      nodes: [],
      connections: [],
      addNode: vi.fn().mockImplementation((node) => {
        // 保留基本的添加逻辑，不完全Mock
        if (node && node.id && node.type) {
          baseMock.nodes.push(node);
          return { success: true, node };
        }
        return { success: false, error: 'Invalid node data' };
      }),
      updateNode: vi.fn(),
      removeNode: vi.fn().mockImplementation((nodeId) => {
        const index = baseMock.nodes.findIndex(n => n.id === nodeId);
        if (index > -1) {
          baseMock.nodes.splice(index, 1);
          return { success: true };
        }
        return { success: false, error: 'Node not found' };
      }),
      getNodeById: vi.fn().mockImplementation((nodeId) => {
        return baseMock.nodes.find(n => n.id === nodeId) || null;
      }),
      validateNodePosition: vi.fn().mockImplementation((position) => {
        return position && 
               typeof position.x === 'number' && 
               typeof position.y === 'number' &&
               !isNaN(position.x) && !isNaN(position.y);
      }),
      getNodeShapeByType: vi.fn().mockImplementation((type) => {
        const shapeMap = {
          'start': 'circle',
          'audience-split': 'diamond',
          'sms': 'rectangle',
          'email': 'rectangle',
          'wait': 'hexagon',
          'end': 'circle'
        };
        return shapeMap[type] || 'rectangle';
      }),
      addConnection: vi.fn().mockImplementation((connection) => {
        if (connection && connection.source && connection.target) {
          baseMock.connections.push(connection);
          return { success: true, connection };
        }
        return { success: false, error: 'Invalid connection data' };
      }),
      ...overrides
    };
    
    this.mocks.set('useCanvasNodes', baseMock);
    return baseMock;
  }
  
  // 创建轻量化的useCanvasSelection Mock
  createCanvasSelectionMock(overrides = {}) {
    const baseMock = {
      selectedNodes: [],
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
      isConnecting: false,
      connectionStart: null,
      selectNode: vi.fn().mockImplementation((nodeId) => {
        if (nodeId && !baseMock.selectedNodes.includes(nodeId)) {
          baseMock.selectedNodes.push(nodeId);
        }
      }),
      selectMultipleNodes: vi.fn().mockImplementation((nodeIds) => {
        baseMock.selectedNodes = Array.isArray(nodeIds) ? [...nodeIds] : [];
      }),
      clearSelection: vi.fn().mockImplementation(() => {
        baseMock.selectedNodes = [];
      }),
      startDrag: vi.fn().mockImplementation((position) => {
        if (position && typeof position.x === 'number' && typeof position.y === 'number') {
          baseMock.isDragging = true;
          baseMock.dragOffset = { ...position };
        }
      }),
      updateDrag: vi.fn().mockImplementation((position) => {
        if (baseMock.isDragging && position && typeof position.x === 'number' && typeof position.y === 'number') {
          baseMock.dragOffset = { ...position };
        }
      }),
      endDrag: vi.fn().mockImplementation(() => {
        baseMock.isDragging = false;
        baseMock.dragOffset = { x: 0, y: 0 };
      }),
      startConnection: vi.fn().mockImplementation((nodeId) => {
        if (nodeId) {
          baseMock.isConnecting = true;
          baseMock.connectionStart = nodeId;
        }
      }),
      endConnection: vi.fn().mockImplementation((targetNodeId) => {
        if (baseMock.isConnecting && baseMock.connectionStart && targetNodeId) {
          const connection = {
            id: `${baseMock.connectionStart}-${targetNodeId}`,
            source: baseMock.connectionStart,
            target: targetNodeId
          };
          baseMock.isConnecting = false;
          baseMock.connectionStart = null;
          return connection;
        }
        return null;
      }),
      cancelConnection: vi.fn().mockImplementation(() => {
        baseMock.isConnecting = false;
        baseMock.connectionStart = null;
      }),
      ...overrides
    };
    
    this.mocks.set('useCanvasSelection', baseMock);
    return baseMock;
  }
  
  // 获取所有Mock实例
  getAllMocks() {
    return Object.fromEntries(this.mocks);
  }
  
  // 重置所有Mock
  resetAllMocks() {
    this.mocks.forEach(mock => {
      if (typeof mock === 'object' && mock !== null) {
        Object.values(mock).forEach(fn => {
          if (vi.isMockFunction(fn)) {
            fn.mockClear();
          }
        });
      }
    });
  }
  
  // 清理所有Mock
  cleanup() {
    this.mocks.clear();
  }
}

// 4. 测试环境配置
export const testEnvironmentConfig = {
  // Jest配置优化
  jestConfig: {
    // 减少不必要的Mock
    clearMocks: true,
    restoreMocks: true,
    
    // 性能优化
    maxWorkers: '50%',
    testTimeout: 10000,
    
    // 覆盖率配置
    collectCoverageFrom: [
      'src/pages/marketing/tasks/**/*.{js,jsx}',
      '!src/pages/marketing/tasks/**/*.test.{js,jsx}',
      '!src/pages/marketing/tasks/**/fixtures/**',
      '!src/pages/marketing/tasks/**/mocks/**'
    ],
    coverageThreshold: {
      global: {
        branches: 95,
        functions: 95,
        lines: 95,
        statements: 95
      }
    }
  },
  
  // 测试数据管理
  testDataManagement: {
    useFixtures: true,
    generateRealData: true,
    cacheTestData: true,
    cleanupAfterTests: true
  }
};

// 5. Mock使用指南
export const mockUsageGuidelines = {
  // 什么时候使用Mock
  whenToMock: [
    '外部API调用',
    '浏览器特定API',
    '时间相关函数',
    '随机数生成',
    '文件系统操作',
    '网络请求'
  ],
  
  // 什么时候不使用Mock
  whenNotToMock: [
    '纯函数计算',
    '数据验证逻辑',
    '业务规则处理',
    '状态转换逻辑',
    '简单的工具函数'
  ],
  
  // 最佳实践
  bestPractices: [
    '优先使用真实实现',
    'Mock应该尽可能简单',
    '保持Mock与真实API的一致性',
    '定期检查Mock的有效性',
    '使用类型检查确保Mock正确性'
  ]
};

export default {
  minimalMockConfig,
  layeredMockStrategy,
  SmartMockFactory,
  testEnvironmentConfig,
  mockUsageGuidelines
};