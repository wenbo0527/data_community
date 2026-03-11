# PreviewLineSystem 递归调用清除方案

## 1. 实际代码递归调用分析

### 1.1 主要递归调用点识别

**第一类：事件监听器递归（行 974-1020）**：

```javascript
// 🚨 问题代码：edge:removed 事件处理
this.graph.on('edge:removed', (args) => {
  // 复杂的递归保护机制
  if (this._edgeRemovalGuard && this._edgeRemovalGuard.has(recursionKey)) {
    console.warn('检测到边删除递归处理，阻止栈溢出');
    return;
  }
  
  // 异步递归调用
  setTimeout(() => {
    this.createPreviewLine(sourceNode); // 可能触发新的边操作
  }, 10);
});
```

**第二类：预览线创建递归（行 1140-1220）**：

```javascript
// 🚨 问题代码：createPreviewLine 方法
createPreviewLine(sourceNodeOrConfig, config = null) {
  // 复杂的递归保护
  if (this._createPreviewLineGuard && this._createPreviewLineGuard.has(nodeId)) {
    console.warn('检测到 createPreviewLine 递归调用');
    return null;
  }
  
  // 可能触发事件，导致递归
  this.emit('previewLine:created', previewLine);
}
```

**第三类：节点添加处理递归（行 1050-1120）**：

```javascript
// 🚨 问题代码：handleNodeAdded 方法
handleNodeAdded(args) {
  // 异步延迟执行
  setTimeout(async () => {
    this.previewLineManager.createUnifiedPreviewLine(validNode); // 可能递归
  }, 100);
}
```

### 1.2 过度复杂的保护机制

**当前存在的保护标志**：

```javascript
// 🚨 过度复杂的保护机制
this._edgeRemovalGuard = new Set();        // 边删除保护
this._createPreviewLineGuard = new Set();  // 预览线创建保护  
this._errorHandlingGuard = new Set();      // 错误处理保护
this._isHandlingError = false;             // 错误处理标志
this._isCreatingPreviewLine = false;       // 创建标志
this._isHandlingEdgeRemoval = false;       // 边删除标志
```

### 1.3 递归调用的危害分析

**性能问题**：

* 栈溢出风险：深度递归可能导致调用栈溢出

* 内存泄漏：Set 对象持续增长，未及时清理

* CPU 占用：大量的保护检查和异步调用

**功能问题**：

* 预览线创建失败：递归保护阻止了正常的预览线创建

* 事件处理混乱：异步递归导致事件处理顺序不可预测

* 状态不一致：多个异步操作同时修改状态

**维护问题**：

* 调试困难：复杂的保护机制掩盖了真实问题

* 代码复杂：大量的保护代码增加了维护成本

* 不可预测：异步递归使得系统行为难以预测

## 2. 递归调用清除方案

### 2.1 立即清除的递归调用

**清除异步递归调用**：

```javascript
// ❌ 当前问题代码
setTimeout(() => {
  this.createPreviewLine(sourceNode);
}, 10);

// ✅ 清除后的同步代码
const result = this.createPreviewLineSync(sourceNode);
if (!result.success) {
  console.warn('预览线创建失败:', result.reason);
}
```

**清除事件循环递归**：

```javascript
// ❌ 当前问题代码
this.graph.on('edge:removed', (args) => {
  this.createPreviewLine(sourceNode); // 可能触发新事件
});

// ✅ 清除后的去耦合代码
this.graph.on('edge:removed', (args) => {
  const sourceNodeId = args?.edge?.getSourceCellId?.();
  if (sourceNodeId) {
    this.markNodeForUpdate(sourceNodeId); // 只标记，不执行
  }
});
```

### 2.2 移除所有保护机制

**完全移除的保护代码**：

```javascript
// ❌ 删除这些复杂的保护机制
// this._edgeRemovalGuard = new Set();
// this._createPreviewLineGuard = new Set();
// this._errorHandlingGuard = new Set();
// this._isHandlingError = false;
// this._isCreatingPreviewLine = false;
// this._isHandlingEdgeRemoval = false;

// ✅ 替换为简单的系统状态
this.systemState = 'idle'; // idle | processing | error
```

### 2.3 同步替代方案

**同步预览线创建**：

```javascript
// ✅ 新的同步创建方法
createPreviewLineSync(node) {
  // 系统状态检查
  if (this.systemState !== 'idle') {
    return { success: false, reason: 'system_busy' };
  }
  
  this.systemState = 'processing';
  
  try {
    // 1. 验证节点
    if (!this.validateNode(node)) {
      return { success: false, reason: 'invalid_node' };
    }
    
    // 2. 检查是否已存在（幂等性）
    const existing = this.getPreviewLine(node.id);
    if (existing) {
      return { success: true, previewLine: existing, created: false };
    }
    
    // 3. 同步创建预览线
    const previewLine = this.renderer.createPreviewLineSync(node);
    
    // 4. 同步更新状态
    this.stateManager.setPreviewLine(node.id, previewLine);
    
    return { success: true, previewLine, created: true };
  } finally {
    this.systemState = 'idle';
  }
}
```

**批量处理机制**：

```javascript
// ✅ 批量处理待更新的节点
processMarkedNodes() {
  if (this.systemState !== 'idle' || this.pendingUpdates.size === 0) {
    return;
  }
  
  this.systemState = 'processing';
  
  try {
    const nodesToProcess = Array.from(this.pendingUpdates);
    this.pendingUpdates.clear();
    
    for (const nodeId of nodesToProcess) {
      const node = this.graph.getCellById(nodeId);
      if (node && this.shouldCreatePreviewLine(node)) {
        this.createPreviewLineSync(node);
      }
    }
  } finally {
    this.systemState = 'idle';
  }
}
```

## 3. 具体实施步骤

### 3.1 第一步：清除异步递归调用

**修改 edge:removed 事件处理**：

```javascript
// 🔄 替换原有的复杂事件处理
registerEventListeners() {
  if (this.graph && typeof this.graph.on === 'function') {
    // 简化的事件处理 - 只标记，不执行
    this.graph.on('edge:removed', (args) => {
      const sourceNodeId = args?.edge?.getSourceCellId?.();
      if (sourceNodeId) {
        this.markNodeForUpdate(sourceNodeId);
      }
    });
    
    // 在渲染完成后批量处理
    this.graph.on('render:done', () => {
      this.processMarkedNodes();
    });
  }
}

// 新增标记方法
markNodeForUpdate(nodeId) {
  if (!this.pendingUpdates) {
    this.pendingUpdates = new Set();
  }
  this.pendingUpdates.add(nodeId);
}
```

### 3.2 第二步：重构 createPreviewLine 方法

**完全重写 createPreviewLine**：

```javascript
// 🔄 替换原有的复杂创建方法
createPreviewLine(sourceNodeOrConfig, config = null) {
  // 直接调用同步方法，移除所有保护机制
  let sourceNode = null;
  let actualConfig = null;
  
  if (config !== null) {
    sourceNode = sourceNodeOrConfig;
    actualConfig = config;
  } else {
    actualConfig = sourceNodeOrConfig;
    sourceNode = actualConfig.sourceNode || this.graph.getCellById(actualConfig.sourceNodeId);
  }
  
  if (!sourceNode) {
    console.warn('createPreviewLine: 无效的源节点');
    return null;
  }
  
  return this.createPreviewLineSync(sourceNode);
}
```

### 3.3 第三步：简化 handleNodeAdded 方法

**移除异步延迟执行**：

```javascript
// 🔄 替换原有的异步处理
handleNodeAdded(args) {
  try {
    const node = args?.node || args?.cell;
    if (!node) {
      console.warn('handleNodeAdded: 无效的节点参数');
      return;
    }
    
    const nodeData = node.getData();
    if (!nodeData || !nodeData.isConfigured) {
      return; // 只处理已配置的节点
    }
    
    // 直接同步处理，移除 setTimeout
    if (this.previewLineManager) {
      this.previewLineManager.createUnifiedPreviewLine(node);
    }
  } catch (error) {
    console.warn('处理节点添加事件失败:', error.message);
  }
}
```

### 3.4 第四步：移除构造函数中的保护机制

**清理构造函数**：

```javascript
// 🔄 简化构造函数，移除所有保护标志
constructor(graph, options = {}) {
  // 基础验证
  if (!graph) {
    throw new Error('PreviewLineSystem 需要有效的图形实例');
  }
  
  this.graph = graph;
  this.options = { ...this.getDefaultOptions(), ...options };
  
  // 简化状态管理 - 只保留必要状态
  this.systemState = 'idle'; // idle | processing | error
  this.pendingUpdates = new Set(); // 待处理的节点ID
  
  // 移除所有复杂的保护机制
  // ❌ 删除：this._edgeRemovalGuard = new Set();
  // ❌ 删除：this._createPreviewLineGuard = new Set();
  // ❌ 删除：this._errorHandlingGuard = new Set();
  // ❌ 删除：this._isHandlingError = false;
  // ❌ 删除：this._isCreatingPreviewLine = false;
  // ❌ 删除：this._isHandlingEdgeRemoval = false;
  
  // 初始化核心模块
  this.initializeModules();
}
```

## 4. 功能完整性保证

### 4.1 确保预览线创建功能

**核心功能验证**：

```javascript
// ✅ 验证预览线创建功能完整性
validatePreviewLineCreation() {
  const testCases = [
    { nodeType: 'audience', isConfigured: true, shouldCreate: true },
    { nodeType: 'event', isConfigured: true, shouldCreate: true },
    { nodeType: 'audience', isConfigured: false, shouldCreate: false },
    { nodeType: 'unknown', isConfigured: true, shouldCreate: false }
  ];
  
  for (const testCase of testCases) {
    const mockNode = this.createMockNode(testCase);
    const result = this.createPreviewLineSync(mockNode);
    
    if (testCase.shouldCreate && !result.success) {
      console.error('预览线创建功能异常:', testCase);
    }
  }
}
```

### 4.2 保持事件响应能力

**事件处理验证**：

```javascript
// ✅ 确保事件处理功能正常
validateEventHandling() {
  // 模拟边删除事件
  const mockEdgeRemovedArgs = {
    edge: {
      getSourceCellId: () => 'test-node-1'
    }
  };
  
  // 验证事件标记功能
  this.graph.emit('edge:removed', mockEdgeRemovedArgs);
  
  if (!this.pendingUpdates.has('test-node-1')) {
    console.error('事件处理功能异常: 节点未被标记');
  }
  
  // 验证批量处理功能
  this.processMarkedNodes();
  
  if (this.pendingUpdates.size > 0) {
    console.error('批量处理功能异常: 节点未被处理');
  }
}
```

### 4.3 性能监控机制

**性能指标跟踪**：

```javascript
// ✅ 简化的性能监控
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      previewLineCreations: 0,
      eventProcessingTime: [],
      systemStateChanges: 0
    };
  }
  
  recordPreviewLineCreation() {
    this.metrics.previewLineCreations++;
  }
  
  recordEventProcessing(duration) {
    this.metrics.eventProcessingTime.push(duration);
    // 保持最近100次记录
    if (this.metrics.eventProcessingTime.length > 100) {
      this.metrics.eventProcessingTime.shift();
    }
  }
  
  getAverageEventProcessingTime() {
    const times = this.metrics.eventProcessingTime;
    return times.length > 0 ? times.reduce((a, b) => a + b) / times.length : 0;
  }
}
```

## 5. 预期效果验证

### 5.1 性能提升指标

**量化改进目标**：

* 移除 6 个复杂保护机制 → 减少 80% 的状态检查开销

* 消除异步递归调用 → 避免栈溢出风险

* 简化事件处理逻辑 → 提升 50% 的事件响应速度

* 统一状态管理 → 减少 60% 的内存使用

### 5.2 代码简化效果

**代码量减少**：

* 构造函数：从 150 行减少到 30 行（减少 80%）

* createPreviewLine：从 100 行减少到 20 行（减少 80%）

* 事件处理：从 80 行减少到 15 行（减少 81%）

* 总体代码量：预计减少 70% 的复杂保护代码

### 5.3 维护性改善

**调试友好性**：

* 移除复杂的递归保护逻辑，调试路径清晰

* 同步执行模式，错误堆栈信息准确

* 单一状态管理，状态变化可追踪

**可预测性**：

* 消除异步递归，执行顺序确定

* 幂等操作设计，重复调用安全

* 批量处理机制，性能可控

## 6. 实施风险控制

### 6.1 渐进式实施

**分阶段部署**：

1. **第一阶段**：移除保护机制，添加简单状态管理
2. **第二阶段**：重构事件处理，实现标记机制
3. **第三阶段**：重写核心方法，实现同步处理
4. **第四阶段**：添加性能监控，验证改进效果

### 6.2 回滚机制

**安全保障**：

```javascript
// ✅ 保留原有方法作为备用
class PreviewLineSystem {
  constructor(graph, options = {}) {
    // 新的简化实现
    this.initializeSimplified();
    
    // 保留原有实现作为备用（可配置启用）
    if (options.useLegacyMode) {
      this.initializeLegacy();
    }
  }
  
  createPreviewLine(node, config) {
    if (this.options.useLegacyMode) {
      return this.createPreviewLineLegacy(node, config);
    }
    return this.createPreviewLineSync(node, config);
  }
}
```

这个清除方案专注于解决实际代码中的递归调用问题，通过移除复杂的保护机制、消除异步递归调用、简化事件处理逻辑来实现系统的稳定性和可维护性提升。

## 3. 核心设计

### 3.1 事件处理去耦合

**新的事件处理模式**：

```javascript
// 简化后的事件处理
registerEventListeners() {
  if (this.graph && typeof this.graph.on === 'function') {
    // 只记录状态变更，不执行复杂操作
    this.graph.on('edge:removed', (args) => {
      const sourceNodeId = args?.edge?.getSourceCellId?.();
      if (sourceNodeId) {
        // 只标记需要更新，不立即执行
        this.markNodeForUpdate(sourceNodeId);
      }
    });
    
    // 统一的更新处理
    this.graph.on('render:done', () => {
      this.processMarkedNodes();
    });
  }
}
```

### 3.2 同步执行模式

**同步预览线创建**：

```javascript
createPreviewLine(node) {
  // 1. 验证输入
  if (!this.validateNode(node)) {
    return { success: false, reason: 'invalid_node' };
  }
  
  // 2. 检查是否已存在
  if (this.hasPreviewLine(node.id)) {
    return { success: true, reason: 'already_exists' };
  }
  
  // 3. 创建预览线
  const previewLine = this.renderer.createPreviewLine(node);
  
  // 4. 更新状态
  this.state.previewLines.set(node.id, previewLine);
  
  return { success: true, previewLine };
}
```

### 3.3 简化的错误处理

**统一错误处理机制**：

```javascript
handleError(error, context) {
  // 记录错误，不重试
  console.error(`[PreviewLineSystem] ${context}:`, error);
  
  // 更新系统状态
  this.state.systemState = 'error';
  this.state.lastError = { error, context, timestamp: Date.now() };
  
  // 触发错误事件（不递归）
  this.emit('system:error', { error, context });
}
```

### 3.4 统一的生命周期管理

**清晰的生命周期阶段**：

```javascript
class PreviewLineSystem {
  // 1. 初始化阶段
  async initialize() {
    this.state.systemState = 'initializing';
    this.initCoreModules();
    this.connectModules();
    this.state.systemState = 'ready';
  }
  
  // 2. 运行阶段
  processNode(node) {
    if (this.state.systemState !== 'ready') {
      return { success: false, reason: 'system_not_ready' };
    }
    return this.createPreviewLine(node);
  }
  
  // 3. 清理阶段
  destroy() {
    this.state.systemState = 'destroying';
    this.cleanupResources();
    this.state.systemState = 'destroyed';
  }
}
```

## 4. 实施计划

### 4.1 第一阶段：移除递归保护机制

**移除的代码**：

```javascript
// 删除这些复杂的保护机制
// this._isHandlingError = false;
// this._isCreatingPreviewLine = false;
// this._isHandlingEdgeRemoval = false;
// this._edgeRemovalGuard = new Set();
// this._createPreviewLineGuard = new Set();
```

**替换为简单状态**：

```javascript
// 简化为单一状态标记
this.systemState = 'idle'; // idle | processing | error
```

### 4.2 第二阶段：重构事件监听器

**当前问题代码**：

```javascript
this.graph.on('edge:removed', (args) => {
  // 复杂的递归保护逻辑
  // 异步的 setTimeout 调用
  // 可能触发新事件的操作
});
```

**重构后代码**：

```javascript
this.graph.on('edge:removed', (args) => {
  // 只记录状态，不执行操作
  const sourceNodeId = args?.edge?.getSourceCellId?.();
  if (sourceNodeId) {
    this.pendingUpdates.add(sourceNodeId);
  }
});
```

### 4.3 第三阶段：简化模块初始化流程

**新的初始化流程**：

```javascript
initialize() {
  // 1. 验证依赖
  this.validateDependencies();
  
  // 2. 初始化核心模块（同步）
  this.eventManager = new EventManager();
  this.stateManager = new StateManager();
  this.renderer = new PreviewLineRenderer();
  
  // 3. 建立连接（同步）
  this.connectModules();
  
  // 4. 注册事件（同步）
  this.registerEventListeners();
  
  // 5. 标记就绪
  this.systemState = 'ready';
}
```

### 4.4 第四阶段：统一预览线创建逻辑

**统一的创建接口**：

```javascript
// 唯一的预览线创建入口
createPreviewLineForNode(nodeId) {
  const node = this.graph.getCellById(nodeId);
  if (!node) return null;
  
  // 应用核心规则
  if (!CORE_RULES.PREVIEW_LINE_CREATION.condition(node)) {
    return null;
  }
  
  // 检查唯一性
  if (this.state.previewLines.has(nodeId)) {
    return this.state.previewLines.get(nodeId);
  }
  
  // 创建预览线
  const previewLine = this.renderer.createPreviewLine(node);
  this.state.previewLines.set(nodeId, previewLine);
  
  return previewLine;
}
```

## 5. 技术规范

### 5.1 禁用异步递归调用

**禁止使用的模式**：

```javascript
// ❌ 禁止：异步递归
setTimeout(() => {
  this.createPreviewLine(node);
}, 100);

// ❌ 禁止：Promise 链式递归
this.createPreviewLine(node)
  .then(() => this.createPreviewLine(anotherNode));
```

**推荐使用的模式**：

```javascript
// ✅ 推荐：同步处理
const result = this.createPreviewLine(node);
if (result.success) {
  this.updateNodeState(node.id, 'has_preview');
}
```

### 5.2 采用同步状态更新

**状态更新规范**：

```javascript
// 所有状态更新必须同步完成
updateNodeState(nodeId, newState) {
  const oldState = this.state.nodeStates.get(nodeId);
  this.state.nodeStates.set(nodeId, newState);
  
  // 同步触发状态变更事件
  this.emit('node:state:changed', { nodeId, oldState, newState });
}
```

### 5.3 实现幂等操作

**幂等性检查**：

```javascript
createPreviewLine(node) {
  // 幂等性检查
  const existing = this.state.previewLines.get(node.id);
  if (existing) {
    return { success: true, previewLine: existing, created: false };
  }
  
  // 创建新的预览线
  const previewLine = this.renderer.createPreviewLine(node);
  this.state.previewLines.set(node.id, previewLine);
  
  return { success: true, previewLine, created: true };
}
```

### 5.4 建立清晰的依赖关系

**依赖关系图**：

```
PreviewLineSystem
├── EventManager (核心依赖)
├── StateManager (核心依赖)
├── PreviewLineRenderer (功能依赖)
└── Graph (外部依赖)
```

**依赖注入规范**：

```javascript
constructor(dependencies) {
  // 验证必需依赖
  this.validateRequiredDependencies(dependencies);
  
  // 注入依赖
  this.graph = dependencies.graph;
  this.eventManager = dependencies.eventManager || new EventManager();
  this.stateManager = dependencies.stateManager || new StateManager();
}
```

## 6. 预期效果

### 6.1 性能提升

* 消除递归调用开销

* 减少内存使用

* 提高执行效率

### 6.2 代码简化

* 减少 70% 的保护机制代码

* 统一的错误处理逻辑

* 清晰的执行路径

### 6.3 维护性改善

* 易于调试和测试

* 可预测的行为

* 降低出错概率

### 6.4 稳定性增强

* 消除栈溢出风险

* 减少竞态条件

* 提高系统可靠性

