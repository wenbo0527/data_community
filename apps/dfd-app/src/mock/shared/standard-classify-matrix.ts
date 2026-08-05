/**
 * 标准 ↔ 分级 矩阵(打通 #4)
 *
 * 当用户给字段打标准时,系统根据:
 *   - standardCode(数据标准)
 *   - businessBelonging(业务归属)
 *   - dataTypeCategory(数据类型分类)
 *
 * 自动推荐敏感级别(矩阵驱动),用户可手动调整。
 */

import type { SensitivityLevel, Grade, BusinessBelonging } from './classify-types'

/** 数据类型分类(从标准 dataType 推导) */
export type DataTypeCategory =
  | 'ID'        // 编号类(身份证号、客户号...)
  | 'AMT'       // 金额类(余额、额度...)
  | 'NAME'      // 姓名类
  | 'PHONE'     // 联系方式
  | 'ADDR'      // 地址类
  | 'CODE'      // 枚举/代码类
  | 'DATE'      // 时间类
  | 'NUM'       // 数值(非金额)
  | 'TEXT'      // 文本
  | 'BOOL'      // 布尔
  | 'OTHER'     // 其他

/** 矩阵条目 */
export interface StandardClassifyMatrix {
  id: string
  /** 数据类型分类 */
  dataTypeCategory: DataTypeCategory
  /** 业务归属 */
  businessBelonging: BusinessBelonging
  /** 默认敏感级别 */
  defaultSensitivity: SensitivityLevel
  /** 默认分级 */
  defaultGrade: Grade
  /** 推断理由(给用户看) */
  reason: string
  /** 是否需要人工确认 */
  requireManualConfirm: boolean
  /** 法律法规依据 */
  legalBasis?: string
}

/**
 * 标准 - 分级映射矩阵
 *
 * 行:业务归属 + 数据类型分类
 * 列:默认敏感级别 + 分级 + 理由
 */
export const STANDARD_CLASSIFY_MATRIX: StandardClassifyMatrix[] = [
  // === 身份证号(ID)===
  { id: 'm_id_retail', dataTypeCategory: 'ID', businessBelonging: '零售', defaultSensitivity: 'L3', defaultGrade: '关键', reason: '身份证号属个人识别信息,零售场景高敏', requireManualConfirm: true, legalBasis: '《个人信息保护法》第 28 条' },
  { id: 'm_id_corp', dataTypeCategory: 'ID', businessBelonging: '对公', defaultSensitivity: 'L2', defaultGrade: '关键', reason: '对公身份证号用于业务核验,中敏', requireManualConfirm: true },
  { id: 'm_id_risk', dataTypeCategory: 'ID', businessBelonging: '风控', defaultSensitivity: 'L3', defaultGrade: '关键', reason: '风控场景身份证必填,高敏', requireManualConfirm: true },

  // === 姓名(NAME)===
  { id: 'm_name_retail', dataTypeCategory: 'NAME', businessBelonging: '零售', defaultSensitivity: 'L2', defaultGrade: '重要', reason: '姓名 + 零售场景,中敏', requireManualConfirm: false },
  { id: 'm_name_risk', dataTypeCategory: 'NAME', businessBelonging: '风控', defaultSensitivity: 'L3', defaultGrade: '关键', reason: '姓名 + 风控场景,高敏', requireManualConfirm: true },

  // === 手机号(PHONE)===
  { id: 'm_phone_retail', dataTypeCategory: 'PHONE', businessBelonging: '零售', defaultSensitivity: 'L3', defaultGrade: '关键', reason: '手机号属个人联系方式,高敏', requireManualConfirm: true, legalBasis: '《个人信息保护法》' },
  { id: 'm_phone_marketing', dataTypeCategory: 'PHONE', businessBelonging: '运营', defaultSensitivity: 'L3', defaultGrade: '关键', reason: '营销场景手机号高敏,需授权', requireManualConfirm: true },
  { id: 'm_phone_risk', dataTypeCategory: 'PHONE', businessBelonging: '风控', defaultSensitivity: 'L2', defaultGrade: '关键', reason: '风控场景手机号用于核验,中敏', requireManualConfirm: false },

  // === 地址(ADDR)===
  { id: 'm_addr_retail', dataTypeCategory: 'ADDR', businessBelonging: '零售', defaultSensitivity: 'L2', defaultGrade: '重要', reason: '地址属个人信息,中敏', requireManualConfirm: false },
  { id: 'm_addr_risk', dataTypeCategory: 'ADDR', businessBelonging: '风控', defaultSensitivity: 'L3', defaultGrade: '重要', reason: '风控地址关联,高敏', requireManualConfirm: true },

  // === 金额(AMT)===
  { id: 'm_amt_retail', dataTypeCategory: 'AMT', businessBelonging: '零售', defaultSensitivity: 'L2', defaultGrade: '关键', reason: '零售金额(账户余额),中敏', requireManualConfirm: false },
  { id: 'm_amt_corp', dataTypeCategory: 'AMT', businessBelonging: '对公', defaultSensitivity: 'L3', defaultGrade: '关键', reason: '对公金额(授信额度),高敏', requireManualConfirm: true },
  { id: 'm_amt_risk', dataTypeCategory: 'AMT', businessBelonging: '风控', defaultSensitivity: 'L3', defaultGrade: '关键', reason: '风控金额(逾期金额),高敏', requireManualConfirm: true },
  { id: 'm_amt_finance', dataTypeCategory: 'AMT', businessBelonging: '财务', defaultSensitivity: 'L3', defaultGrade: '关键', reason: '财务金额(清分金额),高敏', requireManualConfirm: true, legalBasis: '《会计法》' },

  // === 枚举(CODE)===
  { id: 'm_code_retail', dataTypeCategory: 'CODE', businessBelonging: '零售', defaultSensitivity: 'L1', defaultGrade: '一般', reason: '零售枚举(状态码),低敏', requireManualConfirm: false },
  { id: 'm_code_risk', dataTypeCategory: 'CODE', businessBelonging: '风控', defaultSensitivity: 'L2', defaultGrade: '重要', reason: '风控枚举(风险等级),中敏', requireManualConfirm: false },
  { id: 'm_code_finance', dataTypeCategory: 'CODE', businessBelonging: '财务', defaultSensitivity: 'L2', defaultGrade: '重要', reason: '财务枚举(计费类型),中敏', requireManualConfirm: false },

  // === 时间(DATE)===
  { id: 'm_date_retail', dataTypeCategory: 'DATE', businessBelonging: '零售', defaultSensitivity: 'L1', defaultGrade: '一般', reason: '业务时间,低敏', requireManualConfirm: false },
  { id: 'm_date_risk', dataTypeCategory: 'DATE', businessBelonging: '风控', defaultSensitivity: 'L2', defaultGrade: '重要', reason: '风控时间(逾期起始日),中敏', requireManualConfirm: false },

  // === 数值(NUM)===
  { id: 'm_num_retail', dataTypeCategory: 'NUM', businessBelonging: '零售', defaultSensitivity: 'L1', defaultGrade: '一般', reason: '业务数值,低敏', requireManualConfirm: false },
  { id: 'm_num_risk', dataTypeCategory: 'NUM', businessBelonging: '风控', defaultSensitivity: 'L2', defaultGrade: '重要', reason: '风控数值(评分),中敏', requireManualConfirm: false },

  // === 文本(TEXT)===
  { id: 'm_text_retail', dataTypeCategory: 'TEXT', businessBelonging: '零售', defaultSensitivity: 'L1', defaultGrade: '一般', reason: '业务文本,低敏', requireManualConfirm: false },
  { id: 'm_text_risk', dataTypeCategory: 'TEXT', businessBelonging: '风控', defaultSensitivity: 'L3', defaultGrade: '重要', reason: '风控文本(欺诈描述),高敏', requireManualConfirm: true },

  // === 布尔(BOOL)===
  { id: 'm_bool_retail', dataTypeCategory: 'BOOL', businessBelonging: '零售', defaultSensitivity: 'L1', defaultGrade: '一般', reason: '业务标志,低敏', requireManualConfirm: false }
]

/**
 * 矩阵 Store
 */
export const StandardClassifyMatrixStore = {
  list(): StandardClassifyMatrix[] {
    return STANDARD_CLASSIFY_MATRIX
  },

  /**
   * 根据 数据类型分类 + 业务归属 推荐敏感级别
   */
  lookup(params: {
    dataTypeCategory: DataTypeCategory
    businessBelonging: BusinessBelonging
  }): StandardClassifyMatrix | undefined {
    return STANDARD_CLASSIFY_MATRIX.find(
      m => m.dataTypeCategory === params.dataTypeCategory &&
           m.businessBelonging === params.businessBelonging
    )
  },

  /**
   * 智能推荐:根据数据类型字符串 + 业务归属
   */
  inferFromType(dataType: string, businessBelonging: BusinessBelonging): StandardClassifyMatrix | undefined {
    const lower = (dataType || '').toLowerCase()
    const upper = (dataType || '').toUpperCase()

    let category: DataTypeCategory = 'OTHER'
    if (upper.includes('ID') || lower.includes('id')) category = 'ID'
    else if (upper.includes('AMT') || upper.includes('MONEY') || upper.includes('BAL')) category = 'AMT'
    else if (upper.includes('NAME')) category = 'NAME'
    else if (upper.includes('PHONE') || upper.includes('MOBILE') || upper.includes('TEL')) category = 'PHONE'
    else if (upper.includes('ADDR') || upper.includes('ADDRESS')) category = 'ADDR'
    else if (upper.includes('CODE') || upper.includes('TYPE') || upper.includes('STATUS')) category = 'CODE'
    else if (upper.includes('DATE') || upper.includes('TIME') || upper.includes('DT')) category = 'DATE'
    else if (upper.includes('AMT') || upper.includes('MONEY') || upper.includes('BAL') || upper.includes('DECIMAL')) category = 'AMT'
    else if (upper.includes('NUM') || upper.includes('INT')) category = 'NUM'
    else if (upper.includes('TEXT') || upper.includes('VARCHAR') || upper.includes('CHAR') || upper.includes('STR')) category = 'TEXT'
    else if (upper.includes('BOOL') || upper.includes('FLAG')) category = 'BOOL'

    return this.lookup({ dataTypeCategory: category, businessBelonging })
  },

  /** 统计 */
  stats() {
    return {
      total: STANDARD_CLASSIFY_MATRIX.length,
      bySensitivity: {
        L1: STANDARD_CLASSIFY_MATRIX.filter(m => m.defaultSensitivity === 'L1').length,
        L2: STANDARD_CLASSIFY_MATRIX.filter(m => m.defaultSensitivity === 'L2').length,
        L3: STANDARD_CLASSIFY_MATRIX.filter(m => m.defaultSensitivity === 'L3').length
      },
      byBusinessBelonging: {
        零售: STANDARD_CLASSIFY_MATRIX.filter(m => m.businessBelonging === '零售').length,
        对公: STANDARD_CLASSIFY_MATRIX.filter(m => m.businessBelonging === '对公').length,
        风控: STANDARD_CLASSIFY_MATRIX.filter(m => m.businessBelonging === '风控').length,
        运营: STANDARD_CLASSIFY_MATRIX.filter(m => m.businessBelonging === '运营').length,
        财务: STANDARD_CLASSIFY_MATRIX.filter(m => m.businessBelonging === '财务').length
      }
    }
  }
}