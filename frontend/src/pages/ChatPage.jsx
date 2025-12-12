import { useState, useEffect } from 'react';
import { useSocketChat } from '../hooks/useSocketChat';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import { Card } from '../components/ui/card';
import { MessageSquare, Users, Lightbulb, Shield, Search, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

/**
 * 🚀 2025 Real-Time Chat Dashboard
 * Sleek, responsive, glassmorphic UI for dispatch ↔ driver communication
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

  return (
    <div className="space-y-6 p-4 bg-linear-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            Messages
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time communication with drivers, dispatchers, and team members
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Create New Conversation (future enhancement) */}
          <Button variant="default" size="sm" className="hidden sm:flex gap-2">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>

          {/* Mobile sidebar toggle */}
          <Button
            variant="outline"
            size="sm"
            className="sm:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat List - Sidebar */}
        <AnimatePresence>
          {(isSidebarOpen || window.innerWidth >= 1024) && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:col-span-1"
            >
              <Card className="h-[600px] overflow-hidden p-0 border border-gray-200/30 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl flex flex-col">
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-200/30">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search conversations..."
                      className="pl-10 w-full border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                    />
                  </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse flex items-center gap-3 p-3">
                          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="p-6 text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 text-sm">No conversations yet</p>
                      <p className="text-gray-500 text-xs mt-1">
                        Messages will appear here when you start chatting
                      </p>
                    </div>
                  ) : (
                    <ChatList
                      onSelectConversation={handleSelectConversation}
                      selectedId={selectedConversationId}
                    />
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Window */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] overflow-hidden p-0 border border-gray-200/30 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl">
            {selectedConversation ? (
              <ChatWindow
                conversationId={selectedConversationId}
                otherUserName={selectedConversation.participantName}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center p-6 text-center"
              >
                <div className="bg-linear-to-br from-blue-100 to-indigo-100 p-6 rounded-full mb-6">
                  <MessageSquare className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome to Your Messaging Hub
                </h3>
                <p className="text-gray-600 max-w-md">
                  Select a conversation from the list to start chatting in real-time with your team.
                </p>
                <p className="text-gray-500 text-sm mt-3">
                  All messages are secured with end-to-end encryption.
                </p>
              </motion.div>
            )}
          </Card>
        </div>
      </div>

      {/* Chat Tips - Enhanced */}
      <Card className="p-5 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Lightbulb className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              💡 Pro Tips for Real-Time Chat
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 shrink-0" />
                <span>All messages are encrypted and stored securely</span>
              </li>
              <li>
                • Use quick actions to share vehicle status or location
              </li>
              <li>
                • Typing indicators show when others are composing
              </li>
              <li>
                • Messages sync instantly across all your devices
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
