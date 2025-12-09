import { Bell, X } from 'lucide-react';
import { useRealtime } from '../contexts/RealtimeContext';

export default function NotificationCenter() {
  const { notifications, unreadCount, socket } = useRealtime();

  const markAsRead = (id) => {
    socket.emit('notification:read', id);
  };

  return (
    <div className="relative">
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
          {unreadCount}
        </span>
      )}
      {/* Dropdown with notifications */}
    </div>
  );
}