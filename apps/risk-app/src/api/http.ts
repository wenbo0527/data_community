import axios from 'axios'

const baseURL = (import.meta.env?.VITE_API_BASE as string) || '/api'

const http = axios.create({
  baseURL,
  timeout: 15000
})

http.interceptors.request.use((config) => {
  return config
})

http.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err)
)

export default http
