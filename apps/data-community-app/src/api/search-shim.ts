/**
 * dca search shim —— 返回真实 mock 数据
 */
import { MetadataStore } from '@/mock/shared/metadata-store'
import { BusinessConceptStore } from '@/mock/shared/business-concept-store'
import { mockMetrics } from '@/mock/listing-store'

const mockDelay = <T>(data: T, ms = 100): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), ms))

export const searchApi = {
  async search(keyword: string) {
    const lowerKeyword = keyword.toLowerCase()

    // 1. 搜索物理表（数据资源）
    const allTables = MetadataStore.getTables()
    const matchedTables = allTables.filter(t =>
      t.name.toLowerCase().includes(lowerKeyword) ||
      (t.description && t.description.toLowerCase().includes(lowerKeyword)) ||
      (t.domain && t.domain.toLowerCase().includes(lowerKeyword)) ||
      (t.tags && t.tags.some((tag: string) => tag.toLowerCase().includes(lowerKeyword)))
    )

    // 2. 搜索业务概念（业务要素：域/实体/要素）
    const matchedDomains = BusinessConceptStore.getDomains().filter(d =>
      d.name.includes(keyword) || d.description.includes(keyword)
    )
    const matchedEntities = BusinessConceptStore.getEntities().filter(e =>
      e.name.includes(keyword) || e.description.includes(keyword)
    )
    const matchedElements = BusinessConceptStore.getElements().filter(e =>
      e.name.includes(keyword)
    )

    // 3. 搜索指标
    const matchedMetrics = mockMetrics.filter(m =>
      m.metricName.toLowerCase().includes(lowerKeyword) ||
      m.metricCode.toLowerCase().includes(lowerKeyword) ||
      m.category.toLowerCase().includes(lowerKeyword) ||
      m.description.toLowerCase().includes(lowerKeyword)
    )

    return mockDelay({
      data: {
        tables: matchedTables,
        metrics: matchedMetrics.map(m => ({
          ...m,
          name: m.metricName,
          id: m.metricCode
        })),
        tags: [],
        concepts: {
          domains: matchedDomains,
          entities: matchedEntities,
          elements: matchedElements
        },
        dashboards: [],
        total: matchedTables.length + matchedDomains.length + matchedEntities.length + matchedElements.length + matchedMetrics.length
      }
    })
  }
}
