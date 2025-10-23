/**
 * GraphService 边界情况和异常处理测试
 * 专门测试各种异常情况、边界条件和错误处理逻辑
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
  getCellById: vi.fn(),
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

describe('GraphService 边界情况和异常处理测试', () => {
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

  describe('拖拽操作异常数据处理测试', () => {
    it('应该处理拖拽时传入null数据的情况', async () => {
      await expect(graphService.addNode(null)).rejects.toThrow('节点数据必须是对象类型')
    })

    it('应该处理拖拽时传入undefined数据的情况', async () => {
      await expect(graphService.addNode(undefined)).rejects.toThrow('节点数据必须是对象类型')
    })

    it('应该处理拖拽时坐标转换失败的情况', async () => {
      const invalidCoordinateData = {
        id: 'drag-node-1',
        type: 'process',
        position: { x: 'invalid', y: 'invalid' }
      }

      await expect(graphService.addNode(invalidCoordinateData)).rejects.toThrow(
        '节点数据无效：position.x和position.y必须为数字类型'
      )
    })

    it('应该处理拖拽时坐标为NaN的情况', async () => {
      const nanCoordinateData = {
        id: 'drag-node-2',
        type: 'process',
        position: { x: NaN, y: 100 }
      }

      await expect(graphService.addNode(nanCoordinateData)).rejects.toThrow(
        '节点数据无效：position坐标不能为NaN或Infinity'
      )
    })

    it('应该处理拖拽时坐标为Infinity的情况', async () => {
      const infinityCoordinateData = {
        id: 'drag-node-3',
        type: 'process',
        position: { x: Infinity, y: 200 }
      }

      await expect(graphService.addNode(infinityCoordinateData)).rejects.toThrow(
        '节点数据无效：position坐标不能为NaN或Infinity'
      )
    })

    it('应该处理拖拽时缺少position字段的情况', async () => {
      const noPositionData = {
        id: 'drag-node-4',
        type: 'process'
        // 缺少position字段
      }

      // 这种情况应该被预处理器处理，生成默认坐标
      mockGraph.addNode.mockReturnValue({ id: 'drag-node-4' })
      const result = await graphService.addNode(noPositionData)
      expect(result.success).toBe(true)
    })

    it('应该处理拖拽时position对象为空的情况', async () => {
      const emptyPositionData = {
        id: 'drag-node-5',
        type: 'process',
        position: {}
      }

      await expect(graphService.addNode(emptyPositionData)).rejects.toThrow(
        '节点数据无效：position对象必须包含x和y坐标字段'
      )
    })

    it('应该处理拖拽时position为null的情况', async () => {
      const nullPositionData = {
        id: 'drag-node-6',
        type: 'process',
        position: null
      }

      await expect(graphService.addNode(nullPositionData)).rejects.toThrow(
        '节点数据无效：position字段必须为对象类型'
      )
    })
  })

  describe('数据类型异常处理测试', () => {
    it('应该处理字符串类型的节点数据', async () => {
      await expect(graphService.addNode('invalid-string')).rejects.toThrow(
        '节点数据必须是对象类型'
      )
    })

    it('应该处理数字类型的节点数据', async () => {
      await expect(graphService.addNode(123)).rejects.toThrow(
        '节点数据必须是对象类型'
      )
    })

    it('应该处理布尔类型的节点数据', async () => {
      await expect(graphService.addNode(true)).rejects.toThrow(
        '节点数据必须是对象类型'
      )
    })

    it('应该处理数组类型的节点数据', async () => {
      await expect(graphService.addNode([{ id: 'test' }])).rejects.toThrow(
        '节点数据无效：不能是数组类型'
      )
    })

    it('应该处理函数类型的节点数据', async () => {
      await expect(graphService.addNode(() => {})).rejects.toThrow(
        '节点数据必须是对象类型'
      )
    })
  })

  describe('节点ID异常处理测试', () => {
    it('应该处理缺少id字段的节点数据', async () => {
      const noIdData = {
        type: 'process',
        position: { x: 100, y: 200 }
      }

      // 预处理器应该生成id
      mockGraph.addNode.mockReturnValue({ id: 'generated-id' })
      const result = await graphService.addNode(noIdData)
      expect(result.success).toBe(true)
    })

    it('应该处理id为空字符串的节点数据', async () => {
      const emptyIdData = {
        id: '',
        type: 'process',
        position: { x: 100, y: 200 }
      }

      await expect(graphService.addNode(emptyIdData)).rejects.toThrow(
        '节点数据无效：缺少必要字段 id'
      )
    })

    it('应该处理id为空白字符串的节点数据', async () => {
      const whitespaceIdData = {
        id: '   ',
        type: 'process',
        position: { x: 100, y: 200 }
      }

      await expect(graphService.addNode(whitespaceIdData)).rejects.toThrow(
        '节点数据无效：id字段不能为空字符串'
      )
    })

    it('应该处理id为数字类型的节点数据', async () => {
      const numericIdData = {
        id: 123,
        type: 'process',
        position: { x: 100, y: 200 }
      }

      await expect(graphService.addNode(numericIdData)).rejects.toThrow(
        '节点数据无效：id字段必须为字符串类型'
      )
    })

    it('应该处理id为对象类型的节点数据', async () => {
      const objectIdData = {
        id: { value: 'test' },
        type: 'process',
        position: { x: 100, y: 200 }
      }

      await expect(graphService.addNode(objectIdData)).rejects.toThrow(
        '节点数据无效：id字段必须为字符串类型'
      )
    })
  })

  describe('坐标数据异常处理测试', () => {
    it('应该处理x坐标为字符串的情况', async () => {
      const invalidXData = {
        id: 'test-node',
        type: 'process',
        x: 'invalid',
        y: 200
      }

      await expect(graphService.addNode(invalidXData)).rejects.toThrow(
        '节点数据无效：x坐标必须为数字类型'
      )
    })

    it('应该处理y坐标为字符串的情况', async () => {
      const invalidYData = {
        id: 'test-node',
        type: 'process',
        x: 100,
        y: 'invalid'
      }

      await expect(graphService.addNode(invalidYData)).rejects.toThrow(
        '节点数据无效：y坐标必须为数字类型'
      )
    })

    it('应该处理x坐标为NaN的情况', async () => {
      const nanXData = {
        id: 'test-node',
        type: 'process',
        x: NaN,
        y: 200
      }

      await expect(graphService.addNode(nanXData)).rejects.toThrow(
        '节点数据无效：x坐标必须为有效数字'
      )
    })

    it('应该处理y坐标为Infinity的情况', async () => {
      const infinityYData = {
        id: 'test-node',
        type: 'process',
        x: 100,
        y: Infinity
      }

      await expect(graphService.addNode(infinityYData)).rejects.toThrow(
        '节点数据无效：y坐标必须为有效数字'
      )
    })
  })

  describe('尺寸数据异常处理测试', () => {
    it('应该处理width为字符串的情况', async () => {
      const invalidWidthData = {
        id: 'test-node',
        type: 'process',
        x: 100,
        y: 200,
        width: 'invalid',
        height: 60
      }

      await expect(graphService.addNode(invalidWidthData)).rejects.toThrow(
        '节点数据无效：width必须为数字类型'
      )
    })

    it('应该处理height为负数的情况', async () => {
      const negativeHeightData = {
        id: 'test-node',
        type: 'process',
        x: 100,
        y: 200,
        width: 120,
        height: -60
      }

      await expect(graphService.addNode(negativeHeightData)).rejects.toThrow(
        '节点数据无效：height必须为正数'
      )
    })

    it('应该处理width为0的情况', async () => {
      const zeroWidthData = {
        id: 'test-node',
        type: 'process',
        x: 100,
        y: 200,
        width: 0,
        height: 60
      }

      await expect(graphService.addNode(zeroWidthData)).rejects.toThrow(
        '节点数据无效：width必须为正数'
      )
    })

    it('应该处理height为NaN的情况', async () => {
      const nanHeightData = {
        id: 'test-node',
        type: 'process',
        x: 100,
        y: 200,
        width: 120,
        height: NaN
      }

      await expect(graphService.addNode(nanHeightData)).rejects.toThrow(
        '节点数据无效：height必须为正数'
      )
    })
  })

  describe('错误信息增强测试', () => {
    it('应该提供详细的错误调试信息', async () => {
      try {
        await graphService.addNode(null)
        expect.fail('应该抛出错误')
      } catch (error) {
        expect(error.operation).toBe('addNode')
        expect(error.timestamp).toBeDefined()
        expect(error.debugInfo).toBeDefined()
        expect(error.debugInfo.operation).toBe('addNode')
        expect(error.debugInfo.dataType).toBe('object')
        expect(error.debugInfo.dataValue).toBe('null')
        expect(error.debugInfo.hasGraph).toBe(true)
        expect(error.debugInfo.isEnabled).toBe(true)
        expect(error.suggestions).toBeDefined()
        expect(Array.isArray(error.suggestions)).toBe(true)
        expect(error.suggestions.length).toBeGreaterThan(0)
      }
    })

    it('应该为不同类型的错误提供相应的修复建议', async () => {
      // 测试null数据的建议
      try {
        await graphService.addNode(null)
        expect.fail('应该抛出错误')
      } catch (error) {
        expect(error.suggestions).toContain('确保传入有效的节点数据对象，不能为null或undefined')
      }

      // 测试数组数据的建议
      try {
        await graphService.addNode([])
        expect.fail('应该抛出错误')
      } catch (error) {
        expect(error.suggestions).toContain('节点数据不能是数组，应该是单个对象')
      }

      // 测试字符串数据的建议
      try {
        await graphService.addNode('invalid')
        expect.fail('应该抛出错误')
      } catch (error) {
        expect(error.suggestions).toContain('节点数据必须是对象类型，当前类型为string')
      }
    })

    it('应该为节点数据提供特殊的调试信息', async () => {
      const invalidNodeData = {
        type: 'process',
        position: { x: 'invalid', y: 100 }
      }

      try {
        await graphService.addNode(invalidNodeData)
        expect.fail('应该抛出错误')
      } catch (error) {
        expect(error.debugInfo.nodeDataKeys).toEqual(['type', 'position'])
        expect(error.debugInfo.hasId).toBe(false)
        expect(error.debugInfo.hasPosition).toBe(true)
        expect(error.debugInfo.hasCoordinates).toBe(false)
        expect(error.debugInfo.positionType).toBe('object')
      }
    })
  })

  describe('服务状态异常处理测试', () => {
    it('应该处理服务被禁用的情况', async () => {
      graphService.setEnabled(false)

      await expect(graphService.addNode({
        id: 'test-node',
        type: 'process',
        x: 100,
        y: 200
      })).rejects.toThrow('GraphService已禁用')
    })

    it('应该处理图实例不存在的情况', async () => {
      graphService.initialize(null)

      await expect(graphService.addNode({
        id: 'test-node',
        type: 'process',
        x: 100,
        y: 200
      })).rejects.toThrow('图实例不存在')
    })

    it('应该处理验证被禁用的情况', async () => {
      graphService.config.enableValidation = false
      mockGraph.addNode.mockReturnValue({ id: 'test-node' })

      // 验证被禁用时，即使数据无效也应该能够添加
      const result = await graphService.addNode(null)
      expect(result.success).toBe(true)
    })
  })

  describe('复杂异常场景测试', () => {
    it('应该处理同时包含多种错误的节点数据', async () => {
      const multiErrorData = {
        id: 123, // 错误：id不是字符串
        type: null, // 错误：type不是字符串
        position: { x: 'invalid', y: NaN }, // 错误：坐标无效
        width: -10, // 错误：宽度为负数
        height: 'invalid' // 错误：高度不是数字
      }

      // 应该捕获第一个遇到的错误（id类型错误）
      await expect(graphService.addNode(multiErrorData)).rejects.toThrow(
        '节点数据无效：id字段必须为字符串类型'
      )
    })

    it('应该处理嵌套对象中的异常数据', async () => {
      const nestedErrorData = {
        id: 'test-node',
        type: 'process',
        position: {
          x: 100,
          y: 200,
          nested: {
            invalid: 'data'
          }
        },
        data: {
          config: null,
          settings: undefined
        }
      }

      // 应该能够处理包含额外嵌套数据的节点
      mockGraph.addNode.mockReturnValue({ id: 'test-node' })
      const result = await graphService.addNode(nestedErrorData)
      expect(result.success).toBe(true)
    })

    it('应该处理循环引用的节点数据', async () => {
      const circularData = {
        id: 'test-node',
        type: 'process',
        x: 100,
        y: 200
      }
      circularData.self = circularData // 创建循环引用

      mockGraph.addNode.mockReturnValue({ id: 'test-node' })
      const result = await graphService.addNode(circularData)
      expect(result.success).toBe(true)
    })
  })
})