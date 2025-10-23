# 🔍 吸附测试操作指南

## 当前状态分析

根据控制台日志分析，当前页面状态：
- ✅ 页面已正常加载
- ✅ 有1个节点：`start-node`（开始节点）
- ✅ 有2条预览线已生成
- ✅ 调试日志功能正常工作
- ⚠️ 还未进行吸附操作，所以看不到吸附相关的调试日志

## 如何触发吸附操作

### 方法1：添加新节点并进行吸附

1. **添加新节点**：
   - 在页面右侧工具栏中选择一个节点类型（如"受众分割"、"条件判断"等）
   - 将节点拖拽到画布上

2. **进行吸附操作**：
   - 拖拽新添加的节点
   - 将节点移动到现有预览线的终点附近
   - 当节点靠近预览线终点时，应该会看到吸附效果
   - 释放鼠标完成吸附

### 方法2：从节点库拖拽新节点

1. **从左侧节点库拖拽**：
   - 从左侧节点库中选择一个节点
   - 直接拖拽到预览线终点附近
   - 观察吸附效果和日志输出

## 预期的调试日志

当进行吸附操作时，你应该在控制台看到类似这样的日志：

```
🔍 [吸附调试] 吸附前预览线状态: {
  sourceNodeId: "start-node",
  branchId: null,
  totalPreviewLines: 1,
  hasPreviewInstance: true,
  previewInstanceType: "single",
  branchCount: 0
}

🧹 [吸附调试] 开始移除单一预览线: { sourceNodeId: "start-node" }

🧹 [预览线删除] 开始删除预览线: { nodeId: "start-node" }

🔍 [预览线删除] 预览线实例详情: {
  nodeId: "start-node",
  isArray: false,
  branchCount: 1,
  instanceType: "single",
  hasLine: true,
  lineIds: ["preview-line-xxx"]
}

🔍 [吸附调试] 吸附后预览线状态: {
  sourceNodeId: "start-node",
  branchId: null,
  totalPreviewLinesBefore: 1,
  totalPreviewLinesAfter: 0,
  previewLinesRemoved: 1,
  hasPreviewInstanceAfter: false
}

✅ [统一预览线管理器] 预览线终点吸附连接创建成功: {
  edgeId: "edge-xxx",
  sourceNodeId: "start-node",
  targetNodeId: "new-node-xxx",
  branchId: null,
  branchLabel: null,
  previewLinesCleanedUp: 1
}
```

## 如果没有看到调试日志

如果进行吸附操作后仍然没有看到调试日志，可能的原因：

1. **吸附没有成功触发**：
   - 确保节点足够靠近预览线终点
   - 查看是否有视觉反馈（高亮、变色等）

2. **使用了不同的代码路径**：
   - 可能存在其他的吸附处理逻辑
   - 需要检查其他相关文件

3. **日志被过滤**：
   - 检查浏览器控制台的过滤设置
   - 确保显示所有级别的日志

## 测试建议

1. **先尝试简单的吸附**：从节点库拖拽一个简单的节点到预览线终点
2. **观察控制台**：在操作过程中实时观察控制台输出
3. **记录问题**：如果吸附后预览线没有删除，记录具体的操作步骤
4. **多次测试**：尝试不同类型的节点和不同的吸附位置

---

**注意**：我们已经在 `UnifiedPreviewLineManager.js` 中添加了详细的调试日志，这些日志会在吸附操作时自动输出到控制台。