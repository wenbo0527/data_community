## 背景与目标
- 需求：当存在多层分层时整体应“像树一样展开”，分支按端口顺序（顶部在上）稳定排列；开始节点与首个分支节点纵向居中于其后续分支簇。
- 保留：现有的快速布局实现（车道/网格/右→左回推）继续保留为可选模式。
- 新增：接入 @antv/hierarchy 的树布局（compactBox，方向 LR），默认启用。
- 文档：更新 API 文档，补充树布局计算方式、输入要求与边界处理。

## 方案概述
- 树化 DAG：为多父节点选择一个“主父”进入树布局（依据多数/靠上端口/最短路径），其他父边保留为跨层连线但不参与坐标计算。
- 子分支排序：按分支节点的端口顺序（顶部优先→几何 y 更小→out-Index 数字序）构造 `children` 数组，确保树形展开的上下顺序稳定。
- 树布局调用：
```js
import Hierarchy from '@antv/hierarchy'
const result = Hierarchy.compactBox(treeData, {
  direction: 'LR',
  getId: d => d.id,
  getChildren: d => d.children || [],
  getWidth: d => widthMap[d.id] || 120,
  getHeight: d => heightMap[d.id] || 60,
  nodeSize: [maxW, maxH],
  // 适配当前版本API的间距参数（gap/hGap/vGap），以实际包版本为准
  gap: [colSpacing, laneGapY]
})
```
- 动态间距：`colSpacing = max(nodeMaxWidth + 40, 280)`；`laneGapY = max(nodeMaxHeight + 20, 240)`。
- 应用到 X6：批量 `node.position(x,y)`；清理所有边的控制点 `setVertices([])`；连线保持 `router: 'normal'` + `connector: 'smooth'`；居中视图。
- 顶层居中：对“开始节点”和“首个分支头”，将其 `y` 调整为对应分支簇子节点 `y` 的中位（或靠上中位）。

## 详细实施
### 1) 新增方法 `executeHierarchyTreeLayout`
- 文件：`src/pages/marketing/tasks/horizontal/utils/quickLayout.js`
- 逻辑：
  1. 采集节点宽高（`getBBox()`）形成 `widthMap/heightMap/maxW/maxH`。
  2. 构建邻接：`outAdj/inAdj/indeg` 与 `edgesBySource`（含 `sourcePortId`）。
  3. 根选择：优先 `start` 或入度为 0；多根时拼接次树或并排横向拼装。
  4. 树化：
     - `getPortOrder(node)`：从 `ports.items` 选出 `group==='out'` 的端口，按“顶部/几何y/数字序(out-Index)”排序。
     - `getChildrenByPort(node)`：依据边的 `sourcePortId` 把子节点按端口顺序排序并去重。
     - 多父节点：选择主父策略（多数/靠上端口/较短路径），仅主父进入 `children`；其他父边留作跨层连接。
  5. 调用 `Hierarchy.compactBox`（LR）输出坐标；
  6. 应用坐标与清理控制点；居中视图。
  7. 顶层居中：对“开始节点/首分支头”设置 `y=median(childrenY)`（或靠上中位）。

### 2) 工具栏开关与默认模式
- 文件：`src/pages/marketing/tasks/horizontal/index.vue`
- 新增状态：`layoutMode: 'hierarchy' | 'lane'`（默认 `'hierarchy'`）。
- 新增按钮/下拉：切换布局模式；
- `handleQuickLayout`：按 `layoutMode` 调用 `executeHierarchyTreeLayout` 或 `executeRightToLeftLaneLayout`。

### 3) 文档更新
- 更新 `API_DOCUMENTATION.md`：新增“树布局”章节——参数、输入要求、示例；与“车道布局”的适用场景对比。
- 更新 `ERROR_ANALYSIS_REPORT.md`：树化失败（环/多父/多根）处理策略、日志格式；降级建议（仅在用户允许时）。

## 验证
- 用例：线性、单分支、多分支、合流；
- 检查：树形展开、端口顺序从上到下、顶层居中、动态间距不贴合；
- 连线平滑、无控制点；缩放后拖拽新增节点坐标准确。

若确认，我将按此方案新增树布局方法、工具栏模式开关、默认启用，并同步更新文档。