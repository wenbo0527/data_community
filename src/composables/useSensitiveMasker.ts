/**
 * 数据脱敏引擎(SensitiveMasker)
 *
 * 主流(Alation / DataHub)支持数据脱敏引擎:
 *   - 身份证号:保留前 6 后 4 → 110101********1234
 *   - 手机号:中间 4 位 *    → 138****1234
 *   - 邮箱:@ 前 1 位 *      → z***@gmail.com
 *   - 银行卡:保留后 4      → **** **** **** 1234
 *
 * 通过 useFieldPermission 联动:不可见字段 → 全部脱敏
 */

export type MaskingStrategy =
  | 'none'           // 不脱敏
  | 'partial'        // 部分可见
  | 'full'           // 全脱敏
  | 'hash'           // 哈希脱敏

export interface MaskingConfig {
  strategy: MaskingStrategy
  /** 部分脱敏保留前缀长度 */
  prefixLen?: number
  /** 部分脱敏保留后缀长度 */
  suffixLen?: number
  /** 替换字符 */
  replaceChar?: string
  /** 哈希算法 */
  hashAlgo?: 'md5' | 'sha256' | 'simple'
}

/**
 * 预置脱敏策略
 */
export const MASKING_PRESETS: Record<string, MaskingConfig> = {
  id_card:      { strategy: 'partial', prefixLen: 6, suffixLen: 4, replaceChar: '*' },
  mobile:       { strategy: 'partial', prefixLen: 3, suffixLen: 4, replaceChar: '*' },
  phone:        { strategy: 'partial', prefixLen: 3, suffixLen: 4, replaceChar: '*' },
  email:        { strategy: 'partial', prefixLen: 1, suffixLen: 0, replaceChar: '*' },
  bank_card:    { strategy: 'partial', prefixLen: 0, suffixLen: 4, replaceChar: '*' },
  credit_card:  { strategy: 'partial', prefixLen: 0, suffixLen: 4, replaceChar: '*' },
  name:         { strategy: 'partial', prefixLen: 1, suffixLen: 0, replaceChar: '*' },
  address:      { strategy: 'partial', prefixLen: 6, suffixLen: 0, replaceChar: '*' },
  default:      { strategy: 'partial', prefixLen: 2, suffixLen: 2, replaceChar: '*' },
  full:         { strategy: 'full', replaceChar: '*' },
  hash:         { strategy: 'hash', hashAlgo: 'simple' }
}

/**
 * 简单哈希(仅前端展示用,非真哈希)
 */
function simpleHash(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}

/**
 * 主脱敏函数
 */
export function maskValue(rawValue: any, config: MaskingConfig | string): string {
  if (rawValue === null || rawValue === undefined) return ''
  const str = String(rawValue)
  const cfg = typeof config === 'string' ? MASKING_PRESETS[config] || MASKING_PRESETS.default : config
  const replaceChar = cfg.replaceChar || '*'

  switch (cfg.strategy) {
    case 'none':
      return str

    case 'partial': {
      const prefixLen = cfg.prefixLen || 0
      const suffixLen = cfg.suffixLen || 0
      if (str.length <= prefixLen + suffixLen) {
        return replaceChar.repeat(str.length)
      }
      const prefix = str.slice(0, prefixLen)
      const suffix = str.slice(str.length - suffixLen)
      const middle = replaceChar.repeat(str.length - prefixLen - suffixLen)
      return prefix + middle + suffix
    }

    case 'full':
      return replaceChar.repeat(Math.min(str.length, 12))

    case 'hash':
      return `hash_${simpleHash(str)}`

    default:
      return str
  }
}

/**
 * 根据敏感级别推断脱敏策略
 */
export function autoMaskBySensitivity(sensitivity: string, value: any): string {
  const strategyMap: Record<string, string | MaskingConfig> = {
    L1: { strategy: 'none' },
    L2: { strategy: 'partial', prefixLen: 3, suffixLen: 4, replaceChar: '*' },
    L3: { strategy: 'partial', prefixLen: 6, suffixLen: 4, replaceChar: '*' },
    L4: { strategy: 'full', replaceChar: '*' }
  }
  const strategy = strategyMap[sensitivity] || strategyMap['L1']
  return maskValue(value, strategy as any)
}

/**
 * 字段批量脱敏(配合 FieldLinkStore 一起用)
 */
export function maskField(tableName: string, fieldName: string, value: any): string {
  // 根据字段名启发式选择策略
  const name = fieldName.toLowerCase()
  if (name.includes('id_card') || name.includes('idcard') || name.includes('identity')) {
    return maskValue(value, 'id_card')
  }
  if (name.includes('mobile') || name.includes('phone')) {
    return maskValue(value, 'mobile')
  }
  if (name.includes('email')) {
    return maskValue(value, 'email')
  }
  if (name.includes('bank') || name.includes('card_no')) {
    return maskValue(value, 'bank_card')
  }
  if (name.includes('name') && !name.includes('user_name')) {
    return maskValue(value, 'name')
  }
  return maskValue(value, 'default')
}

/**
 * Composable:在组件中使用
 */
export function useSensitiveMasker() {
  return {
    maskValue,
    autoMaskBySensitivity,
    maskField,
    presets: MASKING_PRESETS
  }
}

/**
 * 已知样本(便于 UI 演示)
 */
export const MASKING_SAMPLES: Array<{ label: string; raw: string; masked: string }> = [
  { label: '身份证号', raw: '110101199001011234', masked: maskValue('110101199001011234', 'id_card') },
  { label: '手机号', raw: '13800001234', masked: maskValue('13800001234', 'mobile') },
  { label: '邮箱', raw: 'zhangsan@company.com', masked: maskValue('zhangsan@company.com', 'email') },
  { label: '银行卡', raw: '6222600012345678', masked: maskValue('6222600012345678', 'bank_card') },
  { label: '姓名', raw: '张三', masked: maskValue('张三', 'name') },
  { label: 'L3 完整脱敏', raw: '110101199001011234', masked: maskValue('110101199001011234', 'full') },
  { label: 'L4 哈希脱敏', raw: '110101199001011234', masked: maskValue('110101199001011234', 'hash') }
]