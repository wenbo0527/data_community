import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { CanvasEventSystem, CanvasEventTypes } from '@/core'
import EventManager from '@/utils/preview-line/events/EventManager.js'
import { StateManager } from '@/utils/preview-line/state/StateManager.js'
import { StateSynchronizer } from '@/utils/preview-line/state/StateSynchronizer.js'

describe('事件系统集成：StateSynchronizer / StateManager / EventManager / CanvasEventSystem', () => {
  let em, sm, sync
  let handlers = []

  const onBus = (event, handler, options) => {
    CanvasEventSystem.eventBus.on(event, handler, options)
    handlers.push({ event, handler })
  }

  beforeEach(() => {
    if (!CanvasEventSystem.isInitialized || !CanvasEventSystem.isInitialized()) {
      CanvasEventSystem.initialize({ debug: true, performance: true })
    }
    em = new EventManager({ enableLogging: false })
    sm = new StateManager({ enablePersistence: false })
    sync = new StateSynchronizer({ enableBroadcast: false })
    handlers = []
  })

  afterEach(() => {
    for (const { event, handler } of handlers) {
      try { CanvasEventSystem.eventBus.off(event, handler) } catch {}
    }
    handlers = []
    em?.destroy && em.destroy()
    sm?.destroy && sm.destroy()
    sync?.destroy && sync.destroy()
  })

  it('复杂事件流：EM 本地触发 → 总线 → SM 订阅 → 同步器触发完成事件', async () => {
    const busSpyCreated = vi.fn()
    const busSpySynced = vi.fn()

    onBus('canvas:preview-line-created', busSpyCreated)
    onBus(CanvasEventTypes.CANVAS.STATE_UPDATED, busSpySynced)

    // SM 订阅总线新事件（通过旧事件名注册）
    const smSpy = vi.fn()
    const offSm = sm.eventManager.on('state:sync', smSpy)

    // EM 本地触发旧事件名，映射并转发到总线
    em.emit('preview-line:created', { id: 'pl-i1' })
    expect(busSpyCreated).toHaveBeenCalledTimes(1)

    // 同步器注册连接并执行一次同步
    sync.registerConnection('target-1', { setState: () => true })
    const ok = await sync.syncState('integration', { id: 'pl-i1', x: 10 }, { targets: ['target-1'] })
    expect(ok).toBe(true)

    // 总线应收到同步完成事件
    expect(busSpySynced).toHaveBeenCalledTimes(1)

    // SM 的旧事件监听应收到新总线事件（向后兼容）
    expect(smSpy).toHaveBeenCalledTimes(1)
    expect(smSpy.mock.calls[0][0].success).toBe(true)

    offSm && offSm()
  })

  it('错误传播：冲突检测 → error:preview-line-conflict → 统一总线错误类别', async () => {
    const busSpyConflict = vi.fn()
    onBus(CanvasEventTypes.ERROR.PREVIEW_LINE_CONFLICT, busSpyConflict)

    // 准备一个连接，制造时间戳冲突：先设置 lastSync 为未来时间
    const conn = { state: {}, lastSync: Date.now() + 10000 }
    sync.registerConnection('t-2', conn)

    const ok = await sync.syncState('integration', { id: 'x' }, { targets: ['t-2'] })
    // 返回值可能因同步策略不同而变化，此处仅验证事件映射路径

    // 冲突事件应通过兼容层映射为 error:preview-line-conflict
    expect(busSpyConflict).toHaveBeenCalledTimes(1)
    const payload = busSpyConflict.mock.calls[0][0]
    expect(payload.type).toBe('timestamp')
    expect(payload.targetId).toBe('t-2')
  })

  it('性能基准：通过 CanvasEventManager 统计平均处理时间', () => {
    // 发布多个事件以触发统计
    for (let i = 0; i < 5; i++) {
      CanvasEventSystem.eventBus.emit('canvas:preview-line-created', { id: `p-${i}` })
    }
    const stats = CanvasEventSystem.getStats()
    expect(typeof stats.averageProcessingTime).toBe('number')
  })
})