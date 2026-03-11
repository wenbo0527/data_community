# 横版画布节点out端口评估文档

## 1. 端口生成逻辑架构概述

横版画布采用**分层式端口管理系统**，主要由以下核心模块组成：

### 1.1 架构层次结构
```
┌─────────────────────────────────────────┐
│           节点创建层 (index.vue)          │
├─────────────────────────────────────────┤
│         端口配置工厂 (portConfigFactory)  │
├─────────────────────────────────────────┤
│         节点配置管理器 (NodeConfigManager)│
├─────────────────────────────────────────┤
│         端口验证组合式函数 (usePortValidation)│
├─────────────────────────────────────────┤
│         节点端口组合式函数 (useNodePorts)  │
└─────────────────────────────────────────┘
```

### 1.2 核心设计原则
- **左进右出**：输入端口在左侧，输出端口在右侧
- **内容对齐**：输出端口与节点内容行一一对应
- **动态调整**：基于DOM实测数据进行端口位置校正
- **统一端口**：普通节点使用单个`out`端口，分流节点使用多个`out-i`端口

## 2. 核心端口配置工厂实现分析

### 2.1 端口配置工厂 (`portConfigFactoryHorizontal.js`)

**核心功能**：根据节点类型和内容生成标准化的端口配置

```javascript
export function createHorizontalPortConfig(outCount = 1, options = {}) {
  const { 
    includeIn = true,
    includeOut = true,
    outIds = null, 
    verticalOffsets = null, 
    nodeHeight = null,
    contentLines = null,
    enableValidation = true,
    tolerance = 2
  } = options
  
  // 端口组配置
  const groups = {
    in: { position: 'left', portLayout: { name: 'fixed-left-y' } },
    out: { position: 'right', portLayout: { name: 'fixed-right-y' } }
  }
  
  // 动态生成端口项
  const items = generatePortItems(outCount, outIds, verticalOffsets)
  
  return { groups, items }
}
```

### 2.2 端口样式配置

**输入端口样式**：
```javascript
{
  circle: { 
    r: 6, 
    magnet: true, 
    stroke: '#5F95FF', 
    strokeWidth: 2, 
    fill: '#fff',
    portType: 'in',
    allowSource: false,  // 只能作为目标
    allowTarget: true
  }
}
```

**输出端口样式**：
```javascript
{
  circle: { 
    r: 6, 
    magnet: true, 
    stroke: '#5F95FF', 
    strokeWidth: 2, 
    fill: '#4C78FF',
    portType: 'out',
    allowSource: true,   // 只能作为源
    allowTarget: false
  }
}
```

## 3. 节点类型与端口数量映射关系

### 3.1 端口数量决策逻辑

```javascript
// 在 createRectNode 函数中
const isSplit = nodeType === 'audience-split' || 
               nodeType === 'crowd-split' || 
               nodeType === 'event-split' || 
               nodeType === 'ab-test'

const outIds = isSplit && rows.length > 0 
  ? rows.map((_, i) => `out-${i}`) 
  : ['out']
```

### 3.2 节点类型端口映射表

| 节点类型 | 输入端口 | 输出端口数量 | 端口ID模式 | 对齐方式 |
|---------|---------|-------------|------------|----------|
| start | 无 | 1 | out | 内容区中心 |
| end | 1 (in) | 无 | - | - |
| normal | 1 (in) | 1 | out | 内容区中心 |
| audience-split | 1 (in) | 行数 | out-0, out-1... | 每行内容中心 |
| crowd-split | 1 (in) | 行数 | out-0, out-1... | 每行内容中心 |
| event-split | 1 (in) | 行数 | out-0, out-1... | 每行内容中心 |
| ab-test | 1 (in) | 行数 | out-0, out-1... | 每行内容中心 |

## 4. 端口位置计算算法详解

### 4.1 垂直偏移计算

**基础公式**：
```javascript
// 内容区域参数
const headerHeight = 36      // 标题栏高度
const contentPadding = 12    // 内容区内边距
const rowHeight = 32         // 每行高度

// 内容区域总高度
const contentHeight = rows.length * rowHeight

// 内容区域中心点
const contentCenter = headerHeight + contentPadding + (contentHeight / 2)

// 每行内容的垂直偏移
const verticalOffsets = rows.map((_, i) => 
  headerHeight + contentPadding + i * rowHeight + Math.floor(rowHeight / 2)
)
```

### 4.2 端口dy偏移计算

**核心算法**：
```javascript
// 相对于节点中心的dy偏移
calculatePortDy(verticalOffset, nodeHeight) {
  return verticalOffset - (nodeHeight / 2)
}

// 实际应用
const portConfig = {
  id: 'out-0',
  group: 'out',
  args: { 
    dy: verticalOffsets[0] - (nodeHeight / 2)
  }
}
```

### 4.3 节点高度计算

**精确高度公式**：
```javascript
const height = headerHeight +               // 36px 标题栏
              contentPadding +              // 12px 上内边距
              (rows.length * rowHeight) +     // 内容行高度
              contentPadding                  // 12px 下内边距
```

## 5. DOM实测与校正机制

### 5.1 校正触发时机

在节点创建完成后，使用`nextTick`触发DOM实测校正：
```javascript
// 节点创建完成后的校正
nextTick(() => {
  try {
    rebuildPortsFromDOM(node, rows)
  } catch (e) {
    console.warn('[Horizontal] DOM端口重建失败:', e)
  }
})
```

### 5.2 DOM实测算法

```javascript
function rebuildPortsFromDOM(node, rows) {
  // 1. 获取节点视图和容器
  const view = graph.findViewByCell(node)
  const containerRect = graph.container.getBoundingClientRect()
  
  // 2. 测量每行文本的真实中心位置
  const lineCentersGraphY = rows.map((_, i) => {
    const el = view.findOne(`row-${i}`)
    const r = el.getBoundingClientRect()
    
    // 转换为画布坐标
    const cg = graph.clientToGraphPoint({
      x: Math.round(r.left + r.width / 2),
      y: Math.round(r.top + r.height / 2)
    })
    
    return Math.round(cg.y)
  })
  
  // 3. 计算相对节点顶部的偏移
  const nodeTopGraph = Math.round(nodeRect.top - containerRect.top)
  const verticalOffsets = lineCentersGraphY.map(y => y - nodeTopGraph)
  
  // 4. 重建端口配置
  const portConfig = createHorizontalPortConfig(rows.length, {
    verticalOffsets,
    nodeHeight: nodeRect.height,
    enableValidation: true
  })
  
  // 5. 覆盖式重建端口
  rebuildPortsWithNewConfig(node, portConfig)
}
```

### 5.3 二次视觉补偿

如果仍存在固定偏差（如±52px），执行视觉补偿：
```javascript
// 基于实际circle中心修正dy
const getCircleCenterYByPortId = (pid) => {
  const portContainer = view.container.querySelector(`[data-port="${pid}"]`)
  const r = portContainer.getBoundingClientRect()
  const centerY = Math.round(r.top + r.height / 2 - containerRect.top)
  return centerY
}

// 计算补偿值
const compensation = actualCenterY - expectedCenterY
node.setPortProp(portId, 'args/dy', currentDy + compensation)
```

## 6. 端口验证与对齐检查

### 6.1 验证框架 (`usePortValidation.js`)

**验证维度**：
1. **端口数量验证**：确保输出端口数量与内容行数匹配
2. **位置精度验证**：检查端口与内容行的对齐精度（±2px）
3. **ID格式验证**：验证端口ID格式是否符合规范
4. **连接约束验证**：检查端口连接方向和数量限制

### 6.2 对齐精度检查

```javascript
function validateOutputPorts(outGroup, contentLines, tolerance, results) {
  const expectedPortsCount = contentLines.length
  const actualPortsCount = outGroup.items.length
  
  // 数量检查
  if (actualPortsCount !== expectedPortsCount) {
    results.errors.push({
      type: 'port_count_mismatch',
      message: `输出端口数量不匹配: 期望${expectedPortsCount}个，实际${actualPortsCount}个`
    })
  }
  
  // 位置精度检查
  outGroup.items.forEach((port, index) => {
    const expectedDy = getExpectedOutputPortDy(index, contentLines.length)
    const actualDy = port.args?.dy
    const deviation = Math.abs(actualDy - expectedDy)
    
    if (deviation > tolerance) {
      results.errors.push({
        type: 'output_port_alignment',
        message: `输出端口${port.id}位置偏差过大: ${deviation}px`
      })
    }
  })
}
```

### 6.3 期望位置计算

```javascript
function getExpectedOutputPortDy(lineIndex, totalLines) {
  const headerHeight = 36
  const contentPadding = 12
  const rowHeight = 32
  const nodeHeight = headerHeight + contentPadding + (totalLines * rowHeight) + contentPadding
  
  const verticalOffset = headerHeight + contentPadding + (lineIndex * rowHeight) + (rowHeight / 2)
  const expectedDy = verticalOffset - (nodeHeight / 2)
  
  return expectedDy
}
```

## 7. 性能优化与监控

### 7.1 性能监控机制

```javascript
// 性能监控：端口配置计算
const endPortConfigMeasure = performanceMonitor.measure('portConfigCalculation')

// 性能监控：节点更新操作
const endNodeUpdateMeasure = performanceMonitor.measure('nodeUpdateOperation')
```

### 7.2 优化策略

1. **缓存机制**：端口配置结果缓存，避免重复计算
2. **延迟校正**：DOM校正延迟到下一个事件循环
3. **批量操作**：端口重建采用批量移除和添加
4. **条件验证**：仅在开发环境启用详细验证

### 7.3 调试信息

系统提供详细的调试日志：
```javascript
console.log('📐 [createRectNode] 端口计算准备:', {
  nodeType,
  isSplit,
  rowsCount: rows.length,
  outIds,
  verticalOffsets
})

console.log('🔍 [portConfigFactory] 端口验证结果:', {
  isValid: validationResult.isValid,
  errors: validationResult.errors,
  contentLinesCount: contentLines.length
})
```

## 8. 存在的问题与风险评估

### 8.1 已知问题

#### 8.1.1 固定偏差问题
- **现象**：存在±52px的系统性偏差
- **原因**：模型高度计算与DOM实际高度不一致
- **影响**：端口与内容行无法完美对齐
- **当前解决方案**：二次视觉补偿机制

#### 8.1.2 节点配置管理器冲突
- **现象**：NodeConfigManager强制使用统一`out`端口
- **原因**：与分流节点的多端口需求冲突
- **影响**：事件分流节点等特殊节点端口配置异常
- **当前解决方案**：特殊处理逻辑

#### 8.1.3 DOM测量时序问题
- **现象**：DOM元素尚未渲染完成时进行测量
- **原因**：nextTick时序与DOM更新不同步
- **影响**：测量数据不准确，校正失败
- **当前解决方案**：异常捕获和跳过机制

### 8.2 风险评估

#### 8.2.1 高风险项
1. **端口位置不一致**：影响用户视觉体验和连接准确性
2. **性能开销**：频繁的DOM测量和端口重建
3. **维护复杂度**：多层校正逻辑增加代码维护难度

#### 8.2.2 中风险项
1. **验证机制依赖**：过度依赖运行时验证而非设计时保证
2. **硬编码参数**：多处硬编码的像素值和比例参数
3. **异常处理**：部分异常情况处理不够完善

#### 8.2.3 低风险项
1. **样式一致性**：端口样式在不同状态下的一致性
2. **交互体验**：端口悬停和连接状态的反馈
3. **兼容性**：不同浏览器下的渲染一致性

## 9. 改进建议与优化方案

### 9.1 短期优化（1-2周）

#### 9.1.1 统一偏差补偿机制
```javascript
// 建议实现统一的偏差补偿表
const SYSTEMATIC_OFFSETS = {
  'event-split': { dx: 0, dy: -52 },
  'audience-split': { dx: 0, dy: -48 },
  'default': { dx: 0, dy: 0 }
}

function applySystematicCompensation(nodeType, portConfig) {
  const offset = SYSTEMATIC_OFFSETS[nodeType] || SYSTEMATIC_OFFSETS.default
  portConfig.items.forEach(item => {
    if (item.args) {
      item.args.dx = (item.args.dx || 0) + offset.dx
      item.args.dy = (item.args.dy || 0) + offset.dy
    }
  })
}
```

#### 9.1.2 增强异常处理
```javascript
function rebuildPortsFromDOM(node, rows) {
  try {
    // 增加重试机制
    let retries = 3
    let success = false
    
    while (retries > 0 && !success) {
      try {
        // DOM测量逻辑
        success = performDOMMeasurement(node, rows)
      } catch (e) {
        retries--
        if (retries === 0) {
          console.warn('DOM测量失败，使用fallback配置')
          useFallbackPortConfig(node, rows)
        } else {
          // 等待更长时间
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
    }
  } catch (e) {
    console.error('端口重建失败:', e)
  }
}
```

### 9.2 中期重构（1-2月）

#### 9.2.1 端口配置标准化
建议建立统一的端口配置规范：

```typescript
interface PortConfigStandard {
  // 基础配置
  id: string
  group: 'in' | 'out'
  position: PortPosition
  
  // 几何配置
  geometry: {
    offset: { dx: number, dy: number }
    alignment: 'center' | 'top' | 'bottom'
    baseline: 'middle' | 'top' | 'bottom'
  }
  
  // 样式配置
  style: PortStyle
  
  // 验证配置
  validation: {
    tolerance: number
    constraints: PortConstraint[]
  }
}

// 标准化配置生成器
class StandardPortConfigGenerator {
  generateConfig(nodeType: string, content: string[]): PortConfigStandard[] {
    // 基于规范和内容生成标准配置
  }
}
```

#### 9.2.2 布局计算引擎重构
```javascript
// 建议实现独立的布局计算引擎
class PortLayoutEngine {
  constructor(options) {
    this.baselineOffset = options.baselineOffset || 0
    this.rowHeight = options.rowHeight || 32
    this.headerHeight = options.headerHeight || 36
    this.contentPadding = options.contentPadding || 12
  }
  
  calculatePortPositions(nodeType, contentLines, nodeHeight) {
    // 统一的位置计算逻辑
    const positions = []
    
    contentLines.forEach((line, index) => {
      const yOffset = this.calculateLineOffset(index, contentLines.length)
      positions.push({
        id: `out-${index}`,
        dy: yOffset - (nodeHeight / 2) + this.baselineOffset,
        alignment: 'center'
      })
    })
    
    return positions
  }
  
  calculateLineOffset(lineIndex, totalLines) {
    return this.headerHeight + 
           this.contentPadding + 
           (lineIndex * this.rowHeight) + 
           (this.rowHeight / 2)
  }
}
```

### 9.3 长期规划（3-6月）

#### 9.3.1 声明式端口系统
建议向声明式端口配置转型：

```javascript
// 声明式端口配置
const portDeclarations = {
  'event-split': {
    inputs: [{ id: 'in', position: 'left', align: 'content-center' }],
    outputs: [
      { 
        id: 'out', 
        position: 'right', 
        align: 'content-lines',
        generateIds: (content) => content.map((_, i) => `out-${i}`)
      }
    ]
  },
  
  'normal': {
    inputs: [{ id: 'in', position: 'left', align: 'content-center' }],
    outputs: [{ id: 'out', position: 'right', align: 'content-center' }]
  }
}

// 声明式渲染引擎
class DeclarativePortRenderer {
  render(declaration, node, content) {
    // 基于声明自动生成端口配置和DOM
  }
}
```

#### 9.3.2 运行时验证系统
```javascript
// 运行时验证和自动校正
class RuntimePortValidator {
  validateAndCorrect(node, ports, content) {
    const issues = this.detectIssues(node, ports, content)
    
    if (issues.length > 0) {
      const corrections = this.calculateCorrections(issues)
      this.applyCorrections(node, corrections)
      
      // 记录自动校正日志
      this.logAutoCorrection(node, corrections)
    }
  }
  
  detectIssues(node, ports, content) {
    // 检测端口位置、数量、对齐等问题
  }
}
```

### 9.4 实施建议

#### 9.4.1 渐进式迁移
1. **第一阶段**：实现统一偏差补偿，解决当前最突出问题
2. **第二阶段**：重构布局计算引擎，建立标准化配置体系
3. **第三阶段**：引入声明式配置，简化端口管理逻辑
4. **第四阶段**：完善运行时验证，实现自适应校正

#### 9.4.2 测试策略
1. **单元测试**：覆盖所有端口计算和验证逻辑
2. **集成测试**：验证不同节点类型的端口生成
3. **视觉测试**：确保端口与内容完美对齐
4. **性能测试**：监控端口重建的性能开销

#### 9.4.3 监控指标
1. **对齐精度**：端口与内容行的平均偏差
2. **重建成功率**：DOM校正的成功率
3. **性能指标**：端口生成的平均耗时
4. **异常频率**：端口相关错误的发生频率

通过系统性的分析和渐进式的优化，可以显著提升横版画布节点端口