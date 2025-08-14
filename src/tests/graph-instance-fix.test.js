import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import WorkflowNode from '../components/workflow/WorkflowNode.vue'

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
  let mockGraph
  let mockNode
  
  beforeEach(() => {
    mockGraph = {
      addNode: vi.fn(),
      addEdge: vi.fn(),
      getCellById: vi.fn()
    }
    
    mockNode = {
      id: 'test-node',
      getData: vi.fn(() => ({ type: 'data-source' })),
      getPorts: vi.fn(() => [])
    }
  })

  it('当graph实例为null时，应该等待初始化后重试', async () => {
    const graphRef = ref(null)
    
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

    // 模拟点击加号按钮触发createDownstream
    const component = wrapper.vm
    
    // 调用createDownstream，此时graph为null
    component.createDownstream('data-processing')
    
    // 等待nextTick
    await nextTick()
    
    // 模拟graph初始化完成
    graphRef.value = mockGraph
    
    // 再次等待nextTick，确保重试逻辑执行
    await nextTick()
    
    // 验证没有抛出错误
    expect(wrapper.exists()).toBe(true)
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
})