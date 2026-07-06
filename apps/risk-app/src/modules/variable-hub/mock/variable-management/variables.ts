export type VariableSourceType = 'external' | 'internal' | 'credit'
export type VariableCategory = 'behavior' | 'credit' | 'external'

export interface VariableSourceRefs {
  externalServiceId?: string | number
  externalArchiveId?: string | number
  externalEvaluationId?: string | number
  externalLifecycleId?: string | number
}

export interface VariableEffectMetrics {
  /** 信息价值（Information Value）0-1 */
  iv: number
  /** 区分度（Kolmogorov-Smirnov）0-1 */
  ks: number
  /** AUC 0-1 */
  auc: number
  /** 覆盖率 0-1 */
  coverage: number
  /** 提升度（百分比，正数表示正提升） */
  lift: number
}

export interface VariableCostMetrics {
  /** 单价（元/次，0 表示内部数据无单价） */
  pricePerCall: number
  /** 月均调用次数 */
  monthlyCalls: number
  /** 月均成本（元）= 单价 × 月均调用次数 */
  monthlyCost: number
  /** 成本趋势 */
  costTrend: 'up' | 'down' | 'stable'
}

export interface VariableAssetMock {
  id: string
  name: string
  code: string
  type: string
  status: string
  description: string
  dataSource: string
  dataSourceName: string
  sourceField?: string
  updateFrequency?: string
  quality?: number
  missingRate?: number
  uniqueValueCount?: number
  definition?: string
  creator?: string
  createdAt?: string
  updatedAt?: string
  sourceType?: VariableSourceType
  sourceRefs?: VariableSourceRefs
  category?: VariableCategory
  profile?: Record<string, any>
  effectMetrics?: VariableEffectMetrics
  costMetrics?: VariableCostMetrics
}

const now = new Date()
const fmt = (d: Date) => d.toISOString().slice(0, 19).replace('T', ' ')

export const variableAssets: VariableAssetMock[] = [
  {
    id: 'VAR-0001',
    name: '外数-三要素核验一致性',
    code: 'EXT_VERIFY_3E_MATCH',
    type: 'categorical',
    status: 'active',
    description: '基于外部三要素核验结果生成的一致性变量，用于准入与反欺诈',
    dataSource: 'external',
    dataSourceName: '外部数据服务',
    sourceField: 'verify_result',
    updateFrequency: '实时',
    quality: 96,
    missingRate: 0.02,
    uniqueValueCount: 5,
    definition: '取值：match/partial_mismatch/mismatch/unknown',
    creator: '风险数据团队',
    createdAt: fmt(new Date(now.getTime() - 12 * 86400000)),
    updatedAt: fmt(new Date(now.getTime() - 1 * 86400000)),
    sourceType: 'external',
    category: 'external',
    profile: {
      dataType: '外数',
      dataTypeLevel2: '核验类',
      apiNo: 'EXT-API-VERIFY-3E',
      tableField: 'verify_result',
      normalizedField: 'verify_3e_match',
      fieldDesc: '三要素核验一致性结果',
      fieldType: 'STRING',
      tableName: 'ads_ext_verify_3e',
      onlineOfflineTime: fmt(new Date(now.getTime() - 30 * 86400000)),
      onlineStatus: '上线',
      responseField: 'verify_result'
    },
    sourceRefs: {
      externalArchiveId: 1,
      externalEvaluationId: 11
    },
    effectMetrics: {
      iv: 0.32,
      ks: 0.24,
      auc: 0.71,
      coverage: 0.95,
      lift: 12
    },
    costMetrics: {
      pricePerCall: 1.5,
      monthlyCalls: 80000,
      monthlyCost: 120000,
      costTrend: 'up'
    }
  },
  {
    id: 'VAR-0002',
    name: '外数-手机在网时长',
    code: 'EXT_MOBILE_ONLINE_DAYS',
    type: 'numerical',
    status: 'active',
    description: '外数回传手机号在网时长（天）',
    dataSource: 'external',
    dataSourceName: '外部数据服务',
    sourceField: 'online_days',
    updateFrequency: '日',
    quality: 92,
    missingRate: 0.05,
    uniqueValueCount: 180,
    definition: '单位：天，取值范围：[0, 3650]',
    creator: '数据应用团队',
    createdAt: fmt(new Date(now.getTime() - 20 * 86400000)),
    updatedAt: fmt(new Date(now.getTime() - 2 * 86400000)),
    sourceType: 'external',
    category: 'external',
    profile: {
      dataType: '外数',
      dataTypeLevel2: '运营类',
      apiNo: 'EXT-API-MOBILE-ONLINE',
      tableField: 'online_days',
      normalizedField: 'mobile_online_days',
      fieldDesc: '手机号在网时长（天）',
      fieldType: 'INT',
      tableName: 'ads_ext_mobile_profile',
      onlineOfflineTime: fmt(new Date(now.getTime() - 45 * 86400000)),
      onlineStatus: '上线',
      responseField: 'online_days'
    },
    sourceRefs: {
      externalArchiveId: 2,
      externalEvaluationId: 12
    },
    effectMetrics: {
      iv: 0.41,
      ks: 0.32,
      auc: 0.76,
      coverage: 0.93,
      lift: 18
    },
    costMetrics: {
      pricePerCall: 0.85,
      monthlyCalls: 120000,
      monthlyCost: 102000,
      costTrend: 'down'
    }
  },
  {
    id: 'VAR-0003',
    name: '内数-近30日交易次数',
    code: 'IN_TXN_CNT_30D',
    type: 'numerical',
    status: 'pending',
    description: '近 30 天交易次数',
    dataSource: 'internal',
    dataSourceName: '交易明细表',
    sourceField: 'txn_cnt_30d',
    updateFrequency: '日',
    quality: 88,
    missingRate: 0.01,
    uniqueValueCount: 800,
    definition: '过去 30 天成功交易次数',
    creator: '数据应用团队',
    createdAt: fmt(new Date(now.getTime() - 5 * 86400000)),
    updatedAt: fmt(new Date(now.getTime() - 1 * 86400000)),
    sourceType: 'internal',
    category: 'behavior',
    profile: {
      categoryLevel1: '交易行为',
      categoryLevel2: '交易频次',
      interfaceName: 'txn_detail',
      originEnName: 'txn_cnt_30d',
      changedEnName: 'txn_cnt_30d',
      stdEnName: 'in_txn_cnt_30d',
      cnName: '近30日交易次数',
      meaning: '过去30日成功交易次数累计',
      processingLogic: '按用户维度统计近30日交易成功记录数',
      fieldType: 'INT',
      defaultValue: '0',
      sourceTable: 'dwd_trade_detail',
      sourceTableBigData: 'dwd_trade_detail_bigdata',
      tags: '交易,行为',
      dimensions: 'user_id,dt',
      onlineTime: '无',
      status: '待审核',
      remark: '评估阶段可补充标签/维度'
    },
    effectMetrics: {
      iv: 0.45,
      ks: 0.35,
      auc: 0.78,
      coverage: 1.0,
      lift: 20
    },
    costMetrics: {
      pricePerCall: 0,
      monthlyCalls: 200000,
      monthlyCost: 0,
      costTrend: 'stable'
    }
  },
  {
    id: 'VAR-0004',
    name: '征信-近半年逾期次数',
    code: 'CR_OVERDUE_CNT_6M',
    type: 'numerical',
    status: 'inactive',
    description: '征信报告近 6 个月逾期次数',
    dataSource: 'credit',
    dataSourceName: '征信报告',
    sourceField: 'overdue_cnt_6m',
    updateFrequency: '月',
    quality: 85,
    missingRate: 0.1,
    uniqueValueCount: 30,
    definition: '近 6 个月逾期次数累计',
    creator: '风险数据团队',
    createdAt: fmt(new Date(now.getTime() - 60 * 86400000)),
    updatedAt: fmt(new Date(now.getTime() - 10 * 86400000)),
    sourceType: 'credit',
    category: 'credit',
    profile: {
      categoryLevel1: '征信',
      categoryLevel2: '逾期',
      interfaceName: 'credit_report',
      originEnName: 'overdue_cnt_6m',
      changedEnName: 'overdue_cnt_6m',
      stdVariableEnName: 'cr_overdue_cnt_6m',
      stdVariableCnName: '近半年逾期次数',
      processingLogic: '从征信报告明细汇总近6个月逾期次数',
      fieldType: 'INT',
      defaultValue: '0',
      sourceTable: 'ods_credit_report_detail',
      stdTable: 'dwd_credit_report_summary',
      tags: '征信,逾期',
      onlineTime: fmt(new Date(now.getTime() - 90 * 86400000)),
      status: '下线',
      remark: '历史变量，已停用归档',
      orgList: '无',
      grayList: '无'
    },
    effectMetrics: {
      iv: 0.52,
      ks: 0.42,
      auc: 0.83,
      coverage: 0.88,
      lift: 22
    },
    costMetrics: {
      pricePerCall: 2.8,
      monthlyCalls: 50000,
      monthlyCost: 140000,
      costTrend: 'stable'
    }
  }
]
