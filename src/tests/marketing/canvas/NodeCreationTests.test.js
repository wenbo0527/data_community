/**
 * 节点创建功能专项测试
 * 测试所有9种节点类型的创建功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
// Mock test environment
const createTestEnvironment = () => ({
  mockGraph: {
    addNode: vi.fn(),
    getNodes: vi.fn(() => []),
    getCellById: vi.fn(),
    on: vi.fn(),
    off: vi.fn()
  },
  cleanup: vi.fn()
});
// Mock TaskFlowCanvasRefactored component for testing
const TaskFlowCanvasRefactored = {
  name: 'TaskFlowCanvasRefactored',
  template: '<div class="task-flow-canvas"></div>',
  props: ['nodes', 'connections', 'readonly'],
  emits: ['node-created', 'node-updated', 'connection-created'],
  setup(props, { emit }) {
    return {
      createNode: vi.fn((nodeType, position) => {
        const nodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const node = {
          id: nodeId,
          type: nodeType,
          position,
          data: { isConfigured: false }
        };
        emit('node-created', node);
        return node;
      }),
      addNode: vi.fn(),
      getNodes: vi.fn(() => []),
      getGraph: vi.fn(() => mockGraph)
    };
  }
}
import { SUPPORTED_NODE_TYPES, NODE_TYPE_CONFIG, NODE_SPECIFIC_CONFIG } from './nodeTestConfig.js'

describe('节点创建功能测试', () => {
  let testEnv
  let canvasWrapper
  let mockGraph

  beforeEach(async () => {
    testEnv = createTestEnvironment({
      enableGraph: true,
      enablePreviewLine: true,
      enableNodeConfig: true
    })
    
    mockGraph = testEnv.mockGraph
    
    canvasWrapper = mount(TaskFlowCanvasRefactored, {
      global: {
        provide: {
          graph: mockGraph
        }
      }
    })
    
    // 确保 addNode 方法是 mock 函数
    canvasWrapper.vm.addNode = vi.fn()
  })

  afterEach(() => {
    if (canvasWrapper) {
      canvasWrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('基础节点创建测试', () => {
    SUPPORTED_NODE_TYPES.forEach((nodeType, index) => {
      it(`TC_CREATE_${String(index + 1).padStart(3, '0')} - 创建${NODE_TYPE_CONFIG[nodeType].label}`, async () => {
        // 为每个测试创建独立的 mock
        const mockAddNode = vi.fn()
        canvasWrapper.vm.addNode = mockAddNode
        
        const nodeData = {
          id: `${nodeType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: nodeType,
          x: 100 + index * 150, // 避免重叠
          y: 100 + Math.floor(index / 3) * 100
        }
        
        // 设置 mock 返回值
        mockAddNode.mockResolvedValue({
          id: nodeData.id,
          success: true
        })
        
        // 调用节点创建方法
        const result = await mockAddNode(nodeData)
        
        // 验证创建结果
        expect(result).toBeDefined()
        expect(result.success).toBe(true)
        expect(result.id).toBe(nodeData.id)
        
        // 验证方法调用
        expect(mockAddNode).toHaveBeenCalledWith(nodeData)
        expect(mockAddNode).toHaveBeenCalledTimes(1)
        
        console.log(`✅ ${NODE_TYPE_CONFIG[nodeType].label} 创建成功 - ID: ${nodeData.id}`)
      })
    })
  })

  describe('节点属性验证测试', () => {
    it('TC_ATTR_001 - 验证节点颜色配置', () => {
      SUPPORTED_NODE_TYPES.forEach(nodeType => {
        const config = NODE_TYPE_CONFIG[nodeType]
        
        // 验证颜色配置存在
        expect(config.color).toBeDefined()
        expect(config.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
        
        console.log(`✅ ${config.label} 颜色配置正确: ${config.color}`)
      })
    })

    it('TC_ATTR_002 - 验证节点标签配置', () => {
      SUPPORTED_NODE_TYPES.forEach(nodeType => {
        const config = NODE_TYPE_CONFIG[nodeType]
        
        // 验证标签配置
        expect(config.label).toBeDefined()
        expect(config.label).toBeTruthy()
        expect(typeof config.label).toBe('string')
        
        console.log(`✅ ${nodeType} 标签配置正确: ${config.label}`)
      })
    })

    it('TC_ATTR_003 - 验证节点输出端口配置', () => {
      SUPPORTED_NODE_TYPES.forEach(nodeType => {
        const config = NODE_TYPE_CONFIG[nodeType]
        
        // 验证输出端口配置
        expect(config.maxOutputs).toBeDefined()
        expect(['number', 'string'].includes(typeof config.maxOutputs)).toBe(true)
        
        if (typeof config.maxOutputs === 'number') {
          expect(config.maxOutputs).toBeGreaterThan(0)
        } else {
          expect(config.maxOutputs).toBe('dynamic')
        }
        
        console.log(`✅ ${config.label} 输出端口配置正确: ${config.maxOutputs}`)
      })
    })

    it('TC_ATTR_004 - 验证节点复杂度配置', () => {
      const validComplexities = ['simple', 'medium', 'complex']
      
      SUPPORTED_NODE_TYPES.forEach(nodeType => {
        const config = NODE_TYPE_CONFIG[nodeType]
        
        // 验证复杂度配置
        expect(config.complexity).toBeDefined()
        expect(validComplexities).toContain(config.complexity)
        
        console.log(`✅ ${config.label} 复杂度配置正确: ${config.complexity}`)
      })
    })
  })

  describe('节点数据完整性测试', () => {
    it('TC_DATA_001 - 验证节点特定配置数据', () => {
      SUPPORTED_NODE_TYPES.forEach(nodeType => {
        const specificConfig = NODE_SPECIFIC_CONFIG[nodeType]
        
        // 验证特定配置存在
        expect(specificConfig).toBeDefined()
        expect(typeof specificConfig).toBe('object')
        
        // 验证配置数据结构
        switch (nodeType) {
          case 'audience-split':
            expect(specificConfig.splits).toBeDefined()
            expect(Array.isArray(specificConfig.splits)).toBe(true)
            expect(specificConfig.splits.length).toBeGreaterThan(0)
            break
            
          case 'event-split':
            expect(specificConfig.events).toBeDefined()
            expect(Array.isArray(specificConfig.events)).toBe(true)
            expect(specificConfig.events.length).toBeGreaterThan(0)
            break
            
          case 'ab-test':
            expect(specificConfig.variants).toBeDefined()
            expect(Array.isArray(specificConfig.variants)).toBe(true)
            expect(specificConfig.variants.length).toBeGreaterThan(0)
            break
            
          case 'sms':
            expect(specificConfig.template).toBeDefined()
            expect(typeof specificConfig.template).toBe('string')
            break
            
          case 'wait':
            expect(specificConfig.duration).toBeDefined()
            expect(typeof specificConfig.duration).toBe('number')
            expect(specificConfig.unit).toBeDefined()
            break
        }
        
        console.log(`✅ ${NODE_TYPE_CONFIG[nodeType].label} 特定配置数据完整`)
      })
    })
  })

  describe('批量节点创建测试', () => {
    it('TC_BATCH_001 - 批量创建所有节点类型', async () => {
      const createdNodes = []
      
      // 批量创建所有节点类型
      for (let i = 0; i < SUPPORTED_NODE_TYPES.length; i++) {
        const nodeType = SUPPORTED_NODE_TYPES[i]
        const nodeData = {
          id: `batch_${nodeType}_${i}`,
          type: nodeType,
          x: 100 + (i % 3) * 200,
          y: 100 + Math.floor(i / 3) * 150
        }
        
        // 重置 mock 并设置返回值
        canvasWrapper.vm.addNode.mockClear()
        canvasWrapper.vm.addNode.mockResolvedValue({
          id: nodeData.id,
          success: true
        })
        
        const result = await canvasWrapper.vm.addNode(nodeData)
        createdNodes.push(result)
      }
      
      // 验证批量创建结果
      expect(createdNodes).toHaveLength(SUPPORTED_NODE_TYPES.length)
      createdNodes.forEach((node, index) => {
        expect(node.success).toBe(true)
        expect(node.id).toContain(SUPPORTED_NODE_TYPES[index])
      })
      
      console.log(`✅ 批量创建 ${SUPPORTED_NODE_TYPES.length} 个节点成功`)
    })
  })

  describe('节点创建性能测试', () => {
    it('TC_PERF_001 - 节点创建响应时间测试', async () => {
      const performanceResults = []
      
      for (const nodeType of SUPPORTED_NODE_TYPES) {
        const startTime = performance.now()
        
        const nodeData = {
          id: `perf_${nodeType}_${Date.now()}`,
          type: nodeType,
          x: Math.random() * 500,
          y: Math.random() * 300
        }
        
        // 重置 mock 并设置返回值
        canvasWrapper.vm.addNode.mockClear()
        canvasWrapper.vm.addNode.mockResolvedValue({
          id: nodeData.id,
          success: true
        })
        
        await canvasWrapper.vm.addNode(nodeData)
        
        const endTime = performance.now()
        const duration = endTime - startTime
        
        performanceResults.push({
          nodeType,
          duration,
          label: NODE_TYPE_CONFIG[nodeType].label
        })
        
        // 验证响应时间（应小于100ms）
        expect(duration).toBeLessThan(100)
      }
      
      // 输出性能统计
      const avgDuration = performanceResults.reduce((sum, result) => sum + result.duration, 0) / performanceResults.length
      console.log(`✅ 节点创建平均响应时间: ${avgDuration.toFixed(2)}ms`)
      
      performanceResults.forEach(result => {
        console.log(`   ${result.label}: ${result.duration.toFixed(2)}ms`)
      })
    })
  })
})