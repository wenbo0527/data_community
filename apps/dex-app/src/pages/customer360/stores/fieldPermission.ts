import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 单字段权限三元组（PRD §4.4 R01）
export interface FieldPermission {
  fieldKey: string         // 字段路径，如 "customer.idCard" / "loan.loanNo"
  fieldLabel: string       // 中文名，如 "身份证号" / "用信编号"
  visible: boolean         // 是否可见
  copyable: boolean        // 是否可复制
  searchable: boolean      // 是否可搜索
}

export const useFieldPermissionStore = defineStore('fieldPermission', () => {
  // 全量字段权限配置（mock 演示：默认全部 visible+copyable+searchable）
  // 真实场景从 /api/dex/customer360/field-config 拉取
  const fields = ref<FieldPermission[]>([
    // ===== 客户基本信息 =====
    { fieldKey: 'customer.name',         fieldLabel: '客户姓名',   visible: true, copyable: true, searchable: true },
    { fieldKey: 'customer.idCard',       fieldLabel: '身份证号',   visible: true, copyable: false, searchable: false }, // 示例：R01 不可复制不可搜索
    { fieldKey: 'customer.phone',        fieldLabel: '手机号',     visible: true, copyable: true, searchable: true },
    { fieldKey: 'customer.birthDate',    fieldLabel: '出生日期',   visible: true, copyable: true, searchable: true },
    { fieldKey: 'customer.gender',       fieldLabel: '性别',       visible: true, copyable: true, searchable: true },
    { fieldKey: 'customer.email',        fieldLabel: '邮箱',       visible: true, copyable: true, searchable: true },
    { fieldKey: 'customer.address',      fieldLabel: '居住地址',   visible: true, copyable: true, searchable: true },
    { fieldKey: 'customer.company',      fieldLabel: '工作单位',   visible: true, copyable: true, searchable: true },
    // P0: 客户画像扩展
    { fieldKey: 'customer.customerLevel', fieldLabel: '客户等级',   visible: true, copyable: true, searchable: true },
    { fieldKey: 'customer.occupation',    fieldLabel: '职业',       visible: true, copyable: true, searchable: true },
    { fieldKey: 'customer.annualIncome',  fieldLabel: '年收入',     visible: true, copyable: true, searchable: true },
    { fieldKey: 'customer.marriage',      fieldLabel: '婚姻状况',   visible: true, copyable: true, searchable: true },

    // ===== 授信信息 =====
    { fieldKey: 'credit.creditProductId',     fieldLabel: '授信产品ID',   visible: true, copyable: true, searchable: true },
    { fieldKey: 'credit.creditApplicationId', fieldLabel: '授信申请ID',   visible: true, copyable: true, searchable: true },
    { fieldKey: 'credit.amount',              fieldLabel: '授信额度',     visible: true, copyable: true, searchable: true },
    { fieldKey: 'credit.balance',             fieldLabel: '在贷余额',     visible: true, copyable: true, searchable: true },
    { fieldKey: 'credit.interestRate',        fieldLabel: '利率',         visible: true, copyable: true, searchable: true },
    { fieldKey: 'credit.startDate',           fieldLabel: '授信起始日',   visible: true, copyable: true, searchable: true },
    { fieldKey: 'credit.maturityDate',        fieldLabel: '到期日',       visible: true, copyable: true, searchable: true },
    // P0: PRD §R08 关键豁免字段
    { fieldKey: 'credit.productName',         fieldLabel: '产品名称',     visible: true, copyable: true, searchable: true }, // R08 不受字段权限控制
    { fieldKey: 'credit.creditTime',          fieldLabel: '授信时间',     visible: true, copyable: true, searchable: true },
    { fieldKey: 'credit.bank',               fieldLabel: '资方银行',     visible: true, copyable: true, searchable: true },
    { fieldKey: 'credit.creditStatus',       fieldLabel: '授信状态',     visible: true, copyable: true, searchable: true },

    // ===== 用信信息 =====
    { fieldKey: 'loan.loanNo',          fieldLabel: '用信编号',     visible: true, copyable: true, searchable: true },
    { fieldKey: 'loan.loanProductId',   fieldLabel: '用信产品ID',   visible: true, copyable: true, searchable: true },
    { fieldKey: 'loan.loanProductName', fieldLabel: '用信产品名',   visible: true, copyable: true, searchable: true },
    { fieldKey: 'loan.amount',          fieldLabel: '用信金额',     visible: true, copyable: true, searchable: true },
    { fieldKey: 'loan.balance',         fieldLabel: '当前余额',     visible: true, copyable: true, searchable: true },
    { fieldKey: 'loan.loanDate',        fieldLabel: '用信日期',     visible: true, copyable: true, searchable: true },
    { fieldKey: 'loan.status',          fieldLabel: '用信状态',     visible: true, copyable: true, searchable: true },
    { fieldKey: 'loan.contractNo',      fieldLabel: '合同编号',     visible: true, copyable: true, searchable: true },
    // P0: 用信核心扩展
    { fieldKey: 'loan.channel',         fieldLabel: '申请渠道',     visible: true, copyable: true, searchable: true },
    { fieldKey: 'loan.installments',    fieldLabel: '分期数',       visible: true, copyable: true, searchable: true },
    { fieldKey: 'loan.currentPeriod',   fieldLabel: '当前期次',     visible: true, copyable: true, searchable: true },
    { fieldKey: 'loan.overdueDays',     fieldLabel: '逾期天数',     visible: true, copyable: true, searchable: true },
    { fieldKey: 'loan.maxOverdueDays',  fieldLabel: '历史最大逾期', visible: true, copyable: true, searchable: true },
    { fieldKey: 'loan.settlementDate',  fieldLabel: '结清日期',     visible: true, copyable: true, searchable: true },
    // P0: 剩余应还明细（PRD §视图 4 用信产品卡片直接展示）
    { fieldKey: 'loan.remainingPrincipal', fieldLabel: '剩余本金',    visible: true, copyable: true, searchable: true },
    { fieldKey: 'loan.remainingInterest',  fieldLabel: '剩余利息',    visible: true, copyable: true, searchable: true },
    { fieldKey: 'loan.remainingPenalty',   fieldLabel: '剩余罚息',    visible: true, copyable: true, searchable: true },
    { fieldKey: 'loan.remainingTotal',     fieldLabel: '剩余应还',    visible: true, copyable: true, searchable: true },
    // P1: 用信结果 + 三方客户号
    { fieldKey: 'loan.result',              fieldLabel: '申请结果',    visible: true, copyable: true, searchable: true },
    { fieldKey: 'loan.rejectReason',        fieldLabel: '拒绝原因',    visible: true, copyable: true, searchable: true },
    { fieldKey: 'loan.thirdPartyCustomerId', fieldLabel: '三方客户号', visible: true, copyable: true, searchable: true },
    { fieldKey: 'loan.id',                  fieldLabel: '借据ID',      visible: true, copyable: true, searchable: true },
    { fieldKey: 'loan.productKey',          fieldLabel: '产品Key',     visible: true, copyable: true, searchable: true },

    // ===== 征信信息 =====
    { fieldKey: 'creditReport.score',           fieldLabel: '信用评分',           visible: true, copyable: true, searchable: true },
    { fieldKey: 'creditReport.level',           fieldLabel: '信用等级',           visible: true, copyable: true, searchable: true },
    { fieldKey: 'creditReport.queryDate',       fieldLabel: '查询日期',           visible: true, copyable: true, searchable: true },
    { fieldKey: 'creditReport.utilization',     fieldLabel: '额度使用率',         visible: true, copyable: true, searchable: true },
    // P1: 征信报告基础
    { fieldKey: 'creditReport.reportId',        fieldLabel: '报告编号',           visible: true, copyable: true, searchable: true },
    { fieldKey: 'creditReport.source',          fieldLabel: '数据来源',           visible: true, copyable: true, searchable: true },
    { fieldKey: 'creditReport.reportStatus',    fieldLabel: '报告状态',           visible: true, copyable: true, searchable: true },
    // P1: 征信报告 - 信用总览（嵌套）
    { fieldKey: 'creditReport.creditOverview.creditCardAccounts',   fieldLabel: '信用卡账户数',   visible: true, copyable: true, searchable: true },
    { fieldKey: 'creditReport.creditOverview.loanAccounts',         fieldLabel: '贷款账户数',     visible: true, copyable: true, searchable: true },
    { fieldKey: 'creditReport.creditOverview.totalCreditLimit',     fieldLabel: '总授信额度',     visible: true, copyable: true, searchable: true },
    { fieldKey: 'creditReport.creditOverview.usedCredit',           fieldLabel: '已用额度',       visible: true, copyable: true, searchable: true },
    { fieldKey: 'creditReport.creditOverview.creditUtilizationRate', fieldLabel: '征信报告-额度使用率', visible: true, copyable: true, searchable: true },
    // P1: 征信报告 - 逾期信息（嵌套）
    { fieldKey: 'creditReport.overdueInfo.overdueCount',          fieldLabel: '累计逾期次数',   visible: true, copyable: true, searchable: true },
    { fieldKey: 'creditReport.overdueInfo.maxOverdueDays',        fieldLabel: '历史最大逾期天数', visible: true, copyable: true, searchable: true },
    { fieldKey: 'creditReport.overdueInfo.overdueAmount',         fieldLabel: '逾期金额',       visible: true, copyable: true, searchable: true },
    { fieldKey: 'creditReport.overdueInfo.currentOverdueCount',   fieldLabel: '当前逾期笔数',   visible: true, copyable: true, searchable: true },
    // P1: 征信报告 - 查询记录（嵌套）
    { fieldKey: 'creditReport.queryRecords.totalQueryCount',      fieldLabel: '累计查询次数',   visible: true, copyable: true, searchable: true },
    { fieldKey: 'creditReport.queryRecords.queriesLast3Months',    fieldLabel: '近3个月查询次数', visible: true, copyable: true, searchable: true }
  ])

  // 当前生效的字段权限（in-memory，PM 配置台调整后实时刷新生效）
  const updateField = (fieldKey: string, patch: Partial<FieldPermission>) => {
    const idx = fields.value.findIndex(f => f.fieldKey === fieldKey)
    if (idx >= 0) {
      // R01 强一致链：visible=false → copyable=false + searchable=false
      if (patch.visible === false) {
        patch.copyable = false
        patch.searchable = false
      }
      fields.value[idx] = { ...fields.value[idx], ...patch }
    }
  }

  // 查字段权限（用于前端过滤）
  const getField = (fieldKey: string): FieldPermission | undefined =>
    fields.value.find(f => f.fieldKey === fieldKey)

  // R01 校验：list 中字段不能跨越 visible=false 的字段
  const isCopyable = (fieldKey: string) => {
    const f = getField(fieldKey)
    return !!f && f.visible && f.copyable
  }

  const isSearchable = (fieldKey: string) => {
    const f = getField(fieldKey)
    return !!f && f.visible && f.searchable
  }

  const isVisible = (fieldKey: string) => {
    const f = getField(fieldKey)
    return !!f && f.visible
  }

  // 字段池（仅 visible=true 的字段可选）
  const availableFieldPool = computed(() => fields.value.filter(f => f.visible))

  return {
    fields,
    updateField,
    getField,
    isCopyable,
    isSearchable,
    isVisible,
    availableFieldPool
  }
})