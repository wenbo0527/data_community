# 增强预设线拖拽功能测试指南

## 快速测试步骤

### 1. 打开浏览器开发者工具
- 按 F12 或右键选择"检查"
- 切换到 Console 标签页

### 2. 检查初始化状态
在控制台中输入以下命令：
```javascript
// 检查增强预设线管理器是否存在
console.log('增强预设线管理器:', window.enhancedPreviewManager)

// 检查画布节点
if (window.enhancedPreviewManager) {
  const nodes = window.enhancedPreviewManager.graph.getNodes()
  console.log('画布节点数量:', nodes.length)
  console.log('节点列表:', nodes.map(n => ({ id: n.id, type: n.getData()?.type })))
}
```

### 3. 测试预设线创建
```javascript
// 运行基础测试
testEnhancedPreviewLine()
```

### 4. 测试预设线拖拽
```javascript
// 运行拖拽测试
testPreviewLineDrag()
```

### 5. 清理测试数据
```javascript
// 清理所有预设线
cleanupPreviewLines()
```

## 手动测试步骤

### 1. 添加节点
- 在画布空白处右键或点击添加按钮
- 选择任意节点类型（如"短信"、"AI外呼"等）
- 双击节点进行配置并保存

### 2. 查看预设线
- 配置完成后，节点应该自动生成一条虚线预设线
- 预设线应该是蓝色虚线，带有箭头

### 3. 测试拖拽
- 将鼠标悬停在预设线上，光标应变为手型
- 按住鼠标左键拖拽预设线
- 拖拽时预设线应该跟随鼠标移动
- 释放鼠标时应该创建连接或结束节点

## 预期行为

### ✅ 正常情况
- 节点配置完成后自动生成预设线
- 预设线可以被拖拽
- 拖拽时有视觉反馈（颜色变化、光标变化）
- 拖拽到空白处创建结束节点
- 拖拽到其他节点创建连接

### ❌ 问题情况
- 预设线不显示
- 预设线无法拖拽
- 拖拽时没有视觉反馈
- 拖拽后没有创建连接或节点

## 调试信息

查看控制台中的日志信息：
- `[EnhancedPreviewLineManager]` 开头的日志
- `[TaskFlowCanvas]` 开头的日志
- `[useConfigDrawers]` 开头的日志

## 常见问题

### Q: 预设线不显示
A: 检查节点是否已配置，查看控制台是否有错误信息

### Q: 预设线无法拖拽
A: 检查事件监听器是否正确绑定，查看控制台中的鼠标事件日志

### Q: 拖拽没有反应
A: 检查拖拽状态管理，确认 `isDragging` 状态是否正确更新

## 测试报告

请在测试后报告以下信息：
1. 预设线是否正常显示？
2. 预设线是否可以拖拽？
3. 拖拽时是否有视觉反馈？
4. 拖拽后是否正确创建连接？
5. 控制台是否有错误信息？