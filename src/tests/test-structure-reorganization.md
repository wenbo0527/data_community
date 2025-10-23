# 测试结构重组方案

## 当前问题分析

### 1. 命名不一致
- 中英文混用：`audience-split-preview-line.test.js` vs `人群分流节点预览线生成综合测试`
- 命名规范不统一：有些用连字符，有些用驼峰

### 2. 功能分类混乱
- 预览线相关测试散布在多个文件中
- 画布集成测试与单元测试混合
- 缺乏清晰的功能模块划分

### 3. 重复测试过多
- 多个文件测试相似的预览线功能
- 集成测试与单元测试边界不清

## 重组方案

### 核心功能模块分类

#### 1. 画布核心功能 (Canvas Core)
```
src/tests/canvas/
├── core/
│   ├── canvas-initialization.test.js      # 画布初始化
│   ├── canvas-node-management.test.js     # 节点管理
│   ├── canvas-edge-management.test.js     # 边管理
│   └── canvas-event-handling.test.js      # 事件处理
├── integration/
│   ├── canvas-workflow-integration.test.js # 工作流集成
│   └── canvas-performance.test.js          # 性能测试
└── utils/
    └── canvas-test-helpers.js              # 测试辅助工具
```

#### 2. 预览线系统 (Preview Line System)
```
src/tests/preview-line/
├── core/
│   ├── preview-line-creation.test.js      # 预览线创建
│   ├── preview-line-validation.test.js    # 预览线验证
│   ├── preview-line-rendering.test.js     # 预览线渲染
│   └── preview-line-cleanup.test.js       # 预览线清理
├── node-types/
│   ├── start-node-preview.test.js         # 开始节点预览线
│   ├── branch-node-preview.test.js        # 分支节点预览线
│   ├── call-node-preview.test.js          # 调用节点预览线
│   └── end-node-preview.test.js           # 结束节点预览线
├── integration/
│   ├── preview-line-canvas-integration.test.js # 画布集成
│   └── preview-line-stability.test.js          # 稳定性测试
└── utils/
    └── preview-line-test-helpers.js        # 测试辅助工具
```

#### 3. 连接线管理 (Connection Management)
```
src/tests/connection/
├── core/
│   ├── connection-creation.test.js        # 连接创建
│   ├── connection-validation.test.js      # 连接验证
│   ├── connection-deletion.test.js        # 连接删除
│   └── connection-port-management.test.js # 端口管理
├── features/
│   ├── connection-context-menu.test.js    # 上下文菜单
│   └── connection-duplicate-prevention.test.js # 重复连接防护
└── utils/
    └── connection-test-helpers.js          # 测试辅助工具
```

#### 4. 节点操作 (Node Operations)
```
src/tests/node/
├── core/
│   ├── node-creation.test.js              # 节点创建
│   ├── node-deletion.test.js              # 节点删除
│   ├── node-validation.test.js            # 节点验证
│   └── node-data-management.test.js       # 节点数据管理
├── types/
│   ├── workflow-node.test.js              # 工作流节点
│   ├── audience-split-node.test.js        # 人群分流节点
│   └── call-node.test.js                  # 调用节点
└── utils/
    └── node-test-helpers.js                # 测试辅助工具
```

### 统一命名规范

#### 文件命名规则
- 使用英文命名
- 使用连字符分隔单词
- 测试文件以 `.test.js` 结尾
- 辅助工具文件以 `-helpers.js` 或 `-utils.js` 结尾

#### 测试用例命名规则
- 使用中文描述（符合团队习惯）
- 使用 `describe` 和 `it` 结构
- 测试描述要清晰明确

### Mock工厂函数统一

#### 统一Mock创建方式
```javascript
// 使用统一的Mock工厂
import { 
  createMockCanvas,
  createMockPreviewLineSystem,
  createMockNode,
  createTestEnvironment 
} from '../utils/test-helpers.js'
```

#### 标准化测试环境
```javascript
// 每个测试文件使用统一的环境设置
beforeEach(() => {
  testEnv = createTestEnvironment({
    enableCanvas: true,
    enablePreviewLine: true,
    enableConnection: true
  })
})
```

## 实施步骤

### 第一阶段：创建新的目录结构
1. 创建功能模块目录
2. 移动现有测试文件到对应目录
3. 重命名文件以符合新的命名规范

### 第二阶段：整合重复测试
1. 识别重复的测试用例
2. 合并相似功能的测试
3. 删除冗余的测试文件

### 第三阶段：统一Mock和辅助工具
1. 整合Mock工厂函数
2. 创建统一的测试辅助工具
3. 更新所有测试文件使用统一的Mock

### 第四阶段：验证和优化
1. 运行所有测试确保功能正常
2. 检查测试覆盖率
3. 优化测试性能

## 预期效果

### 1. 提高可维护性
- 清晰的功能模块划分
- 统一的命名和组织规范
- 减少重复代码

### 2. 提升测试效率
- 更快的测试运行速度
- 更好的测试隔离性
- 更容易定位问题

### 3. 改善开发体验
- 更容易找到相关测试
- 更简单的测试编写
- 更清晰的测试结构