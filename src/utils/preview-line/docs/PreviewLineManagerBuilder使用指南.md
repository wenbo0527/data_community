# PreviewLineManagerBuilder 使用指南

## 概述

`PreviewLineManagerBuilder` 是一个使用 Builder 模式的构建器类，用于简化 `PreviewLineManager` 实例的创建和配置过程。它提供了链式调用的方式来设置各种配置选项，使代码更加清晰和易于维护。

## 核心特性

- **链式调用**: 支持方法链式调用，提高代码可读性
- **灵活配置**: 支持多种配置选项的组合
- **预设模式**: 提供开发、生产、测试等预设配置
- **参数验证**: 内置参数验证机制，确保配置正确性
- **性能优化**: 优化的内存使用和配置缓存

## 基本用法

### 1. 基础实例创建

```javascript
import { PreviewLineManagerBuilder } from '../core/PreviewLineManagerBuilder.js';

// 创建基础实例
const manager = new PreviewLineManagerBuilder()
  .withGraph(graph)
  .withLayoutEngine(layoutEngine)
  .withInitOptions({ autoInitialize: false })
  .build();
```

### 2. 完整配置示例

```javascript
const manager = new PreviewLineManagerBuilder()
  .withGraph(graph)
  .withBranchManager(branchManager)
  .withLayoutEngine(layoutEngine)
  .withRenderer(renderer)
  .withConfigManager(configManager)
  .withConfig({
    theme: 'dark',
    animation: {
      enabled: true,
      duration: 300
    }
  })
  .withPerformanceOptions({
    enablePerformanceMonitor: true,
    cacheEnabled: true,
    maxCacheSize: 1000
  })
  .withDebugOptions({
    enabled: true,
    logLevel: 'info'
  })
  .withInitOptions({
    autoInitialize: false,
    validateOnInit: true
  })
  .build();
```

## 预设配置

### 1. 默认配置

```javascript
const manager = PreviewLineManagerBuilder
  .createDefault()
  .withGraph(graph)
  .build();
```

### 2. 开发环境配置

```javascript
const manager = PreviewLineManagerBuilder
  .createForDevelopment()
  .withGraph(graph)
  .withLayoutEngine(layoutEngine)
  .build();
```

### 3. 生产环境配置

```javascript
const manager = PreviewLineManagerBuilder
  .createForProduction()
  .withGraph(graph)
  .withLayoutEngine(layoutEngine)
  .build();
```

### 4. 测试环境配置

```javascript
const manager = PreviewLineManagerBuilder
  .createForTesting()
  .withGraph(mockGraph)
  .withLayoutEngine(mockLayoutEngine)
  .build();
```

## 主题配置

### 1. 预设主题

```javascript
// 深色主题
const darkManager = new PreviewLineManagerBuilder()
  .withGraph(graph)
  .withDarkTheme()
  .build();

// 浅色主题
const lightManager = new PreviewLineManagerBuilder()
  .withGraph(graph)
  .withLightTheme()
  .build();
```

### 2. 自定义主题

```javascript
const customManager = new PreviewLineManagerBuilder()
  .withGraph(graph)
  .withConfig({
    theme: {
      primaryColor: '#007bff',
      backgroundColor: '#f8f9fa',
      borderColor: '#dee2e6'
    }
  })
  .build();
```

## 动画配置

```javascript
// 启用动画
const animatedManager = new PreviewLineManagerBuilder()
  .withGraph(graph)
  .withAnimationEnabled()
  .withConfig({
    animation: {
      duration: 500,
      easing: 'ease-in-out'
    }
  })
  .build();

// 禁用动画
const staticManager = new PreviewLineManagerBuilder()
  .withGraph(graph)
  .withAnimationDisabled()
  .build();
```

## 性能优化配置

```javascript
const optimizedManager = new PreviewLineManagerBuilder()
  .withGraph(graph)
  .withPerformanceOptions({
    enablePerformanceMonitor: true,
    cacheEnabled: true,
    maxCacheSize: 2000,
    debounceDelay: 100
  })
  .enablePerformanceMonitor(true)
  .build();
```

## 调试配置

```javascript
const debugManager = new PreviewLineManagerBuilder()
  .withGraph(graph)
  .withDebugOptions({
    enabled: true,
    logLevel: 'debug',
    showPerformanceMetrics: true
  })
  .enableDebug(true, 'debug')
  .build();
```

## 事件处理配置

```javascript
const eventManager = new PreviewLineManagerBuilder()
  .withGraph(graph)
  .withEventOptions({
    enableEventListeners: true,
    eventThrottleDelay: 50
  })
  .addEventHandler('nodeClick', (event) => {
    console.log('节点被点击:', event);
  })
  .addEventHandler('edgeHover', (event) => {
    console.log('边被悬停:', event);
  })
  .build();
```

## 验证配置

```javascript
const validatedManager = new PreviewLineManagerBuilder()
  .withGraph(graph)
  .withLayoutEngine(layoutEngine)
  .withValidatorOptions({
    strictMode: true,
    validateOnBuild: true
  })
  .validate() // 手动验证
  .build();
```

## 工厂函数

### 1. 创建 Builder 实例

```javascript
import { createPreviewLineManagerBuilder } from '../core/PreviewLineManagerBuilder.js';

const builder = createPreviewLineManagerBuilder();
const manager = builder
  .withGraph(graph)
  .withLayoutEngine(layoutEngine)
  .build();
```

### 2. 直接创建 Manager 实例

```javascript
import { createPreviewLineManager } from '../core/PreviewLineManagerBuilder.js';

const manager = createPreviewLineManager(graph, {
  layoutEngine,
  config: { theme: 'dark' },
  initOptions: { autoInitialize: false }
});
```

## 与现有系统集成

### 1. 与 PreviewLineSystem 集成

```javascript
// 在 PreviewLineSystem 中使用 Builder
class PreviewLineSystem {
  initCoreModules() {
    this.previewLineManager = new PreviewLineManagerBuilder()
      .withGraph(this.graph)
      .withConfigManager(this.configManager)
      .withEventManager(this.eventManager)
      .withLayoutEngine(this.layoutEngine)
      .withInitOptions({ autoInitialize: false })
      .build();
  }
}
```

### 2. 与 LegacyAdapter 集成

```javascript
// 在 LegacyAdapter 中使用 Builder
class LegacyAdapter {
  initializeNewManager() {
    const mergedOptions = this.mergeOptions();
    
    this.newManager = new PreviewLineManagerBuilder()
      .withGraph(mergedOptions.graph)
      .withBranchManager(mergedOptions.branchManager)
      .withLayoutEngine(mergedOptions.layoutEngine)
      .withConfig(mergedOptions.config)
      .withInitOptions({ autoInitialize: false })
      .build();
  }
}
```

## 错误处理

```javascript
try {
  const manager = new PreviewLineManagerBuilder()
    .withGraph(null) // 这会抛出错误
    .build();
} catch (error) {
  if (error.name === 'RequiredParameterError') {
    console.error('缺少必需参数:', error.message);
  } else if (error.name === 'ParameterTypeError') {
    console.error('参数类型错误:', error.message);
  } else {
    console.error('构建失败:', error.message);
  }
}
```

## 最佳实践

### 1. 参数验证

```javascript
// 推荐：在构建前验证参数
const manager = new PreviewLineManagerBuilder()
  .withGraph(graph)
  .withLayoutEngine(layoutEngine)
  .validate() // 验证配置
  .build();
```

### 2. 配置复用

```javascript
// 推荐：复用 Builder 实例
const builder = new PreviewLineManagerBuilder()
  .withGraph(graph)
  .withLayoutEngine(layoutEngine);

const manager1 = builder
  .withConfig({ theme: 'dark' })
  .build();

const manager2 = builder
  .reset() // 重置配置
  .withConfig({ theme: 'light' })
  .build();
```

### 3. 环境特定配置

```javascript
// 推荐：根据环境选择配置
const createManager = (graph, layoutEngine) => {
  const baseBuilder = new PreviewLineManagerBuilder()
    .withGraph(graph)
    .withLayoutEngine(layoutEngine);

  if (process.env.NODE_ENV === 'development') {
    return baseBuilder
      .withDebugOptions({ enabled: true, logLevel: 'debug' })
      .enablePerformanceMonitor(true)
      .build();
  } else {
    return baseBuilder
      .withPerformanceOptions({ cacheEnabled: true })
      .build();
  }
};
```

## 性能考虑

1. **Builder 实例复用**: 可以复用 Builder 实例来创建多个 Manager
2. **配置缓存**: Builder 内部会缓存常用配置以提高性能
3. **延迟初始化**: 使用 `autoInitialize: false` 来控制初始化时机
4. **内存管理**: 使用 `reset()` 方法清理不需要的引用

## 常见问题

### Q: 如何处理配置冲突？
A: Builder 会在构建时检测配置冲突并抛出 `ConfigurationConflictError`。

### Q: 可以在运行时修改配置吗？
A: Builder 主要用于创建时配置，运行时修改请使用 Manager 实例的方法。

### Q: 如何调试 Builder 配置？
A: 使用 `enableDebug(true, 'debug')` 启用详细日志输出。

## 总结

`PreviewLineManagerBuilder` 提供了一种灵活、可扩展的方式来创建和配置 `PreviewLineManager` 实例。通过使用 Builder 模式，可以：

- 简化复杂对象的创建过程
- 提高代码的可读性和可维护性
- 支持多种配置组合
- 提供类型安全的参数验证
- 优化性能和内存使用

建议在项目中使用 Builder 模式来替代直接的构造函数调用，特别是在需要复杂配置的场景中。