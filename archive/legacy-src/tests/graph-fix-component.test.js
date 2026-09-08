import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'

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
  createDownstreamNode: vi.fn(() => ({ node: { id: 'new-node' }, edge: { id: 'new-edge' } }))
}))

// 简化的WorkflowNode组件用于测试
const TestWorkflowNode = {
  props: ['node'],
  setup(props) {
    const { ref: vueRef, inject, watchEffect } = require('vue')
    const consoleLogger = require('../utils/consoleLogger.js')
    const { createDownstreamNode } = require('../utils/workflowNodeCreator.js')
    
    const graph = inject('graph', vueRef(null))
    const pendingOperations = vueRef([])
    
    // 监听graph实例变化，执行待处理的操作
    watchEffect(() => {
      if (graph?.value && pendingOperations.value.length > 0) {
        consoleLogger.info('[WorkflowNode] Graph实例已可用，执行待处理操作')
        const operations = [...pendingOperations.value]
        pendingOperations.value = []
        
        operations.forEach(operation => {
          operation()
        })
      }
    })
    
    const executeCreateDownstream = (type) => {
      try {
        consoleLogger.info('[WorkflowNode] 开始创建下游节点')
        const result = createDownstreamNode(props.node, type, graph.value)
        if (result.node && result.edge) {
          consoleLogger.info('[WorkflowNode] 成功创建下游节点:', result)
        } else {
          consoleLogger.warn('[WorkflowNode] 创建下游节点失败，结果:', result)
        }
        return result
      } catch (error) {
        consoleLogger.error('[WorkflowNode] 创建下游节点时发生错误:', error)
        throw error
      }
    }
    
    const createDownstream = (type) => {
      consoleLogger.group('[WorkflowNode] createDownstream函数执行')
      consoleLogger.info('目标节点类型:', type)
      consoleLogger.info('当前节点:', props.node?.id)
      
      // 检查graph实例是否可用
      if (!graph?.value) {
        consoleLogger.warn('[WorkflowNode] Graph实例尚未初始化，将操作加入待处理队列')
        
        // 将操作加入待处理队列
        pendingOperations.value.push(() => {
          consoleLogger.info('[WorkflowNode] 从队列执行createDownstream操作')
          executeCreateDownstream(type)
        })
        
        consoleLogger.groupEnd()
        return
      }
      
      executeCreateDownstream(type)
      consoleLogger.groupEnd()
    }
    
    return {
      createDownstream,
      pendingOperations
    }
  },
  template: '<div>Test Component</div>'
}

describe('Graph实例修复组件测试', () => {
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

  it('当graph实例为null时，应该将操作加入队列', async () => {
    const graphRef = ref(null)
    
    const wrapper = mount(TestWorkflowNode, {
      props: {
        node: mockNode
      },
      global: {
        provide: {
          graph: graphRef
        }
      }
    })

    const component = wrapper.vm
    
    // 调用createDownstream，此时graph为null
    component.createDownstream('data-processing')
    
    // 验证操作被加入队列
    expect(component.pendingOperations.length).toBe(1)
  })

  it('当graph实例变为可用时，应该执行队列中的操作', async () => {
    const graphRef = ref(null)
    
    const wrapper = mount(TestWorkflowNode, {
      props: {
        node: mockNode
      },
      global: {
        provide: {
          graph: graphRef
        }
      }
    })

    const component = wrapper.vm
    
    // 调用createDownstream，此时graph为null
    component.createDownstream('data-processing')
    
    // 验证操作被加入队列
    expect(component.pendingOperations.length).toBe(1)
    
    // 模拟graph初始化完成
    graphRef.value = mockGraph
    
    // 等待watchEffect执行
    await nextTick()
    
    // 验证队列被清空
    expect(component.pendingOperations.length).toBe(0)
  })
})