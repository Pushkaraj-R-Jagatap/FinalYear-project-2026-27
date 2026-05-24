const mongoose = require('mongoose');

const ChatHistorySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

ChatHistorySchema.index({ userId: 1 });
ChatHistorySchema.index({ updatedAt: -1 });

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);
