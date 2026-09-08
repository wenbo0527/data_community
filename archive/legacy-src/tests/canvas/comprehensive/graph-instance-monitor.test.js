/**
 * Graph实例监控机制测试
 * 测试GraphInstanceMonitor和AsyncInitializationConfirm的功能
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { 
  GraphInstanceMonitor, 
  AsyncInitializationConfirm,
  graphInstanceMonitor,
  asyncInitializationConfirm,
  createGraphInstanceMonitor
} from '../../../pages/marketing/tasks/utils/canvas/GraphInstanceMonitor.js'

// Mock logger
vi.mock('../../../../../utils/enhancedErrorHandler.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}))

// 创建模拟Graph实例
const createMockGraph = (options = {}) => ({
  id: `graph-${Date.now()}`,
  container: options.container || document.createElement('div'),
  addNode: vi.fn(),
  removeNode: vi.fn(),
  addEdge: vi.fn(),
  removeEdge: vi.fn(),
  getCells: vi.fn(() => options.cells || []),
  dispose: vi.fn(),
  ...options
})

describe('GraphInstanceMonitor', () => {
  let monitor
  let graphRef
  let mockGraph

  beforeEach(() => {
    monitor = new GraphInstanceMonitor()
    graphRef = ref(null)
    mockGraph = createMockGraph()
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (monitor.isMonitoring.value) {
      monitor.stopMonitoring()
    }
  })

  describe('基本监控功能', () => {
    it('应该能够开始和停止监控', () => {
      expect(monitor.isMonitoring.value).toBe(false)

      monitor.startMonitoring(graphRef)
      expect(monitor.isMonitoring.value).toBe(true)

      monitor.stopMonitoring()
      expect(monitor.isMonitoring.value).toBe(false)
    })

    it('应该能够监听Graph实例的创建', async () => {
      const events = []
      monitor.on('graph-created', (data) => events.push(data))

      monitor.startMonitoring(graphRef)
      
      // 设置Graph实例
      graphRef.value = mockGraph
      await nextTick()

      expect(events).toHaveLength(1)
      expect(events[0].newGraph).toBe(mockGraph)
      expect(monitor.initializationStatus.value).toBe('initializing')
    })

    it('应该能够监听Graph实例的销毁', async () => {
      const events = []
      monitor.on('graph-destroyed', (data) => events.push(data))

      graphRef.value = mockGraph
      monitor.startMonitoring(graphRef)
      
      // 销毁Graph实例
      graphRef.value = null
      await nextTick()

      expect(events).toHaveLength(1)
      expect(events[0].oldGraph).toBe(mockGraph)
      expect(monitor.initializationStatus.value).toBe('idle')
    })

    it('应该能够监听Graph实例的替换', async () => {
      const events = []
      monitor.on('graph-replaced', (data) => events.push(data))

      const oldGraph = mockGraph
      const newGraph = createMockGraph()

      graphRef.value = oldGraph
      monitor.startMonitoring(graphRef)
      
      // 替换Graph实例
      graphRef.value = newGraph
      await nextTick()

      expect(events).toHaveLength(1)
      expect(events[0].oldGraph).toBe(oldGraph)
      expect(events[0].newGraph).toBe(newGraph)
    })
  })

  describe('初始化跟踪', () => {
    it('应该能够跟踪初始化完成', async () => {
      const events = []
      monitor.on('initialization-completed', (data) => events.push(data))

      monitor.startMonitoring(graphRef)
      graphRef.value = mockGraph
      
      // 等待初始化完成
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(events).toHaveLength(1)
      expect(events[0].graphInstance).toBe(mockGraph)
      expect(events[0].initializationTime).toBeGreaterThan(0)
      expect(monitor.initializationStatus.value).toBe('completed')
    })

    it('应该能够检测初始化超时', async () => {
      const events = []
      monitor.on('initialization-timeout', (data) => events.push(data))

      // 设置短超时时间
      monitor.config.initializationTimeout = 50

      monitor.startMonitoring(graphRef)
      
      // 设置一个无效的Graph实例（缺少必要方法）
      graphRef.value = { id: 'invalid-graph' }
      
      // 等待超时
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(events).toHaveLength(1)
      expect(monitor.initializationStatus.value).toBe('failed')
    })

    it('应该能够验证Graph实例', () => {
      // 有效的Graph实例
      expect(monitor.validateGraphInstance(mockGraph)).toBe(true)

      // 无效的Graph实例
      expect(monitor.validateGraphInstance(null)).toBe(false)
      expect(monitor.validateGraphInstance({})).toBe(false)
      expect(monitor.validateGraphInstance({ addNode: 'not-a-function' })).toBe(false)
    })
  })

  describe('健康检查', () => {
    it('应该能够执行健康检查', async () => {
      const events = []
      monitor.on('health-check', (data) => events.push(data))

      // 设置短健康检查间隔
      monitor.config.healthCheckInterval = 50
      monitor.config.enablePerformanceTracking = true

      graphRef.value = mockGraph
      monitor.startMonitoring(graphRef)
      
      // 等待健康检查执行
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(events.length).toBeGreaterThan(0)
      expect(monitor.lastHealthCheck.value).toBeTruthy()
    })

    it('应该能够检测性能警告', async () => {
      const events = []
      monitor.on('performance-warning', (data) => events.push(data))

      // 模拟慢响应
      mockGraph.getCells.mockImplementation(() => {
        // 模拟耗时操作
        const start = Date.now()
        while (Date.now() - start < 150) {
          // 忙等待
        }
        return []
      })

      monitor.config.healthCheckInterval = 50
      graphRef.value = mockGraph
      monitor.startMonitoring(graphRef)
      
      // 等待性能警告
      await new Promise(resolve => setTimeout(resolve, 200))

      expect(events.length).toBeGreaterThan(0)
      expect(events[0].type).toBe('slow-response')
    })

    it('应该能够处理健康检查失败', async () => {
      const events = []
      monitor.on('health-check-failed', (data) => events.push(data))

      // 模拟健康检查失败
      mockGraph.getCells.mockImplementation(() => {
        throw new Error('Health check failed')
      })

      monitor.config.healthCheckInterval = 50
      graphRef.value = mockGraph
      monitor.startMonitoring(graphRef)
      
      // 等待健康检查失败
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(events.length).toBeGreaterThan(0)
      expect(monitor.errorCount.value).toBeGreaterThan(0)
    })
  })

  describe('性能指标', () => {
    it('应该能够跟踪性能指标', async () => {
      monitor.config.enablePerformanceTracking = true
      graphRef.value = mockGraph
      monitor.startMonitoring(graphRef)
      
      // 等待初始化和健康检查
      await new Promise(resolve => setTimeout(resolve, 100))

      const metrics = monitor.performanceMetrics.value
      expect(metrics.initializationTime).toBeGreaterThan(0)
      expect(metrics.totalOperations).toBeGreaterThan(0)
    })

    it('应该能够计算错误率', async () => {
      // 模拟部分健康检查失败
      let callCount = 0
      mockGraph.getCells.mockImplementation(() => {
        callCount++
        if (callCount % 2 === 0) {
          throw new Error('Simulated error')
        }
        return []
      })

      monitor.config.healthCheckInterval = 30
      graphRef.value = mockGraph
      monitor.startMonitoring(graphRef)
      
      // 等待多次健康检查
      await new Promise(resolve => setTimeout(resolve, 150))

      const metrics = monitor.performanceMetrics.value
      expect(metrics.errorRate).toBeGreaterThan(0)
      expect(metrics.errorRate).toBeLessThanOrEqual(1)
    })
  })

  describe('事件系统', () => {
    it('应该能够添加和移除事件监听器', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      monitor.on('test-event', listener1)
      monitor.on('test-event', listener2)

      monitor.emit('test-event', { data: 'test' })

      expect(listener1).toHaveBeenCalledWith({ data: 'test' })
      expect(listener2).toHaveBeenCalledWith({ data: 'test' })

      monitor.off('test-event', listener1)
      monitor.emit('test-event', { data: 'test2' })

      expect(listener1).toHaveBeenCalledTimes(1)
      expect(listener2).toHaveBeenCalledTimes(2)
    })

    it('应该能够处理监听器执行错误', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error')
      })
      const normalListener = vi.fn()

      monitor.on('test-event', errorListener)
      monitor.on('test-event', normalListener)

      // 不应该抛出错误
      expect(() => {
        monitor.emit('test-event', { data: 'test' })
      }).not.toThrow()

      expect(normalListener).toHaveBeenCalled()
    })
  })

  describe('状态管理', () => {
    it('应该能够获取当前状态', () => {
      const status = monitor.getStatus()
      
      expect(status).toHaveProperty('isMonitoring')
      expect(status).toHaveProperty('initializationStatus')
      expect(status).toHaveProperty('performanceMetrics')
      expect(status).toHaveProperty('hasGraphInstance')
    })

    it('应该能够重置监控状态', () => {
      monitor.errorCount.value = 5
      monitor.performanceMetrics.value.totalOperations = 10
      
      monitor.reset()
      
      expect(monitor.errorCount.value).toBe(0)
      expect(monitor.performanceMetrics.value.totalOperations).toBe(0)
    })
  })
})

describe('AsyncInitializationConfirm', () => {
  let confirm
  let monitor
  let graphRef

  beforeEach(() => {
    monitor = new GraphInstanceMonitor()
    confirm = new AsyncInitializationConfirm(monitor)
    graphRef = ref(null)
  })

  afterEach(() => {
    confirm.cancelAll()
    if (monitor.isMonitoring.value) {
      monitor.stopMonitoring()
    }
  })

  describe('异步初始化确认', () => {
    it('应该能够等待初始化完成', async () => {
      monitor.startMonitoring(graphRef)
      
      // 启动等待
      const confirmPromise = confirm.waitForInitialization('test-op', 1000)
      
      // 模拟初始化完成
      setTimeout(() => {
        graphRef.value = createMockGraph()
      }, 50)
      
      const result = await confirmPromise
      
      expect(result.operationId).toBe('test-op')
      expect(result.status).toBe('completed')
      expect(result.initializationTime).toBeGreaterThan(0)
    })

    it('应该能够处理初始化失败', async () => {
      monitor.startMonitoring(graphRef)
      
      // 启动等待
      const confirmPromise = confirm.waitForInitialization('test-op', 1000)
      
      // 模拟初始化失败
      setTimeout(() => {
        monitor.initializationStatus.value = 'failed'
        monitor.emit('initialization-failed', {
          timestamp: Date.now(),
          error: 'Test error'
        })
      }, 50)
      
      await expect(confirmPromise).rejects.toThrow('Graph初始化失败: Test error')
    })

    it('应该能够处理超时', async () => {
      monitor.startMonitoring(graphRef)
      
      // 启动等待（短超时）
      const confirmPromise = confirm.waitForInitialization('test-op', 100)
      
      // 不触发初始化完成
      await expect(confirmPromise).rejects.toThrow('异步初始化确认超时')
    })

    it('应该能够立即返回已完成的初始化', async () => {
      monitor.initializationStatus.value = 'completed'
      
      const result = await confirm.waitForInitialization('test-op')
      
      expect(result.operationId).toBe('test-op')
      expect(result.status).toBe('completed')
    })

    it('应该能够立即拒绝已失败的初始化', async () => {
      monitor.initializationStatus.value = 'failed'
      
      await expect(confirm.waitForInitialization('test-op')).rejects.toThrow('Graph初始化失败')
    })
  })

  describe('操作管理', () => {
    it('应该能够取消等待操作', async () => {
      monitor.startMonitoring(graphRef)
      
      // 启动等待
      const confirmPromise = confirm.waitForInitialization('test-op', 1000)
      
      // 取消操作
      setTimeout(() => {
        confirm.cancel('test-op')
      }, 50)
      
      await expect(confirmPromise).rejects.toThrow('异步初始化确认已取消')
    })

    it('应该能够取消所有等待操作', async () => {
      monitor.startMonitoring(graphRef)
      
      // 启动多个等待
      const promises = [
        confirm.waitForInitialization('op1', 1000),
        confirm.waitForInitialization('op2', 1000),
        confirm.waitForInitialization('op3', 1000)
      ]
      
      // 取消所有操作
      setTimeout(() => {
        confirm.cancelAll()
      }, 50)
      
      for (const promise of promises) {
        await expect(promise).rejects.toThrow('异步初始化确认已取消')
      }
    })

    it('应该能够获取待确认操作列表', () => {
      monitor.startMonitoring(graphRef)
      
      // 启动多个等待
      confirm.waitForInitialization('op1', 1000)
      confirm.waitForInitialization('op2', 1000)
      
      const pending = confirm.getPendingOperations()
      expect(pending).toContain('op1')
      expect(pending).toContain('op2')
      expect(pending).toHaveLength(2)
    })
  })
})

describe('单例实例', () => {
  it('应该提供全局单例实例', () => {
    expect(graphInstanceMonitor).toBeInstanceOf(GraphInstanceMonitor)
    expect(asyncInitializationConfirm).toBeInstanceOf(AsyncInitializationConfirm)
  })

  it('应该提供工厂函数', () => {
    const customMonitor = createGraphInstanceMonitor({
      healthCheckInterval: 1000
    })
    
    expect(customMonitor).toBeInstanceOf(GraphInstanceMonitor)
    expect(customMonitor.config.healthCheckInterval).toBe(1000)
  })
})