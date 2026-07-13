const mongoose = require('mongoose');

const OtpStoreSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  otp: { type: String, required: true },
  purpose: { type: String, default: 'REGISTRATION' },
  createdAt: { type: Date, default: Date.now, expires: 300 } // 5 minutes TTL
});

module.exports = mongoose.model('OtpStore', OtpStoreSchema);
