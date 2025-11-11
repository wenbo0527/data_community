import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import TaskFlowCanvasRefactored from '../../pages/marketing/tasks/components/TaskFlowCanvasRefactored.vue'
import { CanvasEventSystem } from '../index'

// Mock 必要的依赖
vi.mock('antv-x6-vue', () => ({
  Graph: {
    registerNode: vi.fn(),
    registerEdge: vi.fn(),
    registerVueComponent: vi.fn()
  }
}))

vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

describe('TaskFlowCanvasRefactored - 统一事件系统集成', () => {
  let wrapper: any

  beforeEach(() => {
    // 确保 CanvasEventSystem 已初始化
    if (!CanvasEventSystem.isInitialized()) {
      CanvasEventSystem.initialize({
        debug: true,
        performance: true
      })
    }
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('统一事件系统集成', () => {
    it('应该正确初始化统一事件系统', async () => {
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          workflowData: {
            nodes: [],
            connections: []
          }
        }
      })

      await nextTick()

      // 验证 CanvasEventSystem 已初始化
      expect(CanvasEventSystem.isInitialized()).toBe(true)
      expect(CanvasEventSystem.eventBus).toBeDefined()
      expect(CanvasEventSystem.eventManager).toBeDefined()
    })

    it('应该通过统一事件系统发布键盘事件', async () => {
      const eventListener = vi.fn()
      CanvasEventSystem.eventBus.on('canvas.keyboard.delete', eventListener)

      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          workflowData: {
            nodes: [],
            connections: []
          }
        }
      })

      await nextTick()

      // 模拟键盘事件
      const keyboardEvent = new KeyboardEvent('keydown', {
        key: 'Delete',
        code: 'Delete',
        bubbles: true
      })

      document.dispatchEvent(keyboardEvent)
      await nextTick()

      // 验证事件被发布到统一事件系统
      expect(eventListener).toHaveBeenCalled()
      
      CanvasEventSystem.eventBus.off('canvas.keyboard.delete', eventListener)
    })

    it('应该同时支持新旧事件系统', async () => {
      const oldEventListener = vi.fn()
      const newEventListener = vi.fn()

      // 监听旧事件系统
      if (typeof window !== 'undefined') {
        window.eventBus = {
          emit: oldEventListener,
          on: vi.fn(),
          off: vi.fn()
        }
      }

      // 监听新事件系统
      CanvasEventSystem.eventBus.on('canvas.keyboard.delete', newEventListener)

      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          workflowData: {
            nodes: [],
            connections: []
          }
        }
      })

      await nextTick()

      // 模拟删除操作
      const keyboardEvent = new KeyboardEvent('keydown', {
        key: 'Delete',
        code: 'Delete',
        bubbles: true
      })

      document.dispatchEvent(keyboardEvent)
      await nextTick()

      // 验证两个事件系统都收到了事件
      expect(newEventListener).toHaveBeenCalled()
      // 旧事件系统也应该被调用（通过桥接）
      
      CanvasEventSystem.eventBus.off('canvas.keyboard.delete', newEventListener)
    })
  })

  describe('键盘快捷键处理', () => {
    it('应该处理撤销快捷键 (Ctrl+Z)', async () => {
      const undoListener = vi.fn()
      CanvasEventSystem.eventBus.on('canvas.keyboard.undo', undoListener)

      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          workflowData: {
            nodes: [],
            connections: []
          }
        }
      })

      await nextTick()

      const undoEvent = new KeyboardEvent('keydown', {
        key: 'z',
        code: 'KeyZ',
        ctrlKey: true,
        bubbles: true
      })

      document.dispatchEvent(undoEvent)
      await nextTick()

      expect(undoListener).toHaveBeenCalled()
      
      CanvasEventSystem.eventBus.off('canvas.keyboard.undo', undoListener)
    })

    it('应该处理重做快捷键 (Ctrl+Shift+Z)', async () => {
      const redoListener = vi.fn()
      CanvasEventSystem.eventBus.on('canvas.keyboard.redo', redoListener)

      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          workflowData: {
            nodes: [],
            connections: []
          }
        }
      })

      await nextTick()

      const redoEvent = new KeyboardEvent('keydown', {
        key: 'z',
        code: 'KeyZ',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true
      })

      document.dispatchEvent(redoEvent)
      await nextTick()

      expect(redoListener).toHaveBeenCalled()
      
      CanvasEventSystem.eventBus.off('canvas.keyboard.redo', redoListener)
    })

    it('应该处理复制粘贴快捷键', async () => {
      const copyListener = vi.fn()
      const pasteListener = vi.fn()
      
      CanvasEventSystem.eventBus.on('canvas.keyboard.copy', copyListener)
      CanvasEventSystem.eventBus.on('canvas.keyboard.paste', pasteListener)

      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          workflowData: {
            nodes: [],
            connections: []
          }
        }
      })

      await nextTick()

      // Ctrl+C
      const copyEvent = new KeyboardEvent('keydown', {
        key: 'c',
        code: 'KeyC',
        ctrlKey: true,
        bubbles: true
      })

      document.dispatchEvent(copyEvent)
      await nextTick()

      expect(copyListener).toHaveBeenCalled()

      // Ctrl+V
      const pasteEvent = new KeyboardEvent('keydown', {
        key: 'v',
        code: 'KeyV',
        ctrlKey: true,
        bubbles: true
      })

      document.dispatchEvent(pasteEvent)
      await nextTick()

      expect(pasteListener).toHaveBeenCalled()
      
      CanvasEventSystem.eventBus.off('canvas.keyboard.copy', copyListener)
      CanvasEventSystem.eventBus.off('canvas.keyboard.paste', pasteListener)
    })

    it('应该忽略输入框中的键盘事件', async () => {
      const deleteListener = vi.fn()
      CanvasEventSystem.eventBus.on('canvas.keyboard.delete', deleteListener)

      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          workflowData: {
            nodes: [],
            connections: []
          }
        }
      })

      await nextTick()

      // 创建输入框并聚焦
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      const deleteEvent = new KeyboardEvent('keydown', {
        key: 'Delete',
        code: 'Delete',
        bubbles: true
      })

      input.dispatchEvent(deleteEvent)
      await nextTick()

      // 不应该触发事件，因为焦点在输入框中
      expect(deleteListener).not.toHaveBeenCalled()

      document.body.removeChild(input)
      CanvasEventSystem.eventBus.off('canvas.keyboard.delete', deleteListener)
    })
  })

  describe('组件接口', () => {
    it('应该通过 defineExpose 暴露 canvasEventSystem', async () => {
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          workflowData: {
            nodes: [],
            connections: []
          }
        }
      })

      await nextTick()

      // 验证组件暴露了 canvasEventSystem
      expect(wrapper.vm.canvasEventSystem).toBeDefined()
      expect(wrapper.vm.canvasEventSystem).toBe(CanvasEventSystem)
    })

    it('应该提供画布操作接口', async () => {
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          workflowData: {
            nodes: [],
            connections: []
          }
        }
      })

      await nextTick()

      // 验证画布操作接口
      expect(wrapper.vm.addNode).toBeDefined()
      expect(wrapper.vm.removeNode).toBeDefined()
      expect(wrapper.vm.updateNode).toBeDefined()
      expect(wrapper.vm.addConnection).toBeDefined()
      expect(wrapper.vm.removeConnection).toBeDefined()
      expect(wrapper.vm.getCanvasData).toBeDefined()
      expect(wrapper.vm.loadCanvasData).toBeDefined()
    })

    it('应该提供服务管理器访问', async () => {
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          workflowData: {
            nodes: [],
            connections: []
          }
        }
      })

      await nextTick()

      // 验证服务管理器访问
      expect(wrapper.vm.getGraphService).toBeDefined()
      expect(wrapper.vm.getLayoutService).toBeDefined()
      expect(wrapper.vm.getEventService).toBeDefined()
      expect(wrapper.vm.getServiceManager).toBeDefined()
    })
  })

  describe('错误处理', () => {
    it('应该处理统一事件系统初始化失败', async () => {
      // 模拟初始化失败
      const originalInit = CanvasEventSystem.initialize
      CanvasEventSystem.initialize = vi.fn(() => {
        throw new Error('Initialization failed')
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          workflowData: {
            nodes: [],
            connections: []
          }
        }
      })

      await nextTick()

      // 验证错误被正确处理
      expect(consoleSpy).toHaveBeenCalled()

      // 恢复原始方法
      CanvasEventSystem.initialize = originalInit
      consoleSpy.mockRestore()
    })
  })

  describe('性能优化', () => {
    it('应该记录事件处理性能统计', async () => {
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          workflowData: {
            nodes: [],
            connections: []
          }
        }
      })

      await nextTick()

      // 触发一些事件
      const deleteEvent = new KeyboardEvent('keydown', {
        key: 'Delete',
        code: 'Delete',
        bubbles: true
      })

      document.dispatchEvent(deleteEvent)
      await nextTick()

      // 验证性能统计
      const stats = CanvasEventSystem.getPerformanceStats()
      expect(stats).toBeDefined()
      expect(stats.eventBusStats).toBeDefined()
      expect(stats.keyboardHandlerStats).toBeDefined()
    })
  })
})