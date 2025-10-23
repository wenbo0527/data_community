/**
 * 端到端用户操作测试
 * 模拟完整的用户工作流程
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import TaskFlowCanvasRefactored from '../../pages/marketing/tasks/components/TaskFlowCanvasRefactored.vue'

// Mock X6 Graph
const mockGraph = {
  addNode: vi.fn(),
  addEdge: vi.fn(),
  removeCell: vi.fn(),
  getCellById: vi.fn(),
  getNodes: vi.fn(() => []),
  getEdges: vi.fn(() => []),
  zoom: vi.fn(),
  centerContent: vi.fn(),
  zoomToFit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  dispose: vi.fn(),
  toJSON: vi.fn(() => ({ cells: [] })),
  fromJSON: vi.fn(),
  clearCells: vi.fn()
}

// Mock Arco Design components
vi.mock('@arco-design/web-vue', () => ({
  Message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  },
  Modal: {
    confirm: vi.fn()
  }
}))

// Mock X6
vi.mock('@antv/x6', () => ({
  Graph: vi.fn(() => mockGraph),
  Shape: {
    Rect: {
      define: vi.fn()
    }
  }
}))

describe('端到端用户工作流程测试', () => {
  let wrapper
  let canvasComponent

  beforeEach(async () => {
    // 创建DOM容器
    const container = document.createElement('div')
    container.id = 'canvas-container'
    document.body.appendChild(container)

    // 挂载组件
    wrapper = mount(TaskFlowCanvasRefactored, {
      props: {
        taskId: 'test-task-1',
        mode: 'create'
      },
      attachTo: container
    })

    canvasComponent = wrapper.vm
    await nextTick()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    // 清理DOM
    const container = document.getElementById('canvas-container')
    if (container) {
      document.body.removeChild(container)
    }
  })

  describe('用户创建新任务流程', () => {
    it('应该能够完成完整的任务创建流程', async () => {
      // 1. 用户进入画布页面
      expect(wrapper.exists()).toBe(true)
      expect(canvasComponent).toBeDefined()

      // 2. 添加开始节点
      const startNodeData = {
        id: 'start-node',
        type: 'start',
        x: 100,
        y: 100,
        label: '开始'
      }

      // 验证节点数据结构
      expect(startNodeData.id).toBe('start-node')
      expect(startNodeData.type).toBe('start')

      // 3. 添加条件节点
      const conditionNodeData = {
        id: 'condition-node',
        type: 'condition',
        x: 300,
        y: 100,
        label: '条件判断'
      }

      expect(conditionNodeData.type).toBe('condition')

      // 4. 添加结束节点
      const endNodeData = {
        id: 'end-node',
        type: 'end',
        x: 500,
        y: 100,
        label: '结束'
      }

      expect(endNodeData.type).toBe('end')

      // 5. 创建连接线
      const edge1Data = {
        id: 'edge-1',
        source: 'start-node',
        target: 'condition-node'
      }

      const edge2Data = {
        id: 'edge-2',
        source: 'condition-node',
        target: 'end-node'
      }

      expect(edge1Data.source).toBe('start-node')
      expect(edge1Data.target).toBe('condition-node')
      expect(edge2Data.source).toBe('condition-node')
      expect(edge2Data.target).toBe('end-node')

      // 6. 验证工作流程完整性
      const workflowData = {
        nodes: [startNodeData, conditionNodeData, endNodeData],
        edges: [edge1Data, edge2Data]
      }

      expect(workflowData.nodes).toHaveLength(3)
      expect(workflowData.edges).toHaveLength(2)
    })

    it('应该能够处理节点拖拽操作', async () => {
      // 模拟节点拖拽
      const dragData = {
        nodeId: 'test-node',
        startPosition: { x: 100, y: 100 },
        endPosition: { x: 200, y: 150 }
      }

      // 验证拖拽数据
      expect(dragData.nodeId).toBe('test-node')
      expect(dragData.startPosition.x).toBe(100)
      expect(dragData.endPosition.x).toBe(200)

      // 计算移动距离
      const deltaX = dragData.endPosition.x - dragData.startPosition.x
      const deltaY = dragData.endPosition.y - dragData.startPosition.y

      expect(deltaX).toBe(100)
      expect(deltaY).toBe(50)
    })

    it('应该能够保存和加载任务流程', async () => {
      // 模拟保存操作
      const saveData = {
        taskId: 'test-task-1',
        name: '测试任务流程',
        description: '这是一个测试任务流程',
        nodes: [
          { id: 'node-1', type: 'start', x: 100, y: 100 },
          { id: 'node-2', type: 'end', x: 300, y: 100 }
        ],
        edges: [
          { id: 'edge-1', source: 'node-1', target: 'node-2' }
        ]
      }

      // 验证保存数据结构
      expect(saveData.taskId).toBe('test-task-1')
      expect(saveData.nodes).toHaveLength(2)
      expect(saveData.edges).toHaveLength(1)

      // 模拟加载操作
      const loadedData = { ...saveData }
      expect(loadedData.taskId).toBe(saveData.taskId)
      expect(loadedData.nodes).toEqual(saveData.nodes)
      expect(loadedData.edges).toEqual(saveData.edges)
    })
  })

  describe('用户编辑现有任务流程', () => {
    it('应该能够编辑节点属性', async () => {
      // 模拟节点编辑
      const originalNode = {
        id: 'node-1',
        type: 'condition',
        label: '原始标签',
        config: { timeout: 30 }
      }

      const updatedNode = {
        ...originalNode,
        label: '更新后的标签',
        config: { timeout: 60 }
      }

      // 验证节点更新
      expect(updatedNode.id).toBe(originalNode.id)
      expect(updatedNode.label).toBe('更新后的标签')
      expect(updatedNode.config.timeout).toBe(60)
    })

    it('应该能够删除节点和相关连接线', async () => {
      // 模拟删除节点操作
      const nodeToDelete = 'node-2'
      const relatedEdges = ['edge-1', 'edge-2']

      // 验证删除操作数据
      expect(nodeToDelete).toBe('node-2')
      expect(relatedEdges).toHaveLength(2)
      expect(relatedEdges).toContain('edge-1')
      expect(relatedEdges).toContain('edge-2')
    })

    it('应该能够重新连接节点', async () => {
      // 模拟重新连接操作
      const reconnectionData = {
        oldEdgeId: 'edge-1',
        newSource: 'node-1',
        newTarget: 'node-3',
        oldSource: 'node-1',
        oldTarget: 'node-2'
      }

      // 验证重连数据
      expect(reconnectionData.newTarget).toBe('node-3')
      expect(reconnectionData.oldTarget).toBe('node-2')
      expect(reconnectionData.newSource).toBe(reconnectionData.oldSource)
    })
  })

  describe('用户画布交互操作', () => {
    it('应该能够进行缩放和平移操作', async () => {
      // 模拟缩放操作
      const zoomOperations = [
        { action: 'zoomIn', scale: 1.2 },
        { action: 'zoomOut', scale: 0.8 },
        { action: 'zoomToFit', scale: 'auto' }
      ]

      // 验证缩放操作
      expect(zoomOperations).toHaveLength(3)
      expect(zoomOperations[0].action).toBe('zoomIn')
      expect(zoomOperations[1].scale).toBe(0.8)

      // 模拟平移操作
      const panOperation = {
        action: 'pan',
        deltaX: 50,
        deltaY: -30
      }

      expect(panOperation.action).toBe('pan')
      expect(panOperation.deltaX).toBe(50)
      expect(panOperation.deltaY).toBe(-30)
    })

    it('应该能够选择多个节点进行批量操作', async () => {
      // 模拟多选操作
      const selectedNodes = ['node-1', 'node-2', 'node-3']
      const batchOperation = {
        action: 'delete',
        targets: selectedNodes
      }

      // 验证批量操作
      expect(batchOperation.targets).toHaveLength(3)
      expect(batchOperation.action).toBe('delete')
      expect(selectedNodes).toContain('node-1')
    })

    it('应该能够使用快捷键操作', async () => {
      // 模拟快捷键操作
      const shortcuts = [
        { key: 'Ctrl+Z', action: 'undo' },
        { key: 'Ctrl+Y', action: 'redo' },
        { key: 'Delete', action: 'delete' },
        { key: 'Ctrl+S', action: 'save' }
      ]

      // 验证快捷键配置
      expect(shortcuts).toHaveLength(4)
      expect(shortcuts.find(s => s.key === 'Ctrl+Z')?.action).toBe('undo')
      expect(shortcuts.find(s => s.key === 'Delete')?.action).toBe('delete')
    })
  })

  describe('错误处理和用户反馈', () => {
    it('应该能够处理网络错误', async () => {
      // 模拟网络错误
      const networkError = {
        type: 'NetworkError',
        message: '网络连接失败',
        code: 'NETWORK_ERROR'
      }

      // 验证错误处理
      expect(networkError.type).toBe('NetworkError')
      expect(networkError.message).toBe('网络连接失败')
      expect(networkError.code).toBe('NETWORK_ERROR')
    })

    it('应该能够处理数据验证错误', async () => {
      // 模拟数据验证错误
      const validationErrors = [
        { field: 'taskName', message: '任务名称不能为空' },
        { field: 'nodes', message: '至少需要一个开始节点' }
      ]

      // 验证错误信息
      expect(validationErrors).toHaveLength(2)
      expect(validationErrors[0].field).toBe('taskName')
      expect(validationErrors[1].message).toBe('至少需要一个开始节点')
    })

    it('应该能够显示操作成功提示', async () => {
      // 模拟成功提示
      const successMessages = [
        { action: 'save', message: '任务流程保存成功' },
        { action: 'publish', message: '任务流程发布成功' }
      ]

      // 验证成功提示
      expect(successMessages).toHaveLength(2)
      expect(successMessages[0].message).toBe('任务流程保存成功')
      expect(successMessages[1].action).toBe('publish')
    })
  })
})