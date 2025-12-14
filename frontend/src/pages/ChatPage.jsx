import { useState, useEffect } from "react";
import { useSocketChat } from "../hooks/useSocketChat";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import { MessageSquare, User, X } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useRealtime } from "../contexts/RealtimeContext";

export default function ChatPage() {
  const { user } = useAuth();
  const { activeUsers, onlineStatus } = useRealtime();
  const { conversations, setConversations, startConversation, isConnected } = useSocketChat();
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await api.get("/messages/conversations");
        setConversations(response.data);
      } catch (error) {
        console.error("Error loading conversations:", error);
      }
    };
    if (isConnected) {
      loadConversations();
    }
  }, [isConnected, setConversations]);

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
  };

  const handleClickUser = async (otherUserId, userName) => {
    try {
      setLoading(true);
      const response = await api.post("/messages/conversations/start", {
        otherUserId,
      });
      const newConv = response.data;

      // Add to list if not exists
      if (!conversations.find((c) => c.conversationId === newConv.conversationId)) {
        setConversations([...conversations, newConv]);
      }

      // Join via socket
      startConversation(otherUserId);

      setSelectedConversationId(newConv.conversationId);
    } catch (error) {
      console.error("Error starting conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedConv = conversations.find(
    (c) => c.conversationId === selectedConversationId
  );

  const getOtherUserName = (conv) => {
    if (!conv.participants || conv.participants.length === 0) return "Unknown";
    const other = conv.participants.find(
      (p) => p.userId?._id !== user?._id && p.userId !== user?._id
    );
    return other?.userName || other?.userId?.name || "Unknown";
  };

  const getStatusColor = (userId) => {
    return onlineStatus[userId] === "online" ? "bg-green-500" : "bg-gray-400";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            Messages
          </h1>
          <p className="text-gray-600 mt-2">
            Chat with {activeUsers.length} active user{activeUsers.length !== 1 ? "s" : ""}
          </p>
          {!isConnected && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
              ⚠️ Connecting to real-time service...
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Active Users Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden sticky top-8">
              {/* Active Users Header */}
              <div className="p-4 border-b border-gray-200 bg-blue-50">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Active Users ({activeUsers.length})
                </h2>
              </div>

              {/* Users List */}
              <div className="max-h-96 overflow-y-auto">
                {activeUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <p className="text-sm">No active users</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {activeUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleClickUser(u.id, u.name)}
                        disabled={loading || u.id === user?._id}
                        className="w-full px-4 py-3 hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-left"
                      >
                        {/* Status Indicator */}
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div
                            className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(
                              u.id
                            )} rounded-full border-2 border-white`}
                          />
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm truncate">
                            {u.name}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">{u.role}</div>
                        </div>

                        {/* Message Icon */}
                        <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Separator */}
              <div className="h-px bg-gray-200 my-2" />

              {/* Recent Conversations */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 text-sm mb-2">Recent Chats</h3>
              </div>

              <ChatList
                onSelectConversation={handleSelectConversation}
                selectedId={selectedConversationId}
              />
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-3">
            {selectedConv ? (
              <ChatWindow
                conversationId={selectedConversationId}
                otherUserName={getOtherUserName(selectedConv)}
              />
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 h-[600px] flex flex-col items-center justify-center text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium">No conversation selected</p>
                <p className="text-gray-500 text-sm mt-1 max-w-xs">
                  Click on an active user from the list or select a recent conversation to start
                  chatting
                </p>

                {/* Quick Tips */}
                {activeUsers.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-xs">
                    <p className="text-sm text-blue-800 font-medium mb-2">💡 Quick Tip:</p>
                    <p className="text-xs text-blue-700">
                      Click on any active user on the left to start a new conversation instantly
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
