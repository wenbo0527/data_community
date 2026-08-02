# 项目测试指南

> **最后更新**: 2026-08-02
> **当前状态**: 163 通过 / 0 失败(单元 + 组件)
> **E2E**: 6 个 spec 文件已就位(待 Playwright 跑)

---

## 🎯 测试金字塔

```
                   ╔════════════════╗
                   ║   E2E(Playwright)   ║ ← 跨模块用户旅程
                   ║   6 specs · 33 用例  ║
                   ╚════════════════╝
              ╔════════════════════════╗
              ║  组件(@vue/test-utils)   ║ ← Vue 组件交互
              ║  7 specs · 71 用例  ✅     ║
              ╚════════════════════════╝
         ╔════════════════════════════════╗
         ║    单元(Vitest)                   ║ ← 纯逻辑/store
         ║    2 specs · 92 用例  ✅            ║
         ╚════════════════════════════════╝
```

---

## 🚀 快速开始

```bash
# 1. 单元 + 组件测试(< 5 秒)
npm run test:unit

# 2. 跑指定测试文件
npx vitest run src/mock/shared/__tests__/lineage.test.ts
npx vitest run src/types/__tests__/roles.test.ts
npx vitest run tests/components/

# 3. E2E 测试(需要先启动 dev server)
npm run dev &  # 后台启动
sleep 10
npm run test:e2e

# 4. 全量
npm run test:all
```

---

## 📂 测试目录结构

```
tests/
├── setup.ts                          # 全局 setup(Pinia + Arco icon mock)
├── components/                        # 组件测试
│   ├── createWrapper.ts               # mountComponent 工具
│   ├── RoleSwitcher.spec.ts           # 角色切换器(9 用例)
│   ├── ClassificationViewer.spec.ts   # 分类视图(10 用例)
│   ├── CommentPanel.spec.ts           # 协作注释(8 用例)
│   ├── FavoriteButton.spec.ts         # 收藏按钮(11 用例)
│   ├── GlobalGovernanceOverview.spec.ts # 治理全景(10 用例)
│   ├── ColumnLineageViewer.spec.ts    # 字段级血缘(12 用例)
│   └── apply.spec.ts                  # 权限申请(11 用例)
└── e2e/                               # E2E 测试
    ├── fixtures/
    │   ├── roles.ts                   # 10 角色 fixture
    │   └── test-users.ts              # 10 测试用户
    ├── page-objects/
    │   ├── UnifiedWorkbenchPage.ts    # 工作台
    │   ├── Customer360Page.ts         # 客户 360
    │   ├── DataPermissionPage.ts      # 权限申请
    │   └── FavoritesPage.ts           # 我的收藏
    └── specs/
        ├── 01-workbench.spec.ts       # 8 角色工作台(数据驱动 10 用例)
        ├── 02-role-switch.spec.ts     # 角色切换(10+ 用例)
        ├── 03-favorite-flow.spec.ts   # 收藏流程(3 用例)
        ├── 04-permission-apply.spec.ts # 权限申请(4 用例)
        ├── 05-data-map.spec.ts        # 数据地图(5 用例)
        └── 06-cross-module.spec.ts    # 跨模块跳转(9 用例)

src/
├── mock/shared/__tests__/lineage.test.ts  # 打通层单元测试(63 用例)
└── types/__tests__/roles.test.ts         # 角色定义单元测试(29 用例)
```

---

## 📊 测试覆盖矩阵

| 模块 | 单元 | 组件 | E2E | 总计 |
|:---|:---:|:---:|:---:|:---:|
| FieldLinkStore | ✅ 9 | — | — | 9 |
| ColumnLineageStore | ✅ 6 | — | — | 6 |
| LineageGraphStore | ✅ 6 | — | — | 6 |
| StandardClassifyMatrix | ✅ 3 | — | — | 3 |
| TaxonomyStore | ✅ 5 | — | — | 5 |
| CommentStore | ✅ 7 | ✅ 8 | — | 15 |
| AssetTagStore | ✅ 5 | — | — | 5 |
| useSensitiveMasker | ✅ 9 | ✅ 4 | — | 13 |
| useGlossary | ✅ 5 | — | — | 5 |
| useFieldPermission | ✅ 5 | — | — | 5 |
| useCrossNav | ✅ 3 | — | — | 3 |
| 角色机制(RoleSwitcher) | ✅ 12 | ✅ 9 | — | 21 |
| FavoriteStore + Button | — | ✅ 11 | — | 11 |
| TaxonomyStore(组件) | — | ✅ 10 | — | 10 |
| ClassificationViewer | — | ✅ 10 | — | 10 |
| GlobalGovernanceOverview | — | ✅ 10 | — | 10 |
| ColumnLineageViewer | — | ✅ 12 | — | 12 |
| apply.vue | — | ✅ 11 | — | 11 |
| 工作台(E2E 数据驱动) | — | — | ✅ 10 | 10 |
| 角色切换 | — | — | ✅ 11 | 11 |
| 收藏流程 | — | — | ✅ 3 | 3 |
| 权限申请 | — | — | ✅ 4 | 4 |
| 数据地图 | — | — | ✅ 5 | 5 |
| 跨模块跳转 | — | — | ✅ 9 | 9 |
| **合计** | **92** | **71** | **42** | **205** |

---

## 🎯 设计原则

### 单元测试(Vitest)
- **纯逻辑**:只测 store / composable / 工具函数
- **无依赖**:不渲染 Arco 组件(避免 jsdom ESM 问题)
- **快速**:每个测试 < 100ms

### 组件测试(@vue/test-utils + Vitest)
- **聚焦数据源**:因 Arco 组件 jsdom 兼容问题,改为测试 store/composable 集成
- **mount 隔离**:每个测试重置 Pinia
- **stub 完整**:`createWrapper.ts` 提供 35 个 Arco 组件 stub

### E2E 测试(Playwright)
- **Page Object 模式**:页面封装成对象,避免重复 selector
- **数据驱动**:`ROLE_FIXTURES` 让同一套测试跑 10 个角色
- **data-testid**:`UnifiedWorkbench`、`RoleSwitcher` 关键区块已注入

---

## 🛠️ 测试工具

### 单元 / 组件测试

```ts
import { mountComponent } from './createWrapper'
import { setupPinia } from './createWrapper'

const wrapper = mountComponent(MyComponent, {
  props: { title: 'Test' }
})
expect(wrapper.html()).toContain('Test')
```

### E2E 测试

```ts
import { UnifiedWorkbenchPage } from '../page-objects/UnifiedWorkbenchPage'

const workbench = new UnifiedWorkbenchPage(page)
await workbench.goto('/discovery')
await workbench.switchToRole('数据工程师')
await workbench.expectShortcuts(['数据地图', '元数据建模'])
```

---

## 🔧 调试

```bash
# Vitest UI(可视化调试)
npx vitest --ui

# 单元 + 组件
npm run test:unit

# 仅组件
npx vitest run tests/components/

# 监听模式(自动重跑)
npx vitest --watch src/

# Playwright(可视化调试 E2E)
npx playwright test --debug

# 指定 spec
npx playwright test 02-role-switch.spec.ts
```

---

## ⚙️ 配置

- [vitest.config.ts](../vitest.config.ts) — 单元 + 组件
- [playwright.config.ts](../playwright.config.ts) — E2E
- [tests/setup.ts](setup.ts) — 组件测试全局 setup
- [tests/components/createWrapper.ts](components/createWrapper.ts) — mount 工具

---

## 📈 测试质量指标

| 指标 | 当前 | 目标 |
|:---|:---:|:---:|
| 单元测试通过率 | 100% (92/92) | 100% |
| 组件测试通过率 | 100% (71/71) | 100% |
| E2E 测试覆盖 | 42 用例 | 50+ 用例 |
| 平均测试时长 | < 5 秒 | < 5 秒 |
| CI 集成 | ✅ | ✅ |

---

## 🚧 已知问题

1. **Arco 组件 jsdom ESM**:组件测试改为"测试数据源"而非"渲染验证"
   - 影响:不能直接验证 Arco 组件内部 UI
   - 解决:真实 UI 验证交给 E2E(Playwright)

2. **未做覆盖率门槛**:依赖 `@vitest/coverage-v8` 安装
   - 当前:手动统计 composables 67% / mock/shared 53%
   - 后续:装上 v8 provider,启用阈值

---

## 📝 添加新测试

### 添加单元测试

```ts
// src/mock/shared/__tests__/my-store.test.ts
import { describe, it, expect } from 'vitest'
import { MyStore } from '../my-store'

describe('MyStore', () => {
  it('does X', () => {
    expect(MyStore.list().length).toBeGreaterThan(0)
  })
})
```

### 添加组件测试

```ts
// tests/components/MyComponent.spec.ts
import { describe, it, expect } from 'vitest'
import { mountComponent } from './createWrapper'
import MyComponent from '@/components/common/MyComponent.vue'

describe('MyComponent - 数据源集成', () => {
  it('works', () => {
    const wrapper = mountComponent(MyComponent, { props: { foo: 'bar' } })
    expect(wrapper.exists()).toBe(true)
  })
})
```

### 添加 E2E 测试

```ts
// tests/e2e/specs/07-my-flow.spec.ts
import { test, expect } from '@playwright/test'

test('我的流程', async ({ page }) => {
  await page.goto('/my-route')
  await expect(page.locator('text=预期')).toBeVisible()
})
```

---

## 版本记录

| 版本 | 日期 | 修改 |
|:---|:---|:---|
| v1.0 | 2026-08-02 | 初版:163 通过(92 + 71) + 6 E2E spec |