const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'EwasteRequest' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
