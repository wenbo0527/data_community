# 子应用拆分任务清单 - 完整复刻原则

**核心原则**：原样复刻，不修改、不重构、只复制
**问题处理**：发现问题时记录到问题清单，暂不处理

---

## Agent-MKT (营销域子应用)

### 分支
`feature/refactor-mkt-app`

### 源代码位置
- `src/pages/marketing/` (alert, benefit, canvas, coupon, global, tasks)
- `src/pages/discovery/` (api-market, customer360, asset-management 等)

### 目标位置
`apps/mkt-app/`

### 任务步骤

#### 1. 创建目录结构
```bash
mkdir -p apps/mkt-app/src/{api,assets,components,layouts,pages,router,stores,styles,types,utils}
mkdir -p apps/mkt-app/public
```

#### 2. 复制代码（完整复刻）
```bash
# 复制 marketing 目录
cp -r src/pages/marketing/* apps/mkt-app/src/pages/

# 复制 discovery 目录
cp -r src/pages/discovery/* apps/mkt-app/src/pages/
```

#### 3. 创建标准文件
- `apps/mkt-app/index.html`
- `apps/mkt-app/vite.config.ts` (端口 5177, base: '/mkt/')
- `apps/mkt-app/qiankun-entry.ts` (参考 risk-app)
- `apps/mkt-app/src/main.ts` (独立运行入口)
- `apps/mkt-app/src/router/index.ts` (路由 base: '/mkt/')
- `apps/mkt-app/package.json`
- `apps/mkt-app/tsconfig.json`

#### 4. 问题记录
如有以下问题，记录到问题清单（不修改）：
- 缺失的文件依赖
- 错误的 import 路径
- 样式问题
- 逻辑问题

#### 5. 验证
- `npm run dev` 独立运行测试
- 检查页面是否正常显示

---

## Agent-Admin (通用域子应用)

### 分支
`feature/refactor-admin-app`

### 源代码位置
- `src/pages/management/` (accompany, asset-management, business-concept, data-standard, metadata, service 等)

### 目标位置
`apps/admin-app/`

### 任务步骤

#### 1. 创建目录结构
```bash
mkdir -p apps/admin-app/src/{api,assets,components,layouts,pages,router,stores,styles,types,utils}
```

#### 2. 复制代码
```bash
cp -r src/pages/management/* apps/admin-app/src/pages/
```

#### 3. 创建标准文件
- `apps/admin-app/index.html`
- `apps/admin-app/vite.config.ts` (端口 5182, base: '/admin/')
- `apps/admin-app/qiankun-entry.ts`
- `apps/admin-app/src/main.ts`
- `apps/admin-app/src/router/index.ts` (base: '/admin/')
- `apps/admin-app/package.json`

#### 4. 问题记录
记录问题但不修改

#### 5. 验证
独立运行测试

---

## Agent-Asset (数据资产域子应用)

### 分支
`feature/refactor-asset-app`

### 源代码位置
- `src/pages/asset-management/` (basic-management, listing-management)
- `src/pages/listing-management/` (data-elements, metric-management, variable-management)

### 目标位置
`apps/asset-app/`

### 任务步骤

#### 1. 创建目录结构
```bash
mkdir -p apps/asset-app/src/{api,assets,components,layouts,pages,router,stores,styles,types,utils}
```

#### 2. 复制代码
```bash
cp -r src/pages/asset-management/* apps/asset-app/src/pages/
cp -r src/pages/listing-management/* apps/asset-app/src/pages/
```

#### 3. 创建标准文件
- 端口 5179, base: '/asset/'
- 其他标准文件

#### 4. 问题记录

#### 5. 验证

---

## Agent-DEX (数据探索域子应用)

### 分支
`feature/refactor-dex-app`

### 源代码位置
- `src/pages/exploration/`
- `src/pages/data-analysis/`

### 目标位置
`apps/dex-app/`

### 任务步骤

#### 1. 创建目录结构

#### 2. 复制代码
```bash
cp -r src/pages/exploration/* apps/dex-app/src/pages/
cp -r src/pages/data-analysis/* apps/dex-app/src/pages/
```

#### 3. 创建标准文件
- 端口 5180, base: '/dex/'

#### 4. 问题记录

#### 5. 验证

---

## Agent-DMT (数据管理域子应用)

### 分支
`feature/refactor-dmt-app`

### 源代码位置
- `src/pages/metadata/`
- `src/pages/data-standard/`
- `src/pages/business-concept/`

### 目标位置
`apps/dmt-app/`

### 任务步骤

#### 1. 创建目录结构

#### 2. 复制代码
```bash
cp -r src/pages/metadata/* apps/dmt-app/src/pages/
cp -r src/pages/data-standard/* apps/dmt-app/src/pages/
cp -r src/pages/business-concept/* apps/dmt-app/src/pages/
```

#### 3. 创建标准文件
- 端口 5181, base: '/dmt/'

#### 4. 问题记录

#### 5. 验证

---

## Agent-RISK (风险域完善)

### 分支
`feature/refactor-risk-app`

### 源代码位置
- `apps/risk-app/` (已存在，需完善)

### 任务步骤

#### 1. 检查现有结构
- 验证 qiankun-entry.ts 是否完整
- 验证 router base 配置
- 验证 vite.config.ts

#### 2. 问题记录
如有缺失或问题，记录但不修改

#### 3. 验证

---

## 问题清单模板

每个 Agent 完成时需提交以下格式的问题清单：

```
## 问题清单 - [子应用名]

### 1. 代码问题
| # | 问题描述 | 文件位置 | 严重程度 | 备注 |
|---|----------|----------|----------|------|
| 1 | | | 高/中/低 | |

### 2. 依赖问题
| # | 问题描述 | 涉及文件 | 建议 |
|---|----------|----------|------|
| 1 | | | |

### 3. 待确认问题
| # | 问题描述 | 需要确认 |
|---|----------|----------|
| 1 | | |
```

---

## 验证检查项

每个子应用完成后必须验证：

1. ✅ `npm run dev` 可独立启动
2. ✅ 页面可访问
3. ✅ 路由正常工作
4. ✅ API 调用正常（mock 或代理）
5. ✅ 样式正常显示
6. ❌ **不要修改任何原有代码逻辑**

---

**完成后请汇报**：
1. 创建的文件清单
2. 问题清单
3. 验证结果