import { describe, it, expect, beforeEach, vi } from 'vitest'
import { logger, setSink, setSilent, setReporter } from '../../src/utils/logger.js'

describe('logger', () => {
  let sink
  beforeEach(() => {
    setSilent(false)
    sink = { log: vi.fn(), warn: vi.fn(), error: vi.fn() }
    setSink(sink)
  })

  it('info/warn/error 调用 sink 对应方法', () => {
    logger.info('hello')
    logger.warn('warn-msg')
    logger.error('err-msg', { a: 1 })
    expect(sink.log).toHaveBeenCalled()
    expect(sink.warn).toHaveBeenCalledWith('[warn] warn-msg')
    expect(sink.error).toHaveBeenCalledWith('[error] err-msg', { a: 1 })
  })

  it('setSilent(true) 关闭所有输出', () => {
    setSilent(true)
    logger.info('a')
    logger.warn('b')
    logger.error('c')
    expect(sink.log).not.toHaveBeenCalled()
    expect(sink.warn).not.toHaveBeenCalled()
    expect(sink.error).not.toHaveBeenCalled()
  })

  it('create(scope) 子 logger 带前缀', () => {
    const l = logger.create('Horizontal:saveTask')
    l.warn('failed')
    expect(sink.warn).toHaveBeenCalledWith('[warn] [Horizontal:saveTask] failed')
  })

  it('setReporter 上报 warn/error', () => {
    const reports = []
    setReporter((r) => { reports.push(r) })
    logger.info('info-only') // 不上报
    logger.warn('w')
    logger.error('e')
    expect(reports.length).toBe(2)
    expect(reports[0].level).toBe('warn')
    expect(reports[1].level).toBe('error')
    expect(reports[0].message).toBe('w')
  })

  it('sink 抛错不导致业务崩盘', () => {
    const badSink = { log: vi.fn(() => { throw new Error('boom') }), warn: vi.fn(), error: vi.fn() }
    setSink(badSink)
    expect(() => logger.info('a')).not.toThrow()
  })
})
/*
用途：logger 单元测试
说明：覆盖 setSilent / create(scope) / setReporter / sink 异常；测试隔离用 vi.fn 替换 sink。
边界：仅替换 sink，不替换 reporter；上报警告/错误级别。
*/