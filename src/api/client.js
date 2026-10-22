import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  timeout: 10000,
})

// Автоматическая подстановка токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Унификация ошибок
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
    }
    const message =
      err.response?.data?.error ||
      err.message ||
      'Ошибка сети'
    return Promise.reject(new Error(message))
  }
)

export default api