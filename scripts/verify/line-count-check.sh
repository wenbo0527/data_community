#!/bin/bash
# 代码行数对比验证脚本
# 用途：对比源目录和目标目录的代码行数

set -e

echo "========================================="
echo "   代码行数对比验证脚本"
echo "========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 配置
PROJECT_DIR="/Users/wenbo/Documents/project/data_community"

count_lines() {
    local dir=$1
    if [ -d "$PROJECT_DIR/$dir" ]; then
        find "$PROJECT_DIR/$dir" -type f \( -name "*.vue" -o -name "*.ts" -o -name "*.js" \) -exec cat {} \; 2>/dev/null | wc -l
    else
        echo "0"
    fi
}

echo "========================================="
echo "验证完成，可使用 file-count-check.sh 进行完整验证"
echo "========================================="