import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { 
  Home, Truck, User, MapPin, Wrench, Fuel, Route, 
  FileText, ChevronLeft, ChevronRight, Settings, 
  Map, MessageSquare, Bell
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const menuItems = [
  { name: 'Dashboard',     icon: Home,          path: '/dashboard',               roles: ['admin', 'manager', 'mechanic'] },
  { name: 'Vehicles',      icon: Truck,         path: '/dashboard/vehicles',      roles: ['admin', 'manager'] },
  { name: 'Drivers',       icon: User,          path: '/dashboard/drivers',       roles: ['admin', 'manager'] },
  { name: 'Assignments',   icon: MapPin,        path: '/dashboard/assignments',   roles: ['admin', 'manager'] },
  { name: 'Maintenance',   icon: Wrench,        path: '/dashboard/maintenance',   roles: ['admin', 'manager', 'mechanic'] },
  { name: 'Fuel Logs',     icon: Fuel,          path: '/dashboard/fuels',         roles: ['admin', 'manager'] },
  { name: 'Routes',        icon: Route,         path: '/dashboard/routes',        roles: ['admin', 'manager'] },
  { name: 'Reports',       icon: FileText,      path: '/dashboard/reports',       roles: ['admin', 'manager'] },
  { name: 'Live Tracking', icon: Map,           path: '/dashboard/tracking',      roles: ['admin', 'manager', 'driver', 'mechanic'] },
  { name: 'Messages',      icon: MessageSquare, path: '/dashboard/messages',      roles: ['admin', 'manager', 'driver', 'mechanic'] },
  { name: 'Notifications', icon: Bell,          path: '/dashboard/notifications', roles: ['admin', 'manager', 'driver', 'mechanic'] },
  { name: 'Settings',      icon: Settings,      path: '/dashboard/settings',      roles: ['admin'] },
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()
  const { currentUser } = useAuth()

  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => {
      const newCollapsed = !prev
      localStorage.setItem('sidebarCollapsed', newCollapsed.toString())
      return newCollapsed
    })
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved) {
      setIsCollapsed(saved === 'true')
    }
  }, [])

  return (
    <div
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-white transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b">
        <div className={cn('flex items-center space-x-2', isCollapsed && 'hidden')}>
          <TruckIcon className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl text-gray-900">FleetFly</span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-900 mx-auto"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <ul className="space-y-1 px-2">
          {menuItems
            .filter(item => !currentUser || item.roles.includes(currentUser.role))
            .map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                      isActive 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <Icon className={cn("h-5 w-5 shrink-0", isCollapsed && "mx-auto", isActive ? "text-blue-600" : "text-gray-400")} />
                    <span className={cn('ml-3', isCollapsed && 'hidden')}>
                      {item.name}
                    </span>
                  </Link>
                </li>
              )
            })}
        </ul>
      </nav>
    </div>
  )
}

const TruckIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    <circle cx="17" cy="18" r="2" />
    <circle cx="7" cy="18" r="2" />
  </svg>
)
