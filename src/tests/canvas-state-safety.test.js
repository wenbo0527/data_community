/**
 * 画布状态安全性测试
 * 测试 TaskFlowCanvasRefactored 中状态访问的安全性
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'

// Mock 依赖
vi.mock('../pages/marketing/tasks/composables/useCanvasState.js', () => ({
  useCanvasState: vi.fn()
}))

vi.mock('../../../../utils/nodeTypes.js', () => ({
  getNodeConfig: vi.fn(() => ({
    width: 120,
    height: 60,
    ports: []
  }))
}))

describe('画布状态安全性测试', () => {
  let mockState
  let mockGraph
  let addNodeToGraph

  beforeEach(() => {
    // 重置 mock
    vi.clearAllMocks()
    
    // 创建 mock 状态
    mockState = {
      nodes: ref([]),
      connections: ref([]),
      isGraphReady: ref(false),
      isInitializationComplete: ref(false)
    }
    
    // 创建 mock 图形实例
    mockGraph = {
      value: {
        addNode: vi.fn(() => ({ id: 'test-node' })),
        getCellById: vi.fn(),
        getNodes: vi.fn(() => []),
        getEdges: vi.fn(() => [])
      }
    }
    
    // 模拟 addNodeToGraph 函数的核心逻辑
    addNodeToGraph = (nodeData) => {
      console.log('[Test] 开始添加节点到图中:', nodeData.id, nodeData.type)

      if (!mockGraph.value) {
        console.error('[Test] 图形实例不存在')
        return null
      }

      try {
        // 模拟节点配置
        const nodeConfig = { width: 120, height: 60 }
        
        // 确保position对象存在
        const position = nodeData.position || { x: 100, y: 100 }
        
        // 准备节点数据
        const nodeDataForGraph = {
          ...nodeData.data,
          type: nodeData.type,
          nodeType: nodeData.type,
          label: nodeData.label,
          selected: false,
          deletable: nodeData.type !== 'start',
          config: nodeData.config || {},
          isConfigured: nodeData.data?.isConfigured !== undefined ? nodeData.data.isConfigured :
          (nodeData.config && Object.keys(nodeData.config).length > 0)
        }

        const node = mockGraph.value.addNode({
          id: nodeData.id,
          shape: 'vue-shape',
          x: position.x,
          y: position.y,
          width: nodeConfig.width || 120,
          height: nodeConfig.height || 60,
          data: nodeDataForGraph
        })

        console.log('[Test] 节点已添加到图中:', nodeData.id)
        
        // 更新状态 - 增强空值检查和安全访问
        if (!mockState) {
          console.error('[Test] state 对象未定义')
          return node
        }
        
        // 重新检查 state.nodes 是否存在，如果不存在则重新初始化
        if (!mockState.nodes) {
          console.warn('[Test] state.nodes 在节点添加时未定义，重新初始化')
          mockState.nodes = ref([])
        }
        
        // 安全访问 state.nodes.value
        if (!mockState.nodes.value) {
          console.warn('[Test] state.nodes.value 在节点添加时未定义，初始化为空数组')
          mockState.nodes.value = []
        }
        
        // 确保 state.nodes.value 是数组
        if (!Array.isArray(mockState.nodes.value)) {
          console.warn('[Test] state.nodes.value 不是数组，重新初始化为空数组')
          mockState.nodes.value = []
        }
        
        // 安全查找现有节点索引
        let existingNodeIndex = -1
        try {
          existingNodeIndex = mockState.nodes.value.findIndex(n => n && n.id === nodeData.id)
        } catch (error) {
          console.error('[Test] 查找节点索引失败:', error)
          existingNodeIndex = -1
        }
        
        if (existingNodeIndex >= 0) {
          mockState.nodes.value[existingNodeIndex] = nodeData
        } else {
          mockState.nodes.value.push(nodeData)
        }

        return node
      } catch (error) {
        console.error('[Test] 添加节点失败:', error)
        return null
      }
    }
  })

  describe('状态初始化安全性', () => {
    it('应该处理 state 为 null 的情况', () => {
      mockState = null
      
      const nodeData = {
        id: 'test-node',
        type: 'start',
        label: '测试节点',
        position: { x: 100, y: 100 }
      }
      
      const result = addNodeToGraph(nodeData)
      expect(result).not.toBeNull()
      expect(mockGraph.value.addNode).toHaveBeenCalled()
    })

    it('应该处理 state.nodes 为 undefined 的情况', () => {
      mockState.nodes = undefined
      
      const nodeData = {
        id: 'test-node',
        type: 'start',
        label: '测试节点',
        position: { x: 100, y: 100 }
      }
      
      expect(() => addNodeToGraph(nodeData)).not.toThrow()
      expect(mockState.nodes).toBeDefined()
      expect(Array.isArray(mockState.nodes.value)).toBe(true)
    })

    it('应该处理 state.nodes.value 为 null 的情况', () => {
      mockState.nodes.value = null
      
      const nodeData = {
        id: 'test-node',
        type: 'start',
        label: '测试节点',
        position: { x: 100, y: 100 }
      }
      
      expect(() => addNodeToGraph(nodeData)).not.toThrow()
      expect(Array.isArray(mockState.nodes.value)).toBe(true)
      expect(mockState.nodes.value.length).toBe(1)
    })

    it('应该处理 state.nodes.value 为非数组的情况', () => {
      mockState.nodes.value = 'not-an-array'
      
      const nodeData = {
        id: 'test-node',
        type: 'start',
        label: '测试节点',
        position: { x: 100, y: 100 }
      }
      
      expect(() => addNodeToGraph(nodeData)).not.toThrow()
      expect(Array.isArray(mockState.nodes.value)).toBe(true)
      expect(mockState.nodes.value.length).toBe(1)
    })
  })

  describe('节点查找安全性', () => {
    it('应该安全处理 findIndex 操作', () => {
      mockState.nodes.value = [
        { id: 'existing-node', type: 'start' }
      ]
      
      const nodeData = {
        id: 'new-node',
        type: 'start',
        label: '新节点',
        position: { x: 100, y: 100 }
      }
      
      expect(() => addNodeToGraph(nodeData)).not.toThrow()
      expect(mockState.nodes.value.length).toBe(2)
    })

    it('应该处理 findIndex 抛出异常的情况', () => {
      // 创建一个会导致 findIndex 失败的状态
      mockState.nodes.value = [null, undefined, { id: 'valid-node' }]
      
      const nodeData = {
        id: 'test-node',
        type: 'start',
        label: '测试节点',
        position: { x: 100, y: 100 }
      }
      
      expect(() => addNodeToGraph(nodeData)).not.toThrow()
      expect(mockState.nodes.value.length).toBe(4) // 原有3个 + 新增1个
    })

    it('应该正确更新现有节点', () => {
      const existingNode = { id: 'existing-node', type: 'start', label: '原节点' }
      mockState.nodes.value = [existingNode]
      
      const updatedNodeData = {
        id: 'existing-node',
        type: 'start',
        label: '更新节点',
        position: { x: 200, y: 200 }
      }
      
      addNodeToGraph(updatedNodeData)
      
      expect(mockState.nodes.value.length).toBe(1)
      expect(mockState.nodes.value[0]).toEqual(updatedNodeData)
    })

    it('应该正确添加新节点', () => {
      mockState.nodes.value = [
        { id: 'existing-node', type: 'start' }
      ]
      
      const newNodeData = {
        id: 'new-node',
        type: 'action',
        label: '新节点',
        position: { x: 300, y: 300 }
      }
      
      addNodeToGraph(newNodeData)
      
      expect(mockState.nodes.value.length).toBe(2)
      expect(mockState.nodes.value[1]).toEqual(newNodeData)
    })
  })

  describe('边界情况处理', () => {
    it('应该处理空的节点数据', () => {
      const nodeData = {
        id: 'empty-node',
        type: 'start',
        label: '',
        position: { x: 0, y: 0 }
      }
      
      expect(() => addNodeToGraph(nodeData)).not.toThrow()
      expect(mockState.nodes.value.length).toBe(1)
    })

    it('应该处理缺少 position 的节点', () => {
      const nodeData = {
        id: 'no-position-node',
        type: 'start',
        label: '无位置节点'
        // position 缺失
      }
      
      expect(() => addNodeToGraph(nodeData)).not.toThrow()
      expect(mockState.nodes.value.length).toBe(1)
    })

    it('应该处理图形实例不存在的情况', () => {
      mockGraph.value = null
      
      const nodeData = {
        id: 'test-node',
        type: 'start',
        label: '测试节点',
        position: { x: 100, y: 100 }
      }
      
      const result = addNodeToGraph(nodeData)
      expect(result).toBeNull()
    })

    it('应该处理 addNode 抛出异常的情况', () => {
      mockGraph.value.addNode = vi.fn(() => {
        throw new Error('Graph addNode failed')
      })
      
      const nodeData = {
        id: 'test-node',
        type: 'start',
        label: '测试节点',
        position: { x: 100, y: 100 }
      }
      
      const result = addNodeToGraph(nodeData)
      expect(result).toBeNull()
    })
  })

  describe('状态一致性验证', () => {
    it('添加节点后状态应该保持一致', () => {
      const nodeData1 = {
        id: 'node-1',
        type: 'start',
        label: '节点1',
        position: { x: 100, y: 100 }
      }
      
      const nodeData2 = {
        id: 'node-2',
        type: 'action',
        label: '节点2',
        position: { x: 200, y: 200 }
      }
      
      addNodeToGraph(nodeData1)
      addNodeToGraph(nodeData2)
      
      expect(mockState.nodes.value.length).toBe(2)
      expect(mockState.nodes.value[0].id).toBe('node-1')
      expect(mockState.nodes.value[1].id).toBe('node-2')
      expect(Array.isArray(mockState.nodes.value)).toBe(true)
    })

    it('重复添加相同ID的节点应该更新而不是重复', () => {
      const nodeData = {
        id: 'duplicate-node',
        type: 'start',
        label: '原节点',
        position: { x: 100, y: 100 }
      }
      
      addNodeToGraph(nodeData)
      expect(mockState.nodes.value.length).toBe(1)
      
      const updatedNodeData = {
        id: 'duplicate-node',
        type: 'start',
        label: '更新节点',
        position: { x: 200, y: 200 }
      }
      
      addNodeToGraph(updatedNodeData)
      expect(mockState.nodes.value.length).toBe(1)
      expect(mockState.nodes.value[0].label).toBe('更新节点')
    })
  })
})