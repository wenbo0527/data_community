# 原版画布代码清理清单（非横版子应用）

## 范围说明
- 目录根：`src/pages/marketing/tasks/`（除 `horizontal/` 外）
- 用途：梳理原版画布相关代码，标注保留/迁移/可删除项，支持后续清理与统一到横版架构

## 页面与入口
- `src/pages/marketing/tasks/index.vue`
- `src/pages/marketing/tasks/task-editor.vue`
- `src/pages/marketing/tasks/create.vue`
- Iframe 过渡页：`src/pages/marketing/tasks/HorizontalTasksIframe.vue`、`src/pages/marketing/tasks/HorizontalIframe.vue`

## 画布与组件（原版）
- 主画布组件：
  - `src/pages/marketing/tasks/components/TaskFlowCanvas.vue`
  - `src/pages/marketing/tasks/components/TaskFlowCanvasRefactored.vue`
- 画布工具与面板：
  - `components/CanvasToolbar.vue`
  - `components/CanvasHistoryPanel.vue`
  - `components/CanvasMinimap.vue`
  - `components/CanvasDebugPanel.vue`
  - `components/StatisticsModePanel.vue`
  - `components/QueryModePanel.vue`
  - `components/NodeToolbar.vue`
  - `components/PortDebugPanel.vue`
- 节点视图与选择器：
  - `components/canvas/FlowNode.vue`
  - `components/canvas/NodeTypeSelector.vue`
  - `components/canvas/ConnectionContextMenu.vue`、`components/canvas/PreviewLineStyleConfig.vue`、`components/canvas/CanvasManualControls.vue`
- 配置抽屉：
  - `components/TaskFlowConfigDrawers.vue`、`components/TaskFlowConfigDrawersTest.vue`
  - 单节点抽屉：`StartNodeConfigDrawer.vue`、`CrowdSplitNodeConfigDrawer.vue`、`EventSplitNodeConfigDrawer.vue`、`ABTestNodeConfigDrawer.vue`、`AICallNodeConfigDrawer.vue`、`ManualCallNodeConfigDrawer.vue`、`SMSNodeConfigDrawer.vue`、`BenefitNodeConfigDrawer.vue`、`WaitNodeConfigDrawer.vue`
  - 基础抽屉：`components/BaseDrawer.vue`

## 服务与适配层（原版）
- 服务入口与适配：
  - `services/GraphService.js`、`services/GraphServiceAdapter.js`
  - `services/LayoutService.js`、`services/LayoutServiceAdapter.js`
  - `services/EventService.js`、`services/EventServiceAdapter.js`
  - `services/PreviewLineService.js`
  - `services/StateService.js`
  - `managers/ServiceManager.js`
- 组合式（原版画布生命周期与事件）：
  - `composables/useCanvasCore.js`
  - `composables/useCanvasLifecycle.js`
  - `composables/useCanvasEvents.js`
  - `composables/useCanvasState.js`
  - `composables/canvas/useX6Events.js`
  - `composables/canvas/useCanvasMinimap.js`
  - `composables/canvas/useCanvasConnections.js`、`useCanvasConnection.js`
  - `composables/canvas/usePreviewLine.js`
  - `composables/canvas/useEventManager.js`
  - `composables/canvas/useStartNodeForm.ts`

## Canvas 工具与配置（原版）
- 基础配置与类型：
  - `utils/canvas/canvasConfig.js`、`StyleConfig.js`、`uiOptimizationConfig.js`
  - `utils/canvas/x6Config.js`
  - `types/*.ts`、`types/canvas.d.ts`
- 端口与连线：
  - `utils/canvas/portConfigFactory.js`
  - `utils/canvas/connectionConfigFactory.js`
  - `utils/canvas/nodeConnectionHelper.js`
  - `utils/canvas/ConnectionValidator.js`、`PortCoordinateDebugger.js`
- 存储与数据：
  - `utils/canvas/taskStorage.js`、`StorageUtils.js`
  - `utils/canvas/DataTransformUtils.js`
- 交互与事件：
  - `utils/canvas/EventManagerBase.js`、`UnifiedEventBus.js`、`EventBus.js`
  - `utils/canvas/CanvasPanZoomManager.js`、`GlobalDragStateManager.js`
- 结构化布局（原版）：
  - `utils/canvas/layout/*`（`LayoutExecutor.js/DataPreprocessor.js/LayerCalculator.js/HierarchicalBuilder.js/...`）
  - 性能/缓存：`PerformanceMonitor.js/LayoutCache.js/DebounceManager.js`
- 预览线与坐标重构（可清理）：
  - `utils/canvas/PreviewLineStyleManager.js`
  - `utils/coordinate-refactor/**`（`core/UnifiedStructuredLayoutEngine.js`、`sync/*`、`strategies/*` 等）
  - 说明：预览线系统与坐标重构为旧方案，横版架构已移除预览线；建议整体清理或仅保留必要的文档记录

## 其它工具与校验
- 验证与优化：
  - `utils/canvas/canvasValidation.js`、`enhancedCanvasValidation.js`
  - `utils/ValidationUtils.js/DependencyAnalyzer.js/DependencyOptimizer.js/ModuleBoundaryOptimizer.js`
  - `utils/LayoutUtils.js/CoordinateUtils.js`
- 统一结构化引擎备份：
  - `utils/canvas/UnifiedStructuredLayoutEngine.js`、`UnifiedStructuredLayoutEngine.backup.js`

## 测试与演示
- 画布测试：
  - `__tests__/canvas-basic.test.js`、`__tests__/canvas-initialization.test.js`、`__tests__/canvas-migration-validation.test.js`
  - `tests/*.js`、`test/*.js`、`TaskFlowCanvasTest.vue`
- 预览线与连接集成：
  - `utils/canvas/test-preview-connection-integration.js`
- 工作流类型与配置校验：
  - `utils/canvas/workflowNodeTypes.test.js`

## 清理建议（分层标注）
- 保留（迁移对齐横版）：
  - 抽屉与节点类型定义（`components/*NodeConfigDrawer.vue`、`TaskFlowConfigDrawers.vue`）
  - 任务列表与表单页（`index.vue/create.vue/task-editor.vue`）
  - 核心画布组件若需保留演示，可仅保留 `TaskFlowCanvasRefactored.vue` 并标注 deprecated
- 迁移（统一到横版服务与组合式）：
  - 图/布局/事件服务与适配层（`services/*Adapter.js`）→ 横版 `GraphService/LayoutService/useCanvasState`
  - 组合式生命周期与状态（`composables/useCanvas*`）→ 横版 `useCanvasState/useNodeInsertion`
  - 端口与连线工厂（`portConfigFactory.js/connectionConfigFactory.js`）→ 横版 `utils/portConfigFactoryHorizontal.js`
- 可删除（旧方案与重复模块）：
  - 预览线系统：`PreviewLineService.js/PreviewLineStyleManager.js`
  - 坐标重构套件：`utils/coordinate-refactor/**`
  - 旧结构化布局大量工具类（如与横版重复的 `layout/*`）在确认无引用后移除
  - Iframe 过渡页：`HorizontalTasksIframe.vue/HorizontalIframe.vue`（横版已直接路由）

## 统一替换参考（横版对应）
- 横版端口工厂：`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/utils/portConfigFactoryHorizontal.js`
- 横版节点视图工厂：`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/createVueShapeNode.js`
- 横版图/布局/状态：`graph/GraphService.ts`、`layout/LayoutService.ts`、`state/useCanvasState.ts`
- 横版统一更新：`node/NodeService.ts:updateNodeUnified`、页面 `updateNodeFromConfigUnified`

## 风险与注意事项
- 先用全局检索确认模块引用关系，避免误删（例如服务适配层）
- 测试覆盖的模块先标注 deprecated，再逐步移除测试与实现，保持主干稳定
- 发布校验与数据采集逻辑建议迁移到横版 `PersistenceService.ts` 与 `collectCanvasData`

## 执行建议
- 建立“清理任务列表”，按模块分批：服务层 → 组合式 → 工具与布局 → 旧预览线系统 → Iframe 过渡页
- 每批次完成后运行相关测试套件与画布手动验证，记录迁移与删除影响
