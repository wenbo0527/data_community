/**
 * 单元测试:打通层核心模块
 *
 * 覆盖:
 *   1. FieldLinkStore (字段关联)
 *   2. ColumnLineageStore (字段血缘)
 *   3. LineageGraphStore (资源→要素完整链路)
 *   4. StandardClassifyMatrixStore (标准-分级矩阵)
 *   5. TaxonomyStore (统一分类树)
 *   6. CommentStore (协作注释)
 *   7. AssetTagStore (资产标签)
 *
 * 工具:
 *   - useSensitiveMasker (脱敏引擎)
 *   - useGlossary (概念词典)
 *   - useFieldPermission (字段权限)
 */

import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

beforeAll(() => {
  setActivePinia(createPinia())
})

// ==================== 1. FieldLinkStore 字段关联测试 ====================

describe('FieldLinkStore - 字段关联', () => {
  it('应该返回所有字段关联记录', async () => {
    const { FieldLinkStore } = await import('../lineage')
    const all = FieldLinkStore.list()
    expect(all.length).toBeGreaterThanOrEqual(10)
    expect(all[0]).toHaveProperty('tableName')
    expect(all[0]).toHaveProperty('fieldName')
  })

  it('通过 (table, field) 查单个关联', async () => {
    const { FieldLinkStore } = await import('../lineage')
    const link = FieldLinkStore.byField('dim_user', 'user_id')
    expect(link).toBeDefined()
    expect(link?.tableName).toBe('dim_user')
    expect(link?.fieldName).toBe('user_id')
    expect(link?.standardCode).toBe('STD_001')
    expect(link?.sensitivityLevel).toBe('L1')
    expect(link?.businessElementId).toBe('elem_customer_id')
  })

  it('通过 standardCode 查所有关联字段', async () => {
    const { FieldLinkStore } = await import('../lineage')
    const links = FieldLinkStore.byStandard('STD_005')
    expect(links.length).toBeGreaterThan(0)
    expect(links.every(l => l.standardCode === 'STD_005')).toBe(true)
  })

  it('通过 businessElementId 反查', async () => {
    const { FieldLinkStore } = await import('../lineage')
    const links = FieldLinkStore.byBusinessElement('elem_customer_id')
    expect(links.length).toBeGreaterThan(0)
    expect(links.every(l => l.businessElementId === 'elem_customer_id')).toBe(true)
  })

  it('通过 sensitivityLevel 过滤', async () => {
    const { FieldLinkStore } = await import('../lineage')
    const l3Fields = FieldLinkStore.bySensitivity('L3')
    expect(l3Fields.length).toBeGreaterThan(0)
    expect(l3Fields.every(l => l.sensitivityLevel === 'L3')).toBe(true)
  })

  it('表级别合规率', async () => {
    const { FieldLinkStore } = await import('../lineage')
    const rate = FieldLinkStore.tableComplianceRate('dim_user')
    expect(rate).toBeGreaterThanOrEqual(0)
    expect(rate).toBeLessThanOrEqual(100)
  })

  it('表级别分级覆盖率', async () => {
    const { FieldLinkStore } = await import('../lineage')
    const coverage = FieldLinkStore.tableClassifyCoverage('dim_user')
    expect(coverage).toBeGreaterThanOrEqual(0)
    expect(coverage).toBeLessThanOrEqual(100)
  })

  it('addLink 新增关联', async () => {
    const { FieldLinkStore } = await import('../lineage')
    const before = FieldLinkStore.list().length
    FieldLinkStore.addLink({
      tableName: 'new_table',
      fieldName: 'new_field',
      schema: 'default',
      standardCode: 'STD_999',
      sensitivityLevel: 'L2',
      grade: '重要',
      businessBelonging: '零售',
      linkBy: 'user-test',
      compliance: 'unknown'
    })
    const after = FieldLinkStore.list().length
    expect(after).toBe(before + 1)
  })

  it('stats 统计正确', async () => {
    const { FieldLinkStore } = await import('../lineage')
    const stats = FieldLinkStore.stats()
    expect(stats.total).toBeGreaterThan(0)
    expect(stats.withStandard).toBeGreaterThan(0)
    expect(stats.withSensitivity).toBeGreaterThan(0)
    expect(stats.bySensitivity.L1).toBeGreaterThan(0)
    expect(stats.bySensitivity.L3).toBeGreaterThan(0)
  })
})

// ==================== 2. ColumnLineageStore 字段血缘 ====================

describe('ColumnLineageStore - 字段血缘', () => {
  it('返回所有血缘边', async () => {
    const { ColumnLineageStore } = await import('../column-lineage')
    const all = ColumnLineageStore.list()
    expect(all.length).toBeGreaterThanOrEqual(10)
    expect(all[0]).toHaveProperty('sourceTable')
    expect(all[0]).toHaveProperty('targetTable')
  })

  it('上游血缘', async () => {
    const { ColumnLineageStore } = await import('../column-lineage')
    const upstream = ColumnLineageStore.upstream('fact_loan_apply', 'id_card_no')
    expect(upstream.length).toBeGreaterThan(0)
    expect(upstream.every(e => e.targetTable === 'fact_loan_apply')).toBe(true)
  })

  it('下游血缘', async () => {
    const { ColumnLineageStore } = await import('../column-lineage')
    const downstream = ColumnLineageStore.downstream('dim_user', 'id_card_no')
    expect(downstream.length).toBeGreaterThan(0)
    expect(downstream.every(e => e.sourceTable === 'dim_user')).toBe(true)
  })

  it('影响分析(递归追踪)', async () => {
    const { ColumnLineageStore } = await import('../column-lineage')
    const impact = ColumnLineageStore.impactOf('dim_user', 'apply_amt')
    // 应能找到下游
    expect(Array.isArray(impact)).toBe(true)
  })

  it('按表查血缘', async () => {
    const { ColumnLineageStore } = await import('../column-lineage')
    const edges = ColumnLineageStore.byTable('dim_user')
    expect(edges.length).toBeGreaterThan(0)
  })

  it('stats 统计', async () => {
    const { ColumnLineageStore } = await import('../column-lineage')
    const stats = ColumnLineageStore.stats()
    expect(stats.totalEdges).toBeGreaterThan(0)
    expect(stats.directEdges + stats.derivedEdges).toBe(stats.totalEdges)
  })
})

// ==================== 3. LineageGraphStore 资源→要素 ====================

describe('LineageGraphStore - 资源→要素完整链路', () => {
  it('从表出发构建完整血缘图', async () => {
    const { buildLineageFromTable } = await import('../lineage-graph')
    const graph = buildLineageFromTable('dim_user')
    expect(graph.nodes.length).toBeGreaterThan(0)
    expect(graph.edges.length).toBeGreaterThan(0)
    expect(graph.entry).toBe('table:dim_user')

    // 应包含多种节点类型
    const types = new Set(graph.nodes.map(n => n.type))
    expect(types.has('data_table')).toBe(true)
    expect(types.has('data_field')).toBe(true)
    expect(types.has('business_element')).toBe(true)
    expect(types.has('business_domain')).toBe(true)
  })

  it('从业务要素出发反查表', async () => {
    const { buildLineageFromElement } = await import('../lineage-graph')
    const graph = buildLineageFromElement('elem_customer_id')
    expect(graph.nodes.length).toBeGreaterThan(0)
    expect(graph.entry).toBe('element:elem_customer_id')

    const types = new Set(graph.nodes.map(n => n.type))
    expect(types.has('business_element')).toBe(true)
    expect(types.has('data_field')).toBe(true)
    expect(types.has('data_table')).toBe(true)
  })

  it('通用 build 入口按类型分发', async () => {
    const { buildLineage } = await import('../lineage-graph')
    const g1 = buildLineage('data_table', 'dim_user')
    expect(g1.nodes.length).toBeGreaterThan(0)

    const g2 = buildLineage('business_element', 'elem_customer_id')
    expect(g2.nodes.length).toBeGreaterThan(0)
  })

  it('forX6 转换格式', async () => {
    const { LineageGraphStore, buildLineageFromTable } = await import('../lineage-graph')
    const graph = buildLineageFromTable('dim_user')
    const x6 = LineageGraphStore.forX6(graph)
    expect(x6.nodes.length).toBe(graph.nodes.length)
    expect(x6.edges.length).toBe(graph.edges.length)
    expect(x6.nodes[0]).toHaveProperty('shape')
    expect(x6.nodes[0]).toHaveProperty('label')
  })

  it('chainOf 链路摘要包含完整信息', async () => {
    const { LineageGraphStore } = await import('../lineage-graph')
    const chain = LineageGraphStore.chainOf('dim_user', 'user_id')
    expect(chain).toContain('dim_user')
    expect(chain).toContain('user_id')
    expect(chain).toContain('STD_001')
  })

  it('空表名应返回空图', async () => {
    const { buildLineageFromTable } = await import('../lineage-graph')
    const graph = buildLineageFromTable('non_existent_table_xxx')
    expect(graph.nodes.length).toBe(0)
    expect(graph.edges.length).toBe(0)
  })
})

// ==================== 4. StandardClassifyMatrixStore ====================

describe('StandardClassifyMatrixStore - 标准-分级矩阵', () => {
  it('lookup 命中已知组合', async () => {
    const { StandardClassifyMatrixStore } = await import('../standard-classify-matrix')
    const result = StandardClassifyMatrixStore.lookup({
      dataTypeCategory: 'ID',
      businessBelonging: '零售'
    })
    expect(result).toBeDefined()
    expect(result?.defaultSensitivity).toBe('L3')
    expect(result?.legalBasis).toContain('个人信息保护法')
  })

  it('inferFromType 智能推导', async () => {
    const { StandardClassifyMatrixStore } = await import('../standard-classify-matrix')
    // VARCHAR(20) 走 TEXT 分支 → L1 (低敏)
    const textResult = StandardClassifyMatrixStore.inferFromType('VARCHAR(20)', '零售')
    expect(textResult?.defaultSensitivity).toBe('L1')

    // DECIMAL(18,2) 走 AMT 分支 → L3
    const amtResult = StandardClassifyMatrixStore.inferFromType('DECIMAL(18,2)', '财务')
    expect(amtResult?.defaultSensitivity).toBe('L3')

    // TIMESTAMP 走 DATE 分支 → L1
    const dateResult = StandardClassifyMatrixStore.inferFromType('TIMESTAMP', '零售')
    expect(dateResult?.defaultSensitivity).toBe('L1')
  })

  it('stats 分布合理', async () => {
    const { StandardClassifyMatrixStore } = await import('../standard-classify-matrix')
    const stats = StandardClassifyMatrixStore.stats()
    expect(stats.total).toBeGreaterThan(20)
    expect(stats.bySensitivity.L3).toBeGreaterThan(0)
    expect(stats.byBusinessBelonging['零售']).toBeGreaterThan(0)
  })
})

// ==================== 5. TaxonomyStore ====================

describe('TaxonomyStore - 统一分类树', () => {
  it('按层级查询', async () => {
    const { TaxonomyStore } = await import('../classification-taxonomy')
    expect(TaxonomyStore.byLevel(1).length).toBeGreaterThan(0)
    expect(TaxonomyStore.byLevel(2).length).toBeGreaterThan(0)
    expect(TaxonomyStore.byLevel(3).length).toBeGreaterThan(0)
  })

  it('路径回溯', async () => {
    const { TaxonomyStore } = await import('../classification-taxonomy')
    const path = TaxonomyStore.pathOf('BD_USER_CUST_ID')
    expect(path.length).toBeGreaterThan(0)
    expect(path[0].code).toBe('BD_USER')
    expect(path[path.length - 1].code).toBe('BD_USER_CUST_ID')
  })

  it('按业务归属', async () => {
    const { TaxonomyStore } = await import('../classification-taxonomy')
    const retailNodes = TaxonomyStore.byBusinessBelonging('零售')
    expect(retailNodes.length).toBeGreaterThan(0)
  })

  it('按 standardCode 查要素', async () => {
    const { TaxonomyStore } = await import('../classification-taxonomy')
    const nodes = TaxonomyStore.byStandard('STD_001')
    expect(nodes.length).toBeGreaterThan(0)
    expect(nodes[0].nodeType).toBe('element')
  })

  it('children 父子关系', async () => {
    const { TaxonomyStore } = await import('../classification-taxonomy')
    const children = TaxonomyStore.children('BD_USER_CUST')
    expect(children.length).toBeGreaterThan(0)
    expect(children.every(c => c.parent === 'BD_USER_CUST')).toBe(true)
  })
})

// ==================== 6. CommentStore ====================

describe('CommentStore - 协作注释', () => {
  it('通过资源查注释', async () => {
    const { CommentStore } = await import('../comment-store')
    const comments = CommentStore.byResource('table', 'dim_user')
    expect(comments.length).toBeGreaterThan(0)
  })

  it('通过类型(comment/rating/issue/suggestion)查', async () => {
    const { CommentStore } = await import('../comment-store')
    const issues = CommentStore.byCommentType('issue')
    expect(issues.length).toBeGreaterThan(0)
    expect(issues.every(c => c.commentType === 'issue')).toBe(true)
  })

  it('未解决的 issue', async () => {
    const { CommentStore } = await import('../comment-store')
    const open = CommentStore.openIssues()
    expect(open.every(c => c.commentType === 'issue' && !c.resolved)).toBe(true)
  })

  it('add 新增注释', async () => {
    const { CommentStore } = await import('../comment-store')
    const before = CommentStore.list().length
    CommentStore.add({
      resourceType: 'table',
      resourceId: 'test_table',
      commentType: 'comment',
      content: '测试注释',
      userId: 'user-test',
      userName: '测试用户',
      replyCount: 0,
      resolved: false
    })
    const after = CommentStore.list().length
    expect(after).toBe(before + 1)
  })

  it('like 点赞', async () => {
    const { CommentStore } = await import('../comment-store')
    const c = CommentStore.list()[0]
    const before = c.likeCount
    CommentStore.like(c.id)
    const after = CommentStore.list().find(x => x.id === c.id)!
    expect(after.likeCount).toBe(before + 1)
  })

  it('resolve 标记解决', async () => {
    const { CommentStore } = await import('../comment-store')
    const issues = CommentStore.byCommentType('issue')
    if (issues.length > 0) {
      const target = issues.find(i => !i.resolved)
      if (target) {
        CommentStore.resolve(target.id)
        expect(target.resolved).toBe(true)
      }
    }
  })

  it('stats 统计', async () => {
    const { CommentStore } = await import('../comment-store')
    const stats = CommentStore.stats()
    expect(stats.total).toBeGreaterThan(0)
    expect(stats.avgRating).toBeGreaterThan(0)
  })
})

// ==================== 7. AssetTagStore ====================

describe('AssetTagStore - 资产标签', () => {
  it('按类别查标签定义', async () => {
    const { AssetTagStore } = await import('../asset-tags')
    const quality = AssetTagStore.byCategory('quality')
    expect(quality.length).toBeGreaterThan(0)
    expect(quality.every(t => t.category === 'quality')).toBe(true)
  })

  it('按资源查标签', async () => {
    const { AssetTagStore } = await import('../asset-tags')
    const tags = AssetTagStore.tagsOf('table', 'dim_user')
    expect(tags.length).toBeGreaterThan(0)
  })

  it('apply 新增标签绑定', async () => {
    const { AssetTagStore } = await import('../asset-tags')
    const before = AssetTagStore.bindings().length
    AssetTagStore.apply('asset_tag_q1', 'table', 'new_test_table', 'user-test', '测试')
    expect(AssetTagStore.bindings().length).toBe(before + 1)
  })

  it('unapply 取消绑定', async () => {
    const { AssetTagStore } = await import('../asset-tags')
    AssetTagStore.apply('asset_tag_q1', 'table', 'temp_table', 'user-test', '测试')
    const binding = AssetTagStore.bindings().find(b => b.resourceId === 'temp_table')
    expect(binding).toBeDefined()
    if (binding) {
      const ok = AssetTagStore.unapply(binding.id)
      expect(ok).toBe(true)
    }
  })

  it('stats 统计', async () => {
    const { AssetTagStore } = await import('../asset-tags')
    const stats = AssetTagStore.stats()
    expect(stats.totalDefinitions).toBeGreaterThan(10)
    expect(stats.totalBindings).toBeGreaterThan(0)
    expect(stats.byCategory.quality).toBeGreaterThan(0)
  })
})

// ==================== 8. useSensitiveMasker 脱敏引擎 ====================

describe('useSensitiveMasker - 数据脱敏引擎', () => {
  it('身份证号脱敏(前 6 后 4)', async () => {
    const { maskValue } = await import('@/composables/useSensitiveMasker')
    const masked = maskValue('110101199001011234', 'id_card')
    expect(masked).toBe('110101********1234')
  })

  it('手机号脱敏(138****1234)', async () => {
    const { maskValue } = await import('@/composables/useSensitiveMasker')
    const masked = maskValue('13800001234', 'mobile')
    expect(masked).toBe('138****1234')
  })

  it('邮箱脱敏(保留首字母)', async () => {
    const { maskValue } = await import('@/composables/useSensitiveMasker')
    const masked = maskValue('zhangsan@company.com', 'email')
    expect(masked).toMatch(/^z\*+$/)
    expect(masked.length).toBe('zhangsan@company.com'.length)
  })

  it('银行卡(后 4)', async () => {
    const { maskValue } = await import('@/composables/useSensitiveMasker')
    const masked = maskValue('6222600012345678', 'bank_card')
    expect(masked).toBe('************5678')
  })

  it('姓名(首字后 *)', async () => {
    const { maskValue } = await import('@/composables/useSensitiveMasker')
    const masked = maskValue('张三', 'name')
    expect(masked).toBe('张*')
  })

  it('全脱敏', async () => {
    const { maskValue } = await import('@/composables/useSensitiveMasker')
    const masked = maskValue('110101199001011234', 'full')
    expect(masked).toMatch(/^\*+$/)
    expect(masked.length).toBe(12)
  })

  it('哈希脱敏', async () => {
    const { maskValue } = await import('@/composables/useSensitiveMasker')
    const masked = maskValue('110101199001011234', 'hash')
    expect(masked).toMatch(/^hash_[a-f0-9]{8}$/)
  })

  it('autoMaskBySensitivity 按 L1-L4 自动选策略', async () => {
    const { autoMaskBySensitivity } = await import('@/composables/useSensitiveMasker')
    expect(autoMaskBySensitivity('L1', '13800001234')).toBe('13800001234') // 不脱敏
    expect(autoMaskBySensitivity('L2', '13800001234')).toBe('138****1234') // mobile 策略
    expect(autoMaskBySensitivity('L3', '110101199001011234')).toBe('110101********1234') // id_card
    expect(autoMaskBySensitivity('L4', '110101199001011234')).toMatch(/^\*+$/) // 全脱敏
  })

  it('maskField 字段名启发式', async () => {
    const { maskField } = await import('@/composables/useSensitiveMasker')
    expect(maskField('any', 'mobile', '13800001234')).toBe('138****1234')
    expect(maskField('any', 'id_card_no', '110101199001011234')).toBe('110101********1234')
    expect(maskField('any', 'bank_card_no', '6222600012345678')).toBe('************5678')
  })
})

// ==================== 9. useGlossary 概念词典 ====================

describe('useGlossary - 概念词典', () => {
  it('getTerm 取术语', async () => {
    const { useGlossary } = await import('@/composables/useGlossary')
    const { getTerm } = useGlossary()
    const tag = getTerm('tag')
    expect(tag).toBeDefined()
    expect(tag?.name).toBe('标签')
    expect(tag?.shortDesc).toContain('属性')
  })

  it('compareTerms 对比术语', async () => {
    const { useGlossary } = await import('@/composables/useGlossary')
    const { compareTerms } = useGlossary()
    const result = compareTerms('tag', 'audience')
    expect(result).not.toBeNull()
    expect(result?.a.name).toBe('标签')
    expect(result?.b.name).toBe('人群')
  })

  it('tooltip 工具提示', async () => {
    const { useGlossary } = await import('@/composables/useGlossary')
    const { tooltip } = useGlossary()
    const tip = tooltip('tag')
    expect(tip).toContain('标签')
    expect(tip).toContain('属性')
  })

  it('byModule 按模块查术语', async () => {
    const { useGlossary } = await import('@/composables/useGlossary')
    const { byModule } = useGlossary()
    const concepts = byModule('management')
    expect(concepts.length).toBeGreaterThan(0)
  })

  it('已知术语均存在', async () => {
    const { useGlossary } = await import('@/composables/useGlossary')
    const { getTerm } = useGlossary()
    expect(getTerm('audience')).toBeDefined()
    expect(getTerm('crowd_query')).toBeDefined()
    expect(getTerm('metric')).toBeDefined()
    expect(getTerm('table')).toBeDefined()
    expect(getTerm('business_concept')).toBeDefined()
    expect(getTerm('data_map')).toBeDefined()
  })
})

// ==================== 10. useFieldPermission 字段权限 ====================

describe('useFieldPermission - 字段权限', () => {
  it('L1 字段全部可见', async () => {
    const { useFieldPermissionStore } = await import('@/composables/useFieldPermission')
    const store = useFieldPermissionStore()
    const perm = store.getPermission('customer360', 'user_id', 'public', { role: 'admin' })
    expect(perm.visible).toBe(true)
    expect(perm.copyable).toBe(true)
    expect(perm.searchable).toBe(true)
  })

  it('L4 字段默认不可见', async () => {
    const { useFieldPermissionStore } = await import('@/composables/useFieldPermission')
    const store = useFieldPermissionStore()
    const perm = store.getPermission('customer360', 'credit_report', 'restricted', { role: 'user' })
    expect(perm.visible).toBe(false)
  })

  it('L3 字段不可复制/搜索', async () => {
    const { useFieldPermissionStore } = await import('@/composables/useFieldPermission')
    const store = useFieldPermissionStore()
    const perm = store.getPermission('customer360', 'id_card', 'confidential', { role: 'user' })
    expect(perm.copyable).toBe(false)
    expect(perm.searchable).toBe(false)
  })

  it('filterVisible 过滤字段列表', async () => {
    const { useFieldPermissionStore } = await import('@/composables/useFieldPermission')
    const store = useFieldPermissionStore()
    const fields = [
      { name: 'user_id', sensitivity: 'public' as const },
      { name: 'id_card', sensitivity: 'confidential' as const },
      { name: 'credit_report', sensitivity: 'restricted' as const }
    ]
    const visible = store.filterVisible(fields, 'customer360')
    expect(visible.length).toBe(2) // 不包含 restricted
    expect(visible.find(f => f.name === 'user_id')).toBeDefined()
    expect(visible.find(f => f.name === 'credit_report')).toBeUndefined()
  })

  it('applyOverrides 设置 override 优先', async () => {
    const { useFieldPermissionStore } = await import('@/composables/useFieldPermission')
    const store = useFieldPermissionStore()
    store.clearOverrides()
    store.applyOverrides([
      { domain: 'customer360', field: 'credit_report', perm: { visible: true, copyable: true, searchable: true } }
    ])
    const perm = store.getPermission('customer360', 'credit_report', 'restricted')
    expect(perm.visible).toBe(true) // override 生效
    store.clearOverrides()
  })
})

// ==================== 11. useCrossNav 跨模块跳转 ====================

describe('useCrossNav - 跨模块跳转契约', () => {
  it('resolve 替换路径参数', async () => {
    const { useCrossNav, ROUTE_TABLE } = await import('@/composables/useCrossNav')
    expect(ROUTE_TABLE['discovery:index']).toBe('/discovery/index')
    expect(ROUTE_TABLE['discovery:data-map']).toBe('/discovery/data-map')
    expect(ROUTE_TABLE['management:metadata-modeling']).toBe('/management/metadata/modeling')

    const { resolve } = useCrossNav()
    const path = resolve('discovery:customer360-detail', { params: { userId: '12345' } })
    expect(path).toBe('/discovery/customer360/detail/12345')
  })

  it('ROUTE_KEYS 应包含所有模块入口', async () => {
    const { ROUTE_KEYS } = await import('@/composables/useCrossNav')
    expect(ROUTE_KEYS.discoveryHome).toBeDefined()
    expect(ROUTE_KEYS.managementHome).toBeDefined()
    expect(ROUTE_KEYS.explorationHome).toBeDefined()
    expect(ROUTE_KEYS.discoveryCustomer360Detail.param).toBe('userId')
  })

  it('resolve context 传递', async () => {
    const { useCrossNav } = await import('@/composables/useCrossNav')
    const { resolve } = useCrossNav()
    const path = resolve('discovery:customer360', { context: { keyword: '张明', stage: 'new' } })
    expect(path).toContain('keyword=')
    expect(path).toContain('stage=new')
  })
})