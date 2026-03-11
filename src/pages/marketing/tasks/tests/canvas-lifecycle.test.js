/**
 * useCanvasLifecycle composable 测试
 * 专门测试生命周期管理功能
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref, nextTick } from 'vue'
import { useCanvasLifecycle } from '../composables/useCanvasLifecycle.js'

// Mock dependencies
vi.mock('@arco-design/web-vue', () => ({
  Message: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn()
  }
}))

describe('useCanvasLifecycle Tests', () => {
  let mockGraph
  let mockState
  let mockEmit
  let mockDependencies
  let mockContainer

  beforeEach(() => {
    vi.clearAllMocks()

    // 创建模拟的DOM容器
    mockContainer = document.createElement('div')
    mockContainer.className = 'canvas-container'
    mockContainer.style.width = '800px'
    mockContainer.style.height = '600px'
    document.body.appendChild(mockContainer)

    // 模拟依赖
    mockGraph = ref(null)
    mockState = {
      isInitializing: ref(false),
      isDestroyed: ref(false),
      isGraphReady: ref(false)
    }
    mockEmit = vi.fn()

    mockDependencies = {
      canvasContainer: ref(mockContainer),
      initializeGraph: vi.fn().mockResolvedValue({
        on: vi.fn(),
        off: vi.fn(),
        dispose: vi.fn()
      }),
      bindEvents: vi.fn(),
      unbindEvents: vi.fn(),
      destroyGraph: vi.fn(),
      resetGraph: vi.fn(),
      previewLineSystem: { cleanup: vi.fn() },
      unifiedEdgeManager: { cleanup: vi.fn() },
      minimap: { cleanup: vi.fn() },
      panZoomManager: { cleanup: vi.fn() },
      edgeOverlapManager: { cleanup: vi.fn() },
      unifiedPreviewLineManager: { cleanup: vi.fn() }
    }
  })

  afterEach(() => {
    if (mockContainer && mockContainer.parentNode) {
      mockContainer.parentNode.removeChild(mockContainer)
    }
  })

  describe('initCanvas 函数', () => {
    it('应该成功初始化画布', async () => {
      const { initCanvas } = useCanvasLifecycle(
        mockGraph,
        mockState,
        mockEmit,
        mockDependencies
      )

      await initCanvas()

      expect(mockDependencies.initializeGraph).toHaveBeenCalledWith(mockContainer)
      expect(mockDependencies.bindEvents).toHaveBeenCalled()
      expect(mockGraph.value).toBeTruthy()
    })

    it('应该在容器不存在时抛出错误', async () => {
      mockDependencies.canvasContainer.value = null

      const { initCanvas } = useCanvasLifecycle(
        mockGraph,
        mockState,
        mockEmit,
        mockDependencies
      )

      await expect(initCanvas()).rejects.toThrow('画布容器未找到')
    })

    it('应该在Graph初始化失败时抛出错误', async () => {
      mockDependencies.initializeGraph.mockResolvedValue(null)

      const { initCanvas } = useCanvasLifecycle(
        mockGraph,
        mockState,
        mockEmit,
        mockDependencies
      )

      await expect(initCanvas()).rejects.toThrow('X6图实例初始化失败')
    })
  })

  describe('destroyCanvas 函数', () => {
    it('应该正确清理所有资源', async () => {
      const { initCanvas, destroyCanvas } = useCanvasLifecycle(
        mockGraph,
        mockState,
        mockEmit,
        mockDependencies
      )

      // 先初始化
      await initCanvas()
      
      // 然后销毁
      await destroyCanvas()

      expect(mockDependencies.unbindEvents).toHaveBeenCalled()
      expect(mockDependencies.destroyGraph).toHaveBeenCalled()
      expect(mockState.isDestroyed.value).toBe(true)
    })
  })

  describe('resetCanvas 函数', () => {
    it('应该正确重置画布状态', async () => {
      const { initCanvas, resetCanvas } = useCanvasLifecycle(
        mockGraph,
        mockState,
        mockEmit,
        mockDependencies
      )

      // 先初始化
      await initCanvas()
      
      // 然后重置
      await resetCanvas()

      expect(mockDependencies.resetGraph).toHaveBeenCalled()
    })
  })

  describe('时序管理', () => {
    it('应该正确管理初始化状态', async () => {
      const { initCanvas } = useCanvasLifecycle(
        mockGraph,
        mockState,
        mockEmit,
        mockDependencies
      )

      expect(mockState.isInitializing.value).toBe(false)

      const initPromise = initCanvas()
      expect(mockState.isInitializing.value).toBe(true)

      await initPromise
      expect(mockState.isInitializing.value).toBe(false)
    })

    it('应该在初始化失败时正确重置状态', async () => {
      mockDependencies.initializeGraph.mockRejectedValue(new Error('Init failed'))

      const { initCanvas } = useCanvasLifecycle(
        mockGraph,
        mockState,
        mockEmit,
        mockDependencies
      )

      try {
        await initCanvas()
      } catch (error) {
        // 预期的错误
      }

      expect(mockState.isInitializing.value).toBe(false)
    })
  })

  describe('错误处理', () => {
    it('应该正确处理初始化错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error')
      mockDependencies.initializeGraph.mockRejectedValue(new Error('Test error'))

      const { initCanvas } = useCanvasLifecycle(
        mockGraph,
        mockState,
        mockEmit,
        mockDependencies
      )

      await expect(initCanvas()).rejects.toThrow()
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[useCanvasLifecycle] 画布初始化失败'),
        expect.any(Error)
      )
    })
  })
})