# 事件分流节点配置抽屉测试指南

## 问题描述
事件分流节点点击后没有弹出配置抽屉，日志显示抽屉被打开后立即关闭。

## 修复内容

### 1. 修复了 EventSplitNodeConfigDrawer.vue 组件
- **问题**: 组件内部定义了本地的 `visible` ref，没有正确同步 props 中的 `visible`
- **修复**: 使用 `:visible="props.visible"` 直接绑定 props，移除了本地的 visible ref
- **增强**: 完善了事件分流节点的配置功能，包括：
  - 节点名称配置
  - 事件类型选择（点击、浏览、购买、注册、登录、自定义）
  - 自定义事件名称
  - 事件条件配置
  - 分支标签自定义（是/否分支）
  - 超时设置

### 2. 增强了调试日志
- 在 `useConfigDrawers.js` 中添加了详细的调试日志
- 可以追踪抽屉打开/关闭的完整流程
- 包含调用堆栈信息，便于定位问题

## 测试步骤

### 1. 基本功能测试
1. 打开任务创建页面：`http://localhost:5174/marketing/tasks/create`
2. 从左侧节点面板拖拽"事件分流"节点到画布
3. 点击事件分流节点
4. 验证配置抽屉是否正常弹出

### 2. 配置功能测试
1. 在配置抽屉中填写以下信息：
   - **节点名称**: 自定义名称（如"用户点击检测"）
   - **事件类型**: 选择一个事件类型
   - **事件条件**: 填写触发条件（可选）
   - **分支标签**: 自定义"是"和"否"分支的标签
   - **超时设置**: 设置等待时间（分钟）

2. 点击"确定"按钮
3. 验证配置是否保存成功
4. 重新点击节点，验证配置是否正确回显

### 3. 自定义事件测试
1. 在事件类型中选择"自定义事件"
2. 验证"自定义事件名称"字段是否出现
3. 填写自定义事件名称
4. 验证表单验证是否正常工作

### 4. 表单验证测试
1. 不选择事件类型，直接点击"确定"
2. 验证是否显示验证错误信息
3. 选择"自定义事件"但不填写事件名称
4. 验证是否显示相应的验证错误

## 预期结果

### 正常情况
- 点击事件分流节点后，配置抽屉应该正常弹出
- 抽屉标题显示"事件分流节点配置"
- 所有表单字段正常显示和交互
- 配置保存后抽屉关闭，节点显示配置的名称

### 日志输出
正常情况下，控制台应该显示类似以下的日志：
```
[useConfigDrawers] 开始打开配置抽屉 - 节点类型: event-split, 节点ID: node_xxx
[useConfigDrawers] 映射后的抽屉类型: event-split
[useConfigDrawers] 当前抽屉状态: {drawerType: "event-split", visible: false, hasData: false, hasInstance: false}
[useConfigDrawers] 关闭其他抽屉...
[useConfigDrawers] 设置抽屉状态为可见...
[useConfigDrawers] 打开配置抽屉完成: event-split, 节点ID: node_xxx
[useConfigDrawers] 最终抽屉状态: {visible: true, dataKeys: [...], instanceId: "node_xxx"}
```

## 故障排除

### 如果抽屉仍然不显示
1. 检查控制台是否有错误信息
2. 确认 EventSplitNodeConfigDrawer.vue 组件是否正确导入
3. 检查 TaskFlowConfigDrawers.vue 中的事件分流抽屉配置
4. 验证 drawerStates 中的 'event-split' 状态是否正确

### 如果抽屉立即关闭
1. 查看调试日志中的调用堆栈
2. 检查是否有重复的事件监听
3. 确认没有其他代码意外调用 closeConfigDrawer

## 技术细节

### 组件结构
```
TaskFlowCanvas.vue
├── TaskFlowConfigDrawers.vue
    └── EventSplitNodeConfigDrawer.vue
```

### 数据流
1. 用户点击节点 → TaskFlowCanvas.vue 监听 'node:click' 事件
2. 调用 configDrawers.openConfigDrawer(nodeType, node, data)
3. useConfigDrawers.js 更新 drawerStates['event-split'].visible = true
4. TaskFlowConfigDrawers.vue 响应状态变化，显示 EventSplitNodeConfigDrawer.vue
5. 用户配置完成后，触发 confirm 事件，调用 handleEventSplitNodeConfig

### 关键修复点
- **Props 绑定**: 使用 `:visible="props.visible"` 而不是 `v-model:visible="visible"`
- **事件处理**: 正确处理 @cancel 和 @close 事件
- **数据同步**: 通过 watch 监听 nodeData 变化，正确初始化表单数据