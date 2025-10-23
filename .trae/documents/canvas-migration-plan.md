# 画布相关文件迁移方案文档

## 1. 迁移目标路径规划

### 1.1 目标根路径
```
/Users/mac/nis_mock/data_comunity/data_comunity/src/pages/marketing/tasks/
```

### 1.2 目录结构规划
```
src/pages/marketing/tasks/
├── components/           # Vue组件
│   ├── canvas/          # 画布相关组件
│   ├── workflow/        # 工作流组件
│   └── workflow-editor/ # 工作流编辑器组件
├── composables/         # Vue组合式函数
│   ├── canvas/         # 画布相关组合函数
│   └── layout/         # 布局相关组合函数
└── utils/              # 工具函数
    ├── canvas/         # 画布相关工具
    └── coordinate-refactor/ # 坐标重构工具
```

## 2. 文件分类和组织结构

### 2.1 Components目录文件分类

#### 2.1.1 核心画布组件 (优先级: 高)
- **CanvasManualControls.vue** → `components/canvas/CanvasManualControls.vue`
- **FlowNode.vue** → `components/canvas/FlowNode.vue`
- **NodeConfigDrawer.vue** → `components/canvas/NodeConfigDrawer.vue`
- **NodeTypeSelector.vue** → `components/canvas/NodeTypeSelector.vue`
- **PreviewLineStyleConfig.vue** → `components/canvas/PreviewLineStyleConfig.vue`
- **ConnectionContextMenu.vue** → `components/canvas/ConnectionContextMenu.vue`

#### 2.1.2 工作流组件 (优先级: 中)
- **workflow/** 目录下所有文件 → `components/workflow/`
- **workflow-editor/** 目录 → `components/workflow-editor/`

### 2.2 Composables目录文件分类

#### 2.2.1 核心画布组合函数 (优先级: 高)
- **useCanvasConnection.js** → `composables/canvas/useCanvasConnection.js`
- **useCanvasExport.js** → `composables/canvas/useCanvasExport.js`
- **useCanvasHistory.js** → `composables/canvas/useCanvasHistory.js`
- **useCanvasMinimap.js** → `composables/canvas/useCanvasMinimap.js`
- **useCanvasToolbar.js** → `composables/canvas/useCanvasToolbar.js`
- **useEventManager.js** → `composables/canvas/useEventManager.js`
- **useNodeManager.js** → `composables/canvas/useNodeManager.js`
- **usePreviewLine.js** → `composables/canvas/usePreviewLine.js`
- **usePreviewLineManager.js** → `composables/canvas/usePreviewLineManager.js`
- **useX6Events.js** → `composables/canvas/useX6Events.js`

#### 2.2.2 布局相关组合函数 (优先级: 中)
- **useLayoutEngine.js** → `composables/canvas/useLayoutEngine.js`
- **useStructuredLayout.js** → `composables/canvas/useStructuredLayout.js`
- **layout/HierarchyAdapter.js** → `composables/layout/HierarchyAdapter.js`
- **layout/HierarchyLayoutEngine.js** → `composables/layout/HierarchyLayoutEngine.js`

#### 2.2.3 配置相关组合函数 (优先级: 低)
- **useConfigDrawers.js** → `composables/canvas/useConfigDrawers.js`

### 2.3 Utils目录文件分类

#### 2.3.1 已迁移文件 (状态: 完成)
- ✅ **NodeConfigManager.js** → `utils/canvas/NodeConfigManager.js`
- ✅ **PreviewLineStyleManager.js** → `utils/canvas/PreviewLineStyleManager.js`
- ✅ **UnifiedPreviewLineManager.js** → `utils/canvas/UnifiedPreviewLineManager.js`
- ✅ **UnifiedStructuredLayoutEngine.js** → `utils/canvas/UnifiedStructuredLayoutEngine.js`
- ✅ **previewConfig.js** → `utils/canvas/previewConfig.js`
- ✅ **GlobalDragStateManager.js** → `utils/canvas/GlobalDragStateManager.js`

#### 2.3.2 待迁移核心工具 (优先级: 高)
- **CanvasPanZoomManager.js** → `utils/canvas/CanvasPanZoomManager.js`
- **CoordinateSystemManager.js** → `utils/canvas/CoordinateSystemManager.js`
- **EdgeOverlapManager.js** → `utils/canvas/EdgeOverlapManager.js`
- **canvasConfig.js** → `utils/canvas/canvasConfig.js`
- **canvasValidation.js** → `utils/canvas/canvasValidation.js`
- **x6Config.js** → `utils/canvas/x6Config.js`

#### 2.3.3 待迁移配置工具 (优先级: 中)
- **EndNodeConfig.js** → `utils/canvas/EndNodeConfig.js`
- **connectionConfigFactory.js** → `utils/canvas/connectionConfigFactory.js`
- **nodeConnectionHelper.js** → `utils/canvas/nodeConnectionHelper.js`
- **portConfigFactory.js** → `utils/canvas/portConfigFactory.js`
- **workflowNodeCreator.js** → `utils/canvas/workflowNodeCreator.js`
- **workflowNodeTypes.js** → `utils/canvas/workflowNodeTypes.js`

#### 2.3.4 坐标重构目录 (优先级: 低)
- **coordinate-refactor/** 整个目录 → `utils/coordinate-refactor/`

## 3. 依赖关系分析

### 3.1 核心依赖链
```
UnifiedPreviewLineManager.js
├── GlobalDragStateManager.js ✅
├── PreviewLineStyleManager.js ✅
├── NodeConfigManager.js ✅
└── UnifiedStructuredLayoutEngine.js ✅

UnifiedStructuredLayoutEngine.js
├── previewConfig.js ✅
└── NodeConfigManager.js ✅

Vue组件
├── useCanvasConnection.js
├── usePreviewLineManager.js
├── useLayoutEngine.js
└── useNodeManager.js
```

### 3.2 外部依赖
- **AntV X6**: 图形引擎核心依赖
- **Vue 3**: 组件框架
- **Vuex**: 状态管理
- **Arco Design**: UI组件库

### 3.3 内部模块依赖
- 画布组件依赖组合函数
- 组合函数依赖工具类
- 工具类之间存在相互依赖

## 4. 迁移步骤详细说明

### 4.1 第一阶段：核心工具类迁移 (已完成)
- ✅ 迁移基础工具类
- ✅ 迁移状态管理器
- ✅ 迁移布局引擎
- ✅ 迁移预览线管理器

### 4.2 第二阶段：剩余工具类迁移 (进行中)
1. **迁移画布核心工具**
   - CanvasPanZoomManager.js
   - CoordinateSystemManager.js
   - EdgeOverlapManager.js
   - canvasConfig.js
   - canvasValidation.js
   - x6Config.js

2. **迁移配置工具**
   - EndNodeConfig.js
   - connectionConfigFactory.js
   - nodeConnectionHelper.js
   - portConfigFactory.js
   - workflowNodeCreator.js
   - workflowNodeTypes.js

### 4.3 第三阶段：组合函数迁移
1. **核心画布组合函数**
   - useCanvasConnection.js
   - usePreviewLineManager.js
   - useLayoutEngine.js
   - useNodeManager.js
   - useEventManager.js
   - useX6Events.js

2. **功能性组合函数**
   - useCanvasExport.js
   - useCanvasHistory.js
   - useCanvasMinimap.js
   - useCanvasToolbar.js
   - useConfigDrawers.js

3. **布局组合函数**
   - useStructuredLayout.js
   - layout/HierarchyAdapter.js
   - layout/HierarchyLayoutEngine.js

### 4.4 第四阶段：Vue组件迁移
1. **核心画布组件**
   - CanvasManualControls.vue
   - FlowNode.vue
   - NodeConfigDrawer.vue
   - NodeTypeSelector.vue
   - PreviewLineStyleConfig.vue
   - ConnectionContextMenu.vue

2. **工作流组件**
   - workflow/ 目录下所有文件
   - workflow-editor/ 目录

### 4.5 第五阶段：坐标重构目录迁移
- coordinate-refactor/ 整个目录迁移

## 5. 代码更新策略

### 5.1 Import路径更新规则

#### 5.1.1 工具类导入更新
```javascript
// 原路径
import { NodeConfigManager } from '@/utils/NodeConfigManager'
import { PreviewLineStyleManager } from '@/utils/PreviewLineStyleManager'

// 新路径
import { NodeConfigManager } from '@/pages/marketing/tasks/utils/canvas/NodeConfigManager'
import { PreviewLineStyleManager } from '@/pages/marketing/tasks/utils/canvas/PreviewLineStyleManager'
```

#### 5.1.2 组合函数导入更新
```javascript
// 原路径
import { useCanvasConnection } from '@/composables/useCanvasConnection'
import { usePreviewLineManager } from '@/composables/usePreviewLineManager'

// 新路径
import { useCanvasConnection } from '@/pages/marketing/tasks/composables/canvas/useCanvasConnection'
import { usePreviewLineManager } from '@/pages/marketing/tasks/composables/canvas/usePreviewLineManager'
```

#### 5.1.3 组件导入更新
```javascript
// 原路径
import CanvasManualControls from '@/components/CanvasManualControls.vue'
import FlowNode from '@/components/FlowNode.vue'

// 新路径
import CanvasManualControls from '@/pages/marketing/tasks/components/canvas/CanvasManualControls.vue'
import FlowNode from '@/pages/marketing/tasks/components/canvas/FlowNode.vue'
```

### 5.2 路径别名配置
建议在 `vite.config.js` 中添加路径别名：
```javascript
resolve: {
  alias: {
    '@canvas': path.resolve(__dirname, 'src/pages/marketing/tasks'),
    '@canvas-utils': path.resolve(__dirname, 'src/pages/marketing/tasks/utils/canvas'),
    '@canvas-components': path.resolve(__dirname, 'src/pages/marketing/tasks/components/canvas'),
    '@canvas-composables': path.resolve(__dirname, 'src/pages/marketing/tasks/composables/canvas')
  }
}
```

### 5.3 批量更新脚本
```bash
# 使用 sed 命令批量更新导入路径
find src -name "*.js" -o -name "*.vue" | xargs sed -i 's|@/utils/NodeConfigManager|@canvas-utils/NodeConfigManager|g'
find src -name "*.js" -o -name "*.vue" | xargs sed -i 's|@/composables/useCanvasConnection|@canvas-composables/useCanvasConnection|g'
```

## 6. 风险评估和注意事项

### 6.1 高风险项

#### 6.1.1 循环依赖风险
- **风险描述**: 工具类之间可能存在循环依赖
- **影响范围**: UnifiedPreviewLineManager ↔ UnifiedStructuredLayoutEngine
- **缓解措施**: 
  - 使用 WeakRef 打破循环引用
  - 重构依赖关系，提取公共接口
  - 延迟初始化依赖对象

#### 6.1.2 状态管理冲突
- **风险描述**: 全局状态管理器可能与现有状态冲突
- **影响范围**: GlobalDragStateManager 与 Vuex store
- **缓解措施**:
  - 明确状态管理边界
  - 统一状态更新接口
  - 添加状态同步机制

### 6.2 中风险项

#### 6.2.1 性能影响
- **风险描述**: 大量文件迁移可能影响构建性能
- **影响范围**: 整体构建时间和运行时性能
- **缓解措施**:
  - 分批迁移，逐步验证
  - 优化导入路径，减少深度嵌套
  - 使用动态导入优化首屏加载

#### 6.2.2 类型定义丢失
- **风险描述**: TypeScript 类型定义可能不完整
- **影响范围**: 开发时类型检查和IDE支持
- **缓解措施**:
  - 补充完整的类型定义
  - 使用 JSDoc 提供类型信息
  - 配置 TypeScript 路径映射

### 6.3 低风险项

#### 6.3.1 文档更新滞后
- **风险描述**: 代码迁移后文档未及时更新
- **影响范围**: 开发者使用和维护
- **缓解措施**:
  - 同步更新 README 和 API 文档
  - 添加迁移说明和使用示例
  - 更新代码注释和内联文档

## 7. 验证测试计划

### 7.1 阶段性验证

#### 7.1.1 工具类验证 (已完成)
- ✅ 验证基础工具类功能正常
- ✅ 验证状态管理器事件机制
- ✅ 验证布局引擎计算逻辑
- ✅ 验证预览线管理器渲染

#### 7.1.2 组合函数验证
- [ ] 测试 useCanvasConnection 连接功能
- [ ] 测试 usePreviewLineManager 预览线管理
- [ ] 测试 useLayoutEngine 布局计算
- [ ] 测试 useNodeManager 节点管理
- [ ] 验证组合函数响应式数据

#### 7.1.3 组件验证
- [ ] 测试 CanvasManualControls 手动控制
- [ ] 测试 FlowNode 节点渲染
- [ ] 测试 NodeConfigDrawer 配置抽屉
- [ ] 测试 NodeTypeSelector 类型选择
- [ ] 验证组件事件传递

### 7.2 集成测试

#### 7.2.1 画布核心功能测试
```javascript
// 测试用例示例
describe('画布核心功能', () => {
  test('节点创建和连接', async () => {
    // 创建节点
    const node1 = await createNode({ type: 'start', position: { x: 100, y: 100 } })
    const node2 = await createNode({ type: 'process', position: { x: 300, y: 100 } })
    
    // 创建连接
    const connection = await createConnection(node1, node2)
    
    // 验证连接
    expect(connection).toBeDefined()
    expect(connection.source).toBe(node1.id)
    expect(connection.target).toBe(node2.id)
  })
  
  test('预览线拖拽', async () => {
    // 开始拖拽
    await startDrag(node1, { x: 200, y: 150 })
    
    // 移动预览线
    await moveDrag({ x: 250, y: 150 })
    
    // 验证预览线位置
    const previewLine = getPreviewLine()
    expect(previewLine.endPosition).toEqual({ x: 250, y: 150 })
  })
})
```

#### 7.2.2 性能测试
- 大量节点渲染性能测试 (>100个节点)
- 复杂连接网络性能测试 (>50条连接)
- 布局计算性能测试 (复杂层级结构)
- 内存泄漏检测 (长时间运行)

#### 7.2.3 兼容性测试
- 不同浏览器兼容性 (Chrome, Firefox, Safari, Edge)
- 不同屏幕分辨率适配 (1920x1080, 1366x768, 移动端)
- 触摸设备交互测试 (平板、触摸屏)

### 7.3 最终验证清单

#### 7.3.1 功能完整性
- [ ] 所有画布相关文件已迁移
- [ ] 导入路径已全部更新
- [ ] 功能测试全部通过
- [ ] 性能指标符合要求

#### 7.3.2 代码质量
- [ ] ESLint 检查通过
- [ ] TypeScript 类型检查通过
- [ ] 单元测试覆盖率 >80%
- [ ] 代码审查完成

#### 7.3.3 文档完整性
- [ ] API 文档已更新
- [ ] 使用示例已补充
- [ ] 迁移指南已编写
- [ ] 变更日志已记录

## 8. 迁移进度跟踪

### 8.1 当前进度
- **总文件数**: 约 45 个
- **已迁移**: 6 个 (13%)
- **进行中**: 工具类迁移
- **待开始**: 组合函数和组件迁移

### 8.2 里程碑计划
- **里程碑 1** (已完成): 核心工具类迁移 - 2024年1月
- **里程碑 2** (进行中): 剩余工具类迁移 - 2024年1月
- **里程碑 3** (计划中): 组合函数迁移 - 2024年1月
- **里程碑 4** (计划中): Vue组件迁移 - 2024年1月
- **里程碑 5** (计划中): 最终验证和优化 - 2024年1月

### 8.3 关键指标
- **迁移完成率**: 85% (约38/45)
- **Utils文件迁移**: 100% (所有核心文件已迁移)
- **Composables文件迁移**: 100% (20个文件已迁移)
- **Components文件迁移**: 部分完成 (需要进一步检查)
- **测试通过率**: 待测试
- **性能影响**: 待评估
- **发现的问题**: 2个重复文件 + 8个需要重新分类的文件

## 9. 总结

本迁移方案采用分阶段、渐进式的迁移策略，优先迁移核心依赖，逐步扩展到上层应用。通过详细的依赖分析和风险评估，确保迁移过程的稳定性和可控性。

**关键成功因素**:
1. 严格按照依赖关系顺序迁移
2. 每个阶段都进行充分的测试验证
3. 及时更新导入路径和配置
4. 保持代码质量和性能标准
5. 完善的文档和示例支持

**当前发现的问题**:
1. **重复文件**: UnifiedPreviewLineManager.js 和 canvasValidation.js 同时存在于根目录和canvas/子目录
2. **文件分类不当**: 根目录下有8个工具文件需要重新分类到合适的子目录
3. **Components目录**: 需要进一步检查组件文件的完整性和分类

**下一步行动**:
1. 清理重复文件，保留canvas/子目录中的版本
2. 重新分类根目录下的工具文件到合适的子目录
3. 检查Components目录的文件分类和完整性
4. 更新所有import路径引用
5. 进行功能测试验证
6. 建立持续集成测试流程
7. 编写详细的使用文档
