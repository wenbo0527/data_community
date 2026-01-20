# 触达管理独立应用架构方案

## 模块与功能对应
### 任务明细
- 触达首页（概览与任务明细）：[index.vue](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/pages/touch/index.vue)
- 手工短信列表（任务批次维度）：[manual-sms/list.vue](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/pages/touch/manual-sms/list.vue)
- 手工短信新建（任务创建/执行）：[manual-sms/index.vue](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/pages/touch/manual-sms/index.vue)

### 系统管理
- 当前宿主存在系统目录页占位（建议迁移并扩展为：渠道配额与限流、短信签名/模板库、任务参数规范、审核流配置等）：[system/index.vue](file:///Users/mac/nis_mock/data_comunity/data_comunity/src/pages/touch/system/index.vue)
- 独立应用建议新增路由 /touch/system 及页面骨架，后续补齐

### 策略管理
- 策略模板列表（含新建弹窗）：[policy/template/index.vue](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/pages/touch/policy/template/index.vue)
- 宿主存在模板新建页面（可按需迁移细化策略设计）：[create.vue](file:///Users/mac/nis_mock/data_comunity/data_comunity/src/pages/touch/policy/template/create.vue)

### 渠道管理
- 渠道黑名单（查询、重置、解禁）：[channel/blacklist.vue](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/pages/touch/channel/blacklist.vue)
- Mock 数据（黑名单、已解禁、渠道列表）：[touch.ts](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/mock/touch.ts)

### 触达查询
- 查询入口页（占位）：[query/index.vue](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/pages/touch/query/index.vue)

## 路由结构
- 路由入口：[router.ts](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/router.ts)
- 结构
  - /touch → 首页（任务明细总览）
  - /touch/manual-sms/list → 手工短信列表
  - /touch/manual-sms → 新建手工短信
  - /touch/policy/template → 策略模板列表
  - /touch/channel/blacklist → 渠道黑名单
  - /touch/query → 触达查询
  - 预留 /touch/system → 系统管理
- 宿主桥接：访问 /touch 及子路径重定向至独立应用（保留子路径与查询参数），修改位置：[index.js](file:///Users/mac/nis_mock/data_comunity/data_comunity/src/router/index.js#L165-L217)

## 目录与布局
- 目录建议
  - src/components、src/pages/touch/{index,manual-sms,policy,channel,system,query}、src/services、src/store、src/mock、src/types
- 通用布局（面包屑与内容容器）：[TouchLayout.vue](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/components/layout/TouchLayout.vue)
- 应用入口与页面壳
  - 入口：[main.ts](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/main.ts)、[index.html](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/index.html)
  - 根组件：[Root.vue](file:///Users/mac/nis_mock/data_comunity/data_comunity/apps/touch/src/Root.vue)

## 状态管理与数据模型
- 短期：组件局部状态即可满足
- 中期（推荐）：引入 Pinia 管理跨页状态（任务批次、模板、渠道配额、黑名单查询条件、字典数据等）
- 类型模型（建议）
  - TaskBatch：id、batchName、templateId、recipientCount、creator、createTime、status
  - Template：id、messageType、scene、tags、title、strategy、content
  - BlacklistItem：username、phone、idCard、addTime、banTime、policy、source
  - Channel：id、name、status、quota、used
  - QueryParams：maId、taskId、executeDate、channel、status、dateRange

## 服务层设计
- 统一放置于 src/services，并抽象错误提示与 Loading
- 模块划分与方法
  - TaskService
    - listBatches(params)
    - createManualSms(payload)
    - copyBatch(id)
    - scheduleBatch(id, sendTime)
  - TemplateService
    - listTemplates(params)
    - createTemplate(payload)
    - updateTemplate(id, payload)
    - renderTemplate(content, params)
  - ChannelService
    - getChannels()
    - getBlacklist(params)
    - unban(record)
    - importBlacklist(file)
  - SystemService
    - getGlobalConfig()
    - updateSignatures(payload)
    - updateRateLimit(payload)
    - updateApprovalFlow(payload)
  - QueryService
    - searchTouches(params)
    - exportTouches(params)

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

## 权限与路由守卫
- 独立应用内部路由守卫（beforeEach）
  - 校验登录态（如无则跳转独立应用登录页或走宿主单点）
  - 校验模块权限（基于角色/资源）
  - 记录未授权访问并提示

## 接口与环境
- 使用 .env.* 管理 API 基址与环境开关（如是否使用 Mock）
- 统一拦截器：鉴权头注入、错误码处理、Message 提示、重试策略（按需）
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
