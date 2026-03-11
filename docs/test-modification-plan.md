# 营销画布测试代码修改方案

## 概述

本文档详细描述了营销画布项目中测试代码的修改方案，主要包括两个核心方面：
1. **预览线endpoint坐标测试增强**：确保预览线在各种场景下的坐标准确性
2. **营销画布节点类型测试更新**：将通用节点类型替换为营销画布专用节点类型

## 1. 预览线Endpoint坐标测试增强方案

### 1.1 当前测试覆盖分析

**已覆盖场景**：
- 基础预览线起始点坐标计算
- 拖拽过程中坐标转换
- 端口位置计算
- 布局坐标计算

**缺失场景**：
- 手动布局模式下移动节点后预览线刷新的坐标一致性
- 移动画布新建节点时预览线刷新位置的一致性
- 吸附时预览线连接到in端口的坐标准确性
- 拖拽时预览线连接到in端口的坐标计算

### 1.2 coordinate-consistency.test.ts 增强方案

#### 新增测试用例规格

**测试组：预览线Endpoint坐标专项测试**

```typescript
describe('预览线Endpoint坐标专项测试', () => {
  // 测试用例1：手动布局模式下移动节点后预览线刷新
  it('应该在手动布局模式下移动节点后正确刷新预览线endpoint坐标', async () => {
    // 1. 设置手动布局模式
    // 2. 创建源节点和目标节点
    // 3. 建立预览线连接
    // 4. 移动目标节点位置
    // 5. 验证预览线endpoint坐标更新正确性
    // 6. 验证坐标转换的准确性
  });

  // 测试用例2：移动画布新建节点时预览线刷新
  it('应该在移动画布新建节点时正确刷新预览线位置', async () => {
    // 1. 移动画布到新位置
    // 2. 在新位置创建节点
    // 3. 开始拖拽连接
    // 4. 验证预览线起始点坐标
    // 5. 验证预览线endpoint坐标相对于画布偏移的正确性
  });

  // 测试用例3：吸附时预览线连接到in端口
  it('应该在吸附时预览线准确连接到目标节点in端口', async () => {
    // 1. 创建源节点和目标节点
    // 2. 开始拖拽连接
    // 3. 移动到目标节点吸附范围内
    // 4. 触发吸附逻辑
    // 5. 验证预览线endpoint精确连接到in端口坐标
    // 6. 验证吸附后的坐标偏移计算
  });

  // 测试用例4：拖拽时预览线连接到in端口坐标计算
  it('应该在拖拽过程中正确计算预览线到in端口的坐标', async () => {
    // 1. 创建不同类型的目标节点（start、audience-split、end等）
    // 2. 开始拖拽连接
    // 3. 在拖拽过程中实时验证endpoint坐标
    // 4. 验证不同节点类型in端口位置计算的准确性
    // 5. 验证坐标转换在实时拖拽中的性能
  });

  // 测试用例5：复杂场景下的endpoint坐标一致性
  it('应该在复杂场景下保持endpoint坐标一致性', async () => {
    // 1. 同时进行画布缩放、移动、节点拖拽
    // 2. 验证多重变换下的坐标计算
    // 3. 验证坐标缓存机制的正确性
    // 4. 验证边界情况下的坐标处理
  });
});
```

#### 关键验证点

1. **坐标转换准确性**：DOM坐标 ↔ 画布坐标转换
2. **端口位置计算**：不同节点类型的in端口位置
3. **实时更新机制**：移动、缩放时的坐标同步
4. **吸附逻辑集成**：吸附触发时的坐标修正
5. **性能验证**：大量坐标计算的性能表现

### 1.3 DragInteractionManager.test.ts 增强方案

#### 新增测试用例

```typescript
describe('预览线Endpoint拖拽交互', () => {
  it('应该在拖拽过程中实时更新预览线endpoint到in端口', () => {
    // 验证拖拽过程中endpoint坐标的实时计算
  });

  it('应该在吸附触发时精确调整预览线endpoint位置', () => {
    // 验证吸附逻辑对endpoint坐标的影响
  });
});
```

## 2. 营销画布节点类型测试更新方案

### 2.1 节点类型映射表

| 旧节点类型 | 营销画布节点类型 | 特性 |
|-----------|-----------------|------|
| INPUT | start | 单一输入限制，流程起始点 |
| PROCESSING | audience-split, event-split, sms, ai-call, manual-call, wait | 业务逻辑处理 |
| OUTPUT | end | 无输出端口，流程终点 |
| - | ab-test | 分支节点，多输出端口 |

### 2.2 文件修改清单

#### 2.2.1 DragInteractionManager.test.ts

**修改内容**：
```typescript
// 替换节点类型引用
- import { NodeType } from '../utils/workflowNodeTypes.js';
+ import { getNodeConfig } from '../utils/nodeTypes.js';

// 更新测试数据
- type: NodeType.INPUT
+ type: 'start'

- type: NodeType.PROCESSING  
+ type: 'audience-split'

- type: NodeType.OUTPUT
+ type: 'end'
```

**新增测试用例**：
```typescript
describe('营销画布节点类型拖拽测试', () => {
  it('应该正确处理开始节点(start)的拖拽限制', () => {
    // 验证start节点的特殊拖拽规则
  });

  it('应该正确处理分支节点(audience-split)的多输出拖拽', () => {
    // 验证分支节点的多输出端口拖拽
  });

  it('应该正确处理结束节点(end)的拖拽限制', () => {
    // 验证end节点无输出的拖拽限制
  });
});
```

#### 2.2.2 NodeConnectionOptimizer.test.ts

**修改内容**：
```typescript
// 更新连接验证逻辑
const validateMarketingCanvasConnection = (sourceType, targetType) => {
  // start节点只能作为源节点
  if (targetType === 'start') return false;
  
  // end节点只能作为目标节点
  if (sourceType === 'end') return false;
  
  // 分支节点可以有多个输出
  const branchNodes = ['audience-split', 'event-split', 'ab-test'];
  
  return true;
};
```

**新增测试用例**：
```typescript
describe('营销画布连接规则测试', () => {
  it('应该阻止连接到开始节点(start)', () => {
    // 验证start节点作为目标的连接限制
  });

  it('应该阻止从结束节点(end)发起连接', () => {
    // 验证end节点作为源的连接限制
  });

  it('应该允许分支节点的多输出连接', () => {
    // 验证audience-split、event-split、ab-test的多输出
  });

  it('应该验证营销画布的业务流程连接规则', () => {
    // 验证完整的营销流程连接逻辑
  });
});
```

#### 2.2.3 coordinate-consistency.test.ts

**修改内容**：
```typescript
// 更新测试节点创建
const createMarketingCanvasNode = (type, position) => {
  const config = getNodeConfig(type);
  return {
    id: `node-${Date.now()}`,
    type,
    position,
    size: config.size,
    ports: config.ports
  };
};

// 更新测试场景
const testScenarios = [
  { sourceType: 'start', targetType: 'audience-split' },
  { sourceType: 'audience-split', targetType: 'sms' },
  { sourceType: 'sms', targetType: 'end' },
  { sourceType: 'event-split', targetType: 'ai-call' },
  { sourceType: 'ab-test', targetType: 'manual-call' }
];
```

#### 2.2.4 layout-coordinate.test.ts

**修改内容**：
```typescript
// 更新布局测试的节点类型
let mockNodes: any[] = [
  createMarketingCanvasNode('start', { x: 100, y: 100 }),
  createMarketingCanvasNode('audience-split', { x: 300, y: 100 }),
  createMarketingCanvasNode('sms', { x: 500, y: 100 }),
  createMarketingCanvasNode('end', { x: 700, y: 100 })
];
```

**新增测试用例**：
```typescript
describe('营销画布布局坐标测试', () => {
  it('应该正确计算分支节点的多输出端口布局', () => {
    // 验证audience-split、event-split等分支节点的端口布局
  });

  it('应该正确处理开始和结束节点的特殊布局', () => {
    // 验证start和end节点的特殊布局规则
  });
});
```

### 2.3 节点特性测试规格

#### 2.3.1 分支节点测试（audience-split、event-split、ab-test）

```typescript
describe('分支节点特性测试', () => {
  const branchNodeTypes = ['audience-split', 'event-split', 'ab-test'];
  
  branchNodeTypes.forEach(nodeType => {
    it(`应该支持${nodeType}节点的多输出端口`, () => {
      const config = getNodeConfig(nodeType);
      expect(config.maxOutputs).toBeGreaterThan(1);
      expect(config.ports.out).toBeDefined();
      expect(Array.isArray(config.ports.out)).toBe(true);
    });

    it(`应该正确计算${nodeType}节点的输出端口位置`, () => {
      // 验证多输出端口的位置计算
    });

    it(`应该支持${nodeType}节点的动态端口扩展`, () => {
      // 验证autoExpand功能
    });
  });
});
```

#### 2.3.2 开始节点测试（start）

```typescript
describe('开始节点特性测试', () => {
  it('应该限制start节点只能有一个输入', () => {
    const config = getNodeConfig('start');
    expect(config.maxInputs).toBe(0); // 开始节点不应有输入
  });

  it('应该阻止向start节点建立连接', () => {
    // 验证连接限制逻辑
  });

  it('应该正确标识start节点为流程起始点', () => {
    const config = getNodeConfig('start');
    expect(config.isStartNode).toBe(true);
  });
});
```

#### 2.3.3 结束节点测试（end）

```typescript
describe('结束节点特性测试', () => {
  it('应该限制end节点不能有输出', () => {
    const config = getNodeConfig('end');
    expect(config.maxOutputs).toBe(0);
  });

  it('应该阻止从end节点发起连接', () => {
    // 验证连接限制逻辑
  });

  it('应该正确标识end节点为流程终点', () => {
    const config = getNodeConfig('end');
    expect(config.isEndNode).toBe(true);
  });
});
```

## 3. 测试覆盖验证清单

### 3.1 预览线Endpoint坐标测试覆盖

- [ ] 手动布局模式下移动节点后预览线刷新
- [ ] 移动画布新建节点时预览线刷新位置
- [ ] 吸附时预览线连接到in端口的坐标准确性
- [ ] 拖拽时预览线连接到in端口的坐标计算
- [ ] 复杂场景下的endpoint坐标一致性
- [ ] 坐标转换性能验证
- [ ] 边界情况处理

### 3.2 营销画布节点类型测试覆盖

- [ ] 所有测试文件节点类型替换完成
- [ ] 分支节点多输出端口测试
- [ ] 开始节点单一输入限制测试
- [ ] 结束节点无输出端口测试
- [ ] 营销画布业务规则验证
- [ ] 节点配置正确性验证
- [ ] 连接规则完整性测试

### 3.3 集成测试验证

- [ ] 所有修改后的测试用例通过
- [ ] 测试覆盖率保持在80%以上
- [ ] 性能测试通过（执行时间<2秒）
- [ ] 无回归问题
- [ ] 代码质量检查通过

## 4. 实施计划

### 阶段1：预览线Endpoint坐标测试增强（预计2-3小时）
1. 修改coordinate-consistency.test.ts
2. 增强DragInteractionManager.test.ts
3. 运行测试验证

### 阶段2：营销画布节点类型更新（预计3-4小时）
1. 更新所有测试文件的节点类型引用
2. 添加节点特性专项测试
3. 更新连接规则验证逻辑

### 阶段3：集成测试和验证（预计1-2小时）
1. 运行完整测试套件
2. 修复发现的问题
3. 验证测试覆盖率和性能

## 5. 风险评估和缓解措施

### 风险点
1. **坐标计算复杂性**：新增的endpoint坐标测试可能涉及复杂的坐标转换逻辑
2. **节点类型兼容性**：替换节点类型可能影响现有功能
3. **测试执行时间**：新增测试用例可能增加测试执行时间

### 缓解措施
1. **分步实施**：按阶段逐步实施，每个阶段都进行验证
2. **回归测试**：确保修改不影响现有功能
3. **性能监控**：持续监控测试执行性能
4. **代码审查**：对关键修改进行代码审查

## 6. 成功标准

1. **功能完整性**：所有新增测试用例通过
2. **覆盖率目标**：测试覆盖率≥80%
3. **性能目标**：测试执行时间≤2秒
4. **质量目标**：无严重代码质量问题
5. **稳定性目标**：连续10次测试运行无随机失败

---

*本文档将作为测试代码修改的指导文档，确保修改过程的系统性和完整性。*