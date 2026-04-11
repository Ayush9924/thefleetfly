import { useState } from 'react';
import { Bell, X, Trash2 } from 'lucide-react';
import { useRealtime } from '@/contexts/RealtimeContext';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  assignment_created: '📋',
  tracking_started: '📍',
  speed_alert: '⚠️',
  maintenance_alert: '🔧',
  fuel_alert: '⛽',
};

const relTime = (ts) => {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d ago` : new Date(ts).toLocaleDateString();
};

export default function NotificationCenter() {
  const { notifications, unreadCount, socket, setUnreadCount } = useRealtime();
  const [open, setOpen] = useState(false);

  const markRead = (id) => {
    socket?.emit('notification:read', id);
    setUnreadCount(p => Math.max(0, p - 1));
  };

  const deleteNotif = (id) => {
    socket?.emit('notification:delete', id);
    toast.success('Notification removed');
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} title="Notifications"
        className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-screen bg-white rounded-xl shadow-xl border border-gray-200 z-50 flex flex-col max-h-96 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
            <h3 className="text-sm font-semibold text-gray-900">Notifications {unreadCount > 0 && <span className="ml-1 text-blue-600">({unreadCount} new)</span>}</h3>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 transition"><X className="w-4 h-4" /></button>
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications?.length > 0 ? notifications.map(n => (
              <div key={n._id || n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${!n.read ? 'bg-blue-50/50' : ''}`}>
                <span className="text-lg shrink-0">{TYPE_ICONS[n.type] || '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{relTime(n.timestamp || n.createdAt)}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!n.read && (
                    <button onClick={() => markRead(n._id || n.id)} title="Mark as read"
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded transition text-xs">✓</button>
                  )}
                  <button onClick={() => deleteNotif(n._id || n.id)} title="Delete"
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Bell className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



