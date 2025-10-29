# TaskFlowCanvas 初始化顺序分析

## 当前初始化流程（完全串行化）

### 第1步：DOM准备
- 等待 `nextTick()` 确保DOM完全渲染
- 验证 `canvasContainer.value` 存在
- **错误处理**：DOM容器不存在时抛出错误，中断整个流程

### 第2步：基础系统组件初始化
- 调用 `initializeSystems()` 初始化不依赖Graph的基础组件
- **错误处理**：基础系统初始化失败时记录错误但不中断

### 第3步：画布和Graph实例创建
- 调用 `initCanvas()` 创建X6 Graph实例
- 验证Graph实例有效性（存在且有 `on` 方法）
- **错误处理**：Graph实例创建失败时抛出错误，中断整个流程

### 第4步：依赖Graph的系统组件初始化
- 调用 `initializeGraphDependentSystems(graph.value)` 
- 初始化PreviewLineSystem、UnifiedEdgeManager等
- **错误处理**：系统组件初始化失败时记录错误但不中断

### 第5步：系统状态验证
- 调用 `validateCanvasState()` 验证所有系统就绪
- **错误处理**：验证失败时记录警告但不中断

### 第6步：串行加载初始数据
#### 6.1 节点加载（完全串行）
```javascript
for (const nodeData of props.initialNodes) {
  // 验证Graph状态
  if (!graph?.value || !isGraphReady?.value) {
    throw new Error('Graph实例无效')
  }
  
  // 等待节点添加完成
  const addedNode = await addNodeToGraph(nodeData)
  if (!addedNode) {
    throw new Error(`节点添加失败: ${nodeData.id}`)
  }
  
  // 添加延迟确保节点完全加载
  await new Promise(resolve => setTimeout(resolve, 10))
}
```

#### 6.2 连接加载（完全串行）
```javascript
for (const connectionData of props.initialConnections) {
  // 严格验证节点存在性（最多重试3次）
  let sourceNode = null
  let targetNode = null
  let retryCount = 0
  
  while (retryCount < 3 && (!sourceNode || !targetNode)) {
    sourceNode = graph?.value?.getCellById(sourceNodeId)
    targetNode = graph?.value?.getCellById(targetNodeId)
    
    if (!sourceNode || !targetNode) {
      await new Promise(resolve => setTimeout(resolve, 100))
      retryCount++
    }
  }
  
  if (!sourceNode || !targetNode) {
    throw new Error('节点不存在')
  }
  
  // 等待连接创建完成
  const addedConnection = await addConnectionToGraph(connectionData)
  if (!addedConnection) {
    throw new Error('连接创建失败')
  }
  
  // 添加延迟确保连接完全加载
  await new Promise(resolve => setTimeout(resolve, 10))
}
```

### 第7步：画布居中和适应内容
- 调用 `graph.value.centerContent()`
- 调用 `graph.value.zoomToFit()`
- **错误处理**：失败时记录警告但不中断

### 第8步：触发就绪事件
- 发出 `canvas-ready` 事件
- 标记完全串行化初始化完成

### 第9步：服务层初始化
- 调用 `initializeServices()` 初始化服务层
- **错误处理**：服务层初始化失败不阻止画布使用

## 错误处理机制

### 关键错误（中断流程）
1. **DOM容器不存在** - 第1步
2. **Graph实例创建失败** - 第3步  
3. **节点添加失败** - 第6步
4. **连接创建失败** - 第6步

### 非关键错误（记录但不中断）
1. **基础系统初始化失败** - 第2步
2. **依赖Graph系统初始化失败** - 第4步
3. **系统状态验证失败** - 第5步
4. **画布居中失败** - 第7步
5. **服务层初始化失败** - 第9步

### 错误恢复机制
```javascript
} catch (error) {
  console.error('[TaskFlowCanvas] 组件初始化失败:', error)
  Message.error(`画布初始化失败: ${error.message}`)
  
  // 重置状态
  isGraphReady.value = false
  if (state?.isInitializing) {
    state.isInitializing.value = false
  }
  
  // 清理资源
  try {
    if (graph?.value) {
      graph.value.dispose()
      graph.value = null
    }
  } catch (cleanupError) {
    console.error('[TaskFlowCanvas] 清理资源失败:', cleanupError)
  }
}
```

## 串行化保证

### 1. 完全串行的节点加载
- 使用 `for...of` 循环而非 `forEach` 或 `map`
- 每个节点都等待 `await addNodeToGraph(nodeData)` 完成
- 节点添加失败立即抛出错误，中断后续操作

### 2. 完全串行的连接加载  
- 使用 `for...of` 循环
- 每个连接都等待 `await addConnectionToGraph(connectionData)` 完成
- 连接创建失败立即抛出错误，中断后续操作

### 3. 严格的状态验证
- 每步操作前都验证前置条件
- Graph实例状态检查：`!graph?.value || !isGraphReady?.value`
- 节点存在性检查：重试机制确保节点已创建

### 4. 延迟机制确保完全加载
- 节点添加后：`await new Promise(resolve => setTimeout(resolve, 10))`
- 连接添加后：`await new Promise(resolve => setTimeout(resolve, 10))`
- 连接加载前：`await new Promise(resolve => setTimeout(resolve, 100))`

## 修复的关键问题

### 1. 变量初始化顺序错误
**问题**：`addNodeToGraph` 函数中对象字面量引用 `nodeData` 导致初始化顺序错误
**修复**：先提取字段到局部变量，避免循环引用

### 2. 错误处理不完整
**问题**：节点/连接添加失败后仍继续执行后续步骤
**修复**：失败时立即抛出错误，中断整个初始化流程

### 3. 并行操作风险
**问题**：可能存在并发执行导致的竞态条件
**修复**：确保所有操作都是严格串行执行，使用 `for...of` + `await`

### 4. 资源清理不完整
**问题**：初始化失败时没有正确清理已创建的资源
**修复**：在catch块中添加完整的资源清理逻辑