# 横版画布重构方案（单一功能原则）

## 项目结构摘要
- 技术栈：Vue 3、Vite、Arco Design、AntV X6、x6-vue-shape、Vue Router
- 路由：`src/router.ts` → `/marketing/tasks/horizontal` 为核心画布页
- 关键页面：
  - 任务列表：`src/pages/marketing/tasks/index.vue`、`src/pages/tasks/TasksList.vue`
  - 横版画布：`src/pages/marketing/tasks/horizontal/index.vue`
- 组件：工具栏、历史、调试、统计、节点类型选择器、BaseNode/HorizontalNode、配置抽屉
- 服务与工具：CanvasController、EventService、TaskStorage、NodeTypes、PortConfigFactoryHorizontal、QuickLayout、PerformanceMonitor
- 组合式：useConfigDrawers、useCanvasHistory、useStructuredLayout、useGraphInstance、usePortValidation
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
（已取消）PreviewLineService：当前不引入预览线服务

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
  - `useCanvasState(): { refs..., updateDebugDockBounds, updateStatisticsPanelTop, setupPanelResizeListeners, setupPanelWatchers, computeMinimapPosition, toggleMinimapUI, updateScaleDisplay, computeStatsPanelPosition, clampPanelPosition }`
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
    pages/marketing/tasks/horizontal/composables/useNodeInsertion.ts
  utils/
    taskStorage.js
    nodeTypes.js
```

## 代码迁移映射表
- 图初始化与插件：`index.vue:952–1217` → GraphService.create/initialize
- 连接策略：`index.vue:1130–1217` → GraphService.bindConnectionPolicies
- 删除级联：`index.vue:2324–2335` → GraphService.deleteNodeCascade
- Minimap：`index.vue:3407–3461` → GraphService.toggleMinimap
- 快速布局：`index.vue:3484–3560` → LayoutService.applyQuickLayout
- 结构化布局：`index.vue:1359–1382, 3291–3294` → LayoutService.applyStructuredLayout
- 节点插入：`index.vue:3376–3408` → useNodeInsertion（计算选择器位置与预创建坐标）
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
## 进度汇总（已完成）

- 服务化接入（第2–4阶段）
  - GraphService：`createGraph`、`bindConnectionPolicies`、`useHistory/useKeyboard/useSelection`、`toggleMinimap`、`bindDefaultShortcuts`、`configureSelectionRubberbandGate`
  - LayoutService：`applyQuickLayout`（辅助线开关、边顶点清理、视图居中、Minimap 更新）、`applyStructuredLayout`（统一装配入口）、`cleanupEdgeVertices`
  - NodeService：`updateNodeUnified`、`ensureStartNode`
  - PersistenceService：`collectCanvasData`、`loadCanvasData`、`saveTask/publishTask`、`validateForPublish`
  - StateService（useCanvasState）：统计面板位置与越界约束、调试面板停靠、Minimap 位置与开关、缩放显示格式化、watchers 与窗口 resize 统一装配、通用显隐工具（toggle/setVisible、showNodeSelectorAt/hideNodeSelector）
- 交互组合式
  - useNodeInsertion：`computeSelectorFromAnchor/computeSelectorCenter`、`insertNodeFromSelector/insertNodeAndFinalize`
  - DebugHelpers：调试入口迁移，页面仅保留委托调用
- 页面降重
  - 移除 `HorizontalQuickLayout` import/ref/初始化（快速布局入口统一委托至服务）
  - 清理普通流程日志与薄封装；入口保留、行为不变

## 剩余任务与优先级（调整）

1. 结构化布局算法服务化（高优先级，1–2 天）
   - 在 `LayoutService` 中补充结构化布局的参数化实现（如列距/行距/对齐策略），并新增单测覆盖。
2. 工具栏状态与容器显隐进一步抽象（中优先级，1 天）
   - 将按钮禁用条件与容器显隐（如统计/最小图/调试）统一封装到 `useCanvasState` 辅助方法，页面只做事件绑定。
3. 历史入栈与插入流程整合（中优先级，0.5 天）
   - 将节点插入后的历史入栈行为整合到 `insertNodeAndFinalize` 的 `onAfter` 回调，通过 `useCanvasHistory` 统一更新。
4. 文档与示例完善（中优先级，0.5 天）
   - 为新 API 增加示例片段与交叉引用；确保 FAQ/Architecture 与代码一致。

时间安排（建议）
- 本周（第 1–3 天）：结构化布局实现 + 单测；工具栏状态抽象；插入流程历史整合。
- 本周（第 4 天）：文档完善与同行评审反馈修复。

## 技术问题与解决方案（记录）

- 问题：页面 mounted 阶段 `useHistory is not defined`
  - 解决：在 `index.vue` 正确导入并使用 GraphService 的 `useHistory/useKeyboard/useSelection` 方法。
- 问题：Minimap 插件生命周期分散、存在回退构造路径
  - 解决：统一使用 `GraphService.toggleMinimap` 管理创建/销毁；移除 `new MiniMap(...)` 回退逻辑。
- 问题：快速布局逻辑分散在页面，辅助线与顶点清理处理不统一
  - 解决：在 `LayoutService.applyQuickLayout` 中集中处理辅助线开关、边顶点清理与视图居中策略，并在页面委托调用。
- 问题：节点插入坐标换算与边重连逻辑冗长
  - 解决：抽到 `useNodeInsertion` 组合式，页面仅转发事件。
- 问题：普通流程日志过多影响可读性
  - 解决：保留必要提示与错误日志，移除普通流程 `console.*` 日志；调试函数迁移到 `DebugHelpers` 并通过入口调用。

## 同行评审（Checklist）

- 代码结构：页面是否仅做装配与委托；服务/组合式是否职责单一
- API 一致性：Graph/Layout/Node/Persistence/State 的方法签名与返回值是否一致、易测
- 测试覆盖：核心服务单测是否通过；交互路径是否具备最小验证测试
- 文档一致：Architecture/FAQ/Horizontal 架构文档与代码结构是否一致；交叉引用是否有效
- 性能与安全：辅助线与 Minimap 生命周期管理是否正确；发布校验是否覆盖分支与端口连接；日志是否避免泄露数据

## 代码备注补充计划（基于架构模块划分）

> 版本记录
> - 2025-11-27：首次制定代码备注补充计划，覆盖页面、组件、服务与组合式函数，统一备注风格与执行里程碑。

### 目标与原则
- 明确职责：在关键入口/方法上补充用途、输入/输出、边界条件与副作用。
- 统一风格：中文注释、简洁完整；方法头采用固定模板；避免冗余与实现细节噪音。
- 安全与性能：备注敏感数据处理约束与潜在性能热点；禁止记录密钥/隐私信息。
- 页面降重：页面层仅备注“装配与委托”与交互入口，不复述服务内部逻辑。

### 方法头注释模板（建议）
```
// 用途：
// 入参：
// 返回：
// 边界：
// 副作用：
// 说明：
```

### 模块与文件清单及备注要点
- 页面层
  - `pages/marketing/tasks/horizontal/index.vue`
    - 备注装配职责、路由参数解析点、事件转发到 `GraphService/LayoutService/useCanvasState/useNodeInsertion` 的入口函数。
    - 对查看模式限制与发布校验入口进行用途与条件说明。
  - `pages/marketing/tasks/index.vue`、`pages/tasks/TasksList.vue`
    - 备注任务列表数据来源（`TaskStorage`）、跳转路径与只读/编辑模式切换。

- 组件层
  - `components/toolbar/CanvasToolbar.vue`
    - 备注各按钮触发的委托方法与禁用条件来源（`useCanvasState`）。
  - `components/history/CanvasHistoryPanel.vue`
    - 备注历史堆栈展示的来源（`useCanvasHistory`）与跳转回调。
  - `components/debug/CanvasDebugPanel.vue`
    - 备注调试入口仅用于开发环境，委托到 `DebugHelpers`。
  - `components/statistics/CanvasStatisticsPanel.vue`
    - 备注路径高亮事件 `path-highlight` 的触发条件与消费方（画布页）。
  - `components/canvas/NodeTypeSelector.vue`
    - 备注选择器与 `useNodeInsertion` 的集成点。
  - `components/canvas/ConnectionContextMenu.vue`
    - 备注查看模式下删除入口屏蔽与菜单关闭行为。

- 服务与组合式
  - `graph/GraphService.ts`
    - 为 `createGraph` 补充默认配置项说明（背景/网格/滚轮/高亮），与容器依赖。
    - `useHistory/useKeyboard/useSelection`：备注插件注册时机与事件绑定范围。
    - `toggleMinimap`：备注创建/销毁策略与容器位置依赖。
    - `bindDefaultShortcuts`：列出快捷键映射与查看模式屏蔽逻辑。
    - `configureSelectionRubberbandGate`：备注 Ctrl/Meta 门控与空白选择清理。
    - `bindConnectionPolicies`：备注连接唯一性与最近端口回填策略。
  - `layout/LayoutService.ts`
    - `applyQuickLayout`：备注辅助线开关、边顶点清理与视图适配触发条件；布局失败容错。
    - `applyStructuredLayout`：备注方向/间距参数与提供者策略；结果校验与重绘。
    - `cleanupEdgeVertices`：备注何时调用与对路径的影响。
  - `state/useCanvasState.ts`
    - `updateStatisticsPanelTop/updateDebugDockBounds`：备注 DOM 依赖与 idempotent 行为。
    - `setupPanelResizeListeners/setupPanelWatchers`：备注绑定/卸载与触发频率建议。
    - `computeMinimapPosition/toggleMinimapUI`：备注坐标系与锚点选择。
    - `toggleVisible/setVisible/showNodeSelectorAt/hideNodeSelector`：备注 UI 显隐约定与复用点。
  - `composables/useNodeInsertion.ts`
    - `computeSelectorFromAnchor/computeSelectorCenter`：备注坐标换算与边选择器关系。
    - `insertNodeFromSelector/insertNodeAndFinalize`：备注端口修正、两段边重连、历史入栈与持久化回调的调用顺序。
  - `debug/DebugHelpers.ts`
    - 备注仅在开发环境使用；列出入口方法与作用范围，避免在生产挂载。
  - `composables/canvas/useCanvasHistory.js`
    - 备注历史栈结构、监听事件与跳转副作用。

- 工具与样式
  - `utils/taskStorage.js`
    - 备注本地存储 KEY、数据结构、`migrateCanvasData` 的修复策略（分支/端口）。
  - `styles/nodeStyles.js`
    - 备注几何常量含义与对端口布局的影响。
  - `utils/portConfigFactoryHorizontal.js`
    - 备注行中点与基线调整计算、均匀分布策略、输出端口属性（`data-port`）。

### 标签与标识约定（供备注使用）
- `[NOTE]` 普通说明；`[WARN]` 边界或易错点；`[PERF]` 性能提示；`[SEC]` 安全约束；`[TODO]` 补充计划。
- 统一中文；与方法头模板一起使用，避免长段落注释侵入实现细节。

### 执行计划与里程碑
- 第 1 天：GraphService、LayoutService、useCanvasState 完成方法头与关键逻辑备注（高优）。
- 第 2 天：useNodeInsertion、index.vue 装配入口、组件层（Toolbar/History/Statistics/Selector/Menu）备注。
- 第 3 天：工具与样式（taskStorage/nodeStyles/portConfig）、DebugHelpers 与 History 备注；统一交叉引用与术语。
- 评审：按《同行评审（Checklist）》核对，确保不引入行为变化与泄露风险。

### 验收标准
- 所有服务/组合式的公共方法具备方法头注释与必要 `[WARN]/[PERF]/[SEC]` 标签。
- 页面与组件备注覆盖交互入口与委托关系；不复述服务内部细节。
- 单测通过；自动化检查不因新增备注失效（如 ESLint/Vite 构建）。
- 文档（Architecture/FAQ）术语与示例与备注一致；版本记录更新。

## 版本记录（文档补充）

- 更新日期：2025-11-27
- 更新内容摘要：
  - 为 GraphService.ts 所有导出方法补充方法头注释（参数类型、返回值结构、使用场景）。
  - 为 PersistenceService.ts 各导出方法补充完整的参数与返回结构细节说明。
  - 完善架构文档（architecture.md）服务与工具模块，新增 utils/quickLayout.js 与 utils/performanceMonitor.js、composables/usePortValidation.js 的说明与关键片段。
- 涉及修改的文件列表：
  - `apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/graph/GraphService.ts`
  - `apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/persistence/PersistenceService.ts`
  - `apps/horizontal-canvas/docs/architecture.md`
- 负责人信息：AI助理（Trae IDE）

## 代码备注覆盖清单（按最新模块划分）

- graph/GraphService.ts（已补充方法头注释）
  - `create(container, options)`：创建通用 Graph（占位）
  - `createGraph(container, options)`：带默认配置的 Graph 实例
  - `useHistory(graph, options)`：注册 History 插件
  - `useKeyboard(graph, options)`：注册 Keyboard 插件
  - `useSelection(graph, options)`：注册 Selection 插件
  - `bindDefaultShortcuts(graph, handlers)`：快捷键映射
  - `configureSelectionRubberbandGate(selectionPlugin, graph)`：橡皮框门控
  - `toggleMinimap(graph, container, visible, options)`：小地图生命周期
  - `zoomIn/zoomOut/zoomTo/centerContent`：视图控制（占位）
  - `addNode/removeNode/addEdge/removeEdge/deleteNodeCascade`：CRUD（占位）
  - `bindConnectionPolicies(graph, ctx)`：连接与磁铁校验策略

- layout/LayoutService.ts（已补充顶部职责说明，需保持方法头注释一致性）
  - `applyQuickLayout(graph, options)`：快速布局与视图适配
  - `applyStructuredLayout(graph, options)`：结构化布局装配与切换方向
  - `cleanupEdgeVertices(graph)`：边顶点清理

- state/useCanvasState.ts（已补充顶部职责说明）
  - `updateStatisticsPanelTop(toolbarWrapperEl, statisticsPanelTopRef)`
  - `updateDebugDockBounds(contentEl, showStatisticsPanelRef, isViewMode, isPublished, statisticsPanelWidthRef, debugDockBoundsRef)`
  - `setupPanelResizeListeners(toolbarWrapperEl, contentEl, showStatisticsPanelRef, isViewMode, isPublished, statisticsPanelWidthRef, debugDockBoundsRef, statisticsPanelTopRef)`
  - `setupPanelWatchers(showStatisticsPanelRef, statisticsPanelWidthRef, updateTopFn, updateDockFn)`
  - `computeMinimapPosition(anchorRect, canvasRect)`、`toggleMinimapUI(showMinimapRef, anchorRect, canvasRect, minimapPositionRef)`
  - `computeStatsPanelPosition(anchorRect, canvasRect)`、`clampPanelPosition(statsPos, canvasRect, panelRect, pad)`
  - `updateScaleDisplay(scaleDisplayTextRef, scale)`
  - `toggleVisible/setVisible/showNodeSelectorAt/hideNodeSelector`

- composables/useNodeInsertion.ts（已补充顶部职责说明）
  - `computeSelectorFromAnchor(anchorRect, contentRect, graph)`
  - `computeSelectorCenter(containerRect, graph)`
  - `insertNodeFromSelector(graph, nodeType, pendingPoint, pendingInsertionEdge, getNodeLabel, createVueShapeNode)`
  - `insertNodeAndFinalize(graph, nodeType, pendingPoint, pendingInsertionEdge, getNodeLabel, createVueShapeNode, finalize)`

- node/NodeService.ts（已补充顶部职责说明，建议补充方法头注释）
  - `createNodeSpec(nodeType, config, pos)`：创建规格
  - `updateNodeUnified(graph, node, nodeType, config)`：统一更新（尺寸、端口映射、数据写回）
  - `ensureStartNode(graph)`：起始节点保障

- persistence/PersistenceService.ts（已补充方法头注释）
  - `collectCanvasData(graph)`：采集
  - `loadCanvasData(graph, canvasData)`：加载
  - `saveTask(meta, canvasData)`：保存草稿
  - `publishTask(meta, canvasData)`：发布
  - `validateForPublish(graph, canvasData)`：发布校验（结构/配置/连通性/端口与分支完整性）

- services/EventService.js（已补充顶部职责说明，建议在关键私有方法前追加行内备注）
  - `bindGraphEvents(graph)`：节点菜单/标题/内容区域识别与行为处理
  - 私有方法：`getClickRegion(e, node)`、`toContainerCoords(point)`（在方法使用处补充行内备注）

- services/CanvasController.js（已补充顶部职责说明）
  - `constructor(opts)`：聚合依赖并装配 EventService

- utils/portConfigFactoryHorizontal.js（已补充顶部职责说明）
  - `createHorizontalPortConfig(outCount, options)`：左进右出端口配置（行中点/均匀分布、位置与ID校验）

- utils/performanceMonitor.js（已补充顶部职责说明）
  - 核心方法：`measure/recordMetric/getStats/getAllStats/clear/exportReport/setThreshold/setEnabled`
  - 辅助：`measureAsync/measureSync/measurePerformance`

- utils/quickLayout.js（建议补充方法头注释）
  - 核心方法：`executeHierarchyTreeLayout(graph, options)`（与 LayoutService 集成）

- composables/usePortValidation.js（已补充顶部职责说明）
  - `validatePortPositions(portConfig, contentLines, tolerance)`
  - `validatePortIds(ports, expectedPrefix)`
  - `validationStats/clearValidation`

- 组件（已按需补充职责与关键入口备注）
  - `CanvasToolbar.vue`、`CanvasHistoryPanel.vue`、`CanvasStatisticsPanel.vue`、`NodeTypeSelector.vue`、`ConnectionContextMenu.vue`

> 执行要求：以上核心函数与入口方法必须具备用途/入参/返回/边界/副作用的完整备注；文件顶部需包含职责说明与边界约束；新增/调整 API 时同步更新本清单与 architecture.md。
