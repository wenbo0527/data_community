# 横版任务模块架构文档（基于原版列表页与画布页）

## 页面与路由
- 列表页：`src/pages/marketing/tasks/index.vue`
- 画布页：`src/pages/marketing/tasks/horizontal/index.vue`
- 路由：`/marketing/tasks`（列表）与 `/marketing/tasks/horizontal`（画布）

## 技术栈
- 图引擎：`@antv/x6`、`@antv/x6-vue-shape`
- 插件：`Selection`、`MiniMap`、`History`、`Keyboard`
- UI：`@arco-design/web-vue`
- 框架：Vue 3 + Vite

## 列表页职责
- 管理任务数据（本地存储 + 示例数据融合）
- 展示任务、版本、状态与操作（编辑、查看、发布、删除）
- 跳转到画布页进行编辑或查看

## 画布页职责
- 初始化 X6 Graph 与相关插件
- 节点/边的创建、选择、删除、上下文菜单与连接规则
- 历史撤销/重做与快捷键绑定
- 小地图、辅助线、快速布局与统计面板
- 任务保存/发布与校验

## 连接规则（connecting）
- 端口组：仅允许 `out → in`
- 唯一性：源端口唯一；同源端口重复连接拦截
- 最近端口回填：在连接完成时吸附最近的输入端口
- 路由/连接器：`router: normal`、`connector: smooth`
- 连接点：`connectionPoint: boundary(anchor: center)`

## 键盘与历史
- 历史：启用 `History`，忽略 `tools` 改变；监听 `history:change`
- 快捷：撤销/重做、缩放、删除、复位、适配、快速布局
- 选择：Ctrl/Meta 门控橡皮框，空白点击清理选择

## 端口布局与样式常量
- 常量：`NODE_DIMENSIONS`、`TYPOGRAPHY`、`POSITIONS` 等
- 布局注册：`fixed-left-y`、`fixed-right-y`（行中点 + 基线调整）
- 输入端口：居中对齐；输出端口：按内容行中点对齐

## 组件与服务
- 组件：`HorizontalNode.vue`、`CanvasToolbar.vue`、`CanvasHistoryPanel.vue`、`CanvasDebugPanel.vue`、`NodeTypeSelector.vue`、`CanvasStatisticsPanel.vue`
- 服务：`CanvasController.js`（画布控制）、`EventService.js`（交互事件，菜单/标题/内容区行为）
- 组合式函数：`useGraphInstance`、`useConfigDrawers`、`useCanvasHistory`

## 任务数据与存储
- 工具：`TaskStorage`（创建/更新/删除/统计）
- 数据结构：`canvasData = { nodes, connections }`
- 保存/发布：编辑模式版本递增；发布前校验节点配置与连通性

## 预览线与边插入
- 悬停边显示“+”按钮；点击弹选择器后插入节点并重连两段边
- 边右键菜单：删除连接、（可选）恢复预览线

## 验证清单
- 标题区点击只选中；菜单点只弹菜单；内容区点击打开抽屉
- 空白点击：事件层弹选择器，页面层清理选择
- 连接规则与唯一性校验与原版一致
- 端口布局严格按行中点与基线调整对齐
