# JS/TS 双版本迁移现状与待办

> **创建日期**：2026-09-08（P1-5 落地）
> **状态**：⚠️ 部分完成（admin-app/stores/user 已合并）；其余 8 对是迁移中间态，**不删**

---

## 1. P1-5 处理结果

| 文件对 | 同源？ | 处理 | 引用方 |
|--------|------|------|--------|
| `apps/admin-app/src/stores/user.js` + `user.ts` | ✅ **SAME**（md5 一致） | ✅ **已删 .js**，保留 .ts | `pages/permission/app-permission/index.vue:219`（`@/stores/user.js` 仍指向 .ts，Vite 自动解析） |

其余 8 对双版本**故意保留**——原因见下节。

---

## 2. 其余 8 对是迁移中间态，不是简单备份

通过 `md5 -q` 对比 + 内容抽样，9 对里有 **8 对内容完全不同**。典型模式：

| 旧 `.js` | 新 `.ts` |
|---------|---------|
| 完整功能版本（数十 KB mock 数据、实际页面在用） | 精简骨架（4-5 KB，仅类型化接口） |
| 缺少类型定义 | 引用 `types/api/*.ts` 类型契约 |
| 含业务实现逻辑 | 仅导出空 API 对象待实现 |

### 9 对双版本清单

| # | `.js` 路径 | `.js` 体积 | `.ts` 体积 | 哈希同？ | 主用方 |
|---|-----------|-----------|-----------|---------|--------|
| 1 | `apps/dfd-app/src/components/canvas-statistics/index.js` | 2071B | 2309B | ❌ | **JS**（658 处 `@/components/canvas-statistics` 别名引用） |
| 2 | `apps/dfd-app/src/api/tag.js` | 431B | 6869B | ❌ | **JS**（30 处） |
| 3 | `apps/admin-app/src/stores/user.js` | 334B | 334B | ✅ | ✅ **已删 .js** |
| 4 | `apps/mkt-app/src/utils/echartsUtils.js` | 10914B | 1146B | ❌ | 两者均未直接 import（走 `@/utils/...` 别名） |
| 5 | `apps/mkt-app/src/api/coupon.js` | 41878B | 14746B | ❌ | 两者均未直接 import |
| 6 | `apps/mkt-app/src/api/alertRules.js` | 4088B | 869B | ❌ | 同上 |
| 7 | `apps/mkt-app/src/api/alert.js` | 20491B | 4731B | ❌ | **JS**（17 处） |
| 8 | `apps/mkt-app/src/api/tag.js` | 431B | 6873B | ❌ | **JS**（30 处） |
| 9 | `apps/mkt-app/src/api/alertRulesService.js` | 837B | 353B | ❌ | 两者均未直接 import |

---

## 3. 风险警告

机械执行"删 .js 留 .ts"会**破坏线上功能**：
- mkt-app 预警页面、优惠券页、规则管理页会报导入错误
- dfd-app canvas-statistics 组件挂掉

需要做的工作（**不在 P1-5 范围内**，已记入 P2 待办）：
1. 把 .js 的完整功能迁移到 .ts（合并双版本）
2. 改造所有 `@/api/xxx` 引用方为 `.ts`
3. 验证页面功能 E2E 通过
4. 然后才能删 .js

---

## 4. 后续拆分（P2 阶段任务）

| 子任务 | 预估工作量 | 验证 |
|--------|-----------|------|
| mkt-app/api/alert.js → alert.ts 完整迁移 | 1 天 | 预警页面 E2E |
| mkt-app/api/coupon.js → coupon.ts 完整迁移 | 1 天 | 优惠券页面 E2E |
| mkt-app/api/alertRules.js + alertRulesService.js → .ts | 0.5 天 | 规则管理 E2E |
| mkt-app/api/tag.js → tag.ts | 0.5 天 | 标签管理 E2E |
| mkt-app/utils/echartsUtils.js → .ts | 0.5 天 | 图表组件回归 |
| dfd-app/api/tag.js → tag.ts | 0.5 天 | dfd 标签 E2E |
| dfd-app/components/canvas-statistics/index.js → .ts | 0.5 天 | 画布统计 E2E |

合计 ~4.5 天，验收方式：每个 app 跑对应 Vitest 单测 + Playwright E2E。

---

## 5. P1-5 commit 引用

- `chore(repo): P1-5 JS/TS 双版本清理 - 删除唯一重复 user.js`
- 改动：1 个文件删除（user.js 334B）
- 不影响运行时（user.ts 与 user.js 哈希一致）

Co-Authored-By: Trae <noreply@trae.ai>