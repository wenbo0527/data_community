## 目标
- 参考 Arco Workplace 重构预算总览页为工作台：功能导航、四项KPI、监控概览、消耗预警与合同/结算概览。

## 页面结构
### 顶部：功能导航
- 按钮跳转：预算列表/预算监控/合同管理/结算管理。

### 数据总览（四项 KPI）
- 当年预算总额、当前累积消耗、当年实际核销、预算健康度。

### 预算监控概览
- 内嵌 `BudgetBurndownTabs`，右侧按钮“前往预算监控”。

### 工作台信息区（两列）
- 左列：预算消耗预警（替代“最新动态”）
  - 数据源：`useExternalDataStore.warnings`（已在总览/监控页使用），无则占位空状态。
  - 展示：`a-list` Top5 预警摘要项（业务类型/平台/对应时间/偏离率），附状态标签（正常/超支/消耗过慢）。
  - 操作：行点击跳转预算监控页，并（后续）支持携带筛选参数。
- 右列：合同与结算概览（两个卡片）
  - 合同概览：近7天/30天到期合同数、待核销金额；Top5 即将到期合同（供应商/合同名/到期日）；按钮跳转合同管理。
  - 结算概览：待结算合同数、待结算总额、平均剩余结算比例；Top5 剩余金额最大的合同；按钮跳转结算管理。

## 数据与计算
- 预算聚合与健康度：`useBudgetStatsAggregator` + `useBudgetCalculations`。
- 消耗预警：`externalStore.fetchWarnings()` 的数据结构（预算/实际/偏离率）用于摘要展示；无表格，仅列表。
- 合同：`useContractStore.list` 推导到期计数、待核销/结算金额与 Top5。

## 实施步骤
1) `src/pages/budget/BudgetOverview.vue`
- 保留导航、四项KPI、监控卡片。
- 左列新增“预算消耗预警”卡片；右列新增“合同概览”“结算概览”卡片。
- 在 `onMounted` 拉取 `externalStore.fetchWarnings` 与 `contractStore.fetchContractList`。
- 新增计算字段：
  - 预警 Top5 列表（按偏离率或优先级排序）。
  - 合同：`expiring7Count/expiring30Count/pendingWriteOffAmount/topExpiringContracts`。
  - 结算：`pendingSettlementCount/pendingSettlementAmount/avgRemainingRate/topPendingSettlementContracts`。

2) 路由交互
- 预警项点击：跳转 `/risk/budget/monitor`。
- 合同项点击：跳合同详情；结算项点击：跳结算管理。

## 验收标准
- 首页呈现“导航 + 四项KPI + 监控图 + 左预警右合同/结算概览”，无筛选与上传模块。
- 预警 Top5 正确展示且跳转有效；合同/结算指标与列表正确。
- KPI与图表加载成功，无报错。

## 备注
- 预警列表为摘要视图，避免回归详细预警表；详细分析在“预算监控”页完成。
- 结算数据暂基于合同差额推导，后续可引入 `settlementStore` 接口替换。