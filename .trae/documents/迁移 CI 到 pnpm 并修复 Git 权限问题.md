# 修复 GitHub Actions 报错 (Git 128 错误 & 依赖管理不匹配)

## 问题分析
根据 GitHub Actions 的报错日志（`Process completed with exit code 1` 和 `The process '/usr/bin/git' failed with exit code 128`）以及对 `ci.yml` 的审查，主要存在两个核心问题：

1.  **Git 权限问题 (Exit Code 128)**：
    - 在 GitHub Actions 容器中，当脚本（如 `husky` 或某些依赖检查脚本）尝试运行 git 命令时，由于目录所有权问题（actions checkout 的所有者可能与运行用户不一致），Git 会因为安全策略拒绝执行操作。
    - **解决方案**：需要添加 `git config --global --add safe.directory *` 来信任工作目录。

2.  **包管理器不匹配**：
    - 项目已经迁移为 **pnpm workspace**（存在 `pnpm-workspace.yaml` 和 `pnpm-lock.yaml`）。
    - 但 `ci.yml` 中仍然大量使用 `npm ci` 和 `npm run ...`。这会导致依赖安装失败（因为没有 `package-lock.json`）或者无法正确解析 workspace 依赖。
    - **解决方案**：将 CI 流程完全迁移到 `pnpm`。

## 执行计划
1.  **修改 `.github/workflows/ci.yml`**：
    - 引入 `pnpm/action-setup` 来配置 pnpm 环境。
    - 替换所有 `npm ci` 为 `pnpm install --frozen-lockfile`。
    - 替换所有 `npm run ...` 为 `pnpm run ...`。
    - 在 `checkout` 步骤后添加 Git 安全目录配置。
2.  **提交并推送**：将更新后的 CI 配置文件推送到远程，触发新一轮的 Actions 验证。
