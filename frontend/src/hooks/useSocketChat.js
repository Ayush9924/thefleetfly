import { useEffect, useCallback, useState } from 'react'
import { useRealtime } from '../contexts/RealtimeContext'

/**
 * Custom hook for managing real-time chat via Socket.io
 * Handles message sending, receiving, and conversation management
 */
export const useSocketChat = () => {
  const { socket } = useRealtime()
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])
  const [typingUsers, setTypingUsers] = useState({})
  const [activeConversation, setActiveConversation] = useState(null)
  // Handle server-emitted conversation creation
  useEffect(() => {
    if (!socket) return

    const handleConversationStarted = ({ conversationId, participants }) => {
      setConversations((prev) => {
        const exists = prev.find((c) => c._id === conversationId)
        if (exists) return prev
        return [
          ...prev,
          {
            _id: conversationId,
            participantName: participants?.find((p) => p !== 'self') || 'Participant',
            lastMessage: '',
            lastMessageTime: Date.now(),
            unreadCount: 0,
          },
        ]
      })
      setActiveConversation(conversationId)
      socket.emit('chat:join_conversation', { conversationId })
    }

    socket.on('chat:conversation_started', handleConversationStarted)

    return () => {
      socket.off('chat:conversation_started', handleConversationStarted)
    }
  }, [socket, setConversations])

  /**
   * Subscribe to incoming messages for the active conversation
   */
  useEffect(() => {
    if (!socket || !activeConversation) return

    const handleReceiveMessage = (data) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: data._id || Math.random().toString(36),
          sender: data.senderId,
          senderName: data.senderName,
          content: data.message,
          timestamp: data.timestamp || new Date().toISOString(),
          read: false,
        },
      ])

      // Update conversation preview (last message and time)
      setConversations((prev) =>
        prev.map((c) =>
          c._id === data.conversationId
            ? {
                ...c,
                lastMessage: data.message,
                lastMessageTime: Date.now(),
                unreadCount: (c.unreadCount || 0) + (activeConversation === data.conversationId ? 0 : 1),
              }
            : c
        )
      )
    }

    const handleTyping = (data) => {
      setTypingUsers((prev) => ({
        ...prev,
        [data.userId]: {
          name: data.userName,
          timestamp: Date.now(),
        },
      }))

      // Remove typing indicator after 3 seconds
      setTimeout(() => {
        setTypingUsers((prev) => {
          const updated = { ...prev }
          delete updated[data.userId]
          return updated
        })
      }, 3000)
    }

    socket.on('chat:receive_message', handleReceiveMessage)
    socket.on('chat:user_typing', handleTyping)

    return () => {
      socket.off('chat:receive_message', handleReceiveMessage)
      socket.off('chat:user_typing', handleTyping)
    }
  }, [socket, activeConversation])

  /**
   * Send a message
   * @param {String} content - Message content
   * @param {String} recipientId - ID of message recipient
   */
  const sendMessage = useCallback(
    (content, conversationId) => {
      if (!socket || !content.trim()) return

      socket.emit('chat:send_message', {
        conversationId,
        message: content.trim(),
      })

      // Optimistic update
      setMessages((prev) => [
        ...prev,
        {
          _id: Math.random().toString(36),
          sender: 'self',
          content: content.trim(),
          timestamp: new Date().toISOString(),
          read: true,
        },
      ])
    },
    [socket]
  )

  /**
   * Notify that user is typing
   * @param {String} conversationId - Current conversation ID
   */
  const notifyTyping = useCallback(
    (conversationId) => {
      if (!socket) return

      socket.emit('chat:typing', {
        conversationId,
      })
    },
    [socket]
  )

  /**
   * Load messages for a conversation
   * @param {String} conversationId - Conversation ID to load
   */
  const loadMessages = useCallback(
    (conversationId) => {
      if (!socket) return

      setActiveConversation(conversationId)
      setMessages([])
      setTypingUsers({})

      socket.emit('chat:join_conversation', { conversationId })
    },
    [socket]
  )

  /**
   * Mark message as read
   * @param {String} messageId - Message ID to mark as read
   */
  const markAsRead = useCallback(
    (messageId) => {
      if (!socket) return

      socket.emit('chat:mark_read', {
        messageId,
      })
    },
    [socket]
  )

  /**
   * Get or create conversation with a user
   * @param {String} userId - User ID to chat with
   */
  const startConversation = useCallback(
    (userId) => {
      if (!socket) return

      socket.emit('chat:start_conversation', {
        userId,
      })
    },
    [socket]
  )

  /**
   * Delete a message
   * @param {String} messageId - Message ID to delete
   */
  const deleteMessage = useCallback(
    (messageId) => {
      if (!socket) return

      socket.emit('chat:delete_message', {
        messageId,
      })

      setMessages((prev) => prev.filter((msg) => msg._id !== messageId))
    },
    [socket]
  )

  /**
   * Search messages
   * @param {String} query - Search query
   * @param {String} conversationId - Conversation to search in
   */
  const searchMessages = useCallback(
    (query, conversationId) => {
      if (!socket) return

      socket.emit('chat:search_messages', {
        query,
        conversationId,
      })
    },
    [socket]
  )

  return {
    messages,
    conversations,
    typingUsers,
    activeConversation,
    sendMessage,
    notifyTyping,
    loadMessages,
    markAsRead,
    startConversation,
    deleteMessage,
    searchMessages,
    setConversations,
    setMessages,
    isConnected: !!socket?.connected,
  }
}
