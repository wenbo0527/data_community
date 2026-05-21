#!/bin/bash
# 文件完整性验证脚本
# 用途：对比源目录和目标目录的文件数量

set -e

echo "========================================="
echo "   文件完整性验证脚本"
echo "========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
PROJECT_DIR="/Users/wenbo/Documents/project/data_community"

# 各子应用配置
declare -A APPS=(
    ["mkt-app"]="src/pages/marketing:src/pages/discovery:apps/mkt-app/src/pages"
    ["admin-app"]="src/pages/management:apps/admin-app/src/pages"
    ["asset-app"]="src/pages/asset-management:src/pages/listing-management:apps/asset-app/src/pages"
    ["dex-app"]="src/pages/exploration:src/pages/data-analysis:apps/dex-app/src/pages"
    ["dmt-app"]="src/pages/metadata:src/pages/data-standard:src/pages/business-concept:apps/dmt-app/src/pages"
)

verify_app() {
    local app_name=$1
    local source_paths=$2
    local target_path=$3
    
    echo -e "\n${YELLOW}验证 $app_name...${NC}"
    
    # 统计源文件数量
    source_count=0
    IFS=':' read -ra SOURCES <<< "$source_paths"
    for src in "${SOURCES[@]}"; do
        if [ -d "$PROJECT_DIR/$src" ]; then
            count=$(find "$PROJECT_DIR/$src" -type f \( -name "*.vue" -o -name "*.ts" -o -name "*.js" \) 2>/dev/null | wc -l)
            source_count=$((source_count + count))
        fi
    done
    
    # 统计目标文件数量
    if [ -d "$PROJECT_DIR/$target_path" ]; then
        target_count=$(find "$PROJECT_DIR/$target_path" -type f \( -name "*.vue" -o -name "*.ts" -o -name "*.js" \) 2>/dev/null | wc -l)
    else
        target_count=0
    fi
    
    echo "  源文件数量: $source_count"
    echo "  目标文件数量: $target_count"
    
    if [ "$source_count" -eq "$target_count" ]; then
        echo -e "  ${GREEN}✅ 文件数量一致${NC}"
        return 0
    else
        diff=$((source_count - target_count))
        echo -e "  ${RED}❌ 文件数量不一致 (差异: $diff)${NC}"
        return 1
    fi
}

# 主流程
echo "开始验证..."
echo "项目目录: $PROJECT_DIR"

all_passed=true

for app in "${!APPS[@]}"; do
    IFS=':' read -ra CONFIG <<< "${APPS[$app]}"
    source_paths="${CONFIG[0]}:${CONFIG[1]}"
    target_path="${CONFIG[2]}"
    
    if ! verify_app "$app" "$source_paths" "$target_path"; then
        all_passed=false
    fi
done

echo -e "\n========================================="
if [ "$all_passed" = true ]; then
    echo -e "${GREEN}✅ 所有应用文件完整性验证通过${NC}"
    exit 0
else
    echo -e "${RED}❌ 部分应用验证失败${NC}"
    exit 1
fi