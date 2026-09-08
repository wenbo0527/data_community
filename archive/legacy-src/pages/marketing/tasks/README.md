# 营销任务流程画布系统 - 代码结构设计说明

## 项目概述

本项目是一个基于 Vue 3 + AntV X6 的营销任务流程画布系统，用于创建、编辑和管理营销自动化流程。系统采用模块化架构，将功能按照职责清晰分离。

## 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **图形引擎**: AntV X6
- **状态管理**: Vuex
- **路由管理**: Vue Router
- **UI组件**: Arco Design
- **开发语言**: JavaScript + TypeScript

## 目录结构

```
src/pages/marketing/tasks/
├── components/           # 组件目录
├── composables/         # 组合式函数目录
├── utils/              # 工具类目录
├── create.vue          # 创建任务页面
├── index.vue           # 任务列表页面
├── task-editor.vue     # 任务编辑页面
└── README.md           # 本文档
```

## 核心架构

### 1. 页面层 (Pages)

#### index.vue - 任务列表页面
- **功能**: 展示所有营销任务，支持创建、编辑、删除操作
- **依赖**: TaskStorage 工具类
- **特性**: 响应式列表、搜索过滤、批量操作

#### create.vue - 任务创建页面
- **功能**: 创建新的营销任务流程
- **核心组件**: TaskFlowCanvas
- **验证**: canvasValidation, enhancedCanvasValidation
- **特性**: 实时预览、数据验证、自动保存

#### task-editor.vue - 任务编辑页面
- **功能**: 编辑现有营销任务流程
- **核心组件**: TaskFlowCanvas
- **验证**: enhancedCanvasValidation
- **特性**: 版本控制、实时协作、历史记录

### 2. 组件层 (Components)

#### 核心画布组件

**TaskFlowCanvas.vue** - 主画布组件
- **职责**: 流程图绘制、节点管理、连线管理
- **依赖**: 所有 composables 和 utils
- **特性**: 拖拽支持、实时预览、撤销重做

**TaskFlowConfigDrawers.vue** - 配置抽屉容器
- **职责**: 统一管理所有节点配置抽屉
- **包含**: 所有节点类型的配置抽屉

#### 节点配置抽屉组件

所有节点配置抽屉都继承自 `BaseDrawer.vue`，提供统一的UI和交互模式：

- **StartNodeConfigDrawer.vue** - 开始节点配置
- **CrowdSplitNodeConfigDrawer.vue** - 人群分流节点配置
- **EventSplitNodeConfigDrawer.vue** - 事件分流节点配置
- **ABTestNodeConfigDrawer.vue** - A/B测试节点配置
- **AICallNodeConfigDrawer.vue** - AI调用节点配置
- **SMSNodeConfigDrawer.vue** - 短信发送节点配置
- **ManualCallNodeConfigDrawer.vue** - 人工外呼节点配置
- **WaitNodeConfigDrawer.vue** - 等待节点配置
- **BenefitNodeConfigDrawer.vue** - 权益发放节点配置

#### 辅助组件

- **ConnectionContextMenu.vue** - 连线右键菜单
- **QueryModePanel.vue** - 查询模式面板
- **StatisticsModePanel.vue** - 统计模式面板
- **BaseDrawer.vue** - 抽屉基础组件

### 3. 组合式函数层 (Composables)

采用 Composition API 模式，将画布功能按职责分离：

#### useCanvasNodes.js - 节点管理
- **功能**: 节点的增删改查、拖拽处理
- **导出**: nodes, addNodeToGraph, updateNode, deleteNode, duplicateNode

#### useCanvasConnections.js - 连线管理
- **功能**: 连线的创建、更新、删除、验证
- **导出**: connections, addConnectionToGraph, updateConnection, deleteConnection

#### useCanvasDragDrop.js - 拖拽功能
- **功能**: 节点拖拽、画布拖拽、拖拽预览
- **导出**: isDragging, dragNodeType, setupDragDrop

#### useCanvasSelection.js - 选择管理
- **功能**: 节点选择、连线选择、工具栏显示
- **导出**: selectedNodeId, selectedConnectionId, setupSelection

#### useCanvasHistory.js - 历史记录
- **功能**: 撤销重做、历史面板、状态保存
- **导出**: canvasHistory, saveHistoryState, handleHistoryRestore

#### useCanvasMinimap.js - 小地图
- **功能**: 小地图显示、导航、缩放控制
- **导出**: showMinimap, setupMinimap

#### useCanvasExport.js - 导出功能
- **功能**: 图片导出、JSON导出、数据导出
- **导出**: exportCanvas, exportAsImage, exportAsJSON

### 4. 工具类层 (Utils)

#### 核心工具类

**GraphOperationUtils.js** - 图形操作工具
- **功能**: 图形基础操作、坐标转换、布局计算
- **依赖**: idGenerator, StyleConfig, ErrorHandler

**DataTransformUtils.js** - 数据转换工具
- **功能**: 数据格式转换、验证、序列化
- **依赖**: ErrorHandler

**UnifiedPreviewLineManager.js** - 预览线管理
- **功能**: 连线预览、拖拽辅助线、视觉反馈

#### 辅助工具类

**ErrorHandler.js** - 错误处理
- **功能**: 统一错误处理、日志记录、用户提示

**EventManagerBase.js** - 事件管理
- **功能**: 事件监听、事件分发、生命周期管理
- **依赖**: ErrorHandler

**StyleConfig.js** - 样式配置
- **功能**: 主题配置、样式常量、动态样式

**idGenerator.js** - ID生成器
- **功能**: 唯一ID生成、UUID生成

#### 业务工具类

**taskStorage.js** - 任务存储
- **功能**: 任务数据的本地存储、导入导出

**canvasValidation.js** - 画布验证
- **功能**: 基础数据验证、格式检查

**enhancedCanvasValidation.js** - 增强验证
- **功能**: 业务逻辑验证、发布前检查
- **依赖**: canvasValidation

## 数据流架构

### 1. 数据流向

```
用户操作 → 组件事件 → Composables处理 → Utils执行 → 状态更新 → 视图更新
```

### 2. 状态管理

- **本地状态**: 使用 Vue 3 的 ref/reactive 管理组件内部状态
- **共享状态**: 通过 Composables 在组件间共享状态
- **持久化**: 使用 TaskStorage 进行本地存储

### 3. 事件系统

- **组件事件**: 使用 Vue 的 emit 系统
- **画布事件**: 通过 AntV X6 的事件系统
- **自定义事件**: 通过 EventManagerBase 管理

## 设计原则

### 1. 单一职责原则
- 每个组件、Composable、工具类都有明确的单一职责
- 避免功能耦合，提高代码可维护性

### 2. 依赖倒置原则
- 高层模块不依赖低层模块，都依赖抽象
- 通过接口和抽象类定义契约

### 3. 开闭原则
- 对扩展开放，对修改关闭
- 新增节点类型时无需修改现有代码

### 4. 组合优于继承
- 使用 Composition API 进行功能组合
- 通过 Composables 实现代码复用

## 扩展指南

### 1. 添加新节点类型

1. 在 `components/` 目录下创建新的配置抽屉组件
2. 继承 `BaseDrawer.vue` 实现统一接口
3. 在 `TaskFlowConfigDrawers.vue` 中注册新组件
4. 更新相关的验证逻辑

### 2. 添加新功能

1. 创建对应的 Composable 函数
2. 在 `utils/` 目录下添加必要的工具类
3. 在主画布组件中集成新功能
4. 添加相应的测试用例

### 3. 性能优化

1. 使用 `computed` 缓存计算结果
2. 使用 `watchEffect` 进行响应式更新
3. 合理使用 `nextTick` 处理DOM更新
4. 避免不必要的重新渲染

## 最佳实践

### 1. 代码组织
- 按功能模块组织代码
- 保持文件大小适中（< 500行）
- 使用清晰的命名约定

### 2. 错误处理
- 统一使用 ErrorHandler 处理错误
- 提供用户友好的错误提示
- 记录详细的错误日志

### 3. 性能监控
- 监控组件渲染性能
- 优化大数据量场景
- 合理使用防抖和节流

### 4. 测试策略
- 单元测试覆盖工具类
- 组件测试覆盖UI交互
- 集成测试覆盖业务流程

## 版本历史

- **v1.0.0**: 初始版本，基础画布功能
- **v1.1.0**: 添加节点配置系统
- **v1.2.0**: 完善验证和错误处理
- **v1.3.0**: 优化性能和用户体验
- **v2.0.0**: 重构为模块化架构（当前版本）

---

## 横版营销画布（原型）

- 页面入口：`/marketing/tasks/horizontal`，菜单配置见 `src/config/menuConfig.js`（键 `marketing-tasks-horizontal`）。
- 路由映射：`src/router/marketing.js:136` 指向 `../pages/marketing/tasks/horizontal/index.vue`。
- 页面路径：`src/pages/marketing/tasks/horizontal/index.vue`。
- 数据契约：完全兼容原版画布的 `CanvasData = { nodes, connections }`，导入/导出接口与原版一致。
- 交互规则：仅允许 `out → in`（目标在右侧）、同一端口单连接、连接线右键删除、连接线上“+”插入节点、节点点击打开抽屉。
- 关键实现：
  - 连接校验：`src/pages/marketing/tasks/horizontal/index.vue:133`。
  - 连接线右键删除：`src/pages/marketing/tasks/horizontal/index.vue:202`。
  - 节点点击打开抽屉：`src/pages/marketing/tasks/horizontal/index.vue:223,226`，抽屉系统：`src/pages/marketing/tasks/composables/canvas/useConfigDrawers.js:84,201,315`。
  - 横向端口工厂：`src/pages/marketing/tasks/horizontal/utils/portConfigFactoryHorizontal.js:6,21`。
- 设计文档：`/.trae/documents/营销画布 - 横版工作流版本前端优化需求文档.md`（持续更新版）。

*本文档会随着项目的发展持续更新，请定期查看最新版本。*