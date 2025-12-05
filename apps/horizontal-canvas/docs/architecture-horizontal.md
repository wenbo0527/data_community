# 横版任务模块架构文档（基于原版列表页与画布页）

> 版本记录
> - 2025-11-27：同步最新重构进度，服务化 Graph/Layout/State，补充节点插入与调试辅助，移除预览线相关描述，统一术语与示例风格。

## 页面与路由
- 列表页：`src/pages/marketing/tasks/index.vue`
- 画布页：`src/pages/marketing/tasks/horizontal/index.vue`
- 路由：`/marketing/tasks`（列表）与 `/marketing/tasks/horizontal`（画布）

## 技术栈
- 图引擎：`@antv/x6`、`@antv/x6-vue-shape`
- 插件：`Selection`、`MiniMap`、`History`、`Keyboard`
- UI：`@arco-design/web-vue`
- 框架：Vue 3 + Vite
- 服务化：`GraphService.ts`（插件生命周期/图初始化/快捷键）、`LayoutService.ts`（快速/结构化布局与顶点清理）、`useCanvasState.ts`（UI 状态联动/小地图/面板位置与尺寸）、`useNodeInsertion.ts`（节点插入流程）、`DebugHelpers.ts`（调试入口迁移）

## 列表页职责
- 管理任务数据（本地存储 + 示例数据融合）
- 展示任务、版本、状态与操作（编辑、查看、发布、删除）
- 跳转到画布页进行编辑或查看

## 画布页职责
- 通过 `GraphService.createGraph` 初始化 Graph 与默认配置（背景/网格/滚动/对齐线/平移/滚轮/高亮）。
- 通过 `GraphService.useHistory/useKeyboard/useSelection` 注册插件，`bindDefaultShortcuts` 绑定快捷键，`configureSelectionRubberbandGate` 管理橡皮框门控。
- 节点/边的创建、选择、删除、上下文菜单与连接规则；节点插入流程由 `useNodeInsertion` 统一管理。
- 小地图开关与定位通过 `GraphService.toggleMinimap` 与 `useCanvasState` 组合实现。
- 快速布局与结构化布局由 `LayoutService.applyQuickLayout/applyStructuredLayout` 负责，并统一进行边顶点清理与视图适配。
- 统计面板与调试面板的位置与尺寸联动由 `useCanvasState` 负责；调试入口仅保留，逻辑迁移到 `DebugHelpers.ts`。
- 任务保存/发布与校验；保存数据采集使用 `collectCanvasData`。

## 连接规则（connecting）
- 端口组：仅允许 `out → in`
- 唯一性：源端口唯一；同源端口重复连接拦截
- 最近端口回填：在连接完成时吸附最近的输入端口
- 路由/连接器：`router: normal`、`connector: smooth`
- 连接点：`connectionPoint: boundary(anchor: center)`
 - 分支标识：分流/AB 节点的出边需携带 `edge.data.branchId` 并与节点 `config.branches` 对齐。

## 键盘与历史
- 历史：启用 `History` 插件并监听 `history:change`；通过 `GraphService.useHistory` 集成。
- 快捷：撤销/重做、缩放、删除、复位、适配、快速布局、复制、粘贴，通过 `GraphService.bindDefaultShortcuts` 统一绑定。
- 选择：`GraphService.configureSelectionRubberbandGate` 管理 Ctrl/Meta 橡皮框门控；空白点击清理选择。

## 端口布局与样式常量
- 常量：`NODE_DIMENSIONS`、`TYPOGRAPHY`、`POSITIONS` 等
- 布局注册：`fixed-left-y`、`fixed-right-y`（行中点 + 基线调整）
- 输入端口：居中对齐；输出端口：按内容行中点对齐

### 节点统一更新与样式要点（当前实现）
- 统一更新：页面 `updateNodeFromConfigUnified` 与服务层 `updateNodeUnified`
- 差异更新端口：保留已连接端口并更新属性，新增端口按 `out-N` 规则添加
- 样式渲染：`HorizontalNode.vue` 支持自适应布局（`flex`）与非自适应绝对定位行渲染
- 行定位：非自适应 `top = idx * (ROW_HEIGHT + ROW_GAP)`；自适应通过 DOM 测量写回 `verticalOffsets`
- 端口对齐：右侧 `out` 端口按内容行几何中点对齐（考虑 `CONTENT_BASELINE_ADJUST`）
- AB 实验标签：已删除 `.ab-test__experiment` 与对应内容展示

## 组件与服务
- 组件：`HorizontalNode.vue`、`CanvasToolbar.vue`、`CanvasHistoryPanel.vue`、`CanvasDebugPanel.vue`、`NodeTypeSelector.vue`、`CanvasStatisticsPanel.vue`
- 服务：`graph/GraphService.ts`、`layout/LayoutService.ts`、`debug/DebugHelpers.ts`
- 组合式函数：`state/useCanvasState.ts`、`composables/useNodeInsertion.ts`、`useConfigDrawers`、`useCanvasHistory`

## 任务数据与存储
- 工具：`TaskStorage`（创建/更新/删除/统计）
- 数据结构：`canvasData = { nodes, connections }`
- 保存/发布：编辑模式版本递增；发布前校验节点配置与连通性与分支完整性
- 采集：`collectCanvasData(graph)` 替代旧版 `getCanvasData()`。

## 边插入与右键菜单
- 悬停边显示“+”按钮；点击弹选择器后插入节点并自动重连两段边
- 边右键菜单：仅提供删除连接与关闭
 - 节点插入与收尾：通过 `useNodeInsertion.insertNodeAndFinalize` 完成端口修正、历史入栈与持久化回调。

## 验证清单
- 标题区点击只选中；菜单点只弹菜单；内容区点击打开抽屉
- 空白点击：事件层弹选择器，页面层清理选择
- 连接规则与唯一性校验与原版一致
- 端口布局严格按行中点与基线调整对齐
- 查看模式：删除/右键删除/端口菜单删除均屏蔽；快捷键删除无效。

## 示例：节点插入流程（摘要）
```ts
import { insertNodeAndFinalize } from '@/pages/marketing/tasks/horizontal/composables/useNodeInsertion'
import { useCanvasState } from '@/pages/marketing/tasks/horizontal/state/useCanvasState'

function handleNodeTypeSelected(nodeType) {
  const node = insertNodeAndFinalize(
    graph,
    nodeType,
    pendingCreatePoint,
    pendingInsertionEdge,
    getNodeLabel,
    createVueShapeNode,
    {
      onPersist: (g, n) => {
        const data = collectCanvasData(g)
        TaskStorage.updateTask(editingTaskId, { canvasData: data, updateTime: new Date().toLocaleString('zh-CN') })
      },
      onAfter: () => { useCanvasState().hideNodeSelector(showNodeSelector) }
    }
  )
  pendingInsertionEdge = null
  return node
}
```
