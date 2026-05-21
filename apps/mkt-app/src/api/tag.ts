import request from '@/utils/request'
import type { 
  TagTable, 
  CreateTagTableDTO, 
  UpdateTagTableDTO, 
  GetTagTablesParams,
  TableField,
  DataSource,
  UniquenessCheckResult,
  BatchCreateResult
} from '@/types/tag'

// 统一响应格式
interface ApiResponse<T> {
  success: boolean
  code: number
  message: string
  data: T
  timestamp: number
}

// 分页响应格式
interface PaginatedResponse<T> {
  data: T[]
  total: number
  current: number
  pageSize: number
  pages: number
}

/**
 * 标签表管理API
 */
export const tagAPI = {
  /**
   * 获取标签表列表
   */
  getTagTables: (params?: GetTagTablesParams): Promise<ApiResponse<PaginatedResponse<TagTable>>> => {
    return request.get('/api/v1/tag-tables', { params })
  },

  /**
   * 创建标签表
   */
  createTagTable: (data: CreateTagTableDTO): Promise<ApiResponse<TagTable>> => {
    return request.post('/api/v1/tag-tables', data)
  },

  /**
   * 更新标签表
   */
  updateTagTable: (id: string, data: UpdateTagTableDTO): Promise<ApiResponse<TagTable>> => {
    return request.put(`/api/v1/tag-tables/${id}`, data)
  },

  /**
   * 删除标签表
   */
  deleteTagTable: (id: string): Promise<ApiResponse<void>> => {
    return request.delete(`/api/v1/tag-tables/${id}`)
  },

  /**
   * 批量创建标签表
   */
  batchCreateTagTables: (data: CreateTagTableDTO[]): Promise<ApiResponse<BatchCreateResult>> => {
    return request.post('/api/v1/tag-tables/batch', data)
  },

  /**
   * 获取数据源列表
   */
  getDataSources: (): Promise<ApiResponse<DataSource[]>> => {
    return request.get('/api/v1/data-sources')
  },

  /**
   * 获取数据表列表
   */
  getTables: (dataSourceId: string): Promise<ApiResponse<string[]>> => {
    return request.get(`/api/v1/data-sources/${dataSourceId}/tables`)
  },

  /**
   * 获取表字段信息
   */
  getTableFields: (dataSourceId: string, tableName: string): Promise<ApiResponse<TableField[]>> => {
    return request.get(`/api/v1/data-sources/${dataSourceId}/tables/${tableName}/fields`)
  },

  /**
   * 检查主键唯一性
   */
  checkPrimaryKeyUniqueness: (dataSourceId: string, tableName: string, fields: string[]): Promise<ApiResponse<UniquenessCheckResult>> => {
    return request.post('/api/v1/tag-tables/check-uniqueness', {
      dataSourceId,
      tableName,
      fields
    })
  },

  /**
   * 获取标签表详情
   */
  getTagTableDetail: (id: string): Promise<ApiResponse<TagTable>> => {
    return request.get(`/api/v1/tag-tables/${id}`)
  },

  /**
   * 归档/激活标签表
   */
  archiveTagTable: (id: string, archived: boolean): Promise<ApiResponse<TagTable>> => {
    return request.put(`/api/v1/tag-tables/${id}/archive`, { archived })
  },

  /**
   * 获取标签表统计信息
   */
  getTagTableStats: (): Promise<ApiResponse<{
    total: number
    active: number
    archived: number
    trend: {
      total: number
      active: number
      archived: number
    }
  }>> => {
    return request.get('/api/v1/tag-tables/stats')
  },

  /**
   * 批量导入标签
   */
  batchImportTags: (data: CreateTagTableDTO[]): Promise<ApiResponse<BatchCreateResult>> => {
    return request.post('/api/v1/tag-tables/import', data)
  }
}

/**
 * 标签分类API
 */
export const categoryAPI = {
  /**
   * 获取标签分类列表
   */
  getCategories: (): Promise<ApiResponse<string[]>> => {
    return request.get('/api/v1/tag-categories')
  },

  /**
   * 创建标签分类
   */
  createCategory: (name: string): Promise<ApiResponse<string>> => {
    return request.post('/api/v1/tag-categories', { name })
  }
}

/**
 * IDMapping规则API
 */
export const mappingAPI = {
  /**
   * 获取IDMapping规则列表
   */
  getMappingRules: (tagTableId: string): Promise<ApiResponse<any[]>> => {
    return request.get(`/api/v1/tag-tables/${tagTableId}/mapping-rules`)
  },

  /**
   * 创建IDMapping规则
   */
  createMappingRule: (tagTableId: string, data: any): Promise<ApiResponse<any>> => {
    return request.post(`/api/v1/tag-tables/${tagTableId}/mapping-rules`, data)
  },

  /**
   * 更新IDMapping规则
   */
  updateMappingRule: (tagTableId: string, ruleId: string, data: any): Promise<ApiResponse<any>> => {
    return request.put(`/api/v1/tag-tables/${tagTableId}/mapping-rules/${ruleId}`, data)
  },

  /**
   * 删除IDMapping规则
   */
  deleteMappingRule: (tagTableId: string, ruleId: string): Promise<ApiResponse<void>> => {
    return request.delete(`/api/v1/tag-tables/${tagTableId}/mapping-rules/${ruleId}`)
  }
}

/**
 * 数据源API
 */
export const datasourceAPI = {
  /**
   * 获取数据源列表
   */
  getDataSources: (): Promise<ApiResponse<DataSource[]>> => {
    return request.get('/api/v1/data-sources')
  },

  /**
   * 获取数据表列表
   */
  getTables: (dataSourceId: string): Promise<ApiResponse<string[]>> => {
    return request.get(`/api/v1/data-sources/${dataSourceId}/tables`)
  },
  /**
   * 获取表字段信息
   */
  getTableFields: (dataSourceId: string, tableName: string): Promise<ApiResponse<TableField[]>> => {
    return request.get(`/api/v1/data-sources/${dataSourceId}/tables/${tableName}/fields`)
  }
}

export const listTags = async (params?: GetTagTablesParams): Promise<{ list: TagTable[]; total: number }> => {
  const res = await tagAPI.getTagTables(params)
  return { list: res.data.data, total: res.data.total }
}

export const getTag = async (id: string): Promise<TagTable> => {
  const res = await tagAPI.getTagTableDetail(id)
  return res.data
}

export const createTag = async (data: CreateTagTableDTO): Promise<TagTable> => {
  const res = await tagAPI.createTagTable(data)
  return res.data
}

export const updateTag = async (id: string, data: UpdateTagTableDTO): Promise<boolean> => {
  const res = await tagAPI.updateTagTable(id, data)
  return !!res.success
}

export const deleteTags = async (ids: string[]): Promise<boolean> => {
  const results = await Promise.all(ids.map((id) => tagAPI.deleteTagTable(id)))
  return results.every((r) => !!r.success)
}

export const fetchTableSchema = async (dataSourceId: string, tableName: string): Promise<TableField[]> => {
  const res = await datasourceAPI.getTableFields(dataSourceId, tableName)
  return res.data
}

export const validatePrimaryKey = async (
  dataSourceId: string,
  tableName: string,
  fields: string[]
): Promise<UniquenessCheckResult> => {
  const res = await tagAPI.checkPrimaryKeyUniqueness(dataSourceId, tableName, fields)
  return res.data
}

export const registerTagTable = async (data: CreateTagTableDTO): Promise<TagTable> => {
  const res = await tagAPI.createTagTable(data)
  return res.data
}

export const getTagLineage = async (id: string): Promise<any> => {
  try {
    const res = await request.get(`/api/v1/tag-tables/${id}/lineage`)
    return res.data
  } catch {
    return { nodes: [], edges: [] }
  }
}
