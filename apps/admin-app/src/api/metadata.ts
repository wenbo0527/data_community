// Metadata API
export const metadataApi = {
  async getList(params: any) {
    return { code: 200, message: 'success', data: { list: [], pagination: { page: 1, pageSize: 10, total: 0 } } }
  },
  async create(data: any) {
    return { code: 200, message: 'success', data: null }
  },
  async update(id: string, data: any) {
    return { code: 200, message: 'success', data: null }
  },
  async delete(id: string) {
    return { code: 200, message: 'success', data: null }
  }
}

export async function createMetadataTask(data: any) {
  return { code: 200, message: 'success', data: null }
}

export async function getMetadataTaskDetail(id: string) {
  return { code: 200, message: 'success', data: null }
}
