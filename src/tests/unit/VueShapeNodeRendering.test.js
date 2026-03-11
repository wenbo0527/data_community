/**
 * Vue Shape 节点渲染测试
 * 测试节点形状和样式的正确渲染
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FlowNode from '../../pages/marketing/tasks/components/canvas/FlowNode.vue'
import { getNodeConfig } from '../../utils/nodeTypes.js'

describe('Vue Shape 节点渲染测试', () => {
  let mockNode
  let mockGraph

  beforeEach(() => {
    mockGraph = {
      trigger: vi.fn(),
      getNodes: vi.fn(() => []),
      getCellById: vi.fn()
    }

    mockNode = {
      id: 'test-node',
      getData: vi.fn(() => ({
        type: 'start',
        nodeType: 'start',
        label: '开始',
        isConfigured: true
      })),
      store: {
        data: {
          data: {
            type: 'start',
            label: '开始'
          }
        }
      }
    }
  })

  describe('节点类型识别', () => {
    it('应该正确识别节点类型', () => {
      const wrapper = mount(FlowNode, {
        props: {
          node: mockNode,
          graph: mockGraph
        }
      })

      // 检查计算属性是否正确识别节点类型
      expect(wrapper.vm.actualNodeType).toBe('start')
    })

    it('应该处理多种节点类型数据源', () => {
      const testCases = [
        { data: { type: 'start' }, expected: 'start' },
        { data: { nodeType: 'end' }, expected: 'end' },
        { nodeType: 'sms', expected: 'sms' }
      ]

      testCases.forEach(({ data, expected }) => {
        mockNode.getData.mockReturnValue(data)
        
        const wrapper = mount(FlowNode, {
          props: {
            node: mockNode,
            graph: mockGraph
          }
        })

        expect(wrapper.vm.actualNodeType).toBe(expected)
      })
    })
  })

  describe('节点样式渲染', () => {
    it('应该应用正确的CSS类', () => {
      const wrapper = mount(FlowNode, {
        props: {
          node: mockNode,
          graph: mockGraph
        }
      })

      const nodeElement = wrapper.find('.flow-node')
      expect(nodeElement.exists()).toBe(true)
      expect(nodeElement.classes()).toContain('flow-node--start')
    })

    it('应该显示正确的节点颜色', () => {
      const wrapper = mount(FlowNode, {
        props: {
          node: mockNode,
          graph: mockGraph
        }
      })

      const nodeConfig = getNodeConfig('start')
      expect(wrapper.vm.nodeColor).toBe(nodeConfig.color)
    })

    it('选中状态应该正确显示', () => {
      mockNode.getData.mockReturnValue({
        type: 'start',
        selected: true
      })

      const wrapper = mount(FlowNode, {
        props: {
          node: mockNode,
          graph: mockGraph
        }
      })

      const nodeElement = wrapper.find('.flow-node')
      expect(nodeElement.classes()).toContain('flow-node--selected')
    })
  })

  describe('节点标签显示', () => {
    it('应该显示正确的节点标签', () => {
      const wrapper = mount(FlowNode, {
        props: {
          node: mockNode,
          graph: mockGraph
        }
      })

      const labelElement = wrapper.find('.flow-node__label')
      expect(labelElement.exists()).toBe(true)
      expect(labelElement.text()).toBe('开始')
    })

    it('应该处理空标签情况', () => {
      mockNode.getData.mockReturnValue({
        type: 'start'
        // 没有 label
      })

      const wrapper = mount(FlowNode, {
        props: {
          node: mockNode,
          graph: mockGraph
        }
      })

      const labelElement = wrapper.find('.flow-node__label')
      expect(labelElement.text()).toBe('节点')
    })
  })

  describe('删除按钮逻辑', () => {
    it('start 节点不应该显示删除按钮', () => {
      const wrapper = mount(FlowNode, {
        props: {
          node: mockNode,
          graph: mockGraph
        }
      })

      expect(wrapper.vm.actualDeletable).toBe(false)
      const deleteBtn = wrapper.find('.flow-node__delete-btn')
      expect(deleteBtn.exists()).toBe(false)
    })

    it('其他节点应该显示删除按钮', () => {
      mockNode.getData.mockReturnValue({
        type: 'sms',
        deletable: true
      })

      const wrapper = mount(FlowNode, {
        props: {
          node: mockNode,
          graph: mockGraph
        }
      })

      expect(wrapper.vm.actualDeletable).toBe(true)
    })
  })

  describe('事件处理', () => {
    it('应该正确处理节点点击事件', async () => {
      const wrapper = mount(FlowNode, {
        props: {
          node: mockNode,
          graph: mockGraph
        }
      })

      await wrapper.find('.flow-node').trigger('click')
      
      expect(wrapper.emitted('click')).toBeTruthy()
      const clickEvent = wrapper.emitted('click')[0][0]
      expect(clickEvent.nodeType).toBe('start')
      expect(clickEvent.node).toBe(mockNode)
    })

    it('应该正确处理删除按钮点击事件', async () => {
      mockNode.getData.mockReturnValue({
        type: 'sms',
        deletable: true
      })

      const wrapper = mount(FlowNode, {
        props: {
          node: mockNode,
          graph: mockGraph
        }
      })

      const deleteBtn = wrapper.find('.flow-node__delete-btn')
      if (deleteBtn.exists()) {
        await deleteBtn.trigger('click')
        
        expect(wrapper.emitted('delete')).toBeTruthy()
        expect(mockGraph.trigger).toHaveBeenCalledWith('vue:delete', { node: mockNode })
      }
    })
  })

  describe('响应式更新', () => {
    it('节点数据变化时应该正确更新显示', async () => {
      const wrapper = mount(FlowNode, {
        props: {
          node: mockNode,
          graph: mockGraph
        }
      })

      // 初始状态
      expect(wrapper.vm.actualNodeType).toBe('start')
      expect(wrapper.find('.flow-node__label').text()).toBe('开始')

      // 更新节点数据
      mockNode.getData.mockReturnValue({
        type: 'end',
        label: '结束'
      })

      // 触发重新计算
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.actualNodeType).toBe('end')
    })
  })

  describe('错误处理', () => {
    it('应该安全处理节点数据获取失败', () => {
      mockNode.getData.mockImplementation(() => {
        throw new Error('数据获取失败')
      })

      const wrapper = mount(FlowNode, {
        props: {
          node: mockNode,
          graph: mockGraph
        }
      })

      // 应该使用默认值而不是崩溃
      expect(wrapper.vm.actualNodeType).toBe('start')
      expect(wrapper.vm.actualLabel).toBe('节点')
    })

    it('应该处理空节点情况', () => {
      const wrapper = mount(FlowNode, {
        props: {
          node: null,
          graph: mockGraph
        }
      })

      expect(wrapper.vm.actualNodeType).toBe('start')
      expect(wrapper.vm.actualLabel).toBe('节点')
    })
  })
})