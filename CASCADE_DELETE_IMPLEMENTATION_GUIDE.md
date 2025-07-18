# 节点级联删除功能实现指南

## 功能描述
当删除一个节点时，自动删除所有挂载在该节点下的子节点，实现级联删除功能。

## 实现原理

### 1. 递归查找子节点
```javascript
const getAllChildNodes = (nodeId, visited = new Set()) => {
  // 防止循环引用
  if (visited.has(nodeId)) {
    return []
  }
  visited.add(nodeId)
  
  const childNodes = []
  
  // 找到所有以当前节点为源的连接
  const outgoingConnections = connections.value.filter(conn => conn.source === nodeId)
  
  for (const connection of outgoingConnections) {
    const targetNodeId = connection.target
    
    // 添加直接子节点
    if (!childNodes.includes(targetNodeId)) {
      childNodes.push(targetNodeId)
    }
    
    // 递归获取子节点的子节点
    const grandChildren = getAllChildNodes(targetNodeId, visited)
    for (const grandChild of grandChildren) {
      if (!childNodes.includes(grandChild)) {
        childNodes.push(grandChild)
      }
    }
  }
  
  return childNodes
}
```

### 2. 级联删除逻辑
```javascript
const cascadeDeleteNode = (nodeId) => {
  // 获取所有需要删除的子节点
  const childNodes = getAllChildNodes(nodeId)
  
  // 按照从叶子节点到根节点的顺序删除
  const allNodesToDelete = [...childNodes, nodeId]
  const sortedNodesToDelete = []
  
  // 先删除没有子节点的节点（叶子节点）
  while (sortedNodesToDelete.length < allNodesToDelete.length) {
    for (const nodeToDelete of allNodesToDelete) {
      if (sortedNodesToDelete.includes(nodeToDelete)) continue
      
      // 检查这个节点是否还有未删除的子节点
      const remainingChildren = getAllChildNodes(nodeToDelete).filter(child => 
        !sortedNodesToDelete.includes(child)
      )
      
      // 如果没有未删除的子节点，可以删除这个节点
      if (remainingChildren.length === 0) {
        sortedNodesToDelete.push(nodeToDelete)
      }
    }
  }
  
  // 按顺序删除节点
  for (const nodeToDeleteId of sortedNodesToDelete) {
    const nodeToDelete = graph.getCellById(nodeToDeleteId)
    if (nodeToDelete) {
      handleSingleNodeDelete({ node: nodeToDelete }, false)
    }
  }
  
  // 重新布局
  if (autoLayout && typeof autoLayout.relayoutAll === 'function') {
    nextTick(() => {
      const remainingNodes = graph.getNodes()
      const remainingEdges = graph.getEdges()
      autoLayout.relayoutAll(remainingNodes, remainingEdges)
    })
  }
}
```

### 3. 用户确认机制
- 当删除的节点有子节点时，显示确认对话框
- 告知用户将要删除的节点总数
- 用户可以选择确认或取消删除操作

## 测试验证步骤

### 基础功能测试
1. **创建简单流程**
   - 打开任务创建页面：http://localhost:5173/marketing/tasks/create
   - 添加开始节点 → 短信节点 → AI外呼节点
   - 连接这些节点形成流程

2. **测试单节点删除**
   - 删除末尾的AI外呼节点
   - 验证：只删除该节点，不影响其他节点

3. **测试级联删除**
   - 删除中间的短信节点
   - 验证：弹出确认对话框，显示将删除的节点数量
   - 确认删除后，短信节点和AI外呼节点都被删除

### 复杂流程测试
1. **创建分支流程**
   ```
   开始节点 → 受众分流节点 → 分支A（短信节点 → AI外呼节点）
                        → 分支B（邮件节点 → 推送节点）
   ```

2. **测试分支删除**
   - 删除受众分流节点
   - 验证：所有分支节点都被删除
   - 确认对话框显示正确的删除数量

3. **测试深层嵌套**
   ```
   开始节点 → A节点 → B节点 → C节点 → D节点
   ```
   - 删除A节点
   - 验证：B、C、D节点都被删除

### 边界情况测试
1. **循环引用处理**
   - 创建可能的循环连接（如果系统允许）
   - 验证：递归算法能正确处理，不会无限循环

2. **开始节点保护**
   - 尝试删除开始节点
   - 验证：开始节点不能被删除

3. **快速连续删除**
   - 快速连续点击删除多个节点
   - 验证：系统能正确处理，不会出现错误

### 用户体验测试
1. **确认对话框**
   - 验证对话框内容准确显示删除数量
   - 测试确认和取消按钮功能

2. **删除反馈**
   - 查看控制台日志，确认删除过程清晰
   - 验证删除后布局自动调整

## 成功指标
- ✅ 删除节点时能正确识别所有子节点
- ✅ 按正确顺序删除节点（叶子节点优先）
- ✅ 有子节点时显示确认对话框
- ✅ 删除后自动重新布局
- ✅ 控制台日志清晰显示删除过程
- ✅ 不会出现孤立的连接线
- ✅ 开始节点受到保护不能删除

## 技术要点

### 删除顺序算法
- 使用拓扑排序的思想，从叶子节点开始删除
- 避免删除父节点后子节点变成孤立节点
- 确保所有相关连接都被正确清理

### 循环引用防护
- 使用 `visited` Set 记录已访问的节点
- 防止在递归查找子节点时出现无限循环

### 用户体验优化
- 提供删除确认，避免误操作
- 显示具体的删除数量，让用户了解影响范围
- 删除后自动重新布局，保持界面整洁

## 注意事项
1. 开始节点不能被删除
2. 删除操作不可撤销，需要用户确认
3. 大量节点删除时可能需要时间，考虑添加加载状态
4. 删除后的布局调整可能改变其他节点位置

## 后续优化建议
1. 添加删除操作的撤销功能
2. 支持批量选择删除多个节点
3. 添加删除预览功能，高亮显示将要删除的节点
4. 优化大量节点删除时的性能
5. 添加删除操作的动画效果

## 相关文件
- `/src/pages/marketing/tasks/components/TaskFlowCanvas.vue` - 主要实现文件
- `/src/utils/ConnectionPreviewManager.js` - 连接预览管理
- `/src/composables/useEnhancedAutoLayout.js` - 自动布局管理