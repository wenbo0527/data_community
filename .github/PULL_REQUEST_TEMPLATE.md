# Pull Request 模板 · 数字社区研发团队 2

> **本模板由 TASK-20260810-B298F6C5 落地 · 2026-08-10**
> **与 Husky commit-msg 校验配套 · Conventional Commits type 一致**

---

## 📋 基本信息

**PR 标题**（必填 · 与首条 commit message 一致）：

```
<type>(<scope>): <subject>

例：feat(risk-app): 新增变量中心 V1
```

**支持的 type**（与 Husky commit-msg 校验一致）：

| Type | 含义 | 适用场景 |
|:---|:---|:---|
| `feat` | 新功能 | 新增功能、模块、页面 |
| `fix` | Bug 修复 | 修复已知的 bug |
| `refactor` | 重构 | 不改变行为的代码重构 |
| `docs` | 文档 | 文档变更（不改代码） |
| `chore` | 杂项 | 构建、CI、依赖、scripts |
| `hotfix` | 紧急修复 | 生产环境紧急修复 |
| `test` | 测试 | 增加或修改测试 |
| `build` | 构建 | 构建系统或外部依赖变更 |
| `ci` | CI 配置 | CI 配置文件和脚本变更 |
| `style` | 代码风格 | 不影响代码含义的变更（空格、格式化） |
| `perf` | 性能优化 | 性能优化 |
| `revert` | 回滚 | 回滚之前的 commit |

**scope 命名建议**（与 BRANCH_NAMING.md 一致）：

- 子应用：`risk-app` / `mkt-app` / `dex-app` / `dmt-app` / `dfd-app` / `admin-app` / `asset-app` / `touch` / `horizontal-canvas` / `portal-shell`
- 跨应用：`infra` / `shared` / `docs`
- 业务模块：`<app-scope>-<module>`（如 `risk-app-pricing`）

---

## 🔗 关联

**关联 Issue**（必填 · 选填其一）：

- [ ] Closes #<issue 编号>
- [ ] Fixes #<issue 编号>
- [ ] Refs #<issue 编号>
- [ ] 无关联 Issue

**关联 PR / 任务**：

- 相关 PR: #<PR 编号>
- 任务 ID: TASK-YYYYMMDD-XXXXXXXX
- 派单方: PM / arch / dev / qa / doc

---

## 📝 变更说明（必填）

### 变更类型

- [ ] 新功能（feat）
- [ ] Bug 修复（fix）
- [ ] 重构（refactor）
- [ ] 文档（docs）
- [ ] 杂项（chore）
- [ ] 紧急修复（hotfix）
- [ ] 测试（test）
- [ ] 构建（build）
- [ ] CI 配置（ci）
- [ ] 代码风格（style）
- [ ] 性能优化（perf）
- [ ] 回滚（revert）

### 背景与目标

<!-- 为什么需要这个变更？要解决什么问题？达到什么目标？ -->

### 变更内容

<!-- 详细描述变更内容，包括：新增/修改/删除的文件，关键代码逻辑 -->

### 截图 / 录屏（适用 UI 变更）

<!-- UI 变更必须附截图或录屏 -->

---

## 🧪 测试说明（必填）

### 测试场景

- [ ] 单元测试通过（vitest）
- [ ] E2E 测试通过（playwright）
- [ ] 性能测试通过（适用性能优化）
- [ ] 手动测试通过（描述测试步骤）

### 测试步骤

```
1. ...
2. ...
3. ...

期望结果: ...
实际结果: ...
```

### 边界情况

<!-- 考虑到的边界情况与处理方式 -->

### 已知问题

<!-- 暂未解决但已知的问题 -->

---

## ✅ 自检清单（必填 · 全部勾选才能 merge）

### 代码质量

- [ ] 代码风格符合项目 ESLint 规则（`pnpm lint:check --max-warnings 0`）
- [ ] TypeScript 类型检查通过（`vue-tsc -p tsconfig.typecheck.json`）
- [ ] 无新增 ESLint 警告
- [ ] 无 `console.log` / `debugger` 残留
- [ ] 无 `any` 类型滥用
- [ ] 组件不超过 300 行（超长需拆分到 components/）
- [ ] 操作列统一为「详情」+「更多∨」
- [ ] 高风险操作有二次确认弹窗
- [ ] 空状态、加载态、错误态已处理

### 测试覆盖

- [ ] 新增代码有单元测试
- [ ] 关键路径有 E2E 测试
- [ ] 测试覆盖率不下降（适用时）

### 文档同步

- [ ] README.md 更新（适用）
- [ ] API 文档更新（适用）
- [ ] CHANGELOG.md 更新（适用）
- [ ] 架构文档更新（适用 · ARCHITECTURE.md）

### Git 规范

- [ ] commit message 符合 Conventional Commits（Husky 已校验）
- [ ] 分支命名符合 BRANCH_NAMING.md
- [ ] 无合并冲突
- [ ] rebase 到最新 main

### 部署与回滚

- [ ] 部署脚本可成功执行（适用）
- [ ] 回滚方案明确（适用）
- [ ] 监控告警已配置（适用）

---

## 👥 评审

### 评审者

- [ ] arch 评审（架构相关变更）
- [ ] dev 评审（代码质量）
- [ ] qa 评审（测试覆盖）
- [ ] doc 评审（文档同步）

### CODEOWNERS 自动分配

<!-- GitHub 将根据 CODEOWNERS 自动 assign reviewer -->
<!-- 详见仓库根 CODEOWNERS 文件 -->

---

## 📚 关联文档

- [BRANCH_NAMING.md](docs/governance/BRANCH_NAMING.md) — 分支命名规约
- [BRANCH_CLEANUP.md](docs/governance/BRANCH_CLEANUP.md) — 分支清理 SOP
- [BRANCH_RETIREMENT_PLAN.md](docs/governance/BRANCH_RETIREMENT_PLAN.md) — 已归档分支记录
- [architecture/overview.md](docs/architecture/overview.md) — 架构总览（原 ARCHITECTURE.md）
- [docs/README.md](docs/README.md) — 文档索引
- [CODEOWNERS](CODEOWNERS) — 仓库 owner 配置

---

*数字社区研发团队 2 · v1.0 · 2026-08-10 拍板生效 · TASK-20260810-B298F6C5 落地*