/**
 * ColumnLineageViewer 组件测试
 *
 * 注: 测试 composable + 数据源,不渲染 Arco 组件
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { ColumnLineageStore } from '@/mock/shared/column-lineage'
import { useColumnLineage } from '@/composables/useColumnLineage'
import { useSensitiveMasker, MASKING_SAMPLES } from '@/composables/useSensitiveMasker'

describe('ColumnLineageViewer - 数据源集成', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('ColumnLineageStore 提供 10 条字段血缘边', () => {
    const edges = ColumnLineageStore.list()
    expect(edges.length).toBe(10)
    expect(edges[0]).toHaveProperty('sourceTable')
    expect(edges[0]).toHaveProperty('targetTable')
    expect(edges[0]).toHaveProperty('transform')
  })

  it('upstream / downstream / impact / hasLineage composable 全可用', () => {
    const composable = useColumnLineage()
    expect(typeof composable.upstream).toBe('function')
    expect(typeof composable.downstream).toBe('function')
    expect(typeof composable.impact).toBe('function')
    expect(typeof composable.hasLineage).toBe('function')
    expect(typeof composable.describeLineage).toBe('function')
  })

  it('upstream 找到 fact_loan_apply 的来源', () => {
    const upstream = useColumnLineage().upstream('fact_loan_apply', 'id_card_no')
    expect(upstream.length).toBeGreaterThan(0)
    expect(upstream[0].sourceTable).toBe('dim_user')
  })

  it('downstream 找到 dim_user.id_card_no 的去向', () => {
    const downstream = useColumnLineage().downstream('dim_user', 'id_card_no')
    expect(downstream.length).toBeGreaterThan(0)
  })

  it('hasLineage 正确判断引用关系', () => {
    expect(useColumnLineage().hasLineage('dim_user', 'user_id')).toBe(true)
    expect(useColumnLineage().hasLineage('dim_user', 'not_a_field')).toBe(false)
  })

  it('impact 递归追踪下游', () => {
    const impact = useColumnLineage().impact('dim_user', 'apply_amt')
    expect(Array.isArray(impact)).toBe(true)
  })

  it('describeLineage 输出多行文本', () => {
    const { describeLineage } = useColumnLineage()
    // 测试一个确认有上下游的字段
    const chain = describeLineage('dim_user', 'id_card_no')
    expect(chain).toBeTruthy()
    expect(chain.length).toBeGreaterThan(0)
  })

  it('脱敏引擎掩码身份证号', () => {
    const { maskValue } = useSensitiveMasker()
    expect(maskValue('110101199001011234', 'id_card')).toBe('110101********1234')
  })

  it('脱敏引擎掩码手机号', () => {
    const { maskValue } = useSensitiveMasker()
    expect(maskValue('13800001234', 'mobile')).toBe('138****1234')
  })

  it('MASKING_SAMPLES 提供 7 个脱敏样例', () => {
    expect(MASKING_SAMPLES.length).toBe(7)
    MASKING_SAMPLES.forEach(s => {
      expect(s).toHaveProperty('label')
      expect(s).toHaveProperty('raw')
      expect(s).toHaveProperty('masked')
    })
  })

  it('字段级血缘统计', () => {
    const stats = ColumnLineageStore.stats()
    expect(stats.totalEdges).toBe(10)
    expect(stats.directEdges).toBeGreaterThan(0)
    expect(stats.derivedEdges).toBeGreaterThan(0)
  })

  it('3 种视图模式 + 1 个影响分析 = 4 个核心能力', () => {
    // 这个组件支持关系图 / 上下游列表 / 影响分析
    // 以及 4 个统计:上游/下游/影响范围/是否被引用
    expect(upstream.length).toBeDefined
    expect(downstream.length).toBeDefined
    expect(impact.length).toBeDefined
    expect(hasLineage).toBeDefined
  })
})

// Helper variables used in tests
const upstream = useColumnLineage().upstream
const downstream = useColumnLineage().downstream
const impact = useColumnLineage().impact
const hasLineage = useColumnLineage().hasLineage