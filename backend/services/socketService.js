/**
 * Socket.io Event Handlers & Services
 * Manages all real-time communication for the fleet app
 */

// In-memory location storage (for development)
const activeLocations = new Map(); // driverId -> { latitude, longitude, speed, heading, timestamp }
const userSockets = new Map(); // userId -> Set of socket ids
const onlineUsers = new Map(); // userId -> { socketId, userName, userRole, connectedAt }

// Import models for persistence
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

/**
 * Initialize all Socket.io event handlers
 * @param {Server} io - Socket.io server instance
 */
const socketService = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.userId;
    const userRole = socket.userRole;
    const userName = socket.userName;

    console.log(`✅ User connected: ${userName} (${userRole}) - Socket: ${socket.id}`);

    // Track user sockets
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
        const { driverId, vehicleId } = data;
        
        if (!driverId) {
          socket.emit('error', 'Invalid driver ID');
          return;
        }

        // Join driver to a room for location tracking
        socket.join(`driver:${driverId}`);
        socket.join(`vehicle:${vehicleId}`);
        
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
     * Driver sends real-time location update
     * Emitted every 10 seconds with: latitude, longitude, speed, heading, accuracy
     */
    socket.on('driver:location_update', (data) => {
      try {
        const { driverId, latitude, longitude, speed, heading, accuracy, mileage } = data;

        // Validate coordinates
        if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
          console.warn('⚠️  Invalid GPS coordinates:', data);
          return;
        }

        // Filter out low accuracy readings (> 50 meters)
        if (accuracy && accuracy > 50) {
          console.warn('⚠️  Low accuracy GPS reading, filtering out');
          return;
        }

        // Store in-memory for quick access
        activeLocations.set(driverId, {
          driverId,
          latitude,
          longitude,
          speed: speed || 0,
          heading: heading || 0,
          accuracy: accuracy || 0,
          mileage: mileage || 0,
          timestamp: new Date().toISOString()
        });

        // Check for speed alert (120 km/h threshold)
        if (speed && speed > 120) {
          io.to('dispatch').emit('vehicle:speed_alert', {
            driverId,
            speed,
            limit: 120,
            message: `Driver ${driverId} exceeding speed limit: ${speed} km/h`,
            timestamp: new Date()
          });
        }

        // Broadcast location to dispatch team and map viewers
        io.to('dispatch').emit('driver:location_update', {
          driverId,
          latitude,
          longitude,
          speed,
          heading,
          timestamp: new Date().toISOString()
        });

        // Also broadcast to vehicle-specific room
        io.to(`vehicle:${data.vehicleId}`).emit('driver:location_update', {
          driverId,
          latitude,
          longitude,
          speed,
          heading,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ Error in driver:location_update:', error.message);
      }
    });

    /**
     * Dispatch requests driver's current location
     */
    socket.on('map:request_location', (data) => {
      try {
        const { driverId } = data;
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
     * Get all active driver locations
     */
    socket.on('map:get_all_locations', () => {
      try {
        const locations = Array.from(activeLocations.values());
        socket.emit('map:all_locations', locations);
      } catch (error) {
        console.error('❌ Error in map:get_all_locations:', error.message);
      }
    });

    /**
     * Driver stops sharing location
     */
    socket.on('driver:stop_tracking', (data) => {
      try {
        const { driverId, vehicleId } = data;
        socket.leave(`driver:${driverId}`);
        socket.leave(`vehicle:${vehicleId}`);
        activeLocations.delete(driverId);

        console.log(`⏹️  Driver ${driverId} stopped location tracking`);

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
        socket.join(roomName);
        console.log(`✅ User ${userId} (${socket.userName}) joined room: ${roomName}`, { socketId: socket.id });
      } catch (error) {
        console.error('❌ Error in chat:join_conversation:', error.message);
      }
    });

    /**
     * Create or resolve a conversation between two users
     * Deterministic room id: chat:{sortedUserIdA_userIdB}
     */
    socket.on('chat:start_conversation', (data) => {
      try {
        const { userId: otherUserId } = data;
        if (!otherUserId) {
          socket.emit('error', 'Invalid user to start conversation');
          return;
        }

        // Deterministic conversation id based on the two userIds
        const sorted = [String(userId), String(otherUserId)].sort();
        const conversationId = `${sorted[0]}_${sorted[1]}`;

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

        console.log(`🔔 chat:send_message received:`, { conversationId, messageLength: message?.length, userId, socketId: socket.id });

        if (!conversationId || !message) {
          console.error('❌ Missing fields:', { conversationId, message });
          socket.emit('error', 'Missing required fields: conversationId, message');
          return;
        }

        // Get conversation to find recipient
        const conversation = await Conversation.findOne({ conversationId });
        if (!conversation) {
          console.error('❌ Conversation not found:', conversationId);
          socket.emit('error', 'Conversation not found');
          return;
        }

        // Find recipient (the other participant)
        const recipient = conversation.participants.find(p => String(p.userId) !== String(userId));
        const recipientId = recipient?.userId;

        console.log(`✉️  Message details:`, { senderId: userId, senderName: socket.userName, recipientId });

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
        try {
          const msgDoc = new Message({
            conversationId,
            senderId: userId,
            senderName: socket.userName,
            senderRole: userRole,
            recipientId,
            content: message,
          });
          await msgDoc.save();

          // Update conversation with last message
          await Conversation.findOneAndUpdate(
            { conversationId },
            {
              lastMessage: {
                content: message,
                senderId: userId,
                timestamp: new Date(),
              },
            }
          );

          chatMessage._id = msgDoc._id;
          console.log(`✅ Message saved to DB:`, { messageId: msgDoc._id, conversationId });
        } catch (dbError) {
          console.warn('⚠️  Message not saved to DB:', dbError.message);
          // Continue anyway - message still broadcasts real-time
        }

        // Broadcast to conversation room
        const roomName = `chat:${conversationId}`;
        const socketsInRoom = io.sockets.adapter.rooms.get(roomName);
        const recipientCount = socketsInRoom ? socketsInRoom.size : 0;
        
        console.log(`📤 Broadcasting to room: ${roomName} (${recipientCount} recipient(s))`);
        
        io.to(roomName).emit('chat:receive_message', {
          ...chatMessage,
          message: message, // Keep both for compatibility
        });

        console.log(`💬 Message broadcast complete for conversation: ${conversationId}`);
      } catch (error) {
        console.error('❌ Error in chat:send_message:', error.message, error);
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
