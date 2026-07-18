require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const EwasteRequest = require('../models/EwasteRequest');
const Notification = require('../models/Notification');
const OtpStore = require('../models/OtpStore');

const dbURI = process.env.MONGO_URI || 'mongodb+srv://carrier-pilot:admin123@cluster0.kkdvuh4.mongodb.net/ewaste_db';

const resetDB = async () => {
  try {
    console.log('Connecting to database:', dbURI);
    await mongoose.connect(dbURI);
    console.log('Connected to MongoDB successfully.');

    // 1. Wipe collections
    console.log('Wiping collections...');
    await User.deleteMany({});
    await EwasteRequest.deleteMany({});
    await Notification.deleteMany({});
    await OtpStore.deleteMany({});
    console.log('Collections wiped clean.');

    // 2. Seed Admin User
    console.log('Seeding default Admin user...');
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'System',
      email: 'admin@ewaste.com',
      password: 'AdminPassword123',
      phone: '9999999999',
      address: 'EcoSync Main Recycling Hub, Coimbatore',
      pincode: '641018',
      role: 'ADMIN',
      enabled: true,
      emailVerified: true
    });

    await adminUser.save();
    console.log('Admin user seeded successfully:', adminUser.email);

    console.log('Database reset completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Database reset failed:', error.message);
    process.exit(1);
  }
};

resetDB();
