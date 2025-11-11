import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { KeyboardEventHandler } from '../KeyboardEventHandler'
import { CanvasEventBus } from '../CanvasEventBus'
import { CanvasEventTypes } from '../CanvasEventTypes'

describe('KeyboardEventHandler', () => {
  let keyboardHandler: KeyboardEventHandler
  let eventBus: CanvasEventBus
  let mockElement: HTMLElement

  beforeEach(() => {
    eventBus = new CanvasEventBus()
    keyboardHandler = new KeyboardEventHandler(eventBus)
    mockElement = document.createElement('div')
    document.body.appendChild(mockElement)
  })

  afterEach(() => {
    keyboardHandler.destroy()
    eventBus.destroy()
    document.body.removeChild(mockElement)
  })

  describe('键盘事件监听', () => {
    it('应该监听键盘按下事件', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit')
      keyboardHandler.attach(mockElement)

      const keyboardEvent = new KeyboardEvent('keydown', {
        key: 'Delete',
        code: 'Delete',
        bubbles: true
      })

      mockElement.dispatchEvent(keyboardEvent)

      expect(emitSpy).toHaveBeenCalledWith(
        CanvasEventTypes.KEYBOARD_DELETE_PRESSED,
        expect.objectContaining({
          type: CanvasEventTypes.KEYBOARD_DELETE_PRESSED,
          payload: expect.objectContaining({
            key: 'Delete',
            code: 'Delete'
          })
        })
      )
    })

    it('应该处理组合键事件', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit')
      keyboardHandler.attach(mockElement)

      const keyboardEvent = new KeyboardEvent('keydown', {
        key: 'z',
        code: 'KeyZ',
        ctrlKey: true,
        bubbles: true
      })

      mockElement.dispatchEvent(keyboardEvent)

      expect(emitSpy).toHaveBeenCalledWith(
        CanvasEventTypes.KEYBOARD_UNDO_PRESSED,
        expect.objectContaining({
          type: CanvasEventTypes.KEYBOARD_UNDO_PRESSED,
          payload: expect.objectContaining({
            key: 'z',
            code: 'KeyZ',
            ctrlKey: true
          })
        })
      )
    })

    it('应该处理复制粘贴快捷键', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit')
      keyboardHandler.attach(mockElement)

      // Ctrl+C
      const copyEvent = new KeyboardEvent('keydown', {
        key: 'c',
        code: 'KeyC',
        ctrlKey: true,
        bubbles: true
      })

      mockElement.dispatchEvent(copyEvent)

      expect(emitSpy).toHaveBeenCalledWith(
        CanvasEventTypes.KEYBOARD_COPY_PRESSED,
        expect.objectContaining({
          type: CanvasEventTypes.KEYBOARD_COPY_PRESSED
        })
      )

      // Ctrl+V
      const pasteEvent = new KeyboardEvent('keydown', {
        key: 'v',
        code: 'KeyV',
        ctrlKey: true,
        bubbles: true
      })

      mockElement.dispatchEvent(pasteEvent)

      expect(emitSpy).toHaveBeenCalledWith(
        CanvasEventTypes.KEYBOARD_PASTE_PRESSED,
        expect.objectContaining({
          type: CanvasEventTypes.KEYBOARD_PASTE_PRESSED
        })
      )
    })

    it('应该处理全选快捷键', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit')
      keyboardHandler.attach(mockElement)

      const keyboardEvent = new KeyboardEvent('keydown', {
        key: 'a',
        code: 'KeyA',
        ctrlKey: true,
        bubbles: true
      })

      mockElement.dispatchEvent(keyboardEvent)

      expect(emitSpy).toHaveBeenCalledWith(
        CanvasEventTypes.KEYBOARD_SELECT_ALL_PRESSED,
        expect.objectContaining({
          type: CanvasEventTypes.KEYBOARD_SELECT_ALL_PRESSED
        })
      )
    })
  })

  describe('快捷键映射', () => {
    it('应该正确处理不同的快捷键组合', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit')
      keyboardHandler.attach(mockElement)

      // Ctrl+Shift+Z (重做)
      const redoEvent = new KeyboardEvent('keydown', {
        key: 'z',
        code: 'KeyZ',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true
      })

      mockElement.dispatchEvent(redoEvent)

      expect(emitSpy).toHaveBeenCalledWith(
        CanvasEventTypes.KEYBOARD_REDO_PRESSED,
        expect.objectContaining({
          type: CanvasEventTypes.KEYBOARD_REDO_PRESSED
        })
      )
    })

    it('应该处理 Mac 的 Command 键', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit')
      keyboardHandler.attach(mockElement)

      const keyboardEvent = new KeyboardEvent('keydown', {
        key: 'c',
        code: 'KeyC',
        metaKey: true,
        bubbles: true
      })

      mockElement.dispatchEvent(keyboardEvent)

      expect(emitSpy).toHaveBeenCalledWith(
        CanvasEventTypes.KEYBOARD_COPY_PRESSED,
        expect.objectContaining({
          type: CanvasEventTypes.KEYBOARD_COPY_PRESSED
        })
      )
    })
  })

  describe('输入框过滤', () => {
    it('应该忽略输入框中的键盘事件', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit')
      const inputElement = document.createElement('input')
      document.body.appendChild(inputElement)
      
      keyboardHandler.attach(mockElement)

      const keyboardEvent = new KeyboardEvent('keydown', {
        key: 'Delete',
        code: 'Delete',
        bubbles: true
      })

      // 模拟输入框获得焦点
      inputElement.focus()
      inputElement.dispatchEvent(keyboardEvent)

      // 不应该触发事件，因为目标元素是输入框
      expect(emitSpy).not.toHaveBeenCalled()

      document.body.removeChild(inputElement)
    })

    it('应该处理 textarea 中的键盘事件', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit')
      const textareaElement = document.createElement('textarea')
      document.body.appendChild(textareaElement)
      
      keyboardHandler.attach(mockElement)

      const keyboardEvent = new KeyboardEvent('keydown', {
        key: 'Delete',
        code: 'Delete',
        bubbles: true
      })

      textareaElement.focus()
      textareaElement.dispatchEvent(keyboardEvent)

      // 不应该触发事件，因为目标元素是 textarea
      expect(emitSpy).not.toHaveBeenCalled()

      document.body.removeChild(textareaElement)
    })

    it('应该处理 contenteditable 元素中的键盘事件', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit')
      const contentEditableElement = document.createElement('div')
      contentEditableElement.contentEditable = 'true'
      document.body.appendChild(contentEditableElement)
      
      keyboardHandler.attach(mockElement)

      const keyboardEvent = new KeyboardEvent('keydown', {
        key: 'Delete',
        code: 'Delete',
        bubbles: true
      })

      contentEditableElement.focus()
      contentEditableElement.dispatchEvent(keyboardEvent)

      // 不应该触发事件，因为目标元素是 contenteditable
      expect(emitSpy).not.toHaveBeenCalled()

      document.body.removeChild(contentEditableElement)
    })
  })

  describe('自定义快捷键', () => {
    it('应该支持自定义快捷键映射', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit')
      
      keyboardHandler.addCustomShortcut('ctrl+shift+d', 'custom.debug')
      keyboardHandler.attach(mockElement)

      const keyboardEvent = new KeyboardEvent('keydown', {
        key: 'd',
        code: 'KeyD',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true
      })

      mockElement.dispatchEvent(keyboardEvent)

      expect(emitSpy).toHaveBeenCalledWith(
        'custom.debug',
        expect.objectContaining({
          type: 'custom.debug'
        })
      )
    })

    it('应该支持移除自定义快捷键', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit')
      
      keyboardHandler.addCustomShortcut('ctrl+shift+d', 'custom.debug')
      keyboardHandler.removeCustomShortcut('ctrl+shift+d')
      keyboardHandler.attach(mockElement)

      const keyboardEvent = new KeyboardEvent('keydown', {
        key: 'd',
        code: 'KeyD',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true
      })

      mockElement.dispatchEvent(keyboardEvent)

      expect(emitSpy).not.toHaveBeenCalled()
    })
  })

  describe('性能统计', () => {
    it('应该记录键盘事件统计', () => {
      keyboardHandler.attach(mockElement)

      // 触发多个键盘事件
      const deleteEvent = new KeyboardEvent('keydown', {
        key: 'Delete',
        code: 'Delete',
        bubbles: true
      })

      const copyEvent = new KeyboardEvent('keydown', {
        key: 'c',
        code: 'KeyC',
        ctrlKey: true,
        bubbles: true
      })

      mockElement.dispatchEvent(deleteEvent)
      mockElement.dispatchEvent(deleteEvent)
      mockElement.dispatchEvent(copyEvent)

      const stats = keyboardHandler.getStats()
      expect(stats.totalEvents).toBe(3)
      expect(stats.eventTypes[CanvasEventTypes.KEYBOARD_DELETE_PRESSED]).toBe(2)
      expect(stats.eventTypes[CanvasEventTypes.KEYBOARD_COPY_PRESSED]).toBe(1)
    })
  })

  describe('内存管理', () => {
    it('应该正确清理事件监听器', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit')
      keyboardHandler.attach(mockElement)
      keyboardHandler.destroy()

      const keyboardEvent = new KeyboardEvent('keydown', {
        key: 'Delete',
        code: 'Delete',
        bubbles: true
      })

      mockElement.dispatchEvent(keyboardEvent)

      expect(emitSpy).not.toHaveBeenCalled()
    })
  })
})