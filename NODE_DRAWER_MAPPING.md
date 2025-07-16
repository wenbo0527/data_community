# 节点抽屉配置映射

本文档说明了TaskFlow中各个节点类型对应的配置抽屉组件映射关系。

## 节点类型与抽屉组件映射

| 节点类型 | 抽屉类型 | 抽屉组件文件 | 说明 |
|---------|---------|-------------|------|
| `start` | `start` | `StartNodeConfigDrawer.vue` | 开始节点配置抽屉 |
| `audience-split` | `crowd-split` | `CrowdSplitNodeConfigDrawer.vue` | 人群分流节点配置抽屉 |
| `event-split` | `event-split` | `EventSplitNodeConfigDrawer.vue` | 事件分流节点配置抽屉 |
| `ai-call` | `ai-call` | `AICallNodeConfigDrawer.vue` | AI外呼节点配置抽屉 |
| `sms` | `sms` | `SMSNodeConfigDrawer.vue` | 短信节点配置抽屉 |
| `manual-call` | `manual-call` | `ManualCallNodeConfigDrawer.vue` | 人工外呼节点配置抽屉 |
| `ab-test` | `ab-test` | `ABTestNodeConfigDrawer.vue` | AB测试节点配置抽屉 |
| `wait` | `wait` | `WaitNodeConfigDrawer.vue` | 等待节点配置抽屉 |

## 配置文件位置

### 核心配置文件
- **抽屉管理逻辑**: `/src/composables/useConfigDrawers.js`
- **抽屉组件统一管理**: `/src/pages/marketing/tasks/components/TaskFlowConfigDrawers.vue`
- **节点类型配置**: `/src/utils/nodeTypes.js`

### 抽屉组件文件
所有抽屉组件都位于 `/src/pages/marketing/tasks/components/` 目录下：

```
├── StartNodeConfigDrawer.vue          # 开始节点配置抽屉
├── CrowdSplitNodeConfigDrawer.vue     # 人群分流节点配置抽屉
├── EventSplitNodeConfigDrawer.vue     # 事件分流节点配置抽屉
├── AICallNodeConfigDrawer.vue         # AI外呼节点配置抽屉
├── SMSNodeConfigDrawer.vue            # 短信节点配置抽屉
├── ManualCallNodeConfigDrawer.vue     # 人工外呼节点配置抽屉
├── ABTestNodeConfigDrawer.vue         # AB测试节点配置抽屉
└── WaitNodeConfigDrawer.vue           # 等待节点配置抽屉
```

## 工作流程

1. **节点点击**: 用户点击节点时，系统根据节点类型调用对应的抽屉
2. **类型映射**: `useConfigDrawers.js` 中的 `getDrawerType()` 函数负责将节点类型映射到抽屉类型
3. **抽屉显示**: `TaskFlowConfigDrawers.vue` 根据抽屉状态显示对应的抽屉组件
4. **配置处理**: 用户确认配置后，对应的处理函数更新节点数据

## 添加新节点类型的步骤

1. 在 `nodeTypes.js` 中添加新的节点类型配置
2. 创建对应的抽屉组件文件 (如 `NewNodeConfigDrawer.vue`)
3. 在 `useConfigDrawers.js` 中：
   - 添加抽屉状态定义
   - 更新 `getDrawerType()` 映射
   - 添加配置处理函数
4. 在 `TaskFlowConfigDrawers.vue` 中：
   - 导入新的抽屉组件
   - 添加抽屉模板

## 注意事项

- 确保节点类型名称与抽屉类型映射一致
- 所有抽屉组件都应该实现统一的事件接口 (`confirm`, `cancel`)
- 抽屉组件应该接收 `visible` 和 `node-data` 属性
- 配置数据的处理逻辑应该在对应的处理函数中实现

## 更新记录

- 2024-12-31: 完善了节点抽屉配置映射，确保所有节点类型都有对应的抽屉组件
- 添加了 `ManualCallNodeConfigDrawer` 组件的完整配置
- 更新了映射关系的注释说明