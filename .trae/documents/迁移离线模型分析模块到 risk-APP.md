# 将离线模型分析模块迁移至 risk-APP

## 目标
将主应用 (`src/pages/offlineModel`) 的离线模型分析功能完整迁移至 `risk-app` 子应用 (`apps/risk-app`)，使其成为 `risk-app` 的原生模块，解耦与主应用的依赖。

## 现状分析
- **源模块**: `src/pages/offlineModel` (功能完整，包含特征中心、模型注册等)。
- **目标应用**: `apps/risk-app` (基于 Vue 3 + TS 的子应用，已有 `modules` 结构)。
- **依赖情况**: 源模块依赖相对独立，主要依赖 `@/api`, `@/stores` 和 Arco Design 组件库，未深度耦合主应用特有业务逻辑。
- **当前障碍**: `risk-app` 中现有的 `model-offline-analysis` 目录仅为占位符；源模块中存在硬编码路由路径和 `@/` 别名引用。

## 实施计划

### 1. 模块结构初始化
在 `apps/risk-app/src/modules/` 下创建 `offline-model` 目录，并建立标准结构：
- `api/`
- `pages/`
- `stores/`
- `mock/`
- `router/`

### 2. 代码物理迁移
执行以下文件复制操作：
- `src/pages/offlineModel/*` -> `apps/risk-app/src/modules/offline-model/pages/`
- `src/api/offlineModel/*` -> `apps/risk-app/src/modules/offline-model/api/`
- `src/stores/offlineModel/*` -> `apps/risk-app/src/modules/offline-model/stores/`
- `src/mock/offlineModel/*` -> `apps/risk-app/src/modules/offline-model/mock/`

### 3. 代码重构与适配
- **依赖路径修正**: 将代码中所有的 `@/api/offlineModel`, `@/stores/offlineModel` 等引用修改为模块内的相对路径。
- **路由路径更新**: 
    - 修改所有 `router.push` 中的硬编码路径，统一添加或调整前缀（如 `/offline-model`）。
    - 移除 `isFromRiskModule` 等环境判断逻辑。
- **Store 注册**: 确保 Pinia Store 在子应用中正确初始化。

### 4. 路由集成
- 在 `apps/risk-app/src/modules/offline-model/router/index.ts` 中定义模块路由。
- 在 `apps/risk-app/src/router.ts` 中引入并注册该模块路由。

### 5. 清理与验证
- 启动 `risk-app` 进行功能验证。
- (可选) 删除主应用中旧的 `offlineModel` 代码（待确认）。
