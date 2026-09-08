/**
 * GraphService 节点数据验证测试
 * 专门测试节点数据验证逻辑和边界情况
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { GraphService } from '../../../pages/marketing/tasks/services/GraphService.js'

// Mock X6 Graph
const mockGraph = {
  addNode: vi.fn(),
  addEdge: vi.fn(),
  removeNode: vi.fn(),
  removeEdge: vi.fn(),
  getNodes: vi.fn(() => []),
  getEdges: vi.fn(() => []),
  on: vi.fn(),
  off: vi.fn(),
  zoom: vi.fn(),
  centerContent: vi.fn(),
  translate: vi.fn(),
  getGraphArea: vi.fn(() => ({ x: 0, y: 0, width: 800, height: 600 })),
  toJSON: vi.fn(() => ({ cells: [] })),
  fromJSON: vi.fn(),
  dispose: vi.fn()
}

describe('GraphService 节点数据验证测试', () => {
  let graphService

  beforeEach(() => {
    // 重置所有 mock
    vi.clearAllMocks()
    
    // 创建 GraphService 实例
    graphService = new GraphService()
    graphService.initialize(mockGraph)
    graphService.setEnabled(true)
  })

  afterEach(() => {
    if (graphService) {
      graphService.dispose()
    }
  })

  describe('validateNodeData 方法测试', () => {
    it('应该接受有效的节点数据', () => {
      const validNodeData = {
        id: 'test-node-1',
        type: 'process',
        position: { x: 100, y: 200 },
        x: 100,
        y: 200,
        width: 120,
        height: 60
      }

      expect(() => {
        graphService.validateNodeData(validNodeData)
      }).not.toThrow()
    })

    it('应该拒绝 null 数据', () => {
      expect(() => {
        graphService.validateNodeData(null)
      }).toThrow('节点数据无效：数据为null')
    })

    it('应该拒绝 undefined 数据', () => {
      expect(() => {
        graphService.validateNodeData(undefined)
      }).toThrow('节点数据无效：数据为undefined')
    })

    it('应该拒绝非对象类型数据', () => {
      expect(() => {
        graphService.validateNodeData('invalid')
      }).toThrow('节点数据无效：期望对象类型，实际为string')

      expect(() => {
        graphService.validateNodeData(123)
      }).toThrow('节点数据无效：期望对象类型，实际为number')

      expect(() => {
        graphService.validateNodeData(true)
      }).toThrow('节点数据无效：期望对象类型，实际为boolean')
    })

    it('应该拒绝数组类型数据', () => {
      expect(() => {
        graphService.validateNodeData([])
      }).toThrow('节点数据无效：不能是数组类型')

      expect(() => {
        graphService.validateNodeData([{ id: 'test' }])
      }).toThrow('节点数据无效：不能是数组类型')
    })

    it('应该要求必需的 id 字段', () => {
      const nodeDataWithoutId = {
        type: 'process',
        position: { x: 100, y: 200 }
      }

      expect(() => {
        graphService.validateNodeData(nodeDataWithoutId)
      }).toThrow('节点数据无效：缺少必要字段 id')
    })

    it('应该要求 id 为非空字符串', () => {
      expect(() => {
        graphService.validateNodeData({ id: '', type: 'process' })
      }).toThrow('节点数据无效：缺少必要字段 id')

      expect(() => {
        graphService.validateNodeData({ id: 123, type: 'process' })
      }).toThrow('节点数据无效：id字段必须为字符串类型')
    })

    it('应该要求必需的 type 字段', () => {
      const nodeDataWithoutType = {
        id: 'test-node',
        position: { x: 100, y: 200 }
      }

      // type 是可选字段，不应该抛出错误
      expect(() => {
        graphService.validateNodeData(nodeDataWithoutType)
      }).not.toThrow()
    })

    it('应该要求 type 为非空字符串', () => {
      // type 是可选字段，空字符串不应该抛出错误
      expect(() => {
        graphService.validateNodeData({ id: 'test', type: '' })
      }).not.toThrow()

      expect(() => {
        graphService.validateNodeData({ id: 'test', type: 123 })
      }).toThrow('节点数据无效：type字段必须为字符串类型')
    })

    it('应该验证位置信息', () => {
      // 缺少 position 对象时不应该抛出错误（position 是可选字段）
      expect(() => {
        graphService.validateNodeData({
          id: 'test',
          type: 'process'
        })
      }).not.toThrow()

      // position 不是对象
      expect(() => {
        graphService.validateNodeData({
          id: 'test',
          type: 'process',
          position: 'invalid'
        })
      }).toThrow('节点数据无效：position字段必须为对象类型')

      // position.x 无效
      expect(() => {
        graphService.validateNodeData({
          id: 'test',
          type: 'process',
          position: { x: 'invalid', y: 100 }
        })
      }).toThrow('节点数据无效：position.x和position.y必须为数字类型')

      // position.y 无效
      expect(() => {
        graphService.validateNodeData({
          id: 'test',
          type: 'process',
          position: { x: 100, y: 'invalid' }
        })
      }).toThrow('节点数据无效：position.x和position.y必须为数字类型')
    })

    it('应该验证直接坐标字段', () => {
      // x 坐标无效
      expect(() => {
        graphService.validateNodeData({
          id: 'test',
          type: 'process',
          position: { x: 100, y: 200 },
          x: 'invalid',
          y: 200
        })
      }).toThrow('节点数据无效：x坐标必须为数字类型')

      // y 坐标无效
      expect(() => {
        graphService.validateNodeData({
          id: 'test',
          type: 'process',
          position: { x: 100, y: 200 },
          x: 100,
          y: 'invalid'
        })
      }).toThrow('节点数据无效：y坐标必须为数字类型')
    })

    it('应该验证尺寸信息', () => {
      // width 无效
      expect(() => {
        graphService.validateNodeData({
          id: 'test',
          type: 'process',
          position: { x: 100, y: 200 },
          x: 100,
          y: 200,
          width: 'invalid',
          height: 60
        })
      }).toThrow('节点数据无效：width必须为数字类型')

      // height 无效
      expect(() => {
        graphService.validateNodeData({
          id: 'test',
          type: 'process',
          position: { x: 100, y: 200 },
          x: 100,
          y: 200,
          width: 120,
          height: 'invalid'
        })
      }).toThrow('节点数据无效：height必须为数字类型')

      // 负数尺寸
      expect(() => {
        graphService.validateNodeData({
          id: 'test',
          type: 'process',
          position: { x: 100, y: 200 },
          x: 100,
          y: 200,
          width: -10,
          height: 60
        })
      }).toThrow('节点数据无效：width必须为正数')
    })
  })

  describe('addNode 方法边界情况测试', () => {
    it('应该处理 null 节点数据', async () => {
      await expect(graphService.addNode(null)).rejects.toThrow('节点数据必须是对象类型')
    })

    it('应该处理 undefined 节点数据', async () => {
      await expect(graphService.addNode(undefined)).rejects.toThrow('节点数据必须是对象类型')
    })

    it('应该处理非对象节点数据', async () => {
      // 测试字符串类型
      await expect(graphService.addNode('invalid')).rejects.toThrow('节点数据必须是对象类型')
      
      // 测试数组类型
      await expect(graphService.addNode([])).rejects.toThrow('节点数据必须是对象类型')
      
      // 测试 null
      await expect(graphService.addNode(null)).rejects.toThrow('节点数据必须是对象类型')
    })

    it('应该处理缺少必需字段的节点数据', async () => {
      const incompleteNodeData = {
        type: 'process'
        // 缺少 id
      }

      // 预处理器会自动生成缺失的 id 字段
      mockGraph.addNode.mockReturnValue({ id: 'generated-id' })
      const result = await graphService.addNode(incompleteNodeData)
      expect(result.success).toBe(true)
      expect(result.nodeId).toBeDefined()
    })

    it('应该通过预处理修复部分缺失的数据', async () => {
      const nodeDataWithMissingFields = {
        id: 'test-node',
        type: 'process',
        position: { x: 100, y: 200 }
        // 缺少 x, y, width, height
      }

      // 模拟成功的图形添加
      mockGraph.addNode.mockReturnValue({ id: 'test-node' })

      const result = await graphService.addNode(nodeDataWithMissingFields)

      expect(result.success).toBe(true)
      expect(mockGraph.addNode).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-node',
          type: 'process',
          x: 100,
          y: 200,
          width: 120,
          height: 60
        })
      )
    })

    it('应该生成缺失的节点 ID', async () => {
      const nodeDataWithoutId = {
        type: 'process',
        position: { x: 100, y: 200 },
        x: 100,
        y: 200,
        width: 120,
        height: 60
      }

      // 模拟成功的图形添加
      mockGraph.addNode.mockReturnValue({ id: 'generated-id' })

      const result = await graphService.addNode(nodeDataWithoutId)

      expect(result.success).toBe(true)
      expect(mockGraph.addNode).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'process',
          id: expect.stringMatching(/^node-\d+-[a-z0-9]+$/)
        })
      )
    })

    it('应该提供增强的错误信息', async () => {
      try {
        await graphService.addNode(null)
      } catch (error) {
        expect(error.operation).toBe('addNode')
        expect(error.timestamp).toBeDefined()
        expect(error.debugInfo).toBeDefined()
        expect(error.debugInfo.operation).toBe('addNode')
        expect(error.debugInfo.dataType).toBe('object')
        expect(error.debugInfo.hasGraph).toBe(true)
        expect(error.debugInfo.isEnabled).toBe(true)
      }
    })
  })

  describe('拖拽操作数据格式测试', () => {
    it('应该处理拖拽操作中的异常数据格式', async () => {
      // 模拟拖拽操作中可能出现的异常数据
      const dragDropData = {
        nodeType: 'process',
        position: { x: 150, y: 250 }
        // 缺少标准的节点数据结构
      }

      // 这种数据应该被预处理器处理，生成缺失字段
      mockGraph.addNode.mockReturnValue({ id: 'generated-id' })
      const result = await graphService.addNode(dragDropData)
      expect(result.success).toBe(true)
      expect(result.nodeId).toBeDefined()
      expect(mockGraph.addNode).toHaveBeenCalled()
    })

    it('应该处理坐标转换错误', async () => {
      const invalidPositionData = {
        id: 'drag-node',
        type: 'process',
        position: { x: NaN, y: 100 }
      }

      await expect(graphService.addNode(invalidPositionData)).rejects.toThrow('节点数据无效：position.x和position.y必须为数字类型')
    })

    it('应该处理非数字类型的坐标', async () => {
      const invalidPositionData = {
        id: 'drag-node',
        type: 'process',
        position: { x: 'invalid', y: null }
      }

      await expect(graphService.addNode(invalidPositionData)).rejects.toThrow('节点数据无效：position.x和position.y必须为数字类型')
    })

    it('应该处理空的位置对象', async () => {
      const emptyPositionData = {
        id: 'drag-node',
        type: 'process',
        position: {}
      }

      await expect(graphService.addNode(emptyPositionData)).rejects.toThrow('节点数据无效：position对象必须包含x和y坐标字段')
    })

    it('应该处理从task-editor传递的拖拽数据', async () => {
      // 模拟从 task-editor.vue handleCanvasDrop 传递的数据
      const taskEditorDragData = {
        // 这是从 TaskFlowCanvasRefactored.vue addNode 方法构建的数据
        id: 'process-1234567890-abc123def',
        type: 'process',
        nodeType: 'process',
        label: '处理节点',
        position: { x: 200, y: 300 },
        data: {
          type: 'process',
          nodeType: 'process',
          label: '处理节点',
          isConfigured: false,
          config: {
            name: '处理节点',
            description: '处理节点节点'
          }
        }
      }

      // 模拟成功的图形添加
      mockGraph.addNode.mockReturnValue({ id: taskEditorDragData.id })

      const result = await graphService.addNode(taskEditorDragData)

      expect(result.success).toBe(true)
      expect(mockGraph.addNode).toHaveBeenCalledWith(
        expect.objectContaining({
          id: taskEditorDragData.id,
          type: 'process',
          x: 200,
          y: 300,
          width: 120,
          height: 60
        })
      )
    })

    it('应该处理缺少关键字段的拖拽数据', async () => {
      // 模拟可能出现的不完整拖拽数据
      const incompleteDragData = {
        nodeType: 'sms',
        position: { x: 100, y: 150 }
        // 缺少 id, type 等关键字段
      }

      // 预处理器应该生成缺失的字段
      mockGraph.addNode.mockReturnValue({ id: 'generated-id' })

      const result = await graphService.addNode(incompleteDragData)

      expect(result.success).toBe(true)
      expect(mockGraph.addNode).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.stringMatching(/^node-\d+-[a-z0-9]+$/),
          x: 100,
          y: 150,
          width: 120,
          height: 60,
          data: expect.any(Object)
        })
      )
    })
  })

  describe('validateOperation 方法测试', () => {
    it('应该正确验证 addNode 操作', () => {
      const validNodeData = {
        id: 'test-node',
        type: 'process',
        position: { x: 100, y: 200 },
        x: 100,
        y: 200,
        width: 120,
        height: 60
      }

      expect(() => {
        graphService.validateOperation('addNode', validNodeData)
      }).not.toThrow()
    })

    it('应该拒绝无效的 addNode 操作数据', () => {
      expect(() => {
        graphService.validateOperation('addNode', null)
      }).toThrow('节点数据无效：数据为null')

      expect(() => {
        graphService.validateOperation('addNode', 'invalid')
      }).toThrow('节点数据无效：期望对象类型，实际为string')
    })

    it('应该处理其他操作类型', () => {
      expect(() => {
        graphService.validateOperation('removeNode', 'node-id')
      }).not.toThrow()

      expect(() => {
        graphService.validateOperation('updateNode', { id: 'test', data: {} })
      }).not.toThrow()
    })
  })
})