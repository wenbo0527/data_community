## 现状与分布方式
- 出口端口分布：使用组布局 `fixed-right-y`，按 `rowIndex` 计算行几何中点
  - 公式：`y = HEADER_HEIGHT + CONTENT_PADDING + rowIndex * ROW_HEIGHT + floor(ROW_HEIGHT/2) + CONTENT_BASELINE_ADJUST`
  - 位置：src/pages/marketing/tasks/horizontal/index.vue:673-707
- 端口生成：只传 `args.rowIndex`，不再传绝对 y 或 dy
  - 位置：src/pages/marketing/tasks/horizontal/utils/portConfigFactoryHorizontal.js:158-167
- 组件DOM：内容区与每行高度已绑定常量，但调试仍显示“DOM行X”偏差
  - 位置：src/pages/marketing/tasks/horizontal/HorizontalNode.vue

## 问题分析
- 坐标系转换不一致：调试的“期望Y(客户端)”当前用 `nodeRect.top + scale * relY`，可能产生双重缩放或与图形坐标不一致
- 组件结构偏移：BaseNode头部或内容区可能还有额外 margin/padding，导致文本中心与行公式的几何中点存在固定偏差
- 行容器与视觉中心：`port-indicator` 行容器的字体行高、边框等细节会让视觉中心与容器几何中心有微小出入

## 改造方案（保持方案B）
1) 统一坐标转换
- 期望Y用图坐标→客户端坐标：
  - 计算 `expectedGraphY = nodeBBox.y + relY`
  - 用 `graph.graphToClientPoint({ y: expectedGraphY })` 得到 `expectedYClient`
- 端口Y用 circle 的屏幕坐标（已实现）
- 文本Y用 `getBoundingClientRect()` 中心（已实现）
- 修改位置：src/pages/marketing/tasks/horizontal/index.vue（调试段：1492-1560），把 `nodeRect.top + scale * relY` 改为 `graphToClientPoint(expectedGraphY)`

2) 组件样式进一步对齐常量
- BaseNode头部高度与内容区起始位置严格对齐 `HEADER_HEIGHT` 与 `CONTENT_PADDING`
- 行容器统一 `height = ROW_HEIGHT`，同时设置 `line-height = ROW_HEIGHT`，保持文本垂直居中与几何中心一致
- 检查是否有额外 `margin/gap/border` 影响行中心，尽量用内部 padding 代替
- 修改位置：src/pages/marketing/tasks/horizontal/HorizontalNode.vue 与 BaseNode.vue（若存在头部额外偏移）

3) 保持唯一真值来源
- 仅用 `rowIndex` 驱动端口布局，不引入 `args.y` 或 `args.dy`
- 常量来自 nodeStyles.js，组件与布局共同使用
- 验证现有端口工厂与布局注册已按上述策略执行，无需改动模型

## 验证
- 重置画布，创建分流节点，运行“调试”
- 期望：
  - 行级校验“差值=0”
  - DOM行校验“文本差值≤2”“端口差值≤2”
- 扫描不同缩放、拖拽后再次调试，确保一致

## 迁移成本与风险
- 低：
  - 主要为调试段坐标计算的统一（1处）
  - 组件样式小调整（行容器line-height与检查BaseNode头部）
- 风险：
  - 若 BaseNode 存在不可见偏移，需要微调其CSS，范围可控

请确认以上计划，我将按此执行改造并提交修订。