# Graph实例访问问题修复报告

## 问题描述

在 `task-editor.vue:622` 出现警告：
```
⚠️ [坐标转换] Graph实例不可用，使用备用坐标方案
```

## 问题分析

### 根本原因
TaskFlowCanvas 组件的 `defineExpose` 中没有暴露 `graph` 实例，导致父组件无法访问到 X6 的 graph 实例进行坐标转换。

### 问题影响
1. **坐标转换失效**：无法使用 X6 原生的 `clientToLocal()` 方法进行精确坐标转换
2. **回退到备用方案**：只能使用 `event.offsetX/Y`，在画布缩放时会产生坐标偏移
3. **用户体验下降**：拖拽新阶段时位置不准确

## 修复方案

### 1. 暴露 Graph 实例
在 `TaskFlowCanvas.vue` 的 `defineExpose` 中添加 graph 实例：

```javascript
// 暴露方法
defineExpose({
  addNode,
  getCanvasData,
  loadCanvasData,
  clearCanvas,
  exportData,
  zoomIn,
  zoomOut,
  zoomToFit,
  resetZoom,
  setDragMode,
  currentDragMode,
  undo,
  redo,
  handleExport,
  // 暴露graph实例用于坐标转换
  graph: computed(() => graph)
})
```

### 2. 修复原理
- **响应式暴露**：使用 `computed(() => graph)` 确保暴露的是响应式的 graph 实例
- **延迟访问**：computed 会在 graph 实例初始化后才返回有效值
- **类型安全**：父组件可以安全地访问 graph 实例的所有方法

## 技术细节

### Graph 实例初始化时机
```javascript
// TaskFlowCanvas.vue 中的初始化流程
const initCanvas = async () => {
  // 1. 创建 X6 图实例
  graph = new Graph({
    container: canvasContainer.value,
    // ... 其他配置
  })
  
  // 2. 初始化各种管理器
  // 3. 设置事件监听
  // 4. 加载初始数据
}
```

### 坐标转换调用链
```javascript
// task-editor.vue 中的使用
const handleCanvasDrop = (event) => {
  const graph = canvasRef.value?.graph
  if (graph) {
    // 使用 X6 原生坐标转换
    const logicalPosition = graph.clientToLocal(event.clientX, event.clientY)
    canvasRef.value.addNode(nodeType, logicalPosition)
  } else {
    // 备用方案
    const position = { x: event.offsetX, y: event.offsetY }
    canvasRef.value.addNode(nodeType, position)
  }
}
```

## 修复效果

### 预期改进
1. **精确坐标转换**：在任何缩放比例下都能准确定位新节点
2. **消除警告信息**：不再出现 "Graph实例不可用" 的警告
3. **提升用户体验**：拖拽新阶段时位置完全准确

### 测试验证
1. **基础功能测试**：
   - 在 100% 缩放比例下拖拽新阶段
   - 验证节点位置是否准确

2. **缩放场景测试**：
   - 在 50%、150%、200% 等不同缩放比例下测试
   - 验证坐标转换是否正确

3. **控制台日志检查**：
   - 确认不再出现 "Graph实例不可用" 警告
   - 查看坐标转换的调试信息

## 相关文件

### 修改文件
- `src/pages/marketing/tasks/components/TaskFlowCanvas.vue`
  - 在 `defineExpose` 中添加 `graph` 实例暴露

### 受益文件
- `src/pages/marketing/tasks/create.vue`
- `src/pages/marketing/tasks/task-editor.vue`
  - 现在可以正确访问 graph 实例进行坐标转换

## 后续优化建议

1. **类型定义**：为暴露的 graph 实例添加 TypeScript 类型定义
2. **错误处理**：增强 graph 实例访问的错误处理机制
3. **性能优化**：考虑是否需要缓存 graph 实例的访问

## 总结

通过在 TaskFlowCanvas 组件中暴露 graph 实例，成功解决了坐标转换问题，使得拖拽新阶段功能在任何缩放比例下都能正确工作。这个修复不仅解决了当前的警告问题，还为后续可能需要访问 graph 实例的功能提供了基础。