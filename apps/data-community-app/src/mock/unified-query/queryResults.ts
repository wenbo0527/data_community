/**
 * 查询结果 Mock(设计文档 §3.4 / F08)
 *
 * 键为表名,与 database.ts 的 TABLE_COLUMNS 一一对应。
 * 静态数据,executor.ts 按 SQL 中识别到的表名取值。
 */
import type { ResultColumn } from './types'

/** 数值列右对齐、按数值排序;文本列按字典序排序 */
const C = (title: string, dataIndex: string, numeric = false, width?: number): ResultColumn => ({
  title,
  dataIndex,
  ...(numeric ? { numeric: true } : {}),
  ...(width ? { width } : {})
})

export interface MockResultSet {
  columns: ResultColumn[]
  rows: Record<string, string | number>[]
}

export const QUERY_RESULTS: Record<string, MockResultSet> = {
  /** 放款明细表(Doris) —— 设计文档 §3.4 示例行 */
  dwd_loan_daily: {
    columns: [
      C('借据号', 'loan_no', false, 150),
      C('客户姓名', 'cust_name', false, 100),
      C('放款金额', 'amount', true, 130),
      C('放款状态', 'status', false, 100),
      C('渠道', 'channel', false, 90),
      C('数据日期', 'dt', false, 120)
    ],
    rows: [
      { loan_no: 'L20260901001', cust_name: '张三', amount: 50000, status: '已放款', channel: '线上', dt: '2026-09-01' },
      { loan_no: 'L20260901002', cust_name: '李四', amount: 120000, status: '已放款', channel: '线下', dt: '2026-09-01' },
      { loan_no: 'L20260901003', cust_name: '王五', amount: 8000, status: '已拒绝', channel: '线上', dt: '2026-09-01' },
      { loan_no: 'L20260901004', cust_name: '赵六', amount: 260000, status: '已放款', channel: '线下', dt: '2026-09-01' },
      { loan_no: 'L20260901005', cust_name: '孙七', amount: 32000, status: '审核中', channel: '线上', dt: '2026-09-01' }
    ]
  },

  /** 还款明细表(Doris) */
  dwd_repay_daily: {
    columns: [
      C('还款流水号', 'repay_no', false, 160),
      C('借据号', 'loan_no', false, 150),
      C('还款金额', 'repay_amount', true, 120),
      C('还款方式', 'repay_type', false, 110),
      C('逾期天数', 'overdue_days', true, 100),
      C('数据日期', 'dt', false, 120)
    ],
    rows: [
      { repay_no: 'R20260902001', loan_no: 'L20260901001', repay_amount: 4325.5, repay_type: '正常还款', overdue_days: 0, dt: '2026-09-02' },
      { repay_no: 'R20260902002', loan_no: 'L20260901002', repay_amount: 10360, repay_type: '提前结清', overdue_days: 0, dt: '2026-09-02' },
      { repay_no: 'R20260902003', loan_no: 'L20260820017', repay_amount: 2100.8, repay_type: '逾期还款', overdue_days: 12, dt: '2026-09-02' },
      { repay_no: 'R20260902004', loan_no: 'L20260715088', repay_amount: 0, repay_type: '逾期未还', overdue_days: 47, dt: '2026-09-02' }
    ]
  },

  /** 用户汇总表(Doris) */
  ads_user_summary: {
    columns: [
      C('客户号', 'cust_no', false, 130),
      C('客户姓名', 'cust_name', false, 100),
      C('历史借款笔数', 'loan_cnt', true, 120),
      C('累计放款金额', 'total_amount', true, 140),
      C('风险等级', 'risk_level', false, 100),
      C('数据日期', 'dt', false, 120)
    ],
    rows: [
      { cust_no: 'C10001', cust_name: '张三', loan_cnt: 3, total_amount: 186000, risk_level: '低', dt: '2026-09-02' },
      { cust_no: 'C10002', cust_name: '李四', loan_cnt: 5, total_amount: 640000, risk_level: '中', dt: '2026-09-02' },
      { cust_no: 'C10003', cust_name: '王五', loan_cnt: 1, total_amount: 8000, risk_level: '高', dt: '2026-09-02' },
      { cust_no: 'C10004', cust_name: '赵六', loan_cnt: 8, total_amount: 1250000, risk_level: '低', dt: '2026-09-02' }
    ]
  },

  /** 贷款明细宽表(Hive) */
  dwd_loan_detail: {
    columns: [
      C('借据号', 'loan_no', false, 150),
      C('产品名称', 'product_name', false, 150),
      C('申请金额', 'apply_amount', true, 120),
      C('审批状态', 'approval_status', false, 110),
      C('审批时间', 'approve_time', false, 170)
    ],
    rows: [
      { loan_no: 'H20260901001', product_name: '经营快贷', apply_amount: 300000, approval_status: '通过', approve_time: '2026-09-01 09:12:33' },
      { loan_no: 'H20260901002', product_name: '消费分期', apply_amount: 20000, approval_status: '拒绝', approve_time: '2026-09-01 10:04:18' },
      { loan_no: 'H20260901003', product_name: '房抵贷', apply_amount: 1500000, approval_status: '人工复审', approve_time: '2026-09-01 11:47:02' }
    ]
  },

  /** 风险汇总表(Hive) */
  dws_risk_summary: {
    columns: [
      C('统计日期', 'dt', false, 120),
      C('逾期率', 'overdue_rate', true, 110),
      C('不良率', 'bad_asset_rate', true, 110),
      C('审批通过率', 'pass_rate', true, 120),
      C('规则命中数', 'rule_hit_cnt', true, 120)
    ],
    rows: [
      { dt: '2026-08-29', overdue_rate: 0.0312, bad_asset_rate: 0.0108, pass_rate: 0.6741, rule_hit_cnt: 1822 },
      { dt: '2026-08-30', overdue_rate: 0.0305, bad_asset_rate: 0.0106, pass_rate: 0.6815, rule_hit_cnt: 1764 },
      { dt: '2026-08-31', overdue_rate: 0.0298, bad_asset_rate: 0.0103, pass_rate: 0.6902, rule_hit_cnt: 1698 },
      { dt: '2026-09-01', overdue_rate: 0.0326, bad_asset_rate: 0.0111, pass_rate: 0.6688, rule_hit_cnt: 1905 },
      { dt: '2026-09-02', overdue_rate: 0.0319, bad_asset_rate: 0.0109, pass_rate: 0.6773, rule_hit_cnt: 1841 }
    ]
  },

  /** CRM 客户信息表(Hive) */
  b_crm_customer_info: {
    columns: [
      C('客户号', 'cust_no', false, 130),
      C('客户姓名', 'cust_name', false, 100),
      C('手机号', 'mobile', false, 140),
      C('客户等级', 'cust_level', false, 100),
      C('客户经理', 'manager_name', false, 110)
    ],
    rows: [
      { cust_no: 'C10001', cust_name: '张三', mobile: '138****2043', cust_level: '金卡', manager_name: '陈明' },
      { cust_no: 'C10002', cust_name: '李四', mobile: '139****7781', cust_level: '白金', manager_name: '刘芳' },
      { cust_no: 'C10003', cust_name: '王五', mobile: '137****1265', cust_level: '普通', manager_name: '陈明' },
      { cust_no: 'C10004', cust_name: '赵六', mobile: '135****9902', cust_level: '钻石', manager_name: '周涛' }
    ]
  }
}

/** 未识别到表名时的兜底结果集 */
export const DEFAULT_RESULT: MockResultSet = {
  columns: [
    C('字段一', 'col_1', false, 140),
    C('字段二', 'col_2', false, 140),
    C('指标值', 'col_3', true, 120),
    C('统计日期', 'dt', false, 120)
  ],
  rows: [
    { col_1: 'A', col_2: '线上', col_3: 1284, dt: '2026-09-01' },
    { col_1: 'B', col_2: '线下', col_3: 963, dt: '2026-09-01' },
    { col_1: 'C', col_2: 'API', col_3: 2155, dt: '2026-09-01' }
  ]
}

export function getResultByTable(tableName: string): MockResultSet {
  return QUERY_RESULTS[tableName] ?? DEFAULT_RESULT
}
