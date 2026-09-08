import { computed } from 'vue'
import { MetadataStore, type TableItem, type TableCollection } from '@/mock/shared/metadata-store'

/**
 * 共享元数据 composable(L1 整合入口)
 *
 * 用法:
 *   const { tables, collections, getTableByName } = useSharedMetadata()
 *   tables.value  // 所有表
 *
 * 所有模块页面应从此处读取元数据,而不是直接 import mock/data-map.ts。
 * 这样管理端的"资产上下架"可以即时影响发现端的展示。
 */
export function useSharedMetadata() {
  /** 全部表 */
  const tables = computed<TableItem[]>(() => MetadataStore.getTables())

  /** 全部表集合 */
  const collections = computed<TableCollection[]>(() => {
    // mockCollections 来自 data-map.ts,这里直接拿 mock
    // 后续可演进为 MetadataStore.getCollections()
    return []
  })

  /** 按表名查 */
  const getTableByName = (name: string) => MetadataStore.getTableByName(name)

  /** 按域名过滤 */
  const getTablesByDomain = (domain: string) => {
    return tables.value.filter(t => t.domain === domain)
  }

  /** 按分类过滤(ODS/DWD/DWS/ADS/DIM) */
  const getTablesByCategory = (category: string) => {
    return tables.value.filter(t => t.category === category)
  }

  /** 业务域下拉选项 */
  const domainOptions = computed(() => {
    const set = new Set<string>()
    tables.value.forEach(t => {
      if (t.domain) set.add(t.domain)
    })
    return Array.from(set).map(d => ({ label: d, value: d }))
  })

  /** 分类下拉选项 */
  const categoryOptions = computed(() => {
    const set = new Set<string>()
    tables.value.forEach(t => {
      if (t.category) set.add(t.category)
    })
    return Array.from(set).map(c => ({ label: c, value: c }))
  })

  return {
    tables,
    collections,
    domainOptions,
    categoryOptions,
    getTableByName,
    getTablesByDomain,
    getTablesByCategory
  }
}