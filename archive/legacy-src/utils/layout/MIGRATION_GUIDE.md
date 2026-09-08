# 统一布局引擎迁移指南

## 快速迁移 (5分钟完成)

### 步骤1: 更新导入语句

```javascript
// 旧版本
import UnifiedStructuredLayoutEngine from './path/to/UnifiedStructuredLayoutEngine.js';

// 新版本 - 选择其中一种方式

// 方式1: 使用新名称 (推荐)
import UnifiedLayoutEngine from './path/to/UnifiedLayoutEngine.js';

// 方式2: 保持兼容性 (无需修改变量名)
import { UnifiedStructuredLayoutEngine } from './path/to/UnifiedLayoutEngine.js';
```

### 步骤2: 无需修改现有代码

✅ **好消息**: 所有现有的方法调用都无需修改！

```javascript
// 这些代码在新版本中完全兼容，无需任何修改
const layoutEngine = new UnifiedLayoutEngine(options);
layoutEngine.updateGraph(graph);
layoutEngine.updatePreviewManager(previewManager);
const result = await layoutEngine.executeLayout(options);
```

### 步骤3: 享受新功能 (可选)

```javascript
// 新增功能1: 防抖执行 (推荐用于频繁触发场景)
const result = await layoutEngine.debouncedExecuteLayout(options);

// 新增功能2: 性能监控
const report = layoutEngine.getPerformanceReport();
console.log('缓存命中率:', report.cache.hitRate);

// 新增功能3: 资源清理 (组件销毁时调用)
layoutEngine.dispose();
```

## 迁移检查清单

- [ ] 更新导入语句
- [ ] 测试现有功能是否正常
- [ ] (可选) 使用新的防抖功能
- [ ] (可选) 添加性能监控
- [ ] (可选) 在组件销毁时调用 dispose()

## 常见迁移场景

### 场景1: Vue组合式函数中使用

```javascript
// composables/useLayoutEngine.js

// 旧版本
// import UnifiedStructuredLayoutEngine from '../utils/UnifiedStructuredLayoutEngine.js';

// 新版本
import UnifiedLayoutEngine from '../utils/layout/UnifiedLayoutEngine.js';

export function useLayoutEngine() {
  const layoutEngine = new UnifiedLayoutEngine({
    enableCache: true,
    enablePerformanceMonitoring: true
  });
  
  // 其他代码保持不变
  return {
    layoutEngine,
    executeLayout: layoutEngine.executeLayout.bind(layoutEngine)
  };
}
```

### 场景2: 类组件中使用

```javascript
// 旧版本
// import UnifiedStructuredLayoutEngine from './UnifiedStructuredLayoutEngine.js';

// 新版本
import UnifiedLayoutEngine from './layout/UnifiedLayoutEngine.js';

class CanvasManager {
  constructor() {
    this.layoutEngine = new UnifiedLayoutEngine();
  }
  
  // 其他方法保持不变
  async updateLayout() {
    return await this.layoutEngine.executeLayout(this.options);
  }
  
  // 新增: 清理资源
  destroy() {
    this.layoutEngine.dispose();
  }
}
```

### 场景3: 工具函数中使用

```javascript
// utils/layoutUtils.js

// 旧版本
// import UnifiedStructuredLayoutEngine from './UnifiedStructuredLayoutEngine.js';

// 新版本
import UnifiedLayoutEngine from './layout/UnifiedLayoutEngine.js';

let layoutEngineInstance = null;

export function getLayoutEngine() {
  if (!layoutEngineInstance) {
    layoutEngineInstance = new UnifiedLayoutEngine({
      enableCache: true,
      debounceDelay: 300
    });
  }
  return layoutEngineInstance;
}

// 其他函数保持不变
export async function executeLayout(graph, previewManager, options) {
  const engine = getLayoutEngine();
  engine.updateGraph(graph);
  engine.updatePreviewManager(previewManager);
  return await engine.executeLayout(options);
}
```

## 性能优化建议

### 1. 启用缓存 (推荐)

```javascript
const layoutEngine = new UnifiedLayoutEngine({
  enableCache: true,        // 启用缓存
  maxCacheSize: 100        // 根据内存情况调整
});
```

### 2. 使用防抖 (频繁触发场景)

```javascript
// 在拖拽、缩放等频繁操作中使用
const handleGraphChange = async () => {
  const result = await layoutEngine.debouncedExecuteLayout(options);
};
```

### 3. 监控性能

```javascript
// 定期检查性能
setInterval(() => {
  const report = layoutEngine.getPerformanceReport();
  if (report.cache.hitRate < 0.5) {
    console.warn('缓存命中率较低，考虑调整缓存策略');
  }
}, 60000); // 每分钟检查一次
```

## 故障排除

### 问题1: 导入错误

```
Error: Cannot resolve module './UnifiedLayoutEngine.js'
```

**解决方案**: 检查文件路径是否正确

```javascript
// 确保路径正确
import UnifiedLayoutEngine from './utils/layout/UnifiedLayoutEngine.js';
```

### 问题2: 方法不存在

```
Error: layoutEngine.someMethod is not a function
```

**解决方案**: 检查方法名是否正确，参考API文档

### 问题3: 性能问题

**解决方案**: 
1. 启用缓存
2. 使用防抖执行
3. 检查性能报告

```javascript
const report = layoutEngine.getPerformanceReport();
console.log('性能数据:', report);
```

## 回滚方案

如果迁移过程中遇到问题，可以快速回滚：

1. 恢复原来的导入语句
2. 移除新增的方法调用
3. 保留原有的 `UnifiedStructuredLayoutEngine.js` 文件

## 验证迁移成功

运行以下测试代码验证迁移是否成功：

```javascript
// 测试基本功能
const layoutEngine = new UnifiedLayoutEngine();
console.log('✅ 实例化成功');

// 测试方法存在
if (typeof layoutEngine.executeLayout === 'function') {
  console.log('✅ executeLayout 方法存在');
}

if (typeof layoutEngine.updateGraph === 'function') {
  console.log('✅ updateGraph 方法存在');
}

if (typeof layoutEngine.updatePreviewManager === 'function') {
  console.log('✅ updatePreviewManager 方法存在');
}

// 测试新功能
if (typeof layoutEngine.debouncedExecuteLayout === 'function') {
  console.log('✅ 新功能可用');
}

console.log('🎉 迁移验证完成');
```

## 技术支持

如果迁移过程中遇到问题：

1. 检查控制台错误信息
2. 确认文件路径正确
3. 运行验证代码
4. 查看详细文档: `README.md`

---

**迁移时间**: 预计 5-10 分钟  
**风险等级**: 低 (完全向后兼容)  
**建议**: 在开发环境先测试，确认无误后部署到生产环境