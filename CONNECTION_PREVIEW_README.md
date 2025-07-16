# 连接预览管理器 (ConnectionPreviewManager)

## 📋 概述

ConnectionPreviewManager 是一个用于管理流程图节点连接预览的核心组件，支持持久化预览线显示、拖拽自动吸附和智能连接功能。

## 🚀 主要功能

### 1. 持久化预览线
- ✅ 所有节点自动显示预览线
- ✅ 预览线采用上下结构布局
- ✅ 支持分支节点多预览线显示
- ✅ 预览线随节点移动自动更新

### 2. 拖拽自动吸附
- ✅ 智能检测吸附目标
- ✅ 可视化吸附反馈
- ✅ 自动创建连接
- ✅ 可配置吸附距离

### 3. 智能连接
- ✅ 分支节点智能连接
- ✅ 连接标签自动生成
- ✅ 连接验证和错误处理

## 🔧 使用方法

### 基本初始化

\`\`\`javascript
import { ConnectionPreviewManager } from '@/utils/ConnectionPreviewManager.js'
import { VERTICAL_LAYOUT_CONFIG } from '@/utils/verticalLayoutConfig.js'

// 创建管理器实例
const previewManager = new ConnectionPreviewManager({
  graph: x6Graph,
  branchManager: branchManagerInstance,
  layoutConfig: VERTICAL_LAYOUT_CONFIG
})

// 初始化
previewManager.init()
\`\`\`

### 配置选项

\`\`\`javascript
const config = {
  // 布局配置
  VERTICAL_SPACING: 60,      // 垂直间距
  NODE_SPACING: 60,          // 节点间距
  BRANCH_SPACING: 30,        // 分支间距
  PREVIEW_LINE_LENGTH: 80,   // 预览线长度
  SNAP_DISTANCE: 30,         // 吸附距离
  
  // 样式配置
  PREVIEW_STYLES: {
    PERSISTENT: {
      BRANCH: {
        stroke: '#1890ff',
        strokeWidth: 2,
        opacity: 0.6
      },
      SINGLE: {
        stroke: '#52c41a',
        strokeWidth: 2,
        opacity: 0.6
      }
    }
  }
}
\`\`\`

## 📚 API 文档

### 核心方法

#### \`init()\`
初始化管理器，设置事件监听器和持久化预览线。

#### \`createPersistentPreview(node)\`
为指定节点创建持久化预览线。

**参数:**
- \`node\` - X6节点对象

#### \`checkSnapToPreviewLines(node, position, size)\`
检查节点是否可以吸附到预览线。

**参数:**
- \`node\` - 拖拽的节点
- \`position\` - 节点位置
- \`size\` - 节点大小

#### \`destroy()\`
销毁管理器，清理所有事件监听器和预览线。

### 事件处理

管理器自动处理以下事件：
- \`node:mouseenter\` - 节点鼠标进入
- \`node:mouseleave\` - 节点鼠标离开
- \`node:move\` - 节点移动
- \`node:moved\` - 节点移动完成
- \`node:added\` - 节点添加
- \`node:removed\` - 节点移除

## 🎨 样式定制

### 预览线样式

\`\`\`javascript
const customStyles = {
  PREVIEW_STYLES: {
    PERSISTENT: {
      BRANCH: {
        stroke: '#ff6b6b',        // 分支预览线颜色
        strokeWidth: 3,           // 线条宽度
        strokeDasharray: '8,4',   // 虚线样式
        opacity: 0.8              // 透明度
      }
    }
  }
}
\`\`\`

### 标签样式

\`\`\`javascript
const labelStyles = {
  LABEL_STYLES: {
    BRANCH: {
      width: 60,
      height: 24,
      fontSize: 12,
      fill: '#f0f0f0',
      stroke: '#1890ff',
      textColor: '#333'
    }
  }
}
\`\`\`

## 🔍 调试和监控

### 启用调试日志

\`\`\`javascript
import { ConnectionPreviewLogger } from '@/utils/connectionPreviewErrorHandler.js'

const logger = new ConnectionPreviewLogger('debug')
const previewManager = new ConnectionPreviewManager({
  graph,
  branchManager,
  logger
})
\`\`\`

### 性能监控

\`\`\`javascript
import { PerformanceMonitor } from '@/utils/connectionPreviewPerformance.js'

const monitor = new PerformanceMonitor()
// 监控将自动记录关键操作的性能数据
\`\`\`

## 🧪 测试

### 运行单元测试

\`\`\`javascript
import { TestRunner, TestScenarioGenerator } from '@/utils/connectionPreviewTestUtils.js'

const runner = new TestRunner()
const generator = new TestScenarioGenerator()

// 添加测试场景
generator.getAllScenarios().forEach(scenario => {
  runner.addTest(scenario.name, () => {
    // 测试逻辑
  })
})

// 运行测试
runner.runAll()
\`\`\`

## ⚠️ 注意事项

1. **内存管理**: 确保在组件销毁时调用 \`destroy()\` 方法
2. **性能优化**: 大量节点时建议使用批量操作
3. **错误处理**: 建议配置错误处理器捕获异常
4. **浏览器兼容**: 需要支持ES6+的现代浏览器

## 🔄 更新日志

### v2.0.0 (当前版本)
- ✅ 新增持久化预览线功能
- ✅ 实现上下结构布局
- ✅ 添加拖拽自动吸附
- ✅ 优化性能和错误处理
- ✅ 完善类型定义和测试工具

### v1.0.0
- ✅ 基础连接预览功能
- ✅ 分支节点支持
- ✅ 智能连接功能

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License