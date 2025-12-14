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
  const [newUserId, setNewUserId] = useState('')

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

  const handleStartConversation = () => {
    if (!newUserId.trim()) return
    setIsLoading(true)
    startConversation(newUserId.trim())
    setNewUserId('')
    setIsLoading(false)
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

  const getParticipantName = (conv) => {
    // Get current user ID
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
    const currentUserId = currentUser._id

    // Find the other participant (not the current user)
    if (!conv.participants || conv.participants.length === 0) {
      return conv.participantName || 'Unknown'
    }

    // For direct conversations, find the other person
    const otherParticipant = conv.participants.find(
      (p) => String(p.userId?._id || p.userId) !== String(currentUserId)
    )

    if (otherParticipant) {
      // Populated user data has _id and name
      if (otherParticipant.userId?.name) {
        return otherParticipant.userId.name
      }
      // Fallback to stored userName
      if (otherParticipant.userName) {
        return otherParticipant.userName
      }
      // Fallback to participantName from socket data
      return conv.participantName || 'Unknown'
    }

    return conv.participantName || 'Unknown'
  }

  const getUnreadCount = (conv) => {
    if (!conv.unreadCounts) return 0
    // unreadCounts is a Map of userId -> count
    const counts = Object.values(conv.unreadCounts)
    return counts.reduce((a, b) => a + b, 0)
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden max-w-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 shrink-0">
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
            {filteredConversations.map((conversation) => {
              const participantName = getParticipantName(conversation)
              const convId = conversation.conversationId || conversation._id
              return (
              <button
                key={convId}
                onClick={() => onSelectConversation(convId)}
                className={`w-full p-3 text-left hover:bg-gray-50 transition ${
                  selectedId === convId ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar */}
                  <div className="shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(participantName)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <p className="font-medium text-gray-900 truncate text-sm">
                        {participantName}
                      </p>
                      <p className="text-xs text-gray-500 shrink-0 whitespace-nowrap">
                        {formatTime(conversation.lastMessage?.timestamp || conversation.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>

                  {/* Unread Badge */}
                  {getUnreadCount(conversation) > 0 && (
                    <div className="shrink-0 bg-blue-500 text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                      {getUnreadCount(conversation) > 9 ? '9+' : getUnreadCount(conversation)}
                    </div>
                  )}
                </div>
              </button>
            )})}
          </div>
        )}
      </div>

      {/* New Chat Controls */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 shrink-0">
        <div className="flex gap-2 min-w-0">
          <input
            type="text"
            placeholder="Enter user ID to chat"
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={handleStartConversation}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium text-sm"
            disabled={isLoading}
          >
            + New Conversation
          </button>
        </div>
      </div>
    </div>
  )
}
