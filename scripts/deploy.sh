#!/bin/bash
# deploy.sh - 部署应用到远程服务器，自动修复权限问题
# 用法: ./deploy.sh <app-name>
# 示例: ./deploy.sh risk-app

set -e

if [ -z "$1" ]; then
  echo "用法: ./deploy.sh <app-name>"
  echo "示例: ./deploy.sh risk-app"
  echo "支持的子应用:"
  echo "  子应用: risk-app, mkt-app, dex-app, dfd-app, admin-app, dmt-app"
  echo "  主应用: portal-shell"
  exit 1
fi

APP_NAME="$1"
REMOTE_HOST="118.196.79.130"
REMOTE_USER="root"
REMOTE_BASE="/var/www/html"

# 使用 case 映射 app -> 远程目录 + 本地路径
case "$APP_NAME" in
  risk-app)
    LOCAL_DIR="/Users/wenbo/Documents/project/data_community/apps/risk-app/dist"
    TARGET_DIR="${REMOTE_BASE}/risk"
    ;;
  portal-shell)
    LOCAL_DIR="/Users/wenbo/Documents/project/portal-shell/dist"
    TARGET_DIR="${REMOTE_BASE}/portal-shell"
    ;;
  mkt-app)
    LOCAL_DIR="/Users/wenbo/Documents/project/data_community/apps/mkt-app/dist"
    TARGET_DIR="${REMOTE_BASE}/mkt"
    ;;
  dex-app)
    LOCAL_DIR="/Users/wenbo/Documents/project/data_community/apps/dex-app/dist"
    TARGET_DIR="${REMOTE_BASE}/dex"
    ;;
  dfd-app)
    LOCAL_DIR="/Users/wenbo/Documents/project/data_community/apps/dfd-app/dist"
    TARGET_DIR="${REMOTE_BASE}/dfd"
    ;;
  admin-app)
    LOCAL_DIR="/Users/wenbo/Documents/project/data_community/apps/admin-app/dist"
    TARGET_DIR="${REMOTE_BASE}/admin"
    ;;
  dmt-app)
    LOCAL_DIR="/Users/wenbo/Documents/project/data_community/apps/dmt-app/dist"
    TARGET_DIR="${REMOTE_BASE}/dmt"
    ;;
  *)
    echo "错误: 未知的应用 '$APP_NAME'"
    echo "支持的子应用: risk-app, mkt-app, dex-app, dfd-app, admin-app, dmt-app"
    echo "支持的主应用: portal-shell"
    exit 1
    ;;
esac

echo "========================================="
echo "开始部署 $APP_NAME -> $TARGET_DIR"
echo "========================================="

# 检查本地 dist 是否存在
if [ ! -d "$LOCAL_DIR" ]; then
  echo "错误: $LOCAL_DIR 不存在"
  echo "请先运行 npm run build"
  exit 1
fi

echo "[1/3] 同步文件到远程服务器..."
rsync -avz --delete \
  "$LOCAL_DIR/" \
  "$REMOTE_USER@$REMOTE_HOST:$TARGET_DIR/"

echo "[2/3] 修复文件所有权为 www-data..."
ssh "$REMOTE_USER@$REMOTE_HOST" "chown -R www-data:www-data $TARGET_DIR"

echo "[3/3] 修复目录权限..."
ssh "$REMOTE_USER@$REMOTE_HOST" "find $TARGET_DIR -type d -exec chmod 755 {} \; -type f -exec chmod 644 {} \;"

echo ""
echo "✅ 部署完成: $APP_NAME -> $TARGET_DIR"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"