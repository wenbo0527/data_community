import Mock from 'mockjs'
const __Mock = (Mock && typeof Mock.setup === 'function')
  ? Mock
  : (Mock && Mock.default && typeof Mock.default.setup === 'function')
    ? Mock.default
    : null
const __MockGlobal = __Mock || { setup: () => {} }
if (typeof globalThis !== 'undefined') {
  globalThis.Mock = __MockGlobal
}
import { setupVariableManagementMock } from './variable-management'
import variableMap from './variable-map'
import { registerCommunityMocks } from './community-api'

// 设置Mock.js配置
if (__Mock) {
  __Mock.setup({
    timeout: '200-600'
  })
}

// 注册所有Mock接口
function registerMocks() {
  // 注册变量管理相关接口（函数式注册）
  if (__Mock) {
    setupVariableManagementMock()
  }
  
  // 注册变量地图相关接口
  if (__Mock) {
    variableMap.forEach(mock => {
      const method = mock.method || mock.type || 'get'
      __Mock.mock(mock.url, method, (options) => {
        try {
          return typeof mock.response === 'function' ? mock.response(options) : mock.response
        } catch (err) {
          console.error('[Mock error]', mock.url, err)
          return { code: 500, message: 'mock response error', data: null }
        }
      })
    })
  }

  // 注册社区模块接口（用户列表）
  if (__Mock) {
    registerCommunityMocks()
  }
  
  console.log('Mock接口注册完成')
}

// 初始化Mock服务
export function initMockService() {
  if (process.env.NODE_ENV === 'development') {
    registerMocks()
    console.log('Mock服务已启动')
  }
}

// 导出Mock工具函数
export * from './utils'

// 默认导出初始化函数
export default {
  init: initMockService
}
