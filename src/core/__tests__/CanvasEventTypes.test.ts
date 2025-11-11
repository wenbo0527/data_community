import { describe, it, expect } from 'vitest'
import { CanvasEventTypes, EventCategories, EventPriorities } from '../CanvasEventTypes'

describe('CanvasEventTypes', () => {
  describe('事件类型定义', () => {
    it('应该包含所有必要的事件类型', () => {
      expect(CanvasEventTypes).toBeDefined()
      expect(CanvasEventTypes.NODE_ADDED).toBe('node.added')
      expect(CanvasEventTypes.NODE_REMOVED).toBe('node.removed')
      expect(CanvasEventTypes.NODE_SELECTED).toBe('node.selected')
      expect(CanvasEventTypes.CONNECTION_ADDED).toBe('connection.added')
      expect(CanvasEventTypes.CONNECTION_REMOVED).toBe('connection.removed')
      expect(CanvasEventTypes.KEYBOARD_DELETE_PRESSED).toBe('keyboard.delete.pressed')
      expect(CanvasEventTypes.KEYBOARD_UNDO_PRESSED).toBe('keyboard.undo.pressed')
      expect(CanvasEventTypes.KEYBOARD_REDO_PRESSED).toBe('keyboard.redo.pressed')
    })

    it('应该包含鼠标事件类型', () => {
      expect(CanvasEventTypes.MOUSE_DOWN).toBe('mouse.down')
      expect(CanvasEventTypes.MOUSE_UP).toBe('mouse.up')
      expect(CanvasEventTypes.MOUSE_MOVE).toBe('mouse.move')
      expect(CanvasEventTypes.MOUSE_ENTER).toBe('mouse.enter')
      expect(CanvasEventTypes.MOUSE_LEAVE).toBe('mouse.leave')
    })

    it('应该包含画布事件类型', () => {
      expect(CanvasEventTypes.CANVAS_CLEAR).toBe('canvas.clear')
      expect(CanvasEventTypes.CANVAS_RESET).toBe('canvas.reset')
      expect(CanvasEventTypes.CANVAS_LOADED).toBe('canvas.loaded')
      expect(CanvasEventTypes.CANVAS_SAVED).toBe('canvas.saved')
    })
  })

  describe('事件分类', () => {
    it('应该正确分类节点事件', () => {
      const nodeEvents = EventCategories.NODE_EVENTS
      expect(nodeEvents).toContain(CanvasEventTypes.NODE_ADDED)
      expect(nodeEvents).toContain(CanvasEventTypes.NODE_REMOVED)
      expect(nodeEvents).toContain(CanvasEventTypes.NODE_SELECTED)
      expect(nodeEvents).toContain(CanvasEventTypes.NODE_MOVED)
    })

    it('应该正确分类连接事件', () => {
      const connectionEvents = EventCategories.CONNECTION_EVENTS
      expect(connectionEvents).toContain(CanvasEventTypes.CONNECTION_ADDED)
      expect(connectionEvents).toContain(CanvasEventTypes.CONNECTION_REMOVED)
      expect(connectionEvents).toContain(CanvasEventTypes.CONNECTION_SELECTED)
    })

    it('应该正确分类键盘事件', () => {
      const keyboardEvents = EventCategories.KEYBOARD_EVENTS
      expect(keyboardEvents).toContain(CanvasEventTypes.KEYBOARD_DELETE_PRESSED)
      expect(keyboardEvents).toContain(CanvasEventTypes.KEYBOARD_UNDO_PRESSED)
      expect(keyboardEvents).toContain(CanvasEventTypes.KEYBOARD_REDO_PRESSED)
      expect(keyboardEvents).toContain(CanvasEventTypes.KEYBOARD_COPY_PRESSED)
    })

    it('应该正确分类鼠标事件', () => {
      const mouseEvents = EventCategories.MOUSE_EVENTS
      expect(mouseEvents).toContain(CanvasEventTypes.MOUSE_DOWN)
      expect(mouseEvents).toContain(CanvasEventTypes.MOUSE_UP)
      expect(mouseEvents).toContain(CanvasEventTypes.MOUSE_MOVE)
    })

    it('应该正确分类画布事件', () => {
      const canvasEvents = EventCategories.CANVAS_EVENTS
      expect(canvasEvents).toContain(CanvasEventTypes.CANVAS_CLEAR)
      expect(canvasEvents).toContain(CanvasEventTypes.CANVAS_RESET)
      expect(canvasEvents).toContain(CanvasEventTypes.CANVAS_LOADED)
      expect(canvasEvents).toContain(CanvasEventTypes.CANVAS_SAVED)
    })
  })

  describe('事件优先级', () => {
    it('应该定义正确的事件优先级', () => {
      expect(EventPriorities.CRITICAL).toBe(100)
      expect(EventPriorities.HIGH).toBe(50)
      expect(EventPriorities.NORMAL).toBe(0)
      expect(EventPriorities.LOW).toBe(-50)
    })

    it('应该为关键事件分配高优先级', () => {
      const criticalEvents = EventCategories.getCriticalEvents()
      expect(criticalEvents).toContain(CanvasEventTypes.CANVAS_ERROR)
      expect(criticalEvents).toContain(CanvasEventTypes.NODE_ERROR)
      expect(criticalEvents).toContain(CanvasEventTypes.CONNECTION_ERROR)
    })
  })

  describe('事件验证', () => {
    it('应该验证事件类型的有效性', () => {
      expect(EventCategories.isValidEventType(CanvasEventTypes.NODE_ADDED)).toBe(true)
      expect(EventCategories.isValidEventType(CanvasEventTypes.CONNECTION_REMOVED)).toBe(true)
      expect(EventCategories.isValidEventType('invalid.event')).toBe(false)
    })

    it('应该获取事件类型信息', () => {
      const nodeAddedInfo = EventCategories.getEventInfo(CanvasEventTypes.NODE_ADDED)
      expect(nodeAddedInfo).toBeDefined()
      expect(nodeAddedInfo.category).toBe('NODE_EVENTS')
      expect(nodeAddedInfo.priority).toBe(EventPriorities.NORMAL)
    })
  })
})