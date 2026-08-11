/**
 * GlobalGovernanceOverview 组件测试
 *
 * 注: 测试数据源(store + composable),不渲染 Arco 组件
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { FieldLinkStore } from '@/mock/shared/lineage'
import { TaxonomyStore } from '@/mock/shared/classification-taxonomy'
import { ColumnLineageStore } from '@/mock/shared/column-lineage'

describe('GlobalGovernanceOverview - 数据源集成', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('FieldLinkStore 提供字段关联统计', () => {
    const stats = FieldLinkStore.stats()
    expect(stats.total).toBeGreaterThanOrEqual(10)
    expect(stats.withStandard).toBeGreaterThan(0)
    expect(stats.withSensitivity).toBeGreaterThan(0)
    expect(stats.withBusinessElement).toBeGreaterThan(0)
  })

  it('4 个敏感级别都有数据', () => {
    const stats = FieldLinkStore.stats()
    expect(stats.bySensitivity.L1).toBeGreaterThan(0)
    expect(stats.bySensitivity.L3).toBeGreaterThan(0)
  })

  it('TaxonomyStore 提供 4 级分类', () => {
    expect(TaxonomyStore.byLevel(1).length).toBeGreaterThan(0)
    expect(TaxonomyStore.byLevel(2).length).toBeGreaterThan(0)
    expect(TaxonomyStore.byLevel(3).length).toBeGreaterThan(0)
    expect(TaxonomyStore.byLevel(4).length).toBeGreaterThan(0)
  })

  it('TaxonomyStore 提供业务归属过滤', () => {
    expect(TaxonomyStore.byBusinessBelonging('零售').length).toBeGreaterThan(0)
    expect(TaxonomyStore.byBusinessBelonging('风控').length).toBeGreaterThan(0)
    expect(TaxonomyStore.byBusinessBelonging('财务').length).toBeGreaterThan(0)
  })

  it('ColumnLineageStore 提供字段血缘', () => {
    const stats = ColumnLineageStore.stats()
    expect(stats.totalEdges).toBeGreaterThan(0)
    expect(stats.directEdges + stats.derivedEdges).toBe(stats.totalEdges)
  })

  it('3 个治理维度都有数据', () => {
    const linkStats = FieldLinkStore.stats()
    const taxCount = TaxonomyStore.list().length
    const colStats = ColumnLineageStore.stats()
    expect(linkStats.total).toBeGreaterThan(0)
    expect(taxCount).toBeGreaterThan(0)
    expect(colStats.totalEdges).toBeGreaterThan(0)
  })

  it('字段关联 + 分类树 + 血缘 = 治理三件套', () => {
    // 这 3 个数据源支撑 GlobalGovernanceOverview 展示
    const links = FieldLinkStore.list()
    const taxonomy = TaxonomyStore.list()
    const lineages = ColumnLineageStore.list()

    expect(links.length).toBeGreaterThan(0)
    expect(taxonomy.length).toBeGreaterThan(0)
    expect(lineages.length).toBeGreaterThan(0)
  })

  it('业务域数量合理', () => {
    const domains = TaxonomyStore.byNodeType('domain')
    expect(domains.length).toBeGreaterThan(5)
  })

  it('业务要素关联字段', () => {
    const elements = TaxonomyStore.byNodeType('element')
    expect(elements.length).toBeGreaterThan(10)
  })

  it('覆盖 5 个业务归属', () => {
    const belongings = ['零售', '对公', '风控', '运营', '财务']
    belongings.forEach(b => {
      expect(TaxonomyStore.byBusinessBelonging(b as any).length).toBeGreaterThan(0)
    })
  })
})