import type { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/api/crowds',
    method: 'get',
    response: () => {
      const now = new Date().toISOString()
      return [
        {
          id: 'dev_' + Date.now(),
          name: '动态生成用户',
          count: Math.floor(Math.random() * 5000),
          updateTime: now,
          _isMock: true
        },
        {
          id: 'dev_1',
          name: '开发环境用户',
          count: 2000,
          updateTime: now
        },
        {
          id: 1,
          name: '高净值客户',
          count: 1500,
          updateTime: now
        },
        {
          id: 2,
          name: '新注册用户',
          count: 4500,
          updateTime: now
        }
      ]
    }
  }
] as MockMethod[]
