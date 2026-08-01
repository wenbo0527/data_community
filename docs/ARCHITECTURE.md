# Data Community · 架构总览（2026-08-01）

## 1. 项目定位

**前端展示型数据社区门户**。所有数据使用 mock 数据，不涉及真实后端。
mock 数据标准见 [`apps/mkt-app/src/mock/MOCK_STANDARD.md`](apps/mkt-app/src/mock/MOCK_STANDARD.md)。

## 2. 仓库布局（11 个子应用）

```
data_community/
├── apps/                                11 个独立 Vue/TS 应用
│   ├── mkt-app/                         营销中台（最大，676 文件）★ 活跃开发
│   ├── dex-app/                         数据探索（含客户 360） ★ 活跃开发
│   ├── dmt-app/                         数据模型 + PRD 系统 ★ 活跃开发
│   ├── dfd-app/                         数据发现
│   ├── admin-app/                       运营后台
│   ├── asset-app/                       资产管理
│   ├── risk-app/                        风控应用
│   ├── touch/                           触达管理
│   ├── horizontal-canvas/               横版画布（独立维护，feature 分支保留）
│   ├── report-monitor/                  报表监控
│   └── report-monitor-backend/          报表后端（mock 适配层）
├── packages/
│   └── shared-api/                      共享 axios 封装（⚠️ 业务代码禁止使用）
├── docs/                                项目文档
└── .trae/                               Trae IDE 配置
```

## 3. 核心架构原则

### 3.1 Mock 优先

| 类型 | 位置 | 数量 |
|---|---|---|
| 内联静态常量 | `apps/<app>/src/mock/*.ts` | 17 文件 |
| mockjs 动态生成 | `apps/mkt-app/src/mock/event.ts` | 1 文件 |
| 假 HTTP 拦截 | `apps/mkt-app/src/utils/mockRequest.js` | 872 行 |
| 内联 API 函数 | `apps/<app>/src/api/*.ts` | 27 文件 |

### 3.2 禁止事项

- ❌ 真实 axios 客户端
- ❌ Supabase / Firebase / BaaS
- ❌ WebSocket / SSE 真连接
- ❌ 后端 SDK（`@app/shared-api/request` 真模式）

**CI 守护**：`apps/mkt-app/scripts/check-mock-purity.mjs`（675 文件扫描，0 违规）。

### 3.3 应用分层（以 mkt-app 为例）

```
pages/         437  业务视图
components/    58   通用组件
api/           27   API 接口（mock 化）
services/      5    业务服务（mock 化）
composables/   17   跨页面复用
stores/        8    Pinia stores
utils/         83   工具（含 mockRequest）
mock/          20   mock 数据源
types/         9    TS 类型契约
router/        9    路由模块
```

## 4. 跨应用共享

| 共享层 | 位置 |
|---|---|
| 工具 | `packages/shared-api`（仅供 packages 内部，业务代码用 `@/utils/mockRequest`） |
| 类型 | `apps/<app>/src/types/*`（按应用自治） |
| 组件 | 各应用 `src/components/`（无跨应用共享） |
| Mock | 各应用 `src/mock/`（无跨应用共享） |

## 5. 分支管理

| 类型 | 数量 | 备注 |
|---|---|---|
| 主干 | 2 | `main` / `develop` |
| feat | 8 | 含 2 个 customer360 v3.3、6 个 dmt/dfd |
| chain | 2 | 活跃合并分支 |
| pr | 3 | `pr-a/dmt-exploration` / `pr-b/lineage-graph` / `pr-c/risk-offline-model` |
| gh-pages | 1 | CI 部署 |
| backup/version | 8 | **建议归档**（见 `docs/BRANCH_RETIREMENT_PLAN.md`） |

### 5.1 双远端同步

| 远端 | URL | 同步策略 |
|---|---|---|
| `origin` (GitHub) | `git@github.com:wenbo0527/data_community.git` | 主仓库 |
| `gitee` (Gitee) | `https://gitee.com/wenbo0527/data_community.git` | 国产化镜像（已同步 28 分支） |

## 6. 部署与 CI

| 项目 | 配置 |
|---|---|
| 构建工具 | Vite |
| 包管理 | npm |
| 测试框架 | Vitest |
| 类型检查 | TS 5 + vue-tsc（部分应用） |
| Mock 守护 | `apps/mkt-app/scripts/check-mock-purity.mjs` |
| 路由测试 | `apps/horizontal-canvas/scripts/test-routes.sh` |

## 7. 关键技术栈

| 领域 | 技术 |
|---|---|
| 前端框架 | Vue 3 + Composition API |
| UI 库 | Arco Design |
| 类型 | TypeScript 5 |
| 路由 | Vue Router |
| 状态 | Pinia |
| 图表 | ECharts |
| 画布 | @antv/x6 |
| HTTP（mock） | 自研 `mockRequest.js`（假 axios） |
| 数据生成 | mockjs |

## 8. 应用依赖关系

```
admin-app      ──┐
asset-app      ──┤
dfd-app        ──┼─→ (各应用独立，无强耦合)
dmt-app        ──┤
dex-app        ──┤
mkt-app        ──┤
risk-app       ──┤
touch          ──┤
horizontal-canvas ─┘
        │
        ↓
packages/shared-api  (仅 packages 内部使用)
```

应用之间**不直接共享组件或数据**，通过路由跳转通信。

## 9. 数据流

```
┌──────────────────────────────────────┐
│ Pages (Vue Components)               │
│   ↓ 调用                              │
│ API Layer (@/api/*.ts)               │
│   ↓ 调用                              │
│ Mock Layer (@/mock/* 或 mockRequest) │
│   ↓ 返回                              │
│ Service / Store                       │
│   ↓ 返回                              │
│ Page State                            │
└──────────────────────────────────────┘
```

## 10. 文档索引

- [`apps/mkt-app/src/mock/MOCK_STANDARD.md`](apps/mkt-app/src/mock/MOCK_STANDARD.md) — Mock 数据标准
- [`docs/BRANCH_RETIREMENT_PLAN.md`](docs/BRANCH_RETIREMENT_PLAN.md) — 分支归档建议
- `apps/mkt-app/scripts/check-mock-purity.mjs` — Mock 纯净度 CI
- `apps/horizontal-canvas/scripts/test-routes.sh` — 路由测试
- `apps/horizontal-canvas/scripts/lint-any.mjs` — TypeScript `: any` 检查