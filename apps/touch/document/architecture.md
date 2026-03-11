# 触达管理独立应用架构方案

## 整体架构设计（apps/touch 子应用）
- 技术栈：Vue 3（Composition API）+ Vite + Vue Router + Pinia + Arco Design
- 结构特征：
  - 路由懒加载与布局容器：[router.ts](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/router.ts)、[TouchLayout.vue](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/components/layout/TouchLayout.vue)
  - 服务层纯 Mock 化：统一位于 `src/services`，数据来自 [touch.ts](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/mock/touch.ts)
  - 类型模型集中管理：[types/index.ts](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/types/index.ts)
  - 跨页状态：Pinia 用户态与权限控制：[store/user.ts](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/store/user.ts)
  - 页面组织：`src/pages/touch/<模块>/<功能>.vue`，根入口与壳：[main.ts](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/main.ts)、[Root.vue](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/Root.vue)
- 数据流动：页面 → 服务层（Mock）→ 组件展示与交互 →（必要时）Pinia 状态记录
- 约束声明：不接入后端，所有数据使用 Mock；服务方法保证 Promise 返回，便于后续平滑替换为真实接口

## 一级菜单与页面
- 触达首页
  - 页面：[index.vue](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/pages/touch/index.vue)
  
- 系统管理
  - 页面：[system/index.vue](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/pages/touch/system/index.vue)
  - 字典管理：已实现（页面与路由）

- 策略管理
  - 策略模板：[policy/template/index.vue](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/pages/touch/policy/template/index.vue)
  - 数据概览：已实现（页面与路由）
  - 模板创建：宿主页面存在 [policy/template/create.vue](file:///Users/mac/nis_mock/data_comunity/data_comunity/src/pages/touch/policy/template/create.vue)，独立应用未注册路由

- 渠道管理
  - 黑名单管理：[channel/blacklist.vue](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/pages/touch/channel/blacklist.vue)
  - 人工外呼模板：已实现（页面与路由）
  - 短信模板：已实现（页面与路由）
  - AI外呼模板：已实现（页面与路由）
  - 预警管理：已实现（页面与路由）
  - 全局频控：已实现（页面与路由）
  - 供应商管理：已实现（页面与路由）
    - AI供应商：已实现（页面与路由）
    - 短信供应商：已实现（页面与路由）
  - 渠道总览（宿主占位）：[channel/index.vue](file:///Users/mac/nis_mock/data_comunity/data_comunity/src/pages/touch/channel/index.vue)
  - Mock 数据（黑名单、已解禁、渠道列表）：[touch.ts](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/mock/touch.ts)

- 触达查询
  - 总览入口：[query/index.vue](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/pages/touch/query/index.vue)
  - 触达查询明细：已实现（页面与路由）
  - 短信发送记录：已实现（页面与路由）
  - AI外呼记录：已实现（页面与路由）
  - AI厂商短信记录：已实现（页面与路由）
  - 人工外呼记录：已实现（页面与路由）
  - 人工厂商短信记录：已实现（页面与路由）
  - 营销记录查询：已实现（页面与路由）
  - 营销记录列表：已实现（页面与路由）

- 其他已实现页面
  - 手工短信列表（任务批次维度）：[manual-sms/list.vue](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/pages/touch/manual-sms/list.vue)
  - 手工短信新建（任务创建/执行）：[manual-sms/index.vue](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/pages/touch/manual-sms/index.vue)

## 路由结构
- 路由入口：[router.ts](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/router.ts)
- 已实现路由
  - /touch → 首页（任务明细总览）
  - /touch/system → 系统管理
  - /touch/system/dictionary → 字典管理
  - /touch/policy/template → 策略模板列表
  - /touch/policy/overview → 策略数据概览
  - /touch/channel/blacklist → 渠道黑名单
  - /touch/channel/manual-call-template → 人工外呼模板
  - /touch/channel/sms-template → 短信模板
  - /touch/channel/ai-call-template → AI外呼模板
  - /touch/channel/alert → 预警管理
  - /touch/channel/rate-limit → 全局频控
  - /touch/channel/vendors → 供应商管理
    - /touch/channel/vendors/ai → AI供应商
    - /touch/channel/vendors/sms → 短信供应商
  - /touch/manual-sms → 新建手工短信
  - /touch/manual-sms/list → 手工短信列表
  - /touch/query → 触达查询
  - /touch/query/detail → 触达查询明细
  - /touch/query/sms-records → 短信发送记录
  - /touch/query/ai-call-records → AI外呼记录
  - /touch/query/ai-sms-vendor-records → AI厂商短信记录
  - /touch/query/manual-call-records → 人工外呼记录
  - /touch/query/manual-sms-vendor-records → 人工厂商短信记录
  - /touch/query/marketing-search → 营销记录查询
  - /touch/query/marketing-list → 营销记录列表
- 宿主桥接：访问 /touch 及子路径重定向至独立应用（保留子路径与查询参数），修改位置：[index.js](file:///Users/mac/nis_mock/data_comunity/data_comunity/src/router/index.js#L165-L217)

## 目录与布局
- 目录建议
  - src/components、src/pages/touch/{index,manual-sms,policy,channel,system,query}、src/services、src/store、src/mock、src/types
- 通用布局（面包屑与内容容器）：[TouchLayout.vue](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/components/layout/TouchLayout.vue)
- 应用入口与页面壳
  - 入口：[main.ts](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/main.ts)、[index.html](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/index.html)
  - 根组件：[Root.vue](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/Root.vue)

## 状态管理与数据模型
- 已采用 Pinia 管理跨页状态（用户态、权限等）；业务页以组件局部状态为主，跨模块字典/配额后续纳入 Pinia
- 类型模型（建议）
  - TaskBatch：id、batchName、templateId、recipientCount、creator、createTime、status
  - Template：id、messageType、scene、tags、title、strategy、content
  - BlacklistItem：username、phone、idCard、addTime、banTime、policy、source
  - Channel：id、name、status、quota、used
  - QueryParams：maId、taskId、executeDate、channel、status、dateRange

## 服务层设计（纯 Mock 实现）
- 统一放置于 `src/services`，所有方法直接返回 Mock 或内联生成数据，保持 Promise 接口与类型安全
- 模块与方法（当前实现）：
  - TaskService：[taskService.ts](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/services/taskService.ts)
    - listBatches()：返回批次列表（静态示例数据）
    - createManualSms(payload)：返回随机 id
    - copyBatch(id)：返回复制后的 id
    - scheduleBatch(id, sendTime)：返回布尔成功
  - TemplateService：[templateService.ts](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/services/templateService.ts)
    - listTemplates()：生成模板列表
    - createTemplate(payload)：返回随机模板 id
    - updateTemplate(id, payload)：返回布尔成功
    - renderTemplate(content, params)：简单参数渲染
  - ChannelService：[channelService.ts](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/services/channelService.ts)
    - getChannels()：读取 Mock 渠道列表
    - getBlacklist()：读取 Mock 黑名单列表
    - unban(record)、importBlacklist(file)：返回布尔成功
  - SystemService：[systemService.ts](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/services/systemService.ts)
    - getGlobalConfig()：返回签名、配额、审批等配置
  - QueryService：[queryService.ts](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/services/queryService.ts)
    - searchTouches(params)：返回空数组（待扩展为 Mock 数据）
    - exportTouches(params)：返回空 Blob（占位）
- Mock 数据位置与结构：[touch.ts](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/mock/touch.ts)
  - 含 `blacklist`、`unbanned`、`channels` 三类示例数据

## 交互规范（Arco Design）
- 列表页
  - 顶部搜索区（inline 表单）
  - 表格（分页、操作列、必要的掩码显示）
  - 右上角操作（新增/筛选/重置/导出）
- 创建页
  - 分段卡片：基本信息、接收人、模板选择、预览与测试
  - 底部固定操作条：测试发送、确认下发
- 渠道黑名单
  - 双 Tab：黑名单库 / 解禁库
  - 列内掩码显示与小按钮操作（解禁）
  - 新建与批量导入入口置于右上角

## 错误处理与 Loading
- 组件内统一使用 Arco 的 Message/Spin/Result 组件进行错误与加载态提示
- 服务层方法以 try/catch 包裹调用，异常落地为用户可读的错误消息
- 列表页统一支持：空态、分页错误回退、查询条件重置

## 性能优化策略
- 路由级懒加载已启用（见 [router.ts](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/router.ts) 动态 import）
- 表格与列表按需渲染；必要时使用分页与（Mock）过滤
- 静态资源与组件拆分：将重组件拆分为子组件，减少重渲染

## 权限与路由守卫
- 独立应用内部路由守卫（beforeEach）：见 [router.ts](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/router.ts#L74-L80)
  - 校验登录态（`useUserStore().loggedIn`），未登录时回到首页
  - 预留基于角色/资源的权限校验（`roles` 字段）
  - 记录未授权访问并提示（组件内统一使用 Message 提示）

## 接口与环境（纯前端）
- 当前阶段不接入后端，仅使用 Mock 数据；无需 .env 切换 API 基址
- 统一拦截器暂不启用；如未来接入接口，再抽象鉴权、错误码与重试策略
- Mock 数据位置：[touch.ts](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/mock/touch.ts)

## 演进计划
- 系统管理模块补齐：签名/模板库、渠道配额与限流、参数字典与归属部门、任务审核流
- 触达查询完善：任务批次/客户标识/渠道/时间维度复合查询与导出
- 引入 Pinia 与类型模型，统一状态与类型
- 真接口接入与错误处理、空态与 Loading 统一
- 微前端集成：从 window.location 跳转演进为 iframe 或微前端（以及 postMessage/URL 参数协议）

## 启动与桥接
- 独立应用启动
  - 进入目录并启动：apps/touch
  - 本地地址：http://localhost:5181/touch
- 宿主桥接
  - /touch 访问将跳转至独立应用（保持子路径与查询参数）
  - 修改位置：[index.js](file:///Users/mac/nis_mock/data_comunity/data_comunity/src/router/index.js#L165-L217)

## 对齐 horizontal-canvas 的方式
- 独立工程结构、独立 vite.config、入口与路由、自行注册 UI 框架
- 宿主路由使用 beforeEnter 重定向保留查询参数，模式与横版画布一致：[marketing.js](file:///Users/mac/nis_mock/data_comunity/data_comunity/src/router/marketing.js#L146-L179)
