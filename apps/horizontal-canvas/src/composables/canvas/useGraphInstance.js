import { shallowRef, onBeforeUnmount, onScopeDispose } from 'vue'

/**
 * graph 实例组合式（生命周期包装）
 * 说明：将原本零散的 `let graph = null` + 各处 `graph.on(...)` 集中管理。
 * 用法：
 *   const { graph, registerGraph, on, off, dispose } = useGraphInstance()
 *   - graph: shallowRef，组件内模板可直接使用
 *   - registerGraph(g): 在画布挂载后注入 graph 实例
 *   - on(event, handler): 注册监听器，组件卸载时自动反注册
 *   - off(event, handler): 手动反注册
 *   - dispose(): 手动销毁（一般在 onBeforeUnmount 已调用）
 * 边界：不持有 DOM；不监听 resize 等全局事件；仅 X6 graph 事件。
 */
export function useGraphInstance() {
  const graph = shallowRef(null)
  /** @type {Array<{ event: string, handler: Function }>} */
  const listeners = []

  function registerGraph(g) {
    graph.value = g
  }

  function on(event, handler) {
    const g = graph.value
    if (g && typeof g.on === 'function') {
      try { g.on(event, handler) } catch {}
      listeners.push({ event, handler })
    }
  }

  function off(event, handler) {
    const g = graph.value
    if (g && typeof g.off === 'function') {
      try { g.off(event, handler) } catch {}
    }
    const idx = listeners.findIndex(l => l.event === event && l.handler === handler)
    if (idx >= 0) listeners.splice(idx, 1)
  }

  function dispose() {
    const g = graph.value
    if (!g) return
    while (listeners.length) {
      const { event, handler } = listeners.pop()
      try { g.off?.(event, handler) } catch {}
    }
    try { g.dispose?.() } catch {}
    graph.value = null
  }

  onBeforeUnmount(() => { dispose() })
  onScopeDispose(() => { dispose() })

  return { graph, registerGraph, on, off, dispose }
}
/*
用途：graph 实例组合式（生命周期包装）
说明：将零散的 `let graph = null` 与 `graph.on(...)` 集中管理；shallowRef 避免深层响应；onBeforeUnmount 自动 cleanup。
边界：不持有 DOM；不监听全局事件；仅包装 X6 graph 事件注册与反注册。
*/