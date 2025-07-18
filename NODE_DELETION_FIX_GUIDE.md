# 节点删除错误修复指南

## 🚨 问题分析

### 错误信息
```
Edge's source node with id "node_1752716059562" not exists
🚫 [ConnectionPreview] 无法找到源节点或目标节点
```

### 根本原因
1. **删除时序问题**：节点被删除后，相关的边（Edge）仍然存在，导致边尝试访问已删除的节点
2. **预览线清理不完整**：ConnectionPreviewManager 中的预览线没有被正确清理
3. **异步操作冲突**：删除操作和布局更新之间存在时序冲突

## 🔧 修复方案

### 1. 增强节点删除逻辑

**问题**：当前删除逻辑没有完全清理所有相关的边和预览线
**解决方案**：在删除节点前先清理所有相关的连接和预览线

```javascript
// 改进的节点删除方法
const handleNodeDelete = (data) => {
  const { node } = data
  
  if (!node || !graph) return
  
  // 检查是否是开始节点
  const nodeData = node.getData ? node.getData() : node.data
  if (nodeData?.nodeType === 'start' || nodeData?.type === 'start') {
    console.warn('开始节点不能删除')
    return
  }
  
  const nodeId = node.id
  console.log(`[TaskFlowCanvas] 开始删除节点: ${nodeId}`)
  
  try {
    // 1. 先清理连接预览管理器中的相关数据
    if (configDrawers.value?.structuredLayout) {
      const previewManager = configDrawers.value.structuredLayout.getConnectionPreviewManager()
      if (previewManager) {
        console.log(`[TaskFlowCanvas] 清理节点 ${nodeId} 的预览线`)
        previewManager.clearNodePreviews(nodeId)
        
        // 触发节点删除事件，让预览管理器处理
        previewManager.onNodeRemoved({ node, id: nodeId })
      }
    }
    
    // 2. 获取所有相关的边，包括输入和输出边
    const incomingEdges = graph.getIncomingEdges(node) || []
    const outgoingEdges = graph.getOutgoingEdges(node) || []
    const allRelatedEdges = [...incomingEdges, ...outgoingEdges]
    
    console.log(`[TaskFlowCanvas] 找到 ${allRelatedEdges.length} 条相关边需要删除`)
    
    // 3. 先删除所有相关的边
    allRelatedEdges.forEach(edge => {
      if (edge && graph.hasCell(edge)) {
        console.log(`[TaskFlowCanvas] 删除边: ${edge.id}`)
        graph.removeCell(edge)
      }
    })
    
    // 4. 从连接数据中删除相关连接
    const deletedConnections = connections.value.filter(conn => 
      conn.source === nodeId || conn.target === nodeId
    )
    connections.value = connections.value.filter(conn => 
      conn.source !== nodeId && conn.target !== nodeId
    )
    
    // 5. 删除节点本身
    if (graph.hasCell(node)) {
      graph.removeCell(node)
    }
    
    // 6. 从节点数据中删除
    const nodeIndex = nodes.value.findIndex(n => n.id === nodeId)
    if (nodeIndex >= 0) {
      const deletedNode = nodes.value[nodeIndex]
      nodes.value.splice(nodeIndex, 1)
      emit('node-deleted', deletedNode)
    }
    
    // 7. 清理增强布局管理器
    if (autoLayout && typeof autoLayout.removeNodeFromCoordinateSystem === 'function') {
      autoLayout.removeNodeFromCoordinateSystem(nodeId)
    }
    
    // 8. 清除选中状态
    if (selectedNodeId.value === nodeId) {
      selectedNodeId.value = null
    }
    
    // 9. 关闭配置抽屉
    if (selectedNode.value?.id === nodeId) {
      closeConfigDrawer()
    }
    
    // 10. 延迟重新布局，确保所有删除操作完成
    nextTick(() => {
      updateLayoutStats()
      
      const hasChildNodes = deletedConnections.some(conn => conn.source === nodeId)
      if (hasChildNodes && autoLayout && typeof autoLayout.relayoutAll === 'function') {
        setTimeout(() => {
          const remainingNodes = graph.getNodes()
          const remainingEdges = graph.getEdges()
          autoLayout.relayoutAll(remainingNodes, remainingEdges)
          console.log('[TaskFlowCanvas] 节点删除后重新布局完成')
        }, 100)
      }
    })
    
    console.log(`[TaskFlowCanvas] 节点 ${nodeId} 删除完成，清理了 ${deletedConnections.length} 个连接`)
    
  } catch (error) {
    console.error(`[TaskFlowCanvas] 删除节点 ${nodeId} 时发生错误:`, error)
  }
}
```

### 2. 增强 ConnectionPreviewManager 的清理逻辑

```javascript
// 改进的节点删除处理
onNodeRemoved(e) {
  const node = e.node || e
  const nodeId = node.id || node
  
  console.log('🗑️ [ConnectionPreview] 处理节点删除:', {
    nodeId,
    nodeType: node.getData?.()?.type
  })
  
  try {
    // 1. 清理所有相关的预览线
    this.clearNodePreviews(nodeId)
    
    // 2. 清理持久化预览线
    this.clearPersistentPreviewsForNode(nodeId)
    
    // 3. 获取连接到被删除节点的所有边
    if (this.graph && node) {
      const incomingEdges = this.graph.getIncomingEdges(node)
      const outgoingEdges = this.graph.getOutgoingEdges(node)
      
      // 4. 为失去连接的源节点恢复预览线
      if (incomingEdges && Array.isArray(incomingEdges)) {
        incomingEdges.forEach(edge => {
          const sourceNode = edge.getSourceNode()
          if (sourceNode && this.graph.hasCell(sourceNode)) {
            console.log('🔄 [ConnectionPreview] 为失去连接的源节点恢复预览线:', sourceNode.id)
            // 延迟恢复，确保删除操作完成
            setTimeout(() => {
              if (this.graph.hasCell(sourceNode)) {
                this.createPersistentPreview(sourceNode)
              }
            }, 200)
          }
        })
      }
    }
    
    console.log('✅ [ConnectionPreview] 节点删除处理完成:', nodeId)
    
  } catch (error) {
    console.error('❌ [ConnectionPreview] 节点删除处理失败:', error)
  }
}

// 新增：清理指定节点的所有持久化预览线
clearPersistentPreviewsForNode(nodeId) {
  console.log('🧹 [ConnectionPreview] 清理节点的持久化预览线:', nodeId)
  
  const keysToRemove = []
  
  // 查找所有相关的预览线
  this.persistentPreviews.forEach((preview, key) => {
    if (key.startsWith(nodeId + '_') || key.includes('_' + nodeId + '_') || key.endsWith('_' + nodeId)) {
      keysToRemove.push(key)
    }
  })
  
  // 删除预览线
  keysToRemove.forEach(key => {
    const preview = this.persistentPreviews.get(key)
    if (preview) {
      if (preview.line && this.graph.hasCell(preview.line)) {
        this.graph.removeCell(preview.line)
      }
      if (preview.label && this.graph.hasCell(preview.label)) {
        this.graph.removeCell(preview.label)
      }
      this.persistentPreviews.delete(key)
    }
  })
  
  console.log(`🗑️ [ConnectionPreview] 已清理 ${keysToRemove.length} 条持久化预览线`)
}
```

### 3. 添加边删除的安全检查

```javascript
// 在 ConnectionPreviewManager 中添加边删除处理
handleEdgeRemoved(e) {
  const { edge } = e
  
  if (!edge) return
  
  try {
    const sourceNode = edge.getSourceNode()
    const targetNode = edge.getTargetNode()
    const sourcePort = edge.getSourcePortId()
    
    console.log('❌ [ConnectionPreview] 连接删除:', {
      edgeId: edge.id,
      sourceNodeId: sourceNode?.id,
      targetNodeId: targetNode?.id,
      sourcePort
    })
    
    // 检查源节点和目标节点是否仍然存在
    if (sourceNode && this.graph.hasCell(sourceNode)) {
      // 为源节点恢复预览线
      setTimeout(() => {
        if (this.graph.hasCell(sourceNode)) {
          this.createPersistentPreview(sourceNode)
        }
      }, 100)
    }
    
  } catch (error) {
    console.error('❌ [ConnectionPreview] 处理边删除时发生错误:', error)
  }
}
```

## 🛡️ 防御性编程建议

### 1. 添加存在性检查

```javascript
// 在所有图操作前添加检查
const safeGraphOperation = (operation, ...args) => {
  try {
    if (!graph) {
      console.warn('[SafeGraph] 图实例不存在')
      return null
    }
    return operation.apply(graph, args)
  } catch (error) {
    console.error('[SafeGraph] 图操作失败:', error)
    return null
  }
}

// 使用示例
const node = safeGraphOperation(graph.getCellById, nodeId)
if (node) {
  // 安全地操作节点
}
```

### 2. 添加边的有效性验证

```javascript
// 验证边的有效性
const validateEdge = (edge) => {
  if (!edge || !graph.hasCell(edge)) {
    return false
  }
  
  const sourceNode = edge.getSourceNode()
  const targetNode = edge.getTargetNode()
  
  return sourceNode && targetNode && 
         graph.hasCell(sourceNode) && 
         graph.hasCell(targetNode)
}
```

### 3. 添加批量清理方法

```javascript
// 批量清理无效的边
const cleanupInvalidEdges = () => {
  const edges = graph.getEdges()
  const invalidEdges = []
  
  edges.forEach(edge => {
    if (!validateEdge(edge)) {
      invalidEdges.push(edge)
    }
  })
  
  console.log(`[Cleanup] 发现 ${invalidEdges.length} 条无效边`)
  
  invalidEdges.forEach(edge => {
    if (graph.hasCell(edge)) {
      graph.removeCell(edge)
    }
  })
  
  return invalidEdges.length
}
```

## 📋 实施检查清单

### ✅ 立即修复项
- [ ] 修复 TaskFlowCanvas 中的节点删除逻辑
- [ ] 增强 ConnectionPreviewManager 的清理方法
- [ ] 添加边删除的安全检查
- [ ] 实现批量清理无效边的功能

### 🔄 中期改进项
- [ ] 添加删除操作的事务性支持
- [ ] 实现删除操作的撤销功能
- [ ] 添加删除前的确认对话框
- [ ] 优化删除操作的性能

### 🚀 长期优化项
- [ ] 实现软删除机制
- [ ] 添加删除操作的审计日志
- [ ] 实现批量删除功能
- [ ] 添加删除操作的权限控制

## 🧪 测试建议

### 单元测试
```javascript
describe('Node Deletion', () => {
  test('should remove all related edges when deleting node', () => {
    // 测试删除节点时是否正确清理所有相关边
  })
  
  test('should cleanup preview lines when deleting node', () => {
    // 测试删除节点时是否正确清理预览线
  })
  
  test('should handle deletion of non-existent node gracefully', () => {
    // 测试删除不存在节点时的错误处理
  })
})
```

### 集成测试
```javascript
describe('Node Deletion Integration', () => {
  test('should maintain graph consistency after node deletion', () => {
    // 测试删除节点后图的一致性
  })
  
  test('should restore preview lines for orphaned nodes', () => {
    // 测试为失去连接的节点恢复预览线
  })
})
```

通过这些改进，可以彻底解决节点删除时的边引用错误问题，提升系统的稳定性和用户体验。