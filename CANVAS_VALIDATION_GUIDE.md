# 画布数据校验功能说明

## 功能概述

画布数据校验功能为营销任务流程设计提供了完整的数据验证机制，确保用户创建的任务流程在保存前符合业务规则和数据完整性要求。

## 核心功能

### 1. 校验工具 (`canvasValidation.js`)

位置：`src/utils/canvasValidation.js`

主要函数：
- `validateCanvasData(canvasData)` - 主校验函数
- `formatValidationMessage(validationResult)` - 格式化校验结果消息

### 2. 校验规则

#### 基础数据校验
- ✅ 画布数据不能为空
- ✅ 至少需要一个节点
- ✅ 节点数据完整性检查（ID、类型、位置等）
- ✅ 连接数据完整性检查（源节点、目标节点等）

#### 流程结构校验
- ✅ 必须有且仅有一个开始节点
- ⚠️ 建议添加结束节点
- ✅ 检查孤立节点
- ✅ 检查流程连通性（从开始节点到结束节点的可达性）

#### 节点配置校验
- ✅ **短信节点**：必须配置短信内容，建议配置模板
- ✅ **AI外呼节点**：必须配置外呼脚本，建议配置语音参数
- ✅ **人工外呼节点**：必须配置外呼脚本，建议配置分配规则
- ✅ **等待节点**：必须配置有效的等待时长
- ✅ **受众分流节点**：必须配置分流条件
- ✅ **事件分流节点**：必须配置事件配置
- ✅ **A/B测试节点**：至少需要2个测试变体
- ⚠️ **开始节点**：建议配置触发类型

## 使用方式

### 1. 任务保存时自动校验

在任务创建页面 (`create.vue`) 中，保存任务时会自动进行校验：

```javascript
// 获取画布数据
const canvasData = canvasRef.value?.getCanvasData()

// 校验画布数据
const validationResult = validateCanvasData(canvasData)

if (!validationResult.isValid) {
  // 显示错误对话框，阻止保存
  Modal.error({
    title: '画布数据校验失败',
    content: message,
    width: 500,
    okText: '我知道了'
  })
  return
}

if (validationResult.warnings.length > 0) {
  // 显示警告对话框，询问是否继续
  const confirmed = await new Promise((resolve) => {
    Modal.warning({
      title: '画布数据校验警告',
      content: `${message}\n\n是否继续保存任务？`,
      width: 500,
      okText: '继续保存',
      cancelText: '取消',
      onOk: () => resolve(true),
      onCancel: () => resolve(false)
    })
  })
}
```

### 2. 草稿保存时轻量校验

草稿保存时进行轻量级校验，只显示提示不阻止保存：

```javascript
const validationResult = validateCanvasData(canvasData)

if (!validationResult.isValid) {
  Message.warning('画布数据存在问题，建议完善后再正式保存')
} else if (validationResult.warnings.length > 0) {
  Message.info('画布数据已保存为草稿，建议完善后再正式保存')
}
```

### 3. 独立校验测试

提供了专门的测试页面 (`/test/canvas-validation`) 用于测试各种校验场景：

- 空画布测试
- 无开始节点测试
- 多个开始节点测试
- 孤立节点测试
- 配置不完整测试
- 有效画布测试
- 有警告的画布测试

## 校验结果结构

```javascript
{
  isValid: boolean,     // 是否通过校验
  errors: string[],     // 错误信息数组
  warnings: string[]    // 警告信息数组
}
```

## 错误处理策略

### 错误级别
- **错误 (Errors)**：阻止保存，必须修复
- **警告 (Warnings)**：允许保存，但建议修复

### 用户体验
- **正式保存**：错误阻止保存，警告询问用户
- **草稿保存**：错误和警告都只显示提示，不阻止保存
- **清晰的错误信息**：具体指出问题所在和修复建议

## 扩展性

校验系统设计为模块化结构，便于扩展：

1. **添加新的校验规则**：在 `validateCanvasData` 函数中添加新的校验逻辑
2. **添加新的节点类型校验**：在 `validateNodeConfigurations` 函数中添加新的 case
3. **自定义校验消息**：修改 `formatValidationMessage` 函数

## 测试覆盖

- ✅ 空数据场景
- ✅ 基础结构校验
- ✅ 流程连通性校验
- ✅ 节点配置校验
- ✅ 用户交互流程
- ✅ 错误处理机制

## 性能考虑

- 校验逻辑在客户端执行，响应迅速
- 采用深度优先搜索算法检查连通性，时间复杂度 O(V+E)
- 校验结果缓存，避免重复计算
- 异步处理用户确认对话框，不阻塞UI

## 未来优化方向

1. **增量校验**：只校验变更的部分
2. **实时校验**：在用户编辑时提供实时反馈
3. **自定义校验规则**：允许用户配置特定的业务规则
4. **校验报告**：生成详细的校验报告和修复建议
5. **国际化支持**：支持多语言错误消息