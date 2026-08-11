/**
 * 组件/E2E 测试全局 setup
 */
import { setActivePinia, createPinia } from 'pinia'
import { vi, beforeEach } from 'vitest'

beforeEach(() => {
  // 重置 Pinia
  setActivePinia(createPinia())
})

// Mock Arco icons(组件测试中避免 ESM 问题)
// 通用 mock:任何 a-*icon 形式的图标都返回 null
vi.mock('@arco-design/web-vue/es/icon', () => {
  // 用 Proxy 处理任意图标名
  const iconProxy = new Proxy({}, {
    get(_, name) {
      if (typeof name === 'string') {
        return { name: String(name), render: () => null }
      }
      return null
    }
  })
  return {
    default: iconProxy,
    ...iconProxy
  }
})

// Mock Arco 主入口(避免整体 ESM 加载问题)
vi.mock('@arco-design/web-vue', () => ({
  Message: {
    success: () => {},
    error: () => {},
    warning: () => {},
    info: () => {}
  },
  Notification: { success: () => {}, error: () => {}, warning: () => {}, info: () => {} }
}))

// Mock X6 (jsdom 没有 canvas,X6 挂载会崩溃)
// 用 Proxy 让任何 X6 类都返回 noop
vi.mock('@antv/x6', () => {
  const Noop = new Proxy(class NoopClass {
    constructor(..._args: any[]) {}
    dispose() {}
    on() { return this }
    off() { return this }
    once() { return this }
    emit() {}
    trigger() {}
    set() { return this }
    get() { return undefined }
    render() {}
    zoom() {}
    zoomTo() { return this }
    fit() {}
    fitContent() {}
    matrix() { return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 } }
    addNode() { return this }
    addEdge() { return this }
    removeNode() {}
    removeEdge() {}
    getCTM() { return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 } }
    toJSON() { return {} }
    fromJSON() { return this }
    clearCells() {}
    resetCells() {}
    freeze() { return this }
    unfreeze() { return this }
    createNode() { return {} }
    createEdge() { return {} }
  }, {
    get(target, prop) {
      if (prop in target) return (target as any)[prop]
      return Noop
    }
  })
  return {
    Graph: Noop,
    Node: Noop,
    Edge: Noop,
    Shape: new Proxy({}, { get: (_, p) => Noop }),
    Cell: Noop,
    Model: Noop,
    addon: new Proxy({}, { get: (_, p) => Noop })
  }
}))

// Mock ECharts / zrender (jsdom 没有真正的 canvas)
vi.mock('echarts', () => ({
  init: () => ({
    setOption: () => {},
    resize: () => {},
    dispose: () => {}
  })
}))

// 给 jsdom 加 matchMedia polyfill(Arco 响应式断点需要)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: any) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  })
})