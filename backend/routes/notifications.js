const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

/**
 * GET /
 * Fetches all notifications for logged in user mapped to frontend properties.
 */
router.get('/', protect, async (req, res) => {
  try {
    const rawNotifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    const formatted = rawNotifications.map(n => ({
      id: n._id,
      title: n.title,
      description: n.message,
      isRead: n.read,
      createdAt: n.createdAt,
      requestId: n.requestId
    }));
    return res.status(200).json(formatted);
  } catch (error) {
    console.error('Fetch Notifications Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * GET /unread-count
 * Returns unread notifications count integer.
 */
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ user: req.user._id, read: false });
    return res.status(200).json(count);
  } catch (error) {
    console.error('Get Unread Count Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * PUT /read-all
 * Marks all notifications as read.
 */
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id }, { read: true });
    return res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark All Read Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * PUT /:id/read
 * Marks specific notification as read.
 */
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();
    return res.status(200).json({
      id: notification._id,
      title: notification.title,
      description: notification.message,
      isRead: notification.read,
      createdAt: notification.createdAt,
      requestId: notification.requestId
    });
  } catch (error) {
    console.error('Mark Read Single Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * DELETE /:id
 * Deletes notification.
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const result = await Notification.deleteOne({ _id: req.params.id, user: req.user._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    return res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete Notification Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
