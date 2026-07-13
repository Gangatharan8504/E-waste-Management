const mongoose = require('mongoose');

const seedAdmin = async () => {
  try {
    const User = require('../models/User');
    const adminExists = await User.findOne({ email: 'admin@ewaste.com' });
    if (!adminExists) {
      const admin = new User({
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
    }
  } catch (err) {
    console.error('Error seeding default Admin User:', err.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ewaste_db');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedAdmin();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
