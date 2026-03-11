import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ErrorHandler, ErrorLevel, ErrorContext } from '@/core/ErrorHandler'
import { UnifiedEventBus } from '@/core/UnifiedEventBus'

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler
  let eventBus: UnifiedEventBus

  beforeEach(() => {
    eventBus = new UnifiedEventBus()
    errorHandler = new ErrorHandler(eventBus)
  })

  afterEach(() => {
    errorHandler.destroy()
    eventBus.destroy()
    vi.clearAllMocks()
  })

  describe('错误捕获与处理', () => {
    it('应该能够捕获和处理错误', () => {
      const error = new Error('测试错误')
      const context: ErrorContext = { component: 'TestComponent' }
      const onError = vi.fn()

      errorHandler.onError(onError)
      errorHandler.handleError(error, context)

      expect(onError).toHaveBeenCalledWith(expect.objectContaining({
        error,
        context: expect.objectContaining({ component: 'TestComponent' }),
        level: ErrorLevel.ERROR,
        timestamp: expect.any(Number)
      }))
    })

    it('应该能够处理不同级别的错误', () => {
      const error = new Error('警告信息')
      const context: ErrorContext = { component: 'TestComponent' }
      const onError = vi.fn()

      errorHandler.onError(onError)
      errorHandler.handleError(error, context, ErrorLevel.WARNING)

      expect(onError).toHaveBeenCalledWith(expect.objectContaining({
        error,
        context: expect.objectContaining({ component: 'TestComponent' }),
        level: ErrorLevel.WARNING,
        timestamp: expect.any(Number)
      }))
    })

    it('应该能够处理字符串错误消息', () => {
      const errorMessage = '这是一个错误消息'
      const context: ErrorContext = { component: 'TestComponent' }
      const onError = vi.fn()

      errorHandler.onError(onError)
      errorHandler.handleMessage(errorMessage, context)

      expect(onError).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.objectContaining({ message: errorMessage }),
        context: expect.objectContaining({ component: 'TestComponent' }),
        level: ErrorLevel.ERROR,
        timestamp: expect.any(Number)
      }))
    })
  })

  describe('错误过滤', () => {
    it('应该能够根据级别过滤错误', () => {
      const error = new Error('测试错误')
      const context: ErrorContext = { component: 'TestComponent' }
      const onError = vi.fn()

      // 只处理严重错误
      errorHandler.setMinimumLevel(ErrorLevel.CRITICAL)
      errorHandler.onError(onError)

      // 这个错误不应该被处理
      errorHandler.handleError(error, context, ErrorLevel.WARNING)
      expect(onError).not.toHaveBeenCalled()

      // 这个错误应该被处理
      errorHandler.handleError(error, context, ErrorLevel.CRITICAL)
      expect(onError).toHaveBeenCalledTimes(1)
    })

    it('应该能够根据自定义过滤器过滤错误', () => {
      const error1 = new Error('网络错误')
      const error2 = new Error('验证错误')
      const context1: ErrorContext = { component: 'NetworkComponent' }
      const context2: ErrorContext = { component: 'ValidationComponent' }
      const onError = vi.fn()

      // 添加自定义过滤器，只处理网络组件的错误
      errorHandler.addFilter((info) => info.context.component === 'NetworkComponent')
      errorHandler.onError(onError)

      // 这个错误应该被处理
      errorHandler.handleError(error1, context1)
      expect(onError).toHaveBeenCalledTimes(1)

      // 这个错误不应该被处理
      errorHandler.handleError(error2, context2)
      expect(onError).toHaveBeenCalledTimes(1) // 仍然是1，没有增加
    })
  })

  describe('错误转换', () => {
    it('应该能够转换错误信息', () => {
      const error = new Error('原始错误')
      const context: ErrorContext = { component: 'TestComponent' }
      const onError = vi.fn()

      // 添加转换器，修改错误消息
      errorHandler.addTransformer((info) => {
        return {
          ...info,
          error: new Error(`转换后: ${info.error.message}`)
        }
      })
      errorHandler.onError(onError)

      errorHandler.handleError(error, context)

      expect(onError).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.objectContaining({ message: '转换后: 原始错误' })
      }))
    })

    it('应该能够添加额外的上下文信息', () => {
      const error = new Error('测试错误')
      const context: ErrorContext = { component: 'TestComponent' }
      const onError = vi.fn()

      // 添加转换器，增加上下文信息
      errorHandler.addTransformer((info) => {
        return {
          ...info,
          context: {
            ...info.context,
            additionalInfo: '额外信息'
          }
        }
      })
      errorHandler.onError(onError)

      errorHandler.handleError(error, context)

      expect(onError).toHaveBeenCalledWith(expect.objectContaining({
        context: expect.objectContaining({
          component: 'TestComponent',
          additionalInfo: '额外信息'
        })
      }))
    })
  })

  describe('错误分组', () => {
    it('应该能够对相似错误进行分组', () => {
      const error1 = new Error('网络错误: 连接超时')
      const error2 = new Error('网络错误: 连接重置')
      const context: ErrorContext = { component: 'NetworkComponent' }
      const onError = vi.fn()
      const onErrorGroup = vi.fn()

      // 配置错误分组
      errorHandler.setGroupingEnabled(true)
      errorHandler.setGroupingCriteria((info) => {
        if (info.error.message.startsWith('网络错误:')) {
          return 'network-errors'
        }
        return null // 不分组
      })

      errorHandler.onError(onError)
      errorHandler.onErrorGroup(onErrorGroup)

      // 处理两个相似错误
      errorHandler.handleError(error1, context)
      errorHandler.handleError(error2, context)

      // 每个错误都应该被单独处理
      expect(onError).toHaveBeenCalledTimes(2)

      // 但应该只触发一次分组事件
      expect(onErrorGroup).toHaveBeenCalledTimes(1)
      expect(onErrorGroup).toHaveBeenCalledWith({
        groupId: 'network-errors',
        count: 2,
        errors: expect.arrayContaining([
          expect.objectContaining({ error: error1 }),
          expect.objectContaining({ error: error2 })
        ]),
        firstOccurrence: expect.any(Number),
        lastOccurrence: expect.any(Number)
      })
    })

    it('应该能够限制分组中的错误数量', () => {
      const errors = Array.from({ length: 10 }, (_, i) => new Error(`错误 ${i}`))
      const context: ErrorContext = { component: 'TestComponent' }
      const onErrorGroup = vi.fn()

      // 配置错误分组，最多保留5个错误
      errorHandler.setGroupingEnabled(true)
      errorHandler.setGroupingCriteria(() => 'test-group')
      errorHandler.setGroupingOptions({ maxErrorsPerGroup: 5 })

      errorHandler.onErrorGroup(onErrorGroup)

      // 处理10个错误
      errors.forEach(error => {
        errorHandler.handleError(error, context)
      })

      // 应该只保留最新的5个错误
      expect(onErrorGroup).toHaveBeenCalledWith(expect.objectContaining({
        count: 10, // 总数仍然是10
        errors: expect.arrayContaining([
          expect.objectContaining({ error: errors[5] }),
          expect.objectContaining({ error: errors[6] }),
          expect.objectContaining({ error: errors[7] }),
          expect.objectContaining({ error: errors[8] }),
          expect.objectContaining({ error: errors[9] })
        ])
      }))
      expect(onErrorGroup.mock.calls[0][0].errors.length).toBe(5)
    })
  })

  describe('全局错误处理', () => {
    it('应该能够捕获未处理的Promise异常', () => {
      const onError = vi.fn()
      errorHandler.onError(onError)

      // 模拟未处理的Promise异常
      const event = new Event('unhandledrejection') as any
      event.reason = new Error('未处理的Promise异常')

      // 手动触发全局事件
      window.dispatchEvent(event)

      expect(onError).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.objectContaining({
          message: expect.stringContaining('未处理的Promise异常')
        }),
        context: expect.objectContaining({
          source: 'unhandledrejection'
        })
      }))
    })

    it('应该能够捕获全局错误', () => {
      const onError = vi.fn()
      errorHandler.onError(onError)

      // 模拟全局错误
      const event = new ErrorEvent('error', {
        error: new Error('全局错误'),
        message: '全局错误'
      })

      // 手动触发全局事件
      window.dispatchEvent(event)

      expect(onError).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.objectContaining({
          message: expect.stringContaining('全局错误')
        }),
        context: expect.objectContaining({
          source: 'window.error'
        })
      }))
    })
  })

  describe('错误统计', () => {
    it('应该能够提供错误统计信息', () => {
      const error1 = new Error('错误1')
      const error2 = new Error('错误2')
      const context: ErrorContext = { component: 'TestComponent' }

      errorHandler.handleError(error1, context, ErrorLevel.ERROR)
      errorHandler.handleError(error2, context, ErrorLevel.WARNING)

      const stats = errorHandler.getStats()

      expect(stats.total).toBe(2)
      expect(stats.byLevel[ErrorLevel.ERROR]).toBe(1)
      expect(stats.byLevel[ErrorLevel.WARNING]).toBe(1)
      expect(stats.byComponent['TestComponent']).toBe(2)
    })

    it('应该能够重置统计信息', () => {
      const error = new Error('测试错误')
      const context: ErrorContext = { component: 'TestComponent' }

      errorHandler.handleError(error, context)
      expect(errorHandler.getStats().total).toBe(1)

      errorHandler.resetStats()
      expect(errorHandler.getStats().total).toBe(0)
    })
  })

  describe('事件集成', () => {
    it('应该在处理错误时发出事件', () => {
      const error = new Error('测试错误')
      const context: ErrorContext = { component: 'TestComponent' }
      const onEvent = vi.fn()

      eventBus.on('error', onEvent)
      errorHandler.handleError(error, context)

      expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({
        error,
        context: expect.objectContaining({
          component: 'TestComponent'
        }),
        level: ErrorLevel.ERROR
      }))
    })

    // 注意：ErrorHandler不再监听事件总线的error事件，避免循环调用
    // 错误处理逻辑直接在handleError方法中完成
  })
})