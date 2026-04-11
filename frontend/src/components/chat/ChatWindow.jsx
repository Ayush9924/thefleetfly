import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Trash2, MoreVertical } from 'lucide-react';
import api from '@/services/api';
import { useSocketChat } from '@/hooks/useSocketChat';

/** @param {string|number} ts */
const fmtTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d)) return '';
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const currentUser = () => JSON.parse(localStorage.getItem('currentUser') || '{}');

export default function ChatWindow({ conversationId, otherUserName = 'User' }) {
  const { messages, sendMessage, notifyTyping, deleteMessage, typingUsers, loadMessages, setMessages, setActiveConversation } = useSocketChat();
  const [input, setInput] = useState('');
  const [fetching, setFetching] = useState(false);
  const endRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    if (!conversationId) return;
    setActiveConversation(conversationId);

    const load = async () => {
      setFetching(true);
      try {
        const { data } = await api.get(`/messages/${conversationId}`);
        const uid = currentUser()._id;
        const formatted = (data || [])
          .map(m => ({
            _id: m._id,
            sender: m.senderId,
            senderName: String(m.senderId) === String(uid) ? 'You' : (m.senderName || 'Unknown'),
            content: m.content,
            timestamp: m.timestamp || m.createdAt,
            read: m.read || false,
          }))
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setMessages(formatted);
      } finally {
        setFetching(false);
      }
    };

    load();
    loadMessages(conversationId);
  }, [conversationId, loadMessages, setMessages, setActiveConversation]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !conversationId) return;
    sendMessage(input.trim(), conversationId);
    setInput('');
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    clearTimeout(typingTimer.current);
    notifyTyping(conversationId);
  };

  const uid = currentUser()._id;
  const typingName = Object.values(typingUsers || {}).map(u => u.name).join(', ');

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
        <div>
          <h2 className="font-semibold text-gray-900 text-sm">{otherUserName}</h2>
          {typingName && <p className="text-xs text-blue-500 animate-pulse">{typingName} typing…</p>}
        </div>
        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition"><MoreVertical className="w-4 h-4 text-gray-500" /></button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {fetching ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">Loading messages…</div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">No messages yet. Say hello!</div>
        ) : messages.map(msg => {
          const isSelf = msg.sender === 'self' || String(msg.sender) === String(uid);
          const av = (msg.senderName || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
          return (
            <div key={msg._id} className={`flex items-end gap-2 group ${isSelf ? 'justify-end' : 'justify-start'}`}>
              {!isSelf && <div className="w-7 h-7 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0">{av}</div>}
              <div className="max-w-xs lg:max-w-md">
                {!isSelf && <p className="text-xs text-gray-500 mb-0.5 ml-1">{msg.senderName}</p>}
                <div className={`relative px-3 py-2 rounded-xl text-sm ${isSelf ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'}`}>
                  <p className="leading-relaxed break-words">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isSelf ? 'text-blue-200' : 'text-gray-400'}`}>{fmtTime(msg.timestamp)}{isSelf && msg.read && ' ✓✓'}</p>
                  {isSelf && (
                    <button onClick={() => { if (confirm('Delete message?')) deleteMessage(msg._id); }}
                      className="absolute -right-7 top-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition">
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  )}
                </div>
              </div>
              {isSelf && <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{av}</div>}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 p-4 border-t border-gray-100 shrink-0">
        <input type="text" value={input} onChange={handleTyping} placeholder="Type a message…"
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        <button type="submit" disabled={!input.trim()}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-40 transition">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}



