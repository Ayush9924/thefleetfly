import { useState, useRef, useEffect } from 'react'
import { Send, Trash2, MoreVertical } from 'lucide-react'
import api from '../services/api'
import { useSocketChat } from '../hooks/useSocketChat'

/**
 * Chat Window Component
 * Displays messages and provides message input
 */
export default function ChatWindow({ conversationId, otherUserName = 'User' }) {
  const {
    messages,
    sendMessage,
    notifyTyping,
    markAsRead,
    deleteMessage,
    typingUsers,
    loadMessages,
    setMessages,
    setActiveConversation,
  } = useSocketChat()
  const [inputValue, setInputValue] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Set active conversation and load messages
  useEffect(() => {
    if (!conversationId) {
      console.warn('No conversationId provided to ChatWindow')
      return
    }

    console.log('🔄 Setting active conversation:', conversationId)
    
    // Set active conversation FIRST
    setActiveConversation(conversationId)

    // Then load messages via API
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true)
        console.log('📥 Fetching messages for:', conversationId)
        const response = await api.get(`/messages/${conversationId}`)
        console.log('✅ Messages loaded from API:', response.data?.length || 0)
        
        // Get current user
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
        
        // Ensure messages have proper structure with senderName
        // Sort by timestamp to ensure chronological order (oldest first)
        const formattedMessages = (response.data || [])
          .map((msg) => {
            const isSelf = String(msg.senderId) === String(currentUser._id)
            return {
              _id: msg._id,
              sender: msg.senderId,
              senderName: isSelf ? 'You' : (msg.senderName || 'Unknown'),
              content: msg.content,
              timestamp: msg.timestamp || msg.createdAt,
              read: msg.read || false,
              isOptimistic: false,
            }
          })
          .sort((a, b) => {
            // Sort by timestamp: oldest first, newest last
            const timeA = new Date(a.timestamp).getTime()
            const timeB = new Date(b.timestamp).getTime()
            return timeA - timeB
          })
        
        console.log('📊 Formatted messages:', formattedMessages.length)
        setMessages(formattedMessages)
      } catch (error) {
        console.error('Error loading messages:', error)
        // Don't clear messages on error, keep what we have
      } finally {
        setLoadingMessages(false)
      }
    }

    fetchMessages()
    
    // Join socket room AFTER API fetch
    // This ensures we don't miss messages during the fetch
    loadMessages(conversationId)
  }, [conversationId, loadMessages, setMessages, setActiveConversation])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 0)
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()

    if (!inputValue.trim()) {
      console.warn('Empty message, not sending')
      return
    }

    if (!conversationId) {
      console.error('No conversation ID, cannot send message')
      return
    }

    console.log('📨 Sending message:', { conversationId, content: inputValue })
    const sent = sendMessage(inputValue, conversationId)
    
    if (sent) {
      setInputValue('')
      setShowEmojiPicker(false)
    } else {
      console.error('Failed to send message - socket not connected')
      // Keep the message in the input so user can retry
    }
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value)

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Emit typing notification
    notifyTyping(conversationId)

    // Clear typing indicator after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      // Typing indicator automatically clears
    }, 1000)
  }

  const handleDeleteMessage = (messageId) => {
    if (window.confirm('Delete this message?')) {
      deleteMessage(messageId)
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A'
    
    try {
      const date = new Date(timestamp)
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date'
      }
      
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

      let dateStr = ''
      if (messageDate.getTime() === today.getTime()) {
        dateStr = 'Today'
      } else if (messageDate.getTime() === yesterday.getTime()) {
        dateStr = 'Yesterday'
      } else {
        dateStr = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      }

      const timeStr = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })

      return `${timeStr}`
    } catch (error) {
      console.error('Error formatting time:', error)
      return 'N/A'
    }
  }

  return (
    <div className="flex flex-col h-full bg-white border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
        <div>
          <h2 className="font-semibold text-gray-900">{otherUserName}</h2>
          {Object.keys(typingUsers).length > 0 && (
            <p className="text-xs text-gray-500 animate-pulse">
              {Object.values(typingUsers)
                .map((u) => u.name)
                .join(', ')} typing...
            </p>
          )}
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            // Check if message is from current user
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
            const isSelf = message.sender === 'self' || String(message.sender) === String(currentUser._id)
            
            // Get initials for avatar
            const getInitials = (name) => {
              if (!name) return '?'
              return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
            }

            return (
              <div
                key={message._id}
                className={`flex ${
                  isSelf ? 'justify-end' : 'justify-start'
                } group items-end gap-2 animate-fadeIn`}
              >
                {/* Avatar for received messages */}
                {!isSelf && (
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {getInitials(message.senderName)}
                  </div>
                )}

                <div className="flex flex-col gap-1 max-w-xs lg:max-w-md xl:max-w-lg">
                  {/* Sender Name - show for received messages */}
                  {!isSelf && message.senderName && (
                    <p className="text-xs font-semibold text-gray-600 px-1 ml-1">
                      {message.senderName}
                    </p>
                  )}
                  
                  {/* Message Bubble */}
                  <div
                    className={`px-4 py-3 rounded-lg ${
                      isSelf
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                    } relative wrap-break-word shadow-sm`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p
                      className={`text-xs mt-2 ${
                        isSelf
                          ? 'text-blue-100'
                          : 'text-gray-500'
                      } flex items-center gap-1`}
                    >
                      {formatTime(message.timestamp)}
                      {isSelf && message.read && (
                        <span title="Read">✓✓</span>
                      )}
                    </p>

                    {/* Delete Button */}
                    {isSelf && (
                      <button
                        onClick={() => handleDeleteMessage(message._id)}
                        className="absolute top-2 -right-8 opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-100 rounded"
                        title="Delete message"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Avatar for sent messages (optional) */}
                {isSelf && (
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {getInitials(currentUser?.name || 'You')}
                  </div>
                )}
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-gray-200 bg-white shrink-0"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="px-3 py-2 text-gray-600 hover:bg-white rounded-lg transition"
          >
            😊
          </button>
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
