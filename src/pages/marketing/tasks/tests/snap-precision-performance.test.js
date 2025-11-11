/**
 * 吸附精度和性能专项测试
 * 测试吸附功能的精度、性能和边界条件
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { InPortSnapDetector } from '../composables/canvas/core/InPortSnapDetector.js'
import { PreviewLineSystem } from '../composables/canvas/core/PreviewLineSystem.js'

describe('吸附精度和性能专项测试', () => {
  let mockGraph
  let snapDetector
  let previewLineSystem
  let performanceMonitor

  beforeEach(() => {
    // 性能监控器
    performanceMonitor = {
      startTime: 0,
      measurements: [],
      start() {
        this.startTime = performance.now()
      },
      end(label) {
        const duration = performance.now() - this.startTime
        this.measurements.push({ label, duration })
        return duration
      },
      getAverageDuration(label) {
        const filtered = this.measurements.filter(m => m.label === label)
        return filtered.reduce((sum, m) => sum + m.duration, 0) / filtered.length
      }
    }

    // 模拟 X6 图实例
    mockGraph = {
      getNodes: vi.fn(),
      getCellById: vi.fn(),
      addEdge: vi.fn(),
      removeCell: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    }

    // 初始化吸附检测器
    snapDetector = new InPortSnapDetector({
      graph: mockGraph,
      snapDistance: 20,
      enableCache: true
    })

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

  describe('吸附精度测试', () => {
    test('精确距离计算', () => {
      const port = { x: 100, y: 100 }
      const testCases = [
        { mouse: { x: 100, y: 100 }, expectedDistance: 0 },
        { mouse: { x: 103, y: 104 }, expectedDistance: 5 },
        { mouse: { x: 106, y: 108 }, expectedDistance: 10 },
        { mouse: { x: 112, y: 116 }, expectedDistance: 20 },
        { mouse: { x: 115, y: 120 }, expectedDistance: 25 }
      ]

      testCases.forEach(({ mouse, expectedDistance }) => {
        const distance = snapDetector.calculateDistance(mouse, port)
        expect(Math.abs(distance - expectedDistance)).toBeLessThan(0.1)
      })
    })

    test('边界距离吸附判断', () => {
      const node = {
        id: 'precision-node',
        position: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 }),
        getData: () => ({ nodeType: 'action', maxInConnections: 1 }),
        getInPorts: () => [{ id: 'in-port', position: { x: 160, y: 130 } }]
      }
      
      mockGraph.getNodes.mockReturnValue([node])
      mockGraph.getCellById.mockReturnValue(node)

      const testCases = [
        { mouse: { x: 160, y: 130 }, shouldSnap: true, description: '精确位置' },
        { mouse: { x: 165, y: 135 }, shouldSnap: true, description: '5像素内' },
        { mouse: { x: 170, y: 140 }, shouldSnap: true, description: '10像素内' },
        { mouse: { x: 175, y: 145 }, shouldSnap: true, description: '15像素内' },
        { mouse: { x: 180, y: 150 }, shouldSnap: true, description: '20像素边界' },
        { mouse: { x: 181, y: 151 }, shouldSnap: false, description: '超出20像素' },
        { mouse: { x: 190, y: 160 }, shouldSnap: false, description: '明显超出' }
      ]

      testCases.forEach(({ mouse, shouldSnap, description }) => {
        const snapTarget = snapDetector.detectSnapTarget(mouse, 'other-node')
        
        if (shouldSnap) {
          expect(snapTarget).toBeTruthy()
          expect(snapTarget.nodeId).toBe('precision-node')
        } else {
          expect(snapTarget).toBeNull()
        }
      })
    })

    test('多端口最近距离选择', () => {
      const node = {
        id: 'multi-port-node',
        position: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 }),
        getData: () => ({ nodeType: 'action', maxInConnections: 3 }),
        getInPorts: () => [
          { id: 'port-1', position: { x: 140, y: 120 } },
          { id: 'port-2', position: { x: 160, y: 130 } },
          { id: 'port-3', position: { x: 180, y: 140 } }
        ]
      }
      
      mockGraph.getNodes.mockReturnValue([node])
      mockGraph.getCellById.mockReturnValue(node)

      // 测试鼠标位置更接近port-2
      const mousePos = { x: 165, y: 135 }
      const snapTarget = snapDetector.detectSnapTarget(mousePos, 'other-node')
      
      expect(snapTarget).toBeTruthy()
      expect(snapTarget.portId).toBe('port-2')
      expect(snapTarget.distance).toBeLessThan(10)
    })

    test('亚像素精度处理', () => {
      const node = {
        id: 'subpixel-node',
        position: () => ({ x: 100.5, y: 100.7 }),
        getSize: () => ({ width: 120, height: 60 }),
        getData: () => ({ nodeType: 'action', maxInConnections: 1 }),
        getInPorts: () => [{ id: 'port', position: { x: 160.3, y: 130.9 } }]
      }
      
      mockGraph.getNodes.mockReturnValue([node])
      mockGraph.getCellById.mockReturnValue(node)

      const mousePos = { x: 160.8, y: 131.4 }
      const snapTarget = snapDetector.detectSnapTarget(mousePos, 'other-node')
      
      expect(snapTarget).toBeTruthy()
      expect(snapTarget.distance).toBeLessThan(1)
      
      // 验证吸附位置的精度
      expect(snapTarget.position.x).toBeCloseTo(160.3, 1)
      expect(snapTarget.position.y).toBeCloseTo(130.9, 1)
    })
  })

  describe('性能基准测试', () => {
    test('单次吸附检测性能', () => {
      const nodes = Array.from({ length: 50 }, (_, i) => ({
        id: `perf-node-${i}`,
        position: () => ({ x: (i % 10) * 150, y: Math.floor(i / 10) * 100 }),
        getSize: () => ({ width: 120, height: 60 }),
        getData: () => ({ nodeType: 'action', maxInConnections: 1 }),
        getInPorts: () => [{ id: `port-${i}`, position: { x: (i % 10) * 150 + 60, y: Math.floor(i / 10) * 100 + 30 } }]
      }))
      
      mockGraph.getNodes.mockReturnValue(nodes)

      const mousePos = { x: 200, y: 150 }
      
      performanceMonitor.start()
      const snapTarget = snapDetector.detectSnapTarget(mousePos, 'source-node')
      const duration = performanceMonitor.end('single-detection')
      
      // 单次检测应在5ms内完成
      expect(duration).toBeLessThan(5)
      expect(snapTarget).toBeTruthy()
    })

    test('批量吸附检测性能', () => {
      const nodes = Array.from({ length: 100 }, (_, i) => ({
        id: `batch-node-${i}`,
        position: () => ({ x: (i % 10) * 150, y: Math.floor(i / 10) * 100 }),
        getSize: () => ({ width: 120, height: 60 }),
        getData: () => ({ nodeType: 'action', maxInConnections: 1 }),
        getInPorts: () => [{ id: `port-${i}`, position: { x: (i % 10) * 150 + 60, y: Math.floor(i / 10) * 100 + 30 } }]
      }))
      
      mockGraph.getNodes.mockReturnValue(nodes)

      const positions = Array.from({ length: 20 }, (_, i) => ({
        x: 200 + i * 10,
        y: 150 + i * 5
      }))
      
      performanceMonitor.start()
      const results = snapDetector.batchDetectSnapTargets(positions, 'source-node')
      const duration = performanceMonitor.end('batch-detection')
      
      // 20个位置的批量检测应在50ms内完成
      expect(duration).toBeLessThan(50)
      expect(results).toHaveLength(20)
    })

    test('缓存性能提升验证', () => {
      const nodes = Array.from({ length: 30 }, (_, i) => ({
        id: `cache-node-${i}`,
        position: () => ({ x: i * 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 }),
        getData: () => ({ nodeType: 'action', maxInConnections: 1 }),
        getInPorts: () => [{ id: `port-${i}`, position: { x: i * 100 + 60, y: 130 } }]
      }))
      
      mockGraph.getNodes.mockReturnValue(nodes)

      const mousePos = { x: 200, y: 150 }
      
      // 第一次检测（无缓存）
      performanceMonitor.start()
      snapDetector.detectSnapTarget(mousePos, 'source-node')
      const firstDuration = performanceMonitor.end('first-detection')
      
      // 第二次检测（有缓存）
      performanceMonitor.start()
      snapDetector.detectSnapTarget(mousePos, 'source-node')
      const cachedDuration = performanceMonitor.end('cached-detection')
      
      // 缓存检测应该明显更快
      expect(cachedDuration).toBeLessThan(firstDuration * 0.5)
    })

    test('高频更新性能', () => {
      const node = {
        id: 'high-freq-node',
        position: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 }),
        getData: () => ({ nodeType: 'action', maxInConnections: 1 }),
        getInPorts: () => [{ id: 'port', position: { x: 160, y: 130 } }]
      }
      
      mockGraph.getNodes.mockReturnValue([node])
      mockGraph.getCellById.mockReturnValue(node)

      // 模拟60fps的高频更新
      const updateCount = 60
      const positions = Array.from({ length: updateCount }, (_, i) => ({
        x: 150 + Math.sin(i * 0.1) * 20,
        y: 125 + Math.cos(i * 0.1) * 15
      }))
      
      performanceMonitor.start()
      
      positions.forEach(pos => {
        snapDetector.detectSnapTarget(pos, 'source-node')
      })
      
      const totalDuration = performanceMonitor.end('high-frequency-updates')
      const avgDuration = totalDuration / updateCount
      
      // 平均每次更新应在0.5ms内完成
      expect(avgDuration).toBeLessThan(0.5)
      
      // 总时间应在30ms内完成（60fps要求16.67ms每帧）
      expect(totalDuration).toBeLessThan(30)
    })
  })

  describe('内存使用优化测试', () => {
    test('缓存大小限制', () => {
      const nodes = Array.from({ length: 10 }, (_, i) => ({
        id: `memory-node-${i}`,
        position: () => ({ x: i * 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 }),
        getData: () => ({ nodeType: 'action', maxInConnections: 1 }),
        getInPorts: () => [{ id: `port-${i}`, position: { x: i * 100 + 60, y: 130 } }]
      }))
      
      mockGraph.getNodes.mockReturnValue(nodes)

      // 创建大量不同的检测请求
      for (let i = 0; i < 200; i++) {
        const mousePos = { x: 100 + i, y: 100 + i }
        snapDetector.detectSnapTarget(mousePos, 'source-node')
      }
      
      // 缓存大小应该有合理限制
      expect(snapDetector.snapCache.size).toBeLessThan(100)
    })

    test('过期缓存清理', () => {
      const node = {
        id: 'cleanup-node',
        position: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 }),
        getData: () => ({ nodeType: 'action', maxInConnections: 1 }),
        getInPorts: () => [{ id: 'port', position: { x: 160, y: 130 } }]
      }
      
      mockGraph.getNodes.mockReturnValue([node])

      // 添加一些缓存项
      for (let i = 0; i < 10; i++) {
        snapDetector.detectSnapTarget({ x: 150 + i, y: 125 + i }, 'source-node')
      }
      
      const initialCacheSize = snapDetector.snapCache.size
      expect(initialCacheSize).toBeGreaterThan(0)
      
      // 等待缓存过期并清理
      setTimeout(() => {
        snapDetector.cleanupExpiredCache()
        expect(snapDetector.snapCache.size).toBeLessThan(initialCacheSize)
      }, 150) // 假设缓存过期时间为100ms
    })
  })

  describe('边界条件和异常处理', () => {
    test('极端坐标值处理', () => {
      const node = {
        id: 'extreme-node',
        position: () => ({ x: 0, y: 0 }),
        getSize: () => ({ width: 120, height: 60 }),
        getData: () => ({ nodeType: 'action', maxInConnections: 1 }),
        getInPorts: () => [{ id: 'port', position: { x: 60, y: 30 } }]
      }
      
      mockGraph.getNodes.mockReturnValue([node])

      const extremePositions = [
        { x: -1000000, y: -1000000 },
        { x: 1000000, y: 1000000 },
        { x: 0, y: 0 },
        { x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER },
        { x: Number.MIN_SAFE_INTEGER, y: Number.MIN_SAFE_INTEGER }
      ]
      
      extremePositions.forEach(pos => {
        expect(() => {
          snapDetector.detectSnapTarget(pos, 'source-node')
        }).not.toThrow()
      })
    })

    test('NaN和Infinity值处理', () => {
      const node = {
        id: 'nan-node',
        position: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 }),
        getData: () => ({ nodeType: 'action', maxInConnections: 1 }),
        getInPorts: () => [{ id: 'port', position: { x: 160, y: 130 } }]
      }
      
      mockGraph.getNodes.mockReturnValue([node])

      const invalidPositions = [
        { x: NaN, y: 100 },
        { x: 100, y: NaN },
        { x: Infinity, y: 100 },
        { x: 100, y: Infinity },
        { x: -Infinity, y: -Infinity }
      ]
      
      invalidPositions.forEach(pos => {
        const result = snapDetector.detectSnapTarget(pos, 'source-node')
        expect(result).toBeNull()
      })
    })

    test('大量节点性能降级', () => {
      // 创建大量节点（1000个）
      const largeNodeSet = Array.from({ length: 1000 }, (_, i) => ({
        id: `large-node-${i}`,
        position: () => ({ x: (i % 50) * 30, y: Math.floor(i / 50) * 30 }),
        getSize: () => ({ width: 20, height: 20 }),
        getData: () => ({ nodeType: 'action', maxInConnections: 1 }),
        getInPorts: () => [{ id: `port-${i}`, position: { x: (i % 50) * 30 + 10, y: Math.floor(i / 50) * 30 + 10 } }]
      }))
      
      mockGraph.getNodes.mockReturnValue(largeNodeSet)

      const mousePos = { x: 500, y: 300 }
      
      performanceMonitor.start()
      const snapTarget = snapDetector.detectSnapTarget(mousePos, 'source-node')
      const duration = performanceMonitor.end('large-dataset-detection')
      
      // 即使有1000个节点，检测时间也应该在合理范围内（50ms）
      expect(duration).toBeLessThan(50)
    })
  })

  describe('精度配置测试', () => {
    test('不同吸附距离配置', () => {
      const node = {
        id: 'config-node',
        position: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 }),
        getData: () => ({ nodeType: 'action', maxInConnections: 1 }),
        getInPorts: () => [{ id: 'port', position: { x: 160, y: 130 } }]
      }
      
      mockGraph.getNodes.mockReturnValue([node])

      const distances = [5, 10, 15, 20, 25, 30]
      const mousePos = { x: 175, y: 145 } // 距离端口约21.2像素
      
      distances.forEach(distance => {
        const detector = new InPortSnapDetector({
          graph: mockGraph,
          snapDistance: distance
        })
        
        const snapTarget = detector.detectSnapTarget(mousePos, 'source-node')
        
        if (distance >= 22) {
          expect(snapTarget).toBeTruthy()
        } else {
          expect(snapTarget).toBeNull()
        }
        
        detector.destroy()
      })
    })

    test('动态调整吸附精度', () => {
      const node = {
        id: 'dynamic-node',
        position: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 }),
        getData: () => ({ nodeType: 'action', maxInConnections: 1 }),
        getInPorts: () => [{ id: 'port', position: { x: 160, y: 130 } }]
      }
      
      mockGraph.getNodes.mockReturnValue([node])

      const mousePos = { x: 175, y: 145 }
      
      // 初始配置
      expect(snapDetector.detectSnapTarget(mousePos, 'source-node')).toBeNull()
      
      // 动态调整吸附距离
      snapDetector.updateOptions({ snapDistance: 25 })
      expect(snapDetector.detectSnapTarget(mousePos, 'source-node')).toBeTruthy()
      
      // 再次调整
      snapDetector.updateOptions({ snapDistance: 15 })
      expect(snapDetector.detectSnapTarget(mousePos, 'source-node')).toBeNull()
    })
  })
})