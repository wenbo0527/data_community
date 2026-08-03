/**
 * 协作注释(CommentStore)
 *
 * 主流(Alation/Atlas)支持用户对资产/字段做注释、评论、打分。
 * 本项目补齐这块。
 */

import type { MockMethod } from 'vite-plugin-mock'

export type ResourceType = 'table' | 'field' | 'metric' | 'tag' | 'audience' | 'domain' | 'element'
export type CommentType = 'comment' | 'rating' | 'suggestion' | 'issue'

export interface AssetComment {
  id: string
  resourceType: ResourceType
  resourceId: string
  commentType: CommentType
  /** 评论文本(comment 类型时) */
  content?: string
  /** 评分 1-5(rating 类型时) */
  rating?: number
  /** 评论人 */
  userId: string
  userName: string
  /** 评论时间 */
  createTime: string
  /** 回复数 */
  replyCount?: number
  /** 点赞数 */
  likeCount: number
  /** 是否已解决(issue 类型时) */
  resolved?: boolean
}

/**
 * 注释 + 评论 mock 数据
 */
export const COMMENTS: AssetComment[] = [
  // === 表注释 ===
  {
    id: 'c_001',
    resourceType: 'table', resourceId: 'dim_user',
    commentType: 'comment',
    content: '客户主维度表,建议后续增加 last_active_at 字段',
    userId: 'user-zhangsan', userName: '张三',
    createTime: '2025-07-01 10:30',
    likeCount: 5, replyCount: 2
  },
  {
    id: 'c_002',
    resourceType: 'table', resourceId: 'dim_user',
    commentType: 'rating',
    rating: 5,
    userId: 'user-zhaosi', userName: '赵六',
    createTime: '2025-07-01 14:20',
    likeCount: 3
  },
  {
    id: 'c_003',
    resourceType: 'table', resourceId: 'fact_loan_apply',
    commentType: 'issue',
    content: 'apply_amt 字段在 6 月 15 日出现异常峰值,需排查',
    userId: 'user-xindai', userName: '信贷经理',
    createTime: '2025-06-20 09:00',
    likeCount: 8, replyCount: 3, resolved: false
  },

  // === 字段注释 ===
  {
    id: 'c_004',
    resourceType: 'field', resourceId: 'dim_user.id_card_no',
    commentType: 'comment',
    content: '此字段为个人识别信息,严禁明文导出,使用前需通过 PD-COM 申请',
    userId: 'user-fengkong', userName: '风控值班',
    createTime: '2025-06-15 11:00',
    likeCount: 12, replyCount: 1
  },
  {
    id: 'c_005',
    resourceType: 'field', resourceId: 'fact_loan_apply.apply_amt',
    commentType: 'suggestion',
    content: '建议增加 unit(币种)字段,目前只支持人民币',
    userId: 'user-chanpin', userName: '产品经理',
    createTime: '2025-06-25 15:30',
    likeCount: 6, replyCount: 4
  },
  {
    id: 'c_006',
    resourceType: 'field', resourceId: 'dws_risk_score.credit_score',
    commentType: 'rating',
    rating: 4,
    userId: 'user-fengkong', userName: '风控值班',
    createTime: '2025-07-01 09:00',
    likeCount: 2
  },

  // === 指标注释 ===
  {
    id: 'c_007',
    resourceType: 'metric', resourceId: 'DAU',
    commentType: 'comment',
    content: '口径:当日有任意操作的唯一用户数,去重基于 user_id',
    userId: 'user-zhaosi', userName: '赵六',
    createTime: '2025-06-10 14:00',
    likeCount: 15, replyCount: 5
  },

  // === 标签注释 ===
  {
    id: 'c_008',
    resourceType: 'tag', resourceId: 'tag_026',
    commentType: 'comment',
    content: '该标签用于识别高潜力用户,常用于营销圈选',
    userId: 'user-yingxiao', userName: '营销经理',
    createTime: '2025-06-20 10:00',
    likeCount: 3
  }
]

/**
 * Comment Store
 */
export const CommentStore = {
  list(): AssetComment[] {
    return COMMENTS
  },

  /** 通过资源查评论 */
  byResource(resourceType: ResourceType, resourceId: string): AssetComment[] {
    return COMMENTS.filter(c =>
      c.resourceType === resourceType && c.resourceId === resourceId
    )
  },

  /** 通过资源类型查评论 */
  byType(resourceType: ResourceType): AssetComment[] {
    return COMMENTS.filter(c => c.resourceType === resourceType)
  },

  /** 通过用户查评论 */
  byUser(userId: string): AssetComment[] {
    return COMMENTS.filter(c => c.userId === userId)
  },

  /** 通过类型(comment/rating/issue) */
  byCommentType(type: CommentType): AssetComment[] {
    return COMMENTS.filter(c => c.commentType === type)
  },

  /** 未解决的 issue */
  openIssues(): AssetComment[] {
    return COMMENTS.filter(c => c.commentType === 'issue' && !c.resolved)
  },

  /** 新增 */
  add(input: Omit<AssetComment, 'id' | 'createTime' | 'likeCount'>): AssetComment {
    const newComment: AssetComment = {
      ...input,
      id: `c_${Date.now()}`,
      createTime: new Date().toISOString(),
      likeCount: 0
    }
    COMMENTS.push(newComment)
    return newComment
  },

  /** 点赞 */
  like(commentId: string): void {
    const c = COMMENTS.find(c => c.id === commentId)
    if (c) c.likeCount++
  },

  /** 标记解决 */
  resolve(commentId: string): void {
    const c = COMMENTS.find(c => c.id === commentId)
    if (c && c.commentType === 'issue') c.resolved = true
  },

  stats() {
    const total = COMMENTS.length
    const issues = COMMENTS.filter(c => c.commentType === 'issue').length
    const openIssues = this.openIssues().length
    const ratings = COMMENTS.filter(c => c.commentType === 'rating')
    const avgRating = ratings.length > 0
      ? Math.round(ratings.reduce((s, c) => s + (c.rating || 0), 0) / ratings.length * 10) / 10
      : 0

    return {
      total,
      issues,
      openIssues,
      ratingsCount: ratings.length,
      avgRating
    }
  }
}

/**
 * HTTP Mock 端点
 */
export const commentMocks: MockMethod[] = [
  {
    url: '/api/comments/list',
    method: 'get',
    response: ({ query }: { query: { resourceType?: string; resourceId?: string; userId?: string } }) => {
      let result = COMMENTS
      if (query.resourceType && query.resourceId) {
        result = result.filter(c =>
          c.resourceType === query.resourceType && c.resourceId === query.resourceId
        )
      } else if (query.resourceType) {
        result = result.filter(c => c.resourceType === query.resourceType)
      } else if (query.userId) {
        result = result.filter(c => c.userId === query.userId)
      }
      return { code: 0, data: result, total: result.length }
    }
  },
  {
    url: '/api/comments/stats',
    method: 'get',
    response: () => ({ code: 0, data: CommentStore.stats() })
  }
]