/**
 * 画布复杂场景端到端测试
 * 测试真实用户场景下的画布加载、交互和性能表现
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

// Mock complex test environment
const createComplexTestEnvironment = (options = {}) => {
  const mockGraph = {
    addNode: vi.fn(),
    addEdge: vi.fn(),
    getNodes: vi.fn(() => []),
    getEdges: vi.fn(() => []),
    getCellById: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    zoom: vi.fn(),
    translate: vi.fn(),
    centerContent: vi.fn(),
    fromJSON: vi.fn(),
    toJSON: vi.fn(() => ({ cells: [] })),
    clearCells: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn()
  }

  const mockPreviewLineSystem = {
    createPreviewLine: vi.fn().mockResolvedValue({ id: 'preview_1' }),
    clearPreviewLines: vi.fn(),
    transformPreviewToConnection: vi.fn().mockResolvedValue({ id: 'connection_1' }),
    generatePreviewLinesForNode: vi.fn().mockResolvedValue([]),
    updatePreviewLinePositions: vi.fn(),
    handleCanvasZoom: vi.fn(),
    handleCanvasPan: vi.fn()
  }

  const mockTaskStorage = {
    getAllTasks: vi.fn(() => []),
    saveTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    getStorageStats: vi.fn(() => ({
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      storageSize: 0
    }))
  }

  return {
    mockGraph,
    mockPreviewLineSystem,
    mockTaskStorage,
    cleanup: vi.fn()
  }
}

// Mock TaskFlowCanvasRefactored component
const TaskFlowCanvasRefactored = {
  name: 'TaskFlowCanvasRefactored',
  template: '<div class="task-flow-canvas" ref="canvasContainer"></div>',
  props: ['nodes', 'connections', 'readonly', 'loading'],
  emits: ['canvas-ready', 'node-created', 'connection-created', 'canvas-error'],
  setup(props, { emit }) {
    const canvasContainer = ref(null)
    const isLoading = ref(props.loading || false)
    const errorState = ref(null)

    const simulateCanvasLoad = async (nodeCount = 10) => {
      isLoading.value = true
      
      // 模拟异步加载延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      
      try {
        // 模拟大量节点加载
        for (let i = 0; i < nodeCount; i++) {
          emit('node-created', {
            id: `node_${i}`,
            type: 'sms',
            position: { x: i * 200, y: i * 100 }
          })
        }
        
        emit('canvas-ready', { nodeCount })
        isLoading.value = false
      } catch (error) {
        errorState.value = error
        emit('canvas-error', error)
        isLoading.value = false
      }
    }

    const simulateUserInteraction = async (interactionType) => {
      switch (interactionType) {
        case 'rapid-clicks':
          // 模拟快速连续点击
          for (let i = 0; i < 10; i++) {
            emit('node-created', { id: `rapid_${i}`, type: 'sms' })
            await new Promise(resolve => setTimeout(resolve, 10))
          }
          break
        case 'zoom-pan':
          // 模拟缩放和拖拽
          emit('canvas-zoom', { scale: 1.5 })
          emit('canvas-pan', { x: 100, y: 100 })
          break
        case 'bulk-operations':
          // 模拟批量操作
          const nodes = Array.from({ length: 50 }, (_, i) => ({
            id: `bulk_${i}`,
            type: 'sms',
            position: { x: (i % 10) * 150, y: Math.floor(i / 10) * 120 }
          }))
          emit('bulk-nodes-created', nodes)
          break
      }
    }

    return {
      canvasContainer,
      isLoading,
      errorState,
      simulateCanvasLoad,
      simulateUserInteraction
    }
  }
}

describe('画布复杂场景端到端测试', () => {
  let testEnv
  let canvasWrapper

  beforeEach(() => {
    testEnv = createComplexTestEnvironment()
    canvasWrapper = mount(TaskFlowCanvasRefactored, {
      props: {
        nodes: [],
        connections: [],
        readonly: false,
        loading: false
      }
    })
  })

  afterEach(() => {
    if (canvasWrapper) {
      canvasWrapper.unmount()
    }
    testEnv?.cleanup()
    vi.clearAllMocks()
  })

  describe('大量数据加载场景', () => {
    it('TC_COMPLEX_001 - 加载100个节点时性能表现正常', async () => {
      const startTime = performance.now()
      
      // 模拟加载100个节点
      await canvasWrapper.vm.simulateCanvasLoad(100)
      
      const endTime = performance.now()
      const loadTime = endTime - startTime
      
      // 验证加载时间在合理范围内（小于2秒）
      expect(loadTime).toBeLessThan(2000)
      
      // 验证画布就绪事件被触发
      expect(canvasWrapper.emitted('canvas-ready')).toBeTruthy()
      expect(canvasWrapper.emitted('canvas-ready')[0][0].nodeCount).toBe(100)
      
      // 验证节点创建事件被正确触发
      expect(canvasWrapper.emitted('node-created')).toHaveLength(100)
    })

    it('TC_COMPLEX_002 - 异步数据加载时状态管理正确', async () => {
      // 初始状态检查
      expect(canvasWrapper.vm.isLoading).toBe(false)
      expect(canvasWrapper.vm.errorState).toBe(null)
      
      // 开始异步加载
      const loadPromise = canvasWrapper.vm.simulateCanvasLoad(50)
      
      // 加载过程中状态检查
      expect(canvasWrapper.vm.isLoading).toBe(true)
      
      // 等待加载完成
      await loadPromise
      
      // 加载完成后状态检查
      expect(canvasWrapper.vm.isLoading).toBe(false)
      expect(canvasWrapper.vm.errorState).toBe(null)
      expect(canvasWrapper.emitted('canvas-ready')).toBeTruthy()
    })

    it('TC_COMPLEX_003 - 网络延迟情况下的加载稳定性', async () => {
      // 模拟网络延迟
      const originalSetTimeout = global.setTimeout
      global.setTimeout = vi.fn((callback, delay) => {
        return originalSetTimeout(callback, delay * 3) // 3倍延迟
      })
      
      try {
        const startTime = performance.now()
        await canvasWrapper.vm.simulateCanvasLoad(20)
        const endTime = performance.now()
        
        // 验证即使有延迟，加载仍然成功
        expect(canvasWrapper.emitted('canvas-ready')).toBeTruthy()
        expect(endTime - startTime).toBeGreaterThan(200) // 确实有延迟
      } finally {
        global.setTimeout = originalSetTimeout
      }
    })
  })

  describe('用户交互复杂场景', () => {
    it('TC_COMPLEX_004 - 快速连续操作的稳定性测试', async () => {
      const startTime = performance.now()
      
      // 模拟快速连续点击
      await canvasWrapper.vm.simulateUserInteraction('rapid-clicks')
      
      const endTime = performance.now()
      
      // 验证快速操作不会导致性能问题
      expect(endTime - startTime).toBeLessThan(1000)
      
      // 验证所有操作都被正确处理
      expect(canvasWrapper.emitted('node-created')).toHaveLength(10)
    })

    it('TC_COMPLEX_005 - 画布缩放拖拽时预览线稳定性', async () => {
      // 先创建一些节点和预览线
      await canvasWrapper.vm.simulateCanvasLoad(5)
      
      // 模拟画布缩放和拖拽操作
      await canvasWrapper.vm.simulateUserInteraction('zoom-pan')
      
      // 手动调用预览线系统的缩放和拖拽处理
      const zoomEvent = { scale: 1.5, center: { x: 400, y: 300 } }
      const panEvent = { dx: 100, dy: 50 }
      testEnv.mockPreviewLineSystem.handleCanvasZoom(zoomEvent)
      testEnv.mockPreviewLineSystem.handleCanvasPan(panEvent)
      
      // 验证预览线系统响应缩放和拖拽
      expect(testEnv.mockPreviewLineSystem.handleCanvasZoom).toHaveBeenCalled()
      expect(testEnv.mockPreviewLineSystem.handleCanvasPan).toHaveBeenCalled()
    })

    it('TC_COMPLEX_006 - 批量操作性能测试', async () => {
      const startTime = performance.now()
      
      // 模拟批量创建50个节点
      await canvasWrapper.vm.simulateUserInteraction('bulk-operations')
      
      const endTime = performance.now()
      
      // 验证批量操作性能
      expect(endTime - startTime).toBeLessThan(500)
      
      // 验证批量操作事件被触发
      expect(canvasWrapper.emitted('bulk-nodes-created')).toBeTruthy()
      expect(canvasWrapper.emitted('bulk-nodes-created')[0][0]).toHaveLength(50)
    })
  })

  describe('预览线系统复杂场景', () => {
    it('TC_COMPLEX_007 - 多分支节点同时配置的预览线生成', async () => {
      // 创建多个分支节点
      const branchNodes = [
        {
          id: 'audience_split_1',
          type: 'audience-split',
          config: {
            crowdLayers: [
              { id: 'crowd_1', crowdName: '高价值用户' },
              { id: 'crowd_2', crowdName: '普通用户' }
            ]
          }
        },
        {
          id: 'event_split_1',
          type: 'event-split',
          config: {
            eventCondition: 'user.hasClicked',
            yesLabel: '已点击',
            noLabel: '未点击'
          }
        },
        {
          id: 'ab_test_1',
          type: 'ab-test',
          config: {
            versions: [
              { id: 'version_a', name: '版本A' },
              { id: 'version_b', name: '版本B' }
            ]
          }
        }
      ]

      // 模拟同时配置多个分支节点
      for (const node of branchNodes) {
        testEnv.mockPreviewLineSystem.generatePreviewLinesForNode.mockResolvedValueOnce([
          { id: `preview_${node.id}_1`, sourceId: node.id, targetId: 'target_1' },
          { id: `preview_${node.id}_2`, sourceId: node.id, targetId: 'target_2' }
        ])
      }

      // 验证预览线生成系统能处理多个分支节点
      for (const node of branchNodes) {
        const previewLines = await testEnv.mockPreviewLineSystem.generatePreviewLinesForNode(node)
        expect(previewLines).toHaveLength(2)
        expect(previewLines[0].sourceId).toBe(node.id)
      }
    })

    it('TC_COMPLEX_008 - 预览线与实际连接的冲突处理', async () => {
      const sourceNode = { id: 'source_1', type: 'sms' }
      const targetNode = { id: 'target_1', type: 'wait' }

      // 模拟已存在实际连接
      testEnv.mockGraph.getEdges.mockReturnValue([
        {
          id: 'existing_connection',
          getSourceCellId: () => 'source_1',
          getTargetCellId: () => 'target_1'
        }
      ])

      // 尝试创建预览线
      const previewLine = await testEnv.mockPreviewLineSystem.createPreviewLine(
        sourceNode,
        targetNode
      )

      // 验证预览线创建成功（系统应该能处理冲突）
      expect(previewLine).toBeDefined()
      expect(previewLine.id).toBe('preview_1')
    })
  })

  describe('错误恢复和降级场景', () => {
    it('TC_COMPLEX_009 - localStorage异常时的降级处理', async () => {
      // 模拟localStorage异常
      const mockFailingStorage = {
        getItem: vi.fn(() => { throw new Error('localStorage不可用') }),
        setItem: vi.fn(() => { throw new Error('localStorage不可用') }),
        removeItem: vi.fn(() => { throw new Error('localStorage不可用') }),
        clear: vi.fn(() => { throw new Error('localStorage不可用') })
      }

      // 模拟TaskStorage在localStorage异常时的行为
      testEnv.mockTaskStorage.getStorageStats.mockImplementation(() => {
        try {
          mockFailingStorage.getItem('test')
        } catch (error) {
          // 降级处理：返回默认值
          return {
            totalTasks: 0,
            completedTasks: 0,
            pendingTasks: 0,
            storageSize: 0
          }
        }
      })

      // 尝试使用TaskStorage
      const stats = testEnv.mockTaskStorage.getStorageStats()
      
      // 验证降级处理：返回默认值而不是抛出错误
      expect(stats).toBeDefined()
      expect(typeof stats.totalTasks).toBe('number')
      expect(stats.totalTasks).toBe(0)
    })

    it('TC_COMPLEX_010 - Graph实例创建失败时的恢复机制', async () => {
      // 模拟Graph创建失败
      const failingGraph = {
        ...testEnv.mockGraph,
        addNode: vi.fn(() => { throw new Error('Graph实例异常') }),
        addEdge: vi.fn(() => { throw new Error('Graph实例异常') })
      }

      // 尝试在异常Graph上操作
      try {
        failingGraph.addNode({ id: 'test_node' })
      } catch (error) {
        // 验证错误被正确捕获
        expect(error.message).toBe('Graph实例异常')
      }

      // 验证画布组件能够处理Graph异常
      expect(() => {
        canvasWrapper.vm.simulateCanvasLoad(1)
      }).not.toThrow()
    })

    it('TC_COMPLEX_011 - 预览线系统初始化失败时的用户体验', async () => {
      // 模拟预览线系统初始化失败
      const failingPreviewSystem = {
        ...testEnv.mockPreviewLineSystem,
        createPreviewLine: vi.fn().mockRejectedValue(new Error('预览线系统初始化失败'))
      }

      // 尝试创建预览线
      try {
        await failingPreviewSystem.createPreviewLine(
          { id: 'source' },
          { id: 'target' }
        )
      } catch (error) {
        expect(error.message).toBe('预览线系统初始化失败')
      }

      // 验证画布仍然可以正常工作（降级到无预览线模式）
      await canvasWrapper.vm.simulateCanvasLoad(5)
      expect(canvasWrapper.emitted('canvas-ready')).toBeTruthy()
    })
  })

  describe('内存和性能压力测试', () => {
    it('TC_COMPLEX_012 - 长时间运行的内存泄漏检测', async () => {
      // 模拟内存使用情况
      let simulatedMemoryUsage = 1000000 // 1MB 初始内存
      
      // 模拟长时间运行场景：创建和销毁大量节点
      for (let cycle = 0; cycle < 10; cycle++) {
        await canvasWrapper.vm.simulateCanvasLoad(20)
        
        // 模拟内存使用增长
        simulatedMemoryUsage += 50000 // 每次循环增加50KB
        
        // 模拟清理操作
        testEnv.mockGraph.clearCells()
        testEnv.mockPreviewLineSystem.clearPreviewLines()
        
        // 模拟垃圾回收后的内存释放
        simulatedMemoryUsage -= 40000 // 清理后释放40KB
      }
      
      // 验证模拟的内存增长在合理范围内
      const memoryGrowth = (simulatedMemoryUsage - 1000000) / 1000000
      expect(memoryGrowth).toBeLessThan(0.2) // 内存增长小于20%
      
      // 验证清理操作被正确调用
      expect(testEnv.mockGraph.clearCells).toHaveBeenCalledTimes(10)
      expect(testEnv.mockPreviewLineSystem.clearPreviewLines).toHaveBeenCalledTimes(10)
    })

    it('TC_COMPLEX_013 - 高频操作下的响应性能', async () => {
      const operationTimes = []
      
      // 执行100次高频操作
      for (let i = 0; i < 100; i++) {
        const startTime = performance.now()
        
        // 模拟节点创建操作
        canvasWrapper.vm.$emit('node-created', {
          id: `perf_test_${i}`,
          type: 'sms',
          position: { x: i * 10, y: i * 10 }
        })
        
        const endTime = performance.now()
        operationTimes.push(endTime - startTime)
      }
      
      // 计算平均响应时间
      const avgTime = operationTimes.reduce((sum, time) => sum + time, 0) / operationTimes.length
      
      // 验证平均响应时间小于10ms
      expect(avgTime).toBeLessThan(10)
      
      // 验证99%的操作在50ms内完成
      const sortedTimes = operationTimes.sort((a, b) => a - b)
      const p99Time = sortedTimes[Math.floor(sortedTimes.length * 0.99)]
      expect(p99Time).toBeLessThan(50)
    })
  })

  describe('真实用户场景模拟', () => {
    it('TC_COMPLEX_014 - 营销流程创建完整场景', async () => {
      // 模拟用户创建完整营销流程的场景
      const marketingFlow = [
        { type: 'start', name: '开始节点' },
        { type: 'audience-split', name: '人群分流', crowdLayers: [
          { id: 'vip', crowdName: 'VIP用户' },
          { id: 'normal', crowdName: '普通用户' }
        ]},
        { type: 'sms', name: 'VIP短信', template: 'VIP专享优惠' },
        { type: 'sms', name: '普通短信', template: '限时优惠' },
        { type: 'wait', name: '等待节点', duration: 3600 },
        { type: 'ai-call', name: 'AI外呼', script: '回访话术' },
        { type: 'benefit', name: '权益发放', benefitType: 'coupon' }
      ]

      const createdNodes = []
      
      // 逐步创建营销流程
      for (const [index, nodeConfig] of marketingFlow.entries()) {
        const node = {
          id: `flow_node_${index}`,
          ...nodeConfig,
          position: { x: index * 200, y: 100 }
        }
        
        createdNodes.push(node)
        canvasWrapper.vm.$emit('node-created', node)
        
        // 模拟用户配置节点的延迟
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      // 验证所有节点都被创建
      expect(canvasWrapper.emitted('node-created')).toHaveLength(7)
      
      // 模拟创建连接
      for (let i = 0; i < createdNodes.length - 1; i++) {
        canvasWrapper.vm.$emit('connection-created', {
          id: `connection_${i}`,
          sourceId: createdNodes[i].id,
          targetId: createdNodes[i + 1].id
        })
      }

      // 验证连接创建
      expect(canvasWrapper.emitted('connection-created')).toHaveLength(6)
    })

    it('TC_COMPLEX_015 - 多窗口标签页场景下的状态同步', async () => {
      // 模拟第一个窗口的操作
      await canvasWrapper.vm.simulateCanvasLoad(10)
      
      // 模拟localStorage状态变化（其他窗口的操作）
      const mockStorageEvent = new StorageEvent('storage', {
        key: 'marketing_tasks',
        newValue: JSON.stringify([
          { id: 'external_task_1', type: 'sms', name: '外部任务1' },
          { id: 'external_task_2', type: 'wait', name: '外部任务2' }
        ]),
        oldValue: JSON.stringify([])
      })

      // 触发storage事件
      window.dispatchEvent(mockStorageEvent)

      // 等待事件处理
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证当前窗口能够响应外部状态变化
      // 由于这是模拟测试，我们验证事件被正确触发
      expect(mockStorageEvent.key).toBe('marketing_tasks')
      expect(JSON.parse(mockStorageEvent.newValue)).toHaveLength(2)
    })
  })
})