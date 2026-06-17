#!/bin/bash
# 团队 2 dev worktree 巡检脚本 v1.0（2026-06-06）
# 用途：每日 9:30 检查 worktree 数量，> 3 告警
# 触发：launchd (com.openclaw.zhongli.worktree-monitor) 每天 9:30
# 输出：log 到 /tmp/worktree-monitor.log + 异常时发飞书通知

set -e

MAIN_REPO="/Users/wenbo/Documents/project/data_community"
LOG_FILE="/tmp/worktree-monitor.log"
THRESHOLD=3
NOTIFY_TARGET="user:ou_5550e21f10a7585629e3564ca10a3446"  # 钟离飞书

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# 主仓存在性检查
if [ ! -d "$MAIN_REPO" ]; then
  log "[ERR] 主仓不存在: $MAIN_REPO"
  exit 1
fi

cd "$MAIN_REPO"

# worktree 列表
WORKTREE_OUTPUT=$(git worktree list 2>&1)
WORKTREE_COUNT=$(echo "$WORKTREE_OUTPUT" | wc -l | tr -d ' ')

log "INFO worktree 总数: $WORKTREE_COUNT"

# 阈值检查
if [ "$WORKTREE_COUNT" -gt "$THRESHOLD" ]; then
  log "[WARN] worktree 数量 $WORKTREE_COUNT 超过阈值 $THRESHOLD"
  log "详细信息:"
  echo "$WORKTREE_OUTPUT" | tee -a "$LOG_FILE"

  # 飞书通知（通过 openclaw 内部命令，避免依赖外部工具）
  ALERT_MSG="⚠️ [worktree 巡检] 主仓 worktree 数量 $WORKTREE_COUNT > $THRESHOLD
详情：
$WORKTREE_OUTPUT

请 dev 24h 内清理已合并的 worktree（按 SDD §7.2 生命周期）"

  log "通知内容: $ALERT_MSG"
  # 写入通知队列文件，由钟离 agent 拉取
  echo "$ALERT_MSG" >> /tmp/zhongli-notify-queue.txt
  log "通知已入队 /tmp/zhongli-notify-queue.txt"
else
  log "OK worktree 数量 $WORKTREE_COUNT 在阈值内"
fi

# 24h 未清理告警（可选增强：检查 merge 状态）
# TODO: git worktree list 输出含分支名，可与 git branch --merged main 对比
#       找到已合并但 worktree 还在的 → 单独告警
# 实现优先级：6/13 复盘后再加

exit 0
