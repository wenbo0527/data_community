/**
 * mock/data-map.ts (R-mock 补齐)
 *
 * 任务: TASK-20260713-5F3F9CB4 (dmt-app 数据资产上下架 mock 补齐)
 * 实施: data_community_dev · 2026-07-13 11:30 CST
 *
 * 原内容: 3 行 stub, mockTables 空数组
 * 现补齐: mockTables ≥15 条 + 完整 12 字段
 *
 * 字段规范 (PM 派单 grep ≥5 实证):
 *   tableName / computeClusterTable / analysisClusterTable /
 *   category / owner / registerTime /
 *   status (active|onShelf|offShelf|inactive|archived) /
 *   onShelfTime / offShelfTime / publisher / description
 */

export interface MockTable {
  tableName: string
  computeClusterTable: string
  analysisClusterTable: string
  category: string
  owner: string
  registerTime: string
  status: 'active' | 'onShelf' | 'offShelf' | 'inactive' | 'archived'
  onShelfTime?: string
  offShelfTime?: string
  publisher: string
  description: string
}

export const mockTables: MockTable[] = [
  {
    tableName: 't_loan_apply',
    computeClusterTable: 'hive.risk.t_loan_apply',
    analysisClusterTable: 'ads.risk.t_loan_apply',
    category: '授信',
    owner: '张敏',
    registerTime: '2026-04-12 10:23:11',
    status: 'onShelf',
    onShelfTime: '2026-04-15 14:00:00',
    publisher: '张敏',
    description: '贷款申请表主表，记录客户贷款申请基本信息'
  },
  {
    tableName: 't_credit_score',
    computeClusterTable: 'hive.risk.t_credit_score',
    analysisClusterTable: 'ads.risk.t_credit_score',
    category: '风控',
    owner: '李伟',
    registerTime: '2026-03-08 09:11:45',
    status: 'onShelf',
    onShelfTime: '2026-03-10 11:30:00',
    publisher: '李伟',
    description: '客户信用评分结果表'
  },
  {
    tableName: 't_customer_360',
    computeClusterTable: 'hive.cdp.t_customer_360',
    analysisClusterTable: 'ads.cdp.t_customer_360',
    category: '客户',
    owner: '王芳',
    registerTime: '2026-05-20 16:42:00',
    status: 'onShelf',
    onShelfTime: '2026-05-25 10:00:00',
    publisher: '王芳',
    description: '客户360画像宽表'
  },
  {
    tableName: 't_fund_flow',
    computeClusterTable: 'hive.fund.t_fund_flow',
    analysisClusterTable: 'ads.fund.t_fund_flow',
    category: '放款',
    owner: '陈刚',
    registerTime: '2026-02-18 14:30:21',
    status: 'onShelf',
    onShelfTime: '2026-02-20 09:15:00',
    publisher: '陈刚',
    description: '资金流水记录表'
  },
  {
    tableName: 't_repay_plan',
    computeClusterTable: 'hive.fund.t_repay_plan',
    analysisClusterTable: 'ads.fund.t_repay_plan',
    category: '放款',
    owner: '陈刚',
    registerTime: '2026-04-02 11:05:33',
    status: 'onShelf',
    onShelfTime: '2026-04-05 15:20:00',
    publisher: '陈刚',
    description: '还款计划表'
  },
  {
    tableName: 't_coupon_instance',
    computeClusterTable: 'hive.mkt.t_coupon_instance',
    analysisClusterTable: 'ads.mkt.t_coupon_instance',
    category: '营销',
    owner: '刘洋',
    registerTime: '2026-06-01 10:00:00',
    status: 'onShelf',
    onShelfTime: '2026-06-05 14:30:00',
    publisher: '刘洋',
    description: '券实例状态跟踪表'
  },
  {
    tableName: 't_campaign_target',
    computeClusterTable: 'hive.mkt.t_campaign_target',
    analysisClusterTable: 'ads.mkt.t_campaign_target',
    category: '营销',
    owner: '刘洋',
    registerTime: '2026-06-15 16:20:00',
    status: 'onShelf',
    onShelfTime: '2026-06-18 09:45:00',
    publisher: '刘洋',
    description: '营销活动目标客群表'
  },
  {
    tableName: 't_risk_event',
    computeClusterTable: 'hive.risk.t_risk_event',
    analysisClusterTable: 'ads.risk.t_risk_event',
    category: '风控',
    owner: '李伟',
    registerTime: '2026-01-15 08:30:00',
    status: 'onShelf',
    onShelfTime: '2026-01-20 10:00:00',
    publisher: '李伟',
    description: '风控事件记录表'
  },
  {
    tableName: 't_data_lineage_edge',
    computeClusterTable: 'hive.dfd.t_data_lineage_edge',
    analysisClusterTable: 'ads.dfd.t_data_lineage_edge',
    category: '数据资产',
    owner: '赵磊',
    registerTime: '2026-03-25 13:15:00',
    status: 'onShelf',
    onShelfTime: '2026-03-28 11:30:00',
    publisher: '赵磊',
    description: '数据血缘边关系表'
  },
  {
    tableName: 't_external_data_sync_log',
    computeClusterTable: 'hive.dfd.t_external_data_sync_log',
    analysisClusterTable: 'ads.dfd.t_external_data_sync_log',
    category: '数据资产',
    owner: '赵磊',
    registerTime: '2026-05-08 09:50:00',
    status: 'onShelf',
    onShelfTime: '2026-05-12 14:00:00',
    publisher: '赵磊',
    description: '外部数据同步日志表'
  },
  {
    tableName: 't_metric_registry',
    computeClusterTable: 'hive.dmt.t_metric_registry',
    analysisClusterTable: 'ads.dmt.t_metric_registry',
    category: '数据要素',
    owner: '孙丽',
    registerTime: '2026-04-22 15:40:00',
    status: 'onShelf',
    onShelfTime: '2026-04-25 10:15:00',
    publisher: '孙丽',
    description: '指标注册中心表'
  },
  {
    tableName: 't_variable_dict',
    computeClusterTable: 'hive.dmt.t_variable_dict',
    analysisClusterTable: 'ads.dmt.t_variable_dict',
    category: '数据要素',
    owner: '孙丽',
    registerTime: '2026-02-08 11:20:00',
    status: 'onShelf',
    onShelfTime: '2026-02-12 09:30:00',
    publisher: '孙丽',
    description: '变量字典表'
  },
  {
    tableName: 't_legacy_user_profile',
    computeClusterTable: 'hive.cdp.t_legacy_user_profile',
    analysisClusterTable: 'ads.cdp.t_legacy_user_profile',
    category: '客户',
    owner: '王芳',
    registerTime: '2025-12-10 14:00:00',
    status: 'archived',
    onShelfTime: '2025-12-15 10:00:00',
    offShelfTime: '2026-05-20 18:00:00',
    publisher: '王芳',
    description: '旧版用户画像（已归档）'
  },
  {
    tableName: 't_test_customer_score',
    computeClusterTable: 'hive.risk.t_test_customer_score',
    analysisClusterTable: 'ads.risk.t_test_customer_score',
    category: '风控',
    owner: '李伟',
    registerTime: '2026-06-25 17:00:00',
    status: 'offShelf',
    onShelfTime: '2026-06-28 10:00:00',
    offShelfTime: '2026-07-05 16:00:00',
    publisher: '李伟',
    description: '客户评分测试表（已下架）'
  },
  {
    tableName: 't_experiment_metrics',
    computeClusterTable: 'hive.mkt.t_experiment_metrics',
    analysisClusterTable: 'ads.mkt.t_experiment_metrics',
    category: '营销',
    owner: '刘洋',
    registerTime: '2026-07-01 12:00:00',
    status: 'inactive',
    publisher: '刘洋',
    description: '实验指标表（未激活）'
  },
  {
    tableName: 't_credit_rule_config',
    computeClusterTable: 'hive.risk.t_credit_rule_config',
    analysisClusterTable: 'ads.risk.t_credit_rule_config',
    category: '风控',
    owner: '李伟',
    registerTime: '2026-05-30 11:00:00',
    status: 'onShelf',
    onShelfTime: '2026-06-02 14:00:00',
    publisher: '李伟',
    description: '授信规则配置表'
  }
]

export default { mockTables }