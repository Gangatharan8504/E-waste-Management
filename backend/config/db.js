const mongoose = require('mongoose');

const seedAdmin = async () => {
  try {
    const User = require('../models/User');
    let admin = await User.findOne({ email: 'admin@ewaste.com' });
    if (!admin) {
      admin = new User({
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin@ewaste.com',
        password: 'AdminPassword123',
        phone: '9999999999',
        address: 'EcoCollect Central Office',
        pincode: '600001',
        role: 'ADMIN',
        enabled: true,
        emailVerified: true
      });
      await admin.save();
      console.log('Seeded default Admin User: admin@ewaste.com / AdminPassword123');
    } else {
      admin.enabled = true;
      admin.emailVerified = true;
      admin.role = 'ADMIN';
      admin.password = 'AdminPassword123';
      await admin.save();
      console.log('Synchronized default Admin User status & password reset.');
    }
  } catch (err) {
    console.error('Error seeding default Admin User:', err.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://carrier-pilot:admin123@cluster0.kkdvuh4.mongodb.net/ewaste_db');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedAdmin();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
