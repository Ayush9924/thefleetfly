import { useEffect, useCallback } from 'react'
import { useRealtime } from '../contexts/RealtimeContext'

/**
 * Custom hook for managing notifications via Socket.io
 * Provides notification subscription, management, and real-time updates
 */
export const useSocketNotifications = () => {
  const { socket, notifications, setUnreadCount } = useRealtime()

  /**
   * Mark notification as read
   * @param {String} notificationId - Notification ID to mark as read
   */
  const markAsRead = useCallback(
    (notificationId) => {
      if (!socket) return

      socket.emit('notification:mark_read', {
        notificationId,
      })
    },
    [socket]
  )

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(() => {
    if (!socket) return

    socket.emit('notification:mark_all_read')
  }, [socket])

  /**
   * Delete a notification
   * @param {String} notificationId - Notification ID to delete
   */
  const deleteNotification = useCallback(
    (notificationId) => {
      if (!socket) return

      socket.emit('notification:delete', {
        notificationId,
      })
    },
    [socket]
  )

  /**
   * Clear all notifications
   */
  const clearAllNotifications = useCallback(() => {
    if (!socket) return

    socket.emit('notification:clear_all')
  }, [socket])

  /**
   * Subscribe to specific notification types
   * @param {Array<String>} types - Array of notification types to subscribe to
   */
  const subscribeToNotificationTypes = useCallback(
    (types) => {
      if (!socket) return

      socket.emit('notification:subscribe_types', {
        types: Array.isArray(types) ? types : [types],
      })
    },
    [socket]
  )

  /**
   * Unsubscribe from specific notification types
   * @param {Array<String>} types - Array of notification types to unsubscribe from
   */
  const unsubscribeFromNotificationTypes = useCallback(
    (types) => {
      if (!socket) return

      socket.emit('notification:unsubscribe_types', {
        types: Array.isArray(types) ? types : [types],
      })
    },
    [socket]
  )

  /**
   * Get notifications for a specific type
   * @param {String} type - Notification type to filter
   */
  const getNotificationsByType = useCallback(
    (type) => {
      if (!notifications) return []
      return notifications.filter((notif) => notif.type === type)
    },
    [notifications]
  )

  /**
   * Get unread notifications count
   */
  const getUnreadCount = useCallback(() => {
    if (!notifications) return 0
    return notifications.filter((notif) => !notif.read).length
  }, [notifications])

  /**
   * Get notifications by status
   * @param {Boolean} read - True for read notifications, false for unread
   */
  const getNotificationsByStatus = useCallback(
    (read) => {
      if (!notifications) return []
      return notifications.filter((notif) => notif.read === read)
    },
    [notifications]
  )

  /**
   * Get paginated notifications
   * @param {Number} page - Page number (1-indexed)
   * @param {Number} limit - Number of notifications per page
   */
  const getPaginatedNotifications = useCallback(
    (page = 1, limit = 10) => {
      if (!notifications) return { data: [], total: 0, page, hasMore: false }

      const start = (page - 1) * limit
      const end = start + limit
      const total = notifications.length

      return {
        data: notifications.slice(start, end),
        total,
        page,
        hasMore: end < total,
      }
    },
    [notifications]
  )

  return {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    subscribeToNotificationTypes,
    unsubscribeFromNotificationTypes,
    getNotificationsByType,
    getUnreadCount,
    getNotificationsByStatus,
    getPaginatedNotifications,
    setUnreadCount,
    isConnected: !!socket?.connected,
  }
}
