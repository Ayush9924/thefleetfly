/**
 * Socket.io Event Handlers & Services
 * Manages all real-time communication for the fleet app
 */

// In-memory location storage (for development)
const activeLocations = new Map(); // driverId -> { latitude, longitude, speed, heading, timestamp }
const userSockets = new Map(); // userId -> Set of socket ids

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
        socket.join(`chat:${conversationId}`);
        console.log(`💬 User ${userId} joined chat: ${conversationId}`);
      } catch (error) {
        console.error('❌ Error in chat:join_conversation:', error.message);
      }
    });

    /**
     * Send chat message
     * Format: { conversationId, message, senderRole }
     */
    socket.on('chat:send_message', (data) => {
      try {
        const { conversationId, message, senderRole } = data;

        const chatMessage = {
          conversationId,
          senderId: userId,
          senderName: socket.userName,
          senderRole: senderRole || userRole,
          message,
          timestamp: new Date().toISOString(),
          read: false
        };

        // Broadcast to conversation room
        io.to(`chat:${conversationId}`).emit('chat:receive_message', chatMessage);
        console.log(`💬 Message sent in conversation: ${conversationId}`);
      } catch (error) {
        console.error('❌ Error in chat:send_message:', error.message);
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

        console.log(`❌ User disconnected: ${userName} - Socket: ${socket.id}`);
      } catch (error) {
        console.error('❌ Error in disconnect handler:', error.message);
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
