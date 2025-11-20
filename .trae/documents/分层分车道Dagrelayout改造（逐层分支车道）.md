## 诉求解读
- 使用原生 Dagre 做快速布局，不回退到其他算法。
- 连线保持 `router: 'normal'` + `connector: 'smooth'`，不产生 `vertices` 控制点。
- 多层分支：从结果端开始，逐层为每个分支节点分配独立“车道”，并保证车道在后续层级持续对齐。

## 方法设计
- 先用 Dagre（rankdir: 'LR'）计算基础坐标与层级（rank）。
- 自顶/自底联合作业：
  - 自底（建议）按每层的“汇点/终点”排序生成车道索引，减少交叉；
  - 自顶保证车道连续性：分支节点的每个出边继承或新建车道，并将车道索引沿路径向下传播。
- 逐层分车道：每个 rank 内，把处于不同车道的节点摆放到对应的 `laneY`，同车道内再做轻微纵向去重。
- 不修改连线，仅设置节点 `y`；连线由 `normal + smooth` 自动平滑呈现。

## 数据结构
- `ranks: Map<rankIdx, nodeId[]>`：Dagre 输出的层级。
- `laneIdOfNode: Map<nodeId, laneId>`：节点所属车道。
- `laneY: Map<laneId, number>`：车道基线 Y 值，`laneGapY` 为车道间距。
- `branchHeads: nodeId[]`：每层分支节点（出度>1）。

## 算法流程
1. 构建 DAG（nodes/edges）并执行 `new DagreLayout({ rankdir:'LR', nodesep, ranksep }).layout({ nodes, edges })`。
2. 生成 `ranks` 与有向邻接表（入/出边）。
3. 自底向上车道标注：
   - 找到最右层（最大 rank）的节点，按其 `x` 或业务优先级排序，分配连续的 `laneId` 与 `laneY`。
   - 向上回溯：每个节点的前驱继承子节点多数的 `laneId`；遇到分支节点为每条出边分别创建/继承 lane。
4. 自顶向下车道校正：
   - 再次遍历 ranks，自顶向下把分支节点的出边车道索引向下传播，修正冲突（优先保持既有车道顺序）。
5. 坐标应用：
   - 节点 `x` 使用 Dagre 结果；节点 `y = laneY[laneId] + dy`，`dy` 用于同车道同层的去重（如 0、±16）。
   - 批量 `node.position(x, y)`，不设置 `edge.vertices`。
6. 清理：遍历所有 `edges` 执行 `setVertices([])`，保证无控制点残留。

## 关键细节
- 分支识别：`outDegree(node) > 1` 即分支节点；其每条出边对应子车道。
- 合流处理：节点的入边来自多个车道时，选多数车道或最短路径车道；如冲突再应用“中位”策略。
- 顺序稳定：车道顺序按终点排序或端口索引排序，保证多次布局结果一致。
- 尺寸来源：节点宽高使用 `node.getBBox()`，最小值兜底，避免 Dagre 计算异常。

## 配置项与开关
- `nodesep`（同行横向间距，默认 160）
- `ranksep`（层间纵向间距，默认 200）
- `laneGapY`（车道垂直间距，默认 240）
- 车道排序策略：`sinkX`/`portIndex`/`typePriority`

## 交付内容
- 在 `horizontal/utils/quickLayout.js` 新增：
  - `executeDagreCore`：Dagre 单图布局（仅获取 ranks 与坐标）。
  - `executeDagreLanes`：逐层分车道的 Dagre 增强布局（按上述流程实现）。
- 在 `horizontal/index.vue` 的快速布局入口调用 `executeDagreLanes` 并保持连线约束。
- 日志与校验：输出每层车道数量、冲突修正次数、最终节点对齐统计。

## 验证
- 用你提供的多层分支示意图对比：每层分支进入独立车道，车道跨层持续对齐，整体横向展开整齐。
- 快速布局无报错、无控制点、连线平滑。

确认后我将按此方案实现。