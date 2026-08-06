import type { VariableAssetMock, VariableCategory, VariableSourceType } from '@/modules/variable-hub/mock/variable-management/variables'

export interface VariableDraftSource {
  topicId?: string
  experimentId?: string
  decisionId?: string
  derivedFromId?: string
}

/**
 * 完整注册表单字段（B1 R01-R24）
 */
export interface RegisterFormPayload {
  // ============ 特征核心属性 ============
  /** 特征英文名（必填，≤30字，不可重复，仅英文大小写+下划线）*/
  name: string
  /** 特征中文名（必填，不可重复）*/
  featureCnName: string
  /** 字段类型（必填，Integer/Double/Boolean/String）*/
  fieldType: 'Integer' | 'Double' | 'Boolean' | 'String'
  /** 加工逻辑（必填，长文本）*/
  processingLogic: string
  /** 默认值（非必填）*/
  defaultValue?: string
  // ============ 特征分类信息 ============
  /** 特征分类（默认 midloan_behavior，一期固定）*/
  category: VariableCategory
  /** 一级分类（必填）*/
  l1Category: string
  /** 二级分类（必填，与一级联动）*/
  l2Category: string
  // ============ 来源与时效 ============
  /** 数据时效（实时/离线T-1/离线T-2）*/
  dataFreshness?: 'realtime' | 'offline_t1' | 'offline_t2'
  /** 标准化后来源表（非必填）*/
  sourceTableAfter?: string
  /** 标准化前来源表（非必填）*/
  sourceTableBefore?: string
  /** 原特征英文名（非必填）*/
  sourceField?: string
  // ============ 协作信息 ============
  /** 产品范围 */
  productScope?: string
  /** 名单类型 */
  listType?: string
  /** 批次 */
  batch?: string
  /** 验收人（默认带入创建人）*/
  acceptor?: string
  /** 备注 */
  remark?: string
  /** 开发人员（必填，从数仓团队列表选择）*/
  developer?: string
  /** 创建人（自动带入当前登录用户）*/
  creator?: string
  /** 数据源类型（外数/征信/内数）*/
  sourceType?: VariableSourceType
  /** 数据底表名称（非必填，可暂空）*/
  dataTableName?: string
  /** 数仓任务ID（非必填）*/
  dwTaskId?: string
  /** Excel 评估报告附件（文件名/大小）*/
  excelAttachment?: { name: string; size: number; uploadedAt: string }
}

export type VariableDraftMock = VariableAssetMock & {
  draftSource?: VariableDraftSource
}

const STORAGE_KEY = 'variable.management.extraAssets'

function safeParse(raw: string | null): VariableDraftMock[] {
  if (!raw) return []
  try {
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function readAll(): VariableDraftMock[] {
  return safeParse(localStorage.getItem(STORAGE_KEY))
}

function writeAll(list: VariableDraftMock[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function pad(num: number, len = 4) {
  return String(num).padStart(len, '0')
}

function buildNextDraftId(existing: string[]) {
  const prefix = 'MIDLOAN-FEAT-DRAFT-'
  const nums = existing
    .filter((id) => id.startsWith(prefix))
    .map((id) => Number(id.slice(prefix.length)))
    .filter((n) => !Number.isNaN(n))
  const next = (nums.length ? Math.max(...nums) : 0) + 1
  return `${prefix}${pad(next)}`
}

function nowFmt() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

/**
 * 一级分类 → 二级分类映射（B1 R08/R09 联动）
 */
export const L1_L2_CATEGORY_MAP: Record<string, string[]> = {
  credit_grant: ['credit_grant_amount', 'credit_grant_behavior', 'credit_grant_risk'],
  collection: ['collection_behavior', 'collection_response'],
  repayment: ['repayment_behavior', 'repayment_volatility'],
  fraud: ['fraud_behavior', 'fraud_geo', 'fraud_device'],
  risk_model: ['model_input', 'model_output']
}

/** 字段类型枚举 */
export const FIELD_TYPE_OPTIONS = [
  { value: 'Integer', label: 'Integer（整数）' },
  { value: 'Double', label: 'Double（双精度）' },
  { value: 'Boolean', label: 'Boolean（布尔）' },
  { value: 'String', label: 'String（字符串）' }
]

/** 数据时效枚举 */
export const DATA_FRESHNESS_OPTIONS = [
  { value: 'realtime', label: '实时' },
  { value: 'offline_t1', label: '离线 T-1（次日）' },
  { value: 'offline_t2', label: '离线 T-2（隔日）' }
]

/** 一级分类枚举 */
export const L1_CATEGORY_OPTIONS = Object.keys(L1_L2_CATEGORY_MAP).map((k) => ({ value: k, label: k }))

/** 数据源类型枚举 */
export const SOURCE_TYPE_OPTIONS = [
  { value: 'internal', label: '内数（自研/数仓）' },
  { value: 'external', label: '外数（第三方）' },
  { value: 'credit', label: '征信' }
]

/**
 * 校验特征英文名（R02）：≤30字、英文大小写+下划线、不允许特殊字符/空格、不可重复
 */
export function validateFeatureName(name: string, existingNames: string[]): string | null {
  if (!name) return '特征英文名必填'
  if (name.length > 30) return '特征英文名不超过 30 字'
  if (!/^[A-Za-z_]+$/.test(name)) return '特征英文名仅允许英文大小写字母与下划线'
  if (existingNames.includes(name)) return '特征英文名不可重复'
  return null
}

/**
 * 校验中文名（R03）：不可重复、不能为空
 */
export function validateFeatureCnName(name: string, existingCnNames: string[]): string | null {
  if (!name || !name.trim()) return '特征中文名必填'
  if (existingCnNames.includes(name.trim())) return '特征中文名不可重复'
  return null
}

/** 默认草稿仓库 */
export const VariableDraftStore = {
  list(): VariableDraftMock[] {
    return readAll()
  },

  /**
   * 完整注册表单提交：写入草稿仓库并返回生成的特征资产对象
   */
  addDraft(payload: RegisterFormPayload): VariableDraftMock {
    const existing = readAll()
    const id = buildNextDraftId(existing.map((item) => item.id))
    const now = nowFmt()
    const creator = payload.creator || '小李'
    const item: VariableDraftMock = {
      id,
      // 兼容 variables.ts 的字段映射
      name: payload.name,
      featureCnName: payload.featureCnName,
      code: payload.name,
      type: payload.fieldType === 'String' ? 'categorical' : 'numerical',
      status: 'registered', // B1 R21：提交后状态=已注册
      midloanStatus: 'registered',
      midloanFeatureId: id,
      description: payload.processingLogic,
      dataSource: payload.sourceType === 'external' ? 'external' : payload.sourceType === 'credit' ? 'credit' : 'internal',
      dataSourceName: payload.sourceType === 'external' ? '外部数据源（外数）' : payload.sourceType === 'credit' ? '征信机构' : '数仓（内数）',
      creator,
      createdAt: now,
      updatedAt: now,
      sourceType: payload.sourceType || 'internal',
      category: payload.category || 'midloan_behavior',
      fieldType: payload.fieldType,
      processingLogic: payload.processingLogic,
      defaultValue: payload.defaultValue || '',
      l1Category: payload.l1Category,
      l2Category: payload.l2Category,
      dataFreshness: payload.dataFreshness,
      sourceTableAfter: payload.sourceTableAfter,
      sourceTableBefore: payload.sourceTableBefore,
      sourceField: payload.sourceField,
      // 协作信息（写入 profile 便于详情页展示）
      profile: {
        dataType: payload.category === 'credit' ? '征信' : payload.category === 'external' ? '外数' : '行为',
        onlineStatus: '已注册',
        productScope: payload.productScope,
        listType: payload.listType,
        batch: payload.batch,
        acceptor: payload.acceptor || creator,
        remark: payload.remark,
        developer: payload.developer,
        excelAttachment: payload.excelAttachment,
        registeredAt: now
      },
      // 数据底表/数仓任务ID（B1 R17/R18）
      dataTableName: payload.dataTableName,
      dwTaskId: payload.dwTaskId,
      // 补充协作字段到顶层（兼容详情页读取）
      acceptor: payload.acceptor || creator,
      // 来源与时效元信息
      upstreamTable: payload.sourceTableAfter
    }
    writeAll([item, ...existing])
    return item
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export default VariableDraftStore