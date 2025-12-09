import { useState, useEffect } from 'react'
import { MessageSquare, Search, X } from 'lucide-react'
import { useSocketChat } from '../hooks/useSocketChat'

/**
 * Chat List Component
 * Displays list of conversations with search and filtering
 */
export default function ChatList({ onSelectConversation, selectedId = null }) {
  const { conversations, setConversations, startConversation } = useSocketChat()
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredConversations, setFilteredConversations] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Filter conversations based on search
  useEffect(() => {
    const filtered = conversations.filter(
      (conv) =>
        conv.participantName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (conv.lastMessage &&
          conv.lastMessage
            .toLowerCase()
            .includes(searchQuery.toLowerCase()))
    )
    setFilteredConversations(filtered)
  }, [searchQuery, conversations])

  const handleStartConversation = (userId) => {
    setIsLoading(true)
    startConversation(userId)
    // Loading state clears after socket event
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation._id}
                onClick={() => onSelectConversation(conversation._id)}
                className={`w-full p-3 text-left hover:bg-gray-50 transition ${
                  selectedId === conversation._id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(conversation.participantName)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-medium text-gray-900 truncate">
                        {conversation.participantName}
                      </p>
                      <p className="text-xs text-gray-500 shrink-0">
                        {formatTime(conversation.lastMessageTime)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage || 'No messages yet'}
                    </p>
                  </div>

                  {/* Unread Badge */}
                  {conversation.unreadCount > 0 && (
                    <div className="shrink-0 bg-blue-500 text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium text-sm">
          + New Conversation
        </button>
      </div>
    </div>
  )
}
