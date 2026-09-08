# [OPEN] dmt-preview-refused

## 背景

- 现象：浏览器控制台出现 10 条错误日志。
- 关键特征：
  - `net::ERR_CONNECTION_REFUSED http://localhost:4174/dmt/`
  - `Failed to fetch dynamically imported module`
  - 受影响模块包括 `metadata`、`variable-management`、`variable-map`

## 当前假设

1. `4174` 端口上的 Vite dev server 已停止，因此浏览器对首页和动态 import 模块的请求全部被拒绝。
2. 页面本身并没有新的业务逻辑报错，`Failed to fetch dynamically imported module` 只是由于 dev server 不可达导致的级联错误。
3. 浏览器仍保留了指向 `4174` 的旧预览会话，但该会话对应的本地服务已被停止。
4. 路由懒加载本身没有问题，只是动态模块 URL 指向了一个当前不可访问的本地地址。
5. 若重新启动 `4174` 或切换到当前存活的预览端口，这 10 条日志会一并消失。

## 计划

1. 先确认 `4174` 端口服务是否确实未运行。
2. 如果未运行，启动一个干净的本地预览并复验日志。
3. 根据结果判断是否需要进一步排查路由或模块加载配置。
