import { useState, useEffect } from 'react';
import { MessageSquare, Search, X } from 'lucide-react';
import { useSocketChat } from '@/hooks/useSocketChat';

/** @param {string} name */
const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

/** @param {string|number} ts */
const relTime = (ts) => {
  const diff = Date.now() - new Date(ts);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d` : new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const currentUserId = () => JSON.parse(localStorage.getItem('currentUser') || '{}')._id;

const getParticipantName = (conv) => {
  const uid = currentUserId();
  const other = conv.participants?.find(p => String(p.userId?._id || p.userId) !== String(uid));
  return other?.userId?.name || other?.userName || conv.participantName || 'Unknown';
};

const getUnread = (conv) => Object.values(conv.unreadCounts || {}).reduce((a, b) => a + b, 0);

export default function ChatList({ onSelectConversation, selectedId = null }) {
  const { conversations, startConversation } = useSocketChat();
  const [query, setQuery] = useState('');
  const [newId, setNewId] = useState('');

  const filtered = conversations.filter(c => {
    const name = getParticipantName(c).toLowerCase();
    const last = (c.lastMessage?.content || '').toLowerCase();
    const q = query.toLowerCase();
    return name.includes(q) || last.includes(q);
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 shrink-0">
        <h2 className="font-semibold text-gray-900 mb-3">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search conversations…"
            className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-gray-400" /></button>}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <div className="py-12 flex flex-col items-center text-gray-400">
            <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">{query ? 'No results found' : 'No conversations yet'}</p>
          </div>
        ) : filtered.map(conv => {
          const id = conv.conversationId || conv._id;
          const name = getParticipantName(conv);
          const unread = getUnread(conv);
          return (
            <button key={id} onClick={() => onSelectConversation(id)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition ${selectedId === id ? 'bg-blue-50' : ''}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {initials(name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                    <p className="text-xs text-gray-400 shrink-0">{relTime(conv.lastMessage?.timestamp || conv.createdAt)}</p>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage?.content || 'No messages yet'}</p>
                </div>
                {unread > 0 && (
                  <span className="shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* New Chat */}
      <div className="p-3 border-t border-gray-100 bg-gray-50 shrink-0 flex gap-2">
        <input type="text" value={newId} onChange={e => setNewId(e.target.value)}
          placeholder="User ID to start chat"
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        <button onClick={() => { if (newId.trim()) { startConversation(newId.trim()); setNewId(''); } }}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition whitespace-nowrap">
          + New
        </button>
      </div>
    </div>
  );
}



