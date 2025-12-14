import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { login as apiLogin, register as apiRegister, getCurrentUser } from '../services/authService.jsx'
import { disconnectSocket } from '../lib/socket.js'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
      } catch (error) {
        console.error('Failed to fetch current user:', error)
        logout()
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      disconnectSocket() // Disconnect old socket before logging in as new user
      const { user, token } = await apiLogin(email, password)
      setCurrentUser(user)
      localStorage.setItem('token', token)
      localStorage.setItem('currentUser', JSON.stringify(user))
      toast.success('Logged in successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Failed to login. Please check your credentials.')
      throw error
    }
  }, [navigate])

  const register = useCallback(async (name, email, password, role = 'manager') => {
    try {
      const { user, token } = await apiRegister(name, email, password, role)
      setCurrentUser(user)
      localStorage.setItem('token', token)
      localStorage.setItem('currentUser', JSON.stringify(user))
      toast.success('Registered successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Failed to register. Please try again.')
      throw error
    }
  }, [navigate])

  const logout = useCallback(() => {
    disconnectSocket()
    setCurrentUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
    toast.success('Logged out successfully')
    navigate('/login')
  }, [navigate])

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}