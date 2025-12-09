import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription } from '../components/ui/card'
import { Loader2, Mail, Lock, User, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('manager')
  const [loading, setLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const validateForm = () => {
    if (!name || !email || !password) {
      toast.error('Please fill in all required fields')
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address')
      return false
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      setHasError(true)
      setTimeout(() => setHasError(false), 2000)
      return
    }

    setLoading(true)
    setHasError(false)

    try {
      await register(name, email, password, role)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Sign up failed:', error)
      setHasError(true)

      const errorMessage = error.response?.data?.message || 'Failed to create account'
      toast.error(errorMessage)

      setTimeout(() => setHasError(false), 2000)
    } finally {
      setLoading(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  const errorVariants = {
    animate: {
      x: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <AnimatePresence>
          <motion.div
            variants={errorVariants}
            animate={hasError ? "animate" : ""}
            className="relative"
          >
            <Card className="w-full border-none bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-6 text-center">
                <div className="flex items-center justify-between mb-4">
                  <Link
                    to="/login"
                    className="text-white hover:text-blue-100 transition-colors p-1 -ml-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                  <div className="text-2xl font-bold text-white mx-auto">
                    Fleet<span className="text-blue-100">Pro</span>
                  </div>
                  <div className="w-6"></div>
                </div>
                <CardDescription className="text-blue-100">
                  Create your fleet management account
                </CardDescription>
              </div>

              <CardContent className="p-8">
                <motion.form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={itemVariants} className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center">
                      <User className="w-4 h-4 mr-2 text-blue-600 shrink-0" />
                      Full Name
                    </label>
                    <div className="relative">
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Smith"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg transition-all duration-300"
                      />
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-blue-600 shrink-0" />
                      Email Address
                    </label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg transition-all duration-300"
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-blue-600 shrink-0" />
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg transition-all duration-300"
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimum 6 characters required</p>
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium text-gray-700">
                      Account Role
                    </label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-3 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg transition-all duration-300 bg-white text-gray-900 text-sm appearance-none"
                    >
                      <option value="manager">Fleet Manager</option>
                      <option value="driver">Driver</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </motion.div>

                  <motion.div variants={itemVariants} className="pt-4">
                    <Button
                      type="submit"
                      className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </motion.div>
                </motion.form>

                <motion.div
                  className="mt-6 text-center"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                    >
                      Sign In
                    </Link>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
