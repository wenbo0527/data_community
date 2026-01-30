# 外数 Mock 数据链路分析与统一方案评估

## 问题定位分析
经过对 `ContractCreate.vue`、Store、API 及 Mock 文件的完整分析，定位到 "Store 长度: 0" 的根本原因在于**Mock 数据源管理混乱导致的数据流断裂或结构不匹配**。

### 1. 混乱的 Mock 数据源
目前存在三套不一致的 Mock 数据定义，导致维护困难和潜在的运行时冲突：
1.  **API 内部硬编码 (`evaluation.ts`)**：`getRegisteredProducts` 函数内部通过 `useMock = true` 强行返回本地硬编码的数组。这是反模式，绕过了网络请求层。
2.  **Vite Mock 插件 (`mock/external-data-evaluation.ts`)**：定义了标准的 Mock 接口 `/api/external-data-evaluation/products`，返回 `{ code: 200, data: [...] }` 结构。
3.  **独立 Mock 文件 (`mock/supplierProducts.ts`)**：包含另一套更丰富的产品数据，但数据结构（`SupplierProduct`）与 Store 期望的（`ProductSummary`）不完全一致。

### 2. 脆弱的 Store 解析逻辑
`external-data.ts` 中的 `fetchProducts` 包含复杂的兼容逻辑：
```typescript
// 试图同时兼容纯数组（API内部Mock）和标准响应（HTTP/Mock插件）
if (Array.isArray(res)) { ... } 
else if (Array.isArray(res.data)) { ... }
```
虽然逻辑看似覆盖了所有情况，但这种防御性编程掩盖了上游数据源不一致的本质问题。如果 `useMock` 状态与预期不符，或者 `http` 拦截器处理后的结果与判断逻辑即使有微小偏差（如拦截器直接解包了 data，而 Store 又去取 data.data），就会导致解析出空数组。

### 3. "Store 长度: 0" 的成因推断
虽然 `useMock` 硬编码为 `true` 理论上应返回数组，但日志显示长度为 0，最可能的成因是：
- **数据结构层级错位**：如果 Axios 拦截器已经解包了响应，而 API 函数又做了一次处理，或者 Store 对 `res` 的判断逻辑未能正确匹配当前实际返回的结构。
- **环境状态不一致**：本地运行环境可能通过 `.env` 或其他方式覆盖了 `useMock` 的行为，导致走了 HTTP 请求，但 Mock 插件未正确拦截或返回了空数据。

## 统一外数 Mock 数据方案

为了彻底解决此问题并满足“统一外数相关的 Mock 数据”的需求，建议执行以下重构：

### Phase 1: 统一 Mock 数据源 (Mock Layer)
**目标**：废弃 API 文件中的硬编码数据，建立单一事实来源。
1.  **整合数据**：将 `supplierProducts.ts` 中的丰富数据迁移或合并到 `mock/external-data-evaluation.ts` 的生成器中，确保 Mock 数据既包含基础信息，也包含评估所需的详细字段。
2.  **标准化返回结构**：确保所有 Mock 接口统一返回 `{ code: 200, message: 'success', data: [...] }` 格式。

### Phase 2: 清理 API 层 (API Layer)
**目标**：API 函数回归纯粹的请求发送者角色。
1.  **移除硬编码**：删除 `evaluation.ts` 中的 `const useMock = true` 及其相关的 `if (useMock)` 分支逻辑。
2.  **统一调用**：`getRegisteredProducts` 只保留 `return await http.get(...)`。

### Phase 3: 简化 Store 逻辑 (Store Layer)
**目标**：移除冗余的兼容代码，提升可读性。
1.  **简化 fetchProducts**：移除对 `Array.isArray(res)` 的判断（不再支持非标准响应）。
2.  **统一处理**：假定 `http` 拦截器返回 `data` 字段内容（即 `{ code, data }` 或直接是 `data` 列表，取决于拦截器配置），Store 仅需处理一种标准情况。

## 预期效果
执行上述方案后，外数产品列表的加载链路将变为：
`View` -> `Store` -> `API (http.get)` -> `Vite Mock Plugin` -> `Unified Mock Data`
这将消除所有歧义，确保 Store 能稳定获取数据，彻底解决长度为 0 的问题。