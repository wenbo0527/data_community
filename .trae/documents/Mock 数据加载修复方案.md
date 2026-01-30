# Mock 数据修复与自动化验证方案

为了确保彻底解决 Mock 数据加载问题并提供客观验证，我将执行以下方案：

## 1. 修复：解除 Mock 文件依赖
**目标**：消除因路径别名 (`@/`) 解析失败导致 Mock 文件被忽略的隐患。
*   **操作**：将 `supplierProducts.ts` 中的核心数据直接内联写入 `src/mock/external-data-evaluation.ts`。
*   **结果**：Mock 文件将变为零依赖的独立文件，确保 `vite-plugin-mock` 能 100% 正确加载。

## 2. 验证：自动化接口测试
**目标**：在交付前，通过脚本自动验证 API 链路是否打通。
*   **操作**：执行 `curl` 命令直接请求本地开发服务器接口。
    ```bash
    curl -s http://localhost:5176/api/external-data-evaluation/products | grep "学信网"
    ```
*   **判断标准**：
    *   ✅ **通过**：返回 JSON 数据且包含 "学信网" 关键字。
    *   ❌ **失败**：返回 HTML 代码（SPA Fallback）或 Connection Refused。

## 执行顺序
1.  实施代码重构（内联数据）。
2.  等待开发服务器热更新。
3.  运行验证命令，确认 Mock 接口响应正常。
4.  交付修复结果。