const mongoose = require('mongoose');

const ChatHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  sender: { type: String, enum: ['USER', 'BOT'], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);
