## 问题概览
- 你看到的两类日志分别来自两套对齐校验：
  - DOM端口圆心 vs 文本行中点的比对（“对齐检测DOM”）
  - 端口最终Y计算 vs 期望内容行索引的比对（“最终Y=…”）
- 两处出现的差值（≈52 与 ≈17）说明：端口的 `dy` 计算基于模型尺寸与DOM实测之间仍存在基准不一致，刷新后会先用常量生成，再用DOM补偿，仍可能残留偏差。

## 坐标体系与公式
- 相对节点坐标：`y = (height / 2) + dy`（index.vue:1909）
- 绝对画布坐标：`absY = position.y + y`，`absX = position.x + width`（index.vue:1910–1912）
- 屏幕坐标：`graph.graphToClientPoint({ x: absX, y: absY })`（index.vue:1912）
- 期望行几何中点：`contentStart + i * rowHeight + floor(rowHeight / 2) + baselineAdjust`（index.vue:1901）

## 首次创建（刷新后初始）
- 创建节点时即生成端口配置：`createRectNode → createHorizontalPortConfig`（index.vue:693–726）
- 垂直偏移 `verticalOffsets` 基于样式常量计算（头部、内边距、行高、中点、基线修正）（index.vue:709–721）
- 工厂将偏移换算为 `dy = clamp(verticalOffsets[i], contentStart, contentEnd) - (nodeHeight/2)`（portConfigFactoryHorizontal.js:165–168）
- 端口 `items` 带入 `args.dy` 添加到节点（index.vue:895–901）

## 刷新后的重建与补偿
- 更新配置时重新计算尺寸与端口，同步到节点（index.vue:1085–1131, 1287–1297）
- 之后在下一个渲染周期用DOM实测行中心重建端口：`rebuildPortsFromDOM`（index.vue:1320–1327, 1381–1433）
  - 读取每行 `<text>` 的真实中心画布Y，换算为相对节点顶部偏移（index.vue:1406–1421）
  - 再次调用工厂生成端口并覆盖式重建（index.vue:1435–1440）
- 若仍存在固定偏差（例如±52），按端口圆心 vs 文本中心做“视觉补偿”，直接修正每个 `out-i` 的 `dy`（index.vue:1452–1499）

## 日志差值的来源（为什么还有 52/17）
- 模型高度 `height` 与 DOM实测高度 `nodeRect.height` 不完全一致（模型有额外 +12），导致以 `height/2` 和以 `nodeRect.height/2` 作为“中心”的两套基准有偏差。
- `baselineAdjust=5` 参与文本行Y计算；端口对齐的是“行几何中点”，但若文本的真实渲染中心与几何中点存在系统性偏移，会体现为一个近似常量差值。
- 端口圆心测量使用 `.x6-port-body` 的边界框中心；圆的描边宽度与渲染细节也会引入小偏差。
- 刷新流程：先按常量生成，再用DOM重建与补偿；若某些时序/排序（如 `out-0`、`out-2`）的映射在重建前按Y排序发生错配，就会出现≈行高（32）或其倍数的差值（你看到的≈52包含行高与修正项的叠加）。

## 代码入口与关键引用
- 端口最终Y计算与对齐校验（index.vue:1896–1936）
- DOM端口圆心采样与“对齐检测DOM”（index.vue:1806–1847）
- DOM驱动的端口重建与视觉补偿（index.vue:1381–1503）
- 工厂内 `dy` 的定义（portConfigFactoryHorizontal.js:161–170）
- 样式常量（nodeStyles.js:7–17, 49–64, 66–88）

## 拟定修正方案
- 统一 `dy` 的基准：在所有路径里用 DOM实测的 `nodeRect.height`/中心来计算 `dy`，避免 `height + 12` 引入的中心差。
- 一次性拨正：在重建后，将“视觉补偿”作为最终权威来源，把 `node.setPortProp('position/args/dy', dy)` 与 `node.setPortProp('args/dy', dy)` 同步写回，消除残留≈17px 偏差。
- ID映射稳固：对 `out-i` 采用ID映射而不是按Y排序匹配，杜绝排序错配导致的≈行距级错误。
- 校验与监控：保留“对齐检测DOM”日志，增加误差阈值告警（±2px），并在刷新后自动触发DOM重建。

## 执行步骤
1) 修改创建/更新路径，统一以DOM高度为基准计算 `dy`（替换 `height/2` 为 `nodeRect.height/2`）。
2) 调整重建后的写回逻辑，始终覆盖式写入补偿后的 `dy`。
3) 保证 `rebuildPortsFromDOM` 在页面刷新后的首轮渲染完成后触发（已有 `nextTick`，需要确保调用路径覆盖所有来源）。
4) 验证：打开调试面板，确认“对齐检测”差值稳定在 ≤2px；同时检查连接限制与交互是否正常。

如确认以上方案，我将按上述步骤更新实现，并在本地预览中验证，确保刷新后 out 端口坐标与内容行完全对齐。