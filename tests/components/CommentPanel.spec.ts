/**
 * CommentPanel 组件测试
 *
 * 注: 此处测试聚焦于 CommentStore(数据源),不渲染 Arco 组件
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { CommentStore } from '@/mock/shared/comment-store'

describe('CommentPanel - CommentStore 集成', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('CommentStore 提供 mock 注释', () => {
    expect(CommentStore.list().length).toBeGreaterThan(0)
  })

  it('byResource 过滤有效', () => {
    const dimUserComments = CommentStore.byResource('table', 'dim_user')
    expect(dimUserComments.length).toBeGreaterThan(0)
  })

  it('byCommentType 4 种类型', () => {
    expect(CommentStore.byCommentType('comment').length).toBeGreaterThan(0)
    expect(CommentStore.byCommentType('rating').length).toBeGreaterThan(0)
    expect(CommentStore.byCommentType('issue').length).toBeGreaterThan(0)
    expect(CommentStore.byCommentType('suggestion').length).toBeGreaterThan(0)
  })

  it('openIssues 列出未解决的 issue', () => {
    const open = CommentStore.openIssues()
    open.forEach(c => {
      expect(c.commentType).toBe('issue')
      expect(c.resolved).toBe(false)
    })
  })

  it('add 创建注释', () => {
    const before = CommentStore.list().length
    CommentStore.add({
      resourceType: 'table',
      resourceId: 'test_add',
      commentType: 'comment',
      content: '测试添加',
      userId: 'user-test',
      userName: '测试',
      replyCount: 0,
      resolved: false
    })
    expect(CommentStore.list().length).toBe(before + 1)
  })

  it('like 增加计数', () => {
    const list = CommentStore.list()
    const target = list[0]
    const before = target.likeCount
    CommentStore.like(target.id)
    expect(target.likeCount).toBe(before + 1)
    target.likeCount = before // 撤销
  })

  it('resolve 标记解决', () => {
    const issue = CommentStore.byCommentType('issue').find(i => !i.resolved)
    if (issue) {
      CommentStore.resolve(issue.id)
      expect(issue.resolved).toBe(true)
      issue.resolved = false // 撤销
    }
  })

  it('stats 统计合理', () => {
    const stats = CommentStore.stats()
    expect(stats.total).toBeGreaterThan(0)
    expect(stats.openIssues).toBeGreaterThanOrEqual(0)
    expect(stats.avgRating).toBeGreaterThan(0)
  })
})