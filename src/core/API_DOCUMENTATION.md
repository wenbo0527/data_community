# 统一事件系统 API 文档

## 概述

CanvasEventSystem 是营销画布的统一事件管理系统，提供标准化的事件处理、性能优化和内存管理功能。

## 快速开始

### 基本初始化

```javascript
import { CanvasEventSystem } from '@/core/index'

// 初始化事件系统
CanvasEventSystem.initialize({
  debug: true,
  performance: true,
  store: storeInstance, // Vuex store（可选）
  graph: graphInstance // AntV X6 graph 实例（可选）
})

// 启用性能优化（推荐）
CanvasEventSystem.enablePerformanceOptimization({
  enablePerformanceMonitoring: true,
  enableMemoryManagement: true,
  enableEventBatching: true,
  batchSize: 20,
  maxMemoryUsage: 150 * 1024 * 1024 // 150MB
})
```

### 基本事件操作

```javascript
// 监听事件
CanvasEventSystem.eventBus.on('canvas.keyboard.delete', (data) => {
  console.log('Delete event:', data)
})

// 发布事件
CanvasEventSystem.eventBus.emit('canvas.keyboard.delete', { 
  nodeId: 'node1',
  timestamp: Date.now() 
})

// 移除监听器
const off = CanvasEventSystem.eventBus.on('event.name', handler)
off() // 移除监听器
```

## API 参考

### CanvasEventSystem

#### 初始化方法

##### `initialize(config)`
初始化统一事件系统。

**参数：**
- `config` (Object): 配置对象
  - `debug` (boolean): 是否启用调试模式，默认 `false`
  - `performance` (boolean): 是否启用性能监控，默认 `true`
  - `store` (Object): Vuex store 实例（可选）
  - `graph` (Object): AntV X6 graph 实例（可选）

**示例：**
```javascript
CanvasEventSystem.initialize({
  debug: true,
  performance: true,
  store: store,
  graph: graph
})
```

##### `destroy()`
销毁事件系统，清理所有资源。

#### 性能优化方法

##### `enablePerformanceOptimization(config)`
启用性能优化功能。

**参数：**
- `config` (Object): 优化配置
  - `enablePerformanceMonitoring` (boolean): 启用性能监控
  - `enableMemoryManagement` (boolean): 启用内存管理
  - `enableEventBatching` (boolean): 启用事件批处理
  - `enableLazyLoading` (boolean): 启用延迟加载
  - `batchSize` (number): 批处理大小，默认 `10`
  - `batchTimeout` (number): 批处理超时时间（毫秒），默认 `50`
  - `maxMemoryUsage` (number): 最大内存使用（字节），默认 `100MB`
  - `cleanupInterval` (number): 清理间隔（毫秒），默认 `30000`

**示例：**
```javascript
CanvasEventSystem.enablePerformanceOptimization({
  enablePerformanceMonitoring: true,
  enableMemoryManagement: true,
  enableEventBatching: true,
  batchSize: 20,
  maxMemoryUsage: 150 * 1024 * 1024
})
```

##### `disablePerformanceOptimization()`
禁用性能优化功能。

#### 状态查询方法

##### `isInitialized()`
返回事件系统是否已初始化。

**返回：** `boolean`

##### `getVersion()`
获取事件系统版本。

**返回：** `string`

##### `getPerformanceStats()`
获取性能统计信息。

**返回：** `Object`
- `eventBusStats`: 事件总线统计
- `eventManagerStats`: 事件管理器统计
- `keyboardHandlerStats`: 键盘处理器统计
- `serviceIntegrationStats`: 服务集成统计
- `performanceMonitor`: 性能监控统计
- `memoryManager`: 内存管理统计

##### `getOptimizationReport()`
获取优化报告。

**返回：** `Object`
- `optimizationEnabled`: 优化是否启用
- `config`: 当前配置
- `performance`: 性能报告
- `memory`: 内存报告
- `recommendations`: 优化建议

### eventBus 事件总线

#### 事件监听方法

##### `on(eventName, handler, priority?)`
监听事件。

**参数：**
- `eventName` (string): 事件名称，支持命名空间（如 `canvas.keyboard.delete`）
- `handler` (Function): 事件处理函数
- `priority` (number): 优先级，数字越大优先级越高，默认 `0`

**返回：** `Function` - 移除监听器的函数

**示例：**
```javascript
const off = CanvasEventSystem.eventBus.on('canvas.node.add', (data) => {
  console.log('Node added:', data)
})

// 移除监听器
off()
```

##### `once(eventName, handler, priority?)`
监听一次性事件。

**参数：**同 `on` 方法

**返回：** `Function` - 移除监听器的函数

##### `off(eventName?, handler?)`
移除事件监听器。

**参数：**
- `eventName` (string): 事件名称（可选）
- `handler` (Function): 事件处理函数（可选）

**示例：**
```javascript
// 移除指定事件的所有监听器
CanvasEventSystem.eventBus.off('canvas.node.add')

// 移除指定事件的指定监听器
CanvasEventSystem.eventBus.off('canvas.node.add', handler)

// 移除所有事件的所有监听器
CanvasEventSystem.eventBus.off()
```

#### 事件发布方法

##### `emit(eventName, data?)`
发布事件。

**参数：**
- `eventName` (string): 事件名称
- `data` (any): 事件数据（可选）

**示例：**
```javascript
CanvasEventSystem.eventBus.emit('canvas.keyboard.delete', {
  nodeId: 'node1',
  timestamp: Date.now()
})
```

##### `emitAsync(eventName, data?)`
异步发布事件。

**参数：**同 `emit` 方法

**返回：** `Promise` - 所有处理器执行完成的 Promise

#### 查询方法

##### `getListenerCount(eventName?)`
获取监听器数量。

**参数：**
- `eventName` (string): 事件名称（可选）

**返回：** `number`

##### `getStats()`
获取事件总线统计信息。

**返回：** `Object`
- `totalEvents`: 总事件数
- `totalListeners`: 总监听器数
- `averageProcessingTime`: 平均处理时间
- `errorCount`: 错误数

### eventManager 事件管理器

#### 事件处理器管理

##### `registerProcessor(processor)`
注册事件处理器。

**参数：**
- `processor` (Object): 处理器配置
  - `name` (string): 处理器名称
  - `handler` (Function): 处理函数
  - `priority` (number): 优先级
  - `filter` (Function): 过滤器函数（可选）

##### `unregisterProcessor(name)`
注销事件处理器。

**参数：**
- `name` (string): 处理器名称

#### 事件拦截和修改

##### `addInterceptor(interceptor)`
添加事件拦截器。

**参数：**
- `interceptor` (Object): 拦截器配置
  - `name` (string): 拦截器名称
  - `handler` (Function): 拦截函数
  - `priority` (number): 优先级

##### `removeInterceptor(name)`
移除事件拦截器。

**参数：**
- `name` (string): 拦截器名称

### keyboardHandler 键盘事件处理器

#### 快捷键管理

##### `registerShortcut(shortcut)`
注册快捷键。

**参数：**
- `shortcut` (Object): 快捷键配置
  - `key` (string): 按键
  - `modifiers` (string[]): 修饰键（如 `ctrl`, `shift`, `alt`）
  - `handler` (Function): 处理函数
  - `context` (string): 上下文（可选）
  - `description` (string): 描述（可选）
  - `priority` (number): 优先级（可选）

**示例：**
```javascript
CanvasEventSystem.keyboardHandler.registerShortcut({
  key: 'Delete',
  modifiers: [],
  handler: () => {
    CanvasEventSystem.eventBus.emit('canvas.keyboard.delete', {})
  },
  description: 'Delete selected nodes'
})
```

##### `unregisterShortcut(key, modifiers?)`
注销快捷键。

**参数：**
- `key` (string): 按键
- `modifiers` (string[]): 修饰键（可选）

##### `getRegisteredShortcuts()`
获取已注册的快捷键。

**返回：** `Array` - 快捷键配置数组

#### 状态管理

##### `enable()`
启用键盘事件处理。

##### `disable()`
禁用键盘事件处理。

##### `isEnabled()`
返回键盘事件处理是否启用。

**返回：** `boolean`

## 事件类型

### 节点事件

| 事件名称 | 描述 | 数据格式 |
|---------|------|----------|
| `canvas.node.add` | 节点添加 | `{ node, position }` |
| `canvas.node.remove` | 节点移除 | `{ nodeId }` |
| `canvas.node.update` | 节点更新 | `{ nodeId, data }` |
| `canvas.node.select` | 节点选中 | `{ nodeId, selected }` |
| `canvas.node.move` | 节点移动 | `{ nodeId, position }` |

### 连接事件

| 事件名称 | 描述 | 数据格式 |
|---------|------|----------|
| `canvas.connection.add` | 连接添加 | `{ connection }` |
| `canvas.connection.remove` | 连接移除 | `{ connectionId }` |
| `canvas.connection.update` | 连接更新 | `{ connectionId, data }` |
| `canvas.connection.select` | 连接选中 | `{ connectionId, selected }` |

### 键盘事件

| 事件名称 | 描述 | 数据格式 |
|---------|------|----------|
| `canvas.keyboard.delete` | 删除键 | `{}` |
| `canvas.keyboard.undo` | 撤销 | `{}` |
| `canvas.keyboard.redo` | 重做 | `{}` |
| `canvas.keyboard.copy` | 复制 | `{}` |
| `canvas.keyboard.paste` | 粘贴 | `{}` |
| `canvas.keyboard.selectAll` | 全选 | `{}` |

### 鼠标事件

| 事件名称 | 描述 | 数据格式 |
|---------|------|----------|
| `canvas.mouse.click` | 鼠标点击 | `{ x, y, event }` |
| `canvas.mouse.move` | 鼠标移动 | `{ x, y, event }` |
| `canvas.mouse.down` | 鼠标按下 | `{ x, y, event }` |
| `canvas.mouse.up` | 鼠标释放 | `{ x, y, event }` |

### 画布事件

| 事件名称 | 描述 | 数据格式 |
|---------|------|----------|
| `canvas.ready` | 画布就绪 | `{ graph }` |
| `canvas.reset` | 画布重置 | `{}` |
| `canvas.clear` | 画布清空 | `{}` |
| `canvas.error` | 画布错误 | `{ error, context }` |
| `canvas.warning` | 画布警告 | `{ warning, context }` |

## 最佳实践

### 1. 事件命名规范

- 使用小写字母和点分隔符
- 采用层级结构：`模块.组件.动作`
- 保持命名一致性

**示例：**
```javascript
// 好的命名
canvas.node.add
canvas.keyboard.delete
canvas.mouse.click

// 不好的命名
nodeAdd
canvas-node-add
CanvasNodeAdd
```

### 2. 事件数据处理

- 保持事件数据简单和可序列化
- 包含必要的时间戳信息
- 避免循环引用

**示例：**
```javascript
// 好的实践
CanvasEventSystem.eventBus.emit('canvas.node.add', {
  node: { id: 'node1', type: 'start' },
  position: { x: 100, y: 200 },
  timestamp: Date.now()
})

// 不好的实践
CanvasEventSystem.eventBus.emit('canvas.node.add', {
  node: complexNodeObject, // 可能包含循环引用
  graph: this.graph, // 不可序列化
  callbacks: [fn1, fn2] // 函数不可序列化
})
```

### 3. 性能优化

- 使用事件批处理处理高频事件
- 及时移除不需要的事件监听器
- 合理使用事件优先级

**示例：**
```javascript
// 启用性能优化
CanvasEventSystem.enablePerformanceOptimization({
  enableEventBatching: true,
  batchSize: 20,
  batchTimeout: 100
})

// 及时清理监听器
const off = CanvasEventSystem.eventBus.on('event.name', handler)
// ... 当不再需要时
off()

// 使用适当的优先级
CanvasEventSystem.eventBus.on('canvas.error', errorHandler, 100) // 高优先级
CanvasEventSystem.eventBus.on('canvas.mouse.move', moveHandler, 0) // 普通优先级
```

### 4. 错误处理

- 在事件处理器中添加错误处理
- 使用 try-catch 包裹事件处理逻辑
- 记录错误信息便于调试

**示例：**
```javascript
CanvasEventSystem.eventBus.on('canvas.node.add', (data) => {
  try {
    // 事件处理逻辑
    processNodeAddition(data)
  } catch (error) {
    console.error('Error processing node addition:', error)
    // 可以发布错误事件
    CanvasEventSystem.eventBus.emit('canvas.error', {
      error: error.message,
      context: 'node.add',
      data
    })
  }
})
```

## 故障排除

### 常见问题

#### 1. 事件监听器不工作

**问题：** 事件监听器没有响应

**解决方案：**
```javascript
// 检查事件系统是否初始化
if (!CanvasEventSystem.isInitialized()) {
  console.error('CanvasEventSystem not initialized')
  return
}

// 检查事件名称是否正确
console.log('Available events:', CanvasEventSystem.eventBus.getStats())

// 验证监听器是否注册成功
const listenerCount = CanvasEventSystem.eventBus.getListenerCount('your.event.name')
console.log('Listener count:', listenerCount)
```

#### 2. 性能问题

**问题：** 事件处理导致性能下降

**解决方案：**
```javascript
// 启用性能优化
CanvasEventSystem.enablePerformanceOptimization({
  enablePerformanceMonitoring: true,
  enableEventBatching: true,
  enableMemoryManagement: true
})

// 检查性能报告
const report = CanvasEventSystem.getOptimizationReport()
console.log('Performance issues:', report.recommendations)

// 获取详细的性能统计
const stats = CanvasEventSystem.getPerformanceStats()
console.log('Performance stats:', stats)
```

#### 3. 内存泄漏

**问题：** 内存使用持续增长

**解决方案：**
```javascript
// 检查内存使用报告
const report = CanvasEventSystem.getOptimizationReport()
if (report.memory) {
  console.log('Memory usage:', report.memory.currentMemory)
  console.log('Memory recommendations:', report.memory.recommendations)
}

// 确保正确清理监听器
const off = CanvasEventSystem.eventBus.on('event.name', handler)
// 在组件卸载时清理
onUnmounted(() => {
  off()
})
```

### 调试技巧

#### 1. 启用调试模式

```javascript
CanvasEventSystem.initialize({
  debug: true, // 启用调试模式
  performance: true
})
```

#### 2. 监控事件流

```javascript
// 监听所有事件
CanvasEventSystem.eventBus.on('*', (eventName, data) => {
  console.log(`Event: ${eventName}`, data)
})

// 监控特定事件类型
const eventsToMonitor = ['canvas.node.add', 'canvas.keyboard.delete']
eventsToMonitor.forEach(eventName => {
  CanvasEventSystem.eventBus.on(eventName, (data) => {
    console.time(`Event: ${eventName}`)
    // 事件处理逻辑
    console.timeEnd(`Event: ${eventName}`)
  })
})
```

#### 3. 性能分析

```javascript
// 分析事件处理性能
const startTime = performance.now()
CanvasEventSystem.eventBus.emit('your.event.name', data)
const endTime = performance.now()
console.log(`Event processing time: ${endTime - startTime}ms`)
```

## 更新日志

### v1.0.0
- 初始版本发布
- 统一事件系统核心功能
- 性能优化和内存管理
- 完整的单元测试覆盖
- TaskFlowCanvasRefactored 集成