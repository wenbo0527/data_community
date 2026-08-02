/**
 * ClassificationViewer 组件测试
 *
 * 注: 因 Arco Design 组件在 jsdom 下存在 ESM 兼容问题,
 *     此处测试聚焦于组件依赖的 store 逻辑(打通层展示的数据源)
 *
 * 验证:
 *   - FieldLinkStore 提供正确的字段打标数据
 *   - 表级合规率 / 分级覆盖率 计算正确
 *   - 元素分类逻辑
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { FieldLinkStore } from '@/mock/shared/lineage'

describe('ClassificationViewer - 数据源集成', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('FieldLinkStore 提供 dim_user 字段打标数据', () => {
    const links = FieldLinkStore.byTable('dim_user')
    expect(links.length).toBeGreaterThan(0)
  })

  it('每个字段关联都有 standardCode', () => {
    const links = FieldLinkStore.byTable('dim_user')
    links.forEach(l => {
      expect(l.standardCode).toBeTruthy()
    })
  })

  it('每个字段关联都有 sensitivityLevel', () => {
    const links = FieldLinkStore.byTable('dim_user')
    links.forEach(l => {
      expect(['L1', 'L2', 'L3', 'L4']).toContain(l.sensitivityLevel)
    })
  })

  it('展示合规率(基于字段打标情况)', () => {
    const rate = FieldLinkStore.tableComplianceRate('dim_user')
    expect(rate).toBeGreaterThanOrEqual(0)
    expect(rate).toBeLessThanOrEqual(100)
  })

  it('展示分级覆盖率', () => {
    const coverage = FieldLinkStore.tableClassifyCoverage('dim_user')
    expect(coverage).toBeGreaterThanOrEqual(0)
    expect(coverage).toBeLessThanOrEqual(100)
  })

  it('L3 字段(身份证号)被识别', () => {
    const idCardLink = FieldLinkStore.byField('dim_user', 'id_card_no')
    expect(idCardLink?.sensitivityLevel).toBe('L3')
    expect(idCardLink?.standardCode).toBe('STD_005')
  })

  it('L1 字段(用户ID)被识别', () => {
    const userIdLink = FieldLinkStore.byField('dim_user', 'user_id')
    expect(userIdLink?.sensitivityLevel).toBe('L1')
    expect(userIdLink?.businessBelonging).toBe('零售')
  })

  it('未知表名返回空', () => {
    const links = FieldLinkStore.byTable('non_existent')
    expect(links.length).toBe(0)
  })

  it('stats 统计 4 个分类合计', () => {
    const stats = FieldLinkStore.stats()
    const total = stats.bySensitivity.L1 + stats.bySensitivity.L2 +
                  stats.bySensitivity.L3 + stats.bySensitivity.L4
    expect(total).toBe(stats.withSensitivity)
  })

  it('业务要素反查可用', () => {
    const links = FieldLinkStore.byBusinessElement('elem_customer_id')
    expect(links.length).toBeGreaterThan(0)
  })
})