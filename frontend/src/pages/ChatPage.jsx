import { useState, useEffect } from "react";
import { useSocketChat } from "@/hooks/useSocketChat";
import ChatList from "@/components/chat/ChatList";
import ChatWindow from "@/components/chat/ChatWindow";
import { Plus, MessageSquare, Users, Shield, Search, Send, Zap } from "lucide-react";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtime } from "@/contexts/RealtimeContext";
import { motion, AnimatePresence } from "framer-motion";

const fade = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const ROLE_COLOR = {
  driver:     "bg-blue-100 text-blue-700",
  manager:    "bg-purple-100 text-purple-700",
  admin:      "bg-red-100 text-red-700",
  dispatcher: "bg-green-100 text-green-700",
};

export default function ChatPage() {
  const { user }   = useAuth();
  const { socket } = useRealtime();
  const { conversations, setConversations, startConversation, isConnected } = useSocketChat();

  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [showNewChat, setShowNewChat]         = useState(false);
  const [allUsers, setAllUsers]               = useState([]);
  const [loadingUsers, setLoadingUsers]       = useState(false);
  const [starting, setStarting]               = useState(false);
  const [isSidebarOpen, setIsSidebarOpen]     = useState(true);
  const [unreadCount, setUnreadCount]         = useState(0);
  const [onlineUsers, setOnlineUsers]         = useState(new Set());

  // Fetch available contacts
  useEffect(() => {
    let cancelled = false;
    setLoadingUsers(true);
    api.get("/users/contacts/available")
      .then(r => {
        if (cancelled) return;
        const { driver = [], manager = [], admin = [] } = r.data;
        setAllUsers([...driver, ...manager, ...admin].filter(u => u._id !== user?._id));
      })
      .catch(() => api.get("/drivers").then(r => setAllUsers((r.data || []).filter(u => u._id !== user?._id))).catch(() => {}))
      .finally(() => { if (!cancelled) setLoadingUsers(false); });
    return () => { cancelled = true; };
  }, [user]);

  // Load conversations
  useEffect(() => {
    if (!isConnected) return;
    api.get("/messages/conversations")
      .then(r => setConversations(r.data || []))
      .catch(() => {});
  }, [isConnected, setConversations]);

  // Online/offline presence
  useEffect(() => {
    if (!socket) return;
    const online  = ({ userId }) => setOnlineUsers(p => new Set([...p, userId]));
    const offline = ({ userId }) => setOnlineUsers(p => { const n = new Set(p); n.delete(userId); return n; });
    socket.on("user:online", online);
    socket.on("user:offline", offline);
    return () => { socket.off("user:online", online); socket.off("user:offline", offline); };
  }, [socket]);

  // Responsive sidebar
  useEffect(() => {
    const check = () => { if (window.innerWidth >= 1024) setIsSidebarOpen(true); };
    window.addEventListener("resize", check);
    check();
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleSelectConversation = (id) => setSelectedConversationId(id);

  const handleStartConversation = async (otherUserId) => {
    try {
      setStarting(true);
      const { data: conv } = await api.post("/messages/conversations/start", { otherUserId });
      if (!conversations.find(c => c.conversationId === conv.conversationId)) {
        setConversations(prev => [...prev, conv]);
      }
      startConversation(otherUserId);
      setSelectedConversationId(conv.conversationId);
      setShowNewChat(false);
    } catch { /* silent */ }
    finally { setStarting(false); }
  };

  const selectedConv      = conversations.find(c => c.conversationId === selectedConversationId);
  const getOtherUserName  = (conv) => {
    if (!conv?.participants?.length) return "Unknown";
    const other = conv.participants.find(p => (p.userId?._id || p.userId) !== user?._id);
    return other?.userName || other?.userId?.name || "Unknown";
  };

  return (
    <div className="space-y-4 p-4 sm:p-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Messages
              {!isConnected && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  <Zap className="h-3 w-3" /> Connecting…
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500">Real-time team chat</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowNewChat(!showNewChat)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
            <Plus className="h-4 w-4" /> New Chat
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
            <Users className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Chats",   value: conversations.length, color: "text-blue-600"    },
          { label: "Unread",        value: unreadCount,          color: "text-amber-600"   },
          { label: "Online Now",    value: onlineUsers.size,     color: "text-emerald-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm text-center">
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[560px]">
        {/* Sidebar */}
        <AnimatePresence>
          {(isSidebarOpen || window.innerWidth >= 1024) && (
            <motion.div variants={fade} initial="hidden" animate="show" exit="hidden"
              className="lg:col-span-1 flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {/* Search + new chat list */}
              <div className="px-3 py-3 border-b border-gray-100 bg-gray-50 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Search conversations…"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
                {showNewChat && (
                  <div className="max-h-44 overflow-y-auto space-y-1">
                    {loadingUsers ? (
                      <p className="text-xs text-gray-400 text-center py-4">Loading…</p>
                    ) : allUsers.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">No users available</p>
                    ) : allUsers.map(u => (
                      <button key={u._id} disabled={starting} onClick={() => handleStartConversation(u._id)}
                        className="w-full text-left px-3 py-2.5 rounded-lg bg-white border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors disabled:opacity-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${ROLE_COLOR[u.role] || "bg-gray-100 text-gray-700"}`}>{u.role}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                    <Users className="h-8 w-8" />
                    <p className="text-sm font-medium">No conversations yet</p>
                    <p className="text-xs">Start chatting with your team</p>
                  </div>
                ) : (
                  <ChatList onSelectConversation={handleSelectConversation} selectedId={selectedConversationId} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Window */}
        <div className="lg:col-span-3 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
          {selectedConv ? (
            <ChatWindow conversationId={selectedConversationId} otherUserName={getOtherUserName(selectedConv)} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Select a conversation</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-xs">Start a real-time conversation with drivers, managers, and team members.</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-blue-50 px-3 py-1.5 rounded-full">
                <Shield className="h-3.5 w-3.5 text-blue-600" /> End-to-end encrypted
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h4 className="text-sm font-bold text-gray-900 mb-3">💡 Chat Tips</h4>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { Icon: Shield, color: "text-blue-600",   text: "All messages are encrypted and stored securely" },
            { Icon: Zap,    color: "text-indigo-600",  text: "Real-time typing indicators and instant delivery" },
            { Icon: Users,  color: "text-purple-600",  text: "Messages sync seamlessly across all devices" },
          ].map(({ Icon, color, text }) => (
            <li key={text} className="flex items-start gap-2 text-sm text-gray-600">
              <Icon className={`h-4 w-4 ${color} shrink-0 mt-0.5`} /> {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

