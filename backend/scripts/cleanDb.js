const mongoose = require('mongoose');
const User = require('../models/User');
const EwasteRequest = require('../models/EwasteRequest');
const Notification = require('../models/Notification');
const OtpStore = require('../models/OtpStore');
const ChatHistory = require('../models/ChatHistory');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://carrier-pilot:admin123@cluster0.kkdvuh4.mongodb.net/ewaste_db?retryWrites=true&w=majority';

async function clean() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    console.log('Wiping all collection requests...');
    await EwasteRequest.deleteMany({});

    console.log('Wiping all notification records...');
    await Notification.deleteMany({});

    console.log('Wiping all verification OTP logs...');
    await OtpStore.deleteMany({});

    console.log('Wiping all AI bot chat history entries...');
    await ChatHistory.deleteMany({});

    console.log('Wiping all custom users (except Admin)...');
    await User.deleteMany({ role: { $ne: 'ADMIN' } });

    // Seed/Restore fresh admin
    const adminExists = await User.findOne({ email: 'admin@ewaste.com' });
    if (!adminExists) {
      console.log('Seeding fresh Admin account...');
      const admin = new User({
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin@ewaste.com',
        password: 'AdminPassword123',
        role: 'ADMIN',
        enabled: true,
        emailVerified: true
      });
      await admin.save();
      console.log('Admin seeded successfully!');
    } else {
      adminExists.enabled = true;
      adminExists.emailVerified = true;
      adminExists.password = 'AdminPassword123';
      await adminExists.save();
      console.log('Admin credentials synchronized!');
    }

    console.log('Database cleanup executed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup encountered an error:', err.message);
    process.exit(1);
  }
}

clean();
