const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true, // Unique conversation identifier
      index: true,
    },
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        userName: String,
        userRole: String,
        avatar: String,
      },
    ],
    type: {
      type: String,
      enum: ['direct', 'group'],
      default: 'direct',
    },
    name: {
      type: String, // For group chats
      default: null,
    },
    lastMessage: {
      content: String,
      senderId: mongoose.Schema.Types.ObjectId,
      timestamp: Date,
    },
    unreadCounts: {
      type: Map,
      of: Number, // userId -> unread count
      default: new Map(),
    },
    archived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'conversations',
  }
);

// Index for finding conversations by participants
conversationSchema.index({ 'participants.userId': 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
