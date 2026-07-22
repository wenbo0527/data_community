/**
 * admin-app request 入口
 *
 * TASK-20260714-05935425 Phase 1 清理 (2026-07-15):
 * - 项目无真后端，删除 axios.create，改 USE_MOCK 短路模式
 * - 调用方 axios.get/post/put/delete 替换为 mockDelay(mockOk(...))
 *
 * dev 边界：保留 export default request，保持调用方 import 不变
 */

const USE_MOCK = true

// 模拟网络延迟
const mockDelay = <T>(data: T, ms = 100): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), ms))

// Mock 响应包装
const mockOk = <T>(data: T) => ({ success: true, data, code: 200, message: 'success', timestamp: new Date().toISOString() })

// Mock proxy 对象 - 实现 axios.create() 接口的最小子集
// 调用方使用方式: request.get/post/put/delete
const request: any = {
  get: (_url: string, _config?: any) => mockDelay(mockOk({ list: [], total: 0 })),
  post: (_url: string, _data?: any, _config?: any) => mockDelay(mockOk({ id: 'mock-' + Date.now() })),
  put: (_url: string, _data?: any, _config?: any) => mockDelay(mockOk({ success: true })),
  delete: (_url: string, _config?: any) => mockDelay(mockOk({ success: true })),
  // 兼容旧拦截器 API
  interceptors: {
    request: { use: (_fn: any) => _fn },
    response: { use: (_fn: any) => _fn }
  }
}

if (!USE_MOCK) {
  // dead code: 项目无真后端，保留供未来真实接口联调
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const axios = require('axios')
  request.interceptors = axios.interceptors
}

export default request
