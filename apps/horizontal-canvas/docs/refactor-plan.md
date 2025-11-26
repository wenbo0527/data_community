# 横版画布重构方案（单一功能原则）

## 项目结构摘要
- 技术栈：Vue 3、Vite、Arco Design、AntV X6、x6-vue-shape、Vue Router
- 路由：`src/router.ts` → `/marketing/tasks/horizontal` 为核心画布页
- 关键页面：
  - 任务列表：`src/pages/marketing/tasks/index.vue`、`src/pages/tasks/TasksList.vue`
  - 横版画布：`src/pages/marketing/tasks/horizontal/index.vue`
- 组件：工具栏、历史、调试、统计、节点类型选择器、BaseNode/HorizontalNode、配置抽屉
- 服务与工具：CanvasController、EventService、TaskStorage、NodeTypes、PortConfigFactoryHorizontal、QuickLayout、PerformanceMonitor
- 组合式：useConfigDrawers、useCanvasHistory、useStructuredLayout、useGraphInstance、usePreviewLine、usePortValidation
- 样式与视觉：`styles/nodeStyles.js`

## 重构目标
- 页面对齐“容器与装配”职责：仅负责路由参数解析、UI装配和事件转发
- 业务逻辑服务化：图操作、布局、节点更新、持久化、状态管理全部抽出到服务/组合式
- 统一更新路径：节点尺寸/端口/数据写回统一走 NodeService
- 可测试性提升：服务与组合式函数具备明确 API，易于单测与集成测试

## 重构原则
- 单一职责：每个模块只做一件事
- 接口稳定：服务接口清晰、可复用
- 先测后改：优先补齐单元与集成测试
- 渐进迁移：分批抽取，不影响现有功能

## 模块拆分方案

### 页面层（保留）
- `HorizontalTaskFlowPage.vue`（现 `index.vue`）
  - 职责：装配 UI、路由参数解析、将交互事件转发到控制器/服务
  - 不直接做图/布局/持久化逻辑

### 控制器（保留）
- `CanvasController`
  - 职责：协调页面事件 → EventService → 服务调用
  - 依赖注入：readOnly、isStatisticsMode、openConfigDrawer 等

### 服务层（新增/重组）
- GraphService
  - 职责：图实例创建、插件注册、连接策略、节点/边 CRUD、选择/居中、缩放、Minimap
  - 迁移来源：
    - 图初始化与插件：`index.vue:952–1217`
    - 连接策略：`index.vue:1130–1217`（`validateConnection`/`validateMagnet`）
    - 删除级联：`index.vue:2324–2335`
    - 预览图管理：`index.vue:3407–3461`
- LayoutService
  - 职责：快速布局与结构化布局统一入口，布局后边顶点清理
  - 迁移来源：
    - 快速布局：`index.vue:3484–3560`
    - 结构化布局：`index.vue:1491–1513`
    - 边顶点清理：`index.vue:3518–3523`
- NodeService
  - 职责：节点创建规格、统一更新（尺寸、端口映射、数据写回）、起始节点保障
  - 迁移来源：
    - 统一更新：`index.vue:2167–2275`
    - 旧版更新：`index.vue:1938–2165`（合并或废弃）
    - 端口工厂：`portConfigFactoryHorizontal.js:1–78`
    - 起始节点：`index.vue:1812–1830`
- PersistenceService（或 TaskService）
  - 职责：画布数据采集、加载、保存、发布、发布校验
  - 迁移来源：
    - 采集：`index.vue:3606–3672`
    - 加载：`index.vue:3773–3934`
    - 保存/发布：`index.vue:3936–4018, 4020–4108`
    - 发布校验：`index.vue:4110–4218`
    - 结合 `TaskStorage.js`
- EventService（保留现实现）
  - 职责：Graph 事件绑定、菜单区域识别、只读/统计模式处理、抽屉打开
  - 文件：`pages/marketing/tasks/horizontal/services/EventService.js`
- StateService（或 `useCanvasState` 组合式）
  - 职责：UI 状态与联动（统计面板尺寸、停靠范围、缩放显示、Minimap 显隐、历史/统计开关）
  - 迁移来源：
    - 统计停靠：`index.vue:312–327, 1484–1487`
    - 显示状态：`index.vue` 内相关 refs/watchers
- PreviewLineService（预留）
  - 职责：封装预览线 CRUD/样式/验证接口，集成 `PreviewLineSystem.js`

## API 轮廓（草案）
- GraphService
  - `create(containerEl, options): Graph`
  - `zoomIn/zoomOut/zoomTo/centerContent/toggleMinimap`
  - `addNode(spec)/removeNode(id)/addEdge(spec)/removeEdge(id)`
  - `deleteNodeCascade(id)`
  - `bindConnectionPolicies(policies)`
- LayoutService
  - `applyQuickLayout(graph, options)`
  - `applyStructuredLayout(graph, options)`
  - `cleanupEdgeVertices(graph)`
- NodeService
  - `createNodeSpec(nodeType, config, pos)`
  - `updateNodeUnified(graph, node, nodeType, config)`
  - `ensureStartNode(graph)`
- PersistenceService
  - `collectCanvasData(graph)`
  - `loadCanvasData(graph, canvasData)`
  - `saveTask(taskMeta, canvasData)`
  - `publishTask(taskMeta, canvasData)`
  - `validateForPublish(graph, canvasData)`
- StateService（组合式）
  - `useCanvasState(): { refs..., updateDebugDockBounds, updateStatisticsPanelTop }`
- EventService（现有）
  - `bindGraphEvents(graph)`

## 目录结构建议
```
src/
  pages/
    marketing/tasks/horizontal/
      index.vue                    # 仅装配与转发
      HorizontalNode.vue
      services/
        CanvasController.js
        EventService.js            # 保留
      graph/
        GraphService.ts
        connectionPolicies.ts
      layout/
        LayoutService.ts
      node/
        NodeService.ts
        portConfigFactoryHorizontal.js
      persistence/
        PersistenceService.ts
      state/
        useCanvasState.ts
  components/
    toolbar/CanvasToolbar.vue
    history/CanvasHistoryPanel.vue
    debug/CanvasDebugPanel.vue
    statistics/CanvasStatisticsPanel.vue
    canvas/NodeTypeSelector.vue
    nodes/BaseNode.vue
  composables/
    canvas/useConfigDrawers.js
    canvas/useCanvasHistory.js
    canvas/useStructuredLayout.js
    useGraphInstance.js
  utils/
    taskStorage.js
    nodeTypes.js
    preview-line/PreviewLineSystem.js
```

## 代码迁移映射表
- 图初始化与插件：`index.vue:952–1217` → GraphService.create/initialize
- 连接策略：`index.vue:1130–1217` → GraphService.bindConnectionPolicies
- 删除级联：`index.vue:2324–2335` → GraphService.deleteNodeCascade
- Minimap：`index.vue:3407–3461` → GraphService.toggleMinimap
- 快速布局：`index.vue:3484–3560` → LayoutService.applyQuickLayout
- 结构化布局：`index.vue:1491–1513` → LayoutService.applyStructuredLayout
- 节点统一更新：`index.vue:2167–2275` → NodeService.updateNodeUnified
- 起始节点保障：`index.vue:1812–1830` → NodeService.ensureStartNode
- 画布数据采集：`index.vue:3606–3672` → PersistenceService.collectCanvasData
- 加载画布数据：`index.vue:3773–3934` → PersistenceService.loadCanvasData
- 保存/发布：`index.vue:3936–4018, 4020–4108` → PersistenceService.saveTask/publishTask
- 发布校验：`index.vue:4110–4218` → PersistenceService.validateForPublish
- 统计联动/停靠：`index.vue:312–327, 1484–1487` → StateService/useCanvasState

## 实施阶段（参考《营销画布系统完整重构方案.md》）
1. 第1阶段：补齐单元/集成测试，确定服务接口与类型
2. 第2阶段：抽取 PersistenceService 与 NodeService（风险低、收益高）
3. 第3阶段：抽取 GraphService 与 LayoutService（控制连接策略与布局集中化）
4. 第4阶段：抽取 StateService，页面降重，完成联动迁移
5. 第5阶段（可选）：预览线相关功能已取消，当前不引入 PreviewLine 服务

## 风险与对策
- UI 与服务边界不清：先定义接口与返回类型，页面只依赖控制器/服务
- 历史数据端口映射遗漏：在 PersistenceService 中集中修复（AB 分支按 `out-N` 映射）
- 统计联动断链：保留 `stats:focus` 事件，统计面板通过 Graph 与 StateService 获取数据

## 验收标准
- 页面不包含图操作/布局/持久化的具体实现，仅作装配与转发
- 所有服务具备单元测试与文档；发布校验通过且功能不回归
- 节点更新统一路径；连接策略与布局行为集中在服务层
