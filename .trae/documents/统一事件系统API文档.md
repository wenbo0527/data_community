# 统一事件系统API文档

## 统一事件总线 (UnifiedEventBus)

### 方法

#### `on(eventType, handler, options?)`
注册事件监听器

**参数：**
- `eventType: string` - 事件类型
- `handler: Function` - 事件处理函数
- `options?: EventOptions` - 可选配置
  - `priority: number` - 事件优先级，默认为0
  - `once: boolean` - 是否只监听一次，默认为false

**返回值：** `Function` - 注销函数

**示例：**
```typescript
const unsubscribe = eventBus.on('canvas:keydown', (event) => {
  console.log('Key pressed:', event.key)
})

// 注销监听器
unsubscribe()
```

#### `emit(eventType, ...args)`
触发事件

**参数：**
- `eventType: string` - 事件类型
- `...args: any[]` - 传递给事件处理函数的参数

**返回值：** `void`

**示例：**
```typescript
eventBus.emit('node:select', { nodeId: '123', position: { x: 100, y: 200 } })
```

#### `off(eventType, handler?)`
注销事件监听器

**参数：**
- `eventType: string` - 事件类型
- `handler?: Function` - 要注销的具体处理函数，如果不提供则注销该类型的所有监听器

**返回值：** `void`

**示例：**
```typescript
eventBus.off('canvas:keydown') // 注销所有keydown事件监听器
```

#### `clear()`
清除所有事件监听器

**返回值：** `void`

## 键盘事件处理器 (KeyboardEventHandler)

### 方法

#### `registerShortcut(keyCombo, handler, options?)`
注册键盘快捷键

**参数：**
- `keyCombo: string` - 快捷键组合，如 'ctrl+s', 'delete'
- `handler: Function` - 快捷键处理函数
- `options?: ShortcutOptions` - 可选配置
  - `preventDefault: boolean` - 是否阻止默认行为，默认为true
  - `stopPropagation: boolean` - 是否阻止事件冒泡，默认为false
  - `priority: number` - 优先级，默认为0

**返回值：** `Function` - 注销函数

**示例：**
```typescript
const unregister = keyboardHandler.registerShortcut('ctrl+s', () => {
  saveCanvas()
})
```

#### `registerConditionalShortcut(keyCombo, condition, handler, options?)`
注册条件性键盘快捷键

**参数：**
- `keyCombo: string` - 快捷键组合
- `condition: Function | boolean` - 条件函数或布尔值
- `handler: Function` - 快捷键处理函数
- `options?: ShortcutOptions` - 可选配置

**返回值：** `Function` - 注销函数

**示例：**
```typescript
keyboardHandler.registerConditionalShortcut('delete', 
  () => hasSelectedNodes.value,
  () => deleteSelectedNodes()
)
```

#### `unregisterShortcut(keyCombo, handler?)`
注销键盘快捷键

**参数：**
- `keyCombo: string` - 快捷键组合
- `handler?: Function` - 具体的处理函数

**返回值：** `void`

#### `clearShortcuts()`
清除所有注册的快捷键

**返回值：** `void`

## 生命周期管理器 (CanvasLifecycle)

### 方法

#### `initialize(options?)`
初始化画布生命周期

**参数：**
- `options?: LifecycleOptions` - 可选配置
  - `enableKeyboard: boolean` - 是否启用键盘事件，默认为true
  - `enableResize: boolean` - 是否启用resize事件，默认为true
  - `enableAutoSave: boolean` - 是否启用自动保存，默认为true

**返回值：** `Promise<void>`

**示例：**
```typescript
await initialize({
  enableKeyboard: true,
  enableResize: true,
  enableAutoSave: false
})
```

#### `destroy()`
销毁画布生命周期，清理所有事件监听器

**返回值：** `void`

#### `registerKeyboardShortcuts(shortcuts)`
注册键盘快捷键映射

**参数：**
- `shortcuts: Record<string, Function>` - 快捷键映射对象

**返回值：** `void`

**示例：**
```typescript
registerKeyboardShortcuts({
  'ctrl+z': undo,
  'ctrl+y': redo,
  'ctrl+s': save,
  'delete': deleteSelected
})
```

#### `registerContextAwareShortcuts(contextShortcuts)`
注册上下文感知的键盘快捷键

**参数：**
- `contextShortcuts: ContextShortcut[]` - 上下文快捷键配置数组

**返回值：** `void`

**示例：**
```typescript
registerContextAwareShortcuts([
  {
    key: 'delete',
    condition: () => hasSelectedNodes.value,
    handler: deleteSelectedNodes
  },
  {
    key: 'escape',
    condition: () => isEditing.value,
    handler: exitEditMode
  }
])
```

## 事件类型定义 (EventTypes)

### 画布事件

```typescript
export const EventTypes = {
  CANVAS: {
    KEYDOWN: 'canvas:keydown',           // 键盘按下事件
    KEYUP: 'canvas:keyup',               // 键盘释放事件
    RESIZE: 'canvas:resize',             // 画布大小改变事件
    BEFORE_UNLOAD: 'window:beforeunload', // 页面卸载前事件
    VISIBILITY_CHANGE: 'window:visibilitychange' // 页面可见性改变事件
  }
}
```

### 节点事件

```typescript
export const EventTypes = {
  NODE: {
    SELECT: 'node:select',               // 节点选中事件
    DESELECT: 'node:deselect',           // 节点取消选中事件
    DELETE: 'node:delete',               // 节点删除事件
    CREATE: 'node:create',               // 节点创建事件
    UPDATE: 'node:update'                // 节点更新事件
  }
}
```

### 边事件

```typescript
export const EventTypes = {
  EDGE: {
    SELECT: 'edge:select',               // 边选中事件
    DELETE: 'edge:delete',               // 边删除事件
    CREATE: 'edge:create',               // 边创建事件
    UPDATE: 'edge:update'                // 边更新事件
  }
}
```

## 工具函数

### `useEventThrottle(handler, delay)`
创建节流的事件处理器

**参数：**
- `handler: Function` - 原始事件处理函数
- `delay: number` - 节流延迟时间（毫秒）

**返回值：** `Function` - 节流后的处理函数

### `useEventDebounce(handler, delay)`
创建防抖的事件处理器

**参数：**
- `handler: Function` - 原始事件处理函数
- `delay: number` - 防抖延迟时间（毫秒）

**返回值：** `Function` - 防抖后的处理函数

### `createEventPriorityManager()`
创建事件优先级管理器

**返回值：** `EventPriorityManager`

## 错误处理

### 事件处理错误

所有事件处理器都应该包含错误处理逻辑：

```typescript
eventBus.on('canvas:keydown', (event) => {
  try {
    // 事件处理逻辑
    handleKeydown(event)
  } catch (error) {
    console.error('键盘事件处理错误:', error)
    // 记录错误日志
    logError('keyboard_event_error', error)
  }
})
```

### 键盘事件错误

```typescript
keyboardHandler.registerShortcut('ctrl+s', () => {
  try {
    saveCanvas()
  } catch (error) {
    console.error('保存操作失败:', error)
    showErrorMessage('保存失败，请重试')
  }
})
```

## 性能优化

### 事件节流

对于高频事件，使用节流优化性能：

```typescript
import { useEventThrottle } from '@/composables/canvas/unified/useEventThrottle'

const throttledResize = useEventThrottle((event) => {
  updateCanvasSize()
}, 100)

eventBus.on('canvas:resize', throttledResize)
```

### 事件防抖

对于输入类事件，使用防抖减少处理次数：

```typescript
import { useEventDebounce } from '@/composables/canvas/unified/useEventDebounce'

const debouncedSave = useEventDebounce(() => {
  saveCanvas()
}, 500)

keyboardHandler.registerShortcut('ctrl+s', debouncedSave)
```