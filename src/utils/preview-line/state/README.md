# 预览线状态管理模块

本模块提供了完整的状态管理和状态同步功能，包括 `StateManager` 状态管理器和 `StateSynchronizer` 状态同步器。

## 模块结构

```
src/utils/preview-line/state/
├── StateManager.js      # 状态管理器
├── StateSynchronizer.js # 状态同步器
├── index.js            # 模块入口和工厂函数
├── test-state-module.js # 测试文件
└── README.md           # 使用文档
```

## 快速开始

### 基本使用

```javascript
import { createStateSystem } from './state/index.js';

// 创建完整的状态系统
const stateSystem = createStateSystem({
  // StateManager 配置
  stateManager: {
    enableHistory: true,
    maxHistorySize: 100,
    enablePersistence: false
  },
  // StateSynchronizer 配置
  synchronizer: {
    enableSync: true,
    syncInterval: 100,
    enableBroadcast: false
  }
});

// 使用状态管理
stateSystem.setState('user.name', 'John');
const userName = stateSystem.getState('user.name');

// 订阅状态变化
stateSystem.subscribe('user.*', (changes) => {
  console.log('用户状态变化:', changes);
});
```

### 单独使用 StateManager

```javascript
import { createStateManager } from './state/index.js';

const stateManager = createStateManager({
  enableHistory: true,
  maxHistorySize: 50,
  enableValidation: true
});

// 设置状态
stateManager.setState('app.theme', 'dark');
stateManager.setState({
  user: { id: 1, name: 'Alice' },
  settings: { language: 'zh-CN' }
});

// 获取状态
const theme = stateManager.getState('app.theme');
const user = stateManager.getState('user');

// 订阅状态变化
const unsubscribe = stateManager.subscribe('user.name', (newName, oldName) => {
  console.log(`用户名从 ${oldName} 变更为 ${newName}`);
});

// 批量更新
stateManager.batchUpdate(() => {
  stateManager.setState('user.name', 'Bob');
  stateManager.setState('user.age', 25);
});

// 历史记录操作
stateManager.undo(); // 撤销
stateManager.redo(); // 重做
```

### 单独使用 StateSynchronizer

```javascript
import { createStateSynchronizer } from './state/index.js';

const synchronizer = createStateSynchronizer({
  enableSync: true,
  syncInterval: 200,
  conflictResolution: 'last-write-wins'
});

// 注册连接
synchronizer.registerConnection('component-a', componentA, {
  priority: 'high',
  strategy: 'incremental'
});

synchronizer.registerConnection('component-b', componentB, {
  priority: 'normal',
  strategy: 'batch'
});

// 同步状态
await synchronizer.syncState('component-a', {
  data: { count: 10 },
  timestamp: Date.now()
});

// 广播消息
synchronizer.broadcast({
  type: 'notification',
  message: 'Hello World'
});
```

## API 参考

### StateManager

#### 构造函数选项

```javascript
const options = {
  enableHistory: true,        // 启用历史记录
  maxHistorySize: 100,       // 最大历史记录数
  enablePersistence: false,   // 启用持久化
  persistenceKey: 'state',   // 持久化键名
  enableSync: true,          // 启用同步
  syncDebounce: 100,         // 同步防抖时间
  enableValidation: true,    // 启用验证
  strictMode: false,         // 严格模式
  enableBatching: true,      // 启用批处理
  batchSize: 50             // 批处理大小
};
```

#### 主要方法

- `setState(pathOrState, value, options)` - 设置状态
- `getState(path)` - 获取状态
- `subscribe(pathOrCallback, callback, options)` - 订阅状态变化
- `unsubscribe(id)` - 取消订阅
- `batchUpdate(callback)` - 批量更新
- `undo()` - 撤销操作
- `redo()` - 重做操作
- `reset()` - 重置状态
- `getStats()` - 获取统计信息

### StateSynchronizer

#### 构造函数选项

```javascript
const options = {
  enableSync: true,              // 启用同步
  syncInterval: 100,            // 同步间隔
  maxSyncRetries: 3,           // 最大重试次数
  syncTimeout: 5000,           // 同步超时时间
  enableBroadcast: false,      // 启用广播
  broadcastChannel: 'sync',    // 广播频道
  conflictResolution: 'last-write-wins', // 冲突解决策略
  enableBatching: true,        // 启用批处理
  batchSize: 50,              // 批处理大小
  enableDebug: false,         // 启用调试
  enableLogging: true         // 启用日志
};
```

#### 主要方法

- `registerConnection(id, target, options)` - 注册连接
- `unregisterConnection(id)` - 注销连接
- `syncState(source, data, options)` - 同步状态
- `broadcast(data, options)` - 广播消息
- `startSyncLoop()` - 启动同步循环
- `stopSyncLoop()` - 停止同步循环
- `getStats()` - 获取统计信息
- `reset()` - 重置同步器

## 事件系统

### 状态事件

```javascript
// 监听状态变化
stateManager.eventManager.on('state:changed', (event) => {
  console.log('状态变化:', event.path, event.newValue, event.oldValue);
});

// 监听状态错误
stateManager.eventManager.on('state:error', (event) => {
  console.error('状态错误:', event.error);
});
```

### 同步事件

```javascript
// 监听同步完成
synchronizer.eventManager.on('sync:completed', (event) => {
  console.log('同步完成:', event.operation);
});

// 监听冲突检测
synchronizer.eventManager.on('conflict:detected', (event) => {
  console.log('检测到冲突:', event.conflict);
});
```

## 最佳实践

### 1. 状态结构设计

```javascript
// 推荐的状态结构
const initialState = {
  // 应用级状态
  app: {
    theme: 'light',
    language: 'zh-CN',
    isLoading: false
  },
  
  // 用户状态
  user: {
    id: null,
    name: '',
    preferences: {}
  },
  
  // 预览线状态
  previewLines: {
    nodes: new Map(),
    connections: new Map(),
    rendering: {
      isRendering: false,
      renderQueue: []
    }
  }
};
```

### 2. 订阅模式

```javascript
// 使用通配符订阅
stateManager.subscribe('user.*', (changes) => {
  // 监听所有用户相关状态变化
});

// 订阅特定路径
stateManager.subscribe('app.theme', (newTheme) => {
  // 主题变化时更新UI
  updateTheme(newTheme);
});

// 订阅所有变化
stateManager.subscribe('*', (changes) => {
  // 全局状态变化监听
});
```

### 3. 批量更新

```javascript
// 避免多次触发订阅
stateManager.batchUpdate(() => {
  stateManager.setState('user.name', 'John');
  stateManager.setState('user.age', 30);
  stateManager.setState('user.email', 'john@example.com');
});
```

### 4. 错误处理

```javascript
// 添加验证器
stateManager.addValidator('user.email', (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('无效的邮箱格式');
  }
  return true;
});

// 监听错误
stateManager.eventManager.on('state:error', (event) => {
  console.error('状态验证失败:', event.error.message);
  // 显示用户友好的错误信息
});
```

### 5. 性能优化

```javascript
// 启用批处理和防抖
const stateManager = createStateManager({
  enableBatching: true,
  batchSize: 100,
  syncDebounce: 50
});

// 使用浅比较避免不必要的更新
stateManager.subscribe('largeObject', (newValue, oldValue) => {
  // 只在真正变化时处理
}, { shallow: true });
```

## 测试

运行测试文件验证功能：

```bash
cd src/utils/preview-line/state
node test-state-module.js
```

测试覆盖了以下功能：
- StateManager 基本操作
- StateSynchronizer 连接和同步
- 完整状态系统集成
- 错误处理和边界情况

## 注意事项

1. **内存管理**: 及时取消不需要的订阅，避免内存泄漏
2. **循环依赖**: 避免在状态变化回调中直接修改相关状态
3. **异步操作**: 状态同步是异步的，注意处理 Promise
4. **数据克隆**: 状态数据会被深度克隆，避免直接修改返回的状态对象
5. **性能考虑**: 大量频繁的状态更新建议使用批处理模式

## 迁移指南

如果你之前使用的是旧的预览线管理器中的状态管理功能，可以按以下步骤迁移：

1. 替换导入路径：
```javascript
// 旧的方式
import { PreviewLineManager } from './core/PreviewLineManager.js';

// 新的方式
import { createStateSystem } from './state/index.js';
```

2. 更新初始化代码：
```javascript
// 旧的方式
const manager = new PreviewLineManager(config);

// 新的方式
const stateSystem = createStateSystem(config);
```

3. 更新方法调用：
```javascript
// 状态操作保持不变
stateSystem.setState('path', value);
const state = stateSystem.getState('path');

// 订阅方式保持不变
stateSystem.subscribe('path', callback);
```

通过这种方式，你可以获得更好的模块化、更强的功能和更好的性能。