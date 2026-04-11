import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import PublicRoute from '@/components/layout/PublicRoute'
import TestMap from '@/pages/TestMap'
import PublicLiveTracking from '@/pages/PublicLiveTracking'

const LandingPage       = lazy(() => import('@/pages/LandingPage'))
const LoginPage         = lazy(() => import('@/pages/LoginPage'))
const SignUpPage        = lazy(() => import('@/pages/SignUpPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const DashboardPage     = lazy(() => import('@/pages/DashboardPage'))
const VehiclesPage      = lazy(() => import('@/pages/VehiclesPage'))
const VehicleDetailPage = lazy(() => import('@/pages/VehicleDetailPage'))
const DriversPage       = lazy(() => import('@/pages/DriversPage'))
const AssignmentsPage   = lazy(() => import('@/pages/AssignmentsPage'))
const MaintenancePage   = lazy(() => import('@/pages/MaintenancePage'))
const FuelLogsPage      = lazy(() => import('@/pages/FuelLogsPage'))
const RoutePlannerPage  = lazy(() => import('@/pages/RoutePlannerPage'))
const ReportsPage       = lazy(() => import('@/pages/ReportsPage'))
const LiveTrackingPage  = lazy(() => import('@/pages/LiveTrackingPage'))
const ChatPage          = lazy(() => import('@/pages/ChatPage'))
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'))

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
  </div>
)

export default function AppRoutes() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/test-map" element={<PublicRoute><TestMap /></PublicRoute>} />
        <Route path="/live-tracking" element={<PublicLiveTracking />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="vehicles/:id" element={<VehicleDetailPage />} />
          <Route path="drivers" element={<DriversPage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="fuels" element={<FuelLogsPage />} />
          <Route path="routes" element={<RoutePlannerPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="tracking" element={<LiveTrackingPage />} />
          <Route path="messages" element={<ChatPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
