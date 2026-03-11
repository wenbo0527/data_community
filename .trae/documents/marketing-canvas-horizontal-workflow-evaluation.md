# 营销画布「横版工作流」前端改造评估

## 结论摘要
- 可行：基于现有 AntV X6 + Vue 3 画布架构，可以较为平滑地新增一个「横版工作流」页面，采用矩形节点、左入右出端口、多分支端口展示，并关闭自动预览线/自动连接。
- 主要改动集中在：节点渲染组件（矩形信息化展示）、端口与连线配置（left/right 方向与每行右侧端口对齐）、连接交互策略（仅手动拖拽，1端口1连接）、右键菜单与连线插入节点工具、级联删除策略（仅沿单一连线下游）。
- 与现有纵向版本保持并存：建议新增页面与配置，不影响当前纵向工作流与预览线体系；通过独立的路由与组件文件隔离改动，复用通用服务与事件总线。

---

## 已落地变更（本次提交）
- 新增横版原型页面：`src/pages/marketing/tasks/horizontal/index.vue`，内置最小可运行 X6 画布，示例矩形节点（左入右出端口）与基础连线交互。
- 注册路由：在 `src/router/marketing.js` 增加 `path: '/marketing/tasks/horizontal'`，可直接访问横版页面。
- 抽屉保持一致：页面中已挂载原版统一抽屉组件 `TaskFlowConfigDrawers.vue`，结构与事件接口一致（暂以占位状态驱动）。

访问路径（开发环境）：`/marketing/tasks/horizontal`

---

## 需求拆解与对应实现点
1) 节点矩形化 + 信息内嵌展示（横向布局）：
   - 形态：矩形节点，左侧中点一个 `in` 端口；右侧根据配置分支动态生成多个 `out` 端口（每行信息的中点位置对齐一个端口）。
   - 展示：在人群分流/事件分流/AB 实验节点中，将抽屉配置的核心信息直接渲染到节点内部；如人群分流展示命中人群列表与未命中行，事件分流展示命中事件与“等待X时间未命中”。
2) 连接策略调整：
   - 关闭自动生成预览线与连接线；改为用户从 `out` 端口手动拖拽至目标节点 `in` 端口创建连接。
   - 限制：每个 `out` 端口仅允许 1 条连接；发布校验所有 `out` 端口均已连接。
3) 连接线交互保留与增强：
   - 保留右键删除连接线功能。
   - 鼠标悬停连线显示 “+” 按钮，点击在连线中插入节点；若插入分流节点，默认保留原连接为“第一个分支”。
4) 级联删除：
   - 节点删除支持级联，但仅删除“所有单一连线的下游”，即遇到多入/多出或分支汇合点停止。

---

## 现有代码结构评估（关键点）
- 画布组件：`TaskFlowCanvasRefactored.vue`（3459 行）采用 `@antv/x6` + Vue 3 组合式，模块化拆分到 `useCanvasCore/useCanvasState/useCanvasEvents/useCanvasLifecycle` 等。
- 端口配置：`utils/canvas/portConfigFactory.js` 当前为纵向（top/bottom）布局，且默认 `magnet: false`（禁用端口拖拽）。
- X6配置：`utils/canvas/x6Config.js` 的 `getPortGroups()` 同样为 top/bottom 方向；`getConnectingConfig()` 校验了 out→in 的方向与目标端口占用，但未限制“同一 sourcePort 仅 1 条连接”。
- 预览线体系：`composables/canvas/unified/UnifiedEdgeManager.js` + `usePreviewLine.js` 提供预览线/连接线统一管理；`TaskFlowCanvasRefactored.vue` 在节点配置确认后会调用 `PreviewLineSystem.onNodeConfigured` 生成预览线。
- 右键菜单：`ConnectionContextMenu.vue` 已支持“删除连接线”“恢复预览线”，事件由 `useCanvasEvents.js` 绑定 `edge:contextmenu` 触发。
- 插入节点：当前未发现“连线上 + 号插入节点”的现成实现；`useX6Events.js` 在 `edge:mouseenter` 为普通连接线添加了工具（箭头、删除按钮），可在此扩展 “button” 工具实现插入节点。
- 级联删除：`TaskFlowCanvasRefactored.vue` 的 `cascadeDeleteNode` 递归删除所有下游；未区分“单一连线下游”。需改造下游遍历与停止条件。

---

## 改造方案（横版工作流新页面）
为保证与现有纵版共存，建议新增一套横版页面与配置，不修改既有纵向逻辑。核心是替换节点渲染与端口布局、关闭预览线，改用 X6 原生连接交互。

### 1. 新页面与路由
- 新增页面：`src/pages/marketing/tasks/horizontal/HorizontalTaskFlowCanvas.vue`（或 `HorizontalWorkflowCanvas.vue`）。
- 路由：在营销模块路由中新增 `path: '/marketing/tasks/horizontal'`，保持与现有页面平行。
- 复用：状态管理、服务管理（Graph/Layout/EventServiceAdapter）与事件总线可复用；仅替换节点组件、端口布局与连接配置。

### 2. 节点矩形化与信息化展示
- 新增节点组件：`components/FlowNodeHorizontal.vue`，沿用 `vue-shape` 渲染，宽高如 `width: 260, height: auto`。
- 内部结构：
  - 左上角节点类型标识与名称（如“人群分流、事件分流、AB实验”）。
  - 内容区按配置生成多行：
    - 人群分流：`命中：客群名称1`、`命中：客群名称2`、`否则：未命中`。
    - 事件分流：`命中：XXX事件`、`等待 X 时间未命中`。
  - 每行右侧对齐一个 `out` 端口（见端口布局计算）。

### 3. 横向端口配置（left/right）
- 新增工厂：`utils/canvas/portConfigFactoryHorizontal.js`，与现有 `portConfigFactory.js` 并存。
- 策略：
  - `in` 端口：`name: 'left'`，`args: { x: '0%', y: '50%', dx: -15, dy: 0 }`。
  - `out` 端口：`name: 'right'`，`args: { x: '100%', y: '<行百分比>', dx: 15, dy: 0 }`。
  - 每个分支一条 `out` 端口，ID 如 `out-0/out-1/out-unmatch`；`attrs.circle.magnet: true` 允许手动拖拽。
- 行高与对齐：
  - 节点内部计算每条信息的 Y 百分比（如首行 ~20%、最后一行 ~80%），用于端口 `args.y` 对齐。
  - 将端口配置同时保存到 `node.data.portConfig`，以便调试与发布校验。

示例（伪代码）：
```js
// portConfigFactoryHorizontal.js 片段
export const createNodePortConfigHorizontal = (nodeType, config = {}) => {
  const groups = {
    in: { position: { name: 'left',  args: { x: '0%',   y: '50%', dx: -15, dy: 0 } }, attrs: { circle: { r: 5, magnet: true } } },
    out:{ position: { name: 'right', args: { x: '100%', y: '50%', dx:  15, dy: 0 } }, attrs: { circle: { r: 5, magnet: true } } }
  }
  const items = [{ group: 'in', id: 'in' }]
  const lines = computeInfoLines(nodeType, config) // 返回每行信息与y百分比
  lines.forEach((line, idx) => {
    items.push({ group: 'out', id: `out-${line.id ?? idx}`, position: { name: 'right', args: { x:'100%', y: line.y, dx: 15, dy: 0 } } })
  })
  return { groups, items }
}
```

### 4. 连接创建策略（禁用预览线、仅手动）
- 在横版页面不初始化 `PreviewLineSystem` 与 `UnifiedEdgeManager`，转而使用 `Graph` 的 `connecting` 配置：
  - `allowNode/allowEdge` 相关保持默认禁止直接对节点/边连接。
  - `validateConnection` 增强：
    - 仅允许 `sourceMagnet.port-group==='out'` 且 `targetMagnet.port-group==='in'`。
    - 限制同一 `sourcePortId` 只能存在 1 条连接：检查 `graph.getOutgoingEdges(sourceView.cell)` 中 `edge.getSourcePortId()===sourcePortId`。
  - 路由器改为横向最短路径：`router.name='orth'` 或 `manhattan`，`startDirections:['right']`, `endDirections:['left']`。

示例（伪代码）：
```js
const connecting = {
  router: { name: 'orth', args: { startDirections:['right'], endDirections:['left'], padding: 15, step: 10 } },
  connectionPoint: { name:'boundary', args:{ anchor:'center' } },
  allowBlank: false,
  validateConnection({ sourceMagnet, targetMagnet, sourceView, targetView }) {
    if (!sourceMagnet || sourceMagnet.getAttribute('port-group') !== 'out') return false
    if (!targetMagnet || targetMagnet.getAttribute('port-group') !== 'in') return false
    const sourcePortId = sourceMagnet.getAttribute('port')
    const exists = (this.getOutgoingEdges(sourceView.cell) || []).some(e => e.getSourcePortId() === sourcePortId)
    return !exists
  }
}
```

### 5. 发布校验（所有 out 端口均已连接）
- 新增校验工具：`utils/canvas/validation/horizontalPublishValidator.js`。
- 从 `graph.getNodes()` 遍历节点：对每个 `node.getPorts().filter(p=>p.group==='out')`，检查是否存在 `graph.getOutgoingEdges(node).some(e => e.getSourcePortId()===p.id)`；若缺失，收集错误并阻止发布。

### 6. 连线交互：右键删除与插入节点
- 右键删除：复用 `edge:contextmenu` 与现有 `ConnectionContextMenu.vue`；在横版模式下移除“恢复预览线”选项。
- 插入节点（连线上显示 “+”）：
  - 在 `edge:mouseenter` 使用 X6 `tools` 增加一个 `button` 工具，显示加号；点击后：
    1. 记录原边 `sourceNode, sourcePortId, targetNode, targetPortId`；
    2. 删除原边；
    3. 在点击位置创建新节点（默认矩形）；
    4. 创建两条边：`sourceNode(outPortId) -> 新节点(in)` 与 `新节点(out-默认分支) -> targetNode(in)`；若新节点为分流节点，默认使用第一个分支端口（如 `out-0`）。

示例（伪代码）：
```js
graph.on('edge:mouseenter', ({ edge }) => {
  edge.addTools([{ name: 'button', args: { markup: [{ tagName:'circle', attrs:{ r:8, fill:'#5F95FF' } }, { tagName:'text', attrs:{ text:'+', fill:'#fff', fontSize:12 } }], offset:{ x:0, y:0 }, distance: 0.5 } }])
})
graph.on('edge:click:tool', ({ edge, toolName, e }) => {
  if (toolName === 'button') insertNodeOnEdge(edge, e)
})
```

### 7. 级联删除（仅“单一连线下游”）
- 改造 `cascadeDeleteNode` 的下游收集逻辑：仅沿满足条件继续：
  - 下游节点 `in-degree === 1`（仅来自当前链路）；
  - 且（可选）`out-degree <= 1`（纯链式，无再分支）；
  - 一旦命中 `in-degree > 1` 或 `out-degree > 1` 或分支汇合节点，停止。

伪代码：
```js
function getSingleChainDownstream(nodeId) {
  const result = []
  const queue = [nodeId]
  const visited = new Set([nodeId])
  while (queue.length) {
    const current = queue.shift()
    const outs = graph.getOutgoingEdges(graph.getCellById(current)) || []
    outs.forEach(edge => {
      const tgt = edge.getTargetCellId()
      if (visited.has(tgt)) return
      const inDeg  = (graph.getIncomingEdges(graph.getCellById(tgt)) || []).length
      const outDeg = (graph.getOutgoingEdges(graph.getCellById(tgt)) || []).length
      if (inDeg === 1 /* && outDeg <= 1 */) {
        result.push(tgt); visited.add(tgt); queue.push(tgt)
      }
    })
  }
  return result
}
```

---

## 影响面与兼容性
- 不影响现有纵向工作流页面；横版以独立路由与组件存在。
- 公用模块复用：GraphService、LayoutService、EventService、状态管理、事件总线可以直接复用。
- 端口/连接配置在横版页面内覆盖：避免修改 `x6Config.js` 与现有 `portConfigFactory.js`，通过新增 `*Horizontal` 工厂与配置实现。

---

## 实施步骤与里程碑（明确到文件级）
1) 页面与路由（已完成）
   - 新增：`src/pages/marketing/tasks/horizontal/index.vue`
   - 注册：`src/router/marketing.js` 增加 `tasks/horizontal` 路由

2) 节点渲染与端口（待做）
   - 新增：`src/pages/marketing/tasks/components/FlowNodeHorizontal.vue`（矩形信息化节点）
   - 新增：`src/pages/marketing/tasks/utils/canvas/portConfigFactoryHorizontal.js`（left/right 端口工厂）
   - 修改：在横版页面初始化节点时，调用 `createNodePortConfigHorizontal()` 返回 `groups/items` 并注入到 `node.ports`

3) 连接策略（待做）
   - 修改：横版页面内不初始化 `PreviewLineSystem/UnifiedEdgeManager`，直接使用 `Graph.connecting`
   - 新增：`validateConnection` 中限制 `out->in` 且同一 `sourcePortId` 仅 1 条连接
   - 调整：`router/connector/connectionPoint` 方向和参数，适配左进右出

4) 发布校验（待做）
   - 新增：`src/pages/marketing/tasks/utils/canvas/validation/horizontalPublishValidator.js`
   - 集成：横版页面触发发布时调用校验；或在工具栏按钮（如 `CanvasToolbar` 的本地实例）绑定

5) 连线插入节点（待做）
   - 修改：横版页面 `edge:mouseenter` 增加 `button` 工具（加号）
   - 新增：`insertNodeOnEdge(edge, e)` 函数，按“保留原第一分支”的规则拆边并创建新节点与两条新边

6) 级联删除（待做）
   - 修改：提取下游收集函数 `getSingleChainDownstream(nodeId)`，仅沿“单一连线下游”递归
   - 集成：横版页面复用 `handleSingleNodeDelete/cascadeDeleteNode` 的事件入口

7) UI 联调与预览（待做）
   - 端口对齐（行高、百分比Y）、连接路由样式、边工具与右键菜单
   - 验证：抽屉打开与配置确认事件贯通（保持与原版一致）

8) 文档与交付（进行中）
   - 本文档将持续更新“已落地变更”和“剩余工作”进度
   - 完成后提供交互预览链接与操作说明

---

## 需要修改的内容清单（文件级）
- `src/pages/marketing/tasks/horizontal/index.vue`：横版页面入口，初始化 Graph 与连接配置（已新增）
- `src/router/marketing.js`：新增 `tasks/horizontal` 路由（已新增）
- `src/pages/marketing/tasks/components/FlowNodeHorizontal.vue`：横版矩形节点渲染（待新增）
- `src/pages/marketing/tasks/utils/canvas/portConfigFactoryHorizontal.js`：端口布局工厂（待新增）
- `src/pages/marketing/tasks/utils/canvas/validation/horizontalPublishValidator.js`：发布校验（待新增）
- `src/pages/marketing/tasks/components/ConnectionContextMenu.vue`：横版禁用“恢复预览线”项（待按需调整）
- `src/pages/marketing/tasks/composables/canvas/useX6Events.js`：连线工具“+”插入节点（横版页面内实现更优，避免影响纵版）

---

## 风险与注意事项
- 行高与端口对齐的计算需与节点内部渲染高度同步，建议使用固定行高或在节点挂载后动态更新端口 `args.y`。
- 禁用预览线后，现有“恢复预览线”等功能需要在横版页面中隐藏或改造为兼容行为。
- 多分支节点的默认端口规则需统一（如 `out-0` 代表第一个分支），并在插入节点/发布校验中保持一致。
- 若后续需要在横版页面继续使用统一布局服务（Dagre/Manhattan），应确保方向配置为 LR（Left-Right）。

---

## 工作量预估（前端）
- 新页面与路由：0.5–1 人日
- 矩形节点组件与信息渲染：1–1.5 人日
- 横向端口工厂与对齐计算：1 人日
- 连接策略与发布校验：1 人日
- 连线加号插入节点：0.5–1 人日
- 级联删除改造：0.5 人日
- 联调与文档：0.5 人日

---

## 后续验证与交付
 - 完成实现后，在横版页面启动本地预览并进行交互测试；根据规范，涉及 UI 改动需进行预览确认。
 - 本评估文档供实现阶段参考，具体细节（视觉样式、行高、端口定位）以实现时的组件与样式为准。

---

## 验收清单（操作步骤）
- 能访问 `/marketing/tasks/horizontal` 并看到横向矩形节点与左入右出端口。
- 从任一 `out` 端口拖拽到另一个节点 `in` 端口能创建连线；同一 `out` 端口不允许重复连接。
- 右键点击连线可删除；悬停显示删除按钮；后续增加“+”插入节点按钮可用。
- 打开各类抽屉（开始、分流、AB、触达、等待、权益等）界面与原版一致，能确认/取消。
- 发布校验提示所有 `out` 端口必须连接（上线前完成）。
