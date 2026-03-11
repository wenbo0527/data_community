import Mock from 'mockjs'
import community from './community'

export function registerCommunityMocks() {
  const users = community.users || []
  Mock.mock(/\/api\/community\/users(\?.*)?$/, 'get', (options) => {
    try {
      const url = new URL(options.url, 'http://localhost')
      const keyword = (url.searchParams.get('keyword') || '').toLowerCase()
      const page = parseInt(url.searchParams.get('page') || '1', 10)
      const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10)

      let list = users
      if (keyword) {
        list = list.filter(u =>
          String(u.username || '').toLowerCase().includes(keyword) ||
          String(u.displayName || '').toLowerCase().includes(keyword) ||
          String(u.email || '').toLowerCase().includes(keyword)
        )
      }

      const total = list.length
      const start = (page - 1) * pageSize
      const items = list.slice(start, start + pageSize)

      return {
        success: true,
        data: {
          items,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize)
        },
        timestamp: new Date().toISOString()
      }
    } catch (err) {
      console.error('[Mock community users] error:', err)
      return { success: false, message: 'mock error', timestamp: new Date().toISOString() }
    }
  })
}

export default { registerCommunityMocks }
