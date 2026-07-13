require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const chatRoutes = require('./routes/chat');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve file uploads statically
// Expose both /uploads and /api/files to match frontend getFileUrl endpoints
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));
app.use('/api/files', express.static(uploadsDir));

// Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);

// Base route health check
app.get('/api/health', (req, res) => {
  return res.status(200).json({ status: 'OK', service: 'Smart E-Waste MERN API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  return res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
