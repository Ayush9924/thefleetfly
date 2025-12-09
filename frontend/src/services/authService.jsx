import api from './api'

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export const register = async (name, email, password, role = 'manager') => {
  const response = await api.post('/auth/register', { name, email, password, role })
  return response.data
}

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me')
  return response.data
}