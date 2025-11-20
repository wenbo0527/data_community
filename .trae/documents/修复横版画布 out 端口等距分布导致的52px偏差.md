## 问题定义
- 刷新后分流节点3个 out 端口呈“均匀分布”，中间端口差值≈0，上下端口差值≈52/65 等（节点高度/行数的阶梯值）。
- 真实原因：X6 在 `group='out'`、`position:'right'` 时，对同组多端口按整节点高度做垂直等距分布，覆盖了我们按内容行几何中点计算的 `dy`。item 级 `args/position.args` 未完全生效。

## 修复目标
- 取消组级“均匀分布”的影响，让每个端口按 item 的绝对 `y` 或相对 `dy` 精确定位到内容行中点。
- 对齐检测日志“对齐检测DOM”的差值稳定≤2px；不再出现固定52px阶梯差。

## 方案总览
1) 取消组级 `out.position`，改为仅由 item 级位置驱动布局（优先级提高，最小改动）。
2) 如1仍不稳定，则注册自定义端口布局 `fixed-right-y`，以端口 item 的 `args.y/dy` 计算 `yGraph`，将 X 强制为节点右侧，彻底绕过默认分布。
3) 全流程统一：创建/更新/DOM重建/视觉补偿均写入 item 级 `position.args.{y,dy}`，并覆盖式重建端口，避免运行时 `setPortProp` 被忽略。
4) 测试与验证：补齐 jsdom 对 X6 的 SVG 依赖 polyfill，添加单元+集成测试，验证端口圆心与行中点误差≤2。

## 实施步骤
### 步骤1：取消组级默认分布
- 修改 `src/pages/marketing/tasks/horizontal/utils/portConfigFactoryHorizontal.js`
  - 删除/置空 `groups.out.position` 与 `groups.in.position`（仅保留 connectOptions、attrs），避免对 items 的位置产生组级策略。
  - items 保持：`{ id, group:'out', position:{ name:'right', args:{ y, dy } }, args:{ dy } }` 与 in 端口同理 `left`。
- 目的：让每个端口以 item 的 `position.args` 为唯一来源，杜绝等距分布。

### 步骤2（备选）：自定义端口布局
- 在图初始化处注册：`Graph.registerPortLayout('fixed-right-y', (portItemArgs, view) => { /* 根据 y/dy 返回固定右侧坐标 */ })`
  - 文件：`src/pages/marketing/tasks/horizontal/index.vue` 的 `onMounted` 初始化后。
  - 规则：`x = node.width`，`yGraph = (nodeTopGraph + nodeHeight/2) + (args.dy || 0)` 或优先 `args.y`。
- 工厂 items 的 `position.name` 改为 `'fixed-right-y'`，`args` 带上 `{ y, dy }`。
- 目的：即使组级 position 存在，渲染时也走我们自定义的布局函数。

### 步骤3：统一写入与重建
- 创建/更新：`createRectNode`、`updateNodeFromConfig`
  - 始终通过“覆盖式重建”端口：移除全部端口 → `setProp('ports/groups', groups)` → 逐 `addPort(items)`，避免仅 `setPortProp` 更新。
- DOM重建/补偿：`rebuildPortsFromDOM`
  - 用 `<text>` BBox中心生成 `verticalOffsets`；为每个 `out-i` 写入 `position/args/{y,dy}` 与 `args/dy`；补偿仅一次，避免时序抖动。

### 步骤4：日志对齐基准
- 已统一对齐检测的计算基准为 DOM 画布坐标（节点中心来自 `nodeRect`）。继续保留两类日志：
  - DOM圆心 vs 行几何中点（应≤2px）
  - 最终Y(G) vs 行画布Y（应≤2px）

### 步骤5：测试完善
- 添加/完善测试：
  - 单元测试：`portConfigFactoryHorizontal.spec.ts` 验证 items 包含 `position.args.{y,dy}` 与 `args.dy` 一致。
  - 集成测试：`domPortAlignment.integration.test.ts` 构造3行分流节点，读取 `.x6-port-body` 圆心与行几何中点差值≤2；同时比较 `nodeCenter+dy` 推导的最终Y。
- 测试环境：
  - `vitest.config.ts` 设置 `environment: 'jsdom'` 与 `setupFiles: ['src/test/setup/x6SvgPolyfill.ts']`。
  - `x6SvgPolyfill.ts` 提供 `createSVGMatrix`、`getCTM`、`rotate` 的简化polyfill，避免 X6 在 jsdom 下报错。

## 验收标准
- 预览日志：
  - `[对齐检测DOM] port=out-i 实测画布Y=… 期望画布Y=… 差值=0/≤2`。
  - 无固定 52px 阶梯差。
- 测试：
  - 工厂单测与 DOM集成测试全部通过。
- 兼容性：
  - 连接约束、交互状态不受影响；`group.connectOptions`、`attrs` 保留。

## 回滚与风险控制
- 若取消组级 position 后仍出现等距分布：启用步骤2的自定义布局强制坐标。
- 若 jsdom 下 X6 仍有矩阵相关报错：加强 polyfill 或在集成测试中 mock Graph 布局路径，仅验证我们计算的最终Y与行中心一致。

## 里程碑
- M1：完成组级位置移除与 items 定位，预览验证差值≤2。
- M2：补齐测试与 polyfill，CI通过。
- M3（备选）：自定义布局函数上线，巩固定位策略。