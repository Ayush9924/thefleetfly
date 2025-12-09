import { useState, useEffect } from 'react'
import { useSocketNotifications } from '../hooks/useSocketNotifications'
import { Card } from '../components/ui/card'
import {
  Bell,
  AlertCircle,
  CheckCircle,
  Info,
  Trash2,
  Archive,
  Filter,
} from 'lucide-react'

/**
 * Notifications Page
 * Comprehensive view of all notifications with filtering and management
 */
export default function NotificationsPage() {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getNotificationsByType,
    getNotificationsByStatus,
  } = useSocketNotifications()

  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  // Filter and sort notifications
  let filteredNotifications = notifications || []

  if (filterType !== 'all') {
    filteredNotifications = getNotificationsByType(filterType)
  }

  if (filterStatus === 'unread') {
    filteredNotifications = filteredNotifications.filter((n) => !n.read)
  } else if (filterStatus === 'read') {
    filteredNotifications = filteredNotifications.filter((n) => n.read)
  }

  if (searchQuery) {
    filteredNotifications = filteredNotifications.filter(
      (n) =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Sort notifications
  if (sortBy === 'newest') {
    filteredNotifications = [...filteredNotifications].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  } else if (sortBy === 'oldest') {
    filteredNotifications = [...filteredNotifications].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'alert':
        return 'bg-red-50 border-red-200'
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const unreadCount = (notifications || []).filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              You have <span className="font-semibold text-blue-600">{unreadCount}</span>{' '}
              unread notifications
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
            >
              Mark all as read
            </button>
          )}
          {notifications && notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Types</option>
              <option value="alert">Alerts</option>
              <option value="success">Success</option>
              <option value="info">Info</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No notifications</p>
            <p className="text-gray-500 text-sm mt-1">
              {searchQuery
                ? 'No notifications match your search'
                : notifications && notifications.length === 0
                  ? 'You are all caught up!'
                  : 'Try adjusting your filters'}
            </p>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification._id}
              className={`p-4 border-l-4 cursor-pointer transition hover:shadow-md ${
                getNotificationColor(notification.type)
              } ${
                !notification.read
                  ? 'border-l-blue-500 font-medium'
                  : 'border-l-gray-300'
              }`}
              onClick={() =>
                !notification.read && markAsRead(notification._id)
              }
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <p className="text-gray-700 text-sm mt-1">
                        {notification.message}
                      </p>
                    </div>

                    {/* Status Badge */}
                    {!notification.read && (
                      <span className="shrink-0 h-2 w-2 bg-blue-600 rounded-full mt-2"></span>
                    )}
                  </div>

                  {/* Meta */}
                  <p className="text-xs text-gray-500 mt-2">
                    {formatTime(notification.timestamp)}
                  </p>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex gap-2 opacity-0 hover:opacity-100 transition">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNotification(notification._id)
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                    title="Archive"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Stats */}
      {notifications && notifications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-600 font-medium">Total</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {notifications.length}
            </p>
          </Card>
          <Card className="p-4 bg-yellow-50 border border-yellow-200">
            <p className="text-sm text-yellow-600 font-medium">Unread</p>
            <p className="text-2xl font-bold text-yellow-900 mt-1">
              {unreadCount}
            </p>
          </Card>
          <Card className="p-4 bg-green-50 border border-green-200">
            <p className="text-sm text-green-600 font-medium">Read</p>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {(notifications || []).filter((n) => n.read).length}
            </p>
          </Card>
        </div>
      )}
    </div>
  )
}
