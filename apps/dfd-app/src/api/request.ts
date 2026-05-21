import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`
    }
    if ((config.method || 'get').toLowerCase() === 'get') {
      config.params = { ...(config.params || {}), _t: Date.now() }
    }
    return config
  },
  error => Promise.reject(error)
)

request.interceptors.response.use(
  response => {
    const { data, status } = response
    if (status >= 200 && status < 300) {
      if (data && typeof data === 'object' && 'code' in data) {
        if (data.code === 0 || data.code === 200) return data
        return Promise.reject(new Error((data as any).message || '操作失败'))
      }
      return data
    }
    return Promise.reject(new Error(`HTTP ${status}`))
  },
  error => {
    const { response, message } = error
    if (response && response.status === 401) {
      localStorage.removeItem('token')
      setTimeout(() => {
        if (location.pathname !== '/login') location.href = '/login'
      }, 300)
    } else if (message === 'Network Error') {
      return Promise.reject(new Error('网络错误'))
    }
    return Promise.reject(error)
  }
)

export default request

