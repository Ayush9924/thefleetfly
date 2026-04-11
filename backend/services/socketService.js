/**
 * Socket.io Event Handlers & Services
 * Manages all real-time communication for the fleet app
 */

// In-memory location storage (for development)
const activeLocations  = new Map(); // driverId -> locationPayload
const userSockets      = new Map(); // userId   -> Set<socketId>
const onlineUsers      = new Map(); // userId   -> { socketId, userName … }

// ── Rate-limiter & smart-DB maps (reset on server restart) ────────────────
const lastUpdateTime   = new Map(); // driverId -> Date.now() of last accepted update
const lastSavedPos     = new Map(); // driverId -> { lat, lng, ts } of last MongoDB write

// Tuning — change these without touching logic:
const RATE_LIMIT_MS      = 6_000;  // min 6s between accepted socket updates per driver (client sends every 7s)
const DB_MIN_DISTANCE_M  = 25;     // only write MongoDB if moved ≥25m
const DB_MAX_INTERVAL_MS = 60_000; // always write MongoDB every 60s regardless of movement

const normalizeId = (value) => {
  if (value == null) return '';
  return String(value);
};

// Simple haversine for backend DB-write gating (no external dep)
function haversineBack(lat1, lon1, lat2, lon2) {
  const R = 6_371_000, r = v => v * Math.PI / 180;
  const a = Math.sin(r(lat2-lat1)/2)**2 + Math.cos(r(lat1))*Math.cos(r(lat2))*Math.sin(r(lon2-lon1)/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Import models for persistence
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const LocationHistory = require('../models/LocationHistory');
const locationService = require('./locationService');

/**
 * Initialize all Socket.io event handlers
 * @param {Server} io - Socket.io server instance
 */
const socketService = (io) => {
  io.on('connection', (socket) => {
    const userId = normalizeId(socket.userId);
    const userRole = socket.userRole;
    const userName = socket.userName;

    console.log(`✓ ${userName} (${userRole}) connected  [${socket.id}]`);
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // Track online users
    onlineUsers.set(userId, {
      socketId: socket.id,
      userName,
      userRole,
      connectedAt: Date.now(),
    });

    // Broadcast that user is now online
    io.emit('user:online', {
      userId,
      userName,
      userRole,
      onlineCount: onlineUsers.size,
    });

    console.log(`🟢 Online users: ${onlineUsers.size}`);

    // ==================== LOCATION TRACKING EVENTS ====================

    /**
     * Driver joins tracking - starts sharing real-time location
     * Emitted by: Driver mobile app / driver's browser
     */
    socket.on('driver:join_tracking', (data) => {
      try {
        const driverId = normalizeId(data?.driverId || socket.userId);
        const vehicleId = normalizeId(data?.vehicleId);
        
        if (!driverId) {
          socket.emit('error', 'Invalid driver ID');
          return;
        }

        // Join driver to a room for location tracking
        socket.join(`driver:${driverId}`);
        if (vehicleId) {
          socket.join(`vehicle:${vehicleId}`);
        }
        
        console.log(`📍 Driver ${driverId} started location tracking`);
        
        // Broadcast to dispatch team
        io.to('dispatch').emit('notification:new', {
          type: 'tracking_started',
          message: `Driver ${driverId} started sharing location`,
          driverId,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('❌ Error in driver:join_tracking:', error.message);
        socket.emit('error', `Failed to start tracking: ${error.message}`);
      }
    });

    /**
     * Driver sends real-time location update.
     * 1. Validates coordinates (not accuracy — browser GPS is 50-500m which is fine)
     * 2. Stores in-memory for instant get_all_locations responses
     * 3. Saves to MongoDB LocationHistory for persistence
     * 4. Broadcasts to ALL connected sockets
     */
    socket.on('driver:location_update', async (data) => {
      try {
        const { latitude, longitude, speed, heading, accuracy, mileage } = data;
        const driverId = normalizeId(data?.driverId || socket.userId);
        if (!driverId) {
          return;
        }

        // ── 0. Server-side rate limit ─────────────────────────────────────
        const nowMs    = Date.now();
        const lastSeen = lastUpdateTime.get(driverId) || 0;
        if (nowMs - lastSeen < RATE_LIMIT_MS) {
          // Accept at most 1 update per RATE_LIMIT_MS per driver (silent drop)
          return;
        }
        lastUpdateTime.set(driverId, nowMs);

        // ── 1. Validate coordinates (accuracy never filtered) ─────────────
        if (latitude == null || longitude == null ||
            isNaN(Number(latitude)) || isNaN(Number(longitude))) {
          console.warn('[BACKEND] ❌ Invalid coordinates — dropping update');
          return;
        }

        const lat = Number(latitude);
        const lng = Number(longitude);

        const locationPayload = {
          driverId,
          latitude:  lat,
          longitude: lng,
          speed:     Number(speed)    || 0,
          heading:   Number(heading)  || 0,
          accuracy:  Number(accuracy) || 0,
          timestamp: new Date().toISOString()
        };

        // ── 2. Store in-memory ───────────────────────────────────────────────
        activeLocations.set(driverId, { ...locationPayload, mileage: mileage || 0 });

        // ── 3. Smart MongoDB write ───────────────────────────────────────────
        // Only write if driver moved ≥25m OR ≥60s since last write.
        // Drastically reduces DB bills on stationary or slow-moving drivers.
        try {
          const saved = lastSavedPos.get(driverId);
          const distMoved   = saved ? haversineBack(saved.lat, saved.lng, lat, lng) : Infinity;
          const timeSinceSaved = saved ? nowMs - saved.ts : Infinity;
          const shouldWrite = distMoved >= DB_MIN_DISTANCE_M || timeSinceSaved >= DB_MAX_INTERVAL_MS;

          if (shouldWrite) {
            await LocationHistory.create({ driverId, latitude: lat, longitude: lng,
              speed: Number(speed) || 0, accuracy: Number(accuracy) || 0 });
            lastSavedPos.set(driverId, { lat, lng, ts: nowMs });
          }
        } catch (dbErr) {
          console.warn('[BACKEND]   ⚠️  MongoDB save failed (non-fatal):', dbErr.message);
        }

        // ── 4. Speed alert (dispatch room only) ─────────────────────────────
        if (speed && Number(speed) > 120) {
          io.to('dispatch').emit('vehicle:speed_alert', {
            driverId, speed, limit: 120,
            message: `Driver ${driverId} exceeding speed limit: ${speed} km/h`,
            timestamp: new Date()
          });
        }

        // ── 5. Broadcast to EVERY connected socket ───────────────────────────
        io.emit('driver:location_update', locationPayload);
        console.log(`⇒ location [${driverId.slice(-6)}] ±${Math.round(accuracy||0)}m  →  ${io.engine.clientsCount} clients`);

        // Also push to any vehicle-specific room listeners
        if (data?.vehicleId) {
          io.to(`vehicle:${normalizeId(data.vehicleId)}`).emit('driver:location_update', locationPayload);
        }
      } catch (error) {
        console.error('[BACKEND] ❌ Error in driver:location_update:', error.message, error.stack);
      }
    });

    /**
     * Dispatch requests driver's current location
     */
    socket.on('map:request_location', (data) => {
      try {
        const driverId = normalizeId(data?.driverId);
        if (!driverId) {
          return;
        }
        const location = activeLocations.get(driverId);

        if (location) {
          socket.emit('driver:location_update', location);
        } else {
          socket.emit('error', `Driver ${driverId} location not available`);
        }
      } catch (error) {
        console.error('❌ Error in map:request_location:', error.message);
      }
    });

    /**
     * Get all active driver locations — returns in-memory activeLocations map.
     * NOTE: activeLocations is populated ONLY by driver:location_update socket events.
     * It is reset on server restart. Drivers must re-emit after restart.
     */
    socket.on('map:get_all_locations', () => {
      try {
        const locations = Array.from(activeLocations.values());
        socket.emit('map:all_locations', locations);
      } catch (error) {
        console.error('Error in map:get_all_locations:', error.message);
      }
    });


    /**
     * Driver stops sharing location.
     * Cleans up:
     *  - in-memory maps (activeLocations, lastUpdateTime, lastSavedPos)
     *  - MongoDB LocationHistory for this driver (session data, not needed after stop)
     */
    socket.on('driver:stop_tracking', async (data) => {
      try {
        const driverId = normalizeId(data?.driverId || socket.userId);
        const vehicleId = normalizeId(data?.vehicleId);

        if (!driverId) {
          return;
        }

        // ── 1. Leave socket rooms ────────────────────────────────────────
        socket.leave(`driver:${driverId}`);
        if (vehicleId) socket.leave(`vehicle:${vehicleId}`);

        // ── 2. Wipe ALL in-memory state for this driver ───────────────────
        activeLocations.delete(driverId);
        lastUpdateTime.delete(driverId);  // reset rate limiter
        lastSavedPos.delete(driverId);    // reset smart-DB tracker
        locationService.removeLocation(driverId);

        // ── 3. Delete session location history from MongoDB ────────────────
        // Location history is ephemeral (session-only). Deleting on stop
        // keeps the collection lean and reduces atlas storage cost.
        try {
          const result = await LocationHistory.deleteMany({ driverId });
          console.log(`✓ session cleared [${driverId.slice(-6)}]  deleted ${result.deletedCount} history docs`);
        } catch (dbErr) {
          console.warn('[BACKEND] ⚠️  Failed to delete LocationHistory:', dbErr.message);
        }

        // ── 4. Broadcast stop to all clients so admin map removes marker ───
        io.emit('driver:stop_tracking', { driverId });

        io.to('dispatch').emit('notification:new', {
          type: 'tracking_stopped',
          message: `Driver ${driverId} stopped sharing location`,
          driverId,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('❌ Error in driver:stop_tracking:', error.message);
      }
    });

    // ==================== NOTIFICATION EVENTS ====================

    /**
     * Join user to notification room (dispatch/driver/etc)
     */
    socket.on('user:join_notifications', (data) => {
      try {
        const { role } = data;
        socket.join(`notifications:${role}`);
        socket.join(`notifications:${userId}`);
        console.log(`🔔 User ${userId} joined notification rooms`);
      } catch (error) {
        console.error('❌ Error in user:join_notifications:', error.message);
      }
    });

    /**
     * Send notification to specific user(s)
     * Format: { targetRole, targetUserId, type, title, message, relatedId }
     */
    socket.on('notification:send', (data) => {
      try {
        const { targetRole, targetUserId, type, title, message, relatedId } = data;
        
        const notification = {
          type,
          title,
          message,
          relatedId,
          timestamp: new Date().toISOString(),
          read: false
        };

        if (targetUserId) {
          // Send to specific user
          io.to(`notifications:${targetUserId}`).emit('notification:new', notification);
        } else if (targetRole) {
          // Send to all users with role
          io.to(`notifications:${targetRole}`).emit('notification:new', notification);
        }

        console.log(`📬 Notification sent: ${type}`);
      } catch (error) {
        console.error('❌ Error in notification:send:', error.message);
      }
    });

    // ==================== CHAT EVENTS ====================

    /**
     * Join user to chat room
     */
    socket.on('chat:join_conversation', (data) => {
      try {
        const { conversationId } = data;
        const roomName = `chat:${conversationId}`;
        
        console.log(`\n📍 CHAT:JOIN_CONVERSATION`);
        console.log(`🔗 Socket: ${socket.id}`);
        console.log(`👤 User: ${socket.userName} (${userId})`);
        console.log(`💬 Conversation: ${conversationId}`);
        console.log(`🚪 Room: ${roomName}`);
        
        socket.join(roomName);
        
        console.log(`✅ Joined room ${roomName}`);
        console.log(`📊 Rooms for socket:`, socket.rooms);
        console.log(`\n`);
      } catch (error) {
        console.error('❌ Error in chat:join_conversation:', error.message);
      }
    });

    /**
     * Create or resolve a conversation between two users
     * Deterministic room id: chat:direct-{sortedUserIdA}-{sortedUserIdB}
     * MUST MATCH the format used in messageRoutes.js: "direct-{id1}-{id2}"
     */
    socket.on('chat:start_conversation', (data) => {
      try {
        const { userId: otherUserId } = data;
        if (!otherUserId) {
          socket.emit('error', 'Invalid user to start conversation');
          return;
        }

        // Deterministic conversation id based on the two userIds
        // MUST MATCH API format: direct-{id1}-{id2}
        const sorted = [String(userId), String(otherUserId)].sort();
        const conversationId = `direct-${sorted[0]}-${sorted[1]}`;

        // Join both participants to room (this socket now; other will join on open)
        socket.join(`chat:${conversationId}`);
        socket.emit('chat:conversation_started', {
          conversationId,
          participants: sorted,
        });

        console.log(`💬 Conversation started: ${conversationId}`);
      } catch (error) {
        console.error('❌ Error in chat:start_conversation:', error.message);
      }
    });

    /**
     * Send chat message
     * Format: { conversationId, message }
     * Saves to DB and broadcasts to conversation room
     */
    socket.on('chat:send_message', async (data) => {
      try {
        const { conversationId, message } = data;

        console.log(`\n========== CHAT:SEND_MESSAGE ==========`);
        console.log(`📨 Socket ID: ${socket.id}`);
        console.log(`👤 User ID: ${userId}`);
        console.log(`👤 User Name: ${socket.userName}`);
        console.log(`💬 Conversation ID: ${conversationId}`);
        console.log(`📝 Message Length: ${message?.length}`);
        console.log(`📝 Message Content: "${message}"`);

        if (!conversationId || !message) {
          console.error('❌ Missing required fields:', { conversationId, message });
          socket.emit('error', 'Missing required fields: conversationId, message');
          return;
        }

        console.log(`🔍 Looking up conversation in database...`);
        // Get conversation to find recipient
        let conversation = await Conversation.findOne({ conversationId });
        
        if (!conversation) {
          console.log(`⚠️  Conversation not found in DB, creating...`);
          
          // Try to create conversation if it doesn't exist
          // Parse conversation ID to extract user IDs: direct-{id1}-{id2}
          const idParts = conversationId.split('-');
          console.log(`🔨 Parsing conversation ID: ${conversationId} into parts:`, idParts);
          
          if (idParts.length >= 3) {
            const [, id1, id2] = idParts;
            console.log(`✅ Extracted user IDs: ${id1}, ${id2}`);
            
            try {
              console.log(`🔍 Looking up User 1: ${id1}`);
              const user1 = await User.findById(id1).select('name email role');
              console.log(`🔍 Looking up User 2: ${id2}`);
              const user2 = await User.findById(id2).select('name email role');
              
              if (user1 && user2) {
                console.log(`✅ Found both users, creating conversation`);
                conversation = new Conversation({
                  conversationId,
                  type: 'direct',
                  participants: [
                    {
                      userId: id1,
                      userName: user1.name,
                      userRole: user1.role,
                    },
                    {
                      userId: id2,
                      userName: user2.name,
                      userRole: user2.role,
                    },
                  ],
                });
                await conversation.save();
                console.log(`✅ Conversation created successfully`);
              } else {
                console.error('❌ Could not find one or both users:', { user1: !!user1, user2: !!user2 });
                socket.emit('error', 'Invalid conversation participants');
                return;
              }
            } catch (createError) {
              console.error('❌ Failed to create conversation:', createError.message);
              socket.emit('error', 'Could not create or find conversation');
              return;
            }
          } else {
            console.error('❌ Invalid conversation ID format:', conversationId);
            socket.emit('error', 'Invalid conversation ID format');
            return;
          }
        } else {
          console.log(`✅ Conversation found in DB`);
        }

        // Find recipient (the other participant)
        const recipient = conversation.participants.find(p => String(p.userId) !== String(userId));
        const recipientId = recipient?.userId;

        if (!recipientId) {
          console.error('❌ Could not find recipient in conversation');
          socket.emit('error', 'Could not find message recipient');
          return;
        }

        console.log(`✅ Recipient found: ${recipientId}`);

        const chatMessage = {
          conversationId,
          senderId: userId,
          senderName: socket.userName,
          senderRole: userRole,
          recipientId,
          content: message,
          timestamp: new Date().toISOString(),
          read: false
        };

        // Save to database
        console.log(`💾 Saving message to MongoDB...`);
        try {
          const msgDoc = new Message({
            conversationId,
            senderId: userId,
            senderName: socket.userName,
            senderRole: userRole,
            recipientId,
            content: message,
          });
          const savedMsg = await msgDoc.save();
          console.log(`✅ Message saved to MongoDB with ID: ${savedMsg._id}`);
          console.log(`✅ Saved message:`, { _id: savedMsg._id, conversationId, senderId: userId });

          // Update conversation with last message
          const updateResult = await Conversation.findOneAndUpdate(
            { conversationId },
            {
              lastMessage: {
                content: message,
                senderId: userId,
                timestamp: new Date(),
              },
            },
            { new: true }
          );
          console.log(`✅ Conversation updated with last message`);

          chatMessage._id = savedMsg._id;
        } catch (dbError) {
          console.error('❌ Error saving message to DB:', dbError.message);
          console.error('❌ Full error:', dbError);
          socket.emit('error', `Failed to save message: ${dbError.message}`);
          return;
        }

        // Broadcast to conversation room
        const roomName = `chat:${conversationId}`;
        const socketsInRoom = io.sockets.adapter.rooms.get(roomName);
        const recipientCount = socketsInRoom ? socketsInRoom.size : 0;
        
        console.log(`📡 Broadcasting to room: ${roomName}`);
        console.log(`📡 Sockets in room: ${recipientCount}`);
        
        io.to(roomName).emit('chat:receive_message', {
          ...chatMessage,
          message: message,
        });

        console.log(`✅ Message broadcast complete`);
        console.log(`========== END CHAT:SEND_MESSAGE ==========\n`);
      } catch (error) {
        console.error('❌ Error in chat:send_message:', error.message);
        console.error('❌ Full error:', error);
        socket.emit('error', `Failed to send message: ${error.message}`);
      }
    });

    /**
     * Show typing indicator
     */
    socket.on('chat:typing', (data) => {
      try {
        const { conversationId } = data;
        io.to(`chat:${conversationId}`).emit('chat:user_typing', {
          userId,
          userName: socket.userName,
          conversationId
        });
      } catch (error) {
        console.error('❌ Error in chat:typing:', error.message);
      }
    });

    /**
     * Stop typing indicator
     */
    socket.on('chat:stop_typing', (data) => {
      try {
        const { conversationId } = data;
        io.to(`chat:${conversationId}`).emit('chat:user_stopped_typing', {
          userId,
          conversationId
        });
      } catch (error) {
        console.error('❌ Error in chat:stop_typing:', error.message);
      }
    });

    // ==================== ASSIGNMENT EVENTS ====================

    /**
     * Assignment created notification
     */
    socket.on('assignment:created', (data) => {
      try {
        const { assignmentId, driverId, vehicleId, route, estimatedTime } = data;

        io.to(`notifications:${driverId}`).emit('notification:new', {
          type: 'assignment_created',
          title: 'New Assignment',
          message: `You have been assigned to deliver: ${route}`,
          relatedId: assignmentId,
          assignmentId,
          vehicleId,
          estimatedTime,
          timestamp: new Date().toISOString(),
          read: false
        });

        console.log(`📋 Assignment ${assignmentId} created for driver ${driverId}`);
      } catch (error) {
        console.error('❌ Error in assignment:created:', error.message);
      }
    });

    /**
     * Assignment status update
     */
    socket.on('assignment:status_update', (data) => {
      try {
        const { assignmentId, driverId, status } = data;

        io.to(`notifications:${driverId}`).emit('notification:new', {
          type: 'assignment_status_changed',
          title: 'Assignment Status Updated',
          message: `Assignment status changed to: ${status}`,
          relatedId: assignmentId,
          status,
          timestamp: new Date().toISOString(),
          read: false
        });

        io.to('dispatch').emit('assignment:status_update', {
          assignmentId,
          driverId,
          status,
          timestamp: new Date().toISOString()
        });

        console.log(`📋 Assignment ${assignmentId} status updated to: ${status}`);
      } catch (error) {
        console.error('❌ Error in assignment:status_update:', error.message);
      }
    });

    // ==================== MAINTENANCE & ALERTS ====================

    /**
     * Vehicle maintenance alert
     */
    socket.on('vehicle:maintenance_alert', (data) => {
      try {
        const { vehicleId, maintenanceType, urgency } = data;

        io.to('dispatch').emit('notification:new', {
          type: 'maintenance_alert',
          title: 'Vehicle Maintenance Required',
          message: `Vehicle ${vehicleId} requires ${maintenanceType} maintenance`,
          relatedId: vehicleId,
          urgency,
          timestamp: new Date().toISOString(),
          read: false
        });

        console.log(`🔧 Maintenance alert for vehicle ${vehicleId}`);
      } catch (error) {
        console.error('❌ Error in vehicle:maintenance_alert:', error.message);
      }
    });

    /**
     * Fuel low alert
     */
    socket.on('vehicle:fuel_alert', (data) => {
      try {
        const { driverId, vehicleId, fuelLevel } = data;

        io.to(`notifications:${driverId}`).emit('notification:new', {
          type: 'fuel_alert',
          title: 'Low Fuel Warning',
          message: `Vehicle ${vehicleId} fuel level: ${fuelLevel}%`,
          relatedId: vehicleId,
          fuelLevel,
          timestamp: new Date().toISOString(),
          read: false
        });

        console.log(`⛽ Fuel alert for vehicle ${vehicleId}`);
      } catch (error) {
        console.error('❌ Error in vehicle:fuel_alert:', error.message);
      }
    });

    // ==================== ROLE-BASED ROOM JOINING ====================

    /**
     * User joins dispatch team room
     */
    socket.on('user:join_dispatch', () => {
      try {
        if (userRole === 'admin' || userRole === 'manager' || userRole === 'dispatcher') {
          socket.join('dispatch');
          console.log(`👥 Dispatch user ${userName} joined dispatch room`);
        } else {
          socket.emit('error', 'Unauthorized: Only dispatch staff can join');
        }
      } catch (error) {
        console.error('❌ Error in user:join_dispatch:', error.message);
      }
    });

    /**
     * User joins driver room
     */
    socket.on('user:join_drivers', () => {
      try {
        socket.join('drivers');
        console.log(`👥 User ${userName} joined drivers room`);
      } catch (error) {
        console.error('❌ Error in user:join_drivers:', error.message);
      }
    });

    // ==================== SYSTEM EVENTS ====================

    /**
     * Get active drivers count
     */
    socket.on('system:get_active_drivers', () => {
      try {
        socket.emit('system:active_drivers_count', activeLocations.size);
      } catch (error) {
        console.error('❌ Error in system:get_active_drivers:', error.message);
      }
    });

    /**
     * Disconnect handler
     */
    socket.on('disconnect', () => {
      try {
        // Remove from user sockets
        const userSocketSet = userSockets.get(userId);
        if (userSocketSet) {
          userSocketSet.delete(socket.id);
          if (userSocketSet.size === 0) {
            userSockets.delete(userId);
          }
        }

        // Remove from online users
        onlineUsers.delete(userId);

        console.log(`❌ User disconnected: ${userName} - Socket: ${socket.id}`);
        
        // Broadcast that user is now offline
        io.emit('user:offline', {
          userId,
          userName,
          onlineCount: onlineUsers.size,
        });

        console.log(`🔴 Online users: ${onlineUsers.size}`);
      } catch (error) {
        console.error('❌ Error in disconnect handler:', error.message);
      }
    });

    /**
     * Mark all messages in a conversation as read for the current user
     */
    socket.on('chat:mark_conversation_read', async (data) => {
      try {
        const { conversationId } = data;
        
        if (!conversationId) {
          console.error('❌ Missing conversationId in mark_conversation_read');
          return;
        }

        console.log(`📖 Marking conversation as read: ${conversationId} for user ${userId}`);

        // Update all unread messages in this conversation for the current user
        await Message.updateMany(
          {
            conversationId,
            senderId: { $ne: userId }, // Messages not from current user
            read: false,
          },
          {
            read: true,
          }
        );

        // Update the conversation's unreadCounts to remove this user's count
        await Conversation.findOneAndUpdate(
          { conversationId },
          {
            $unset: { [`unreadCounts.${userId}`]: 1 },
          }
        );

        console.log(`✅ Marked conversation ${conversationId} as read for user ${userId}`);

        // Emit event to update other sockets in the room
        const roomName = `chat:${conversationId}`;
        io.to(roomName).emit('chat:conversation_read', {
          conversationId,
          userId,
        });
      } catch (error) {
        console.error('❌ Error in chat:mark_conversation_read:', error.message);
      }
    });

    /**
     * Error handler
     */
    socket.on('error', (error) => {
      console.error(`❌ Socket error for ${userName}:`, error);
    });
  });

  console.log('✅ Socket.io service initialized with all event handlers');
};

module.exports = socketService;
