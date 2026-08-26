# 分支清理 SOP

> **生效日期**: 2026-08-10
> **决策方**: 文博拍板（PM 推荐方案，详见 PM changelog `2026-08-10-pm-branch-cleanup.md`）
> **维护**: 数据社区研发团队 2 全体

---

## 1. 背景

2026-08-10 PM 清理 17 个本地分支时建立本 SOP，确保分支清理成为常规操作而非一次性事件。

**核心原则**：
- 已合并分支及时清理（避免历史包袱）
- 重要分支先归档 tag（commit 可追溯）
- 远程分支观察期 1 个月（防止误删）

## 2. 清理时机

### 2.1 按前缀类型

| 前缀类型 | 合并后保留期 | 理由 |
|:---|:---|:---|
| `feat/` / `fix/` / `refactor/` / `docs/` / `chore/` | **7 天** | 给了 hotfix 验证窗口 |
| `hotfix/` | **立即** | 已合并即完成使命 |
| `chain/` / `migration/` / `merge/` / `pr-*` | **立即**（废弃命名） | 历史遗留，清理优先级最高 |

### 2.2 按活跃度

| 状态 | 处理方式 |
|:---|:---|
| 已合并到 main | 归档 tag → 删除本地 → 1 个月后删远程 |
| 长期不活跃（> 30 天无 commit） | PM 提醒 → 作者评估 → 归档或继续保留 |
| 已 no-ff 合并但本地未删 | 立即删除本地（commit 已通过 merge commit 在 main） |
| 与 main 有冲突无法合并 | 作者评估 → cherry-pick 必要 commit → 归档废弃 |

### 2.3 定时提醒（建议）

| 频率 | 工具 | 行为 |
|:---|:---|:---|
| 每周一 | 团队日历 / Slack | PM 提醒"上周合并未清理的 feat/fix 分支" |
| 每月 1 日 | PM 自动巡检 | `git branch --merged main` 报告 → 派单 doc 清理 |
| 每季度 | arch 评审 | 远程分支批量清理提案 |

## 3. 清理流程（5 步）

### Step 1: 列出可清理分支

```bash
# 在 main 分支上
git checkout main
git pull origin main

# 列出已合并到 main 的本地分支（排除 main、develop、当前活跃分支）
git branch --merged main | grep -vE "^\*? *(main|develop)$"

# 列出已合并的远程分支
git branch --merged main -r | grep -vE "(origin/main|origin/develop|origin/HEAD)$"
```

### Step 2: 打归档 tag（重要分支）

```bash
# 为每个要删除的分支打归档 tag
# 格式：archive/<branch-name-without-prefix>-<date>
git tag archive/<branch-name>-<YYYY-MM-DD> <branch-name>

# 例：归档 feat/risk-app-variable-hub-v1 分支
git tag archive/risk-app-variable-hub-v1-2026-08-10 feat/risk-app-variable-hub-v1
```

**为什么先打 tag**：
- 删除分支后 commit 仍可通过 tag 找到
- tag 永久保留，不受分支清理影响
- 满足"可追溯历史 commit"要求

### Step 3: 删除本地分支

```bash
# 安全删除（Git 会检查是否已合并）
git branch -d <branch-name>

# 强制删除（已确认不需保留）
git branch -D <branch-name>

# 批量删除已合并的 feat/fix/refactor/docs/chore 分支（保留 hotfix/chain/migration 等特殊）
git branch --merged main | grep -E "^\s*(feat|fix|refactor|docs|chore)/" | xargs git branch -d
```

### Step 4: 推送归档 tag

```bash
# 推送所有新创建的 archive/* tag
git push origin --tags

# 或选择性推送
git push origin archive/risk-app-variable-hub-v1-2026-08-10
```

### Step 5: 删除远程分支（观察期 1 个月后）

```bash
# 1 个月后执行远程清理
# 先在 PR 中列出待删分支，团队 review
git push origin --delete <branch-name>

# 例
git push origin --delete feat/risk-app-variable-hub-v1

# 批量删除（已 review 通过）
git branch -r --merged origin/main | grep -vE "(origin/main|origin/develop|origin/HEAD)$" | sed 's/origin\///' | xargs -I {} git push origin --delete {}
```

## 4. 不删除分支（豁免清单）

以下分支**不得清理**，无论合并状态：

| 分支 | 原因 |
|:---|:---|
| `main` | 主分支，永远保留 |
| `develop` | 团队长期开发分支（即使已合并） |
| `gh-pages` | CI 部署专用 |
| 当前活跃开发分支（如 `feat/dmt-exploration-v1.1`） | 即使合并后也保留直到团队确认 |
| 团队明确保留的历史参考分支 | 需 PM + arch 联合声明 |

## 5. 特殊情况处理

### 5.1 分支未合并但内容已通过其他方式合入

场景：分支无 no-ff 合并，但 commit 已 cherry-pick 到 main。

处理：
1. 验证 main 是否已包含所有关键 commit（`git log --oneline <branch>..main`）
2. 如果包含 → 打归档 tag → 删除本地分支
3. 如果未包含 → 作者评估 → cherry-pick → 归档

### 5.2 分支有未完成 work（不想合并）

处理：
1. 不归档，直接保留
2. 标 `WIP` 或加 `wip/` 前缀（虽然 wip/ 不在标准命名内）
3. 或转为 PR 形式（`feat/<app>-<wip-desc>`）走 review

### 5.3 远程分支无法删除（权限不足）

处理：
1. 提 admin 请求
2. 或在 GitHub/Gitee 设置 → Protected branches 调整

## 6. 工具脚本（建议）

PM 边界声明，arch 待评估可加：

```bash
#!/bin/bash
# scripts/cleanup-merged-branches.sh
# 功能：清理已合并到 main 的本地分支（带归档 tag）

set -euo pipefail
TODAY=$(date +%Y-%m-%d)

git checkout main >/dev/null 2>&1 || { echo "❌ 切到 main 失败"; exit 1; }
git pull origin main >/dev/null 2>&1 || { echo "⚠️ pull 失败，继续"; }

BRANCHES=$(git branch --merged main | grep -vE "^\*? *(main|develop)$" | sed 's/^\s*//')

if [ -z "$BRANCHES" ]; then
    echo "✅ 无可清理分支"
    exit 0
fi

echo "📋 待清理分支："
echo "$BRANCHES"
echo ""
read -p "确认清理？[y/N] " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "⏭️ 已取消"
    exit 0
fi

for BRANCH in $BRANCHES; do
    if [[ "$BRANCH" =~ ^(feat|fix|refactor|docs|chore)/ ]]; then
        # 打归档 tag
        TAG_NAME="archive/$(echo $BRANCH | sed 's|^[^/]*/||')-$TODAY"
        git tag "$TAG_NAME" "$BRANCH" 2>/dev/null || echo "⚠️ tag 失败: $TAG_NAME"
        # 删除分支
        git branch -d "$BRANCH" && echo "✅ 删除: $BRANCH"
    fi
done

echo ""
echo "📤 推送归档 tag..."
git push origin --tags
```

## 7. 巡检建议（每周一次）

PM 每周一巡检：

```bash
# 1. 列出可清理分支数
MERGED_COUNT=$(git branch --merged main | grep -vE "^\*? *(main|develop)$" | wc -l)

# 2. 列出长期不活跃分支
STALE=$(git for-each-ref --format='%(refname:short) %(committerdate:relative)' refs/heads \
  | awk '$2 ~ /months? ago/ || ($2 ~ /year/ && $1 !~ /^develop$/)' \
  | head -10)

# 3. 输出报告
echo "本周可清理分支数: $MERGED_COUNT"
echo "长期不活跃分支: $STALE"
```

## 8. 关联文档

- [`docs/BRANCH_NAMING.md`](BRANCH_NAMING.md) — 分支命名规约
- [`docs/BRANCH_RETIREMENT_PLAN.md`](BRANCH_RETIREMENT_PLAN.md) — 历史分支清理建议表
- [`docs/ARCHITECTURE.md` §5](ARCHITECTURE.md) — 分支管理总览
- PM changelog `2026-08-10-pm-branch-cleanup.md` — 本次清理执行记录

## 9. 版本

| 版本 | 日期 | 变更 |
|:---|:---|:---|
| v1.0 | 2026-08-10 | 初版（PM 派单 TASK-20260810-A31C1256 落地） |

---

*数据社区研发团队 2 · 2026-08-10 · v1.0 拍板生效*