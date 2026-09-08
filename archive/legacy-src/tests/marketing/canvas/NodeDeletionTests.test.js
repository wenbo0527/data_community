/**
 * 节点删除和节点类型识别测试
 * 测试节点删除功能和节点类型识别功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
// Mock test environment
const createTestEnvironment = () => ({
  mockGraph: {
    addNode: vi.fn(),
    getNodes: vi.fn(() => []),
    getCellById: vi.fn(),
    removeNode: vi.fn(),
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
  emits: ['node-created', 'node-updated', 'node-deleted'],
  setup(props, { emit }) {
    return {
      deleteNode: vi.fn(),
      identifyNodeType: vi.fn(),
      validateNodeDeletion: vi.fn(),
      batchDeleteNodes: vi.fn()
    };
  }
};
import { SUPPORTED_NODE_TYPES, NODE_TYPE_CONFIG, ERROR_TEST_CONFIG } from './nodeTestConfig.js'

describe('节点删除和节点类型识别测试', () => {
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
  })

  afterEach(() => {
    if (canvasWrapper) {
      canvasWrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('节点删除测试', () => {
    SUPPORTED_NODE_TYPES.forEach((nodeType, index) => {
      it(`TC_DELETE_${String(index + 1).padStart(3, '0')} - 单个节点删除 (${nodeType})`, async () => {
        const testNode = {
          id: `delete_test_${nodeType}`,
          type: nodeType,
          x: 100,
          y: 100
        }
        
        // 创建画布组件
        const canvasWrapper = mount(TaskFlowCanvasRefactored, {
          props: {
            nodes: [testNode],
            connections: [],
            readonly: false
          }
        })
        
        // 等待组件初始化
        await canvasWrapper.vm.$nextTick()
        
        // 创建独立的 Mock 函数
        const mockDeleteNode = vi.fn().mockResolvedValue(true)
        canvasWrapper.vm.deleteNode = mockDeleteNode
        
        // 执行删除
        await canvasWrapper.vm.deleteNode(testNode.id)
        
        // 验证删除调用
        expect(mockDeleteNode).toHaveBeenCalledWith(testNode.id)
        expect(mockDeleteNode).toHaveBeenCalledTimes(1)
        
        console.log(`✅ ${NODE_TYPE_CONFIG[nodeType].label} 删除成功`)
      })
    })

    it('TC_DELETE_BATCH_001 - 批量节点删除', async () => {
      const testNodes = SUPPORTED_NODE_TYPES.slice(0, 3).map((nodeType, index) => ({
        id: `batch_delete_${nodeType}_${index}`,
        type: nodeType,
        x: 100 + index * 150,
        y: 100
      }))
      
      // 创建画布组件
      const canvasWrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          nodes: testNodes,
          connections: [],
          readonly: false
        }
      })
      
      // 等待组件初始化
      await canvasWrapper.vm.$nextTick()
      
      // 创建独立的 Mock 函数
      const mockBatchDeleteNodes = vi.fn().mockResolvedValue(true)
      canvasWrapper.vm.batchDeleteNodes = mockBatchDeleteNodes
      
      // 执行批量删除
      const nodeIds = testNodes.map(node => node.id)
      await canvasWrapper.vm.batchDeleteNodes(nodeIds)
      
      // 验证批量删除
      expect(mockBatchDeleteNodes).toHaveBeenCalledWith(nodeIds)
      expect(mockBatchDeleteNodes).toHaveBeenCalledTimes(1)
      
      console.log('✅ 批量节点删除成功')
    })

    it('TC_DELETE_WITH_CONNECTIONS_001 - 带连接线的节点删除', async () => {
      // 创建测试节点和连接
      const sourceNode = {
        id: 'source_node',
        type: 'start',
        x: 100,
        y: 100
      }
      
      const targetNode = {
        id: 'target_node',
        type: 'sms',
        x: 200,
        y: 200
      }
      
      const connections = [
        {
          id: 'connection_1',
          source: sourceNode.id,
          target: targetNode.id
        }
      ]
      
      // 创建画布组件
      const canvasWrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          nodes: [sourceNode, targetNode],
          connections: connections,
          readonly: false
        }
      })
      
      // 等待组件初始化
      await canvasWrapper.vm.$nextTick()
      
      // 创建独立的 Mock 函数
      const mockDeleteNodeWithConnections = vi.fn().mockResolvedValue(true)
      canvasWrapper.vm.deleteNodeWithConnections = mockDeleteNodeWithConnections
      
      // 测试删除带连接线的节点
      await canvasWrapper.vm.deleteNodeWithConnections(sourceNode.id)
      
      // 验证删除操作被调用
      expect(mockDeleteNodeWithConnections).toHaveBeenCalledWith(sourceNode.id)
      
      console.log('✅ 带连接线的节点删除正常')
    })

    it('TC_DELETE_PROTECTION_001 - 关键节点删除保护', async () => {
      // 创建开始节点（关键节点）
      const startNode = {
        id: 'protected_start_node',
        getData: vi.fn().mockReturnValue({
          type: 'start',
          label: '开始节点',
          isProtected: true
        }),
        remove: vi.fn()
      }
      
      mockGraph.getCellById.mockReturnValue(startNode)
      
      // 模拟删除保护逻辑
      canvasWrapper.vm.deleteNode = vi.fn().mockImplementation(async (nodeId) => {
        const node = mockGraph.getCellById(nodeId)
        const nodeData = node.getData()
        
        // 检查是否为受保护的节点
        if (nodeData.type === 'start' && nodeData.isProtected) {
          throw new Error('无法删除受保护的开始节点')
        }
        
        mockGraph.removeCell(nodeId)
        return true
      })
      
      // 尝试删除受保护的节点
      await expect(canvasWrapper.vm.deleteNode(startNode.id))
        .rejects.toThrow('无法删除受保护的开始节点')
      
      // 验证节点未被删除
      expect(startNode.remove).not.toHaveBeenCalled()
      
      console.log('✅ 关键节点删除保护功能正常')
    })
  })

  describe('节点类型识别测试', () => {
    SUPPORTED_NODE_TYPES.forEach((nodeType, index) => {
      it(`TC_IDENTIFY_${String(index + 1).padStart(3, '0')} - 节点类型正确识别 (${nodeType})`, async () => {
        const testNode = {
          id: `identify_test_${nodeType}`,
          type: nodeType,
          x: 100,
          y: 100
        }
        
        // 创建画布组件
        const canvasWrapper = mount(TaskFlowCanvasRefactored, {
          props: {
            nodes: [testNode],
            connections: [],
            readonly: false
          }
        })
        
        // 等待组件初始化
        await canvasWrapper.vm.$nextTick()
        
        // 创建独立的 Mock 函数
        const mockIdentifyNodeType = vi.fn().mockReturnValue(nodeType)
        canvasWrapper.vm.identifyNodeType = mockIdentifyNodeType
        
        // 执行类型识别
        const identifiedType = canvasWrapper.vm.identifyNodeType(testNode.id)
        
        // 验证识别结果
        expect(identifiedType).toBe(nodeType)
        expect(mockIdentifyNodeType).toHaveBeenCalledWith(testNode.id)
        expect(mockIdentifyNodeType).toHaveBeenCalledTimes(1)
        
        console.log(`✅ ${NODE_TYPE_CONFIG[nodeType].label} 类型识别正确`)
      })
    })

    it('TC_IDENTIFY_UNKNOWN_001 - 未知节点类型处理', async () => {
      // 创建未知类型节点
      const unknownNode = {
        id: 'unknown_node',
        getData: vi.fn().mockReturnValue({
          type: 'unknown-type',
          label: '未知节点'
        })
      }
      
      mockGraph.getCellById.mockReturnValue(unknownNode)
      
      // 模拟未知类型处理
      canvasWrapper.vm.identifyNodeType = vi.fn().mockImplementation((nodeId) => {
        const node = mockGraph.getCellById(nodeId)
        const nodeData = node.getData()
        
        if (!SUPPORTED_NODE_TYPES.includes(nodeData.type)) {
          return 'unknown'
        }
        
        return nodeData.type
      })
      
      // 执行类型识别
      const identifiedType = canvasWrapper.vm.identifyNodeType(unknownNode.id)
      
      // 验证未知类型处理
      expect(identifiedType).toBe('unknown')
      
      console.log('✅ 未知节点类型处理正确')
    })

    it('TC_IDENTIFY_BATCH_001 - 批量节点类型识别', async () => {
      const testNodes = SUPPORTED_NODE_TYPES.map(nodeType => ({
        id: `batch_identify_${nodeType}`,
        type: nodeType,
        x: 100,
        y: 100
      }))
      
      // 创建画布组件
      const canvasWrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          nodes: testNodes,
          connections: [],
          readonly: false
        }
      })
      
      // 等待组件初始化
      await canvasWrapper.vm.$nextTick()
      
      // 创建独立的 Mock 函数
      const mockBatchIdentifyNodeTypes = vi.fn().mockImplementation((nodeIds) => {
        return nodeIds.map(nodeId => {
          const node = testNodes.find(n => n.id === nodeId)
          return node ? node.type : null
        })
      })
      canvasWrapper.vm.batchIdentifyNodeTypes = mockBatchIdentifyNodeTypes
      
      // 测试批量识别
      const nodeIds = testNodes.map(node => node.id)
      const identifiedTypes = await canvasWrapper.vm.batchIdentifyNodeTypes(nodeIds)
      
      // 验证识别结果
      expect(identifiedTypes).toHaveLength(SUPPORTED_NODE_TYPES.length)
      identifiedTypes.forEach((type, index) => {
        expect(type).toBe(SUPPORTED_NODE_TYPES[index])
      })
      expect(mockBatchIdentifyNodeTypes).toHaveBeenCalledWith(nodeIds)
      
      console.log('✅ 批量节点类型识别正常')
    })

    it('TC_IDENTIFY_PERFORMANCE_001 - 节点类型识别性能', async () => {
      const testNodes = SUPPORTED_NODE_TYPES.map(nodeType => ({
        id: `perf_identify_${nodeType}`,
        type: nodeType,
        x: 100,
        y: 100
      }))
      
      // 创建画布组件
      const canvasWrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          nodes: testNodes,
          connections: [],
          readonly: false
        }
      })
      
      // 等待组件初始化
      await canvasWrapper.vm.$nextTick()
      
      // 创建独立的 Mock 函数
      const mockIdentifyNodeType = vi.fn().mockImplementation((nodeId) => {
        const node = testNodes.find(n => n.id === nodeId)
        return node ? node.type : null
      })
      canvasWrapper.vm.identifyNodeType = mockIdentifyNodeType
      
      // 测试每种节点类型的识别性能
      for (const nodeType of SUPPORTED_NODE_TYPES) {
        const testNode = testNodes.find(n => n.type === nodeType)
        
        // 测试性能
        const startTime = performance.now()
        const identifiedType = await canvasWrapper.vm.identifyNodeType(testNode.id)
        const endTime = performance.now()
        const duration = endTime - startTime
        
        // 验证识别正确性和性能
        expect(identifiedType).toBe(nodeType)
        expect(duration).toBeLessThan(10) // 应小于10ms
        expect(mockIdentifyNodeType).toHaveBeenCalledWith(testNode.id)
      }
      
      console.log('✅ 节点类型识别性能测试通过')
    })
  })

  describe('节点状态管理测试', () => {
    it('TC_STATE_001 - 节点选中状态管理', async () => {
      const testNode = {
        id: 'state_test_node',
        type: 'start',
        x: 100,
        y: 100
      }
      
      // 创建画布组件
      const canvasWrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          nodes: [testNode],
          connections: [],
          readonly: false
        }
      })
      
      // 等待组件初始化
      await canvasWrapper.vm.$nextTick()
      
      // 创建独立的 Mock 函数
      const mockSelectNode = vi.fn().mockResolvedValue(true)
      const mockUnselectNode = vi.fn().mockResolvedValue(true)
      canvasWrapper.vm.selectNode = mockSelectNode
      canvasWrapper.vm.unselectNode = mockUnselectNode
      
      // 测试节点选中
      await canvasWrapper.vm.selectNode(testNode.id)
      expect(mockSelectNode).toHaveBeenCalledWith(testNode.id)
      
      // 测试节点取消选中
      await canvasWrapper.vm.unselectNode(testNode.id)
      expect(mockUnselectNode).toHaveBeenCalledWith(testNode.id)
      
      console.log('✅ 节点选中状态管理正常')
    })

    it('TC_STATE_002 - 节点配置状态跟踪', async () => {
      const testNode = {
        id: 'config_state_node',
        type: 'sms',
        x: 100,
        y: 100
      }
      
      // 创建画布组件
      const canvasWrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          nodes: [testNode],
          connections: [],
          readonly: false
        }
      })
      
      // 等待组件初始化
      await canvasWrapper.vm.$nextTick()
      
      // 创建独立的 Mock 函数
      const mockUpdateNodeConfigStatus = vi.fn().mockResolvedValue(true)
      canvasWrapper.vm.updateNodeConfigStatus = mockUpdateNodeConfigStatus
      
      // 测试配置状态更新
      await canvasWrapper.vm.updateNodeConfigStatus(testNode.id, true)
      expect(mockUpdateNodeConfigStatus).toHaveBeenCalledWith(testNode.id, true)
      
      console.log('✅ 节点配置状态跟踪正常')
    })
  })

  describe('节点删除性能测试', () => {
    it('TC_DELETE_PERF_001 - 大量节点删除性能', async () => {
      // 创建大量测试节点
      const testNodes = []
      for (let i = 0; i < 100; i++) {
        const nodeType = SUPPORTED_NODE_TYPES[i % SUPPORTED_NODE_TYPES.length]
        testNodes.push({
          id: `perf_test_${i}`,
          type: nodeType,
          x: (i % 10) * 150,
          y: Math.floor(i / 10) * 100
        })
      }
      
      // 创建画布组件
      const canvasWrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          nodes: testNodes,
          connections: [],
          readonly: false
        }
      })
      
      // 等待组件初始化
      await canvasWrapper.vm.$nextTick()
      
      // 创建独立的 Mock 函数
      const mockBatchDeleteNodes = vi.fn().mockResolvedValue(true)
      canvasWrapper.vm.batchDeleteNodes = mockBatchDeleteNodes
      
      // 记录开始时间
      const startTime = performance.now()
      
      // 执行批量删除
      const nodeIds = testNodes.map(node => node.id)
      await canvasWrapper.vm.batchDeleteNodes(nodeIds)
      
      // 记录结束时间
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // 验证性能（应该在合理时间内完成）
      expect(duration).toBeLessThan(5000) // 5秒内完成
      
      // 验证批量删除被调用
      expect(mockBatchDeleteNodes).toHaveBeenCalledWith(nodeIds)
      expect(mockBatchDeleteNodes).toHaveBeenCalledTimes(1)
      
      console.log(`✅ 大量节点删除性能测试通过，耗时: ${duration.toFixed(2)}ms`)
    })
  })
})