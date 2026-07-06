export interface ExploreTaxonomyCategory {
  id: string
  title: string
  children?: ExploreTaxonomyCategory[]
}

export interface ExploreTaxonomyType {
  id: string
  title: string
  description: string
  categories: ExploreTaxonomyCategory[]
}

export interface ExploreTaxonomyConfig {
  version: string
  updatedAt: string
  types: ExploreTaxonomyType[]
}

const STORAGE_KEY = 'explore.taxonomy.config'

const defaultConfig: ExploreTaxonomyConfig = {
  version: 'v1',
  updatedAt: '2026-06-26 00:00:00',
  types: [
    {
      id: 'credit',
      title: '征信变量',
      description: '征信域相关变量，强调合规字段口径、账户视角和还款表现。',
      categories: [
        { id: 'credit-basic', title: '个人基本信息' },
        { id: 'credit-account', title: '账户信息' },
        { id: 'credit-amount', title: '信贷金额' },
        { id: 'credit-repay', title: '还款历史' }
      ]
    },
    {
      id: 'behavior',
      title: '行为变量',
      description: '行为域变量，强调过程信号、行为变化和风险前置特征。',
      categories: [
        { id: 'behavior-attack', title: '撞库类' },
        { id: 'behavior-loan', title: '支用行为类' },
        { id: 'behavior-clean', title: '清退信息类' }
      ]
    },
    {
      id: 'external',
      title: '外数变量',
      description: '外部数据/服务产生的变量，强调成本收益、供应商 SLA 与证据链。',
      categories: [
        { id: 'external-multi-loan', title: '多头借贷' },
        { id: 'external-device', title: '设备指纹' },
        { id: 'external-score', title: '外部评分' }
      ]
    }
  ]
}

function safeParse(raw: string | null): ExploreTaxonomyConfig | null {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function flattenCategories(categories: ExploreTaxonomyCategory[]) {
  const result: Array<{ id: string; title: string; parentId?: string }> = []
  const walk = (items: ExploreTaxonomyCategory[], parentId?: string) => {
    items.forEach((item) => {
      result.push({ id: item.id, title: item.title, parentId })
      if (Array.isArray(item.children) && item.children.length) {
        walk(item.children, item.id)
      }
    })
  }
  walk(categories)
  return result
}

export const ExploreTaxonomyStore = {
  getConfig(): ExploreTaxonomyConfig {
    const raw = safeParse(localStorage.getItem(STORAGE_KEY))
    if (raw?.types?.length) return raw
    return defaultConfig
  },
  saveConfig(config: ExploreTaxonomyConfig) {
    const payload: ExploreTaxonomyConfig = {
      ...config,
      updatedAt: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  },
  reset() {
    localStorage.removeItem(STORAGE_KEY)
  },
  listTypes() {
    return ExploreTaxonomyStore.getConfig().types
  },
  getTypeById(typeId: string) {
    return ExploreTaxonomyStore.listTypes().find((item) => item.id === typeId)
  },
  listLeafCategories(typeId: string) {
    const type = ExploreTaxonomyStore.getTypeById(typeId)
    if (!type) return []
    const flat = flattenCategories(type.categories)
    const hasChildren = new Set(flat.filter((item) => item.parentId).map((item) => item.parentId as string))
    return flat.filter((item) => !hasChildren.has(item.id))
  }
}

export default ExploreTaxonomyStore
