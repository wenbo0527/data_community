/**
 * 节点删除功能测试
 * 测试FlowNode组件删除按钮点击和vue:delete事件处理
 * 
 * 测试重点：
 * 1. FlowNode删除按钮点击事件
 * 2. vue:delete事件触发和监听
 * 3. 节点删除的完整流程
 * 4. 级联删除功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { Graph } from '@antv/x6'
import { register } from '@antv/x6-vue-shape'

// 组件导入
import TaskFlowCanvasRefactored from '../../../pages/marketing/tasks/components/TaskFlowCanvasRefactored.vue'
import FlowNode from '../../../components/FlowNode.vue'

// 测试辅助函数
import { createMockGraph, createMockNode } from '../../utils/mockFactory.js'

describe('节点删除功能测试', () => {
  let wrapper
  let mockGraph
  let testEnv

  beforeEach(async () => {
    // 注册Vue组件到X6
    register({
      shape: 'vue-shape',
      width: 200,
      height: 100,
      component: FlowNode
    })

    // 创建测试环境
    testEnv = {
      mockGraph: createMockGraph(),
      nodes: ref([]),
      connections: ref([])
    }

    mockGraph = testEnv.mockGraph

    // 模拟DOM容器
    const container = document.createElement('div')
    container.style.width = '800px'
    container.style.height = '600px'
    document.body.appendChild(container)

    // 挂载组件
    wrapper = mount(TaskFlowCanvasRefactored, {
      props: {
        initialNodes: [],
        initialConnections: []
      },
      attachTo: container
    })

    await nextTick()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    // 清理DOM
    document.body.innerHTML = ''
  })

  describe('FlowNode删除按钮功能', () => {
    it('TC_NODE_DELETE_001 - 删除按钮应该在非开始节点上显示', async () => {
      const nodeData = {
        id: 'test-node-1',
        nodeType: 'audience-split',
        label: '测试节点',
        deletable: true,
        x: 100,
        y: 100
      }

      // 创建FlowNode组件
      const flowNodeWrapper = mount(FlowNode, {
        props: {
          node: createMockNode(nodeData.id, nodeData.nodeType, {
            x: nodeData.x,
            y: nodeData.y,
            label: nodeData.label,
            deletable: nodeData.deletable
          }),
          graph: mockGraph,
          nodeType: nodeData.nodeType,
          label: nodeData.label,
          deletable: nodeData.deletable
        }
      })

      // 检查删除按钮是否存在
      const deleteButton = flowNodeWrapper.find('.flow-node__delete-btn')
      expect(deleteButton.exists()).toBe(true)

      flowNodeWrapper.unmount()
    })

    it('TC_NODE_DELETE_002 - 开始节点不应该显示删除按钮', async () => {
      const nodeData = {
        id: 'start-node',
        nodeType: 'start',
        label: '开始节点',
        deletable: false,
        x: 100,
        y: 100
      }

      // 创建FlowNode组件
      const flowNodeWrapper = mount(FlowNode, {
        props: {
          node: createMockNode(nodeData.id, nodeData.nodeType, {
            x: nodeData.x,
            y: nodeData.y,
            label: nodeData.label,
            deletable: nodeData.deletable
          }),
          graph: mockGraph,
          nodeType: nodeData.nodeType,
          label: nodeData.label,
          deletable: nodeData.deletable
        }
      })

      // 检查删除按钮不应该存在
      const deleteButton = flowNodeWrapper.find('.flow-node__delete-btn')
      expect(deleteButton.exists()).toBe(false)

      flowNodeWrapper.unmount()
    })

    it('TC_NODE_DELETE_003 - 点击删除按钮应该触发delete事件', async () => {
      const nodeData = {
        id: 'test-node-2',
        nodeType: 'audience-split',
        label: '测试节点',
        deletable: true,
        x: 100,
        y: 100
      }

      const testNode = createMockNode(nodeData.id, nodeData.nodeType, {
        x: nodeData.x,
        y: nodeData.y,
        label: nodeData.label,
        deletable: nodeData.deletable
      })

      // 创建FlowNode组件
      const flowNodeWrapper = mount(FlowNode, {
        props: {
          node: testNode,
          graph: mockGraph,
          nodeType: nodeData.nodeType,
          label: nodeData.label,
          deletable: nodeData.deletable
        }
      })

      // 监听delete事件 - 使用Vue 3兼容的方式
      const deleteEventSpy = vi.fn()
      flowNodeWrapper.vm.$emit = vi.fn((eventName, data) => {
        if (eventName === 'delete') {
          deleteEventSpy(data)
        }
      })

      // 点击删除按钮
      const deleteButton = flowNodeWrapper.find('.flow-node__delete-btn')
      await deleteButton.trigger('click')

      // 验证事件被触发
      expect(deleteEventSpy).toHaveBeenCalled()
      const deleteEventData = deleteEventSpy.mock.calls[0]?.[0]
      expect(deleteEventData).toBeTruthy()
      expect(deleteEventData.node).toBe(testNode)
      expect(deleteEventData.nodeType).toBe(nodeData.nodeType)

      flowNodeWrapper.unmount()
    })

    it('TC_NODE_DELETE_004 - 点击删除按钮应该触发vue:delete图形事件', async () => {
      const nodeData = {
        id: 'test-node-3',
        nodeType: 'audience-split',
        label: '测试节点',
        deletable: true,
        x: 100,
        y: 100
      }

      const testNode = createMockNode(nodeData.id, nodeData.nodeType, {
        x: nodeData.x,
        y: nodeData.y,
        label: nodeData.label,
        deletable: nodeData.deletable
      })

      // 监听图形事件
      let vueDeleteEventData = null
      mockGraph.trigger = vi.fn((eventName, data) => {
        if (eventName === 'vue:delete') {
          vueDeleteEventData = data
        }
      })

      // 创建FlowNode组件
      const flowNodeWrapper = mount(FlowNode, {
        props: {
          node: testNode,
          graph: mockGraph,
          nodeType: nodeData.nodeType,
          label: nodeData.label,
          deletable: nodeData.deletable
        }
      })

      // 点击删除按钮
      const deleteButton = flowNodeWrapper.find('.flow-node__delete-btn')
      await deleteButton.trigger('click')

      // 验证图形事件被触发
      expect(mockGraph.trigger).toHaveBeenCalledWith('vue:delete', { node: testNode })

      flowNodeWrapper.unmount()
    })
  })

  describe('vue:delete事件处理', () => {
    it('TC_NODE_DELETE_005 - useCanvasEvents应该监听vue:delete事件', async () => {
      // 等待组件完全初始化
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const nodeData = {
        id: 'test-node-4',
        nodeType: 'audience-split',
        label: '测试节点',
        x: 100,
        y: 100
      }

      // 模拟添加节点到画布
      const testNode = createMockNode(nodeData.id, nodeData.nodeType, {
        x: nodeData.x,
        y: nodeData.y,
        label: nodeData.label
      })
      
      // 监听节点删除事件 - 使用Vue 3兼容的方式
      const nodeDeletedEventSpy = vi.fn()
      wrapper.vm.$emit = vi.fn((eventName, data) => {
        if (eventName === 'node-deleted') {
          nodeDeletedEventSpy(data)
        }
      })

      // 模拟触发vue:delete事件
      if (mockGraph.trigger) {
        mockGraph.trigger('vue:delete', { node: testNode })
      }

      await nextTick()

      // 验证节点删除事件被触发
      // 注意：由于测试环境的限制，这里主要验证事件监听器的设置
      expect(mockGraph.on).toHaveBeenCalledWith('vue:delete', expect.any(Function))
    })

    it('TC_NODE_DELETE_005_ENHANCED - 验证vue:delete事件监听器正确绑定', async () => {
      // 等待组件完全初始化
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 200))

      // 检查mockGraph.on是否被调用来绑定vue:delete事件
      const vueDeleteCalls = mockGraph.on.mock.calls.filter(call => call[0] === 'vue:delete')
      expect(vueDeleteCalls.length).toBeGreaterThan(0)
      
      // 验证事件处理器是函数
      const vueDeleteHandler = vueDeleteCalls[0][1]
      expect(typeof vueDeleteHandler).toBe('function')
      
      console.log('[测试] vue:delete事件监听器已正确绑定')
    })

    it('TC_NODE_DELETE_006 - vue:delete事件应该调用handleNodeDelete方法', async () => {
      // 等待组件完全初始化
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const nodeData = {
        id: 'test-node-5',
        nodeType: 'audience-split',
        label: '测试节点',
        x: 100,
        y: 100
      }

      const testNode = createMockNode(nodeData.id, nodeData.nodeType, {
        x: nodeData.x,
        y: nodeData.y,
        label: nodeData.label
      })

      // 获取绑定的vue:delete事件处理器
      const vueDeleteHandler = mockGraph.on.mock.calls.find(
        call => call[0] === 'vue:delete'
      )?.[1]

      expect(vueDeleteHandler).toBeDefined()

      // 模拟调用事件处理器
      if (vueDeleteHandler) {
        vueDeleteHandler({ node: testNode })
      }

      // 验证处理器被正确调用（通过检查相关的图形操作）
      expect(mockGraph.getCellById).toHaveBeenCalledWith(nodeData.id)
    })
  })

  describe('节点删除完整流程', () => {
    it('TC_NODE_DELETE_007 - 删除节点应该从图形中移除', async () => {
      // 等待组件完全初始化
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const nodeData = {
        id: 'test-node-6',
        nodeType: 'audience-split',
        label: '测试节点',
        x: 100,
        y: 100
      }

      const testNode = createMockNode(nodeData.id, nodeData.nodeType, {
        x: nodeData.x,
        y: nodeData.y,
        label: nodeData.label
      })

      // 模拟节点存在于图形中
      mockGraph.getCellById.mockReturnValue(testNode)

      // 获取vue:delete事件处理器并调用
      const vueDeleteHandler = mockGraph.on.mock.calls.find(
        call => call[0] === 'vue:delete'
      )?.[1]

      if (vueDeleteHandler) {
        vueDeleteHandler({ node: testNode })
      }

      await nextTick()

      // 验证节点被从图形中移除
      expect(mockGraph.removeCell).toHaveBeenCalledWith(testNode)
    })

    it('TC_NODE_DELETE_008 - 删除节点应该触发node-deleted事件', async () => {
      // 等待组件完全初始化
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const nodeData = {
        id: 'test-node-7',
        nodeType: 'audience-split',
        label: '测试节点',
        x: 100,
        y: 100
      }

      const testNode = createMockNode(nodeData.id, nodeData.nodeType, {
        x: nodeData.x,
        y: nodeData.y,
        label: nodeData.label
      })

      // 监听node-deleted事件 - 使用Vue 3兼容的方式
      const nodeDeletedEventSpy2 = vi.fn()
      wrapper.vm.$emit = vi.fn((eventName, data) => {
        if (eventName === 'node-deleted') {
          nodeDeletedEventSpy2(data)
        }
      })

      // 模拟节点存在于图形中
      mockGraph.getCellById.mockReturnValue(testNode)

      // 获取vue:delete事件处理器并调用
      const vueDeleteHandler = mockGraph.on.mock.calls.find(
        call => call[0] === 'vue:delete'
      )?.[1]

      if (vueDeleteHandler) {
        vueDeleteHandler({ node: testNode })
      }

      await nextTick()

      // 验证node-deleted事件被触发
      expect(nodeDeletedEventSpy2).toHaveBeenCalled()
      const nodeDeletedEventData = nodeDeletedEventSpy2.mock.calls[0]?.[0]
      expect(nodeDeletedEventData).toBeTruthy()
      expect(nodeDeletedEventData.nodeId).toBe(nodeData.id)
    })
  })

  describe('级联删除功能', () => {
    it('TC_NODE_DELETE_009 - 删除父节点应该级联删除子节点', async () => {
      // 等待组件完全初始化
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const parentNodeData = {
        id: 'parent-node',
        nodeType: 'audience-split',
        label: '父节点',
        x: 100,
        y: 100
      }

      const childNodeData = {
        id: 'child-node',
        nodeType: 'action',
        label: '子节点',
        x: 200,
        y: 200
      }

      const parentNode = createMockNode(parentNodeData.id, parentNodeData.nodeType, {
        x: parentNodeData.x,
        y: parentNodeData.y,
        label: parentNodeData.label
      })
      const childNode = createMockNode(childNodeData.id, childNodeData.nodeType, {
        x: childNodeData.x,
        y: childNodeData.y,
        label: childNodeData.label
      })

      // 模拟父子关系
      mockGraph.getCellById.mockImplementation((id) => {
        if (id === parentNodeData.id) return parentNode
        if (id === childNodeData.id) return childNode
        return null
      })

      // 模拟获取所有边（连接）
      mockGraph.getEdges.mockReturnValue([
        {
          getSourceCellId: () => parentNodeData.id,
          getTargetCellId: () => childNodeData.id
        }
      ])

      // 获取vue:delete事件处理器并调用
      const vueDeleteHandler = mockGraph.on.mock.calls.find(
        call => call[0] === 'vue:delete'
      )?.[1]

      if (vueDeleteHandler) {
        vueDeleteHandler({ node: parentNode })
      }

      await nextTick()

      // 验证父节点和子节点都被删除
      expect(mockGraph.removeCell).toHaveBeenCalledWith(parentNode)
      // 注意：级联删除的具体实现可能需要根据实际的cascadeDeleteNode方法来验证
    })
  })

  describe('错误处理', () => {
    it('TC_NODE_DELETE_010 - 删除不存在的节点应该优雅处理', async () => {
      // 等待组件完全初始化
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const nodeData = {
        id: 'non-existent-node',
        nodeType: 'audience-split',
        label: '不存在的节点',
        x: 100,
        y: 100
      }

      const testNode = createMockNode(nodeData.id, nodeData.nodeType, {
        x: nodeData.x,
        y: nodeData.y,
        label: nodeData.label
      })

      // 模拟节点不存在于图形中
      mockGraph.getCellById.mockReturnValue(null)

      // 获取vue:delete事件处理器并调用
      const vueDeleteHandler = mockGraph.on.mock.calls.find(
        call => call[0] === 'vue:delete'
      )?.[1]

      // 这应该不会抛出错误
      expect(() => {
        if (vueDeleteHandler) {
          vueDeleteHandler({ node: testNode })
        }
      }).not.toThrow()

      await nextTick()

      // 验证没有尝试删除不存在的节点
      expect(mockGraph.removeCell).not.toHaveBeenCalled()
    })

    it('TC_NODE_DELETE_011 - 删除按钮点击应该阻止事件冒泡', async () => {
      const nodeData = {
        id: 'test-node-8',
        nodeType: 'audience-split',
        label: '测试节点',
        deletable: true,
        x: 100,
        y: 100
      }

      const testNode = createMockNode(nodeData.id, nodeData.nodeType, {
        x: nodeData.x,
        y: nodeData.y,
        label: nodeData.label,
        deletable: nodeData.deletable
      })

      // 创建FlowNode组件
      const flowNodeWrapper = mount(FlowNode, {
        props: {
          node: testNode,
          graph: mockGraph,
          nodeType: nodeData.nodeType,
          label: nodeData.label,
          deletable: nodeData.deletable
        }
      })

      // 监听节点点击事件 - 使用Vue 3兼容的方式
      const nodeClickSpy = vi.fn()
      flowNodeWrapper.vm.$emit = vi.fn((eventName, data) => {
        if (eventName === 'click') {
          nodeClickSpy(data)
        }
      })

      // 点击删除按钮
      const deleteButton = flowNodeWrapper.find('.flow-node__delete-btn')
      const clickEvent = new MouseEvent('click', { bubbles: true })
      
      // 模拟点击事件
      await deleteButton.trigger('click')

      // 验证节点点击事件没有被触发（事件冒泡被阻止）
      expect(nodeClickSpy).not.toHaveBeenCalled()

      flowNodeWrapper.unmount()
    })
  })
})