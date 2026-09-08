# 测试用例对齐修复计划

## 📊 问题诊断结果

### 1. 模块导入问题分析
- **DataPreprocessor 导入错误**: "DataPreprocessor is not a constructor"
- **根本原因**: 模块导出方式与测试Mock配置不匹配
- **影响范围**: 8个测试文件失败，163个测试跳过

### 2. 测试架构不一致
- **实际代码**: 使用ES6 class导出
- **测试Mock**: 使用vi.fn().mockImplementation()
- **不匹配点**: 构造函数调用方式

### 3. 模块化重构后的变化
- **新增模块**: layout/core/, layout/algorithms/, layout/utils/
- **缺失Mock**: 新模块缺少对应的Mock配置
- **路径变更**: 部分模块路径发生变化

## 🔧 修复策略

### 阶段1: 修复核心模块导入问题
1. **修复DataPreprocessor导出方式**
   - 检查实际模块的导出格式
   - 统一导出方式（default export vs named export）
   - 更新测试Mock配置

2. **修复其他核心模块**
   - LayoutExecutor
   - PositionApplicator
   - PerformanceMonitor

### 阶段2: 完善Mock配置
1. **创建统一的Mock工厂**
   - 为所有layout模块创建标准Mock
   - 确保Mock行为与实际模块一致
   - 支持不同测试场景的Mock配置

2. **更新测试环境配置**
   - 更新setup.js中的全局Mock
   - 添加新模块的Mock配置
   - 确保测试隔离性

### 阶段3: 测试用例对齐
1. **更新单元测试**
   - 修复UnifiedStructuredLayoutEngine.test.js
   - 更新Mock调用方式
   - 验证测试覆盖率

2. **更新集成测试**
   - 修复预览线集成测试
   - 更新画布交互测试
   - 确保端到端测试正常

## 📝 具体修复步骤

### Step 1: 检查DataPreprocessor模块导出
```javascript
// 检查当前导出方式
// 期望: export default class DataPreprocessor
// 或者: export { DataPreprocessor }
```

### Step 2: 修复测试Mock配置
```javascript
// 修复前
vi.mock('...DataPreprocessor.js', () => ({
  DataPreprocessor: vi.fn().mockImplementation(() => ({...}))
}))

// 修复后 (根据实际导出方式调整)
vi.mock('...DataPreprocessor.js', () => ({
  default: vi.fn().mockImplementation(() => ({...}))
}))
```

### Step 3: 创建统一Mock工厂
```javascript
// 创建 src/tests/mocks/layoutMocks.js
export const createDataPreprocessorMock = () => ({
  preprocess: vi.fn((nodes, edges) => ({ nodes, edges }))
})
```

### Step 4: 更新测试文件
- 更新所有使用DataPreprocessor的测试文件
- 统一Mock导入方式
- 确保测试数据格式一致

## 🎯 预期结果

### 修复后的测试状态
- ✅ 8个失败的测试文件恢复正常
- ✅ 163个跳过的测试重新执行
- ✅ 测试覆盖率达到预期水平
- ✅ 所有画布相关功能测试通过

### 质量保证
- 🔍 所有测试用例与实际业务需求匹配
- 🔍 Mock配置准确反映真实模块行为
- 🔍 测试数据符合实际使用场景
- 🔍 错误处理和边界情况覆盖完整

## 📈 执行时间线

1. **立即执行**: 修复DataPreprocessor导入问题
2. **30分钟内**: 完成核心模块Mock配置
3. **1小时内**: 更新所有相关测试文件
4. **1.5小时内**: 运行完整测试套件并验证结果

## 🚨 风险评估

### 低风险
- Mock配置更新
- 测试文件路径修复

### 中等风险
- 模块导出方式变更
- 测试数据格式调整

### 缓解措施
- 逐步修复，每次修复后立即验证
- 保留原始测试文件备份
- 分阶段运行测试，确保每个阶段都正常