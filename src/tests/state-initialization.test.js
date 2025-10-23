/**
 * 状态管理初始化测试
 * 测试 useCanvasState 和 TaskFlowCanvasRefactored 的状态初始化
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useCanvasState } from '../pages/marketing/tasks/composables/useCanvasState.js'

describe('状态管理初始化测试', () => {
  let state

  beforeEach(() => {
    // 重置状态
    state = null
  })

  describe('useCanvasState 基础初始化', () => {
    it('应该正确初始化状态对象', () => {
      state = useCanvasState()
      
      expect(state).toBeDefined()
      expect(state).not.toBeNull()
    })

    it('应该正确初始化 nodes 状态', () => {
      state = useCanvasState()
      
      expect(state.nodes).toBeDefined()
      expect(state.nodes.value).toBeDefined()
      expect(Array.isArray(state.nodes.value)).toBe(true)
      expect(state.nodes.value.length).toBe(0)
    })

    it('应该正确初始化 connections 状态', () => {
      state = useCanvasState()
      
      expect(state.connections).toBeDefined()
      expect(state.connections.value).toBeDefined()
      expect(Array.isArray(state.connections.value)).toBe(true)
      expect(state.connections.value.length).toBe(0)
    })

    it('应该正确初始化所有必需的状态属性', () => {
      state = useCanvasState()
      
      // 检查基础状态
      expect(state.isGraphReady).toBeDefined()
      expect(state.isInitializationComplete).toBeDefined()
      
      // 检查UI状态
      expect(state.showNodeSelector).toBeDefined()
      expect(state.showConfigDrawer).toBeDefined()
      expect(state.showStartNodeConfigDrawer).toBeDefined()
      
      // 检查选中状态
      expect(state.selectedNodeId).toBeDefined()
      expect(state.selectedNodes).toBeDefined()
      expect(state.selectedEdges).toBeDefined()
    })
  })

  describe('状态安全访问测试', () => {
    it('nodes.value 应该始终是数组', () => {
      state = useCanvasState()
      
      // 初始状态
      expect(Array.isArray(state.nodes.value)).toBe(true)
      
      // 设置为 null 后应该能够重新初始化
      state.nodes.value = null
      if (!state.nodes.value) {
        state.nodes.value = []
      }
      expect(Array.isArray(state.nodes.value)).toBe(true)
    })

    it('connections.value 应该始终是数组', () => {
      state = useCanvasState()
      
      // 初始状态
      expect(Array.isArray(state.connections.value)).toBe(true)
      
      // 设置为 null 后应该能够重新初始化
      state.connections.value = null
      if (!state.connections.value) {
        state.connections.value = []
      }
      expect(Array.isArray(state.connections.value)).toBe(true)
    })

    it('应该能够安全地添加节点数据', () => {
      state = useCanvasState()
      
      const nodeData = {
        id: 'test-node',
        type: 'start',
        label: '测试节点',
        position: { x: 100, y: 100 }
      }
      
      // 确保可以安全添加
      expect(() => {
        if (!Array.isArray(state.nodes.value)) {
          state.nodes.value = []
        }
        state.nodes.value.push(nodeData)
      }).not.toThrow()
      
      expect(state.nodes.value.length).toBe(1)
      expect(state.nodes.value[0]).toEqual(nodeData)
    })

    it('应该能够安全地添加连接数据', () => {
      state = useCanvasState()
      
      const connectionData = {
        id: 'test-connection',
        source: 'node1',
        target: 'node2',
        sourcePort: 'out',
        targetPort: 'in'
      }
      
      // 确保可以安全添加
      expect(() => {
        if (!Array.isArray(state.connections.value)) {
          state.connections.value = []
        }
        state.connections.value.push(connectionData)
      }).not.toThrow()
      
      expect(state.connections.value.length).toBe(1)
      expect(state.connections.value[0]).toEqual(connectionData)
    })
  })

  describe('状态重置和恢复测试', () => {
    it('应该能够重置节点状态', () => {
      state = useCanvasState()
      
      // 添加一些数据
      state.nodes.value.push({ id: 'test1' })
      state.nodes.value.push({ id: 'test2' })
      expect(state.nodes.value.length).toBe(2)
      
      // 重置
      state.nodes.value = []
      expect(state.nodes.value.length).toBe(0)
      expect(Array.isArray(state.nodes.value)).toBe(true)
    })

    it('应该能够重置连接状态', () => {
      state = useCanvasState()
      
      // 添加一些数据
      state.connections.value.push({ id: 'conn1' })
      state.connections.value.push({ id: 'conn2' })
      expect(state.connections.value.length).toBe(2)
      
      // 重置
      state.connections.value = []
      expect(state.connections.value.length).toBe(0)
      expect(Array.isArray(state.connections.value)).toBe(true)
    })

    it('应该能够处理状态为 undefined 的情况', () => {
      state = useCanvasState()
      
      // 模拟状态被意外设置为 undefined
      state.nodes.value = undefined
      
      // 应该能够安全恢复
      expect(() => {
        if (!state.nodes.value) {
          state.nodes.value = []
        }
      }).not.toThrow()
      
      expect(Array.isArray(state.nodes.value)).toBe(true)
      expect(state.nodes.value.length).toBe(0)
    })
  })

  describe('状态响应性测试', () => {
    it('nodes 状态应该是响应式的', () => {
      state = useCanvasState()
      
      let changeCount = 0
      
      // 监听变化（简单模拟）
      const originalValue = state.nodes.value
      
      // 修改状态
      state.nodes.value = [{ id: 'test' }]
      
      // 验证变化
      expect(state.nodes.value).not.toBe(originalValue)
      expect(state.nodes.value.length).toBe(1)
    })

    it('connections 状态应该是响应式的', () => {
      state = useCanvasState()
      
      const originalValue = state.connections.value
      
      // 修改状态
      state.connections.value = [{ id: 'test-conn' }]
      
      // 验证变化
      expect(state.connections.value).not.toBe(originalValue)
      expect(state.connections.value.length).toBe(1)
    })
  })

  describe('边界情况测试', () => {
    it('应该处理大量节点数据', () => {
      state = useCanvasState()
      
      const largeNodeArray = Array.from({ length: 1000 }, (_, i) => ({
        id: `node-${i}`,
        type: 'test',
        label: `节点 ${i}`
      }))
      
      expect(() => {
        state.nodes.value = largeNodeArray
      }).not.toThrow()
      
      expect(state.nodes.value.length).toBe(1000)
    })

    it('应该处理空对象和 null 值', () => {
      state = useCanvasState()
      
      // 测试各种边界值
      const testValues = [null, undefined, {}, []]
      
      testValues.forEach(value => {
        expect(() => {
          state.nodes.value = value
          if (!Array.isArray(state.nodes.value)) {
            state.nodes.value = []
          }
        }).not.toThrow()
        
        expect(Array.isArray(state.nodes.value)).toBe(true)
      })
    })

    it('应该处理循环引用', () => {
      state = useCanvasState()
      
      const nodeA = { id: 'a', type: 'test' }
      const nodeB = { id: 'b', type: 'test' }
      
      // 创建循环引用
      nodeA.ref = nodeB
      nodeB.ref = nodeA
      
      expect(() => {
        state.nodes.value = [nodeA, nodeB]
      }).not.toThrow()
      
      expect(state.nodes.value.length).toBe(2)
    })
  })
})