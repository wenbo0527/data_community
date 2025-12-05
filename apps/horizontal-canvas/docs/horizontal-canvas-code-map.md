# 横版画布子应用代码清单（清理指引）

## 应用根
- `apps/horizontal-canvas/` 子应用目录
- 路由与入口参考：`apps/horizontal-canvas/src/router.ts`

## 页面与视图
- `apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/index.vue` 画布页
- `apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/HorizontalNode.vue` 节点视图（Vue Shape）
- `apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/createVueShapeNode.js` 视图规格工厂（尺寸/端口/显示行）

## 样式与常量
- `apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/styles/nodeStyles.js` 尺寸/颜色/文本/交互态常量与基础样式生成

## 端口与布局
- `apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/utils/portConfigFactoryHorizontal.js` 左进右出端口工厂，支持行中点/均匀分布与位置验证
- `apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/layout/LayoutService.ts` 快速/结构化布局与顶点清理
- `apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/utils/quickLayout.js` 横向层次布局引擎

## 图服务与状态
- `apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/graph/GraphService.ts` 图初始化、插件注册与快捷键绑定
- `apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/state/useCanvasState.ts` UI 状态联动/面板定位与尺寸

## 节点服务与统一更新
- `apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/node/NodeService.ts` `updateNodeUnified` 尺寸、端口映射与数据写回
- 统一更新入口：`updateNodeFromConfigUnified` 位于画布页 `index.vue`

## 抽屉与菜单
- `apps/horizontal-canvas/src/components/task/TaskFlowConfigDrawers.vue` 汇总配置抽屉
- 单节点抽屉：
  - `StartNodeConfigDrawer.vue`
  - `CrowdSplitNodeConfigDrawer.vue`
  - `EventSplitNodeConfigDrawer.vue`
  - `ABTestNodeConfigDrawer.vue`
  - `AICallNodeConfigDrawer.vue`
  - `ManualCallNodeConfigDrawer.vue`
  - `SMSNodeConfigDrawer.vue`
  - `BenefitNodeConfigDrawer.vue`
  - `WaitNodeConfigDrawer.vue`
- 画布菜单与工具：
  - `CanvasToolbar.vue`
  - `CanvasHistoryPanel.vue`
  - `CanvasStatisticsPanel.vue`
  - `CanvasDebugPanel.vue`
  - `ConnectionContextMenu.vue`
  - `NodeTypeSelector.vue`
  - `components/nodes/BaseNode.vue`

## 组合式与工具
- `apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/composables/useNodeInsertion.ts` 节点插入与收尾（端口修正/历史入栈/持久化）
- `apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/composables/usePortValidation.js` 端口位置验证
- `apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/utils/performanceMonitor.js` 性能监控测量闭包
- `apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/services/CanvasController.js` 控制器
- `apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/services/EventService.js` 事件服务
- `apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/persistence/PersistenceService.ts` 保存/发布与数据采集
- `apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/debug/DebugHelpers.ts` 调试入口与节点测试

## 文档（设计/使用/架构）
- `apps/horizontal-canvas/docs/architecture.md` 架构说明
- `apps/horizontal-canvas/docs/architecture-horizontal.md` 模块架构
- `apps/horizontal-canvas/docs/faq-and-guides.md` FAQ 与操作指南（样式/高度/内容更新）
- `apps/horizontal-canvas/docs/requirements.md` 需求
- `apps/horizontal-canvas/docs/refactor-plan.md` 重构计划
- `apps/horizontal-canvas/docs/usage.md` 使用说明

## 镜像实现（src 目录）
- 页面与视图：`src/pages/marketing/tasks/horizontal/index.vue`、`src/pages/marketing/tasks/horizontal/HorizontalNode.vue`
- 通用节点组件：`src/pages/marketing/tasks/horizontal/components/UniversalNode.vue`
- 样式与常量：`src/pages/marketing/tasks/horizontal/styles/nodeStyles.js`、`styles/universalNodeStyles.js`
- 端口工厂与工具：`src/pages/marketing/tasks/horizontal/utils/portConfigFactoryHorizontal.js`、`utils/performanceMonitor.js`
- 组合式与演示：`src/pages/marketing/tasks/horizontal/composables/*`、`components/*`、`style-validation-demo.html`
- 测试与报告：`src/pages/marketing/tasks/horizontal/__tests__/*`、`utils/*REPORT.md`

## 清理指引（建议）
- 统一更新路径保留：`updateNodeFromConfigUnified` 与 `updateNodeUnified`
- 删除旧版更新函数：已移除 `updateNodeFromConfig`（apps/src 两处）
- AB 实验内容展示：已从 `HorizontalNode.vue` 移除 `.ab-test__experiment` 与对应内容
- 菜单交互：保留 `blank:click`/`window.click` 关闭与 `node:moved` 跟随逻辑
- 文档同步：以 `faq-and-guides.md` 为入口，集中样式与高度调整指南

## 变更回溯
- 近期提交：参见 `integrate/external-center-20251111` 分支最新提交日志
