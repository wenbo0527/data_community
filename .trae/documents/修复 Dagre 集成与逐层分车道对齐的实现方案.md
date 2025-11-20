## 问题诊断
- 报错 `graph.getAllNodes is not a function` 来自 `@antv/layout` 的 `DagreLayout` 内部，说明当前版本期望接收的是 `@antv/graphlib` 的 Graph，而不是 `{ nodes, edges }` 纯数据。
- 快速布局仅出现缩放，未对齐：布局阶段异常，节点未重新定位，后续只执行了居中/适配逻辑，视觉上等同“缩放”。

## 目标
- 继续使用原生 Dagre，不回退备选算法。
- 连线保持不变：`router: 'normal'` + `connector: 'smooth'`，不写 `edge.vertices`。
- 自底向上逐层分车道，跨层对齐至同一水平线。

## 修复方案
1) 使用 `@antv/graphlib` 构建布局 Graph
- 在 `quickLayout.js` 中引入并构建 Graph：
  - `import { Graph } from '@antv/graphlib'`
  - `const g = new Graph({ directed: true })`
  - `g.setDefaultEdgeLabel(() => ({}))`
  - 遍历 X6 节点：`g.setNode(id, { width, height })`
  - 遍历 X6 边：`g.setEdge(sourceId, targetId)`
- 用 Graph 调用 `DagreLayout.genericDagreLayout(g, { rankdir, nodesep, ranksep })` 或当前版本暴露的方法（若仅有 `execute(graph)` 则使用该接口）。
- 从 Graph 读取坐标：`const { x, y } = g.node(id)`，生成 `posById`

2) 逐层分车道对齐（保留现有算法，替换坐标来源）
- 构建入/出邻接表与 `rankOf`（BFS自底向上）
- 将最右层的汇点按 `x` 排序分配初始车道（`laneOf`）
- 自底向上为每层节点分配车道（多数子车道规则），自顶向下再校正一次。
- 计算车道基线 `laneY`（`laneGapY` 为车道间距），节点最终位置：`x = posById[id].x`、`y = laneY[laneOf[id]]`。

3) 应用与清理
- 批量 `node.position(x, y)` 应用坐标。
- 遍历 `edges` 执行 `setVertices([])`，避免控制点残留。
- 成功后再 `centerContent`（不改缩放），失败则终止并输出可读错误。

## 日志与校验
- 输出：总层数、车道数、每层分支数、节点移动计数。
- 辅助：当某节点 bbox 缺失时宽高兜底（120×60），当 id 非字符串时转换为字符串。

## 不改动部分
- 连线配置与样式保持既有约束，不触碰任何路由/连接器设置。
- 拖拽新增节点坐标仍用 `graph.pageToLocal`，缩放后不偏移。

## 验证
- 以你提供的多层分支示例测试：每层分支分配独立车道，跨层水平线对齐。
- 快速布局无报错，节点位置明显变化（非仅缩放）。

我将按此方案实现并验证。