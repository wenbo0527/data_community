# 横版营销画布文档追加与README更新（续）

## 将继续追加到需求文档的内容
- 节点标题/内容映射表（字段级）：
  - 为每类型节点列出“标题行来源（优先 config.nodeName）”与“内容行字段映射”；分流类明确行→端口 `out-i` 对齐规则。
- 类型图标资源清单：
  - 列出每类型的建议图标名、展示位置与尺寸/间距；注明可替换库（Arco Icons/项目图标）。
- 交互流程详解：
  - 点击节点打开抽屉；从 `out` 到 `in` 手动连线；右键连接线删除；连接线“+”插入节点（分流默认保留至 `out-0`）。
  - 引用代码位置（文件:行号）以便实施。
- 数据契约与示例：
  - CanvasData/Node/Connection 字段列举与 JSON 示例（AB/分流/权益/开始）。
- 发布校验与错误态：
  - 所有 `out` 必须连接；错误清单 `{ nodeId, portId }`；高亮与拦截策略。
- 验收用例：
  - 展示/交互/连接/删除/发布校验分场景用例，含预期结果。
- 性能与风险：
  - foreignObject 对齐兼容；纯 SVG 文本回退；高节点量渲染优化要点。

## 将更新到 src/pages/marketing/tasks/README.md 的内容
- 模块概览与横版工作流简介（结构与职责映射）。
- 数据契约与接口（`getCanvasData/loadCanvasData`）与代码引用位。
- 抽屉系统与节点点击行为（`useConfigDrawers.openConfigDrawer`）。
- 横版特性：左进右出端口、连接校验与右键删除、“+”插入节点。
- 节点“标题行 + 内容行”结构、分流类端口对齐规则与类型图标映射。
- 发布校验与错误态；性能与回退策略。

## 关键引用（用于文档中标注）
- 连接校验与方向：`src/pages/marketing/tasks/horizontal/index.vue:115-141`
- 右键连接删除：`src/pages/marketing/tasks/horizontal/index.vue:179`
- 连接线“+”插入：`src/pages/marketing/tasks/horizontal/index.vue:149-177, 262-271`
- 节点点击打开抽屉：`src/pages/marketing/tasks/horizontal/index.vue:194`（`useConfigDrawers.openConfigDrawer`）
- 端口工厂（横向）：`src/pages/marketing/tasks/horizontal/utils/portConfigFactoryHorizontal.js:6,21`
- 导入/导出：`src/pages/marketing/tasks/components/TaskFlowCanvasRefactored.vue:3318, 3337`

确认后，我将把上述内容直接追加到指定需求文档，并更新 README，最终生成综合设计方案文本可直接用于实施与验收。