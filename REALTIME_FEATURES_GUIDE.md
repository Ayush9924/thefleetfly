# Real-Time Features Implementation Guide

This document outlines the Socket.io real-time features implemented in the Fleet Management Application.

## Overview

The application now includes real-time capabilities for:
- Live vehicle tracking with GPS coordinates
- Real-time notifications
- Team messaging and chat
- Live driver location updates
- Alert notifications for events

## Architecture

### Backend

**Location:** `backend/`

Key files:
- `server.js` - HTTP server with Socket.io integration
- `middleware/socketAuth.js` - JWT authentication for WebSocket connections
- `services/socketService.js` - Event handlers and business logic

### Frontend

**Location:** `frontend/`

Key directories:
- `src/lib/socket.js` - Socket.io client initialization
- `src/contexts/RealtimeContext.jsx` - Global real-time state provider
- `src/hooks/` - Custom hooks for socket functionality
- `src/components/` - UI components for real-time features
- `src/pages/` - Pages for real-time features

## Features

### 1. Live Tracking Page (`/dashboard/tracking`)

**Component:** `LiveTrackingPage.jsx`

Features:
- Real-time map display with Leaflet
- Live driver locations
- Speed and heading information
- Location filtering
- Driver list with stats

**Custom Hook:** `useSocketLocation()`
```javascript
const { 
  locations, 
  emitLocation, 
  subscribeToLocationUpdates,
  joinLocationRoom,
  leaveLocationRoom 
} = useSocketLocation()
```

### 2. Messaging System (`/dashboard/messages`)

**Component:** `ChatPage.jsx` with sub-components:
- `ChatList.jsx` - Conversation list
- `ChatWindow.jsx` - Message interface

Features:
- Real-time messaging
- Typing indicators
- Message search
- Conversation management
- Read/unread status

**Custom Hook:** `useSocketChat()`
```javascript
const { 
  messages,
  sendMessage,
  notifyTyping,
  loadMessages,
  deleteMessage,
  markAsRead
} = useSocketChat()
```

### 3. Notifications (`/dashboard/notifications`)

**Component:** `NotificationsPage.jsx`
**UI Component:** `NotificationCenter.jsx` (Navbar integration)

Features:
- Real-time notifications
- Notification filtering by type
- Mark as read / Clear all
- Unread badge
- Notification types: alert, success, info

**Custom Hook:** `useSocketNotifications()`
```javascript
const { 
  notifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
} = useSocketNotifications()
```

## Socket Events

### Location Events
- `driver:location_update` - Send/receive driver location
- `driver:request_location` - Request location of specific driver
- `room:join_location` - Subscribe to location updates
- `room:leave_location` - Unsubscribe from location updates

### Chat Events
- `chat:send_message` - Send a message
- `chat:new_message` - Receive new message
- `chat:user_typing` - User typing indicator
- `chat:load_messages` - Load message history
- `chat:mark_read` - Mark message as read
- `chat:delete_message` - Delete a message

### Notification Events
- `notification:new` - Receive new notification
- `notification:mark_read` - Mark notification as read
- `notification:mark_all_read` - Mark all as read
- `notification:delete` - Delete notification
- `notification:clear_all` - Clear all notifications

## Setup Instructions

### Prerequisites
```bash
# Backend
npm install socket.io @socket.io/redis-adapter redis

# Frontend
npm install socket.io-client leaflet
```

### Environment Variables

**Backend (.env)**
```
SOCKET_IO_ENABLED=true
FRONTEND_URL=http://localhost:5173
SOCKET_IO_PING_INTERVAL=30000
SOCKET_IO_PING_TIMEOUT=10000
SOCKET_IO_MAX_HTTP_BUFFER_SIZE=1e6
SOCKET_IO_LOCATION_THRESHOLD=50
SOCKET_IO_LOCATION_UPDATE_INTERVAL=5000
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:5000
VITE_ENABLE_REALTIME=true
```

### Starting the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Access at: `http://localhost:5173`

## Usage Examples

### Location Tracking

```javascript
import { useSocketLocation } from '../hooks/useSocketLocation'

function MyComponent() {
  const { locations, emitLocation, joinLocationRoom } = useSocketLocation()

  useEffect(() => {
    // Join tracking for specific drivers
    joinLocationRoom(['driver1', 'driver2'])

    // Emit current location
    emitLocation({
      latitude: 40.7128,
      longitude: -74.0060,
      speed: 45,
      heading: 180
    })
  }, [])

  return (
    <div>
      {locations.map(loc => (
        <div key={loc.driverId}>
          {loc.driverId}: {loc.speed} km/h
        </div>
      ))}
    </div>
  )
}
```

### Sending Messages

```javascript
import { useSocketChat } from '../hooks/useSocketChat'

function MessageComponent() {
  const { messages, sendMessage } = useSocketChat()

  const handleSend = (text) => {
    sendMessage(text, 'recipient-id')
  }

  return (
    <div>
      {messages.map(msg => (
        <div key={msg._id}>{msg.content}</div>
      ))}
    </div>
  )
}
```

### Notifications

```javascript
import { useSocketNotifications } from '../hooks/useSocketNotifications'

function NotifComponent() {
  const { 
    notifications, 
    markAsRead, 
    deleteNotification 
  } = useSocketNotifications()

  return (
    <div>
      {notifications.map(notif => (
        <div key={notif._id}>
          <h3>{notif.title}</h3>
          <p>{notif.message}</p>
          <button onClick={() => markAsRead(notif._id)}>
            Mark as Read
          </button>
        </div>
      ))}
    </div>
  )
}
```

## Development Mode

The backend includes a development mode that simulates Socket.io connections without requiring full MongoDB setup:

```javascript
// socketAuth.js
// In development, users are created on-the-fly with JWT token verification
const user = {
  id: payload.id,
  email: payload.email,
  role: payload.role || 'driver'
}
```

## Performance Considerations

1. **Room Management:** Drivers are grouped by location rooms to reduce network traffic
2. **Location Throttling:** Updates are rate-limited to 5-second intervals
3. **Message Pagination:** Chat loads messages in batches
4. **Lazy Loading:** Pages use React's Suspense for code splitting
5. **Redis Adapter:** Production setup uses Redis for scaling across multiple servers

## Troubleshooting

### Socket Not Connecting
1. Check CORS settings in `server.js`
2. Verify `FRONTEND_URL` matches your frontend URL
3. Check browser console for connection errors
4. Ensure backend is running on correct port (5000)

### Messages Not Syncing
1. Verify Socket.io is connected in browser DevTools
2. Check Redux/Context state
3. Verify event names match between frontend/backend

### Notifications Not Appearing
1. Ensure NotificationCenter is mounted in Navbar
2. Check RealtimeContext is wrapping App
3. Verify notification event is being emitted

## Next Steps

1. **Add Leaflet Map Installation:**
   ```bash
   npm install leaflet leaflet-routing-machine
   ```

2. **Add Redis for Production:**
   ```bash
   npm install redis
   ```

3. **Implement Message Persistence:**
   - Add MongoDB models for messages
   - Implement message history loading

4. **Add File Sharing:**
   - Implement file upload to S3/storage
   - Add file events to socket service

5. **Add Video/Voice Calls:**
   - Integrate WebRTC
   - Add peer connection handling

## Files Reference

### Backend
- `server.js` - Main server file
- `middleware/socketAuth.js` - Socket authentication
- `services/socketService.js` - Event handlers
- `.env` - Configuration

### Frontend  
- `lib/socket.js` - Socket client
- `contexts/RealtimeContext.jsx` - Global state
- `hooks/useSocketLocation.js` - Location hook
- `hooks/useSocketChat.js` - Chat hook
- `hooks/useSocketNotifications.js` - Notifications hook
- `components/LiveMapTracker.jsx` - Map component
- `components/ChatWindow.jsx` - Chat UI
- `components/ChatList.jsx` - Conversation list
- `components/NotificationCenter.jsx` - Notification bell
- `pages/LiveTrackingPage.jsx` - Tracking page
- `pages/ChatPage.jsx` - Chat page
- `pages/NotificationsPage.jsx` - Notifications page

## Support

For issues or questions, refer to:
- [Socket.io Documentation](https://socket.io/docs/)
- [React Documentation](https://react.dev/)
- [Leaflet Documentation](https://leafletjs.com/)
