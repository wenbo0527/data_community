# 预览线时序问题修复文档

## 问题描述

在节点配置完成后创建预览线时，出现了时序问题：

```
❌ [统一预览线管理器] 源节点不存在于图中: {sourceNodeId: 'node_1752804600037', nodeExists: false, isNode: false}
❌ [统一预览线管理器] 单一预览线创建失败: node_1752804600037
✅ [统一预览线管理器] 配置完成后预览线创建成功: node_1752804600037
```

这表明在 `createPreviewLineAfterConfig` 方法中，节点配置完成后立即尝试创建预览线，但此时节点可能还未完全同步到图中。

## 根本原因

1. **时序问题**：节点数据更新和图的状态同步存在延迟
2. **同步调用**：原来的 `createPreviewLineAfterConfig` 是同步方法，无法等待节点同步
3. **缺乏重试机制**：没有重试机制来处理临时的同步延迟

## 修复方案

### 1. 异步化预览线创建方法

将 `createPreviewLineAfterConfig` 方法改为异步方法：

```javascript
async createPreviewLineAfterConfig(node, config = {}) {
  // ... 现有逻辑
  
  // 等待节点数据更新完成，确保图状态同步
  await this.waitForNodeSync(node)
  
  // 使用带重试机制的预览线创建
  const result = await this.createUnifiedPreviewLineWithRetry(node, initialState, options)
}
```

### 2. 添加节点同步等待机制

```javascript
async waitForNodeSync(node, maxRetries = 5, delay = 50) {
  for (let i = 0; i < maxRetries; i++) {
    const graphNode = this.graph.getCellById(node.id)
    if (graphNode && graphNode.isNode()) {
      return true
    }
    await new Promise(resolve => setTimeout(resolve, delay))
  }
  return false
}
```

### 3. 添加重试机制

```javascript
async createUnifiedPreviewLineWithRetry(node, initialState, options = {}, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = this.createUnifiedPreviewLine(node, initialState, options)
      if (result) {
        return result
      }
    } catch (error) {
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
  }
  return null
}
```

### 4. 更新调用方

在 `useConfigDrawers.js` 中更新调用方式：

```javascript
await unifiedPreviewManager.createPreviewLineAfterConfig(nodeInstance, config)
```

## 修复效果

1. **解决时序问题**：通过异步等待确保节点已同步到图中
2. **提高成功率**：通过重试机制处理临时的同步延迟
3. **更好的错误处理**：提供详细的日志和错误信息
4. **向后兼容**：不影响现有的预览线功能

## 测试建议

1. **配置节点测试**：创建各种类型的节点并配置，观察预览线创建是否成功
2. **快速操作测试**：快速连续配置多个节点，测试时序处理
3. **错误恢复测试**：在网络延迟或系统负载高的情况下测试

## 相关文件

- `src/utils/UnifiedPreviewLineManager.js` - 主要修复文件
- `src/composables/useConfigDrawers.js` - 调用方更新
- `CODE_QUALITY_ENHANCEMENT_GUIDE.md` - 代码质量改进指南

## 注意事项

1. 这个修复是向后兼容的，不会影响现有功能
2. 异步化可能会略微增加配置确认的响应时间，但提高了成功率
3. 重试机制有最大次数限制，避免无限重试