import { Bell, X, Trash2 } from 'lucide-react';
import { useRealtime } from '../contexts/RealtimeContext';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function NotificationCenter() {
  const { notifications, unreadCount, socket, setUnreadCount } = useRealtime();
  const [isOpen, setIsOpen] = useState(false);

  const markAsRead = (id) => {
    if (socket) {
      socket.emit('notification:read', id);
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const deleteNotification = (id) => {
    if (socket) {
      socket.emit('notification:delete', id);
      toast.success('Notification deleted');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'assignment_created':
        return '📋';
      case 'tracking_started':
        return '📍';
      case 'speed_alert':
        return '⚠️';
      case 'maintenance_alert':
        return '🔧';
      case 'fuel_alert':
        return '⛽';
      default:
        return '🔔';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1">
            {notifications && notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif._id || notif.id || Math.random()}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition ${
                    !notif.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{getNotificationIcon(notif.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notif.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(notif.timestamp || notif.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {!notif.read && (
                        <button
                          onClick={() => markAsRead(notif._id || notif.id)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition"
                          title="Mark as read"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notif._id || notif.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications && notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 text-center bg-gray-50">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
