# 预览线统一化方案

## 📋 背景分析

当前系统存在两种预览线：
1. **持久化预览线**: 静态显示，仅作视觉指引
2. **可拖拽预设线**: 动态交互，支持拖拽连接

两者功能重叠，造成代码冗余和用户体验不一致。

## 🎯 统一化目标

### 核心理念
**一条预览线，多种状态** - 根据节点状态和用户交互动态切换预览线的行为模式

### 设计原则
1. **渐进式交互**: 从静态显示到动态交互的平滑过渡
2. **状态驱动**: 基于节点配置状态决定预览线行为
3. **统一管理**: 单一管理器负责所有预览线逻辑
4. **向后兼容**: 保持现有API的兼容性

## 🏗️ 统一架构设计

### 1. 统一预览线状态机

```javascript
const UnifiedPreviewStates = {
  // 静态状态
  STATIC_DISPLAY: 'static_display',     // 静态显示（替代持久化预览线）
  
  // 交互状态  
  INTERACTIVE: 'interactive',           // 可交互（节点配置完成后）
  DRAGGING: 'dragging',                // 拖拽中
  
  // 连接状态
  CONNECTED: 'connected',              // 已连接
  HIDDEN: 'hidden'                     // 隐藏状态
}
```

### 2. 统一预览线管理器

```javascript
class UnifiedPreviewLineManager {
  constructor(graph, branchManager, layoutConfig) {
    this.graph = graph
    this.branchManager = branchManager
    this.layoutConfig = layoutConfig
    
    // 统一存储所有预览线
    this.previewLines = new Map() // key: nodeId, value: PreviewLineInstance
    
    // 状态管理
    this.nodeStates = new Map() // 节点配置状态
  }

  /**
   * 创建统一预览线
   * @param {Object} node - 源节点
   * @param {string} initialState - 初始状态
   */
  createUnifiedPreviewLine(node, initialState = UnifiedPreviewStates.STATIC_DISPLAY) {
    const previewLine = this.createBasicPreviewLine(node)
    
    // 设置初始状态
    this.setPreviewLineState(previewLine, initialState)
    
    // 存储预览线
    this.previewLines.set(node.id, {
      line: previewLine,
      sourceNode: node,
      state: initialState,
      dragHandler: null
    })
    
    return previewLine
  }

  /**
   * 设置预览线状态
   * @param {Object} previewLine - 预览线对象
   * @param {string} state - 目标状态
   */
  setPreviewLineState(previewLine, state) {
    switch (state) {
      case UnifiedPreviewStates.STATIC_DISPLAY:
        this.configureStaticDisplay(previewLine)
        break
        
      case UnifiedPreviewStates.INTERACTIVE:
        this.configureInteractive(previewLine)
        break
        
      case UnifiedPreviewStates.DRAGGING:
        this.configureDragging(previewLine)
        break
        
      case UnifiedPreviewStates.CONNECTED:
        this.configureConnected(previewLine)
        break
        
      case UnifiedPreviewStates.HIDDEN:
        this.configureHidden(previewLine)
        break
    }
  }

  /**
   * 配置静态显示状态（替代持久化预览线）
   */
  configureStaticDisplay(previewLine) {
    previewLine.attr({
      line: {
        stroke: '#d9d9d9',
        strokeWidth: 2,
        strokeDasharray: '5,5',
        opacity: 0.6,
        cursor: 'default'
      }
    })
    
    // 移除交互能力
    previewLine.off('mousedown')
    this.removeDragHint(previewLine)
  }

  /**
   * 配置交互状态（替代可拖拽预设线）
   */
  configureInteractive(previewLine) {
    previewLine.attr({
      line: {
        stroke: '#1890ff',
        strokeWidth: 2,
        strokeDasharray: '5,5',
        opacity: 0.8,
        cursor: 'grab'
      }
    })
    
    // 添加交互能力
    this.addDragCapability(previewLine)
    this.addDragHint(previewLine)
  }

  /**
   * 节点配置完成后的状态转换
   * @param {Object} node - 已配置的节点
   */
  onNodeConfigured(node) {
    const previewInstance = this.previewLines.get(node.id)
    if (previewInstance) {
      // 从静态显示转换为交互状态
      this.setPreviewLineState(previewInstance.line, UnifiedPreviewStates.INTERACTIVE)
      previewInstance.state = UnifiedPreviewStates.INTERACTIVE
      
      console.log('🔄 [统一预览线] 节点配置完成，预览线转为交互状态:', node.id)
    }
  }

  /**
   * 节点连接后的状态转换
   * @param {Object} node - 已连接的节点
   */
  onNodeConnected(node) {
    const previewInstance = this.previewLines.get(node.id)
    if (previewInstance) {
      // 转换为隐藏状态
      this.setPreviewLineState(previewInstance.line, UnifiedPreviewStates.HIDDEN)
      previewInstance.state = UnifiedPreviewStates.HIDDEN
      
      console.log('🔄 [统一预览线] 节点已连接，预览线隐藏:', node.id)
    }
  }
}
```

## 🔄 迁移策略

### 阶段1: 创建统一管理器
1. 创建 `UnifiedPreviewLineManager` 类
2. 实现基础的状态机制
3. 保持现有API兼容性

### 阶段2: 逐步替换
1. 替换持久化预览线的创建逻辑
2. 替换可拖拽预设线的创建逻辑
3. 统一事件处理机制

### 阶段3: 清理优化
1. 移除旧的管理器代码
2. 优化性能和内存使用
3. 完善测试覆盖

## 📊 预期收益

### 代码质量提升
- **减少代码重复**: 合并两套相似的逻辑
- **降低维护成本**: 单一管理器更易维护
- **提高可测试性**: 统一的状态机制便于测试

### 用户体验改善
- **交互一致性**: 统一的预览线行为
- **视觉清晰度**: 避免多种预览线的混乱
- **学习成本降低**: 单一的交互模式

### 性能优化
- **内存使用**: 减少重复的预览线对象
- **渲染性能**: 统一的渲染逻辑
- **事件处理**: 简化的事件监听机制

## 🚀 实施建议

### 立即可行的改进
1. **状态标识**: 为现有预览线添加状态标识
2. **统一样式**: 制定统一的视觉规范
3. **API整合**: 创建统一的创建和管理接口

### 中期目标
1. **完整迁移**: 完成统一管理器的实现
2. **性能优化**: 优化渲染和事件处理
3. **功能增强**: 添加更多交互状态

### 长期愿景
1. **智能预测**: 基于用户行为预测连接意图
2. **自适应布局**: 根据连接复杂度自动调整显示
3. **可视化增强**: 更丰富的视觉反馈机制

## 🔧 技术实现要点

### 1. 状态转换触发时机
```javascript
// 节点添加时 -> STATIC_DISPLAY
graph.on('node:added', (e) => {
  unifiedManager.createUnifiedPreviewLine(e.node, UnifiedPreviewStates.STATIC_DISPLAY)
})

// 节点配置完成时 -> INTERACTIVE
configDrawer.on('config:confirmed', (node) => {
  unifiedManager.onNodeConfigured(node)
})

// 节点连接时 -> HIDDEN
graph.on('edge:added', (e) => {
  const sourceNode = e.edge.getSourceNode()
  unifiedManager.onNodeConnected(sourceNode)
})
```

### 2. 向后兼容性保证
```javascript
// 保持现有API
class UnifiedPreviewLineManager {
  // 兼容持久化预览线API
  createPersistentPreview(node) {
    return this.createUnifiedPreviewLine(node, UnifiedPreviewStates.STATIC_DISPLAY)
  }
  
  // 兼容可拖拽预设线API
  createDraggablePreviewLine(node) {
    return this.createUnifiedPreviewLine(node, UnifiedPreviewStates.INTERACTIVE)
  }
}
```

### 3. 性能优化策略
```javascript
// 批量状态更新
batchStateUpdate(updates) {
  this.graph.batchUpdate(() => {
    updates.forEach(({ node, state }) => {
      this.setPreviewLineState(node, state)
    })
  })
}

// 懒加载交互能力
enableInteractivity(previewLine) {
  if (!previewLine._interactivityEnabled) {
    this.addDragCapability(previewLine)
    previewLine._interactivityEnabled = true
  }
}
```

## ✅ 结论

**建议进行合并**，通过统一的状态机制可以：
1. 消除功能重叠和代码冗余
2. 提供更一致的用户体验
3. 简化维护和扩展工作
4. 为未来功能增强奠定基础

合并后的统一预览线系统将更加灵活、高效，并且易于维护。