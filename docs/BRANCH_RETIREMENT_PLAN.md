# 分支归档建议（2026-08-01）

## 1. 背景

本仓库共有 27 个远端分支（origin + gitee），部分分支已无维护价值，提议归档清理。

## 2. 归档建议表

| 分支 | 最后提交 | 距今 | 状态 | 建议 |
|---|---|---|---|---|
| `backup-before-revert-20250912-141010` | 2025-09-12 | 323 天 | 备份 | **删除**（已确认完成 revert） |
| `backup/external-center-restore-20251111` | 2025-11-11 | 263 天 | 备份 | **删除**（内容已合入 main） |
| `analysis/merge-with-backup-20251111` | 2025-11-11 | 263 天 | 备份 | **删除**（与 backup 重叠） |
| `version/commit-15e65006` | 2025-11-11 | 263 天 | 版本快照 | **删除**（快照任务已完成） |
| `version/with360-prev-2b2f455d` | 2025-10-29 | 276 天 | 版本快照 | **删除**（with360 前置版本） |
| `with360` | 2025-10-29 | 276 天 | 历史 | **删除**（95 天前更新，已被 main 覆盖） |
| `integrate/external-center-20251111` | 2026-01-22 | 191 天 | 历史 | **删除**（外数中心已合入 main） |
| `migration/dex-app-modules-20260424` | 2026-04-28 | 95 天 | 历史 | **删除**（基于极旧 main，已被新架构替代） |

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

## 4. 关闭命令（需用户确认后执行）

```bash
# 远端删除已归档分支
git push origin --delete backup-before-revert-20250912-141010
git push origin --delete backup/external-center-restore-20251111
git push origin --delete analysis/merge-with-backup-20251111
git push origin --delete version/commit-15e65006
git push origin --delete version/with360-prev-2b2f455d
git push origin --delete with360
git push origin --delete integrate/external-center-20251111
git push origin --delete migration/dex-app-modules-20260424
git push gitee --delete backup-before-revert-20250912-141010
git push gitee --delete backup/external-center-restore-20251111
git push gitee --delete analysis/merge-with-backup-20251111
git push gitee --delete version/commit-15e65006
git push gitee --delete version/with360-prev-2b2f455d
git push gitee --delete with360
git push gitee --delete integrate/external-center-20251111
git push gitee --delete migration/dex-app-modules-20260424
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