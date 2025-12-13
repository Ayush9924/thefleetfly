const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true, // Index for fast lookups
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['admin', 'manager', 'driver', 'dispatcher'],
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    attachments: [
      {
        url: String,
        type: String, // 'image', 'file', etc.
        name: String,
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: 'messages',
  }
);

// Index for fast queries by conversation
messageSchema.index({ conversationId: 1, createdAt: -1 });
// Index for unread messages
messageSchema.index({ recipientId: 1, read: 1 });

module.exports = mongoose.model('Message', messageSchema);
