# 节点删除错误修复测试指南

## 🧪 测试步骤

### 1. 基础删除测试
1. 打开任务创建页面：http://localhost:5173/marketing/tasks/create
2. 添加几个节点（如短信节点、AI外呼节点等）
3. 连接这些节点形成流程
4. 删除中间的一个节点
5. 检查控制台是否还有 "Edge's source node with id xxx not exists" 错误

### 2. 预览线恢复测试
1. 创建一个简单的流程：开始节点 → 短信节点 → AI外呼节点
2. 删除中间的短信节点
3. 观察开始节点是否正确显示预览线
4. 检查控制台日志，确认预览线恢复逻辑正常工作

### 3. 分流节点删除测试
1. 添加一个分流节点（如受众分流、事件分流）
2. 为分流节点添加多个分支连接
3. 删除分流节点
4. 检查所有相关的预览线是否被正确清理和恢复

### 4. 边缘情况测试
1. 删除没有连接的孤立节点
2. 删除开始节点（应该被阻止）
3. 快速连续删除多个节点
4. 在节点配置抽屉打开时删除节点

## 🔍 检查要点

### ✅ 成功指标
- [ ] 删除节点后控制台无 "Edge's source node not exists" 错误
- [ ] 删除节点后失去连接的源节点正确显示预览线
- [ ] 所有相关的持久化预览线被正确清理
- [ ] 节点删除操作流畅，无卡顿或异常
- [ ] 布局重新计算正常工作

### ❌ 失败指标
- [ ] 控制台出现边引用错误
- [ ] 预览线残留或显示异常
- [ ] 删除操作导致页面崩溃
- [ ] 布局计算失败

## 📊 日志监控

### 关键日志信息
```
✅ 正常日志：
[TaskFlowCanvas] 开始删除节点: node_xxx
[TaskFlowCanvas] 清理节点 node_xxx 的预览线
[TaskFlowCanvas] 找到 X 条相关边需要删除
[TaskFlowCanvas] 删除边: edge_xxx
[TaskFlowCanvas] 节点 node_xxx 删除完成，清理了 X 个连接
🗑️ [ConnectionPreview] 处理节点删除: node_xxx
🧹 [ConnectionPreview] 清理节点的持久化预览线: node_xxx
🔄 [ConnectionPreview] 为失去连接的源节点恢复预览线: node_yyy
✅ [ConnectionPreview] 节点删除处理完成: node_xxx

❌ 错误日志（应该不再出现）：
Edge's source node with id "xxx" not exists
🚫 [ConnectionPreview] 无法找到源节点或目标节点
```

## 🛠️ 调试技巧

### 1. 开启详细日志
在浏览器控制台中设置：
```javascript
// 开启详细的连接预览日志
localStorage.setItem('debug_connection_preview', 'true')
```

### 2. 手动清理无效边
如果仍然遇到问题，可以在控制台中手动清理：
```javascript
// 获取连接预览管理器实例
const previewManager = window.connectionPreviewManager
if (previewManager) {
  const cleanedCount = previewManager.cleanupInvalidEdges()
  console.log(`清理了 ${cleanedCount} 条无效边`)
}
```

### 3. 检查图状态
```javascript
// 检查图中的节点和边数量
const graph = window.graph
if (graph) {
  console.log('节点数量:', graph.getNodes().length)
  console.log('边数量:', graph.getEdges().length)
  
  // 检查是否有孤立的边
  const edges = graph.getEdges()
  const orphanEdges = edges.filter(edge => {
    const source = edge.getSourceNode()
    const target = edge.getTargetNode()
    return !source || !target || !graph.hasCell(source) || !graph.hasCell(target)
  })
  console.log('孤立边数量:', orphanEdges.length)
}
```

## 📈 性能监控

### 删除操作性能
- 单个节点删除应在 100ms 内完成
- 预览线恢复应在 300ms 内完成
- 布局重新计算应在 500ms 内完成

### 内存使用
- 删除节点后相关的事件监听器应被正确清理
- 预览线对象应从内存中移除
- 不应出现内存泄漏

## 🔄 回归测试

在修复完成后，建议进行以下回归测试：
1. 基本的节点添加和连接功能
2. 节点配置抽屉的打开和关闭
3. 自动布局功能
4. 画布缩放和平移
5. 节点拖拽功能

## 📝 测试报告模板

```
测试时间：____
测试环境：____
浏览器版本：____

基础删除测试：✅/❌
预览线恢复测试：✅/❌
分流节点删除测试：✅/❌
边缘情况测试：✅/❌

发现的问题：
1. ____
2. ____

建议改进：
1. ____
2. ____
```

通过这个测试指南，可以全面验证节点删除错误的修复效果，确保系统的稳定性和用户体验。