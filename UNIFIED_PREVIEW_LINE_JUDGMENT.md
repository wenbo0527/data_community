# 统一预览线生成判断方案

## 概述

本方案统一了项目中所有预览线生成的判断逻辑，遵循"先判断是否应该生成 → 检查节点配置的最大分支数 → 检查连接线是否已达上限 → 如果未达上限则生成"的流程。

## 核心方法

### `shouldCreatePreviewLineUnified(node, options)`

这是统一的预览线生成判断方法，按照以下流程进行判断：

#### 参数说明
- `node`: 要检查的节点
- `options`: 选项对象
  - `excludeEdgeId`: 要排除的边ID
  - `forceMode`: 是否强制模式（忽略配置状态）
  - `isAfterNodeDeletion`: 是否是节点删除后的检查

#### 返回值
```javascript
{
  shouldCreate: boolean,    // 是否应该创建预览线
  reason: string,          // 判断原因
  details: {               // 详细信息
    step: string,          // 判断步骤
    createType: string,    // 创建类型（如果需要创建）
    // ... 其他详细信息
  }
}
```

## 判断流程

### 第一步：基础过滤
1. 检查节点是否存在
2. 跳过拖拽提示点节点
3. 跳过结束节点
4. 跳过预览线相关节点

### 第二步：配置状态检查
- 非强制模式且非开始节点时，检查节点是否已配置完成
- 未配置的节点不生成预览线

### 第三步：节点类型和分支数限制检查
- 识别是否为分支节点
- 检查分支数是否超过节点类型限制
- 分支数限制配置：
  - `audience-split`: 最多10个分支
  - `event-split`: 最多8个分支
  - `ab-test`: 最多5个分支
  - 默认: 1个分支

### 第四步：现有连接数检查
- 检查节点是否已有真实连接
- 对于分支节点，检查可用分支数
- 统计已连接的分支数，计算可用分支数

### 第五步：最终判断
- 普通节点：检查是否已有任何连接
- 根据节点类型和状态决定创建类型

## 创建类型

### `create_single_preview`
- 普通节点的单一预览线创建

### `create_branch_previews`
- 分支节点的多分支预览线创建

### `partial_branch_refresh`
- 分支节点的部分分支刷新

## 已统一的方法

### 1. `shouldCreatePreviewLine(node, excludeEdgeId)`
- **状态**: ✅ 已统一
- **说明**: 兼容性方法，内部调用 `shouldCreatePreviewLineUnified`
- **标记**: `@deprecated` 建议使用新方法

### 2. `shouldRefreshNodePreviewLines(node, options)`
- **状态**: ✅ 已统一
- **说明**: 预览线刷新判断，使用统一逻辑
- **改进**: 返回格式保持兼容性

### 3. `createPreviewLineAfterConfig(node, config)`
- **状态**: ✅ 已统一
- **说明**: 节点配置完成后的预览线创建
- **改进**: 根据判断结果选择不同的创建策略

## 使用示例

```javascript
// 基础使用
const result = manager.shouldCreatePreviewLineUnified(node)
if (result.shouldCreate) {
  console.log(`需要创建预览线: ${result.reason}`)
  console.log(`创建类型: ${result.details.createType}`)
}

// 带选项使用
const result = manager.shouldCreatePreviewLineUnified(node, {
  forceMode: true,
  isAfterNodeDeletion: true
})

// 在预览线刷新中使用
const refreshResult = manager.shouldRefreshNodePreviewLines(node, {
  forceUpdateAll: false
})
```

## 优势

1. **统一性**: 所有预览线判断逻辑集中在一个方法中
2. **可维护性**: 修改判断逻辑只需要修改一个地方
3. **可扩展性**: 新的判断条件可以轻松添加
4. **调试友好**: 详细的日志和返回信息便于调试
5. **向后兼容**: 保持现有API的兼容性

## 注意事项

1. 所有新的预览线相关功能应该使用 `shouldCreatePreviewLineUnified` 方法
2. 旧的 `shouldCreatePreviewLine` 方法已标记为废弃，但保持兼容性
3. 判断结果包含详细信息，便于调试和日志记录
4. 强制模式可以跳过配置状态检查，用于特殊场景

## 测试建议

1. 测试各种节点类型的预览线生成
2. 测试分支数限制是否正确执行
3. 测试配置状态对预览线生成的影响
4. 测试强制模式的行为
5. 测试节点删除后的预览线刷新