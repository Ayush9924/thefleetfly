# Messaging System Testing Checklist

## ✅ Current Status
- Backend Server: Running on port 5000
- Frontend: Ready on port 5174 (or 5173)
- Database: Connected to MongoDB Atlas
- Socket.io: Initialized and ready

## System Architecture Overview

```
User 1 (Browser) ←→ Frontend (Vite) ↔ WebSocket (Socket.io)
                                       ↓
                                  Backend (Express)
                                       ↓
                                    MongoDB
                                       ↑
User 2 (Browser) ←→ Frontend (Vite) ↔ WebSocket (Socket.io)
```

## Test Flow

### Phase 1: Setup (Do Once)
- [ ] Have MongoDB running (Atlas or local)
- [ ] Backend server started: `cd backend && node server.js`
- [ ] Frontend server started: `cd frontend && npm run dev`

### Phase 2: Single User Test
- [ ] Open browser and go to `localhost:5174/dashboard/messages`
- [ ] Login as admin@fleet.com / admin123
- [ ] See "Messages" page with "New Chat" button
- [ ] Click "New Chat" and see list of users (drivers, managers, admins)
- [ ] Users should show with:
  - Name (e.g., "John Doe")
  - Email (e.g., "john@fleet.com")
  - Role badge (blue for driver, purple for manager, red for admin)

### Phase 3: Two-User Messaging

#### Setup Second Browser
- [ ] Open new browser tab or incognito window
- [ ] Go to `localhost:5174/dashboard/messages`
- [ ] Login as driver@fleet.com / driver123 (or any other user)

#### Browser 1 (Admin) Sends Message
- [ ] Click "+ New Chat"
- [ ] Click on a driver user
- [ ] Type: "Hello! Can you hear me?"
- [ ] Press Send
- [ ] Message should appear on right side in blue bubble
- [ ] Timestamp should show (HH:MM format)

#### Browser 2 (Driver) Receives Message
- [ ] Should see conversation appear in left sidebar with admin's name
- [ ] Click on conversation to open
- [ ] Should see previous message from admin on left side in gray bubble
- [ ] Should see "Hello! Can you hear me?" with timestamp

#### Browser 2 (Driver) Replies
- [ ] Type: "Yes, I can see you! 👋"
- [ ] Press Send
- [ ] Message appears on right side (blue) in browser 2
- [ ] Message appears on left side (gray) in browser 1 (might need refresh)

### Phase 4: Advanced Features

#### Real-Time Typing Indicator
- [ ] Browser 2 starts typing but doesn't send
- [ ] Browser 1 should show "typing..." indicator below conversation name
- [ ] Indicator disappears after 3 seconds of no typing

#### Message Persistence
- [ ] Refresh browser 1 (press F5)
- [ ] Should still see all messages
- [ ] Messages should be in correct order (oldest first)

#### Multiple Conversations
- [ ] Browser 1 (Admin) starts new conversation with different user
- [ ] Should see both conversations in left sidebar
- [ ] Can switch between conversations

#### Conversation List Shows Correct Info
- [ ] Conversation list shows user names (not IDs)
- [ ] Shows last message preview
- [ ] Shows time of last message (e.g., "2m", "1h", "Jan 15")
- [ ] Selected conversation is highlighted

### Phase 5: Error Cases

#### Send Empty Message
- [ ] Try to send empty or whitespace-only message
- [ ] Send button should be disabled
- [ ] Error should appear or message should not send

#### Network Issues
- [ ] Open DevTools (F12)
- [ ] Go to Network tab
- [ ] Throttle to "Slow 3G" or "Offline"
- [ ] Try to send message
- [ ] App should handle gracefully (show error or queue)

#### Switch Users Quickly
- [ ] Switch between conversations rapidly
- [ ] App shouldn't crash
- [ ] Messages should be correct for each conversation

## Data Validation Checklist

### Messages Table (MongoDB)
Should have documents with:
- [ ] `conversationId`: "direct-id1-id2"
- [ ] `senderId`: ObjectId of sender
- [ ] `senderName`: String (e.g., "John Doe")
- [ ] `senderRole`: String (driver, manager, admin)
- [ ] `recipientId`: ObjectId of recipient
- [ ] `content`: String (the message text)
- [ ] `read`: Boolean (false initially, true after read)
- [ ] `createdAt`: ISO timestamp
- [ ] `timestamp`: ISO timestamp (added by this fix)

### Conversations Table (MongoDB)
Should have documents with:
- [ ] `conversationId`: "direct-id1-id2"
- [ ] `type`: "direct"
- [ ] `participants`: Array with 2 objects, each with:
  - [ ] `userId`: ObjectId
  - [ ] `userName`: String
  - [ ] `userRole`: String
- [ ] `lastMessage`: Object with:
  - [ ] `content`: String
  - [ ] `senderId`: ObjectId
  - [ ] `timestamp`: ISO timestamp
- [ ] `createdAt`: ISO timestamp

## Browser Console Checks

### Check Socket Connection
Open DevTools (F12) > Console and run:
```javascript
// Should return true if connected
socket.connected
```

### Check Socket Room
```javascript
// Should show room names like 'chat:direct-id1-id2'
socket.rooms
```

### Check Messages in Memory
Open ChatPage and run:
```javascript
// Will show current messages state
localStorage.getItem('messages')
```

## Backend Log Output Expected

### When User Connects
```
✅ User connected: John Doe (admin) - Socket: abc123...
```

### When Message Sent
```
💬 Message sent in conversation: direct-id1-id2
```

### When User Joins Conversation
```
💬 User {userId} joined chat: conversationId
```

## Common Issues & Solutions

### Issue: "No messages yet"
**Solution**: 
- Refresh the page
- Check if conversation was created (check MongoDB)
- Check browser console for errors

### Issue: Messages appear on wrong side
**Solution**:
- Backend is correctly sending `sender: 'self'` or `'other'`
- Check `senderId` in message object
- Compare with current user ID

### Issue: Conversation shows ID instead of name
**Solution**:
- Added `getParticipantName()` function to extract name
- Check if participants array has `userName` field

### Issue: Messages not real-time (need refresh)
**Solution**:
- Check Socket.io connection in DevTools
- Verify backend is broadcasting to correct room
- Check room name format: `chat:conversationId`

## Performance Benchmarks

Acceptable times:
- Message send: < 200ms
- Message receive: < 100ms (real-time)
- Load conversation list: < 500ms
- Load conversation messages: < 1000ms

## Cleanup Commands

If something breaks, reset with:

### Clear MongoDB data (CAUTION - Deletes all messages)
```mongodb
db.messages.deleteMany({})
db.conversations.deleteMany({})
```

### Restart servers
```bash
# Terminal 1
cd backend && node server.js

# Terminal 2
cd frontend && npm run dev
```

### Clear browser cache
- DevTools > Application > Clear storage
- Or press Ctrl+Shift+Delete

## Sign-Off

- [ ] Basic 1-to-1 messaging works
- [ ] Messages persist in database
- [ ] Real-time delivery works
- [ ] Multiple conversations work
- [ ] Conversation list displays correctly
- [ ] No console errors
- [ ] Backend logs show expected events

**Last Updated**: Now
**Status**: Ready for testing
**Estimated Time**: 15-20 minutes for full test
