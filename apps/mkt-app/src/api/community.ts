import request from '@/utils/mockRequest'

export const communityApi = {
  getList: (params: any) => request.get('/api/community/list', { params }),
  getDetail: (id: string) => request.get(`/api/community/${id}`)
}

export const searchApi = {
  search: (params: any) => request.get('/api/search', { params })
}
