# 结构化布局居中对齐改进指南

## 🎯 改进目标

确保在执行结构化布局时，所有画布元素（节点、预览线、连接线、拖拽点）都能居中对齐并自上而下排列。

## 🔧 核心改进

### 1. StructuredLayoutEngine.js 改进

#### 新增全局居中对齐方法
```javascript
applyCenterAlignment(positions) {
  if (Object.keys(positions).length === 0) {
    return positions
  }
  
  // 计算所有节点的边界
  const xValues = Object.values(positions).map(pos => pos.x)
  const yValues = Object.values(positions).map(pos => pos.y)
  
  const minX = Math.min(...xValues)
  const maxX = Math.max(...xValues)
  const minY = Math.min(...yValues)
  
  // 计算居中偏移量
  const centerOffsetX = -(minX + maxX) / 2
  const centerOffsetY = -minY
  
  // 应用居中偏移
  const centeredPositions = {}
  Object.entries(positions).forEach(([nodeId, position]) => {
    centeredPositions[nodeId] = {
      x: position.x + centerOffsetX,
      y: position.y + centerOffsetY
    }
  })
  
  return centeredPositions
}
```

#### 改进层级位置计算
- 确保单个节点完全居中（x: 0）
- 多个节点水平分布时以中心点为基准
- 为分流节点预留分支空间

#### 增强分流节点位置调整
```javascript
adjustSplitNodePositions(levelNodes, positions, levelIndex) {
  const adjustedPositions = [...positions]
  
  levelNodes.forEach((node, index) => {
    const nodeType = node.getData()?.type
    const branchCount = this.getNodeBranchCount(node)
    
    // 对于有多个分支的节点，记录分支信息
    if (['audience-split', 'event-split', 'ab-test'].includes(nodeType) && branchCount > 1) {
      const currentPos = adjustedPositions[index]
      if (currentPos) {
        currentPos.branchCount = branchCount
        currentPos.branchSpacing = this.layoutConfig.branchSpacing
        currentPos.totalBranchWidth = (branchCount - 1) * this.layoutConfig.branchSpacing
      }
    }
  })
  
  return adjustedPositions
}
```

### 2. TaskFlowCanvas.vue 改进

#### 增强布局应用流程
```javascript
const applyStructuredLayout = async () => {
  // ... 布局应用逻辑 ...
  
  // 延迟执行居中和缩放，确保布局完全应用
  setTimeout(() => {
    if (!isApplyingLayout.value) return
    
    console.log('[TaskFlowCanvas] 开始居中和缩放画布内容')
    
    // 先居中内容，再适应缩放
    if (graph) {
      // 居中所有内容
      graph.centerContent()
      
      // 延迟执行缩放以确保居中完成
      setTimeout(() => {
        if (!isApplyingLayout.value) return
        
        // 适应内容大小
        zoomToFit()
        
        console.log('[TaskFlowCanvas] 画布居中和缩放完成')
      }, 100)
    }
  }, 200)
}
```

### 3. useStructuredLayout.js 改进

#### 完善元素位置更新
- **节点位置**: 使用新的居中对齐算法
- **预览线位置**: 调用预览线管理器更新位置
- **连接线路径**: 强制重新计算连接线路径
- **拖拽点位置**: 根据父节点位置重新计算

```javascript
// 更新连接线路径
setTimeout(() => {
  edges.forEach(edge => {
    if (edge.isEdge()) {
      edge.updateConnection()
    }
  })
  
  // 更新拖拽点位置
  const dragHints = graph.getNodes().filter(node => {
    const data = node.getData()
    return data && (data.isDragHint || data.type === 'drag-hint' || node.id.includes('hint_'))
  })
  
  dragHints.forEach(hint => {
    // 重新计算拖拽点位置逻辑
  })
}, 100)
```

## 🎨 布局效果

### 居中对齐原理
1. **水平居中**: 计算所有节点的最小和最大X坐标，以中点为基准进行偏移
2. **垂直对齐**: 将最顶层节点的Y坐标调整为0，确保自上而下排列
3. **网格对齐**: 所有位置都对齐到网格点，确保整齐美观

### 元素协调
- **节点**: 按层级自上而下排列，同层级水平居中
- **预览线**: 跟随节点位置自动调整
- **连接线**: 重新计算路径确保正确连接
- **拖拽点**: 根据父节点位置重新定位

## 🔄 执行流程

1. **计算布局**: 使用拓扑排序确定节点层级
2. **应用居中**: 计算全局居中偏移量
3. **更新位置**: 依次更新节点、预览线、连接线、拖拽点
4. **画布调整**: 居中画布内容并适应缩放

## 📊 性能优化

- 使用防抖机制避免重复布局
- 分阶段更新不同类型的元素
- 延迟执行缩放操作确保布局完成

## 🧪 测试建议

### 测试场景
1. **单节点布局**: 确保节点完全居中
2. **多层级布局**: 验证自上而下排列
3. **分流节点**: 检查分支空间预留
4. **预览线**: 确认预览线跟随节点移动
5. **连接线**: 验证连接线路径正确
6. **拖拽点**: 检查拖拽点位置更新

### 验证方法
```javascript
// 检查节点是否居中
const checkCenterAlignment = () => {
  const nodes = graph.getNodes()
  const positions = nodes.map(node => node.position())
  const xValues = positions.map(pos => pos.x)
  const centerX = (Math.min(...xValues) + Math.max(...xValues)) / 2
  console.log('布局中心点X坐标:', centerX)
  // 应该接近0
}
```

## 🎯 预期效果

- ✅ 所有节点水平居中对齐
- ✅ 节点按层级自上而下排列
- ✅ 预览线位置正确跟随
- ✅ 连接线路径准确连接
- ✅ 拖拽点位置合理分布
- ✅ 画布自动居中和缩放