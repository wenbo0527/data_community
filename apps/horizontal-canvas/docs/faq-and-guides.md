# 项目常见问题与操作指南（FAQ / Guides）

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

### 代码示例
```js
// 在画布页中添加一个自定义节点
const node = graph.addNode(createVueShapeNode({
  id: 'my-node-1', x: 200, y: 120, label: '自定义节点', outCount: 1,
  data: { nodeType: 'my-node', isConfigured: true, config: { nodeName: '自定义' } }
}))
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

## 修改抽屉内容指南
### 抽屉结构
- 汇总抽屉：`apps/horizontal-canvas/src/components/task/TaskFlowConfigDrawers.vue`
- 单节点抽屉：`apps/horizontal-canvas/src/components/task/*NodeConfigDrawer.vue`

### 事件与绑定
- 统一事件：`@config-confirm`、`@config-cancel`、`@visibility-change`
- 页面代理写回：`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/index.vue:1903–1924`
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
`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/index.vue:3975–3979`

## 统计面板与分支人数（操作要点）
- 画布级 KPI：按时间筛选范围统计运行天数、累计进入人次、策略结束。
- 节点级趋势：每日进入/出双柱图；明细表含分支列。
- 分支人数：
  - AB 实验按分支百分比分配。
  - 人群/事件分流按出边权重分配（mock 使用稳定权重，实际接入后基于后端数据）。

## 查看模式限制
- 查看模式禁止连线删除：右键菜单、端口菜单、键盘删除均已屏蔽。
  - 参考：`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/index.vue:1616–1634, 2346–2353, 1260–1275`

## 节点保存的数据格式与相关代码
### 数据格式
- 保存/发布时的画布数据通过 `getCanvasData()` 生成：
  - `nodes`: `[{ id, type, x, y, label, config, isConfigured, branches }]`
  - `connections`: `[{ id, source, target, sourcePortId, targetPortId }]`

### 采集代码
- 函数位置：`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/index.vue:3606`
```js
const getCanvasData = () => {
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
- 函数：`apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/index.vue:4111–4218`
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
