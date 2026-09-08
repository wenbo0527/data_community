# 分支归档记录

> **状态**：✅ 已于 2026-09-08 执行（参见 commit `chore(repo): P0-2 分支归档`）

## 1. 背景

本仓库共有 27 个远端分支（origin + gitee），部分分支已无维护价值，已按下列清单完成归档清理。

## 2. 归档建议表

| 分支 | 最后提交 | 距今 | 状态 | 处理 | 归档 Tag |
|---|---|---|---|---|---|
| `backup-before-revert-20250912-141014` | 2025-09-12 | 323 天 | 备份 | ✅ 已删 | `archive/backup-before-revert-20250912-141014` |
| `backup/external-center-restore-20251111` | 2025-11-11 | 263 天 | 备份 | ✅ 已删 | `archive/backup-external-center-restore-20251111` |
| `analysis/merge-with-backup-20251111` | 2025-11-11 | 263 天 | 备份 | ✅ 已删 | `archive/analysis-merge-with-backup-20251111` |
| `version/commit-15e65006` | 2025-11-11 | 263 天 | 版本快照 | ✅ 已删 | `archive/version-commit-15e65006` |
| `version/with360-prev-2b2f455d` | 2025-10-29 | 276 天 | 版本快照 | ✅ 已删 | `archive/version-with360-prev-2b2f455d` |
| `with360` | 2025-10-29 | 276 天 | 历史 | ✅ 已删 | `archive/with360` |
| `integrate/external-center-20251111` | 2026-01-22 | 191 天 | 历史 | ✅ 已删 | `archive/integrate-external-center-20251111` |
| `migration/dex-app-modules-20260424` | 2026-04-28 | 95 天 | 历史 | ✅ 已删（gitee，本地无；origin 不存在） | — |

> 备注：实际执行发现文档中分支名为 `…141010`，仓库真实名为 `…141014`（以仓库为准）。`migration/dex-app-modules-20260424` 本地与 origin 均不存在，仅在 gitee 上有，已清理。

## 3. 保留分支（活跃）

### 核心
- `main`（HEAD）
- `develop`

### feat 分支（活跃或近期合入）
- `feat/customer360-v3.3-p0p1` ✅ 已合 main
- `feat/customer360-v3.3-p0p1-followup` ✅ 已合 main
- `feat/customer360-update` ⚠️ 3 个未合 commit 待 cherry-pick
- `feat/horizontal-canvas-optimize` ⚠️ 10 个未合 commit 待 cherry-pick 或归档（仅供历史参考）
- `feat/mkt-coupon-benefit-merge` ⚠️ 落后 56 commits
- `feat/dmt-classify-dmt-merge`、`feat/dfd-table-detail-merge`、`feat/dmt-classify-excel-import-and-menu-cleanup`、`feat/dmt-exploration-v1.1`、`feat/merge-variable-and-external-lifecycle` 5 个 dmt/dfd 分支
- `pr-a/dmt-exploration`、`pr-b/lineage-graph`、`pr-c/risk-offline-model` 3 个 PR 分支

### chain 分支（活跃）
- `chain/a-deadcode-deps-cleanup-20260712`
- `chain/a-dmt-asset-listing-20260722`

### gh-pages（CI 部署专用）
- `gh-pages`

## 4. 执行命令（已运行于 2026-09-08）

```bash
# 1. 打 archive/<name> tag（保留快照，便于恢复）
git tag archive/backup-before-revert-20250912-141014 backup-before-revert-20250912-141014
git tag archive/backup-external-center-restore-20251111 backup/external-center-restore-20251111
git tag archive/analysis-merge-with-backup-20251111 analysis/merge-with-backup-20251111
git tag archive/version-commit-15e65006 version/commit-15e65006
git tag archive/version-with360-prev-2b2f455d version/with360-prev-2b2f455d
git tag archive/with360 with360
git tag archive/integrate-external-center-20251111 integrate/external-center-20251111

# 2. 推送 tag 到远端
git push origin --tags
git push gitee --tags

# 3. 删除本地分支（2 个用 -D 因有未合并提交；其余用 -d）
git branch -d backup/external-center-restore-20251111
git branch -d analysis/merge-with-backup-20251111
git branch -d version/with360-prev-2b2f455d
git branch -d with360
git branch -d integrate/external-center-20251111
git branch -D backup-before-revert-20250912-141014
git branch -D version/commit-15e65006

# 4. 删除 origin 远端分支
git push origin --delete backup-before-revert-20250912-141014
git push origin --delete backup/external-center-restore-20251111
git push origin --delete analysis/merge-with-backup-20251111
git push origin --delete version/commit-15e65006
git push origin --delete version/with360-prev-2b2f455d
git push origin --delete with360
git push origin --delete integrate/external-center-20251111
# migration/dex-app-modules-20260424 在 origin 本不存在（已自动同步删除）

# 5. 删除 gitee 远端分支（含 migration/...）
git push gitee --delete <上述全部 8 个>

# 6. 清理本地失效引用
git remote prune origin
git remote prune gitee
git fetch --all --prune
```

### 恢复方法（如需）

```bash
git checkout -b <branch-name> archive/<分支归档-tag 名>
```

## 5. 不删除的分支

- `feat/horizontal-canvas-optimize` 保留作为历史记录（独立 PR / tag `v3.3-horizontal-canvas-optimize`）
- 3 个 PR 分支（pr-a/b/c）保留等待评审
- 5 个 dmt/dfd 分支保留作为历史参考
- `gh-pages` 保留作为 CI 部署

## 6. 风险

- 删除前请确认无他人依赖这些分支
- GitHub 上可在 PR 中 review 删除历史
- Gitee 同步删除