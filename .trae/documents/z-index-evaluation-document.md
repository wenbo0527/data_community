# Z-index 在营销画布设计中的作用评估文档

## 1. Z-index 在节点拖拽过程中的作用机制

### 1.1 拖拽时的层级提升策略
在 `useCanvasEvents.js` 中，Z-index 主要用于解决节点拖拽过程中的层级遮挡问题：

```javascript
// 节点拖拽开始事件
graph.value.on('node:mousedown', ({ node }) => {
  try {
    const nodeData = node.getData()
    if (nodeData && !nodeData.isDragHint) {
      console.log('[useCanvasEvents] 节点拖拽开始:', node.id)
      
      // 🔧 修复层级遮挡：拖拽开始时提升节点z-index到最高层级
      const originalZIndex = node.getZIndex()
      node.setData({ ...nodeData, originalZIndex }) // 保存原始z-index
      node.setZIndex(1000) // 设置为最高层级
      console.log(`[useCanvasEvents] 节点 ${node.id} z-index 提升至 1000`)
    }
  } catch (error) {
    console.error('[useCanvasEvents] 处理节点拖拽开始事件失败:', error)
  }
})
```

### 1.2 拖拽结束时的层级恢复
拖拽完成后，系统会自动恢复节点的原始 Z-index 值：

```javascript
// 拖拽结束时的处理逻辑
if (nodeData.originalZIndex !== undefined) {
  node.setZIndex(nodeData.originalZIndex)
  console.log(`[useCanvasEvents] 节点 ${node.id} z-index 恢复为原始值 ${nodeData.originalZIndex}`)
} else {
  // 如果没有原始z-index，设置为默认值
  const defaultZIndex = node.isSelected() ? 20 : 10
  node.setZIndex(defaultZIndex)
  console.log(`[useCanvasEvents] 节点 ${node.id} z-index 设置为默认值 ${defaultZIndex}`)
}
```

## 2. XY 重叠检测算法和实现原理

### 2.1 节点碰撞检测算法
系统使用矩形碰撞检测算法来判断节点是否重叠：

```javascript
/**
 * 检测节点碰撞
 */
static detectCollision(node1, node2, margin = 0) {
  if (!node1 || !node2) return false

  const rect1 = {
    left: (node1.x || 0) - margin,
    top: (node1.y || 0) - margin,
    right: (node1.x || 0) + (node1.width || 120) + margin,
    bottom: (node1.y || 0) + (node1.height || 80) + margin
  }

  const rect2 = {
    left: node2.x || 0,
    top: node2.y || 0,
    right: (node2.x || 0) + (node2.width || 120),
    bottom: (node2.y || 0) + (node2.height || 80)
  }

  return !(rect1.right < rect2.left || 
           rect1.left > rect2.right || 
           rect1.bottom < rect2.top || 
           rect1.top > rect2.bottom)
}
```

### 2.2 重叠解决策略
`LayerOptimizer.js` 实现了增强版的重叠解决算法：

```javascript
/**
 * 解决节点重叠 - 增强版
 */
resolveNodeOverlaps(layerNodes, positions) {
  // 增强修复：强制最小间距，确保底层节点不重叠
  const baseMinSpacing = this.options.node?.minSpacing || 100;
  const enhancedMinSpacing = Math.max(baseMinSpacing, 150); // 强制最小150px间距
  let adjustments = 0;

  // 关键修复：过滤掉没有位置信息的节点，避免TypeError
  const validNodes = layerNodes.filter((node) => {
    const nodeId = node.id || node.getId();
    const pos = positions.get(nodeId);
    if (!pos) {
      console.warn(`[重叠解决] 节点 ${nodeId} 在positions中不存在，跳过处理`);
      return false;
    }
    return true;
  });

  // 按逻辑流程排序处理重叠
  const sortedNodes = validNodes.sort((a, b) => {
    // 按逻辑流程排序，而非简单的X坐标排序
    const aId = a.id || a.getId();
    const bId = b.id || b.getId();
    // ... 排序逻辑
  });

  // 应用间距调整
  for (let i = 1; i < sortedNodes.length; i++) {
    const currentNode = sortedNodes[i];
    const prevNode = sortedNodes[i - 1];
    
    const currentPos = positions.get(currentNode.id || currentNode.getId());
    const prevPos = positions.get(prevNode.id || prevNode.getId());
    
    const actualSpacing = currentPos.x - prevPos.x;
    
    if (actualSpacing < enhancedMinSpacing) {
      // 调整当前节点位置
      currentPos.x = prevPos.x + enhancedMinSpacing;
      positions.set(currentNode.id || currentNode.getId(), currentPos);
      adjustments++;
    }
  }
  
  return adjustments;
}
```

### 2.3 重叠验证机制
系统还提供了重叠验证功能，确保调整后的布局没有残留重叠：

```javascript
/**
 * 增强修复：验证没有节点重叠
 */
validateNoOverlaps(sortedNodes, positions, minSpacing) {
  console.log('[重叠验证] 开始最终重叠验证');
  
  let overlapCount = 0;
  
  for (let i = 1; i < sortedNodes.length; i++) {
    const currentNode = sortedNodes[i];
    const prevNode = sortedNodes[i - 1];

    const currentPos = positions.get(currentNode.id || currentNode.getId());
    const prevPos = positions.get(prevNode.id || prevNode.getId());

    const actualSpacing = currentPos.x - prevPos.x;

    if (actualSpacing < minSpacing) {
      overlapCount++;
      console.error(`[重叠验证] 发现残留重叠: ${prevNode.id || prevNode.getId()} 和 ${currentNode.id || currentNode.getId()}, 间距: ${actualSpacing.toFixed(1)}px (需求: ${minSpacing}px)`);
    }
  }
  
  if (overlapCount === 0) {
    console.log('[重叠验证] 验证通过，无节点重叠');
  } else {
    console.error(`[重叠验证] 发现${overlapCount}处重叠，需要进一步处理`);
  }
}
```

## 3. 画布中防止节点重叠的策略和机制

### 3.1 多层级防护机制
1. **初始布局阶段**：使用布局算法确保节点初始位置不重叠
2. **拖拽过程中**：实时检测碰撞并提供视觉反馈
3. **拖拽结束后**：自动调整重叠节点位置
4. **最终验证**：确保调整后的布局没有残留重叠

### 3.2 预览线重叠处理
`CollisionDetector.js` 专门处理预览线的重叠问题：

```javascript
/**
 * 优化重叠的预览线
 */
optimizeOverlappingPreviewLines(previewInstances) {
  if (!previewInstances || previewInstances.length === 0) {
    return { optimized: 0, failed: 0 };
  }

  let optimizedCount = 0;
  let failedCount = 0;
  const processedLines = new Set();

  try {
    // 按源节点分组预览线
    const groupedBySource = this.groupPreviewLinesBySource(previewInstances);
    
    // 为每个源节点的预览线组计算偏移
    for (const [sourceNodeId, instances] of groupedBySource) {
      if (instances.length <= 1) {
        continue; // 单条预览线无需优化
      }

      // 计算偏移配置
      const offsetConfigs = this.calculateOffsetConfigurations(instances);
      
      // 应用偏移配置到每条预览线
      instances.forEach((instance, index) => {
        try {
          if (processedLines.has(instance.line.id)) {
            return; // 避免重复处理
          }

          const offsetConfig = offsetConfigs[index] || {};
          // 应用偏移...
          optimizedCount++;
        } catch (error) {
          failedCount++;
        }
      });
    }
  } catch (error) {
    console.error('优化预览线重叠失败:', error);
  }
  
  return { optimized: optimizedCount, failed: failedCount };
}
```

## 4. Z-index 与层级管理的关系

### 4.1 层级管理策略
- **默认层级**：普通节点使用 Z-index 10，选中节点使用 Z-index 20
- **拖拽时层级**：临时提升至 Z-index 1000，确保不被其他节点遮挡
- **恢复机制**：拖拽结束后恢复原层级或设置合适的默认值

### 4.2 层级与重叠的关系
Z-index 主要解决视觉遮挡问题，而不是物理位置重叠：
- Z-index 确保拖拽的节点始终在最上层，提供良好的用户交互体验
- XY 坐标重叠检测确保节点在物理位置上不会重叠
- 两者结合：Z-index 处理视觉层次，XY 检测处理物理位置

## 5. 重叠检测的性能优化措施

### 5.1 算法优化
1. **空间分割**：使用网格或四叉树减少碰撞检测的计算量
2. **增量更新**：只检测可能发生重叠的节点对
3. **缓存机制**：缓存节点的边界信息，避免重复计算

### 5.2 处理流程优化
```javascript
// 过滤无效节点，避免不必要的计算
const validNodes = layerNodes.filter((node) => {
  const nodeId = node.id || node.getId();
  const pos = positions.get(nodeId);
  if (!pos) {
    console.warn(`[重叠解决] 节点 ${nodeId} 在positions中不存在，跳过处理`);
    return false;
  }
  return true;
});

if (validNodes.length === 0) {
  console.log('[重叠解决] 没有有效节点需要处理重叠');
  return 0;
}
```

### 5.3 避免重复处理
```javascript
// 使用 Set 避免重复处理同一连线
const processedLines = new Set();

instances.forEach((instance, index) => {
  if (processedLines.has(instance.line.id)) {
    return; // 避免重复处理
  }
  // 处理逻辑...
  processedLines.add(instance.line.id);
});
```

## 6. 实际应用中的最佳实践建议

### 6.1 Z-index 使用建议
1. **保持简单**：使用有限的几个层级（如 10、20、1000）
2. **动态调整**：只在需要时临时提升层级，完成后立即恢复
3. **避免过度使用**：不要为每个节点分配独特的 Z-index

### 6.2 重叠预防策略
1. **合理的初始间距**：设置足够的最小间距（建议 150px 以上）
2. **分层布局**：使用分层算法确保节点按逻辑层次分布
3. **实时反馈**：在拖拽过程中提供视觉反馈，提示用户潜在的碰撞

### 6.3 性能优化建议
1. **批量处理**：一次性处理所有重叠，而不是逐个处理
2. **异步处理**：对于复杂的布局调整，考虑使用异步处理
3. **监控和日志**：记录重叠检测和调整的日志，便于调试和优化

### 6.4 用户体验优化
1. **平滑过渡**：使用动画效果展示节点的位置调整
2. **视觉提示**：在拖拽过程中显示碰撞检测的边界
3. **智能吸附**：结合 Z-index 提升和吸附功能，提供更好的交互体验

## 结论

Z-index 在营销画布设计中主要解决视觉层次问题，确保拖拽操作的流畅性和可见性。而 XY 重叠检测则负责维护节点间的物理距离，确保布局的合理性和美观性。两者相辅相成，共同构建了良好的用户交互体验。

通过合理的算法设计和性能优化，系统能够在保证功能完整性的同时，提供流畅的用户体验。关键在于理解 Z-index 和 XY 坐标系统的不同作用，并在适当的场景下使用合适的策略。