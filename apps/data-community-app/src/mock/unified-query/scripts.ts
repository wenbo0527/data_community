/**
 * 脚本库 Mock(F13-F20,数据取自设计文档 §4.4)
 *
 * 目录树 + 脚本列表。脚本列表是 ScriptStore 的初始数据,
 * SQL 编辑页「保存脚本」(F11) 写入后本页立即可见 —— 数据联动。
 */
import type { ScriptFolder, ScriptRecord } from './types'

/** 我的脚本目录(F13 支持嵌套) */
export const MY_SCRIPT_FOLDERS: ScriptFolder[] = [
  { key: 'mine/marketing', title: '市场营销' },
  { key: 'mine/risk', title: '风控分析' }
]

/** 共享脚本目录 */
export const SHARED_SCRIPT_FOLDERS: ScriptFolder[] = [
  { key: 'shared/daily', title: '日报模板' },
  { key: 'shared/weekly', title: '周报模板' }
]

export const SEED_SCRIPTS: ScriptRecord[] = [
  {
    id: 'SC001',
    name: '每日放款量统计',
    datasource: 'doris',
    scope: 'mine',
    folderKey: 'mine/marketing',
    owner: '张文博',
    updatedAt: '2026-09-02 18:40',
    sql: `SELECT dt,
       channel,
       COUNT(loan_no)              AS loan_cnt,
       SUM(amount)                 AS loan_amount
FROM   dwd_loan_daily
WHERE  dt = '2026-09-01'
  AND  status = '已放款'
GROUP  BY dt, channel
ORDER  BY loan_amount DESC;`
  },
  {
    id: 'SC002',
    name: '渠道转化漏斗',
    datasource: 'doris',
    scope: 'mine',
    folderKey: 'mine/marketing',
    owner: '张文博',
    updatedAt: '2026-09-01 11:26',
    sql: `SELECT channel,
       COUNT(*)                                   AS apply_cnt,
       SUM(CASE WHEN status = '已放款' THEN 1 ELSE 0 END) AS pass_cnt,
       ROUND(SUM(CASE WHEN status = '已放款' THEN 1 ELSE 0 END) / COUNT(*), 4) AS pass_rate
FROM   dwd_loan_daily
WHERE  dt >= '2026-08-01'
GROUP  BY channel;`
  },
  {
    id: 'SC003',
    name: '风控审批通过率',
    datasource: 'hive',
    scope: 'mine',
    folderKey: null,
    owner: '张文博',
    updatedAt: '2026-08-30 09:15',
    sql: `SELECT dt,
       pass_rate,
       overdue_rate,
       bad_asset_rate,
       rule_hit_cnt
FROM   dws_risk_summary
WHERE  dt BETWEEN '2026-08-01' AND '2026-08-31'
ORDER  BY dt;`
  },
  {
    id: 'SC004',
    name: '逾期率趋势查询',
    datasource: 'hive',
    scope: 'mine',
    folderKey: null,
    owner: '张文博',
    updatedAt: '2026-08-28 16:02',
    sql: `SELECT dt,
       overdue_rate,
       bad_asset_rate
FROM   dws_risk_summary
ORDER  BY dt DESC
LIMIT  30;`
  },
  {
    id: 'SC101',
    name: '团队-日报模板',
    datasource: 'doris',
    scope: 'shared',
    folderKey: 'shared/daily',
    owner: '刘芳',
    updatedAt: '2026-09-02 08:00',
    sql: `SELECT dt,
       COUNT(loan_no) AS loan_cnt,
       SUM(amount)    AS loan_amount
FROM   dwd_loan_daily
WHERE  dt = '\${bizdate}'
GROUP  BY dt;`
  },
  {
    id: 'SC102',
    name: '团队-风控指标汇总',
    datasource: 'doris',
    scope: 'shared',
    folderKey: 'shared/daily',
    owner: '陈明',
    updatedAt: '2026-09-01 20:31',
    sql: `SELECT cust_no,
       cust_name,
       loan_cnt,
       total_amount,
       risk_level
FROM   ads_user_summary
WHERE  dt = '\${bizdate}'
  AND  risk_level IN ('中', '高')
ORDER  BY total_amount DESC
LIMIT  200;`
  },
  {
    id: 'SC103',
    name: '团队-客户等级分布周报',
    datasource: 'hive',
    scope: 'shared',
    folderKey: 'shared/weekly',
    owner: '周涛',
    updatedAt: '2026-08-31 10:12',
    sql: `SELECT cust_level,
       COUNT(*) AS cust_cnt
FROM   b_crm_customer_info
GROUP  BY cust_level
ORDER  BY cust_cnt DESC;`
  }
]

/** SQL 编辑页「另存为」时的默认模板(F11 / F16) */
export const NEW_SCRIPT_TEMPLATE = `-- 新建脚本
-- 数据源:Doris
SELECT loan_no,
       cust_name,
       amount,
       status,
       channel,
       dt
FROM   dwd_loan_daily
WHERE  dt = '2026-09-01'
LIMIT  100;`
