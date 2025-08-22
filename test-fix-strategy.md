# 测试修复策略文档

## 问题分析

### 节点类型系统冲突
项目中存在两套不同的节点类型定义系统：

1. **通用工作流系统** (`src/utils/workflowNodeTypes.js`)
   - NodeType.INPUT: 数据输入
   - NodeType.PROCESSING: 数据处理
   - NodeType.OUTPUT: 数据输出
   - 用于：数据处理工作流、通用工作流编辑器

2. **营销画布系统** (`src/utils/nodeTypes.js`)
   - start: 开始节点
   - audience-split: 人群分流
   - event-split: 事件分流
   - sms: 短信触达
   - ai-call: AI外呼
   - manual-call: 人工外呼
   - ab-test: AB实验
   - wait: 等待节点
   - end: 结束节点
   - 用于：营销画布、客户旅程编辑

### 测试失败原因
78个测试失败，主要原因：
1. 测试文件混用了两套节点类型系统
2. 部分测试使用了错误的节点类型定义
3. 图标导入和节点类型映射不匹配

## 修复策略

### 1. 通用工作流测试修复
**保持使用 INPUT/PROCESSING/OUTPUT 类型的测试文件：**
- `src/utils/__tests__/workflowNodeTypes.test.js`
- `src/tests/components/WorkflowNode.test.js`
- `src/tests/components/WorkflowEditor.test.js`
- `src/tests/integration/WorkflowEditor.integration.test.js`
- `src/tests/utils/workflowNodeCreator.test.js`

**修复内容：**
- 确保图标导入正确
- 修复NODE_TYPE_ICON_MAP映射
- 更新getNodeTypeIcon等函数测试
- 保持与workflowNodeTypes.js的一致性

### 2. 营销画布测试修复
**使用营销画布节点类型的测试文件：**
- `src/tests/interaction/DragInteractionManager.test.ts`
- `src/tests/interaction/NodeConnectionOptimizer.test.ts`
- `src/tests/integration/coordinate-consistency.test.ts`
- `src/tests/integration/layout-coordinate.test.ts`
- `src/tests/unified-preview-line-refactor.test.js`
- `src/tests/start-node-preview-line.test.js`
- `src/tests/audience-split-preview-line-comprehensive.test.js`

**修复内容：**
- 将INPUT/PROCESSING/OUTPUT替换为start/audience-split/end等
- 更新节点创建和连接逻辑
- 修复端口配置和连接验证
- 确保与nodeTypes.js的一致性

### 3. 预览线endpoint坐标测试增强
**目标文件：**
- `src/tests/integration/coordinate-consistency.test.ts`
- `src/tests/interaction/DragInteractionManager.test.ts`
- `src/tests/interaction/NodeConnectionOptimizer.test.ts`

**增强内容：**
- 手动布局模式下的预览线endpoint坐标测试
- 移动节点后预览线刷新的坐标一致性
- 移动画布新建节点时预览线位置测试
- 吸附和拖拽时预览线连接到in端口的坐标验证

## 实施计划

### 阶段1：修复通用工作流测试
1. 修复workflowNodeTypes.test.js中的图标导入问题
2. 更新WorkflowNode.test.js使用正确的节点类型
3. 修复WorkflowEditor相关测试

### 阶段2：修复营销画布测试
1. 更新DragInteractionManager.test.ts使用营销画布节点类型
2. 修复NodeConnectionOptimizer.test.ts的连接验证逻辑
3. 更新coordinate-consistency.test.ts的坐标测试
4. 修复layout-coordinate.test.ts的布局测试

### 阶段3：增强预览线测试
1. 添加endpoint坐标专项测试
2. 增加手动布局和画布移动场景测试
3. 验证吸附连接的坐标准确性

### 阶段4：验证和优化
1. 运行完整测试套件
2. 分析测试覆盖率
3. 修复剩余问题
4. 性能优化验证

## 预期结果
- 测试通过率从当前的89%提升到95%以上
- 预览线endpoint坐标测试覆盖率达到90%
- 营销画布节点类型测试完全适配
- 通用工作流测试保持稳定