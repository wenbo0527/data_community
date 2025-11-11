import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { Message } from '@arco-design/web-vue'

// 请求配置
const REQUEST_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  withCredentials: true
}

// 创建axios实例
const instance: AxiosInstance = axios.create(REQUEST_CONFIG)

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加请求时间戳
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data, config } = response
    
    // 如果是文件下载，直接返回
    if (config.responseType === 'blob') {
      return response
    }
    
    // 处理业务逻辑错误
    if (data.code !== undefined && data.code !== 0 && data.code !== 200) {
      Message.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message || '请求失败'))
    }
    
    return data
  },
  (error) => {
    const { response } = error
    
    if (response) {
      const { status, data } = response
      
      switch (status) {
        case 401:
          // 未授权，跳转到登录页
          Message.error('登录已过期，请重新登录')
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          Message.error('没有权限访问该资源')
          break
        case 404:
          Message.error('请求的资源不存在')
          break
        case 500:
          Message.error('服务器内部错误')
          break
        case 502:
        case 503:
          Message.error('服务器暂时不可用')
          break
        default:
          Message.error(data?.message || '请求失败')
      }
    } else if (error.code === 'ECONNABORTED') {
      Message.error('请求超时，请稍后重试')
    } else if (error.message === 'Network Error') {
      Message.error('网络连接失败，请检查网络连接')
    } else {
      Message.error('请求失败，请稍后重试')
    }
    
    return Promise.reject(error)
  }
)

// 请求工具类
export class Request {
  /**
   * GET请求
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await instance.get(url, config)
    return response.data || response
  }

  /**
   * POST请求
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await instance.post(url, data, config)
    return response.data || response
  }

  /**
   * PUT请求
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await instance.put(url, data, config)
    return response.data || response
  }

  /**
   * DELETE请求
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await instance.delete(url, config)
    return response.data || response
  }

  /**
   * PATCH请求
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await instance.patch(url, data, config)
    return response.data || response
  }

  /**
   * 上传文件
   */
  async upload<T = any>(url: string, file: File, data?: any): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (data) {
      Object.keys(data).forEach(key => {
        formData.append(key, data[key])
      })
    }

    const response = await instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data || response
  }

  /**
   * 下载文件
   */
  async download(url: string, params?: any, filename?: string): Promise<void> {
    const response = await instance.get(url, {
      params,
      responseType: 'blob'
    })

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || `download_${Date.now()}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }
}

// 创建请求实例
export const request = new Request()

// 导出默认实例
export default instance