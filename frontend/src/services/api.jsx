import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
})

// Request interceptor to add token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('currentUser')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Password reset API calls
export const requestPasswordReset = (email) => api.post('/auth/forgot-password', { email })
export const verifyOTP = (email, otp) => api.post('/auth/verify-otp', { email, otp })
export const resetPassword = (data) => api.post('/auth/reset-password', data)

export default api