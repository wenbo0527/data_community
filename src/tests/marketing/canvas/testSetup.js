/**
 * 营销画布节点功能测试专用设置文件
 * 配置测试环境和全局Mock
 */

import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// 配置Vue Test Utils全局设置
config.global.mocks = {
  $t: (key) => key, // 国际化Mock
  $route: {
    path: '/marketing/tasks',
    params: {},
    query: {}
  },
  $router: {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn()
  }
}

// 全局组件Mock
config.global.stubs = {
  'router-link': true,
  'router-view': true,
  'a-drawer': true,
  'a-form': true,
  'a-form-item': true,
  'a-input': true,
  'a-textarea': true,
  'a-select': true,
  'a-button': true,
  'a-space': true,
  'a-divider': true
}

// Mock全局对象
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock Canvas API
global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Array(4) })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => []),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn()
}))

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16))
global.cancelAnimationFrame = vi.fn()

// Mock performance API
if (!global.performance) {
  global.performance = {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000
    }
  }
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}
global.sessionStorage = sessionStorageMock

// Mock URL API
global.URL.createObjectURL = vi.fn(() => 'mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock File API
global.File = class MockFile {
  constructor(bits, name, options = {}) {
    this.bits = bits
    this.name = name
    this.size = bits.reduce((acc, bit) => acc + bit.length, 0)
    this.type = options.type || ''
    this.lastModified = options.lastModified || Date.now()
  }
}

global.FileReader = class MockFileReader {
  constructor() {
    this.readyState = 0
    this.result = null
    this.error = null
    this.onload = null
    this.onerror = null
    this.onabort = null
  }
  
  readAsText(file) {
    setTimeout(() => {
      this.readyState = 2
      this.result = 'mock file content'
      if (this.onload) this.onload({ target: this })
    }, 0)
  }
  
  readAsDataURL(file) {
    setTimeout(() => {
      this.readyState = 2
      this.result = 'data:text/plain;base64,bW9jayBmaWxlIGNvbnRlbnQ='
      if (this.onload) this.onload({ target: this })
    }, 0)
  }
  
  abort() {
    this.readyState = 2
    if (this.onabort) this.onabort({ target: this })
  }
}

// Mock Blob API
global.Blob = class MockBlob {
  constructor(parts = [], options = {}) {
    this.parts = parts
    this.size = parts.reduce((acc, part) => acc + (part.length || 0), 0)
    this.type = options.type || ''
  }
  
  slice(start = 0, end = this.size, contentType = '') {
    return new MockBlob(this.parts.slice(start, end), { type: contentType })
  }
  
  text() {
    return Promise.resolve(this.parts.join(''))
  }
  
  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(this.size))
  }
}

// Mock console methods for cleaner test output
const originalConsole = { ...console }
global.console = {
  ...originalConsole,
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn()
}

// 测试环境标识
global.__TEST_ENV__ = true

// 在每个测试前重置所有Mock
beforeEach(() => {
  vi.clearAllMocks()
  
  // 重置localStorage
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
  
  // 重置sessionStorage
  sessionStorageMock.getItem.mockClear()
  sessionStorageMock.setItem.mockClear()
  sessionStorageMock.removeItem.mockClear()
  sessionStorageMock.clear.mockClear()
  
  // 重置console
  global.console.log.mockClear()
  global.console.info.mockClear()
  global.console.warn.mockClear()
  global.console.error.mockClear()
  global.console.debug.mockClear()
})

// 在每个测试后清理
afterEach(() => {
  vi.restoreAllMocks()
})

// 全局错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
})

// 导出测试工具函数
export const testUtils = {
  // 等待DOM更新
  async nextTick() {
    return new Promise(resolve => setTimeout(resolve, 0))
  },
  
  // 等待指定时间
  async wait(ms = 100) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },
  
  // 模拟用户交互
  async simulateUserInteraction(wrapper, event = 'click', selector = null) {
    const target = selector ? wrapper.find(selector) : wrapper
    await target.trigger(event)
    await this.nextTick()
  },
  
  // 验证Mock调用
  expectMockCalled(mockFn, times = 1) {
    expect(mockFn).toHaveBeenCalledTimes(times)
  },
  
  // 创建测试用的Promise
  createTestPromise() {
    let resolve, reject
    const promise = new Promise((res, rej) => {
      resolve = res
      reject = rej
    })
    return { promise, resolve, reject }
  }
}

console.log('✅ 营销画布节点功能测试环境初始化完成')