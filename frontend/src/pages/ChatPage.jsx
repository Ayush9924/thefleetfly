import { useState } from 'react'
import { useSocketChat } from '../hooks/useSocketChat'
import ChatList from '../components/ChatList'
import ChatWindow from '../components/ChatWindow'
import { Card } from '../components/ui/card'

/**
 * Chat Page
 * Full-screen chat interface with conversation list and messaging
 */
export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState(null)
  const { conversations, loadMessages } = useSocketChat()

  const selectedConversation = conversations.find(
    (conv) => conv._id === selectedConversationId
  )

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId)
    loadMessages(conversationId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-2">
          Stay connected with your team and drivers
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat List */}
        <div className="lg:col-span-1">
          <Card className="h-[600px] overflow-hidden p-0">
            <ChatList
              onSelectConversation={handleSelectConversation}
              selectedId={selectedConversationId}
            />
          </Card>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] overflow-hidden p-0">
            {selectedConversation ? (
              <ChatWindow
                conversationId={selectedConversationId}
                otherUserName={selectedConversation.participantName}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-4">💬</div>
                  <p className="text-gray-600 font-medium">
                    Select a conversation to start messaging
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Or create a new one from the list
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Chat Tips */}
      <Card className="p-6 bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Chat Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use @mentions to notify specific team members</li>
          <li>• Share location or vehicle status with quick actions</li>
          <li>• Messages are encrypted end-to-end</li>
          <li>• Search messages by date or keywords</li>
        </ul>
      </Card>
    </div>
  )
}
