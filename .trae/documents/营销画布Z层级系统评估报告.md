# 营销画布Z层级系统评估报告

## 1. 当前Z-index的作用分析

### 1.1 核心功能
基于代码分析，Z-index在营销画布中主要用于以下场景：

**拖拽过程中的层级管理**
```javascript
// 拖拽开始时提升Z-index到1000
const originalZIndex = node.getZIndex()
node.setData({ ...nodeData, originalZIndex })
node.setZIndex(1000) // 设置为最高层级

// 拖拽结束时恢复原层级
const originalZIndex = nodeData.originalZIndex
if (originalZIndex !== undefined) {
  node.setZIndex(originalZIndex)
} else {
  const defaultZIndex = node.isSelected() ? 20 : 10
  node.setZIndex(defaultZIndex)
}
```

### 1.2 使用场景
1. **拖拽交互**：确保被拖拽的节点始终在最上层，避免被其他节点遮挡
2. **选中状态**：选中节点使用Z-index 20，普通节点使用Z-index 10
3. **视觉层次**：通过Z-index控制节点的视觉层级关系

## 2. 移除Z-index的影响评估

### 2.1 正面影响
- **简化代码**：减少约30行Z-index管理代码
- **提升性能**：消除Z-index的频繁设置和恢复操作
- **降低复杂度**：无需维护Z-index状态

### 2.2 负面影响
- **拖拽体验下降**：被拖拽节点可能被其他节点遮挡
- **视觉层次混乱**：无法区分选中状态和拖拽状态
- **交互冲突**：拖拽过程中可能出现节点重叠混乱

## 3. 替代方案分析

### 3.1 CSS transform方案
```javascript
// 替代Z-index提升，使用transform scale
node.attr('body/transform', 'scale(1.1)')
node.attr('body/filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))')
```

**优点**：
- 无需修改Z-index
- 提供视觉反馈
- 性能较好

**缺点**：
- 仍可能被遮挡
- 视觉提升效果有限

### 3.2 渲染顺序调整
```javascript
// 通过调整节点在DOM中的顺序实现层级效果
const parent = node.getParent()
const children = parent.getChildren()
// 将被拖拽节点移动到最后
parent.appendChild(node)
```

**优点**：
- 完全移除Z-index依赖
- 浏览器原生支持

**缺点**：
- 需要频繁操作DOM
- 可能影响其他渲染逻辑

### 3.3 透明度方案
```javascript
// 拖拽时降低其他节点透明度
graph.getNodes().forEach(n => {
  if (n !== node) {
    n.attr('body/opacity', 0.5)
  }
})
```

**优点**：
- 突出被拖拽节点
- 无需Z-index

**缺点**：
- 视觉体验不够直观
- 可能影响整体美观

## 4. 技术实现复杂度评估

### 4.1 移除Z-index的复杂度
- **低复杂度**：直接删除相关代码即可
- **风险等级**：中等（可能影响用户体验）
- **测试工作量**：需要全面测试拖拽功能

### 4.2 替代方案实现复杂度

| 方案 | 实现复杂度 | 风险等级 | 性能影响 |
|------|------------|----------|----------|
| CSS transform | 低 | 低 | 轻微 |
| 渲染顺序调整 | 中 | 中 | 中等 |
| 透明度方案 | 低 | 低 | 轻微 |

## 5. 性能影响评估

### 5.1 当前Z-index性能开销
- **频繁操作**：每次拖拽都涉及getZIndex/setZIndex调用
- **状态维护**：需要保存和恢复原始Z-index
- **内存占用**：每个节点需要存储Z-index状态

### 5.2 移除后的性能提升
- **减少API调用**：消除Z-index相关操作
- **简化状态管理**：无需维护Z-index状态
- **提升响应速度**：减少拖拽过程中的计算量

## 6. 用户体验影响分析

### 6.1 当前体验优势
- **拖拽流畅**：被拖拽节点始终在最上层
- **视觉清晰**：层级关系明确
- **交互直观**：用户能清楚看到操作对象

### 6.2 移除后的体验变化
- **可能遮挡**：拖拽过程中节点可能被遮挡
- **视觉混乱**：无法区分操作层级
- **交互不确定性**：用户可能不确定是否成功选中

## 7. 最终建议

### 7.1 不建议完全移除Z-index
基于以下原因，建议保留Z-index系统：

1. **核心功能依赖**：拖拽交互严重依赖层级管理
2. **用户体验重要**：Z-index提供了关键的视觉反馈
3. **实现成熟**：当前实现稳定可靠
4. **替代方案不足**：现有替代方案无法完全替代Z-index功能

### 7.2 优化建议

**简化实现**
```javascript
// 简化Z-index管理，只保留核心功能
const DRAG_Z_INDEX = 1000
const SELECTED_Z_INDEX = 20
const DEFAULT_Z_INDEX = 10

// 拖拽开始
node.setZIndex(DRAG_Z_INDEX)

// 拖拽结束
node.setZIndex(node.isSelected() ? SELECTED_Z_INDEX : DEFAULT_Z_INDEX)
```

**性能优化**
- 减少Z-index查询次数
- 批量处理Z-index更新
- 使用常量替代运行时计算

**代码简化**
- 移除不必要的Z-index状态保存
- 简化恢复逻辑
- 统一Z-index管理策略

### 7.3 渐进式改进方案

1. **第一阶段**：优化现有Z-index实现，减少复杂度
2. **第二阶段**：结合CSS transform提供额外视觉反馈
3. **第三阶段**：评估用户反馈，决定是否进一步简化

## 8. 结论

营销画布中的Z-index系统虽然增加了代码复杂度，但在提供良好用户体验方面发挥着重要作用。考虑到替代方案的局限性，建议保留Z-index功能，但通过优化实现来降低复杂度和提升性能。同时可以探索结合其他视觉反馈机制，进一步提升交互体验。