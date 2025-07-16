# 代码质量改进指南

## 1. 类型安全改进

### TypeScript迁移建议
```typescript
// 为组件添加类型定义
interface NodeData {
  id: string
  type: string
  label: string
  position: { x: number; y: number }
  data: Record<string, any>
  config: NodeConfig
}

interface NodeConfig {
  width: number
  height: number
  ports: PortConfig[]
}
```

### Props类型定义
```typescript
// 使用defineProps with TypeScript
interface Props {
  autoAddStartNode?: boolean
  initialData?: NodeData[]
}

const props = withDefaults(defineProps<Props>(), {
  autoAddStartNode: true,
  initialData: () => []
})
```

## 2. 错误处理改进

### 统一错误处理
```javascript
// 创建错误处理工具
export class AppError extends Error {
  constructor(message, code, context) {
    super(message)
    this.code = code
    this.context = context
  }
}

// 使用try-catch包装异步操作
const safeAsyncOperation = async (operation) => {
  try {
    return await operation()
  } catch (error) {
    console.error('操作失败:', error)
    throw new AppError('操作失败', 'OPERATION_FAILED', { error })
  }
}
```

### 边界情况处理
```javascript
// 添加空值检查
const safeGetProperty = (obj, path, defaultValue = null) => {
  try {
    return path.split('.').reduce((o, p) => o?.[p], obj) ?? defaultValue
  } catch {
    return defaultValue
  }
}
```

## 3. 代码组织改进

### 组合式函数拆分
```javascript
// 将复杂逻辑拆分为独立的composables
export function useCanvasOperations(graph) {
  const addNode = (nodeData) => { /* ... */ }
  const deleteNode = (nodeId) => { /* ... */ }
  const updateNode = (nodeId, data) => { /* ... */ }
  
  return { addNode, deleteNode, updateNode }
}

export function useCanvasEvents(graph) {
  const onNodeClick = (handler) => { /* ... */ }
  const onNodeDrag = (handler) => { /* ... */ }
  
  return { onNodeClick, onNodeDrag }
}
```

### 常量提取
```javascript
// 提取魔法数字和字符串
export const CANVAS_CONFIG = {
  DEFAULT_NODE_WIDTH: 120,
  DEFAULT_NODE_HEIGHT: 60,
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 3,
  GRID_SIZE: 20
}

export const NODE_TYPES = {
  START: 'start',
  SMS: 'sms',
  AI_CALL: 'ai-call',
  WAIT: 'wait'
} as const
```

## 4. 测试改进

### 单元测试示例
```javascript
// 使用Vitest进行单元测试
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskFlowCanvas from '@/components/TaskFlowCanvas.vue'

describe('TaskFlowCanvas', () => {
  it('should initialize canvas correctly', () => {
    const wrapper = mount(TaskFlowCanvas)
    expect(wrapper.vm.isGraphReady).toBe(false)
  })
  
  it('should add node when addNode is called', async () => {
    const wrapper = mount(TaskFlowCanvas)
    await wrapper.vm.addNode('sms', { x: 100, y: 100 })
    expect(wrapper.vm.nodes).toHaveLength(1)
  })
})
```

### 集成测试
```javascript
// 使用Cypress进行E2E测试
describe('Marketing Task Creation', () => {
  it('should create a marketing task with flow', () => {
    cy.visit('/marketing/tasks/create')
    cy.get('[data-testid="task-name"]').type('测试任务')
    cy.get('[data-testid="node-sms"]').drag('[data-testid="canvas"]')
    cy.get('[data-testid="save-task"]').click()
    cy.url().should('include', '/marketing/tasks')
  })
})
```

## 5. 文档改进

### JSDoc注释
```javascript
/**
 * 添加节点到画布
 * @param {NodeData} nodeData - 节点数据
 * @param {Object} options - 选项
 * @param {boolean} options.autoLayout - 是否自动布局
 * @returns {Promise<string>} 返回节点ID
 * @throws {AppError} 当节点数据无效时抛出错误
 */
async function addNodeToGraph(nodeData, options = {}) {
  // 实现逻辑
}
```

### README更新
```markdown
## 开发指南

### 环境要求
- Node.js >= 16
- npm >= 8

### 开发流程
1. 克隆仓库
2. 安装依赖: `npm install`
3. 启动开发服务器: `npm run dev`
4. 运行测试: `npm run test`

### 代码规范
- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- 提交前运行`npm run lint:fix`
```

## 6. 性能监控

### 添加性能指标
```javascript
// 性能监控工具
export class PerformanceMonitor {
  static measure(name, fn) {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    console.log(`${name}: ${end - start}ms`)
    return result
  }
  
  static async measureAsync(name, fn) {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    console.log(`${name}: ${end - start}ms`)
    return result
  }
}
```

## 7. 安全改进

### 输入验证
```javascript
// 输入验证工具
export const validators = {
  nodeId: (id) => /^[a-zA-Z0-9_-]+$/.test(id),
  nodeType: (type) => Object.values(NODE_TYPES).includes(type),
  position: (pos) => pos && typeof pos.x === 'number' && typeof pos.y === 'number'
}
```

### XSS防护
```javascript
// 安全的HTML渲染
import DOMPurify from 'dompurify'

const sanitizeHtml = (html) => DOMPurify.sanitize(html)
```