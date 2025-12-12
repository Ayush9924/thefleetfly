import { useState } from "react";
import { useSocketNotifications } from "../hooks/useSocketNotifications";
import { Button } from "../components/ui/button";
import {
  Bell,
  AlertCircle,
  CheckCircle,
  Info,
  Trash2,
  Search,
  Sparkles,
  Zap,
  Clock,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationsPage() {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useSocketNotifications();

  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Filter and sort notifications
  let filteredNotifications = notifications || [];

  if (filterType !== "all") {
    filteredNotifications = filteredNotifications.filter(
      (n) => n.type === filterType
    );
  }

  if (filterStatus === "unread") {
    filteredNotifications = filteredNotifications.filter((n) => !n.read);
  } else if (filterStatus === "read") {
    filteredNotifications = filteredNotifications.filter((n) => n.read);
  }

  if (searchQuery) {
    filteredNotifications = filteredNotifications.filter(
      (n) =>
        n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (sortBy === "newest") {
    filteredNotifications = [...filteredNotifications].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  } else if (sortBy === "oldest") {
    filteredNotifications = [...filteredNotifications].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "alert":
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case "success":
        return <CheckCircle className="w-6 h-6 text-emerald-500" />;
      case "info":
        return <Info className="w-6 h-6 text-blue-500" />;
      default:
        return <Bell className="w-6 h-6 text-gray-500" />;
    }
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case "alert":
        return "from-red-500/10 via-pink-500/10 to-orange-500/10 border-red-400/30";
      case "success":
        return "from-emerald-500/10 via-green-500/10 to-teal-500/10 border-emerald-400/30";
      case "info":
        return "from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-blue-400/30";
      default:
        return "from-slate-500/10 via-gray-500/10 to-zinc-500/10 border-gray-400/30";
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Modern Header with Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-8"
        >
          {/* Decorative Blurs */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute -top-8 -right-12 w-32 h-32 bg-purple-400/30 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>

          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 border border-white/50 p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Title Section */}
              <div className="flex items-start gap-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="h-16 w-16 bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/40"
                >
                  <Bell className="h-8 w-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                    <span className="bg-linear-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                      Notifications
                    </span>
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 font-medium flex items-center gap-2 mt-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    Stay connected with real-time updates
                  </p>
                  {unreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center gap-2 px-4 py-1.5 mt-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm font-bold shadow-lg shadow-blue-500/40"
                    >
                      <Zap className="h-4 w-4" />
                      {unreadCount} New{" "}
                      {unreadCount === 1 ? "Update" : "Updates"}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {unreadCount > 0 && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={markAllAsRead}
                      className="bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/40 px-6"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Mark All Read
                    </Button>
                  </motion.div>
                )}
                {notifications && notifications.length > 0 && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={clearAllNotifications}
                      variant="outline"
                      className="border-2 border-red-300 text-red-600 hover:bg-red-50 font-semibold px-6"
                    >
                      <Trash2 className="h-5 w-5 mr-2" />
                      Clear All
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards with Gradient */}
        {notifications && notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.03, y: -5 }}
              className="relative overflow-hidden bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-xl shadow-blue-500/30"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <Bell className="h-8 w-8 text-white/80" />
                  <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <span className="text-2xl font-black text-white">
                      {notifications.length}
                    </span>
                  </div>
                </div>
                <p className="text-white/90 font-bold text-lg">Total</p>
                <p className="text-white/70 text-sm font-medium">
                  All notifications
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03, y: -5 }}
              className="relative overflow-hidden bg-linear-to-br from-amber-500 to-orange-600 rounded-2xl p-6 shadow-xl shadow-amber-500/30"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <AlertCircle className="h-8 w-8 text-white/80" />
                  <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <span className="text-2xl font-black text-white">
                      {unreadCount}
                    </span>
                  </div>
                </div>
                <p className="text-white/90 font-bold text-lg">Unread</p>
                <p className="text-white/70 text-sm font-medium">
                  Pending items
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03, y: -5 }}
              className="relative overflow-hidden bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-xl shadow-emerald-500/30"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <CheckCircle className="h-8 w-8 text-white/80" />
                  <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <span className="text-2xl font-black text-white">
                      {notifications.filter((n) => n.read).length}
                    </span>
                  </div>
                </div>
                <p className="text-white/90 font-bold text-lg">Read</p>
                <p className="text-white/70 text-sm font-medium">Completed</p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-blue-500/10 border border-white/50 p-6 mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Find notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium transition-all"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium transition-all"
              >
                <option value="all">All Types</option>
                <option value="alert">🚨 Alerts</option>
                <option value="success">✅ Success</option>
                <option value="info">ℹ️ Info</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium transition-all"
              >
                <option value="all">All Status</option>
                <option value="unread">⭕ Unread</option>
                <option value="read">✔️ Read</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium transition-all"
              >
                <option value="newest">🔽 Newest First</option>
                <option value="oldest">🔼 Oldest First</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {filteredNotifications.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="h-24 w-24 bg-linear-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Bell className="h-12 w-12 text-gray-400" />
              </motion.div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">
                No Notifications
              </h3>
              <p className="text-gray-600 font-medium text-lg">
                {searchQuery
                  ? "No results match your search"
                  : notifications && notifications.length === 0
                  ? "You're all caught up! 🎉"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="group relative"
                  >
                    <div
                      className={`relative overflow-hidden bg-linear-to-br ${getNotificationStyle(
                        notification.type
                      )} backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-lg border-2 cursor-pointer transition-all ${
                        !notification.read
                          ? "shadow-blue-500/20"
                          : "shadow-gray-500/10"
                      }`}
                      onClick={() =>
                        !notification.read && markAsRead(notification._id)
                      }
                    >
                      {/* Unread indicator glow */}
                      {!notification.read && (
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>
                      )}

                      <div className="relative flex items-start gap-4">
                        {/* Icon */}
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className="shrink-0 h-14 w-14 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg"
                        >
                          {getNotificationIcon(notification.type)}
                        </motion.div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3
                              className={`font-bold text-lg sm:text-xl ${
                                !notification.read
                                  ? "text-gray-900"
                                  : "text-gray-700"
                              }`}
                            >
                              {notification.title}
                              {!notification.read && (
                                <span className="ml-2 inline-block h-2.5 w-2.5 bg-blue-600 rounded-full animate-pulse"></span>
                              )}
                            </h3>
                          </div>
                          <p className="text-gray-700 font-medium text-base mb-3">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-semibold">
                              {formatTime(notification.timestamp)}
                            </span>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification._id);
                          }}
                          className="shrink-0 h-10 w-10 bg-red-100 hover:bg-red-200 rounded-xl flex items-center justify-center text-red-600 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                        >
                          <X className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
