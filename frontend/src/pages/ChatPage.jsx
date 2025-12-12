import { useState, useEffect } from "react";
import { useSocketChat } from "../hooks/useSocketChat";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import { Card } from "../components/ui/card";
import {
  MessageSquare,
  Users,
  Shield,
  Search,
  Plus,
  Sparkles,
  Zap,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

/**
 * 🚀 2025 Real-Time Chat Dashboard
 * Modern, stylish messaging hub with beautiful animations
 */
export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { conversations, loadMessages, isLoading } = useSocketChat();

  const selectedConversation = conversations.find(
    (conv) => conv._id === selectedConversationId
  );

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    loadMessages(conversationId);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false); // Auto-close on mobile after selection
    }
  };

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0]._id);
      loadMessages(conversations[0]._id);
    }
  }, [conversations, selectedConversationId, loadMessages]);

  const unreadCount = conversations.filter((c) => c.unreadCount > 0).length;
  const totalMessages = conversations.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0
  );

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
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="h-16 w-16 bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/40"
                >
                  <MessageSquare className="h-8 w-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                    <span className="bg-linear-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                      Messages
                    </span>
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 font-medium flex items-center gap-2 mt-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    Real-time team communication hub
                  </p>
                  {totalMessages > 0 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center gap-2 px-4 py-1.5 mt-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm font-bold shadow-lg shadow-blue-500/40"
                    >
                      <Zap className="h-4 w-4" />
                      {totalMessages} New{" "}
                      {totalMessages === 1 ? "Message" : "Messages"}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="default"
                    className="bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/40 px-6"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    New Chat
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 font-semibold px-6 sm:hidden"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  >
                    <Users className="h-5 w-5" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
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
                <MessageSquare className="h-8 w-8 text-white/80" />
                <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-black text-white">
                    {conversations.length}
                  </span>
                </div>
              </div>
              <p className="text-white/90 font-bold text-lg">Total Chats</p>
              <p className="text-white/70 text-sm font-medium">
                Active conversations
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
                <Send className="h-8 w-8 text-white/80" />
                <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-black text-white">
                    {totalMessages}
                  </span>
                </div>
              </div>
              <p className="text-white/90 font-bold text-lg">Unread</p>
              <p className="text-white/70 text-sm font-medium">New messages</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03, y: -5 }}
            className="relative overflow-hidden bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-xl shadow-emerald-500/30"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <Users className="h-8 w-8 text-white/80" />
                <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-black text-white">
                    {unreadCount}
                  </span>
                </div>
              </div>
              <p className="text-white/90 font-bold text-lg">Active</p>
              <p className="text-white/70 text-sm font-medium">With updates</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content - Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
        >
          {/* Chat List - Sidebar */}
          <AnimatePresence>
            {(isSidebarOpen || window.innerWidth >= 1024) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="lg:col-span-1"
              >
                <div className="h-[600px] overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-blue-500/10 border border-white/50 flex flex-col">
                  {/* Search Bar */}
                  <div className="p-4 border-b border-gray-200/30 bg-linear-to-r from-blue-50 to-indigo-50">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                      <Input
                        type="text"
                        placeholder="Search conversations..."
                        className="pl-11 pr-4 py-3 w-full bg-white/90 border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl font-medium transition-all"
                      />
                    </div>
                  </div>

                  {/* Conversations List */}
                  <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                      <div className="p-4 space-y-3">
                        {[1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="animate-pulse flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                          >
                            <div className="h-12 w-12 bg-linear-to-br from-blue-200 to-indigo-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
                              <div className="h-3 bg-gray-200 rounded-lg w-1/2"></div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : conversations.length === 0 ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="p-8 text-center"
                      >
                        <div className="h-20 w-20 bg-linear-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="h-10 w-10 text-blue-400" />
                        </div>
                        <p className="text-gray-700 font-semibold text-sm">
                          No conversations yet
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                          Start chatting with your team
                        </p>
                      </motion.div>
                    ) : (
                      <ChatList
                        onSelectConversation={handleSelectConversation}
                        selectedId={selectedConversationId}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Window */}
          <div className="lg:col-span-3">
            <div className="h-[600px] overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-blue-500/10 border border-white/50">
              {selectedConversation ? (
                <ChatWindow
                  conversationId={selectedConversationId}
                  otherUserName={selectedConversation.participantName}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="h-full flex flex-col items-center justify-center p-8 text-center"
                >
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="h-32 w-32 bg-linear-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/40"
                  >
                    <MessageSquare className="h-16 w-16 text-white" />
                  </motion.div>
                  <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">
                    <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Welcome to Your Messaging Hub
                    </span>
                  </h3>
                  <p className="text-gray-600 font-medium text-lg max-w-md mb-4">
                    Select a conversation to start chatting in real-time with
                    your team.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-blue-50 px-4 py-2 rounded-full">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold">End-to-end encrypted</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Enhanced Tips Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-blue-500/10 border border-white/50 p-6"
        >
          <div className="flex items-start gap-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="h-12 w-12 bg-linear-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
            >
              <Sparkles className="h-6 w-6 text-white" />
            </motion.div>
            <div className="flex-1">
              <h3 className="font-black text-lg text-gray-900 mb-3 flex items-center gap-2">
                💡 Pro Tips for Real-Time Chat
              </h3>
              <ul className="space-y-2">
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-start gap-3 text-sm text-gray-700 font-medium"
                >
                  <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>All messages are encrypted and stored securely</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-start gap-3 text-sm text-gray-700 font-medium"
                >
                  <Zap className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Real-time typing indicators and instant delivery</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-start gap-3 text-sm text-gray-700 font-medium"
                >
                  <Users className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                  <span>Messages sync seamlessly across all your devices</span>
                </motion.li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
