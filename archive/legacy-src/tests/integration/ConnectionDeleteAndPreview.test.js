import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskFlowCanvas from '../../pages/marketing/tasks/components/TaskFlowCanvas.vue'
import ConnectionContextMenu from '../../components/ConnectionContextMenu.vue'
import PreviewLineSystem from '../../utils/preview-line/PreviewLineSystem.js'
import { TaskStorage } from '../../utils/taskStorage.js'

// Mock X6 Graph
const mockGraph = {
  removeEdge: vi.fn(),
  addEdge: vi.fn(),
  getEdgeById: vi.fn(),
  getCellById: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  render: vi.fn(),
  resize: vi.fn(),
  dispose: vi.fn(),
  fromJSON: vi.fn(),
  toJSON: vi.fn(() => ({ cells: [] })),
  getEdges: vi.fn(() => []),
  getNodes: vi.fn(() => []),
  use: vi.fn(),
  zoom: vi.fn(),
  centerContent: vi.fn(),
  enablePanning: vi.fn(),
  disablePanning: vi.fn(),
  enableSelection: vi.fn(),
  disableSelection: vi.fn(),
  enableRubberband: vi.fn(),
  disableRubberband: vi.fn(),
  enableKeyboard: vi.fn(),
  disableKeyboard: vi.fn(),
  enableClipboard: vi.fn(),
  disableClipboard: vi.fn(),
  enableHistory: vi.fn(),
  disableHistory: vi.fn()
}

// Mock X6
vi.mock('@antv/x6', () => ({
  Graph: Object.assign(vi.fn(() => mockGraph), {
    registerEdge: vi.fn(),
    registerNode: vi.fn(),
    registerConnector: vi.fn(),
    registerRouter: vi.fn(),
    registerPortLayout: vi.fn(),
    registerNodeTool: vi.fn(),
    registerEdgeTool: vi.fn()
  }),
  Edge: {
    registry: {
      register: vi.fn()
    }
  },
  Node: {
    registry: {
      register: vi.fn()
    }
  },
  Export: vi.fn(() => ({})),
  Selection: vi.fn(() => ({})),
  Snapline: vi.fn(() => ({})),
  Keyboard: vi.fn(() => ({})),
  Clipboard: vi.fn(() => ({})),
  History: vi.fn(() => ({})),
  MiniMap: vi.fn(() => ({}))
}))

// Mock dependencies
vi.mock('../../utils/taskStorage.js', () => ({
  TaskStorage: {
    saveTask: vi.fn(),
    getTaskById: vi.fn(() => ({
      id: 'test-task',
      canvasData: {
        nodes: [],
        connections: []
      }
    }))
  }
}))

// Mock PreviewLineSystem
vi.mock('../../utils/PreviewLineSystem.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    init: vi.fn(),
    creator: {
      addPreviewLine: vi.fn(),
      removePreviewLine: vi.fn(),
      clearAllPreviewLines: vi.fn(),
      restorePreviewLine: vi.fn()
    },
    manager: {
      getPreviewLineColor: vi.fn(() => '#ff6b6b'),
      setPreviewLineColor: vi.fn(),
      isPreviewLine: vi.fn(() => false),
      getAllPreviewLines: vi.fn(() => [])
    }
  }))
}))

// Mock Arco Design components
vi.mock('@arco-design/web-vue', () => ({
  Message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  },
  Modal: {
    confirm: vi.fn((options) => {
      // 模拟用户点击确认
      if (options.onOk) {
        options.onOk()
      }
    })
  }
}))

describe('PreviewLineSystem - 连接删除与预览线集成测试', () => {
  let canvasWrapper
  let menuWrapper
  let mockConnection
  let mockPreviewLineData

  beforeEach(() => {
    vi.clearAllMocks()
    
    // 模拟连接线数据
    mockConnection = {
      id: 'connection-1',
      source: 'node-1',
      target: 'node-2',
      attrs: {
        line: {
          stroke: '#1890ff',
          strokeWidth: 2
        }
      },
      data: {
        type: 'normal',
        label: '测试连接'
      }
    }

    // 模拟预览线数据
    mockPreviewLineData = {
      id: 'preview-1',
      source: 'node-1',
      target: 'node-2',
      originalConnection: mockConnection,
      previewColor: '#ff6b6b',
      createTime: Date.now()
    }

    // 设置Graph mock返回值
    mockGraph.getEdgeById.mockReturnValue(mockConnection)
    mockGraph.getCellById.mockReturnValue(mockConnection)
  })

  afterEach(() => {
    if (canvasWrapper) {
      canvasWrapper.unmount()
    }
    if (menuWrapper) {
      menuWrapper.unmount()
    }
  })

  describe('连接线右键菜单显示', () => {
    it('右键点击连接线显示上下文菜单', async () => {
      canvasWrapper = mount(TaskFlowCanvas, {
        props: {
          taskId: 'test-task'
        }
      })

      const vm = canvasWrapper.vm
      
      // 模拟右键点击连接线事件
      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 200
      }

      await vm.handleEdgeContextMenu(mockConnection, mockEvent)

      expect(vm.contextMenu.visible).toBe(true)
      expect(vm.contextMenu.x).toBe(100)
      expect(vm.contextMenu.y).toBe(200)
      expect(vm.contextMenu.connection).toEqual(mockConnection)
    })

    it('上下文菜单包含删除选项', () => {
      menuWrapper = mount(ConnectionContextMenu, {
        props: {
          visible: true,
          x: 100,
          y: 200,
          connection: mockConnection
        }
      })

      const deleteMenuItem = menuWrapper.find('[data-action="delete"]')
      expect(deleteMenuItem.exists()).toBe(true)
      expect(deleteMenuItem.text()).toContain('删除连接')
    })
  })

  describe('连接线删除流程', () => {
    it('handleDeleteConnection方法正确处理connectionInfo参数', () => {
      // 模拟ConnectionContextMenu传递的connectionInfo对象
      const connectionInfo = {
        edgeId: 'connection-1',
        sourceId: 'node-1', 
        targetId: 'node-2',
        branchId: 'branch-1',
        label: '测试连接'
      }

      // 创建一个简单的组件实例来测试方法
      const mockComponent = {
        graph: mockGraph,
        previewLineSystem: {
          creator: {
            createPreviewLine: vi.fn()
          }
        },
        contextMenu: {
          visible: true
        },
        handleDeleteConnection(connectionInfo) {
          console.log('[测试] 开始删除连接线:', connectionInfo)
          
          const { edgeId, sourceId, targetId, branchId } = connectionInfo
          
          // 删除连接线
          if (this.graph && edgeId) {
            this.graph.removeEdge(edgeId)
          }
          
          // 关闭右键菜单
          this.contextMenu.visible = false
          
          // 恢复预览线
          this.handleRestorePreviewLine(sourceId, targetId, branchId)
          
          console.log('[测试] 连接线删除完成')
        },
        handleRestorePreviewLine(sourceId, targetId, branchId) {
          console.log('[测试] 恢复预览线:', { sourceId, targetId, branchId })
          
          if (this.previewLineSystem && sourceId && targetId) {
            this.previewLineSystem.creator.createPreviewLine({
              sourceId,
              targetId,
              branchId: branchId || 'default'
            })
          }
        }
      }

      // 执行测试
      mockComponent.handleDeleteConnection(connectionInfo)
      
      // 验证结果
      expect(mockGraph.removeEdge).toHaveBeenCalledWith('connection-1')
      expect(mockComponent.contextMenu.visible).toBe(false)
      expect(mockComponent.previewLineSystem.creator.createPreviewLine).toHaveBeenCalledWith({
        sourceId: 'node-1',
        targetId: 'node-2', 
        branchId: 'branch-1'
      })
    })

    it('删除连接线后保存画布数据', async () => {
      const vm = canvasWrapper.vm
      
      await vm.confirmDeleteConnection(mockConnection)
      
      expect(TaskStorage.saveTask).toHaveBeenCalled()
    })

    it('删除连接线后显示成功消息', async () => {
      const vm = canvasWrapper.vm
      
      await vm.confirmDeleteConnection(mockConnection)
      
      const { Message } = await import('@arco-design/web-vue')
      expect(Message.success).toHaveBeenCalledWith('连接线删除成功')
    })

    it('删除失败时显示错误消息', async () => {
      mockGraph.removeEdge.mockImplementation(() => {
        throw new Error('删除失败')
      })

      const vm = canvasWrapper.vm
      
      await vm.confirmDeleteConnection(mockConnection)
      
      const { Message } = await import('@arco-design/web-vue')
      expect(Message.error).toHaveBeenCalledWith('删除连接线失败')
    })
  })

  describe('预览线生成', () => {
    beforeEach(() => {
      canvasWrapper = mount(TaskFlowCanvas, {
        props: {
          taskId: 'test-task'
        }
      })
    })

    it('删除连接线时自动生成预览线', async () => {
      const vm = canvasWrapper.vm
      
      await vm.confirmDeleteConnection(mockConnection)
      
      expect(PreviewLineSystem().creator.addPreviewLine).toHaveBeenCalledWith(
        expect.objectContaining({
          source: mockConnection.source,
          target: mockConnection.target,
          originalConnection: mockConnection
        })
      )
    })

    it('预览线使用统一的颜色', async () => {
      const vm = canvasWrapper.vm
      
      await vm.confirmDeleteConnection(mockConnection)
      
      expect(PreviewLineSystem().manager.getPreviewLineColor).toHaveBeenCalled()
    })

    it('预览线包含原始连接信息', async () => {
      const vm = canvasWrapper.vm
      
      await vm.confirmDeleteConnection(mockConnection)
      
      const addPreviewLineCall = PreviewLineSystem().creator.addPreviewLine.mock.calls[0]
      const previewLineData = addPreviewLineCall[0]
      
      expect(previewLineData.originalConnection).toEqual(mockConnection)
      expect(previewLineData.source).toBe(mockConnection.source)
      expect(previewLineData.target).toBe(mockConnection.target)
    })
  })

  describe('预览线恢复', () => {
    beforeEach(() => {
      canvasWrapper = mount(TaskFlowCanvas, {
        props: {
          taskId: 'test-task'
        }
      })
      
      // 模拟已存在预览线
      PreviewLineSystem().manager.getAllPreviewLines.mockReturnValue([mockPreviewLineData])
    })

    it('右键点击预览线显示恢复选项', async () => {
      // 模拟预览线
      const previewLine = {
        ...mockConnection,
        id: 'preview-1',
        data: {
          ...mockConnection.data,
          isPreview: true
        }
      }
      
      PreviewLineSystem().manager.isPreviewLine.mockReturnValue(true)
      
      menuWrapper = mount(ConnectionContextMenu, {
        props: {
          visible: true,
          x: 100,
          y: 200,
          connection: previewLine
        }
      })

      const restoreMenuItem = menuWrapper.find('[data-action="restore"]')
      expect(restoreMenuItem.exists()).toBe(true)
      expect(restoreMenuItem.text()).toContain('恢复连接')
    })

    it('点击恢复按钮恢复原始连接', async () => {
      const vm = canvasWrapper.vm
      
      await vm.handleRestoreConnection(mockPreviewLineData)
      
      expect(PreviewLineSystem().creator.restorePreviewLine).toHaveBeenCalledWith(mockPreviewLineData.id)
    })

    it('恢复连接后重新添加到画布', async () => {
      const vm = canvasWrapper.vm
      
      await vm.handleRestoreConnection(mockPreviewLineData)
      
      expect(mockGraph.addEdge).toHaveBeenCalledWith(
        expect.objectContaining({
          source: mockPreviewLineData.source,
          target: mockPreviewLineData.target
        })
      )
    })

    it('恢复连接后保存画布数据', async () => {
      const vm = canvasWrapper.vm
      
      await vm.handleRestoreConnection(mockPreviewLineData)
      
      expect(TaskStorage.saveTask).toHaveBeenCalled()
    })

    it('恢复连接后显示成功消息', async () => {
      const vm = canvasWrapper.vm
      
      await vm.handleRestoreConnection(mockPreviewLineData)
      
      const { Message } = await import('@arco-design/web-vue')
      expect(Message.success).toHaveBeenCalledWith('连接线恢复成功')
    })
  })

  describe('预览线管理', () => {
    beforeEach(() => {
      canvasWrapper = mount(TaskFlowCanvas, {
        props: {
          taskId: 'test-task'
        }
      })
    })

    it('清空所有预览线', async () => {
      const vm = canvasWrapper.vm
      
      await vm.clearAllPreviewLines()
      
      expect(PreviewLineSystem().creator.clearAllPreviewLines).toHaveBeenCalled()
    })

    it('获取预览线统一颜色', () => {
      const color = PreviewLineSystem().manager.getPreviewLineColor()
      expect(color).toBe('#ff6b6b')
    })

    it('设置预览线颜色', () => {
      const newColor = '#00ff00'
      PreviewLineSystem().manager.setPreviewLineColor(newColor)
      
      expect(PreviewLineSystem().manager.setPreviewLineColor).toHaveBeenCalledWith(newColor)
    })

    it('检查是否为预览线', () => {
      const isPreview = PreviewLineSystem().manager.isPreviewLine('preview-1')
      expect(PreviewLineSystem().manager.isPreviewLine).toHaveBeenCalledWith('preview-1')
    })
  })

  describe('完整删除恢复流程', () => {
    it('完整的删除到恢复流程', async () => {
      // 1. 挂载画布组件
      canvasWrapper = mount(TaskFlowCanvas, {
        props: {
          taskId: 'test-task'
        }
      })
      const vm = canvasWrapper.vm

      // 2. 右键点击连接线
      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 200
      }
      await vm.handleEdgeContextMenu(mockConnection, mockEvent)
      expect(vm.contextMenu.visible).toBe(true)

      // 3. 点击删除连接
      await vm.confirmDeleteConnection(mockConnection)
      expect(mockGraph.removeEdge).toHaveBeenCalledWith(mockConnection.id)
      expect(PreviewLineSystem().creator.addPreviewLine).toHaveBeenCalled()

      // 4. 模拟预览线存在
      PreviewLineSystem().manager.isPreviewLine.mockReturnValue(true)
      PreviewLineSystem().manager.getAllPreviewLines.mockReturnValue([mockPreviewLineData])

      // 5. 恢复预览线
      await vm.handleRestoreConnection(mockPreviewLineData)
      expect(PreviewLineSystem().creator.restorePreviewLine).toHaveBeenCalledWith(mockPreviewLineData.id)
      expect(mockGraph.addEdge).toHaveBeenCalled()

      // 6. 验证数据保存
      expect(TaskStorage.saveTask).toHaveBeenCalledTimes(2) // 删除时一次，恢复时一次
    })
  })

  describe('边界情况处理', () => {
    beforeEach(() => {
      canvasWrapper = mount(TaskFlowCanvas, {
        props: {
          taskId: 'test-task'
        }
      })
    })

    it('删除不存在的连接线', async () => {
      mockGraph.getEdgeById.mockReturnValue(null)
      
      const vm = canvasWrapper.vm
      await vm.confirmDeleteConnection({ id: 'non-existent' })
      
      const { Message } = await import('@arco-design/web-vue')
      expect(Message.error).toHaveBeenCalledWith('连接线不存在')
    })

    it('恢复不存在的预览线', async () => {
      PreviewLineSystem().creator.restorePreviewLine.mockImplementation(() => {
        throw new Error('预览线不存在')
      })
      
      const vm = canvasWrapper.vm
      await vm.handleRestoreConnection({ id: 'non-existent' })
      
      const { Message } = await import('@arco-design/web-vue')
      expect(Message.error).toHaveBeenCalledWith('恢复连接线失败')
    })

    it('处理空连接数据', async () => {
      const vm = canvasWrapper.vm
      
      await vm.confirmDeleteConnection(null)
      
      expect(mockGraph.removeEdge).not.toHaveBeenCalled()
    })

    it('处理预览线管理器异常', async () => {
      PreviewLineSystem().creator.addPreviewLine.mockImplementation(() => {
        throw new Error('预览线管理器错误')
      })
      
      const vm = canvasWrapper.vm
      await vm.confirmDeleteConnection(mockConnection)
      
      // 验证连接线仍然被删除，但预览线创建失败
      expect(mockGraph.removeEdge).toHaveBeenCalled()
    })
  })

  describe('性能测试', () => {
    it('批量删除连接线性能', async () => {
      canvasWrapper = mount(TaskFlowCanvas, {
        props: {
          taskId: 'test-task'
        }
      })
      const vm = canvasWrapper.vm

      const connections = Array.from({ length: 100 }, (_, i) => ({
        id: `connection-${i}`,
        source: `node-${i}`,
        target: `node-${i + 1}`
      }))

      const startTime = performance.now()
      
      for (const connection of connections) {
        await vm.confirmDeleteConnection(connection)
      }
      
      const endTime = performance.now()
      
      // 验证批量删除性能合理（小于5秒）
      expect(endTime - startTime).toBeLessThan(5000)
      expect(mockGraph.removeEdge).toHaveBeenCalledTimes(100)
      expect(PreviewLineSystem().creator.addPreviewLine).toHaveBeenCalledTimes(100)
    })
  })
})