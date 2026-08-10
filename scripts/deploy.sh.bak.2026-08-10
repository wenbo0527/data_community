#!/usr/bin/env bash
#===============================================================================
# 数字社区统一部署脚本
# 用法: ./deploy.sh <app_name> [--no-chmod]
# 示例: ./deploy.sh risk-app
#       ./deploy.sh dex-app --no-chmod
#===============================================================================
set -euo pipefail

APP="$1"
SKIP_CHMOD=""
[[ "${2:-}" == "--no-chmod" ]] && SKIP_CHMOD=1

REMOTE_DIR="/var/www/html/${APP}"
SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=10"

echo "==> [${APP}] 构建中..."
cd "$(dirname "$0")/../apps/${APP}" && npm run build

echo "==> [${APP}] 部署到 118.196.79.130..."
rsync -av \
  --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist/assets/*.map' \
  --chmod=Da+rX,Dar+wX \
  dist/ root@118.196.79.130:${REMOTE_DIR}/

if [[ -z "${SKIP_CHMOD:-}" ]]; then
  echo "==> [${APP}] 修复权限..."
  ssh ${SSH_OPTS} root@118.196.79.130 "
    chown -R www-data:www-data ${REMOTE_DIR}
    chmod -R a+rX ${REMOTE_DIR}/ 2>/dev/null || true
    echo 'done'
  "
else
  echo "==> [${APP}] 跳过权限修复（--no-chmod）"
fi

echo "==> [${APP}] 部署完成 ✅"
