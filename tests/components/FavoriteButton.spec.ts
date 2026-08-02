/**
 * FavoriteButton 组件测试
 *
 * 注: 此处测试聚焦于 FavoriteStore(数据源),不渲染 Arco 组件
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { FavoriteStore } from '@/mock/shared/favorite-directory'

describe('FavoriteButton - FavoriteStore 集成', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('FavoriteStore 提供 mock 收藏', () => {
    expect(FavoriteStore.list().length).toBeGreaterThan(0)
  })

  it('byUser 按用户过滤', () => {
    const zhangsanFavs = FavoriteStore.byUser('user-zhangsan')
    expect(zhangsanFavs.length).toBeGreaterThan(0)
    zhangsanFavs.forEach(f => expect(f.userId).toBe('user-zhangsan'))
  })

  it('byResource 反查', () => {
    const dimUserFavs = FavoriteStore.byResource('table', 'dim_user')
    expect(Array.isArray(dimUserFavs)).toBe(true)
  })

  it('byResourceType 按类型过滤', () => {
    const tableFavs = FavoriteStore.byResourceType('table')
    expect(tableFavs.length).toBeGreaterThan(0)
    tableFavs.forEach(f => expect(f.resourceType).toBe('table'))
  })

  it('isFavorited 检测已收藏', () => {
    // 模拟添加
    FavoriteStore.add({
      userId: 'user-zhangsan',
      userName: '张三',
      resourceType: 'table',
      resourceId: 'temp_test',
      resourceName: '测试',
      group: 'personal',
      tags: [],
      notification: 'none',
      visitCount: 0,
      lastVisitTime: ''
    })
    expect(FavoriteStore.isFavorited('user-zhangsan', 'table', 'temp_test')).toBe(true)
  })

  it('isFavorited 检测未收藏', () => {
    expect(FavoriteStore.isFavorited('user-zhangsan', 'table', 'not_favorited')).toBe(false)
  })

  it('toggle 添加', () => {
    const before = FavoriteStore.list().length
    const result = FavoriteStore.toggle({
      userId: 'user-toggle',
      userName: '切换',
      resourceType: 'metric',
      resourceId: 'temp_metric',
      resourceName: '测试',
      group: 'personal',
      tags: [],
      notification: 'none'
    })
    expect(result?.added).toBe(true)
    expect(FavoriteStore.list().length).toBe(before + 1)
  })

  it('toggle 取消', () => {
    const result = FavoriteStore.toggle({
      userId: 'user-toggle',
      userName: '切换',
      resourceType: 'metric',
      resourceId: 'temp_metric',
      resourceName: '测试',
      group: 'personal',
      tags: [],
      notification: 'none'
    })
    expect(result?.added).toBe(false)
  })

  it('visit 增加计数', () => {
    const list = FavoriteStore.list()
    const target = list[0]
    const before = target.visitCount
    FavoriteStore.visit(target.id)
    expect(target.visitCount).toBe(before + 1)
    target.visitCount = before
  })

  it('remove 删除收藏', () => {
    FavoriteStore.add({
      userId: 'user-remove-test',
      userName: '测试',
      resourceType: 'field',
      resourceId: 'temp_remove',
      resourceName: '测试',
      group: 'personal',
      tags: [],
      notification: 'none',
      visitCount: 0,
      lastVisitTime: ''
    })
    const list = FavoriteStore.list()
    const target = list.find(f => f.resourceId === 'temp_remove')!
    const ok = FavoriteStore.remove(target.id)
    expect(ok).toBe(true)
  })

  it('stats 统计', () => {
    const stats = FavoriteStore.stats()
    expect(stats.total).toBeGreaterThan(0)
    expect(stats.byResourceType.table).toBeGreaterThan(0)
    expect(stats.byGroup.team).toBeGreaterThan(0)
  })
})