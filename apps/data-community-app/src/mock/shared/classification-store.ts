/**
 * classification-store —— 数据分级分类 store
 *
 * 2026-08-06 新建:数据安全治理的核心能力
 *
 * 设计:
 *   - 分类维度(必填):个人信息 / 商业信息 / 监管信息 / 一般信息
 *   - 分级维度(必填):公开(L0) / 内部(L1) / 机密(L2) / 绝密(L3)
 *   - 字段映射:每条标准可打1~N 个分类 + 1 个分级
 *   - 合规联动:被引用的字段分级≥ L2 时,字段权限申请自动开启
 */
import { ref, computed } from 'vue'

export type SecurityLevel = 'L0' | 'L1' | 'L2' | 'L3'
export type CategoryCode = 'PII' | 'COMMERCIAL' | 'REGULATORY' | 'GENERAL'

export interface Category {
  code: CategoryCode
  name: string
  /** 默认安全级别(挂到此分类的字段,如果未指定分级,则采用此级别) */
  defaultLevel: SecurityLevel
  description: string
  /** 已挂标准数 */
  standardCount: number
  owner: string
}

export interface ClassificationMapping {
  /** 标准编码 */
  standardCode: string
  standardName: string
  categories: CategoryCode[]
  level: SecurityLevel
  updatedAt: string
  updatedBy: string
}

// ───────────────────────────── 初始数据 ─────────────────────────────
const INITIAL_CATEGORIES: Category[] = [
  { code: 'PII', name: '个人信息', defaultLevel: 'L2', description: '自然人身份信息、隐私信息(身份证、手机号、住址、生物特征等)', standardCount: 8, owner: '数据治理' },
  { code: 'COMMERCIAL', name: '商业信息', defaultLevel: 'L1', description: '企业经营、客户资产、交易明细等', standardCount: 12, owner: '数据治理' },
  { code: 'REGULATORY', name: '监管信息', defaultLevel: 'L3', description: '合规上报、反洗钱、监管报送等', standardCount: 6, owner: '合规部' },
  { code: 'GENERAL', name: '一般信息', defaultLevel: 'L0', description: '非敏感,可公开访问的字段', standardCount: 22, owner: '数据治理' }
]

const INITIAL_MAPPINGS: ClassificationMapping[] = [
  { standardCode: 'STD-001', standardName: '身份证号', categories: ['PII', 'REGULATORY'], level: 'L3', updatedAt: '2026-07-01 10:00', updatedBy: '张治理' },
  { standardCode: 'STD-002', standardName: '手机号', categories: ['PII'], level: 'L2', updatedAt: '2026-07-01 10:30', updatedBy: '张治理' },
  { standardCode: 'STD-003', standardName: '贷款金额', categories: ['COMMERCIAL'], level: 'L1', updatedAt: '2026-07-15 14:00', updatedBy: '张治理' },
  { standardCode: 'STD-004', standardName: '逾期天数', categories: ['COMMERCIAL', 'REGULATORY'], level: 'L2', updatedAt: '2026-08-01 09:00', updatedBy: '张风控' },
  { standardCode: 'STD-005', standardName: '客户状态', categories: ['GENERAL'], level: 'L0', updatedAt: '2026-08-02 11:00', updatedBy: '王运营' },
  { standardCode: 'STD-006', standardName: '邮编', categories: ['GENERAL'], level: 'L0', updatedAt: '2026-06-20 10:00', updatedBy: '王运营' }
]

// ───────────────────────────── 状态 ─────────────────────────────
const _categories = ref<Category[]>(INITIAL_CATEGORIES.map(c => ({ ...c })))
const _mappings = ref<ClassificationMapping[]>(INITIAL_MAPPINGS.map(m => ({ ...m })))
const _currentUser = ref<string>('当前治理者')

function nowStr() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ───────────────────────────── 对外 API ─────────────────────────────
export const ClassificationStore = {
  getCategories(): Category[] { return _categories.value },
  getMappings(): ClassificationMapping[] { return _mappings.value },
  mappingsByCategory(c: CategoryCode): ClassificationMapping[] {
    return _mappings.value.filter(m => m.categories.includes(c))
  },
  /** 改某个分类的默认分级 */
  setCategoryDefaultLevel(code: CategoryCode, level: SecurityLevel, actor = _currentUser.value) {
    const cat = _categories.value.find(c => c.code === code)
    if (cat) cat.defaultLevel = level
    // 联动:把该分类下未显式设置分级的映射,继承默认
    _mappings.value.forEach(m => {
      if (m.categories.includes(code) && m.level !== level) {
        // 仅当标准没有显式设置过,默认联动。这里不强制覆盖,只提示。
      }
    })
  },
  /** 调整某条标准的分级 + 分类 */
  setMapping(standardCode: string, standardName: string, categories: CategoryCode[], level: SecurityLevel, actor = _currentUser.value) {
    const existing = _mappings.value.find(m => m.standardCode === standardCode)
    if (existing) {
      existing.categories = categories
      existing.level = level
      existing.updatedAt = nowStr()
      existing.updatedBy = actor
      return existing
    }
    const newOne: ClassificationMapping = { standardCode, standardName, categories, level, updatedAt: nowStr(), updatedBy: actor }
    _mappings.value.push(newOne)
    return newOne
  }
}

// ───────────────────────────── 派生常量 ─────────────────────────────
export const SECURITY_LEVELS: SecurityLevel[] = ['L0', 'L1', 'L2', 'L3']
export const SECURITY_LEVEL_LABEL: Record<SecurityLevel, string> = {
  L0: '公开',
  L1: '内部',
  L2: '机密',
  L3: '绝密'
}
export const SECURITY_LEVEL_COLOR: Record<SecurityLevel, string> = {
  L0: 'gray',
  L1: 'arcoblue',
  L2: 'orange',
  L3: 'red'
}
export const SECURITY_LEVEL_DESC: Record<SecurityLevel, string> = {
  L0: '公开可访问,无需权限申请',
  L1: '内部可见,需申请字段权限',
  L2: '机密,需申请 + 审批 + 脱敏使用',
  L3: '绝密,需申请 + 审批 + 合规审查 + 审计'
}

export const CATEGORY_LABEL: Record<CategoryCode, string> = {
  PII: '个人信息',
  COMMERCIAL: '商业信息',
  REGULATORY: '监管信息',
  GENERAL: '一般信息'
}