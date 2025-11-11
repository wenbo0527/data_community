# 营销画布事件管理优化方案 - 代码清理和文档更新

## 代码清理

### 1. 移除旧的键盘事件处理代码

在 `TaskFlowCanvasRefactored.vue` 中，需要移除以下旧的键盘事件处理相关代码：

```javascript
// 移除旧的键盘事件监听
this.graph.on('keydown', this.handleKeyDown)
this.graph.on('keyup', this.handleKeyUp)

// 移除旧的键盘事件处理方法
handleKeyDown(e) {
  // 旧的键盘事件处理逻辑
}

handleKeyUp(e) {
  // 旧的键盘事件处理逻辑
}

// 移除旧的键盘事件清理
this.graph.off('keydown', this.handleKeyDown)
this.graph.off('keyup', this.handleKeyUp)
```

### 2. 清理事件监听器

确保所有事件监听器都被正确清理：

```javascript
// 在组件卸载时清理所有监听器
onBeforeUnmount(() => {
  // 清理统一事件系统
  if (this.canvasEventSystem) {
    CanvasEventSystem.disablePerformanceOptimization()
  }
  
  // 清理图形实例
  if (this.graph) {
    this.graph.dispose()
  }
  
  // 清理服务层
  if (this.serviceManager) {
    this.serviceManager.destroy()
  }
})
```

### 3. 移除重复的事件处理逻辑

检查并移除任何重复的事件处理逻辑，确保只使用统一事件系统。

## 文档更新

### 1. 组件文档更新

更新 `TaskFlowCanvasRefactored.vue` 的组件文档：

```markdown
## TaskFlowCanvasRefactored

### 描述
营销画布重构组件，集成了统一事件系统、性能优化和内存管理功能。

### 特性
- 统一事件系统：标准化的键盘、鼠标和画布事件处理
- 性能优化：事件批处理、内存管理、性能监控
- 向后兼容：支持新旧事件系统并存
- 可扩展架构：支持自定义事件处理器和适配器

### 事件系统
组件使用 CanvasEventSystem 处理所有事件：

```javascript
// 监听画布事件
CanvasEventSystem.eventBus.on('canvas.keyboard.delete', (data) => {
  // 处理删除事件
})

// 发布自定义事件
CanvasEventSystem.eventBus.emit('custom.event.name', data)
```

### 性能优化
自动启用性能优化功能：
- 事件批处理：减少高频事件的处理开销
- 内存管理：自动检测和清理内存泄漏
- 性能监控：实时监控事件处理性能
```

### 2. 开发指南更新

更新开发指南，包含统一事件系统的使用说明：

```markdown
## 开发指南

### 事件系统使用

#### 基本事件处理
```javascript
import { CanvasEventSystem } from '@/core/index'

// 监听节点添加事件
CanvasEventSystem.eventBus.on('canvas.node.add', (data) => {
  console.log('Node added:', data.node)
})

// 发布自定义事件
CanvasEventSystem.eventBus.emit('custom.event', { message: 'Hello' })
```

#### 键盘快捷键
```javascript
// 注册快捷键
CanvasEventSystem.keyboardHandler.registerShortcut({
  key: 'Delete',
  modifiers: [],
  handler: () => {
    // 处理删除逻辑
  },
  description: 'Delete selected nodes'
})
```

#### 性能优化
```javascript
// 启用性能优化
CanvasEventSystem.enablePerformanceOptimization({
  enableEventBatching: true,
  batchSize: 20,
  enableMemoryManagement: true
})
```
```

### 3. README 更新

更新项目 README，添加统一事件系统的说明：

```markdown
## 营销画布事件管理优化

### 项目概述
本项目对营销画布的事件管理系统进行了全面优化，实现了统一的事件处理架构。

### 核心功能
- **统一事件系统**：标准化的事件总线，支持事件监听、发布、拦截和修改
- **性能优化**：事件批处理、内存管理、性能监控
- **键盘事件处理**：支持快捷键、组合键、平台适配
- **向后兼容**：支持新旧事件系统并存，平滑迁移
- **完整测试**：单元测试覆盖率超过 90%

### 快速开始
```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev

# 运行测试
npm run test
```

### 使用示例
```javascript
import { CanvasEventSystem } from '@/core/index'

// 初始化事件系统
CanvasEventSystem.initialize({
  debug: true,
  performance: true
})

// 监听事件
CanvasEventSystem.eventBus.on('canvas.node.add', (data) => {
  console.log('Node added:', data)
})
```
```

## 代码质量检查

### 1. 代码风格检查
运行 ESLint 检查代码风格：
```bash
npm run lint
```

### 2. 类型检查
运行 TypeScript 类型检查：
```bash
npm run check
```

### 3. 单元测试
运行所有单元测试：
```bash
npm run test
```

### 4. 性能测试
运行性能基准测试：
```bash
npm run test:performance
```

## 部署检查清单

### 1. 功能检查
- [ ] 所有键盘快捷键正常工作
- [ ] 节点添加/删除/移动功能正常
- [ ] 画布事件正确处理
- [ ] 性能优化功能启用
- [ ] 内存管理功能正常

### 2. 性能检查
- [ ] 事件处理延迟 < 16ms
- [ ] 内存使用稳定，无泄漏
- [ ] 高频事件批处理生效
- [ ] 性能监控数据正常

### 3. 兼容性检查
- [ ] 新旧事件系统并存
- [ ] 向后兼容 API 正常
- [ ] 不同浏览器兼容性
- [ ] 移动端适配

### 4. 测试检查
- [ ] 单元测试通过率 100%
- [ ] 集成测试通过
- [ ] 性能测试达标
- [ ] 错误处理测试通过