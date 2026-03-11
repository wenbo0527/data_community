# 横版画布LR统一自动布局方案（不含预览线）- 简化版

## 🎯 核心洞察

基于用户的重要提示：**端口已经和节点绑定，连线和端口绑定，因此自动布局只需要重新排列节点位置**。

这大大简化了我们的布局方案 - 无需处理复杂的连线路由和端口重计算，只需专注于节点的坐标优化。

## 🏗️ 简化后的架构

### 核心原则
1. **节点位置重排**：仅修改节点坐标，保持现有端口和连线不变
2. **LR方向分层**：基于连接关系进行拓扑分层，从左到右分布
3. **分支节点对齐**：按端口索引自然分行，无需复杂计算
4. **最小化干预**：不破坏现有绑定关系，只做位置优化

### 技术实现路径

```javascript
// 简化版LR布局算法
class SimpleLRLayout {
  execute(graph) {
    const nodes = graph.getNodes();
    const edges = graph.getEdges();
    
    // 1. 构建拓扑层次（仅基于现有连接）
    const layers = this.buildTopologyLayers(nodes, edges);
    
    // 2. 计算每列的x坐标
    const columnPositions = this.calculateColumnPositions(layers);
    
    // 3. 计算每行y坐标（基于端口自然分布）
    const rowPositions = this.calculateRowPositions(layers, nodes);
    
    // 4. 应用新位置（仅修改节点位置）
    this.applyPositions(nodes, columnPositions, rowPositions);
  }
  
  buildTopologyLayers(nodes, edges) {
    // 使用现有的拓扑排序算法
    // 返回：layerIndex -> nodeId[] 映射
  }
  
  calculateColumnPositions(layers) {
    // 简单等距分布
    return layers.map((_, index) => index * NODE_SPACING_X + INITIAL_X);
  }
  
  calculateRowPositions(layers, nodes) {
    // 关键洞察：利用现有端口分布
    // 同一父节点的子节点，按端口索引自然分行
    const rowMap = new Map();
    
    layers.forEach((layer, layerIndex) => {
      const parentGroups = this.groupByParent(layer, nodes);
      
      parentGroups.forEach((children, parentId) => {
        // 子节点按端口索引排序，自然形成行
        children.sort((a, b) => this.getPortIndex(a) - this.getPortIndex(b));
        children.forEach((node, index) => {
          rowMap.set(node.id, this.calculateRowY(layerIndex, index));
        });
      });
    });
    
    return rowMap;
  }
  
  getPortIndex(node) {
    // 从节点配置中获取端口索引
    // 例如：out-0, out-1, out-2 对应索引 0, 1, 2
    const ports = node.getPorts();
    return ports.find(p => p.group === 'out')?.id?.split('-')[1] || 0;
  }
}
```

## 📐 具体布局规则

### 1. 列分布（X坐标）
```
第1列: 起始节点 (x = 100)
第2列: 第一层子节点 (x = 350) 
第3列: 第二层子节点 (x = 600)
第n列: x = 100 + (n-1) * 250
```

### 2. 行分布（Y坐标）
基于端口索引的自然分布：
```javascript
// event-split 节点示例
// 端口: out-0 (YES), out-1 (NO)
// 自然分布：
// out-0 -> 第0行 (y = 200)
// out-1 -> 第1行 (y = 400)

// crowd-split 节点示例  
// 端口: out-0, out-1, out-2, out-3
// 自然分布：
// out-0 -> 第0行 (y = 150)
// out-1 -> 第1行 (y = 300)
// out-2 -> 第2行 (y = 450)
// out-3 -> 第3行 (y = 600)
```

### 3. 中心对齐优化
```javascript
// 每列内居中计算
const columnHeight = maxY - minY;
const centerOffset = (canvasHeight - columnHeight) / 2;
```

## 🔄 集成方案

### 1. 在横版画布中的集成点
```javascript
// src/pages/marketing/tasks/horizontal/index.vue

methods: {
  async handleApplyLayout() {
    try {
      // 使用简化版LR布局
      const layoutEngine = new SimpleLRLayout({
        nodeSpacing: { x: 250, y: 150 },
        alignment: 'center'
      });
      
      // 仅重新排列节点位置
      await layoutEngine.execute(this.graph);
      
      // 适配内容到视口
      this.handleFitContent();
      
    } catch (error) {
      console.error('布局应用失败:', error);
    }
  }
}
```

### 2. 与现有工具的兼容性
- ✅ **保持端口绑定**：不修改端口配置
- ✅ **保持连线关系**：不重新创建连线
- ✅ **保持节点选择器**：不影响节点创建流程
- ✅ **保持工具栏功能**：完全兼容现有工具栏

## ⚡ 性能优势

1. **计算量大幅减少**：
   - 无需计算连线路由
   - 无需重新分配端口
   - 无需处理预览线逻辑

2. **执行速度提升**：
   - 纯坐标计算，复杂度O(n)
   - 无图形重绘开销
   - 支持增量更新

3. **稳定性增强**：
   - 不破坏现有绑定关系
   - 减少布局过程中的错误
   - 更容易预测结果

## 🧪 验证方案

```javascript
// 单元测试示例
describe('SimpleLRLayout', () => {
  test('应保持端口绑定关系', () => {
    const originalPorts = node.getPorts();
    layout.execute(graph);
    const newPorts = node.getPorts();
    
    expect(newPorts).toEqual(originalPorts);
  });
  
  test('应保持连线关系', () => {
    const originalEdges = graph.getEdges();
    const originalConnections = originalEdges.map(edge => ({
      source: edge.getSource(),
      target: edge.getTarget()
    }));
    
    layout.execute(graph);
    
    const newEdges = graph.getEdges();
    const newConnections = newEdges.map(edge => ({
      source: edge.getSource(),
      target: edge.getTarget()
    }));
    
    expect(newConnections).toEqual(originalConnections);
  });
});
```

## 📊 预期效果

### 布局前（混乱状态）
```
    [A]     [B]
       \   /
        [C]
       /   \
    [D]     [E]
```

### 布局后（优化状态）
```
[A] → [C] → [D]
       ↓
      [E]
```

### 分支节点效果
```
[event-split]
     ↓ out-0 (YES)
   [node-YES]
     ↓ out-1 (NO)  
   [node-NO]
```

## 🎯 实施建议

1. **第一阶段**：实现基础LR布局算法
2. **第二阶段**：集成到横版画布工具栏
3. **第三阶段**：优化分支节点对齐效果
4. **第四阶段**：添加动画和用户交互

这个简化方案充分利用了现有架构的优势，通过最小化干预实现了最大的布局效果提升。