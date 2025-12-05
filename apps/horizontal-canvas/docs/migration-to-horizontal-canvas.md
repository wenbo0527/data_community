# 主项目画布切换到横版画布迁移清单

## 总览
- 目标：主项目 `src/pages/marketing/tasks` 相关画布页面切换为 `apps/horizontal-canvas` 横版画布，实现完整替代
- 成果：路由统一、页面替换、服务与组合式迁移、旧模块清理、测试与文档同步

## 路由与导航
- 替换入口路由
  - 将主项目画布入口路由指向 `apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/index.vue`
  - 删除或禁用 Iframe 过渡页：`HorizontalTasksIframe.vue`、`HorizontalIframe.vue`
- 别名与构建
  - 确认 `apps/horizontal-canvas/vite.config.ts` 中别名 `@` 指向 `/src`
  - 主项目引用子应用时避免路径冲突，保持独立构建或通过路由跳转

## 页面替换
- 画布页
  - 用横版画布页替换：`TaskFlowCanvas.vue` 与 `TaskFlowCanvasRefactored.vue`
  - 页面级引用统一为横版画布，移除主项目内自有画布渲染层
- 选择器与工具栏
  - 替换组件引用：`CanvasToolbar.vue`、`CanvasHistoryPanel.vue`、`CanvasStatisticsPanel.vue`、`CanvasDebugPanel.vue`、`ConnectionContextMenu.vue`、`NodeTypeSelector.vue`
  - 若保留 UI 皮肤，优先复用横版画布对应组件

## 抽屉与节点配置
- 保留与复用
  - 汇总抽屉：`apps/horizontal-canvas/src/components/task/TaskFlowConfigDrawers.vue`
  - 单节点抽屉：`Start/CrowdSplit/EventSplit/ABTest/AICall/ManualCall/SMS/Benefit/Wait`
- 写回统一
  - 页面使用 `updateNodeFromConfigUnified`，服务层使用 `updateNodeUnified`

## 图服务与状态迁移
- 替换服务
  - 图服务：`graph/GraphService.ts`
  - 布局服务：`layout/LayoutService.ts`
  - 状态服务：`state/useCanvasState.ts`
- 移除适配层与旧方案
  - 删除主项目 `services/*Adapter.js`、`services/*Service.js` 旧版本（在确认无引用后）
  - 移除 `PreviewLineService.js` 与相关样式管理器

## 端口与布局对齐
- 端口工厂
  - 统一使用横版：`utils/portConfigFactoryHorizontal.js`
  - 差异映射 `out-N`，按显示行几何中点对齐
- 视图规格
  - 统一使用：`createVueShapeNode.js`
  - 尺寸与行高由 `styles/nodeStyles.js` 常量驱动

## 数据采集与发布
- 采集统一
  - 使用 `persistence/PersistenceService.ts` 中 `collectCanvasData`
- 发布校验
  - 使用横版校验项：端口连接/分支完整性/开始节点存在等

## 样式与渲染
- 常量与样式
  - `styles/nodeStyles.js` 管理 `WIDTH/MIN_HEIGHT/HEADER_HEIGHT/ROW_HEIGHT/CONTENT_PADDING/ROW_GAP/CONTENT_SPACING/TYPOGRAPHY.CONTENT_BASELINE_ADJUST`
- 组件渲染
  - `HorizontalNode.vue` 非自适应绝对定位与自适应 DOM 测量两模式
  - AB 实验节点内容标签已移除，统一在显示行或标题呈现

## 清理与删除（主项目 src）
- 删除预览线与坐标重构模块
  - `utils/canvas/PreviewLineStyleManager.js`
  - `utils/coordinate-refactor/**`（`core/sync/strategies` 等）
- 删除重复布局工具（确认无引用后）
  - `utils/canvas/layout/**` 中与横版重复的执行/预处理/算法/缓存
- 删除 Iframe 过渡页与旧画布层
  - `HorizontalTasksIframe.vue`、`HorizontalIframe.vue`
  - `TaskFlowCanvas.vue`、`TaskFlowCanvasRefactored.vue`

## 测试更新
- 移除或迁移主项目画布测试
  - `__tests__/canvas-*.test.js` 与 `tests/*` 中依赖旧画布实现的用例
- 新增或复用横版测试
  - 显示行/端口对齐/统一更新路径/发布校验相关测试

## 文档同步
- 更新与对齐
  - `apps/horizontal-canvas/docs/architecture.md`、`architecture-horizontal.md`、`faq-and-guides.md`
  - 新增清单：`apps/horizontal-canvas/docs/original-canvas-cleanup-map.md`

## 风险与回滚
- 路由切换提供回退开关（环境变量或特征开关）
- 分批清理，维持最小可用路径；每批完成进行手动+测试验证

## 执行顺序（Checklist）
- 路由切换到横版画布入口
- 页面替换与组件引用统一
- 图/布局/状态服务迁移与旧服务移除
- 端口工厂与视图规格替换
- 数据采集/发布校验切换
- 样式与渲染联动校验
- 删除预览线/坐标重构/旧布局工具
- 删除 Iframe 与旧画布组件
- 更新测试与文档
- 最终回归与开关关闭
