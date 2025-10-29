# 画布系统分层测试修复策略

## 测试分层方案

### 第一层：核心基础模块测试
**目标**：确保基础工具类和核心模块正常工作
**测试范围**：
- 工具类测试 (ValidationUtils, GeometryUtils, BranchLabelUtils)
- 配置管理器测试 (PreviewLineConfigManager)
- 事件管理器测试 (EventManager)
- 状态管理器测试 (StateManager)

**运行命令**：
```bash
npx vitest run src/tests/unit/utils/ --reporter=basic
npx vitest run src/tests/unit/config/ --reporter=basic
npx vitest run src/tests/unit/events/ --reporter=basic
npx vitest run src/tests/unit/state/ --reporter=basic
```

### 第二层：布局引擎测试
**目标**：确保布局计算逻辑正确
**测试范围**：
- UnifiedStructuredLayoutEngine 测试
- PositionCalculator 测试
- CollisionDetector 测试

**运行命令**：
```bash
npx vitest run src/tests/unit/UnifiedStructuredLayoutEngine.test.js --reporter=basic
npx vitest run src/tests/unit/position/ --reporter=basic
npx vitest run src/tests/unit/collision/ --reporter=basic
```

### 第三层：预览线核心功能测试
**目标**：确保预览线管理和渲染功能正常
**测试范围**：
- PreviewLineManager 测试
- PreviewLineRenderer 测试
- StyleRenderer 测试

**运行命令**：
```bash
npx vitest run src/tests/unit/core/ --reporter=basic
npx vitest run src/tests/unit/renderer/ --reporter=basic
```

### 第四层：系统集成测试
**目标**：确保整个预览线系统正常工作
**测试范围**：
- PreviewLineSystem 测试
- 系统初始化测试
- 端到端功能测试

**运行命令**：
```bash
npx vitest run src/tests/unit/PreviewLineSystem.test.js --reporter=basic
npx vitest run src/tests/integration/ --reporter=basic
```

### 第五层：UI组件测试
**目标**：确保Vue组件正常渲染和交互
**测试范围**：
- TaskFlowCanvas 组件测试
- 其他相关UI组件测试

**运行命令**：
```bash
npx vitest run src/tests/components/ --reporter=basic
```

## 修复策略

### 1. 逐层修复原则
- 每层测试通过后再进入下一层
- 发现问题立即修复，不积累技术债务
- 保持向后兼容，不降级现有功能

### 2. 问题定位方法
- 使用 `--reporter=basic` 减少输出噪音
- 使用 `--no-coverage` 跳过覆盖率计算加快测试
- 单独运行失败的测试文件进行详细调试

### 3. 修复验证流程
- 修复后立即运行相关测试
- 确保修复不影响其他模块
- 记录修复内容和影响范围

## 快速测试命令

### 运行单个测试文件
```bash
npx vitest run [test-file-path] --reporter=basic --no-coverage
```

### 运行特定目录的测试
```bash
npx vitest run src/tests/unit/[directory]/ --reporter=basic --no-coverage
```

### 监听模式运行测试（开发时使用）
```bash
npx vitest src/tests/unit/[directory]/ --reporter=basic --no-coverage
```

### 运行所有测试（最终验证）
```bash
npx vitest run --reporter=verbose
```

## 当前状态

✅ 基础测试环境已配置完成
✅ 事件监听器泄漏问题已修复
🔄 准备开始第一层基础模块测试