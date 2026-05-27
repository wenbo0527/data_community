import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { Message } from '@arco-design/web-vue'

export interface ApiResponse<T = any> {
  code: number
  message?: string
  data: T
  [key: string]: any
}

export interface ApiError {
  code?: number
  message: string
  details?: any
}

export interface RequestOptions extends AxiosRequestConfig {
  /** 禁用全局错误提示 */
  silent?: boolean
  /** 自定义错误提示消息 */
  errorMessage?: string
}

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加 token
    const token = localStorage.getItem('token')
    if (token) {
      ;(config.headers as any).Authorization = `Bearer ${token}`
    }

    // GET 请求添加时间戳防止缓存
    if ((config.method || 'get').toLowerCase() === 'get') {
      config.params = { ...(config.params || {}), _t: Date.now() }
    }

    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一错误处理
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data, status } = response

    // 2xx 状态码
    if (status >= 200 && status < 300) {
      // 如果是标准 API 响应格式
      if (data && typeof data === 'object' && 'code' in data) {
        if (data.code === 0 || data.code === 200) {
          return data as ApiResponse
        }
        // 业务错误 - 统一提示
        Message.error({
          content: data.message || '操作失败',
          duration: 3000
        })
        return Promise.reject(new Error((data as any).message || '操作失败'))
      }
      return data
    }

    return Promise.reject(new Error(`HTTP ${status}`))
  },
  (error: AxiosError) => {
    const { response, message } = error

    if (response) {
      const { status, data } = response

      switch (status) {
        case 400:
          showError((data as any)?.message || '请求参数错误')
          break
        case 401:
          // 清除 token 并跳转登录
          localStorage.removeItem('token')
          showError('登录已过期，请重新登录', 3000)
          setTimeout(() => {
            if (location.pathname !== '/login') {
              location.href = '/login'
            }
          }, 1000)
          break
        case 403:
          showError('没有权限访问该资源')
          break
        case 404:
          showError('请求的资源不存在')
          break
        case 500:
        case 502:
        case 503:
          showError('服务器错误，请稍后重试')
          break
        default:
          showError((data as any)?.message || `请求失败 (${status})`)
      }
    } else if (message === 'Network Error') {
      showError('网络连接失败，请检查网络')
    } else if (message.includes('timeout')) {
      showError('请求超时，请稍后重试')
    } else {
      showError('请求失败，请稍后重试')
    }

    const apiError: ApiError = {
      code: response?.status,
      message: message,
      details: error
    }

    return Promise.reject(apiError)
  }
)

// 统一错误提示函数
function showError(content: string, duration = 3000) {
  Message.error({
    content,
    duration
  })
}

export default request
export { request }