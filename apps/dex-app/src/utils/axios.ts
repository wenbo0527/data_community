/**
 * HTTP 请求工具 (基于 axios)
 */
import axios from 'axios'

// 创建 axios 实例
const instance = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 可以添加 token 等
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default instance

// 为了兼容，直接导出 instance
export { instance as axios }
