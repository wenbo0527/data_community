# 增强预设线系统实现方案

## 📋 需求分析

### 核心需求
1. **自动预设线生成**：节点配置完成后自动生成后续连接的预设线
2. **预设线拖拽支持**：预设线支持拖拽操作，可与实际节点挂载
3. **智能布局优化**：挂载后按标准化布局进行优化，从上到下分行排列
4. **结束节点处理**：用户留空时自动转换为结束节点
5. **连接限制**：从节点的out端口不允许再拖拽实体线

## 🏗️ 系统架构设计

### 1. 增强的预设线管理器 (EnhancedPreviewLineManager)

```javascript
class EnhancedPreviewLineManager extends ConnectionPreviewManager {
  constructor(graph, branchManager, layoutEngine) {
    super(graph, branchManager)
    this.layoutEngine = layoutEngine
    this.draggablePreviewLines = new Map() // 可拖拽的预设线
    this.endNodes = new Set() // 结束节点集合
  }

  // 核心功能
  createDraggablePreviewLine(sourceNode, branchId = null)
  handlePreviewLineDrag(previewLine, targetPosition)
  convertPreviewToConnection(previewLine, targetNode)
  createEndNode(position)
  refreshPreviewLines(node)
  applyStandardizedLayout()
}
```

### 2. 预设线状态管理

```javascript
const PreviewLineStates = {
  PENDING: 'pending',     // 等待连接
  DRAGGING: 'dragging',   // 拖拽中
  CONNECTED: 'connected', // 已连接
  END_NODE: 'end_node'    // 转为结束节点
}
```

### 3. 拖拽交互系统

```javascript
class PreviewLineDragHandler {
  startDrag(previewLine, startPosition)
  updateDragPosition(currentPosition)
  handleDrop(dropPosition, targetNode = null)
  cancelDrag()
}
```

## 🔧 核心功能实现

### 1. 节点配置完成后自动生成预设线

```javascript
// 在 useConfigDrawers.js 的 handleConfigConfirm 中添加
const handleConfigConfirm = async (drawerType, config) => {
  // ... 现有逻辑 ...
  
  // 配置完成后自动创建预设线
  const previewManager = getEnhancedPreviewManager()
  if (previewManager) {
    previewManager.createDraggablePreviewLine(nodeInstance)
    previewManager.refreshPreviewLines(nodeInstance)
  }
}
```

### 2. 可拖拽预设线实现

```javascript
createDraggablePreviewLine(sourceNode, branchId = null) {
  const previewLine = this.createBasicPreviewLine(sourceNode, branchId)
  
  // 添加拖拽能力
  previewLine.attr('line/cursor', 'grab')
  previewLine.on('mousedown', (e) => {
    this.startPreviewLineDrag(previewLine, e)
  })
  
  // 添加拖拽提示
  this.addDragHint(previewLine)
  
  return previewLine
}
```

### 3. 拖拽到节点自动挂载

```javascript
handlePreviewLineDrop(previewLine, dropPosition) {
  const targetNode = this.findNodeAtPosition(dropPosition)
  
  if (targetNode) {
    // 创建实际连接
    this.convertPreviewToConnection(previewLine, targetNode)
    
    // 应用标准化布局
    this.applyStandardizedLayout()
    
    // 为目标节点创建新的预设线
    this.createDraggablePreviewLine(targetNode)
  } else {
    // 创建结束节点
    const endNode = this.createEndNode(dropPosition)
    this.convertPreviewToConnection(previewLine, endNode)
  }
}
```

### 4. 结束节点自动创建

```javascript
createEndNode(position) {
  const endNode = this.graph.addNode({
    id: `end_${Date.now()}`,
    shape: 'end-node',
    x: position.x - 25,
    y: position.y - 25,
    width: 50,
    height: 50,
    attrs: {
      body: {
        fill: '#ff4d4f',
        stroke: '#ff4d4f'
      },
      text: {
        text: '结束',
        fill: '#fff'
      }
    },
    ports: {
      groups: {
        in: { /* 只有输入端口 */ }
      },
      items: [{ group: 'in', id: 'in' }]
    },
    data: {
      type: 'end',
      isEndNode: true,
      deletable: true
    }
  })
  
  this.endNodes.add(endNode.id)
  return endNode
}
```

### 5. 标准化布局优化

```javascript
applyStandardizedLayout() {
  const nodes = this.graph.getNodes()
  const connections = this.graph.getEdges()
  
  // 按层级分组
  const levels = this.groupNodesByLevel(nodes, connections)
  
  // 从上到下排列
  levels.forEach((levelNodes, level) => {
    const y = 100 + level * 150
    levelNodes.forEach((node, index) => {
      const x = 100 + index * 200
      node.setPosition(x, y)
    })
  })
  
  // 更新预设线位置
  this.updateAllPreviewLines()
}
```

## 🎨 用户交互流程

### 1. 配置节点 → 自动生成预设线
```
用户配置节点 → 点击确认 → 系统自动创建预设线 → 显示拖拽提示
```

### 2. 拖拽预设线连接节点
```
鼠标悬停预设线 → 显示拖拽光标 → 拖拽到目标位置 → 自动创建连接 → 布局优化
```

### 3. 拖拽预设线创建结束节点
```
拖拽预设线到空白区域 → 自动创建结束节点 → 建立连接 → 布局优化
```

### 4. 连接限制
```
已连接的节点out端口 → 禁用拖拽 → 显示禁用状态 → 防止重复连接
```

## 🔄 状态管理

### 预设线状态转换
```
PENDING → DRAGGING → (CONNECTED | END_NODE)
```

### 节点状态管理
```javascript
const NodeStates = {
  CONFIGURED: 'configured',   // 已配置
  CONNECTED: 'connected',     // 已连接
  END_NODE: 'end_node',      // 结束节点
  DRAGGING: 'dragging'       // 拖拽中
}
```

## 📊 性能优化

### 1. 懒加载预设线
- 只为可见区域的节点创建预设线
- 滚动时动态加载/卸载

### 2. 拖拽防抖
- 拖拽过程中减少重绘频率
- 使用 requestAnimationFrame 优化动画

### 3. 内存管理
- 及时清理已转换的预设线
- 避免内存泄漏

## 🧪 测试策略

### 1. 单元测试
- 预设线创建/删除
- 拖拽逻辑
- 状态转换

### 2. 集成测试
- 完整的用户交互流程
- 布局优化效果
- 性能测试

### 3. 用户体验测试
- 拖拽流畅度
- 视觉反馈
- 错误处理

## 📅 实施计划

### Phase 1: 基础功能 (1-2周)
- [ ] 增强预设线管理器
- [ ] 基础拖拽功能
- [ ] 结束节点创建

### Phase 2: 交互优化 (1周)
- [ ] 拖拽视觉反馈
- [ ] 吸附效果
- [ ] 错误处理

### Phase 3: 布局优化 (1周)
- [ ] 标准化布局算法
- [ ] 性能优化
- [ ] 测试完善

### Phase 4: 集成测试 (1周)
- [ ] 完整功能测试
- [ ] 用户体验优化
- [ ] 文档完善

## 🎯 预期效果

1. **用户体验提升**：直观的拖拽操作，减少学习成本
2. **工作流程优化**：自动化的预设线生成，提高配置效率
3. **布局美观**：标准化的节点排列，提升视觉效果
4. **操作便捷**：一键创建结束节点，简化流程设计

## 🔧 技术栈

- **前端框架**：Vue 3 + X6
- **状态管理**：Pinia/Vuex
- **动画库**：X6 内置动画 + CSS3
- **测试框架**：Jest + Vue Test Utils