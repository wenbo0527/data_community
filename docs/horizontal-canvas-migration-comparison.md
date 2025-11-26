# 横版画布迁移对比报告

## 概览
- 目标：将“横版画布”剥离为独立子应用，通过 iframe 嵌入宿主，保持与原版行为一致，并逐步独立任务列表页。
- 现状：子应用已完成核心画布能力接入（工具栏、历史栈、节点抽屉、边插入与右键菜单、最小地图、调试/统计面板、保存与桥接等），任务列表页仍由宿主提供。

## 目录结构对比
- 宿主项目
  - `src/pages/marketing/tasks/index.vue`（任务列表页）
  - `src/pages/marketing/tasks/horizontal/index.vue`（横版画布原实现）
  - `src/pages/marketing/tasks/components/*`（工具栏、历史/调试/统计面板、抽屉等）
  - `src/pages/marketing/tasks/composables/*`（useCanvasHistory、usePreviewLine、useConfigDrawers 等）
  - `src/pages/marketing/tasks/horizontal/*`（横版专用组件与服务、样式与布局、控制器等）
  - `src/utils/*`（nodeTypes.js、preview-line 系统、通用 utils）
- 子应用（新建）
  - `apps/horizontal-canvas/package.json`、`vite.config.ts`、`index.html`（Vite+Vue3）
  - `apps/horizontal-canvas/src/main.ts`（注册 Arco 与图标组件）
  - `apps/horizontal-canvas/src/App.vue`（横版画布页面核心）
  - `apps/horizontal-canvas/src/components/nodes/BaseNode.vue`（节点外壳）
  - `apps/horizontal-canvas/src/pages/horizontal/*`（HorizontalNode.vue、createVueShapeNode.js、styles、portConfigFactoryHorizontal.js）

## 关键页面与路由对比
- 宿主横版入口：`/marketing/tasks/horizontal`
  - 路由：`src/router/marketing.js:129-139` 指向 `HorizontalIframe.vue`
  - 容器页：`src/pages/marketing/tasks/HorizontalIframe.vue:1-96` 负责 iframe 注入与 `init/save` 消息桥接
- 子应用画布页：`apps/horizontal-canvas/src/App.vue`
  - Graph 初始化与端口布局：`apps/horizontal-canvas/src/App.vue:153-195`
  - 工具栏/选择器/抽屉/历史面板/连接菜单渲染：`apps/horizontal-canvas/src/App.vue:12-99`
  - 保存与桥接：`apps/horizontal-canvas/src/App.vue:243-253`
  - 历史栈与快捷键绑定：`apps/horizontal-canvas/src/App.vue:153-168, 331-347`
  - 边插入与右键菜单：`apps/horizontal-canvas/src/App.vue:344-379, 381-387`
  - 预览线挂载与删除恢复：`apps/horizontal-canvas/src/App.vue:318-347, 398-407`

### 调用链路与事件对比（严格 1:1）

- 初始化与注册
  - 原版：在 `index.vue` 注册 `horizontal-node`、初始化 Graph、绑定 connecting/selection/minimap、历史栈监听
  - 现版：`apps/horizontal-canvas/src/App.vue:544-552, 165-223, 226-265` 对齐注册与连接配置（路由/连接器/吸附/最近端口回填）

- 控制器与事件服务
  - 原版：导入并实例化 `CanvasController`（`src/pages/marketing/tasks/horizontal/index.vue:210, 1347`）
  - 现版：同样实例化 `CanvasController` 与 `EventService` 并绑定（`apps/horizontal-canvas/src/App.vue:607-635`），事件服务负责标题/内容区点击、空白点击意图、边工具按钮与菜单

- 节点选择与添加
  - 原版：工具栏 `@add-node` 使用 `anchorRect` 计算选择器位置，`pageToLocal` 转插入点；边中点“+”按钮插入并重连
  - 现版：`apps/horizontal-canvas/src/App.vue:431-454, 582-600, 466-475` 对齐；新增 `onCanvasDrop` 支持拖拽添加（`apps/horizontal-canvas/src/App.vue:606-620`）

- 抽屉打开
  - 原版：内容区点击打开抽屉，标题区仅选中
  - 现版：通过选择器识别与 `node:click` 回退保证点击内容区必打开（`apps/horizontal-canvas/src/pages/horizontal/services/EventService.js` 与 `apps/horizontal-canvas/src/App.vue:602-611`）

- 端口与布局
  - 原版：`fixed-left-y`/`fixed-right-y`，出端口按行 `rowIndex` 均匀分布，元素带 `port-group`/`port` 与 `circle` 标记
  - 现版：`apps/horizontal-canvas/src/App.vue:199-224` 注册布局；`apps/horizontal-canvas/src/pages/horizontal/utils/portConfigFactoryHorizontal.js:13-22, 37-49` 工厂一致；`apps/horizontal-canvas/src/pages/horizontal/HorizontalNode.vue:51-54` 强制端口圆点可见

- 选择器类型白名单
  - 原版：场景化白名单
  - 现版：在工具栏添加、居中添加、边插入三处传入 `presetSlot.allowedTypes`（除 `start` 外全部），模板绑定 `:preset-slot`（`apps/horizontal-canvas/src/App.vue:101-108, 425-428, 451-454, 596-598, 463-466`）

### 问题复核与修复项

- 点击节点无配置抽屉
  - 复核：内容区选择器命名已补齐（`content-area` 与 `row-{idx}`）；事件服务按区域识别；并在 `node:click` 增加回退保证打开
  - 状态：已恢复一致，仍异常时优先检查 `mode=view` 与节点类型是否 `start/end`

- 拖拽节点没有新建
  - 复核：原版支持拖拽节点类型到画布创建；现版新增 `onCanvasDrop`，读取 `dataTransfer.nodeType` 并创建节点
  - 状态：已恢复一致；如仍异常，请检查拖拽源是否写入 `dataTransfer`（`NodeTypeSelector.vue` 已设置）

### 重大差异说明（不影响核心一致性）

- 预览线系统：现版为轻量实现；原版含吸附与性能优化模块。后续如需 1:1 可复制 `src/utils/preview-line/**`。

### 差异统计链接

- 结构化报告 HTML：`reports/diff/index.html`（变更文件数、增删行、API 导出差异、配置与依赖差异）

## 事件服务差异报告（EventService.js 1:1）

- 文件路径：
  - 原版：`src/pages/marketing/tasks/horizontal/services/EventService.js`
  - 新版：`apps/horizontal-canvas/src/pages/horizontal/services/EventService.js`

- 差异点（逐行标注）：
  - 构造函数
    - 原版(16)：无额外属性
    - 新版(16)：删除 `this.shouldOpenOnBlank = deps.shouldOpenOnBlank || (() => false)`（已对齐）
    - 差异类型：新增→删除；对齐后一致
  - 工具函数 `toContainerCoords`
    - 原版(19–27) 与 新版(20–28)：一致
  - 工具函数 `getClickRegion`
    - 原版(29–49) 与 新版(30–49)：一致；新版恢复原版中文注释（常量说明与容忍范围）
  - 边事件（mouseenter/leave/contextmenu）
    - 原版(51–60) 与 新版(51–59)：一致
  - 节点右键菜单（node:contextmenu）
    - 原版(62–79) 与 新版(61–77)：一致
  - 节点离开与按下（mouseleave/mousedown）
    - 原版(81–95) 与 新版(79–91)：一致
  - 节点点击（node:click）
    - 原版(97–153) 与 新版(93–131)：一致（菜单点→菜单；标题→仅选中；内容/行→打开抽屉）
  - 空白点击（blank:click）
    - 原版(155–162) 与 新版(133–140)：一致（设置落点/选择器位置/来源，显示选择器，清理菜单）

- 功能一致性：一致（抽屉打开依赖内容区选择器；标题区仅选中；菜单点弹菜单；空白打开选择器）

## App.vue vs index.vue 事件绑定与交互比对

- 节点选择与抽屉打开：
  - 原版：`index.vue:1319–1326` 仅选择（Ctrl/Meta 多选）；抽屉在 `EventService` 内容区点击触发
  - 新版：`apps/horizontal-canvas/src/App.vue:631–640` 仅选择；抽屉在事件服务内容区点击触发

- 空白点击分工：
  - 原版：`index.vue:1328–1333` 清理选择；`EventService:155–162` 空白打开选择器
  - 新版：`apps/horizontal-canvas/src/App.vue:642–648` 清理选择；`EventService:133–140` 空白打开选择器

- 工具栏与选择器：
  - 原版：`@add-node` 使用 `anchorRect` 计算屏幕坐标，`pageToLocal` 转插入点；边“+”插入并重连
  - 新版：`apps/horizontal-canvas/src/App.vue:431–454, 582–600, 466–475` 对齐；并支持拖拽到画布创建（`onCanvasDrop:487–499`）

- 连接配置与吸附：
  - 原版：connecting 校验、最近输入端口回填、smooth connector/router
  - 新版：`apps/horizontal-canvas/src/App.vue:165–223, 226–265` 对齐（校验 `out→in`，最近端口吸附回填）

- 键盘与历史：
  - 原版：Ctrl/Meta 控制橡皮框与 panning；历史由页面管理
  - 新版：`apps/horizontal-canvas/src/App.vue:454–471, 656–658` 对齐；历史按钮在工具栏隐藏但功能一致

- 布局注册与端口位置：
  - 原版：`fixed-left-y/fixed-right-y` 与绝对坐标组合；`rowIndex` 驱动内容行中点
  - 新版：`apps/horizontal-canvas/src/App.vue:325–351` 与 `portConfigFactoryHorizontal.js:41–61` 对齐（输入端口使用内容区几何中心 + 基线调整；输出端口为每行中点 + 基线调整、钳制在内容区范围）

### 差异与说明

- 新版曾存在构造额外属性与重复空白监听，现已删除并保留单一职责，分工与原版一致。
- 若仍出现“只选中不打开抽屉”，请确认节点模板选择器：
  - `BaseNode.vue`：`header/header-icon/header-icon-text/header-title/header-menu/menu-dot-0/1/2/content-area/node-root`
  - `HorizontalNode.vue`：`content-area` 与每行 `row-{idx}`


## 组件与组合函数复用
- 复用宿主组件（通过别名 `@host`）
  - `CanvasToolbar.vue`、`CanvasHistoryPanel.vue`、`CanvasDebugPanel.vue`、`CanvasStatisticsPanel.vue`、`TaskFlowConfigDrawers.vue`、`NodeTypeSelector.vue`、`ConnectionContextMenu.vue`
- 复用宿主组合函数
  - `useCanvasHistory.js`（含撤销/重做与快捷键）
  - `useConfigDrawers.js`（统一配置抽屉更新路径）
  - `usePreviewLine.js`（统一预览线系统，已初始化与删除恢复接入）
- 节点基础与样式
  - 子应用 `BaseNode.vue` 与 `HorizontalNode.vue` 统一使用宿主 `@host/utils/nodeTypes.js` 配置（apps/horizontal-canvas/src/components/nodes/BaseNode.vue:1-20；apps/horizontal-canvas/src/pages/horizontal/HorizontalNode.vue:1-22）

## 行为一致性矩阵
- 画布缩放/复位/居中/设置缩放：一致（apps/horizontal-canvas/src/App.vue:249-254）
- 快速布局：一致（apps/horizontal-canvas/src/App.vue:255-262）
- 添加节点与类型选择器：一致（apps/horizontal-canvas/src/App.vue:264-285）
- 双击节点打开抽屉：一致（apps/horizontal-canvas/src/App.vue:336-342）
- 撤销/重做与历史栈：一致（apps/horizontal-canvas/src/App.vue:153-168, 331-347）
- 边插入按钮与右键菜单：一致（apps/horizontal-canvas/src/App.vue:344-379, 381-387）
- 最小地图开关：一致（apps/horizontal-canvas/src/App.vue:60-76, 420-426）
- 调试与统计面板开关：一致（apps/horizontal-canvas/src/App.vue:12-60）
- 保存数据结构（含 `type/config`）：一致（apps/horizontal-canvas/src/App.vue:243-253）
- 预览线删除恢复：已接入（apps/horizontal-canvas/src/App.vue:398-407）
- 预览线拖拽创建与吸附转换：待补齐端口事件绑定（宿主参考 `usePreviewLine.js:25-842`）

## 差距与待办
- 任务列表页未迁移到子应用：当前由宿主 `src/pages/marketing/tasks/index.vue` 提供，需在子应用新增 `/tasks` 并通过 `vue-router` 管理列表与编辑页跳转。
- 预览线在端口拖拽过程的完整联动尚未绑定：需在子应用绑定端口层级事件（创建/吸附/转换/清理），对齐宿主 `usePreviewLine` 的控制器配置与性能优化模块。
- 性能监控模块：需开启 `SpatialIndexOptimizer/BatchProcessor/CacheManager` 并打通统计面板数据源，保持大图交互性能一致（参考 `src/pages/marketing/tasks/composables/canvas/usePreviewLine.js:126-168, 322-352`）。

## 风险与注意事项
- 列表页迁移的消息协议：需要定义 `queryTasks/save/delete/publish` 等消息，避免跨应用数据不一致。
- 依赖一致性：确保子应用与宿主的 `Vue/X6/Arco` 版本一致，子应用 `vite.config.ts` 别名与 `server.fs.allow` 已配置可复用宿主源码。
- 事件绑定复杂度：端口拖拽与预览线吸附需谨慎处理状态与性能；优先复用宿主 `CanvasController/EventService` 的事件映射。

## 验证点
- 页面：
  - 宿主列表页：`http://localhost:5174/marketing/tasks`
  - 宿主横版画布：`http://localhost:5174/marketing/tasks/horizontal?mode=create`
  - 子应用画布：`http://localhost:5175/`
- 测试用例（宿主参考路径）
  - 画布综合场景：`src/tests/marketing/canvas/CanvasComplexScenarioTests.test.js`
  - 预览线集成：`src/tests/marketing/canvas/PreviewLineIntegrationTests.test.js`
  - 抽屉与配置保存：`src/tests/marketing/canvas/NodeDrawerTests.test.js`
  - 历史撤销与删除恢复：`src/tests/marketing/canvas/ConnectionDeleteAndPreview.test.js`

## 结论与下一步
- 画布端迁移已达“可用且基本一致”的程度；差距主要在“子应用任务列表页”与“预览线拖拽联动”。
- 建议立即实施：
  1) 在子应用新增 `/tasks` 列表页与路由；
  2) 绑定 `usePreviewLine` 的端口拖拽事件（创建/吸附/转换/清理），统一控制器与性能优化；
  3) 完成端到端验证与必要的对齐测试。
