/**
 * 资源评论 Store(占位)
 */
export type ResourceType = 'table' | 'metric' | 'variable' | 'feature' | 'api' | 'document'
export type CommentType = 'question' | 'suggestion' | 'issue' | 'note'

export interface AssetComment {
  id: string
  resourceId: string
  resourceType: ResourceType
  type: CommentType
  author: string
  content: string
  timestamp: string
  replies?: AssetComment[]
}

const COMMENTS: AssetComment[] = [
  { id: 'c1', resourceId: 'dim_user', resourceType: 'table', type: 'note', author: '张三', content: '该表是客户主表,所有客户分析场景的核心', timestamp: '2025-08-01 10:00' },
  { id: 'c2', resourceId: 'fact_loan_apply', resourceType: 'table', type: 'question', author: '李四', content: '该表是否包含历史申请?', timestamp: '2025-08-02 14:30' }
]

export const CommentStore = {
  list() { return COMMENTS },
  byResource(id: string) { return COMMENTS.filter(c => c.resourceId === id) },
  byAuthor(author: string) { return COMMENTS.filter(c => c.author === author) },
  add(comment: Omit<AssetComment, 'id'>) {
    const newComment: AssetComment = { ...comment, id: `c_${Date.now()}` }
    COMMENTS.push(newComment)
    return newComment
  }
}

export const commentMocks = []
export default CommentStore