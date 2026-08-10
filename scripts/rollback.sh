#!/usr/bin/env bash
#===============================================================================
# 数字社区回滚脚本（手动选择上一个版本切换符号链接）
# 用法: ./rollback.sh <nginx_path> [version_hash]
# 示例: ./rollback.sh mkt              # 列出可用版本
#       ./rollback.sh mkt abc1234       # 回滚到 abc1234 版本
#
# 工作原理:
#   - 每个 nginx_path 在远程有独立版本目录：${NGINX_PATH}-${VERSION}
#   - 当前"目录" ${NGINX_PATH} 是符号链接，指向最新版本
#   - 回滚 = 重新创建符号链接指向指定版本
#   - 健康检查必跑，确保回滚后服务正常
#===============================================================================
set -euo pipefail

NGINX_PATH="${1:-}"
VERSION="${2:-}"
REMOTE_BASE="/var/www/html"
REMOTE_DIR="${REMOTE_BASE}/${NGINX_PATH}"
REMOTE_HOST="118.196.79.130"
SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=10"

if [[ -z "$NGINX_PATH" ]]; then
  echo "用法: $0 <nginx_path> [version_hash]"
  echo "示例:"
  echo "    $0 mkt              # 列出可用版本"
  echo "    $0 mkt abc1234      # 回滚到 abc1234"
  exit 1
fi

# 列出可用版本
list_versions() {
  echo "==> [${NGINX_PATH}] 可用版本（按时间倒序）："
  echo ""
  ssh ${SSH_OPTS} root@${REMOTE_HOST} "
    ls -dt ${REMOTE_BASE}/${NGINX_PATH}-* 2>/dev/null | while read dir; do
      if [[ -L \"\$dir\" ]]; then continue; fi
      if [[ \"\$dir\" == *\"-legacy-\"* ]]; then
        echo \"  [LEGACY] \$(basename \$dir) | \$(stat -c %y \$dir 2>/dev/null | cut -d. -f1)\"
      else
        ver=\$(basename \$dir | sed 's/^${NGINX_PATH}-//')
        current=\$(readlink ${REMOTE_DIR} 2>/dev/null | xargs -I {} basename {})
        marker='  '
        if [[ \"\$ver\" == \"\$current\" ]]; then
          marker='→ '
        fi
        echo \"\${marker}\${ver} | \$(stat -c %y \$dir 2>/dev/null | cut -d. -f1)\"
      fi
    done
  "
  echo ""
  echo "→ 标记当前版本"
  echo "[LEGACY] 标记历史首次部署迁移"
  echo ""
  echo "用法: $0 ${NGINX_PATH} <version_hash>"
}

if [[ -z "$VERSION" ]]; then
  list_versions
  exit 0
fi

REMOTE_VERSION_DIR="${REMOTE_BASE}/${NGINX_PATH}-${VERSION}"

echo "==> [${NGINX_PATH}@${VERSION}] 回滚检查..."

# 验证版本目录存在
ssh ${SSH_OPTS} root@${REMOTE_HOST} "
  if [[ ! -d ${REMOTE_VERSION_DIR} ]]; then
    echo '❌ 版本目录不存在: ${REMOTE_VERSION_DIR}'
    echo '提示: 运行 $0 ${NGINX_PATH} 查看可用版本'
    exit 1
  fi
"

# 确认操作
current=$(ssh ${SSH_OPTS} root@${REMOTE_HOST} "readlink ${REMOTE_DIR} 2>/dev/null" || echo "(无)")
echo "    当前版本: ${current}"
echo "    回滚到:   ${REMOTE_VERSION_DIR}"
echo ""
read -p "确认回滚？[y/N] " confirm
if [[ "${confirm}" != "y" && "${confirm}" != "Y" ]]; then
  echo "已取消"
  exit 0
fi

echo "==> [${NGINX_PATH}@${VERSION}] 切换符号链接..."
ssh ${SSH_OPTS} root@${REMOTE_HOST} "ln -sfn ${REMOTE_VERSION_DIR} ${REMOTE_DIR}"

echo "==> [${NGINX_PATH}@${VERSION}] 健康检查..."
sleep 2
http=$(curl -sk -o /dev/null -w '%{http_code}' "https://${REMOTE_HOST}:8443/${NGINX_PATH}/")
echo "    HTTP: ${http}"

if [[ "${http}" != "200" ]]; then
  echo "❌ 回滚后健康检查失败！可能需要手动恢复..."
  exit 1
fi

echo ""
echo "==> [${NGINX_PATH}@${VERSION}] ✅ 回滚完成"
echo "    符号链接: ${REMOTE_DIR} -> ${REMOTE_VERSION_DIR}"
echo "    健康检查: HTTP ${http}"