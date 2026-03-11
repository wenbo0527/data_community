# 横版画布 LR 统一自动布局方案（不含预览线）

## 概述
- 目标：为横版营销画布提供不依赖预览线的统一自动布局算法，方向为从左到右（LR），基于连接进行分层，并在存在分支节点时于下一列按分行对齐展示。
- 范围：仅针对横版画布页面与通用布局引擎整合，不使用 `PreviewLineSystem` 相关能力。

## 现状分析（横版画布纯布局）
- 页面入口与核心逻辑
  - 端口布局注册：`src/pages/marketing/tasks/horizontal/index.vue:759-792`（`fixed-right-y`、`fixed-left-y`），用于将输出端口对齐内容区行中点，输入端口对齐节点中心或内容行。
  - 连接校验与路由器设置：`src/pages/marketing/tasks/horizontal/index.vue:705-734`，横向规则 `out → in` 且路由器为 `orth`。
  - 初始化后应用统一结构化布局（当前为纵向思路）：`src/pages/marketing/tasks/horizontal/index.vue:850-871`。
  - 节点内容行构建与端口垂直对齐：`src/pages/marketing/tasks/horizontal/index.vue:1229-1344`（`buildDisplayLines` + `createHorizontalPortConfig`），行高与偏移基于 `NODE_DIMENSIONS` 与 `TYPOGRAPHY`。
  - 端口最终位置与对齐验证日志：`src/pages/marketing/tasks/horizontal/index.vue:2418-2441`。
- 横向布局配置
  - `HORIZONTAL_LAYOUT_CONFIG.AUTO_LAYOUT.DIRECTION = 'LR'`，提供 LR 基础参数与间距（`src/utils/horizontalLayoutConfig.js:90-115`）。
- 结论
  - 端口与连接方向已支持 LR；节点行内容与端口对齐已有基础。
  - 核心自动布局仍以 TB（纵向）为主的定位器思路，需要一个面向 LR 的位置计算方案以实现“列为层、行为分支行”的自然展示。

## 设计原则
- LR 分层：列代表层级，沿连接方向由左至右推进。
- 分支分行：分支节点的下一列按分支数量与类型分配行，父节点在上一列居于其子行的加权中心。
- 对齐一致：层内同类型节点按规则排序与间距约束，减少交叉与重叠，提升可读性。
- 不依赖预览线：仅以真实连接与节点配置数据（如 `displayLines`、端口 id）来决定分层与分行。

## 算法设计
### 数据输入
- 图节点与连接来自 X6 图实例：`graph.getNodes()`、`graph.getEdges()`。
- 节点辅助数据：
  - 内容展示行与数量：`buildDisplayLines(nodeType, config)` `src/pages/marketing/tasks/horizontal/index.vue:1249-1257`。
  - 输出端口 id 与行映射：`out-0..out-n`（与 `verticalOffsets` 一致）`src/pages/marketing/tasks/horizontal/index.vue:1282-1288`。

### 拓扑分层（列）
- 构建邻接：使用边的 `source cell id` 与 `target cell id` 建立邻接表（忽略虚拟、提示与非画布节点）。
- 入度计算：入度为 0 的节点作为起始列 `col=0`。
- BFS 推进：每弹出一个节点，将其子节点的入度减 1，为 0 时入队列并赋予 `child.col = parent.col + 1`。
- 长边处理：若出现父子层差超过 1，可插入虚拟列位移（无需虚拟节点），通过后续位置器的“层间间距”弥合。

### 分支分行（行）
- 适用类型：`crowd-split`、`event-split`、`ab-test`。
- 行数确定：
  - crowd-split：行数 = `displayLines.length`。
  - event-split：行数 = 2（YES/NO）。
  - ab-test：行数 = 2 或 N（随版本/变体数）。
- 子节点行分配：
  - 优先依据边的源端口 id（`out-i`）映射至对应的行索引 `i`。
  - 无端口 id 或不匹配时，采用均衡分配或按标签关键字（A/B、YES/NO）进行推断。
- 父节点 Y 对齐：父节点的 `y` 取其子行 `y` 的加权均值（`event-split` 对称，`ab-test` 可按比例权重）。

### 坐标计算（LR 定位器）
- 列坐标 `x`
  - `x(col) = col * NODE_SPACING_X + OFFSET_X`，`NODE_SPACING_X` 可由 `HORIZONTAL_LAYOUT_CONFIG.SPACING.NODE_HORIZONTAL` 提供（`src/utils/horizontalLayoutConfig.js:17`）。
- 行坐标 `y`
  - 行基线：`HEADER_HEIGHT + CONTENT_PADDING + i * ROW_HEIGHT + ROW_HEIGHT/2 + BASELINE_ADJUST`（与当前端口垂直对齐公式一致，`src/pages/marketing/tasks/horizontal/index.vue:1279-1285`）。
  - 行间距：可绑定 `HORIZONTAL_LAYOUT_CONFIG.SPACING.NODE_VERTICAL`（`src/utils/horizontalLayoutConfig.js:18`）。
- 层内排序与间距
  - 同列内按照“父列与子列的连接关系”进行重心/中位数排序，减少交叉（参考 `LayerOptimizer` 思路）。
  - 应用最小间距约束，防止重叠与过近。

### 层优化与全局对齐
- 层间交叉减少：通过相邻列的重心/中位数启发式扫描优化节点顺序。
- 全局居中与列线对齐：各列中心线作渐进式对齐，避免列整体偏移。可复用现有全局对齐思想，但以列中心为基准。

## 数据结构与映射
- 基本结构：
  - `node.col` 表示列索引；`node.row` 表示分配的行索引（非分支节点可为 `null`）。
  - `positions: Map<nodeId, { x, y }>` 最终坐标映射。
- 行映射优先级：`out-i → 行 i` > 标签推断（A/B、YES/NO） > 均衡分配。

## 配置参数
- 方向：`LR`（左到右）。
- 间距：`NODE_SPACING_X`、`NODE_SPACING_Y`、`LAYER_SPACING`。
- 分支行策略：`event-split` 对称、`ab-test` 比例权重、`crowd-split` 自适应行距（与 `displayLines` 一致）。
- 约束：最小节点间距、最小层间距、最大列宽度。

## 集成方案
- 新增或改造定位器（建议）：
  - 方案 A：实现 `LeftRightPositioner`，以列为 `x`、行为 `y` 的定位逻辑，内置分支分行策略与层优化。
  - 方案 B：在现有 `BottomUpPositioner` 增加 `orientation=LR`，进行轴交换并启用分支分行策略。
- 挂载位置：在统一布局执行管线中替换位置计算阶段：`LayoutExecutor.executeLayout`（`src/pages/marketing/tasks/utils/canvas/layout/core/LayoutExecutor.js:168-187`）。
- 工具栏触发：在横版画布页增加“应用自动布局（LR）”入口，调用新的 LR 定位器。
- 与端口/路由器更新协同：保留 `switchLayoutDirection('LR')` 的端口与路由器更新逻辑（`src/pages/marketing/tasks/composables/canvas/useStructuredLayout.js:236`、`344`），但不引入任何预览线系统调用。

## 优势与不足（目标状态）
- 优势
  - 无预览线依赖，仅靠真实连接与节点配置即可稳定布局。
  - 列为层、行为分支行的横向展示自然一致，端口与内容文本中点对齐。
  - 与现有横版端口对齐与连接校验逻辑完全兼容。
- 不足与后续改进
  - 需要完善交叉惩罚计分，配合层优化实现更稳定的无交叉布局。
  - 增量布局与局部重排可进一步提升复杂场景下的性能与体验。

## 验收指标
- 对齐一致性：同列节点的行中点与端口对齐误差 ≤ 2px。
- 交叉减少：对典型分支场景，层间交叉计数较初始排序减少 ≥ 60%。
- 性能：100 节点、150 边的场景下，单次自动布局耗时 ≤ 300ms（不含动画）。

## 代码参考索引（横版画布）
- 端口布局注册：`src/pages/marketing/tasks/horizontal/index.vue:759-792`
- 连接校验与路由器：`src/pages/marketing/tasks/horizontal/index.vue:705-734`
- 统一布局调用（现状）：`src/pages/marketing/tasks/horizontal/index.vue:850-871`
- 行内容与端口垂直对齐：`src/pages/marketing/tasks/horizontal/index.vue:1229-1344`
- 端口最终位置验证：`src/pages/marketing/tasks/horizontal/index.vue:2418-2441`
- 横向布局配置（LR）：`src/utils/horizontalLayoutConfig.js:90-115`

