#!/bin/bash
# 团队 2 dev worktree 初始化脚本 v1.0（2026-06-06）
# 基于：~/.openclaw/skills/git-workflow/SKILL.md 第 7 章
# 用途：1 键创建合规 worktree
# 用法：./team2-worktree-init.sh <task-id> <short-desc>

set -e

# 参数校验
if [ $# -ne 2 ]; then
  echo "用法: $0 <task-id> <short-desc>"
  echo "示例: $0 TASK-20260608-E5C18BA3 real-data-query"
  exit 1
fi

TASK_ID="$1"
SHORT_DESC="$2"

# 命名规范校验
if ! echo "$TASK_ID" | grep -qE "^TASK-[0-9]{8}-[A-Z0-9]{6,8}$"; then
  echo "[ERR] task-id 格式错误: $TASK_ID"
  echo "    应为 TASK-YYYYMMDD-XXXXXX"
  exit 1
fi

if ! echo "$SHORT_DESC" | grep -qE "^[a-z0-9-]{1,30}$"; then
  echo "[ERR] short-desc 格式错误: $SHORT_DESC"
  echo "    应为小写 + 短横线 + ≤ 30 字符"
  exit 1
fi

# 主仓路径解析（支持 worktree 内调用 + 主仓根调用）
# 1. 优先用 $DATA_COMMUNITY_ROOT 环境变量
# 2. 否则从 git 仓根推断（worktree 模式下也能跑）
# 3. 最后 fallback 到默认路径
if [ -n "$DATA_COMMUNITY_ROOT" ] && [ -d "$DATA_COMMUNITY_ROOT" ]; then
  MAIN_REPO="$DATA_COMMUNITY_ROOT"
elif git rev-parse --show-toplevel >/dev/null 2>&1; then
  MAIN_REPO="$(git rev-parse --show-toplevel)"
  # worktree 模式下 --show-toplevel 返回 worktree 根，需要跳到主仓
  MAIN_REPO="$(dirname "$MAIN_REPO")/data_community"
else
  MAIN_REPO="/Users/wenbo/Documents/project/data_community"
fi

BRANCH="dev/${TASK_ID}-${SHORT_DESC}"
WT_PATH="../wt-${SHORT_DESC}"

# 检查
if [ ! -d "$MAIN_REPO" ]; then
  echo "[ERR] 主仓不存在: $MAIN_REPO"
  echo "    提示: 在 worktree 内调用时设置 DATA_COMMUNITY_ROOT 环境变量"
  exit 1
fi

cd "$MAIN_REPO"

# 拉最新 main
git checkout main
git pull origin main

# 创建 worktree
if git worktree list | grep -q "$WT_PATH"; then
  echo "[ERR] worktree 已存在: $WT_PATH"
  exit 1
fi

git worktree add "$WT_PATH" -b "$BRANCH"

echo "[OK] worktree 创建成功"
echo "  分支: $BRANCH"
echo "  路径: $MAIN_REPO/$WT_PATH"
echo "  下一步: cd $MAIN_REPO/$WT_PATH && 开发"
echo "  任务跟踪: 完成后在 task 板标记 done，24h 内清理 worktree"
