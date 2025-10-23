import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import WorkflowNode from '../components/workflow/WorkflowNode.vue'
import { createMockGraph, createMockNode, createTestEnvironment } from './utils/mockFactory.js'

// Mock console logger
vi.mock('../utils/consoleLogger.js', () => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  group: vi.fn(),
  groupEnd: vi.fn()
}))

// Mock workflowNodeCreator
vi.mock('../utils/workflowNodeCreator.js', () => ({
  createDownstreamNode: vi.fn(() => ({ node: {}, edge: {} }))
}))

describe('Graph实例修复测试', () => {
  let testEnv
  let mockGraph
  let mockNode
  
  beforeEach(() => {
    // 使用标准化测试环境
    testEnv = createTestEnvironment({
      enableCanvas: true,
      enableGraph: true
    })
    
    mockGraph = testEnv.mockGraph
    mockNode = createMockNode('test-node', 'data-source')
  })

  afterEach(() => {
    testEnv.cleanup()
  })

  it('当graph实例可用时，应该正常创建下游节点', async () => {
    const graphRef = ref(mockGraph)
    
    const wrapper = mount(WorkflowNode, {
      props: {
        node: mockNode
      },
      global: {
        provide: {
          graph: graphRef,
          selectedNodeId: ref(null),
          setSelectedNode: vi.fn()
        }
      }
    })

    const component = wrapper.vm
    
    // 调用createDownstream，此时graph可用
    component.createDownstream('data-processing')
    
    // 验证没有抛出错误
    expect(wrapper.exists()).toBe(true)
  })

  it('Graph实例应该具备基本功能', () => {
    expect(mockGraph).toBeDefined()
    expect(typeof mockGraph.addNode).toBe('function')
    expect(typeof mockGraph.addEdge).toBe('function')
    expect(typeof mockGraph.getCellById).toBe('function')
  })

  it('应该能够正确获取节点数据', () => {
    mockGraph.getCellById.mockReturnValue(mockNode)
    
    const retrievedNode = mockGraph.getCellById('test-node')
    expect(retrievedNode).toBe(mockNode)
    expect(retrievedNode.getData().type).toBe('data-source')
  })
})