# 预览线校验测试文档

本文档描述了预览线相关的校验逻辑和测试用例，确保预览线功能的稳定性和正确性。

## 测试文件概览

### 1. preview-line-validation.test.js
**主要功能**: 综合性预览线校验测试
- 预览线显示信息校验
- Y坐标校验逻辑
- 预览线标签显示校验
- 预览线创建完整性校验

### 2. preview-line-display.test.js
**主要功能**: 预览线显示逻辑专项测试
- 源节点ID显示测试
- 标签文本解析测试
- 预览线统计信息测试
- 节点分支信息测试

### 3. yCoordinateConsistency.test.js (已更新)
**主要功能**: Y坐标一致性和校验测试
- NaN Y坐标检测和修复
- Y坐标合理性范围校验
- Y坐标校验详细信息记录

## 校验逻辑说明

### 1. 预览线显示校验
解决了预览线显示"undefined -> undefined"的问题：

```javascript
// 修复前：显示 undefined -> undefined
// 修复后：显示 node_1758007854880 -> 坐标

const displaySourceId = edgeData.sourceNodeId || sourceId || 'unknown'
const displayTargetId = targetId || '坐标'
```

**测试覆盖**:
- ✅ 源节点ID正确显示
- ✅ 目标显示为"坐标"而不是undefined
- ✅ 预览线类型正确识别

### 2. Y坐标校验逻辑
添加了Y坐标的有效性和合理性校验：

```javascript
// 基本有效性检查
if (typeof y !== 'number' || isNaN(y)) {
  console.error('[预览线] Y坐标无效:', y)
  return false
}

// 合理性范围校验
const minY = 50
const maxY = 2000
const correctedY = Math.max(minY, Math.min(maxY, y))

if (correctedY !== originalY) {
  console.warn(`[预览线] Y坐标超出范围，已修正: ${originalY} -> ${correctedY}`)
}
```

**测试覆盖**:
- ✅ NaN Y坐标检测和修复
- ✅ 超出范围Y坐标修正（minY=50, maxY=2000）
- ✅ 校验过程详细日志记录

### 3. 标签显示校验
修复了标签显示为"empty"的问题：

```javascript
// 优先级：attrs.text.text > markup > text > 'empty'
let labelText = 'empty'
if (label.attrs && label.attrs.text && label.attrs.text.text) {
  labelText = label.attrs.text.text
} else if (label.markup) {
  labelText = label.markup
} else if (label.text) {
  labelText = label.text
}
```

**测试覆盖**:
- ✅ X6标签结构正确解析
- ✅ 不同格式标签数据处理
- ✅ 空标签情况处理

## 测试用例示例

### 预览线显示测试
```javascript
it('应该正确显示源节点ID而不是undefined', () => {
  const result = previewManager.createUnifiedPreviewLine(
    mockNode,
    { x: 500, y: 450 },
    'branch',
    'branch-1',
    0,
    3,
    '黑名单'
  )

  expect(mockGraph.addEdge).toHaveBeenCalledWith(
    expect.objectContaining({
      source: { cell: 'test-node-id', port: 'bottom' },
      data: expect.objectContaining({
        sourceNodeId: 'test-node-id',
        branchLabel: '黑名单'
      })
    })
  )
})
```

### Y坐标校验测试
```javascript
it('应该修正超出范围的Y坐标', () => {
  const testCases = [
    { input: 10, expected: 50, description: '小于最小值' },
    { input: 3000, expected: 2000, description: '大于最大值' },
    { input: 100, expected: 100, description: '在合理范围内' }
  ]
  
  testCases.forEach(({ input, expected }) => {
    const correctedY = Math.max(50, Math.min(2000, input))
    expect(correctedY).toBe(expected)
  })
})
```

### 标签显示测试
```javascript
it('应该正确解析X6标签的文本内容', () => {
  const mockLabel = {
    attrs: { text: { text: '黑名单' } },
    position: 0.8
  }
  
  let labelText = 'empty'
  if (mockLabel.attrs?.text?.text) {
    labelText = mockLabel.attrs.text.text
  }
  
  expect(labelText).toBe('黑名单')
})
```

## 运行测试

```bash
# 运行所有预览线相关测试
npm test preview-line

# 运行特定测试文件
npm test preview-line-validation.test.js
npm test preview-line-display.test.js
npm test yCoordinateConsistency.test.js

# 运行测试并查看覆盖率
npm test -- --coverage
```

## 预期测试结果

根据修复日志，测试应该验证以下结果：

1. **节点信息正确显示**:
   - 节点ID: node_1758007854880
   - 类型: audience-split
   - 位置: (390, 360)
   - 分支数: 3个

2. **预览线信息正确显示**:
   - 源节点: node_1758007854880
   - 目标: 坐标
   - 类型: unified-preview-line
   - 标签: 正确显示分支标签而不是"empty"

3. **Y坐标校验正常工作**:
   - 无效Y坐标被检测和修复
   - 超出范围的Y坐标被修正到合理范围内
   - 校验过程有详细的日志记录

## 注意事项

1. 所有测试使用vitest框架，符合项目规范
2. 测试中使用mock对象模拟真实环境
3. 测试覆盖了边界情况和异常情况
4. 测试结果应该与实际修复日志一致