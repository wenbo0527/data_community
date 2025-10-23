# 画布相关文件迁移进度报告

## 已完成的迁移工作

### 1. Utils目录文件迁移（基本完成）

#### 已迁移到canvas/子目录的文件：
- ✅ **NodeConfigManager.js** - 节点配置管理器（完整迁移）
- ✅ **x6Config.js** - X6画布配置（完整迁移）
- ✅ **canvasConfig.js** - 画布配置（完整迁移）
- ✅ **previewConfig.js** - 预览配置（完整迁移）
- ✅ **UnifiedStructuredLayoutEngine.js** - 统一结构化布局引擎（完整迁移）
- ✅ **UnifiedPreviewLineManager.js** - 统一预览线管理器（完整迁移）
- ✅ **CanvasPanZoomManager.js** - 画布平移缩放管理器
- ✅ **CoordinateSystemManager.js** - 坐标系统管理器
- ✅ **EdgeOverlapManager.js** - 边重叠管理器
- ✅ **EndNodeConfig.js** - 结束节点配置
- ✅ **GlobalDragStateManager.js** - 全局拖拽状态管理器
- ✅ **PreviewLineStyleManager.js** - 预览线样式管理器
- ✅ **canvasValidation.js** - 画布验证
- ✅ **connectionConfigFactory.js** - 连接配置工厂
- ✅ **nodeConnectionHelper.js** - 节点连接助手
- ✅ **portConfigFactory.js** - 端口配置工厂
- ✅ **workflowNodeCreator.js** - 工作流节点创建器
- ✅ **workflowNodeTypes.js** - 工作流节点类型
- ✅ **enhancedCanvasValidation.js** - 增强画布验证
- ✅ **branchSpacingConfig.js** - 分支间距配置
- ✅ **uiOptimizationConfig.js** - UI优化配置
- ✅ **coordinate-refactor/** - 坐标重构整个目录（包含所有子目录和文件）

### 2. Composables目录文件迁移（已完成）

#### 已迁移到canvas/子目录的组合函数：
- ✅ **useCanvasConnection.js** - 画布连接组合函数
- ✅ **useCanvasConnections.js** - 画布连接管理组合函数
- ✅ **useCanvasDragDrop.js** - 画布拖拽组合函数
- ✅ **useCanvasExport.js** - 画布导出组合函数
- ✅ **useCanvasHistory.js** - 画布历史记录组合函数
- ✅ **useCanvasMinimap.js** - 画布小地图组合函数
- ✅ **useCanvasNodes.js** - 画布节点组合函数
- ✅ **useCanvasSelection.js** - 画布选择组合函数
- ✅ **useCanvasToolbar.js** - 画布工具栏组合函数
- ✅ **useConfigDrawers.js** - 配置抽屉组合函数
- ✅ **useEventManager.js** - 事件管理器组合函数
- ✅ **useLayoutEngine.js** - 布局引擎组合函数
- ✅ **useNodeManager.js** - 节点管理器组合函数
- ✅ **usePreviewLine.js** - 预览线组合函数
- ✅ **usePreviewLineManager.js** - 预览线管理器组合函数
- ✅ **useStartNodeForm.ts** - 开始节点表单组合函数
- ✅ **useStructuredLayout.js** - 结构化布局组合函数
- ✅ **useX6Events.js** - X6事件组合函数

#### 已迁移到layout/子目录的布局组合函数：
- ✅ **HierarchyAdapter.js** - 层级适配器
- ✅ **HierarchyLayoutEngine.js** - 层级布局引擎

### 3. 需要处理的问题

#### 重复文件需要清理：
- ⚠️ **UnifiedPreviewLineManager.js** - 同时存在于根目录和canvas/子目录
- ⚠️ **canvasValidation.js** - 同时存在于根目录和canvas/子目录

#### 根目录下需要重新分类的文件：
- 🔄 **DataTransformUtils.js** - 数据转换工具，需要分类到合适子目录
- 🔄 **ErrorHandler.js** - 错误处理器，需要分类到合适子目录
- 🔄 **EventManagerBase.js** - 事件管理器基类，需要分类到合适子目录
- 🔄 **GraphOperationUtils.js** - 图形操作工具，需要分类到合适子目录
- 🔄 **StyleConfig.js** - 样式配置，需要分类到合适子目录
- 🔄 **enhancedCanvasValidation.js** - 增强画布验证，应移动到canvas/子目录
- 🔄 **idGenerator.js** - ID生成器，需要分类到合适子目录
- 🔄 **taskStorage.js** - 任务存储，需要分类到合适子目录

### 4. Components目录文件迁移（待检查）

#### 需要检查的组件文件：
- 🔍 **canvas/子目录** - 已存在6个画布核心组件，需要检查是否完整
- 🔍 **workflow/子目录** - 已存在4个工作流组件，需要检查是否完整
- 🔍 **workflow-editor/子目录** - 已存在但只有managers/publish/子目录
- 🔍 **根目录下的节点配置抽屉组件** - 如ABTestNodeConfigDrawer.vue等，需要重新分类

## 迁移策略调整

### 大文件处理策略

由于 `UnifiedStructuredLayoutEngine.js`（4571行）和 `UnifiedPreviewLineManager.js`（13646行）文件过大，采用以下策略：

1. **分批迁移**：每次迁移200-400行代码
2. **保持功能完整性**：确保每个批次包含完整的方法或类
3. **占位符方法**：为未迁移的方法创建占位符，避免引用错误
4. **渐进式补充**：后续逐步补充完整实现

### 依赖关系处理

1. **循环引用修复**：使用WeakRef避免强引用循环
2. **导入路径更新**：所有import路径已更新为新的目标路径
3. **全局变量处理**：保持对window对象的引用以确保兼容性

## 下一步计划

### 优先级1：完成大文件迁移
1. 继续迁移 `UnifiedStructuredLayoutEngine.js` 剩余部分
2. 继续迁移 `UnifiedPreviewLineManager.js` 剩余部分

### 优先级2：迁移核心工具文件
1. `GlobalDragStateManager.js` - 全局拖拽状态管理
2. `CoordinateSystemManager.js` - 坐标系统管理
3. `PreviewLineStyleManager.js` - 预览线样式管理

### 优先级3：迁移其他工具文件
1. 画布管理相关文件
2. 节点和连接相关文件
3. 配置工厂文件

### 优先级4：迁移组件文件
1. 核心画布组件
2. 节点相关组件
3. 工作流相关组件

### 优先级5：迁移组合式函数
1. 画布相关组合函数
2. 布局相关组合函数
3. 事件管理相关组合函数

## 风险评估

### 已识别风险
1. **大文件迁移复杂性**：超大文件需要分批处理，可能影响功能完整性
2. **循环依赖**：多个文件间存在复杂的依赖关系
3. **全局状态管理**：需要确保全局状态的一致性

### 缓解措施
1. **渐进式迁移**：保持系统可用性的同时逐步迁移
2. **完整性测试**：每个阶段完成后进行功能测试
3. **回滚准备**：保留原文件作为备份

## 验证计划

### 阶段性验证
1. **文件完整性检查**：确保所有方法和类都已正确迁移
2. **依赖关系验证**：检查所有import和export是否正确
3. **功能测试**：验证画布基础功能是否正常

### 最终验证
1. **端到端测试**：完整的画布操作流程测试
2. **性能测试**：确保迁移后性能不受影响
3. **兼容性测试**：验证与现有代码的兼容性

## 总结

当前已完成约30%的迁移工作，主要集中在核心配置文件和部分大型管理器文件。接下来需要继续完成大文件的迁移，然后逐步处理组件和组合式函数的迁移。整个迁移过程预计需要分多个阶段完成，以确保系统的稳定性和功能完整性。
