/**
 * 风险特征衍生需求 mock store
 * 来源：风险数据一体化一期 文档 §三 模块 A F-01
 *
 * 需求状态：待开发 → 开发中 → 待注册 → 已注册（单向流转）
 * 文档 附录 D.1 衍生需求ID：DRV-YYYYMMDD-NNNN
 */

export interface DerivationRecord {
  id: string                          // DRV-YYYYMMDD-NNNN
  name: string                        // 需求名称
  businessScene: string               // 业务场景：贷前/贷中/贷后
  expectedEffect: string              // 预期效果
  category: 'midloan_behavior'        // 品类（锁定为贷中行为）
  dataSource: string                  // 关联数据源（默认 Hbase）
  /** 特征核心属性 */
  featureEnName: string               // 特征英文名
  featureCnName: string               // 中文名
  fieldType: string                   // Integer/Double/Boolean/String
  processingLogic: string             // 加工逻辑
  defaultValue: string                // 默认值（可空）
  l1Category: string                  // 一级分类
  l2Category: string                  // 二级分类
  sourceTableAfter: string            // 标准化后来源表（可空）
  sourceTableBefore: string           // 标准化前来源表（可空）
  originFeatureEnName: string         // 原特征英文名（可空）
  dataFreshness: string               // 实时/离线T-1/离线T-2
  developer: string                   // 开发人员（数仓团队成员）
  excelReport?: string                // Excel 评估报告文件名
  /** 注册阶段补充 */
  dataTableName?: string              // 数据底表名称（可暂空）
  dwTaskId?: string                   // 数仓任务ID
  productScope?: string               // 产品范围
  listType?: string                   // 名单类型
  batch?: string                      // 批次
  acceptor?: string                   // 验收人
  remark?: string                     // 备注
  /** 状态与系统字段 */
  status: 'pending_dev' | 'developing' | 'pending_register' | 'registered'
  featureId?: string                   // 关联特征ID（注册后写入）
  creator: string                      // 创建人
  createdAt: string
  updatedAt: string
}

// 内存存储
let store: DerivationRecord[] = [
  {
    id: 'DRV-20260725-0001',
    name: '近30日大额交易次数',
    businessScene: '贷中',
    expectedEffect: '识别异常消费模式，辅助贷中反欺诈策略',
    category: 'midloan_behavior',
    dataSource: 'Hbase',
    featureEnName: 'MIDLOAN_BIGTXN_CNT_30D',
    featureCnName: '近30日大额交易次数',
    fieldType: 'Integer',
    processingLogic: '从 dwd_trade_detail 过滤 amount >= 5000 的成功记录，按 user_id 维度统计 30 天滚动窗口',
    defaultValue: '0',
    l1Category: 'credit_grant',
    l2Category: 'credit_grant_amount',
    sourceTableAfter: 'ads_midloan_bigtxn_30d',
    sourceTableBefore: 'dwd_trade_detail',
    originFeatureEnName: '',
    dataFreshness: 'offline_t1',
    developer: '王数仓',
    dataTableName: 'ads_midloan_bigtxn_30d',
    dwTaskId: 'DW-TASK-998877',
    productScope: '现金贷',
    listType: 'none',
    batch: '2026Q3',
    acceptor: '小李',
    remark: '',
    status: 'registered',
    featureId: 'MIDLOAN-FEAT-0001',
    creator: '小李',
    createdAt: '2026-07-25 10:00:00',
    updatedAt: '2026-08-01 09:30:00'
  },
  {
    id: 'DRV-20260801-0007',
    name: '近7日还款波动率',
    businessScene: '贷中',
    expectedEffect: '贷中风险预警，发现还款异常',
    category: 'midloan_behavior',
    dataSource: 'Hbase',
    featureEnName: 'MIDLOAN_REPAY_VOL_7D',
    featureCnName: '近7日还款波动率',
    fieldType: 'Double',
    processingLogic: '计算近7日还款金额序列的标准差，再除以均值得到波动率',
    defaultValue: '0.0',
    l1Category: 'repayment',
    l2Category: 'repayment_volatility',
    sourceTableAfter: 'ads_midloan_repay_vol_7d',
    sourceTableBefore: 'dwd_repayment_detail',
    originFeatureEnName: '',
    dataFreshness: 'realtime',
    developer: '王数仓',
    dataTableName: 'ads_midloan_repay_vol_7d',
    dwTaskId: 'DW-TASK-998900',
    productScope: '消费分期',
    listType: 'none',
    batch: '2026Q3',
    acceptor: '小李',
    remark: '',
    status: 'registered',
    featureId: 'MIDLOAN-FEAT-0002',
    creator: '小李',
    createdAt: '2026-08-01 14:20:00',
    updatedAt: '2026-08-03 11:00:00'
  },
  {
    id: 'DRV-20260803-0015',
    name: '催收响应时效',
    businessScene: '贷中',
    expectedEffect: '衡量催收触达效率，识别高响应客户',
    category: 'midloan_behavior',
    dataSource: 'Hbase',
    featureEnName: 'MIDLOAN_COLLECT_RESP_HRS',
    featureCnName: '催收响应时效',
    fieldType: 'Double',
    processingLogic: '从催收工单系统 join 用户触达日志，计算 avg(respond_time - send_time) / 3600',
    defaultValue: '24.0',
    l1Category: 'collection',
    l2Category: 'collection_response',
    sourceTableAfter: 'ads_midloan_collect_resp_hrs',
    sourceTableBefore: 'dwd_collection_log',
    originFeatureEnName: '',
    dataFreshness: 'realtime',
    developer: '王数仓',
    dataTableName: '',
    dwTaskId: '',
    productScope: '现金贷',
    listType: 'none',
    batch: '2026Q3',
    acceptor: '小李',
    remark: '数据底表未补充',
    status: 'registered',
    featureId: 'MIDLOAN-FEAT-0003',
    creator: '小李',
    createdAt: '2026-08-03 09:15:00',
    updatedAt: '2026-08-04 18:00:00'
  },
  {
    id: 'DRV-20260804-0020',
    name: '支用间隔天数均值',
    businessScene: '贷中',
    expectedEffect: '识别异常支用频次',
    category: 'midloan_behavior',
    dataSource: 'Hbase',
    featureEnName: 'MIDLOAN_USAGE_INTERVAL_D',
    featureCnName: '支用间隔天数均值',
    fieldType: 'Double',
    processingLogic: '从支用明细按 user_id 排序，计算相邻支用日期差值的均值',
    defaultValue: '30.0',
    l1Category: 'loan_usage',
    l2Category: 'loan_usage_freq',
    sourceTableAfter: '',
    sourceTableBefore: 'dwd_loan_usage_detail',
    originFeatureEnName: '',
    dataFreshness: 'offline_t1',
    developer: '王数仓',
    productScope: '消费分期',
    listType: 'none',
    batch: '2026Q3',
    acceptor: '小李',
    remark: '等待开发',
    status: 'pending_register',
    creator: '小李',
    createdAt: '2026-08-04 16:30:00',
    updatedAt: '2026-08-04 16:30:00'
  },
  {
    id: 'DRV-20260805-0025',
    name: '近30日登录设备变更次数',
    businessScene: '贷中',
    expectedEffect: '识别账号被盗风险',
    category: 'midloan_behavior',
    dataSource: 'Hbase',
    featureEnName: 'MIDLOAN_LOGIN_DEVICE_CHG_30D',
    featureCnName: '近30日登录设备变更次数',
    fieldType: 'Integer',
    processingLogic: '统计 user_id 近30日的不同 device_id 数量',
    defaultValue: '0',
    l1Category: 'collection',
    l2Category: 'collection_behavior',
    sourceTableAfter: '',
    sourceTableBefore: '',
    originFeatureEnName: '',
    dataFreshness: 'realtime',
    developer: '王数仓',
    productScope: '现金贷',
    listType: 'none',
    batch: '2026Q3',
    acceptor: '小李',
    remark: '',
    status: 'developing',
    creator: '小李',
    createdAt: '2026-08-05 09:30:00',
    updatedAt: '2026-08-05 09:30:00'
  },
  {
    // 原内数变量（VAR-0003）迁移为贷中行为后保留关联
    id: 'DRV-20260803-0030',
    name: '近30日交易次数',
    businessScene: '贷中',
    expectedEffect: '统计用户近30日成功交易次数，识别交易频次异常',
    category: 'midloan_behavior',
    dataSource: 'Hbase',
    featureEnName: 'IN_TXN_CNT_30D',
    featureCnName: '近30日交易次数',
    fieldType: 'Integer',
    processingLogic: '按用户维度统计近30日交易成功记录数',
    defaultValue: '0',
    l1Category: 'credit_grant',
    l2Category: 'credit_grant_freq',
    sourceTableAfter: 'ads_midloan_txn_cnt_30d',
    sourceTableBefore: 'dwd_trade_detail',
    originFeatureEnName: 'txn_cnt_30d',
    dataFreshness: 'offline_t1',
    developer: '王数仓',
    dataTableName: 'ads_midloan_txn_cnt_30d',
    dwTaskId: 'DW-TASK-998755',
    productScope: '现金贷',
    listType: 'none',
    batch: '2026Q3',
    acceptor: '数据应用团队',
    remark: '由原内数变量迁移为贷中行为品类',
    status: 'pending_register',
    creator: '数据应用团队',
    createdAt: '2026-08-03 11:20:00',
    updatedAt: '2026-08-04 09:15:00'
  },
  // ============ 补齐：pending_dev 状态衍生需求 ============
  {
    id: 'DRV-20260805-0050',
    name: '近30日社保缴纳连续月数',
    businessScene: '贷中',
    expectedEffect: '通过社保缴纳连续月数评估用户工作稳定性',
    category: 'midloan_behavior',
    dataSource: 'Hbase',
    featureEnName: 'MIDLOAN_SOCIAL_CONT_MONTHS_30D',
    featureCnName: '近30日社保缴纳连续月数',
    fieldType: 'Integer',
    processingLogic: '对接社保查询 API，按 user_id 统计近30日内连续社保缴纳月数',
    defaultValue: '0',
    l1Category: 'repayment',
    l2Category: 'repayment_stability',
    sourceTableAfter: '',
    sourceTableBefore: 'dwd_social_security_log',
    originFeatureEnName: '',
    dataFreshness: 'offline_t2',
    developer: '王数仓',
    productScope: '小微贷',
    listType: 'none',
    batch: '2026Q3',
    acceptor: '小李',
    remark: '需数仓团队联调社保查询 API',
    status: 'pending_dev',
    creator: '小李',
    createdAt: '2026-08-05 10:30:00',
    updatedAt: '2026-08-05 10:30:00'
  }
]

/**
 * 生成下一个 DRV ID：DRV-YYYYMMDD-NNNN
 */
function nextId(): string {
  const today = new Date()
  const ymd = today.toISOString().slice(0, 10).replace(/-/g, '')
  const todayCount = store.filter(d => d.id.startsWith(`DRV-${ymd}-`)).length
  return `DRV-${ymd}-${String(todayCount + 1).padStart(4, '0')}`
}

export const DerivationStore = {
  /** 列表查询 */
  list(filter = {}) {
    let list = [...store]
    if (filter.status) list = list.filter(d => d.status === filter.status)
    if (filter.businessScene) list = list.filter(d => d.businessScene === filter.businessScene)
    if (filter.keyword) {
      const k = String(filter.keyword).toLowerCase()
      list = list.filter(d =>
        d.name.toLowerCase().includes(k) ||
        d.id.toLowerCase().includes(k) ||
        d.featureEnName.toLowerCase().includes(k) ||
        d.featureCnName.toLowerCase().includes(k)
      )
    }
    return list
  },
  /** 详情查询 */
  get(id) {
    return store.find(d => d.id === id) || null
  },
  /** 创建（A1） */
  create(payload, creator = 'Demo 用户') {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
    const record: DerivationRecord = {
      id: nextId(),
      status: 'pending_dev',
      creator,
      createdAt: now,
      updatedAt: now,
      ...payload
    }
    store.unshift(record)
    return record
  },
  /** 状态流转：A2 */
  updateStatus(id, newStatus, operator = 'Demo 用户') {
    const d = store.find(x => x.id === id)
    if (!d) return null
    d.status = newStatus
    d.updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
    return d
  },
  /** 注册：B1 - 写入协作信息和数据底表 */
  register(id, payload) {
    const d = store.find(x => x.id === id)
    if (!d) return null
    // 数据底表名称等可暂空
    Object.assign(d, payload)
    d.status = 'registered'
    // 生成特征 ID：MIDLOAN-FEAT-NNNN
    const idx = String(store.filter(x => x.featureId).length + 1).padStart(4, '0')
    d.featureId = `MIDLOAN-FEAT-${idx}`
    d.registeredAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
    d.updatedAt = d.registeredAt
    // 同步把生成的 featureId / dataTableName 等写回变量表
    const v = (window as any).__midloanVariableList
    if (v && Array.isArray(v)) {
      const vv = v.find(x => x.id === d.featureId || x.derivationId === d.id)
      if (vv) {
        vv.midloanFeatureId = d.featureId
        vv.midloanStatus = 'registered'
        vv.dataTableName = d.dataTableName || ''
        vv.dwTaskId = d.dwTaskId || ''
        vv.productScope = d.productScope || ''
        vv.listType = d.listType || ''
        vv.batch = d.batch || ''
        vv.acceptor = d.acceptor || ''
        vv.remark = d.remark || ''
      }
    }
    return d
  },
  /** 补充数据底表（B1 R10） */
  supplementDataTable(id, tableName) {
    const d = store.find(x => x.id === id)
    if (!d) return null
    d.dataTableName = tableName
    d.updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
    return d
  }
}

export default DerivationStore