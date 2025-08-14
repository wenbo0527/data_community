import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// 全局测试设置

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Array(4) })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({ data: new Array(4) })),
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
})

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url')
global.URL.revokeObjectURL = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

// Vue Test Utils 全局配置
config.global.stubs = {
  // Arco Design 组件 stubs
  'a-button': true,
  'a-input': true,
  'a-form': true,
  'a-form-item': true,
  'a-select': true,
  'a-option': true,
  'a-dropdown': true,
  'a-doption': true,
  'a-tag': true,
  'a-divider': true,
  'a-collapse': true,
  'a-collapse-item': true,
  'a-tabs': true,
  'a-tab-pane': true,
  'a-modal': true,
  'a-message': true,
  'a-notification': true,
  
  // 图标组件 stubs
  'icon-plus': true,
  'icon-minus': true,
  'icon-arrow-left': true,
  'icon-undo': true,
  'icon-redo': true,
  'icon-fullscreen': true,
  'icon-zoom-in': true,
  'icon-zoom-out': true,
  'icon-play-arrow': true,
  'icon-save': true,
  'icon-down': true,
  'icon-check': true,
  'icon-archive': true,
  'icon-right': true,
  'icon-left': true,
  'icon-info-circle': true,
  'icon-close': true,
  'icon-clock-circle': true,
  'icon-storage': true,
  'icon-filter': true,
  'icon-link': true,
  'icon-code': true,
  'icon-formula': true,
  'icon-export': true
}

// 全局 mocks
config.global.mocks = {
  $route: {
    params: { id: 'test-workflow-id' },
    query: {},
    path: '/workflows/test-workflow-id'
  },
  $router: {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  }
}

// 全局 provide
config.global.provide = {
  // 可以在这里添加全局的 provide 值
}

// 测试工具函数
export const createMockGraph = () => {
  const nodes = new Map()
  const edges = new Map()
  
  return {
    nodes,
    edges,
    addNode: vi.fn((config) => {
      const node = {
        id: config.id,
        ...config,
        getPosition: vi.fn(() => config.position || { x: 0, y: 0 }),
        getData: vi.fn(() => config.data || {}),
        setData: vi.fn(),
        remove: vi.fn()
      }
      nodes.set(config.id, node)
      return node
    }),
    addEdge: vi.fn((config) => {
      const edge = {
        id: config.id,
        ...config,
        getSourceCellId: vi.fn(() => config.source?.cell || config.source),
        getTargetCellId: vi.fn(() => config.target?.cell || config.target),
        remove: vi.fn()
      }
      edges.set(config.id, edge)
      return edge
    }),
    getNodes: vi.fn(() => Array.from(nodes.values())),
    getEdges: vi.fn(() => Array.from(edges.values())),
    removeNode: vi.fn((id) => {
      nodes.delete(id)
    }),
    removeEdge: vi.fn((id) => {
      edges.delete(id)
    }),
    zoom: vi.fn(),
    zoomTo: vi.fn(),
    zoomToFit: vi.fn(),
    centerContent: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    canUndo: vi.fn(() => false),
    canRedo: vi.fn(() => false),
    on: vi.fn(),
    off: vi.fn(),
    dispose: vi.fn(),
    fromJSON: vi.fn(),
    toJSON: vi.fn(() => ({ nodes: [], edges: [] })),
    clearCells: vi.fn(),
    resetCells: vi.fn()
  }
}

// 创建 mock 节点
export const createMockNode = (id = 'test-node', type = 'INPUT', position = { x: 100, y: 100 }) => {
  return {
    id,
    getPosition: vi.fn(() => position),
    getData: vi.fn(() => ({ type, name: `Test ${type} Node` })),
    setData: vi.fn(),
    remove: vi.fn()
  }
}

// 创建 mock 工作流数据
export const createMockWorkflow = (overrides = {}) => {
  return {
    id: 'test-workflow-id',
    name: '测试工作流',
    description: '测试描述',
    status: 'draft',
    nodes: [],
    edges: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides
  }
}

// 清理函数
export const cleanup = () => {
  vi.clearAllMocks()
  localStorageMock.clear()
  sessionStorageMock.clear()
}

// 在每个测试后自动清理
afterEach(() => {
  cleanup()
})