import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Layout from './components/layout/Layout.jsx'
import ProtectedRoute from './components/layout/ProtectedRoute.jsx'
import PublicRoute from './components/layout/PublicRoute.jsx'

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignUpPage = lazy(() => import('./pages/SignUpPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const VehiclesPage = lazy(() => import('./pages/VehiclesPage'))
const VehicleDetailPage = lazy(() => import('./pages/VehicleDetailPage'))
const DriversPage = lazy(() => import('./pages/DriversPage'))
const AssignmentsPage = lazy(() => import('./pages/AssignmentsPage'))
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'))
const FuelLogsPage = lazy(() => import('./pages/FuelLogsPage'))
const RoutePlannerPage = lazy(() => import('./pages/RoutePlannerPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))
const LiveTrackingPage = lazy(() => import('./pages/LiveTrackingPage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))

function App() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <Routes>
        <Route path="/" element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        } />
        
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />

        <Route path="/signup" element={
          <PublicRoute>
            <SignUpPage />
          </PublicRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
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

export default App