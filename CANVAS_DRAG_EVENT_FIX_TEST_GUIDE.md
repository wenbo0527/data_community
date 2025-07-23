# 画布拖拽事件传递修复测试指南

## 🔧 修复内容

### 1. 事件监听器冲突修复
- **问题**: TaskFlowCanvas 的调试事件监听器使用捕获阶段，干扰了 CanvasPanZoomManager 的事件处理
- **修复**: 将调试事件监听器改为冒泡阶段（`false` 参数）

### 2. 初始化顺序优化
- **问题**: CanvasPanZoomManager 在调试事件监听器之后初始化，导致事件绑定顺序错误
- **修复**: 将 CanvasPanZoomManager 初始化提前到事件绑定之前

### 3. 调试日志增强
- **增加**: 在 `handleMouseMove` 方法开始处添加强制日志，确认方法是否被调用
- **目的**: 快速诊断事件传递问题

## 🧪 测试步骤

### 1. 基础拖拽测试
1. 打开画布页面
2. 在空白区域按下鼠标左键
3. 拖拽鼠标移动
4. 观察控制台日志

### 2. 预期日志输出
```
🚀 [CanvasPanZoomManager] 拖拽开始: {startPosition: {...}, currentTranslate: {...}, mode: 'default', sensitivity: 1.5}
🔄 [CanvasPanZoomManager] handleMouseMove 被调用: {isPanning: true, hasLastPanPoint: true, clientX: xxx, clientY: xxx}
🔄 [CanvasPanZoomManager] handleMouseMove 被调用: {isPanning: true, hasLastPanPoint: true, clientX: xxx, clientY: xxx}
...
🔚 [CanvasPanZoomManager] 拖拽结束: {endPosition: {...}, finalTranslate: {...}, ...}
```

### 3. 关键检查点
- ✅ `handleMouseMove` 方法被频繁调用
- ✅ `isPanning: true` 状态正确
- ✅ `hasLastPanPoint: true` 状态正确
- ✅ 画布实际发生移动

## 🚨 问题排查

### 如果 `handleMouseMove` 仍未被调用
1. **检查事件绑定**:
   ```javascript
   console.log('事件监听器数量:', graph.container.getEventListeners?.('mousemove')?.length)
   ```

2. **检查容器元素**:
   ```javascript
   console.log('容器元素:', graph.container)
   console.log('容器样式:', getComputedStyle(graph.container))
   ```

3. **检查事件传播**:
   - 确认没有其他组件调用 `e.stopPropagation()`
   - 检查 CSS `pointer-events` 属性

### 如果方法被调用但画布不移动
1. **检查 X6 配置**:
   ```javascript
   console.log('Scroller 配置:', graph.scroller)
   console.log('当前变换:', graph.translate())
   ```

2. **检查边界限制**:
   ```javascript
   console.log('边界区域:', panZoomManager.restrictArea)
   console.log('是否在边界内:', panZoomManager.isWithinBounds(x, y))
   ```

## 🎯 性能指标

### 响应性测试
- **拖拽延迟**: < 16ms (60fps)
- **累积阈值**: 1px (降低后的阈值)
- **平滑因子**: 0.95 (提高后的响应性)

### 日志频率
- **拖拽开始**: 1次
- **拖拽过程**: 根据鼠标移动频率
- **拖拽结束**: 1次

## 🔄 回滚方案

如果修复导致其他问题，可以回滚：

1. **恢复事件监听器**:
   ```javascript
   container.addEventListener('mousemove', debugMouseMove, true) // 恢复捕获阶段
   ```

2. **恢复初始化顺序**:
   ```javascript
   // 将 CanvasPanZoomManager 初始化移回原位置
   ```

3. **移除调试日志**:
   ```javascript
   // 移除 handleMouseMove 开始处的强制日志
   ```

## 📊 测试用例

### 用例1: 基础拖拽
- **操作**: 在空白区域拖拽
- **预期**: 画布平滑移动，日志正常输出

### 用例2: 边界测试
- **操作**: 拖拽到画布边界
- **预期**: 应用阻力，不超出边界

### 用例3: 多种拖拽模式
- **操作**: 按 1/2/3 键切换模式后拖拽
- **预期**: 不同灵敏度响应

### 用例4: 修饰键测试
- **操作**: 按住空格键拖拽
- **预期**: 临时拖拽模式生效

## 🎉 成功标准

- ✅ `handleMouseMove` 方法正常被调用
- ✅ 画布能够流畅拖拽移动
- ✅ 日志输出简洁且有用
- ✅ 不影响其他功能（节点拖拽、连接等）
- ✅ 性能良好，无明显卡顿

## 📝 注意事项

1. **临时调试日志**: 测试完成后可以移除 `handleMouseMove` 开始处的强制日志
2. **事件监听器顺序**: 确保 CanvasPanZoomManager 的事件监听器优先级最高
3. **兼容性**: 确认修复不影响触摸设备的拖拽功能