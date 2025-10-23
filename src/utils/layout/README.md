# 统一布局引擎 (UnifiedLayoutEngine)

## 概述

统一布局引擎是一个高性能、模块化的图形布局计算系统，专为复杂的工作流图形设计。它提供了完整的布局计算功能，包括数据预处理、分层计算、定位优化、性能监控和缓存机制。

## 特性

- 🚀 **高性能**: 内置缓存机制和性能监控
- 🔧 **模块化**: 可插拔的模块架构，易于扩展
- 🔄 **向后兼容**: 完全兼容现有的 `UnifiedStructuredLayoutEngine` API
- 🛡️ **健壮性**: 完整的错误处理和验证机制
- 📊 **监控**: 详细的性能报告和调试信息
- 🔒 **线程安全**: 预览线锁定机制，避免并发问题

## 快速开始

### 基本使用

```javascript
import UnifiedLayoutEngine from './UnifiedLayoutEngine.js';

// 创建布局引擎实例
const layoutEngine = new UnifiedLayoutEngine({
  enableCache: true,
  enablePerformanceMonitoring: true,
  debounceDelay: 300
});

// 设置图实例和预览线管理器
layoutEngine.updateGraph(graphInstance);
layoutEngine.updatePreviewManager(previewLineManager);

// 执行布局
const result = await layoutEngine.executeLayout({
  direction: 'TB',
  nodeSpacing: 50,
  layerSpacing: 100
});

if (result.success) {
  console.log('布局计算成功');
} else {
  console.error('布局计算失败:', result.error);
}
```

### 防抖执行

对于频繁触发的场景，可以使用防抖执行：

```javascript
// 防抖执行布局，避免频繁计算
const result = await layoutEngine.debouncedExecuteLayout({
  direction: 'TB'
});
```

## API 参考

### 构造函数

```javascript
new UnifiedLayoutEngine(options)
```

**参数:**
- `options` (Object): 配置选项
  - `enableCache` (Boolean): 是否启用缓存，默认 `true`
  - `enablePerformanceMonitoring` (Boolean): 是否启用性能监控，默认 `true`
  - `debounceDelay` (Number): 防抖延迟时间(ms)，默认 `300`
  - `maxCacheSize` (Number): 最大缓存大小，默认 `100`

### 核心方法

#### executeLayout(options)

执行布局计算的主要方法。

**参数:**
- `options` (Object): 布局选项
  - `direction` (String): 布局方向，'TB'(上下) 或 'LR'(左右)
  - `nodeSpacing` (Number): 节点间距
  - `layerSpacing` (Number): 层级间距
  - `enableOptimization` (Boolean): 是否启用优化

**返回值:**
```javascript
{
  success: Boolean,
  error?: String,
  timestamp: Number,
  metrics?: Object
}
```

#### updateGraph(graph)

更新图实例。

**参数:**
- `graph` (Object): X6 图实例

#### updatePreviewManager(previewManager)

更新预览线管理器。

**参数:**
- `previewManager` (Object): 预览线管理器实例

#### getPerformanceReport()

获取性能报告。

**返回值:**
```javascript
{
  monitor: Object,    // 性能监控数据
  cache: Object,      // 缓存统计
  lock: Object,       // 锁状态
  lastError: Error    // 最后的错误
}
```

#### dispose()

清理资源，用于组件销毁时调用。

## 迁移指南

### 从 UnifiedStructuredLayoutEngine 迁移

新的 `UnifiedLayoutEngine` 完全兼容现有的 `UnifiedStructuredLayoutEngine` API，迁移过程非常简单：

#### 1. 更新导入语句

```javascript
// 旧版本
import UnifiedStructuredLayoutEngine from './UnifiedStructuredLayoutEngine.js';

// 新版本 - 方式1：使用新名称
import UnifiedLayoutEngine from './UnifiedLayoutEngine.js';

// 新版本 - 方式2：保持兼容性
import { UnifiedStructuredLayoutEngine } from './UnifiedLayoutEngine.js';
```

#### 2. 实例化保持不变

```javascript
// 旧版本和新版本的实例化方式完全相同
const layoutEngine = new UnifiedLayoutEngine(options);
```

#### 3. 方法调用保持不变

所有现有的方法调用都无需修改：

```javascript
// 这些方法调用在新版本中完全兼容
layoutEngine.updateGraph(graph);
layoutEngine.updatePreviewManager(previewManager);
const result = await layoutEngine.executeLayout(options);
```

### 新功能使用

迁移后，您可以使用新增的功能：

```javascript
// 防抖执行
const result = await layoutEngine.debouncedExecuteLayout(options);

// 性能报告
const report = layoutEngine.getPerformanceReport();
console.log('缓存命中率:', report.cache.hitRate);

// 模块状态检查
const status = layoutEngine.getModuleStatus();
console.log('模块状态:', status);

// 资源清理
layoutEngine.dispose();
```

## 配置选项

### 缓存配置

```javascript
const layoutEngine = new UnifiedLayoutEngine({
  enableCache: true,        // 启用缓存
  maxCacheSize: 200        // 最大缓存条目数
});
```

### 性能监控配置

```javascript
const layoutEngine = new UnifiedLayoutEngine({
  enablePerformanceMonitoring: true,  // 启用性能监控
  debounceDelay: 500                  // 防抖延迟
});
```

### 布局选项

```javascript
const result = await layoutEngine.executeLayout({
  direction: 'TB',           // 布局方向
  nodeSpacing: 60,          // 节点间距
  layerSpacing: 120,        // 层级间距
  enableOptimization: true, // 启用优化
  alignCenter: true,        // 居中对齐
  preventOverlap: true      // 防止重叠
});
```

## 性能优化

### 缓存机制

布局引擎内置了智能缓存机制，相同的输入会直接返回缓存结果：

```javascript
// 第一次执行会进行计算
const result1 = await layoutEngine.executeLayout(options);

// 相同选项的第二次执行会使用缓存
const result2 = await layoutEngine.executeLayout(options); // 从缓存返回
```

### 防抖机制

对于频繁触发的场景，使用防抖执行可以显著提升性能：

```javascript
// 在用户拖拽或频繁操作时使用
const debouncedLayout = () => {
  return layoutEngine.debouncedExecuteLayout(currentOptions);
};
```

### 性能监控

获取详细的性能数据：

```javascript
const report = layoutEngine.getPerformanceReport();
console.log('平均执行时间:', report.monitor.averageTime);
console.log('缓存命中率:', report.cache.hitRate);
```

## 错误处理

### 基本错误处理

```javascript
try {
  const result = await layoutEngine.executeLayout(options);
  if (!result.success) {
    console.error('布局失败:', result.error);
  }
} catch (error) {
  console.error('执行异常:', error);
}
```

### 获取错误信息

```javascript
const report = layoutEngine.getPerformanceReport();
if (report.lastError) {
  console.error('最后的错误:', report.lastError);
}
```

## 调试和监控

### 模块状态检查

```javascript
const status = layoutEngine.getModuleStatus();
console.log('引擎是否初始化:', status.initialized);
console.log('核心模块状态:', status.modules);
console.log('性能模块状态:', status.performance);
```

### 性能报告

```javascript
const report = layoutEngine.getPerformanceReport();
console.log('性能监控:', report.monitor);
console.log('缓存统计:', report.cache);
console.log('锁状态:', report.lock);
```

## 最佳实践

1. **启用缓存**: 对于重复的布局计算，缓存可以显著提升性能
2. **使用防抖**: 在频繁触发的场景中使用 `debouncedExecuteLayout`
3. **监控性能**: 定期检查性能报告，优化布局参数
4. **错误处理**: 始终检查 `result.success` 并处理错误情况
5. **资源清理**: 在组件销毁时调用 `dispose()` 方法
6. **合理配置**: 根据实际需求调整缓存大小和防抖延迟

## 常见问题

### Q: 如何提升布局性能？
A: 启用缓存、使用防抖执行、合理设置节点间距和层级间距。

### Q: 如何处理布局失败？
A: 检查 `result.success`，查看 `result.error` 获取错误信息。

### Q: 如何监控布局性能？
A: 使用 `getPerformanceReport()` 获取详细的性能数据。

### Q: 迁移会影响现有功能吗？
A: 不会，新引擎完全向后兼容，现有代码无需修改。

## 技术支持

如果您在使用过程中遇到问题，请：

1. 检查控制台错误信息
2. 使用 `getPerformanceReport()` 获取详细状态
3. 查看 `getModuleStatus()` 确认模块状态
4. 参考本文档的错误处理部分

---

**版本**: 1.0.0  
**更新时间**: 2024年12月  
**兼容性**: 完全兼容 UnifiedStructuredLayoutEngine API