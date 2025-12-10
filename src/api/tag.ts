import request from './request'
import type { TagItem } from '@/types/tag'
import type { TableField, ValidationResult } from '@/types/table'

const mockUsers = ['张三', '李四', '王五', '赵六', '钱七']

const genTags = (count: number): TagItem[] => {
  const dataTypes = ['string', 'number']
  const categories = ['basic', 'behavior', 'preference', 'business']
  const tagTypes = ['static', 'dynamic', 'computed', 'rule']
  const shareLevels = ['public', 'private']
  const mappingStatuses: Array<'configured' | 'unconfigured' | 'error'> = ['configured', 'unconfigured', 'error']
  return Array.from({ length: count }, (_, i) => ({
    id: `TAG_${String(i + 1).padStart(3, '0')}`,
    name: `标签${i + 1}`,
    dataType: dataTypes[Math.floor(Math.random() * dataTypes.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    tagType: tagTypes[Math.floor(Math.random() * tagTypes.length)],
    dimensionKey: `dim_key_${i + 1}`,
    shareLevel: shareLevels[Math.floor(Math.random() * shareLevels.length)],
    createUser: mockUsers[Math.floor(Math.random() * mockUsers.length)],
    createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    description: `这是标签${i + 1}的描述信息`,
    mappingStatus: mappingStatuses[Math.floor(Math.random() * mappingStatuses.length)]
  }))
}

export const listTags = async (params?: any): Promise<{ list: TagItem[]; total: number }> => {
  try {
    const res: any = await request.get('/tag/list', { params })
    if (res && res.data) return { list: res.data.list || [], total: res.data.total || 0 }
    if (Array.isArray(res)) return { list: res as TagItem[], total: (res as TagItem[]).length }
    return { list: [], total: 0 }
  } catch {
    const list = genTags(50)
    return { list, total: list.length }
  }
}

export const getTag = async (id: string): Promise<TagItem | null> => {
  try {
    const res: any = await request.get(`/tag/${id}`)
    return res?.data || null
  } catch {
    const list = genTags(50)
    return list.find(x => x.id === id) || null
  }
}

export const createTag = async (data: Partial<TagItem>): Promise<TagItem> => {
  try {
    const res: any = await request.post('/tag', data)
    return res?.data || (data as TagItem)
  } catch {
    return {
      id: data.id || `TAG_${Date.now()}`,
      name: data.name || '新标签',
      dataType: data.dataType || 'string',
      category: data.category || 'basic',
      tagType: data.tagType || 'static',
      dimensionKey: data.dimensionKey || 'dim_key',
      shareLevel: data.shareLevel || 'public',
      createUser: data.createUser || '当前用户',
      createTime: new Date().toISOString(),
      description: data.description || ''
    }
  }
}

export const updateTag = async (id: string, data: Partial<TagItem>): Promise<boolean> => {
  try {
    await request.put(`/tag/${id}`, data)
    return true
  } catch {
    return true
  }
}

export const deleteTags = async (ids: string[]): Promise<boolean> => {
  try {
    await request.delete('/tag', { data: { ids } })
    return true
  } catch {
    return true
  }
}

const mockSchemaByTable = (tableName: string): TableField[] => {
  const t = (tableName || '').toLowerCase()
  if (t.includes('tag_user')) {
    return [
      { name: 'user_id', type: 'string', description: '用户唯一标识' },
      { name: 'tag_code', type: 'string', description: '标签编码' },
      { name: 'tag_value', type: 'string', description: '标签值' },
      { name: 'dt', type: 'string', description: '分区-日期(yyyyMMdd)' },
      { name: 'hour', type: 'string', description: '分区-小时(HH)' },
      { name: 'import_ts', type: 'timestamp', description: '导入时间戳' }
    ]
  }
  if (t.includes('user_profile') || t.includes('user') || t.includes('users')) {
    return [
      { name: 'id', type: 'string', description: '用户ID' },
      { name: 'name', type: 'string', description: '姓名' },
      { name: 'gender', type: 'string', description: '性别' },
      { name: 'age', type: 'number', description: '年龄' },
      { name: 'mobile', type: 'string', description: '手机号码' },
      { name: 'email', type: 'string', description: '邮箱' },
      { name: 'city', type: 'string', description: '城市' },
      { name: 'updated_at', type: 'timestamp', description: '更新时间' }
    ]
  }
  if (t.includes('events')) {
    return [
      { name: 'event_id', type: 'string', description: '事件ID' },
      { name: 'user_id', type: 'string', description: '用户ID' },
      { name: 'event_name', type: 'string', description: '事件名称' },
      { name: 'ts', type: 'timestamp', description: '事件时间' },
      { name: 'properties', type: 'json', description: '事件属性' }
    ]
  }
  return [
    { name: 'id', type: 'string', description: '主键ID' },
    { name: 'created_at', type: 'timestamp', description: '创建时间' },
    { name: 'updated_at', type: 'timestamp', description: '更新时间' }
  ]
}

export const fetchTableSchema = async (dataSourceId: string, tableName: string): Promise<TableField[]> => {
  try {
    const res: any = await request.get('/tag/table/schema', { params: { dataSourceId, tableName } })
    if (res?.data && Array.isArray(res.data)) return res.data
    // 如果服务端未返回结构，走本地mock
    return mockSchemaByTable(tableName)
  } catch {
    // 本地mock：根据表名返回更贴近真实的字段集合
    return mockSchemaByTable(tableName)
  }
}

export const validatePrimaryKey = async (fields: string[]): Promise<ValidationResult> => {
  try {
    const res: any = await request.post('/tag/table/validate-primary-key', { fields })
    return res?.data
  } catch {
    const items = fields.map(f => ({ field: f, uniqueness: Math.floor(85 + Math.random() * 15), duplicates: Math.floor(Math.random() * 10) }))
    const score = Math.round(items.reduce((s, i) => s + i.uniqueness, 0) / items.length)
    return { isValid: score >= 95, items, score }
  }
}

export const registerTagTable = async (payload: any): Promise<{ status: 'SUCCESS' | 'FAILED'; tableId?: string; qualityScore?: number }> => {
  try {
    const res: any = await request.post('/tag/table/register', payload)
    return res?.data
  } catch {
    const ok = Math.random() > 0.2
    return ok
      ? { status: 'SUCCESS', tableId: `TBL_${Date.now()}`, qualityScore: Math.floor(90 + Math.random() * 10) }
      : { status: 'FAILED' }
  }
}

export const getTagLineage = async (tagId: string): Promise<{ nodes: any[]; links: any[] }> => {
  try {
    const res: any = await request.get(`/tag/${tagId}/lineage`)
    return res?.data || { nodes: [], links: [] }
  } catch {
    return {
      nodes: [
        { id: 1, name: '标签节点', type: 'tag', updatedAt: Date.now() },
        { id: 2, name: '人群节点', type: 'audience', lastUpdateTime: Date.now() - 86400000 },
        { id: 3, name: '数据表节点', type: 'table', lastSyncTime: Date.now() - 172800000 }
      ],
      links: [
        { source: 1, target: 2 },
        { source: 2, target: 3 }
      ]
    }
  }
}
