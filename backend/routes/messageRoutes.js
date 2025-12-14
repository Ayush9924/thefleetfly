const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

/**
 * POST /api/messages/conversations/start
 * Start a new direct conversation with another user
 */
router.post('/conversations/start', protect, async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const currentUserId = req.user.id;

    if (!otherUserId) {
      return res.status(400).json({ error: 'otherUserId is required' });
    }

    // Get both users
    const [currentUser, otherUser] = await Promise.all([
      User.findById(currentUserId).select('name email role'),
      User.findById(otherUserId).select('name email role'),
    ]);

    if (!otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create unique conversation ID
    const ids = [currentUserId, otherUserId].sort();
    const conversationId = `direct-${ids[0]}-${ids[1]}`;

    // Find or create conversation
    let conversation = await Conversation.findOne({ conversationId });

    if (!conversation) {
      conversation = new Conversation({
        conversationId,
        type: 'direct',
        participants: [
          {
            userId: currentUserId,
            userName: currentUser.name,
            userRole: currentUser.role,
          },
          {
            userId: otherUserId,
            userName: otherUser.name,
            userRole: otherUser.role,
          },
        ],
      });
      await conversation.save();
    }

    // Populate before returning
    await conversation.populate('participants.userId', 'name email role');

    res.json(conversation);
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ error: 'Failed to start conversation' });
  }
});

/**
 * GET /api/messages/conversations
 * Get all conversations for the current user
 */
router.get('/conversations', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      'participants.userId': userId,
      archived: false,
    })
      .populate('participants.userId', 'name email role')
      .sort({ 'lastMessage.timestamp': -1 })
      .limit(50);

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

/**
 * GET /api/messages/:conversationId
 * Get messages for a specific conversation
 */
router.get('/:conversationId', protect, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      conversationId,
      'participants.userId': userId,
    });

    if (!conversation) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const messages = await Message.find({
      conversationId,
      deleted: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('senderId senderName senderRole content read readAt createdAt attachments timestamp');

    // Mark messages as read if recipient
    await Message.updateMany(
      {
        conversationId,
        recipientId: userId,
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      }
    );

    // Format messages with 'self' indicator for current user
    const formattedMessages = messages.reverse().map((msg) => ({
      _id: msg._id,
      senderId: msg.senderId,
      sender: msg.senderId.toString() === userId.toString() ? 'self' : 'other',
      senderName: msg.senderName,
      senderRole: msg.senderRole,
      content: msg.content,
      read: msg.read,
      readAt: msg.readAt,
      timestamp: msg.timestamp || msg.createdAt,
      attachments: msg.attachments,
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

/**
 * POST /api/messages
 * Send a new message
 */
router.post('/', protect, async (req, res) => {
  try {
    const { conversationId, recipientId, content, attachments } = req.body;
    const senderId = req.user.id;

    if (!conversationId || !recipientId || !content.trim()) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify sender is part of conversation
    const conversation = await Conversation.findOne({
      conversationId,
      'participants.userId': senderId,
    });

    if (!conversation) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Create message
    const message = new Message({
      conversationId,
      senderId,
      senderName: req.user.name,
      senderRole: req.user.role,
      recipientId,
      content: content.trim(),
      attachments: attachments || [],
    });

    await message.save();

    // Update conversation's last message
    await Conversation.updateOne(
      { conversationId },
      {
        lastMessage: {
          content: content.substring(0, 100),
          senderId,
          timestamp: new Date(),
        },
      }
    );

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * PUT /api/messages/:messageId/read
 * Mark message as read
 */
router.put('/:messageId/read', protect, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findByIdAndUpdate(
      messageId,
      {
        read: true,
        readAt: new Date(),
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

/**
 * DELETE /api/messages/:messageId
 * Delete a message (soft delete)
 */
router.delete('/:messageId', protect, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only sender can delete
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Soft delete
    message.deleted = true;
    message.deletedAt = new Date();
    await message.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

/**
 * POST /api/messages/conversations/start
 * Start or get a direct message conversation
 */
router.post('/conversations/start', protect, async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const userId = req.user.id;

    if (!otherUserId) {
      return res.status(400).json({ error: 'Missing otherUserId' });
    }

    // Get other user info
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create deterministic conversation ID
    const sorted = [userId.toString(), otherUserId.toString()].sort();
    const conversationId = `${sorted[0]}_${sorted[1]}`;

    // Find or create conversation
    let conversation = await Conversation.findOne({ conversationId });

    if (!conversation) {
      conversation = new Conversation({
        conversationId,
        participants: [
          {
            userId,
            userName: req.user.name,
            userRole: req.user.role,
          },
          {
            userId: otherUserId,
            userName: otherUser.name,
            userRole: otherUser.role,
          },
        ],
        type: 'direct',
      });

      await conversation.save();
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ error: 'Failed to start conversation' });
  }
});

module.exports = router;
