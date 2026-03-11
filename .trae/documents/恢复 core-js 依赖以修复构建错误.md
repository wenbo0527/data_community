# 解决 Vercel 构建时 `core-js` 依赖缺失问题

## 问题分析
Vercel 构建报错 `Rollup failed to resolve import "core-js/stable" from "/vercel/path0/src/main.js"`。
经检查确认：
1.  **代码引用**：`src/main.js` 文件中显式包含了 `import 'core-js/stable'`。
2.  **依赖缺失**：`package.json` 中缺少 `core-js` 依赖（之前修复 lockfile 时可能被意外移除，或者一直缺失但之前未触发构建错误）。

## 解决方案
既然代码中显式引用了 `core-js` 以确保环境兼容性（Polyfill），最正确的修复方式是**恢复该依赖**。

## 执行步骤
1.  **安装依赖**：在 `package.json` 中重新添加 `core-js`（使用稳定版本 `^3.x`）。
2.  **提交变更**：将更新后的 `package.json` 和 `pnpm-lock.yaml` 提交并推送到远程仓库。
3.  **触发部署**：推送操作将自动触发 Vercel 的新一轮构建。
