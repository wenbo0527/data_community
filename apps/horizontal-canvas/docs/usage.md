# 使用文档

## 路由与参数
- `/tasks`：任务列表页
- `/editor`：画布编辑页，参数：
  - `mode`：`create|edit|view`
  - `id`：任务 ID
  - `version`：版本号

## 任务数据结构
```json
{
  "id": "1763619686212",
  "version": 2,
  "status": "draft|published",
  "canvasData": {
    "nodes": [ { "id": "start", "type": "start", "x": 120, "y": 120, "label": "开始", "config": {} } ],
    "connections": [ { "source": "start", "target": "sms-1" } ]
  }
}
```

## 独立/嵌入模式
- 独立运行：
  - 列表读写 `src/utils/taskStorage.js`
  - 新建后跳转 `/editor?mode=edit&id=...`
- iframe 嵌入：
  - 宿主 ↔ 子应用消息：
    - 列表：`query-tasks/query-stats/create-task/delete-task/publish-task/unpublish-task`
    - 画布：`init/ready/save`

## 画布功能
- 工具栏：缩放/复位/居中/快速布局/添加节点/调试/统计/小地图/撤销重做
- 历史：基于 X6 History 插件，快捷键 `Ctrl/Cmd+Z/Y`
- 节点配置抽屉：统一事件 `config-confirm/config-cancel/visibility-change`
- 边交互：中点插入按钮、右键菜单

## 故障排查（3 条日志）
- 症状：点击“新建任务”路由跳转时抛出 `SyntaxError: The requested module '/src/pages/marketing/tasks/horizontal/styles/nodeStyles.js' does not provide an export named 'getBaseNodeStyles'`
- 原因：`apps` 内的 `styles/nodeStyles.js` 未导出 `getBaseNodeStyles`（原版有该导出），导致页面模块解析失败，导航被 `vue-router` 捕获为未处理错误
- 修复：在 `apps/horizontal-canvas/src/pages/marketing/tasks/horizontal/styles/nodeStyles.js` 补齐导出：`getBaseNodeStyles/getInteractionStyles/getPortStyles`（与原版一致），并在文件中添加注释标记修复
- 验证：刷新后再次点击“新建任务”，应正常进入画布页，控制台不再出现上述错误；同时确认工具栏与节点渲染正常

## 开发扩展
- 预览线系统：在 `src/composables/canvas/usePreviewLine.js` 绑定端口拖拽事件（创建/吸附/转换/清理）
- 性能优化：空间索引/批量处理/缓存开关在预览线模块中统一管理
