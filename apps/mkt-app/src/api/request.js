import axios from 'axios'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 添加认证token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const { data, status } = response
    
    // 处理成功响应
    if (status >= 200 && status < 300) {
      // 如果响应数据中有code字段，检查业务状态码
      if (data && data.code !== undefined) {
        if (data.code === 0 || data.code === 200) {
          return data
        } else {
          // 业务错误
          Message.error({
            content: data.message || '操作失败',
            duration: 3000
          })
          return Promise.reject(new Error(data.message || '操作失败'))
        }
      }
      
      return data
    }
    
    // 处理其他状态码
    return Promise.reject(new Error(`HTTP ${status}`))
  },
  error => {
    console.error('Response error:', error)
    
    const { response, message } = error
    
    if (response) {
      const { status, data } = response
      
      switch (status) {
        case 400:
          Message.error({
            content: data?.message || '请求参数错误',
            duration: 3000
          })
          break
        case 401:
          Message.error({
            content: '登录已过期，请重新登录',
            duration: 3000
          })
          // 清除本地存储的token
          localStorage.removeItem('token')
          // 跳转到登录页面
          setTimeout(() => {
            const router = useRouter()
            router.push('/login')
          }, 1000)
          break
        case 403:
          Message.error({
            content: '没有权限访问该资源',
            duration: 3000
          })
          break
        case 404:
          Message.error({
            content: '请求的资源不存在',
            duration: 3000
          })
          break
        case 500:
        case 502:
        case 503:
          Message.error({
            content: '服务器错误，请稍后重试',
            duration: 3000
          })
          break
        default:
          Message.error({
            content: data?.message || `请求失败 (${status})`,
            duration: 3000
          })
      }
    } else if (message === 'Network Error') {
      Message.error({
        content: '网络连接失败，请检查网络',
        duration: 3000
      })
    } else if (message.includes('timeout')) {
      Message.error({
        content: '请求超时，请稍后重试',
        duration: 3000
      })
    } else {
      Message.error({
        content: '请求失败，请稍后重试',
        duration: 3000
      })
    }
    
    return Promise.reject(error)
  }
)

export default request