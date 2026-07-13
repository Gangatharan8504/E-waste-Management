const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

/**
 * GET /
 * Fetches all notifications for logged in user.
 */
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Fetch Notifications Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * PUT /mark-all-read
 * Marks all notifications as read.
 */
router.put('/mark-all-read', protect, async (req, res) => {
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
    return res.status(200).json(notification);
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
