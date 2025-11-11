import { describe, it, expect } from 'vitest'
import { EventTypeValidator } from '../EventTypeValidator'
import { CanvasEventTypes } from '../CanvasEventTypes'

describe('EventTypeValidator', () => {
  const validator = new EventTypeValidator()

  describe('节点事件验证', () => {
    it('应该验证有效的节点添加事件', () => {
      const event = {
        type: CanvasEventTypes.NODE_ADDED,
        payload: {
          id: 'node1',
          type: 'start',
          position: { x: 100, y: 200 },
          data: { label: '开始节点' }
        },
        timestamp: Date.now(),
        source: 'test'
      }

      const result = validator.validate(event)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该拒绝无效的节点添加事件', () => {
      const event = {
        type: CanvasEventTypes.NODE_ADDED,
        payload: {
          id: 'node1'
          // 缺少必需的 type 字段
        },
        timestamp: Date.now(),
        source: 'test'
      }

      const result = validator.validate(event)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('节点事件负载必须包含 type 字段')
    })
  })

  describe('连接事件验证', () => {
    it('应该验证有效的连接添加事件', () => {
      const event = {
        type: CanvasEventTypes.CONNECTION_ADDED,
        payload: {
          id: 'edge1',
          source: 'node1',
          target: 'node2',
          sourcePort: 'port1',
          targetPort: 'port2'
        },
        timestamp: Date.now(),
        source: 'test'
      }

      const result = validator.validate(event)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该拒绝无效的连接添加事件', () => {
      const event = {
        type: CanvasEventTypes.CONNECTION_ADDED,
        payload: {
          id: 'edge1',
          source: 'node1'
          // 缺少必需的 target 字段
        },
        timestamp: Date.now(),
        source: 'test'
      }

      const result = validator.validate(event)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('连接事件负载必须包含 target 字段')
    })
  })

  describe('键盘事件验证', () => {
    it('应该验证有效的键盘事件', () => {
      const event = {
        type: CanvasEventTypes.KEYBOARD_DELETE_PRESSED,
        payload: {
          key: 'Delete',
          code: 'Delete',
          ctrlKey: false,
          shiftKey: false,
          altKey: false,
          metaKey: false
        },
        timestamp: Date.now(),
        source: 'test'
      }

      const result = validator.validate(event)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该验证有效的组合键事件', () => {
      const event = {
        type: CanvasEventTypes.KEYBOARD_COPY_PRESSED,
        payload: {
          key: 'c',
          code: 'KeyC',
          ctrlKey: true,
          shiftKey: false,
          altKey: false,
          metaKey: false
        },
        timestamp: Date.now(),
        source: 'test'
      }

      const result = validator.validate(event)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('鼠标事件验证', () => {
    it('应该验证有效的鼠标事件', () => {
      const event = {
        type: CanvasEventTypes.MOUSE_DOWN,
        payload: {
          x: 100,
          y: 200,
          button: 0,
          ctrlKey: false,
          shiftKey: false,
          altKey: false,
          metaKey: false
        },
        timestamp: Date.now(),
        source: 'test'
      }

      const result = validator.validate(event)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该拒绝坐标无效的鼠标事件', () => {
      const event = {
        type: CanvasEventTypes.MOUSE_DOWN,
        payload: {
          x: 'invalid',
          y: 200,
          button: 0
        },
        timestamp: Date.now(),
        source: 'test'
      }

      const result = validator.validate(event)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('鼠标事件坐标必须是数字')
    })
  })

  describe('画布事件验证', () => {
    it('应该验证有效的画布清空事件', () => {
      const event = {
        type: CanvasEventTypes.CANVAS_CLEAR,
        payload: {
          reason: 'user_action',
          previousNodeCount: 5,
          previousConnectionCount: 4
        },
        timestamp: Date.now(),
        source: 'test'
      }

      const result = validator.validate(event)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('自定义验证规则', () => {
    it('应该支持自定义验证规则', () => {
      validator.addCustomRule('custom.event', (event) => {
        if (!event.payload.customField) {
          return { isValid: false, errors: ['必须包含 customField 字段'] }
        }
        return { isValid: true, errors: [] }
      })

      const validEvent = {
        type: 'custom.event',
        payload: { customField: 'value' },
        timestamp: Date.now(),
        source: 'test'
      }

      const invalidEvent = {
        type: 'custom.event',
        payload: {},
        timestamp: Date.now(),
        source: 'test'
      }

      expect(validator.validate(validEvent).isValid).toBe(true)
      expect(validator.validate(invalidEvent).isValid).toBe(false)
    })
  })

  describe('批量验证', () => {
    it('应该能够批量验证多个事件', () => {
      const events = [
        {
          type: CanvasEventTypes.NODE_ADDED,
          payload: { id: 'node1', type: 'start' },
          timestamp: Date.now(),
          source: 'test'
        },
        {
          type: CanvasEventTypes.CONNECTION_ADDED,
          payload: { id: 'edge1', source: 'node1', target: 'node2' },
          timestamp: Date.now(),
          source: 'test'
        },
        {
          type: 'invalid.event',
          payload: {},
          timestamp: Date.now(),
          source: 'test'
        }
      ]

      const results = validator.validateBatch(events)
      expect(results).toHaveLength(3)
      expect(results[0].isValid).toBe(true)
      expect(results[1].isValid).toBe(true)
      expect(results[2].isValid).toBe(false)
    })
  })
})