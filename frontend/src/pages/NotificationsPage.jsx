import { useState, useMemo } from "react";
import { useSocketNotifications } from "@/hooks/useSocketNotifications";
import { Bell, AlertCircle, CheckCircle, Info, Trash2, Search, Clock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const fade = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3, staggerChildren: 0.05 } },
};

const TYPE_CONFIG = {
  alert:   { Icon: AlertCircle,  color: "text-red-500",     bg: "bg-red-50   border-red-200"   },
  success: { Icon: CheckCircle,  color: "text-green-500",   bg: "bg-green-50 border-green-200" },
  info:    { Icon: Info,         color: "text-blue-500",    bg: "bg-blue-50  border-blue-200"  },
  default: { Icon: Bell,         color: "text-gray-500",    bg: "bg-gray-50  border-gray-200"  },
};

function formatTime(ts) {
  const m = Math.floor((Date.now() - new Date(ts)) / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}

export default function NotificationsPage() {
  const { notifications = [], markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } = useSocketNotifications();

  const [filterType,   setFilterType]   = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [sortBy,       setSortBy]       = useState("newest");

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const filtered = useMemo(() => {
    let list = [...notifications];
    if (filterType   !== "all")    list = list.filter(n => n.type === filterType);
    if (filterStatus === "unread") list = list.filter(n => !n.read);
    if (filterStatus === "read")   list = list.filter(n =>  n.read);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(n => n.title?.toLowerCase().includes(q) || n.message?.toLowerCase().includes(q));
    }
    return list.sort((a, b) =>
      sortBy === "newest" ? new Date(b.timestamp) - new Date(a.timestamp) : new Date(a.timestamp) - new Date(b.timestamp)
    );
  }, [notifications, filterType, filterStatus, searchQuery, sortBy]);

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-600" /> Notifications
            {unreadCount > 0 && (
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">{unreadCount}</span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Real-time fleet alerts and updates</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors">
              <CheckCircle className="h-4 w-4" /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAllNotifications} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition-colors">
              <Trash2 className="h-4 w-4" /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {notifications.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total"  value={notifications.length}                      sub="All notifications"  color="text-gray-900"  />
          <StatCard label="Unread" value={unreadCount}                                sub="Pending review"     color="text-amber-600" />
          <StatCard label="Read"   value={notifications.filter(n => n.read).length}  sub="Completed"          color="text-green-600" />
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text" placeholder="Search notifications…" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        {[
          { label: "Type",   value: filterType,   set: setFilterType,   options: [["all","All Types"],["alert","Alerts"],["success","Success"],["info","Info"]] },
          { label: "Status", value: filterStatus, set: setFilterStatus, options: [["all","All Status"],["unread","Unread"],["read","Read"]] },
          { label: "Sort",   value: sortBy,       set: setSortBy,       options: [["newest","Newest first"],["oldest","Oldest first"]] },
        ].map(({ label, value, set, options }) => (
          <select key={label} value={value} onChange={e => set(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <Bell className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900">No notifications</h3>
          <p className="text-sm text-gray-500 mt-1">
            {searchQuery ? "No results match your search" : notifications.length === 0 ? "You're all caught up!" : "Try adjusting your filters"}
          </p>
        </div>
      ) : (
        <motion.div variants={fade} initial="hidden" animate="show" className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map(n => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.default;
              return (
                <motion.div
                  key={n._id} variants={fade}
                  exit={{ opacity: 0, x: -80, transition: { duration: 0.2 } }}
                  className={`group flex items-start gap-4 rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm ${cfg.bg} ${!n.read ? "ring-1 ring-blue-200" : ""}`}
                  onClick={() => !n.read && markAsRead(n._id)}
                >
                  <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                    <cfg.Icon className={`h-5 w-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        {n.title}
                        {!n.read && <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                      <Clock className="h-3 w-3" /> {formatTime(n.timestamp)}
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deleteNotification(n._id); }}
                    className="shrink-0 opacity-0 group-hover:opacity-100 h-8 w-8 flex items-center justify-center rounded-lg hover:bg-red-100 text-red-500 transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

