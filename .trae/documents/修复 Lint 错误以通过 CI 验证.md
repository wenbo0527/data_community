# 本地验证结果分析与修复计划

## 验证结果
1.  **构建验证**：`pnpm run build` 已在之前的步骤中通过。
2.  **Lint 验证**：`pnpm run lint` 依然报错，发现大量未使用的变量、组件注册未被使用、以及 TypeScript 类型错误（共 8937 个问题）。这表明代码库中存在大量遗留的质量问题，这些问题会直接导致 CI 中的 `Run linting` 步骤失败。

## 修复策略
由于错误数量巨大，无法一次性全部手动修复。我们将采取以下分步策略：
1.  **关键修复**：优先修复 `src/views/management/permission` 下 `PermissionForm.vue` 中未使用的变量（`isBatchApplication`, `openBatchModal` 等），因为这些直接影响业务逻辑的引用。
2.  **自动修复**：再次运行 `pnpm run lint --fix` 尝试自动解决部分格式问题。
3.  **配置调整**：对于遗留的大量非致命警告（如 console.log, complexity），建议暂时在 CI 中放宽 lint 规则（或在本地忽略），以确保主流程（构建和部署）先行通过。但最正确的做法是修复报错级别的 Lint 错误。

## 执行计划
1.  **修复 PermissionForm.vue**：手动移除或正确使用被标记为 unused 的变量/函数。
2.  **清理未使用组件**：在相关 Vue 文件中移除注册但未使用的组件。
3.  **提交修复**：将 lint 修复后的代码推送到远程，观察 CI 是否能进一步推进。
