# 营销画布项目结构说明文档

## 📋 项目概述

本项目是一个基于 Vue 3 + Vite + X6 的营销任务流程画布系统，提供可视化的营销流程设计、编辑和管理功能。

## 🏗️ 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **图形引擎**: AntV X6
- **状态管理**: Vuex
- **路由管理**: Vue Router
- **UI组件**: Arco Design
- **开发语言**: JavaScript + TypeScript

## 📁 项目目录结构

```
├── public/                     # 静态资源
│   ├── *.svg                  # 图标和插图资源
│   └── vite.svg               # Vite 图标
├── src/                       # 源代码目录
│   ├── api/                   # API 接口层
│   │   ├── discovery.js       # 数据发现相关接口
│   │   ├── discovery.ts       # TypeScript 版本
│   │   ├── external/          # 外部数据接口
│   │   └── tag.js            # 标签管理接口
│   ├── assets/               # 静态资源
│   │   ├── logo.svg          # 项目 Logo
│   │   └── vue.svg           # Vue 图标
│   ├── components/           # 公共组件
│   │   ├── BusinessProcessFlow.vue    # 业务流程组件
│   │   ├── CanvasManualControls.vue   # 画布手动控制组件
│   │   ├── FlowNode.vue              # 流程节点组件
│   │   ├── NodeConfigDrawer.vue      # 节点配置抽屉
│   │   ├── NodeTypeSelector.vue      # 节点类型选择器
│   │   ├── PresetSlot.vue           # 预设插槽组件
│   │   ├── common/                  # 通用组件
│   │   ├── examples/                # 示例组件
│   │   ├── guide/                   # 引导组件
│   │   ├── layout/                  # 布局组件
│   │   ├── modals/                  # 模态框组件
│   │   └── steps/                   # 步骤组件
│   ├── composables/          # 组合式函数
│   │   ├── useBaseDrawer.js         # 基础抽屉逻辑
│   │   ├── useConfigDrawers.js      # 配置抽屉逻辑
│   │   ├── useStartNodeForm.js      # 开始节点表单逻辑
│   │   ├── useStructuredLayout.js   # 结构化布局逻辑
│   │   └── useX6Events.js          # X6 事件处理逻辑
│   ├── config/               # 配置文件
│   │   ├── SnapConfig.js            # 吸附配置
│   │   ├── canvasAutomationConfig.js # 画布自动化配置
│   │   └── menuConfig.js            # 菜单配置
│   ├── constants/            # 常量定义
│   │   ├── startNodeConfig.js       # 开始节点配置
│   │   └── startNodeConfig.ts       # TypeScript 版本
│   ├── examples/             # 示例代码
│   │   └── SnapCoordinateSystemExample.js # 坐标系示例
│   ├── mock/                 # Mock 数据
│   │   ├── budget.js/ts             # 预算数据
│   │   ├── businessProcessData.js/ts # 业务流程数据
│   │   ├── coupon.js/ts             # 优惠券数据
│   │   ├── crowd.js                 # 人群数据
│   │   ├── customer360.js/ts        # 客户360数据
│   │   ├── data-map.js/ts           # 数据地图
│   │   ├── event.js/ts              # 事件数据
│   │   ├── external-data.js/ts      # 外部数据
│   │   ├── metrics.js/ts            # 指标数据
│   │   ├── tableData.js/ts          # 表格数据
│   │   └── touch.js/ts              # 触点数据
│   ├── pages/                # 页面组件
│   │   ├── digital-marketing/       # 数字营销页面
│   │   ├── discovery/               # 数据发现页面
│   │   ├── example/                 # 示例页面
│   │   ├── exploration/             # 数据探索页面
│   │   ├── external-data-v1/        # 外部数据页面
│   │   ├── login/                   # 登录页面
│   │   ├── management/              # 管理页面
│   │   ├── marketing/               # 营销页面
│   │   ├── risk/                    # 风险页面
│   │   ├── test/                    # 测试页面
│   │   └── touch/                   # 触点页面
│   ├── router/               # 路由配置
│   │   ├── constants.js             # 路由常量
│   │   ├── exploration.js           # 探索模块路由
│   │   ├── index.js                 # 主路由文件
│   │   ├── management.js            # 管理模块路由
│   │   ├── marketing.js             # 营销模块路由
│   │   └── utils.js                 # 路由工具函数
│   ├── store/                # 状态管理
│   │   ├── index.js                 # Store 主文件
│   │   └── modules/                 # Store 模块
│   ├── styles/               # 样式文件
│   │   ├── enhanced-canvas-styles.css    # 增强画布样式
│   │   ├── enhanced-node-styles.css      # 增强节点样式
│   │   └── enhanced-toolbar-styles.css   # 增强工具栏样式
│   ├── tests/                # 测试文件
│   │   ├── SnapCoordinateSystem.test.js  # 坐标系测试
│   │   ├── connectionConfig.test.js      # 连接配置测试
│   │   └── layoutDirectionTest.js        # 布局方向测试
│   ├── types/                # TypeScript 类型定义
│   │   ├── accompany.js/ts              # 伴随类型
│   │   ├── api.js/ts                    # API 类型
│   │   ├── canvas.d.ts                  # 画布类型
│   │   ├── connectionPreview.js/ts      # 连接预览类型
│   │   ├── metrics.js/ts                # 指标类型
│   │   ├── nodeDrawerConfig.js/ts       # 节点抽屉配置类型
│   │   ├── startNodeConfig.js/ts        # 开始节点配置类型
│   │   ├── steps.js/ts                  # 步骤类型
│   │   └── taskflow.js                  # 任务流类型
│   └── utils/                # 工具函数
│       ├── CanvasPanZoomManager.js      # 画布平移缩放管理器
│       ├── CoordinateSystemManager.js   # 坐标系管理器
│       ├── DragSnapLogger.js            # 拖拽吸附日志器
│       ├── EdgeOverlapManager.js        # 边重叠管理器
│       ├── EndNodeConfig.js             # 结束节点配置
│       ├── NodeConfigManager.js         # 节点配置管理器
│       ├── SmartCacheManager.js         # 智能缓存管理器
│       ├── UnifiedPreviewLineManager.js # 统一预览线管理器
│       ├── UnifiedStructuredLayoutEngine.js # 统一结构化布局引擎
│       ├── arco.js                      # Arco Design 工具
│       ├── branchSpacingConfig.js       # 分支间距配置
│       ├── calculations.js/ts           # 计算工具
│       ├── canvasConfig.js              # 画布配置
│       ├── canvasValidation.js          # 画布验证
│       ├── chart.js/ts                  # 图表工具
│       ├── commonUtils.js               # 通用工具
│       ├── connectionConfigFactory.js   # 连接配置工厂
│       ├── crowdSplitLogger.js          # 人群分流日志器
│       ├── enhancedCanvasValidation.js  # 增强画布验证
│       ├── enhancedErrorHandler.js      # 增强错误处理器
│       ├── errorHandler.js              # 错误处理器
│       ├── export.js/ts                 # 导出工具
│       ├── fileUploadUtils.js/ts        # 文件上传工具
│       ├── interfaceValidator.js        # 接口验证器
│       ├── message.js                   # 消息工具
│       ├── nodeConnectionHelper.js      # 节点连接助手
│       ├── nodeTypes.js                 # 节点类型定义
│       ├── performanceUtils.js          # 性能工具
│       ├── portConfigFactory.js         # 端口配置工厂
│       ├── previewConfig.js             # 预览配置
│       ├── taskStorage.js               # 任务存储
│       ├── uiOptimizationConfig.js      # UI 优化配置
│       ├── verticalLayoutConfig.js      # 垂直布局配置
│       └── x6Config.js                  # X6 配置
├── views/                    # 视图文件（备用）
│   └── management/
├── router/                   # 根路由配置（备用）
├── package.json              # 项目依赖配置
├── vite.config.js           # Vite 构建配置
├── tsconfig.json            # TypeScript 配置
├── tsconfig.node.json       # Node.js TypeScript 配置
├── tsconfig.paths.json      # 路径映射配置
└── README.md                # 项目说明文档
```

## 🎯 核心功能模块

### 1. 画布系统 (Canvas System)
- **TaskFlowCanvas.vue**: 主画布组件，基于 X6 实现
- **CanvasPanZoomManager.js**: 画布平移和缩放管理
- **CoordinateSystemManager.js**: 坐标系统管理
- **canvasConfig.js**: 画布基础配置

### 2. 节点系统 (Node System)
- **FlowNode.vue**: 流程节点组件
- **NodeConfigManager.js**: 节点配置管理
- **nodeTypes.js**: 节点类型定义
- **NodeConfigDrawer.vue**: 节点配置抽屉

### 3. 连接系统 (Connection System)
- **UnifiedPreviewLineManager.js**: 统一预览线管理
- **EdgeOverlapManager.js**: 连线重叠处理
- **nodeConnectionHelper.js**: 节点连接助手
- **connectionConfigFactory.js**: 连接配置工厂

### 4. 布局系统 (Layout System)
- **UnifiedStructuredLayoutEngine.js**: 统一结构化布局引擎
- **useStructuredLayout.js**: 布局组合式函数
- **verticalLayoutConfig.js**: 垂直布局配置
- **branchSpacingConfig.js**: 分支间距配置

### 5. 交互系统 (Interaction System)
- **DragSnapLogger.js**: 拖拽吸附日志
- **SnapConfig.js**: 吸附配置
- **useX6Events.js**: X6 事件处理

## 🔧 开发指南

### 启动项目
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 开发规范

#### 1. 组件开发
- 使用 Vue 3 Composition API
- 组件文件使用 PascalCase 命名
- 组合式函数使用 `use` 前缀

#### 2. 工具函数开发
- 工具函数放在 `src/utils/` 目录
- 使用 ES6 模块导入导出
- 添加详细的 JSDoc 注释

#### 3. 样式开发
- 使用 CSS 模块或 scoped 样式
- 遵循 BEM 命名规范
- 响应式设计优先

#### 4. 状态管理
- 使用 Vuex 进行全局状态管理
- 按功能模块拆分 store
- 使用 mutations 修改状态

## 📊 核心业务流程

### 1. 画布初始化流程
```
App.vue → TaskFlowCanvas.vue → X6 Graph 初始化 → 加载节点和连接
```

### 2. 节点创建流程
```
NodeTypeSelector → 选择节点类型 → 创建节点实例 → 添加到画布 → 配置节点属性
```

### 3. 连接创建流程
```
拖拽开始 → 预览线显示 → 连接目标确认 → 创建正式连接 → 清理预览线
```

### 4. 布局应用流程
```
触发布局 → 计算节点位置 → 应用位置变更 → 重新计算连接路径 → 渲染完成
```

## 🛠️ 关键技术点

### 1. X6 图形引擎集成
- 自定义节点和边的渲染
- 事件监听和处理
- 插件系统的使用

### 2. 预览线系统
- 实时预览连接效果
- 智能路径计算
- 多分支连接支持

### 3. 布局算法
- Dagre 自动布局
- 手动布局调整
- 布局方向切换

### 4. 性能优化
- 虚拟滚动
- 智能缓存
- 防抖和节流

## 🔍 调试和测试

### 开发工具
- Vue DevTools: Vue 组件调试
- X6 DevTools: 图形调试
- Chrome DevTools: 性能分析

### 测试文件
- `src/tests/`: 单元测试和集成测试
- 使用 Jest 或 Vitest 进行测试

## 📝 注意事项

1. **坐标系统**: 项目使用多种坐标系，注意坐标转换
2. **内存管理**: 及时清理 X6 实例和事件监听器
3. **性能监控**: 关注大量节点时的渲染性能
4. **浏览器兼容**: 主要支持现代浏览器
5. **数据持久化**: 注意任务流程数据的保存和恢复

## 🚀 扩展开发

### 添加新节点类型
1. 在 `nodeTypes.js` 中定义节点类型
2. 在 `NodeConfigManager.js` 中添加配置逻辑
3. 创建对应的配置组件
4. 更新 `NodeTypeSelector.vue`

### 添加新布局算法
1. 在 `UnifiedStructuredLayoutEngine.js` 中实现算法
2. 在 `useStructuredLayout.js` 中添加调用接口
3. 更新布局配置文件

### 添加新交互功能
1. 在相应的管理器中实现逻辑
2. 在 `useX6Events.js` 中添加事件处理
3. 更新相关组件

---

**文档版本**: v1.0  
**最后更新**: 2024年12月  
**维护者**: 前端开发团队