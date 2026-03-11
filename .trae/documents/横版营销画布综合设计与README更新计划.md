# 横版营销画布综合设计与README更新计划

## 一、项目结构分析（src/pages/marketing）
- 顶层页面
  - `alert/*` 预警相关
  - `benefit/*` 权益相关（包/模板/管理）
  - `coupon/*` 优惠券相关（创建/模板/库存/统计等）
  - `global/*` 全局规则
  - `tasks/*` 营销画布与任务模块（核心）
- tasks 核心模块结构
  - `components/` 画布与抽屉组件、工具面板、右键菜单
    - `TaskFlowCanvas.vue`、`TaskFlowCanvasRefactored.vue`（主画布）
    - `TaskFlowConfigDrawers.vue` + 各类型抽屉（Start/CrowdSplit/EventSplit/AB/SMS/AI/Manual/Wait/Benefit）
    - `components/canvas/*`（NodeTypeSelector、FlowNode、ConnectionContextMenu 等）
  - `composables/canvas/*` 画布功能分层（连接、节点、拖拽、布局、抽屉、统一边管理等）
    - `useConfigDrawers.js`（抽屉管理）
    - `useCanvasConnections.js` / `useCanvasNodes.js` 等
    - `core/*`（ConnectionCreationController、PortConfigurationFactory 等）
    - `unified/*`（UnifiedEdgeManager、ConnectionLimitManager 等）
  - `utils/canvas/*` 画布工具与配置
    - `canvasConfig.js`、`x6Config.js`、`connectionConfigFactory.js`
    - `NodeConfigManager.js`、`GraphOperationUtils.js`、`enhancedCanvasValidation.js`
    - 布局与性能优化系列（layout/*、performance/*）
  - `types/*` 类型定义与接口（`core.ts`、`config.ts`、`services.ts`、`workflow.ts` 等）
  - `services/*` 服务抽象与适配（Graph/Layout/Preview/State）
  - `horizontal/index.vue` 横版画布入口与端口工厂（`horizontal/utils/portConfigFactoryHorizontal.js`）
  - `create.vue` / `index.vue` / `task-editor.vue`（创建/列表/编辑页面）
  - `README.md` 模块说明

## 二、README 更新提案（覆盖现版并强化横版）
- 标题：营销任务流程画布系统 - 模块说明与横版工作流
- 新增章节
  1) 模块概览与横版工作流简介
  2) 目录结构与职责映射（列出 components/composables/utils/types/services/tests）
  3) 数据契约与导入/导出接口（`CanvasData = { nodes, connections }`；`getCanvasData/loadCanvasData`）
  4) 抽屉系统与节点点击行为（`useConfigDrawers.openConfigDrawer`）
  5) 横版画布特性
     - 左进右出端口（`portConfigFactoryHorizontal.js:6,21`）
     - 连接校验（`horizontal/index.vue:115-141`）与右键删除（`horizontal/index.vue:179`）
     - 连接线上“+”插入（`horizontal/index.vue:149-177, 262-271`）
  6) 节点“标题行 + 内容行”结构与分流端口对齐规则
  7) 类型图标映射与视觉规范
  8) 发布校验与错误态（所有 `out` 必须连接；错误清单格式）
  9) 性能优化与风险回退（foreignObject vs SVG 文本）
- 代码引用示例
  - 主画布导出：`src/pages/marketing/tasks/components/TaskFlowCanvasRefactored.vue:3318`
  - 导入：`TaskFlowCanvasRefactored.vue:3337`
  - 抽屉打开：`src/pages/marketing/tasks/composables/canvas/useConfigDrawers.js:84`
  - 横版入口：`src/pages/marketing/tasks/horizontal/index.vue:86`

## 三、融合文档的设计方案（产品 + 架构）
- 节点卡片结构
  - 标题行：类型图标 + 标题文本（优先 `config.nodeName`）；右上“⋯”更多（非 start/end）
  - 内容行：逐行展示；分流类每分支一行；右侧 `out-i` 与行中点对齐；左侧中点 `in`
  - 尺寸：宽 `280`；高度 = 标题 + 内容行数 × 行高（`24–28`）；文本截断 + 悬停
- 类型图标映射（可替换为 Arco Icons 或项目图标库）
  - `start: IconPlayCircle`、`audience-split: IconUserGroup`、`event-split: IconCalendarClock`、`ab-test: IconBranch`、`sms: IconMessage`、`email: IconMail`、`wechat: IconWechat`、`ai-call: IconRobot`、`manual-call: IconPhone`、`wait: IconTime`、`benefit: IconGift`、`end: IconStopCircle`
- 交互规则
  - 点击节点打开抽屉（统一 `openConfigDrawer(type, node, data)`；`horizontal/index.vue:194`）
  - 从 `out` 到 `in` 手动拖拽连线；方向与单连接限制（`horizontal/index.vue:115-141`）
  - 右键连接线删除（`horizontal/index.vue:179`）；“+”插入节点默认保留分流至 `out-0`（`horizontal/index.vue:268-271`）
  - 标题行右上“⋯”更多：重命名（更新 `config.nodeName` 并刷新标题）、复制（偏移位置创建同配置）、删除（线性级联）
- 数据契约与互通
  - 保持 `{ nodes, connections }`、端口命名 `out-i` 与 `in`，导入/导出对齐原版（`TaskFlowCanvasRefactored.vue:3318, 3337`）
  - 分流类 `outCount = 内容行数（含未命中）`；非分流类 `outCount = 1`
- 发布校验与错误态
  - 所有 `out` 必须连接；错误输出 `{ nodeId, portId }`；阻止发布并高亮提示
  - 可选 `previewLines` 自动补 `end` 节点（`enhancedCanvasValidation.js`）
- 性能与风险
  - 100+ 节点渲染：缓存派生行与端口映射；必要时回退纯 SVG 文本
  - 风险：foreignObject 兼容、类型枚举不一致（PortConfigurationFactory 修正与统一常量）

## 四、里程碑与任务拆分
- 阶段 1：README 更新（结构、接口、横版特性、视觉与交互规范）
- 阶段 2：横版节点渲染层（标题/内容分组、端口对齐算法、图标与菜单）
- 阶段 3：交互增强（右键连接删除、“+”插入、更多菜单操作联动）
- 阶段 4：发布校验与错误态（未连满拦截与标注）
- 阶段 5：性能与兼容验证（高节点量、foreignObject 回退策略）

## 五、关键引用（用于设计落地）
- 横版初始化与校验：`src/pages/marketing/tasks/horizontal/index.vue:86-146, 115-141`
- 删除与插入：`horizontal/index.vue:179, 149-177, 262-271`
- 抽屉系统：`useConfigDrawers.js:84, 201, 315`；接入点：`horizontal/index.vue:18, 194, 332, 447`
- 端口工厂（横向）：`horizontal/utils/portConfigFactoryHorizontal.js:6,21`
- 导入/导出：`TaskFlowCanvasRefactored.vue:3318, 3337`

确认后，我将：
1) 将 README 新版内容更新到 `src/pages/marketing/tasks/README.md`；
2) 在现有需求文档中追加“产品化画布需求设计补充”章节（标题/内容映射表、类型图标清单、交互细则、验收用例、性能与风险）。