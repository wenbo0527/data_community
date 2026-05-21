# Risk App - 外数生命周期与模型回溯管理

## 1. 功能概述

Risk App（风险应用）是数据社区平台的核心子应用之一，主要提供以下功能：

### 1.1 核心功能

| 模块 | 功能 | 说明 |
|:---|:---|:---|
| **预算管理** | 预算编制、审批、执行、结算 | 供应商预算全生命周期管理 |
| **外部数据管理** | 供应商管理、产品管理、服务申请 | 外部数据供应商接入与管理 |
| **离线模型** | 模型训练、部署、回溯测试 | 风控模型生命周期管理 |

### 1.2 技术架构

| 技术 | 说明 |
|:---|:---|
| 框架 | Vue 3 + Composition API |
| 路由 | Vue Router 4 |
| 状态管理 | Pinia |
| UI 组件 | Arco Design Vue |
| 微前端 | qiankun |
| 构建工具 | Vite |

## 2. 目录结构

```
risk-app/src/
├── main.ts              # 应用入口
├── Root.vue             # 根组件
├── entry.ts             # qiankun 入口
├── qiankun-entry.ts     # qiankun 生命周期
├── router.ts            # 路由配置
│
├── types/               # 类型定义
│   └── index.ts         # 统一类型导出
│
├── api/                 # API 服务（顶层）
│   └── budget.ts        # 预算 API 服务
│
├── modules/             # 业务模块
│   ├── budget/          # 预算模块
│   │   ├── api/        # API 定义
│   │   ├── stores/     # Pinia Store
│   │   ├── utils/      # 工具函数
│   │   └── pages/      # 页面组件
│   │
│   ├── external-data/  # 外部数据模块
│   │   ├── api/        # API 定义
│   │   ├── types/      # 类型定义
│   │   ├── stores/     # Pinia Store
│   │   ├── mock/       # Mock 数据
│   │   └── pages/      # 页面组件
│   │
│   └── offline-model/  # 离线模型模块
│       └── ...
│
├── components/          # 公共组件
├── layout/              # 布局组件
├── pages/               # 页面组件
├── stores/              # 公共 Store
├── utils/               # 工具函数
└── constants/           # 常量定义
```

## 3. 模块说明

### 3.1 预算模块 (budget)

负责管理供应商预算的完整生命周期。

**主要页面**：
- `BudgetList.vue` - 预算列表
- `BudgetDetail.vue` - 预算详情
- `ContractCreate.vue` - 合同创建

**核心 Store**：
- `useBudgetStore` - 预算状态管理

**API 服务**：
- `budgetApiService` - 预算 CRUD 操作

### 3.2 外部数据模块 (external-data)

管理外部数据供应商和产品。

**主要页面**：
- `SupplierList.vue` - 供应商列表
- `ProductList.vue` - 产品列表
- `ServiceApplication.vue` - 服务申请

**核心 Store**：
- `useExternalDataStore` - 外部数据状态管理

**类型定义**：
- `Supplier` - 供应商类型
- `SupplierProduct` - 供应商产品类型

### 3.3 离线模型模块 (offline-model)

管理风控模型的训练、部署和回溯。

**主要功能**：
- 模型列表查看
- 模型训练状态监控
- 模型回溯测试

## 4. API 规范

### 4.1 预算 API

```typescript
// 获取预算列表
GET /api/budgets?page=1&pageSize=10

// 获取预算详情
GET /api/budgets/:id

// 创建预算
POST /api/budgets

// 更新预算
PUT /api/budgets/:id
```

### 4.2 响应格式

```typescript
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

## 5. 使用指南

### 5.1 独立运行

```bash
cd apps/risk-app
npm install
npm run dev
# 访问 http://localhost:5176
```

### 5.2 在主应用中运行

Risk App 作为 qiankun 子应用运行在主应用容器中。

## 6. 类型定义

类型定义统一在 `types/index.ts` 中：

```typescript
// 预算类型
export interface Budget { ... }
export type BudgetStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'executed';

// 供应商类型
export interface Supplier { ... }
export type SupplierStatus = 'active' | 'inactive' | 'suspended';

// 模型类型
export interface Model { ... }
export type ModelStatus = 'training' | 'ready' | 'deployed' | 'archived';
```

## 7. 注意事项

1. **qiankun 生命周期**：子应用必须实现 `bootstrap`、`mount`、`unmount` 生命周期
2. **状态管理**：使用 Pinia 进行状态管理，避免 Vuex
3. **类型安全**：所有 API 响应应使用 TypeScript 类型定义
4. **路由基础路径**：使用 `qiankunWindow.__POWERED_BY_QIANKUN__` 判断运行环境
