# 项目常见问题与操作指南（FAQ / Guides）

> 版本记录
> - 2025-11-27：补充节点插入 `useNodeInsertion`、插件管理与选择门控、保存数据采集 `collectCanvasData`、发布校验分支与端口完整性；统一示例与术语。

## 新增节点操作指南
### 步骤
1. 定义节点类型与显示行
   - 位置：`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/createVueShapeNode.js`
   - 在创建节点工厂的入参中添加你的 `nodeType` 与 `displayLines`。
   ```js
   // createVueShapeNode.js
   export function createVueShapeNode({ id, x, y, label, outCount, data }) {
     // 传入 data.nodeType，例如 'my-node'
   }
   ```
2. 配置端口布局（横向）
   - 位置：`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/utils/portConfigFactoryHorizontal.js`
   - 为新节点的内容行数设置 `verticalOffsets`，保证出端口与内容对齐。
   ```js
   // portConfigFactoryHorizontal.js（示例）
   const verticalOffsets = rows.map((_, i) => header + padding + i * rowHeight + Math.floor(rowHeight/2) + baseline)
   ```
3. 注册 Vue Shape（若需要自定义渲染）
   - 位置：`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/index.vue:917–921`
   ```js
   import { register } from '@antv/x6-vue-shape'
   register({ shape: 'horizontal-node', component: HorizontalNode })
   ```
4. 在工具栏或节点选择器中暴露该类型（可选）
   - 位置：`apps/horizontal-canvas/src/components/canvas/NodeTypeSelector.vue`

5. 在页面中使用 `useNodeInsertion` 完成插入与收尾（端口修正 / 历史入栈 / 持久化）
   - 位置：`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/composables/useNodeInsertion.ts`
   ```ts
   import { insertNodeAndFinalize } from './composables/useNodeInsertion'
   import { useCanvasState } from './state/useCanvasState'

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

### 代码示例
```ts
// 使用 useNodeInsertion 插入并完成端到端收尾
insertNodeAndFinalize(graph, 'my-node', { x: 200, y: 120 }, null, getNodeLabel, createVueShapeNode, {
  onPersist: (g, n) => { TaskStorage.updateTask(editingTaskId, { canvasData: collectCanvasData(g) }) },
  onAfter: () => { useCanvasState().hideNodeSelector(showNodeSelector) }
})
```

## 修改节点样式指南
### 样式文件位置
- `apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/styles/nodeStyles.js`
  - 尺寸：`NODE_DIMENSIONS`（`WIDTH/MIN_HEIGHT/HEADER_HEIGHT/ROW_HEIGHT/CONTENT_PADDING` 等）
  - 颜色：`COLORS`
  - 文本：`TYPOGRAPHY`

### 可配置参数与覆盖规则
- 通过样式常量影响节点渲染几何与文本基线（`CONTENT_BASELINE_ADJUST`）。
- 页面级覆盖：在 `index.vue` 使用 `:deep(.x6-node ...)` 进行选择器覆盖。
```css
.canvas-container :deep(.x6-node.x6-node-selected) { filter: drop-shadow(0 4px 12px rgba(76,120,255,.15)); }
```

### 代码入口与修改范式（详细说明，已与现状同步）
- 样式常量与基础样式
  - 尺寸常量：`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/styles/nodeStyles.js:1`
  - 颜色常量：`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/styles/nodeStyles.js:15`
  - 文本常量：`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/styles/nodeStyles.js:39`
  - 位置常量：`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/styles/nodeStyles.js:57`
  - 基础样式生成：`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/styles/nodeStyles.js:96`
  - 交互态样式：`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/styles/nodeStyles.js:153`
  - 端口样式：`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/styles/nodeStyles.js:158`
- Vue Shape 组件渲染（内容与行样式）
  - 组件：`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/HorizontalNode.vue`（内容容器与每行 `port-indicator`）
  - 行定位算法：非自适应模式按 `top = idx * (ROW_HEIGHT + ROW_GAP)` 绝对定位；`start` 节点合并行展示
  - 自适应模式：内容容器使用 `flex` 布局，渲染后通过 DOM 测量写回 `verticalOffsets` 并调用 `setPortProp` 以绝对坐标对齐右侧端口
  - 行样式（CSS）：`port-indicator/port-indicator--out/port-indicator__label` 渐变与轻边框，悬停轻微提升
- 视图工厂与尺寸/端口对齐（与常量联动）
  - 尺寸计算：`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/createVueShapeNode.js:63`
  - 端口对齐（内容区起止与行中点）：`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/createVueShapeNode.js:80`

### 常见改动示例（操作路径）
- 调整节点高度/行高
  - 修改 `ROW_HEIGHT` 与 `CONTENT_PADDING`：`nodeStyles.js:1`
  - 同步影响：`createVueShapeNode.js:63` 的高度计算与 `HorizontalNode.vue:76` 的行定位
- 调整标题与图标位置
  - 修改 `POSITIONS`：`nodeStyles.js:57`（如 `TITLE_X/TITLE_Y/ICON_TEXT_X/ICON_TEXT_Y`）
  - 基础样式引用：`getBaseNodeStyles` 设置到 `header/header-icon/header-icon-text/header-title`：`nodeStyles.js:96`
- 调整端口外观
  - 修改端口半径/颜色：`getPortStyles`：`nodeStyles.js:158`
  - 行对齐与端口位置由端口工厂与行定位共同决定：`createVueShapeNode.js:80`、`HorizontalNode.vue`

### 当前改动摘要（样式相关）
- AB 实验节点内容展示：已移除 `HorizontalNode.vue` 的 `.ab-test__experiment` 与对应内容，不再显示 “实验：{experimentName}”
- 节点菜单交互：增加透明遮罩与全局点击关闭；菜单随节点移动实时重算位置

### 节点样式详解（结构/高度/对齐）
- 几何分区
  - Header：标题与图标区域，高度由 `NODE_DIMENSIONS.HEADER_HEIGHT` 控制（`styles/nodeStyles.js:4`）。
  - Content：内容行区域，起止由 `CONTENT_PADDING` 与 `CONTENT_SPACING.top/bottom/gap` 控制（`styles/nodeStyles.js:8,9`）。
  - Ports：端口半径与颜色由 `PORT_RADIUS/PORT_FILL_*` 等控制（`styles/nodeStyles.js:13,32–39`）。
- 非自适应渲染（绝对定位）
  - 行定位：`top = idx * (ROW_HEIGHT + ROW_GAP)`（`HorizontalNode.vue:104–106`）。
  - 节点高度：`height = HEADER_HEIGHT + CONTENT_PADDING + top + rows*ROW_HEIGHT + gaps*ROW_GAP + bottom`（`createVueShapeNode.js:63–69`）。
  - 端口位置：右侧绝对坐标 `{ x: WIDTH, y: yRel }`，`yRel` 按内容行几何中点计算（`portConfigFactoryHorizontal.js:54–75`）。
- 自适应渲染（flex + 测量）
  - 开关：`NODE_DIMENSIONS.ADAPTIVE_CONTENT_LAYOUT`（`styles/nodeStyles.js:7`）。
  - 内容容器：`flex` 列布局，使用 `CONTENT_SPACING` 的 `gap/top/bottom`（`HorizontalNode.vue:91–95`）。
  - 行中点测量并写回端口：渲染后通过 DOM `getBoundingClientRect()` 计算行中点，更新 `verticalOffsets` 并 `setPortProp`（`HorizontalNode.vue:108–137`）。

### 高度修改指南（Header/Content/Row）
- 修改 Header 高度
  - 更新 `NODE_DIMENSIONS.HEADER_HEIGHT`（`styles/nodeStyles.js:4`）。
  - 同步影响：标题与图标的 `refY` 对齐（`styles/nodeStyles.js:131–151`）、内容起点 `contentStart`（`createVueShapeNode.js:89`）。
- 修改行高与行距
  - 更新 `NODE_DIMENSIONS.ROW_HEIGHT` 与 `NODE_DIMENSIONS.ROW_GAP`（`styles/nodeStyles.js:5–6`）。
  - 同步影响：节点高度计算（`createVueShapeNode.js:68–69`）、端口 `yRel` 计算（`portConfigFactoryHorizontal.js:71`）。
- 修改内容区内边距与上下间距
  - `CONTENT_PADDING` 控制 header 与内容之间的固定间距（`styles/nodeStyles.js:9`）；
  - `CONTENT_SPACING.top/bottom/gap` 控制内容区上下与各行的额外间距（`styles/nodeStyles.js:8`）。
  - 同步影响：`contentStart/contentEnd`（`createVueShapeNode.js:89–91`）、端口工厂 `start/end`（`portConfigFactoryHorizontal.js:54–58`）。

### 添加新的内容（显示行）
- 通过配置直接注入
  - 在节点 `data.config.displayLines` 中传入字符串数组，即可作为显示行渲染（`HorizontalNode.vue:167–183`）。
  - 注意：如果仅为类型标签的兜底行，将被清理为空（`HorizontalNode.vue:175–201`）。
- 通过视图工厂生成
  - 在 `buildDisplayLines(nodeType, config)` 中为你的节点类型追加业务行（`createVueShapeNode.js:6–53`）。
  - 示例：为 `manual-call` 增加一行“坐席：{name}”。
  ```js
  // apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/createVueShapeNode.js
  } else if (nodeType === 'manual-call') {
    if (config?.agentName) lines.push(`坐席：${config.agentName}`)
  }
  ```
- 通过顶层数据注入
  - 在节点 `data.displayLines` 顶层提供显示行（`HorizontalNode.vue:184–193`）。
  - 仍遵循兜底清理逻辑，避免仅显示类型标签。

### 实操示例（调整高度并新增一行）
```diff
// apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/styles/nodeStyles.js
 export const NODE_DIMENSIONS = {
-  HEADER_HEIGHT: 32,
-  ROW_HEIGHT: 28,
-  ROW_GAP: 4,
-  CONTENT_SPACING: { top: 12, gap: 8, bottom: 12 },
+  HEADER_HEIGHT: 36,
+  ROW_HEIGHT: 32,
+  ROW_GAP: 6,
+  CONTENT_SPACING: { top: 16, gap: 10, bottom: 16 },
 }

// apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/createVueShapeNode.js
 } else if (nodeType === 'sms') {
   if (config?.smsTemplate) lines.push(`短信模板：${config.smsTemplate}`)
+  if (config?.channel) lines.push(`渠道：${config.channel}`)
 }
```

### 校验与可视化对齐（推荐）
- 端口位置验证：启用 `enableValidation`，查看 `portConfig._validation`（`portConfigFactoryHorizontal.js:80–87`）。
- 行中点对齐原则：确保“内容行几何中点 = 输出端口 Y”，必要时校准 `TYPOGRAPHY.CONTENT_BASELINE_ADJUST`（`styles/nodeStyles.js:53`）。
### 修改建议
- 先在 `nodeStyles.js` 调整常量，再通过 `HorizontalNode.vue` 的行定位观察实际对齐；必要时校准 `CONTENT_BASELINE_ADJUST`（`nodeStyles.js:39`）。
- 保持“内容行几何中点 = 输出端口 Y”的一致性，避免出现端口与文本不对齐。

## 修改抽屉内容指南
### 抽屉结构
- 汇总抽屉：`apps/horizontal-canvas/src/components/task/TaskFlowConfigDrawers.vue`
- 单节点抽屉：`apps/horizontal-canvas/src/components/task/*NodeConfigDrawer.vue`

### 事件与绑定（统一更新路径）
- 统一事件：`@config-confirm`、`@config-cancel`、`@visibility-change`
- 页面代理写回：通过 `updateNodeFromConfigUnified`（页面）与 `updateNodeUnified`（服务层）统一更新节点
```vue
<TaskFlowConfigDrawers
  :drawer-states="configDrawers.drawerStates"
  :read-only="isViewMode"
  @config-confirm="handleConfigConfirmProxy"
  @config-cancel="handleConfigCancelProxy"
  @visibility-change="handleDrawerVisibilityChange"
/>
```

## 修改数据格式指南
### 数据结构规范
- `TaskStorage`：`apps/horizontal-canvas/src/utils/taskStorage.js`
  - 任务：`{ id, name, status, version, canvasData }`
  - 画布：`canvasData = { nodes: [], connections: [] }`

### 转换与迁移
- `migrateCanvasData`：补齐节点 `config/isConfigured` 与连接的 `branchId`（AB 实验）。
```js
function migrateCanvasData(canvasData) {
  // 为 AB 实验补齐分支 id/label 与连接 branchId
}
```

### 数据验证规则（示例）
- 发布校验：节点需已配置、连接方向合法；校验失败弹窗提示。
`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/index.vue`

## 统计面板与分支人数（操作要点）
- 画布级 KPI：按时间筛选范围统计运行天数、累计进入人次、策略结束。
- 节点级趋势：每日进入/出双柱图；明细表含分支列。
- 分支人数：
  - AB 实验按分支百分比分配。
  - 人群/事件分流按出边权重分配（mock 使用稳定权重，实际接入后基于后端数据）。

## 查看模式限制
- 查看模式禁止连线删除：右键菜单、端口菜单、键盘删除均已屏蔽。
  - 参考：`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/index.vue`

## 节点保存的数据格式与相关代码
### 数据格式
- 保存/发布时的画布数据通过 `collectCanvasData(graph)` 生成：
  - `nodes`: `[{ id, type, x, y, label, config, isConfigured, branches }]`
  - `connections`: `[{ id, source, target, sourcePortId, targetPortId }]`

### 采集代码
- 函数位置：`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/index.vue`
```js
function collectCanvasData(graph) {
  const nodes = (graph.getNodes?.() || []).map(n => ({
    id: n.id,
    type: (n.getData?.() || {}).nodeType || 'node',
    x: (n.getPosition?.() || {}).x,
    y: (n.getPosition?.() || {}).y,
    label: (n.getData?.() || {}).nodeName || (n.getData?.() || {}).headerTitle || '',
    config: (n.getData?.() || {}).config || {},
    isConfigured: (n.getData?.() || {}).isConfigured === true,
    branches: Array.isArray((n.getData?.() || {}).config?.branches) ? (n.getData?.() || {}).config.branches : []
  }))
  const connections = (graph.getEdges?.() || []).map(e => ({
    id: e.id,
    source: (e.getSource?.() || {}).cell,
    target: (e.getTarget?.() || {}).cell,
    sourcePortId: e.getSourcePortId?.() || null,
    targetPortId: e.getTargetPortId?.() || null
  }))
  return { nodes, connections }
}
```

### 保存/发布的数据载体
- 保存：`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/index.vue:3967–3976`
- 发布：`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/index.vue:4056–4066`
```js
const saveData = { name, description, version, type: 'marketing', status: 'draft', canvasData, updateTime, creator }
const publishData = { name, description, version, type: 'marketing', status: 'published', canvasData, publishTime, updateTime, creator }
```

## 发布校验规则（修改说明）
### 调用入口
- `apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/index.vue:4030–4035`

### 校验项摘要
- 基础结构：画布数据格式、至少一个节点、存在开始节点。
- 配置完整性：除开始/结束外必须有非空 `config` 或 `isConfigured = true`。
- 连通性：除结束外，至少有一条出边。
- 端口校验（新增）：每个节点的 `out` 端口都需连上目标（通过 X6 图实例核对）。
- 分流分支校验（新增）：`audience-split/event-split/ab-test` 每个分支需存在连线（按 `edge.data.branchId` 比对）。

### 代码位置
- 函数：`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/index.vue`
```js
const validateCanvasForPublish = (canvasData) => {
  // ... 基础校验略
  // 端口连接缺失收集
  if (graph) {
    const missingPortConnections = []
    const missingBranchConnections = []
    const x6Nodes = graph.getNodes?.() || []
    x6Nodes.forEach(node => {
      const ports = (node.getPorts?.() || []).filter(p => p.group === 'out')
      const outs = graph.getOutgoingEdges?.(node) || []
      const connectedPortIds = new Set(outs.map(e => e.getSourcePortId?.()).filter(Boolean))
      ports.forEach(p => { if (!connectedPortIds.has(p.id)) missingPortConnections.push(`${node.id}#${p.id}`) })
      // 分流分支
      // 根据 edge.data.branchId 与节点分支列表比对
    })
    if (missingPortConnections.length) messages.push(`以下节点的出端口未连接: ${missingPortConnections.join(', ')}`)
    if (missingBranchConnections.length) messages.push(`以下分流分支未连接: ${missingBranchConnections.join(', ')}`)
  }
  return { pass: messages.length === 0, messages }
}
```

## 插件管理与选择门控（补充）
- 插件注册：`GraphService.useHistory/useKeyboard/useSelection`。
- 小地图显隐：`GraphService.toggleMinimap(graph, container, visible)`，位置联动：`useCanvasState`。
- 快捷键绑定：`GraphService.bindDefaultShortcuts`（撤销/重做/缩放/删除/复位/适配/快速布局）。
- 橡皮框门控：`GraphService.configureSelectionRubberbandGate`（需按下 `Ctrl/Meta`）。

## 常见问题（FAQ）
- 橡皮框无法框选？
  - 请确认按下 `Ctrl`（Windows）或 `⌘`（macOS），并未处于查看模式。
- 查看模式为什么不能删除？
  - 查看模式屏蔽删除：右键菜单、端口菜单与快捷键删除均无效，切换到编辑模式再尝试。
- 小地图位置不正确？
  - 检查是否调用了 `useCanvasState.computeMinimapPosition/toggleMinimapUI` 并在容器 resize 后执行 `setupPanelResizeListeners`。
- 节点插入后连线错位？
  - 使用 `insertNodeAndFinalize`，其会自动修正端口映射并重连两段边，同时将操作入栈并支持持久化回调。
## 节点菜单行为（当前实现）
- 菜单跟随移动：监听 `node:moved`，根据节点 `BBox` + 图容器位置重算菜单坐标
- 空白处关闭：监听 `blank:click` 与 `window.click`，添加透明遮罩 `node-actions-menu__backdrop`，非菜单区域点击关闭
