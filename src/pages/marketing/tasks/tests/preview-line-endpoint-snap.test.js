/**
 * 预览线终点吸附功能测试
 * 测试预览线终点与节点端口的吸附检测、视觉反馈和自动连接功能
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { InPortSnapDetector } from '../composables/canvas/core/InPortSnapDetector.js'
import { PreviewLineSystem } from '../composables/canvas/core/PreviewLineSystem.js'

describe('预览线终点吸附功能测试', () => {
  let mockGraph
  let snapDetector
  let previewLineSystem
  let mockNodes
  let mockPreviewLines

  beforeEach(() => {
    // 模拟 X6 图实例
    mockGraph = {
      getNodes: vi.fn(),
      getCellById: vi.fn(),
      addEdge: vi.fn(),
      removeCell: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      trigger: vi.fn()
    }

    // 模拟节点数据
    mockNodes = [
      {
        id: 'node-1',
        position: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 }),
        getData: () => ({ nodeType: 'condition', maxInConnections: 1 }),
        getInPorts: () => [{ id: 'in-port-1', position: { x: 160, y: 130 } }]
      },
      {
        id: 'node-2', 
        position: () => ({ x: 300, y: 200 }),
        getSize: () => ({ width: 120, height: 60 }),
        getData: () => ({ nodeType: 'action', maxInConnections: 2 }),
        getInPorts: () => [{ id: 'in-port-2', position: { x: 360, y: 230 } }]
      }
    ]

    // 模拟预览线数据
    mockPreviewLines = [
      {
        id: 'preview-1',
        getSourceCellId: () => 'node-1',
        getTargetPoint: () => ({ x: 350, y: 225 }),
        setTargetPoint: vi.fn(),
        attr: vi.fn()
      }
    ]

    mockGraph.getNodes.mockReturnValue(mockNodes)
    mockGraph.getCellById.mockImplementation(id => {
      if (id.startsWith('node-')) {
        return mockNodes.find(node => node.id === id)
      }
      if (id.startsWith('preview-')) {
        return mockPreviewLines.find(line => line.id === id)
      }
      return null
    })

    // 初始化吸附检测器
    snapDetector = new InPortSnapDetector({
      graph: mockGraph,
      snapDistance: 20,
      enableCache: true
    })

    // 初始化预览线系统
    previewLineSystem = new PreviewLineSystem({
      graph: mockGraph,
      snapDetector: snapDetector
    })
  })

  afterEach(() => {
    snapDetector?.destroy()
    previewLineSystem?.destroy()
    vi.clearAllMocks()
  })

  describe('吸附检测基础功能', () => {
    test('应该正确检测到吸附目标', () => {
      const mousePosition = { x: 365, y: 235 } // 接近 node-2 的输入端口
      
      const snapTarget = snapDetector.detectSnapTarget(mousePosition, 'node-1')
      
      expect(snapTarget).toBeTruthy()
      expect(snapTarget.nodeId).toBe('node-2')
      expect(snapTarget.portId).toBe('in-port-2')
      expect(snapTarget.distance).toBeLessThan(20)
    })

    test('应该在超出吸附距离时返回null', () => {
      const mousePosition = { x: 400, y: 300 } // 远离所有端口
      
      const snapTarget = snapDetector.detectSnapTarget(mousePosition, 'node-1')
      
      expect(snapTarget).toBeNull()
    })

    test('应该排除源节点自身', () => {
      const mousePosition = { x: 165, y: 135 } // 接近 node-1 的端口
      
      const snapTarget = snapDetector.detectSnapTarget(mousePosition, 'node-1')
      
      expect(snapTarget).toBeNull()
    })

    test('应该检测最近的吸附目标', () => {
      // 添加第三个节点，距离更远
      const node3 = {
        id: 'node-3',
        position: () => ({ x: 350, y: 250 }),
        getSize: () => ({ width: 120, height: 60 }),
        getData: () => ({ nodeType: 'action', maxInConnections: 1 }),
        getInPorts: () => [{ id: 'in-port-3', position: { x: 410, y: 280 } }]
      }
      mockNodes.push(node3)
      
      const mousePosition = { x: 365, y: 235 }
      
      const snapTarget = snapDetector.detectSnapTarget(mousePosition, 'node-1')
      
      expect(snapTarget.nodeId).toBe('node-2') // 应该选择更近的 node-2
    })
  })

  describe('视觉反馈功能', () => {
    test('应该显示吸附视觉反馈', () => {
      const snapTarget = {
        nodeId: 'node-2',
        portId: 'in-port-2',
        position: { x: 360, y: 230 },
        distance: 15
      }
      
      snapDetector.showSnapFeedback(snapTarget)
      
      // 验证节点样式更新
      const targetNode = mockGraph.getCellById('node-2')
      expect(targetNode.attr).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            stroke: '#1890ff',
            strokeWidth: 2
          })
        })
      )
    })

    test('应该清除吸附视觉反馈', () => {
      // 先显示反馈
      const snapTarget = {
        nodeId: 'node-2',
        portId: 'in-port-2',
        position: { x: 360, y: 230 },
        distance: 15
      }
      snapDetector.showSnapFeedback(snapTarget)
      
      // 然后清除
      snapDetector.clearSnapFeedback()
      
      // 验证样式重置
      const targetNode = mockGraph.getCellById('node-2')
      expect(targetNode.attr).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            stroke: '#d9d9d9',
            strokeWidth: 1
          })
        })
      )
    })
  })

  describe('吸附执行功能', () => {
    test('应该执行吸附操作', () => {
      const snapTarget = {
        nodeId: 'node-2',
        portId: 'in-port-2',
        position: { x: 360, y: 230 },
        distance: 15
      }
      const previewLine = mockPreviewLines[0]
      
      const result = snapDetector.performSnap(snapTarget, previewLine)
      
      expect(result.success).toBe(true)
      expect(result.position).toEqual({ x: 360, y: 230 })
      expect(result.snapped).toBe(true)
      expect(previewLine.setTargetPoint).toHaveBeenCalledWith({ x: 360, y: 230 })
    })

    test('应该处理吸附执行失败', () => {
      const snapTarget = {
        nodeId: 'invalid-node',
        portId: 'invalid-port',
        position: { x: 360, y: 230 },
        distance: 15
      }
      const previewLine = mockPreviewLines[0]
      
      const result = snapDetector.performSnap(snapTarget, previewLine)
      
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })
  })

  describe('批量检测功能', () => {
    test('应该批量检测多个位置的吸附目标', () => {
      const positions = [
        { x: 365, y: 235 }, // 接近 node-2
        { x: 400, y: 300 }, // 远离所有节点
        { x: 165, y: 135 }  // 接近 node-1 (应被排除)
      ]
      
      const results = snapDetector.batchDetectSnapTargets(positions, 'node-1')
      
      expect(results).toHaveLength(3)
      expect(results[0]).toBeTruthy() // 第一个位置有吸附目标
      expect(results[1]).toBeNull()   // 第二个位置无吸附目标
      expect(results[2]).toBeNull()   // 第三个位置被排除
    })
  })

  describe('缓存机制', () => {
    test('应该缓存吸附结果', () => {
      const mousePosition = { x: 365, y: 235 }
      
      // 第一次检测
      const result1 = snapDetector.detectSnapTarget(mousePosition, 'node-1')
      
      // 第二次检测（应使用缓存）
      const result2 = snapDetector.detectSnapTarget(mousePosition, 'node-1')
      
      expect(result1).toEqual(result2)
      expect(snapDetector.snapCache.size).toBeGreaterThan(0)
    })

    test('应该清理过期缓存', () => {
      const mousePosition = { x: 365, y: 235 }
      
      // 添加一些缓存
      snapDetector.detectSnapTarget(mousePosition, 'node-1')
      
      // 手动设置过期时间
      const cacheKey = `${mousePosition.x},${mousePosition.y},node-1`
      const cached = snapDetector.snapCache.get(cacheKey)
      if (cached) {
        cached.timestamp = Date.now() - 200 // 设为过期
      }
      
      // 清理过期缓存
      snapDetector.cleanupExpiredCache()
      
      expect(snapDetector.snapCache.has(cacheKey)).toBe(false)
    })
  })

  describe('性能测试', () => {
    test('大量节点时的吸附检测性能', () => {
      // 创建大量节点
      const largeNodeSet = []
      for (let i = 0; i < 100; i++) {
        largeNodeSet.push({
          id: `perf-node-${i}`,
          position: () => ({ x: (i % 10) * 150, y: Math.floor(i / 10) * 100 }),
          getSize: () => ({ width: 120, height: 60 }),
          getData: () => ({ nodeType: 'action', maxInConnections: 1 }),
          getInPorts: () => [{ id: `in-port-${i}`, position: { x: (i % 10) * 150 + 60, y: Math.floor(i / 10) * 100 + 30 } }]
        })
      }
      mockGraph.getNodes.mockReturnValue(largeNodeSet)
      
      const startTime = performance.now()
      
      // 执行多次检测
      for (let i = 0; i < 50; i++) {
        snapDetector.detectSnapTarget({ x: 200 + i, y: 150 + i }, 'perf-node-0')
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // 性能要求：50次检测应在100ms内完成
      expect(duration).toBeLessThan(100)
    })
  })

  describe('边界条件测试', () => {
    test('应该处理无效的鼠标位置', () => {
      const invalidPositions = [
        null,
        undefined,
        {},
        { x: null, y: 100 },
        { x: 100, y: null },
        { x: 'invalid', y: 100 }
      ]
      
      invalidPositions.forEach(position => {
        const result = snapDetector.detectSnapTarget(position, 'node-1')
        expect(result).toBeNull()
      })
    })

    test('应该处理节点无输入端口的情况', () => {
      const nodeWithoutPorts = {
        id: 'no-ports-node',
        position: () => ({ x: 500, y: 300 }),
        getSize: () => ({ width: 120, height: 60 }),
        getData: () => ({ nodeType: 'start', maxInConnections: 0 }),
        getInPorts: () => []
      }
      mockNodes.push(nodeWithoutPorts)
      
      const mousePosition = { x: 560, y: 330 } // 接近无端口节点
      
      const snapTarget = snapDetector.detectSnapTarget(mousePosition, 'node-1')
      
      expect(snapTarget).toBeNull()
    })

    test('应该处理连接数已满的节点', () => {
      // 模拟 node-2 已达到最大连接数
      const node2 = mockNodes.find(n => n.id === 'node-2')
      node2.getData = () => ({ 
        nodeType: 'action', 
        maxInConnections: 1,
        currentInConnections: 1 // 已达上限
      })
      
      const mousePosition = { x: 365, y: 235 }
      
      const snapTarget = snapDetector.detectSnapTarget(mousePosition, 'node-1')
      
      expect(snapTarget).toBeNull()
    })
  })

  describe('集成测试', () => {
    test('应该与预览线系统集成工作', () => {
      const mousePosition = { x: 365, y: 235 }
      
      // 模拟预览线系统的吸附检查
      const snapResult = previewLineSystem.checkNodeSnapToPreviewLines('node-2', mousePosition)
      
      expect(snapResult).toBeTruthy()
      expect(snapResult.canSnap).toBe(true)
      expect(snapResult.snapPosition).toEqual({ x: 360, y: 230 })
    })

    test('应该触发正确的事件', () => {
      const eventSpy = vi.fn()
      snapDetector.on = vi.fn()
      snapDetector.emit = vi.fn()
      
      const snapTarget = {
        nodeId: 'node-2',
        portId: 'in-port-2',
        position: { x: 360, y: 230 },
        distance: 15
      }
      
      snapDetector.performSnap(snapTarget, mockPreviewLines[0])
      
      // 验证事件触发
      expect(snapDetector.emit).toHaveBeenCalledWith('snap:performed', expect.any(Object))
    })
  })
})