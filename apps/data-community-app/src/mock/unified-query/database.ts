/**
 * 数据库导航 Mock(F01)
 *
 * 结构与表名取自设计文档 §3.4「数据库导航树」,字段元数据为贴合信贷业务的 Mock。
 * 静态数据,不随交互变化;表名同时是 queryResults.ts 的映射键。
 */
import type { DbTreeNode, TableColumn } from './types'

export const DATASOURCE_LABEL: Record<'doris' | 'hive', string> = {
  doris: 'Doris',
  hive: 'Hive'
}

/** 数据源角标(F19 / DataSourceBadge) */
export const DATASOURCE_BADGE: Record<'doris' | 'hive', string> = {
  doris: 'DR',
  hive: 'HC'
}

export const DATASOURCE_COLOR: Record<'doris' | 'hive', string> = {
  doris: 'arcoblue',
  hive: 'orange'
}

export const DATABASE_TREE: DbTreeNode[] = [
  {
    key: 'doris',
    title: 'Doris',
    kind: 'datasource',
    children: [
      {
        key: 'doris/internal',
        title: 'internal',
        kind: 'cluster',
        children: [
          {
            key: 'doris/internal/ADM',
            title: 'ADM',
            kind: 'database',
            children: [
              { key: 'doris/internal/ADM/dwd_loan_daily', title: 'dwd_loan_daily', comment: '放款明细表', kind: 'table', tableName: 'dwd_loan_daily' },
              { key: 'doris/internal/ADM/dwd_repay_daily', title: 'dwd_repay_daily', comment: '还款明细表', kind: 'table', tableName: 'dwd_repay_daily' },
              { key: 'doris/internal/ADM/ads_user_summary', title: 'ads_user_summary', comment: '用户汇总表', kind: 'table', tableName: 'ads_user_summary' }
            ]
          }
        ]
      }
    ]
  },
  {
    key: 'hive',
    title: 'Hive',
    kind: 'datasource',
    children: [
      {
        key: 'hive/inceptor',
        title: 'Inceptor',
        kind: 'cluster',
        children: [
          {
            key: 'hive/inceptor/dwd_loan_detail', title: 'dwd_loan_detail', comment: '贷款明细宽表', kind: 'table', tableName: 'dwd_loan_detail'
          },
          {
            key: 'hive/inceptor/dws_risk_summary', title: 'dws_risk_summary', comment: '风险汇总表', kind: 'table', tableName: 'dws_risk_summary'
          },
          {
            key: 'hive/inceptor/b_crm_customer_info', title: 'b_crm_customer_info', comment: 'CRM客户信息表', kind: 'table', tableName: 'b_crm_customer_info'
          }
        ]
      }
    ]
  }
]

/** 表名 → 字段元数据 */
export const TABLE_COLUMNS: Record<string, TableColumn[]> = {
  dwd_loan_daily: [
    { name: 'loan_no', type: 'varchar(32)', comment: '借据号' },
    { name: 'cust_name', type: 'varchar(64)', comment: '客户姓名' },
    { name: 'amount', type: 'decimal(18,2)', comment: '放款金额' },
    { name: 'status', type: 'varchar(16)', comment: '放款状态' },
    { name: 'channel', type: 'varchar(16)', comment: '渠道' },
    { name: 'dt', type: 'date', comment: '数据日期' }
  ],
  dwd_repay_daily: [
    { name: 'repay_no', type: 'varchar(32)', comment: '还款流水号' },
    { name: 'loan_no', type: 'varchar(32)', comment: '借据号' },
    { name: 'repay_amount', type: 'decimal(18,2)', comment: '还款金额' },
    { name: 'repay_type', type: 'varchar(16)', comment: '还款方式' },
    { name: 'overdue_days', type: 'int', comment: '逾期天数' },
    { name: 'dt', type: 'date', comment: '数据日期' }
  ],
  ads_user_summary: [
    { name: 'cust_no', type: 'varchar(32)', comment: '客户号' },
    { name: 'cust_name', type: 'varchar(64)', comment: '客户姓名' },
    { name: 'loan_cnt', type: 'int', comment: '历史借款笔数' },
    { name: 'total_amount', type: 'decimal(18,2)', comment: '累计放款金额' },
    { name: 'risk_level', type: 'varchar(8)', comment: '风险等级' },
    { name: 'dt', type: 'date', comment: '数据日期' }
  ],
  dwd_loan_detail: [
    { name: 'loan_no', type: 'string', comment: '借据号' },
    { name: 'product_name', type: 'string', comment: '产品名称' },
    { name: 'apply_amount', type: 'decimal(18,2)', comment: '申请金额' },
    { name: 'approval_status', type: 'string', comment: '审批状态' },
    { name: 'approve_time', type: 'string', comment: '审批时间' }
  ],
  dws_risk_summary: [
    { name: 'dt', type: 'string', comment: '统计日期' },
    { name: 'overdue_rate', type: 'decimal(8,4)', comment: '逾期率' },
    { name: 'bad_asset_rate', type: 'decimal(8,4)', comment: '不良率' },
    { name: 'pass_rate', type: 'decimal(8,4)', comment: '审批通过率' },
    { name: 'rule_hit_cnt', type: 'bigint', comment: '风控规则命中数' }
  ],
  b_crm_customer_info: [
    { name: 'cust_no', type: 'string', comment: '客户号' },
    { name: 'cust_name', type: 'string', comment: '客户姓名' },
    { name: 'mobile', type: 'string', comment: '手机号' },
    { name: 'cust_level', type: 'string', comment: '客户等级' },
    { name: 'manager_name', type: 'string', comment: '客户经理' }
  ]
}

/** 从导航树里取出全部表名,供编辑器补全与表名识别使用 */
export function collectTableNames(nodes: DbTreeNode[] = DATABASE_TREE): string[] {
  return nodes.flatMap(n => {
    const self = n.tableName ? [n.tableName] : []
    return [...self, ...collectTableNames(n.children ?? [])]
  })
}

/** 按表名查字段元数据 */
export function getTableColumns(tableName: string): TableColumn[] {
  return TABLE_COLUMNS[tableName] ?? []
}
