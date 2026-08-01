# MKT-App Mock 数据标准

## 1. 背景

项目**仅用于前端展示**，不涉及后端应用。所有数据使用 mock 数据。

## 2. Mock 数据源（4 大类型）

| 类型 | 位置 | 适用场景 |
|---|---|---|
| **A. 内联静态常量** | `@/mock/*.ts` 或 `@/mock/*/*.ts` | 业务数据字典（渠道、模板、规则、指标枚举等） |
| **B. mockjs 动态生成** | `@/mock/event.ts` 等 | 大量随机数据（事件中心、统计明细） |
| **C. 假 HTTP 拦截** | `@/utils/mockRequest.js` | 表格分页/筛选/CRUD（data-models / alert-rules / variables / variable-map / v1/*） |
| **D. 内联 API 函数** | `api/*.ts/js`（`@/utils/supabase`） | 复杂业务查询（画布统计） |

## 3. 消费方式（4 种）

| 模式 | import 路径 | 适用 |
|---|---|---|
| **直接读常量** | `import { mockXxx } from '@/mock/xxx'` | 静态数据字典 |
| **读聚合** | `import mock from '@/mock/touch'; mock.queryDetails` | 多字段聚合 |
| **走 mockRequest** | `import request from '@/utils/mockRequest'; request({ url: '/api/...' })` | URL 风格 + 拦截 |
| **调用 API 函数** | `import { apiXxx } from '@/api/xxx'` | 业务封装 |

## 4. 禁止

- **禁止** 真实 HTTP 客户端（axios / fetch 调真接口）
- **禁止** Supabase / Firebase / 任何 BaaS
- **禁止** 后端 SDK（@app/shared-api/request 真模式）
- **禁止** WebSocket / SSE 真连接

## 5. 命名规范

- mock 文件统一 `@/mock/<domain>.<ext>` 或 `@/mock/<domain>/index.ts`
- 命名导出（`export const mockXxx`）为主；默认导出（聚合）次之
- 类型与 mock 同名：`export interface Xxx` 紧跟 `export const mockXxx: Xxx[]`

## 6. mockRequest 使用规则

URL 前缀必须命中以下之一，否则返回 `{ code: 200, data: null }`：

```
/api/data-models       → mock/data-models
/api/alert-rules       → mock/alert-rules
/api/variables         → 内联
/api/variable-map      → 内联
/api/v1/*              → 内联
```

新增路由必须同步更新 `mockRequest.js` 的 switch 分支与对应 handler。

## 7. CI 守护

- `apps/mkt-app/src/utils/` 下不允许新建 `axios` / `fetch` / `@supabase/*` 引用
- 所有 `api/*.ts` 必须仅依赖 `@/mock/*` 或 `@/utils/mockRequest`
- 集成测试覆盖所有 mock 接口契约