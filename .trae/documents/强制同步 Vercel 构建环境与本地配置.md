# 解决 Vercel 部署 pnpm-lock.yaml 版本不一致问题

## 问题分析
根据 Vercel 报错日志 `lockfile: ^2.18.1` 与本地文件实际内容 `^1.35.0` 的对比，确认 **Vercel 构建环境正在使用的 pnpm-lock.yaml 文件是旧版本的**。这通常是因为：
1.  Vercel 构建的是旧的 Commit（部署了尚未包含修复补丁的 commit）。
2.  或者 Vercel 正在使用 pnpm v10 尝试读取 v9 格式的 lockfile，虽然兼容但可能存在解析差异。

## 解决方案
我们将采取“强制一致性”策略：
1.  **锁定包管理器版本**：在 `package.json` 中显式添加 `"packageManager": "pnpm@9.x"`，强制 Vercel 使用 pnpm 9，与当前的 lockfile 格式完全匹配，避免 pnpm 10 的潜在升级行为。
2.  **触发新部署**：通过提交上述更改，强制生成一个新的 Commit。这将迫使 Vercel 重新拉取最新代码，确保它获取到正确的 `pnpm-lock.yaml`。

## 执行步骤
1.  修改 `package.json`，添加 `packageManager` 字段。
2.  提交更改并推送到 GitHub/Gitee 的 `main` 和开发分支。
3.  通知您在 Vercel 上检查最新的 Deployment（确保构建的是最新提交）。
