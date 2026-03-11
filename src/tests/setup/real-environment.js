/**
 * 真实环境测试设置
 * 实现最小化Mock策略，保留X6核心功能
 */

import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

// 配置Vue Test Utils全局设置
config.global.plugins = [createPinia()]

// 最小化的全局Mock
config.global.mocks = {
  // 只保留必要的全局Mock
  $t: (key) => key, // 简化国际化，但保留功能
  $route: {
    path: '/marketing/tasks',
    params: {},
    query: {}
  }
}

// Mock SVG相关功能以支持X6
global.SVGElement = class SVGElement extends Element {
  constructor() {
    super()
  }
  
  getCTM() {
    return {
      a: 1, b: 0, c: 0, d: 1, e: 0, f: 0,
      inverse: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })
    }
  }
  
  getScreenCTM() {
    return this.getCTM()
  }
  
  getBBox() {
    return { x: 0, y: 0, width: 100, height: 100 }
  }
  
  createSVGMatrix() {
    return this.getCTM()
  }
}

// Mock SVGSVGElement
global.SVGSVGElement = class SVGSVGElement extends global.SVGElement {
  createSVGMatrix() {
    return {
      a: 1, b: 0, c: 0, d: 1, e: 0, f: 0,
      inverse: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
      multiply: (matrix) => matrix,
      translate: (x, y) => ({ a: 1, b: 0, c: 0, d: 1, e: x, f: y })
    }
  }
}

// 只Mock外部服务和API调用
vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} })
  }
}))

// 不再完全Mock X6，保留核心功能
// 注释掉原有的完全Mock代码
/*
vi.mock('@antv/x6', () => ({
  Graph: vi.fn(() => ({
    addNode: vi.fn(),
    addEdge: vi.fn(),
    render: vi.fn()
  }))
}))
*/

// 创建真实DOM环境辅助函数
export function createRealDOMContainer() {
  const container = document.createElement('div')
  container.style.width = '800px'
  container.style.height = '600px'
  container.style.position = 'relative'
  document.body.appendChild(container)
  return container
}

// 清理DOM环境
export function cleanupDOM() {
  document.body.innerHTML = ''
}

// 创建Vue应用实例
export function createTestVueApp(component, props = {}) {
  const el = document.createElement('div')
  document.body.appendChild(el)
  
  const app = createApp(component, props)
  app.use(createPinia())
  
  const vm = app.mount(el)
  
  return {
    app,
    vm,
    el,
    unmount: () => {
      app.unmount()
      document.body.removeChild(el)
    }
  }
}

// 模拟浏览器事件
export function createMouseEvent(type, options = {}) {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    view: window,
    ...options
  })
}

// 模拟拖拽事件
export function simulateDragEvent(element, startPos, endPos) {
  const mouseDownEvent = createMouseEvent('mousedown', {
    clientX: startPos.x,
    clientY: startPos.y
  })
  
  const mouseMoveEvent = createMouseEvent('mousemove', {
    clientX: endPos.x,
    clientY: endPos.y
  })
  
  const mouseUpEvent = createMouseEvent('mouseup', {
    clientX: endPos.x,
    clientY: endPos.y
  })
  
  element.dispatchEvent(mouseDownEvent)
  element.dispatchEvent(mouseMoveEvent)
  element.dispatchEvent(mouseUpEvent)
}

// 等待DOM更新
export async function waitForDOMUpdate() {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve)
    })
  })
}

// 等待元素出现
export async function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    
    function check() {
      const element = document.querySelector(selector)
      if (element) {
        resolve(element)
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Element ${selector} not found within ${timeout}ms`))
      } else {
        requestAnimationFrame(check)
      }
    }
    
    check()
  })
}