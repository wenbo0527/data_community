# 分支命名规约

> **生效日期**: 2026-08-10
> **决策方**: 文博拍板（PM 推荐方案，详见 PM changelog `2026-08-10-pm-branch-cleanup.md`）
> **维护**: 数据社区研发团队 2 全体

---

## 1. 背景

2026-08-10 PM 已完成 17 个本地分支清理（详见 `BRANCH_RETIREMENT_PLAN.md`），同时识别出长期积累的命名混乱问题（chain/、migration/、pr-a/b/c/、feature/refactor-* 等）。

为防止历史重演，建立本规约约束**未来**所有新分支的命名。

## 2. 标准前缀

| 前缀 | 用途 | 合并后保留期 |
|:---|:---|:---|
| `feat/` | 新功能开发 | 7 天 |
| `fix/` | Bug 修复 | 7 天 |
| `refactor/` | 代码重构（不改变行为） | 7 天 |
| `docs/` | 文档变更 | 7 天 |
| `chore/` | 杂项（构建/CI/依赖） | 7 天 |
| `hotfix/` | 生产紧急修复 | 立即清理 |

## 3. 命名格式

### 3.1 标准结构

```
<prefix>/<scope>-<short-desc>
```

### 3.2 各字段含义

| 字段 | 必填 | 说明 | 示例 |
|:---|:---:|:---|:---|
| `prefix` | ✅ | 标准前缀（见 §2） | `feat` |
| `scope` | ✅ | 业务范围 / 子应用名 | `risk-app` / `mkt-app` |
| `short-desc` | ✅ | 简短描述（kebab-case） | `variable-hub-v1` |

### 3.3 完整示例

✅ **推荐**：
- `feat/risk-app-variable-hub-v1` — 风控应用变量中心 V1 新功能
- `fix/mkt-lockfile-sync-2026-08-03` — 营销应用 lockfile 同步修复
- `refactor/dex-app-api-cleanup` — 数据探索 API 清理重构
- `docs/branch-conventions` — 文档：分支规约（本分支）
- `chore/bump-vite-5.4` — 杂项：升级 Vite 到 5.4
- `hotfix/login-401-on-prod` — 紧急修复：生产登录 401

❌ **不推荐**：
- `feature/refactor-admin-app` — 前缀冗余（feature + refactor）
- `my-feature` — 无前缀
- `feat/RiskApp-VariableHub` — 大小写不规范

## 4. scope 取值建议

### 4.1 子应用 scope（首选）

| Scope | 对应应用 |
|:---|:---|
| `risk-app` | 风控应用 |
| `mkt-app` | 营销中台 |
| `dex-app` | 数据探索 |
| `dmt-app` | 数据模型 |
| `dfd-app` | 数据发现 |
| `admin-app` | 运营后台 |
| `asset-app` | 资产管理 |
| `touch` | 触达管理 |
| `horizontal-canvas` | 横版画布 |
| `portal-shell` | 主入口 shell |

### 4.2 跨应用 scope

| Scope | 含义 |
|:---|:---|
| `infra` | 基础设施（CI/构建/部署） |
| `shared` | 跨应用共享代码 |
| `docs` | 项目级文档（本分支即用） |

### 4.3 业务模块 scope（细分时）

格式 `<app-scope>-<module>`：
- `risk-app-pricing` — 风控应用定价模块
- `mkt-app-coupon` — 营销应用卡券模块

## 5. 废弃命名（不允许新分支使用）

以下命名模式产生于历史阶段，**新分支严禁使用**：

| 废弃模式 | 替代方案 | 原因 |
|:---|:---|:---|
| ❌ `chain/<name>-<date>` | `feat/<app>-<name>` | chain/ 是合并中转分支，命名混淆 |
| ❌ `migration/<app>-<date>` | `refactor/<app>-<migration>` | migration/ 已废弃，应走 refactor/ |
| ❌ `merge/<desc>` | `feat/<app>-<merge-desc>` | merge/ 是合并任务分支，不是功能分支 |
| ❌ `pr-a/`、`pr-b/`、`pr-c/` | `feat/<app>-<desc>` | 临时 PR 编号已无意义 |
| ❌ `feature/refactor-*` | `refactor/<app>-<desc>` | feature 与 refactor 双重前缀冗余 |
| ❌ `backup/<name>-<date>` | 不用，必要时打 tag | backup 分支应转为 `archive/<name>-<date>` tag |
| ❌ `analysis/<desc>` | `docs/<scope>-<analysis>` | 临时分析应入文档 |
| ❌ `version/<hash>` | 不用，必要时打 tag | 快照分支应转为 version tag |
| ❌ `with360` 等裸命名 | 加前缀 scope | 缺前缀无法识别用途 |

## 6. 命名检查清单

创建新分支前自检：

- [ ] 有标准前缀（feat/fix/refactor/docs/chore/hotfix）？
- [ ] scope 明确（子应用名或跨应用 scope）？
- [ ] short-desc 用 kebab-case？
- [ ] 不在 §5 废弃名单中？
- [ ] 不与现有活跃分支重名？

## 7. 工具支持（建议）

未来可加 git hook 自动检查（PM 边界声明，arch 待评估）：

```bash
# .git/hooks/pre-commit (建议)
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if echo "$BRANCH" | grep -qE "^(${PREFIX_PATTERN})$"; then
    echo "✅ 分支命名规范"
else
    echo "⚠️ 分支命名不规范，详见 docs/BRANCH_NAMING.md §5"
fi
```

## 8. 例外流程

如有充分理由使用废弃命名：
1. PR 描述中说明原因
2. arch 评审通过
3. 在 PR 评论中 @ PM 备案

## 9. 关联文档

- [`docs/BRANCH_CLEANUP.md`](BRANCH_CLEANUP.md) — 分支清理 SOP
- [`docs/BRANCH_RETIREMENT_PLAN.md`](BRANCH_RETIREMENT_PLAN.md) — 历史分支清理建议表
- [`docs/ARCHITECTURE.md` §5](ARCHITECTURE.md) — 分支管理总览
- PM changelog `2026-08-10-pm-branch-cleanup.md` — 本次清理执行记录

---

*数据社区研发团队 2 · 2026-08-10 · v1.0 拍板生效*