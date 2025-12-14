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
    if (!socket) return

    const handleReceiveMessage = (data) => {
      console.log('📨 Message received:', { 
        conversationId: data.conversationId, 
        senderName: data.senderName,
        content: data.content?.substring(0, 20),
        messageId: data._id
      })
      
      // Get current user ID
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
      const currentUserId = currentUser._id
      
      // Only add messages for the active conversation
      if (data.conversationId === activeConversation) {
        console.log('✅ Adding message to active conversation:', data.conversationId)
        setMessages((prev) => {
          // Check for exact duplicate by ID (from DB)
          const isDuplicate = prev.some(m => m._id === data._id && !m.isOptimistic)
          if (isDuplicate) {
            console.log('⚠️  Duplicate message received, skipping')
            return prev
          }

          // If this is our sent message, replace the optimistic one
          const isSentByMe = String(data.senderId) === String(currentUserId)
          
          let updatedMessages = prev
          if (isSentByMe) {
            // Remove optimistic messages with same content sent recently
            updatedMessages = prev.filter(m => {
              // Keep non-optimistic messages
              if (!m.isOptimistic) return true
              // Keep optimistic messages with different content
              if (m.content !== data.content) return true
              // Remove optimistic copy with same content (it's being replaced)
              console.log('✅ Replacing optimistic message with real one:', data.content.substring(0, 30))
              return false
            })
          }

          return [
            ...updatedMessages,
            {
              _id: data._id || Math.random().toString(36),
              sender: data.senderId,
              senderName: data.senderName,
              content: data.content || data.message,
              timestamp: data.timestamp || new Date().toISOString(),
              read: data.read || false,
              isOptimistic: false,
            },
          ]
        })
      } else {
        console.log('⏭️  Message not for active conversation:', { 
          messageConversation: data.conversationId, 
          activeConversation 
        })
      }

      // Update conversation preview (last message and time)
      setConversations((prev) =>
        prev.map((c) => {
          const convId = c.conversationId || c._id
          if (convId === data.conversationId) {
            return {
              ...c,
              lastMessage: {
                content: data.content || data.message,
                senderId: data.senderId,
                timestamp: new Date(data.timestamp),
              },
              lastMessageTime: Date.now(),
              unreadCounts: activeConversation === data.conversationId 
                ? c.unreadCounts 
                : { ...c.unreadCounts, [data.senderId]: (c.unreadCounts?.[data.senderId] || 0) + 1 },
            }
          }
          return c
        })
      )
    }

    const handleTyping = (data) => {
      if (data.conversationId === activeConversation) {
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
    }

    const handleConversationRead = (data) => {
      // Update unread counts when conversation is marked as read
      const { conversationId, userId } = data
      console.log('✅ Conversation marked as read:', { conversationId, userId })
      
      setConversations((prev) =>
        prev.map((c) => {
          const convId = c.conversationId || c._id
          if (convId === conversationId) {
            const updatedUnreadCounts = { ...c.unreadCounts }
            delete updatedUnreadCounts[userId]
            return {
              ...c,
              unreadCounts: updatedUnreadCounts,
            }
          }
          return c
        })
      )
    }

    // Register listeners
    console.log('📡 Registering message listener for socket:', socket.id)
    socket.on('chat:receive_message', handleReceiveMessage)
    socket.on('chat:user_typing', handleTyping)
    socket.on('chat:conversation_read', handleConversationRead)

    // Cleanup: Remove listeners
    return () => {
      console.log('🧹 Removing message listener for socket:', socket.id)
      socket.off('chat:receive_message', handleReceiveMessage)
      socket.off('chat:user_typing', handleTyping)
      socket.off('chat:conversation_read', handleConversationRead)
    }
  }, [socket, activeConversation])

  /**
   * Send a message
   * @param {String} content - Message content
   * @param {String} conversationId - Conversation ID
   */
  const sendMessage = useCallback(
    (content, conversationId) => {
      if (!socket || !content.trim()) {
        console.warn('Cannot send message:', { socketConnected: !!socket, hasContent: !!content.trim() })
        return
      }

      if (!conversationId) {
        console.error('No conversation ID provided to sendMessage')
        return
      }

      console.log('📤 Sending message:', { conversationId, content })
      socket.emit('chat:send_message', {
        conversationId,
        message: content.trim(),
      })

      // Optimistic update with temporary ID
      const tempId = `temp_${Date.now()}_${Math.random()}`
      setMessages((prev) => [
        ...prev,
        {
          _id: tempId,
          sender: 'self',
          senderName: 'You',
          content: content.trim(),
          timestamp: new Date().toISOString(),
          read: true,
          isOptimistic: true, // Mark as optimistic
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

      // Join the room
      socket.emit('chat:join_conversation', { conversationId })
      
      // Mark all messages in this conversation as read
      socket.emit('chat:mark_conversation_read', { conversationId })
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
    setActiveConversation,
    isConnected: !!socket?.connected,
  }
}
