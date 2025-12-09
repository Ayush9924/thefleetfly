import { useState, useRef, useEffect } from 'react'
import { Send, Trash2, MoreVertical } from 'lucide-react'
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
  } = useSocketChat()
  const [inputValue, setInputValue] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()

    if (inputValue.trim() && conversationId) {
      sendMessage(inputValue, conversationId)
      setInputValue('')
      setShowEmojiPicker(false)
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
    const date = new Date(timestamp)
    const now = new Date()

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${
                message.sender === 'self' ? 'justify-end' : 'justify-start'
              } group`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                  message.sender === 'self'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                } relative`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === 'self'
                      ? 'text-blue-100'
                      : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>

                {/* Delete Button */}
                {message.sender === 'self' && (
                  <button
                    onClick={() => handleDeleteMessage(message._id)}
                    className="absolute top-2 -right-8 opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg"
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
