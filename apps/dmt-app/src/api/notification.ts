// Notification API for dmt-app
export const notificationApi = {
  async getList(params: any) {
    return { code: 200, message: 'success', data: { list: [], pagination: { page: 1, pageSize: 10, total: 0 } } }
  },
  async create(data: any) {
    return { code: 200, message: 'success', data: null }
  },
  async markAsRead(id: string) {
    return { code: 200, message: 'success', data: null }
  }
}
