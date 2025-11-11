#!/bin/bash

# 预览线连接线升级 - 备份和清理执行脚本
# 使用方法: ./备份和清理执行脚本.sh [backup|cleanup|restore]

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
BACKUP_DIR="backup/preview-line-upgrade-$(date +%Y%m%d_%H%M%S)"
PROJECT_ROOT="$(pwd)"
LOG_FILE="upgrade_log_$(date +%Y%m%d_%H%M%S).log"

# 日志函数
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" | tee -a "$LOG_FILE"
}

# 检查文件是否存在
check_file_exists() {
    if [ ! -f "$1" ]; then
        warn "文件不存在: $1"
        return 1
    fi
    return 0
}

# 检查目录是否存在
check_dir_exists() {
    if [ ! -d "$1" ]; then
        warn "目录不存在: $1"
        return 1
    fi
    return 0
}

# 创建备份目录
create_backup_dir() {
    log "创建备份目录: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$BACKUP_DIR/components"
    mkdir -p "$BACKUP_DIR/tests"
    mkdir -p "$BACKUP_DIR/services"
    mkdir -p "$BACKUP_DIR/utils"
    mkdir -p "$BACKUP_DIR/docs"
}

# 备份核心组件
backup_core_components() {
    log "开始备份核心组件..."
    
    # 预览线系统核心文件
    local core_files=(
        "src/utils/preview-line/PreviewLineSystem.js"
        "src/utils/preview-line/PreviewLineManager.js"
        "src/utils/preview-line/PreviewLineService.js"
        "src/utils/preview-line/PreviewLineRenderer.js"
        "src/utils/preview-line/PreviewLineValidator.js"
        "src/utils/preview-line/PreviewLineConfigManager.js"
        "src/utils/preview-line/usePreviewLine.js"
    )
    
    for file in "${core_files[@]}"; do
        if check_file_exists "$file"; then
            local backup_path="$BACKUP_DIR/components/$(basename "$file" .js).backup.js"
            cp "$file" "$backup_path"
            log "已备份: $file -> $backup_path"
        fi
    done
    
    # 备份整个预览线目录
    if check_dir_exists "src/utils/preview-line"; then
        cp -r "src/utils/preview-line" "$BACKUP_DIR/utils/"
        log "已备份整个预览线目录"
    fi
}

# 备份服务文件
backup_services() {
    log "开始备份服务文件..."
    
    local service_files=(
        "src/services/marketing/PreviewLineService.js"
        "src/pages/marketing/tasks/services/PreviewLineService.js"
        "src/pages/marketing/tasks/utils/coordinate-refactor/sync/EnhancedPreviewLineRefreshManager.js"
        "src/pages/marketing/tasks/utils/coordinate-refactor/sync/PreviewLineIntegrationManager.js"
        "src/pages/marketing/tasks/utils/coordinate-refactor/index.js"
    )
    
    for file in "${service_files[@]}"; do
        if check_file_exists "$file"; then
            local backup_path="$BACKUP_DIR/services/$(basename "$file" .js).backup.js"
            cp "$file" "$backup_path"
            log "已备份: $file -> $backup_path"
        fi
    done
}

# 备份测试文件
backup_tests() {
    log "开始备份测试文件..."
    
    # 备份预览线相关测试目录
    if check_dir_exists "src/tests/preview-line"; then
        cp -r "src/tests/preview-line" "$BACKUP_DIR/tests/"
        log "已备份预览线测试目录"
    fi
    
    # 备份特定测试文件
    local test_files=(
        "src/tests/user-scenario-preview-line.test.js"
        "src/tests/manual-call-node-preview-line.test.js"
        "src/tests/unified-edge-manager-position-sync.test.js"
        "src/tests/TaskFlowCanvas.integration.test.js"
        "src/tests/debug-audience-split.test.js"
        "test-createUnifiedPreviewLine.js"
    )
    
    for file in "${test_files[@]}"; do
        if check_file_exists "$file"; then
            local backup_path="$BACKUP_DIR/tests/$(basename "$file" .js).backup.js"
            cp "$file" "$backup_path"
            log "已备份: $file -> $backup_path"
        fi
    done
}

# 备份主要画布组件
backup_canvas_components() {
    log "开始备份主要画布组件..."
    
    local canvas_files=(
        "src/pages/marketing/tasks/components/TaskFlowCanvas.vue"
        "src/pages/marketing/tasks/components/TaskFlowCanvasRefactored.vue"
        "src/pages/marketing/tasks/components/CanvasDebugPanel.vue"
        "src/pages/marketing/tasks/components/TaskFlowConfigDrawers.vue"
    )
    
    for file in "${canvas_files[@]}"; do
        if check_file_exists "$file"; then
            local backup_path="$BACKUP_DIR/components/$(basename "$file" .vue).backup.vue"
            cp "$file" "$backup_path"
            log "已备份: $file -> $backup_path"
        fi
    done
}

# 备份文档
backup_docs() {
    log "开始备份相关文档..."
    
    local doc_files=(
        "预览线系统修复实施方案.md"
        "PREVIEW_LINE_REFACTOR_PLAN.md"
        "预览线连接线升级可行性评估方案.md"
    )
    
    for file in "${doc_files[@]}"; do
        if check_file_exists "$file"; then
            local backup_path="$BACKUP_DIR/docs/$(basename "$file")"
            cp "$file" "$backup_path"
            log "已备份: $file -> $backup_path"
        fi
    done
}

# 创建备份清单
create_backup_manifest() {
    log "创建备份清单..."
    
    local manifest_file="$BACKUP_DIR/backup_manifest.txt"
    
    cat > "$manifest_file" << EOF
# 预览线连接线升级备份清单
# 备份时间: $(date)
# 备份目录: $BACKUP_DIR

## 核心组件备份
$(find "$BACKUP_DIR/components" -name "*.js" -o -name "*.vue" 2>/dev/null | sort)

## 服务文件备份
$(find "$BACKUP_DIR/services" -name "*.js" 2>/dev/null | sort)

## 测试文件备份
$(find "$BACKUP_DIR/tests" -name "*.js" 2>/dev/null | sort)

## 工具文件备份
$(find "$BACKUP_DIR/utils" -name "*.js" 2>/dev/null | sort)

## 文档备份
$(find "$BACKUP_DIR/docs" -name "*.md" 2>/dev/null | sort)

## 备份统计
总文件数: $(find "$BACKUP_DIR" -type f | wc -l)
总大小: $(du -sh "$BACKUP_DIR" | cut -f1)
EOF
    
    log "备份清单已创建: $manifest_file"
}

# 执行完整备份
execute_backup() {
    log "开始执行完整备份..."
    
    create_backup_dir
    backup_core_components
    backup_services
    backup_tests
    backup_canvas_components
    backup_docs
    create_backup_manifest
    
    log "备份完成! 备份目录: $BACKUP_DIR"
    info "请检查备份清单: $BACKUP_DIR/backup_manifest.txt"
}

# 清理废弃文件
cleanup_deprecated_files() {
    log "开始清理废弃文件..."
    
    # 需要删除的废弃文件
    local deprecated_files=(
        "src/pages/marketing/tasks/utils/coordinate-refactor/sync/EnhancedPreviewLineRefreshManager.js"
        "src/pages/marketing/tasks/utils/coordinate-refactor/sync/PreviewLineIntegrationManager.js"
        "src/pages/marketing/tasks/utils/coordinate-refactor/index.js"
    )
    
    for file in "${deprecated_files[@]}"; do
        if check_file_exists "$file"; then
            rm "$file"
            log "已删除废弃文件: $file"
        fi
    done
    
    # 清理空目录
    find src/pages/marketing/tasks/utils/coordinate-refactor/sync -type d -empty -delete 2>/dev/null || true
    
    log "废弃文件清理完成"
}

# 验证备份完整性
verify_backup() {
    log "验证备份完整性..."
    
    if [ ! -d "$BACKUP_DIR" ]; then
        error "备份目录不存在: $BACKUP_DIR"
        return 1
    fi
    
    local file_count=$(find "$BACKUP_DIR" -type f | wc -l)
    if [ "$file_count" -lt 10 ]; then
        error "备份文件数量过少 ($file_count)，可能备份不完整"
        return 1
    fi
    
    log "备份验证通过，共备份 $file_count 个文件"
    return 0
}

# 恢复备份
restore_backup() {
    local backup_path="$1"
    
    if [ -z "$backup_path" ]; then
        error "请指定备份目录路径"
        return 1
    fi
    
    if [ ! -d "$backup_path" ]; then
        error "备份目录不存在: $backup_path"
        return 1
    fi
    
    log "开始从备份恢复: $backup_path"
    
    # 恢复组件文件
    if [ -d "$backup_path/components" ]; then
        find "$backup_path/components" -name "*.backup.js" | while read -r backup_file; do
            local original_name=$(basename "$backup_file" .backup.js).js
            local target_path="src/utils/preview-line/$original_name"
            
            if [ -f "$backup_file" ]; then
                cp "$backup_file" "$target_path"
                log "已恢复: $backup_file -> $target_path"
            fi
        done
    fi
    
    # 恢复整个预览线目录
    if [ -d "$backup_path/utils/preview-line" ]; then
        rm -rf "src/utils/preview-line"
        cp -r "$backup_path/utils/preview-line" "src/utils/"
        log "已恢复整个预览线目录"
    fi
    
    log "备份恢复完成"
}

# 显示帮助信息
show_help() {
    cat << EOF
预览线连接线升级 - 备份和清理执行脚本

使用方法:
    $0 backup                    # 执行完整备份
    $0 cleanup                   # 清理废弃文件
    $0 restore <backup_path>     # 从指定备份恢复
    $0 verify <backup_path>      # 验证备份完整性
    $0 help                      # 显示此帮助信息

示例:
    $0 backup                                    # 创建备份
    $0 cleanup                                   # 清理废弃文件
    $0 restore backup/preview-line-upgrade-*     # 恢复备份
    $0 verify backup/preview-line-upgrade-*      # 验证备份

注意事项:
    - 备份将创建在 backup/ 目录下，以时间戳命名
    - 清理操作会永久删除废弃文件，请确保已备份
    - 恢复操作会覆盖现有文件，请谨慎使用
    - 所有操作都会记录在日志文件中

EOF
}

# 主函数
main() {
    local command="$1"
    
    case "$command" in
        "backup")
            execute_backup
            ;;
        "cleanup")
            cleanup_deprecated_files
            ;;
        "restore")
            restore_backup "$2"
            ;;
        "verify")
            verify_backup "$2"
            ;;
        "help"|"--help"|"-h"|"")
            show_help
            ;;
        *)
            error "未知命令: $command"
            show_help
            exit 1
            ;;
    esac
}

# 脚本入口
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi