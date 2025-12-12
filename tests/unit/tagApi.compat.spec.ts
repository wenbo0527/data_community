import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from '../../src/utils/request'
import {
  listTags,
  getTag,
  createTag,
  updateTag,
  deleteTags,
  fetchTableSchema,
  validatePrimaryKey,
  registerTagTable
} from '../../src/api/tag.ts'

vi.mock('../../src/utils/request', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    }
  }
})

describe('tag API compatibility layer', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('listTags returns list and total', async () => {
    const mockData = { data: { data: [{ id: '1', name: 't1' }], total: 1 } }
    vi.mocked(request.get).mockResolvedValueOnce(mockData as any)
    const res = await listTags({ page: 1, pageSize: 10 })
    expect(request.get).toHaveBeenCalledWith('/api/v1/tag-tables', { params: { page: 1, pageSize: 10 } })
    expect(res.list.length).toBe(1)
    expect(res.total).toBe(1)
  })

  it('getTag returns tag detail', async () => {
    const mockData = { data: { id: '1', name: 't1' } }
    vi.mocked(request.get).mockResolvedValueOnce(mockData as any)
    const res = await getTag('1')
    expect(request.get).toHaveBeenCalledWith('/api/v1/tag-tables/1')
    expect(res.id).toBe('1')
  })

  it('createTag posts to tag-tables', async () => {
    const payload = { name: 'n', code: 'c', description: '', categories: [], dataSourceId: 'ds', tableName: 'tb', primaryKey: 'id', identityType: 'mobile', primaryKeyFormat: '', mappingRules: [], enableMapping: false }
    const mockData = { data: { id: '1', name: 'n' } }
    vi.mocked(request.post).mockResolvedValueOnce(mockData as any)
    const res = await createTag(payload as any)
    expect(request.post).toHaveBeenCalledWith('/api/v1/tag-tables', payload)
    expect(res.id).toBe('1')
  })

  it('updateTag puts to tag-tables/:id', async () => {
    vi.mocked(request.put).mockResolvedValueOnce({ success: true } as any)
    const ok = await updateTag('1', { name: 'x' })
    expect(request.put).toHaveBeenCalledWith('/api/v1/tag-tables/1', { name: 'x' })
    expect(ok).toBe(true)
  })

  it('deleteTags deletes each id', async () => {
    vi.mocked(request.delete).mockResolvedValue({ success: true } as any)
    const ok = await deleteTags(['1', '2'])
    expect(request.delete).toHaveBeenCalledTimes(2)
    expect(ok).toBe(true)
  })

  it('fetchTableSchema get fields endpoint', async () => {
    const mockFields = [{ name: 'id', type: 'string', description: '', nullable: false, isPrimaryKey: true, isPartitionField: false }]
    vi.mocked(request.get).mockResolvedValueOnce({ data: mockFields } as any)
    const res = await fetchTableSchema('ds', 'tb')
    expect(request.get).toHaveBeenCalledWith('/api/v1/data-sources/ds/tables/tb/fields')
    expect(res[0].name).toBe('id')
  })

  it('validatePrimaryKey posts to check-uniqueness', async () => {
    const mockResult = { score: 1, uniqueCount: 1, totalCount: 1, suggestion: '' }
    vi.mocked(request.post).mockResolvedValueOnce({ data: mockResult } as any)
    const res = await validatePrimaryKey('ds', 'tb', ['id'])
    expect(request.post).toHaveBeenCalledWith('/api/v1/tag-tables/check-uniqueness', { dataSourceId: 'ds', tableName: 'tb', fields: ['id'] })
    expect(res.uniqueCount).toBe(1)
  })

  it('registerTagTable posts to tag-tables', async () => {
    const payload = { name: 'n', code: 'c', description: '', categories: [], dataSourceId: 'ds', tableName: 'tb', primaryKey: 'id', identityType: 'mobile', primaryKeyFormat: '', mappingRules: [], enableMapping: false }
    vi.mocked(request.post).mockResolvedValueOnce({ data: { id: '1' } } as any)
    const res = await registerTagTable(payload as any)
    expect(request.post).toHaveBeenCalledWith('/api/v1/tag-tables', payload)
    expect(res.id).toBe('1')
  })
})
